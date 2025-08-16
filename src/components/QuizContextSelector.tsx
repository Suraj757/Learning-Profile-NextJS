'use client'
import { useState } from 'react'
import { Home, School, Users, Clock, CheckCircle, Info } from 'lucide-react'
import { getParentQuizQuestions, getTeacherQuizQuestions, getSkillCoverage } from '@/lib/multi-quiz-system'

interface QuizContextSelectorProps {
  onContextSelect: (context: {
    quizType: 'parent_home' | 'teacher_classroom' | 'general'
    ageGroup: '3-4' | '4-5' | '5+' | '6+'
    questionCount: number
    estimatedTime: number
  }) => void
  ageGroup: '3-4' | '4-5' | '5+' | '6+' 
  className?: string
}

export function QuizContextSelector({ onContextSelect, ageGroup, className = '' }: QuizContextSelectorProps) {
  const [selectedContext, setSelectedContext] = useState<'parent_home' | 'teacher_classroom' | 'general' | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  
  // Get quiz configurations
  const parentQuiz = getParentQuizQuestions(ageGroup)
  const teacherQuiz = getTeacherQuizQuestions(ageGroup)
  const parentCoverage = getSkillCoverage('parent_home')
  const teacherCoverage = getSkillCoverage('teacher_classroom')
  
  const contexts = [
    {
      id: 'parent_home' as const,
      title: 'Parent Assessment',
      subtitle: 'Home & Family Context',
      icon: Home,
      description: 'Focus on behavior, learning, and development at home',
      questionCount: parentQuiz.questionCount,
      estimatedTime: Math.ceil(parentQuiz.questionCount * 0.75), // 45 seconds per question
      includes: ['Home behavior', 'Family interactions', 'Learning preferences', 'Academic interests'],
      skillFocus: 'Communication, Creativity, Academic foundations',
      color: 'border-pink-200 bg-pink-50',
      iconColor: 'text-pink-600',
      buttonColor: 'bg-pink-600 hover:bg-pink-700',
      coverage: parentCoverage,
      benefits: [
        'Complete learning preferences profile',
        'Home-specific insights for parents',
        'Family activity recommendations',
        'Comprehensive 19-question assessment'
      ]
    },
    {
      id: 'teacher_classroom' as const,
      title: 'Teacher Assessment', 
      subtitle: 'Classroom & Academic Context',
      icon: School,
      description: 'Focus on classroom behavior and academic performance',
      questionCount: teacherQuiz.questionCount,
      estimatedTime: Math.ceil(teacherQuiz.questionCount * 0.6), // 36 seconds per question (teachers are faster)
      includes: ['Classroom behavior', 'Peer interactions', 'Academic performance', 'Group dynamics'],
      skillFocus: 'Collaboration, Content mastery, Academic skills',
      color: 'border-blue-200 bg-blue-50',
      iconColor: 'text-blue-600', 
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      coverage: teacherCoverage,
      benefits: [
        'Professional educator insights',
        'Classroom-specific recommendations',
        'Peer interaction assessment',
        'Focused 12-question assessment'
      ]
    },
    {
      id: 'general' as const,
      title: 'Complete Assessment',
      subtitle: 'Comprehensive Profile',
      icon: Users,
      description: 'Full CLP 2.0 assessment covering all contexts',
      questionCount: 28, // 24 skills + 4 preferences
      estimatedTime: 18, // ~40 seconds per question
      includes: ['All 8 CLP 2.0 skills', 'Complete preferences', 'Universal contexts', 'Comprehensive insights'],
      skillFocus: 'All 6Cs + Literacy + Math + Preferences',
      color: 'border-green-200 bg-green-50',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      coverage: [...new Set([...parentCoverage, ...teacherCoverage])], // Combined coverage
      benefits: [
        'Most comprehensive profile',
        'Works for any respondent type',
        'Complete skill and preference assessment',
        'Single assessment for full insights'
      ]
    }
  ]
  
  const handleContextSelect = (contextId: 'parent_home' | 'teacher_classroom' | 'general') => {
    const context = contexts.find(c => c.id === contextId)
    if (context) {
      setSelectedContext(contextId)
      onContextSelect({
        quizType: contextId,
        ageGroup,
        questionCount: context.questionCount,
        estimatedTime: context.estimatedTime
      })
    }
  }
  
  const getCoverageIcon = (coverage: 'full' | 'partial' | 'none') => {
    switch (coverage) {
      case 'full': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'partial': return <div className="h-4 w-4 rounded-full bg-yellow-400 border-2 border-yellow-600" />
      case 'none': return <div className="h-4 w-4 rounded-full bg-gray-300 border-2 border-gray-400" />
    }
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Assessment Context</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the context that best matches who is completing this assessment and what insights you're seeking.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {contexts.map((context) => (
          <div
            key={context.id}
            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedContext === context.id
                ? `${context.color} ring-2 ring-offset-2 ring-opacity-50`
                : `${context.color} hover:border-opacity-60`
            }`}
            onClick={() => handleContextSelect(context.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/80`}>
                  <context.icon className={`h-6 w-6 ${context.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{context.title}</h3>
                  <p className="text-sm text-gray-600">{context.subtitle}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetails(showDetails === context.id ? null : context.id)
                }}
                className="p-1 hover:bg-white/50 rounded transition-colors"
              >
                <Info className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-700 mb-4">{context.description}</p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{context.estimatedTime} min
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {context.questionCount} questions
              </span>
            </div>
            
            {/* Skill Focus */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-1">Primary Focus:</p>
              <p className="text-xs text-gray-600">{context.skillFocus}</p>
            </div>
            
            {/* Action Button */}
            <button
              className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${context.buttonColor}`}
              onClick={(e) => {
                e.stopPropagation()
                handleContextSelect(context.id)
              }}
            >
              {selectedContext === context.id ? 'Selected' : 'Choose This Assessment'}
            </button>
            
            {/* Detailed Information */}
            {showDetails === context.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                {/* What's Included */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">What's Included:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {context.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Benefits */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Benefits:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {context.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Skill Coverage */}
                {context.id !== 'general' && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Skill Coverage:</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {context.coverage.map((skill) => (
                        <div key={skill.skill} className="flex items-center gap-1">
                          {getCoverageIcon(skill.coverage)}
                          <span className={`${skill.coverage === 'none' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {skill.skill}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Full coverage
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-yellow-400 border border-yellow-600" />
                        Partial coverage
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Context Selection Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Need help choosing?</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Choose Parent Assessment if:</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• You're a parent or family member</li>
              <li>• You want home-specific insights</li>
              <li>• You need learning preferences</li>
              <li>• You want family activity recommendations</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Choose Teacher Assessment if:</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• You're an educator or teacher</li>
              <li>• You focus on classroom behavior</li>
              <li>• You need academic insights</li>
              <li>• You want a quick professional assessment</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Choose Complete Assessment if:</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• You want the most comprehensive profile</li>
              <li>• Multiple people will use the results</li>
              <li>• You're unsure about context</li>
              <li>• You want all insights available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizContextSelector