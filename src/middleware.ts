import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/results/',
  '/teacher/dashboard',
  '/teacher/day1-kit',
  '/teacher/student-cards',
  '/teacher/classroom',
  '/teacher/assignments',
  '/teacher/send-assessment',
  '/api/profiles/',
  '/api/teacher/',
]

// Routes that are public
const PUBLIC_ROUTES = [
  '/',
  '/assessment/start',
  '/assessment/question',
  '/assessment/complete', 
  '/demo',
  '/teachers',
  '/teacher/register',
  '/teacher/login',
  '/teacher/forgot-password',
  '/teacher/reset-password',
  '/teacher/help',
  '/auth/',
]

// Emergency auth check - will be replaced with full auth system
function isAuthenticated(request: NextRequest): boolean {
  // Check for session cookie (JWT)
  const sessionCookie = request.cookies.get('edu-session')?.value
  
  if (sessionCookie) {
    try {
      // Simple validation - will be enhanced with proper JWT verification
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie))
      return sessionData && sessionData.userId && sessionData.userType
    } catch {
      return false
    }
  }

  // Fall back to checking localStorage-style data in headers (temporary)
  const authHeader = request.headers.get('x-temp-auth')
  if (authHeader) {
    try {
      const authData = JSON.parse(authHeader)
      return authData && authData.id && (authData.email || authData.isOfflineDemo)
    } catch {
      return false
    }
  }

  return false
}

// Check if route requires authentication
function requiresAuth(pathname: string): boolean {
  // First check if it's explicitly public (exact matches and specific patterns)
  const isExplicitlyPublic = PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/' // Only match exact root
    }
    return pathname.startsWith(route) || pathname === route
  })
  
  if (isExplicitlyPublic) {
    return false
  }
  
  // Then check if it's protected
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  
  return isProtected
}

// Log access attempts for audit trail
async function logAccess(request: NextRequest, allowed: boolean) {
  const timestamp = new Date().toISOString()
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // In production, this would go to a proper audit log
  console.log(`[AUDIT] ${timestamp} | ${request.method} ${request.nextUrl.pathname} | IP: ${ip} | Allowed: ${allowed} | UA: ${userAgent}`)
  
  // TODO: Store in audit log table when database auth is implemented
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and API routes that should remain public
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/assessment-progress') ||
    pathname === '/api/profiles' && request.method === 'POST' // Allow profile creation
  ) {
    return NextResponse.next()
  }

  const requiresAuthentication = requiresAuth(pathname)
  
  if (requiresAuthentication) {
    const authenticated = isAuthenticated(request)
    
    // Log the access attempt
    await logAccess(request, authenticated)
    
    if (!authenticated) {
      // Redirect to proper teacher login page with return URL
      const loginUrl = new URL('/teacher/login', request.url)
      loginUrl.searchParams.set('returnTo', pathname)
      
      return NextResponse.redirect(loginUrl)
    }

    // Add security headers for authenticated routes
    const response = NextResponse.next()
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}