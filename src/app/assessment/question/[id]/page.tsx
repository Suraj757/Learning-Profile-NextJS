'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { QUESTIONS, LIKERT_SCALE } from '@/lib/questions'

export default function QuestionPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = parseInt(params.id as string)
  const [childName, setChildName] = useState('')
  const [selectedValue, setSelectedValue] = useState<number | null>(null)
  const [responses, setResponses] = useState<Record<number, number>>({})

  const question = QUESTIONS.find(q => q.id === questionId)
  const totalQuestions = QUESTIONS.length
  const progress = (questionId / totalQuestions) * 100

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

  if (!question) {
    return <div>Question not found</div>
  }

  const questionText = question.text.replace('[name]', childName)

  // Updated scale for parent context
  const parentScale = [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Rarely' }, 
    { value: 3, label: 'Sometimes' },
    { value: 4, label: 'Often' },
    { value: 5, label: 'Always' }
  ]

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
            <div className="text-sm text-gray-600">
              Question {questionId} of {totalQuestions}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-begin-blue">
                {childName}&apos;s Learning Profile
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-begin-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-begin p-6 lg:p-8">
          {/* Category Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-begin-blue/10 text-begin-blue">
              {question.category}
            </span>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h1 className="text-begin-hero font-bold text-begin-blue mb-4">
              Question {questionId}
            </h1>
            <p className="text-begin-body text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {questionText}
            </p>
          </div>

          {/* Response Options */}
          <div className="space-y-3 mb-8">
            {parentScale.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedValue(option.value)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedValue === option.value
                    ? 'border-begin-teal bg-begin-teal/5 text-begin-teal'
                    : 'border-gray-200 hover:border-begin-teal/30 hover:bg-begin-teal/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {selectedValue === option.value && (
                    <CheckCircle className="h-5 w-5 text-begin-teal" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={questionId === 1}
              className="btn-begin-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              {questionId} of {totalQuestions}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedValue === null}
              className="btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {questionId === totalQuestions ? 'Complete' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Think about how often you observe this behavior in your child at home, school, or other settings.
          </p>
        </div>
      </div>
    </div>
  )
}