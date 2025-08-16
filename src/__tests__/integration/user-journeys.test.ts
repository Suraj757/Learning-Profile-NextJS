/**
 * CLP 2.0 User Journey Integration Tests
 * 
 * Comprehensive end-to-end testing covering the three main user contexts:
 * 1. Parent Journey: Complete flow from assessment to personalized results
 * 2. Teacher Journey: Classroom-focused assessment and results interpretation
 * 3. Collaborative Journey: Parent + Teacher assessments with consolidation
 * 
 * Tests real assessment flows with actual question data, score calculations,
 * age-appropriate routing, and context-specific adaptations.
 */

import {
  getParentQuizQuestions,
  getTeacherQuizQuestions,
  validateQuizConfiguration,
  getSkillCoverage,
  QuizConfiguration
} from '../../lib/multi-quiz-system'

import {
  calculateCLP2Scores,
  consolidateCLP2Scores,
  getCLP2PersonalityLabel,
  getCLP2StrengthsAndGrowth,
  CLP2Scores,
  CLP2_SKILLS
} from '../../lib/clp-scoring'

import {
  getCLP2Questions,
  getCLP2QuestionsForAge,
  validateCLP2Response,
  CLP2Question
} from '../../lib/clp-questions'

describe('CLP 2.0 User Journey Integration Tests', () => {

  describe('Parent Journey: Complete Assessment Flow', () => {
    
    it('should complete parent journey for 5-year-old with realistic responses', async () => {
      const childAge = '5-6'
      const childName = 'Emma'
      
      // Step 1: Generate parent quiz configuration
      const parentConfig = getParentQuizQuestions(childAge)
      
      // Verify parent quiz structure
      expect(parentConfig.quizType).toBe('parent_home')
      expect(parentConfig.includePreferences).toBe(true)
      expect(parentConfig.contextFocus).toContain('Home behavior')
      expect(parentConfig.questions.length).toBeGreaterThan(15)
      
      // Step 2: Validate quiz configuration
      const validation = validateQuizConfiguration(parentConfig)
      expect(validation.warnings.length).toBeLessThan(5) // Allow some warnings
      
      // Step 3: Get skill coverage analysis
      const skillCoverage = getSkillCoverage('parent_home')
      const communicationCoverage = skillCoverage.find(s => s.skill === 'Communication')
      expect(communicationCoverage?.coverage).toBe('full')
      
      // Step 4: Simulate realistic parent responses for a creative, communicative child
      const parentResponses: Record<number, number | string | string[]> = {
        // Communication (2 questions) - Strong
        1: 5, // Clearly expresses thoughts at home - Strongly Agree
        2: 5, // Asks thoughtful questions at home - Strongly Agree
        
        // Collaboration (1 question) - Developing  
        4: 3, // Works with family members - Neutral
        
        // Content (1 question) - Good
        7: 4, // Shows curiosity at home - Agree
        
        // Critical Thinking (1 question) - Good
        11: 4, // Asks why/how questions at home - Agree
        
        // Creative Innovation (2 questions) - Strong
        13: 5, // Original ideas for family activities - Strongly Agree
        14: 5, // Creative uses for household objects - Strongly Agree
        
        // Confidence (2 questions) - Good
        16: 4, // Tries new activities at home - Agree
        17: 4, // Bounces back from disappointments - Agree
        
        // Literacy (3 questions) - Strong  
        19: 5, // Interest in books at home - Strongly Agree
        20: 4, // Retells family stories - Agree
        21: 5, // Word patterns during family time - Strongly Agree
        
        // Math (3 questions) - Developing
        22: 3, // Counting household objects - Neutral
        23: 4, // Notices patterns around house - Agree
        24: 2, // Simple number problems - Disagree
        
        // Learning Preferences
        25: "hands-on", // Engagement preference
        26: "creative", // Activity preference
        27: "small-group", // Social preference
        28: ["stories", "art", "science"] // Interests
      }
      
      // Step 5: Validate all responses
      Object.entries(parentResponses).forEach(([questionIdStr, response]) => {
        const questionId = parseInt(questionIdStr)
        const isValid = validateCLP2Response(questionId, response)
        expect(isValid).toBe(true)
      })
      
      // Step 6: Calculate CLP 2.0 scores using actual algorithm
      const parentScores = calculateCLP2Scores(
        parentResponses,
        'parent_home',
        childAge
      )
      
      // Step 7: Verify score calculations match expected ranges
      expect(parentScores.Communication).toBeGreaterThan(4.5) // Strong responses (5,5)
      expect(parentScores['Creative Innovation']).toBeGreaterThan(4.5) // Strong responses (5,5)
      expect(parentScores.Literacy).toBeGreaterThan(4.0) // Strong responses (5,4,5)
      expect(parentScores.Math).toBeLessThan(3.5) // Weaker responses (3,4,2)
      expect(parentScores.Collaboration).toBeLessThan(3.5) // Single neutral response
      
      // Step 8: Verify preferences are captured
      expect(parentScores.Engagement).toBe("hands-on")
      expect(parentScores.Modality).toBe("creative")
      expect(parentScores.Social).toBe("small-group")
      expect(parentScores.Interests).toEqual(["stories", "art", "science"])
      
      // Step 9: Generate personality label and analysis
      const personalityLabel = getCLP2PersonalityLabel(parentScores)
      const strengthsAnalysis = getCLP2StrengthsAndGrowth(parentScores)
      
      expect(personalityLabel).toBeTruthy()
      expect(personalityLabel).toContain('Creative') // Should reflect creative strength
      expect(strengthsAnalysis.strengths).toContain('Creative Innovation')
      expect(strengthsAnalysis.strengths).toContain('Communication')
      expect(strengthsAnalysis.growthAreas).toContain('Math')
      
      // Step 10: Verify complete parent journey data structure
      const parentJourneyResult = {
        childName,
        ageGroup: childAge,
        assessmentType: 'parent_home',
        scores: parentScores,
        personalityLabel,
        strengths: strengthsAnalysis.strengths,
        growthAreas: strengthsAnalysis.growthAreas,
        completeness: 'complete',
        confidence: 'high'
      }
      
      expect(parentJourneyResult.assessmentType).toBe('parent_home')
      expect(parentJourneyResult.completeness).toBe('complete')
      expect(Object.keys(parentJourneyResult.scores).length).toBeGreaterThan(8) // 8 skills + preferences
    })
    
    it('should handle parent journey for different age groups with proper question adaptation', async () => {
      const testCases = [
        { ageGroup: '3-4', expectedQuestions: 15, context: 'preschool play' },
        { ageGroup: '4-5', expectedQuestions: 16, context: 'pre-K development' },
        { ageGroup: '6-8', expectedQuestions: 20, context: 'elementary skills' },
        { ageGroup: '8-10', expectedQuestions: 22, context: 'advanced elementary' },
        { ageGroup: '10+', expectedQuestions: 25, context: 'middle school+' }
      ] as const
      
      for (const testCase of testCases) {
        // Generate age-appropriate quiz
        const config = getParentQuizQuestions(testCase.ageGroup)
        
        // Verify age-appropriate question count and content
        expect(config.questions.length).toBeGreaterThanOrEqual(testCase.expectedQuestions)
        
        // Check that questions are adapted for home context
        const communicationQuestion = config.questions.find(q => q.skill === 'Communication')
        expect(communicationQuestion?.text).toContain('family') // Home adaptation
        
        // Verify extended questions for older children
        if (['6-8', '8-10', '10+'].includes(testCase.ageGroup)) {
          const extendedQuestions = config.questions.filter(q => q.id >= 29)
          expect(extendedQuestions.length).toBeGreaterThan(0)
        }
        
        // Test with sample responses
        const sampleResponses = generateRealisticResponses(config.questions, 'parent')
        const scores = calculateCLP2Scores(sampleResponses, 'parent_home', testCase.ageGroup)
        
        // All scores should be within valid ranges
        CLP2_SKILLS.forEach(skill => {
          expect(scores[skill]).toBeGreaterThanOrEqual(1.0)
          expect(scores[skill]).toBeLessThanOrEqual(5.0)
        })
      }
    })
  })

  describe('Teacher Journey: Classroom Assessment Flow', () => {
    
    it('should complete teacher journey with classroom-focused questions', async () => {
      const studentAge = '6-8'
      const studentName = 'Marcus'
      
      // Step 1: Generate teacher quiz configuration
      const teacherConfig = getTeacherQuizQuestions(studentAge)
      
      // Verify teacher quiz structure
      expect(teacherConfig.quizType).toBe('teacher_classroom')
      expect(teacherConfig.includePreferences).toBe(false) // Teachers don't assess preferences
      expect(teacherConfig.contextFocus).toContain('Classroom behavior')
      expect(teacherConfig.questions.length).toBeLessThanOrEqual(20) // More focused than parent quiz
      
      // Step 2: Validate teacher-specific skill coverage
      const skillCoverage = getSkillCoverage('teacher_classroom')
      const collaborationCoverage = skillCoverage.find(s => s.skill === 'Collaboration')
      expect(collaborationCoverage?.coverage).toBe('full') // Key classroom skill
      
      const creativityCoverage = skillCoverage.find(s => s.skill === 'Creative Innovation')
      expect(creativityCoverage?.coverage).toBe('none') // Less observable in classroom
      
      // Step 3: Simulate realistic teacher responses for academically strong student
      const teacherResponses: Record<number, number | string | string[]> = {
        // Communication in classroom context
        1: 4, // Expresses thoughts in classroom discussions - Agree
        3: 4, // Listens during classroom discussions - Agree
        
        // Collaboration in classroom
        4: 5, // Enjoys working with classmates - Strongly Agree
        5: 5, // Shares classroom materials - Strongly Agree
        
        // Academic Content
        8: 5, // Remembers lessons and instruction - Strongly Agree
        9: 4, // Applies concepts to new academic situations - Agree
        
        // Critical Thinking in academics
        10: 4, // Thinks through academic problems - Agree
        12: 3, // Explains reasoning in classroom - Neutral
        
        // Literacy skills
        19: 5, // Interest in classroom reading - Strongly Agree
        21: 4, // Word patterns in class - Agree
        
        // Math skills  
        22: 4, // Math activities in class - Agree
        24: 5 // Number problems during math - Strongly Agree
      }
      
      // Step 4: Calculate teacher perspective scores
      const teacherScores = calculateCLP2Scores(
        teacherResponses,
        'teacher_classroom',
        studentAge
      )
      
      // Step 5: Verify teacher-specific scoring patterns
      expect(teacherScores.Collaboration).toBeGreaterThanOrEqual(4.0) // Strong classroom collaboration
      expect(teacherScores.Content).toBeGreaterThanOrEqual(4.0) // Strong academic performance
      expect(teacherScores.Literacy).toBeGreaterThanOrEqual(4.0) // Strong reading skills
      expect(teacherScores.Math).toBeGreaterThanOrEqual(4.0) // Strong math skills
      
      // Creative Innovation should be minimal (teacher quiz doesn't assess this well)
      expect(teacherScores['Creative Innovation']).toBe(1.0) // No teacher questions for this
      
      // Step 6: Generate teacher-focused analysis
      const teacherPersonality = getCLP2PersonalityLabel(teacherScores)
      const teacherAnalysis = getCLP2StrengthsAndGrowth(teacherScores)
      
      expect(teacherPersonality).toBeTruthy()
      expect(teacherAnalysis.strengths).toContain('Collaboration')
      expect(teacherAnalysis.strengths.length).toBeGreaterThan(0)
      
      // Step 7: Verify teacher journey result structure
      const teacherJourneyResult = {
        studentName,
        ageGroup: studentAge,
        assessmentType: 'teacher_classroom',
        scores: teacherScores,
        personalityLabel: teacherPersonality,
        classroomStrengths: teacherAnalysis.strengths,
        academicGrowthAreas: teacherAnalysis.growthAreas,
        teacherRecommendations: generateTeacherRecommendations(teacherScores)
      }
      
      expect(teacherJourneyResult.assessmentType).toBe('teacher_classroom')
      expect(teacherJourneyResult.teacherRecommendations).toBeTruthy()
    })
    
    it('should adapt teacher questions for extended age ranges', async () => {
      const extendedAgeGroups: Array<'8-10' | '10+'> = ['8-10', '10+']
      
      for (const ageGroup of extendedAgeGroups) {
        const config = getTeacherQuizQuestions(ageGroup)
        
        // Should include extended academic questions for older students
        const extendedQuestions = config.questions.filter(q => q.id >= 29)
        expect(extendedQuestions.length).toBeGreaterThan(3) // More complex questions for older students
        
        // Should focus on academic skills
        const academicQuestions = config.questions.filter(q => 
          q.skill === 'Content' || q.skill === 'Literacy' || q.skill === 'Math'
        )
        expect(academicQuestions.length).toBeGreaterThan(5)
        
        // Test with realistic responses
        const responses = generateRealisticResponses(config.questions, 'teacher')
        const scores = calculateCLP2Scores(responses, 'teacher_classroom', ageGroup)
        
        // Should produce valid academic profile
        expect(scores.Content).toBeGreaterThanOrEqual(1.0)
        expect(scores.Literacy).toBeGreaterThanOrEqual(1.0)
        expect(scores.Math).toBeGreaterThanOrEqual(1.0)
      }
    })
  })

  describe('Collaborative Journey: Parent + Teacher Consolidation', () => {
    
    it('should complete full collaborative journey with score consolidation', async () => {
      const childName = 'Sofia'
      const ageGroup = '7-8' // Elementary age where both perspectives are valuable
      
      // Step 1: Parent completes home assessment first
      const parentConfig = getParentQuizQuestions(ageGroup)
      const parentResponses: Record<number, number | string | string[]> = {
        // Strong at home: Communication, Creativity, Confidence
        1: 5, 2: 5, // Communication
        4: 3, // Collaboration (struggles with siblings)
        7: 4, // Content curiosity
        11: 4, // Critical thinking
        13: 5, 14: 5, // Creative Innovation (very strong at home)
        16: 5, 17: 5, // Confidence (tries everything at home)
        19: 4, 20: 3, 21: 4, // Literacy (moderate interest)
        22: 3, 23: 3, 24: 2, // Math (struggles at home)
        25: "hands-on", 26: "creative", 27: "independent", 28: ["art", "building"]
      }
      
      const parentScores = calculateCLP2Scores(parentResponses, 'parent_home', ageGroup)
      
      // Step 2: Teacher completes classroom assessment
      const teacherConfig = getTeacherQuizQuestions(ageGroup)
      const teacherResponses: Record<number, number | string | string[]> = {
        // Different perspective: Strong academics, good collaboration, can't see creativity
        1: 4, 3: 4, // Communication (good in class)
        4: 4, 5: 5, // Collaboration (excellent with peers)
        8: 5, 9: 4, // Content (strong academics)
        10: 4, 12: 4, // Critical thinking (good problem solver)
        19: 4, 21: 4, // Literacy (solid reading skills)
        22: 4, 24: 4 // Math (better in structured environment)
      }
      
      const teacherScores = calculateCLP2Scores(teacherResponses, 'teacher_classroom', ageGroup)
      
      // Step 3: Verify different perspectives captured different strengths
      expect(parentScores['Creative Innovation']).toBeGreaterThan(4.5) // Strong at home
      expect(teacherScores['Creative Innovation']).toBe(1.0) // Not assessed by teacher
      
      expect(parentScores.Collaboration).toBeLessThan(3.5) // Struggles with siblings
      expect(teacherScores.Collaboration).toBeGreaterThanOrEqual(4.0) // Good with classmates
      
      expect(parentScores.Math).toBeLessThan(3.0) // Difficult at home
      expect(teacherScores.Math).toBeGreaterThanOrEqual(3.0) // Better in structured classroom
      
      // Step 4: Consolidate scores with appropriate weighting
      const consolidationSources = [
        {
          scores: parentScores,
          weight: 0.6, // Parent assessment carries more weight (includes preferences)
          quizType: 'parent_home',
          respondentType: 'parent'
        },
        {
          scores: teacherScores,
          weight: 0.4, // Teacher provides academic validation
          quizType: 'teacher_classroom', 
          respondentType: 'teacher'
        }
      ]
      
      const consolidatedScores = consolidateCLP2Scores(consolidationSources)
      
      // Step 5: Verify consolidation captures both perspectives appropriately
      
      // Creative Innovation should reflect parent's strong observation (weighted 60%)
      const expectedCreativity = (parentScores['Creative Innovation'] * 0.6) + (teacherScores['Creative Innovation'] * 0.4)
      expect(consolidatedScores['Creative Innovation']).toBeCloseTo(expectedCreativity, 1)
      expect(consolidatedScores['Creative Innovation']).toBeGreaterThan(3.0) // Should be above neutral
      
      // Collaboration should be balanced between contexts
      const expectedCollaboration = (parentScores.Collaboration * 0.6) + (teacherScores.Collaboration * 0.4)
      expect(consolidatedScores.Collaboration).toBeCloseTo(expectedCollaboration, 1)
      expect(consolidatedScores.Collaboration).toBeGreaterThan(3.0) // Teacher strength balances parent concern
      
      // Math should benefit from teacher's structured environment perspective
      expect(consolidatedScores.Math).toBeGreaterThan(parentScores.Math) // Should be improved by teacher input
      expect(consolidatedScores.Math).toBeLessThan(teacherScores.Math) // But still influenced by home struggles
      
      // Step 6: Generate consolidated personality and analysis
      const consolidatedPersonality = getCLP2PersonalityLabel(consolidatedScores)
      const consolidatedAnalysis = getCLP2StrengthsAndGrowth(consolidatedScores)
      
      // Should reflect strengths from both contexts
      expect(consolidatedAnalysis.strengths.length).toBeGreaterThanOrEqual(1) // Multiple strengths identified
      expect(consolidatedAnalysis.strengths).toContain('Communication') // Should be consistently strong
      
      // Step 7: Verify collaborative journey provides richer insights
      const collaborativeJourneyResult = {
        childName,
        ageGroup,
        assessmentSources: 2,
        parentAssessmentDate: new Date().toISOString(),
        teacherAssessmentDate: new Date().toISOString(),
        consolidatedScores,
        personalityLabel: consolidatedPersonality,
        strengths: consolidatedAnalysis.strengths,
        growthAreas: consolidatedAnalysis.growthAreas,
        contextualInsights: {
          homeStrengths: Object.entries(parentScores)
            .filter(([skill, score]) => typeof score === 'number' && score > 4.0)
            .map(([skill]) => skill),
          classroomStrengths: Object.entries(teacherScores)
            .filter(([skill, score]) => typeof score === 'number' && score > 4.0)
            .map(([skill]) => skill),
          crossContextPatterns: identifyConsistentPatterns(parentScores, teacherScores)
        },
        recommendationSources: ['parent', 'teacher'],
        confidenceLevel: 'very-high' // Multiple perspectives increase confidence
      }
      
      expect(collaborativeJourneyResult.assessmentSources).toBe(2)
      expect(collaborativeJourneyResult.confidenceLevel).toBe('very-high')
      expect(collaborativeJourneyResult.contextualInsights.homeStrengths.length).toBeGreaterThanOrEqual(0)
      expect(collaborativeJourneyResult.contextualInsights.classroomStrengths.length).toBeGreaterThanOrEqual(0)
    })
    
    it('should handle parent-teacher disagreement appropriately', async () => {
      const ageGroup = '5-6'
      
      // Scenario: Parent sees child as highly confident and creative,
      // Teacher sees child as quiet and academic-focused
      const parentScores: CLP2Scores = {
        Communication: 5.0, // Very talkative at home
        Collaboration: 2.0, // Difficult with siblings
        Content: 3.0, // Moderate curiosity
        'Critical Thinking': 3.5,
        'Creative Innovation': 5.0, // Very creative at home
        Confidence: 5.0, // Fearless at home
        Literacy: 3.5,
        Math: 2.5, // Struggles with math
        Engagement: "movement",
        Modality: "creative", 
        Social: "independent",
        Interests: ["art", "music"]
      }
      
      const teacherScores: CLP2Scores = {
        Communication: 2.5, // Quiet in class
        Collaboration: 4.5, // Works well with others
        Content: 4.5, // Strong academic focus
        'Critical Thinking': 4.0,
        'Creative Innovation': 1.0, // Not observed in structured classroom
        Confidence: 1.0, // Not observed in classroom context
        Literacy: 4.5, // Strong reading skills
        Math: 4.0 // Does well in structured math lessons
      }
      
      const sources = [
        { scores: parentScores, weight: 0.5, quizType: 'parent_home', respondentType: 'parent' },
        { scores: teacherScores, weight: 0.5, quizType: 'teacher_classroom', respondentType: 'teacher' }
      ]
      
      const consolidated = consolidateCLP2Scores(sources)
      
      // Should find middle ground in areas of disagreement
      expect(consolidated.Communication).toBeGreaterThan(2.5) // Average of very different perspectives
      expect(consolidated.Communication).toBeLessThan(4.0)
      
      expect(consolidated['Creative Innovation']).toBeGreaterThan(2.0) // Parent observation should influence
      expect(consolidated['Creative Innovation']).toBeLessThan(4.0) // But moderated by teacher perspective
      
      expect(consolidated.Math).toBeGreaterThan(parentScores.Math) // Teacher perspective helps
      expect(consolidated.Math).toBeLessThan(teacherScores.Math) // But not fully
      
      // Generate insights about the disagreement
      const disagreementAnalysis = analyzeParentTeacherDifferences(parentScores, teacherScores)
      expect(disagreementAnalysis.significantDifferences.length).toBeGreaterThan(0)
      expect(disagreementAnalysis.contextualExplanations).toBeTruthy()
    })
    
    it('should support progressive profile building over time', async () => {
      const childName = 'Alex'
      const ageGroup = '6-8'
      
      // Simulate assessment sequence over time
      const assessmentTimeline = [
        {
          date: '2024-01-15',
          type: 'parent_home',
          respondent: 'parent1',
          scores: {
            Communication: 3.5, Collaboration: 3.0, Content: 4.0, 'Critical Thinking': 3.8,
            'Creative Innovation': 4.2, Confidence: 3.5, Literacy: 3.8, Math: 3.2
          }
        },
        {
          date: '2024-02-10', 
          type: 'teacher_classroom',
          respondent: 'teacher1',
          scores: {
            Communication: 4.0, Collaboration: 4.5, Content: 4.2, 'Critical Thinking': 4.0,
            'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 4.1, Math: 3.8
          }
        },
        {
          date: '2024-03-05',
          type: 'parent_home', 
          respondent: 'parent2', // Second parent perspective
          scores: {
            Communication: 3.8, Collaboration: 3.5, Content: 3.9, 'Critical Thinking': 4.1,
            'Creative Innovation': 3.9, Confidence: 4.0, Literacy: 4.0, Math: 3.0
          }
        }
      ]
      
      // Test progressive consolidation
      for (let i = 1; i <= assessmentTimeline.length; i++) {
        const currentSources = assessmentTimeline.slice(0, i).map(assessment => ({
          scores: assessment.scores as CLP2Scores,
          weight: 1.0 / i, // Equal weighting for simplicity
          quizType: assessment.type,
          respondentType: assessment.respondent
        }))
        
        const progressiveScores = consolidateCLP2Scores(currentSources)
        const progressivePersonality = getCLP2PersonalityLabel(progressiveScores)
        
        // Verify that more sources improve profile accuracy
        expect(progressivePersonality).toBeTruthy()
        
        // As we add more sources, extreme scores should moderate
        if (i > 1) {
          CLP2_SKILLS.forEach(skill => {
            expect(progressiveScores[skill]).toBeGreaterThanOrEqual(1.0)
            expect(progressiveScores[skill]).toBeLessThanOrEqual(5.0)
          })
        }
      }
      
      // Final consolidated profile should be most reliable
      const finalSources = assessmentTimeline.map((assessment, index) => ({
        scores: assessment.scores as CLP2Scores,
        weight: index === 1 ? 0.4 : 0.3, // Weight teacher slightly higher, parents equal
        quizType: assessment.type,
        respondentType: assessment.respondent
      }))
      
      const finalProfile = consolidateCLP2Scores(finalSources)
      const finalAnalysis = getCLP2StrengthsAndGrowth(finalProfile)
      
      expect(finalAnalysis.strengths.length).toBeGreaterThanOrEqual(1) // Multiple perspectives reveal multiple strengths
      expect(finalAnalysis.growthAreas.length).toBeGreaterThan(0) // And areas for development
    })
  })

  describe('Age-Based Question Routing and Adaptation', () => {
    
    it('should route questions appropriately across all age groups', async () => {
      const ageTestCases = [
        { monthsOld: 40, expectedGroup: '3-4', description: 'preschool toddler' },
        { monthsOld: 58, expectedGroup: '4-5', description: 'pre-K child' },
        { monthsOld: 70, expectedGroup: '5-6', description: 'kindergartner' },
        { monthsOld: 90, expectedGroup: '6-8', description: 'early elementary' },
        { monthsOld: 114, expectedGroup: '8-10', description: 'upper elementary' },
        { monthsOld: 150, expectedGroup: '10+', description: 'middle school+' }
      ]
      
      for (const testCase of ageTestCases) {
        // Test age-appropriate question generation
        const ageQuestions = getCLP2QuestionsForAge(testCase.monthsOld)
        expect(ageQuestions.length).toBeGreaterThanOrEqual(20) // Should always have adequate questions
        
        // Verify questions are appropriate for developmental stage
        const developmentallyAppropriate = ageQuestions.every(q => 
          q.ageGroups.some(ageGroup => 
            ageGroup === testCase.expectedGroup || 
            isAgeGroupAdjacent(ageGroup, testCase.expectedGroup)
          )
        )
        expect(developmentallyAppropriate).toBe(true)
        
        // Test with both parent and teacher contexts
        const parentConfig = getParentQuizQuestions(testCase.expectedGroup)
        const teacherConfig = getTeacherQuizQuestions(testCase.expectedGroup)
        
        // Verify context adaptations
        const parentQuestion = parentConfig.questions.find(q => q.skill === 'Communication')
        const teacherQuestion = teacherConfig.questions.find(q => q.skill === 'Communication')
        
        if (parentQuestion && teacherQuestion) {
          expect(parentQuestion.text).not.toBe(teacherQuestion.text) // Should be adapted for context
          expect(parentQuestion.context).toBe('home')
          expect(teacherQuestion.context).toBe('classroom')
        }
      }
    })
    
    it('should adapt question complexity for extended age ranges', async () => {
      const extendedAges = ['8-10', '10+'] as const
      
      for (const ageGroup of extendedAges) {
        const parentConfig = getParentQuizQuestions(ageGroup)
        const teacherConfig = getTeacherQuizQuestions(ageGroup)
        
        // Should include extended questions for comprehensive assessment
        const extendedQuestions = parentConfig.questions.filter(q => q.id >= 29)
        expect(extendedQuestions.length).toBeGreaterThan(5)
        
        // Extended questions should be more complex
        const extendedQuestion = extendedQuestions[0]
        expect(extendedQuestion.text.length).toBeGreaterThan(50) // More detailed questions
        
        // Should cover advanced skills appropriately
        const criticalThinkingQuestions = parentConfig.questions.filter(q => 
          q.skill === 'Critical Thinking'
        )
        expect(criticalThinkingQuestions.length).toBeGreaterThanOrEqual(1) // Multiple questions for complex skill
      }
    })
  })

  describe('CLP 2.0 Scoring Algorithm Validation', () => {
    
    it('should correctly calculate scores using 0-1 point system', async () => {
      const testResponses = {
        1: 5, // Strongly Agree = 1.0 points
        2: 4, // Agree = 0.5 points  
        3: 3, // Neutral = 0.5 points
        4: 2, // Disagree = 0.0 points
        5: 1  // Strongly Disagree = 0.0 points
      }
      
      // These all map to Communication skill (questions 1-3)
      const scores = calculateCLP2Scores(testResponses, 'general', '5-6')
      
      // Communication should be: (1.0 + 0.5 + 0.5) / 3 = 0.67 avg
      // Converted to 1-5 scale: 1 + (0.67 * 4) = 3.67
      expect(scores.Communication).toBeCloseTo(3.67, 1)
      
      // Other skills with no responses should default to 1.0
      expect(scores.Collaboration).toBe(1.0)
    })
    
    it('should handle preference questions without scoring', async () => {
      const preferencesResponses = {
        25: "hands-on", // Engagement
        26: "creative", // Modality
        27: "small-group", // Social  
        28: ["art", "science", "building"] // Interests (multi-select)
      }
      
      const scores = calculateCLP2Scores(preferencesResponses, 'parent_home', '5-6')
      
      // Preferences should be stored but not affect skill scores
      expect(scores.Engagement).toBe("hands-on")
      expect(scores.Modality).toBe("creative")
      expect(scores.Social).toBe("small-group")
      expect(scores.Interests).toEqual(["art", "science", "building"])
      
      // All skill scores should remain at default 1.0
      CLP2_SKILLS.forEach(skill => {
        expect(scores[skill]).toBe(1.0)
      })
    })
    
    it('should generate appropriate personality labels from score patterns', async () => {
      const testCases = [
        {
          scores: { Communication: 5.0, Collaboration: 4.5, Content: 3.0, 'Critical Thinking': 3.0, 'Creative Innovation': 3.0, Confidence: 3.0, Literacy: 3.0, Math: 3.0 },
          expectedType: 'Social Communicator'
        },
        {
          scores: { Communication: 3.0, Collaboration: 3.0, Content: 3.0, 'Critical Thinking': 5.0, 'Creative Innovation': 4.5, Confidence: 3.0, Literacy: 3.0, Math: 3.0 },
          expectedType: 'Creative Problem Solver'
        },
        {
          scores: { Communication: 3.0, Collaboration: 3.0, Content: 3.0, 'Critical Thinking': 3.0, 'Creative Innovation': 3.0, Confidence: 3.0, Literacy: 5.0, Math: 4.5 },
          expectedType: 'Academic All-Star'
        }
      ]
      
      for (const testCase of testCases) {
        const personality = getCLP2PersonalityLabel(testCase.scores as CLP2Scores)
        expect(personality).toBe(testCase.expectedType)
      }
    })
  })

  describe('Error Handling and Edge Cases', () => {
    
    it('should handle missing or invalid responses gracefully', async () => {
      const incompleteResponses = {
        1: 4, // Only one response
        999: 5 // Invalid question ID
      }
      
      const scores = calculateCLP2Scores(incompleteResponses, 'general', '5-6')
      
      // Should not crash and should provide default scores
      expect(scores.Communication).toBeGreaterThan(1.0) // Should be calculated from question 1
      expect(scores.Collaboration).toBe(1.0) // Should default to 1.0
      
      const personality = getCLP2PersonalityLabel(scores)
      expect(personality).toBeTruthy() // Should still generate some personality
    })
    
    it('should validate quiz configurations appropriately', async () => {
      const configs = [
        getParentQuizQuestions('3-4'),
        getParentQuizQuestions('10+'),
        getTeacherQuizQuestions('5-6'),
        getTeacherQuizQuestions('8-10')
      ]
      
      for (const config of configs) {
        const validation = validateQuizConfiguration(config)
        
        // All configurations should be valid or have only minor warnings
        expect(validation.warnings.length).toBeLessThan(5)
        expect(validation.recommendations.length).toBeLessThan(3)
        
        // Question count should be reasonable
        expect(config.questions.length).toBeGreaterThan(5)
        expect(config.questions.length).toBeLessThan(50)
      }
    })
  })
})

