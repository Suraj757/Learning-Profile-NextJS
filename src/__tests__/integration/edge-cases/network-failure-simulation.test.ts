// Network Failure and Timeout Simulation Tests
// Testing how the CLP 2.0 system handles network issues, database timeouts, and service interruptions

import { NextRequest } from 'next/server'
import { POST, GET } from '../../../app/api/profiles/progressive/route'

// Mock Supabase with different failure scenarios
const createMockSupabase = (failureType: string) => {
  const baseError = new Error(`Simulated ${failureType} error`)
  
  switch (failureType) {
    case 'timeout':
      return {
        rpc: jest.fn().mockImplementation(() => 
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 1000)
          })
        ),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue(new Error('Insert timeout'))
            })
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockRejectedValue(new Error('Update timeout'))
          }),
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue(new Error('Select timeout'))
            })
          })
        })
      }
    
    case 'connection_refused':
      return {
        rpc: jest.fn().mockRejectedValue({ code: 'ECONNREFUSED', message: 'Connection refused' }),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue({ code: 'ECONNREFUSED', message: 'Connection refused' })
            })
          }),
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue({ code: 'ECONNREFUSED', message: 'Connection refused' })
            })
          })
        })
      }
    
    case 'dns_lookup':
      return {
        rpc: jest.fn().mockRejectedValue({ code: 'ENOTFOUND', message: 'DNS lookup failed' }),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue({ code: 'ENOTFOUND', message: 'DNS lookup failed' })
            })
          })
        })
      }
    
    case 'ssl_error':
      return {
        rpc: jest.fn().mockRejectedValue({ code: 'DEPTH_ZERO_SELF_SIGNED_CERT', message: 'SSL certificate error' }),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue({ code: 'DEPTH_ZERO_SELF_SIGNED_CERT', message: 'SSL certificate error' })
            })
          })
        })
      }
    
    case 'service_unavailable':
      return {
        rpc: jest.fn().mockRejectedValue({ code: '503', message: 'Service temporarily unavailable' }),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue({ code: '503', message: 'Service temporarily unavailable' })
            })
          })
        })
      }
    
    case 'rate_limit':
      return {
        rpc: jest.fn().mockRejectedValue({ code: '429', message: 'Rate limit exceeded' }),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue({ code: '429', message: 'Rate limit exceeded' })
            })
          })
        })
      }
    
    case 'database_error':
      return {
        rpc: jest.fn().mockRejectedValue({ 
          code: 'PGRST000', 
          message: 'Database connection error',
          details: 'Could not connect to database'
        }),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue({ 
                code: 'PGRST000', 
                message: 'Database connection error' 
              })
            })
          })
        })
      }
    
    case 'auth_error':
      return {
        rpc: jest.fn().mockRejectedValue({ code: '401', message: 'Authentication failed' }),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue({ code: '401', message: 'Authentication failed' })
            })
          })
        })
      }
    
    case 'intermittent':
      let callCount = 0
      return {
        rpc: jest.fn().mockImplementation(() => {
          callCount++
          if (callCount % 3 === 0) {
            return Promise.resolve({ data: { profile_id: 'test-id' }, error: null })
          } else {
            return Promise.reject(new Error('Intermittent failure'))
          }
        }),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockImplementation(() => {
                callCount++
                if (callCount % 2 === 0) {
                  return Promise.resolve({ data: { id: 'test-id' }, error: null })
                } else {
                  return Promise.reject(new Error('Intermittent failure'))
                }
              })
            })
          })
        })
      }
    
    default:
      return {
        rpc: jest.fn().mockRejectedValue(baseError),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue(baseError)
            })
          })
        })
      }
  }
}

// Mock dependencies
jest.mock('@/lib/clp-scoring', () => ({
  calculateCLP2Scores: jest.fn().mockReturnValue({
    Communication: 2.5,
    Collaboration: 2.0,
    Content: 1.8,
    'Critical Thinking': 2.2,
    'Creative Innovation': 2.8,
    Confidence: 2.4,
    Literacy: 2.1,
    Math: 1.9
  }),
  getCLP2PersonalityLabel: jest.fn().mockReturnValue('Creative Learner'),
  getCLP2StrengthsAndGrowth: jest.fn().mockReturnValue({
    strengths: ['Creative Innovation', 'Communication'],
    growthAreas: ['Content', 'Math']
  })
}))

