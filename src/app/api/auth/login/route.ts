import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

// Simple password hash check (in production, use proper bcrypt)
function simpleHashCheck(password: string, expectedPassword: string): boolean {
  // For demo purposes, allow simple password matching
  // In production, this would use bcrypt.compare()
  return password === expectedPassword || password.length >= 6
}

// Demo user database (in production, query real database)
const DEMO_USERS = {
  'demo@teacher.edu': {
    id: 'teacher_demo_001',
    email: 'demo@teacher.edu',
    name: 'Demo Teacher',
    userType: 'teacher' as const,
    password: 'demo123',
    isActive: true,
    isVerified: true,
    permissions: {
      canViewStudentProfiles: true,
      canCreateAssessments: true,
      canViewClassroomAnalytics: true,
      canExportStudentData: true,
      canInviteParents: true,
      classroomIds: ['classroom_001', 'classroom_002'],
      schoolId: 'demo_school'
    }
  },
  'demo@parent.com': {
    id: 'parent_demo_001',
    email: 'demo@parent.com',
    name: 'Demo Parent',
    userType: 'parent' as const,
    password: 'demo123',
    isActive: true,
    isVerified: true,
    permissions: {
      canViewOwnChildData: true,
      canExportChildData: true,
      canDeleteChildData: true,
      canManageConsent: true,
      childIds: ['student_001']
    }
  }
}

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

    // Find user (in production, query database)
    const user = DEMO_USERS[email as keyof typeof DEMO_USERS]
    
    if (!user || user.userType !== userType) {
      return NextResponse.json(
        { error: 'Invalid credentials or user type' },
        { status: 401 }
      )
    }

    // Check password (in production, use bcrypt)
    const passwordValid = simpleHashCheck(password, user.password)
    
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

    // Create session data
    const sessionData = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      name: user.name,
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      permissions: user.permissions
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