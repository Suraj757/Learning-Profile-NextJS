/**
 * Test Suite: Auth Verify API Endpoint
 * 
 * Tests the /api/auth/verify endpoint functionality including:
 * - Delegation to session endpoint
 * - Error handling for unsupported methods
 * - Proper redirection behavior
 */

import { GET, POST } from '@/app/api/auth/verify/route'

// Mock the session route
jest.mock('@/app/api/auth/session/route', () => ({
  GET: jest.fn(),
}))

describe('Auth Verify API Endpoint', () => {
  let mockRequest: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      url: 'http://localhost:3000/api/auth/verify',
      method: 'GET',
      headers: new Map(),
      cookies: { get: jest.fn() }
    }
  })

  describe('GET /api/auth/verify', () => {
    it('should delegate to session endpoint', async () => {
      const mockSessionResponse = new Response(JSON.stringify({
        authenticated: true,
        user: { id: '1', email: 'test@school.edu' }
      }), { status: 200 })

      const { GET: sessionGet } = require('@/app/api/auth/session/route')
      sessionGet.mockResolvedValue(mockSessionResponse)

      const response = await GET(mockRequest)
      
      expect(sessionGet).toHaveBeenCalledWith(mockRequest)
      expect(response).toBe(mockSessionResponse)
    })

    it('should handle session endpoint errors', async () => {
      const mockErrorResponse = new Response(JSON.stringify({
        authenticated: false,
        reason: 'No session found'
      }), { status: 401 })

      const { GET: sessionGet } = require('@/app/api/auth/session/route')
      sessionGet.mockResolvedValue(mockErrorResponse)

      const response = await GET(mockRequest)
      
      expect(sessionGet).toHaveBeenCalledWith(mockRequest)
      expect(response).toBe(mockErrorResponse)
    })

    it('should handle session endpoint throwing errors', async () => {
      const { GET: sessionGet } = require('@/app/api/auth/session/route')
      sessionGet.mockRejectedValue(new Error('Session service unavailable'))

      await expect(GET(mockRequest)).rejects.toThrow('Session service unavailable')
    })
  })

  describe('POST /api/auth/verify', () => {
    it('should return 405 Method Not Allowed', async () => {
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(405)
      expect(data).toEqual({
        error: 'POST not supported on verify endpoint. Use /api/auth/session instead.',
        redirect: '/api/auth/session'
      })
    })

    it('should include proper Content-Type header for JSON response', async () => {
      const response = await POST(mockRequest)
      const contentType = response.headers.get('content-type')
      
      expect(contentType).toContain('application/json')
    })
  })
})