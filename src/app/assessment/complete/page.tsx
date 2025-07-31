'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { calculateScores, getPersonalityLabel, generateDescription } from '@/lib/scoring'

export default function AssessmentCompletePage() {
  const router = useRouter()
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState('')
  const [isProcessing, setIsProcessing] = useState(true)
  const [profileData, setProfileData] = useState<{
    scores: any
    personalityLabel: string
    description: string
  } | null>(null)

  useEffect(() => {
    const processAssessment = async () => {
      // Get stored data
      const name = sessionStorage.getItem('childName')
      const gradeLevel = sessionStorage.getItem('grade')
      const responses = sessionStorage.getItem('assessmentResponses')

      if (!name || !responses) {
        router.push('/assessment/start')
        return
      }

      setChildName(name)
      setGrade(gradeLevel || '')

      // Process the responses
      const parsedResponses = JSON.parse(responses)
      const scores = calculateScores(parsedResponses)
      const personalityLabel = getPersonalityLabel(scores)
      const description = generateDescription(scores)

      // Simulate processing time for better UX
      setTimeout(() => {
        setProfileData({
          scores,
          personalityLabel,
          description
        })
        setIsProcessing(false)

        // Store results for the results page
        const profileId = Date.now().toString()
        const profileResult = {
          id: profileId,
          childName: name,
          grade: gradeLevel,
          responses: parsedResponses,
          scores,
          personalityLabel,
          description,
          createdAt: new Date().toISOString()
        }
        
        sessionStorage.setItem('latestProfile', JSON.stringify(profileResult))
        
        // Redirect to results after a moment
        setTimeout(() => {
          router.push(`/results/${profileId}`)
        }, 3000)
      }, 2000)
    }

    processAssessment()
  }, [router])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-begin-cream">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center">
              <Link href="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-begin-blue" />
                <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card-begin p-8 text-center">
            <div className="mb-8">
              <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="h-10 w-10 text-begin-teal" />
              </div>
              <h1 className="text-begin-hero font-bold text-begin-blue mb-4">
                Creating {childName}&apos;s Learning Profile...
              </h1>
              <p className="text-begin-body text-gray-600">
                We&apos;re analyzing the responses and generating personalized insights about {childName}&apos;s learning style.
              </p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-begin-teal flex-shrink-0" />
                <span className="text-sm text-gray-700">Assessment responses collected</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-begin-teal flex-shrink-0" />
                <span className="text-sm text-gray-700">6C framework analysis complete</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-begin-teal rounded-full animate-spin flex-shrink-0" />
                <span className="text-sm text-gray-700">Generating learning profile...</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                <span className="text-sm text-gray-500">Creating Begin product recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card-begin p-8 text-center">
          <div className="mb-8">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-begin-hero font-bold text-begin-blue mb-4">
              🎉 {childName}&apos;s Profile is Ready!
            </h1>
            <p className="text-begin-body text-gray-600 mb-6">
              We&apos;ve successfully created a comprehensive learning profile for {childName}. 
              You&apos;re about to see their unique learning strengths and personalized recommendations.
            </p>
            
            {profileData && (
              <div className="bg-begin-cyan/5 p-6 rounded-2xl mb-6">
                <h3 className="font-bold text-begin-blue text-xl mb-2">
                  {profileData.personalityLabel}
                </h3>
                <p className="text-gray-700">
                  {profileData.description}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Redirecting to full results in a few seconds...
            </div>
            <button
              onClick={() => router.push(`/results/${Date.now()}`)}
              className="btn-begin-primary flex items-center gap-2 mx-auto"
            >
              View Full Profile
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}