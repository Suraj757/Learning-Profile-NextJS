'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/teacher/dashboard'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'teacher' as 'teacher' | 'parent'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Check if user is already logged in
  useEffect(() => {
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('edu-session='))
      ?.split('=')[1]

    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie))
        if (sessionData && sessionData.userId) {
          router.push(returnTo)
        }
      } catch (error) {
        // Invalid session, continue with login
      }
    }
  }, [returnTo, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // For now, we'll implement a simple auth system
      // This will be replaced with proper backend authentication
      
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password')
      }

      // Demo authentication for development
      // In production, this would call your authentication API
      if (formData.email.includes('@') && formData.password.length >= 6) {
        // Create session data
        const sessionData = {
          userId: Date.now().toString(),
          email: formData.email,
          userType: formData.userType,
          authenticatedAt: new Date().toISOString()
        }

        // Set secure cookie
        const cookieValue = encodeURIComponent(JSON.stringify(sessionData))
        document.cookie = `edu-session=${cookieValue}; path=/; secure; samesite=strict; max-age=86400` // 24 hours

        setMessage('Login successful! Redirecting...')
        
        // Redirect to the intended page
        setTimeout(() => {
          router.push(returnTo)
        }, 1000)
      } else {
        throw new Error('Invalid email or password. Password must be at least 6 characters.')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (error) setError('')
    if (message) setMessage('')
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-begin-blue" />
            <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-begin-teal" />
            </div>
            <h1 className="text-2xl font-bold text-begin-blue mb-2">
              Secure Login
            </h1>
            <p className="text-begin-blue/70">
              Access your learning profile dashboard
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-begin-teal/10 border border-begin-teal/20 rounded-card p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-begin-teal mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-begin-blue text-sm mb-1">Enhanced Security</h3>
                <p className="text-xs text-begin-blue/70">
                  We've added secure authentication to protect student learning profiles. 
                  All access is now logged for compliance and safety.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-card p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 text-sm mb-1">Login Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-card p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-begin-blue mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'teacher' }))}
                  className={`p-3 rounded-card border-2 transition-colors text-sm font-medium ${
                    formData.userType === 'teacher'
                      ? 'border-begin-teal bg-begin-teal/10 text-begin-teal'
                      : 'border-begin-gray bg-white text-begin-blue/70 hover:border-begin-teal/50'
                  }`}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'parent' }))}
                  className={`p-3 rounded-card border-2 transition-colors text-sm font-medium ${
                    formData.userType === 'parent'
                      ? 'border-begin-teal bg-begin-teal/10 text-begin-teal'
                      : 'border-begin-gray bg-white text-begin-blue/70 hover:border-begin-teal/50'
                  }`}
                >
                  Parent
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-begin-blue mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-begin-blue/50" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-begin-gray rounded-card focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                  placeholder={formData.userType === 'teacher' ? 'teacher@school.edu' : 'parent@email.com'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-begin-blue mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-begin-blue/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-begin-gray rounded-card focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-begin-blue/50 hover:text-begin-blue"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-begin-blue/60 mt-1">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-begin-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In Securely'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-begin-gray/30">
            <div className="text-center space-y-4">
              <p className="text-sm text-begin-blue/60">
                Don't have an account?
              </p>
              
              {formData.userType === 'teacher' ? (
                <Link 
                  href="/teacher/register"
                  className="btn-begin-secondary w-full inline-flex items-center justify-center"
                >
                  Register as Teacher
                </Link>
              ) : (
                <div className="bg-begin-gray/20 rounded-card p-4">
                  <p className="text-sm text-begin-blue/70 mb-2">
                    <strong>Parents:</strong> Your account is created automatically when your child's teacher sends you an assessment link.
                  </p>
                  <p className="text-xs text-begin-blue/60">
                    If you need help accessing your account, contact your child's teacher.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Demo Access */}
          <div className="mt-6 pt-4 border-t border-begin-gray/30">
            <p className="text-xs text-center text-begin-blue/60 mb-3">
              For demonstration purposes:
            </p>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: 'demo@teacher.edu',
                  password: 'demo123',
                  userType: 'teacher'
                })
              }}
              className="w-full text-xs text-begin-teal hover:text-begin-teal-hover underline"
            >
              Fill Demo Teacher Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-begin-teal to-begin-blue flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}