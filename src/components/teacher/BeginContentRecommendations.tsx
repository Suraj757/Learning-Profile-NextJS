// Begin content recommendations component for teachers
'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Play, Users, Home, Star, Clock, Target, Sparkles, ExternalLink } from 'lucide-react'
import { BeginContent, ContentRecommendations, beginContentService } from '@/lib/content-recommendation-service'
import { LearningProfile } from '@/lib/types'

interface BeginContentRecommendationsProps {
  learningProfile: LearningProfile
  studentName: string
  context?: 'day1-kit' | 'student-card' | 'parent-update'
  showCategory?: 'all' | 'teacher' | 'parent' | 'student'
}

export default function BeginContentRecommendations({
  learningProfile,
  studentName,
  context = 'day1-kit',
  showCategory = 'all'
}: BeginContentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ContentRecommendations | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'teacher' | 'parent' | 'student'>('teacher')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [learningProfile])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const recs = await beginContentService.getPersonalizedRecommendations(
        learningProfile,
        activeTab
      )
      
      setRecommendations(recs)
    } catch (err) {
      console.error('Error loading Begin content recommendations:', err)
      setError('Failed to load content recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getContentIcon = (category: string) => {
    switch (category) {
      case 'game': return <Play className="h-4 w-4" />
      case 'activity': return <Target className="h-4 w-4" />
      case 'book': return <BookOpen className="h-4 w-4" />
      case 'video': return <Play className="h-4 w-4" />
      case 'worksheet': return <BookOpen className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const ContentCard = ({ content, showContext = false }: { content: BeginContent, showContext?: boolean }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getContentIcon(content.category)}
          <h4 className="font-semibold text-gray-900 text-sm">{content.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(content.difficulty)}`}>
            {content.difficulty}
          </span>
          {content.recommendationScore && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {content.recommendationScore}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{content.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {content.duration}
          </span>
          <span className="capitalize">{content.category}</span>
          <span>{content.ageRange}</span>
        </div>
      </div>
      
      {showContext && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
          <p className="text-xs text-blue-800">
            <strong>Why this works for {studentName}:</strong> {content.alignmentReason}
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-1 mb-3">
        {content.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {tag}
          </span>
        ))}
        {content.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            +{content.tags.length - 3}
          </span>
        )}
      </div>
      
      <button className="w-full bg-begin-teal hover:bg-begin-teal/90 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
        <ExternalLink className="h-3 w-3" />
        View in Begin
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-begin-teal rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-begin-blue">Begin Content Recommendations</h3>
            <p className="text-sm text-gray-600">Loading personalized content for {studentName}...</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-20 bg-white/50 rounded-lg mb-3"></div>
          <div className="h-20 bg-white/50 rounded-lg mb-3"></div>
          <div className="h-20 bg-white/50 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error || !recommendations) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-bold text-red-800">Content Recommendations Unavailable</h3>
        </div>
        <p className="text-sm text-red-600">{error || 'Unable to load Begin content recommendations'}</p>
      </div>
    )
  }

  const tabConfig = [
    {
      key: 'teacher' as const,
      label: 'For Teachers',
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      key: 'parent' as const,
      label: 'For Parents',
      icon: <Home className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      key: 'student' as const,
      label: 'For Students',
      icon: <Star className="h-4 w-4" />,
      color: 'text-purple-600'
    }
  ]

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'teacher':
        return [
          { title: 'Classroom Activities', items: recommendations.forTeachers.classroomActivities },
          { title: 'Individual Supports', items: recommendations.forTeachers.individualSupports },
          { title: 'Intervention Resources', items: recommendations.forTeachers.interventionResources }
        ]
      case 'parent':
        return [
          { title: 'Home Activities', items: recommendations.forParents.homeActivities },
          { title: 'Skill Builders', items: recommendations.forParents.skillBuilders },
          { title: 'Family Projects', items: recommendations.forParents.familyProjects }
        ]
      case 'student':
        return [
          { title: 'Engagement Hooks', items: recommendations.forStudents.engagementHooks },
          { title: 'Strength Builders', items: recommendations.forStudents.strengthBuilders },
          { title: 'Challenge Activities', items: recommendations.forStudents.challengeActivities }
        ]
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-begin-teal rounded-full flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-begin-blue">Begin Content Recommendations</h3>
          <p className="text-sm text-gray-600">
            Personalized content for <strong>{studentName}</strong> ({learningProfile.personality_label})
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      {showCategory === 'all' && (
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-begin-teal text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-6">
        {getCurrentContent().map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold text-begin-blue mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-begin-teal rounded-full"></div>
              {section.title}
              <span className="text-sm text-gray-500">({section.items.length})</span>
            </h4>
            
            {section.items.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((content, itemIndex) => (
                  <ContentCard 
                    key={content.id} 
                    content={content} 
                    showContext={context === 'day1-kit' && itemIndex === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white/50 border border-gray-200 rounded-lg p-6 text-center">
                <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No recommendations available for this category</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Powered by Begin Content Engine</span>
          <span>Based on {studentName}'s learning profile</span>
        </div>
      </div>
    </div>
  )
}