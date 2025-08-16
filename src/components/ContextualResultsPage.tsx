'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Users, GraduationCap, Home, Share2, Download, Eye, TrendingUp, Star, Heart, Brain, Palette, MessageCircle, Zap, Award, Target, Lightbulb } from 'lucide-react'
import { QuizType, RespondentType } from '@/lib/quiz-definitions'
import { CLP2Scores, getCLP2PersonalityLabel, getCLP2StrengthsAndGrowth } from '@/lib/clp-scoring'

interface ConsolidatedProfile {
  id: string
  child_name: string
  consolidated_scores: Record<string, number> | CLP2Scores
  personality_label: string
  confidence_percentage: number
  completeness_percentage: number
  total_assessments: number
  parent_assessments: number
  teacher_assessments: number
  age_group?: string
  precise_age_months?: number
  strengths?: string[]
  growth_areas?: string[]
  scoring_version?: 'CLP 2.0' | 'Legacy'
  view_context?: 'parent' | 'teacher' | 'student'
  data_sources?: Array<{
    quiz_type: string
    respondent_type: string
    contributed_at: string
    confidence_contribution: number
    is_current: boolean
  }>
  recommendations?: Record<string, any>
  home_recommendations?: Record<string, any>
  classroom_recommendations?: Record<string, any>
}

interface ContextualResultsPageProps {
  profileId: string
  initialProfile?: ConsolidatedProfile
}

