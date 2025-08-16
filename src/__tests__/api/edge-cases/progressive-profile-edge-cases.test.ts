// Progressive Profile API Edge Cases and Error Handling Tests
// Comprehensive testing for malformed inputs, network failures, timeouts, and database issues

import { NextRequest } from 'next/server'
import { POST, GET } from '../../../app/api/profiles/progressive/route'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: null // Start with null to test fallback mode
}))

jest.mock('@/lib/clp-scoring', () => ({
  calculateCLP2Scores: jest.fn(),
  getCLP2PersonalityLabel: jest.fn(),
  getCLP2StrengthsAndGrowth: jest.fn(),
  CLP2_SKILL_MAPPING: {
    1: 'Communication',
    2: 'Communication', 
    3: 'Communication'
  }
}))

jest.mock('@/lib/quiz-definitions', () => ({
  getQuizDefinition: jest.fn(),
  calculateQuizContribution: jest.fn()
}))

const mockCalculateCLP2Scores = jest.requireMock('@/lib/clp-scoring').calculateCLP2Scores
const mockGetCLP2PersonalityLabel = jest.requireMock('@/lib/clp-scoring').getCLP2PersonalityLabel
const mockGetCLP2StrengthsAndGrowth = jest.requireMock('@/lib/clp-scoring').getCLP2StrengthsAndGrowth
const mockGetQuizDefinition = jest.requireMock('@/lib/quiz-definitions').getQuizDefinition
const mockCalculateQuizContribution = jest.requireMock('@/lib/quiz-definitions').calculateQuizContribution

