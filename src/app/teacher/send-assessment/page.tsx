'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Send,
  Copy,
  Mail,
  Share2,
  Users,
  CheckCircle,
  Star
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { createProfileAssignment } from '@/lib/supabase'
import { generateAssessmentLink } from '@/lib/email-templates'

export default function SendAssessmentPage() {
  const { teacher, isAuthenticated } = useTeacherAuth()
  const [studentInfo, setStudentInfo] = useState({
    child_name: '',
    parent_email: ''
  })
  const [assignmentLink, setAssignmentLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'link' | 'success'>('form')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  if (!isAuthenticated) {
    router.push('/teacher/register')
    return null
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!teacher) throw new Error('Teacher not found')
      
      if (!studentInfo.child_name.trim() || !studentInfo.parent_email.trim()) {
        throw new Error('Please fill in all fields')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(studentInfo.parent_email)) {
        throw new Error('Please enter a valid email address')
      }

      const assignment = await createProfileAssignment({
        teacher_id: teacher.id,
        parent_email: studentInfo.parent_email.trim(),
        child_name: studentInfo.child_name.trim()
      })

      const link = generateAssessmentLink(assignment.assignment_token, typeof window !== 'undefined' ? window.location.origin : '')
      setAssignmentLink(link)
      setStep('link')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(assignmentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyEmail = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const emailContent = generateEmailContent()
      navigator.clipboard.writeText(emailContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateEmailContent = () => {
    return `Subject: Help Me Understand ${studentInfo.child_name}'s Learning Style

Dear Parent/Guardian,

I'm ${teacher?.name}, ${studentInfo.child_name}'s teacher this year. I want to ensure I understand their unique learning style from Day 1.

Could you please take 5 minutes to complete this learning profile assessment? It will help me provide the best possible classroom experience for ${studentInfo.child_name}.

Assessment Link: ${assignmentLink}

This research-based assessment identifies your child's learning strengths and provides personalized recommendations for both home and school.

Thank you for helping me understand how ${studentInfo.child_name} learns best!

Best regards,
${teacher?.name}
${teacher?.email}

---
Used by 50,000+ families to strengthen school-home connections`
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">Send Assessment</span>
                <p className="text-sm text-begin-blue/70">Create personalized learning profile link</p>
              </div>
            </div>
            <Link 
              href="/teacher/dashboard"
              className="flex items-center gap-2 text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'form' && (
          <div className="card-begin p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="h-10 w-10 text-begin-teal" />
              </div>
              <h1 className="text-hero font-bold text-begin-blue mb-4">
                Send Learning Profile Assessment
              </h1>
              <p className="text-body-lg text-begin-blue/80 max-w-2xl mx-auto">
                Create a personalized assessment link for any parent. Takes 30 seconds to set up!
              </p>
            </div>

            {/* Social Proof */}
            <div className="bg-begin-cyan/5 p-6 rounded-card mb-8 text-center border border-begin-cyan/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              </div>
              <p className="text-sm text-begin-blue/80 font-medium">
                "This completely changed how I approach my classroom. I understand each child from Day 1!"
              </p>
              <p className="text-xs text-begin-blue/60 mt-1">- Mrs. Rodriguez, 2nd Grade Teacher</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-6">
              <div>
                <label htmlFor="child_name" className="block text-heading font-semibold text-begin-blue mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  id="child_name"
                  value={studentInfo.child_name}
                  onChange={(e) => setStudentInfo(prev => ({...prev, child_name: e.target.value}))}
                  className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                  placeholder="Enter student's first name"
                  required
                />
              </div>

              <div>
                <label htmlFor="parent_email" className="block text-heading font-semibold text-begin-blue mb-2">
                  Parent Email
                </label>
                <input
                  type="email"
                  id="parent_email"
                  value={studentInfo.parent_email}
                  onChange={(e) => setStudentInfo(prev => ({...prev, parent_email: e.target.value}))}
                  className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                  placeholder="parent@email.com"
                  required
                />
              </div>

              <div className="bg-begin-cream/50 p-6 rounded-card">
                <h4 className="font-semibold text-begin-blue mb-3">What happens next:</h4>
                <ul className="text-sm text-begin-blue/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal font-medium mt-0.5">1.</span>
                    Get a personalized assessment link for this student
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal font-medium mt-0.5">2.</span>
                    Copy the email template or share the link directly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-begin-teal font-medium mt-0.5">3.</span>
                    Track completion and view results in your dashboard
                  </li>
                </ul>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={loading || !studentInfo.child_name.trim() || !studentInfo.parent_email.trim()}
                  className="btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Link...
                    </>
                  ) : (
                    <>
                      Create Assessment Link
                      <Send className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'link' && (
          <div className="card-begin p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-hero font-bold text-begin-blue mb-4">
                Assessment Link Created!
              </h1>
              <p className="text-body-lg text-begin-blue/80 max-w-2xl mx-auto">
                Share this link with {studentInfo.parent_email} to start {studentInfo.child_name}'s learning profile.
              </p>
            </div>

            {/* Assessment Link */}
            <div className="bg-begin-cream/50 p-6 rounded-card mb-6 border border-begin-gray">
              <label className="block text-sm font-semibold text-begin-blue mb-2">
                Assessment Link for {studentInfo.child_name}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={assignmentLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-begin-gray rounded-card text-sm font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-begin-secondary text-sm px-4 py-2 flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Email Template */}
            <div className="bg-white p-6 rounded-card mb-6 border border-begin-gray">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading font-semibold text-begin-blue">Ready-to-Send Email</h3>
                <button
                  onClick={handleCopyEmail}
                  className="btn-begin-primary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Copy Email
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-card text-sm font-mono whitespace-pre-wrap">
                {generateEmailContent()}
              </div>
            </div>

            {/* Share Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const subject = encodeURIComponent(`Help Me Understand ${studentInfo.child_name}'s Learning Style`)
                    const body = encodeURIComponent(generateEmailContent())
                    window.location.href = `mailto:${studentInfo.parent_email}?subject=${subject}&body=${body}`
                  }
                }}
                className="btn-begin-primary flex items-center gap-2 justify-center"
              >
                <Mail className="h-5 w-5" />
                Open in Email App
              </button>
              
              <button
                onClick={() => setStep('success')}
                className="btn-begin-secondary flex items-center gap-2 justify-center"
              >
                <Users className="h-5 w-5" />
                Send Another
              </button>

              <Link
                href="/teacher/dashboard"
                className="btn-begin-secondary flex items-center gap-2 justify-center"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </div>

            {/* Viral Growth Hook */}
            <div className="mt-8 text-center bg-gradient-to-r from-begin-teal to-begin-cyan text-white p-6 rounded-card">
              <h4 className="text-heading font-bold mb-2">💡 Pro Tip: Maximize Your Impact</h4>
              <p className="text-sm opacity-90 mb-4">
                Send assessments to all your students at once at the beginning of the year for the best results!
              </p>
              <Link
                href="/teacher/dashboard"
                className="inline-flex items-center gap-2 bg-white text-begin-teal px-4 py-2 rounded-card font-semibold hover:bg-begin-cream transition-colors"
              >
                <Share2 className="h-4 w-4" />
                View All Students
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}