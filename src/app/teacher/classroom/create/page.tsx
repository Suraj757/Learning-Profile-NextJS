'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Users, Calendar, School, ArrowLeft } from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { createClassroom } from '@/lib/supabase'

export default function CreateClassroomPage() {
  const { teacher, isAuthenticated } = useTeacherAuth()
  const [formData, setFormData] = useState({
    name: '',
    grade_level: '',
    school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const gradeOptions = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', 
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    'Mixed Grades', 'Special Education', 'Other'
  ]

  const currentYear = new Date().getFullYear()
  const schoolYearOptions = [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear + 1}-${currentYear + 2}`
  ]

  if (!isAuthenticated) {
    router.push('/teacher/register')
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-begin-blue mb-4">Redirecting to teacher login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-begin-teal mx-auto"></div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!teacher) {
        throw new Error('Teacher not found')
      }

      if (!formData.name.trim()) {
        throw new Error('Please enter a classroom name')
      }

      if (!formData.grade_level) {
        throw new Error('Please select a grade level')
      }

      const classroom = await createClassroom(teacher.id, {
        name: formData.name.trim(),
        grade_level: formData.grade_level,
        school_year: formData.school_year
      })

      router.push(`/teacher/classroom/${classroom.id}/students?created=true`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
                <span className="text-2xl font-bold text-begin-blue">Create Classroom</span>
                <p className="text-sm text-begin-blue/70">Set up a new classroom for learning profiles</p>
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
        <div className="card-begin p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-begin-teal" />
            </div>
            <h1 className="text-hero font-bold text-begin-blue mb-4">
              Create Your Classroom
            </h1>
            <p className="text-body-lg text-begin-blue/80 max-w-2xl mx-auto">
              Set up a new classroom to organize your students and manage their learning profiles in one place.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-heading font-semibold text-begin-blue mb-2">
                <School className="h-5 w-5 inline mr-2" />
                Classroom Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                placeholder="e.g., Mrs. Smith's 3rd Grade, Room 201"
                required
              />
              <p className="text-sm text-begin-blue/60 mt-1">
                Choose a name that helps you identify this classroom easily
              </p>
            </div>

            <div>
              <label htmlFor="grade_level" className="block text-heading font-semibold text-begin-blue mb-2">
                Grade Level
              </label>
              <select
                id="grade_level"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                required
              >
                <option value="">Select grade level</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="school_year" className="block text-heading font-semibold text-begin-blue mb-2">
                <Calendar className="h-5 w-5 inline mr-2" />
                School Year
              </label>
              <select
                id="school_year"
                name="school_year"
                value={formData.school_year}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                required
              >
                {schoolYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-begin-cyan/5 p-6 rounded-card">
              <h4 className="font-semibold text-begin-blue mb-3">What happens next?</h4>
              <ul className="text-sm text-begin-blue/80 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-begin-teal font-medium mt-0.5">1.</span>
                  Add students to your classroom roster
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-begin-teal font-medium mt-0.5">2.</span>
                  Send assessment links to parents via email
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-begin-teal font-medium mt-0.5">3.</span>
                  Track completion and view learning profiles
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-begin-teal font-medium mt-0.5">4.</span>
                  Access classroom analytics and export reports
                </li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.grade_level}
                className="btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Classroom
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}