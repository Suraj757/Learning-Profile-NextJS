'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Star, Quote, Users, Home, School, Lightbulb, Eye, Play, Sparkles, MessageSquare, Target, CheckCircle, Calendar, Award, TrendingUp, ExternalLink, AlertCircle } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import EnhancedContentRecommendations from '@/components/content/EnhancedContentRecommendations'
import { beginContentService } from '@/lib/content-recommendation-service'

interface SampleProfileData {
  id: string
  child_name: string
  grade: string
  scores: Record<string, number>
  personality_label: string
  description: string
  created_at: string
  interests?: string[]
  engagementStyle?: string
  learningModality?: string
  socialPreference?: string
  schoolExperience?: string
  primaryMotivators?: string[]
  learningDrivers?: string[]
  challengeResponse?: string
  recognitionPreference?: string
  stressIndicators?: string[]
  optimalConditions?: string[]
  sample_data: {
    backstory: string
    parentQuote: string
    teacherInsight: string
    realWorldExample: string
    strengths: string[]
    growthAreas: string[]
    age: number
  }
}

export default function SampleProfilePage() {
  const params = useParams()
  const [profileData, setProfileData] = useState<SampleProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [enhancedRecommendations, setEnhancedRecommendations] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/sample-profiles/${params.id}`)
        
        if (!response.ok) {
          setLoading(false)
          return
        }
        
        const { profile } = await response.json()
        setProfileData(profile)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching sample profile:', error)
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProfile()
    }
  }, [params.id])

  // Load enhanced recommendations when profile data is available
  useEffect(() => {
    const loadEnhancedRecommendations = async () => {
      if (profileData?.scores && profileData?.personality_label) {
        try {
          const learningProfile = {
            personality_label: profileData.personality_label,
            scores: profileData.scores
          }
          const recs = await beginContentService.getQuickRecommendationSummary(learningProfile)
          setEnhancedRecommendations(recs)
        } catch (error) {
          console.error('Error loading enhanced recommendations:', error)
        }
      }
    }
    
    loadEnhancedRecommendations()
  }, [profileData])

  if (loading) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sample profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-begin-blue mb-4">Sample Profile Not Found</h1>
          <p className="text-gray-600 mb-6">This sample profile doesn't exist or has been removed.</p>
          <Link href="/demo" className="btn-begin-primary">
            Browse All Samples
          </Link>
        </div>
      </div>
    )
  }

  // Prepare data for radar chart
  const radarData = Object.entries(profileData.scores).map(([category, score]) => ({
    category: category.replace(' ', '\n'), // Break long category names
    score: score,
    fullMark: 5
  }))

  // Get strength level for each category
  const getStrengthLevel = (score: number) => {
    if (score >= 4.5) return { level: 'High Strength', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 3.5) return { level: 'Developing', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Emerging', color: 'text-blue-600', bg: 'bg-blue-100' }
  }

  const topStrengths = Object.entries(profileData.scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([category]) => category)

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/demo" className="btn-begin-secondary flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Gallery
              </Link>
              <Link href="/assessment/start" className="btn-begin-primary">
                Create Your Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sample Profile Notice */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Eye className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-800">Sample Learning Profile</h3>
              <p className="text-sm text-yellow-700">
                This is a real example showing how our assessment works. Your child's profile will be personalized to their unique responses.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="card-begin p-8 mb-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-begin-blue to-begin-teal rounded-2xl p-6 mb-6 max-w-2xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
              <div className="relative z-10">
                <h1 className="text-begin-hero font-bold mb-2 text-white drop-shadow-lg">
                  {profileData.child_name}'s Learning Profile
                </h1>
                <div className="flex items-center justify-center gap-2 text-begin-body text-white/95 drop-shadow-md">
                  <Sparkles className="h-5 w-5 drop-shadow-sm" />
                  <span className="font-medium">{profileData.personality_label}</span>
                  <Sparkles className="h-5 w-5 drop-shadow-sm" />
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-blue">{profileData.grade}</div>
                <div className="text-sm text-gray-600">Grade Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-teal">{profileData.sample_data.age}</div>
                <div className="text-sm text-gray-600">Years Old</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-cyan">
                  {Object.values(profileData.scores).filter(score => score >= 4).length}
                </div>
                <div className="text-sm text-gray-600">Strengths</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Sample</div>
                <div className="text-sm text-gray-600">Profile</div>
              </div>
            </div>
          </div>

          <div className="bg-begin-cyan/5 p-6 rounded-2xl">
            <p className="text-begin-body text-gray-700 text-center leading-relaxed">
              {profileData.description}
            </p>
          </div>
        </div>

        {/* Student Interests & Motivators Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Interests */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">Top Interests</h3>
            </div>
            <div className="space-y-2">
              {profileData.interests?.map((interest, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-800">{interest}</span>
                </div>
              )) || <p className="text-sm text-gray-600 italic">Interests data coming soon...</p>}
            </div>
          </div>

          {/* Learning Style */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Lightbulb className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">Learning Style</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="text-xs font-semibold text-green-800 mb-1">Engagement Style</h4>
                <p className="text-sm text-gray-800">{profileData.engagementStyle || 'Learning style data coming soon...'}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-xs font-semibold text-blue-800 mb-1">Learning Modality</h4>
                <p className="text-sm text-gray-800">{profileData.learningModality || 'Learning modality data coming soon...'}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="text-xs font-semibold text-orange-800 mb-1">Social Preference</h4>
                <p className="text-sm text-gray-800">{profileData.socialPreference || 'Social preference data coming soon...'}</p>
              </div>
            </div>
          </div>

          {/* School Readiness */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-100 p-2 rounded-lg">
                <School className="h-5 w-5 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">School Experience</h3>
            </div>
            <div className="p-3 bg-cyan-50 rounded-lg">
              <p className="text-sm text-gray-800">{profileData.schoolExperience || 'School experience data coming soon...'}</p>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <h4 className="text-xs font-semibold text-cyan-800 mb-2">Teacher's First Day Insight:</h4>
              <p className="text-xs text-gray-700">
                {profileData.schoolExperience?.includes('first time') 
                  ? `${profileData.child_name} may need extra support with school routines and classroom expectations.`
                  : profileData.schoolExperience?.includes('less than 6 months')
                  ? `${profileData.child_name} is still adjusting to school structure and may benefit from consistent routines.`
                  : profileData.schoolExperience?.includes('6 months to 1 year')
                  ? `${profileData.child_name} has some school experience and understands basic classroom expectations.`
                  : `${profileData.child_name} is comfortable with school routines and ready for academic challenges.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Motivators & Learning Drivers */}
        {(profileData.primaryMotivators || profileData.learningDrivers || profileData.challengeResponse) && (
          <div className="card-begin p-8 mb-8">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-begin-heading font-bold text-begin-blue mb-2">
                What Motivates {profileData.child_name}
              </h2>
              <p className="text-gray-600">
                Deep insights into what drives their learning and engagement
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Primary Motivators & Learning Drivers */}
              <div className="space-y-6">
                {profileData.primaryMotivators && profileData.primaryMotivators.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Primary Motivators
                    </h3>
                    <div className="space-y-2">
                      {profileData.primaryMotivators.map((motivator, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                          <Star className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{motivator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.learningDrivers && profileData.learningDrivers.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Learning Drivers
                    </h3>
                    <div className="space-y-2">
                      {profileData.learningDrivers.map((driver, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{driver}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Challenge Response & Recognition */}
              <div className="space-y-6">
                {profileData.challengeResponse && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Challenge Response
                    </h3>
                    <p className="text-sm text-gray-800 leading-relaxed">{profileData.challengeResponse}</p>
                  </div>
                )}

                {profileData.recognitionPreference && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-200">
                    <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Recognition Preference
                    </h3>
                    <p className="text-sm text-gray-800 leading-relaxed">{profileData.recognitionPreference}</p>
                  </div>
                )}

                {profileData.stressIndicators && profileData.stressIndicators.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                    <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Stress Indicators
                    </h3>
                    <div className="space-y-2">
                      {profileData.stressIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Optimal Conditions */}
            {profileData.optimalConditions && profileData.optimalConditions.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 p-6 rounded-2xl border border-begin-teal/30">
                <h3 className="text-lg font-bold text-begin-blue mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Optimal Learning Conditions for {profileData.child_name}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {profileData.optimalConditions.map((condition, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white/60 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-begin-teal mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-800 font-medium">{condition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sample-Specific Insights */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Backstory */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">About {profileData.child_name}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{profileData.sample_data.backstory}</p>
          </div>

          {/* Real-World Example */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Lightbulb className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">Learning in Action</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{profileData.sample_data.realWorldExample}</p>
          </div>
        </div>

        {/* Quotes Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Parent Quote */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-100 p-2 rounded-lg">
                <Home className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">Parent Perspective</h3>
            </div>
            <div className="relative">
              <Quote className="h-8 w-8 text-pink-200 absolute -top-2 -left-2" />
              <p className="text-gray-700 italic leading-relaxed pl-6">
                "{profileData.sample_data.parentQuote}"
              </p>
            </div>
          </div>

          {/* Teacher Insight */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <School className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">Teacher Insight</h3>
            </div>
            <div className="relative">
              <Quote className="h-8 w-8 text-purple-200 absolute -top-2 -left-2" />
              <p className="text-gray-700 italic leading-relaxed pl-6">
                "{profileData.sample_data.teacherInsight}"
              </p>
            </div>
          </div>
        </div>

        {/* Strengths and Growth Areas */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">Key Strengths</h3>
            </div>
            <div className="space-y-3">
              {profileData.sample_data.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Areas */}
          <div className="card-begin p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-begin-blue">Growth Opportunities</h3>
            </div>
            <div className="space-y-3">
              {profileData.sample_data.growthAreas.map((area, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                  <Target className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart */}
          <div className="card-begin p-6">
            <h2 className="text-begin-heading font-bold text-begin-blue mb-6 text-center">
              Learning Strengths Overview
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="category" 
                    className="text-sm font-medium"
                    tick={{ fontSize: 12, fill: '#0B3064' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 5]} 
                    tick={false}
                  />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#007A72" 
                    fill="#007A72" 
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              Interactive learning profile based on 24 research-backed questions
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="card-begin p-6">
            <h2 className="text-begin-heading font-bold text-begin-blue mb-6">
              Detailed Category Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(profileData.scores).map(([category, score]) => {
                const strength = getStrengthLevel(score)
                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-begin-blue mb-1">{category}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-begin-teal h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {(Number(score) || 0).toFixed(1)}/5.0
                        </span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${strength.bg} ${strength.color}`}>
                      {strength.level}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* What This Means for Parents */}
        <div className="card-begin p-8 mb-8">
          <div className="text-center mb-6">
            <div className="bg-begin-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-begin-teal" />
            </div>
            <h2 className="text-begin-heading font-bold text-begin-blue mb-2">
              What This Means for Parents
            </h2>
            <p className="text-gray-600">
              Practical insights you can apply immediately with your {profileData.personality_label.toLowerCase()} learner
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-4">At Home Strategies</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Create opportunities for {profileData.child_name} to use their {topStrengths[0].toLowerCase()} strengths
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Encourage {profileData.personality_label.includes('Creative') ? 'hands-on, artistic activities' : profileData.personality_label.includes('Social') ? 'family discussions and collaborative projects' : profileData.personality_label.includes('Analytical') ? 'exploration of how things work' : 'independent choice and self-direction'}
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Support growth in {profileData.sample_data.growthAreas[0]?.toLowerCase() || 'developing areas'} through patient practice
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <h3 className="text-lg font-bold text-green-800 mb-4">School Communication</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <School className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Share that {profileData.child_name} is a {profileData.personality_label.toLowerCase()} learner
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Request accommodations that support their learning style
                </li>
                <li className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Advocate for opportunities to showcase their {topStrengths[0].toLowerCase()} abilities
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Content Recommendations */}
        {enhancedRecommendations && (
          <div className="mb-8">
            <EnhancedContentRecommendations
              recommendations={enhancedRecommendations}
              studentName={profileData.child_name}
              learningProfile={profileData.personality_label}
            />
          </div>
        )}

        {/* Create Your Own CTA */}
        <div className="text-center">
          <div className="card-begin p-8 bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-begin-blue mb-4">
              Ready to Discover Your Child's Unique Profile?
            </h3>
            <p className="text-gray-600 mb-6">
              This sample shows the depth of insights available through our assessment. 
              Create a personalized profile for your child in just 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment/start" className="btn-begin-primary flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Your Assessment
              </Link>
              <Link href="/demo" className="btn-begin-secondary flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Browse More Samples
              </Link>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Your child's profile will be unique to their responses and personality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}