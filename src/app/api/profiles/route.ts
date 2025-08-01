import { NextRequest, NextResponse } from 'next/server'
import { supabase, updateAssignmentStatus } from '@/lib/supabase'
import { calculateScores, getPersonalityLabel, generateDescription } from '@/lib/scoring'

export async function POST(request: NextRequest) {
  try {
    const { child_name, grade, responses, assignment_token } = await request.json()

    if (!child_name || !grade || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate scores and generate profile
    const scores = calculateScores(responses)
    const personality_label = getPersonalityLabel(scores)
    const description = generateDescription(scores)

    // Save assessment result
    const { data: profile, error: profileError } = await supabase
      .from('assessment_results')
      .insert([{
        child_name,
        age: 0, // We don't collect age anymore, using grade instead
        scores,
        personality_label,
        raw_responses: responses,
        email: '', // Not required for teacher assignments
        birth_month: 1,
        birth_year: new Date().getFullYear(),
        grade_level: grade
      }])
      .select()
      .single()

    if (profileError) {
      console.error('Error saving profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      )
    }

    // If this was a teacher assignment, update the assignment status
    if (assignment_token) {
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