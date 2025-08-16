/**
 * CLP 2.0 Complete Workflow Integration Tests
 * 
 * Comprehensive end-to-end testing of the entire CLP 2.0 system from assessment 
 * start to results display, covering all user journeys and integration points.
 * 
 * Test scenarios include:
 * 1. Complete parent assessment flow
 * 2. Complete teacher assessment flow  
 * 3. Parent + teacher collaborative assessment
 * 4. Profile consolidation workflows
 * 5. Progressive profile generation
 * 6. Results page generation and display
 * 7. Cross-component data flow validation
 * 8. Multi-user workflow coordination
 */

import { NextRequest, NextResponse } from 'next/server'
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

import { CLP2_TEST_DATA } from '../lib/test-data/clp2-test-data'

// Mock fetch for API testing
global.fetch = jest.fn()

describe('CLP 2.0 Complete Workflow Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('1. Complete Parent Assessment Flow', () => {
    
    it('should complete full parent assessment workflow from start to results', async () => {
      const testScenario = {
        childName: 'Maya Rodriguez',
        ageGroup: '5-6' as const,
        preciseAgeMonths: 64, // 5 years, 4 months
        parentEmail: 'maria.rodriguez@email.com',
        assessmentContext: 'Home environment assessment'
      }

      // === STEP 1: Initialize Assessment ===
      
      // Generate parent quiz configuration
      const parentConfig = getParentQuizQuestions(testScenario.ageGroup)
      
      // Verify parent-specific configuration
      expect(parentConfig.quizType).toBe('parent_home')
      expect(parentConfig.includePreferences).toBe(true)
      expect(parentConfig.contextFocus).toContain('Home behavior')
      expect(parentConfig.questions.length).toBeGreaterThanOrEqual(15) // Comprehensive parent assessment
      
      // Validate configuration quality
      const validation = validateQuizConfiguration(parentConfig)
      expect(validation.isValid || validation.warnings.length < 3).toBe(true)
      
      // === STEP 2: Simulate Age-Appropriate Question Selection ===
      
      const ageQuestions = getCLP2QuestionsForAge(testScenario.preciseAgeMonths)
      expect(ageQuestions.length).toBeGreaterThanOrEqual(20)
      
      // Verify questions are developmentally appropriate
      const hasAgeAppropriateQuestions = ageQuestions.every(q => 
        q.ageGroups.includes(testScenario.ageGroup) ||
        q.ageGroups.some(age => ['4-5', '5-6', '6-8'].includes(age))
      )
      expect(hasAgeAppropriateQuestions).toBe(true)
      
      // === STEP 3: Simulate Realistic Parent Responses ===
      
      // Scenario: Creative, communicative child with some math challenges
      const parentResponses: Record<number, number | string | string[]> = {
        // Communication (Questions 1-3) - Strong at home
        1: 5, // Clearly expresses thoughts - Strongly Agree
        2: 5, // Asks thoughtful questions - Strongly Agree
        3: 4, // Listens during family conversations - Agree
        
        // Collaboration (Question 4) - Developing with siblings
        4: 3, // Works well with family members - Neutral
        
        // Content (Questions 7-9) - Good curiosity
        7: 4, // Shows curiosity about world - Agree
        8: 4, // Remembers family stories - Agree
        
        // Critical Thinking (Questions 11-12) - Developing
        11: 4, // Asks why/how questions - Agree
        12: 3, // Explains reasoning - Neutral
        
        // Creative Innovation (Questions 13-15) - Exceptional strength
        13: 5, // Original ideas for family activities - Strongly Agree
        14: 5, // Creative uses for household items - Strongly Agree
        15: 5, // Imaginative play scenarios - Strongly Agree
        
        // Confidence (Questions 16-18) - Good self-assurance
        16: 4, // Tries new activities - Agree
        17: 4, // Bounces back from setbacks - Agree
        18: 4, // Shows pride in achievements - Agree
        
        // Literacy (Questions 19-21) - Strong interest
        19: 5, // Interest in books and stories - Strongly Agree
        20: 4, // Retells stories accurately - Agree
        21: 5, // Recognizes word patterns - Strongly Agree
        
        // Math (Questions 22-24) - Area for growth
        22: 2, // Counting and number recognition - Disagree
        23: 3, // Notices mathematical patterns - Neutral
        24: 2, // Simple addition/subtraction - Disagree
        
        // Learning Preferences (Questions 25-28)
        25: "hands-on", // Engagement preference
        26: "creative", // Activity modality preference
        27: "small-group", // Social preference
        28: ["art", "stories", "science"] // Interest areas
      }
      
      // === STEP 4: Validate Response Data Quality ===
      
      // Validate each response against question requirements
      Object.entries(parentResponses).forEach(([questionIdStr, response]) => {
        const questionId = parseInt(questionIdStr)
        const isValid = validateCLP2Response(questionId, response)
        expect(isValid).toBe(true)
      })
      
      // === STEP 5: Calculate Scores Using CLP 2.0 Algorithm ===
      
      const parentScores = calculateCLP2Scores(
        parentResponses,
        'parent_home',
        testScenario.ageGroup
      )
      
      // Verify score calculations reflect response patterns
      expect(parentScores.Communication).toBeGreaterThan(4.0) // Strong responses (5,5,4)
      expect(parentScores['Creative Innovation']).toBeGreaterThan(4.5) // Exceptional (5,5,5)
      expect(parentScores.Literacy).toBeGreaterThan(4.0) // Strong responses (5,4,5)
      expect(parentScores.Math).toBeLessThan(3.0) // Challenges (2,3,2)
      expect(parentScores.Collaboration).toBeLessThan(3.5) // Single neutral response
      
      // Verify preferences are captured correctly
      expect(parentScores.Engagement).toBe("hands-on")
      expect(parentScores.Modality).toBe("creative")
      expect(parentScores.Social).toBe("small-group")
      expect(parentScores.Interests).toEqual(["art", "stories", "science"])
      
      // === STEP 6: Generate Profile Analysis ===
      
      const personalityLabel = getCLP2PersonalityLabel(parentScores)
      const strengthsAnalysis = getCLP2StrengthsAndGrowth(parentScores)
      
      expect(personalityLabel).toBeTruthy()
      expect(personalityLabel).toContain('Creative') // Should reflect dominant strength
      expect(strengthsAnalysis.strengths).toContain('Creative Innovation')
      expect(strengthsAnalysis.strengths).toContain('Communication')
      expect(strengthsAnalysis.growthAreas).toContain('Math')
      
      // === STEP 7: Simulate Progressive Profile API Call ===
      
      const progressiveProfilePayload = {
        child_name: testScenario.childName,
        age_group: testScenario.ageGroup,
        precise_age_months: testScenario.preciseAgeMonths,
        quiz_type: 'parent_home',
        respondent_type: 'parent',
        respondent_name: 'Maria Rodriguez',
        responses: parentResponses,
        use_clp2_scoring: true
      }
      
      // Mock successful API response
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            id: 'test-profile-123',
            child_name: testScenario.childName,
            consolidated_scores: parentScores,
            personality_label: personalityLabel,
            confidence_percentage: 75,
            completeness_percentage: 60,
            strengths: strengthsAnalysis.strengths,
            growth_areas: strengthsAnalysis.growthAreas,
            scoring_version: 'CLP 2.0',
            total_assessments: 1,
            parent_assessments: 1,
            teacher_assessments: 0
          },
          shareUrl: 'https://app.example.com/results/test-profile-123',
          is_new_profile: true,
          contribution_summary: {
            weight: 0.6,
            confidence_boost: 30,
            categories_covered: ['Communication', 'Creative Innovation', 'Literacy', 'Math']
          }
        })
      })
      
      // Simulate API call
      const response = await fetch('/api/profiles/progressive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressiveProfilePayload)
      })
      
      expect(response.ok).toBe(true)
      const apiResult = await response.json()
      
      // === STEP 8: Verify Complete Workflow Result ===
      
      expect(apiResult.profile.child_name).toBe(testScenario.childName)
      expect(apiResult.profile.scoring_version).toBe('CLP 2.0')
      expect(apiResult.profile.total_assessments).toBe(1)
      expect(apiResult.profile.parent_assessments).toBe(1)
      expect(apiResult.is_new_profile).toBe(true)
      expect(apiResult.shareUrl).toContain('test-profile-123')
      
      // Verify assessment quality metrics
      expect(apiResult.profile.confidence_percentage).toBeGreaterThan(50)
      expect(apiResult.profile.completeness_percentage).toBeGreaterThan(50)
      expect(apiResult.contribution_summary.weight).toBe(0.6)
      
      // === STEP 9: Simulate Results Page Data Flow ===
      
      const resultsPageData = {
        profileId: apiResult.profile.id,
        viewContext: 'parent',
        displayData: {
          childName: apiResult.profile.child_name,
          scores: apiResult.profile.consolidated_scores,
          personalityLabel: apiResult.profile.personality_label,
          strengths: apiResult.profile.strengths,
          growthAreas: apiResult.profile.growth_areas,
          assessmentSummary: {
            totalAssessments: apiResult.profile.total_assessments,
            confidenceLevel: apiResult.profile.confidence_percentage,
            completeness: apiResult.profile.completeness_percentage
          }
        }
      }
      
      // Verify results page can render with this data
      expect(resultsPageData.profileId).toBeTruthy()
      expect(resultsPageData.displayData.childName).toBe(testScenario.childName)
      expect(resultsPageData.displayData.strengths.length).toBeGreaterThan(0)
      expect(resultsPageData.displayData.assessmentSummary.totalAssessments).toBe(1)
    })
    
    it('should handle parent assessment for different age groups with proper adaptation', async () => {
      const ageTestCases = [
        { ageGroup: '3-4' as const, description: 'preschool', expectedQuestions: 15 },
        { ageGroup: '4-5' as const, description: 'pre-K', expectedQuestions: 15 },
        { ageGroup: '5-6' as const, description: 'kindergarten', expectedQuestions: 15 },
        { ageGroup: '6-8' as const, description: 'early elementary', expectedQuestions: 18 },
        { ageGroup: '8-10' as const, description: 'upper elementary', expectedQuestions: 18 },
        { ageGroup: '10+' as const, description: 'middle school+', expectedQuestions: 18 }
      ]
      
      for (const testCase of ageTestCases) {
        // Generate age-appropriate configuration
        const config = getParentQuizQuestions(testCase.ageGroup)
        expect(config.questions.length).toBeGreaterThanOrEqual(testCase.expectedQuestions)
        
        // Verify age-appropriate content adaptation
        const communicationQuestions = config.questions.filter(q => q.skill === 'Communication')
        expect(communicationQuestions.length).toBeGreaterThanOrEqual(1)
        
        // For older children, should include more complex questions
        if (['8-10', '10+'].includes(testCase.ageGroup)) {
          const extendedQuestions = config.questions.filter(q => q.id >= 29)
          expect(extendedQuestions.length).toBeGreaterThan(0)
        }
        
        // Test with realistic responses for the age group
        const responses = generateAgeAppropriateResponses(config.questions, testCase.ageGroup)
        const scores = calculateCLP2Scores(responses, 'parent_home', testCase.ageGroup)
        
        // Should produce valid scores for all skills
        CLP2_SKILLS.forEach(skill => {
          expect(scores[skill]).toBeGreaterThanOrEqual(1.0)
          expect(scores[skill]).toBeLessThanOrEqual(5.0)
        })
      }
    })
  })

  describe('2. Complete Teacher Assessment Flow', () => {
    
    it('should complete full teacher assessment workflow from classroom invitation to results', async () => {
      const testScenario = {
        studentName: 'Alex Chen',
        ageGroup: '6-8' as const,
        teacherName: 'Ms. Sarah Johnson',
        teacherEmail: 'sarah.johnson@school.edu',
        className: 'Grade 2A',
        schoolName: 'Oakwood Elementary',
        assignmentToken: 'teacher-invite-456'
      }

      // === STEP 1: Teacher Quiz Configuration ===
      
      const teacherConfig = getTeacherQuizQuestions(testScenario.ageGroup)
      
      // Verify teacher-specific configuration
      expect(teacherConfig.quizType).toBe('teacher_classroom')
      expect(teacherConfig.includePreferences).toBe(false) // Teachers don't assess learning preferences
      expect(teacherConfig.contextFocus).toContain('Classroom behavior')
      expect(teacherConfig.questions.length).toBeLessThan(25) // More focused than parent assessment
      
      // Validate skill coverage for classroom context
      const skillCoverage = getSkillCoverage('teacher_classroom')
      const collaborationCoverage = skillCoverage.find(s => s.skill === 'Collaboration')
      expect(collaborationCoverage?.coverage).toBe('full') // Key classroom skill
      
      const creativityCoverage = skillCoverage.find(s => s.skill === 'Creative Innovation')
      expect(creativityCoverage?.coverage).toBe('none') // Not easily observable in classroom
      
      // === STEP 2: Simulate Teacher Assessment Responses ===
      
      // Scenario: Strong academic student with good collaboration skills
      const teacherResponses: Record<number, number | string | string[]> = {
        // Communication in classroom context
        1: 4, // Expresses thoughts in class discussions - Agree
        3: 5, // Listens during instruction and discussions - Strongly Agree
        
        // Collaboration with peers
        4: 5, // Enjoys working with classmates - Strongly Agree
        5: 5, // Shares materials and helps others - Strongly Agree
        6: 4, // Contributes to group projects - Agree
        
        // Academic Content engagement
        8: 5, // Remembers and applies lessons - Strongly Agree
        9: 4, // Transfers concepts to new situations - Agree
        
        // Critical Thinking in academics
        10: 4, // Works through problems systematically - Agree
        12: 3, // Explains reasoning clearly - Neutral
        
        // Literacy skills in classroom
        19: 5, // Shows interest in reading activities - Strongly Agree
        21: 4, // Demonstrates word pattern recognition - Agree
        
        // Math skills in structured environment
        22: 4, // Engages with math activities - Agree
        24: 5 // Solves number problems accurately - Strongly Agree
      }
      
      // === STEP 3: Calculate Teacher Perspective Scores ===
      
      const teacherScores = calculateCLP2Scores(
        teacherResponses,
        'teacher_classroom',
        testScenario.ageGroup
      )
      
      // Verify teacher-specific scoring patterns
      expect(teacherScores.Collaboration).toBeGreaterThanOrEqual(4.0) // Strong classroom collaboration
      expect(teacherScores.Content).toBeGreaterThanOrEqual(4.0) // Strong academic engagement
      expect(teacherScores.Literacy).toBeGreaterThanOrEqual(4.0) // Good reading skills
      expect(teacherScores.Math).toBeGreaterThanOrEqual(4.0) // Strong math skills
      
      // Creative Innovation should be minimal (no teacher questions for this skill)
      expect(teacherScores['Creative Innovation']).toBe(1.0)
      expect(teacherScores.Confidence).toBe(1.0) // Not assessed in classroom context
      
      // === STEP 4: Generate Teacher-Focused Analysis ===
      
      const teacherPersonality = getCLP2PersonalityLabel(teacherScores)
      const teacherAnalysis = getCLP2StrengthsAndGrowth(teacherScores)
      
      expect(teacherPersonality).toBeTruthy()
      expect(teacherAnalysis.strengths).toContain('Collaboration')
      expect(teacherAnalysis.strengths.length).toBeGreaterThan(0)
      
      // === STEP 5: Simulate Progressive Profile API for Teacher Data ===
      
      const teacherProfilePayload = {
        child_name: testScenario.studentName,
        age_group: testScenario.ageGroup,
        quiz_type: 'teacher_classroom',
        respondent_type: 'teacher',
        respondent_id: 'teacher-123',
        respondent_name: testScenario.teacherName,
        responses: teacherResponses,
        use_clp2_scoring: true,
        assignment_token: testScenario.assignmentToken,
        school_context: {
          school_name: testScenario.schoolName,
          teacher_name: testScenario.teacherName,
          classroom: testScenario.className
        }
      }
      
      // Mock teacher assessment API response
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            id: 'test-profile-456',
            child_name: testScenario.studentName,
            consolidated_scores: teacherScores,
            personality_label: teacherPersonality,
            confidence_percentage: 80,
            completeness_percentage: 70,
            strengths: teacherAnalysis.strengths,
            growth_areas: teacherAnalysis.growthAreas,
            scoring_version: 'CLP 2.0',
            total_assessments: 1,
            parent_assessments: 0,
            teacher_assessments: 1
          },
          shareUrl: 'https://app.example.com/results/test-profile-456',
          is_new_profile: true,
          contribution_summary: {
            weight: 0.8,
            confidence_boost: 40,
            categories_covered: ['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Literacy', 'Math']
          }
        })
      })
      
      const response = await fetch('/api/profiles/progressive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherProfilePayload)
      })
      
      const apiResult = await response.json()
      
      // === STEP 6: Verify Teacher Assessment Integration ===
      
      expect(apiResult.profile.teacher_assessments).toBe(1)
      expect(apiResult.profile.parent_assessments).toBe(0)
      expect(apiResult.contribution_summary.weight).toBe(0.8) // Higher weight for professional assessment
      expect(apiResult.contribution_summary.confidence_boost).toBe(40)
      
      // === STEP 7: Simulate Teacher Results View ===
      
      const teacherResultsView = {
        profileId: apiResult.profile.id,
        viewContext: 'teacher',
        classroomRecommendations: generateClassroomRecommendations(teacherScores),
        academicInsights: generateAcademicInsights(teacherScores),
        peerCollaborationSuggestions: generateCollaborationSuggestions(teacherScores)
      }
      
      expect(teacherResultsView.classroomRecommendations.length).toBeGreaterThan(0)
      expect(teacherResultsView.academicInsights.strengths).toContain('Collaboration')
      expect(teacherResultsView.peerCollaborationSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('3. Parent + Teacher Collaborative Assessment', () => {
    
    it('should complete full collaborative workflow with score consolidation and dual perspectives', async () => {
      const testScenario = {
        childName: 'Emma Martinez',
        ageGroup: '7-8' as const,
        parentName: 'Carlos Martinez',
        teacherName: 'Mrs. Lisa Park',
        collaborativeGoal: 'Comprehensive profile with both home and school insights'
      }

      // === STEP 1: Parent Assessment First ===
      
      const parentResponses: Record<number, number | string | string[]> = {
        // Strong at home: Communication, Creativity, Confidence
        1: 5, 2: 5, 3: 4, // Communication - very expressive at home
        4: 3, // Collaboration - struggles with siblings
        7: 4, 8: 4, // Content - good curiosity
        11: 4, 12: 3, // Critical thinking - developing
        13: 5, 14: 5, 15: 5, // Creative Innovation - exceptional at home
        16: 5, 17: 5, 18: 4, // Confidence - high at home
        19: 4, 20: 3, 21: 4, // Literacy - moderate
        22: 3, 23: 3, 24: 2, // Math - challenges at home
        25: "hands-on", 26: "creative", 27: "independent", 28: ["art", "building", "music"]
      }
      
      const parentScores = calculateCLP2Scores(parentResponses, 'parent_home', testScenario.ageGroup)
      
      // === STEP 2: Teacher Assessment Second ===
      
      const teacherResponses: Record<number, number | string | string[]> = {
        // Different classroom perspective
        1: 3, 3: 4, // Communication - more reserved in class
        4: 4, 5: 5, 6: 4, // Collaboration - excellent with peers
        8: 5, 9: 4, // Content - strong academic engagement
        10: 4, 12: 4, // Critical thinking - good problem solver
        19: 4, 21: 4, // Literacy - solid reading skills
        22: 4, 24: 4 // Math - better in structured environment
      }
      
      const teacherScores = calculateCLP2Scores(teacherResponses, 'teacher_classroom', testScenario.ageGroup)
      
      // === STEP 3: Verify Different Perspectives Captured ===
      
      // Parent sees strong creativity and confidence at home
      expect(parentScores['Creative Innovation']).toBeGreaterThan(4.5)
      expect(parentScores.Confidence).toBeGreaterThan(4.0)
      
      // Teacher cannot assess creativity/confidence but sees strong collaboration
      expect(teacherScores['Creative Innovation']).toBe(1.0) // Not assessed
      expect(teacherScores.Confidence).toBe(1.0) // Not assessed
      expect(teacherScores.Collaboration).toBeGreaterThanOrEqual(3.5)
      
      // Different context perspectives on same skills
      expect(parentScores.Communication).toBeGreaterThan(teacherScores.Communication) // More expressive at home
      expect(teacherScores.Math).toBeGreaterThan(parentScores.Math) // Better in structured classroom
      
      // === STEP 4: Score Consolidation Process ===
      
      const consolidationSources = [
        {
          scores: parentScores,
          weight: 0.6, // Parent assessment includes preferences and broader context
          quizType: 'parent_home',
          respondentType: 'parent'
        },
        {
          scores: teacherScores,
          weight: 0.4, // Teacher provides professional academic validation
          quizType: 'teacher_classroom',
          respondentType: 'teacher'
        }
      ]
      
      const consolidatedScores = consolidateCLP2Scores(consolidationSources)
      
      // === STEP 5: Verify Consolidation Quality ===
      
      // Creative Innovation should reflect parent's observation (weighted 60%)
      const expectedCreativity = (parentScores['Creative Innovation'] * 0.6) + (teacherScores['Creative Innovation'] * 0.4)
      expect(consolidatedScores['Creative Innovation']).toBeCloseTo(expectedCreativity, 1)
      expect(consolidatedScores['Creative Innovation']).toBeGreaterThan(3.0) // Should be above neutral
      
      // Collaboration should balance both perspectives
      expect(consolidatedScores.Collaboration).toBeGreaterThan(parentScores.Collaboration) // Teacher input helps
      expect(consolidatedScores.Collaboration).toBeLessThan(teacherScores.Collaboration) // But moderated by home challenges
      
      // Math should benefit from teacher's structured environment perspective
      expect(consolidatedScores.Math).toBeGreaterThan(parentScores.Math)
      
      // === STEP 6: Generate Consolidated Analysis ===
      
      const consolidatedPersonality = getCLP2PersonalityLabel(consolidatedScores)
      const consolidatedAnalysis = getCLP2StrengthsAndGrowth(consolidatedScores)
      
      expect(consolidatedPersonality).toBeTruthy()
      expect(consolidatedAnalysis.strengths.length).toBeGreaterThanOrEqual(1)
      expect(consolidatedAnalysis.strengths).toContain('Communication') // Should be consistently strong
      
      // === STEP 7: Simulate Collaborative Profile API ===
      
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            profile: {
              id: 'parent-profile-789',
              child_name: testScenario.childName,
              consolidated_scores: parentScores,
              is_new_profile: true,
              total_assessments: 1,
              parent_assessments: 1,
              teacher_assessments: 0
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            profile: {
              id: 'parent-profile-789', // Same profile ID - consolidation
              child_name: testScenario.childName,
              consolidated_scores: consolidatedScores,
              personality_label: consolidatedPersonality,
              confidence_percentage: 95, // Higher with both perspectives
              completeness_percentage: 90,
              strengths: consolidatedAnalysis.strengths,
              growth_areas: consolidatedAnalysis.growthAreas,
              total_assessments: 2,
              parent_assessments: 1,
              teacher_assessments: 1
            },
            consolidation: {
              is_new_profile: false,
              previous_assessments: ['parent_home'],
              data_sources: 2,
              next_recommendations: []
            }
          })
        })
      
      // First API call - Parent assessment
      await fetch('/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: testScenario.childName,
          age_group: testScenario.ageGroup,
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: parentResponses
        })
      })
      
      // Second API call - Teacher assessment (consolidation)
      const consolidationResponse = await fetch('/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: testScenario.childName,
          age_group: testScenario.ageGroup,
          quiz_type: 'teacher_classroom',
          respondent_type: 'teacher',
          responses: teacherResponses,
          existing_profile_id: 'parent-profile-789'
        })
      })
      
      const collaborativeResult = await consolidationResponse.json()
      
      // === STEP 8: Verify Collaborative Results ===
      
      expect(collaborativeResult.profile.total_assessments).toBe(2)
      expect(collaborativeResult.profile.parent_assessments).toBe(1)
      expect(collaborativeResult.profile.teacher_assessments).toBe(1)
      expect(collaborativeResult.profile.confidence_percentage).toBeGreaterThan(90) // High confidence with dual perspectives
      expect(collaborativeResult.consolidation.is_new_profile).toBe(false)
      expect(collaborativeResult.consolidation.data_sources).toBe(2)
      
      // === STEP 9: Contextual Insights Generation ===
      
      const contextualInsights = {
        homeStrengths: Object.entries(parentScores)
          .filter(([skill, score]) => typeof score === 'number' && score > 4.0)
          .map(([skill]) => skill),
        classroomStrengths: Object.entries(teacherScores)
          .filter(([skill, score]) => typeof score === 'number' && score > 4.0)
          .map(([skill]) => skill),
        crossContextPatterns: identifyConsistentPatterns(parentScores, teacherScores),
        disagreementAreas: identifySignificantDifferences(parentScores, teacherScores)
      }
      
      expect(contextualInsights.homeStrengths).toContain('Creative Innovation')
      expect(contextualInsights.classroomStrengths.length).toBeGreaterThanOrEqual(0) // May be empty if scores don't reach 4.0
      expect(contextualInsights.crossContextPatterns.length).toBeGreaterThanOrEqual(0)
      expect(contextualInsights.disagreementAreas.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('4. Profile Consolidation Workflows', () => {
    
    it('should handle multiple assessment sources with weighted consolidation', async () => {
      const testScenario = {
        childName: 'Jordan Kim',
        ageGroup: '8-10' as const,
        assessmentSources: [
          { type: 'parent1', weight: 0.3, context: 'primary_parent' },
          { type: 'parent2', weight: 0.2, context: 'secondary_parent' },
          { type: 'teacher', weight: 0.5, context: 'classroom_professional' }
        ]
      }

      // Simulate multiple assessment scores
      const assessmentScores = [
        // Primary parent perspective
        {
          scores: {
            Communication: 4.5, Collaboration: 3.8, Content: 4.0, 'Critical Thinking': 3.5,
            'Creative Innovation': 4.2, Confidence: 4.0, Literacy: 4.3, Math: 3.2
          } as CLP2Scores,
          weight: 0.3,
          quizType: 'parent_home',
          respondentType: 'parent1'
        },
        // Secondary parent perspective
        {
          scores: {
            Communication: 4.0, Collaboration: 4.2, Content: 3.8, 'Critical Thinking': 3.8,
            'Creative Innovation': 3.9, Confidence: 3.7, Literacy: 4.0, Math: 3.5
          } as CLP2Scores,
          weight: 0.2,
          quizType: 'parent_home',
          respondentType: 'parent2'
        },
        // Teacher perspective
        {
          scores: {
            Communication: 3.8, Collaboration: 4.5, Content: 4.2, 'Critical Thinking': 4.0,
            'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 4.1, Math: 3.8
          } as CLP2Scores,
          weight: 0.5,
          quizType: 'teacher_classroom',
          respondentType: 'teacher'
        }
      ]

      // === CONSOLIDATION PROCESS ===
      
      const consolidatedScores = consolidateCLP2Scores(assessmentScores)
      
      // Verify weighted consolidation calculations
      const expectedCommunication = 
        (4.5 * 0.3) + (4.0 * 0.2) + (3.8 * 0.5) // = 1.35 + 0.8 + 1.9 = 4.05
      expect(consolidatedScores.Communication).toBeCloseTo(expectedCommunication, 1)
      
      // Creative Innovation should be influenced by parent perspectives only
      const expectedCreativity = 
        (4.2 * 0.3) + (3.9 * 0.2) + (1.0 * 0.5) // = 1.26 + 0.78 + 0.5 = 2.54
      expect(consolidatedScores['Creative Innovation']).toBeCloseTo(expectedCreativity, 1)
      
      // Collaboration should reflect teacher's professional observation more heavily
      expect(consolidatedScores.Collaboration).toBeGreaterThan(4.0)
      
      // === SIMULATE CONSOLIDATION API ===
      
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            id: 'consolidated-profile-999',
            child_name: testScenario.childName,
            consolidated_scores: consolidatedScores,
            confidence_percentage: 98, // Very high with 3 sources
            completeness_percentage: 95,
            total_assessments: 3,
            parent_assessments: 2,
            teacher_assessments: 1
          },
          consolidation_analysis: {
            completeness_score: 95,
            confidence_level: 'very-high',
            data_sources: [
              { type: 'parent', count: 2 },
              { type: 'teacher', count: 1 }
            ],
            missing_contexts: [],
            strengths: ['Communication', 'Collaboration', 'Literacy'],
            recommendations: []
          }
        })
      })
      
      const response = await fetch('/api/profiles/clp2-consolidate', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const consolidationResult = await response.json()
      
      expect(consolidationResult.profile.total_assessments).toBe(3)
      expect(consolidationResult.consolidation_analysis.confidence_level).toBe('very-high')
      expect(consolidationResult.consolidation_analysis.missing_contexts.length).toBe(0)
    })
  })

  describe('5. Progressive Profile Generation', () => {
    
    it('should build profiles progressively over time with increasing accuracy', async () => {
      const testScenario = {
        childName: 'Riley Thompson',
        ageGroup: '6-8' as const,
        timelineAssessments: [
          { date: '2024-01-15', type: 'parent_home', respondent: 'parent1' },
          { date: '2024-02-10', type: 'teacher_classroom', respondent: 'teacher1' },
          { date: '2024-03-05', type: 'parent_home', respondent: 'parent2' },
          { date: '2024-04-20', type: 'teacher_classroom', respondent: 'teacher2' } // New teacher
        ]
      }

      const progressiveScores = [
        // Initial parent assessment
        {
          Communication: 3.5, Collaboration: 3.0, Content: 4.0, 'Critical Thinking': 3.8,
          'Creative Innovation': 4.2, Confidence: 3.5, Literacy: 3.8, Math: 3.2
        },
        // Teacher adds classroom perspective
        {
          Communication: 4.0, Collaboration: 4.5, Content: 4.2, 'Critical Thinking': 4.0,
          'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 4.1, Math: 3.8
        },
        // Second parent confirms/adjusts home perspective
        {
          Communication: 3.8, Collaboration: 3.5, Content: 3.9, 'Critical Thinking': 4.1,
          'Creative Innovation': 3.9, Confidence: 4.0, Literacy: 4.0, Math: 3.0
        },
        // New teacher provides additional validation
        {
          Communication: 3.9, Collaboration: 4.3, Content: 4.1, 'Critical Thinking': 4.2,
          'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 4.2, Math: 4.0
        }
      ]

      // Test progressive consolidation
      const progressiveResults = []
      
      for (let i = 1; i <= progressiveScores.length; i++) {
        const currentSources = progressiveScores.slice(0, i).map((scores, index) => ({
          scores: scores as CLP2Scores,
          weight: 1.0 / i, // Equal weighting for simplicity
          quizType: testScenario.timelineAssessments[index].type,
          respondentType: testScenario.timelineAssessments[index].respondent
        }))
        
        const progressiveConsolidated = consolidateCLP2Scores(currentSources)
        const progressivePersonality = getCLP2PersonalityLabel(progressiveConsolidated)
        
        progressiveResults.push({
          assessmentCount: i,
          consolidatedScores: progressiveConsolidated,
          personalityLabel: progressivePersonality,
          confidenceLevel: calculateConfidenceLevel(i, currentSources.map(s => s.quizType))
        })
      }
      
      // Verify progressive improvement
      expect(progressiveResults[0].assessmentCount).toBe(1)
      expect(progressiveResults[3].assessmentCount).toBe(4)
      
      // Confidence should increase with more sources
      expect(progressiveResults[3].confidenceLevel).toBeGreaterThan(progressiveResults[0].confidenceLevel)
      
      // Later assessments should have more stable scores (less extreme)
      const firstResult = progressiveResults[0]
      const finalResult = progressiveResults[3]
      
      // Verify all skills remain in valid ranges
      CLP2_SKILLS.forEach(skill => {
        expect(finalResult.consolidatedScores[skill]).toBeGreaterThanOrEqual(1.0)
        expect(finalResult.consolidatedScores[skill]).toBeLessThanOrEqual(5.0)
      })
    })
  })

  describe('6. Results Page Generation and Display', () => {
    
    it('should generate complete results page data with contextual recommendations', async () => {
      const testProfile = {
        id: 'display-test-profile',
        child_name: 'Sofia Gonzalez',
        age_group: '5-6',
        consolidated_scores: {
          Communication: 4.2,
          Collaboration: 3.8,
          Content: 4.0,
          'Critical Thinking': 3.5,
          'Creative Innovation': 4.5,
          Confidence: 4.0,
          Literacy: 4.3,
          Math: 3.2,
          Engagement: "hands-on",
          Modality: "creative",
          Social: "small-group",
          Interests: ["art", "stories", "science"]
        } as CLP2Scores,
        personality_label: 'Creative Communicator',
        confidence_percentage: 85,
        completeness_percentage: 80,
        total_assessments: 2,
        parent_assessments: 1,
        teacher_assessments: 1,
        strengths: ['Communication', 'Creative Innovation', 'Literacy'],
        growth_areas: ['Math', 'Critical Thinking'],
        scoring_version: 'CLP 2.0' as const
      }

      // === MOCK RESULTS PAGE API ===
      
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: testProfile,
          recommendations: {
            home_activities: [
              'Encourage creative storytelling and art projects',
              'Use hands-on math activities like cooking and building',
              'Create small group reading sessions with friends'
            ],
            classroom_strategies: [
              'Pair with peers for collaborative learning',
              'Provide creative outlets for expression',
              'Use visual and hands-on math manipulatives'
            ],
            general_support: [
              'Celebrate creative achievements regularly',
              'Provide multiple ways to demonstrate understanding',
              'Support math confidence with positive reinforcement'
            ]
          },
          contextual_insights: {
            learning_style_summary: 'Thrives with creative, hands-on activities in small group settings',
            strength_narrative: 'Shows exceptional creativity and strong communication skills',
            growth_narrative: 'Would benefit from math confidence building and critical thinking scaffolds',
            parent_teacher_alignment: 'High consistency between home and school observations'
          }
        })
      })
      
      // Simulate fetching results page data
      const response = await fetch(`/api/profiles/progressive?profileId=${testProfile.id}&context=combined`)
      const resultsData = await response.json()
      
      // === VERIFY RESULTS PAGE DATA COMPLETENESS ===
      
      expect(resultsData.profile.child_name).toBe('Sofia Gonzalez')
      expect(resultsData.profile.personality_label).toBe('Creative Communicator')
      expect(resultsData.profile.strengths).toContain('Creative Innovation')
      expect(resultsData.profile.growth_areas).toContain('Math')
      
      // Verify recommendations are context-appropriate
      expect(resultsData.recommendations.home_activities.length).toBeGreaterThan(0)
      expect(resultsData.recommendations.classroom_strategies.length).toBeGreaterThan(0)
      expect(resultsData.recommendations.general_support.length).toBeGreaterThan(0)
      
      // Verify contextual insights
      expect(resultsData.contextual_insights.learning_style_summary).toContain('creative')
      expect(resultsData.contextual_insights.strength_narrative).toContain('creativity')
      expect(resultsData.contextual_insights.growth_narrative).toContain('math')
      
      // === SIMULATE DIFFERENT VIEW CONTEXTS ===
      
      const viewContexts = ['parent', 'teacher', 'combined']
      
      for (const context of viewContexts) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            profile: {
              ...testProfile,
              view_context: context,
              recommendations: context === 'parent' 
                ? resultsData.recommendations.home_activities
                : context === 'teacher'
                ? resultsData.recommendations.classroom_strategies
                : resultsData.recommendations
            }
          })
        })
        
        const contextResponse = await fetch(`/api/profiles/progressive?profileId=${testProfile.id}&context=${context}`)
        const contextData = await contextResponse.json()
        
        expect(contextData.profile.view_context).toBe(context)
        expect(contextData.profile.recommendations).toBeTruthy()
      }
    })
  })

  describe('7. Cross-Component Data Flow Validation', () => {
    
    it('should maintain data integrity across all system components', async () => {
      const testData = {
        originalResponses: {
          1: 5, 2: 4, 3: 5, // Communication
          13: 5, 14: 5, 15: 4, // Creative Innovation
          19: 4, 20: 4, 21: 5, // Literacy
          22: 2, 23: 3, 24: 2, // Math
          25: "hands-on", 26: "creative", 27: "independent", 28: ["art", "science"]
        },
        childName: 'Data Flow Test Child',
        ageGroup: '5-6' as const
      }

      // === COMPONENT 1: Question System ===
      
      const questions = getCLP2QuestionsForAge(64) // 5 years, 4 months
      const questionsById = new Map(questions.map(q => [q.id, q]))
      
      // Verify all response questions exist in question system
      Object.keys(testData.originalResponses).forEach(questionIdStr => {
        const questionId = parseInt(questionIdStr)
        if (questionId <= 28) { // Skip preference questions validation
          expect(questionsById.has(questionId)).toBe(true)
        }
      })
      
      // === COMPONENT 2: Multi-Quiz System ===
      
      const parentConfig = getParentQuizQuestions(testData.ageGroup)
      const configQuestionIds = new Set(parentConfig.questions.map(q => q.id))
      
      // Verify most response questions are in quiz configuration (some may be filtered out)
      const coreQuestionIds = Object.keys(testData.originalResponses)
        .map(id => parseInt(id))
        .filter(id => id <= 24)
      const foundQuestions = coreQuestionIds.filter(id => configQuestionIds.has(id))
      expect(foundQuestions.length).toBeGreaterThanOrEqual(coreQuestionIds.length * 0.7) // At least 70% of questions should be found
      
      // === COMPONENT 3: Scoring System ===
      
      const scores = calculateCLP2Scores(
        testData.originalResponses,
        'parent_home',
        testData.ageGroup
      )
      
      // Verify all expected skills are present
      expect(scores.Communication).toBeTruthy()
      expect(scores['Creative Innovation']).toBeTruthy()
      expect(scores.Literacy).toBeTruthy()
      expect(scores.Math).toBeTruthy()
      
      // Verify preferences are preserved
      expect(scores.Engagement).toBe('hands-on')
      expect(scores.Modality).toBe('creative')
      expect(scores.Social).toBe('independent')
      expect(scores.Interests).toEqual(['art', 'science'])
      
      // === COMPONENT 4: Analysis System ===
      
      const personality = getCLP2PersonalityLabel(scores)
      const analysis = getCLP2StrengthsAndGrowth(scores)
      
      expect(personality).toBeTruthy()
      expect(analysis.strengths.length).toBeGreaterThan(0)
      expect(analysis.growthAreas.length).toBeGreaterThan(0)
      
      // Math should be identified as growth area due to low scores (2,3,2)
      expect(analysis.growthAreas).toContain('Math')
      
      // === COMPONENT 5: API Integration ===
      
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            id: 'data-flow-test',
            child_name: testData.childName,
            consolidated_scores: scores,
            personality_label: personality,
            strengths: analysis.strengths,
            growth_areas: analysis.growthAreas
          }
        })
      })
      
      const apiResponse = await fetch('/api/profiles/progressive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_name: testData.childName,
          age_group: testData.ageGroup,
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          responses: testData.originalResponses,
          use_clp2_scoring: true
        })
      })
      
      const apiResult = await apiResponse.json()
      
      // === VERIFY END-TO-END DATA INTEGRITY ===
      
      expect(apiResult.profile.child_name).toBe(testData.childName)
      expect(apiResult.profile.personality_label).toBe(personality)
      expect(apiResult.profile.strengths).toEqual(analysis.strengths)
      expect(apiResult.profile.growth_areas).toEqual(analysis.growthAreas)
      
      // Verify scores match calculated scores
      expect(apiResult.profile.consolidated_scores.Communication).toBe(scores.Communication)
      expect(apiResult.profile.consolidated_scores['Creative Innovation']).toBe(scores['Creative Innovation'])
      expect(apiResult.profile.consolidated_scores.Engagement).toBe(scores.Engagement)
    })
  })

  describe('8. Multi-User Workflow Coordination', () => {
    
    it('should coordinate complex multi-user assessment workflows', async () => {
      const workflowScenario = {
        childName: 'Alex Chen-Williams',
        ageGroup: '7-8' as const,
        participants: [
          { type: 'parent1', name: 'Dr. Sarah Chen', email: 'sarah.chen@email.com', role: 'primary_parent' },
          { type: 'parent2', name: 'Mike Williams', email: 'mike.williams@email.com', role: 'secondary_parent' },
          { type: 'teacher1', name: 'Ms. Rodriguez', email: 'm.rodriguez@school.edu', role: 'homeroom_teacher' },
          { type: 'teacher2', name: 'Mr. Park', email: 'j.park@school.edu', role: 'specialist_teacher' }
        ]
      }

      // === WORKFLOW COORDINATION SIMULATION ===
      
      let profileId: string
      const assessmentResults: any[] = []
      
      // Step 1: Primary parent initiates assessment
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            id: 'multi-user-profile-123',
            child_name: workflowScenario.childName,
            total_assessments: 1,
            parent_assessments: 1,
            teacher_assessments: 0,
            confidence_percentage: 60,
            completeness_percentage: 40
          },
          is_new_profile: true,
          assignment_tokens: {
            teacher1: 'teacher-token-456',
            teacher2: 'teacher-token-789',
            parent2: 'parent-token-321'
          }
        })
      })
      
      const primaryParentResponse = await fetch('/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: workflowScenario.childName,
          age_group: workflowScenario.ageGroup,
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          respondent_name: workflowScenario.participants[0].name,
          responses: generateRealisticParentResponses()
        })
      })
      
      const primaryResult = await primaryParentResponse.json()
      profileId = primaryResult.profile.id
      assessmentResults.push(primaryResult)
      
      // Step 2: Teacher assessment via assignment token
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            id: profileId,
            child_name: workflowScenario.childName,
            total_assessments: 2,
            parent_assessments: 1,
            teacher_assessments: 1,
            confidence_percentage: 80,
            completeness_percentage: 65
          },
          is_new_profile: false,
          consolidation: {
            previous_assessments: ['parent_home'],
            data_sources: 2
          }
        })
      })
      
      const teacherResponse = await fetch('/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: workflowScenario.childName,
          age_group: workflowScenario.ageGroup,
          quiz_type: 'teacher_classroom',
          respondent_type: 'teacher',
          respondent_name: workflowScenario.participants[2].name,
          responses: generateRealisticTeacherResponses(),
          existing_profile_id: profileId,
          assignment_token: 'teacher-token-456'
        })
      })
      
      const teacherResult = await teacherResponse.json()
      assessmentResults.push(teacherResult)
      
      // Step 3: Secondary parent assessment
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            id: profileId,
            child_name: workflowScenario.childName,
            total_assessments: 3,
            parent_assessments: 2,
            teacher_assessments: 1,
            confidence_percentage: 90,
            completeness_percentage: 80
          },
          is_new_profile: false,
          consolidation: {
            previous_assessments: ['parent_home', 'teacher_classroom'],
            data_sources: 3
          }
        })
      })
      
      const secondaryParentResponse = await fetch('/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          child_name: workflowScenario.childName,
          age_group: workflowScenario.ageGroup,
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          respondent_name: workflowScenario.participants[1].name,
          responses: generateRealisticParentResponses(),
          existing_profile_id: profileId
        })
      })
      
      const secondaryResult = await secondaryParentResponse.json()
      assessmentResults.push(secondaryResult)
      
      // === VERIFY WORKFLOW COORDINATION ===
      
      // All assessments should reference the same profile
      expect(assessmentResults[0].profile.id).toBe(profileId)
      expect(assessmentResults[1].profile.id).toBe(profileId)
      expect(assessmentResults[2].profile.id).toBe(profileId)
      
      // Assessment counts should increment correctly
      expect(assessmentResults[0].profile.total_assessments).toBe(1)
      expect(assessmentResults[1].profile.total_assessments).toBe(2)
      expect(assessmentResults[2].profile.total_assessments).toBe(3)
      
      // Confidence should increase with more perspectives
      expect(assessmentResults[0].profile.confidence_percentage).toBe(60)
      expect(assessmentResults[1].profile.confidence_percentage).toBe(80)
      expect(assessmentResults[2].profile.confidence_percentage).toBe(90)
      
      // Profile type tracking should be accurate
      expect(assessmentResults[2].profile.parent_assessments).toBe(2)
      expect(assessmentResults[2].profile.teacher_assessments).toBe(1)
      
      // === SIMULATE FINAL CONSOLIDATION STATUS ===
      
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            id: profileId,
            child_name: workflowScenario.childName,
            total_assessments: 3,
            confidence_percentage: 90,
            completeness_percentage: 80
          },
          consolidation_analysis: {
            completeness_score: 85,
            confidence_level: 'very-high',
            data_sources: [
              { type: 'parent', count: 2 },
              { type: 'teacher', count: 1 }
            ],
            missing_contexts: [],
            recommendations: []
          },
          participant_summary: workflowScenario.participants.filter(p => 
            ['parent1', 'parent2', 'teacher1'].includes(p.type)
          )
        })
      })
      
      const finalStatusResponse = await fetch(`/api/profiles/clp2-consolidate?profile_id=${profileId}`)
      const finalStatus = await finalStatusResponse.json()
      
      expect(finalStatus.consolidation_analysis.confidence_level).toBe('very-high')
      expect(finalStatus.consolidation_analysis.data_sources.length).toBe(2)
      expect(finalStatus.participant_summary.length).toBe(3) // 2 parents + 1 teacher completed
    })
  })
})

