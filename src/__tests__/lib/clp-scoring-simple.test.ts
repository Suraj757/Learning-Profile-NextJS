// CLP 2.0 Scoring Engine - Focused Tests
// Testing actual implementation with realistic data

import { 
  calculateCLP2Scores,
  CLP2Response,
  CLP2_SKILL_MAPPING,
  getPointsFromResponse,
  consolidateCLP2Scores
} from '../../lib/clp-scoring'

describe('CLP 2.0 Scoring Engine - Core Functionality', () => {
  describe('Skill Mapping', () => {
    test('should have correct skill mappings for all questions', () => {
      // Test core questions 1-24
      expect(CLP2_SKILL_MAPPING[1]).toBe('Communication')
      expect(CLP2_SKILL_MAPPING[2]).toBe('Communication')
      expect(CLP2_SKILL_MAPPING[3]).toBe('Communication')
      
      expect(CLP2_SKILL_MAPPING[4]).toBe('Collaboration')
      expect(CLP2_SKILL_MAPPING[5]).toBe('Collaboration')
      expect(CLP2_SKILL_MAPPING[6]).toBe('Collaboration')
      
      expect(CLP2_SKILL_MAPPING[19]).toBe('Literacy')
      expect(CLP2_SKILL_MAPPING[20]).toBe('Literacy')
      expect(CLP2_SKILL_MAPPING[21]).toBe('Literacy')
      
      expect(CLP2_SKILL_MAPPING[22]).toBe('Math')
      expect(CLP2_SKILL_MAPPING[23]).toBe('Math')
      expect(CLP2_SKILL_MAPPING[24]).toBe('Math')
    })

    test('should have 24 core skill questions mapped', () => {
      const skillQuestions = Object.keys(CLP2_SKILL_MAPPING).map(Number).filter(id => id <= 24)
      expect(skillQuestions).toHaveLength(24)
    })
  })

  describe('Points Calculation', () => {
    test('should convert 1-5 scale to 0-1 points correctly', () => {
      expect(getPointsFromResponse(1)).toBe(0)
      expect(getPointsFromResponse(2)).toBe(0.25)
      expect(getPointsFromResponse(3)).toBe(0.5)
      expect(getPointsFromResponse(4)).toBe(0.75)
      expect(getPointsFromResponse(5)).toBe(1.0)
    })

    test('should handle string responses for preferences', () => {
      expect(getPointsFromResponse('hands-on')).toBe(0) // Preferences don't have points
      expect(getPointsFromResponse(['animals', 'art'])).toBe(0)
    })

    test('should clamp out-of-range values', () => {
      expect(getPointsFromResponse(0)).toBe(0)
      expect(getPointsFromResponse(6)).toBe(1.0)
      expect(getPointsFromResponse(-1)).toBe(0)
      expect(getPointsFromResponse(10)).toBe(1.0)
    })
  })

  describe('Score Calculation', () => {
    test('should calculate scores from valid responses', () => {
      const responses: CLP2Response[] = [
        { questionId: 1, value: 4, skillCategory: 'Communication', points: 0.75 },
        { questionId: 2, value: 3, skillCategory: 'Communication', points: 0.5 },
        { questionId: 3, value: 5, skillCategory: 'Communication', points: 1.0 },
        { questionId: 19, value: 4, skillCategory: 'Literacy', points: 0.75 },
        { questionId: 20, value: 4, skillCategory: 'Literacy', points: 0.75 },
        { questionId: 21, value: 3, skillCategory: 'Literacy', points: 0.5 }
      ]

      const scores = calculateCLP2Scores(responses)

      // Should have all 8 skills
      expect(scores).toHaveProperty('Communication')
      expect(scores).toHaveProperty('Collaboration')
      expect(scores).toHaveProperty('Content')
      expect(scores).toHaveProperty('Critical Thinking')
      expect(scores).toHaveProperty('Creative Innovation')
      expect(scores).toHaveProperty('Confidence')
      expect(scores).toHaveProperty('Literacy')
      expect(scores).toHaveProperty('Math')

      // Communication: (0.75 + 0.5 + 1.0) / 3 = 0.75 → scaled to 0-3 = 2.25
      expect(scores.Communication).toBeCloseTo(2.25, 1)
      
      // Literacy: (0.75 + 0.75 + 0.5) / 3 = 0.67 → scaled to 0-3 = 2.0
      expect(scores.Literacy).toBeCloseTo(2.0, 1)
    })

    test('should handle missing skills gracefully', () => {
      const responses: CLP2Response[] = [
        { questionId: 1, value: 4, skillCategory: 'Communication', points: 0.75 }
      ]

      const scores = calculateCLP2Scores(responses)

      expect(scores.Communication).toBeGreaterThan(0)
      // Missing skills should default to baseline
      expect(scores.Collaboration).toBeDefined()
      expect(scores.Math).toBeDefined()
    })

    test('should include preference questions', () => {
      const responses: CLP2Response[] = [
        { questionId: 25, value: 'hands-on', skillCategory: 'Engagement', points: 0 },
        { questionId: 26, value: 'creative', skillCategory: 'Modality', points: 0 },
        { questionId: 27, value: 'small-group', skillCategory: 'Social', points: 0 },
        { questionId: 28, value: ['animals', 'art'], skillCategory: 'Interests', points: 0 }
      ]

      const scores = calculateCLP2Scores(responses)

      expect(scores.Engagement).toBe('hands-on')
      expect(scores.Modality).toBe('creative')
      expect(scores.Social).toBe('small-group')
      expect(scores.Interests).toEqual(['animals', 'art'])
    })
  })

  describe('Score Consolidation', () => {
    test('should consolidate multiple score sets', () => {
      const parentScores = {
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

      const teacherScores = {
        Communication: 2.2,
        Collaboration: 2.4,
        Content: 2.0,
        'Critical Thinking': 2.5,
        'Creative Innovation': 2.1,
        Confidence: 2.0,
        Literacy: 2.3,
        Math: 2.1
      }

      const consolidated = consolidateCLP2Scores([parentScores, teacherScores])

      // Should blend numerical scores
      expect(consolidated.Communication).toBeCloseTo(2.35, 1) // (2.5 + 2.2) / 2
      expect(consolidated.Literacy).toBeCloseTo(2.2, 1) // (2.1 + 2.3) / 2

      // Should preserve preferences from first profile with preferences
      expect(consolidated.Engagement).toBe('hands-on')
      expect(consolidated.Interests).toEqual(['animals', 'art'])
    })

    test('should handle single score set', () => {
      const singleScores = {
        Communication: 2.5,
        Collaboration: 2.0,
        Content: 1.8,
        'Critical Thinking': 2.2,
        'Creative Innovation': 2.8,
        Confidence: 2.4,
        Literacy: 2.1,
        Math: 1.9
      }

      const consolidated = consolidateCLP2Scores([singleScores])

      expect(consolidated.Communication).toBe(2.5)
      expect(consolidated.Literacy).toBe(2.1)
    })
  })

  describe('Extended Age Questions', () => {
    test('should handle extended question IDs', () => {
      const extendedResponses: CLP2Response[] = [
        { questionId: 29, value: 4, skillCategory: 'Communication', points: 0.75 },
        { questionId: 50, value: 3, skillCategory: 'Math', points: 0.5 },
        { questionId: 52, value: 5, skillCategory: 'Math', points: 1.0 }
      ]

      const scores = calculateCLP2Scores(extendedResponses)

      expect(scores.Communication).toBeGreaterThan(0)
      expect(scores.Math).toBeGreaterThan(0)
    })
  })

  describe('Data Validation', () => {
    test('should handle empty response array', () => {
      const scores = calculateCLP2Scores([])

      // Should return a valid scores object with default values
      expect(scores).toHaveProperty('Communication')
      expect(scores).toHaveProperty('Literacy')
      expect(scores).toHaveProperty('Math')
    })

    test('should handle malformed responses gracefully', () => {
      const malformedResponses: any[] = [
        { questionId: 'invalid', value: 4, skillCategory: 'Communication', points: 0.75 },
        { value: 3, skillCategory: 'Literacy', points: 0.5 }, // Missing questionId
        { questionId: 1, skillCategory: 'Communication', points: 0.75 } // Missing value
      ]

      expect(() => calculateCLP2Scores(malformedResponses)).not.toThrow()
    })
  })

  describe('Performance', () => {
    test('should handle large response sets efficiently', () => {
      const largeResponseSet: CLP2Response[] = []

      // Generate 1000 responses
      for (let i = 0; i < 1000; i++) {
        largeResponseSet.push({
          questionId: (i % 24) + 1,
          value: Math.floor(Math.random() * 5) + 1,
          skillCategory: Object.values(CLP2_SKILL_MAPPING)[(i % 8)] as keyof typeof CLP2_SKILL_MAPPING,
          points: Math.random()
        })
      }

      const startTime = performance.now()
      const scores = calculateCLP2Scores(largeResponseSet)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
      expect(scores.Communication).toBeGreaterThanOrEqual(0)
    })
  })
})