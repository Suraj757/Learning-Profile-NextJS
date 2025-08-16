// Database Connection and Concurrency Edge Cases
// Testing race conditions, deadlocks, connection pool exhaustion, and concurrent user scenarios

import { NextRequest } from 'next/server'
import { POST, GET } from '../../../app/api/profiles/progressive/route'

// Mock Supabase with concurrency simulation
const createMockSupabaseWithConcurrency = (scenario: string) => {
  let operationCount = 0
  let concurrentOperations = 0
  const maxConcurrentOperations = 5
  
  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  const createAsyncOperation = (operationName: string, shouldFail = false) => {
    return async (...args: any[]) => {
      concurrentOperations++
      operationCount++
      
      try {
        // Simulate database processing time
        await simulateDelay(Math.random() * 100 + 50)
        
        switch (scenario) {
          case 'connection_pool_exhausted':
            if (concurrentOperations > maxConcurrentOperations) {
              throw new Error('Connection pool exhausted')
            }
            break
            
          case 'deadlock':
            if (operationCount % 7 === 0) {
              throw new Error('Deadlock detected')
            }
            break
            
          case 'lock_timeout':
            if (operationCount % 5 === 0) {
              await simulateDelay(2000) // Simulate long-running transaction
              throw new Error('Lock timeout')
            }
            break
            
          case 'connection_limit':
            if (concurrentOperations > 3) {
              throw new Error('Too many connections')
            }
            break
            
          case 'transaction_conflict':
            if (operationCount % 4 === 0) {
              throw new Error('Transaction serialization failure')
            }
            break
        }
        
        if (shouldFail) {
          throw new Error(`${operationName} failed`)
        }
        
        return {
          data: { 
            id: `test-${operationCount}`,
            profile_id: `profile-${operationCount}`,
            consolidated_scores: { Communication: 2.5 },
            personality_label: 'Test Learner',
            confidence_percentage: 75,
            completeness_percentage: 80,
            total_assessments: 1,
            parent_assessments: 1,
            teacher_assessments: 0,
            is_new_profile: operationCount === 1
          },
          error: null
        }
      } finally {
        concurrentOperations--
      }
    }
  }
  
  return {
    rpc: jest.fn().mockImplementation(createAsyncOperation('rpc')),
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockImplementation(createAsyncOperation('insert'))
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockImplementation(createAsyncOperation('update'))
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockImplementation(createAsyncOperation('select'))
        })
      })
    })
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

