import { NextRequest, NextResponse } from 'next/server'
import { SAMPLE_PROFILES, generateVariantProfile } from '@/lib/sample-profiles'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const count = parseInt(searchParams.get('count') || '5')
    const baseProfileId = searchParams.get('baseProfile')
    
    // Generate variants of existing profiles for testing
    let variants = []
    
    if (baseProfileId) {
      const baseProfile = SAMPLE_PROFILES.find(p => p.id === baseProfileId)
      if (!baseProfile) {
        return NextResponse.json(
          { error: 'Base profile not found' },
          { status: 404 }
        )
      }
      
      // Generate variants of the specific profile
      for (let i = 0; i < count; i++) {
        variants.push(generateVariantProfile(baseProfile, 0.4))
      }
    } else {
      // Generate variants of random profiles
      for (let i = 0; i < count; i++) {
        const randomBase = SAMPLE_PROFILES[Math.floor(Math.random() * SAMPLE_PROFILES.length)]
        variants.push(generateVariantProfile(randomBase, 0.3))
      }
    }
    
    return NextResponse.json({ 
      variants, 
      count: variants.length,
      message: 'Generated variant profiles for testing'
    })
  } catch (error) {
    console.error('Error generating sample profile variants:', error)
    return NextResponse.json(
      { error: 'Failed to generate variants' },
      { status: 500 }
    )
  }
}