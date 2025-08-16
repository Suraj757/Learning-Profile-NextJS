import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateCLP2Scores, getCLP2PersonalityLabel, getCLP2StrengthsAndGrowth, consolidateCLP2Scores, type CLP2Scores } from '@/lib/clp-scoring'
import { getParentQuizQuestions, getTeacherQuizQuestions, validateQuizConfiguration } from '@/lib/multi-quiz-system'

/**
 * CLP 2.0 Profile Consolidation API
 * Handles multiple quiz sources and creates consolidated learning profiles
 */

interface CLP2ConsolidationRequest {
  profile_id?: string // Existing profile to update
  child_name: string
  age_group: '3-4' | '4-5' | '5+' | '6+'
  precise_age_months?: number
  birth_date?: string
  
  // New assessment data
  quiz_type: 'parent_home' | 'teacher_classroom' | 'general'
  respondent_type: 'parent' | 'teacher' | 'self'
  respondent_id?: string
  respondent_name?: string
  responses: Record<number, number | string | string[]>
  
  // Context metadata
  assessment_context?: {
    school_name?: string
    teacher_name?: string
    parent_name?: string
    completion_location?: string
    notes?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      profile_id,
      child_name,
      age_group,
      precise_age_months,
      birth_date,
      quiz_type,
      respondent_type,
      respondent_id,
      respondent_name,
      responses,
      assessment_context
    }: CLP2ConsolidationRequest = await request.json()

