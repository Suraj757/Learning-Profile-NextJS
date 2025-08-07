'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, ArrowRight, CheckCircle, Sparkles, Star, Heart } from 'lucide-react'
import { 
  getQuestionsForAge, 
  getOptionsForAgeAndQuestion, 
  getAgeGroupFromGrade,
  getProgressMessages, 
  usesMultipleChoice,
  PARENT_SCALE, 
  CATEGORY_METADATA,
  INTEREST_OPTIONS,
  ENGAGEMENT_OPTIONS,
  MODALITY_OPTIONS,
  SOCIAL_OPTIONS,
  type AgeGroup 
} from '@/lib/questions'
import ProgressIndicator from '@/components/ProgressIndicator'
import ProgressRecoveryModal from '@/components/ProgressRecoveryModal'
import { 
  getOrCreateSessionId, 
  saveProgress, 
  loadProgress, 
  clearSessionId,
  ProgressAutoSaver,
  LocalProgressManager
} from '@/lib/progress-manager'

export default function QuestionPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = parseInt(params.id as string)
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('5+')
  const [selectedValue, setSelectedValue] = useState<number | null>(null)
  const [selectedValues, setSelectedValues] = useState<number[]>([]) // For checkbox questions
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]) // For interest checkboxes
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [assignmentToken, setAssignmentToken] = useState('')
  
  // Progress saving state
  const [sessionId, setSessionId] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [lastSaved, setLastSaved] = useState<string | undefined>()
  const [expiresAt, setExpiresAt] = useState<string | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  
  const autoSaver = useRef<ProgressAutoSaver | null>(null)

  // Get age-specific questions and options
  const questions = getQuestionsForAge(ageGroup)
  const question = questions.find(q => q.id === questionId)
  const totalQuestions = questions.length
  const progress = (questionId / totalQuestions) * 100
  const categoryInfo = question ? CATEGORY_METADATA[question.category] : null
  const progressMessages = getProgressMessages(totalQuestions)
  const progressMessage = progressMessages.find(p => p.at === questionId)
  const questionOptions = getOptionsForAgeAndQuestion(ageGroup, questionId)
  const isMultipleChoice = usesMultipleChoice(ageGroup)
  
  // Celebrate milestones
  const [showCelebration, setShowCelebration] = useState(false)
  
  useEffect(() => {
    if (progressMessage) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [progressMessage])

  // Auto-scroll to top when question changes for better mobile UX and reset selections
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Clear selections when changing questions
    setSelectedValue(null)
    setSelectedValues([])
    setSelectedInterests([])
  }, [questionId])

  useEffect(() => {
    // Initialize auto-saver
    autoSaver.current = new ProgressAutoSaver()
    
    // Initialize session and load progress
    const initializeSession = async () => {
      const name = sessionStorage.getItem('childName')
      const gradeValue = sessionStorage.getItem('grade')
      const ageGroupValue = sessionStorage.getItem('ageGroup') as AgeGroup
      const token = sessionStorage.getItem('assignmentToken')
      
      if (!name) {
        router.push('/assessment/start')
        return
      }
      
      setChildName(name)
      setGrade(gradeValue || '')
      setAgeGroup(ageGroupValue || getAgeGroupFromGrade(gradeValue || ''))
      setAssignmentToken(token || '')
      
      // CRITICAL FIX: Load existing responses from sessionStorage first
      const existingResponses = sessionStorage.getItem('assessmentResponses')
      if (existingResponses) {
        const parsedResponses = JSON.parse(existingResponses)
        setResponses(parsedResponses)
        
        // Set the current question's response if it exists
        if (parsedResponses[questionId]) {
          const response = parsedResponses[questionId]
          if (question?.questionType === 'checkbox') {
            if (question.category === 'Interests' && Array.isArray(response)) {
              setSelectedInterests(response)
            } else if (Array.isArray(response)) {
              setSelectedValues(response)
            } else {
              setSelectedValues([response])
            }
          } else {
            setSelectedValue(response)
          }
        }
      }
      
      const currentSessionId = getOrCreateSessionId()
      setSessionId(currentSessionId)
      
      // Try to load existing progress from backend
      const progressResult = await loadProgress(currentSessionId)
      
      if (progressResult.found && progressResult.progress) {
        // Resume from saved progress
        const progress = progressResult.progress
        setResponses(progress.responses)
        setLastSaved(progress.last_saved)
        setExpiresAt(progress.expires_at)
        
        // Navigate to correct question if needed
        if (progress.current_question !== questionId) {
          router.push(`/assessment/question/${progress.current_question}`)
          return
        }
        
        // Set current question's response if it exists
        if (progress.responses[questionId]) {
          const response = progress.responses[questionId]
          if (question?.questionType === 'checkbox') {
            if (question.category === 'Interests' && Array.isArray(response)) {
              setSelectedInterests(response)
            } else if (Array.isArray(response)) {
              setSelectedValues(response)
            } else {
              setSelectedValues([response])
            }
          } else {
            setSelectedValue(response)
          }
        }
      } else {
        // Try local storage fallback
        const localProgress = LocalProgressManager.load(currentSessionId)
        if (localProgress) {
          setResponses(localProgress.responses)
          setLastSaved(localProgress.last_saved)
          setExpiresAt(localProgress.expires_at)
          
          if (localProgress.current_question !== questionId) {
            router.push(`/assessment/question/${localProgress.current_question}`)
            return
          }
          
          if (localProgress.responses[questionId]) {
            const response = localProgress.responses[questionId]
            if (question?.questionType === 'checkbox') {
              if (question.category === 'Interests' && Array.isArray(response)) {
                setSelectedInterests(response)
              } else if (Array.isArray(response)) {
                setSelectedValues(response)
              } else {
                setSelectedValues([response])
              }
            } else {
              setSelectedValue(response)
            }
          }
        } else {
          // Check if there might be progress on another device
          const hasShownRecovery = sessionStorage.getItem('hasShownRecovery')
          if (!hasShownRecovery && questionId === 1) {
            setShowRecoveryModal(true)
            sessionStorage.setItem('hasShownRecovery', 'true')
          }
        }
      }
    }
    
    initializeSession()
    
    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (autoSaver.current) {
        autoSaver.current.cleanup()
      }
    }
  }, [questionId, router])

  const handleNext = async () => {
    let responseToSave: number | number[] | string[] | null = null
    
    if (question?.questionType === 'checkbox') {
      if (question.category === 'Interests') {
        responseToSave = selectedInterests.length > 0 ? selectedInterests : null
      } else {
        responseToSave = selectedValues.length > 0 ? selectedValues : null
      }
    } else {
      responseToSave = selectedValue
    }
    
    if (responseToSave === null) return
    
    // Save response
    const updatedResponses = { ...responses, [questionId]: responseToSave }
    setResponses(updatedResponses)
    sessionStorage.setItem('assessmentResponses', JSON.stringify(updatedResponses))
    
    // Save progress immediately before navigation
    await saveProgressNow(updatedResponses, questionId < totalQuestions ? questionId + 1 : questionId)
    
    // Navigate to next question or completion
    if (questionId < totalQuestions) {
      router.push(`/assessment/question/${questionId + 1}`)
    } else {
      // Clear session when completing assessment
      clearSessionId()
      router.push('/assessment/complete')
    }
  }

  const handlePrevious = () => {
    if (questionId > 1) {
      router.push(`/assessment/question/${questionId - 1}`)
    }
  }
  
  // Handle checkbox selections for interests
  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest)
      } else if (prev.length < 5) { // Limit to 5 selections
        return [...prev, interest]
      }
      return prev
    })
  }
  
  // Handle checkbox selections for other questions
  const handleCheckboxToggle = (value: number) => {
    setSelectedValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  // Auto-save progress when response changes
  useEffect(() => {
    let responseToSave: number | number[] | string[] | null = null
    
    if (question?.questionType === 'checkbox') {
      if (question.category === 'Interests') {
        responseToSave = selectedInterests.length > 0 ? selectedInterests : null
      } else {
        responseToSave = selectedValues.length > 0 ? selectedValues : null
      }
    } else {
      responseToSave = selectedValue
    }
    
    if (responseToSave !== null && autoSaver.current) {
      const updatedResponses = { ...responses, [questionId]: responseToSave }
      
      autoSaver.current.saveWithDebounce({
        session_id: sessionId,
        child_name: childName,
        grade: grade,
        age_group: ageGroup,
        responses: updatedResponses,
        current_question: questionId,
        assignment_token: assignmentToken || undefined
      })
    }
  }, [selectedValue, selectedValues, selectedInterests, sessionId, childName, grade, ageGroup, responses, questionId, assignmentToken, question])

  // Keyboard navigation - only for Likert scale
  useEffect(() => {
    if (isMultipleChoice) return // No keyboard shortcuts for multiple choice
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && questionId > 1) {
        handlePrevious()
      } else if (event.key === 'ArrowRight' && selectedValue !== null) {
        handleNext()
      } else if (event.key >= '1' && event.key <= '5') {
        const value = parseInt(event.key)
        if (value >= 1 && value <= 5) {
          setSelectedValue(value)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [questionId, selectedValue, isMultipleChoice])
  
  // Save progress immediately (for navigation)
  const saveProgressNow = async (updatedResponses: Record<number, number>, nextQuestion: number) => {
    if (!sessionId) return
    
    setIsSaving(true)
    setSaveError(null)
    
    const progressData = {
      session_id: sessionId,
      child_name: childName,
      grade: grade,
      age_group: ageGroup,
      responses: updatedResponses,
      current_question: nextQuestion,
      assignment_token: assignmentToken || undefined
    }
    
    // Try to save to backend
    const result = await saveProgress(progressData)
    
    if (result.success) {
      setLastSaved(result.last_saved)
      setExpiresAt(result.expires_at)
    } else {
      setSaveError(result.error || 'Save failed')
      // Fallback to local storage
      LocalProgressManager.save(progressData)
    }
    
    setIsSaving(false)
  }
  
  // Resume from recovered session
  const handleResumeSession = async (recoveredSessionId: string) => {
    setSessionId(recoveredSessionId)
    
    const progressResult = await loadProgress(recoveredSessionId)
    if (progressResult.found && progressResult.progress) {
      const progress = progressResult.progress
      setChildName(progress.child_name)
      setGrade(progress.grade)
      setAgeGroup(progress.age_group || getAgeGroupFromGrade(progress.grade))
      setResponses(progress.responses)
      setLastSaved(progress.last_saved)
      setExpiresAt(progress.expires_at)
      setAssignmentToken(progress.assignment_token || '')
      
      // Update session storage
      sessionStorage.setItem('childName', progress.child_name)
      sessionStorage.setItem('grade', progress.grade)
      sessionStorage.setItem('ageGroup', progress.age_group || getAgeGroupFromGrade(progress.grade))
      sessionStorage.setItem('assessmentResponses', JSON.stringify(progress.responses))
      if (progress.assignment_token) {
        sessionStorage.setItem('assignmentToken', progress.assignment_token)
      }
      
      // Navigate to correct question
      router.push(`/assessment/question/${progress.current_question}`)
    }
  }
  
  // Debug function to auto-complete the quiz
  const autoCompleteQuiz = (profileType: 'creative' | 'analytical' | 'collaborative' | 'confident') => {
    const baseResponses = {
      creative: { 1: 5, 2: 4, 3: 5, 4: 3, 5: 5, 6: 4, 7: 3, 8: 4, 9: 5, 10: 4, 11: 3, 12: 5, 13: 4, 14: 3, 15: 4, 16: 5, 17: 4, 18: 3, 19: 4, 20: 5, 21: 4 },
      analytical: { 1: 3, 2: 5, 3: 2, 4: 5, 5: 3, 6: 5, 7: 4, 8: 5, 9: 3, 10: 4, 11: 5, 12: 3, 13: 5, 14: 4, 15: 5, 16: 3, 17: 5, 18: 4, 19: 5, 20: 3, 21: 5 },
      collaborative: { 1: 4, 2: 3, 3: 5, 4: 4, 5: 4, 6: 3, 7: 5, 8: 3, 9: 4, 10: 5, 11: 3, 12: 4, 13: 3, 14: 5, 15: 3, 16: 4, 17: 3, 18: 5, 19: 3, 20: 4, 21: 3 },
      confident: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4, 11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4, 21: 4 }
    }
    
    // Add sample responses for the new questions
    const additionalResponses: Record<string, any> = {}
    
    // Add interest selections (question varies by age group)
    const interestQuestionId = ageGroup === '5+' ? 25 : 22
    additionalResponses[interestQuestionId] = ['Animals', 'Science', 'Art', 'Sports', 'Music'] // Sample interests
    
    // Add engagement style (varies by age group)
    const engagementQuestionId = ageGroup === '5+' ? 26 : 23
    additionalResponses[engagementQuestionId] = 2 // Hands-on activities
    
    // Add modality preference
    const modalityQuestionId = ageGroup === '5+' ? 27 : 24
    additionalResponses[modalityQuestionId] = ageGroup === '5+' ? 4 : 1 // Visual for 5+, movement for younger
    
    // Add social preference
    const socialQuestionId = ageGroup === '5+' ? 28 : 25
    additionalResponses[socialQuestionId] = 2 // Collaborative
    
    // Add school experience
    const schoolQuestionId = ageGroup === '5+' ? 29 : 26
    additionalResponses[schoolQuestionId] = 3 // Some experience
    
    const selectedResponses = { ...baseResponses[profileType], ...additionalResponses }
    setResponses(selectedResponses)
    sessionStorage.setItem('assessmentResponses', JSON.stringify(selectedResponses))
    
    // Clear session when auto-completing
    clearSessionId()
    router.push('/assessment/complete')
  }

  if (!question) {
    return <div>Question not found</div>
  }

  const questionText = question.text.replace('[name]', childName)
  const encouragingIntro = question.encouragingIntro?.replace('[name]', childName)
  const questionExample = question.example?.replace('[name]', childName)

  return (
    <div className="min-h-screen bg-begin-cream pb-32">
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

      {/* Progress Indicator with Auto-Save */}
      <ProgressIndicator
        isOnline={isOnline}
        lastSaved={lastSaved}
        expiresAt={expiresAt}
        isSaving={isSaving}
        saveError={saveError}
        questionNumber={questionId}
        totalQuestions={totalQuestions}
        childName={childName}
      />
      
      {/* Celebration Banner */}
      {progressMessage && showCelebration && (
        <div className="bg-white border-b relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 animate-pulse" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="py-4 text-center animate-bounce">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                <Sparkles className="h-4 w-4" />
                {progressMessage.message}
              </div>
              <p className="text-xs text-gray-500 mt-1">{progressMessage.subtext}</p>
            </div>
          </div>
        </div>
      )}

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-24">
        <div className="card-begin p-6 lg:p-8 transform hover:shadow-lg transition-shadow duration-300">
          {/* Enhanced Category Badge */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium ${categoryInfo?.lightColor} ${categoryInfo?.color.replace('bg-', 'text-')} shadow-sm`}>
              <span className="text-lg">{categoryInfo?.emoji}</span>
              <span>{question.category}</span>
              <span className="text-xs opacity-75">({questionId}/{totalQuestions})</span>
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
            {question?.questionType === 'checkbox' ? (
              // Checkbox options (for Interests and other multi-select questions)
              <div className="space-y-3">
                {question.category === 'Interests' ? (
                  // Interest checkboxes with custom layout
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {question.options?.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        disabled={!selectedInterests.includes(interest) && selectedInterests.length >= 5}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium transform hover:scale-105 ${
                          selectedInterests.includes(interest)
                            ? 'border-begin-teal bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 text-begin-teal shadow-md scale-105'
                            : selectedInterests.length >= 5
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 hover:border-begin-teal/50 hover:bg-begin-teal/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                            selectedInterests.includes(interest)
                              ? 'border-begin-teal bg-begin-teal'
                              : 'border-gray-300'
                          }`}>
                            {selectedInterests.includes(interest) && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span>{interest}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  // Other checkbox questions
                  question.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleCheckboxToggle(index)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-md ${
                        selectedValues.includes(index)
                          ? 'border-begin-teal bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 text-begin-teal shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-begin-teal/50 hover:bg-begin-teal/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          selectedValues.includes(index)
                            ? 'border-begin-teal bg-begin-teal'
                            : 'border-gray-300'
                        }`}>
                          {selectedValues.includes(index) && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  ))
                )}
                {question.category === 'Interests' && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {selectedInterests.length}/5 selected
                  </p>
                )}
              </div>
            ) : question?.questionType === 'multipleChoice' && question.options ? (
              // Multiple choice with custom options (for Motivation questions)
              question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedValue(index)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-md ${
                    selectedValue === index
                      ? 'border-begin-teal bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 text-begin-teal shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-begin-teal/50 hover:bg-begin-teal/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        {selectedValue === index && (
                          <div className="w-3 h-3 bg-begin-teal rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{option}</span>
                      </div>
                    </div>
                    {selectedValue === index && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-begin-teal" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : isMultipleChoice ? (
              // Standard Multiple Choice Options for younger ages (6C questions)
              questionOptions.map((option, index) => (
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
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        {selectedValue === option.value && (
                          <div className="w-3 h-3 bg-begin-teal rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{option.text}</span>
                      </div>
                    </div>
                    {selectedValue === option.value && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-begin-teal" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              // Likert Scale for 5+ age group (6C questions)
              PARENT_SCALE.map((option, index) => (
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{option.label}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-mono">
                            {option.value}
                          </span>
                        </div>
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
              ))
            )}
          </div>

          {/* Keyboard Shortcuts Help - only show for Likert scale */}
          {!isMultipleChoice && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs">
                <span>💡 Pro tip:</span>
                <span>Press 1-5 to select • ← → arrows to navigate</span>
              </div>
            </div>
          )}

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
        
        {/* Progress Recovery Modal */}
        <ProgressRecoveryModal
          isOpen={showRecoveryModal}
          onClose={() => setShowRecoveryModal(false)}
          onResumeSession={handleResumeSession}
        />
      </div>

      {/* Fixed Navigation Footer - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={questionId === 1}
              className="btn-begin-secondary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 transition-all duration-200 text-sm px-4 py-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">
                Question {questionId} of {totalQuestions}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalQuestions, 8) }, (_, i) => {
                  const dotIndex = Math.floor((i * totalQuestions) / 8)
                  return (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        questionId > dotIndex ? 'bg-begin-teal' : 'bg-gray-200'
                      }`}
                    />
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={(() => {
                if (question?.questionType === 'checkbox') {
                  if (question.category === 'Interests') {
                    return selectedInterests.length === 0
                  } else {
                    return selectedValues.length === 0
                  }
                } else {
                  return selectedValue === null
                }
              })()}
              className={`btn-begin-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transform transition-all duration-200 text-sm px-6 py-3 font-semibold ${
                (() => {
                  if (question?.questionType === 'checkbox') {
                    if (question.category === 'Interests') {
                      return selectedInterests.length > 0 ? 'hover:scale-105 shadow-lg hover:shadow-xl animate-pulse ring-2 ring-begin-teal/20' : ''
                    } else {
                      return selectedValues.length > 0 ? 'hover:scale-105 shadow-lg hover:shadow-xl animate-pulse ring-2 ring-begin-teal/20' : ''
                    }
                  } else {
                    return selectedValue !== null ? 'hover:scale-105 shadow-lg hover:shadow-xl animate-pulse ring-2 ring-begin-teal/20' : ''
                  }
                })()
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
      </div>
    </div>
  )
}