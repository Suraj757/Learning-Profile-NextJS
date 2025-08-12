import { NextRequest, NextResponse } from 'next/server'

// Enhanced logout endpoint with comprehensive cleanup and audit logging

export async function POST(request: NextRequest) {
  try {
    // Get current session for enhanced logging
    const sessionCookie = request.cookies.get('edu-session')?.value
    const clientSessionCookie = request.cookies.get('edu-session-client')?.value
    let userEmail = 'unknown'
    let userType = 'unknown'
    let sessionDuration = 0
    
    // Try to get session info from either cookie
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie))
        userEmail = sessionData.email || 'unknown'
        userType = sessionData.userType || 'unknown'
        
        // Calculate session duration
        if (sessionData.authenticatedAt) {
          sessionDuration = Date.now() - new Date(sessionData.authenticatedAt).getTime()
        }
      } catch (error) {
        console.warn('Error parsing session for logout logging:', error)
      }
    } else if (clientSessionCookie) {
      try {
        const clientData = JSON.parse(decodeURIComponent(clientSessionCookie))
        userEmail = clientData.email || 'unknown'
        userType = clientData.userType || 'unknown'
        
        if (clientData.authenticatedAt) {
          sessionDuration = Date.now() - new Date(clientData.authenticatedAt).getTime()
        }
      } catch (error) {
        console.warn('Error parsing client session for logout logging:', error)
      }
    }

    // Enhanced audit logging
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const sessionDurationMinutes = Math.round(sessionDuration / (1000 * 60))

    console.log(`[AUTH] User logout: ${userEmail} (${userType}) from ${ip}`, {
      sessionDurationMinutes,
      userAgent: userAgent.substring(0, 100),
      timestamp: new Date().toISOString()
    })

    // Create enhanced response
    const response = NextResponse.json({
      success: true,
      message: 'You have been logged out successfully. Thank you for using our educational platform!',
      sessionInfo: {
        duration: sessionDurationMinutes > 0 ? `${sessionDurationMinutes} minutes` : 'Less than a minute',
        loggedOutAt: new Date().toISOString()
      }
    })

    // Clear all session-related cookies comprehensively
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 0, // Immediately expire
      path: '/'
    }
    
    // Clear server-side session cookie
    response.cookies.set('edu-session', '', cookieOptions)
    
    // Clear client-readable session cookie
    response.cookies.set('edu-session-client', '', {
      ...cookieOptions,
      httpOnly: false // Client-readable
    })
    
    // Clear any potential legacy cookies
    response.cookies.set('teacher-session', '', cookieOptions)
    response.cookies.set('auth-token', '', cookieOptions)

    return response

  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, ensure all cookies are cleared
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      note: 'Session cleared despite technical issues'
    })

    // Clear all possible session cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/'
    }
    
    response.cookies.set('edu-session', '', cookieOptions)
    response.cookies.set('edu-session-client', '', { ...cookieOptions, httpOnly: false })
    response.cookies.set('teacher-session', '', cookieOptions)
    response.cookies.set('auth-token', '', cookieOptions)

    return response
  }
}