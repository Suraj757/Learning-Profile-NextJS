import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/auth/user-storage'
import { validateEducationalEmail, isEduDomain } from '@/lib/auth/password-validation'

// Password verification function
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Simple password check for demo users (legacy)
function simpleHashCheck(password: string, expectedPassword: string): boolean {
  // For demo purposes, allow simple password matching
  return password === expectedPassword
}

// Shared user storage is now imported from @/lib/auth/user-storage

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'demo-secret-key-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType, rememberMe } = await request.json()

    if (!email || !password || !userType) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email, password, and user type are required',
          field: 'validation'
        },
        { status: 400 }
      )
    }

    // Validate email format and educational context
    const emailValidation = validateEducationalEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Please enter a valid email address',
          field: 'email'
        },
        { status: 400 }
      )
    }

    // Find user (check both registered and demo users)
    const user = getUserByEmail(email)
    
    if (!user) {
      // Enhanced error message for teachers
      const errorMessage = userType === 'teacher' 
        ? 'We couldn\'t find an account with this email. Would you like to create a new teacher account?'
        : 'Invalid email or password. Please check your credentials and try again.'
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          field: 'email',
          isEduDomain: emailValidation.isEduDomain,
          suggestions: userType === 'teacher' ? ['Check for typos in your email', 'Try registering for a new account'] : []
        },
        { status: 401 }
      )
    }
    
    if (user.userType !== userType) {
      const correctType = user.userType === 'teacher' ? 'Teacher' : 'Parent'
      return NextResponse.json(
        { 
          success: false,
          error: `This email is registered as a ${correctType} account. Please select the correct account type.`,
          field: 'userType',
          correctUserType: user.userType
        },
        { status: 401 }
      )
    }

    // Check if user needs to set up password (existing users)
    if (user.needsPasswordSetup) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Welcome! Please set up your password to complete account setup.',
          needsPasswordSetup: true,
          userId: user.id,
          email: user.email,
          isEduDomain: emailValidation.isEduDomain,
          message: 'We\'ll redirect you to password setup in just a moment.'
        },
        { status: 401 }
      )
    }

    // Verify password
    let passwordValid = false
    
    if (user.passwordHash) {
      // Use bcrypt for registered users
      passwordValid = await verifyPassword(password, user.passwordHash)
    } else if (user.password) {
      // Use simple check for demo users
      passwordValid = simpleHashCheck(password, user.password)
    }
    
    if (!passwordValid) {
      // Rate limiting check (simple implementation)
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      console.log(`[AUTH] Failed login attempt: ${email} from ${ip}`)
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Incorrect password. Please check your password and try again.',
          field: 'password',
          suggestions: [
            'Make sure Caps Lock is off',
            'Try typing your password in a text editor first',
            'Use the "Forgot Password" link if you need to reset it'
          ]
        },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Your account has been deactivated. Please contact your administrator for assistance.',
          field: 'account',
          contactInfo: 'If you believe this is an error, please contact support.'
        },
        { status: 403 }
      )
    }

    // Determine session duration based on rememberMe
    const sessionDuration = rememberMe ? '7d' : '24h'
    const sessionMaxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60 // seconds
    
    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      userType: user.userType,
      permissions: user.permissions,
      isEduDomain: emailValidation.isEduDomain
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(sessionDuration)
      .sign(JWT_SECRET)

    // Extract numeric ID for the teacher
    let numericId = Date.now() // fallback
    
    // First check if user has a stored numericId (from registration)
    if (user.numericId) {
      numericId = user.numericId
      console.log('Using stored numericId from registration:', numericId)
    } else if (user.id.includes('teacher_suraj_plus_001')) {
      numericId = 1001 // Specific ID for test account 1
    } else if (user.id.includes('teacher_suraj_plus_002')) {
      numericId = 1002 // Specific ID for test account 2
    } else if (user.id.includes('teacher_suraj_001')) {
      numericId = 1000 // Specific ID for main account
    } else if (user.id.includes('teacher_')) {
      // Try to extract from user ID
      const idParts = user.id.split('_')
      if (idParts.length > 1 && idParts[1] !== 'suraj') {
        const extracted = parseInt(idParts[1])
        if (!isNaN(extracted)) numericId = extracted
      }
    }

    // Create teacher data for session
    const teacherData = {
      id: numericId,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      school: user.school || '',
      grade_level: user.grade_level || '',
      ambassador_status: false,
      created_at: new Date().toISOString(),
      isOfflineDemo: user.email.includes('demo') && !user.email.includes('speakaboos.com')
    }

    // Create session data
    const sessionData = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      name: user.name,
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + sessionMaxAge * 1000).toISOString(),
      rememberMe: rememberMe || false,
      isEduDomain: emailValidation.isEduDomain
      permissions: user.permissions,
      teacherData: teacherData  // Include complete teacher data
    }

    // Get IP address for audit logging
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Enhanced login logging with context
    console.log(`[AUTH] Successful login: ${email} (${userType}) from ${ip}`, {
      userId: user.id,
      isEduDomain: emailValidation.isEduDomain,
      rememberMe: rememberMe || false,
      sessionDuration: sessionDuration,
      userAgent: request.headers.get('user-agent')?.substring(0, 100) || 'unknown'
    })

    // Return success with enhanced session data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isVerified: user.isVerified || false,
        school: user.school || null,
        gradeLevel: user.grade_level || null
      },
      sessionData,
      context: {
        isEduDomain: emailValidation.isEduDomain,
        hasRealData: !user.email.includes('demo') || user.email.includes('speakaboos.com'),
        isOfflineDemo: user.email.includes('demo') && !user.email.includes('speakaboos.com')
      },
      message: emailValidation.isEduDomain 
        ? 'Welcome back! You\'re logged in with full educational features.'
        : 'Welcome back! You\'re logged in successfully.'
    })

    // Set secure cookie with dynamic duration
    const cookieValue = encodeURIComponent(JSON.stringify(sessionData))
    response.cookies.set('edu-session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionMaxAge,
      path: '/'
    })
    
    // ALSO set a client-readable session cookie for auth state
    const clientSessionData = {
      userId: sessionData.userId,
      email: sessionData.email,
      userType: sessionData.userType,
      authenticatedAt: sessionData.authenticatedAt,
      expiresAt: sessionData.expiresAt
    }
    response.cookies.set('edu-session-client', encodeURIComponent(JSON.stringify(clientSessionData)), {
      httpOnly: false, // Client-readable
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionMaxAge,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    // Enhanced error response for development
    const errorResponse = {
      success: false,
      error: 'We\'re experiencing technical difficulties. Please try again in a moment.',
      field: 'system'
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = `System error: ${error.message}`
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Check current session status
  try {
    const sessionCookie = request.cookies.get('edu-session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false })
    }

    const sessionData = JSON.parse(decodeURIComponent(sessionCookie))
    
    // Check if session is expired
    const now = new Date()
    const expiresAt = new Date(sessionData.expiresAt)
    
    if (now > expiresAt) {
      return NextResponse.json({ 
        authenticated: false, 
        reason: 'Session expired' 
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name,
        userType: sessionData.userType
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      authenticated: false, 
      reason: 'Invalid session' 
    })
  }
}