    // Validation
    if (!child_name || !quiz_type || !respondent_type || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields: child_name, quiz_type, respondent_type, responses' },
        { status: 400 }
      )
    }

    // Validate quiz configuration
    const quizConfig = quiz_type === 'parent_home' 
      ? getParentQuizQuestions(age_group)
      : quiz_type === 'teacher_classroom'
      ? getTeacherQuizQuestions(age_group)
      : { quizType: 'general', questions: [], questionCount: 28, includePreferences: true, contextFocus: 'Universal', distributionRationale: 'Complete assessment' }
    
    const validation = validateQuizConfiguration(quizConfig)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid quiz configuration', details: validation.warnings },
        { status: 400 }
      )
    }

    // Calculate CLP 2.0 scores for this assessment
    const clp2Scores = calculateCLP2Scores(responses, quiz_type, age_group)
    const personalityLabel = getCLP2PersonalityLabel(clp2Scores)
    const { strengths, growthAreas } = getCLP2StrengthsAndGrowth(clp2Scores)

    if (!supabase) {
      // Development fallback
      return NextResponse.json({
        profile: {
          id: 'dev-' + Math.random().toString(36).substring(2),
          child_name,
          age_group,
          scores: clp2Scores,
          personality_label: personalityLabel,
          strengths,
          growth_areas: growthAreas,
          confidence_percentage: 85,
          completeness_percentage: quiz_type === 'general' ? 100 : 75
        },
        assessment: {
          quiz_type,
          respondent_type,
          question_count: quizConfig.questionCount
        }
      })
    }

    // Use CLP 2.0 RPC function for database operations
    const { data, error } = await supabase.rpc('handle_clp_progressive_profile', {
      p_child_name: child_name,
      p_age_group: age_group,
      p_precise_age_months: precise_age_months,
      p_birth_date: birth_date,
      p_grade: null, // Can be added if needed
      p_quiz_type: quiz_type,
      p_respondent_type: respondent_type,
      p_respondent_id: respondent_id,
      p_respondent_name: respondent_name,
      p_responses: responses,
      p_scores: clp2Scores,
      p_personality_label: personalityLabel,
      p_existing_profile_id: profile_id,
      p_contribution_weight: getQuizWeight(quiz_type, respondent_type),
      p_confidence_boost: getConfidenceBoost(quiz_type, respondent_type),
      p_school_context: assessment_context
    })

    if (error) {
      console.error('CLP 2.0 RPC Error:', error)
      return NextResponse.json(
        { error: 'Database error during profile consolidation', details: error.message },
        { status: 500 }
      )
    }

    // Generate response with consolidated data
    const response = {
      profile: {
        id: data.profile_id,
        child_name,
        age_group: data.age_group || age_group,
        precise_age_months: data.precise_age_months || precise_age_months,
        consolidated_scores: data.consolidated_scores,
        personality_label: data.personality_label,
        confidence_percentage: data.confidence_percentage,
        completeness_percentage: data.completeness_percentage,
        strengths,
        growth_areas: growthAreas,
        total_assessments: data.total_assessments,
        parent_assessments: data.parent_assessments,
        teacher_assessments: data.teacher_assessments,
        sharing_token: data.sharing_token,
        created_at: new Date().toISOString(),
        scoring_version: 'CLP 2.0'
      },
      assessment: {
        id: data.assessment_result_id,
        quiz_type,
        respondent_type,
        respondent_name,
        question_count: quizConfig.questionCount,
        completion_time: new Date().toISOString(),
        scores: clp2Scores,
        context: assessment_context
      },
      consolidation: {
        is_new_profile: data.is_new_profile,
        previous_assessments: data.previous_assessments || [],
        data_sources: data.total_assessments,
        next_recommendations: getNextAssessmentRecommendations(data)
      },
      share_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/results/${data.profile_id}?context=clp2`,
      recommendations: generateContextualRecommendations(data.consolidated_scores, quiz_type, age_group)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('CLP 2.0 Consolidation Error:', error)
    return NextResponse.json(
      { error: 'Internal server error during profile consolidation' },
      { status: 500 }
    )
  }
}

// Get profile consolidation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profile_id')
    const childName = searchParams.get('child_name')

    if (!profileId && !childName) {
      return NextResponse.json(
        { error: 'Must provide either profile_id or child_name' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    let query = supabase
      .from('profile_with_context')
      .select('*')

    if (profileId) {
      query = query.eq('id', profileId)
    } else {
      query = query.eq('child_name', childName)
    }

    const { data, error } = await query.single()

    if (error) {
      return NextResponse.json(
        { error: 'Profile not found', details: error.message },
        { status: 404 }
      )
    }

    // Analyze consolidation status
    const consolidationAnalysis = analyzeConsolidationStatus(data)

    return NextResponse.json({
      profile: data,
      consolidation_analysis: consolidationAnalysis,
      recommendations: generateConsolidationRecommendations(consolidationAnalysis)
    })

  } catch (error) {
    console.error('Profile consolidation status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions

function getQuizWeight(quizType: string, respondentType: string): number {
  const weights = {
    'parent_home': 0.6,
    'teacher_classroom': 0.8,
    'general': 1.0
  }
  return weights[quizType as keyof typeof weights] || 0.5
}

function getConfidenceBoost(quizType: string, respondentType: string): number {
  const boosts = {
    'parent_home': 30,
    'teacher_classroom': 40,
    'general': 50
  }
  return boosts[quizType as keyof typeof boosts] || 25
}

function getNextAssessmentRecommendations(data: any): string[] {
  const recommendations: string[] = []
  
  if (data.parent_assessments === 0) {
    recommendations.push('Consider adding a parent assessment for home behavior insights')
  }
  
  if (data.teacher_assessments === 0) {
    recommendations.push('Consider adding a teacher assessment for classroom behavior insights')
  }
  
  if (data.total_assessments === 1) {
    recommendations.push('Additional assessments will increase profile confidence and accuracy')
  }
  
  if (data.completeness_percentage < 80) {
    recommendations.push('Complete assessment or add context-specific assessments for fuller profile')
  }
  
  return recommendations
}

function generateContextualRecommendations(scores: CLP2Scores, quizType: string, ageGroup: string): {
  home_activities: string[]
  classroom_strategies: string[]
  general_support: string[]
} {
  const { strengths, growthAreas } = getCLP2StrengthsAndGrowth(scores)
  
  return {
    home_activities: [
      `Leverage ${strengths[0] || 'their interests'} through engaging home activities`,
      `Support ${growthAreas[0] || 'development'} with low-pressure home practice`,
      'Create consistent learning routines that match their learning style'
    ],
    classroom_strategies: [
      `Utilize ${strengths[0] || 'their strengths'} in group activities and projects`,
      `Provide scaffolding for ${growthAreas[0] || 'growing skills'} in classroom settings`,
      'Consider seating and grouping that supports their learning profile'
    ],
    general_support: [
      'Celebrate progress and effort over perfection',
      'Provide multiple ways to demonstrate understanding',
      'Maintain open communication between home and school'
    ]
  }
}

function analyzeConsolidationStatus(profile: any): {
  completeness_score: number
  confidence_level: 'low' | 'medium' | 'high'
  data_sources: { type: string; count: number }[]
  missing_contexts: string[]
  strengths: string[]
  recommendations: string[]
} {
  const dataSources = profile.data_sources || []
  const parentSources = dataSources.filter((ds: any) => ds.respondent_type === 'parent').length
  const teacherSources = dataSources.filter((ds: any) => ds.respondent_type === 'teacher').length
  
  const completenessScore = Math.min(100, 
    (parentSources > 0 ? 40 : 0) + 
    (teacherSources > 0 ? 40 : 0) + 
    (dataSources.length * 5)
  )
  
  const confidenceLevel = 
    profile.confidence_percentage >= 80 ? 'high' :
    profile.confidence_percentage >= 60 ? 'medium' : 'low'
  
  const missingContexts = []
  if (parentSources === 0) missingContexts.push('parent_home')
  if (teacherSources === 0) missingContexts.push('teacher_classroom')
  
  return {
    completeness_score: completenessScore,
    confidence_level: confidenceLevel,
    data_sources: [
      { type: 'parent', count: parentSources },
      { type: 'teacher', count: teacherSources }
    ],
    missing_contexts: missingContexts,
    strengths: profile.primary_strengths || [],
    recommendations: [
      ...(missingContexts.length > 0 ? [`Add ${missingContexts.join(' and ')} assessment(s)`] : []),
      ...(completenessScore < 80 ? ['Consider additional assessment perspectives'] : []),
      ...(confidenceLevel === 'low' ? ['Profile would benefit from more data sources'] : [])
    ]
  }
}

function generateConsolidationRecommendations(analysis: any): string[] {
  const recommendations: string[] = []
  
  if (analysis.confidence_level === 'low') {
    recommendations.push('Add more assessment perspectives to increase profile confidence')
  }
  
  if (analysis.missing_contexts.includes('parent_home')) {
    recommendations.push('Parent assessment would add valuable home behavior insights')
  }
  
  if (analysis.missing_contexts.includes('teacher_classroom')) {
    recommendations.push('Teacher assessment would add professional classroom observations')
  }
  
  if (analysis.completeness_score < 70) {
    recommendations.push('Profile is still developing - additional assessments recommended')
  }
  
  return recommendations
}