import { NextRequest, NextResponse } from 'next/server'
import { getSampleProfile, generateVariantProfile } from '@/lib/sample-profiles'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const variant = searchParams.get('variant') === 'true'

    const profile = getSampleProfile(id)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Sample profile not found' },
        { status: 404 }
      )
    }

    // Generate a variant if requested (for testing different scenarios)
    const responseProfile = variant ? generateVariantProfile(profile) : profile

    // Transform to match the expected API response format
    const transformedProfile = {
      id: responseProfile.id,
      child_name: responseProfile.childName,
      grade: responseProfile.grade,
      grade_level: responseProfile.grade,
      scores: responseProfile.scores,
      personality_label: responseProfile.personalityLabel,
      description: responseProfile.description,
      created_at: responseProfile.createdAt,
      is_public: responseProfile.isPublic || true,
      share_token: responseProfile.shareToken || responseProfile.id,
      
      // Interests and motivators data
      interests: responseProfile.interests,
      engagementStyle: responseProfile.engagementStyle,
      learningModality: responseProfile.learningModality,
      socialPreference: responseProfile.socialPreference,
      schoolExperience: responseProfile.schoolExperience,
      
      // Enhanced motivator data
      primaryMotivators: responseProfile.primaryMotivators,
      learningDrivers: responseProfile.learningDrivers,
      challengeResponse: responseProfile.challengeResponse,
      recognitionPreference: responseProfile.recognitionPreference,
      stressIndicators: responseProfile.stressIndicators,
      optimalConditions: responseProfile.optimalConditions,
      
      // Additional sample-specific data
      sample_data: {
        backstory: responseProfile.backstory,
        parentQuote: responseProfile.parentQuote,
        teacherInsight: responseProfile.teacherInsight,
        realWorldExample: responseProfile.realWorldExample,
        strengths: responseProfile.strengths,
        growthAreas: responseProfile.growthAreas,
        age: responseProfile.age
      }
    }

    return NextResponse.json({ 
      profile: transformedProfile,
      isSample: true
    })
  } catch (error) {
    console.error('Error fetching sample profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sample profile' },
      { status: 500 }
    )
  }
}