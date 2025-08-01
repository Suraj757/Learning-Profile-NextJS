import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Save assessment progress
export async function POST(request: NextRequest) {
  try {
    const { 
      session_id, 
      child_name, 
      grade, 
      responses, 
      current_question, 
      parent_email,
      assignment_token 
    } = await request.json()

    if (!session_id || !child_name || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      // Fallback for local development - just return success
      return NextResponse.json({
        success: true,
        session_id,
        message: 'Progress saved locally (dev mode)'
      })
    }

    // Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Upsert progress record
    const { data, error } = await supabase
      .from('assessment_progress')
      .upsert({
        session_id,
        child_name,
        grade,
        responses: responses || {},
        current_question: current_question || 1,
        parent_email: parent_email || null,
        assignment_token: assignment_token || null,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving progress:', error)
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session_id,
      current_question: data.current_question,
      last_saved: data.updated_at,
      expires_at: data.expires_at
    })
  } catch (error) {
    console.error('Error in assessment-progress POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get assessment progress
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const parentEmail = searchParams.get('parent_email')

    if (!sessionId && !parentEmail) {
      return NextResponse.json(
        { error: 'Session ID or parent email required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({ progress: null })
    }

    // Clean up expired progress records first
    await supabase
      .from('assessment_progress')
      .delete()
      .lt('expires_at', new Date().toISOString())

    let query = supabase
      .from('assessment_progress')
      .select('*')
      .gt('expires_at', new Date().toISOString()) // Only get non-expired records

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else if (parentEmail) {
      query = query.eq('parent_email', parentEmail).order('updated_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    // Return the most recent progress if multiple found
    const progress = Array.isArray(data) ? data[0] : data

    return NextResponse.json({ 
      progress,
      found: !!progress 
    })
  } catch (error) {
    console.error('Error in assessment-progress GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete assessment progress (when completed or manually cleared)
export async function DELETE(request: NextRequest) {
  try {
    const { session_id } = await request.json()

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json({ success: true })
    }

    const { error } = await supabase
      .from('assessment_progress')
      .delete()
      .eq('session_id', session_id)

    if (error) {
      console.error('Error deleting progress:', error)
      return NextResponse.json(
        { error: 'Failed to delete progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in assessment-progress DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}