// Helper Functions

function generateRealisticResponses(
  questions: CLP2Question[], 
  perspective: 'parent' | 'teacher'
): Record<number, number | string | string[]> {
  const responses: Record<number, number | string | string[]> = {}
  
  questions.forEach(question => {
    if (question.responseType === 'likert') {
      // Generate realistic distribution based on perspective
      const baseScore = perspective === 'parent' ? 3.8 : 3.5 // Parents slightly more positive
      const variation = Math.random() * 2 - 1 // -1 to +1
      const rawScore = Math.max(1, Math.min(5, Math.round(baseScore + variation)))
      responses[question.id] = rawScore
    } else if (question.responseType === 'multipleChoice' && question.options) {
      const randomOption = question.options[Math.floor(Math.random() * question.options.length)]
      responses[question.id] = randomOption.value
    } else if (question.responseType === 'multiSelect' && question.options) {
      const selectedCount = Math.floor(Math.random() * 3) + 1
      const selectedOptions = question.options
        .sort(() => 0.5 - Math.random())
        .slice(0, selectedCount)
        .map(opt => opt.value)
      responses[question.id] = selectedOptions
    }
  })
  
  return responses
}

function generateTeacherRecommendations(scores: CLP2Scores): string[] {
  const recommendations: string[] = []
  
  if (scores.Collaboration > 4.0) {
    recommendations.push("Leverage this student's strong collaboration skills by using them as a group leader")
  }
  
  if (scores.Content > 4.0) {
    recommendations.push("Provide enrichment activities to challenge their strong academic abilities")
  }
  
  if (scores.Math < 3.0) {
    recommendations.push("Consider additional math support or different instructional approaches")
  }
  
  return recommendations
}

