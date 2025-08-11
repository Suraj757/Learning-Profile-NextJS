import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/auth/user-storage'

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
    const { email, password, userType } = await request.json()

    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, password, and user type are required' },
        { status: 400 }
      )
    }

    // Find user (check both registered and demo users)
    const user = getUserByEmail(email)
    
    if (!user || user.userType !== userType) {
      return NextResponse.json(
        { error: 'Invalid credentials or user type' },
        { status: 401 }
      )
    }

    // Check if user needs to set up password (existing users)
    if (user.needsPasswordSetup) {
      return NextResponse.json(
        { 
          error: 'Password setup required',
          needsPasswordSetup: true,
          userId: user.id,
          email: user.email
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
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      )
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      userType: user.userType,
      permissions: user.permissions
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
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
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      permissions: user.permissions,
      teacherData: teacherData  // Include complete teacher data
    }

    // Get IP address for audit logging
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Log successful login
    console.log(`[AUTH] Successful login: ${email} (${userType}) from ${ip}`)

    // Return success with session data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType
      },
      sessionData,
      message: 'Login successful'
    })

    // Set secure cookie
    const cookieValue = encodeURIComponent(JSON.stringify(sessionData))
    response.cookies.set('edu-session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    )
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