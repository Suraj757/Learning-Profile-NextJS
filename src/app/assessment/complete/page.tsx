'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CheckCircle, Sparkles, ArrowRight, AlertCircle, Star, Heart, Zap, Trophy } from 'lucide-react'
import { calculateScores, getPersonalityLabel, generateDescription } from '@/lib/scoring'

export default function AssessmentCompletePage() {
  const router = useRouter()
  const [childName, setChildName] = useState('')
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<{
    id: string
    scores: Record<string, number>
    personalityLabel: string
    description: string
    shareUrl: string
  } | null>(null)

  useEffect(() => {
    const processAssessment = async () => {
      try {
        // Get stored data
        const name = sessionStorage.getItem('childName')
        const gradeLevel = sessionStorage.getItem('grade')
        const responses = sessionStorage.getItem('assessmentResponses')
        const assignmentToken = sessionStorage.getItem('assignmentToken')

        if (!name || !responses || !gradeLevel) {
          router.push('/assessment/start')
          return
        }

        setChildName(name)

        // Process the responses locally for immediate display
        const parsedResponses = JSON.parse(responses)
        const scores = calculateScores(parsedResponses)
        const personalityLabel = getPersonalityLabel(scores)
        const description = generateDescription(scores)

        // Simulate processing time for better UX
        setTimeout(async () => {
          try {
            // Save to database
            const response = await fetch('/api/profiles', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                child_name: name,
                grade: gradeLevel,
                responses: parsedResponses,
                assignment_token: assignmentToken // Include assignment token for teacher tracking
              })
            })

            if (!response.ok) {
              throw new Error('Failed to save profile')
            }

            const { profile, shareUrl } = await response.json()

            setProfileData({
              id: profile.id,
              scores,
              personalityLabel,
              description,
              shareUrl
            })
            setIsProcessing(false)

            // Clear session storage since we now have persistent data
            sessionStorage.removeItem('childName')
            sessionStorage.removeItem('grade')
            sessionStorage.removeItem('assessmentResponses')
            sessionStorage.removeItem('assignmentToken')
            
            // Redirect to results after a moment
            setTimeout(() => {
              router.push(`/results/${profile.id}`)
            }, 3000)
          } catch (err) {
            console.error('Error saving profile:', err)
            setError('Failed to save your profile. Please try again.')
            setIsProcessing(false)
          }
        }, 2000)
      } catch (err) {
        console.error('Error processing assessment:', err)
        setError('Failed to process assessment data.')
        setIsProcessing(false)
      }
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
              <div className="relative mx-auto mb-6">
                <div className="bg-gradient-to-br from-begin-teal to-begin-cyan w-24 h-24 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
              <h1 className="text-begin-hero font-bold text-begin-blue mb-4">
                🎭 Creating {childName}&apos;s Learning Profile...
              </h1>
              <p className="text-begin-body text-gray-600">
                Our learning scientists are analyzing your responses to discover {childName}&apos;s unique 
                learning superpowers and create their personalized profile! ✨
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

  if (error) {
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
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-begin-hero font-bold text-begin-blue mb-4">
                Something went wrong
              </h1>
              <p className="text-begin-body text-gray-600 mb-6">
                {error}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setError(null)
                  setIsProcessing(true)
                  typeof window !== 'undefined' && window.location.reload()
                }}
                className="btn-begin-primary flex items-center gap-2 mx-auto"
              >
                Try Again
              </button>
              <Link href="/assessment/start" className="btn-begin-secondary flex items-center gap-2 mx-auto">
                Start Over
              </Link>
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
            <div className="relative mx-auto mb-6">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-24 h-24 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full opacity-20 animate-ping" />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center animate-pulse delay-300">
                <Heart className="h-3 w-3 text-white" />
              </div>
            </div>
            <h1 className="text-begin-hero font-bold text-begin-blue mb-4 animate-fade-in">
              🎆 {childName}&apos;s Learning Profile is Ready!
            </h1>
            <p className="text-begin-body text-gray-600 mb-6">
              Amazing work! You&apos;ve unlocked {childName}&apos;s unique learning superpowers. 
              Get ready to see their special strengths and discover personalized ways to help them shine even brighter! ✨
            </p>
            
            {profileData && (
              <div className="bg-gradient-to-br from-begin-cyan/10 to-begin-teal/10 p-6 rounded-2xl mb-6 border border-begin-teal/20 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-begin-teal to-begin-cyan rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-begin-blue text-xl">
                    {profileData.personalityLabel}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {profileData.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-begin-teal">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">This is just the beginning of {childName}'s learning journey!</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Redirecting to full results in a few seconds...
            </div>
            <button
              onClick={() => router.push(`/results/${profileData?.id}`)}
              className="btn-begin-primary flex items-center gap-3 mx-auto transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-begin-teal to-begin-cyan"
            >
              <Trophy className="h-5 w-5" />
              See {childName}'s Full Profile! 🎉
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}