'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Mail, Lock, Eye, EyeOff, GraduationCap, AlertCircle, CheckCircle, Shield, Users } from 'lucide-react'

export default function TeacherLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: 'teacher'
        }),
      })

      const result = await response.json()

      if (!result.success) {
        // Handle specific error cases
        if (result.needsPasswordSetup) {
          // Redirect to password setup for existing users
          router.push(`/auth/setup-password?email=${encodeURIComponent(formData.email)}&userId=${result.userId}`)
          return
        }
        setError(result.error || 'Invalid email or password')
        return
      }

      // On successful login, the secure cookie is already set by the API
      // Redirect to teacher dashboard
      router.push('/teacher/dashboard')

    } catch (err: any) {
      console.error('Teacher login error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleForgotPassword = () => {
    // Navigate to forgot password page (implement separately)
    router.push('/teacher/forgot-password')
  }

  const handleGoogleSignIn = async () => {
    // Implement Google SSO later
    console.log('Google Sign-In clicked')
    // For now, show a coming soon message
    setError('Google Sign-In coming soon! Please use email/password for now.')
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8 lg:p-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-10 w-10 text-begin-teal" />
            </div>
            <h1 className="text-hero font-bold text-begin-blue mb-4">
              Teacher Sign In
            </h1>
            <p className="text-body-lg text-begin-blue/80 max-w-md mx-auto">
              Access your classroom dashboard to manage student learning profiles and track assessment progress.
            </p>
          </div>

          {/* FERPA Compliance Notice */}
          <div className="bg-begin-blue/5 border border-begin-blue/20 rounded-card p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-begin-blue flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-begin-blue text-sm mb-1">FERPA Compliant Platform</h3>
                <p className="text-xs text-begin-blue/70 leading-relaxed">
                  Your student data is protected under FERPA guidelines. All information is encrypted and stored securely.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-heading font-semibold text-begin-blue mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                School Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body transition-colors"
                placeholder="your.name@school.edu"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-heading font-semibold text-begin-blue mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body transition-colors"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-begin-teal hover:text-begin-teal-hover font-medium text-sm transition-colors"
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign In Button */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className="w-full btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-begin-gray"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-begin-blue/60">or</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-begin-gray text-begin-blue px-4 py-3 rounded-card hover:bg-begin-gray/30 transition-all duration-200 flex items-center justify-center gap-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="text-center mt-8 pt-6 border-t border-begin-gray">
            <p className="text-sm text-begin-blue/70 mb-4">
              New to Begin Learning Profile?
            </p>
            <Link 
              href="/teacher/register"
              className="btn-begin-secondary inline-flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Create Teacher Account
            </Link>
          </div>

          {/* Quick Demo Access */}
          <div className="mt-6">
            <div className="bg-gradient-to-r from-begin-cyan/10 to-begin-teal/10 border border-begin-teal/20 rounded-card p-6 text-center">
              <h3 className="font-bold text-begin-blue mb-2">🚀 Try the Demo First?</h3>
              <p className="text-sm text-begin-blue/70 mb-4">
                Explore the teacher dashboard with sample data before creating your account.
              </p>
              <Link
                href="/teacher/demo"
                className="text-begin-teal hover:text-begin-teal-hover font-semibold text-sm transition-colors"
              >
                Launch Demo Dashboard →
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-6 pt-4 border-t border-begin-gray/30">
            <p className="text-xs text-begin-blue/60">
              Having trouble signing in?{' '}
              <Link 
                href="/support" 
                className="text-begin-teal hover:text-begin-teal-hover font-medium transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}