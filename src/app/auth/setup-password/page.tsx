'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'

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

function PasswordSetupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [formData, setFormData] = useState({
    email: email,
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  // Check if user needs password setup
  useEffect(() => {
    if (email) {
      checkPasswordSetupNeeded(email)
    }
  }, [email])

  const checkPasswordSetupNeeded = async (email: string) => {
    try {
      const response = await fetch(`/api/auth/setup-password?email=${encodeURIComponent(email)}`)
      const result = await response.json()
      
      if (result.exists && result.needsSetup) {
        setUserInfo(result.user)
        setFormData(prev => ({ ...prev, email }))
      } else if (result.exists && !result.needsSetup) {
        router.push('/auth/login?message=password_already_set')
      } else {
        router.push('/auth/login?message=user_not_found')
      }
    } catch (error) {
      console.error('Error checking password setup status:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)

    try {
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        setErrors(result.errors || ['Password setup failed'])
        return
      }

      setSuccess(result.message || 'Password set up successfully!')
      
      // Clear form on success
      setFormData({
        email: '',
        password: '',
        confirmPassword: ''
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login?message=password_setup_complete')
      }, 2000)

    } catch (err: any) {
      console.error('Password setup error:', err)
      setErrors(['Something went wrong. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear messages when user starts typing
    if (errors.length > 0) setErrors([])
    if (success) setSuccess('')
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-begin-teal to-begin-blue flex items-center justify-center">
        <div className="card-begin p-8 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-begin-blue mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">
            This password setup link is invalid or expired. Please request a new one.
          </p>
          <Link 
            href="/auth/login"
            className="btn-begin-primary w-full text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-begin-teal to-begin-blue">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
            <Link 
              href="/auth/login"
              className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="card-begin p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-begin-teal/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-begin-teal" />
            </div>
            <h2 className="text-2xl font-bold text-begin-blue">Set Up Your Password</h2>
            {userInfo && (
              <div className="mt-4 p-4 bg-begin-blue/5 rounded-card">
                <p className="text-sm text-begin-blue">
                  <strong>Welcome, {userInfo.name}!</strong>
                </p>
                <p className="text-xs text-begin-blue/70 mt-1">
                  Please create a secure password for your account: {userInfo.email}
                </p>
              </div>
            )}
          </div>

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
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-begin-blue mb-2">
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
                  className="w-full px-4 py-3 pr-12 border border-begin-gray rounded-card focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                  placeholder="Create a strong password"
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
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-begin-blue mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-begin-gray rounded-card focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                  placeholder="Confirm your password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.password || formData.password !== formData.confirmPassword}
              className="w-full btn-begin-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up password...' : 'Set Up Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function PasswordSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-begin-teal to-begin-blue flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PasswordSetupForm />
    </Suspense>
  )
}