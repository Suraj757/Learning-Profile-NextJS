'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')
    
    if (!tokenParam || !emailParam) {
      setError('Invalid or missing reset link. Please request a new password reset.')
      return
    }
    
    setToken(tokenParam)
    setEmail(decodeURIComponent(emailParam))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Password reset failed')
        return
      }

      setSuccess('Password reset successful! Redirecting to login...')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/teacher/login?message=password_reset_success')
      }, 3000)

    } catch (err: any) {
      console.error('Password reset error:', err)
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
    if (error) setError('')
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, text: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    const strengthMap = {
      0: { text: 'Very Weak', color: 'text-red-500' },
      1: { text: 'Weak', color: 'text-red-400' },
      2: { text: 'Fair', color: 'text-yellow-500' },
      3: { text: 'Good', color: 'text-blue-500' },
      4: { text: 'Strong', color: 'text-green-500' },
      5: { text: 'Very Strong', color: 'text-green-600' }
    }
    
    return { strength, ...strengthMap[strength as keyof typeof strengthMap] }
  }

  const passwordStrength = getPasswordStrength()

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="card-begin p-8 max-w-md w-full mx-4 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-heading-lg font-bold text-begin-blue mb-4">Invalid Reset Link</h1>
          <p className="text-begin-blue/80 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link 
            href="/teacher/forgot-password"
            className="btn-begin-primary"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
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
              className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-begin-teal" />
            </div>
            <h1 className="text-heading-lg font-bold text-begin-blue mb-2">
              Reset Your Password
            </h1>
            <p className="text-begin-blue/80">
              Enter your new password for <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-card">
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-heading font-semibold text-begin-blue mb-2">
                <Lock className="h-5 w-5 inline mr-2" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                  placeholder="Enter your new password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i}
                          className={`h-1 w-4 rounded ${
                            i <= passwordStrength.strength 
                              ? passwordStrength.color.replace('text-', 'bg-')
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Password should be at least 8 characters with uppercase, lowercase, and numbers
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-heading font-semibold text-begin-blue mb-2">
                <Lock className="h-5 w-5 inline mr-2" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body"
                  placeholder="Confirm your new password"
                  required
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

            <button
              type="submit"
              disabled={loading || !formData.password || formData.password !== formData.confirmPassword}
              className="w-full btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-begin-gray">
            <p className="text-sm text-begin-blue/70">
              Remember your password?{' '}
              <Link 
                href="/teacher/login" 
                className="text-begin-teal hover:text-begin-teal-hover font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}