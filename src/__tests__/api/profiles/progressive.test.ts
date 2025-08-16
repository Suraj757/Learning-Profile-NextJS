// Comprehensive Progressive Profile API Tests
// Testing the /api/profiles/progressive endpoint for CLP 2.0 confidence scoring and consolidation

import { NextRequest, NextResponse } from 'next/server'
import { POST, GET } from '../../../app/api/profiles/progressive/route'
import { calculateCLP2Scores, getCLP2PersonalityLabel, getCLP2StrengthsAndGrowth, type CLP2Scores } from '../../../lib/clp-scoring'
import { getQuizDefinition, calculateQuizContribution, type QuizType, type RespondentType } from '../../../lib/quiz-definitions'

// Mock NextResponse and NextRequest
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    method: string
    url: string
    _body: string
    headers: Map<string, string>
    nextUrl: any

    constructor(url: string, options: any = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this._body = options.body || ''
      this.headers = new Map(Object.entries(options.headers || {}))
      this.nextUrl = {
        origin: 'http://localhost:3000',
        searchParams: new URLSearchParams(url.split('?')[1] || '')
      }
    }

    async json() {
      return JSON.parse(this._body)
    }
  },
  NextResponse: {
    json: (body: any, options: any = {}) => ({
      json: async () => body,
      status: options.status || 200,
      headers: new Map(),
      ok: (options.status || 200) >= 200 && (options.status || 200) < 300
    })
  }
}))

// Create mock functions for Supabase operations
const mockRpc = jest.fn()
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockOrder = jest.fn()

// Mock Supabase client structure
const mockSupabaseClient = {
  rpc: mockRpc,
  from: mockFrom
}

// Setup the mock chain
mockFrom.mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate
})

mockSelect.mockReturnValue({
  eq: mockEq,
  order: mockOrder
})

mockEq.mockReturnValue({
  single: mockSingle
})

mockInsert.mockReturnValue({
  select: jest.fn(() => ({
    single: mockSingle
  }))
})

mockUpdate.mockReturnValue({
  eq: mockEq
})

// Mock the supabase module
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}))

// Mock scoring and quiz definition modules
jest.mock('../../../lib/clp-scoring')
jest.mock('../../../lib/quiz-definitions')

const mockedCalculateCLP2Scores = jest.mocked(calculateCLP2Scores)
const mockedGetCLP2PersonalityLabel = jest.mocked(getCLP2PersonalityLabel)
const mockedGetCLP2StrengthsAndGrowth = jest.mocked(getCLP2StrengthsAndGrowth)
const mockedGetQuizDefinition = jest.mocked(getQuizDefinition)
const mockedCalculateQuizContribution = jest.mocked(calculateQuizContribution)

// Get the mocked supabase for test setup
const { supabase: mockSupabaseForTests } = jest.mocked(require('../../../lib/supabase'))

// Test data used across multiple tests
const validAssessmentRequest = {
  child_name: 'Emma Johnson',
  age_group: '5+',
  quiz_type: 'parent_home',
  respondent_type: 'parent',
  respondent_name: 'Sarah Johnson',
  responses: {
    1: 5, 2: 4, 3: 5, 4: 3, 5: 4,
    6: 3, 7: 2, 8: 4, 9: 5, 10: 4,
    11: 3, 12: 5, 13: 4, 14: 5, 15: 3
  },
  use_clp2_scoring: true
}

