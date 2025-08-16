'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Clock, Users, School, Star, Sparkles } from 'lucide-react'
import PreciseAgeSelector from '@/components/PreciseAgeSelector'
import QuizContextSelector from '@/components/QuizContextSelector'
import { createPreciseAge, getQuestionsForPreciseAge, getAgeGroupInfo, validateAge } from '@/lib/age-routing'
import type { AgeGroup } from '@/lib/questions'

interface PreciseAgeData {
  years: number
  months: number
  birthDate?: Date
}

function AssessmentStartContent() {
  const [childName, setChildName] = useState('')
  const [preciseAge, setPreciseAge] = useState<PreciseAgeData>({ years: 5, months: 0 })
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('5+')
  const [grade, setGrade] = useState('')
  const [assignmentToken, setAssignmentToken] = useState('')
  const [isTeacherReferred, setIsTeacherReferred] = useState(false)
  const [teacherMessage, setTeacherMessage] = useState('')
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [ageValidation, setAgeValidation] = useState({ isValid: true, warnings: [] as string[], errors: [] as string[] })
  const [useLegacyAgeSelection, setUseLegacyAgeSelection] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  
  // CLP 2.0 Multi-Quiz State
  const [currentStep, setCurrentStep] = useState<'age' | 'context' | 'ready'>('age')
  const [quizContext, setQuizContext] = useState<{
    quizType: 'parent_home' | 'teacher_classroom' | 'general'
    ageGroup: '3-4' | '4-5' | '5+' | '6+'
    questionCount: number
    estimatedTime: number
  } | null>(null)
  const [respondentType, setRespondentType] = useState<'parent' | 'teacher' | 'self'>('parent')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    const source = searchParams.get('source')
    
    if (ref && source === 'teacher') {
      setAssignmentToken(ref)
      setIsTeacherReferred(true)
      setTeacherMessage('Your teacher sent you this assessment to help understand your learning style better!')
    } else if (ref) {
      // Regular referral tracking
      sessionStorage.setItem('referralCode', ref)
    }
  }, [searchParams])

  // Helper function to map precise age to frontend age group
  const mapToFrontendAgeGroup = (routingAgeGroup: AgeGroup): '3-4' | '4-5' | '5+' | '6+' => {
    switch (routingAgeGroup) {
      case '3-4': return '3-4'
      case '4-5': return '4-5'
      case '5+':
      case '5-6':
      case '6+':
      case '6-8':
      case '8-10':
      case '10+': return '5+'
      default: return '5+'
    }
  }

  // Handle precise age changes
  const handleAgeChange = (ageData: PreciseAgeData) => {
    setPreciseAge(ageData)
    
    // Validate age
    const validation = validateAge(ageData.years, ageData.months)
    setAgeValidation(validation)
    
    // Get appropriate age group and questions
    if (validation.isValid) {
      const preciseAgeObj = createPreciseAge(ageData.years, ageData.months)
      const routing = getQuestionsForPreciseAge(preciseAgeObj)
      setAgeGroup(routing.ageGroup)
      
      // Auto-suggest grade if not manually set
      if (!grade) {
        setGrade(getGradeFromPreciseAge(ageData))
      }
      
      // Auto-advance to context selection if conditions are met
      if (currentStep === 'age' && validation.isValid && childName.trim()) {
        setTimeout(() => setCurrentStep('context'), 500) // Increased delay for stability
      }
    }
  }

  const handleStart = async () => {
    console.log('🚀 handleStart called:', {
      childName: childName.trim(),
      ageValid: ageValidation.isValid,
      quizContext,
      currentStep
    })
    
    // Prevent double-clicks
    if (isStarting) {
      console.log('🚫 Already starting, ignoring duplicate click')
      return
    }
    
    setIsStarting(true)
    setStartError(null)
    
    // Validation checks
    if (!childName.trim()) {
      setStartError('Please enter your child\'s name')
      setIsStarting(false)
      return
    }
    
    if (!ageValidation.isValid) {
      setStartError('Please check the age information: ' + ageValidation.errors.join(', '))
      setIsStarting(false)
      return
    }
    
    if (!quizContext) {
      setStartError('Please select an assessment type')
      setIsStarting(false)
      return
    }
    
    try {
      // Small delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Store child info in sessionStorage with CLP 2.0 context
      sessionStorage.setItem('childName', childName)
      sessionStorage.setItem('ageGroup', ageGroup) // Store the actual age group from precise age calculation
      sessionStorage.setItem('preciseAge', JSON.stringify(preciseAge))
      sessionStorage.setItem('grade', grade || getGradeFromPreciseAge(preciseAge))
      sessionStorage.setItem('quizType', quizContext.quizType)
      sessionStorage.setItem('respondentType', respondentType)
      sessionStorage.setItem('useCLP2', 'true') // Enable CLP 2.0 scoring
      
      // Store assignment token if from teacher
      if (assignmentToken) {
        sessionStorage.setItem('assignmentToken', assignmentToken)
      }
      
      console.log('✅ Data stored successfully, navigating to assessment...')
      
      // Navigate to first question
      router.push('/assessment/question/1')
    } catch (error) {
      console.error('❌ Error starting assessment:', error)
      setStartError('There was an error starting the assessment. Please try again.')
      setIsStarting(false)
    }
  }
  
  const handleContextSelect = (context: {
    quizType: 'parent_home' | 'teacher_classroom' | 'general'
    ageGroup: '3-4' | '4-5' | '5+' | '6+'
    questionCount: number
    estimatedTime: number
  }) => {
    console.log('🎯 Context selected:', context)
    setQuizContext(context)
    
    // Auto-detect respondent type from quiz type
    if (context.quizType === 'parent_home') {
      setRespondentType('parent')
    } else if (context.quizType === 'teacher_classroom') {
      setRespondentType('teacher')
    } else {
      // Keep current selection for general assessment
    }
    
    // Use a small delay to ensure state is updated
    setTimeout(() => {
      setCurrentStep('ready')
      console.log('✅ Advanced to ready step')
    }, 100)
  }
  
  // Helper function to get a default grade from precise age
  const getGradeFromPreciseAge = (ageData: PreciseAgeData) => {
    const totalMonths = ageData.years * 12 + ageData.months
    
    if (totalMonths < 42) return 'Pre-K'  // < 3.5 years
    if (totalMonths < 54) return 'Pre-K'  // 3.5-4.5 years  
    if (totalMonths < 66) return 'Kindergarten'  // 4.5-5.5 years
    if (totalMonths < 78) return '1st Grade'  // 5.5-6.5 years
    if (totalMonths < 90) return '2nd Grade'  // 6.5-7.5 years
    if (totalMonths < 102) return '3rd Grade'  // 7.5-8.5 years
    return '4th Grade'  // 8.5+ years
  }

  // Legacy helper function for backward compatibility
  const getGradeFromAgeGroup = (age: string) => {
    switch (age) {
      case '3-4': return 'Pre-K'
      case '4-5': return 'Kindergarten'
      case '5+': return '1st Grade'
      default: return 'Kindergarten'
    }
  }

  // Debug functions for testing
  const createTestProfile = async (childName: string, profileType: 'creative' | 'analytical' | 'collaborative' | 'confident') => {
    const testResponses = {
      creative: { 1: 5, 2: 4, 3: 5, 4: 3, 5: 5, 6: 4, 7: 3, 8: 4, 9: 5, 10: 4, 11: 3, 12: 5, 13: 4, 14: 3, 15: 4, 16: 5, 17: 4, 18: 3, 19: 4, 20: 5, 21: 4, 22: 3, 23: 4, 24: 5 },
      analytical: { 1: 3, 2: 5, 3: 2, 4: 5, 5: 3, 6: 5, 7: 4, 8: 5, 9: 3, 10: 4, 11: 5, 12: 3, 13: 5, 14: 4, 15: 5, 16: 3, 17: 5, 18: 4, 19: 5, 20: 3, 21: 5, 22: 4, 23: 5, 24: 3 },
      collaborative: { 1: 4, 2: 3, 3: 5, 4: 4, 5: 4, 6: 3, 7: 5, 8: 3, 9: 4, 10: 5, 11: 3, 12: 4, 13: 3, 14: 5, 15: 3, 16: 4, 17: 3, 18: 5, 19: 3, 20: 4, 21: 3, 22: 5, 23: 3, 24: 4 },
      confident: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4, 11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4, 21: 4, 22: 4, 23: 4, 24: 4 }
    }

    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_name: childName,
          grade: '3rd Grade',
          responses: testResponses[profileType]
        })
      })

      if (response.ok) {
        const { profile } = await response.json()
        router.push(`/results/${profile.id}`)
      }
    } catch (error) {
      console.error('Error creating test profile:', error)
    }
  }

  // Removed quickFillForm as we're now using inline handlers

  const ageGroups = [
    { value: '3-4', label: '3-4 years old', description: 'Preschool age, exploring and learning through play' },
    { value: '4-5', label: '4-5 years old', description: 'Pre-K to Kindergarten, developing school readiness' },
    { value: '5+', label: '5+ years old', description: 'Elementary age, engaged in formal learning' }
  ]
  
  const grades = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', 
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'
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
            {/* Debug Toggle */}
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600"
            >
              🐛 Debug
            </button>
          </div>
        </div>
      </header>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h3 className="text-sm font-bold text-yellow-800 mb-3">🧪 Debug Testing Panel</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quick Form Fill */}
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Quick Form Fill</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => { setChildName('Emma'); setAgeGroup('5+'); setGrade('3rd Grade'); }}
                    className="w-full text-left px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded text-sm"
                  >
                    👧 Emma (5+ years, 3rd Grade)
                  </button>
                  <button
                    onClick={() => { setChildName('Alex'); setAgeGroup('4-5'); setGrade('Kindergarten'); }}
                    className="w-full text-left px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded text-sm"
                  >
                    👦 Alex (4-5 years, Kindergarten)
                  </button>
                  <button
                    onClick={() => { setChildName('Maya'); setAgeGroup('3-4'); setGrade('Pre-K'); }}
                    className="w-full text-left px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded text-sm"
                  >
                    👶 Maya (3-4 years, Pre-K)
                  </button>
                </div>
              </div>

              {/* Instant Test Profiles */}
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Instant Test Profiles</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => createTestProfile('Creative Clara', 'creative')}
                    className="w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
                  >
                    🎨 Creative Clara
                  </button>
                  <button
                    onClick={() => createTestProfile('Analytical Andy', 'analytical')}
                    className="w-full text-left px-3 py-2 bg-green-100 hover:bg-green-200 rounded text-sm"
                  >
                    🧠 Analytical Andy
                  </button>
                  <button
                    onClick={() => createTestProfile('Social Sam', 'collaborative')}
                    className="w-full text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded text-sm"
                  >
                    🤝 Social Sam
                  </button>
                  <button
                    onClick={() => createTestProfile('Confident Chris', 'confident')}
                    className="w-full text-left px-3 py-2 bg-orange-100 hover:bg-orange-200 rounded text-sm"
                  >
                    💪 Confident Chris
                  </button>
                </div>
              </div>

              {/* Test Teacher Flow */}
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Teacher Flow Testing</h4>
                <div className="space-y-2">
                  <Link
                    href="/teacher/register"
                    className="block w-full text-left px-3 py-2 bg-teal-100 hover:bg-teal-200 rounded text-sm"
                  >
                    🎓 Teacher Registration
                  </Link>
                  <Link
                    href="/teacher/dashboard"
                    className="block w-full text-left px-3 py-2 bg-teal-100 hover:bg-teal-200 rounded text-sm"
                  >
                    📊 Teacher Dashboard
                  </Link>
                  <Link
                    href="/teacher/send-assessment"
                    className="block w-full text-left px-3 py-2 bg-teal-100 hover:bg-teal-200 rounded text-sm"
                  >
                    📧 Send Assessment
                  </Link>
                  <Link
                    href="/teacher/profiles"
                    className="block w-full text-left px-3 py-2 bg-teal-100 hover:bg-teal-200 rounded text-sm"
                  >
                    👥 Student Profiles
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-yellow-700">
              💡 <strong>Tip:</strong> Instant Test Profiles skip the assessment and create results immediately. 
              Quick Form Fill just populates the form fields above.
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-begin-teal" />
            </div>
            {isTeacherReferred && (
              <div className="bg-gradient-to-r from-begin-teal to-begin-cyan text-white rounded-card p-4 mb-6">
                <div className="flex items-center gap-3">
                  <School className="h-6 w-6" />
                  <p className="font-medium">{teacherMessage}</p>
                </div>
              </div>
            )}
            
            <h1 className="text-begin-display font-bold text-begin-blue mb-4">
              {isTeacherReferred ? "Let's Create Your Learning Profile!" : "Discover Your Child's Learning Superpowers! 🎆"}
            </h1>
            <p className="text-begin-body text-gray-600 max-w-2xl mx-auto">
              {isTeacherReferred 
                ? "Your teacher wants to understand how you learn best so they can create the perfect classroom experience for you. This quick assessment will help!"
                : "Every child learns differently, and that's what makes them amazing! This fun, 5-minute journey will help you and your child's teacher understand their unique learning style and unlock their full potential."
              }
            </p>
          </div>

          {/* Assessment Info - Dynamic based on age */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-begin-blue/5 rounded-2xl transform hover:scale-105 transition-transform duration-200">
              <Clock className="h-8 w-8 text-begin-blue mx-auto mb-2" />
              <h3 className="font-semibold text-begin-blue mb-1">Just 5 Minutes ⏰</h3>
              <p className="text-sm text-gray-600">Quick, fun, and totally worth it!</p>
            </div>
            <div className="text-center p-4 bg-begin-teal/5 rounded-2xl transform hover:scale-105 transition-transform duration-200">
              <BookOpen className="h-8 w-8 text-begin-teal mx-auto mb-2" />
              <h3 className="font-semibold text-begin-teal mb-1">
                {(() => {
                  if (!ageValidation.isValid) return '~25 Smart Questions 📚'
                  const preciseAgeObj = createPreciseAge(preciseAge.years, preciseAge.months)
                  const routing = getQuestionsForPreciseAge(preciseAgeObj)
                  return `${routing.questions.length} Smart Questions 📚`
                })()} 
              </h3>
              <p className="text-sm text-gray-600">Age-appropriate and backed by learning science</p>
            </div>
            <div className="text-center p-4 bg-begin-cyan/10 rounded-2xl transform hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-8 w-8 text-begin-cyan mx-auto mb-2" />
              <h3 className="font-semibold text-begin-cyan mb-1">Precise & Personal ✨</h3>
              <p className="text-sm text-gray-600">Tailored to your child's exact developmental stage</p>
            </div>
          </div>

          {/* Form - Multi-step CLP 2.0 Flow */}
          <div className="space-y-6">
            {/* Step 1: Age Selection */}
            {currentStep === 'age' && (
              <>
                <div>
                  <label htmlFor="childName" className="block text-begin-heading font-semibold text-begin-blue mb-2">
                    Child&apos;s First Name
                  </label>
              <input
                type="text"
                id="childName"
                value={childName}
                onChange={(e) => {
                  const newName = e.target.value
                  setChildName(newName)
                  console.log('👶 Child name changed:', newName.trim())
                  
                  // Auto-advance to context if age is valid and name is provided
                  if (newName.trim() && ageValidation.isValid && currentStep === 'age') {
                    console.log('⏩ Auto-advancing to context step')
                    setTimeout(() => setCurrentStep('context'), 800) // Longer delay for user feedback
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-begin-body"
                placeholder="Enter your child's first name"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-begin-heading font-semibold text-begin-blue">
                  Child&apos;s Age
                </label>
                <button
                  onClick={() => setUseLegacyAgeSelection(!useLegacyAgeSelection)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  {useLegacyAgeSelection ? 'Use Precise Age' : 'Use Simple Groups'}
                </button>
              </div>
              
              {!useLegacyAgeSelection ? (
                // New Precise Age Selector
                <div>
                  <PreciseAgeSelector
                    onAgeChange={handleAgeChange}
                    selectedAge={preciseAge}
                    className="mb-4"
                  />
                  
                  {/* Age Validation Messages */}
                  {ageValidation.warnings.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {ageValidation.warnings.map((warning, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                          <p className="text-sm text-yellow-800">{warning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {ageValidation.errors.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {ageValidation.errors.map((error, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Legacy Age Group Selector
                <div className="space-y-3">
                  {ageGroups.map((group) => (
                    <label key={group.value} className={`block p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      ageGroup === group.value 
                        ? 'border-begin-teal bg-begin-teal/10 text-begin-teal' 
                        : 'border-gray-200 hover:border-begin-teal/50 hover:bg-begin-teal/5'
                    }`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="ageGroup"
                          value={group.value}
                          checked={ageGroup === group.value}
                          onChange={(e) => {
                            setAgeGroup(e.target.value as AgeGroup)
                            // Set approximate precise age for legacy selection
                            if (e.target.value === '3-4') setPreciseAge({ years: 3, months: 6 })
                            else if (e.target.value === '4-5') setPreciseAge({ years: 4, months: 6 })
                            else setPreciseAge({ years: 5, months: 6 })
                          }}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-semibold">{group.label}</div>
                          <div className="text-sm text-gray-500 mt-1">{group.description}</div>
                        </div>
                        {ageGroup === group.value && (
                          <div className="w-5 h-5 bg-begin-teal rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Optional grade selection for additional context */}
            {(ageGroup || !useLegacyAgeSelection) && (
              <div>
                <label htmlFor="grade" className="block text-begin-heading font-semibold text-begin-blue mb-2">
                  Current Grade Level <span className="text-sm font-normal text-gray-500">(optional)</span>
                </label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-begin-body"
                >
                  <option value="">Select grade level (optional)</option>
                  {grades.map((gradeOption) => (
                    <option key={gradeOption} value={gradeOption}>
                      {gradeOption}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isTeacherReferred ? (
              <div className="bg-begin-teal/5 p-6 rounded-2xl border border-begin-teal/20">
                <h4 className="font-semibold text-begin-blue mb-3 flex items-center gap-2">
                  <School className="h-5 w-5 text-begin-teal" /> Your teacher will see:
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal mt-0.5">✓</span> 
                    <span>How you learn best (visual, hands-on, through discussion, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal mt-0.5">✓</span> 
                    <span>Your communication and collaboration strengths</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal mt-0.5">✓</span> 
                    <span>Activities and approaches that work best for you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal mt-0.5">✓</span> 
                    <span>Personalized Begin product recommendations for home</span>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-begin-cyan/5 to-begin-teal/5 p-6 rounded-2xl border border-begin-cyan/10">
                <h4 className="font-semibold text-begin-blue mb-3 flex items-center gap-2">
                  <span className="text-xl">🎯</span> What makes this special:
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal mt-0.5">💬</span> 
                    <span>Warm, conversational questions that feel like chatting with a friend</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal mt-0.5">🧠</span> 
                    <span>Based on the proven 6C learning framework used by educators worldwide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal mt-0.5">🎁</span> 
                    <span>Personalized learning recommendations just for your child</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal mt-0.5">🤝</span> 
                    <span>A beautiful profile perfect for sharing with teachers</span>
                  </li>
                </ul>
                
                {/* Additional form validation info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h5 className="text-xs font-semibold text-blue-800 mb-1">Assessment Readiness Check:</h5>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={childName.trim() ? 'text-green-600' : 'text-gray-400'}>●</span>
                      <span>Child's name entered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={ageValidation.isValid ? 'text-green-600' : 'text-gray-400'}>●</span>
                      <span>Age information validated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={currentStep === 'context' || currentStep === 'ready' ? 'text-green-600' : 'text-gray-400'}>●</span>
                      <span>Ready for assessment type selection</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
            
            {/* Step 2: Context Selection */}
            {currentStep === 'context' && (
              <div>
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-begin-blue mb-2">
                    Perfect! {childName}'s age: {preciseAge.years} years, {preciseAge.months} months
                  </h3>
                  <p className="text-gray-600">Now let's choose the right assessment for your situation.</p>
                </div>
                
                <QuizContextSelector
                  ageGroup={mapToFrontendAgeGroup(ageGroup)}
                  onContextSelect={handleContextSelect}
                  className="mb-6"
                />
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentStep('age')}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ← Back to Age
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Ready to Start */}
            {currentStep === 'ready' && (
              <div className="text-center space-y-6">
                {quizContext ? (
                  <div className="bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 p-6 rounded-2xl border border-begin-teal/20">
                    <h3 className="text-xl font-bold text-begin-blue mb-3">Ready to Start!</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Child:</strong> {childName}</p>
                      <p><strong>Age:</strong> {preciseAge.years} years, {preciseAge.months} months</p>
                      <p><strong>Assessment Type:</strong> {quizContext.quizType === 'parent_home' ? 'Parent Assessment' : quizContext.quizType === 'teacher_classroom' ? 'Teacher Assessment' : 'Complete Assessment'}</p>
                      <p><strong>Questions:</strong> {quizContext.questionCount} thoughtful questions</p>
                      <p><strong>Estimated Time:</strong> About {quizContext.estimatedTime} minutes</p>
                      <p><strong>Age Group:</strong> {quizContext.ageGroup} years</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-yellow-800 mb-3">Assessment Context Missing</h3>
                    <p className="text-yellow-700 mb-4">We need to select an assessment type before continuing.</p>
                    <button
                      onClick={() => {
                        console.log('🔄 Returning to context selection')
                        setCurrentStep('context')
                      }}
                      className="btn-begin-secondary"
                    >
                      ← Select Assessment Type
                    </button>
                  </div>
                )}
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      console.log('🔄 Changing assessment type')
                      setCurrentStep('context')
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ← Change Assessment Type
                  </button>
                </div>
              </div>
            )}

            {/* CTA Button - Show based on current step */}
            {currentStep === 'age' && childName.trim() && ageValidation.isValid && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setCurrentStep('context')}
                  className="btn-begin-primary flex items-center gap-3 transform transition-all duration-200 shadow-lg text-lg px-8 py-4 hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                  <span className="text-xl">👍</span>
                  Continue to Assessment Type
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {currentStep === 'ready' && (
              <div className="flex flex-col items-center pt-4 space-y-4">
                {startError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-red-800 text-sm font-medium">{startError}</p>
                    <button
                      onClick={() => setStartError(null)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    console.log('🖱️ CTA button clicked')
                    handleStart()
                  }}
                  disabled={!childName.trim() || !ageValidation.isValid || !quizContext || isStarting}
                  className={`btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transform transition-all duration-200 shadow-lg text-lg px-8 py-4 ${
                    childName.trim() && ageValidation.isValid && quizContext && !isStarting
                      ? 'hover:scale-105 active:scale-95 hover:shadow-xl animate-pulse ring-2 ring-begin-blue/20' 
                      : ''
                  }`}
                >
                  {isStarting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Starting Assessment...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">{isTeacherReferred ? '🎓' : '🚀'}</span>
                      {isTeacherReferred 
                        ? `Create ${childName ? `${childName}'s` : 'Learning'} Profile`
                        : `Let's Discover ${childName ? `${childName}'s` : 'Their'} Superpowers!`
                      }
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                
                {/* Help text for users */}
                {!isStarting && (
                  <p className="text-xs text-gray-500 text-center max-w-md">
                    By clicking this button, you'll start the assessment. 
                    {quizContext && `This will take about ${quizContext.estimatedTime} minutes.`}
                  </p>
                )}
              </div>
            )}
            
            {/* Fallback CTA - if user has name and age but hasn't selected context yet */}
            {currentStep === 'context' && childName.trim() && ageValidation.isValid && !quizContext && (
              <div className="flex justify-center pt-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Please choose an assessment type above to continue</p>
                  <button
                    onClick={() => {
                      console.log('🔄 Using default context selection')
                      // Default to complete assessment if user doesn't select
                      handleContextSelect({
                        quizType: 'general',
                        ageGroup: mapToFrontendAgeGroup(ageGroup),
                        questionCount: 28,
                        estimatedTime: 18
                      })
                    }}
                    className="btn-begin-secondary flex items-center gap-2 mx-auto"
                  >
                    Use Complete Assessment (Recommended)
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Visual Progress Indicator */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 text-sm text-begin-blue/70">
                <div className={`w-3 h-3 rounded-full ${childName.trim() ? 'bg-begin-teal' : 'bg-gray-200'}`} />
                <span>Name</span>
                <ArrowRight className="h-3 w-3" />
                <div className={`w-3 h-3 rounded-full ${ageValidation.isValid && ageValidation.errors.length === 0 ? 'bg-begin-teal' : 'bg-gray-200'}`} />
                <span>Age</span>
                <ArrowRight className="h-3 w-3" />
                <div className={`w-3 h-3 rounded-full ${quizContext ? 'bg-begin-teal' : 'bg-gray-200'}`} />
                <span>Context</span>
                {childName.trim() && ageValidation.isValid && quizContext && (
                  <>
                    <ArrowRight className="h-3 w-3 text-begin-teal ml-2" />
                    <span className="text-begin-teal font-medium">
                      Ready to start! ✨
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Debug Info - only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
                <strong>Debug Info:</strong>
                <br />Current Step: {currentStep}
                <br />Child Name: {childName ? '✓' : '✗'}
                <br />Age Valid: {ageValidation.isValid ? '✓' : '✗'}
                <br />Age Errors: {ageValidation.errors.join(', ') || 'None'}
                <br />Quiz Context: {quizContext ? '✓' : '✗'}
                <br />Quiz Type: {quizContext?.quizType || 'None'}
                <br />Age Group: {ageGroup}
                <br />Frontend Age Group: {mapToFrontendAgeGroup(ageGroup)}
                <br />Precise Age: {preciseAge.years}y {preciseAge.months}m
                <br />Respondent Type: {respondentType}
                <br />Is Starting: {isStarting ? 'Yes' : 'No'}
                <br />Start Error: {startError || 'None'}
                {quizContext && (
                  <>
                    <br />Question Count: {quizContext.questionCount}
                    <br />Estimated Time: {quizContext.estimatedTime}min
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AssessmentStartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading assessment...</p>
        </div>
      </div>
    }>
      <AssessmentStartContent />
    </Suspense>
  )
}