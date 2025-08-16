import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateScores, getPersonalityLabel, generateDescription } from '@/lib/scoring'
import { calculateCLP2Scores, getCLP2PersonalityLabel, getCLP2StrengthsAndGrowth, type CLP2Scores } from '@/lib/clp-scoring'
import { getQuizDefinition, calculateQuizContribution, type QuizType, type RespondentType } from '@/lib/quiz-definitions'

/**
 * Progressive Profile API
 * Handles multiple quiz contributions to a single child profile
 * Supports parent and teacher assessments for the same child
 */

interface ProgressiveProfileRequest {
  // Child information
  child_name: string
  age_group?: string
  grade?: string
  precise_age_months?: number
  birth_date?: string
  
  // Quiz context
  quiz_type: QuizType
  respondent_type: RespondentType
  respondent_id?: string // Teacher or parent ID
  respondent_name?: string
  
  // Assessment data
  responses: Record<number, number | string | string[]>
  
  // CLP 2.0 options
  use_clp2_scoring?: boolean
  
  // Profile linking (for existing profiles)
  existing_profile_id?: string
  assignment_token?: string // For teacher invitations
  
  // Context metadata
  school_context?: {
    school_name?: string
    teacher_name?: string
    classroom?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      child_name,
      age_group = '5+',
      grade,
      precise_age_months,
      birth_date,
      quiz_type,
      respondent_type,
      respondent_id,
      respondent_name,
      responses,
      use_clp2_scoring = true, // Default to CLP 2.0
      existing_profile_id,
      assignment_token,
      school_context
    }: ProgressiveProfileRequest = await request.json()

