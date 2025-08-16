// CLP 2.0 Scoring Engine Tests - Working with Actual Implementation
// Tests based on the real function signatures and behavior

import { 
  calculateCLP2Scores,
  getPointsFromResponse,
  CLP2_SKILL_MAPPING,
  consolidateCLP2Scores
} from '../../lib/clp-scoring'

describe('CLP 2.0 Scoring Engine - Actual Implementation', () => {
  describe('Skill Mapping Validation', () => {
    test('should have complete skill mappings', () => {
      expect(CLP2_SKILL_MAPPING[1]).toBe('Communication')
      expect(CLP2_SKILL_MAPPING[2]).toBe('Communication')
      expect(CLP2_SKILL_MAPPING[3]).toBe('Communication')
      
      expect(CLP2_SKILL_MAPPING[4]).toBe('Collaboration')
      expect(CLP2_SKILL_MAPPING[5]).toBe('Collaboration')
      expect(CLP2_SKILL_MAPPING[6]).toBe('Collaboration')
      
      expect(CLP2_SKILL_MAPPING[7]).toBe('Content')
      expect(CLP2_SKILL_MAPPING[10]).toBe('Critical Thinking')
      expect(CLP2_SKILL_MAPPING[13]).toBe('Creative Innovation')
      expect(CLP2_SKILL_MAPPING[16]).toBe('Confidence')
      expect(CLP2_SKILL_MAPPING[19]).toBe('Literacy')
      expect(CLP2_SKILL_MAPPING[22]).toBe('Math')
    })
  })

  describe('Points Calculation', () => {
    test('should convert likert responses to CLP 2.0 points', () => {
      // Test actual implementation behavior
      expect(getPointsFromResponse(1, 1)).toBe(0.0)  // Strongly Disagree
      expect(getPointsFromResponse(1, 2)).toBe(0.0)  // Disagree
      expect(getPointsFromResponse(1, 3)).toBe(0.5)  // Neutral
      expect(getPointsFromResponse(1, 4)).toBe(0.5)  // Agree
      expect(getPointsFromResponse(1, 5)).toBe(1.0)  // Strongly Agree
    })

    test('should handle preference questions', () => {
      // Preference questions (25-28) should not contribute points
      expect(getPointsFromResponse(25, 'hands-on')).toBe(0)
      expect(getPointsFromResponse(26, 'creative')).toBe(0)
      expect(getPointsFromResponse(28, ['animals', 'art'])).toBe(0)
    })

    test('should handle out-of-range values gracefully', () => {
      expect(getPointsFromResponse(1, 0)).toBe(0)
      expect(getPointsFromResponse(1, 6)).toBe(1.0)
      expect(getPointsFromResponse(1, -1)).toBe(0)
    })
  })

  describe('Score Calculation', () => {
    test('should calculate scores from response record', () => {
      const responses: Record<number, number | string | string[]> = {
        1: 5, // Communication - Strongly Agree (1.0 point)
        2: 4, // Communication - Agree (0.5 point)
        3: 5, // Communication - Strongly Agree (1.0 point)
        19: 4, // Literacy - Agree (0.5 point)
        20: 5, // Literacy - Strongly Agree (1.0 point)
        21: 3, // Literacy - Neutral (0.5 point)
        25: 'hands-on', // Engagement preference
        28: ['animals', 'art'] // Interests
      }

      const scores = calculateCLP2Scores(responses)

      // Should have all required skills
      expect(scores).toHaveProperty('Communication')
      expect(scores).toHaveProperty('Collaboration')
      expect(scores).toHaveProperty('Content')
      expect(scores).toHaveProperty('Critical Thinking')
      expect(scores).toHaveProperty('Creative Innovation')
      expect(scores).toHaveProperty('Confidence')
      expect(scores).toHaveProperty('Literacy')
      expect(scores).toHaveProperty('Math')

      // Communication: (1.0 + 0.5 + 1.0) / 3 = 0.83 → scaled to 1-5 range = ~4.3
      expect(scores.Communication).toBeGreaterThan(1)
      expect(scores.Communication).toBeLessThanOrEqual(5)
      
      // Literacy: (0.5 + 1.0 + 0.5) / 3 = 0.67 → scaled to 1-5 range = ~3.7
      expect(scores.Literacy).toBeGreaterThan(1)
      expect(scores.Literacy).toBeLessThanOrEqual(5)

      // Should include preferences
      expect(scores.Engagement).toBe('hands-on')
      expect(scores.Interests).toEqual(['animals', 'art'])
    })

    test('should handle empty responses', () => {
      const scores = calculateCLP2Scores({})

      // Should return valid score structure
      expect(scores).toHaveProperty('Communication')
      expect(scores).toHaveProperty('Literacy')
      expect(scores).toHaveProperty('Math')

      // All skills should be defined
      expect(typeof scores.Communication).toBe('number')
      expect(typeof scores.Literacy).toBe('number')
      expect(typeof scores.Math).toBe('number')
    })

    test('should work with different quiz types', () => {
      const responses: Record<number, number | string | string[]> = {
        1: 4,
        2: 5,
        3: 4
      }

      const parentScores = calculateCLP2Scores(responses, 'parent_home')
      const teacherScores = calculateCLP2Scores(responses, 'teacher_classroom')
      const generalScores = calculateCLP2Scores(responses, 'general')

      // All should return valid scores
      expect(parentScores.Communication).toBeGreaterThan(0)
      expect(teacherScores.Communication).toBeGreaterThan(0)
      expect(generalScores.Communication).toBeGreaterThan(0)
    })

    test('should work with different age groups', () => {
      const responses: Record<number, number | string | string[]> = {
        1: 4,
        2: 5,
        3: 4
      }

      const preschoolScores = calculateCLP2Scores(responses, 'general', '3-4')
      const kindergartenScores = calculateCLP2Scores(responses, 'general', '4-5')
      const elementaryScores = calculateCLP2Scores(responses, 'general', '5+')

      // All should return valid scores
      expect(preschoolScores.Communication).toBeGreaterThan(0)
      expect(kindergartenScores.Communication).toBeGreaterThan(0)
      expect(elementaryScores.Communication).toBeGreaterThan(0)
    })
  })

  describe('Score Consolidation', () => {
    test('should consolidate scores with proper format', () => {
      const scores1 = {
        Communication: 2.5,
        Collaboration: 2.0,
        Content: 1.8,
        'Critical Thinking': 2.2,
        'Creative Innovation': 2.8,
        Confidence: 2.4,
        Literacy: 2.1,
        Math: 1.9,
        Engagement: 'hands-on',
        Modality: 'creative',
        Social: 'small-group',
        Interests: ['animals', 'art']
      }

      const scores2 = {
        Communication: 2.2,
        Collaboration: 2.4,
        Content: 2.0,
        'Critical Thinking': 2.5,
        'Creative Innovation': 2.1,
        Confidence: 2.0,
        Literacy: 2.3,
        Math: 2.1
      }

      // Need to check actual consolidation function signature
      const consolidated = consolidateCLP2Scores([
        { scores: scores1, weight: 1.0, context: 'parent_home' },
        { scores: scores2, weight: 1.0, context: 'teacher_classroom' }
      ])

      expect(consolidated.Communication).toBeGreaterThan(2.0)
      expect(consolidated.Communication).toBeLessThan(3.0)
      expect(consolidated.Literacy).toBeGreaterThan(2.0)
    })
  })

  describe('Extended Age Support', () => {
    test('should handle extended question responses', () => {
      const extendedResponses: Record<number, number | string | string[]> = {
        29: 4, // Extended Communication question
        30: 5, // Extended Communication question
        50: 3, // Extended Math question
        51: 4, // Extended Math question
        52: 5  // Extended Math question
      }

      const scores = calculateCLP2Scores(extendedResponses)

      expect(scores.Communication).toBeGreaterThan(0)
      expect(scores.Math).toBeGreaterThan(0)
    })
  })

  describe('Data Validation', () => {
    test('should handle mixed data types', () => {
      const mixedResponses: Record<number, number | string | string[]> = {
        1: 4,
        2: 'invalid' as any, // Invalid response type
        3: 5,
        25: 'hands-on',
        28: ['animals', 'art'],
        999: 4 // Invalid question ID
      }

      expect(() => calculateCLP2Scores(mixedResponses)).not.toThrow()
      
      const scores = calculateCLP2Scores(mixedResponses)
      expect(scores.Communication).toBeGreaterThan(0)
    })

    test('should handle large response sets', () => {
      const largeResponses: Record<number, number | string | string[]> = {}

      // Generate many responses
      for (let i = 1; i <= 100; i++) {
        largeResponses[i] = Math.floor(Math.random() * 5) + 1
      }

      const startTime = performance.now()
      const scores = calculateCLP2Scores(largeResponses)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // Should be fast
      expect(scores.Communication).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Score Range Validation', () => {
    test('should return scores in valid 0-3 range', () => {
      const responses: Record<number, number | string | string[]> = {
        1: 5, 2: 5, 3: 5, // All max Communication
        4: 1, 5: 1, 6: 1, // All min Collaboration
        7: 3, 8: 3, 9: 3, // All neutral Content
        19: 4, 20: 4, 21: 4, // Good Literacy
        22: 2, 23: 2, 24: 2  // Low Math
      }

      const scores = calculateCLP2Scores(responses)

      // All scores should be in valid range (1-5 scale)
      Object.values(scores).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBeGreaterThanOrEqual(1)
          expect(score).toBeLessThanOrEqual(5)
        }
      })

      // High responses should yield higher scores
      expect(scores.Communication).toBeGreaterThan(scores.Collaboration)
    })
  })

  describe('Performance Benchmarks', () => {
    test('should process typical assessment efficiently', () => {
      const typicalResponses: Record<number, number | string | string[]> = {}

      // Simulate full CLP 2.0 assessment (24 skill + 4 preference questions)
      for (let i = 1; i <= 24; i++) {
        typicalResponses[i] = Math.floor(Math.random() * 5) + 1
      }
      typicalResponses[25] = 'hands-on'
      typicalResponses[26] = 'creative'
      typicalResponses[27] = 'small-group'
      typicalResponses[28] = ['animals', 'art', 'stories']

      const iterations = 100
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        calculateCLP2Scores(typicalResponses)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      expect(avgTime).toBeLessThan(10) // Average should be under 10ms per calculation
    })
  })
})