import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, updateUser } from '@/lib/auth/user-storage'

// Shared user storage is now imported from @/lib/auth/user-storage

interface PasswordSetupData {
  email: string
  password: string
  confirmPassword: string
}

// Validation helper
function validatePasswordSetup(data: PasswordSetupData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Valid email address is required')
  }

  // Password validation
  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match')
  }

  // Password strength validation
  const hasUpperCase = /[A-Z]/.test(data.password)
  const hasLowerCase = /[a-z]/.test(data.password)
  const hasNumber = /\d/.test(data.password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    errors.push('Password must contain uppercase, lowercase, and number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: PasswordSetupData = await request.json()

    // Validate input data
    const validation = validatePasswordSetup(data)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          errors: validation.errors 
        },
        { status: 400 }
      )
    }

    // Find user
    const user = getUserByEmail(data.email)
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          errors: ['User not found'] 
        },
        { status: 404 }
      )
    }

    // Check if user needs password setup
    if (!user.needsPasswordSetup) {
      return NextResponse.json(
        { 
          success: false,
          errors: ['Password already set up'] 
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
          errors: ['Failed to update user password'] 
        },
        { status: 500 }
      )
    }

    // Get IP address for audit logging
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    // Log password setup
    console.log(`[AUTH] Password setup completed: ${data.email} from ${ip}`)

    return NextResponse.json({
      success: true,
      message: 'Password set up successfully! You can now log in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    })

  } catch (error) {
    console.error('Password setup error:', error)
    return NextResponse.json(
      { 
        success: false,
        errors: ['Internal server error during password setup'] 
      },
      { status: 500 }
    )
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

    return NextResponse.json({
      needsSetup: user.needsPasswordSetup || false,
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType
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