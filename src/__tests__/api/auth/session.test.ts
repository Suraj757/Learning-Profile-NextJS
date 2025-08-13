/**
 * Test Suite: Auth Session API Endpoint
 * 
 * Tests the /api/auth/session endpoint functionality including:
 * - Session validation and user data retrieval
 * - Cookie handling for both client and server sessions
 * - Session expiration checks
 * - Error handling for various scenarios
 * - Session refresh functionality
 */

import { GET, POST } from '@/app/api/auth/session/route'

// Mock user storage module
jest.mock('@/lib/auth/user-storage', () => ({
  getUserByEmail: jest.fn(),
}))

describe('Auth Session API Endpoint', () => {
  let mockRequest: any
  const { getUserByEmail } = require('@/lib/auth/user-storage')

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock Date.now for consistent time testing
    jest.spyOn(Date, 'now').mockImplementation(() => 
      new Date('2024-01-15T12:00:00Z').getTime()
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/auth/session', () => {
    it('should return unauthenticated when no session cookies are present', async () => {
      mockRequest = {
        url: 'http://localhost:3000/api/auth/session',
        method: 'GET',
        headers: new Map(),
        cookies: { 
          get: jest.fn().mockReturnValue(undefined)
        }
      }
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        authenticated: false,
        reason: 'No session found'
      })
    })

    it('should handle invalid client session cookie gracefully', async () => {
      mockRequest = {
        url: 'http://localhost:3000/api/auth/session',
        method: 'GET',
        headers: new Map([['cookie', 'edu-session-client=invalid-json']]),
        cookies: { 
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session-client') return { value: 'invalid-json' }
            return undefined
          })
        }
      }
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        authenticated: false,
        reason: 'No valid session data'
      })
    })

    it('should return unauthenticated when session is expired', async () => {
      const expiredSessionData = {
        email: 'test@school.edu',
        expiresAt: '2024-01-14T12:00:00Z', // Expired (yesterday)
        authenticatedAt: '2024-01-14T10:00:00Z'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: {
          cookie: `edu-session-client=${encodeURIComponent(JSON.stringify(expiredSessionData))}`
        }
      })
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        authenticated: false,
        reason: 'Session expired',
        expiredAt: '2024-01-14T12:00:00Z'
      })
    })

    it('should return unauthenticated when user is not found', async () => {
      const sessionData = {
        email: 'nonexistent@school.edu',
        expiresAt: '2024-01-16T12:00:00Z', // Valid future time
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      getUserByEmail.mockReturnValue(null)

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: {
          cookie: `edu-session-client=${encodeURIComponent(JSON.stringify(sessionData))}`
        }
      })
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(getUserByEmail).toHaveBeenCalledWith('nonexistent@school.edu')
      expect(response.status).toBe(200)
      expect(data).toEqual({
        authenticated: false,
        reason: 'User not found'
      })
    })

    it('should return unauthenticated when user account is deactivated', async () => {
      const sessionData = {
        email: 'deactivated@school.edu',
        expiresAt: '2024-01-16T12:00:00Z',
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      const mockUser = {
        id: 'user-1',
        email: 'deactivated@school.edu',
        name: 'Deactivated Teacher',
        userType: 'teacher',
        isActive: false, // Deactivated account
        isVerified: true
      }

      getUserByEmail.mockReturnValue(mockUser)

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: {
          cookie: `edu-session-client=${encodeURIComponent(JSON.stringify(sessionData))}`
        }
      })
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        authenticated: false,
        reason: 'Account deactivated'
      })
    })

    it('should return authenticated user with valid session data', async () => {
      const sessionData = {
        email: 'teacher@school.edu',
        expiresAt: '2024-01-16T12:00:00Z', // Valid future time
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      const mockUser = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        name: 'John Teacher',
        userType: 'teacher',
        school: 'Test Elementary',
        grade_level: 'K-2',
        isActive: true,
        isVerified: true,
        needsPasswordSetup: false,
        permissions: { canViewStudentProfiles: true }
      }

      getUserByEmail.mockReturnValue(mockUser)

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: {
          cookie: `edu-session-client=${encodeURIComponent(JSON.stringify(sessionData))}`
        }
      })
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.authenticated).toBe(true)
      expect(data.user).toEqual({
        id: 'teacher-1',
        email: 'teacher@school.edu',
        name: 'John Teacher',
        userType: 'teacher',
        school: 'Test Elementary',
        gradeLevel: 'K-2',
        isVerified: true,
        needsPasswordSetup: false
      })
      expect(data.session).toEqual({
        authenticatedAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-16T12:00:00Z',
        ageHours: 2,
        remainingHours: 24
      })
      expect(data.dataState).toBeDefined()
      expect(data.permissions).toEqual({ canViewStudentProfiles: true })
      expect(data.features).toBeDefined()
    })

    it('should properly detect demo accounts and data states', async () => {
      const sessionData = {
        email: 'demo@speakaboos.com',
        expiresAt: '2024-01-16T12:00:00Z',
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      const mockDemoUser = {
        id: 'demo-teacher-1',
        email: 'demo@speakaboos.com',
        name: 'Demo Teacher',
        userType: 'teacher',
        isActive: true,
        isVerified: true
      }

      getUserByEmail.mockReturnValue(mockDemoUser)

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: {
          cookie: `edu-session-client=${encodeURIComponent(JSON.stringify(sessionData))}`
        }
      })
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(data.authenticated).toBe(true)
      expect(data.dataState.isDemoData).toBe(true)
      expect(data.dataState.hasRealData).toBe(true) // speakaboos.com domain
      expect(data.dataState.dataSource).toBe('demo_data')
    })

    it('should properly detect educational domains', async () => {
      const sessionData = {
        email: 'teacher@university.edu',
        expiresAt: '2024-01-16T12:00:00Z',
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      const mockEduUser = {
        id: 'edu-teacher-1',
        email: 'teacher@university.edu',
        name: 'University Teacher',
        userType: 'teacher',
        isActive: true,
        isVerified: true
      }

      getUserByEmail.mockReturnValue(mockEduUser)

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: {
          cookie: `edu-session-client=${encodeURIComponent(JSON.stringify(sessionData))}`
        }
      })
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(data.authenticated).toBe(true)
      expect(data.dataState.isEduDomain).toBe(true)
      expect(data.features.isEducationalAccount).toBe(true)
    })

    it('should handle internal server errors gracefully', async () => {
      getUserByEmail.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const sessionData = {
        email: 'test@school.edu',
        expiresAt: '2024-01-16T12:00:00Z',
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: {
          cookie: `edu-session-client=${encodeURIComponent(JSON.stringify(sessionData))}`
        }
      })

      // Spy on console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        authenticated: false,
        reason: 'Internal server error'
      })

      consoleSpy.mockRestore()
    })

    it('should prefer client session over secure session cookie', async () => {
      const clientSessionData = {
        email: 'client@school.edu',
        expiresAt: '2024-01-16T12:00:00Z',
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      const secureSessionData = {
        email: 'secure@school.edu',
        expiresAt: '2024-01-16T12:00:00Z',
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      const mockUser = {
        id: 'teacher-1',
        email: 'client@school.edu',
        name: 'Client Teacher',
        userType: 'teacher',
        isActive: true,
        isVerified: true
      }

      getUserByEmail.mockReturnValue(mockUser)

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: {
          cookie: [
            `edu-session-client=${encodeURIComponent(JSON.stringify(clientSessionData))}`,
            `edu-session=${encodeURIComponent(JSON.stringify(secureSessionData))}`
          ].join('; ')
        }
      })
      
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(data.authenticated).toBe(true)
      expect(data.user.email).toBe('client@school.edu')
      expect(getUserByEmail).toHaveBeenCalledWith('client@school.edu')
    })
  })

  describe('POST /api/auth/session (Session Refresh)', () => {
    it('should successfully refresh a valid session', async () => {
      const currentTime = new Date('2024-01-15T12:00:00Z')
      const newExpiresAt = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)

      const sessionData = {
        email: 'teacher@school.edu',
        expiresAt: '2024-01-16T10:00:00Z', // Still valid but needs refresh
        authenticatedAt: '2024-01-15T10:00:00Z'
      }

      const requestBody = { action: 'refresh' }

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: [
            `edu-session=${encodeURIComponent(JSON.stringify(sessionData))}`,
            `edu-session-client=${encodeURIComponent(JSON.stringify(sessionData))}`
          ].join('; ')
        },
        body: JSON.stringify(requestBody)
      })
      
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Session refreshed successfully')
      expect(new Date(data.expiresAt)).toEqual(newExpiresAt)

      // Check that new cookies are set
      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders).toHaveLength(2) // Both edu-session and edu-session-client
      expect(setCookieHeaders[0]).toContain('edu-session=')
      expect(setCookieHeaders[1]).toContain('edu-session-client=')
    })

    it('should reject refresh request when no session exists', async () => {
      const requestBody = { action: 'refresh' }

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        success: false,
        error: 'No active session to refresh'
      })
    })

    it('should reject refresh request when session is expired', async () => {
      const expiredSessionData = {
        email: 'teacher@school.edu',
        expiresAt: '2024-01-14T10:00:00Z', // Expired
        authenticatedAt: '2024-01-14T08:00:00Z'
      }

      const requestBody = { action: 'refresh' }

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: [
            `edu-session=${encodeURIComponent(JSON.stringify(expiredSessionData))}`,
            `edu-session-client=${encodeURIComponent(JSON.stringify(expiredSessionData))}`
          ].join('; ')
        },
        body: JSON.stringify(requestBody)
      })
      
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        success: false,
        error: 'Session expired, please login again'
      })
    })

    it('should handle invalid session data during refresh', async () => {
      const requestBody = { action: 'refresh' }

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: 'edu-session=invalid-json; edu-session-client=invalid-json'
        },
        body: JSON.stringify(requestBody)
      })
      
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        error: 'Invalid session data'
      })
    })

    it('should reject unknown action types', async () => {
      const requestBody = { action: 'unknown_action' }

      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        error: 'Unknown action'
      })
    })

    it('should handle malformed request body', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: 'invalid-json'
      })

      // Spy on console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        error: 'Internal server error'
      })

      consoleSpy.mockRestore()
    })
  })
})