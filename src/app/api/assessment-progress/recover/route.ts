import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Email-based recovery for cross-device access
export async function POST(request: NextRequest) {
  try {
    const { parent_email } = await request.json()

    if (!parent_email) {
      return NextResponse.json(
        { error: 'Parent email required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(parent_email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Local development fallback
      return NextResponse.json({
        progress_sessions: [],
        message: 'No saved progress found (dev mode)'
      })
    }

    // Clean up expired records first
    await supabase
      .from('assessment_progress')
      .delete()
      .lt('expires_at', new Date().toISOString())

    // Find all non-expired progress for this email
    const { data, error } = await supabase
      .from('assessment_progress')
      .select('*')
      .eq('parent_email', parent_email)
      .gt('expires_at', new Date().toISOString())
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching progress by email:', error)
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    const progressSessions = data.map(session => ({
      session_id: session.session_id,
      child_name: session.child_name,
      grade: session.grade,
      current_question: session.current_question,
      total_questions: 24,
      progress_percentage: Math.round((session.current_question / 24) * 100),
      responses_count: Object.keys(session.responses || {}).length,
      last_saved: session.updated_at,
      expires_at: session.expires_at,
      assignment_token: session.assignment_token
    }))

    return NextResponse.json({
      progress_sessions: progressSessions,
      found: progressSessions.length > 0
    })
  } catch (error) {
    console.error('Error in assessment recovery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}