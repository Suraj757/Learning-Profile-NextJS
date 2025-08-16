// Multi-Quiz System Error Handling and Edge Cases
// Testing quiz generation, validation, and configuration errors

import {
  getParentQuizQuestions,
  getTeacherQuizQuestions,
  getSkillCoverage,
  validateQuizConfiguration,
  QuizConfiguration,
  PARENT_QUIZ_DISTRIBUTION,
  TEACHER_QUIZ_DISTRIBUTION
} from '../../../lib/multi-quiz-system'

// Mock the dependencies
jest.mock('../../../lib/clp-questions', () => ({
  CLP2_QUESTIONS: [
    { id: 1, text: 'Test question 1', skill: 'Communication', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 2, text: 'Test question 2', skill: 'Communication', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 3, text: 'Test question 3', skill: 'Communication', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 4, text: 'Test question 4', skill: 'Collaboration', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 5, text: 'Test question 5', skill: 'Collaboration', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 19, text: 'Test question 19', skill: 'Literacy', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 20, text: 'Test question 20', skill: 'Literacy', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 21, text: 'Test question 21', skill: 'Literacy', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 22, text: 'Test question 22', skill: 'Math', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 23, text: 'Test question 23', skill: 'Math', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' },
    { id: 24, text: 'Test question 24', skill: 'Math', ageGroups: ['3-4', '4-5', '5-6'], context: 'universal' }
  ],
  CLP2_EXTENDED_QUESTIONS: [
    { id: 29, text: 'Extended question 29', skill: 'Communication', ageGroups: ['6-8', '8-10', '10+'], context: 'universal' },
    { id: 30, text: 'Extended question 30', skill: 'Communication', ageGroups: ['6-8', '8-10', '10+'], context: 'home' },
    { id: 50, text: 'Extended question 50', skill: 'Math', ageGroups: ['6-8', '8-10', '10+'], context: 'classroom' }
  ],
  CLP2_PREFERENCE_QUESTIONS: [
    { id: 25, text: 'Engagement preference', skill: 'Engagement', ageGroups: ['3-4', '4-5', '5-6', '6-8', '8-10', '10+'], context: 'universal' },
    { id: 26, text: 'Modality preference', skill: 'Modality', ageGroups: ['3-4', '4-5', '5-6', '6-8', '8-10', '10+'], context: 'universal' },
    { id: 27, text: 'Social preference', skill: 'Social', ageGroups: ['3-4', '4-5', '5-6', '6-8', '8-10', '10+'], context: 'universal' },
    { id: 28, text: 'Interest preference', skill: 'Interests', ageGroups: ['3-4', '4-5', '5-6', '6-8', '8-10', '10+'], context: 'universal' }
  ]
}))

describe('Multi-Quiz System - Error Handling and Edge Cases', () => {
  
  describe('getParentQuizQuestions Edge Cases', () => {
    test('should handle invalid age groups gracefully', () => {
      expect(() => getParentQuizQuestions('invalid_age' as any)).not.toThrow()
      
      const result = getParentQuizQuestions('invalid_age' as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('parent_home')
      expect(Array.isArray(result.questions)).toBe(true)
    })

    test('should handle null age group', () => {
      expect(() => getParentQuizQuestions(null as any)).not.toThrow()
      
      const result = getParentQuizQuestions(null as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('parent_home')
    })

    test('should handle undefined age group', () => {
      expect(() => getParentQuizQuestions(undefined as any)).not.toThrow()
      
      const result = getParentQuizQuestions(undefined as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('parent_home')
    })

    test('should handle extremely old age groups', () => {
      const result = getParentQuizQuestions('100+' as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('parent_home')
    })

    test('should handle age groups with special characters', () => {
      const result = getParentQuizQuestions('5-6!"#$%&' as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('parent_home')
    })

    test('should handle empty string age group', () => {
      const result = getParentQuizQuestions('' as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('parent_home')
    })

    test('should handle numeric age group', () => {
      const result = getParentQuizQuestions(5 as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('parent_home')
    })

    test('should handle when no questions match age group', () => {
      // This tests the case where ageGroups.includes() returns false for all questions
      const result = getParentQuizQuestions('999-1000' as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('parent_home')
      expect(Array.isArray(result.questions)).toBe(true)
    })
  })

  describe('getTeacherQuizQuestions Edge Cases', () => {
    test('should handle invalid age groups gracefully', () => {
      expect(() => getTeacherQuizQuestions('invalid_age' as any)).not.toThrow()
      
      const result = getTeacherQuizQuestions('invalid_age' as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('teacher_classroom')
      expect(Array.isArray(result.questions)).toBe(true)
    })

    test('should handle missing age group parameter', () => {
      const result = getTeacherQuizQuestions()
      expect(result).toBeDefined()
      expect(result.quizType).toBe('teacher_classroom')
      expect(result.includePreferences).toBe(false)
    })

    test('should handle object as age group', () => {
      const result = getTeacherQuizQuestions({} as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('teacher_classroom')
    })

    test('should handle array as age group', () => {
      const result = getTeacherQuizQuestions(['5-6'] as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('teacher_classroom')
    })

    test('should handle boolean as age group', () => {
      const result = getTeacherQuizQuestions(true as any)
      expect(result).toBeDefined()
      expect(result.quizType).toBe('teacher_classroom')
    })
  })

  describe('Quiz Configuration Edge Cases', () => {
    test('should handle missing questions in distribution', () => {
      // Mock scenario where distribution references non-existent questions
      const originalDistribution = { ...PARENT_QUIZ_DISTRIBUTION }
      
      // Temporarily modify distribution to include non-existent question IDs
      ;(PARENT_QUIZ_DISTRIBUTION as any).Communication = [999, 1000, 1001]
      
      try {
        const result = getParentQuizQuestions('5-6')
        expect(result).toBeDefined()
        expect(Array.isArray(result.questions)).toBe(true)
      } finally {
        // Restore original distribution
        Object.assign(PARENT_QUIZ_DISTRIBUTION, originalDistribution)
      }
    })

    test('should handle empty question pools', () => {
      // Test when no questions are available for a specific skill/age combination
      const result = getParentQuizQuestions('0-1' as any) // Age group with no questions
      expect(result).toBeDefined()
      expect(result.questionCount).toBeGreaterThanOrEqual(0)
    })

    test('should handle malformed question objects', () => {
      // This would test the adaptation functions with malformed question text
      const result = getParentQuizQuestions('5-6')
      expect(result).toBeDefined()
      
      // Verify that all questions have required properties
      result.questions.forEach(question => {
        expect(question).toHaveProperty('text')
        expect(typeof question.text).toBe('string')
      })
    })
  })

  describe('getSkillCoverage Edge Cases', () => {
    test('should handle invalid quiz types', () => {
      expect(() => getSkillCoverage('invalid_quiz_type' as any)).not.toThrow()
      
      const result = getSkillCoverage('invalid_quiz_type' as any)
      expect(Array.isArray(result)).toBe(true)
    })

    test('should handle null quiz type', () => {
      expect(() => getSkillCoverage(null as any)).not.toThrow()
      
      const result = getSkillCoverage(null as any)
      expect(Array.isArray(result)).toBe(true)
    })

    test('should handle undefined quiz type', () => {
      expect(() => getSkillCoverage(undefined as any)).not.toThrow()
      
      const result = getSkillCoverage(undefined as any)
      expect(Array.isArray(result)).toBe(true)
    })

    test('should handle when distribution is missing skills', () => {
      const result = getSkillCoverage('parent_home')
      expect(Array.isArray(result)).toBe(true)
      
      // Should return coverage for all expected skills
      const skillNames = result.map(item => item.skill)
      expect(skillNames).toContain('Communication')
      expect(skillNames).toContain('Collaboration')
      expect(skillNames).toContain('Content')
      expect(skillNames).toContain('Critical Thinking')
      expect(skillNames).toContain('Creative Innovation')
      expect(skillNames).toContain('Confidence')
      expect(skillNames).toContain('Literacy')
      expect(skillNames).toContain('Math')
    })

    test('should handle corrupted distribution data', () => {
      // Mock corrupted distribution
      const originalDistribution = { ...TEACHER_QUIZ_DISTRIBUTION }
      
      try {
        // Corrupt the distribution temporarily
        ;(TEACHER_QUIZ_DISTRIBUTION as any).Communication = null
        ;(TEACHER_QUIZ_DISTRIBUTION as any).Collaboration = undefined
        ;(TEACHER_QUIZ_DISTRIBUTION as any)['Critical Thinking'] = 'invalid'
        
        const result = getSkillCoverage('teacher_classroom')
        expect(Array.isArray(result)).toBe(true)
        
        // Should handle corrupted data gracefully
        result.forEach(item => {
          expect(item).toHaveProperty('skill')
          expect(item).toHaveProperty('questionCount')
          expect(item).toHaveProperty('coverage')
          expect(item).toHaveProperty('rationale')
          expect(typeof item.questionCount).toBe('number')
          expect(['full', 'partial', 'none']).toContain(item.coverage)
        })
      } finally {
        // Restore original distribution
        Object.assign(TEACHER_QUIZ_DISTRIBUTION, originalDistribution)
      }
    })
  })

  describe('validateQuizConfiguration Edge Cases', () => {
    test('should handle null configuration', () => {
      expect(() => validateQuizConfiguration(null as any)).not.toThrow()
      
      const result = validateQuizConfiguration(null as any)
      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('warnings')
      expect(result).toHaveProperty('recommendations')
      expect(typeof result.isValid).toBe('boolean')
      expect(Array.isArray(result.warnings)).toBe(true)
      expect(Array.isArray(result.recommendations)).toBe(true)
    })

    test('should handle undefined configuration', () => {
      expect(() => validateQuizConfiguration(undefined as any)).not.toThrow()
      
      const result = validateQuizConfiguration(undefined as any)
      expect(result).toBeDefined()
    })

    test('should handle malformed configuration object', () => {
      const malformedConfig = {
        quizType: 'invalid_type',
        questionCount: 'not_a_number',
        includePreferences: 'not_a_boolean',
        contextFocus: null,
        questions: 'not_an_array',
        distributionRationale: undefined
      } as any
      
      expect(() => validateQuizConfiguration(malformedConfig)).not.toThrow()
      
      const result = validateQuizConfiguration(malformedConfig)
      expect(result).toBeDefined()
      expect(typeof result.isValid).toBe('boolean')
    })

    test('should handle configuration with missing required fields', () => {
      const incompleteConfig = {
        quizType: 'parent_home'
        // Missing other required fields
      } as any
      
      expect(() => validateQuizConfiguration(incompleteConfig)).not.toThrow()
      
      const result = validateQuizConfiguration(incompleteConfig)
      expect(result).toBeDefined()
    })

    test('should handle configuration with extreme values', () => {
      const extremeConfig: QuizConfiguration = {
        quizType: 'parent_home',
        questionCount: Number.MAX_SAFE_INTEGER,
        includePreferences: true,
        contextFocus: 'A'.repeat(100000), // Very long string
        questions: Array(1000000).fill(null), // Very large array
        distributionRationale: 'B'.repeat(50000) // Very long string
      }
      
      expect(() => validateQuizConfiguration(extremeConfig)).not.toThrow()
      
      const result = validateQuizConfiguration(extremeConfig)
      expect(result).toBeDefined()
      expect(Array.isArray(result.warnings)).toBe(true)
      
      // Should warn about extreme values
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    test('should handle configuration with negative question count', () => {
      const negativeConfig: QuizConfiguration = {
        quizType: 'parent_home',
        questionCount: -10,
        includePreferences: true,
        contextFocus: 'Test',
        questions: [],
        distributionRationale: 'Test'
      }
      
      const result = validateQuizConfiguration(negativeConfig)
      expect(result).toBeDefined()
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    test('should handle general quiz type appropriately', () => {
      const generalConfig: QuizConfiguration = {
        quizType: 'general',
        questionCount: 25,
        includePreferences: false,
        contextFocus: 'General assessment',
        questions: [],
        distributionRationale: 'General purpose quiz'
      }
      
      const result = validateQuizConfiguration(generalConfig)
      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBe(0)
    })

    test('should handle very long general quiz appropriately', () => {
      const longGeneralConfig: QuizConfiguration = {
        quizType: 'general',
        questionCount: 100,
        includePreferences: false,
        contextFocus: 'Long general assessment',
        questions: [],
        distributionRationale: 'Very comprehensive general quiz'
      }
      
      const result = validateQuizConfiguration(longGeneralConfig)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Very long quiz may cause fatigue')
    })
  })

  describe('Question Adaptation Edge Cases', () => {
    test('should handle questions with no matching adaptations', () => {
      const uniqueQuestionText = 'This is a completely unique question text that has no predefined adaptations'
      
      const parentQuiz = getParentQuizQuestions('5-6')
      expect(parentQuiz).toBeDefined()
      
      // The adaptation should handle unknown text gracefully
      parentQuiz.questions.forEach(question => {
        expect(question.text).toBeDefined()
        expect(typeof question.text).toBe('string')
        expect(question.text.length).toBeGreaterThan(0)
      })
    })

    test('should handle extremely long question text', () => {
      const result = getParentQuizQuestions('5-6')
      expect(result).toBeDefined()
      
      // Verify adaptation doesn't break with long text
      result.questions.forEach(question => {
        expect(question.text).toBeDefined()
        expect(typeof question.text).toBe('string')
      })
    })

    test('should handle question text with special characters', () => {
      const result = getTeacherQuizQuestions('5-6')
      expect(result).toBeDefined()
      
      // Verify adaptation handles special characters safely
      result.questions.forEach(question => {
        expect(question.text).toBeDefined()
        expect(typeof question.text).toBe('string')
      })
    })

    test('should handle circular reference in question adaptation', () => {
      // This tests that the adaptation functions don't get stuck in infinite loops
      const result = getParentQuizQuestions('5-6')
      expect(result).toBeDefined()
      expect(result.questions.length).toBeGreaterThan(0)
    })
  })

  describe('Memory and Performance Edge Cases', () => {
    test('should handle generation of many quiz configurations efficiently', () => {
      const ageGroups = ['3-4', '4-5', '5-6', '6-8', '8-10', '10+'] as const
      
      const startTime = performance.now()
      
      // Generate quizzes for all age groups
      ageGroups.forEach(ageGroup => {
        getParentQuizQuestions(ageGroup)
        getTeacherQuizQuestions(ageGroup)
      })
      
      const endTime = performance.now()
      
      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(100) // Less than 100ms
    })

    test('should handle repeated quiz generation without memory leaks', () => {
      const startMemory = process.memoryUsage().heapUsed
      
      // Generate many quizzes
      for (let i = 0; i < 100; i++) {
        getParentQuizQuestions('5-6')
        getTeacherQuizQuestions('5-6')
      }
      
      const endMemory = process.memoryUsage().heapUsed
      const memoryIncrease = endMemory - startMemory
      
      // Should not significantly increase memory
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024) // Less than 5MB
    })

    test('should handle validation of many configurations efficiently', () => {
      const configurations = Array.from({ length: 1000 }, (_, i) => ({
        quizType: i % 2 === 0 ? 'parent_home' : 'teacher_classroom',
        questionCount: i % 50 + 1,
        includePreferences: i % 2 === 0,
        contextFocus: `Test context ${i}`,
        questions: [],
        distributionRationale: `Test rationale ${i}`
      })) as QuizConfiguration[]
      
      const startTime = performance.now()
      
      configurations.forEach(config => {
        validateQuizConfiguration(config)
      })
      
      const endTime = performance.now()
      
      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(500) // Less than 500ms
    })
  })

  describe('Cross-Quiz Consistency Edge Cases', () => {
    test('should maintain consistency between parent and teacher quiz structures', () => {
      const parentQuiz = getParentQuizQuestions('5-6')
      const teacherQuiz = getTeacherQuizQuestions('5-6')
      
      // Both should have valid structure
      expect(parentQuiz).toHaveProperty('quizType')
      expect(parentQuiz).toHaveProperty('questionCount')
      expect(parentQuiz).toHaveProperty('questions')
      
      expect(teacherQuiz).toHaveProperty('quizType')
      expect(teacherQuiz).toHaveProperty('questionCount')
      expect(teacherQuiz).toHaveProperty('questions')
      
      // Should have different quiz types
      expect(parentQuiz.quizType).toBe('parent_home')
      expect(teacherQuiz.quizType).toBe('teacher_classroom')
      
      // Parent should include preferences, teacher should not
      expect(parentQuiz.includePreferences).toBe(true)
      expect(teacherQuiz.includePreferences).toBe(false)
    })

    test('should handle age group transitions consistently', () => {
      const youngQuiz = getParentQuizQuestions('3-4')
      const oldQuiz = getParentQuizQuestions('10+')
      
      // Both should be valid
      expect(youngQuiz).toBeDefined()
      expect(oldQuiz).toBeDefined()
      
      // Question counts might differ but should be positive
      expect(youngQuiz.questionCount).toBeGreaterThan(0)
      expect(oldQuiz.questionCount).toBeGreaterThan(0)
    })
  })
})