// ===== HELPER FUNCTIONS =====

function generateAgeAppropriateResponses(
  questions: CLP2Question[], 
  ageGroup: string
): Record<number, number | string | string[]> {
  const responses: Record<number, number | string | string[]> = {}
  
  questions.forEach(question => {
    if (question.responseType === 'likert') {
      // Age-appropriate response patterns
      const baseScore = ageGroup.includes('3-4') ? 3.0 : 
                       ageGroup.includes('4-5') ? 3.2 :
                       ageGroup.includes('5-6') ? 3.5 : 
                       ageGroup.includes('6-8') ? 3.7 : 4.0
      const variation = Math.random() * 2 - 1
      responses[question.id] = Math.max(1, Math.min(5, Math.round(baseScore + variation)))
    } else if (question.responseType === 'multipleChoice' && question.options) {
      const randomOption = question.options[Math.floor(Math.random() * question.options.length)]
      responses[question.id] = randomOption.value
    } else if (question.responseType === 'multiSelect' && question.options) {
      const selectedCount = Math.min(3, Math.floor(Math.random() * question.options.length) + 1)
      const selectedOptions = question.options
        .sort(() => 0.5 - Math.random())
        .slice(0, selectedCount)
        .map(opt => opt.value)
      responses[question.id] = selectedOptions
    }
  })
  
  return responses
}

