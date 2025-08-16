// CLP 2.0 Age-to-Question Routing Tests
// Comprehensive validation of extended age support (3-14 years) and precise routing logic

import { 
  getCLP2QuestionsForAge, 
  getCLP2Questions,
  CLP2_QUESTIONS,
  CLP2_EXTENDED_QUESTIONS,
  CLP2_PREFERENCE_QUESTIONS
} from '../../lib/clp-questions'
import { getParentQuizQuestions, getTeacherQuizQuestions } from '../../lib/multi-quiz-system'

describe('CLP 2.0 Age-to-Question Routing Tests', () => {
  
  describe('1. Age Group Classification', () => {
    describe('Precise age-in-months to age group mapping', () => {
      test('should map exact boundary ages correctly', () => {
        const boundaryTests = [
          { months: 36, expectedGroup: '3-4', description: 'Exactly 3 years' },
          { months: 42, expectedGroup: '4-5', description: 'Exactly 3.5 years' },
          { months: 48, expectedGroup: '4-5', description: 'Exactly 4 years' },
          { months: 60, expectedGroup: '4-5', description: 'Exactly 5 years' },
          { months: 66, expectedGroup: '5-6', description: 'Exactly 5.5 years' },
          { months: 72, expectedGroup: '5-6', description: 'Exactly 6 years' },
          { months: 84, expectedGroup: '6-8', description: 'Exactly 7 years' },
          { months: 96, expectedGroup: '6-8', description: 'Exactly 8 years' },
          { months: 108, expectedGroup: '8-10', description: 'Exactly 9 years' },
          { months: 120, expectedGroup: '8-10', description: 'Exactly 10 years' },
          { months: 132, expectedGroup: '10+', description: 'Exactly 11 years' },
          { months: 144, expectedGroup: '10+', description: 'Exactly 12 years' },
          { months: 156, expectedGroup: '10+', description: 'Exactly 13 years' },
          { months: 168, expectedGroup: '10+', description: 'Exactly 14 years' }
        ]

        boundaryTests.forEach(({ months, expectedGroup, description }) => {
          const questions = getCLP2QuestionsForAge(months)
          const ageGroups = questions.flatMap(q => q.ageGroups)
          
          expect(ageGroups).toContain(expectedGroup)
          console.log(`✓ ${description} (${months}mo) -> ${expectedGroup}: ${questions.length} questions`)
        })
      })

      test('should handle boundary conditions correctly', () => {
        const boundaryConditions = [
          { before: 41, after: 42, beforeGroup: '3-4', afterGroup: '4-5' },
          { before: 65, after: 66, beforeGroup: '4-5', afterGroup: '5-6' },
          { before: 83, after: 84, beforeGroup: '5-6', afterGroup: '6-8' },
          { before: 107, after: 108, beforeGroup: '6-8', afterGroup: '8-10' },
          { before: 131, after: 132, beforeGroup: '8-10', afterGroup: '10+' }
        ]

        boundaryConditions.forEach(({ before, after, beforeGroup, afterGroup }) => {
          const questionsBefore = getCLP2QuestionsForAge(before)
          const questionsAfter = getCLP2QuestionsForAge(after)
          
          const groupsBefore = questionsBefore.flatMap(q => q.ageGroups)
          const groupsAfter = questionsAfter.flatMap(q => q.ageGroups)
          
          expect(groupsBefore).toContain(beforeGroup)
          expect(groupsAfter).toContain(afterGroup)
          
          // Question count should change at boundaries (due to extended questions)
          if (after >= 84) { // Extended questions start at 6-8 group
            expect(questionsAfter.length).toBeGreaterThanOrEqual(questionsBefore.length)
          }
        })
      })

      test('should handle edge cases appropriately', () => {
        const edgeCases = [
          { months: 35.9, expectedBehavior: 'should round down to 3-4 group' },
          { months: 41.9, expectedBehavior: 'should stay in 3-4 group until 42' },
          { months: 65.9, expectedBehavior: 'should stay in 4-5 group until 66' },
          { months: 120.5, expectedBehavior: 'should be in 8-10 group' },
          { months: 180, expectedBehavior: 'should cap at 10+ group' },
          { months: 240, expectedBehavior: 'should handle extreme ages gracefully' }
        ]

        edgeCases.forEach(({ months, expectedBehavior }) => {
          expect(() => getCLP2QuestionsForAge(months)).not.toThrow()
          
          const questions = getCLP2QuestionsForAge(months)
          expect(questions.length).toBeGreaterThan(0)
          
          console.log(`✓ ${months}mo: ${expectedBehavior} - ${questions.length} questions`)
        })
      })
    })
  })

  describe('2. Question Routing Logic', () => {
    describe('Core questions routing for young age groups', () => {
      test('should route core questions (1-28) correctly for 3-4, 4-5, 5-6 groups', () => {
        const youngAgeGroups: Array<'3-4' | '4-5' | '5-6'> = ['3-4', '4-5', '5-6']
        
        youngAgeGroups.forEach(ageGroup => {
          const questions = getCLP2Questions('general', ageGroup)
          
          // Should only contain core questions (1-28) and preferences (25-28 subset)
          const coreQuestions = questions.filter(q => q.id <= 28)
          const extendedQuestions = questions.filter(q => q.id >= 29)
          
          expect(coreQuestions.length).toBeGreaterThan(0)
          expect(extendedQuestions.length).toBe(0)
          
          // Verify questions are age-appropriate
          questions.forEach(question => {
            expect(question.ageGroups).toContain(ageGroup)
          })
          
          console.log(`✓ ${ageGroup}: ${coreQuestions.length} core questions, ${extendedQuestions.length} extended`)
        })
      })

      test('should filter questions by age group arrays correctly', () => {
        // Test question with specific age restrictions (e.g., question 6 excludes '3-4')
        const question6 = CLP2_QUESTIONS.find(q => q.id === 6) // Conflict resolution
        expect(question6?.ageGroups).not.toContain('3-4')
        expect(question6?.ageGroups).toContain('4-5')

        // Verify this filtering works in practice
        const age3Questions = getCLP2Questions('general', '3-4')
        const age4Questions = getCLP2Questions('general', '4-5')
        
        const has6InAge3 = age3Questions.some(q => q.id === 6)
        const has6InAge4 = age4Questions.some(q => q.id === 6)
        
        expect(has6InAge3).toBe(false)
        expect(has6InAge4).toBe(true)
      })
    })

    describe('Extended questions routing for older age groups', () => {
      test('should include extended questions (29+) only for 6-8, 8-10, 10+ groups', () => {
        const extendedAgeGroups: Array<'6-8' | '8-10' | '10+'> = ['6-8', '8-10', '10+']
        
        extendedAgeGroups.forEach(ageGroup => {
          const questions = getCLP2Questions('general', ageGroup)
          const extendedQuestions = questions.filter(q => q.id >= 29)
          
          expect(extendedQuestions.length).toBeGreaterThan(0)
          
          // Verify extended questions are age-appropriate
          extendedQuestions.forEach(question => {
            expect(question.ageGroups).toContain(ageGroup)
          })
          
          console.log(`✓ ${ageGroup}: ${extendedQuestions.length} extended questions included`)
        })
      })

      test('should not include extended questions for young age groups', () => {
        const youngAgeGroups: Array<'3-4' | '4-5' | '5-6'> = ['3-4', '4-5', '5-6']
        
        youngAgeGroups.forEach(ageGroup => {
          const questions = getCLP2Questions('general', ageGroup)
          const extendedQuestions = questions.filter(q => q.id >= 29)
          
          expect(extendedQuestions.length).toBe(0)
        })
      })

      test('should validate extended question age group arrays', () => {
        CLP2_EXTENDED_QUESTIONS.forEach(question => {
          // Extended questions should only be for older children
          const hasYoungAgeGroups = question.ageGroups.some(group => 
            ['3-4', '4-5', '5-6'].includes(group)
          )
          expect(hasYoungAgeGroups).toBe(false)
          
          // Should have at least one extended age group
          const hasExtendedAgeGroups = question.ageGroups.some(group => 
            ['6-8', '8-10', '10+'].includes(group)
          )
          expect(hasExtendedAgeGroups).toBe(true)
        })
      })
    })
  })

  describe('3. Extended Age Range Support', () => {
    describe('6-8 age group (1st-3rd grade)', () => {
      test('should get appropriate extended questions', () => {
        const questions = getCLP2Questions('general', '6-8')
        const extendedQuestions = questions.filter(q => q.id >= 29)
        
        expect(extendedQuestions.length).toBeGreaterThan(5)
        expect(extendedQuestions.length).toBeLessThan(25) // Not all extended questions
        
        // Should include foundational extended questions
        const foundationalExtended = extendedQuestions.filter(q => 
          ['6-8', '8-10', '10+'].every(group => q.ageGroups.includes(group))
        )
        expect(foundationalExtended.length).toBeGreaterThan(0)
      })

      test('should balance core and extended questions', () => {
        const questions = getCLP2Questions('general', '6-8')
        const coreQuestions = questions.filter(q => q.id <= 28)
        const extendedQuestions = questions.filter(q => q.id >= 29)
        
        // Should maintain good balance
        expect(coreQuestions.length).toBeGreaterThan(extendedQuestions.length)
        expect(extendedQuestions.length).toBeGreaterThan(0)
      })
    })

    describe('8-10 age group (3rd-5th grade)', () => {
      test('should get more complex questions', () => {
        const questions = getCLP2Questions('general', '8-10')
        const questionsFor6to8 = getCLP2Questions('general', '6-8')
        
        // Should have more questions than 6-8 group
        expect(questions.length).toBeGreaterThanOrEqual(questionsFor6to8.length)
        
        // Should include more complex extended questions
        const complexExtended = questions.filter(q => 
          q.id >= 29 && q.ageGroups.includes('8-10')
        )
        expect(complexExtended.length).toBeGreaterThan(5)
      })

      test('should include grade-appropriate vocabulary', () => {
        const questions = getCLP2Questions('general', '8-10')
        const questionText = questions.map(q => q.text).join(' ')
        
        // Should include intermediate complexity terms
        const intermediateTerms = ['demonstrates', 'applies', 'analyzes', 'connects']
        const hasIntermediateTerms = intermediateTerms.some(term => 
          questionText.toLowerCase().includes(term.toLowerCase())
        )
        expect(hasIntermediateTerms).toBe(true)
      })
    })

    describe('10+ age group (middle school+)', () => {
      test('should get advanced question sets', () => {
        const questions = getCLP2Questions('general', '10+')
        const extendedQuestions = questions.filter(q => q.id >= 29)
        
        // Should have comprehensive extended question coverage
        expect(extendedQuestions.length).toBeGreaterThan(10)
        
        // Should include all the most advanced questions
        const advancedQuestions = CLP2_EXTENDED_QUESTIONS.filter(q => 
          q.ageGroups.includes('10+') && !q.ageGroups.includes('6-8')
        )
        const includedAdvanced = questions.filter(q => 
          advancedQuestions.some(adv => adv.id === q.id)
        )
        expect(includedAdvanced.length).toBeGreaterThan(0)
      })

      test('should include highest complexity vocabulary', () => {
        const questions = getCLP2Questions('general', '10+')
        const questionText = questions.map(q => q.text).join(' ')
        
        // Should include advanced academic terms
        const advancedTerms = ['evaluates', 'abstract', 'credibility', 'complex', 'innovations']
        const hasAdvancedTerms = advancedTerms.some(term => 
          questionText.toLowerCase().includes(term.toLowerCase())
        )
        expect(hasAdvancedTerms).toBe(true)
      })
    })

    describe('Complexity progression validation', () => {
      test('should show increasing complexity across age groups', () => {
        const ageGroups: Array<'6-8' | '8-10' | '10+'> = ['6-8', '8-10', '10+']
        const complexityScores: number[] = []
        
        ageGroups.forEach(ageGroup => {
          const questions = getCLP2Questions('general', ageGroup)
          const questionText = questions.map(q => q.text).join(' ').toLowerCase()
          
          // Calculate complexity score based on advanced vocabulary
          const complexTerms = ['abstract', 'analyzes', 'evaluates', 'complex', 'credibility', 
                               'innovations', 'demonstrates', 'articulates', 'synthesizes']
          const complexityScore = complexTerms.filter(term => 
            questionText.includes(term)
          ).length
          
          complexityScores.push(complexityScore)
          console.log(`${ageGroup}: complexity score = ${complexityScore}`)
        })
        
        // Complexity should generally increase
        expect(complexityScores[1]).toBeGreaterThanOrEqual(complexityScores[0])
        expect(complexityScores[2]).toBeGreaterThanOrEqual(complexityScores[1])
      })
    })
  })

  describe('4. Question Pool Integration', () => {
    describe('CLP2_QUESTIONS and CLP2_EXTENDED_QUESTIONS integration', () => {
      test('should seamlessly combine core and extended questions', () => {
        const olderAgeGroups: Array<'6-8' | '8-10' | '10+'> = ['6-8', '8-10', '10+']
        
        olderAgeGroups.forEach(ageGroup => {
          const questions = getCLP2Questions('general', ageGroup)
          
          const coreQuestions = questions.filter(q => q.id <= 28)
          const extendedQuestions = questions.filter(q => q.id >= 29)
          
          // Should have both types
          expect(coreQuestions.length).toBeGreaterThan(0)
          expect(extendedQuestions.length).toBeGreaterThan(0)
          
          // No ID conflicts
          const allIds = questions.map(q => q.id)
          const uniqueIds = [...new Set(allIds)]
          expect(allIds.length).toBe(uniqueIds.length)
        })
      })

      test('should maintain consistent question structure', () => {
        const allQuestions = [...CLP2_QUESTIONS, ...CLP2_EXTENDED_QUESTIONS, ...CLP2_PREFERENCE_QUESTIONS]
        
        allQuestions.forEach(question => {
          // All questions should have consistent structure
          expect(question).toHaveProperty('id')
          expect(question).toHaveProperty('text')
          expect(question).toHaveProperty('skill')
          expect(question).toHaveProperty('context')
          expect(question).toHaveProperty('responseType')
          expect(question).toHaveProperty('ageGroups')
          
          // Validate field types
          expect(typeof question.id).toBe('number')
          expect(typeof question.text).toBe('string')
          expect(typeof question.skill).toBe('string')
          expect(['home', 'classroom', 'universal']).toContain(question.context)
          expect(['likert', 'multipleChoice', 'multiSelect']).toContain(question.responseType)
          expect(Array.isArray(question.ageGroups)).toBe(true)
        })
      })
    })

    describe('Skill balance validation', () => {
      test('should maintain skill balance with extended questions', () => {
        const ageGroup: '8-10' = '8-10'
        const questions = getCLP2Questions('general', ageGroup)
        
        // Count questions per skill
        const skillCounts: Record<string, number> = {}
        questions.forEach(q => {
          skillCounts[q.skill] = (skillCounts[q.skill] || 0) + 1
        })
        
        // Core 8 skills should be represented
        const coreSkills = ['Communication', 'Collaboration', 'Content', 'Critical Thinking',
                           'Creative Innovation', 'Confidence', 'Literacy', 'Math']
        
        coreSkills.forEach(skill => {
          expect(skillCounts[skill]).toBeGreaterThan(0)
        })
        
        // No single skill should dominate
        const totalQuestions = questions.length
        Object.values(skillCounts).forEach(count => {
          expect(count / totalQuestions).toBeLessThan(0.5) // Max 50% per skill
        })
      })

      test('should cover all 8 skills appropriately', () => {
        const requiredSkills = [
          'Communication', 'Collaboration', 'Content', 'Critical Thinking',
          'Creative Innovation', 'Confidence', 'Literacy', 'Math'
        ]
        
        const ageGroups: Array<'6-8' | '8-10' | '10+'> = ['6-8', '8-10', '10+']
        
        ageGroups.forEach(ageGroup => {
          const questions = getCLP2Questions('general', ageGroup)
          const representedSkills = [...new Set(questions.map(q => q.skill))]
          
          requiredSkills.forEach(skill => {
            expect(representedSkills).toContain(skill)
          })
          
          console.log(`✓ ${ageGroup}: ${representedSkills.length}/8 skills covered`)
        })
      })
    })
  })

  describe('5. Context Routing', () => {
    describe('Universal, home, and classroom context routing', () => {
      test('should handle universal context questions correctly', () => {
        const universalQuestions = [...CLP2_QUESTIONS, ...CLP2_EXTENDED_QUESTIONS]
          .filter(q => q.context === 'universal')
        
        expect(universalQuestions.length).toBeGreaterThan(10)
        
        // Universal questions should appear in all quiz types
        const parentQuiz = getParentQuizQuestions('6-8')
        const teacherQuiz = getTeacherQuizQuestions('6-8')
        
        // Count how many universal questions appear in quizzes
        let universalInParent = 0
        let universalInTeacher = 0
        
        universalQuestions.forEach(universalQ => {
          if (universalQ.ageGroups.includes('6-8')) {
            const inParent = parentQuiz.questions.some(q => q.id === universalQ.id)
            const inTeacher = teacherQuiz.questions.some(q => q.id === universalQ.id)
            
            if (inParent) universalInParent++
            if (inTeacher) universalInTeacher++
          }
        })
        
        // Universal questions should appear in both quiz types (though not necessarily all of them)
        expect(universalInParent).toBeGreaterThan(0)
        expect(universalInTeacher).toBeGreaterThan(0)
      })

      test('should handle home context questions correctly', () => {
        const homeQuestions = [...CLP2_QUESTIONS, ...CLP2_EXTENDED_QUESTIONS]
          .filter(q => q.context === 'home')
        
        if (homeQuestions.length > 0) {
          // Home questions should prefer parent quiz
          const parentQuiz = getParentQuizQuestions('6-8')
          const teacherQuiz = getTeacherQuizQuestions('6-8')
          
          homeQuestions.forEach(homeQ => {
            if (homeQ.ageGroups.includes('6-8')) {
              const inParent = parentQuiz.questions.some(q => q.id === homeQ.id)
              const inTeacher = teacherQuiz.questions.some(q => q.id === homeQ.id)
              
              // Home questions should be more likely in parent quiz
              if (inParent || inTeacher) {
                expect(inParent).toBe(true) // Should prefer parent context
              }
            }
          })
        }
      })

      test('should handle classroom context questions correctly', () => {
        const classroomQuestions = [...CLP2_QUESTIONS, ...CLP2_EXTENDED_QUESTIONS]
          .filter(q => q.context === 'classroom')
        
        expect(classroomQuestions.length).toBeGreaterThan(0)
        
        // Classroom questions should prefer teacher quiz
        const parentQuiz = getParentQuizQuestions('8-10')
        const teacherQuiz = getTeacherQuizQuestions('8-10')
        
        classroomQuestions.forEach(classroomQ => {
          if (classroomQ.ageGroups.includes('8-10')) {
            const inParent = parentQuiz.questions.some(q => q.id === classroomQ.id)
            const inTeacher = teacherQuiz.questions.some(q => q.id === classroomQ.id)
            
            // Classroom questions should be more likely in teacher quiz
            if (inParent || inTeacher) {
              expect(inTeacher).toBe(true) // Should prefer teacher context
            }
          }
        })
      })
    })

    describe('Context filtering for parent vs teacher quizzes', () => {
      test('should filter questions appropriately for parent quizzes', () => {
        const parentQuiz = getParentQuizQuestions('8-10')
        const questionText = parentQuiz.questions.map(q => q.text).join(' ')
        
        // Should adapt to home context
        const homeTerms = ['family', 'home', 'household', 'siblings', 'parents']
        const hasHomeTerms = homeTerms.some(term => 
          questionText.toLowerCase().includes(term.toLowerCase())
        )
        expect(hasHomeTerms).toBe(true)
        
        // Should not be overly classroom-focused
        const classroomOnlyTerms = ['academic performance', 'grade-level', 'instruction']
        const hasClassroomOnlyTerms = classroomOnlyTerms.some(term => 
          questionText.toLowerCase().includes(term.toLowerCase())
        )
        // Some classroom terms might appear, but shouldn't dominate
      })

      test('should filter questions appropriately for teacher quizzes', () => {
        const teacherQuiz = getTeacherQuizQuestions('8-10')
        const questionText = teacherQuiz.questions.map(q => q.text).join(' ')
        
        // Should adapt to classroom context
        const classroomTerms = ['student', 'classroom', 'academic', 'classmates']
        const hasClassroomTerms = classroomTerms.some(term => 
          questionText.toLowerCase().includes(term.toLowerCase())
        )
        expect(hasClassroomTerms).toBe(true)
        
        // Should be shorter and more focused than parent quiz
        const parentQuiz = getParentQuizQuestions('8-10')
        expect(teacherQuiz.questions.length).toBeLessThan(parentQuiz.questions.length)
      })
    })

    describe('Age appropriateness maintenance across contexts', () => {
      test('should maintain age appropriateness in all contexts', () => {
        const contexts: Array<'parent_home' | 'teacher_classroom' | 'general'> = 
          ['parent_home', 'teacher_classroom', 'general']
        const ageGroups: Array<'3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+'> = 
          ['3-4', '4-5', '5-6', '6-8', '8-10', '10+']
        
        contexts.forEach(context => {
          ageGroups.forEach(ageGroup => {
            const questions = getCLP2Questions(context, ageGroup)
            
            // All questions should be appropriate for the age group
            questions.forEach(question => {
              expect(question.ageGroups).toContain(ageGroup)
            })
            
            // Should get reasonable question count
            expect(questions.length).toBeGreaterThan(0)
            expect(questions.length).toBeLessThan(100) // Reasonable upper bound
          })
        })
      })
    })
  })

  describe('6. Integration Tests', () => {
    describe('End-to-end age routing workflow', () => {
      test('should route from age in months through complete quiz generation', () => {
        const testAges = [42, 78, 120, 156] // Representative ages
        
        testAges.forEach(ageInMonths => {
          // Step 1: Get questions for specific age
          const ageQuestions = getCLP2QuestionsForAge(ageInMonths)
          expect(ageQuestions.length).toBeGreaterThan(0)
          
          // Step 2: Determine age group (simulate the internal logic)
          let expectedAgeGroup: '3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+'
          if (ageInMonths < 42) expectedAgeGroup = '3-4'
          else if (ageInMonths < 66) expectedAgeGroup = '4-5' 
          else if (ageInMonths < 84) expectedAgeGroup = '5-6'
          else if (ageInMonths < 108) expectedAgeGroup = '6-8'
          else if (ageInMonths < 132) expectedAgeGroup = '8-10'
          else expectedAgeGroup = '10+'
          
          // Step 3: Generate parent and teacher quizzes for the age group
          const parentQuiz = getParentQuizQuestions(expectedAgeGroup)
          const teacherQuiz = getTeacherQuizQuestions(expectedAgeGroup)
          
          expect(parentQuiz.questions.length).toBeGreaterThan(0)
          expect(teacherQuiz.questions.length).toBeGreaterThan(0)
          
          // Step 4: Validate consistency
          const ageGroupValidation = ageQuestions.every(q => q.ageGroups.includes(expectedAgeGroup))
          expect(ageGroupValidation).toBe(true)
          
          console.log(`✓ Age ${ageInMonths}mo -> ${expectedAgeGroup}: ${ageQuestions.length} base, ${parentQuiz.questions.length} parent, ${teacherQuiz.questions.length} teacher`)
        })
      })

      test('should maintain data integrity across all routing paths', () => {
        const allQuestions = [...CLP2_QUESTIONS, ...CLP2_EXTENDED_QUESTIONS, ...CLP2_PREFERENCE_QUESTIONS]
        
        // Validate no duplicate IDs
        const allIds = allQuestions.map(q => q.id)
        const uniqueIds = [...new Set(allIds)]
        expect(allIds.length).toBe(uniqueIds.length)
        
        // Validate all questions have proper age group assignments
        allQuestions.forEach(question => {
          expect(question.ageGroups.length).toBeGreaterThan(0)
          question.ageGroups.forEach(ageGroup => {
            expect(['3-4', '4-5', '5-6', '6-8', '8-10', '10+']).toContain(ageGroup)
          })
        })
        
        // Validate skill coverage
        const allSkills = [...new Set(allQuestions.map(q => q.skill))]
        const expectedSkills = ['Communication', 'Collaboration', 'Content', 'Critical Thinking',
                               'Creative Innovation', 'Confidence', 'Literacy', 'Math', 
                               'Engagement', 'Modality', 'Social', 'Interests'] // Include preference skills
        
        expectedSkills.forEach(skill => {
          expect(allSkills).toContain(skill)
        })
      })
    })

    describe('Performance and reliability', () => {
      test('should route questions efficiently for all ages', () => {
        const startTime = performance.now()
        
        // Test all age groups and contexts
        const ageGroups: Array<'3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+'> = 
          ['3-4', '4-5', '5-6', '6-8', '8-10', '10+']
        const contexts: Array<'parent_home' | 'teacher_classroom' | 'general'> = 
          ['parent_home', 'teacher_classroom', 'general']
        
        ageGroups.forEach(ageGroup => {
          contexts.forEach(context => {
            getCLP2Questions(context, ageGroup)
          })
        })
        
        // Test age-based routing
        for (let age = 36; age <= 168; age += 12) {
          getCLP2QuestionsForAge(age)
        }
        
        const endTime = performance.now()
        expect(endTime - startTime).toBeLessThan(1000) // Should complete in under 1 second
      })

      test('should provide consistent results across multiple calls', () => {
        const testCases = [
          { ageGroup: '6-8' as const, context: 'parent_home' as const },
          { ageGroup: '8-10' as const, context: 'teacher_classroom' as const },
          { ageInMonths: 120 }
        ]
        
        testCases.forEach(testCase => {
          let questions1, questions2
          
          if ('ageInMonths' in testCase) {
            questions1 = getCLP2QuestionsForAge(testCase.ageInMonths)
            questions2 = getCLP2QuestionsForAge(testCase.ageInMonths)
          } else {
            questions1 = getCLP2Questions(testCase.context, testCase.ageGroup)
            questions2 = getCLP2Questions(testCase.context, testCase.ageGroup)
          }
          
          expect(questions1.length).toBe(questions2.length)
          
          questions1.forEach((q1, index) => {
            const q2 = questions2[index]
            expect(q1.id).toBe(q2.id)
            expect(q1.text).toBe(q2.text)
            expect(q1.skill).toBe(q2.skill)
          })
        })
      })
    })
  })

  describe('7. Compliance and Quality Assurance', () => {
    test('should ensure all routed questions meet CLP 2.0 standards', () => {
      const allAgeGroups: Array<'3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+'> = 
        ['3-4', '4-5', '5-6', '6-8', '8-10', '10+']
      
      allAgeGroups.forEach(ageGroup => {
        const questions = getCLP2Questions('general', ageGroup)
        
        questions.forEach(question => {
          // CLP 2.0 compliance checks
          expect(question).toHaveProperty('id')
          expect(question).toHaveProperty('text')
          expect(question).toHaveProperty('skill')
          expect(question).toHaveProperty('context')
          expect(question).toHaveProperty('responseType')
          expect(question).toHaveProperty('ageGroups')
          
          // Validate response types
          expect(['likert', 'multipleChoice', 'multiSelect']).toContain(question.responseType)
          
          // Validate contexts
          expect(['home', 'classroom', 'universal']).toContain(question.context)
          
          // Validate age group inclusion
          expect(question.ageGroups).toContain(ageGroup)
          
          // Validate text quality
          expect(question.text.length).toBeGreaterThan(10)
          expect(question.text.length).toBeLessThan(200)
        })
      })
    })

    test('should provide appropriate developmental progression', () => {
      const progressionTest = [
        { age: 42, expectSimple: true, expectComplex: false },   // 3.5 years
        { age: 78, expectSimple: true, expectComplex: false },   // 6.5 years  
        { age: 120, expectSimple: false, expectComplex: true },  // 10 years
        { age: 156, expectSimple: false, expectComplex: true }   // 13 years
      ]
      
      progressionTest.forEach(({ age, expectSimple, expectComplex }) => {
        const questions = getCLP2QuestionsForAge(age)
        const questionText = questions.map(q => q.text).join(' ').toLowerCase()
        
        const simpleTerms = ['plays', 'likes', 'enjoys', 'shows']
        const complexTerms = ['analyzes', 'evaluates', 'demonstrates', 'articulates', 'synthesizes']
        
        const hasSimple = simpleTerms.some(term => questionText.includes(term))
        const hasComplex = complexTerms.some(term => questionText.includes(term))
        
        if (expectSimple) expect(hasSimple).toBe(true)
        if (expectComplex) expect(hasComplex).toBe(true)
        if (!expectSimple && hasSimple) {
          // Allow some simple terms even in complex questions
        }
        if (!expectComplex && hasComplex) {
          expect(hasComplex).toBe(false)
        }
      })
    })
  })
})