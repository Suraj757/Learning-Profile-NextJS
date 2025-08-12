// Authentication middleware with FERPA compliance and educational context
import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from './user-storage'

export interface AuthContext {
  isAuthenticated: boolean
  user?: any
  session?: any
  permissions?: any
  educationalContext: {
    isEduDomain: boolean
    hasRealData: boolean
    isOfflineDemo: boolean
    dataSource: 'offline_demo' | 'demo_data' | 'real_data' | 'unknown'
  }
  securityLevel: 'low' | 'medium' | 'high'
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean
  requireVerification?: boolean
  allowedUserTypes?: ('teacher' | 'parent' | 'admin')[]
  requirePermissions?: string[]
  educationalDataAccess?: boolean
  ferpaCompliant?: boolean
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function authMiddleware(
  request: NextRequest, 
  options: AuthMiddlewareOptions = {}
): Promise<{ context: AuthContext; response?: NextResponse }> {
  
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  try {
    // Rate limiting check
    const rateLimitResult = checkRateLimit(ip)
    if (!rateLimitResult.allowed) {
      return {
        context: {
          isAuthenticated: false,
          educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },
          securityLevel: 'low'
        },
        response: NextResponse.json({
          error: 'Too many requests. Please wait before trying again.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }, { status: 429 })
      }
    }

    // Extract session from cookies
    const sessionCookie = request.cookies.get('edu-session')?.value
    const clientSessionCookie = request.cookies.get('edu-session-client')?.value
    
    let sessionData: any = null
    
    if (sessionCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(sessionCookie))
      } catch (error) {
        console.warn('Invalid session cookie format')
      }
    }
    
    // Fallback to client session
    if (!sessionData && clientSessionCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(clientSessionCookie))
      } catch (error) {
        console.warn('Invalid client session cookie format')
      }
    }
    
    // No session found
    if (!sessionData) {
      if (options.requireAuth) {
        return {
          context: {
            isAuthenticated: false,
            educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },
            securityLevel: 'low'
          },
          response: NextResponse.json({
            error: 'Authentication required. Please log in to access this resource.',
            loginRequired: true
          }, { status: 401 })
        }
      }
      
      return {
        context: {
          isAuthenticated: false,
          educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },
          securityLevel: 'low'
        }
      }
    }
    
    // Check session expiration
    const now = new Date()
    const expiresAt = new Date(sessionData.expiresAt)
    
    if (now > expiresAt) {
      if (options.requireAuth) {
        return {
          context: {
            isAuthenticated: false,
            educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },
            securityLevel: 'low'
          },
          response: NextResponse.json({
            error: 'Your session has expired. Please log in again.',
            sessionExpired: true,
            expiredAt: sessionData.expiresAt
          }, { status: 401 })
        }
      }
      
      return {
        context: {
          isAuthenticated: false,
          educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },
          securityLevel: 'low'
        }
      }
    }
    
    // Get user from storage
    const user = getUserByEmail(sessionData.email)
    if (!user) {
      if (options.requireAuth) {
        return {
          context: {
            isAuthenticated: false,
            educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },
            securityLevel: 'low'
          },
          response: NextResponse.json({
            error: 'User account not found. Please contact support.',
            userNotFound: true
          }, { status: 401 })
        }
      }
      
      return {
        context: {
          isAuthenticated: false,
          educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },
          securityLevel: 'low'
        }
      }
    }
    
    // Check if user is active
    if (!user.isActive) {
      return {
        context: {
          isAuthenticated: false,
          educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },
          securityLevel: 'low'
        },
        response: NextResponse.json({
          error: 'Your account has been deactivated. Please contact your administrator.',
          accountDeactivated: true
        }, { status: 403 })
      }
    }
    
    // Check verification requirement
    if (options.requireVerification && !user.isVerified) {
      return {
        context: {
          isAuthenticated: true,
          user,
          session: sessionData,
          educationalContext: getEducationalContext(user),
          securityLevel: 'low'
        },
        response: NextResponse.json({
          error: 'Email verification required. Please check your email and verify your account.',
          verificationRequired: true,
          email: user.email
        }, { status: 403 })
      }
    }
    
    // Check user type restrictions
    if (options.allowedUserTypes && !options.allowedUserTypes.includes(user.userType)) {
      return {
        context: {
          isAuthenticated: true,
          user,
          session: sessionData,
          educationalContext: getEducationalContext(user),
          securityLevel: 'medium'
        },
        response: NextResponse.json({
          error: `This resource is only available to ${options.allowedUserTypes.join(' and ')} accounts.`,
          insufficientRole: true,
          userType: user.userType,
          requiredTypes: options.allowedUserTypes
        }, { status: 403 })
      }
    }
    
    // Check specific permissions
    if (options.requirePermissions && options.requirePermissions.length > 0) {
      const hasPermissions = options.requirePermissions.every(permission => 
        user.permissions && user.permissions[permission]
      )
      
      if (!hasPermissions) {
        return {
          context: {
            isAuthenticated: true,
            user,
            session: sessionData,
            educationalContext: getEducationalContext(user),
            securityLevel: 'medium'
          },
          response: NextResponse.json({
            error: 'You do not have permission to access this resource.',
            insufficientPermissions: true,
            requiredPermissions: options.requirePermissions,
            userPermissions: Object.keys(user.permissions || {})\n          }, { status: 403 })\n        }\n      }\n    }\n    \n    // FERPA compliance check for educational data\n    if (options.educationalDataAccess) {\n      const educationalContext = getEducationalContext(user)\n      \n      if (!educationalContext.isEduDomain && options.ferpaCompliant) {\n        // Log FERPA access attempt\n        console.log(`[FERPA] Educational data access by non-edu domain: ${user.email} from ${ip}`, {\n          userType: user.userType,\n          hasSchoolInfo: !!(user.school || user.grade_level),\n          timestamp: new Date().toISOString()\n        })\n      }\n    }\n    \n    // Determine security level\n    const securityLevel = determineSecurityLevel(user, sessionData, request)\n    \n    // Success - user is authenticated and authorized\n    return {\n      context: {\n        isAuthenticated: true,\n        user,\n        session: sessionData,\n        permissions: user.permissions,\n        educationalContext: getEducationalContext(user),\n        securityLevel\n      }\n    }\n    \n  } catch (error) {\n    console.error('Auth middleware error:', error)\n    \n    return {\n      context: {\n        isAuthenticated: false,\n        educationalContext: { isEduDomain: false, hasRealData: false, isOfflineDemo: false, dataSource: 'unknown' },\n        securityLevel: 'low'\n      },\n      response: NextResponse.json({\n        error: 'Authentication system error. Please try again.',\n        systemError: true\n      }, { status: 500 })\n    }\n  }\n}\n\n// Helper function to determine educational context\nfunction getEducationalContext(user: any) {\n  const isOfflineDemo = user.email.includes('demo') && !user.email.includes('speakaboos.com')\n  const isDemoData = user.email.includes('demo') || user.id.includes('demo')\n  const hasRealData = user.email.includes('speakaboos.com') || user.school || user.grade_level\n  const isEduDomain = user.email.toLowerCase().endsWith('.edu') || \n                     user.email.toLowerCase().includes('.k12.') ||\n                     user.email.toLowerCase().includes('.school.')\n  \n  let dataSource: 'offline_demo' | 'demo_data' | 'real_data' | 'unknown'\n  \n  if (isOfflineDemo) {\n    dataSource = 'offline_demo'\n  } else if (isDemoData) {\n    dataSource = 'demo_data'\n  } else if (hasRealData) {\n    dataSource = 'real_data'\n  } else {\n    dataSource = 'unknown'\n  }\n  \n  return {\n    isEduDomain,\n    hasRealData,\n    isOfflineDemo,\n    dataSource\n  }\n}\n\n// Helper function to determine security level\nfunction determineSecurityLevel(user: any, session: any, request: NextRequest): 'low' | 'medium' | 'high' {\n  let score = 0\n  \n  // User verification\n  if (user.isVerified) score += 2\n  \n  // Educational domain\n  if (user.email.toLowerCase().endsWith('.edu')) score += 2\n  \n  // Session age (newer sessions are more secure)\n  const sessionAge = Date.now() - new Date(session.authenticatedAt).getTime()\n  const sessionAgeHours = sessionAge / (1000 * 60 * 60)\n  if (sessionAgeHours < 1) score += 2\n  else if (sessionAgeHours < 8) score += 1\n  \n  // Strong permissions\n  if (user.permissions?.canExportStudentData) score += 1\n  \n  // HTTPS\n  if (request.nextUrl.protocol === 'https:') score += 1\n  \n  if (score >= 6) return 'high'\n  if (score >= 3) return 'medium'\n  return 'low'\n}\n\n// Simple rate limiting (use Redis in production)\nfunction checkRateLimit(identifier: string): { allowed: boolean; resetTime: number } {\n  const now = Date.now()\n  const windowMs = 15 * 60 * 1000 // 15 minutes\n  const maxRequests = 100 // per window\n  \n  const record = rateLimitStore.get(identifier)\n  \n  if (!record || now > record.resetTime) {\n    // New window\n    rateLimitStore.set(identifier, {\n      count: 1,\n      resetTime: now + windowMs\n    })\n    return { allowed: true, resetTime: now + windowMs }\n  }\n  \n  if (record.count >= maxRequests) {\n    return { allowed: false, resetTime: record.resetTime }\n  }\n  \n  // Increment count\n  record.count++\n  rateLimitStore.set(identifier, record)\n  \n  return { allowed: true, resetTime: record.resetTime }\n}\n\n// Cleanup old rate limit records\nsetInterval(() => {\n  const now = Date.now()\n  for (const [key, record] of rateLimitStore.entries()) {\n    if (now > record.resetTime) {\n      rateLimitStore.delete(key)\n    }\n  }\n}, 5 * 60 * 1000) // Clean up every 5 minutes