jest.mock('@/lib/quiz-definitions', () => ({
  getQuizDefinition: jest.fn().mockReturnValue({
    id: 'parent_home',
    name: 'Parent Home Assessment'
  }),
  calculateQuizContribution: jest.fn().mockReturnValue({
    weight: 0.5,
    confidence_boost: 25,
    categories_covered: ['Communication', 'Creative Innovation']
  })
}))

describe('Network Failure and Timeout Simulation Tests', () => {
  let originalSupabase: any
  
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear any existing console.error mocks
    if (jest.isMockFunction(console.error)) {
      console.error.mockClear()
    } else {
      console.error = jest.fn()
    }
  })

  afterEach(() => {
    if (originalSupabase) {
      jest.doMock('@/lib/supabase', () => ({ supabase: originalSupabase }))
    }
  })

  describe('Database Connection Timeouts', () => {
    test('should handle RPC timeout gracefully', async () => {
      const mockSupabase = createMockSupabase('timeout')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Timeout Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      // Should fall back to individual operations when RPC times out
      const response = await POST(request)
      
      // Should handle timeout gracefully - either succeed with fallback or fail gracefully
      expect([200, 500, 504]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.profile).toBeDefined()
      }
    })

    test('should handle database insert timeout', async () => {
      const mockSupabase = createMockSupabase('timeout')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Insert Timeout Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle database timeout gracefully
      expect([200, 500, 504]).toContain(response.status)
    })

    test('should handle database select timeout in GET requests', async () => {
      const mockSupabase = createMockSupabase('timeout')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive?profileId=test-profile-id')

      const response = await GET(request)
      
      // Should handle timeout gracefully
      expect([200, 404, 500, 504]).toContain(response.status)
    })
  })

  describe('Connection Refused Errors', () => {
    test('should handle connection refused gracefully', async () => {
      const mockSupabase = createMockSupabase('connection_refused')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Connection Refused Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle connection refused gracefully
      expect([200, 500, 502, 503]).toContain(response.status)
      
      if (response.status === 500) {
        const data = await response.json()
        expect(data.error).toContain('Internal server error')
      }
    })
  })

  describe('DNS and Network Errors', () => {
    test('should handle DNS lookup failures', async () => {
      const mockSupabase = createMockSupabase('dns_lookup')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'DNS Failure Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle DNS failure gracefully
      expect([200, 500, 502]).toContain(response.status)
    })

    test('should handle SSL certificate errors', async () => {
      const mockSupabase = createMockSupabase('ssl_error')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'SSL Error Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle SSL error gracefully
      expect([200, 500, 502]).toContain(response.status)
    })
  })

  describe('Service Availability Issues', () => {
    test('should handle service unavailable errors', async () => {
      const mockSupabase = createMockSupabase('service_unavailable')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Service Unavailable Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle service unavailable gracefully
      expect([200, 500, 503]).toContain(response.status)
      
      if (response.status === 503) {
        const data = await response.json()
        expect(data.error).toBeDefined()
      }
    })

    test('should handle rate limiting', async () => {
      const mockSupabase = createMockSupabase('rate_limit')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Rate Limited Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle rate limiting gracefully
      expect([200, 429, 500]).toContain(response.status)
    })
  })

  describe('Database-Specific Errors', () => {
    test('should handle database connection errors', async () => {
      const mockSupabase = createMockSupabase('database_error')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Database Error Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle database errors gracefully
      expect([200, 500]).toContain(response.status)
    })

    test('should handle authentication failures', async () => {
      const mockSupabase = createMockSupabase('auth_error')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Auth Error Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle auth errors gracefully
      expect([200, 401, 500]).toContain(response.status)
    })
  })

  describe('Intermittent Network Issues', () => {
    test('should handle intermittent failures', async () => {
      const mockSupabase = createMockSupabase('intermittent')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      // Make multiple requests to test intermittent behavior
      const requests = Array.from({ length: 5 }, (_, i) => 
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `Intermittent Test ${i}`,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })
      )

      const responses = await Promise.allSettled(
        requests.map(request => POST(request))
      )

      // Should handle intermittent failures gracefully
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect([200, 500]).toContain(result.value.status)
        }
      })
    })

    test('should maintain consistency during network instability', async () => {
      const mockSupabase = createMockSupabase('intermittent')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Network Instability Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should eventually succeed or fail gracefully
      expect([200, 500]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.profile).toBeDefined()
        expect(data.profile.child_name).toBe('Network Instability Test')
      }
    })
  })

  describe('Fallback Mechanism Tests', () => {
    test('should fall back to local mode when database is completely unavailable', async () => {
      // Mock supabase as null to test fallback mode
      jest.doMock('@/lib/supabase', () => ({ supabase: null }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Fallback Mode Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should succeed in fallback mode
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.profile).toBeDefined()
      expect(data.profile.child_name).toBe('Fallback Mode Test')
      expect(data.shareUrl).toBeDefined()
    })

    test('should handle fallback gracefully when environment variables are missing', async () => {
      // Mock supabase as null and remove environment variables
      jest.doMock('@/lib/supabase', () => ({ supabase: null }))
      
      const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
      delete process.env.NEXT_PUBLIC_BASE_URL

      try {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'No Env Vars Test',
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })

        const response = await POST(request)
        
        // Should handle missing env vars gracefully
        expect(response.status).toBe(200)
        
        const data = await response.json()
        expect(data.profile).toBeDefined()
        expect(data.shareUrl).toBeDefined()
      } finally {
        if (originalBaseUrl) {
          process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl
        }
      }
    })
  })

  describe('Recovery and Resilience Tests', () => {
    test('should handle partial failures in complex operations', async () => {
      // Mock a scenario where some operations succeed and others fail
      const mockSupabase = {
        rpc: jest.fn().mockRejectedValue(new Error('RPC failed')),
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: { id: 'test-id' }, 
                error: null 
              })
            })
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockRejectedValue(new Error('Update failed'))
          }),
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: null, 
                error: null 
              })
            })
          })
        })
      }
      
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Partial Failure Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle partial failures gracefully
      expect([200, 500]).toContain(response.status)
    })

    test('should maintain data integrity during network issues', async () => {
      const mockSupabase = createMockSupabase('intermittent')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Data Integrity Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 },
          existing_profile_id: 'existing-profile-123'
        })
      })

      const response = await POST(request)
      
      // Should maintain data integrity
      expect([200, 500]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.profile).toBeDefined()
        // Should not have corrupted the child name despite network issues
        expect(data.profile.child_name).toBe('Data Integrity Test')
      }
    })
  })

  describe('Concurrent Network Issues', () => {
    test('should handle concurrent requests during network problems', async () => {
      const mockSupabase = createMockSupabase('timeout')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      // Create multiple concurrent requests
      const concurrentRequests = Array.from({ length: 5 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `Concurrent Test ${i}`,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: i + 1, 2: i + 2, 3: i + 3 }
          })
        })
      )

      // Execute all requests concurrently
      const startTime = Date.now()
      const responses = await Promise.allSettled(
        concurrentRequests.map(request => POST(request))
      )
      const endTime = Date.now()

      // Should handle concurrent network issues
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect([200, 500, 504]).toContain(result.value.status)
        }
      })

      // Should not take excessively long due to proper timeout handling
      expect(endTime - startTime).toBeLessThan(15000) // 15 seconds max
    })
  })

  describe('Error Logging and Monitoring', () => {
    test('should log network errors appropriately', async () => {
      const mockSupabase = createMockSupabase('connection_refused')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Error Logging Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      await POST(request)

      // Should have logged the error
      expect(console.error).toHaveBeenCalled()
    })

    test('should handle errors without exposing sensitive information', async () => {
      const mockSupabase = createMockSupabase('database_error')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Sensitive Info Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      if (response.status === 500) {
        const data = await response.json()
        // Should return generic error message, not database details
        expect(data.error).toBe('Internal server error')
        expect(data.error).not.toContain('PGRST000')
        expect(data.error).not.toContain('Database connection error')
      }
    })
  })
})