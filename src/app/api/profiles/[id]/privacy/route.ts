import { NextRequest, NextResponse } from 'next/server'
import { updateProfilePrivacy } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { is_public } = body

    if (typeof is_public !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid is_public value' },
        { status: 400 }
      )
    }

    const { error } = await updateProfilePrivacy(params.id, is_public)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile privacy' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}