'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Share, Download, Star, ArrowRight, Sparkles } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface ProfileData {
  id: string
  childName: string
  grade: string
  scores: Record<string, number>
  personalityLabel: string
  description: string
  createdAt: string
}

export default function ResultsPage() {
  const params = useParams()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from a database
    // For now, we'll get it from sessionStorage
    const latestProfile = sessionStorage.getItem('latestProfile')
    
    if (latestProfile) {
      const data = JSON.parse(latestProfile)
      setProfileData(data)
    }
    
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-begin-blue mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn&apos;t find this learning profile. It may have expired or been removed.</p>
          <Link href="/assessment/start" className="btn-begin-primary">
            Create New Profile
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

  // Begin product recommendations based on learning style
  const getRecommendations = (personalityLabel: string, scores: Record<string, number>) => {
    const recommendations = []
    
    if (scores['Creative Innovation'] >= 4) {
      recommendations.push({
        product: 'Begin Creative Arts Kit',
        description: 'Perfect for fostering creative expression and imaginative play',
        icon: '🎨'
      })
    }
    
    if (scores['Communication'] >= 4) {
      recommendations.push({
        product: 'Begin Storytelling App',
        description: 'Interactive stories that develop narrative and communication skills',
        icon: '📚'
      })
    }
    
    if (scores['Critical Thinking'] >= 4) {
      recommendations.push({
        product: 'Begin Logic Puzzles',
        description: 'Challenge problem-solving abilities with age-appropriate puzzles',
        icon: '🧩'
      })
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        product: 'Begin Learning Foundations',
        description: 'Comprehensive learning activities tailored to your child\'s profile',
        icon: '⭐'
      })
    }
    
    return recommendations
  }

  const recommendations = getRecommendations(profileData.personalityLabel, profileData.scores)

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
              <button className="btn-begin-secondary flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share
              </button>
              <button className="btn-begin-secondary flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card-begin p-8 mb-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-begin-blue to-begin-teal text-white rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
              <h1 className="text-begin-hero font-bold mb-2">
                {profileData.childName}&apos;s Learning Profile
              </h1>
              <div className="flex items-center justify-center gap-2 text-begin-body opacity-90">
                <Sparkles className="h-5 w-5" />
                <span>{profileData.personalityLabel}</span>
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-blue">{profileData.grade}</div>
                <div className="text-sm text-gray-600">Grade Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-teal">6C</div>
                <div className="text-sm text-gray-600">Framework</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-cyan">
                  {Object.values(profileData.scores).filter(score => score >= 4).length}
                </div>
                <div className="text-sm text-gray-600">Strengths</div>
              </div>
            </div>
          </div>

          <div className="bg-begin-cyan/5 p-6 rounded-2xl">
            <p className="text-begin-body text-gray-700 text-center leading-relaxed">
              {profileData.description}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
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
                          {score.toFixed(1)}/5.0
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

        {/* Recommendations */}
        <div className="card-begin p-8 mt-8">
          <h2 className="text-begin-heading font-bold text-begin-blue mb-6 text-center">
            Personalized Begin Learning Recommendations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-gradient-to-br from-begin-teal/5 to-begin-cyan/5 p-6 rounded-2xl border border-begin-teal/10">
                <div className="text-3xl mb-3">{rec.icon}</div>
                <h3 className="font-bold text-begin-blue mb-2">{rec.product}</h3>
                <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
                <button className="btn-begin-primary text-sm">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="card-begin p-8 mt-8">
          <h2 className="text-begin-heading font-bold text-begin-blue mb-6 text-center">
            Next Steps for {profileData.childName}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-begin-teal mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" />
                For Teachers
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Share this profile with {profileData.childName}&apos;s teacher before school starts</li>
                <li>• Discuss learning preferences during parent-teacher conferences</li>
                <li>• Request accommodations that align with their strengths</li>
                <li>• Monitor progress in developing areas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-begin-cyan mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                For Parents
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Incorporate Begin learning activities that match their profile</li>
                <li>• Encourage activities that build on their strengths</li>
                <li>• Provide gentle support in developing areas</li>
                <li>• Celebrate their unique learning style</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Link href="/assessment/start" className="btn-begin-primary flex items-center gap-2">
              Create Another Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}