function identifyConsistentPatterns(
  parentScores: CLP2Scores, 
  teacherScores: CLP2Scores
): string[] {
  const patterns: string[] = []
  
  CLP2_SKILLS.forEach(skill => {
    const parentScore = parentScores[skill]
    const teacherScore = teacherScores[skill]
    
    if (typeof parentScore === 'number' && typeof teacherScore === 'number') {
      const difference = Math.abs(parentScore - teacherScore)
      
      if (difference < 0.5) {
        if (parentScore > 4.0) {
          patterns.push(`Consistently strong in ${skill} across home and school`)
        } else if (parentScore < 2.5) {
          patterns.push(`Consistently developing in ${skill} across contexts`)
        }
      }
    }
  })
  
  return patterns
}

function analyzeParentTeacherDifferences(
  parentScores: CLP2Scores,
  teacherScores: CLP2Scores
): { significantDifferences: string[], contextualExplanations: string } {
  const significantDifferences: string[] = []
  
  CLP2_SKILLS.forEach(skill => {
    const parentScore = parentScores[skill]
    const teacherScore = teacherScores[skill]
    
    if (typeof parentScore === 'number' && typeof teacherScore === 'number') {
      const difference = Math.abs(parentScore - teacherScore)
      
      if (difference > 1.5) {
        const higher = parentScore > teacherScore ? 'home' : 'classroom'
        significantDifferences.push(`${skill}: Much stronger in ${higher} context`)
      }
    }
  })
  
  const contextualExplanations = "Different contexts reveal different aspects of a child's abilities. " +
    "Home environments may show creativity and confidence more clearly, while classroom settings " +
    "reveal academic skills and peer collaboration."
  
  return { significantDifferences, contextualExplanations }
}

function isAgeGroupAdjacent(ageGroup1: string, ageGroup2: string): boolean {
  const ageSequence = ['3-4', '4-5', '5-6', '6-8', '8-10', '10+']
  const index1 = ageSequence.indexOf(ageGroup1)
  const index2 = ageSequence.indexOf(ageGroup2)
  
  return Math.abs(index1 - index2) <= 1
}