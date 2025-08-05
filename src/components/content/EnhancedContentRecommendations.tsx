'use client'
import { useState } from 'react'
import { Play, BookOpen, Globe, Code, Users, Clock, Star, ChevronRight, ExternalLink, Heart, Lightbulb, Target, Home } from 'lucide-react'
import { BeginContent } from '@/lib/content-recommendation-service'

interface EnhancedContentRecommendationsProps {
  recommendations: {
    topRecommendation: BeginContent
    strengthActivity: BeginContent
    growthActivity: BeginContent
    familyActivity: BeginContent
  }
  studentName: string
  learningProfile: string
}

const getAppIcon = (app: string) => {
  switch (app) {
    case 'CodeSpark': return <Code className="h-5 w-5" />
    case 'HOMER': return <BookOpen className="h-5 w-5" />
    case 'Little Passports': return <Globe className="h-5 w-5" />
    case 'Begin Parent Resources': return <Users className="h-5 w-5" />
    case 'Classroom Tools': return <Target className="h-5 w-5" />
    default: return <Play className="h-5 w-5" />
  }
}

const getAppColor = (app: string) => {
  switch (app) {
    case 'CodeSpark': return 'from-purple-500 to-blue-500'
    case 'HOMER': return 'from-green-500 to-teal-500'
    case 'Little Passports': return 'from-orange-500 to-red-500'
    case 'Begin Parent Resources': return 'from-pink-500 to-rose-500'
    case 'Classroom Tools': return 'from-indigo-500 to-purple-500'
    default: return 'from-gray-500 to-gray-600'
  }
}

const getDifficultyBadge = (difficulty: string) => {
  const colors = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-yellow-100 text-yellow-800', 
    'advanced': 'bg-red-100 text-red-800'
  }
  return colors[difficulty as keyof typeof colors] || colors.beginner
}

export default function EnhancedContentRecommendations({ 
  recommendations, 
  studentName, 
  learningProfile 
}: EnhancedContentRecommendationsProps) {
  const [selectedContent, setSelectedContent] = useState<BeginContent | null>(null)
  const [activeTab, setActiveTab] = useState<'parent' | 'teacher'>('parent')

  const ContentCard = ({ content, title, icon, description }: {
    content: BeginContent
    title: string
    icon: React.ReactNode
    description: string
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => setSelectedContent(content)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${getAppColor(content.app)} text-white`}>
            {getAppIcon(content.app)}
          </div>
          <div>
            <h3 className="font-semibold text-begin-blue">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(content.difficulty)}`}>
            {content.difficulty}
          </span>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium text-begin-blue mb-2">{content.title}</h4>
        <p className="text-sm text-gray-700 mb-3">{content.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {content.duration}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {content.educationalValue}/10
            </span>
          </div>
          <span className="text-begin-teal font-medium">{content.app}</span>
        </div>
      </div>

      <div className="bg-begin-cream/30 rounded-lg p-3 mb-3">
        <p className="text-xs text-begin-blue font-medium mb-1">Why this works for {studentName}:</p>
        <p className="text-xs text-gray-700">{content.alignmentReason}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {content.skillsFocused.slice(0, 3).map((skill, index) => (
            <span key={index} className="text-xs bg-begin-teal/10 text-begin-teal px-2 py-1 rounded-full">
              {skill}
            </span>
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-begin-blue mb-2">
          Personalized Learning Recommendations
        </h2>
        <p className="text-begin-blue/70">
          Based on {studentName}'s {learningProfile} learning profile
        </p>
      </div>

      {/* Audience Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('parent')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'parent' 
                ? 'bg-white text-begin-blue shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Home className="h-4 w-4 inline-block mr-2" />
            For Parents
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'teacher' 
                ? 'bg-white text-begin-blue shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Target className="h-4 w-4 inline-block mr-2" />
            For Teachers
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard
          content={recommendations.topRecommendation}
          title="🎯 Perfect Match"
          icon={<Star className="h-5 w-5" />}
          description="The best fit for this learning profile"
        />
        
        <ContentCard
          content={recommendations.strengthActivity}
          title="💪 Build on Strengths"
          icon={<Lightbulb className="h-5 w-5" />}
          description="Activities that leverage natural abilities"
        />
        
        <ContentCard
          content={recommendations.growthActivity}
          title="🌱 Growth Opportunities"
          icon={<Target className="h-5 w-5" />}
          description="Support areas for development"
        />
        
        <ContentCard
          content={recommendations.familyActivity}
          title="👨‍👩‍👧‍👦 Family Connection"
          icon={<Heart className="h-5 w-5" />}
          description="Activities to do together at home"
        />
      </div>

      {/* Detailed Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${getAppColor(selectedContent.app)} text-white`}>
                  {getAppIcon(selectedContent.app)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-begin-blue">{selectedContent.title}</h3>
                  <p className="text-begin-blue/70">{selectedContent.app}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-begin-blue mb-2">What This Gives Parents:</h4>
                <p className="text-sm text-gray-700 bg-pink-50 p-3 rounded-lg">{selectedContent.parentValue}</p>
              </div>
              <div>
                <h4 className="font-semibold text-begin-blue mb-2">What This Gives Teachers:</h4>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedContent.teacherValue}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-begin-blue mb-2">Why Kids Love It:</h4>
              <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">{selectedContent.studentEngagement}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-begin-blue mb-2">Skills Developed:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedContent.skillsFocused.map((skill, index) => (
                  <span key={index} className="bg-begin-teal/10 text-begin-teal px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-begin-blue mb-2">How to Get Started:</h4>
              <ul className="space-y-2">
                {selectedContent.implementationTips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-begin-teal font-bold">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {selectedContent.duration} • 
                <span className="font-medium"> Level:</span> {selectedContent.difficulty} • 
                <span className="font-medium"> Ages:</span> {selectedContent.ageRange}
              </div>
              <div className="flex gap-3">
                <button className="btn-begin-secondary text-sm">
                  Share with Family
                </button>
                <button className="btn-begin-primary text-sm flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Try Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}