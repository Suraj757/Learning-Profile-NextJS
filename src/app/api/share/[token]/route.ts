import { NextRequest, NextResponse } from 'next/server'
import { getProfileByShareToken } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { data: profile, error } = await getProfileByShareToken(params.token)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found or not public' },
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