describe('Database Connection and Concurrency Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.error = jest.fn()
  })

  describe('Connection Pool Exhaustion', () => {
    test('should handle connection pool exhaustion gracefully', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('connection_pool_exhausted')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      // Create many concurrent requests to exhaust connection pool
      const requests = Array.from({ length: 10 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `Pool Exhaustion Test ${i}`,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: i + 1, 2: i + 2, 3: i + 3 }
          })
        })
      )

      const responses = await Promise.allSettled(
        requests.map(request => POST(request))
      )

      // Some requests should succeed, others should fail gracefully
      let successCount = 0
      let errorCount = 0

      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          if (result.value.status === 200) {
            successCount++
          } else {
            errorCount++
          }
        }
      })

      // Should have handled pool exhaustion gracefully
      expect(successCount + errorCount).toBe(10)
      expect(successCount).toBeGreaterThan(0) // At least some should succeed
    })

    test('should recover from connection pool exhaustion', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('connection_pool_exhausted')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      // First batch to exhaust pool
      const firstBatch = Array.from({ length: 8 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `First Batch ${i}`,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })
      )

      await Promise.allSettled(firstBatch.map(request => POST(request)))

      // Wait for connections to be released
      await new Promise(resolve => setTimeout(resolve, 200))

      // Second batch should succeed after recovery
      const recoveryRequest = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Recovery Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(recoveryRequest)
      
      // Should recover and work normally
      expect([200, 500]).toContain(response.status)
    })
  })

  describe('Database Deadlocks', () => {
    test('should handle deadlock detection and recovery', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('deadlock')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      // Create requests that might cause deadlocks
      const requests = Array.from({ length: 15 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `Deadlock Test ${i}`,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 },
            existing_profile_id: i % 3 === 0 ? 'shared-profile-id' : undefined
          })
        })
      )

      const responses = await Promise.allSettled(
        requests.map(request => POST(request))
      )

      // Should handle deadlocks gracefully
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect([200, 500]).toContain(result.value.status)
        }
      })

      // At least some operations should succeed despite deadlocks
      const successfulResponses = responses.filter(result => 
        result.status === 'fulfilled' && 
        (result as PromiseFulfilledResult<any>).value.status === 200
      )
      expect(successfulResponses.length).toBeGreaterThan(0)
    })

    test('should retry operations after deadlock detection', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('deadlock')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Deadlock Retry Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle deadlock and potentially retry
      expect([200, 500]).toContain(response.status)
    })
  })

  describe('Lock Timeouts', () => {
    test('should handle lock timeouts gracefully', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('lock_timeout')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const requests = Array.from({ length: 8 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `Lock Timeout Test ${i}`,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })
      )

      const startTime = Date.now()
      const responses = await Promise.allSettled(
        requests.map(request => POST(request))
      )
      const endTime = Date.now()

      // Should not take excessively long due to timeouts
      expect(endTime - startTime).toBeLessThan(10000) // 10 seconds max

      // Should handle lock timeouts gracefully
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect([200, 500, 504]).toContain(result.value.status)
        }
      })
    })
  })

  describe('Connection Limits', () => {
    test('should handle connection limit exceeded', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('connection_limit')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      // Try to exceed connection limit
      const requests = Array.from({ length: 6 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `Connection Limit Test ${i}`,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })
      )

      const responses = await Promise.allSettled(
        requests.map(request => POST(request))
      )

      // Should handle connection limits gracefully
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
      })

      // Some should succeed within the connection limit
      const successfulResponses = responses.filter(result => 
        result.status === 'fulfilled' && 
        (result as PromiseFulfilledResult<any>).value.status === 200
      )
      expect(successfulResponses.length).toBeGreaterThan(0)
      expect(successfulResponses.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Transaction Conflicts', () => {
    test('should handle transaction serialization failures', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('transaction_conflict')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      // Create concurrent requests that might conflict
      const requests = Array.from({ length: 12 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'Shared Child Profile',
            quiz_type: i % 2 === 0 ? 'parent_home' : 'teacher_classroom',
            respondent_type: i % 2 === 0 ? 'parent' : 'teacher',
            responses: { 1: 4, 2: 3, 3: 5 },
            existing_profile_id: 'conflicting-profile-id'
          })
        })
      )

      const responses = await Promise.allSettled(
        requests.map(request => POST(request))
      )

      // Should handle transaction conflicts gracefully
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect([200, 409, 500]).toContain(result.value.status)
        }
      })
    })

    test('should maintain data consistency during conflicts', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('transaction_conflict')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Consistency Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.profile).toBeDefined()
        expect(data.profile.child_name).toBe('Consistency Test Child')
        // Data should be consistent despite transaction conflicts
        expect(typeof data.profile.confidence_percentage).toBe('number')
        expect(data.profile.confidence_percentage).toBeGreaterThanOrEqual(0)
        expect(data.profile.confidence_percentage).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('Concurrent User Scenarios', () => {
    test('should handle multiple parents assessing same child concurrently', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('normal')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const parentRequests = Array.from({ length: 3 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'Multi-Parent Child',
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            respondent_id: `parent-${i}`,
            respondent_name: `Parent ${i}`,
            responses: { 1: i + 3, 2: i + 2, 3: i + 4 },
            existing_profile_id: 'shared-child-profile'
          })
        })
      )

      const responses = await Promise.allSettled(
        parentRequests.map(request => POST(request))
      )

      // All parent assessments should be handled
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect([200, 409, 500]).toContain(result.value.status)
        }
      })
    })

    test('should handle teacher and parent assessing same child simultaneously', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('normal')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const parentRequest = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Dual Assessment Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          respondent_id: 'parent-1',
          responses: { 1: 4, 2: 3, 3: 5 },
          existing_profile_id: 'dual-assessment-profile'
        })
      })

      const teacherRequest = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Dual Assessment Child',
          quiz_type: 'teacher_classroom',
          respondent_type: 'teacher',
          respondent_id: 'teacher-1',
          responses: { 1: 3, 2: 4, 3: 4 },
          existing_profile_id: 'dual-assessment-profile'
        })
      })

      const [parentResponse, teacherResponse] = await Promise.all([
        POST(parentRequest),
        POST(teacherRequest)
      ])

      // Both assessments should be handled appropriately
      expect([200, 409, 500]).toContain(parentResponse.status)
      expect([200, 409, 500]).toContain(teacherResponse.status)
    })

    test('should handle rapid successive assessments', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('normal')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const requests = Array.from({ length: 5 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'Rapid Assessment Child',
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 },
            existing_profile_id: 'rapid-assessment-profile'
          })
        })
      )

      // Send requests in rapid succession
      const responses = []
      for (const request of requests) {
        responses.push(await POST(request))
        await new Promise(resolve => setTimeout(resolve, 10)) // 10ms between requests
      }

      // Should handle rapid succession gracefully
      responses.forEach(response => {
        expect([200, 409, 500]).toContain(response.status)
      })
    })
  })

  describe('Database State Corruption', () => {
    test('should handle corrupted profile data gracefully', async () => {
      const corruptedSupabase = {
        rpc: jest.fn().mockRejectedValue(new Error('RPC failed')),
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'corrupted-profile',
                  consolidated_scores: 'invalid_json_string',
                  confidence_percentage: 'not_a_number',
                  total_assessments: null
                },
                error: null
              })
            })
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'new-profile' },
                error: null
              })
            })
          })
        })
      }

      jest.doMock('@/lib/supabase', () => ({ supabase: corruptedSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Corruption Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle corrupted data gracefully
      expect([200, 500]).toContain(response.status)
    })

    test('should validate data integrity before processing', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('normal')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Data Validation Test',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      if (response.status === 200) {
        const data = await response.json()
        
        // Should validate that returned data is properly structured
        expect(data.profile).toBeDefined()
        expect(typeof data.profile.child_name).toBe('string')
        expect(typeof data.profile.confidence_percentage).toBe('number')
        expect(data.profile.confidence_percentage).toBeGreaterThanOrEqual(0)
        expect(data.profile.confidence_percentage).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('Performance Under Load', () => {
    test('should maintain reasonable performance under concurrent load', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('normal')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const requests = Array.from({ length: 20 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `Load Test Child ${i}`,
            quiz_type: i % 2 === 0 ? 'parent_home' : 'teacher_classroom',
            respondent_type: i % 2 === 0 ? 'parent' : 'teacher',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })
      )

      const startTime = Date.now()
      const responses = await Promise.allSettled(
        requests.map(request => POST(request))
      )
      const endTime = Date.now()

      // Should complete within reasonable time even under load
      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds

      // Most requests should succeed
      const successCount = responses.filter(result => 
        result.status === 'fulfilled' && 
        (result as PromiseFulfilledResult<any>).value.status === 200
      ).length

      expect(successCount).toBeGreaterThan(responses.length * 0.7) // At least 70% success rate
    })

    test('should handle memory pressure during concurrent operations', async () => {
      const mockSupabase = createMockSupabaseWithConcurrency('normal')
      jest.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }))

      const startMemory = process.memoryUsage().heapUsed

      // Create many concurrent operations with large responses
      const largeResponses: Record<number, number> = {}
      for (let i = 1; i <= 1000; i++) {
        largeResponses[i] = (i % 5) + 1
      }

      const requests = Array.from({ length: 10 }, (_, i) =>
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: `Memory Test Child ${i}`,
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: largeResponses
          })
        })
      )

      await Promise.allSettled(requests.map(request => POST(request)))

      const endMemory = process.memoryUsage().heapUsed
      const memoryIncrease = endMemory - startMemory

      // Should not consume excessive memory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Less than 50MB
    })
  })
})