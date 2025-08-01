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

    const { data: profile, error } = await getProfile(params.id)

    if (error) {
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