import { NextRequest, NextResponse } from 'next/server'
import { getProfile, supabase } from '@/lib/supabase'
import { calculateScores, getPersonalityLabel, generateDescription } from '@/lib/scoring'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // If Supabase is not configured, return a fallback response that tells the frontend to use localStorage
    if (!supabase) {
      // The frontend should check localStorage for `profile_${id}` and fall back to sessionStorage 'latestProfile'
      return NextResponse.json(
        { error: 'Use client-side fallback', useClientFallback: true },
        { status: 404 }
      )
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