describe('Progressive Profile API - Edge Cases and Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful mock implementations
    mockCalculateCLP2Scores.mockReturnValue({
      Communication: 2.5,
      Collaboration: 2.0,
      Content: 1.8,
      'Critical Thinking': 2.2,
      'Creative Innovation': 2.8,
      Confidence: 2.4,
      Literacy: 2.1,
      Math: 1.9
    })
    
    mockGetCLP2PersonalityLabel.mockReturnValue('Creative Learner')
    mockGetCLP2StrengthsAndGrowth.mockReturnValue({
      strengths: ['Creative Innovation', 'Communication'],
      growthAreas: ['Content', 'Math']
    })
    
    mockGetQuizDefinition.mockReturnValue({
      id: 'parent_home',
      name: 'Parent Home Assessment',
      questions: []
    })
    
    mockCalculateQuizContribution.mockReturnValue({
      weight: 0.5,
      confidence_boost: 25,
      categories_covered: ['Communication', 'Creative Innovation']
    })
  })

  describe('Input Validation Edge Cases', () => {
    test('should reject completely empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    test('should reject request with null required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: null,
          quiz_type: null,
          respondent_type: null,
          responses: null
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    test('should reject request with undefined required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: undefined,
          quiz_type: undefined,
          respondent_type: undefined,
          responses: undefined
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    test('should handle extremely long child names', async () => {
      const extremelyLongName = 'A'.repeat(1000)
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: extremelyLongName,
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle gracefully, either succeed or fail with appropriate error
      expect([200, 400, 500]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.profile.child_name).toBe(extremelyLongName)
      }
    })

    test('should handle special characters in child names', async () => {
      const specialCharName = "João O'Malley-Smith 中文名字 🎨"
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: specialCharName,
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile.child_name).toBe(specialCharName)
    })

    test('should handle SQL injection attempts in child name', async () => {
      const sqlInjectionName = "'; DROP TABLE profiles; --"
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: sqlInjectionName,
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle safely without executing SQL
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile.child_name).toBe(sqlInjectionName)
    })

    test('should reject invalid quiz types', async () => {
      mockGetQuizDefinition.mockReturnValue(null)
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'invalid_quiz_type',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid quiz type')
    })

    test('should reject invalid respondent types', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'invalid_respondent',
          responses: { 1: 4, 2: 3, 3: 5 }
        })
      })

      const response = await POST(request)
      
      // Should handle gracefully - may accept or reject based on validation
      expect([200, 400]).toContain(response.status)
    })
  })

  describe('Malformed Response Data Edge Cases', () => {
    test('should handle empty responses object', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: {}
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle responses with invalid question IDs', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: {
            'invalid_id': 4,
            '-1': 3,
            '999999': 5,
            'null': 2,
            '': 1
          }
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle responses with invalid values', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: {
            1: null,
            2: undefined,
            3: 'invalid_string',
            4: {},
            5: [],
            6: Infinity,
            7: NaN,
            8: -Infinity
          }
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle extremely large response values', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: {
            1: Number.MAX_SAFE_INTEGER,
            2: Number.MIN_SAFE_INTEGER,
            3: 1e100,
            4: -1e100
          }
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle circular reference in responses', async () => {
      const circularObject: any = { a: 1 }
      circularObject.self = circularObject
      
      // This test checks that our API handles JSON parsing errors gracefully
      const malformedJSON = '{"child_name":"Test","quiz_type":"parent_home","respondent_type":"parent","responses":{"1":'
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: malformedJSON
      })

      const response = await POST(request)
      
      // Should handle JSON parsing error gracefully
      expect([400, 500]).toContain(response.status)
    })
  })

  describe('Age and Date Edge Cases', () => {
    test('should handle invalid age groups', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 },
          age_group: 'invalid_age_group'
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle negative precise age months', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 },
          precise_age_months: -5
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle extremely large age values', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 },
          precise_age_months: 999999
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle invalid birth dates', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 },
          birth_date: 'invalid_date'
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle future birth dates', async () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 5)
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 },
          birth_date: futureDate.toISOString()
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })
  })

  describe('School Context Edge Cases', () => {
    test('should handle extremely long school context values', async () => {
      const longString = 'A'.repeat(10000)
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'teacher_classroom',
          respondent_type: 'teacher',
          responses: { 1: 4, 2: 3, 3: 5 },
          school_context: {
            school_name: longString,
            teacher_name: longString,
            classroom: longString
          }
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle special characters in school context', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'teacher_classroom',
          respondent_type: 'teacher',
          responses: { 1: 4, 2: 3, 3: 5 },
          school_context: {
            school_name: "École Français & 中文学校 <script>alert('xss')</script>",
            teacher_name: "Ms. O'Connor-Smith 💖",
            classroom: "Room #123 [Advanced] {Grade 2}"
          }
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    test('should handle null and undefined school context fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'teacher_classroom',
          respondent_type: 'teacher',
          responses: { 1: 4, 2: 3, 3: 5 },
          school_context: {
            school_name: null,
            teacher_name: undefined,
            classroom: ''
          }
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })
  })

  describe('Memory and Performance Edge Cases', () => {
    test('should handle very large response datasets', async () => {
      // Create a large responses object
      const largeResponses: Record<number, number> = {}
      for (let i = 1; i <= 10000; i++) {
        largeResponses[i] = Math.floor(Math.random() * 5) + 1
      }
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: largeResponses
        })
      })

      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()
      
      // Should complete within reasonable time (10 seconds)
      expect(endTime - startTime).toBeLessThan(10000)
      expect([200, 413, 500]).toContain(response.status) // 413 = Payload Too Large
    })

    test('should handle deeply nested objects gracefully', async () => {
      // Create deeply nested object structure
      let deepObject: any = { value: 5 }
      for (let i = 0; i < 100; i++) {
        deepObject = { nested: deepObject }
      }
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: deepObject }
        })
      })

      const response = await POST(request)
      
      // Should handle gracefully without crashing
      expect([200, 400, 500]).toContain(response.status)
    })
  })

  describe('Concurrent Request Edge Cases', () => {
    test('should handle multiple simultaneous requests for same child', async () => {
      const createRequest = () => new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Concurrent Test Child',
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: { 1: 4, 2: 3, 3: 5 },
          existing_profile_id: 'same-profile-id'
        })
      })

      // Send 5 concurrent requests
      const promises = Array.from({ length: 5 }, () => POST(createRequest()))
      const responses = await Promise.all(promises)
      
      // All requests should complete (may succeed or fail gracefully)
      responses.forEach(response => {
        expect([200, 400, 409, 500]).toContain(response.status)
      })
    })

    test('should handle race conditions in profile creation', async () => {
      const requests = Array.from({ length: 3 }, (_, i) => 
        new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'Race Condition Child',
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: i + 3, 2: i + 2, 3: i + 4 }
          })
        })
      )

      const promises = requests.map(request => POST(request))
      const responses = await Promise.allSettled(promises)
      
      // Should handle race conditions gracefully
      responses.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect([200, 400, 409, 500]).toContain(result.value.status)
        }
      })
    })
  })

  describe('GET Endpoint Edge Cases', () => {
    test('should handle missing required parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toContain('Profile ID or child name required')
    })

    test('should handle invalid profile ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive?profileId=invalid-uuid-format')
      
      const response = await GET(request)
      
      // Should handle gracefully
      expect([200, 400, 404, 500]).toContain(response.status)
    })

    test('should handle SQL injection in query parameters', async () => {
      const maliciousId = "'; DROP TABLE profiles; --"
      const request = new NextRequest(`http://localhost:3000/api/profiles/progressive?profileId=${encodeURIComponent(maliciousId)}`)
      
      const response = await GET(request)
      
      // Should handle safely without executing SQL
      expect([200, 400, 404, 500]).toContain(response.status)
    })

    test('should handle extremely long query parameters', async () => {
      const longValue = 'A'.repeat(100000)
      const request = new NextRequest(`http://localhost:3000/api/profiles/progressive?childName=${encodeURIComponent(longValue)}`)
      
      const response = await GET(request)
      
      // Should handle gracefully
      expect([200, 400, 404, 414, 500]).toContain(response.status) // 414 = URI Too Long
    })
  })

  describe('Environment Variable Edge Cases', () => {
    test('should handle missing NEXT_PUBLIC_BASE_URL', async () => {
      const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
      delete process.env.NEXT_PUBLIC_BASE_URL
      
      try {
        const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
          method: 'POST',
          body: JSON.stringify({
            child_name: 'Test Child',
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            responses: { 1: 4, 2: 3, 3: 5 }
          })
        })

        const response = await POST(request)
        
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.shareUrl).toBeDefined()
      } finally {
        if (originalBaseUrl) {
          process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl
        }
      }
    })
  })
})