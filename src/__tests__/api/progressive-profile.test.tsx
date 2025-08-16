/**
 * API Integration Test Suite: Progressive Profile API
 * 
 * Tests the CLP 2.0 progressive profile system API endpoints:
 * - Profile creation with different quiz contexts
 * - Profile consolidation across multiple assessments  
 * - CLP 2.0 vs Legacy scoring compatibility
 * - Error handling and validation
 * - Progressive scoring and confidence calculation
 */

import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/profiles/progressive/route'

// Mock Supabase
const mockSupabase = {
  rpc: jest.fn(),
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

// Mock scoring functions
jest.mock('@/lib/clp-scoring', () => ({
  calculateCLP2Scores: jest.fn((responses, quizType, ageGroup) => ({
    Communication: 2.5,
    Collaboration: 2.1,
    Content: 1.8,
    'Critical Thinking': 2.3,
    'Creative Innovation': 2.7,
    Confidence: 2.2,
    Literacy: 2.4,
    Math: 2.0
  })),
  getCLP2PersonalityLabel: jest.fn(() => 'Creative Communicator'),
  getCLP2StrengthsAndGrowth: jest.fn(() => ({
    strengths: ['Creative Innovation', 'Communication'],
    growthAreas: ['Content', 'Math']
  }))
}))

jest.mock('@/lib/scoring', () => ({
  calculateScores: jest.fn(() => ({
    Communication: 4.2,
    Collaboration: 3.8,
    Content: 4.5,
    'Critical Thinking': 4.0,
    'Creative Innovation': 3.5,
    Confidence: 4.3
  })),
  getPersonalityLabel: jest.fn(() => 'Analytical Achiever'),
  generateDescription: jest.fn(() => 'A focused learner with strong analytical skills.')
}))

jest.mock('@/lib/quiz-definitions', () => ({
  getQuizDefinition: jest.fn((quizType) => ({
    parent_home: { id: 'parent_home', name: 'Parent Home Assessment' },
    teacher_classroom: { id: 'teacher_classroom', name: 'Teacher Classroom Assessment' },
    general: { id: 'general', name: 'General Assessment' }
  }[quizType])),
  calculateQuizContribution: jest.fn(() => ({
    weight: 0.8,
    confidence_boost: 45,
    categories_covered: ['Communication', 'Collaboration', 'Content']
  }))
}))

describe('Progressive Profile API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    process.env.NEXT_PUBLIC_BASE_URL = 'https://test.example.com'
  })
  
  describe('POST /api/profiles/progressive - Profile Creation', () => {
    it('should create new CLP 2.0 profile with parent assessment', async () => {
      const requestData = {
        child_name: 'Emma',
        age_group: '5-7',
        grade: '1st Grade',
        precise_age_months: 66,
        quiz_type: 'parent_home',
        respondent_type: 'parent',
        respondent_name: 'Sarah Johnson',
        responses: {
          1: 3, 2: 2, 3: 3, 4: 1, 5: 3,
          6: 2, 7: 3, 8: 2, 9: 3, 10: 2
        },
        use_clp2_scoring: true
      }
      
      // Mock successful RPC response
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          profile_id: 'clp2-profile-123',
          consolidated_scores: {
            Communication: 2.5,
            Collaboration: 2.1,
            'Creative Innovation': 2.7
          },
          personality_label: 'Creative Communicator',
          confidence_percentage: 85,
          completeness_percentage: 60,
          total_assessments: 1,
          parent_assessments: 1,
          teacher_assessments: 0,
          is_new_profile: true,
          age_group: '5-7',
          precise_age_months: 66
        },
        error: null
      })
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.profile.id).toBe('clp2-profile-123')
      expect(responseData.profile.child_name).toBe('Emma')
      expect(responseData.profile.scoring_version).toBe('CLP 2.0')
      expect(responseData.profile.strengths).toContain('Creative Innovation')
      expect(responseData.profile.growth_areas).toContain('Content')
      expect(responseData.is_new_profile).toBe(true)
      expect(responseData.shareUrl).toContain('/results/clp2-profile-123?context=parent')
      
      // Verify RPC was called with correct parameters
      expect(mockSupabase.rpc).toHaveBeenCalledWith('handle_clp_progressive_profile', {
        p_child_name: 'Emma',
        p_age_group: '5-7',
        p_precise_age_months: 66,
        p_birth_date: undefined,
        p_grade: '1st Grade',
        p_quiz_type: 'parent_home',
        p_respondent_type: 'parent',
        p_respondent_id: undefined,
        p_respondent_name: 'Sarah Johnson',
        p_responses: requestData.responses,
        p_scores: expect.any(Object),
        p_personality_label: 'Creative Communicator',
        p_existing_profile_id: undefined,
        p_contribution_weight: 0.8,
        p_confidence_boost: 45,
        p_school_context: undefined
      })
    })
    
    it('should add teacher assessment to existing profile', async () => {
      const requestData = {
        child_name: 'Emma',
        age_group: '5-7',
        quiz_type: 'teacher_classroom',
        respondent_type: 'teacher',
        respondent_id: 'teacher-456',
        respondent_name: 'Ms. Rodriguez',
        responses: {
          1: 2, 2: 3, 3: 2, 4: 3, 5: 2,
          6: 3, 7: 2, 8: 3, 9: 1, 10: 2
        },
        existing_profile_id: 'clp2-profile-123',
        use_clp2_scoring: true,
        school_context: {
          school_name: 'Lincoln Elementary',
          teacher_name: 'Ms. Rodriguez',
          classroom: '1st Grade A'
        }
      }
      
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          profile_id: 'clp2-profile-123',
          consolidated_scores: {
            Communication: 2.4,
            Collaboration: 2.3,
            'Creative Innovation': 2.5
          },
          personality_label: 'Creative Communicator',
          confidence_percentage: 90,
          completeness_percentage: 85,
          total_assessments: 2,
          parent_assessments: 1,
          teacher_assessments: 1,
          is_new_profile: false
        },
        error: null
      })
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.profile.total_assessments).toBe(2)
      expect(responseData.profile.confidence_percentage).toBe(90)
      expect(responseData.is_new_profile).toBe(false)
      expect(responseData.shareUrl).toContain('context=teacher')
      
      // Verify existing profile was updated
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'handle_clp_progressive_profile',
        expect.objectContaining({
          p_existing_profile_id: 'clp2-profile-123',
          p_school_context: requestData.school_context
        })
      )
    })
    
    it('should handle legacy scoring when requested', async () => {
      const requestData = {
        child_name: 'Alex',
        age_group: '5+',
        quiz_type: 'general',
        respondent_type: 'parent',
        responses: {
          1: 5, 2: 4, 3: 5, 4: 3, 5: 4
        },
        use_clp2_scoring: false
      }
      
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          profile_id: 'legacy-profile-456',
          consolidated_scores: {
            Communication: 4.2,
            Collaboration: 3.8,
            Content: 4.5
          },
          personality_label: 'Analytical Achiever',
          confidence_percentage: 70,
          is_new_profile: true
        },
        error: null
      })
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.profile.scoring_version).toBe('Legacy')
      expect(responseData.profile.personality_label).toBe('Analytical Achiever')
      
      // Should use legacy RPC function
      expect(mockSupabase.rpc).toHaveBeenCalledWith('handle_progressive_profile', expect.any(Object))
    })
    
    it('should handle teacher assignment completion', async () => {
      const requestData = {
        child_name: 'Marcus',
        age_group: '8-10',
        quiz_type: 'teacher_classroom',
        respondent_type: 'teacher',
        responses: { 1: 2, 2: 3, 3: 1 },
        assignment_token: 'assignment-token-789',
        use_clp2_scoring: true
      }
      
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          profile_id: 'teacher-profile-789',
          is_new_profile: true
        },
        error: null
      })
      
      // Mock assignment update
      mockSupabase.update.mockResolvedValueOnce({ data: null, error: null })
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      // Verify assignment was updated
      expect(mockSupabase.from).toHaveBeenCalledWith('profile_assignments')
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'completed',
        completed_at: expect.any(String),
        profile_id: 'teacher-profile-789'
      })
      expect(mockSupabase.eq).toHaveBeenCalledWith('assignment_token', 'assignment-token-789')
    })
    
    it('should validate required fields', async () => {
      const invalidRequestData = {
        child_name: '',
        responses: {}
      }
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(invalidRequestData)
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.error).toContain('Missing required fields')
    })
    
    it('should handle invalid quiz type', async () => {
      const invalidRequestData = {
        child_name: 'Test',
        quiz_type: 'invalid_type',
        respondent_type: 'parent',
        responses: { 1: 3 }
      }
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(invalidRequestData)
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.error).toContain('Invalid quiz type')
    })
    
    it('should handle RPC failures with fallback', async () => {
      const requestData = {
        child_name: 'TestChild',
        age_group: '5+',
        quiz_type: 'parent_home',
        respondent_type: 'parent',
        responses: { 1: 3, 2: 2 },
        use_clp2_scoring: true
      }
      
      // Mock RPC failure
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'RPC function not found' }
      })
      
      // Mock fallback operations
      mockSupabase.insert.mockResolvedValueOnce({
        data: { id: 'assessment-123' },
        error: null
      })
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' } // Not found
      })
      mockSupabase.insert.mockResolvedValueOnce({
        data: { id: 'consolidated-456' },
        error: null
      })
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.profile.id).toBeDefined()
      expect(responseData.is_new_profile).toBe(true)
    })
    
    it('should work without Supabase in development mode', async () => {
      // Temporarily disable Supabase
      const originalSupabase = require('@/lib/supabase').supabase
      require('@/lib/supabase').supabase = null
      
      const requestData = {
        child_name: 'DevChild',
        age_group: '5+',
        quiz_type: 'parent_home',
        respondent_type: 'parent',
        responses: { 1: 3 },
        use_clp2_scoring: true
      }
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.profile.child_name).toBe('DevChild')
      expect(responseData.profile.id).toMatch(/^[a-z0-9]+$/)
      expect(responseData.is_new_profile).toBe(true)
      
      // Restore Supabase
      require('@/lib/supabase').supabase = originalSupabase
    })
  })
  
  describe('GET /api/profiles/progressive - Profile Retrieval', () => {
    it('should retrieve profile by ID', async () => {
      const mockProfile = {
        id: 'profile-123',
        child_name: 'Emma',
        consolidated_scores: { Communication: 2.5 },
        personality_label: 'Creative Communicator',
        confidence_percentage: 85,
        scoring_version: 'CLP 2.0'
      }
      
      mockSupabase.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null
      })
      
      const url = new URL('http://localhost:3000/api/profiles/progressive')
      url.searchParams.set('profileId', 'profile-123')
      
      const request = new NextRequest(url)
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.profile.id).toBe('profile-123')
      expect(responseData.profile.child_name).toBe('Emma')
      
      expect(mockSupabase.from).toHaveBeenCalledWith('profile_with_context')
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'profile-123')
    })
    
    it('should retrieve profile by child name', async () => {
      const mockProfile = {
        id: 'profile-456',
        child_name: 'Alex',
        consolidated_scores: { Communication: 4.2 }
      }
      
      mockSupabase.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null
      })
      
      const url = new URL('http://localhost:3000/api/profiles/progressive')
      url.searchParams.set('childName', 'Alex')
      
      const request = new NextRequest(url)
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.profile.child_name).toBe('Alex')
      expect(mockSupabase.eq).toHaveBeenCalledWith('child_name', 'Alex')
    })
    
    it('should customize response based on context parameter', async () => {
      const mockProfile = {
        id: 'profile-789',
        child_name: 'Sofia',
        home_recommendations: { activity: 'Reading' },
        classroom_recommendations: { strategy: 'Visual aids' }
      }
      
      mockSupabase.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null
      })
      
      const url = new URL('http://localhost:3000/api/profiles/progressive')
      url.searchParams.set('profileId', 'profile-789')
      url.searchParams.set('context', 'parent')
      
      const request = new NextRequest(url)
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(responseData.profile.view_context).toBe('parent')
      expect(responseData.profile.recommendations).toEqual({ activity: 'Reading' })
    })
    
    it('should return 404 for missing profile', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      })
      
      const url = new URL('http://localhost:3000/api/profiles/progressive')
      url.searchParams.set('profileId', 'missing-123')
      
      const request = new NextRequest(url)
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Profile not found')
    })
    
    it('should return 400 for missing parameters', async () => {
      const url = new URL('http://localhost:3000/api/profiles/progressive')
      
      const request = new NextRequest(url)
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Profile ID or child name required')
    })
    
    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed', code: 'CONNECTION_ERROR' }
      })
      
      const url = new URL('http://localhost:3000/api/profiles/progressive')
      url.searchParams.set('profileId', 'profile-123')
      
      const request = new NextRequest(url)
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Failed to fetch profile')
    })
    
    it('should handle missing Supabase gracefully', async () => {
      // Temporarily disable Supabase
      const originalSupabase = require('@/lib/supabase').supabase
      require('@/lib/supabase').supabase = null
      
      const url = new URL('http://localhost:3000/api/profiles/progressive')
      url.searchParams.set('profileId', 'profile-123')
      
      const request = new NextRequest(url)
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.profile).toBeNull()
      
      // Restore Supabase
      require('@/lib/supabase').supabase = originalSupabase
    })
  })
  
  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: 'invalid json'
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(500)
    })
    
    it('should handle unexpected errors gracefully', async () => {
      const requestData = {
        child_name: 'TestChild',
        quiz_type: 'parent_home',
        respondent_type: 'parent',
        responses: { 1: 3 }
      }
      
      // Mock unexpected error
      mockSupabase.rpc.mockRejectedValueOnce(new Error('Unexpected database error'))
      
      const request = new NextRequest('http://localhost:3000/api/profiles/progressive', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Internal server error')
    })
  })
  
  describe('Performance and Scaling', () => {
    it('should handle large response payloads efficiently', async () => {
      const largeProfile = {
        id: 'large-profile-123',
        child_name: 'TestChild',
        consolidated_scores: Array.from({ length: 20 }, (_, i) => ({ [`skill_${i}`]: Math.random() * 3 })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        data_sources: Array.from({ length: 50 }, (_, i) => ({
          quiz_type: 'parent_home',
          respondent_type: 'parent',
          contributed_at: new Date().toISOString(),
          confidence_contribution: 10
        }))
      }
      
      mockSupabase.single.mockResolvedValueOnce({
        data: largeProfile,
        error: null
      })
      
      const url = new URL('http://localhost:3000/api/profiles/progressive')
      url.searchParams.set('profileId', 'large-profile-123')
      
      const request = new NextRequest(url)
      const start = Date.now()
      const response = await GET(request)
      const duration = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(1000) // Should respond within 1 second
    })
  })
})