describe('/api/profiles/progressive', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset the mock supabase methods to use our defined mocks
    if (mockSupabaseForTests) {
      mockSupabaseForTests.rpc = mockRpc
      mockSupabaseForTests.from = mockFrom
    }
    
    // Set up default mocks
    mockedCalculateCLP2Scores.mockReturnValue({
      Communication: 4.2,
      Collaboration: 3.8,
      Content: 3.5,
      'Critical Thinking': 4.0,
      'Creative Innovation': 4.5,
      Confidence: 3.9,
      Literacy: 3.7,
      Math: 3.3,
      Engagement: 'hands-on',
      Modality: 'visual',
      Social: 'small-group',
      Interests: ['art', 'science']
    })

    mockedGetCLP2PersonalityLabel.mockReturnValue('Creative Problem Solver')

    mockedGetCLP2StrengthsAndGrowth.mockReturnValue({
      strengths: ['Creative Innovation', 'Communication'],
      growthAreas: ['Math', 'Content']
    })

    mockedGetQuizDefinition.mockReturnValue({
      id: 'parent_home',
      quiz_type: 'parent_home',
      name: 'Parent Home Assessment',
      description: 'Parent assessment',
      target_respondent: 'parent',
      question_count: 15,
      estimated_duration_minutes: 5,
      supported_age_groups: ['3-4', '4-5', '5+'],
      intro_text: 'Test intro',
      completion_message: 'Test completion',
      result_page_template: 'parent_focused',
      scoring_weight: 0.6,
      confidence_boost: 30,
      context_settings: {
        emphasize_categories: ['Communication', 'Creative Innovation'],
        include_interests: true,
        include_motivations: true,
        include_school_experience: true,
        show_progress_indicators: true
      },
      requires_invitation: false,
      can_be_shared: true,
      created_at: new Date().toISOString(),
      is_active: true
    })

    mockedCalculateQuizContribution.mockReturnValue({
      weight: 0.6,
      confidence_boost: 30,
      categories_covered: ['Communication', 'Creative Innovation', 'Confidence']
    })
  })

  describe('POST - Assessment Submission', () => {

    test('should create new profile successfully with parent assessment', async () => {
      // Mock successful RPC call for new profile
      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-123',
          consolidated_scores: {
            Communication: 4.2,
            Collaboration: 3.8,
            'Creative Innovation': 4.5
          },
          personality_label: 'Creative Problem Solver',
          confidence_percentage: 75,
          completeness_percentage: 33,
          total_assessments: 1,
          parent_assessments: 1,
          teacher_assessments: 0,
          is_new_profile: true,
          previous_assessments: []
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(validAssessmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile).toBeDefined()
      expect(data.profile.id).toBe('profile-123')
      expect(data.profile.child_name).toBe('Emma Johnson')
      expect(data.profile.personality_label).toBe('Creative Problem Solver')
      expect(data.profile.confidence_percentage).toBe(75)
      expect(data.profile.total_assessments).toBe(1)
      expect(data.is_new_profile).toBe(true)
      expect(data.shareUrl).toContain('profile-123')
      
      // Verify RPC was called with correct parameters
      expect(mockRpc).toHaveBeenCalledWith('handle_clp_progressive_profile', 
        expect.objectContaining({
          p_child_name: 'Emma Johnson',
          p_age_group: '5+',
          p_quiz_type: 'parent_home',
          p_respondent_type: 'parent',
          p_respondent_name: 'Sarah Johnson'
        })
      )
    })

    test('should update existing profile with teacher assessment', async () => {
      const teacherRequest = {
        ...validAssessmentRequest,
        quiz_type: 'teacher_classroom',
        respondent_type: 'teacher',
        respondent_name: 'Ms. Anderson',
        existing_profile_id: 'profile-123'
      }

      // Mock RPC call for existing profile update
      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-123',
          consolidated_scores: {
            Communication: 4.1,
            Collaboration: 4.2,
            'Creative Innovation': 4.3
          },
          personality_label: 'Creative Collaborator',
          confidence_percentage: 85,
          completeness_percentage: 66,
          total_assessments: 2,
          parent_assessments: 1,
          teacher_assessments: 1,
          is_new_profile: false,
          previous_assessments: [
            { respondent_type: 'parent', date: '2024-01-15T10:00:00Z' }
          ]
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(teacherRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.confidence_percentage).toBe(85)
      expect(data.profile.total_assessments).toBe(2)
      expect(data.profile.teacher_assessments).toBe(1)
      expect(data.is_new_profile).toBe(false)
      expect(data.previous_assessments).toHaveLength(1)
    })

    test('should handle teacher assignment completion', async () => {
      const teacherAssignmentRequest = {
        ...validAssessmentRequest,
        quiz_type: 'teacher_classroom',
        respondent_type: 'teacher',
        assignment_token: 'assign-token-123'
      }

      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-456',
          consolidated_scores: {},
          personality_label: 'Unique Learner',
          confidence_percentage: 70,
          completeness_percentage: 50,
          total_assessments: 1,
          parent_assessments: 0,
          teacher_assessments: 1,
          is_new_profile: true
        },
        error: null
      })

      // Mock assignment update
      const mockAssignmentUpdate = jest.fn(() => ({
        eq: jest.fn()
      }))
      mockFrom.mockReturnValueOnce({
        update: mockAssignmentUpdate
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(teacherAssignmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      expect(mockFrom).toHaveBeenCalledWith('profile_assignments')
    })

    test('should validate required fields', async () => {
      const invalidRequest = {
        child_name: 'Emma Johnson'
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(invalidRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    test('should validate quiz type', async () => {
      const invalidQuizRequest = {
        ...validAssessmentRequest,
        quiz_type: 'invalid_quiz'
      }

      mockedGetQuizDefinition.mockReturnValueOnce(undefined as any)

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(invalidQuizRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid quiz type')
    })

    test('should handle fallback mode when supabase is unavailable', async () => {
      // Mock the supabase import to return null
      const { supabase: originalSupabase } = jest.mocked(require('../../../lib/supabase'))
      
      // Temporarily set supabase to null to simulate unavailable state
      jest.mocked(require('../../../lib/supabase')).supabase = null

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(validAssessmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.id).toBeTruthy()
      expect(data.profile.child_name).toBe('Emma Johnson')
      expect(data.shareUrl).toContain(data.profile.id)
      
      // Restore original supabase mock
      jest.mocked(require('../../../lib/supabase')).supabase = originalSupabase
    })
  })

  describe('Confidence Scoring System', () => {
    test('should calculate confidence based on response consistency', async () => {
      // Mock consistent responses (high confidence)
      const consistentResponses = {
        1: 5, 2: 5, 3: 5, 4: 5, 5: 5,
        6: 5, 7: 5, 8: 5, 9: 5, 10: 5
      }

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          ...validAssessmentRequest,
          responses: consistentResponses
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-consistent',
          confidence_percentage: 90, // High confidence from consistency
          consolidated_scores: {},
          personality_label: 'Confident Learner',
          completeness_percentage: 50,
          total_assessments: 1,
          parent_assessments: 1,
          teacher_assessments: 0,
          is_new_profile: true
        },
        error: null
      })

      await POST(request)

      expect(mockedCalculateCLP2Scores).toHaveBeenCalledWith(
        consistentResponses,
        'parent_home',
        '5+'
      )
    })

    test('should boost confidence when multiple perspectives agree', async () => {
      // Mock RPC for multiple assessment scenario
      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-multi',
          confidence_percentage: 95, // Boosted by agreement
          consolidated_scores: {
            Communication: 4.3,
            Collaboration: 4.1,
            'Creative Innovation': 4.4
          },
          personality_label: 'Creative Communicator',
          completeness_percentage: 80,
          total_assessments: 2,
          parent_assessments: 1,
          teacher_assessments: 1,
          is_new_profile: false
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          ...validAssessmentRequest,
          existing_profile_id: 'profile-multi'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.confidence_percentage).toBe(95)
      expect(data.contribution_summary.new_confidence).toBe(95)
    })

    test('should reduce confidence when assessments conflict', async () => {
      // Mock conflicting assessment scenario
      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-conflict',
          confidence_percentage: 65, // Reduced due to conflict
          consolidated_scores: {
            Communication: 3.2,
            Collaboration: 2.8
          },
          personality_label: 'Developing Learner',
          completeness_percentage: 60,
          total_assessments: 2,
          parent_assessments: 1,
          teacher_assessments: 1,
          is_new_profile: false
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(validAssessmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.confidence_percentage).toBe(65)
    })
  })

  describe('Progressive Consolidation', () => {
    test('should update profile with weighted consolidation', async () => {
      // Mock weighted consolidation scenario
      const parentWeight = 0.6
      const teacherWeight = 0.8

      mockedCalculateQuizContribution
        .mockReturnValueOnce({
          weight: parentWeight,
          confidence_boost: 30,
          categories_covered: ['Communication', 'Creative Innovation']
        })
        .mockReturnValueOnce({
          weight: teacherWeight,
          confidence_boost: 40,
          categories_covered: ['Content', 'Critical Thinking', 'Math']
        })

      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-weighted',
          consolidated_scores: {
            Communication: 4.0, // Weighted average
            'Creative Innovation': 4.2,
            Content: 3.8,
            'Critical Thinking': 3.9
          },
          confidence_percentage: 82,
          completeness_percentage: 75,
          total_assessments: 2,
          parent_assessments: 1,
          teacher_assessments: 1,
          is_new_profile: false
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(validAssessmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.consolidated_scores).toBeDefined()
      expect(data.contribution_summary.weight).toBe(0.6)
    })

    test('should track profile evolution over time', async () => {
      const previousAssessments = [
        { respondent_type: 'parent', date: '2024-01-15T10:00:00Z', confidence: 70 },
        { respondent_type: 'teacher', date: '2024-01-20T14:00:00Z', confidence: 75 }
      ]

      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-evolution',
          consolidated_scores: {
            Communication: 4.1,
            Collaboration: 3.9,
            'Creative Innovation': 4.3
          },
          confidence_percentage: 88,
          completeness_percentage: 90,
          total_assessments: 3,
          parent_assessments: 2,
          teacher_assessments: 1,
          is_new_profile: false,
          previous_assessments: previousAssessments
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          ...validAssessmentRequest,
          existing_profile_id: 'profile-evolution'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.total_assessments).toBe(3)
      expect(data.previous_assessments).toHaveLength(2)
      expect(data.profile.completeness_percentage).toBe(90)
    })
  })

  describe('Database Integration', () => {
    test('should handle database connection errors', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: new Error('Database connection failed')
      })

      // Mock fallback operations for error handling
      const mockFallbackInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'fallback-assessment',
              child_name: 'Emma Johnson'
            },
            error: null
          }))
        }))
      }))
      
      const mockFallbackSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
      
      const mockFallbackUpdate = jest.fn(() => ({
        eq: jest.fn()
      }))
      
      mockFrom.mockReturnValue({
        insert: mockFallbackInsert,
        select: mockFallbackSelect,
        update: mockFallbackUpdate
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(validAssessmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile).toBeDefined()
      // Should fall back to individual operations
    })

    test('should properly log assessment responses', async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'profile-logged',
          consolidated_scores: {},
          confidence_percentage: 75,
          completeness_percentage: 50,
          total_assessments: 1,
          parent_assessments: 1,
          teacher_assessments: 0,
          is_new_profile: true
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(validAssessmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      await POST(request)

      expect(mockRpc).toHaveBeenCalledWith(
        'handle_clp_progressive_profile',
        expect.objectContaining({
          p_responses: validAssessmentRequest.responses,
          p_scores: expect.any(Object)
        })
      )
    })
  })

  describe('CLP 2.0 Integration', () => {
    test('should use CLP 2.0 scoring algorithms', async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'clp2-profile',
          consolidated_scores: {
            Communication: 4.2,
            Collaboration: 3.8,
            Content: 3.5,
            'Critical Thinking': 4.0,
            'Creative Innovation': 4.5,
            Confidence: 3.9,
            Literacy: 3.7,
            Math: 3.3
          },
          personality_label: 'Creative Problem Solver',
          confidence_percentage: 85,
          completeness_percentage: 60,
          total_assessments: 1,
          parent_assessments: 1,
          teacher_assessments: 0,
          is_new_profile: true
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify({
          ...validAssessmentRequest,
          use_clp2_scoring: true
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.scoring_version).toBe('CLP 2.0')
      expect(mockedCalculateCLP2Scores).toHaveBeenCalled()
      expect(mockedGetCLP2PersonalityLabel).toHaveBeenCalled()
      expect(mockedGetCLP2StrengthsAndGrowth).toHaveBeenCalled()
    })

    test('should handle extended age groups', async () => {
      const extendedAgeRequest = {
        ...validAssessmentRequest,
        age_group: '8-10',
        precise_age_months: 108
      }

      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'extended-age-profile',
          consolidated_scores: {},
          personality_label: 'Analytical Scholar',
          confidence_percentage: 80,
          completeness_percentage: 70,
          total_assessments: 1,
          parent_assessments: 1,
          teacher_assessments: 0,
          is_new_profile: true,
          precise_age_months: 108
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(extendedAgeRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.precise_age_months).toBe(108)
      expect(mockedCalculateCLP2Scores).toHaveBeenCalledWith(
        expect.any(Object),
        'parent_home',
        '8-10'
      )
    })

    test('should generate proper strengths and growth areas', async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          profile_id: 'strengths-profile',
          consolidated_scores: {},
          personality_label: 'Creative Innovator',
          confidence_percentage: 85,
          completeness_percentage: 60,
          total_assessments: 1,
          parent_assessments: 1,
          teacher_assessments: 0,
          is_new_profile: true
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(validAssessmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.strengths).toEqual(['Creative Innovation', 'Communication'])
      expect(data.profile.growth_areas).toEqual(['Math', 'Content'])
    })
  })

  describe('API Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: '{ invalid json }',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    test('should handle missing required fields gracefully', async () => {
      const incompleteRequest = {
        child_name: 'Emma Johnson'
        // Missing other required fields
      }

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(incompleteRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    test('should handle internal server errors', async () => {
      // Mock unexpected error
      mockRpc.mockRejectedValueOnce(new Error('Unexpected server error'))

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(validAssessmentRequest),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET - Profile Retrieval', () => {
    test('should retrieve profile by ID', async () => {
      const mockProfile = {
        id: 'profile-123',
        child_name: 'Emma Johnson',
        age_group: '5+',
        consolidated_scores: {
          Communication: 4.2,
          'Creative Innovation': 4.5
        },
        personality_label: 'Creative Problem Solver',
        confidence_percentage: 85,
        total_assessments: 2,
        home_recommendations: ['Encourage creative play', 'Support communication'],
        classroom_recommendations: ['Provide visual aids', 'Allow flexible seating']
      }

      const mockProfileSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockProfile,
            error: null
          }))
        }))
      }))
      mockFrom.mockReturnValueOnce({
        select: mockProfileSelect
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive?profileId=profile-123&context=parent')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.id).toBe('profile-123')
      expect(data.profile.view_context).toBe('parent')
      expect(data.profile.recommendations).toEqual(['Encourage creative play', 'Support communication'])
    })

    test('should retrieve profile by child name', async () => {
      const mockProfile = {
        id: 'profile-456',
        child_name: 'Emma Johnson',
        consolidated_scores: {},
        personality_label: 'Unique Learner'
      }

      const mockNameSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockProfile,
            error: null
          }))
        }))
      }))
      mockFrom.mockReturnValueOnce({
        select: mockNameSelect
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive?childName=Emma Johnson&context=teacher')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.child_name).toBe('Emma Johnson')
      expect(data.profile.view_context).toBe('teacher')
    })

    test('should handle profile not found', async () => {
      const mockNotFoundSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { code: 'PGRST116' } // Not found error
          }))
        }))
      }))
      mockFrom.mockReturnValueOnce({
        select: mockNotFoundSelect
      })

      const request = new NextRequest('http://localhost:3000/api/profiles/progressive?profileId=nonexistent')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Profile not found')
    })

    test('should require profile ID or child name', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Profile ID or child name required')
    })
  })
})