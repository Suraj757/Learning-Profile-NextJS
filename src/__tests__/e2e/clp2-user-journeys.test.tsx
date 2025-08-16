/**
 * End-to-End Test Suite: CLP 2.0 Complete User Journeys
 * 
 * Tests the complete user experience flow across all contexts:
 * 1. Parent journey: Age selection → Assessment → Results → Activity recommendations
 * 2. Teacher journey: Student assignment → Classroom assessment → Analytics → Parent communication
 * 3. Collaborative journey: Parent starts → Teacher completes → Consolidated results
 * 4. Extended age range testing (3-14 years)
 * 5. Error handling and recovery flows
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import AssessmentStartPage from '@/app/assessment/start/page'
import ContextualResultsPage from '@/components/ContextualResultsPage'
import PreciseAgeSelector from '@/components/PreciseAgeSelector'
import QuizContextSelector from '@/components/QuizContextSelector'

// Mock Next.js components
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

const mockSearchParams = new URLSearchParams()
const mockSearchParamsGet = jest.fn()
mockSearchParams.get = mockSearchParamsGet

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}))

// Mock API calls
global.fetch = jest.fn()

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
})

// Test data fixtures
const mockCLP2Profile = {
  id: 'clp2-profile-123',
  child_name: 'Emma',
  consolidated_scores: {
    Communication: 2.5,
    Collaboration: 2.1,
    Content: 1.8,
    'Critical Thinking': 2.3,
    'Creative Innovation': 2.7,
    Confidence: 2.2,
    Literacy: 2.4,
    Math: 2.0
  },
  personality_label: 'Creative Communicator',
  confidence_percentage: 85,
  completeness_percentage: 75,
  total_assessments: 2,
  parent_assessments: 1,
  teacher_assessments: 1,
  age_group: '5-7',
  precise_age_months: 66,
  strengths: ['Creative Innovation', 'Communication'],
  growth_areas: ['Content', 'Math'],
  scoring_version: 'CLP 2.0',
  data_sources: [
    {
      quiz_type: 'parent_home',
      respondent_type: 'parent',
      contributed_at: '2024-01-15T10:00:00Z',
      confidence_contribution: 40,
      is_current: true
    },
    {
      quiz_type: 'teacher_classroom',
      respondent_type: 'teacher',
      contributed_at: '2024-01-16T14:00:00Z',
      confidence_contribution: 45,
      is_current: true
    }
  ]
}

const mockQuizQuestions = {
  parent_home: {
    questionCount: 19,
    questions: Array.from({ length: 19 }, (_, i) => ({
      id: i + 1,
      text: `Parent question ${i + 1}`,
      type: 'scale',
      options: [1, 2, 3, 4, 5]
    }))
  },
  teacher_classroom: {
    questionCount: 12,
    questions: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      text: `Teacher question ${i + 1}`,
      type: 'scale',
      options: [1, 2, 3]
    }))
  }
}

describe('CLP 2.0 Complete User Journeys', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionStorage.getItem.mockReturnValue(null)
    mockSearchParamsGet.mockReturnValue(null)
    global.fetch.mockClear()
  })

  describe('Parent Journey: Age Selection → Assessment → Results → Recommendations', () => {
    it('should complete full parent journey with precise age selection', async () => {
      const user = userEvent.setup()
      
      // Mock successful API responses
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, profile: mockCLP2Profile })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ profile: mockCLP2Profile })
        })
      
      render(<AssessmentStartPage />)
      
      // Step 1: Enter child name
      const nameInput = screen.getByLabelText(/child's first name/i)
      await user.type(nameInput, 'Emma')
      
      // Step 2: Set precise age using birth date method
      const birthDateButton = screen.getByText(/birth date/i)
      await user.click(birthDateButton)
      
      const birthDateInput = screen.getByLabelText(/child's birth date/i)
      const fiveYearsBirthDate = new Date()
      fiveYearsBirthDate.setFullYear(fiveYearsBirthDate.getFullYear() - 5)
      fiveYearsBirthDate.setMonth(fiveYearsBirthDate.getMonth() - 6) // 5.5 years old
      
      await user.type(birthDateInput, fiveYearsBirthDate.toISOString().split('T')[0])
      
      // Verify age calculation is displayed
      await waitFor(() => {
        expect(screen.getByText(/your child is 5 years and 6 months old/i)).toBeInTheDocument()
        expect(screen.getByText(/assessment group: 5-7 years old/i)).toBeInTheDocument()
      })
      
      // Step 3: Context selection should appear automatically
      await waitFor(() => {
        expect(screen.getByText(/choose assessment context/i)).toBeInTheDocument()
      })
      
      // Select parent assessment context
      const parentAssessmentCard = screen.getByText(/parent assessment/i).closest('div')
      await user.click(parentAssessmentCard!)
      
      // Verify parent context details
      expect(screen.getByText(/home & family context/i)).toBeInTheDocument()
      expect(screen.getByText(/~14 min/i)).toBeInTheDocument() // 19 questions * 0.75 min
      
      // Step 4: Start assessment
      const startButton = screen.getByText(/let's discover emma's superpowers!/i)
      expect(startButton).toBeEnabled()
      await user.click(startButton)
      
      // Verify navigation to assessment
      expect(mockPush).toHaveBeenCalledWith('/assessment/question/1')
      
      // Verify session storage was set with CLP 2.0 context
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('childName', 'Emma')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('ageGroup', '5-7')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('quizType', 'parent_home')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('respondentType', 'parent')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('useCLP2', 'true')
    })
    
    it('should handle results page with parent-specific recommendations', async () => {
      render(<ContextualResultsPage profileId="clp2-profile-123" initialProfile={mockCLP2Profile} />)
      
      // Verify profile overview shows correct information
      expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      expect(screen.getByText('Creative Communicator')).toBeInTheDocument()
      expect(screen.getByText('85% Confidence')).toBeInTheDocument()
      expect(screen.getByText(/CLP 2.0/)).toBeInTheDocument()
      
      // Switch to parent view
      const parentViewButton = screen.getByText(/parent view/i)
      await userEvent.setup().click(parentViewButton)
      
      // Verify parent-specific content appears
      await waitFor(() => {
        expect(screen.getByText(/home learning strategies/i)).toBeInTheDocument()
        expect(screen.getByText(/create a consistent homework routine/i)).toBeInTheDocument()
      })
      
      // Verify CLP 2.0 skills visualization
      expect(screen.getByText(/clp 2.0 skills profile/i)).toBeInTheDocument()
      expect(screen.getByText(/0-3 point scale/i)).toBeInTheDocument()
      
      // Check individual skills are displayed
      expect(screen.getByText(/communication/i)).toBeInTheDocument()
      expect(screen.getByText(/literacy/i)).toBeInTheDocument()
      expect(screen.getByText(/math/i)).toBeInTheDocument()
      
      // Verify strength and growth area indicators
      expect(screen.getByText('2.5/3')).toBeInTheDocument() // Communication score
      expect(screen.getByText('Strong')).toBeInTheDocument() // Level indicator
    })
  })
  
  describe('Teacher Journey: Assignment → Assessment → Analytics → Communication', () => {
    it('should complete teacher assignment and assessment flow', async () => {
      const user = userEvent.setup()
      
      // Mock teacher referral
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === 'ref') return 'teacher-assignment-123'
        if (key === 'source') return 'teacher'
        return null
      })
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, profile: mockCLP2Profile })
      })
      
      render(<AssessmentStartPage />)
      
      // Verify teacher referral message appears
      expect(screen.getByText(/your teacher sent you this assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/let's create your learning profile!/i)).toBeInTheDocument()
      
      // Complete student information
      await user.type(screen.getByLabelText(/child's first name/i), 'Marcus')
      
      // Set age for middle school student (extended range)
      const ageYearsSelect = screen.getByLabelText(/years old/i)
      await user.selectOptions(ageYearsSelect, '12')
      
      const ageMonthsSelect = screen.getByLabelText(/additional months/i)
      await user.selectOptions(ageMonthsSelect, '3')
      
      // Verify extended age range warning
      await waitFor(() => {
        expect(screen.getByText(/clp 2.0 extended age range/i)).toBeInTheDocument()
        expect(screen.getByText(/middle school students/i)).toBeInTheDocument()
      })
      
      // Context should auto-select teacher classroom for teacher referrals
      await waitFor(() => {
        expect(screen.getByText(/teacher assessment/i)).toBeInTheDocument()
        expect(screen.getByText(/classroom & academic context/i)).toBeInTheDocument()
      })
      
      // Start assessment
      const startButton = screen.getByText(/create marcus's learning profile/i)
      await user.click(startButton)
      
      // Verify assignment token is stored
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('assignmentToken', 'teacher-assignment-123')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('quizType', 'teacher_classroom')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('respondentType', 'teacher')
    })
    
    it('should display teacher-specific analytics and recommendations', async () => {
      const teacherProfile = {
        ...mockCLP2Profile,
        child_name: 'Marcus',
        age_group: '10+',
        precise_age_months: 147, // 12.25 years
        teacher_assessments: 1,
        parent_assessments: 0
      }
      
      // Mock search params for teacher context
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === 'context') return 'teacher'
        return null
      })
      
      render(<ContextualResultsPage profileId="teacher-profile-123" initialProfile={teacherProfile} />)
      
      // Should default to teacher view
      expect(screen.getByText(/teacher view/i).closest('button')).toHaveClass('bg-white')
      
      // Verify teacher-specific content
      expect(screen.getByText(/classroom strategies/i)).toBeInTheDocument()
      expect(screen.getByText(/incorporate their preferred learning modalities/i)).toBeInTheDocument()
      expect(screen.getByText(/group them strategically/i)).toBeInTheDocument()
      
      // Verify completion banner shows parent assessment suggestion
      expect(screen.getByText(/add a parent assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/parent assessment/i)).toBeInTheDocument()
    })
  })
  
  describe('Collaborative Journey: Parent → Teacher → Consolidated Results', () => {
    it('should support progressive profile building across contexts', async () => {
      const user = userEvent.setup()
      
      // Simulate parent starting first
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          profile: {
            ...mockCLP2Profile,
            parent_assessments: 1,
            teacher_assessments: 0,
            confidence_percentage: 40,
            completeness_percentage: 50
          },
          is_new_profile: true
        })
      })
      
      render(<AssessmentStartPage />)
      
      // Parent completes initial assessment setup
      await user.type(screen.getByLabelText(/child's first name/i), 'Sofia')
      
      // Use precise age selector for 7-year-old
      const ageInput = screen.getByLabelText(/years old/i)
      await user.selectOptions(ageInput, '7')
      
      // Select parent context
      await waitFor(() => {
        const parentCard = screen.getByText(/parent assessment/i).closest('div')
        user.click(parentCard!)
      })
      
      // Start parent assessment
      const startButton = await screen.findByText(/let's discover sofia's superpowers!/i)
      await user.click(startButton)
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('quizType', 'parent_home')
      
      // Now simulate teacher accessing the same child's profile
      const consolidatedProfile = {
        ...mockCLP2Profile,
        child_name: 'Sofia',
        parent_assessments: 1,
        teacher_assessments: 1,
        confidence_percentage: 85,
        completeness_percentage: 85,
        data_sources: [
          {
            quiz_type: 'parent_home',
            respondent_type: 'parent',
            contributed_at: '2024-01-15T10:00:00Z',
            confidence_contribution: 40,
            is_current: true
          },
          {
            quiz_type: 'teacher_classroom',
            respondent_type: 'teacher',
            contributed_at: '2024-01-16T14:00:00Z',
            confidence_contribution: 45,
            is_current: true
          }
        ]
      }
      
      render(<ContextualResultsPage profileId="consolidated-123" initialProfile={consolidatedProfile} />)
      
      // Verify both assessments are reflected
      expect(screen.getByText('2 Assessments')).toBeInTheDocument()
      expect(screen.getByText('85% Confidence')).toBeInTheDocument()
      
      // Check data sources summary
      expect(screen.getByText(/assessment sources/i)).toBeInTheDocument()
      expect(screen.getByText(/parent assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/teacher assessment/i)).toBeInTheDocument()
      
      // Verify progressive insights
      expect(screen.getByText(/home-school consistency/i)).toBeInTheDocument()
      expect(screen.getByText(/behaviors observed at home and school show strong alignment/i)).toBeInTheDocument()
      
      // Test view switching between contexts
      const teacherViewButton = screen.getByText(/teacher view/i)
      await user.click(teacherViewButton)
      
      expect(screen.getByText(/classroom strategies/i)).toBeInTheDocument()
      
      const parentViewButton = screen.getByText(/parent view/i)
      await user.click(parentViewButton)
      
      expect(screen.getByText(/home learning strategies/i)).toBeInTheDocument()
    })
  })
  
  describe('Extended Age Range Testing (3-14 years)', () => {
    it('should handle youngest supported age (3 years)', async () => {
      const user = userEvent.setup()
      
      render(<PreciseAgeSelector onAgeChange={jest.fn()} />)
      
      // Set to minimum age
      const yearsSelect = screen.getByLabelText(/years old/i)
      await user.selectOptions(yearsSelect, '3')
      
      const monthsSelect = screen.getByLabelText(/additional months/i)
      await user.selectOptions(monthsSelect, '0')
      
      // Verify age group classification
      await waitFor(() => {
        expect(screen.getByText(/3-4 years old/i)).toBeInTheDocument()
        expect(screen.getByText(/preschool age, exploring and learning through play/i)).toBeInTheDocument()
        expect(screen.getByText(/24 skills \+ 4 preferences/i)).toBeInTheDocument()
        expect(screen.getByText(/CLP 2.0/)).toBeInTheDocument()
      })
    })
    
    it('should handle extended age range (11+ years)', async () => {
      const user = userEvent.setup()
      
      render(<PreciseAgeSelector onAgeChange={jest.fn()} />)
      
      // Set to extended age range
      const yearsSelect = screen.getByLabelText(/years old/i)
      await user.selectOptions(yearsSelect, '13')
      
      const monthsSelect = screen.getByLabelText(/additional months/i)
      await user.selectOptions(monthsSelect, '8')
      
      // Verify extended age warning and features
      await waitFor(() => {
        expect(screen.getByText(/11\+ years old/i)).toBeInTheDocument()
        expect(screen.getByText(/middle school\+, advanced academic and social development/i)).toBeInTheDocument()
        expect(screen.getByText(/45 skills \+ 4 preferences/i)).toBeInTheDocument()
        expect(screen.getByText(/CLP 2.0 Extended/i)).toBeInTheDocument()
      })
      
      // Verify extended age range information
      expect(screen.getByText(/clp 2.0 extended age range/i)).toBeInTheDocument()
      expect(screen.getByText(/advanced academic and social development measures/i)).toBeInTheDocument()
    })
    
    it('should calculate precise age from birth date for all ranges', async () => {
      const user = userEvent.setup()
      
      const mockAgeChange = jest.fn()
      render(<PreciseAgeSelector onAgeChange={mockAgeChange} />)
      
      // Switch to birth date input
      const birthDateButton = screen.getByText(/birth date/i)
      await user.click(birthDateButton)
      
      // Test various ages
      const testCases = [
        { yearsAgo: 4, monthsAgo: 2, expectedGroup: '4-5' },
        { yearsAgo: 6, monthsAgo: 8, expectedGroup: '5-6' },
        { yearsAgo: 9, monthsAgo: 1, expectedGroup: '8-10' },
        { yearsAgo: 12, monthsAgo: 6, expectedGroup: '10+' }
      ]
      
      for (const testCase of testCases) {
        const birthDate = new Date()
        birthDate.setFullYear(birthDate.getFullYear() - testCase.yearsAgo)
        birthDate.setMonth(birthDate.getMonth() - testCase.monthsAgo)
        
        const birthDateInput = screen.getByLabelText(/child's birth date/i)
        await user.clear(birthDateInput)
        await user.type(birthDateInput, birthDate.toISOString().split('T')[0])
        
        await waitFor(() => {
          expect(screen.getByText(new RegExp(testCase.expectedGroup, 'i'))).toBeInTheDocument()
        })
      }
    })
  })
  
  describe('Quiz Context Selector Routing', () => {
    it('should properly route different assessment contexts', async () => {
      const user = userEvent.setup()
      const mockContextSelect = jest.fn()
      
      render(<QuizContextSelector onContextSelect={mockContextSelect} ageGroup="5+" />)
      
      // Test parent assessment selection
      const parentCard = screen.getByText(/parent assessment/i).closest('div')
      await user.click(parentCard!)
      
      expect(mockContextSelect).toHaveBeenCalledWith({
        quizType: 'parent_home',
        ageGroup: '5+',
        questionCount: expect.any(Number),
        estimatedTime: expect.any(Number)
      })
      
      // Test teacher assessment selection
      const teacherCard = screen.getByText(/teacher assessment/i).closest('div')
      await user.click(teacherCard!)
      
      expect(mockContextSelect).toHaveBeenCalledWith({
        quizType: 'teacher_classroom',
        ageGroup: '5+',
        questionCount: expect.any(Number),
        estimatedTime: expect.any(Number)
      })
      
      // Test complete assessment selection
      const completeCard = screen.getByText(/complete assessment/i).closest('div')
      await user.click(completeCard!)
      
      expect(mockContextSelect).toHaveBeenCalledWith({
        quizType: 'general',
        ageGroup: '5+',
        questionCount: 28,
        estimatedTime: 18
      })
    })
    
    it('should show detailed information on demand', async () => {
      const user = userEvent.setup()
      
      render(<QuizContextSelector onContextSelect={jest.fn()} ageGroup="5+" />)
      
      // Click info button for parent assessment
      const parentInfoButton = within(screen.getByText(/parent assessment/i).closest('div')!)
        .getByRole('button', { name: '' })
      
      await user.click(parentInfoButton)
      
      // Verify detailed info appears
      await waitFor(() => {
        expect(screen.getByText(/what's included:/i)).toBeInTheDocument()
        expect(screen.getByText(/home behavior/i)).toBeInTheDocument()
        expect(screen.getByText(/family interactions/i)).toBeInTheDocument()
        expect(screen.getByText(/benefits:/i)).toBeInTheDocument()
        expect(screen.getByText(/complete learning preferences profile/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Error Handling and Recovery', () => {
    it('should handle API failures gracefully during assessment creation', async () => {
      const user = userEvent.setup()
      
      // Mock API failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(<AssessmentStartPage />)
      
      await user.type(screen.getByLabelText(/child's first name/i), 'TestChild')
      
      // Age selection should still work
      const ageSelect = screen.getByLabelText(/years old/i)
      await user.selectOptions(ageSelect, '5')
      
      // UI should remain functional even with API errors
      await waitFor(() => {
        expect(screen.getByText(/5 years and 0 months old/i)).toBeInTheDocument()
      })
      
      // Form should still allow submission attempt
      const startButton = await screen.findByText(/let's discover testchild's superpowers!/i)
      expect(startButton).toBeEnabled()
    })
    
    it('should validate age ranges and show appropriate warnings', async () => {
      const user = userEvent.setup()
      
      render(<PreciseAgeSelector onAgeChange={jest.fn()} />)
      
      // Test edge case: very young child
      const yearsSelect = screen.getByLabelText(/years old/i)
      await user.selectOptions(yearsSelect, '3')
      
      // Should show developmental note but not error
      await waitFor(() => {
        expect(screen.getByText(/note:/i)).toBeInTheDocument()
        expect(screen.getByText(/questions may not accurately reflect their developmental stage/i)).toBeInTheDocument()
      })
      
      // Test edge case: older child
      await user.selectOptions(yearsSelect, '13')
      
      await waitFor(() => {
        expect(screen.getByText(/clp 2.0 extended age range/i)).toBeInTheDocument()
        expect(screen.getByText(/covers children up to 14 years/i)).toBeInTheDocument()
      })
    })
    
    it('should handle incomplete profile data gracefully', async () => {
      const incompleteProfile = {
        ...mockCLP2Profile,
        consolidated_scores: {}, // Empty scores
        data_sources: [], // No data sources
        confidence_percentage: 0
      }
      
      render(<ContextualResultsPage profileId="incomplete-123" initialProfile={incompleteProfile} />)
      
      // Should still render without crashing
      expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      
      // Should show appropriate completion messaging
      expect(screen.getByText(/profile is 0% complete/i)).toBeInTheDocument()
      expect(screen.getByText(/add more assessments/i)).toBeInTheDocument()
    })
    
    it('should provide fallback for network connectivity issues', async () => {
      const user = userEvent.setup()
      
      // Mock offline scenario
      global.fetch.mockImplementation(() => 
        Promise.reject(new Error('Network request failed'))
      )
      
      render(<AssessmentStartPage />)
      
      // Basic functionality should still work
      await user.type(screen.getByLabelText(/child's first name/i), 'OfflineChild')
      
      // Age selector should work without API
      const ageSelect = screen.getByLabelText(/years old/i)
      await user.selectOptions(ageSelect, '6')
      
      await waitFor(() => {
        expect(screen.getByText(/6 years and 0 months old/i)).toBeInTheDocument()
      })
      
      // Should allow form completion even offline
      const startButton = await screen.findByText(/let's discover offlinechild's superpowers!/i)
      expect(startButton).toBeEnabled()
    })
  })
  
  describe('Accessibility and Responsive Design', () => {
    it('should maintain proper ARIA labels and keyboard navigation', async () => {
      render(<AssessmentStartPage />)
      
      // Check form labels
      expect(screen.getByLabelText(/child's first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/years old/i)).toBeInTheDocument()
      
      // Check button accessibility
      const startButton = screen.getByRole('button', { name: /let's discover their superpowers!/i })
      expect(startButton).toBeInTheDocument()
      expect(startButton).toHaveAttribute('disabled')
      
      // Test keyboard navigation
      const nameInput = screen.getByLabelText(/child's first name/i)
      nameInput.focus()
      expect(document.activeElement).toBe(nameInput)
    })
    
    it('should handle touch interactions on mobile-like viewports', async () => {
      const user = userEvent.setup()
      
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<QuizContextSelector onContextSelect={jest.fn()} ageGroup="5+" />)
      
      // Cards should be touch-friendly
      const parentCard = screen.getByText(/parent assessment/i).closest('div')
      expect(parentCard).toHaveClass('cursor-pointer')
      
      // Touch interaction should work
      await user.click(parentCard!)
      
      // Should show selection state
      expect(parentCard).toHaveClass('ring-2')
    })
    
    it('should provide proper contrast and visual indicators', () => {
      render(<PreciseAgeSelector onAgeChange={jest.fn()} />)
      
      // Check for proper contrast classes
      const ageGroupDisplay = screen.getByText(/your child is 3 years and 0 months old/i).closest('div')
      expect(ageGroupDisplay).toHaveClass('border-2')
      
      // Visual progress indicators should be present
      const progressBars = screen.getAllByRole('progressbar', { hidden: true })
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })
})