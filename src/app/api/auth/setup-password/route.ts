import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, updateUser } from '@/lib/auth/user-storage'
import { validatePassword, validateEducationalEmail } from '@/lib/auth/password-validation'

// Shared user storage is now imported from @/lib/auth/user-storage

interface PasswordSetupData {
  email: string
  password: string
  confirmPassword: string
}

// Enhanced validation helper with UX-informed password policy
function validatePasswordSetup(data: PasswordSetupData): { 
  isValid: boolean; 
  errors: string[]; 
  suggestions: string[];
  warnings: string[];
} {
  const errors: string[] = []
  const suggestions: string[] = []
  const warnings: string[] = []

  // Email validation with educational context
  const emailValidation = validateEducationalEmail(data.email)
  if (!emailValidation.isValid) {
    errors.push('Valid email address is required')
  }
  
  // Add educational email context
  if (emailValidation.warnings.length > 0) {
    warnings.push(...emailValidation.warnings)
  }
  if (emailValidation.suggestions.length > 0) {
    suggestions.push(...emailValidation.suggestions)
  }

  // Password confirmation check
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match - please retype your password carefully')
  }

  // Enhanced password validation with educational context
  if (data.password) {
    const passwordValidation = validatePassword(data.password, data.email)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }
    if (passwordValidation.suggestions.length > 0) {
      suggestions.push(...passwordValidation.suggestions)
    }
    
    // Add strength feedback
    if (passwordValidation.strength === 'weak') {
      suggestions.push('Try making your password longer or use a memorable phrase')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    warnings
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: PasswordSetupData = await request.json()

    // Enhanced validation with UX feedback
    const validation = validatePasswordSetup(data)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          errors: validation.errors,
          suggestions: validation.suggestions,
          warnings: validation.warnings,
          field: validation.errors[0]?.includes('email') ? 'email' : 
                 validation.errors[0]?.includes('match') ? 'confirmPassword' : 'password'
        },
        { status: 400 }
      )
    }

    // Find user with enhanced error messaging
    const user = getUserByEmail(data.email)
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'We couldn\'t find an account with this email address. Please check the email and try again, or contact support if you need assistance.',
          field: 'email',
          suggestions: ['Double-check your email address for typos', 'Contact your administrator if you\'re unsure about your account']
        },
        { status: 404 }
      )
    }

    // Check if user needs password setup
    if (!user.needsPasswordSetup) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Your password has already been set up. You can now use the regular login page.',
          action: 'redirect_to_login',
          message: 'We\'ll redirect you to the login page where you can sign in with your existing password.'
        },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(data.password, saltRounds)

    // Update user with new password
    const updateSuccess = updateUser(data.email, {
      passwordHash: hashedPassword,
      needsPasswordSetup: false,
      passwordSetupAt: new Date().toISOString()
    })

    // Debug: Log the update result and user state
    console.log(`[DEBUG] Update success: ${updateSuccess}`)
    console.log(`[DEBUG] User after update:`, getUserByEmail(data.email))

    if (!updateSuccess) {
      return NextResponse.json(
        { 
          success: false,
          error: 'We encountered an issue saving your password. Please try again, or contact support if the problem persists.',
          field: 'system',
          suggestions: ['Try again in a moment', 'Contact support if this continues to happen']
        },
        { status: 500 }
      )
    }

    // Get IP address for audit logging
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    // Log password setup
    console.log(`[AUTH] Password setup completed: ${data.email} from ${ip}`)

    // Enhanced success response
    const emailValidation = validateEducationalEmail(data.email)
    
    return NextResponse.json({
      success: true,
      message: emailValidation.isEduDomain 
        ? 'Welcome to the educational platform! Your password has been set up successfully. You now have access to all teacher features.'
        : 'Password set up successfully! You can now log in to access your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isEduDomain: emailValidation.isEduDomain
      },
      nextStep: {
        action: 'redirect_to_login',
        message: 'We\'ll redirect you to the login page where you can sign in with your new password.'
      },
      setupCompleted: true
    })

  } catch (error) {
    console.error('Password setup error:', error)
    
    const errorResponse = {
      success: false,
      error: 'We\'re experiencing technical difficulties with password setup. Please try again in a moment.',
      field: 'system',
      suggestions: ['Try again in a few minutes', 'Contact support if this issue persists']
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = `Password setup error: ${error.message}`
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// GET endpoint to check if user needs password setup
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const user = getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { needsSetup: false, exists: false }
      )
    }

    const emailValidation = validateEducationalEmail(email)
    
    return NextResponse.json({
      needsSetup: user.needsPasswordSetup || false,
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isEduDomain: emailValidation.isEduDomain
      },
      context: {
        isEduDomain: emailValidation.isEduDomain,
        message: user.needsPasswordSetup 
          ? 'Please set up your password to complete account activation'
          : 'Account is already set up and ready to use'
      }
    })

  } catch (error) {
    console.error('Password setup check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}