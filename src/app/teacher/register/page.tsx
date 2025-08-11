'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Users, School, Mail, User, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'

// Password strength indicator component
function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password)
  }
  
  const strength = Object.values(checks).filter(Boolean).length
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'][Math.max(0, strength - 1)]
  const strengthColor = ['text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'][Math.max(0, strength - 1)]
  
  if (!password) return null
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`h-1 w-6 rounded ${i <= strength ? strengthColor.replace('text-', 'bg-') : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <span className={`text-xs ${strengthColor}`}>{strengthText}</span>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div className={`flex items-center space-x-1 ${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="h-3 w-3" />
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="h-3 w-3" />
          <span>One uppercase letter</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="h-3 w-3" />
          <span>One lowercase letter</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.number ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle className="h-3 w-3" />
          <span>One number</span>
        </div>
      </div>
    </div>
  )
}

export default function TeacherRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    gradeLevel: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const gradeOptions = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', 
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    'Mixed Grades', 'Special Education', 'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrors([])
    setLoading(true)

    try {
      // Call our new registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        setErrors(result.errors || ['Registration failed'])
        return
      }

      setSuccess(result.message || 'Registration successful!')
      
      // Clear form on success
      setFormData({
        name: '',
        email: '',
        school: '',
        gradeLevel: '',
        password: '',
        confirmPassword: ''
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/teacher/login?message=registration_success')
      }, 3000)

    } catch (err: any) {
      console.error('Teacher registration error:', err)
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
    // Clear messages when user starts typing
    if (error) setError('')
    if (errors.length > 0) setErrors([])
    if (success) setSuccess('')
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
            <p className="text-body-lg text-begin-blue/80 max-w-2xl mx-auto mb-6">
              Manage your classroom learning profiles, assign assessments to parents, and track student progress all in one place.
            </p>
            
            {/* Quick Demo Access */}
            <div className="bg-gradient-to-r from-begin-cyan to-begin-teal text-white p-6 rounded-card mb-8">
              <h3 className="font-bold text-lg mb-2">🚀 Try It Now!</h3>
              <p className="text-sm mb-4 opacity-90">
                Want to see the teacher dashboard immediately? No signup required.
              </p>
              <button
                onClick={async () => {
                  console.log('Demo button clicked')
                  setLoading(true)
                  
                  try {
                    // Try to create or get demo teacher from database
                    let demoTeacher
                    const existingDemo = await getTeacherByEmail('demo@school.edu')
                    
                    if (existingDemo) {
                      demoTeacher = existingDemo
                    } else {
                      // Create demo teacher in database
                      demoTeacher = await createTeacher({
                        email: 'demo@school.edu',
                        name: 'Demo Teacher',
                        school: 'Demo Elementary School',
                        grade_level: '3rd Grade'
                      })
                    }
                    
                    login(demoTeacher)
                    // Demo teachers should also see onboarding for the full experience
                    router.push('/teacher/onboarding?demo=true')
                  } catch (error) {
                    console.error('Demo teacher creation failed:', error)
                    // Fallback to offline demo
                    const offlineDemoTeacher = {
                      id: 999999,
                      name: 'Demo Teacher (Offline)',
                      email: 'demo@offline.local',
                      school: 'Demo Elementary School',
                      grade_level: '3rd Grade',
                      ambassador_status: false,
                      created_at: new Date().toISOString(),
                      isOfflineDemo: true
                    }
                    login(offlineDemoTeacher)
                    // Demo teachers should see onboarding too
                    router.push('/teacher/onboarding?demo=true&offline=true')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="bg-white text-begin-teal px-6 py-3 rounded-card font-bold hover:bg-begin-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-begin-teal mr-2"></div>
                    Loading Demo...
                  </>
                ) : (
                  '🎯 Launch Demo Dashboard'
                )}
              </button>
            </div>
            
            {/* Real Account Section */}
            <div className="bg-begin-blue/5 p-6 rounded-card mb-8 border border-begin-blue/20">
              <h3 className="font-bold text-lg text-begin-blue mb-2">📚 Create Your Real Teacher Account</h3>
              <p className="text-sm text-begin-blue/80 mb-4">
                Save your data permanently, create real classrooms, and manage your students year after year.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-xs text-begin-blue/70">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Permanent data storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Real classroom management</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Multi-year tracking</span>
                </div>
              </div>
            </div>
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

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card">
              <div className="text-red-800 text-sm">
                <p className="font-medium mb-2">Please fix the following issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-card">
              <p className="text-green-800 text-sm font-medium">{success}</p>
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
              <label htmlFor="gradeLevel" className="block text-heading font-semibold text-begin-blue mb-2">
                Grade Level (Optional)
              </label>
              <select
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
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

            {/* Password Fields */}
            <div className="space-y-4 pt-4 border-t border-begin-gray/30">
              <h4 className="font-semibold text-begin-blue text-lg">Create Your Password</h4>
              
              <div>
                <label htmlFor="password" className="block text-heading font-semibold text-begin-blue mb-2">
                  <Lock className="h-5 w-5 inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-heading font-semibold text-begin-blue mb-2">
                  <Lock className="h-5 w-5 inline mr-2" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Passwords do not match
                  </p>
                )}
              </div>
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
                disabled={loading || !formData.email || !formData.name || !formData.password || formData.password !== formData.confirmPassword}
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
            <p className="text-sm text-begin-blue/70 mb-4">
              Already have a teacher account?
            </p>
            <Link 
              href="/teacher/login"
              className="btn-begin-secondary inline-flex items-center gap-2"
            >
              Sign In to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}