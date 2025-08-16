// CLP 2.0 Complete Workflow Integration Tests
// End-to-end testing of quiz workflows from question selection to final results

import {
  getParentQuizQuestions,
  getTeacherQuizQuestions,
  validateQuizConfiguration
} from '../../lib/multi-quiz-system'

import {
  calculateCLP2Scores,
  consolidateCLP2Scores,
  getCLP2PersonalityLabel,
  getCLP2StrengthsAndGrowth
} from '../../lib/clp-scoring'

import {
  getCLP2Questions,
  getCLP2QuestionsForAge,
  validateCLP2Response
} from '../../lib/clp-questions'

import { CLP2_TEST_DATA } from '../lib/test-data/clp2-test-data'

describe('CLP 2.0 Complete Workflow Integration', () => {

  describe('Single Quiz Workflows', () => {
    it('should complete parent quiz workflow for preschooler', async () => {
      const ageGroup = '3-4'
      const scenario = CLP2_TEST_DATA.scenarios.preschool[0] // "Highly Communicative Preschooler"

      // Step 1: Generate quiz configuration
      const config = getParentQuizQuestions(ageGroup)
      expect(config.quizType).toBe('parent_home')
      expect(config.includePreferences).toBe(true)

      // Step 2: Validate configuration
      const validation = validateQuizConfiguration(config)
      expect(validation.isValid).toBe(true)

      // Step 3: Simulate question responses
      const responses = scenario.responses

      // Step 4: Validate all responses
      Object.entries(responses).forEach(([questionIdStr, response]) => {
        const questionId = parseInt(questionIdStr)
        const isValid = validateCLP2Response(questionId, response)
        expect(isValid).toBe(true)
      })

      // Step 5: Calculate scores
      const scores = calculateCLP2Scores(responses, config.quizType, ageGroup)

      // Step 6: Verify score ranges
      Object.values(scores).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBeGreaterThanOrEqual(1.0)
          expect(score).toBeLessThanOrEqual(5.0)
        }
      })

      // Step 7: Generate personality label
      const personality = getCLP2PersonalityLabel(scores)
      expect(personality).toBeTruthy()
      expect(typeof personality).toBe('string')

      // Step 8: Generate strengths and growth areas
      const analysis = getCLP2StrengthsAndGrowth(scores)
      expect(analysis.strengths).toBeInstanceOf(Array)
      expect(analysis.growthAreas).toBeInstanceOf(Array)

      // Step 9: Verify workflow consistency
      expect(scores.Communication).toBeCloseTo(scenario.expectedScores.Communication, 0.5)
      expect(personality).toBe(scenario.expectedPersonality)
    })

    it('should complete teacher quiz workflow for elementary student', async () => {
      const ageGroup = '8-10'
      const scenario = CLP2_TEST_DATA.scenarios.elementary[0] // "Advanced Critical Thinker"

      // Complete workflow
      const config = getTeacherQuizQuestions(ageGroup)
      const validation = validateQuizConfiguration(config)
      expect(validation.isValid || validation.warnings.length < 3).toBe(true) // Allow some warnings for teacher quiz

      const responses = scenario.responses
      const scores = calculateCLP2Scores(responses, config.quizType, ageGroup)
      const personality = getCLP2PersonalityLabel(scores)
      const analysis = getCLP2StrengthsAndGrowth(scores)

      // Verify results make sense for classroom context
      expect(scores['Critical Thinking']).toBeGreaterThan(4.0) // Should be strong
      expect(personality).toBe(scenario.expectedPersonality)
      expect(analysis.strengths).toContain('Critical Thinking')
    })

    it('should handle age-based question filtering correctly', async () => {
      const testAges = [36, 60, 84, 120] // 3, 5, 7, 10 years in months

      for (const ageInMonths of testAges) {
        // Step 1: Get age-appropriate questions
        const questions = getCLP2QuestionsForAge(ageInMonths)
        expect(questions.length).toBeGreaterThan(0)

        // Step 2: Simulate realistic responses
        const responses: Record<number, number | string | string[]> = {}
        questions.forEach(question => {
          if (question.responseType === 'likert') {
            responses[question.id] = Math.floor(Math.random() * 5) + 1
          } else if (question.responseType === 'multipleChoice' && question.options) {
            const randomOption = question.options[Math.floor(Math.random() * question.options.length)]
            responses[question.id] = randomOption.value
          } else if (question.responseType === 'multiSelect' && question.options) {
            const selectedOptions = question.options
              .filter(() => Math.random() > 0.5)
              .slice(0, 3)
              .map(opt => opt.value)
            responses[question.id] = selectedOptions.length > 0 ? selectedOptions : [question.options[0].value]
          }
        })

        // Step 3: Calculate scores and verify validity
        const ageGroup = ageInMonths < 66 ? '4-5' : ageInMonths < 84 ? '5-6' : ageInMonths < 108 ? '6-8' : '8-10'
        const scores = calculateCLP2Scores(responses, 'general', ageGroup)
        
        Object.entries(scores).forEach(([skill, score]) => {
          if (typeof score === 'number') {
            expect(score).toBeGreaterThanOrEqual(1.0)
            expect(score).toBeLessThanOrEqual(5.0)
          }
        })
      }
    })
  })

  describe('Multi-Quiz Consolidation Workflows', () => {
    it('should complete parent-teacher consolidation workflow', async () => {
      const studentAge = '6-8'
      
      // Step 1: Generate both quiz configurations
      const parentConfig = getParentQuizQuestions(studentAge)
      const teacherConfig = getTeacherQuizQuestions(studentAge)

      // Step 2: Simulate parent responses (home context)
      const parentResponses = {
        1: 5, 2: 4, 3: 5, // Communication
        4: 3, // Collaboration
        7: 4, // Content
        11: 5, // Critical Thinking
        13: 5, 14: 4, // Creative Innovation
        16: 4, 17: 5, // Confidence
        19: 4, 20: 4, 21: 5, // Literacy
        22: 3, 23: 4, 24: 3, // Math
        25: "hands-on", 26: "creative", 27: "independent", 28: ["art", "science"]
      }

      // Step 3: Simulate teacher responses (classroom context)
      const teacherResponses = {
        1: 4, 3: 4, // Communication
        4: 4, 5: 4, // Collaboration
        8: 5, 9: 4, // Content
        10: 5, 12: 4, // Critical Thinking
        19: 4, 21: 4, // Literacy
        22: 3, 24: 3 // Math
      }

      // Step 4: Calculate individual scores
      const parentScores = calculateCLP2Scores(parentResponses, 'parent_home', studentAge)
      const teacherScores = calculateCLP2Scores(teacherResponses, 'teacher_classroom', studentAge)

      // Step 5: Consolidate scores with appropriate weights
      const consolidationSources = [
        {
          scores: parentScores,
          weight: 0.6, // Parent weight
          quizType: 'parent_home',
          respondentType: 'parent'
        },
        {
          scores: teacherScores,
          weight: 0.4, // Teacher weight
          quizType: 'teacher_classroom',
          respondentType: 'teacher'
        }
      ]

      const consolidatedScores = consolidateCLP2Scores(consolidationSources)

      // Step 6: Generate final analysis
      const finalPersonality = getCLP2PersonalityLabel(consolidatedScores)
      const finalAnalysis = getCLP2StrengthsAndGrowth(consolidatedScores)

      // Step 7: Verify consolidation makes sense
      expect(consolidatedScores.Communication).toBeGreaterThan(3.0) // Should be strong
      expect(consolidatedScores['Creative Innovation']).toBeGreaterThan(2.5) // Parent perspective should influence
      expect(finalPersonality).toBeTruthy()
      expect(finalAnalysis.strengths.length).toBeGreaterThan(0)

      // Step 8: Verify consolidation weighted averages
      const expectedCommunication = (parentScores.Communication * 0.6) + (teacherScores.Communication * 0.4)
      expect(consolidatedScores.Communication).toBeCloseTo(expectedCommunication, 1)
    })

    it('should handle multiple respondent scenarios', async () => {
      const sources = [
        // Primary parent
        {
          scores: {
            Communication: 4.5, Collaboration: 3.8, Content: 4.0, 'Critical Thinking': 3.5,
            'Creative Innovation': 4.2, Confidence: 4.0, Literacy: 4.3, Math: 3.2
          },
          weight: 0.4,
          quizType: 'parent_home',
          respondentType: 'parent1'
        },
        // Secondary parent
        {
          scores: {
            Communication: 4.0, Collaboration: 4.2, Content: 3.8, 'Critical Thinking': 3.8,
            'Creative Innovation': 3.9, Confidence: 3.7, Literacy: 4.0, Math: 3.5
          },
          weight: 0.3,
          quizType: 'parent_home',
          respondentType: 'parent2'
        },
        // Teacher
        {
          scores: {
            Communication: 3.8, Collaboration: 4.5, Content: 4.2, 'Critical Thinking': 4.0,
            'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 4.1, Math: 3.8
          },
          weight: 0.3,
          quizType: 'teacher_classroom',
          respondentType: 'teacher'
        }
      ]

      const consolidated = consolidateCLP2Scores(sources)
      
      // Verify all skills have reasonable consolidated scores
      Object.entries(consolidated).forEach(([skill, score]) => {
        if (typeof score === 'number') {
          expect(score).toBeGreaterThanOrEqual(1.0)
          expect(score).toBeLessThanOrEqual(5.0)
        }
      })

      // Creative Innovation should be influenced heavily by parent responses
      expect(consolidated['Creative Innovation']).toBeGreaterThan(2.5)
      
      // Collaboration should reflect teacher's strong perspective
      expect(consolidated.Collaboration).toBeGreaterThan(4.0)
    })
  })

  describe('Edge Case Workflows', () => {
    it('should handle incomplete response workflows gracefully', async () => {
      const ageGroup = '5-6'
      const config = getParentQuizQuestions(ageGroup)

      // Simulate partial responses (only answer half the questions)
      const allQuestions = config.questions.filter(q => q.responseType === 'likert')
      const halfQuestions = allQuestions.slice(0, Math.floor(allQuestions.length / 2))
      
      const partialResponses: Record<number, number> = {}
      halfQuestions.forEach(question => {
        partialResponses[question.id] = 4 // Consistent "Agree" responses
      })

      const scores = calculateCLP2Scores(partialResponses, config.quizType, ageGroup)
      const personality = getCLP2PersonalityLabel(scores)
      const analysis = getCLP2StrengthsAndGrowth(scores)

      // Should still produce meaningful results
      expect(personality).toBeTruthy()
      expect(analysis.strengths.length + analysis.growthAreas.length).toBeGreaterThan(0)
    })

    it('should handle extreme response patterns', async () => {
      const ageGroup = '5-6'
      
      // Test all maximum responses
      const maxResponses: Record<number, number> = {}
      for (let i = 1; i <= 24; i++) {
        maxResponses[i] = 5
      }

      const maxScores = calculateCLP2Scores(maxResponses, 'general', ageGroup)
      Object.values(maxScores).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBe(5.0)
        }
      })

      // Test all minimum responses
      const minResponses: Record<number, number> = {}
      for (let i = 1; i <= 24; i++) {
        minResponses[i] = 1
      }

      const minScores = calculateCLP2Scores(minResponses, 'general', ageGroup)
      Object.values(minScores).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBe(1.0)
        }
      })
    })

    it('should maintain consistency across workflow reruns', async () => {
      const ageGroup = '6-8'
      const responses = {
        1: 4, 2: 5, 3: 3, 4: 4, 5: 3, 6: 4,
        7: 5, 8: 4, 9: 3, 10: 4, 11: 5, 12: 3,
        13: 4, 14: 5, 15: 4, 16: 3, 17: 4, 18: 5,
        19: 4, 20: 3, 21: 4, 22: 5, 23: 4, 24: 3
      }

      // Run workflow multiple times
      const results = []
      for (let i = 0; i < 5; i++) {
        const scores = calculateCLP2Scores(responses, 'general', ageGroup)
        const personality = getCLP2PersonalityLabel(scores)
        const analysis = getCLP2StrengthsAndGrowth(scores)
        
        results.push({ scores, personality, analysis })
      }

      // All runs should produce identical results
      const firstResult = results[0]
      results.slice(1).forEach(result => {
        // Scores should be identical
        Object.entries(firstResult.scores).forEach(([skill, score]) => {
          if (typeof score === 'number') {
            expect(result.scores[skill as keyof typeof result.scores]).toBe(score)
          }
        })
        
        // Personality should be identical
        expect(result.personality).toBe(firstResult.personality)
        
        // Strengths and growth areas should be identical
        expect(result.analysis.strengths.sort()).toEqual(firstResult.analysis.strengths.sort())
        expect(result.analysis.growthAreas.sort()).toEqual(firstResult.analysis.growthAreas.sort())
      })
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large-scale quiz generation efficiently', async () => {
      const startTime = Date.now()
      
      // Generate multiple quiz configurations
      const ageGroups: Array<'3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+'> = 
        ['3-4', '4-5', '5-6', '6-8', '8-10', '10+']
      
      const configs = []
      ageGroups.forEach(ageGroup => {
        configs.push(getParentQuizQuestions(ageGroup))
        configs.push(getTeacherQuizQuestions(ageGroup))
      })

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
      expect(configs.length).toBe(12) // 6 age groups × 2 quiz types
    })

    it('should handle batch scoring efficiently', async () => {
      const batchSize = 50
      const responses = {
        1: 4, 2: 5, 3: 3, 4: 4, 5: 3, 6: 4,
        7: 5, 8: 4, 9: 3, 10: 4, 11: 5, 12: 3,
        13: 4, 14: 5, 15: 4, 16: 3, 17: 4, 18: 5,
        19: 4, 20: 3, 21: 4, 22: 5, 23: 4, 24: 3
      }

      const startTime = Date.now()
      
      const batchResults = []
      for (let i = 0; i < batchSize; i++) {
        const scores = calculateCLP2Scores(responses, 'general', '5-6')
        const personality = getCLP2PersonalityLabel(scores)
        batchResults.push({ scores, personality })
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(500) // Should complete within 500ms
      expect(batchResults.length).toBe(batchSize)
    })

    it('should handle complex consolidation scenarios efficiently', async () => {
      const numberOfSources = 10
      const sources = Array.from({ length: numberOfSources }, (_, index) => ({
        scores: {
          Communication: Math.random() * 4 + 1,
          Collaboration: Math.random() * 4 + 1,
          Content: Math.random() * 4 + 1,
          'Critical Thinking': Math.random() * 4 + 1,
          'Creative Innovation': Math.random() * 4 + 1,
          Confidence: Math.random() * 4 + 1,
          Literacy: Math.random() * 4 + 1,
          Math: Math.random() * 4 + 1
        },
        weight: 1.0 / numberOfSources,
        quizType: index % 2 === 0 ? 'parent_home' : 'teacher_classroom',
        respondentType: `respondent_${index}`
      }))

      const startTime = Date.now()
      const consolidated = consolidateCLP2Scores(sources)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(50) // Should complete within 50ms
      
      // Verify consolidation quality
      Object.values(consolidated).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBeGreaterThanOrEqual(1.0)
          expect(score).toBeLessThanOrEqual(5.0)
        }
      })
    })
  })

  describe('Data Quality and Validation', () => {
    it('should maintain data integrity throughout workflow', async () => {
      const workflow = async (ageGroup: '5-6') => {
        const config = getParentQuizQuestions(ageGroup)
        const responses = {
          1: 4, 2: 5, 3: 3, 4: 4, 5: 3,
          7: 5, 8: 4, 11: 5, 13: 4, 14: 5,
          16: 3, 17: 4, 19: 4, 20: 3, 21: 4,
          22: 5, 23: 4, 24: 3,
          25: "hands-on", 26: "creative", 27: "small-group", 28: ["art", "science"]
        }

        // Validate each step
        const validation = validateQuizConfiguration(config)
        expect(validation.warnings.length).toBeLessThan(3) // Minimal warnings

        // Validate responses
        Object.entries(responses).forEach(([qId, response]) => {
          expect(validateCLP2Response(parseInt(qId), response)).toBe(true)
        })

        const scores = calculateCLP2Scores(responses, config.quizType, ageGroup)
        const personality = getCLP2PersonalityLabel(scores)
        const analysis = getCLP2StrengthsAndGrowth(scores)

        // Verify data types and ranges
        expect(typeof personality).toBe('string')
        expect(Array.isArray(analysis.strengths)).toBe(true)
        expect(Array.isArray(analysis.growthAreas)).toBe(true)

        // Verify preferences are preserved
        expect(scores.Engagement).toBe("hands-on")
        expect(scores.Modality).toBe("creative")
        expect(scores.Social).toBe("small-group")
        expect(scores.Interests).toEqual(["art", "science"])

        return { scores, personality, analysis }
      }

      const result = await workflow('5-6')
      expect(result).toBeTruthy()
    })
  })
})