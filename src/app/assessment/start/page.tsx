'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Clock, Users, School, Star } from 'lucide-react'

export default function AssessmentStartPage() {
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState('')
  const [assignmentToken, setAssignmentToken] = useState('')
  const [isTeacherReferred, setIsTeacherReferred] = useState(false)
  const [teacherMessage, setTeacherMessage] = useState('')
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

  const handleStart = () => {
    if (childName.trim() && grade) {
      // Store child info in sessionStorage
      sessionStorage.setItem('childName', childName)
      sessionStorage.setItem('grade', grade)
      
      // Store assignment token if from teacher
      if (assignmentToken) {
        sessionStorage.setItem('assignmentToken', assignmentToken)
      }
      
      router.push('/assessment/question/1')
    }
  }

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
          </div>
        </div>
      </header>

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

          {/* Assessment Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-begin-blue/5 rounded-2xl transform hover:scale-105 transition-transform duration-200">
              <Clock className="h-8 w-8 text-begin-blue mx-auto mb-2" />
              <h3 className="font-semibold text-begin-blue mb-1">Just 5 Minutes ⏰</h3>
              <p className="text-sm text-gray-600">Quick, fun, and totally worth it!</p>
            </div>
            <div className="text-center p-4 bg-begin-teal/5 rounded-2xl transform hover:scale-105 transition-transform duration-200">
              <BookOpen className="h-8 w-8 text-begin-teal mx-auto mb-2" />
              <h3 className="font-semibold text-begin-teal mb-1">24 Smart Questions 📚</h3>
              <p className="text-sm text-gray-600">Backed by learning science</p>
            </div>
            <div className="text-center p-4 bg-begin-cyan/10 rounded-2xl transform hover:scale-105 transition-transform duration-200">
              <Users className="h-8 w-8 text-begin-cyan mx-auto mb-2" />
              <h3 className="font-semibold text-begin-cyan mb-1">Teacher Approved ✨</h3>
              <p className="text-sm text-gray-600">Perfect for sharing with educators</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="childName" className="block text-begin-heading font-semibold text-begin-blue mb-2">
                Child&apos;s First Name
              </label>
              <input
                type="text"
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-begin-body"
                placeholder="Enter your child's first name"
                required
              />
            </div>

            <div>
              <label htmlFor="grade" className="block text-begin-heading font-semibold text-begin-blue mb-2">
                Current Grade Level
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-begin-body"
                required
              >
                <option value="">Select grade level</option>
                {grades.map((gradeOption) => (
                  <option key={gradeOption} value={gradeOption}>
                    {gradeOption}
                  </option>
                ))}
              </select>
            </div>

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
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                onClick={handleStart}
                disabled={!childName.trim() || !grade}
                className="btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="text-lg">{isTeacherReferred ? '🎓' : '🚀'}</span>
                {isTeacherReferred 
                  ? `Create ${childName ? `${childName}'s` : 'Learning'} Profile`
                  : `Let's Discover ${childName ? `${childName}'s` : 'Their'} Superpowers!`
                }
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}