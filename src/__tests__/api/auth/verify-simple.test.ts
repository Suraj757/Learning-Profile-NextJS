/**
 * Test Suite: Auth Verify API Endpoint (Simplified)
 * 
 * Tests the /api/auth/verify endpoint functionality including:
 * - Delegation to session endpoint
 * - Error handling for unsupported methods
 */

import { GET, POST } from '@/app/api/auth/verify/route'

// Mock the session route
jest.mock('@/app/api/auth/session/route', () => ({
  GET: jest.fn(),
}))

describe('Auth Verify API Endpoint (Simplified)', () => {
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
      const mockSessionResponse = {
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({
          authenticated: true,
          user: { id: '1', email: 'test@school.edu' }
        })
      }

      const { GET: sessionGet } = require('@/app/api/auth/session/route')
      sessionGet.mockResolvedValue(mockSessionResponse)

      const response = await GET(mockRequest)
      
      expect(sessionGet).toHaveBeenCalledWith(mockRequest)
      expect(response).toBe(mockSessionResponse)
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
  })
})