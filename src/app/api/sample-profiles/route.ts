import { NextRequest, NextResponse } from 'next/server'
import { SAMPLE_PROFILES, getSampleProfilesByGrade, getSampleProfilesByPersonality, getRandomSampleProfiles } from '@/lib/sample-profiles'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const grade = searchParams.get('grade')
    const personality = searchParams.get('personality')
    const count = searchParams.get('count')
    const random = searchParams.get('random')

    // Return random sample profiles
    if (random === 'true') {
      const numProfiles = count ? parseInt(count) : 3
      const profiles = getRandomSampleProfiles(numProfiles)
      return NextResponse.json({ profiles, total: profiles.length })
    }

    // Filter by grade
    if (grade) {
      const profiles = getSampleProfilesByGrade(grade)
      return NextResponse.json({ profiles, total: profiles.length })
    }

    // Filter by personality type
    if (personality) {
      const profiles = getSampleProfilesByPersonality(personality)
      return NextResponse.json({ profiles, total: profiles.length })
    }

    // Return all sample profiles with optional count limit
    let profiles = SAMPLE_PROFILES
    if (count) {
      const limit = parseInt(count)
      profiles = profiles.slice(0, limit)
    }

    return NextResponse.json({ 
      profiles, 
      total: profiles.length,
      availableGrades: [...new Set(SAMPLE_PROFILES.map(p => p.grade))],
      availablePersonalities: [...new Set(SAMPLE_PROFILES.map(p => p.personalityLabel))]
    })
  } catch (error) {
    console.error('Error fetching sample profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sample profiles' },
      { status: 500 }
    )
  }
}