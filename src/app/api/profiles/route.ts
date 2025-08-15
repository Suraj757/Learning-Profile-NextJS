import { NextRequest, NextResponse } from 'next/server'
import { supabase, updateAssignmentStatus } from '@/lib/supabase'
import { calculateScores, getPersonalityLabel, generateDescription } from '@/lib/scoring'

export async function POST(request: NextRequest) {
  try {
    const { 
      child_name, 
      grade, 
      age_group, 
      responses, 
      assignment_token, 
      precise_age_years, 
      precise_age_months, 
      birth_date, 
      age_input_method, 
      question_set_type 
    } = await request.json()

    if (!child_name || !grade || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate scores and generate profile with age-specific support
    const scores = calculateScores(responses, age_group)
    const personality_label = getPersonalityLabel(scores)
    const description = generateDescription(scores)

    let profile
    
    // Check if Supabase is configured
    if (!supabase) {
      console.log('Supabase not configured, using fallback mode')
      console.log('Environment check:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set'
      })
      // Fallback for local development - create mock profile data
      profile = {
        id: Math.random().toString(36).substring(2, 15),
        child_name,
        age: 0,
        age_group: age_group || '5+',
        scores,
        personality_label,
        raw_responses: responses,
        email: '',
        birth_month: 1,
        birth_year: new Date().getFullYear(),
        grade_level: grade,
        created_at: new Date().toISOString()
      }
    } else {
      console.log('Supabase configured, attempting to save to database')
      
      // Prepare the base data payload with precise age support
      const baseData = {
        child_name,
        // Enhanced age data
        precise_age_years: precise_age_years || null,
        precise_age_months: precise_age_months || null,
        birth_date: birth_date || null,
        age_input_method: age_input_method || 'age_group',
        question_set_type: question_set_type || 'pure',
        age: 0, // Legacy field, kept for compatibility
        scores,
        personality_label,
        raw_responses: responses,
        email: '', // Not required for teacher assignments
        birth_month: 1,
        birth_year: new Date().getFullYear(),
        grade_level: grade
      }

      // Enhanced error handling and data validation
      let insertData = { ...baseData }
      
      // Validate responses structure for age-specific questions
      try {
        const responsesStr = JSON.stringify(responses)
        const parsedResponses = JSON.parse(responsesStr)
        
        // Ensure all array/object responses are properly serialized
        Object.keys(parsedResponses).forEach(key => {
          const value = parsedResponses[key]
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            // Already in correct format for JSONB
          }
        })
        
        insertData.raw_responses = parsedResponses
      } catch (responseError) {
        console.error('Error processing responses:', responseError)
        return NextResponse.json(
          { 
            error: 'Invalid response data format',
            details: 'Assessment responses could not be processed. Please try completing the assessment again.'
          },
          { status: 400 }
        )
      }
      
      // First attempt: try WITHOUT age_group column (for compatibility)
      try {
        console.log('Attempting to save profile without age_group column (compatibility mode)...', {
          child_name: insertData.child_name,
          responseCount: Object.keys(responses).length
        })
        
        const { data: profileData, error: profileError } = await supabase
          .from('assessment_results')
          .insert([insertData])
          .select()
          .single()

        if (profileError) {
          // Check if error is due to missing age_group column (legacy schema)
          if (profileError.code === '42703' || profileError.message?.includes('age_group')) {
            console.log('Legacy schema detected - age_group column not found, retrying without it...')
            
            // Retry without age_group column for legacy schema compatibility
            const legacyData = { ...baseData }
            delete legacyData.age_group
            
            const { data: retryData, error: retryError } = await supabase
              .from('assessment_results')
              .insert([legacyData])
              .select()
              .single()

            if (retryError) {
              console.error('Error saving profile (legacy schema retry):', {
                error: retryError,
                message: retryError.message,
                details: retryError.details,
                hint: retryError.hint,
                code: retryError.code,
                insertData: legacyData
              })
              
              // More specific error handling
              let userMessage = 'Failed to save profile'
              let userDetails = 'Please try again or contact support if the issue persists.'
              
              if (retryError.code === '23502') {
                userMessage = 'Missing required assessment information'
                userDetails = 'Some required fields are missing. Please complete all assessment questions and try again.'
              } else if (retryError.code === '23505') {
                userMessage = 'Duplicate assessment detected'
                userDetails = 'This assessment appears to have already been submitted. Please contact support if you need to update it.'
              } else if (retryError.message?.includes('JSON')) {
                userMessage = 'Assessment data format error'
                userDetails = 'There was an issue with the assessment responses. Please try completing the assessment again.'
              }
              
              return NextResponse.json(
                { 
                  error: userMessage,
                  details: userDetails,
                  debugInfo: process.env.NODE_ENV === 'development' ? {
                    code: retryError.code,
                    message: retryError.message
                  } : undefined
                },
                { status: 500 }
              )
            }
            
            // Success with legacy schema - add age_group to response for consistency
            profile = { ...retryData, age_group: age_group || '5+' }
            console.log('Profile saved successfully with legacy schema')
          } else {
            // Other database error with modern schema
            console.error('Error saving profile (modern schema):', {
              error: profileError,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              code: profileError.code,
              insertData
            })
            
            // Enhanced error categorization
            let userMessage = 'Failed to save profile'
            let userDetails = 'Please try again or contact support if the issue persists.'
            
            if (profileError.code === '23502') {
              const missingField = profileError.message?.match(/column "(\w+)"/)?.[1]
              userMessage = 'Missing required information for profile creation'
              userDetails = missingField ? 
                `The field "${missingField}" is required but missing. Please check your assessment responses.` :
                'Some required information is missing. Please complete all assessment questions and try again.'
            } else if (profileError.code === '23505') {
              userMessage = 'A profile with this information already exists'
              userDetails = 'This assessment appears to have already been submitted. Please contact support if you need to update it.'
            } else if (profileError.code === '42601' || profileError.message?.includes('JSON')) {
              userMessage = 'Assessment data format error'
              userDetails = 'There was an issue processing your assessment responses. Please try completing the assessment again.'
            } else if (profileError.code === '23514') {
              userMessage = 'Invalid assessment data'
              userDetails = 'Some assessment responses are outside the expected range. Please try completing the assessment again.'
            }
            
            return NextResponse.json(
              { 
                error: userMessage,
                details: userDetails,
                debugInfo: process.env.NODE_ENV === 'development' ? {
                  code: profileError.code,
                  message: profileError.message,
                  hint: profileError.hint
                } : undefined
              },
              { status: 500 }
            )
          }
        } else {
          profile = profileData
          console.log('Profile saved successfully with modern schema')
        }
      } catch (unexpectedError) {
        console.error('Unexpected error during profile save:', unexpectedError)
        return NextResponse.json(
          { 
            error: 'An unexpected error occurred while saving your profile',
            details: 'Please try again or contact support if the issue persists.'
          },
          { status: 500 }
        )
      }
    }

    // If this was a teacher assignment, update the assignment status (only if Supabase is available)
    if (assignment_token && supabase) {
      try {
        // Find the assignment by token
        const { data: assignment } = await supabase
          .from('profile_assignments')
          .select('*')
          .eq('assignment_token', assignment_token)
          .single()

        if (assignment) {
          // Update assignment status to completed
          await updateAssignmentStatus(assignment.id, 'completed', profile.id)
        }
      } catch (assignmentError) {
        // Don't fail the whole request if assignment update fails
        console.error('Error updating assignment status:', assignmentError)
      }
    }

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/results/${profile.id}`

    return NextResponse.json({
      profile,
      shareUrl
    })
  } catch (error) {
    console.error('Error in profiles API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const teacherId = searchParams.get('teacherId')

  if (!teacherId) {
    return NextResponse.json(
      { error: 'Teacher ID required' },
      { status: 400 }
    )
  }

  // If Supabase is not configured, return empty assignments for local development
  if (!supabase) {
    return NextResponse.json({ assignments: [] })
  }

  try {
    // Get completed assignments for this teacher with profile data
    const { data: assignments, error } = await supabase
      .from('profile_assignments')
      .select(`
        *,
        assessment_results (*)
      `)
      .eq('teacher_id', teacherId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching teacher profiles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Error in profiles GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}