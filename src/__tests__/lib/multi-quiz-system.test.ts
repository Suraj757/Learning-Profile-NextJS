// Multi-Quiz System Tests
// Comprehensive validation of Parent/Teacher quiz generation and distribution

import {
  getParentQuizQuestions,
  getTeacherQuizQuestions,
  validateQuizConfiguration,
  getSkillCoverage
} from '../../lib/multi-quiz-system'

describe('Multi-Quiz System', () => {
  describe('Parent Quiz Generation', () => {
    test('should generate appropriate questions for 3-4 age group', () => {
      const config = getParentQuizQuestions('3-4')
      
      expect(config.quizType).toBe('parent_home')
      expect(config.includePreferences).toBe(true)
      expect(config.questions.length).toBeGreaterThan(15) // Should include preferences
      expect(config.contextFocus).toContain('Home')
      
      // Should include age-appropriate questions
      const ageGroups = config.questions.flatMap(q => q.ageGroups)
      expect(ageGroups).toContain('3-4')
    })

    test('should generate extended questions for older children (6-8)', () => {
      const config = getParentQuizQuestions('6-8')
      
      expect(config.quizType).toBe('parent_home')
      expect(config.questions.length).toBeGreaterThan(20) // Should include extended questions
      
      // Should include extended questions (IDs 29+)
      const hasExtendedQuestions = config.questions.some(q => q.id >= 29)
      expect(hasExtendedQuestions).toBe(true)
      
      // Should adapt questions for home context
      const hasHomeAdaptations = config.questions.some(q => 
        q.text.includes('family') || q.text.includes('home') || q.text.includes('household')
      )
      expect(hasHomeAdaptations).toBe(true)
    })

    test('should include all preference questions for parent quiz', () => {
      const config = getParentQuizQuestions('5-6')
      
      const preferenceQuestions = config.questions.filter(q => 
        ['Engagement', 'Modality', 'Social', 'Interests'].includes(q.skill)
      )
      
      expect(preferenceQuestions.length).toBe(4) // All 4 preference questions
    })

    test('should provide comprehensive skill coverage', () => {
      const config = getParentQuizQuestions('8-10')
      
      const skills = [...new Set(config.questions.map(q => q.skill))]
      const coreSkills = ['Communication', 'Collaboration', 'Content', 'Critical Thinking', 
                         'Creative Innovation', 'Confidence', 'Literacy', 'Math']
      
      coreSkills.forEach(skill => {
        expect(skills).toContain(skill)
      })
    })
  })

  describe('Teacher Quiz Generation', () => {
    test('should generate appropriate questions for classroom context', () => {
      const config = getTeacherQuizQuestions('4-5')
      
      expect(config.quizType).toBe('teacher_classroom')
      expect(config.includePreferences).toBe(false)
      expect(config.contextFocus).toContain('Classroom')
      
      // Should adapt questions for classroom context
      const hasClassroomAdaptations = config.questions.some(q => 
        q.text.includes('student') || q.text.includes('classroom') || q.text.includes('classmates')
      )
      expect(hasClassroomAdaptations).toBe(true)
    })

    test('should be shorter than parent quiz', () => {
      const parentConfig = getParentQuizQuestions('5-6')
      const teacherConfig = getTeacherQuizQuestions('5-6')
      
      expect(teacherConfig.questions.length).toBeLessThan(parentConfig.questions.length)
    })

    test('should include more questions for older children', () => {
      const youngerConfig = getTeacherQuizQuestions('3-4')
      const olderConfig = getTeacherQuizQuestions('8-10')
      
      expect(olderConfig.questions.length).toBeGreaterThanOrEqual(youngerConfig.questions.length)
    })

    test('should prioritize academic skills for older children', () => {
      const config = getTeacherQuizQuestions('10+')
      
      const academicQuestions = config.questions.filter(q => 
        ['Content', 'Critical Thinking', 'Literacy', 'Math'].includes(q.skill)
      )
      
      expect(academicQuestions.length).toBeGreaterThan(0)
      
      // Should include extended questions for comprehensive assessment
      const extendedQuestions = config.questions.filter(q => q.id >= 29)
      expect(extendedQuestions.length).toBeGreaterThan(0)
    })
  })

  describe('Age Group Progression', () => {
    const ageGroups: Array<'3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+'> = 
      ['3-4', '4-5', '5-6', '6-8', '8-10', '10+']

    test('should handle all age groups', () => {
      ageGroups.forEach(ageGroup => {
        expect(() => getParentQuizQuestions(ageGroup)).not.toThrow()
        expect(() => getTeacherQuizQuestions(ageGroup)).not.toThrow()
      })
    })

    test('should increase complexity with age', () => {
      const configs = ageGroups.map(age => getParentQuizQuestions(age))
      
      // Older age groups should have more or equal questions
      for (let i = 1; i < configs.length; i++) {
        expect(configs[i].questions.length).toBeGreaterThanOrEqual(configs[i-1].questions.length)
      }
    })

    test('should include age-appropriate vocabulary', () => {
      const preschoolConfig = getParentQuizQuestions('3-4')
      const middleschoolConfig = getParentQuizQuestions('10+')
      
      // Preschool should use simpler language
      const preschoolText = preschoolConfig.questions.map(q => q.text).join(' ')
      expect(preschoolText).not.toContain('abstract')
      expect(preschoolText).not.toContain('analyzes')
      
      // Middle school should include more complex concepts
      const middleschoolText = middleschoolConfig.questions.map(q => q.text).join(' ')
      const hasComplexConcepts = middleschoolText.includes('complex') || 
                                 middleschoolText.includes('analyzes') ||
                                 middleschoolText.includes('evaluates')
      expect(hasComplexConcepts).toBe(true)
    })
  })

  describe('Question Context Adaptation', () => {
    test('should adapt same question differently for parent vs teacher', () => {
      const parentConfig = getParentQuizQuestions('6-8')
      const teacherConfig = getTeacherQuizQuestions('6-8')
      
      // Find questions that appear in both (same core concept, different context)
      const parentSkills = parentConfig.questions.map(q => q.skill)
      const teacherSkills = teacherConfig.questions.map(q => q.skill)
      
      const commonSkills = parentSkills.filter(skill => teacherSkills.includes(skill))
      expect(commonSkills.length).toBeGreaterThan(0)
      
      // Context should be different
      const parentText = parentConfig.questions.map(q => q.text).join(' ')
      const teacherText = teacherConfig.questions.map(q => q.text).join(' ')
      
      expect(parentText).not.toBe(teacherText)
    })

    test('should use home-focused language for parent quiz', () => {
      const config = getParentQuizQuestions('5-6')
      const allText = config.questions.map(q => q.text).join(' ')
      
      const homeTerms = ['family', 'home', 'household', 'siblings', 'parents']
      const hasHomeTerms = homeTerms.some(term => allText.includes(term))
      expect(hasHomeTerms).toBe(true)
    })

    test('should use classroom-focused language for teacher quiz', () => {
      const config = getTeacherQuizQuestions('5-6')
      const allText = config.questions.map(q => q.text).join(' ')
      
      const classroomTerms = ['student', 'classroom', 'classmates', 'academic', 'instruction']
      const hasClassroomTerms = classroomTerms.some(term => allText.includes(term))
      expect(hasClassroomTerms).toBe(true)
    })
  })

  describe('Quiz Validation', () => {
    test('should validate well-formed quiz configurations', () => {
      const config = getParentQuizQuestions('5-6')
      const validation = validateQuizConfiguration(config)
      
      console.log('Validation result:', validation)
      
      // Check that there are no critical validation errors
      // Parent quiz should have good coverage for most skills
      expect(validation.warnings.length).toBeLessThanOrEqual(2) // Allow for some coverage warnings
      
      // Should not have length-related warnings for well-sized quiz
      const lengthWarnings = validation.warnings.filter(w => 
        w.includes('short') || w.includes('long') || w.includes('fatigue')
      )
      expect(lengthWarnings.length).toBe(0)
    })

    test('should identify skill coverage issues', () => {
      // Create a mock configuration with limited coverage
      const limitedConfig = {
        quizType: 'teacher_classroom' as const,
        questionCount: 5,
        includePreferences: false,
        contextFocus: 'Limited test',
        questions: [
          { id: 1, skill: 'Communication', text: 'Test', ageGroups: ['5-6'], context: 'universal', responseType: 'likert' as const },
          { id: 2, skill: 'Communication', text: 'Test', ageGroups: ['5-6'], context: 'universal', responseType: 'likert' as const }
        ],
        distributionRationale: 'Test'
      }
      
      const validation = validateQuizConfiguration(limitedConfig)
      
      expect(validation.warnings.length).toBeGreaterThan(0)
      expect(validation.warnings.some(w => w.includes('coverage'))).toBe(true)
    })

    test('should handle quiz length warnings', () => {
      // Create a very long mock configuration
      const longConfig = {
        quizType: 'general' as const,
        questionCount: 60, // Very long
        includePreferences: true,
        contextFocus: 'Test',
        questions: [],
        distributionRationale: 'Test'
      }
      
      const validation = validateQuizConfiguration(longConfig)
      
      expect(validation.warnings.some(w => w.includes('fatigue'))).toBe(true)
    })

    test('should provide recommendations for teacher quiz with preferences', () => {
      const configWithPrefs = {
        quizType: 'teacher_classroom' as const,
        questionCount: 20,
        includePreferences: true, // Should trigger recommendation
        contextFocus: 'Test',
        questions: [],
        distributionRationale: 'Test'
      }
      
      const validation = validateQuizConfiguration(configWithPrefs)
      
      expect(validation.recommendations.some(r => r.includes('preferences'))).toBe(true)
    })
  })

  describe('Skill Coverage Analysis', () => {
    test('should analyze parent quiz skill coverage correctly', () => {
      const coverage = getSkillCoverage('parent_home')
      
      expect(coverage).toHaveLength(8) // 8 skills analyzed
      
      // Check that all skills are represented
      const skills = coverage.map(c => c.skill)
      expect(skills).toContain('Communication')
      expect(skills).toContain('Literacy')
      expect(skills).toContain('Math')
      
      // Parent quiz should have good coverage for most skills
      const goodCoverage = coverage.filter(c => c.coverage === 'full')
      expect(goodCoverage.length).toBeGreaterThan(4)
    })

    test('should analyze teacher quiz skill coverage correctly', () => {
      const coverage = getSkillCoverage('teacher_classroom')
      
      expect(coverage).toHaveLength(8)
      
      // Teacher quiz might have less coverage for some skills (like creativity)
      const creativityAndConfidence = coverage.filter(c => 
        ['Creative Innovation', 'Confidence'].includes(c.skill)
      )
      
      creativityAndConfidence.forEach(skill => {
        expect(skill.coverage).toBe('none') // These skills are not well-observed in classroom
      })
    })

    test('should provide appropriate rationales for coverage decisions', () => {
      const parentCoverage = getSkillCoverage('parent_home')
      const teacherCoverage = getSkillCoverage('teacher_classroom')
      
      // All coverage items should have rationales
      const allCoverage = parentCoverage.concat(teacherCoverage)
      allCoverage.forEach(item => {
        expect(item.rationale).toBeTruthy()
        expect(item.rationale.length).toBeGreaterThan(10)
      })
      
      // Rationales should be context-specific
      const parentRationale = parentCoverage.find(c => c.skill === 'Communication')?.rationale
      const teacherRationale = teacherCoverage.find(c => c.skill === 'Communication')?.rationale
      
      expect(parentRationale).not.toBe(teacherRationale)
      expect(parentRationale).toContain('home')
      expect(teacherRationale).toContain('classroom')
    })
  })

  describe('Extended Questions Integration', () => {
    test('should seamlessly integrate extended questions for older children', () => {
      const olderConfig = getParentQuizQuestions('8-10')
      
      const coreQuestions = olderConfig.questions.filter(q => q.id <= 28)
      const extendedQuestions = olderConfig.questions.filter(q => q.id >= 29)
      
      expect(coreQuestions.length).toBeGreaterThan(0)
      expect(extendedQuestions.length).toBeGreaterThan(0)
      
      // Should maintain skill balance across core and extended
      const allSkills = olderConfig.questions.map(q => q.skill)
      const uniqueSkills = [...new Set(allSkills)]
      
      expect(uniqueSkills.length).toBeGreaterThanOrEqual(8) // All 8 core skills represented
    })

    test('should not include extended questions for younger children', () => {
      const youngerConfig = getParentQuizQuestions('3-4')
      
      const extendedQuestions = youngerConfig.questions.filter(q => q.id >= 29)
      expect(extendedQuestions.length).toBe(0)
    })

    test('should properly weight extended vs core questions', () => {
      const config = getParentQuizQuestions('10+')
      
      // Should have a good mix, not just extended questions
      const coreQuestions = config.questions.filter(q => q.id <= 28)
      const extendedQuestions = config.questions.filter(q => q.id >= 29)
      
      expect(coreQuestions.length).toBeGreaterThan(0)
      expect(extendedQuestions.length).toBeGreaterThan(0)
      
      // Extended questions shouldn't overwhelm the assessment
      expect(extendedQuestions.length).toBeLessThan(coreQuestions.length * 2)
    })
  })

  describe('Performance and Reliability', () => {
    test('should generate quizzes quickly', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        getParentQuizQuestions('5-6')
        getTeacherQuizQuestions('5-6')
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete 200 generations in under 1 second
    })

    test('should generate consistent results', () => {
      const config1 = getParentQuizQuestions('6-8')
      const config2 = getParentQuizQuestions('6-8')
      
      expect(config1.questions.length).toBe(config2.questions.length)
      expect(config1.contextFocus).toBe(config2.contextFocus)
      
      // Question content should be identical
      config1.questions.forEach((q1, index) => {
        const q2 = config2.questions[index]
        expect(q1.id).toBe(q2.id)
        expect(q1.skill).toBe(q2.skill)
      })
    })

    test('should handle edge case age groups', () => {
      // Test boundary conditions
      expect(() => getParentQuizQuestions('3-4')).not.toThrow()
      expect(() => getParentQuizQuestions('10+')).not.toThrow()
      
      const minConfig = getParentQuizQuestions('3-4')
      const maxConfig = getParentQuizQuestions('10+')
      
      expect(minConfig.questions.length).toBeGreaterThan(0)
      expect(maxConfig.questions.length).toBeGreaterThan(0)
    })
  })
})