    // Validation
    if (!child_name || !quiz_type || !respondent_type || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields: child_name, quiz_type, respondent_type, responses' },
        { status: 400 }
      )
    }

    // Get quiz definition for this assessment type
    const quizDefinition = getQuizDefinition(quiz_type)
    if (!quizDefinition) {
      return NextResponse.json(
        { error: `Invalid quiz type: ${quiz_type}` },
        { status: 400 }
      )
    }

    // Calculate scores using appropriate scoring system
    let scores: Record<string, number> | CLP2Scores
    let personality_label: string
    let description: string
    let strengths: string[] = []
    let growthAreas: string[] = []
    
    if (use_clp2_scoring) {
      // CLP 2.0 Scoring System
      scores = calculateCLP2Scores(
        responses, 
        quiz_type as 'parent_home' | 'teacher_classroom' | 'general',
        age_group as '3-4' | '4-5' | '5+'
      )
      personality_label = getCLP2PersonalityLabel(scores)
      const strengthsAndGrowth = getCLP2StrengthsAndGrowth(scores)
      strengths = strengthsAndGrowth.strengths
      growthAreas = strengthsAndGrowth.growthAreas
      description = `This child demonstrates strong ${strengths[0] || 'learning'} skills with opportunities to grow in ${growthAreas[0] || 'various areas'}.`
    } else {
      // Legacy scoring system
      scores = calculateScores(responses, age_group)
      personality_label = getPersonalityLabel(scores)
      description = generateDescription(scores)
    }
    
    // Calculate contribution metrics
    const contribution = calculateQuizContribution(quiz_type, responses)

    let consolidatedProfile
    let assessmentResult

    if (!supabase) {
      // Fallback mode for local development
      const mockProfile = {
        id: Math.random().toString(36).substring(2, 15),
        child_name,
        age_group,
        scores,
        personality_label,
        quiz_type,
        respondent_type,
        raw_responses: responses,
        confidence_percentage: contribution.confidence_boost,
        completeness_percentage: 50,
        created_at: new Date().toISOString()
      }
      
      return NextResponse.json({
        profile: mockProfile,
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/results/${mockProfile.id}`,
        is_new_profile: true,
        contribution_summary: contribution
      })
    }

    // Use CLP 2.0 RPC function if available, fallback to legacy
    const rpcFunction = use_clp2_scoring ? 'handle_clp_progressive_profile' : 'handle_progressive_profile'
    
    const { data, error } = await supabase.rpc(rpcFunction, {
      p_child_name: child_name,
      p_age_group: age_group,
      p_precise_age_months: precise_age_months,
      p_birth_date: birth_date,
      p_grade: grade,
      p_quiz_type: quiz_type,
      p_respondent_type: respondent_type,
      p_respondent_id: respondent_id,
      p_respondent_name: respondent_name,
      p_responses: responses,
      p_scores: scores,
      p_personality_label: personality_label,
      p_existing_profile_id: existing_profile_id,
      p_contribution_weight: contribution.weight,
      p_confidence_boost: contribution.confidence_boost,
      p_school_context: school_context
    })

    if (error) {
      console.error('Error in progressive profile creation:', error)
      
      // Fallback to individual operations if RPC fails
      return await handleProgressiveProfileFallback({
        child_name,
        age_group,
        grade,
        quiz_type,
        respondent_type,
        respondent_id,
        responses,
        scores,
        personality_label,
        assignment_token,
        contribution
      })
    }

    // If teacher assignment, update assignment status
    if (assignment_token && respondent_type === 'teacher') {
      try {
        await supabase
          .from('profile_assignments')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            profile_id: data.profile_id
          })
          .eq('assignment_token', assignment_token)
      } catch (assignmentError) {
        console.error('Error updating assignment status:', assignmentError)
      }
    }

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/results/${data.profile_id}?context=${respondent_type}`

    return NextResponse.json({
      profile: {
        id: data.profile_id,
        child_name,
        consolidated_scores: data.consolidated_scores,
        personality_label: data.personality_label,
        confidence_percentage: data.confidence_percentage,
        age_group: data.age_group || age_group,
        precise_age_months: data.precise_age_months || precise_age_months,
        strengths,
        growth_areas: growthAreas,
        scoring_version: use_clp2_scoring ? 'CLP 2.0' : 'Legacy',
        completeness_percentage: data.completeness_percentage,
        total_assessments: data.total_assessments,
        parent_assessments: data.parent_assessments,
        teacher_assessments: data.teacher_assessments,
        quiz_type,
        respondent_type
      },
      shareUrl,
      is_new_profile: data.is_new_profile,
      previous_assessments: data.previous_assessments,
      contribution_summary: {
        ...contribution,
        new_confidence: data.confidence_percentage,
        new_completeness: data.completeness_percentage
      }
    })

  } catch (error) {
    console.error('Error in progressive profile API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fallback handler for when RPC is not available
async function handleProgressiveProfileFallback(params: {
  child_name: string
  age_group: string
  grade?: string
  quiz_type: QuizType
  respondent_type: RespondentType
  respondent_id?: string
  responses: Record<number, any>
  scores: Record<string, number>
  personality_label: string
  assignment_token?: string
  contribution: { weight: number; confidence_boost: number; categories_covered: string[] }
}) {
  const {
    child_name,
    age_group,
    grade,
    quiz_type,
    respondent_type,
    respondent_id,
    responses,
    scores,
    personality_label,
    contribution
  } = params

  try {
    // 1. Create individual assessment result
    const { data: assessmentResult, error: assessmentError } = await supabase!
      .from('assessment_results')
      .insert({
        child_name,
        age: 0, // Legacy field
        age_group,
        grade_level: grade,
        scores,
        personality_label,
        raw_responses: responses,
        quiz_type,
        respondent_type,
        respondent_id,
        email: '', // Not required for progressive profiles
        birth_month: 1,
        birth_year: new Date().getFullYear()
      })
      .select()
      .single()

    if (assessmentError) throw assessmentError

    // 2. Find or create consolidated profile
    const { data: existingProfile } = await supabase!
      .from('consolidated_profiles')
      .select('*')
      .eq('child_name', child_name)
      .single()

    let consolidatedProfileId: string
    let isNewProfile = false

    if (existingProfile) {
      consolidatedProfileId = existingProfile.id
    } else {
      // Create new consolidated profile
      const { data: newProfile, error: profileError } = await supabase!
        .from('consolidated_profiles')
        .insert({
          child_name,
          age_group,
          grade_level: grade,
          consolidated_scores: scores,
          personality_label,
          confidence_percentage: contribution.confidence_boost,
          completeness_percentage: 33, // Starting percentage
          total_assessments: 1,
          parent_assessments: respondent_type === 'parent' ? 1 : 0,
          teacher_assessments: respondent_type === 'teacher' ? 1 : 0,
          sharing_token: Math.random().toString(36).substring(2, 15)
        })
        .select()
        .single()

      if (profileError) throw profileError
      
      consolidatedProfileId = newProfile.id
      isNewProfile = true
    }

    // 3. Record data source contribution
    await supabase!
      .from('profile_data_sources')
      .insert({
        profile_id: consolidatedProfileId,
        quiz_type,
        respondent_type,
        respondent_id,
        assessment_result_id: assessmentResult.id,
        data_weight: contribution.weight,
        confidence_contribution: contribution.confidence_boost
      })

    // 4. Update consolidated scores if not new profile
    if (!isNewProfile) {
      const { data: updatedScores } = await supabase!
        .rpc('calculate_consolidated_scores', { profile_id: consolidatedProfileId })

      await supabase!
        .from('consolidated_profiles')
        .update({
          consolidated_scores: updatedScores,
          updated_at: new Date().toISOString(),
          total_assessments: existingProfile.total_assessments + 1,
          parent_assessments: respondent_type === 'parent' 
            ? existingProfile.parent_assessments + 1 
            : existingProfile.parent_assessments,
          teacher_assessments: respondent_type === 'teacher'
            ? existingProfile.teacher_assessments + 1
            : existingProfile.teacher_assessments,
          confidence_percentage: Math.min(100, existingProfile.confidence_percentage + contribution.confidence_boost),
          completeness_percentage: Math.min(100, existingProfile.completeness_percentage + 25)
        })
        .eq('id', consolidatedProfileId)
    }

    return NextResponse.json({
      profile: {
        id: consolidatedProfileId,
        child_name,
        consolidated_scores: scores, // Will be properly calculated in next request
        personality_label,
        confidence_percentage: contribution.confidence_boost,
        completeness_percentage: isNewProfile ? 33 : 58, // Estimated
        quiz_type,
        respondent_type
      },
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/results/${consolidatedProfileId}`,
      is_new_profile: isNewProfile,
      contribution_summary: contribution
    })

  } catch (error) {
    console.error('Error in fallback handler:', error)
    throw error
  }
}

// GET endpoint for retrieving consolidated profiles
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const profileId = searchParams.get('profileId')
  const childName = searchParams.get('childName')
  const context = searchParams.get('context') // 'parent' or 'teacher'

  if (!profileId && !childName) {
    return NextResponse.json(
      { error: 'Profile ID or child name required' },
      { status: 400 }
    )
  }

  if (!supabase) {
    return NextResponse.json({ profile: null })
  }

  try {
    let query = supabase
      .from('profile_with_context')
      .select('*')

    if (profileId) {
      query = query.eq('id', profileId)
    } else {
      query = query.eq('child_name', childName)
    }

    const { data: profile, error } = await query.single()

    if (error && error.code !== 'PGRST116') { // Not found error code
      console.error('Error fetching progressive profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Customize response based on context
    const contextualizedProfile = {
      ...profile,
      view_context: context,
      recommendations: context === 'parent' 
        ? profile.home_recommendations 
        : profile.classroom_recommendations
    }

    return NextResponse.json({ profile: contextualizedProfile })
  } catch (error) {
    console.error('Error in progressive profile GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}