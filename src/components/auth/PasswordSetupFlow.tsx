'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Shield, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Lock,
  Zap
} from 'lucide-react'

interface PasswordRequirement {
  key: string
  label: string
  test: (password: string) => boolean
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    key: 'length',
    label: 'At least 8 characters',
    test: (pwd) => pwd.length >= 8
  },
  {
    key: 'uppercase',
    label: 'One uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd)
  },
  {
    key: 'lowercase',
    label: 'One lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd)
  },
  {
    key: 'number',
    label: 'One number',
    test: (pwd) => /\d/.test(pwd)
  },
  {
    key: 'special',
    label: 'One special character (!@#$%^&*)',
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  }
]

interface PasswordSetupFlowProps {
  email?: string
  userId?: string
  onComplete?: () => void
  mode?: 'setup' | 'reset' | 'change'
  className?: string
}

export default function PasswordSetupFlow({
  email: propEmail,
  userId: propUserId,
  onComplete,
  mode = 'setup',
  className = ''
}: PasswordSetupFlowProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'setup' | 'success'>('setup')

  // Get email and userId from props or URL params
  const email = propEmail || searchParams.get('email') || ''
  const userId = propUserId || searchParams.get('userId') || searchParams.get('id') || ''

  // Calculate password strength
  const passwordRequirements = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(formData.password)
  }))

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  const allRequirementsMet = passwordRequirements.every(req => req.met)
  const canSubmit = allRequirementsMet && passwordsMatch && formData.password && formData.confirmPassword

  const getStrengthScore = () => {
    return passwordRequirements.filter(req => req.met).length
  }

  const getStrengthColor = () => {
    const score = getStrengthScore()
    if (score <= 2) return 'bg-red-500'
    if (score <= 4) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const getStrengthLabel = () => {
    const score = getStrengthScore()
    if (score <= 2) return 'Weak'
    if (score <= 4) return 'Good'
    return 'Strong'
  }

  useEffect(() => {
    if (!email) {
      setError('Email address is required for password setup')
    }
  }, [email])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit) return
    if (!email) {
      setError('Email address is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userId,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          mode
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Password setup failed')
      }

      setSuccess(true)
      setStep('success')
      
      if (onComplete) {
        onComplete()
      } else {
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push('/teacher/login?setup=success')
        }, 3000)
      }

    } catch (err: any) {
      console.error('Password setup error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <div className="card-begin p-8 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-heading-lg font-bold text-begin-blue mb-4">
            {mode === 'setup' ? 'Password Set Successfully!' : 
             mode === 'reset' ? 'Password Reset Successfully!' :
             'Password Updated Successfully!'}
          </h2>
          
          <p className="text-body text-begin-blue/70 mb-6">
            {mode === 'setup' 
              ? "Your account is now secure and ready to use. You'll be redirected to sign in shortly."
              : "You can now use your new password to sign in to your account."}
          </p>

          <div className="bg-begin-teal/5 border border-begin-teal/20 rounded-card p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-begin-teal flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h4 className="font-semibold text-begin-teal text-sm mb-1">Security Tip</h4>
                <p className="text-xs text-begin-blue/70">
                  Keep your password secure and don't share it with others. Your student data is protected under FERPA guidelines.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/teacher/login"
              className="btn-begin-primary w-full inline-flex items-center justify-center gap-2"
            >
              Continue to Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              href="/"
              className="text-begin-teal hover:text-begin-teal-hover text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="card-begin p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-begin-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound className="h-8 w-8 text-begin-teal" />
          </div>
          <h1 className="text-heading-lg font-bold text-begin-blue mb-4">
            {mode === 'setup' ? 'Set Up Your Password' : 
             mode === 'reset' ? 'Create New Password' :
             'Change Your Password'}
          </h1>
          <p className="text-body text-begin-blue/70">
            {mode === 'setup' 
              ? "Secure your teacher account with a strong password to protect student data."
              : "Choose a strong password to keep your account secure."}
          </p>
          {email && (
            <p className="text-sm text-begin-blue/60 mt-2 font-mono bg-begin-cream/50 px-3 py-1 rounded-card">
              {email}
            </p>
          )}
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

        {/* Password Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-heading font-semibold text-begin-blue mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body transition-colors"
                placeholder="Create a strong password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-begin-blue">
                    Password Strength: {getStrengthLabel()}
                  </span>
                  <span className="text-xs text-begin-blue/60">
                    {getStrengthScore()}/5 requirements met
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${(getStrengthScore() / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Password Requirements */}
          {formData.password && (
            <div className="bg-begin-cream/30 rounded-card p-4">
              <h4 className="text-sm font-semibold text-begin-blue mb-3">Password Requirements</h4>
              <div className="space-y-2">
                {passwordRequirements.map((req) => (
                  <div key={req.key} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      req.met ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      {req.met ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <span className={`text-sm ${req.met ? 'text-green-700' : 'text-begin-blue/60'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-heading font-semibold text-begin-blue mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 border rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent text-body transition-colors ${
                  formData.confirmPassword && !passwordsMatch 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-begin-gray'
                }`}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-2 flex items-center gap-2">
                {passwordsMatch ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Setting Up Password...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                {mode === 'setup' ? 'Set Password & Continue' : 
                 mode === 'reset' ? 'Reset Password' :
                 'Update Password'}
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="bg-begin-blue/5 border border-begin-blue/20 rounded-card p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-begin-blue flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-begin-blue text-sm mb-1">FERPA Compliant Security</h4>
                <p className="text-xs text-begin-blue/70 leading-relaxed">
                  Your password is encrypted and stored securely. We never share your login information, 
                  and all student data is protected under FERPA guidelines.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6 pt-4 border-t border-begin-gray/30">
          <Link 
            href="/teacher/login"
            className="text-begin-teal hover:text-begin-teal-hover text-sm font-medium transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}