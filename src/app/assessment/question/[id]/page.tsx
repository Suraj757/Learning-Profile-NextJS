'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, ArrowRight, CheckCircle, Sparkles, Star, Heart } from 'lucide-react'
import { QUESTIONS, PARENT_SCALE, PROGRESS_MESSAGES, CATEGORY_METADATA } from '@/lib/questions'

export default function QuestionPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = parseInt(params.id as string)
  const [childName, setChildName] = useState('')
  const [selectedValue, setSelectedValue] = useState<number | null>(null)
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  const question = QUESTIONS.find(q => q.id === questionId)
  const totalQuestions = QUESTIONS.length
  const progress = (questionId / totalQuestions) * 100
  const categoryInfo = question ? CATEGORY_METADATA[question.category] : null
  const progressMessage = PROGRESS_MESSAGES.find(p => p.at === questionId)
  
  // Celebrate milestones
  const [showCelebration, setShowCelebration] = useState(false)
  
  useEffect(() => {
    if (progressMessage) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [progressMessage])

  useEffect(() => {
    // Load child name and existing responses from sessionStorage
    const name = sessionStorage.getItem('childName')
    const savedResponses = sessionStorage.getItem('assessmentResponses')
    
    if (!name) {
      router.push('/assessment/start')
      return
    }
    
    setChildName(name)
    
    if (savedResponses) {
      const parsedResponses = JSON.parse(savedResponses)
      setResponses(parsedResponses)
      // Set current question's response if it exists
      if (parsedResponses[questionId]) {
        setSelectedValue(parsedResponses[questionId])
      }
    }
  }, [questionId, router])

  const handleNext = () => {
    if (selectedValue === null) return
    
    // Save response
    const updatedResponses = { ...responses, [questionId]: selectedValue }
    setResponses(updatedResponses)
    sessionStorage.setItem('assessmentResponses', JSON.stringify(updatedResponses))
    
    // Navigate to next question or completion
    if (questionId < totalQuestions) {
      router.push(`/assessment/question/${questionId + 1}`)
    } else {
      router.push('/assessment/complete')
    }
  }

  const handlePrevious = () => {
    if (questionId > 1) {
      router.push(`/assessment/question/${questionId - 1}`)
    }
  }

  // Debug function to auto-complete the quiz
  const autoCompleteQuiz = (profileType: 'creative' | 'analytical' | 'collaborative' | 'confident') => {
    const testResponses = {
      creative: { 1: 5, 2: 4, 3: 5, 4: 3, 5: 5, 6: 4, 7: 3, 8: 4, 9: 5, 10: 4, 11: 3, 12: 5, 13: 4, 14: 3, 15: 4, 16: 5, 17: 4, 18: 3, 19: 4, 20: 5, 21: 4, 22: 3, 23: 4, 24: 5 },
      analytical: { 1: 3, 2: 5, 3: 2, 4: 5, 5: 3, 6: 5, 7: 4, 8: 5, 9: 3, 10: 4, 11: 5, 12: 3, 13: 5, 14: 4, 15: 5, 16: 3, 17: 5, 18: 4, 19: 5, 20: 3, 21: 5, 22: 4, 23: 5, 24: 3 },
      collaborative: { 1: 4, 2: 3, 3: 5, 4: 4, 5: 4, 6: 3, 7: 5, 8: 3, 9: 4, 10: 5, 11: 3, 12: 4, 13: 3, 14: 5, 15: 3, 16: 4, 17: 3, 18: 5, 19: 3, 20: 4, 21: 3, 22: 5, 23: 3, 24: 4 },
      confident: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4, 11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4, 21: 4, 22: 4, 23: 4, 24: 4 }
    }

    const selectedResponses = testResponses[profileType]
    setResponses(selectedResponses)
    sessionStorage.setItem('assessmentResponses', JSON.stringify(selectedResponses))
    router.push('/assessment/complete')
  }

  if (!question) {
    return <div>Question not found</div>
  }

  const questionText = question.text.replace('[name]', childName)
  const encouragingIntro = question.encouragingIntro?.replace('[name]', childName)
  const questionExample = question.example?.replace('[name]', childName)

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
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Question {questionId} of {totalQuestions}
              </div>
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600"
              >
                🐛 Debug
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Progress Bar with Celebration */}
      <div className="bg-white border-b relative overflow-hidden">
        {showCelebration && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 animate-pulse" />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-begin-blue">
                  {childName}&apos;s Learning Journey
                </span>
                {categoryInfo && (
                  <span className="text-lg">{categoryInfo.emoji}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {Math.round(progress)}% Complete
                </span>
                {progress > 50 && <Star className="h-4 w-4 text-yellow-500" />}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-begin-teal to-begin-cyan h-3 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                )}
              </div>
            </div>
            {progressMessage && showCelebration && (
              <div className="mt-3 text-center animate-bounce">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  {progressMessage.message}
                </div>
                <p className="text-xs text-gray-500 mt-1">{progressMessage.subtext}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h3 className="text-sm font-bold text-yellow-800 mb-3">🧪 Auto-Complete Quiz</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => autoCompleteQuiz('creative')}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm font-medium text-blue-800"
              >
                🎨 Creative Profile
              </button>
              <button
                onClick={() => autoCompleteQuiz('analytical')}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 rounded text-sm font-medium text-green-800"
              >
                🧠 Analytical Profile
              </button>
              <button
                onClick={() => autoCompleteQuiz('collaborative')}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded text-sm font-medium text-purple-800"
              >
                🤝 Collaborative Profile
              </button>
              <button
                onClick={() => autoCompleteQuiz('confident')}
                className="px-4 py-2 bg-orange-100 hover:bg-orange-200 rounded text-sm font-medium text-orange-800"
              >
                💪 Confident Profile
              </button>
            </div>
            
            <div className="mt-3 text-xs text-yellow-700">
              💡 <strong>Click any button above to instantly complete the quiz</strong> and see different learning profile results
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-begin p-6 lg:p-8 transform hover:shadow-lg transition-shadow duration-300">
          {/* Enhanced Category Badge */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium ${categoryInfo?.lightColor} ${categoryInfo?.color.replace('bg-', 'text-')} shadow-sm`}>
              <span className="text-lg">{categoryInfo?.emoji}</span>
              <span>{question.category}</span>
              <span className="text-xs opacity-75">({questionId}/24)</span>
            </div>
          </div>

          {/* Encouraging Introduction */}
          {encouragingIntro && (
            <div className="text-center mb-4">
              <p className="text-lg font-medium text-begin-blue animate-fade-in">
                {encouragingIntro}
              </p>
            </div>
          )}

          {/* Main Question */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-begin-blue/5 to-begin-teal/5 p-6 rounded-2xl border border-begin-blue/10">
              <p className="text-begin-body text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                {questionText}
              </p>
              {questionExample && (
                <p className="text-sm text-gray-500 mt-3 italic">
                  {questionExample}
                </p>
              )}
            </div>
          </div>

          {/* Enhanced Response Options */}
          <div className="space-y-3 mb-8">
            {PARENT_SCALE.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedValue(option.value)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-md ${
                  selectedValue === option.value
                    ? 'border-begin-teal bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 text-begin-teal shadow-lg scale-[1.02]'
                    : 'border-gray-200 hover:border-begin-teal/50 hover:bg-begin-teal/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{option.emoji}</span>
                    <div>
                      <span className="font-semibold">{option.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                  </div>
                  {selectedValue === option.value && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-begin-teal rounded-full flex items-center justify-center animate-pulse">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Enhanced Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={questionId === 1}
              className="btn-begin-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 transition-transform duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-500 mb-1">
                Question {questionId} of {totalQuestions}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => {
                  const dotIndex = Math.floor((i * totalQuestions) / 10)
                  return (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        questionId > dotIndex ? 'bg-begin-teal' : 'bg-gray-200'
                      }`}
                    />
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={selectedValue === null}
              className={`btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform transition-all duration-200 ${
                selectedValue !== null ? 'hover:scale-105 shadow-lg hover:shadow-xl' : ''
              } ${
                questionId === totalQuestions ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''
              }`}
            >
              {questionId === totalQuestions ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Complete Profile! 🎉
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Help Text */}
        <div className="text-center mt-6">
          <div className="bg-begin-cream/50 p-4 rounded-2xl border border-begin-cyan/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-begin-teal" />
              <span className="text-sm font-medium text-begin-blue">Helpful Tip</span>
            </div>
            <p className="text-sm text-gray-600">
              Think about how often you see this at home, school, or during activities. 
              There are no wrong answers - every child is unique! ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}