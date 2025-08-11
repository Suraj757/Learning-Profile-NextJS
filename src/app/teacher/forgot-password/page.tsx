'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Mail, Send, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react'

export default function TeacherForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call forgot password API (you'll implement this separately)
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          userType: 'teacher'
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.message || 'Unable to send reset email. Please try again.')
        return
      }

      setSuccess(true)

    } catch (err: any) {
      console.error('Forgot password error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Clear error when user starts typing
    if (error) setError('')
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
              href="/teacher/login"
              className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8 lg:p-12">
          {!success ? (
            <>
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="h-10 w-10 text-begin-teal" />
                </div>
                <h1 className="text-hero font-bold text-begin-blue mb-4">
                  Reset Your Password
                </h1>
                <p className="text-body-lg text-begin-blue/80 max-w-md mx-auto">
                  Enter your school email address and we'll send you a link to reset your password.
                </p>
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

              {/* Reset Form */}
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
                    value={email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body transition-colors"
                    placeholder="your.name@school.edu"
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                  <p className="text-xs text-begin-blue/60 mt-2">
                    This should be the same email you used to create your teacher account.
                  </p>
                </div>

                {/* Send Reset Link Button */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Password Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* Additional Help */}
              <div className="mt-8 pt-6 border-t border-begin-gray text-center">
                <p className="text-sm text-begin-blue/70 mb-4">
                  Remember your password?
                </p>
                <Link 
                  href="/teacher/login"
                  className="text-begin-teal hover:text-begin-teal-hover font-semibold text-sm transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>

              {/* Contact Support */}
              <div className="text-center mt-6 pt-4 border-t border-begin-gray/30">
                <p className="text-xs text-begin-blue/60">
                  Still having trouble?{' '}
                  <Link 
                    href="/support" 
                    className="text-begin-teal hover:text-begin-teal-hover font-medium transition-colors"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </>
          ) : (
            // Success State
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-hero font-bold text-begin-blue mb-4">
                Check Your Email
              </h1>
              <p className="text-body-lg text-begin-blue/80 max-w-md mx-auto mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              
              <div className="bg-begin-blue/5 border border-begin-blue/20 rounded-card p-6 mb-8">
                <h3 className="font-semibold text-begin-blue mb-3">Next Steps:</h3>
                <ul className="text-sm text-begin-blue/80 space-y-2 text-left">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the reset link in the email</li>
                  <li>• Create your new password</li>
                  <li>• Sign in with your new password</li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="btn-begin-secondary"
                >
                  Send Another Email
                </button>
                
                <div className="pt-4">
                  <Link 
                    href="/teacher/login"
                    className="text-begin-teal hover:text-begin-teal-hover font-semibold text-sm transition-colors"
                  >
                    Return to Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}