export default function ContextualResultsPage({ profileId, initialProfile }: ContextualResultsPageProps) {
  const [profile, setProfile] = useState<ConsolidatedProfile | null>(initialProfile || null)
  const [loading, setLoading] = useState(!initialProfile)
  const [viewContext, setViewContext] = useState<'parent' | 'teacher' | 'combined'>('combined')
  const [showShareModal, setShowShareModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const context = searchParams.get('context') as 'parent' | 'teacher'
    if (context) {
      setViewContext(context)
    }

    if (!initialProfile) {
      fetchProfile(context)
    }
  }, [profileId, initialProfile])

  const fetchProfile = async (context?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ profileId })
      if (context) params.append('context', context)
      
      const response = await fetch(`/api/profiles/progressive?${params}`)
      if (!response.ok) throw new Error('Failed to fetch profile')
      
      const data = await response.json()
      setProfile(data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingView />
  }

  if (!profile) {
    return <ProfileNotFound />
  }

  // CLP 2.0 skills visualization
  const renderSkillsVisualization = () => {
    if (profile.scoring_version === 'CLP 2.0') {
      return <CLP2SkillsVisualization profile={profile} viewContext={viewContext} />
    }
    // Legacy visualization for backward compatibility
    return <LegacySkillsVisualization profile={profile} viewContext={viewContext} />
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header with Context Switcher */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <div>
                <h1 className="text-2xl font-bold text-begin-blue">{profile.child_name}'s Learning Profile</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>{profile.confidence_percentage}% Confidence</span>
                  <span>•</span>
                  <span>{profile.total_assessments} Assessment{profile.total_assessments !== 1 ? 's' : ''}</span>
                  {profile.scoring_version && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {profile.scoring_version}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* View Context Switcher */}
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewContext('combined')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewContext === 'combined'
                      ? 'bg-white text-begin-blue shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-1" />
                  Combined
                </button>
                {profile.parent_assessments > 0 && (
                  <button
                    onClick={() => setViewContext('parent')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewContext === 'parent'
                        ? 'bg-white text-begin-blue shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Home className="h-4 w-4 inline mr-1" />
                    Parent View
                  </button>
                )}
                {profile.teacher_assessments > 0 && (
                  <button
                    onClick={() => setViewContext('teacher')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewContext === 'teacher'
                        ? 'bg-white text-begin-blue shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    Teacher View
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="btn-begin-secondary"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button className="btn-begin-secondary">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Status */}
        <ProfileCompletionBanner profile={profile} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Personality Overview */}
          <div className="lg:col-span-2 space-y-8">
            <PersonalityOverview profile={profile} viewContext={viewContext} />
            {renderSkillsVisualization()}
            <ContextualRecommendations profile={profile} viewContext={viewContext} />
          </div>

          {/* Right Column - Data Sources & Insights */}
          <div className="space-y-6">
            <DataSourcesSummary profile={profile} />
            <ProgressiveInsights profile={profile} viewContext={viewContext} />
            <NextStepsCard profile={profile} viewContext={viewContext} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          profile={profile}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}

// Profile Completion Status Banner
function ProfileCompletionBanner({ profile }: { profile: ConsolidatedProfile }) {
  const needsMore = profile.completeness_percentage < 80
  
  if (!needsMore) return null

  return (
    <div className="bg-gradient-to-r from-begin-cyan to-begin-teal text-white rounded-card p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            🌟 Great start! Profile is {Math.round(profile.completeness_percentage)}% complete
          </h3>
          <p className="text-begin-cream opacity-90">
            {profile.parent_assessments === 0 && "Add a parent assessment to get home behavior insights. "}
            {profile.teacher_assessments === 0 && "Add a teacher assessment for classroom perspective. "}
          </p>
        </div>
        <div className="flex gap-3">
          {profile.parent_assessments === 0 && (
            <button className="bg-white text-begin-teal px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              <Home className="h-4 w-4 inline mr-2" />
              Parent Assessment
            </button>
          )}
          {profile.teacher_assessments === 0 && (
            <button className="bg-white text-begin-teal px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              <GraduationCap className="h-4 w-4 inline mr-2" />
              Teacher Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Personality Overview with context-aware content
function PersonalityOverview({ profile, viewContext }: { profile: ConsolidatedProfile; viewContext: string }) {
  const getContextualDescription = () => {
    const base = `${profile.child_name} is a ${profile.personality_label}`
    
    switch (viewContext) {
      case 'parent':
        return `${base}. At home, this means they likely thrive with activities that match their natural learning style and benefit from understanding their unique approach to challenges.`
      case 'teacher':
        return `${base}. In the classroom, this suggests they will respond best to teaching approaches that leverage their strengths while supporting their growth areas.`
      default:
        return `${base}. This learning style combines insights from both home and classroom observations to give a complete picture.`
    }
  }

  return (
    <div className="card-begin">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-begin-teal to-begin-cyan text-white rounded-full p-4">
          <Star className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-begin-blue mb-2">{profile.personality_label}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {profile.confidence_percentage}% Confidence
            </span>
            {profile.total_assessments > 1 && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {profile.total_assessments} Sources
              </span>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-gray-700 leading-relaxed">
        {getContextualDescription()}
      </p>
    </div>
  )
}

// 6C Radar Chart with contextual labels
function SixCRadarChart({ profile, viewContext }: { profile: ConsolidatedProfile; viewContext: string }) {
  const categories = [
    { key: 'Communication', icon: MessageCircle, color: 'text-blue-500' },
    { key: 'Collaboration', icon: Users, color: 'text-green-500' },
    { key: 'Content', icon: BookOpen, color: 'text-purple-500' },
    { key: 'Critical Thinking', icon: Brain, color: 'text-orange-500' },
    { key: 'Creative Innovation', icon: Palette, color: 'text-pink-500' },
    { key: 'Confidence', icon: Zap, color: 'text-yellow-500' }
  ]

  const getContextualLabel = (category: string, score: number) => {
    const strength = score >= 4 ? 'strength' : score >= 3 ? 'developing' : 'growth area'
    
    const contextLabels = {
      parent: {
        Communication: strength === 'strength' ? 'Expresses themselves clearly at home' : 'Working on home communication',
        Collaboration: strength === 'strength' ? 'Cooperates well in family activities' : 'Learning to share and cooperate',
        // ... add more contextual labels
      },
      teacher: {
        Communication: strength === 'strength' ? 'Participates actively in class discussions' : 'Building classroom communication skills',
        Collaboration: strength === 'strength' ? 'Works well in group activities' : 'Developing teamwork skills',
        // ... add more contextual labels
      }
    }

    return contextLabels[viewContext as keyof typeof contextLabels]?.[category] || `${category}: ${strength}`
  }

  return (
    <div className="card-begin">
      <h3 className="text-xl font-semibold text-begin-blue mb-6">Learning Strengths Profile</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map(({ key, icon: Icon, color }) => {
          const score = profile.consolidated_scores[key] || 0
          const percentage = (score / 5) * 100
          
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="font-medium text-gray-900">{key}</span>
                <span className="text-sm text-gray-500 ml-auto">{score.toFixed(1)}/5</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-begin-teal to-begin-cyan h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {viewContext !== 'combined' && (
                <p className="text-sm text-gray-600">
                  {getContextualLabel(key, score)}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Context-specific recommendations
function ContextualRecommendations({ profile, viewContext }: { profile: ConsolidatedProfile; viewContext: string }) {
  const getRecommendations = () => {
    switch (viewContext) {
      case 'parent':
        return {
          title: 'Home Learning Strategies',
          icon: Home,
          recommendations: [
            'Create a consistent homework routine that matches their natural energy patterns',
            'Use hands-on activities to reinforce school learning',
            'Encourage their natural curiosity with open-ended questions',
            'Set up learning spaces that minimize distractions'
          ]
        }
      case 'teacher':
        return {
          title: 'Classroom Strategies',
          icon: GraduationCap,
          recommendations: [
            'Incorporate their preferred learning modalities into lessons',
            'Group them strategically based on their collaboration style',
            'Provide choices in how they demonstrate understanding',
            'Use their interests to make content more engaging'
          ]
        }
      default:
        return {
          title: 'Learning Recommendations',
          icon: Star,
          recommendations: [
            'Balance independent and collaborative learning opportunities',
            'Connect home and school learning with consistent approaches',
            'Leverage their top strengths while supporting growth areas',
            'Regular communication between home and school about progress'
          ]
        }
    }
  }

  const { title, icon: Icon, recommendations } = getRecommendations()

  return (
    <div className="card-begin">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-6 w-6 text-begin-teal" />
        <h3 className="text-xl font-semibold text-begin-blue">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="bg-begin-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <p className="text-gray-700">{rec}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Data sources summary
function DataSourcesSummary({ profile }: { profile: ConsolidatedProfile }) {
  const dataSources = profile.data_sources || []

  return (
    <div className="card-begin">
      <h3 className="text-lg font-semibold text-begin-blue mb-4">Assessment Sources</h3>
      
      <div className="space-y-3">
        {dataSources.map((source, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {source.respondent_type === 'parent' ? (
                <Home className="h-4 w-4 text-begin-teal" />
              ) : (
                <GraduationCap className="h-4 w-4 text-begin-cyan" />
              )}
              <div>
                <p className="font-medium text-sm capitalize">
                  {source.respondent_type} Assessment
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(source.contributed_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-begin-teal">
                +{source.confidence_contribution}%
              </p>
              <p className="text-xs text-gray-500">confidence</p>
            </div>
          </div>
        ))}
        
        {dataSources.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No assessment sources found
          </p>
        )}
      </div>
    </div>
  )
}

// Progressive insights based on multiple assessments
function ProgressiveInsights({ profile, viewContext }: { profile: ConsolidatedProfile; viewContext: string }) {
  const hasMultipleSources = profile.total_assessments > 1
  
  if (!hasMultipleSources) {
    return (
      <div className="card-begin">
        <h3 className="text-lg font-semibold text-begin-blue mb-4">Progressive Insights</h3>
        <div className="text-center py-6">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Add more assessments to see comparative insights
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-begin">
      <h3 className="text-lg font-semibold text-begin-blue mb-4">Progressive Insights</h3>
      
      <div className="space-y-4">
        {profile.parent_assessments > 0 && profile.teacher_assessments > 0 && (
          <div className="p-4 bg-begin-teal/5 rounded-lg border border-begin-teal/20">
            <h4 className="font-medium text-begin-teal mb-2">Home-School Consistency</h4>
            <p className="text-sm text-gray-700">
              Behaviors observed at home and school show strong alignment, 
              indicating consistent learning patterns across environments.
            </p>
          </div>
        )}
        
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-700 mb-2">Profile Confidence</h4>
          <p className="text-sm text-gray-700">
            With {profile.total_assessments} assessment{profile.total_assessments !== 1 ? 's' : ''}, 
            this profile has {profile.confidence_percentage}% confidence level.
          </p>
        </div>
      </div>
    </div>
  )
}

// Next steps based on current profile state
function NextStepsCard({ profile, viewContext }: { profile: ConsolidatedProfile; viewContext: string }) {
  const getNextSteps = () => {
    const steps = []
    
    if (profile.parent_assessments === 0) {
      steps.push('Complete parent home behavior assessment')
    }
    
    if (profile.teacher_assessments === 0) {
      steps.push('Request teacher classroom assessment')
    }
    
    if (profile.confidence_percentage < 75) {
      steps.push('Add additional assessment perspectives')
    }
    
    steps.push('Share profile with relevant educators')
    steps.push('Schedule follow-up assessment in 3-6 months')
    
    return steps.slice(0, 3) // Show top 3 steps
  }

  const nextSteps = getNextSteps()

  return (
    <div className="card-begin">
      <h3 className="text-lg font-semibold text-begin-blue mb-4">Next Steps</h3>
      
      <div className="space-y-3">
        {nextSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 bg-begin-teal rounded-full" />
            <p className="text-sm text-gray-700">{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading and error states
function LoadingView() {
  return (
    <div className="min-h-screen bg-begin-cream flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4" />
        <p className="text-begin-blue">Loading profile...</p>
      </div>
    </div>
  )
}

function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-begin-cream flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
        <p className="text-gray-600 mb-6">The learning profile you're looking for doesn't exist or has been removed.</p>
        <button className="btn-begin-primary" onClick={() => window.location.href = '/'}>
          Return Home
        </button>
      </div>
    </div>
  )
}

// CLP 2.0 Skills Visualization Component
function CLP2SkillsVisualization({ profile, viewContext }: { profile: ConsolidatedProfile; viewContext: string }) {
  const clp2Skills = [
    { key: 'Communication', icon: MessageCircle, color: 'text-blue-500', description: 'Expressing ideas clearly and listening actively' },
    { key: 'Collaboration', icon: Users, color: 'text-green-500', description: 'Working effectively with others' },
    { key: 'Content', icon: BookOpen, color: 'text-purple-500', description: 'Understanding and applying knowledge' },
    { key: 'Critical Thinking', icon: Brain, color: 'text-orange-500', description: 'Analyzing and evaluating information' },
    { key: 'Creative Innovation', icon: Palette, color: 'text-pink-500', description: 'Generating original ideas and solutions' },
    { key: 'Confidence', icon: Zap, color: 'text-yellow-500', description: 'Self-assurance in learning and challenges' },
    { key: 'Literacy', icon: BookOpen, color: 'text-indigo-500', description: 'Reading, writing, and language skills' },
    { key: 'Math', icon: Target, color: 'text-red-500', description: 'Mathematical reasoning and problem-solving' }
  ]

  const scores = profile.consolidated_scores as CLP2Scores
  
  return (
    <div className="card-begin">
      <h3 className="text-xl font-semibold text-begin-blue mb-6 flex items-center gap-2">
        <Star className="h-6 w-6 text-begin-teal" />
        CLP 2.0 Skills Profile
        <span className="text-sm font-normal text-gray-500 ml-2">(0-3 Point Scale)</span>
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {clp2Skills.map(({ key, icon: Icon, color, description }) => {
          const score = scores[key as keyof CLP2Scores] || 0
          const percentage = (score / 3) * 100
          const level = score >= 2.5 ? 'Strong' : score >= 1.5 ? 'Developing' : score >= 0.5 ? 'Emerging' : 'Beginning'
          
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{key}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-begin-teal">{score.toFixed(1)}/3</span>
                      <span className="text-xs text-gray-500 ml-2">{level}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{description}</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-begin-teal to-begin-cyan h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {viewContext !== 'combined' && (
                <p className="text-xs text-gray-600">
                  {getCLP2ContextualInsight(key, score, viewContext)}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Legacy Skills Visualization for backward compatibility
function LegacySkillsVisualization({ profile, viewContext }: { profile: ConsolidatedProfile; viewContext: string }) {
  const categories = [
    { key: 'Communication', icon: MessageCircle, color: 'text-blue-500' },
    { key: 'Collaboration', icon: Users, color: 'text-green-500' },
    { key: 'Content', icon: BookOpen, color: 'text-purple-500' },
    { key: 'Critical Thinking', icon: Brain, color: 'text-orange-500' },
    { key: 'Creative Innovation', icon: Palette, color: 'text-pink-500' },
    { key: 'Confidence', icon: Zap, color: 'text-yellow-500' }
  ]

  return (
    <div className="card-begin">
      <h3 className="text-xl font-semibold text-begin-blue mb-6">Learning Strengths Profile (Legacy)</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map(({ key, icon: Icon, color }) => {
          const score = profile.consolidated_scores[key] || 0
          const percentage = (score / 5) * 100
          
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="font-medium text-gray-900">{key}</span>
                <span className="text-sm text-gray-500 ml-auto">{score.toFixed(1)}/5</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-begin-teal to-begin-cyan h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper function for CLP 2.0 contextual insights
function getCLP2ContextualInsight(skill: string, score: number, viewContext: string): string {
  const level = score >= 2.5 ? 'strong' : score >= 1.5 ? 'developing' : score >= 0.5 ? 'emerging' : 'beginning'
  
  const contextInsights: Record<string, Record<string, string>> = {
    parent: {
      Communication: level === 'strong' ? 'Expresses themselves clearly during family conversations' : 'Growing communication skills at home',
      Collaboration: level === 'strong' ? 'Works well with siblings and family activities' : 'Learning to cooperate in family settings',
      Content: level === 'strong' ? 'Shows strong interest in learning new things' : 'Building foundational knowledge at home',
      'Critical Thinking': level === 'strong' ? 'Asks thoughtful questions and analyzes situations' : 'Developing reasoning skills',
      'Creative Innovation': level === 'strong' ? 'Demonstrates creativity in play and problem-solving' : 'Exploring creative expression',
      Confidence: level === 'strong' ? 'Shows self-assurance in trying new things' : 'Building confidence through encouragement',
      Literacy: level === 'strong' ? 'Strong reading and writing skills for their age' : 'Developing literacy foundations',
      Math: level === 'strong' ? 'Enjoys mathematical thinking and problem-solving' : 'Building mathematical understanding'
    },
    teacher: {
      Communication: level === 'strong' ? 'Participates actively in class discussions' : 'Working on classroom communication',
      Collaboration: level === 'strong' ? 'Excellent teamwork in group activities' : 'Learning collaborative skills',
      Content: level === 'strong' ? 'Grasps academic content effectively' : 'Building subject knowledge',
      'Critical Thinking': level === 'strong' ? 'Shows analytical thinking in assignments' : 'Developing critical analysis',
      'Creative Innovation': level === 'strong' ? 'Brings original ideas to projects' : 'Exploring creative approaches',
      Confidence: level === 'strong' ? 'Self-assured in academic challenges' : 'Growing academic confidence',
      Literacy: level === 'strong' ? 'Reading and writing above grade level' : 'Meeting literacy milestones',
      Math: level === 'strong' ? 'Strong mathematical reasoning abilities' : 'Progressing in math skills'
    }
  }
  
  return contextInsights[viewContext]?.[skill] || `${skill}: ${level} level`
}

// Share modal component
function ShareModal({ profile, onClose }: { profile: ConsolidatedProfile; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-begin-blue mb-4">Share Learning Profile</h3>
        
        <div className="space-y-4">
          <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-begin-teal" />
              <div>
                <p className="font-medium">Share with Teacher</p>
                <p className="text-sm text-gray-500">Secure teacher access link</p>
              </div>
            </div>
          </button>
          
          <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-begin-cyan" />
              <div>
                <p className="font-medium">Share with Family</p>
                <p className="text-sm text-gray-500">Family-friendly view</p>
              </div>
            </div>
          </button>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-begin-secondary">
            Cancel
          </button>
          <button className="flex-1 btn-begin-primary">
            Generate Link
          </button>
        </div>
      </div>
    </div>
  )
}