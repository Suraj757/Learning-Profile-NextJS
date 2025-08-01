'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Star, Users, Brain, Palette, MessageSquare, TrendingUp, Eye, Play, Filter, Grid, List, ChevronRight, Sparkles, Award, Target, ArrowRight } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { SampleProfile } from '@/lib/sample-profiles'

interface APIResponse {
  profiles: SampleProfile[]
  total: number
  availableGrades?: string[]
  availablePersonalities?: string[]
}

export default function DemoGalleryPage() {
  const [profiles, setProfiles] = useState<SampleProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [selectedPersonality, setSelectedPersonality] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [availableGrades, setAvailableGrades] = useState<string[]>([])
  const [availablePersonalities, setAvailablePersonalities] = useState<string[]>([])

  useEffect(() => {
    fetchProfiles()
  }, [selectedGrade, selectedPersonality])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedGrade !== 'all') {
        params.append('grade', selectedGrade)
      }
      if (selectedPersonality !== 'all') {
        params.append('personality', selectedPersonality)
      }

      const response = await fetch(`/api/sample-profiles?${params}`)
      const data: APIResponse = await response.json()
      
      setProfiles(data.profiles)
      if (data.availableGrades) setAvailableGrades(data.availableGrades)
      if (data.availablePersonalities) setAvailablePersonalities(data.availablePersonalities)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPersonalityIcon = (personality: string) => {
    if (personality.includes('Creative')) return Palette
    if (personality.includes('Social') || personality.includes('Collaborator')) return Users
    if (personality.includes('Analytical') || personality.includes('Scholar')) return Brain
    if (personality.includes('Leader')) return Award
    if (personality.includes('Explorer') || personality.includes('Independent')) return Target
    return Star
  }

  const getPersonalityColor = (personality: string) => {
    if (personality.includes('Creative')) return 'from-pink-500 to-purple-500'
    if (personality.includes('Social') || personality.includes('Collaborator')) return 'from-green-500 to-emerald-500'
    if (personality.includes('Analytical') || personality.includes('Scholar')) return 'from-blue-500 to-indigo-500'
    if (personality.includes('Leader')) return 'from-yellow-500 to-orange-500'
    if (personality.includes('Explorer') || personality.includes('Independent')) return 'from-teal-500 to-cyan-500'
    return 'from-purple-500 to-indigo-500'
  }

  const getTopStrengths = (scores: Record<string, number>) => {
    return Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category)
  }

  const ProfileCard = ({ profile }: { profile: SampleProfile }) => {
    const IconComponent = getPersonalityIcon(profile.personalityLabel)
    const gradientColor = getPersonalityColor(profile.personalityLabel)
    const topStrengths = getTopStrengths(profile.scores)
    
    // Prepare radar chart data
    const radarData = Object.entries(profile.scores).map(([category, score]) => ({
      category: category.length > 10 ? category.split(' ')[0] : category,
      score: score,
      fullMark: 5
    }))

    if (viewMode === 'list') {
      return (
        <div className="card-begin p-6 hover:shadow-lg transition-all duration-300 border border-gray-200">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-begin-blue mb-1">{profile.childName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{profile.grade}</span>
                    <span>•</span>
                    <span>{profile.personalityLabel}</span>
                  </div>
                </div>
                <Link 
                  href={`/demo/${profile.id}`}
                  className="btn-begin-primary text-sm flex items-center gap-2"
                >
                  View Profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              <p className="text-gray-700 mb-4 line-clamp-2">{profile.description}</p>
              
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">TOP STRENGTHS</p>
                  <div className="flex gap-2">
                    {topStrengths.map(strength => (
                      <span key={strength} className="px-2 py-1 bg-begin-teal/10 text-begin-teal text-xs rounded-full font-medium">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="h-20 w-20 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" tick={false} />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} />
                      <Radar 
                        name="Score" 
                        dataKey="score" 
                        stroke="#007A72" 
                        fill="#007A72" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="card-begin p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="text-center mb-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-begin-blue mb-1">{profile.childName}</h3>
          <div className="text-sm text-gray-600 mb-2">{profile.grade}</div>
          <div className="text-sm font-medium text-begin-teal mb-3">{profile.personalityLabel}</div>
        </div>
        
        <div className="h-32 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fontSize: 10, fill: '#666' }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} />
              <Radar 
                name="Score" 
                dataKey="score" 
                stroke="#007A72" 
                fill="#007A72" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{profile.description}</p>
        
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">TOP STRENGTHS</p>
          <div className="flex flex-wrap gap-1">
            {topStrengths.map(strength => (
              <span key={strength} className="px-2 py-1 bg-begin-teal/10 text-begin-teal text-xs rounded-full">
                {strength.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
        
        <Link 
          href={`/demo/${profile.id}`}
          className="btn-begin-primary w-full text-sm flex items-center justify-center gap-2 group-hover:bg-begin-teal transition-colors"
        >
          View Full Profile
          <Eye className="h-4 w-4" />
        </Link>
      </div>
    )
  }

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
            <Link href="/assessment/start" className="btn-begin-primary">
              Create Your Profile
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-begin-blue to-begin-teal rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">
                Explore Sample Learning Profiles
              </h1>
              <p className="text-xl text-white/90 mb-6">
                See real examples of how different children learn and discover what insights await your child
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Sparkles className="h-5 w-5" />
                <span>Based on the research-backed 6C Framework</span>
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-begin-teal/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-begin-teal" />
              </div>
              <h3 className="font-bold text-begin-blue mb-2">Real Examples</h3>
              <p className="text-sm text-gray-600">Authentic profiles from diverse learners</p>
            </div>
            <div className="text-center">
              <div className="bg-begin-cyan/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-begin-cyan" />
              </div>
              <h3 className="font-bold text-begin-blue mb-2">Actionable Insights</h3>
              <p className="text-sm text-gray-600">Specific strategies parents can use today</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-begin-blue mb-2">Growth Plans</h3>
              <p className="text-sm text-gray-600">Month-by-month development roadmaps</p>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filter by:</span>
            </div>
            
            <select 
              value={selectedGrade} 
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-begin-teal focus:border-transparent"
            >
              <option value="all">All Grades</option>
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            
            <select 
              value={selectedPersonality} 
              onChange={(e) => setSelectedPersonality(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-begin-teal focus:border-transparent"
            >
              <option value="all">All Learning Types</option>
              {availablePersonalities.map(personality => (
                <option key={personality} value={personality}>{personality}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-begin-teal text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-begin-teal text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sample profiles...</p>
          </div>
        )}

        {/* Profiles Grid */}
        {!loading && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-begin-blue">
                Sample Learning Profiles ({profiles.length})
              </h2>
              {(selectedGrade !== 'all' || selectedPersonality !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedGrade('all')
                    setSelectedPersonality('all')
                  }}
                  className="text-sm text-begin-teal hover:text-begin-blue transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className={
              viewMode === 'grid' 
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
            }>
              {profiles.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>

            {profiles.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No profiles found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or browse all profiles</p>
                <button
                  onClick={() => {
                    setSelectedGrade('all')
                    setSelectedPersonality('all')
                  }}
                  className="btn-begin-secondary"
                >
                  Show All Profiles
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="card-begin p-8 bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-begin-blue mb-4">
              Ready to Discover Your Child's Learning Profile?
            </h3>
            <p className="text-gray-600 mb-6">
              Create a personalized learning profile for your child with our research-backed assessment. 
              It takes just 10 minutes and provides insights you can use immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment/start" className="btn-begin-primary flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Assessment (10 min)
              </Link>
              <Link href="/" className="btn-begin-secondary flex items-center gap-2">
                Learn More
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}