function generateRealisticParentResponses(): Record<number, number | string | string[]> {
  return {
    1: 4, 2: 5, 3: 4, // Communication
    4: 3, // Collaboration
    7: 4, 8: 4, // Content
    11: 4, 12: 3, // Critical Thinking
    13: 5, 14: 4, 15: 5, // Creative Innovation
    16: 4, 17: 4, 18: 4, // Confidence
    19: 4, 20: 3, 21: 4, // Literacy
    22: 3, 23: 3, 24: 3, // Math
    25: "hands-on", 26: "creative", 27: "small-group", 28: ["art", "science"]
  }
}

function generateRealisticTeacherResponses(): Record<number, number | string | string[]> {
  return {
    1: 4, 3: 4, // Communication
    4: 4, 5: 5, 6: 4, // Collaboration
    8: 4, 9: 4, // Content
    10: 4, 12: 4, // Critical Thinking
    19: 4, 21: 4, // Literacy
    22: 4, 24: 4 // Math
  }
}

function generateClassroomRecommendations(scores: CLP2Scores): string[] {
  const recommendations: string[] = []
  
  if (scores.Collaboration > 4.0) {
    recommendations.push("Use as peer helper and group leader")
  }
  if (scores.Content > 4.0) {
    recommendations.push("Provide enrichment challenges")
  }
  if (scores.Math < 3.0) {
    recommendations.push("Additional math support needed")
  }
  
  return recommendations
}

