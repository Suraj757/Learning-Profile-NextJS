import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/auth/user-storage'

export async function GET(request: NextRequest) {
  try {
    // Check for client session cookie first
    const clientSessionCookie = request.cookies.get('edu-session-client')?.value
    const sessionCookie = request.cookies.get('edu-session')?.value
    
    if (!clientSessionCookie && !sessionCookie) {
      return NextResponse.json({ 
        authenticated: false,
        reason: 'No session found'
      })
    }

    let sessionData: any = null

    // Try client session first
    if (clientSessionCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(clientSessionCookie))
      } catch (error) {
        console.error('Error parsing client session:', error)
      }
    }

    // Fallback to secure session
    if (!sessionData && sessionCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(sessionCookie))
      } catch (error) {
        console.error('Error parsing session:', error)
        return NextResponse.json({ 
          authenticated: false, 
          reason: 'Invalid session data' 
        })
      }
    }

    if (!sessionData) {
      return NextResponse.json({ 
        authenticated: false, 
        reason: 'No valid session data' 
      })
    }
    
    // Check if session is expired
    const now = new Date()
    const expiresAt = new Date(sessionData.expiresAt)
    
    if (now > expiresAt) {
      return NextResponse.json({ 
        authenticated: false, 
        reason: 'Session expired',
        expiredAt: sessionData.expiresAt
      })
    }

    // Get user details from storage
    const user = getUserByEmail(sessionData.email)
    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        reason: 'User not found' 
      })
    }

    // Check if user is still active
    if (!user.isActive) {
      return NextResponse.json({ 
        authenticated: false, 
        reason: 'Account deactivated' 
      })
    }

    // Determine data state (demo vs real)
    const isOfflineDemo = user.email.includes('demo') && !user.email.includes('speakaboos.com')
    const isDemoData = user.email.includes('demo') || user.id.includes('demo')
    const hasRealData = user.email.includes('speakaboos.com') || user.school || user.grade_level
    
    // Educational domain detection
    const isEduDomain = user.email.toLowerCase().endsWith('.edu') || 
                       user.email.toLowerCase().includes('.k12.') ||
                       user.email.toLowerCase().includes('.school.')

    // Session health metrics
    const sessionAge = now.getTime() - new Date(sessionData.authenticatedAt).getTime()
    const sessionAgeHours = Math.floor(sessionAge / (1000 * 60 * 60))
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        school: user.school || null,
        gradeLevel: user.grade_level || null,
        isVerified: user.isVerified || false,
        needsPasswordSetup: user.needsPasswordSetup || false
      },
      session: {
        authenticatedAt: sessionData.authenticatedAt,
        expiresAt: sessionData.expiresAt,
        ageHours: sessionAgeHours,
        remainingHours: Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
      },
      dataState: {
        isOfflineDemo,
        isDemoData,
        hasRealData,
        isEduDomain,
        dataSource: isOfflineDemo ? 'offline_demo' : 
                   isDemoData ? 'demo_data' : 
                   hasRealData ? 'real_data' : 'unknown'
      },
      permissions: user.permissions || {},
      features: {
        hasFullAccess: user.isVerified && user.isActive,
        canViewStudentData: user.permissions?.canViewStudentProfiles || false,
        canExportData: user.permissions?.canExportStudentData || false,
        isEducationalAccount: isEduDomain || hasRealData
      }
    })

  } catch (error) {
    console.error('Session status error:', error)
    return NextResponse.json({ 
      authenticated: false, 
      reason: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// POST endpoint for session refresh/extension
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'refresh') {
      // Get current session
      const sessionCookie = request.cookies.get('edu-session')?.value
      const clientSessionCookie = request.cookies.get('edu-session-client')?.value
      
      if (!sessionCookie || !clientSessionCookie) {
        return NextResponse.json({ 
          success: false,
          error: 'No active session to refresh' 
        }, { status: 401 })
      }

      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie))
        const clientSessionData = JSON.parse(decodeURIComponent(clientSessionCookie))
        
        // Verify session is still valid
        const now = new Date()
        const expiresAt = new Date(sessionData.expiresAt)
        
        if (now > expiresAt) {
          return NextResponse.json({ 
            success: false,
            error: 'Session expired, please login again' 
          }, { status: 401 })
        }
        
        // Extend session by 24 hours
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
        
        sessionData.expiresAt = newExpiresAt.toISOString()
        clientSessionData.expiresAt = newExpiresAt.toISOString()
        
        const response = NextResponse.json({
          success: true,
          message: 'Session refreshed successfully',
          expiresAt: newExpiresAt.toISOString()
        })
        
        // Update both cookies
        response.cookies.set('edu-session', encodeURIComponent(JSON.stringify(sessionData)), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60,
          path: '/'
        })
        
        response.cookies.set('edu-session-client', encodeURIComponent(JSON.stringify(clientSessionData)), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60,
          path: '/'
        })
        
        // Log session refresh
        const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
        console.log(`[AUTH] Session refreshed: ${sessionData.email} from ${ip}`)
        
        return response
        
      } catch (error) {
        console.error('Session refresh error:', error)
        return NextResponse.json({ 
          success: false,
          error: 'Invalid session data' 
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Unknown action' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('Session action error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}