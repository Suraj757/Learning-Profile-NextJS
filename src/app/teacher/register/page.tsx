'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Users, School, Mail, User } from 'lucide-react'
import { createTeacher, getTeacherByEmail } from '@/lib/supabase'
import { useTeacherAuth, isValidEmail } from '@/lib/teacher-auth'

export default function TeacherRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    grade_level: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(false)
  const router = useRouter()
  const { login } = useTeacherAuth()

  const gradeOptions = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', 
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    'Mixed Grades', 'Special Education', 'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isValidEmail(formData.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Check if teacher already exists
      const existingTeacher = await getTeacherByEmail(formData.email)
      
      if (existingTeacher) {
        // Login existing teacher
        login(existingTeacher)
        router.push('/teacher/dashboard')
      } else {
        // Create new teacher
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name')
        }
        
        const newTeacher = await createTeacher({
          email: formData.email,
          name: formData.name,
          school: formData.school || undefined,
          grade_level: formData.grade_level || undefined
        })
        
        login(newTeacher)
        router.push('/teacher/dashboard?welcome=true')
      }
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
            <Link 
              href="/"
              className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <School className="h-10 w-10 text-begin-teal" />
            </div>
            <h1 className="text-hero font-bold text-begin-blue mb-4">
              Teacher Dashboard Access
            </h1>
            <p className="text-body-lg text-begin-blue/80 max-w-2xl mx-auto">
              Manage your classroom learning profiles, assign assessments to parents, and track student progress all in one place.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-begin-blue/5 rounded-card">
              <Users className="h-8 w-8 text-begin-blue mx-auto mb-2" />
              <h3 className="font-semibold text-begin-blue mb-1">Classroom Management</h3>
              <p className="text-sm text-begin-blue/70">Organize students and track assessments</p>
            </div>
            <div className="text-center p-4 bg-begin-teal/5 rounded-card">
              <Mail className="h-8 w-8 text-begin-teal mx-auto mb-2" />
              <h3 className="font-semibold text-begin-teal mb-1">Parent Communication</h3>
              <p className="text-sm text-begin-blue/70">Send assessment links and track completion</p>
            </div>
            <div className="text-center p-4 bg-begin-cyan/10 rounded-card">
              <BookOpen className="h-8 w-8 text-begin-cyan mx-auto mb-2" />
              <h3 className="font-semibold text-begin-cyan mb-1">Learning Analytics</h3>
              <p className="text-sm text-begin-blue/70">View classroom-wide insights and reports</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-heading font-semibold text-begin-blue mb-2">
                <Mail className="h-5 w-5 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                placeholder="Enter your school email address"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-heading font-semibold text-begin-blue mb-2">
                <User className="h-5 w-5 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-heading font-semibold text-begin-blue mb-2">
                <School className="h-5 w-5 inline mr-2" />
                School Name (Optional)
              </label>
              <input
                type="text"
                id="school"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                placeholder="Enter your school name"
              />
            </div>

            <div>
              <label htmlFor="grade_level" className="block text-heading font-semibold text-begin-blue mb-2">
                Grade Level (Optional)
              </label>
              <select
                id="grade_level"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
              >
                <option value="">Select grade level</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-begin-cyan/5 p-6 rounded-card">
              <h4 className="font-semibold text-begin-blue mb-2">What you'll get:</h4>
              <ul className="text-sm text-begin-blue/80 space-y-1">
                <li>• Send assessment links directly to parents via email</li>
                <li>• Track which students have completed their learning profiles</li>
                <li>• View and compare learning styles across your classroom</li>
                <li>• Export detailed reports for parent-teacher conferences</li>
                <li>• Access Begin product recommendations for each student</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading || !formData.email || !formData.name}
                className="btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    Access Teacher Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-begin-gray">
            <p className="text-sm text-begin-blue/70">
              Already have an account? Just enter your email above to sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}