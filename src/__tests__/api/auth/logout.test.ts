/**
 * Tests for /api/auth/logout endpoint
 */

// Mock NextResponse before importing the route
const mockCookiesSet = jest.fn()

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn().mockImplementation((body) => ({
      status: 200,
      headers: new Map(),
      cookies: {
        set: mockCookiesSet
      },
      json: async () => body
    }))
  }
}))

import { POST } from '@/app/api/auth/logout/route'

// Mock console methods to avoid noise in tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
}

describe('/api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    consoleSpy.log.mockClear()
    consoleSpy.warn.mockClear()
    consoleSpy.error.mockClear()
    mockCookiesSet.mockClear()
    // Access the mocked NextResponse from the jest module
    const { NextResponse } = require('next/server')
    NextResponse.json.mockClear()
  })

  afterAll(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.warn.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('POST /api/auth/logout', () => {
    it('handles logout with no existing session', async () => {
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockImplementation((key) => {
            if (key === 'x-forwarded-for') return '192.168.1.100'
            if (key === 'user-agent') return 'Test Browser'
            return null
          })
        },
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data).toEqual({
        success: true,
        message: 'You have been logged out successfully. Thank you for using our educational platform!',
        sessionInfo: {
          duration: 'Less than a minute',
          loggedOutAt: expect.any(String)
        }
      })

      // Should log the logout
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] User logout: unknown (unknown) from 192.168.1.100'),
        expect.objectContaining({
          sessionDurationMinutes: 0,
          userAgent: expect.stringContaining('Test Browser'),
          timestamp: expect.any(String)
        })
      )

      // Should clear all cookies
      expect(mockCookiesSet).toHaveBeenCalledWith('edu-session', '', expect.any(Object))
      expect(mockCookiesSet).toHaveBeenCalledWith('edu-session-client', '', expect.any(Object))
      expect(mockCookiesSet).toHaveBeenCalledWith('teacher-session', '', expect.any(Object))
      expect(mockCookiesSet).toHaveBeenCalledWith('auth-token', '', expect.any(Object))
    })

    it('handles logout with existing session cookie', async () => {
      const sessionData = {
        email: 'teacher@school.edu',
        userType: 'teacher',
        authenticatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      }
      
      const sessionCookie = encodeURIComponent(JSON.stringify(sessionData))
      
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockImplementation((key) => {
            if (key === 'x-forwarded-for') return '192.168.1.100'
            if (key === 'user-agent') return 'Test Browser'
            return null
          })
        },
        cookies: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session') return { value: sessionCookie }
            return undefined
          })
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.sessionInfo.duration).toContain('30 minutes')

      // Should log the logout with correct user info
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] User logout: teacher@school.edu (teacher)'),
        expect.objectContaining({
          sessionDurationMinutes: 30,
          timestamp: expect.any(String)
        })
      )
    })

    it('handles logout with client session cookie', async () => {
      const clientSessionData = {
        email: 'teacher@example.edu',
        userType: 'teacher',
        authenticatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      }
      
      const clientSessionCookie = encodeURIComponent(JSON.stringify(clientSessionData))
      
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockImplementation((key) => {
            if (key === 'x-forwarded-for') return '10.0.0.1'
            if (key === 'user-agent') return 'Mozilla/5.0 Test'
            return null
          })
        },
        cookies: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session-client') return { value: clientSessionCookie }
            return undefined
          })
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.sessionInfo.duration).toContain('15 minutes')

      // Should log the logout with client session info
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] User logout: teacher@example.edu (teacher)'),
        expect.objectContaining({
          sessionDurationMinutes: 15,
        })
      )
    })

    it('clears all session cookies', async () => {
      const sessionData = {
        email: 'teacher@school.edu',
        userType: 'teacher',
        authenticatedAt: new Date().toISOString(),
      }
      
      const sessionCookie = encodeURIComponent(JSON.stringify(sessionData))
      
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        cookies: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session') return { value: sessionCookie }
            return undefined
          })
        }
      } as any

      await POST(request)

      // Check that all cookies are being cleared
      const expectedCookieOptions = expect.objectContaining({
        maxAge: 0,
        path: '/'
      })

      expect(mockCookiesSet).toHaveBeenCalledWith('edu-session', '', expectedCookieOptions)
      expect(mockCookiesSet).toHaveBeenCalledWith('edu-session-client', '', expect.objectContaining({
        maxAge: 0,
        path: '/',
        httpOnly: false
      }))
      expect(mockCookiesSet).toHaveBeenCalledWith('teacher-session', '', expectedCookieOptions)
      expect(mockCookiesSet).toHaveBeenCalledWith('auth-token', '', expectedCookieOptions)
    })

    it('handles invalid session cookie gracefully', async () => {
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockImplementation((key) => {
            if (key === 'user-agent') return 'Test Browser'
            return null
          })
        },
        cookies: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session') return { value: 'invalid-json-data' }
            return undefined
          })
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)

      // Should warn about parsing error
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Error parsing session for logout logging:',
        expect.any(Error)
      )

      // Should still log logout with unknown user
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] User logout: unknown (unknown)'),
        expect.any(Object)
      )
    })

    it('handles missing IP and user agent gracefully', async () => {
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)

      // Should handle missing headers
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] User logout: unknown (unknown) from unknown'),
        expect.objectContaining({
          userAgent: 'unknown',
        })
      )
    })

    it('sets correct cookie options for production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        }
      } as any

      await POST(request)

      // In production, cookies should be secure
      expect(mockCookiesSet).toHaveBeenCalledWith('edu-session', '', expect.objectContaining({
        secure: true,
        sameSite: 'strict'
      }))

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })

    it('handles session duration calculation correctly', async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const sessionData = {
        email: 'teacher@school.edu',
        userType: 'teacher',
        authenticatedAt: oneHourAgo,
      }
      
      const sessionCookie = encodeURIComponent(JSON.stringify(sessionData))
      
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        cookies: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session') return { value: sessionCookie }
            return undefined
          })
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.sessionInfo.duration).toContain('60 minutes')

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          sessionDurationMinutes: 60,
        })
      )
    })

    it('handles errors during logout gracefully', async () => {
      // Create a request that causes parsing errors
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        cookies: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session') return { value: '%invalid%json%' }
            return undefined
          })
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      // Should still return success even with errors
      expect(data.success).toBe(true)
      expect(data.message).toBe('You have been logged out successfully. Thank you for using our educational platform!')

      // Should clear cookies even with errors
      expect(mockCookiesSet).toHaveBeenCalledWith('edu-session', '', expect.any(Object))
    })

    it('includes audit information in response', async () => {
      const sessionData = {
        email: 'teacher@university.edu',
        userType: 'teacher',
        authenticatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      }
      
      const sessionCookie = encodeURIComponent(JSON.stringify(sessionData))
      
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        cookies: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session') return { value: sessionCookie }
            return undefined
          })
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data).toEqual({
        success: true,
        message: 'You have been logged out successfully. Thank you for using our educational platform!',
        sessionInfo: {
          duration: '45 minutes',
          loggedOutAt: expect.any(String)
        }
      })

      // Verify timestamp format
      const timestamp = new Date(data.sessionInfo.loggedOutAt)
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 1000) // Within last second
    })

    it('truncates long user agent strings', async () => {
      const longUserAgent = 'A'.repeat(200) // Very long user agent
      
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockImplementation((key) => {
            if (key === 'user-agent') return longUserAgent
            return null
          })
        },
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        }
      } as any

      const response = await POST(request)

      expect(response.status).toBe(200)

      // Should truncate user agent to 100 characters
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userAgent: 'A'.repeat(100), // Should be truncated
        })
      )
    })

    it('handles multiple cookie values correctly', async () => {
      const sessionData = {
        email: 'primary@school.edu',
        userType: 'teacher',
        authenticatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      }
      
      const clientData = {
        email: 'secondary@school.edu',
        userType: 'teacher',
        authenticatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      }
      
      const sessionCookie = encodeURIComponent(JSON.stringify(sessionData))
      const clientCookie = encodeURIComponent(JSON.stringify(clientData))
      
      const request = {
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        },
        cookies: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'edu-session') return { value: sessionCookie }
            if (name === 'edu-session-client') return { value: clientCookie }
            return undefined
          })
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)

      // Should prioritize main session over client session
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('primary@school.edu'),
        expect.objectContaining({
          sessionDurationMinutes: 20, // From main session, not client session
        })
      )
    })
  })
})