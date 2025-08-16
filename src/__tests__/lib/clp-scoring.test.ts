// CLP 2.0 Scoring Algorithm Tests
// Comprehensive validation of scoring, consolidation, and confidence algorithms

import { 
  calculateCLP2Scores,
  consolidateCLP2Scores,
  CLP2Scores,
  CLP2Response,
  CLP2_SKILL_MAPPING
} from '../../lib/clp-scoring'

describe('CLP 2.0 Scoring Engine', () => {
  // Sample test data for different age groups
  const sampleResponses: CLP2Response[] = [
    // Communication questions
    { questionId: 1, value: 4, skillCategory: 'Communication', points: 0.75 },
    { questionId: 2, value: 3, skillCategory: 'Communication', points: 0.5 },
    { questionId: 3, value: 5, skillCategory: 'Communication', points: 1.0 },
    
    // Collaboration questions
    { questionId: 4, response: 3, ageGroup: '3-4', skill: 'Collaboration' },
    { questionId: 5, response: 4, ageGroup: '3-4', skill: 'Collaboration' },
    { questionId: 6, response: 2, ageGroup: '4-5', skill: 'Collaboration' },
    
    // Content questions
    { questionId: 7, response: 4, ageGroup: '3-4', skill: 'Content' },
    { questionId: 8, response: 3, ageGroup: '3-4', skill: 'Content' },
    { questionId: 9, response: 4, ageGroup: '4-5', skill: 'Content' },
    
    // Critical Thinking questions
    { questionId: 10, response: 3, ageGroup: '4-5', skill: 'Critical Thinking' },
    { questionId: 11, response: 4, ageGroup: '3-4', skill: 'Critical Thinking' },
    { questionId: 12, response: 3, ageGroup: '5-6', skill: 'Critical Thinking' },
    
    // Creative Innovation questions
    { questionId: 13, response: 5, ageGroup: '3-4', skill: 'Creative Innovation' },
    { questionId: 14, response: 4, ageGroup: '3-4', skill: 'Creative Innovation' },
    { questionId: 15, response: 4, ageGroup: '4-5', skill: 'Creative Innovation' },
    
    // Confidence questions
    { questionId: 16, response: 4, ageGroup: '3-4', skill: 'Confidence' },
    { questionId: 17, response: 3, ageGroup: '4-5', skill: 'Confidence' },
    { questionId: 18, response: 4, ageGroup: '3-4', skill: 'Confidence' },
    
    // Literacy questions
    { questionId: 19, response: 3, ageGroup: '3-4', skill: 'Literacy' },
    { questionId: 20, response: 4, ageGroup: '3-4', skill: 'Literacy' },
    { questionId: 21, response: 3, ageGroup: '4-5', skill: 'Literacy' },
    
    // Math questions
    { questionId: 22, response: 4, ageGroup: '3-4', skill: 'Math' },
    { questionId: 23, response: 3, ageGroup: '3-4', skill: 'Math' },
    { questionId: 24, response: 4, ageGroup: '4-5', skill: 'Math' },
    
    // Preference questions
    { questionId: 25, response: 'hands-on', ageGroup: '3-4', skill: 'Engagement' },
    { questionId: 26, response: 'creative', ageGroup: '3-4', skill: 'Modality' },
    { questionId: 27, response: 'small-group', ageGroup: '3-4', skill: 'Social' },
    { questionId: 28, response: ['animals', 'art', 'stories'], ageGroup: '3-4', skill: 'Interests' }
  ]

  describe('Core Scoring Algorithm', () => {
    test('should calculate CLP 2.0 scores correctly', () => {
      const scores = calculateCLP2Scores(sampleResponses)
      
      // Verify all 8 skills are calculated
      expect(scores).toHaveProperty('Communication')
      expect(scores).toHaveProperty('Collaboration')
      expect(scores).toHaveProperty('Content')
      expect(scores).toHaveProperty('Critical Thinking')
      expect(scores).toHaveProperty('Creative Innovation')
      expect(scores).toHaveProperty('Confidence')
      expect(scores).toHaveProperty('Literacy')
      expect(scores).toHaveProperty('Math')
      
      // Verify scores are in 0-3 range
      Object.values(scores).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBeGreaterThanOrEqual(0)
          expect(score).toBeLessThanOrEqual(3)
        }
      })
    })

    test('should handle 1-5 to 0-3 scale conversion correctly', () => {
      const responses: CLP2Response[] = [
        { questionId: 1, response: 1, ageGroup: '3-4', skill: 'Communication' }, // 1 -> 0
        { questionId: 2, response: 3, ageGroup: '3-4', skill: 'Communication' }, // 3 -> 1.5
        { questionId: 3, response: 5, ageGroup: '3-4', skill: 'Communication' }  // 5 -> 3
      ]
      
      const scores = calculateCLP2Scores(responses)
      
      // Average should be (0 + 1.5 + 3) / 3 = 1.5
      expect(scores.Communication).toBeCloseTo(1.5, 1)
    })

    test('should handle missing skills gracefully', () => {
      const limitedResponses: CLP2Response[] = [
        { questionId: 1, response: 4, ageGroup: '3-4', skill: 'Communication' }
      ]
      
      const scores = calculateCLP2Scores(limitedResponses)
      
      expect(scores.Communication).toBeGreaterThan(0)
      expect(scores.Collaboration).toBe(0) // No responses for this skill
    })
  })

  describe('Extended Age Group Testing', () => {
    test('should handle extended questions for older children', () => {
      const extendedResponses: CLP2Response[] = [
        // Extended Communication questions
        { questionId: 29, response: 4, ageGroup: '6-8', skill: 'Communication' },
        { questionId: 30, response: 3, ageGroup: '6-8', skill: 'Communication' },
        { questionId: 31, response: 4, ageGroup: '8-10', skill: 'Communication' },
        
        // Extended Math questions
        { questionId: 50, response: 3, ageGroup: '6-8', skill: 'Math' },
        { questionId: 51, response: 4, ageGroup: '8-10', skill: 'Math' },
        { questionId: 52, response: 4, ageGroup: '8-10', skill: 'Math' }
      ]
      
      const scores = calculateCLP2Scores(extendedResponses)
      
      expect(scores.Communication).toBeGreaterThan(0)
      expect(scores.Math).toBeGreaterThan(0)
      expect(scores.Communication).toBeLessThanOrEqual(3)
      expect(scores.Math).toBeLessThanOrEqual(3)
    })

    test('should properly weight different age groups', () => {
      const mixedAgeResponses: CLP2Response[] = [
        { questionId: 1, response: 5, ageGroup: '3-4', skill: 'Communication' },
        { questionId: 29, response: 3, ageGroup: '6-8', skill: 'Communication' },
        { questionId: 31, response: 4, ageGroup: '8-10', skill: 'Communication' }
      ]
      
      const scores = calculateCLP2Scores(mixedAgeResponses)
      
      // Should handle mixed age groups properly
      expect(scores.Communication).toBeGreaterThan(0)
      expect(scores.Communication).toBeLessThanOrEqual(3)
    })
  })

  describe('Confidence Scoring', () => {
    test('should calculate confidence scores based on response consistency', () => {
      const consistentResponses: CLP2Response[] = [
        { questionId: 1, response: 4, ageGroup: '3-4', skill: 'Communication' },
        { questionId: 2, response: 4, ageGroup: '3-4', skill: 'Communication' },
        { questionId: 3, response: 4, ageGroup: '3-4', skill: 'Communication' }
      ]
      
      const confidence = calculateConfidenceScore(consistentResponses, 'Communication')
      
      expect(confidence).toBeGreaterThan(0.8) // High confidence for consistent responses
    })

    test('should return lower confidence for inconsistent responses', () => {
      const inconsistentResponses: CLP2Response[] = [
        { questionId: 1, response: 1, ageGroup: '3-4', skill: 'Communication' },
        { questionId: 2, response: 5, ageGroup: '3-4', skill: 'Communication' },
        { questionId: 3, response: 2, ageGroup: '3-4', skill: 'Communication' }
      ]
      
      const confidence = calculateConfidenceScore(inconsistentResponses, 'Communication')
      
      expect(confidence).toBeLessThan(0.6) // Lower confidence for inconsistent responses
    })

    test('should handle single response appropriately', () => {
      const singleResponse: CLP2Response[] = [
        { questionId: 1, response: 4, ageGroup: '3-4', skill: 'Communication' }
      ]
      
      const confidence = calculateConfidenceScore(singleResponse, 'Communication')
      
      expect(confidence).toBeLessThan(0.8) // Lower confidence for single response
      expect(confidence).toBeGreaterThan(0) // But not zero
    })
  })

  describe('Multi-Quiz Consolidation', () => {
    test('should consolidate parent and teacher profiles correctly', () => {
      const parentProfile: CLP2Profile = {
        id: 'parent-1',
        childName: 'Test Child',
        ageInMonths: 60,
        scores: {
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
        },
        confidence: {
          Communication: 0.85,
          Collaboration: 0.78,
          Content: 0.72,
          'Critical Thinking': 0.80,
          'Creative Innovation': 0.88,
          Confidence: 0.82,
          Literacy: 0.75,
          Math: 0.70
        },
        context: 'parent_home',
        version: '2.0',
        createdAt: new Date().toISOString(),
        responses: sampleResponses.slice(0, 15)
      }

      const teacherProfile: CLP2Profile = {
        id: 'teacher-1',
        childName: 'Test Child',
        ageInMonths: 60,
        scores: {
          Communication: 2.2,
          Collaboration: 2.4,
          Content: 2.0,
          'Critical Thinking': 2.5,
          'Creative Innovation': 2.1,
          Confidence: 2.0,
          Literacy: 2.3,
          Math: 2.1,
          Engagement: '',
          Modality: '',
          Social: '',
          Interests: []
        },
        confidence: {
          Communication: 0.90,
          Collaboration: 0.85,
          Content: 0.88,
          'Critical Thinking': 0.82,
          'Creative Innovation': 0.75,
          Confidence: 0.78,
          Literacy: 0.89,
          Math: 0.86
        },
        context: 'teacher_classroom',
        version: '2.0',
        createdAt: new Date().toISOString(),
        responses: sampleResponses.slice(15, 25)
      }

      const consolidated = consolidateMultipleProfiles([parentProfile, teacherProfile])

      // Should have higher confidence due to multiple perspectives
      expect(consolidated.confidence.Communication).toBeGreaterThan(0.85)
      
      // Should blend scores appropriately
      expect(consolidated.scores.Communication).toBeGreaterThan(2.0)
      expect(consolidated.scores.Communication).toBeLessThan(2.8)
      
      // Should preserve preferences from parent profile
      expect(consolidated.scores.Engagement).toBe('hands-on')
      expect(consolidated.scores.Interests).toContain('animals')
    })

    test('should handle profiles with significant score differences', () => {
      const parentProfile: CLP2Profile = {
        id: 'parent-conflict',
        childName: 'Test Child',
        ageInMonths: 84,
        scores: {
          Communication: 3.0, // High score
          Collaboration: 1.0, // Low score
          Content: 2.0,
          'Critical Thinking': 2.5,
          'Creative Innovation': 2.8,
          Confidence: 2.2,
          Literacy: 2.0,
          Math: 1.8,
          Engagement: 'visual',
          Modality: 'quiet',
          Social: 'independent',
          Interests: ['science']
        },
        confidence: {
          Communication: 0.95,
          Collaboration: 0.80,
          Content: 0.75,
          'Critical Thinking': 0.85,
          'Creative Innovation': 0.90,
          Confidence: 0.82,
          Literacy: 0.78,
          Math: 0.72
        },
        context: 'parent_home',
        version: '2.0',
        createdAt: new Date().toISOString(),
        responses: []
      }

      const teacherProfile: CLP2Profile = {
        id: 'teacher-conflict',
        childName: 'Test Child',
        ageInMonths: 84,
        scores: {
          Communication: 1.5, // Low score (conflicts with parent)
          Collaboration: 2.8, // High score (conflicts with parent)
          Content: 2.2,
          'Critical Thinking': 2.0,
          'Creative Innovation': 1.8,
          Confidence: 2.5,
          Literacy: 2.4,
          Math: 2.6,
          Engagement: '',
          Modality: '',
          Social: '',
          Interests: []
        },
        confidence: {
          Communication: 0.88,
          Collaboration: 0.92,
          Content: 0.85,
          'Critical Thinking': 0.80,
          'Creative Innovation': 0.75,
          Confidence: 0.88,
          Literacy: 0.90,
          Math: 0.85
        },
        context: 'teacher_classroom',
        version: '2.0',
        createdAt: new Date().toISOString(),
        responses: []
      }

      const consolidated = consolidateMultipleProfiles([parentProfile, teacherProfile])

      // Should find middle ground for conflicting scores
      expect(consolidated.scores.Communication).toBeGreaterThan(1.5)
      expect(consolidated.scores.Communication).toBeLessThan(3.0)
      
      expect(consolidated.scores.Collaboration).toBeGreaterThan(1.0)
      expect(consolidated.scores.Collaboration).toBeLessThan(2.8)
      
      // Should flag potential conflicts
      expect(consolidated.confidence.Communication).toBeLessThan(0.9) // Reduced due to conflict
      expect(consolidated.confidence.Collaboration).toBeLessThan(0.9) // Reduced due to conflict
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty responses gracefully', () => {
      const emptyResponses: CLP2Response[] = []
      
      const scores = calculateCLP2Scores(emptyResponses)
      
      // Should return zero scores for all skills
      Object.values(scores).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBe(0)
        } else if (Array.isArray(score)) {
          expect(score).toHaveLength(0)
        } else {
          expect(score).toBe('')
        }
      })
    })

    test('should handle invalid question IDs', () => {
      const invalidResponses: CLP2Response[] = [
        { questionId: 999, response: 4, ageGroup: '3-4', skill: 'Communication' },
        { questionId: -1, response: 3, ageGroup: '3-4', skill: 'Literacy' }
      ]
      
      expect(() => calculateCLP2Scores(invalidResponses)).not.toThrow()
    })

    test('should handle out-of-range responses', () => {
      const outOfRangeResponses: CLP2Response[] = [
        { questionId: 1, response: 10, ageGroup: '3-4', skill: 'Communication' }, // Too high
        { questionId: 2, response: 0, ageGroup: '3-4', skill: 'Communication' },  // Too low
        { questionId: 3, response: -5, ageGroup: '3-4', skill: 'Communication' }  // Negative
      ]
      
      const scores = calculateCLP2Scores(outOfRangeResponses)
      
      // Should clamp to valid range
      expect(scores.Communication).toBeGreaterThanOrEqual(0)
      expect(scores.Communication).toBeLessThanOrEqual(3)
    })

    test('should handle mixed response types correctly', () => {
      const mixedResponses: CLP2Response[] = [
        { questionId: 1, response: 4, ageGroup: '3-4', skill: 'Communication' },
        { questionId: 25, response: 'hands-on', ageGroup: '3-4', skill: 'Engagement' },
        { questionId: 28, response: ['animals', 'art'], ageGroup: '3-4', skill: 'Interests' }
      ]
      
      expect(() => calculateCLP2Scores(mixedResponses)).not.toThrow()
      
      const scores = calculateCLP2Scores(mixedResponses)
      expect(scores.Communication).toBeGreaterThan(0)
      expect(scores.Engagement).toBe('hands-on')
      expect(scores.Interests).toContain('animals')
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle large response sets efficiently', () => {
      const largeResponseSet: CLP2Response[] = []
      
      // Generate 1000 responses
      for (let i = 0; i < 1000; i++) {
        largeResponseSet.push({
          questionId: (i % 24) + 1,
          response: Math.floor(Math.random() * 5) + 1,
          ageGroup: '5-6',
          skill: ['Communication', 'Collaboration', 'Content', 'Critical Thinking', 
                 'Creative Innovation', 'Confidence', 'Literacy', 'Math'][i % 8]
        })
      }
      
      const startTime = performance.now()
      const scores = calculateCLP2Scores(largeResponseSet)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
      expect(scores.Communication).toBeGreaterThanOrEqual(0)
    })

    test('should handle multiple profile consolidation efficiently', () => {
      const profiles: CLP2Profile[] = []
      
      // Generate 10 profiles to consolidate
      for (let i = 0; i < 10; i++) {
        profiles.push({
          id: `profile-${i}`,
          childName: 'Test Child',
          ageInMonths: 60,
          scores: {
            Communication: Math.random() * 3,
            Collaboration: Math.random() * 3,
            Content: Math.random() * 3,
            'Critical Thinking': Math.random() * 3,
            'Creative Innovation': Math.random() * 3,
            Confidence: Math.random() * 3,
            Literacy: Math.random() * 3,
            Math: Math.random() * 3,
            Engagement: 'hands-on',
            Modality: 'creative',
            Social: 'small-group',
            Interests: ['animals']
          },
          confidence: {
            Communication: 0.8,
            Collaboration: 0.8,
            Content: 0.8,
            'Critical Thinking': 0.8,
            'Creative Innovation': 0.8,
            Confidence: 0.8,
            Literacy: 0.8,
            Math: 0.8
          },
          context: i % 2 === 0 ? 'parent_home' : 'teacher_classroom',
          version: '2.0',
          createdAt: new Date().toISOString(),
          responses: []
        })
      }
      
      const startTime = performance.now()
      const consolidated = consolidateMultipleProfiles(profiles)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // Should complete in under 50ms
      expect(consolidated.confidence.Communication).toBeGreaterThan(0.8) // Should have high confidence with many profiles
    })
  })
})