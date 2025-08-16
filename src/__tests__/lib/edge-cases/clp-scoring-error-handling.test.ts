// CLP 2.0 Scoring System Error Handling and Edge Cases
// Comprehensive testing for malformed inputs, calculation errors, and boundary conditions

import {
  calculateCLP2Scores,
  consolidateCLP2Scores,
  getCLP2PersonalityLabel,
  getCLP2StrengthsAndGrowth,
  getPointsFromResponse,
  convertLegacyToCLP2,
  CLP2Scores,
  CLP2_SKILL_MAPPING,
  CLP2_SKILLS,
  CLP2_PREFERENCES
} from '../../../lib/clp-scoring'

describe('CLP 2.0 Scoring System - Error Handling and Edge Cases', () => {
  
  describe('calculateCLP2Scores Edge Cases', () => {
    test('should handle completely empty responses', () => {
      const result = calculateCLP2Scores({})
      
      // Should return valid structure with default values
      expect(result).toHaveProperty('Communication')
      expect(result).toHaveProperty('Collaboration')
      expect(result).toHaveProperty('Content')
      expect(result).toHaveProperty('Critical Thinking')
      expect(result).toHaveProperty('Creative Innovation')
      expect(result).toHaveProperty('Confidence')
      expect(result).toHaveProperty('Literacy')
      expect(result).toHaveProperty('Math')
      
      // All numeric scores should be minimum value (1.0)
      CLP2_SKILLS.forEach(skill => {
        expect(result[skill]).toBe(1.0)
      })
    })

    test('should handle null responses object', () => {
      expect(() => calculateCLP2Scores(null as any)).not.toThrow()
      
      const result = calculateCLP2Scores(null as any)
      expect(result).toBeDefined()
    })

    test('should handle undefined responses object', () => {
      expect(() => calculateCLP2Scores(undefined as any)).not.toThrow()
      
      const result = calculateCLP2Scores(undefined as any)
      expect(result).toBeDefined()
    })

    test('should handle responses with invalid data types', () => {
      const malformedResponses = {
        1: 'not_a_number' as any,
        2: {} as any,
        3: [] as any,
        4: null as any,
        5: undefined as any,
        6: Symbol('test') as any,
        7: function() {} as any,
        8: new Date() as any,
        9: /regex/ as any,
        10: BigInt(123) as any
      }
      
      expect(() => calculateCLP2Scores(malformedResponses)).not.toThrow()
      
      const result = calculateCLP2Scores(malformedResponses)
      expect(result).toBeDefined()
      expect(typeof result.Communication).toBe('number')
    })

    test('should handle responses with extreme numeric values', () => {
      const extremeResponses = {
        1: Number.MAX_SAFE_INTEGER,
        2: Number.MIN_SAFE_INTEGER,
        3: Number.POSITIVE_INFINITY,
        4: Number.NEGATIVE_INFINITY,
        5: Number.MAX_VALUE,
        6: Number.MIN_VALUE,
        7: 1e100,
        8: -1e100,
        9: 0.0000000001,
        10: 999999999999
      }
      
      expect(() => calculateCLP2Scores(extremeResponses)).not.toThrow()
      
      const result = calculateCLP2Scores(extremeResponses)
      
      // All scores should be within valid range (1.0 to 5.0)
      CLP2_SKILLS.forEach(skill => {
        expect(result[skill]).toBeGreaterThanOrEqual(1.0)
        expect(result[skill]).toBeLessThanOrEqual(5.0)
        expect(Number.isFinite(result[skill])).toBe(true)
      })
    })

    test('should handle NaN and special numeric values', () => {
      const nanResponses = {
        1: NaN,
        2: 0 / 0,
        3: Math.sqrt(-1),
        4: parseInt('not_a_number'),
        5: parseFloat('invalid'),
        6: Number('garbage'),
        7: +'not_numeric'
      }
      
      expect(() => calculateCLP2Scores(nanResponses)).not.toThrow()
      
      const result = calculateCLP2Scores(nanResponses)
      
      // Should handle NaN gracefully
      CLP2_SKILLS.forEach(skill => {
        expect(Number.isFinite(result[skill])).toBe(true)
      })
    })

    test('should handle responses with circular references', () => {
      const circularResponse: any = { questionId: 1 }
      circularResponse.self = circularResponse
      
      const responsesWithCircular = {
        1: circularResponse,
        2: 4,
        3: 5
      }
      
      expect(() => calculateCLP2Scores(responsesWithCircular)).not.toThrow()
    })

    test('should handle quiz types that throw errors', () => {
      const responses = { 1: 4, 2: 3, 3: 5 }
      
      // Mock console.error to avoid test noise
      const originalConsoleError = console.error
      console.error = jest.fn()
      
      try {
        expect(() => calculateCLP2Scores(responses, 'invalid_quiz_type' as any)).not.toThrow()
        expect(() => calculateCLP2Scores(responses, null as any)).not.toThrow()
        expect(() => calculateCLP2Scores(responses, undefined as any)).not.toThrow()
      } finally {
        console.error = originalConsoleError
      }
    })

    test('should handle age groups that cause errors', () => {
      const responses = { 1: 4, 2: 3, 3: 5 }
      
      expect(() => calculateCLP2Scores(responses, 'general', 'invalid_age' as any)).not.toThrow()
      expect(() => calculateCLP2Scores(responses, 'general', null as any)).not.toThrow()
      expect(() => calculateCLP2Scores(responses, 'general', undefined as any)).not.toThrow()
    })
  })

  describe('getPointsFromResponse Edge Cases', () => {
    test('should handle invalid question IDs', () => {
      expect(getPointsFromResponse(-1, 4)).toBe(0)
      expect(getPointsFromResponse(0, 4)).toBe(0)
      expect(getPointsFromResponse(999999, 4)).toBe(0)
      expect(getPointsFromResponse(NaN, 4)).toBe(0)
      expect(getPointsFromResponse(Infinity, 4)).toBe(0)
    })

    test('should handle invalid response values', () => {
      expect(getPointsFromResponse(1, null as any)).toBe(0)
      expect(getPointsFromResponse(1, undefined as any)).toBe(0)
      expect(getPointsFromResponse(1, {} as any)).toBe(0)
      expect(getPointsFromResponse(1, [] as any)).toBe(0)
      expect(getPointsFromResponse(1, NaN)).toBe(0)
      expect(getPointsFromResponse(1, Infinity)).toBe(0)
    })

    test('should handle boundary numeric values correctly', () => {
      // Test boundary conditions for Likert scale mapping
      expect(getPointsFromResponse(1, 0)).toBe(0.0)
      expect(getPointsFromResponse(1, 0.9)).toBe(0.0)
      expect(getPointsFromResponse(1, 1)).toBe(0.0)
      expect(getPointsFromResponse(1, 1.9)).toBe(0.0)
      expect(getPointsFromResponse(1, 2)).toBe(0.0)
      expect(getPointsFromResponse(1, 2.9)).toBe(0.5)
      expect(getPointsFromResponse(1, 3)).toBe(0.5)
      expect(getPointsFromResponse(1, 3.9)).toBe(0.5)
      expect(getPointsFromResponse(1, 4)).toBe(0.5)
      expect(getPointsFromResponse(1, 4.9)).toBe(1.0)
      expect(getPointsFromResponse(1, 5)).toBe(1.0)
      expect(getPointsFromResponse(1, 6)).toBe(1.0)
    })

    test('should handle string responses for preference questions', () => {
      const preferenceQuestionId = 25 // Engagement question
      
      expect(getPointsFromResponse(preferenceQuestionId, 'hands-on')).toBe(0)
      expect(getPointsFromResponse(preferenceQuestionId, '')).toBe(0)
      expect(getPointsFromResponse(preferenceQuestionId, 'invalid')).toBe(0)
    })

    test('should handle array responses for preference questions', () => {
      const interestQuestionId = 28 // Interests question
      
      expect(getPointsFromResponse(interestQuestionId, ['animals', 'art'])).toBe(0)
      expect(getPointsFromResponse(interestQuestionId, [])).toBe(0)
      expect(getPointsFromResponse(interestQuestionId, [null, undefined])).toBe(0)
    })
  })

  describe('getCLP2PersonalityLabel Edge Cases', () => {
    test('should handle scores with all zeros', () => {
      const zeroScores: CLP2Scores = {
        Communication: 0,
        Collaboration: 0,
        Content: 0,
        'Critical Thinking': 0,
        'Creative Innovation': 0,
        Confidence: 0,
        Literacy: 0,
        Math: 0
      }
      
      const label = getCLP2PersonalityLabel(zeroScores)
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })

    test('should handle scores with all same values', () => {
      const equalScores: CLP2Scores = {
        Communication: 2.5,
        Collaboration: 2.5,
        Content: 2.5,
        'Critical Thinking': 2.5,
        'Creative Innovation': 2.5,
        Confidence: 2.5,
        Literacy: 2.5,
        Math: 2.5
      }
      
      const label = getCLP2PersonalityLabel(equalScores)
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })

    test('should handle scores with NaN values', () => {
      const nanScores: CLP2Scores = {
        Communication: NaN,
        Collaboration: 2.5,
        Content: NaN,
        'Critical Thinking': 2.5,
        'Creative Innovation': NaN,
        Confidence: 2.5,
        Literacy: NaN,
        Math: 2.5
      }
      
      expect(() => getCLP2PersonalityLabel(nanScores)).not.toThrow()
      const label = getCLP2PersonalityLabel(nanScores)
      expect(typeof label).toBe('string')
    })

    test('should handle scores with Infinity values', () => {
      const infinityScores: CLP2Scores = {
        Communication: Infinity,
        Collaboration: 2.5,
        Content: -Infinity,
        'Critical Thinking': 2.5,
        'Creative Innovation': Number.POSITIVE_INFINITY,
        Confidence: 2.5,
        Literacy: Number.NEGATIVE_INFINITY,
        Math: 2.5
      }
      
      expect(() => getCLP2PersonalityLabel(infinityScores)).not.toThrow()
      const label = getCLP2PersonalityLabel(infinityScores)
      expect(typeof label).toBe('string')
    })

    test('should handle malformed scores object', () => {
      const malformedScores = {
        Communication: 'not_a_number',
        Collaboration: {},
        Content: [],
        'Critical Thinking': null,
        'Creative Innovation': undefined,
        // Missing required fields
      } as any
      
      expect(() => getCLP2PersonalityLabel(malformedScores)).not.toThrow()
    })
  })

  describe('getCLP2StrengthsAndGrowth Edge Cases', () => {
    test('should handle empty scores object', () => {
      const result = getCLP2StrengthsAndGrowth({} as any)
      
      expect(result).toHaveProperty('strengths')
      expect(result).toHaveProperty('growthAreas')
      expect(Array.isArray(result.strengths)).toBe(true)
      expect(Array.isArray(result.growthAreas)).toBe(true)
    })

    test('should handle scores with only preference fields', () => {
      const preferencesOnlyScores = {
        Engagement: 'hands-on',
        Modality: 'visual',
        Social: 'small-group',
        Interests: ['animals', 'art']
      } as any
      
      const result = getCLP2StrengthsAndGrowth(preferencesOnlyScores)
      expect(result.strengths).toHaveLength(0)
      expect(result.growthAreas).toHaveLength(0)
    })

    test('should handle extreme score distributions', () => {
      const extremeScores: CLP2Scores = {
        Communication: 5.0,
        Collaboration: 5.0,
        Content: 5.0,
        'Critical Thinking': 5.0,
        'Creative Innovation': 1.0,
        Confidence: 1.0,
        Literacy: 1.0,
        Math: 1.0
      }
      
      const result = getCLP2StrengthsAndGrowth(extremeScores)
      expect(result.strengths.length).toBeGreaterThan(0)
      expect(result.growthAreas.length).toBeGreaterThan(0)
    })
  })

  describe('consolidateCLP2Scores Edge Cases', () => {
    test('should handle empty source scores array', () => {
      const result = consolidateCLP2Scores([])
      
      expect(result).toHaveProperty('Communication')
      expect(result).toHaveProperty('Collaboration')
      expect(result).toHaveProperty('Content')
      expect(result).toHaveProperty('Critical Thinking')
      expect(result).toHaveProperty('Creative Innovation')
      expect(result).toHaveProperty('Confidence')
      expect(result).toHaveProperty('Literacy')
      expect(result).toHaveProperty('Math')
      
      // Should use default neutral scores
      CLP2_SKILLS.forEach(skill => {
        expect(result[skill]).toBe(3.0)
      })
    })

    test('should handle source scores with zero weights', () => {
      const sourceScores = [
        {
          scores: {
            Communication: 5.0,
            Collaboration: 4.0,
            Content: 3.0,
            'Critical Thinking': 2.0,
            'Creative Innovation': 1.0,
            Confidence: 4.0,
            Literacy: 3.0,
            Math: 2.0
          } as CLP2Scores,
          weight: 0,
          quizType: 'parent_home',
          respondentType: 'parent'
        }
      ]
      
      const result = consolidateCLP2Scores(sourceScores)
      
      // Should use default scores when no weight
      CLP2_SKILLS.forEach(skill => {
        expect(result[skill]).toBe(3.0)
      })
    })

    test('should handle source scores with negative weights', () => {
      const sourceScores = [
        {
          scores: {
            Communication: 5.0,
            Collaboration: 4.0,
            Content: 3.0,
            'Critical Thinking': 2.0,
            'Creative Innovation': 1.0,
            Confidence: 4.0,
            Literacy: 3.0,
            Math: 2.0
          } as CLP2Scores,
          weight: -1,
          quizType: 'parent_home',
          respondentType: 'parent'
        }
      ]
      
      expect(() => consolidateCLP2Scores(sourceScores)).not.toThrow()
      const result = consolidateCLP2Scores(sourceScores)
      expect(result).toBeDefined()
    })

    test('should handle source scores with NaN weights', () => {
      const sourceScores = [
        {
          scores: {
            Communication: 5.0,
            Collaboration: 4.0,
            Content: 3.0,
            'Critical Thinking': 2.0,
            'Creative Innovation': 1.0,
            Confidence: 4.0,
            Literacy: 3.0,
            Math: 2.0
          } as CLP2Scores,
          weight: NaN,
          quizType: 'parent_home',
          respondentType: 'parent'
        }
      ]
      
      expect(() => consolidateCLP2Scores(sourceScores)).not.toThrow()
      const result = consolidateCLP2Scores(sourceScores)
      expect(result).toBeDefined()
    })

    test('should handle source scores with malformed scores objects', () => {
      const sourceScores = [
        {
          scores: {
            Communication: 'invalid',
            Collaboration: null,
            Content: undefined,
            'Critical Thinking': {},
            'Creative Innovation': [],
            // Missing required fields
          } as any,
          weight: 1.0,
          quizType: 'parent_home',
          respondentType: 'parent'
        }
      ]
      
      expect(() => consolidateCLP2Scores(sourceScores)).not.toThrow()
      const result = consolidateCLP2Scores(sourceScores)
      expect(result).toBeDefined()
    })

    test('should handle extremely large weight values', () => {
      const sourceScores = [
        {
          scores: {
            Communication: 5.0,
            Collaboration: 4.0,
            Content: 3.0,
            'Critical Thinking': 2.0,
            'Creative Innovation': 1.0,
            Confidence: 4.0,
            Literacy: 3.0,
            Math: 2.0
          } as CLP2Scores,
          weight: Number.MAX_SAFE_INTEGER,
          quizType: 'parent_home',
          respondentType: 'parent'
        }
      ]
      
      expect(() => consolidateCLP2Scores(sourceScores)).not.toThrow()
      const result = consolidateCLP2Scores(sourceScores)
      
      // Should produce finite results
      CLP2_SKILLS.forEach(skill => {
        expect(Number.isFinite(result[skill])).toBe(true)
      })
    })
  })

  describe('convertLegacyToCLP2 Edge Cases', () => {
    test('should handle empty legacy scores', () => {
      const result = convertLegacyToCLP2({})
      
      CLP2_SKILLS.forEach(skill => {
        expect(result[skill]).toBe(3.0) // Default value
      })
    })

    test('should handle null legacy scores', () => {
      expect(() => convertLegacyToCLP2(null as any)).not.toThrow()
      const result = convertLegacyToCLP2(null as any)
      expect(result).toBeDefined()
    })

    test('should handle legacy scores with invalid values', () => {
      const invalidLegacyScores = {
        Communication: 'invalid',
        Collaboration: null,
        Content: undefined,
        'Critical Thinking': {},
        'Creative Innovation': [],
        Confidence: NaN,
        Literacy: Infinity,
        Math: -Infinity
      }
      
      expect(() => convertLegacyToCLP2(invalidLegacyScores)).not.toThrow()
      const result = convertLegacyToCLP2(invalidLegacyScores)
      
      CLP2_SKILLS.forEach(skill => {
        expect(Number.isFinite(result[skill])).toBe(true)
      })
    })

    test('should handle legacy scores with extra fields', () => {
      const legacyWithExtra = {
        Communication: 4.0,
        Collaboration: 3.5,
        Content: 2.8,
        'Critical Thinking': 3.2,
        'Creative Innovation': 4.1,
        Confidence: 3.8,
        Literacy: 3.0,
        Math: 2.5,
        ExtraField1: 'should_be_ignored',
        ExtraField2: 999,
        ExtraField3: { nested: 'object' }
      }
      
      const result = convertLegacyToCLP2(legacyWithExtra)
      
      // Should only include CLP 2.0 fields
      expect(Object.keys(result)).toEqual(expect.arrayContaining(CLP2_SKILLS))
      expect(result).not.toHaveProperty('ExtraField1')
      expect(result).not.toHaveProperty('ExtraField2')
      expect(result).not.toHaveProperty('ExtraField3')
    })
  })

  describe('Memory Stress Tests', () => {
    test('should handle very large responses datasets without memory issues', () => {
      const largeResponses: Record<number, number> = {}
      
      // Create 100,000 responses
      for (let i = 1; i <= 100000; i++) {
        largeResponses[i] = (i % 5) + 1
      }
      
      const startMemory = process.memoryUsage().heapUsed
      
      expect(() => calculateCLP2Scores(largeResponses)).not.toThrow()
      
      const endMemory = process.memoryUsage().heapUsed
      const memoryIncrease = endMemory - startMemory
      
      // Should not increase memory by more than 100MB
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)
    })

    test('should handle repeated calculations without memory leaks', () => {
      const responses = { 1: 4, 2: 3, 3: 5, 4: 2, 5: 4 }
      
      const startMemory = process.memoryUsage().heapUsed
      
      // Perform 1000 calculations
      for (let i = 0; i < 1000; i++) {
        calculateCLP2Scores(responses)
      }
      
      const endMemory = process.memoryUsage().heapUsed
      const memoryIncrease = endMemory - startMemory
      
      // Should not significantly increase memory
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // Less than 10MB
    })
  })

  describe('Performance Edge Cases', () => {
    test('should handle complex scoring calculations within reasonable time', () => {
      const complexResponses: Record<number, number | string | string[]> = {}
      
      // Mix of numeric, string, and array responses
      for (let i = 1; i <= 1000; i++) {
        if (i % 3 === 0) {
          complexResponses[i] = ['option1', 'option2', 'option3']
        } else if (i % 2 === 0) {
          complexResponses[i] = `string_response_${i}`
        } else {
          complexResponses[i] = (i % 5) + 1
        }
      }
      
      const startTime = performance.now()
      calculateCLP2Scores(complexResponses)
      const endTime = performance.now()
      
      // Should complete within 500ms
      expect(endTime - startTime).toBeLessThan(500)
    })

    test('should handle consolidation of many profiles efficiently', () => {
      const manyProfiles = Array.from({ length: 100 }, (_, i) => ({
        scores: {
          Communication: (i % 5) + 1,
          Collaboration: (i % 4) + 1,
          Content: (i % 3) + 1,
          'Critical Thinking': (i % 5) + 1,
          'Creative Innovation': (i % 4) + 1,
          Confidence: (i % 3) + 1,
          Literacy: (i % 5) + 1,
          Math: (i % 4) + 1
        } as CLP2Scores,
        weight: Math.random(),
        quizType: i % 2 === 0 ? 'parent_home' : 'teacher_classroom',
        respondentType: i % 2 === 0 ? 'parent' : 'teacher'
      }))
      
      const startTime = performance.now()
      consolidateCLP2Scores(manyProfiles)
      const endTime = performance.now()
      
      // Should complete within 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})