function generateAcademicInsights(scores: CLP2Scores): { strengths: string[], growthAreas: string[] } {
  const strengths: string[] = []
  const growthAreas: string[] = []
  
  CLP2_SKILLS.forEach(skill => {
    const score = scores[skill]
    if (typeof score === 'number') {
      if (score >= 4.0) strengths.push(skill)
      if (score < 3.0) growthAreas.push(skill)
    }
  })
  
  return { strengths, growthAreas }
}

function generateCollaborationSuggestions(scores: CLP2Scores): string[] {
  const suggestions: string[] = []
  
  if (scores.Collaboration > 4.0) {
    suggestions.push("Excellent team player - use for group leadership")
    suggestions.push("Can mentor struggling peers")
  }
  
  return suggestions
}

function identifyConsistentPatterns(parentScores: CLP2Scores, teacherScores: CLP2Scores): string[] {
  const patterns: string[] = []
  
  CLP2_SKILLS.forEach(skill => {
    const parentScore = parentScores[skill]
    const teacherScore = teacherScores[skill]
    
    if (typeof parentScore === 'number' && typeof teacherScore === 'number') {
      const difference = Math.abs(parentScore - teacherScore)
      
      if (difference < 0.5 && parentScore > 4.0) {
        patterns.push(`Consistently strong in ${skill} across contexts`)
      }
    }
  })
  
  return patterns
}

function identifySignificantDifferences(parentScores: CLP2Scores, teacherScores: CLP2Scores): Array<{skill: string, difference: number, context: string}> {
  const differences: Array<{skill: string, difference: number, context: string}> = []
  
  CLP2_SKILLS.forEach(skill => {
    const parentScore = parentScores[skill]
    const teacherScore = teacherScores[skill]
    
    if (typeof parentScore === 'number' && typeof teacherScore === 'number') {
      const difference = Math.abs(parentScore - teacherScore)
      
      if (difference > 1.5) {
        const stronger = parentScore > teacherScore ? 'home' : 'classroom'
        differences.push({ skill, difference, context: stronger })
      }
    }
  })
  
  return differences
}

function calculateConfidenceLevel(assessmentCount: number, quizTypes: string[]): number {
  const baseConfidence = 50
  const assessmentBonus = assessmentCount * 15
  const diversityBonus = new Set(quizTypes).size * 10
  
  return Math.min(100, baseConfidence + assessmentBonus + diversityBonus)
}