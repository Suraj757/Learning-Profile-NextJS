import { NextRequest, NextResponse } from 'next/server'
import { getProfile, supabase } from '@/lib/supabase'
import { calculateScores, getPersonalityLabel, generateDescription } from '@/lib/scoring'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // If Supabase is not configured, create a mock profile for demo purposes
    if (!supabase) {
      // For local development, create a sample profile
      const mockProfile = {
        id: params.id,
        child_name: 'Demo Child',
        grade: '3rd Grade',
        scores: {
          communication: 4,
          collaboration: 3,
          content: 4,
          critical_thinking: 5,
          creative_innovation: 4,
          confidence: 3
        },
        personality_label: 'Creative Thinker',
        description: 'This child shows strong creative and critical thinking abilities with good communication skills.',
        is_public: true,
        share_token: params.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({ profile: mockProfile })
    }

    // Try to fetch from assessment_results table first (for teacher assignments)
    let profile = null
    let error = null

    try {
      const { data: assessmentProfile, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('id', params.id)
        .single()

      if (assessmentProfile && !assessmentError) {
        profile = assessmentProfile
      } else {
        // Fallback to profiles table (for direct public profiles)
        const { data: publicProfile, error: publicError } = await getProfile(params.id)
        profile = publicProfile
        error = publicError
      }
    } catch (e) {
      console.error('Database error:', e)
      error = e
    }

    if (error && !profile) {
      console.error('Database error:', error)
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

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}