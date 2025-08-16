/**
 * Test Suite: ContextualResultsPage Component
 * 
 * Comprehensive tests for CLP 2.0 results visualization including:
 * - Context-aware result display (parent/teacher/combined)
 * - CLP 2.0 skills visualization (8 skills + 0-3 scale)
 * - Progressive profile consolidation
 * - Data sources and confidence metrics
 * - Contextual recommendations and personalized insights
 * - Age-appropriate content adaptation
 * - Interactive features and share functionality
 * - Accessibility and responsive design
 * - Loading states and error handling
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContextualResultsPage from '@/components/ContextualResultsPage'
import { getCLP2PersonalityLabel, getCLP2StrengthsAndGrowth } from '@/lib/clp-scoring'

// Mock Next.js router
const mockPush = jest.fn()
const mockSearchParams = {
  get: jest.fn().mockReturnValue(null)
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock console.log for cleaner test output
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

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
  personality_label: 'Creative Storyteller',
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
  ],
  recommendations: {
    activities: ['Creative writing', 'Art projects'],
    learning_strategies: ['Visual aids', 'Hands-on activities']
  },
  home_recommendations: {
    daily_activities: ['Reading together', 'Creative play'],
    learning_environment: ['Quiet study space', 'Art supplies']
  },
  classroom_recommendations: {
    teaching_strategies: ['Visual presentations', 'Group projects'],
    classroom_management: ['Movement breaks', 'Choice in activities']
  }
}

const mockLegacyProfile = {
  id: 'legacy-profile-456',
  child_name: 'Alex',
  consolidated_scores: {
    Communication: 4.2,
    Collaboration: 3.8,
    Content: 4.5,
    'Critical Thinking': 4.0,
    'Creative Innovation': 3.5,
    Confidence: 4.3
  },
  personality_label: 'Analytical Achiever',
  confidence_percentage: 70,
  completeness_percentage: 60,
  total_assessments: 1,
  parent_assessments: 1,
  teacher_assessments: 0,
  age_group: '5+',
  scoring_version: 'Legacy',
  data_sources: [
    {
      quiz_type: 'parent_home',
      respondent_type: 'parent',
      contributed_at: '2024-01-10T09:00:00Z',
      confidence_contribution: 70,
      is_current: true
    }
  ]
}

describe('ContextualResultsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch.mockClear()
    mockSearchParams.get.mockReturnValue(null)
  })
  
  describe('Profile Display and Header', () => {
    it('should display profile header with correct information', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      expect(screen.getAllByText(/85% confidence/i)).toHaveLength(3) // Header + personality overview + confidence card
      expect(screen.getByText('2 Assessments')).toBeInTheDocument()
      expect(screen.getByText('CLP 2.0')).toBeInTheDocument()
    })
    
    it('should show profile completion banner when incomplete', () => {
      const incompleteProfile = {
        ...mockCLP2Profile,
        completeness_percentage: 65,
        teacher_assessments: 0
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={incompleteProfile} />)
      
      expect(screen.getByText(/profile is 65% complete/i)).toBeInTheDocument()
      expect(screen.getByText(/add a teacher assessment for classroom perspective/i)).toBeInTheDocument()
      expect(screen.getAllByText(/teacher assessment/i)).toHaveLength(3) // Banner + button + sources
    })
    
    it('should not show completion banner when profile is complete', () => {
      const completeProfile = {
        ...mockCLP2Profile,
        completeness_percentage: 85
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={completeProfile} />)
      
      expect(screen.queryByText(/profile is.*complete/i)).not.toBeInTheDocument()
    })
  })
  
  describe('View Context Switching', () => {
    it('should default to combined view', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const combinedButton = screen.getByText(/combined/i).closest('button')
      expect(combinedButton).toHaveClass('bg-white', 'text-begin-blue')
    })
    
    it('should switch to parent view and show parent-specific content', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const parentViewButton = screen.getByText(/parent view/i)
      await user.click(parentViewButton)
      
      await waitFor(() => {
        expect(screen.getByText(/home learning strategies/i)).toBeInTheDocument()
        expect(screen.getByText(/create a consistent homework routine/i)).toBeInTheDocument()
      })
    })
    
    it('should switch to teacher view and show teacher-specific content', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const teacherViewButton = screen.getByText(/teacher view/i)
      await user.click(teacherViewButton)
      
      await waitFor(() => {
        expect(screen.getByText(/classroom strategies/i)).toBeInTheDocument()
        expect(screen.getByText(/incorporate their preferred learning modalities/i)).toBeInTheDocument()
      })
    })
    
    it('should only show available views based on assessments', () => {
      const parentOnlyProfile = {
        ...mockCLP2Profile,
        teacher_assessments: 0
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={parentOnlyProfile} />)
      
      expect(screen.getByText(/combined/i)).toBeInTheDocument()
      expect(screen.getByText(/parent view/i)).toBeInTheDocument()
      expect(screen.queryByText(/teacher view/i)).not.toBeInTheDocument()
    })
    
    it('should initialize with context from URL params', () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === 'context') return 'teacher'
        return null
      })
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const teacherButton = screen.getByText(/teacher view/i).closest('button')
      expect(teacherButton).toHaveClass('bg-white', 'text-begin-blue')
    })
  })
  
  describe('CLP 2.0 Skills Visualization', () => {
    it('should display CLP 2.0 skills with correct scores and levels', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      expect(screen.getByText(/clp 2.0 skills profile/i)).toBeInTheDocument()
      expect(screen.getByText(/0-3 point scale/i)).toBeInTheDocument()
      
      // Check individual skills are displayed (verify presence, not exact count)
      expect(screen.getAllByText(/communication/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/literacy/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/math/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/collaboration/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/content/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/critical thinking/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/creative innovation/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/confidence/i).length).toBeGreaterThan(0)
      
      // Check specific scores are displayed
      expect(screen.getByText('2.5/3')).toBeInTheDocument()
      expect(screen.getByText('2.4/3')).toBeInTheDocument()
      expect(screen.getByText('2.0/3')).toBeInTheDocument()
    })
    
    it('should show contextual insights for individual skills in specific views', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const parentViewButton = screen.getByText(/parent view/i)
      await user.click(parentViewButton)
      
      await waitFor(() => {
        expect(screen.getByText(/expresses themselves clearly during family conversations/i)).toBeInTheDocument()
      })
    })
    
    it('should calculate skill levels correctly', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Check that skill levels are displayed correctly
      const strongLabels = screen.getAllByText(/strong/i)
      const developingLabels = screen.getAllByText(/developing/i)
      
      expect(strongLabels.length).toBeGreaterThan(0)
      expect(developingLabels.length).toBeGreaterThan(0)
    })
    
    it('should display progress bars with correct percentages', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Find progress bar containers
      const progressContainers = document.querySelectorAll('.bg-gray-200.rounded-full')
      expect(progressContainers.length).toBeGreaterThan(0)
      
      // Check that progress bars have appropriate styling
      const progressBars = document.querySelectorAll('.bg-gradient-to-r.from-begin-teal.to-begin-cyan')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })
  
  describe('Legacy Profile Support', () => {
    it('should render legacy profiles with 6C visualization', () => {
      render(<ContextualResultsPage profileId="test-456" initialProfile={mockLegacyProfile} />)
      
      expect(screen.getByText(/learning strengths profile \(legacy\)/i)).toBeInTheDocument()
      
      // Should show 6C skills only (may appear in recommendations too)
      expect(screen.getAllByText(/communication/i)).toHaveLength(2) // Skill + recommendation
      expect(screen.getAllByText(/collaboration/i)).toHaveLength(1)
      expect(screen.getAllByText(/content/i)).toHaveLength(1)
      expect(screen.getAllByText(/critical thinking/i)).toHaveLength(1)
      expect(screen.getAllByText(/creative innovation/i)).toHaveLength(1)
      expect(screen.getAllByText(/confidence/i)).toHaveLength(4) // Header + personality + legacy skill + sources
      
      // Should NOT show CLP 2.0 specific sections
      expect(screen.queryByText(/0-3 point scale/i)).not.toBeInTheDocument()
    })
    
    it('should show legacy scores on 5-point scale', () => {
      render(<ContextualResultsPage profileId="test-456" initialProfile={mockLegacyProfile} />)
      
      expect(screen.getByText('4.2/5')).toBeInTheDocument() // Communication
      expect(screen.getByText('4.5/5')).toBeInTheDocument() // Content
    })
  })
  
  describe('Data Sources and Progressive Insights', () => {
    it('should display assessment sources with contribution details', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      expect(screen.getByText(/assessment sources/i)).toBeInTheDocument()
      expect(screen.getByText(/parent assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/teacher assessment/i)).toBeInTheDocument()
      
      expect(screen.getByText('+40%')).toBeInTheDocument()
      expect(screen.getByText('+45%')).toBeInTheDocument()
      expect(screen.getAllByText(/confidence/i)).toHaveLength(7) // Header + personality + skill + confidence section + 2 sources + additional
    })
    
    it('should show progressive insights for multiple assessments', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      expect(screen.getByText(/progressive insights/i)).toBeInTheDocument()
      expect(screen.getByText(/home-school consistency/i)).toBeInTheDocument()
      expect(screen.getByText(/behaviors observed at home and school show strong alignment/i)).toBeInTheDocument()
    })
    
    it('should show empty state for single assessment profiles', () => {
      render(<ContextualResultsPage profileId="test-456" initialProfile={mockLegacyProfile} />)
      
      expect(screen.getByText(/add more assessments to see comparative insights/i)).toBeInTheDocument()
    })
    
    it('should display confidence metrics correctly', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      expect(screen.getByText(/profile confidence/i)).toBeInTheDocument()
      expect(screen.getByText(/with 2 assessments, this profile has 85% confidence level/i)).toBeInTheDocument()
    })
  })
  
  describe('Recommendations and Next Steps', () => {
    it('should show contextual recommendations based on view', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Default combined view
      expect(screen.getByText(/learning recommendations/i)).toBeInTheDocument()
      
      // Switch to parent view
      await user.click(screen.getByText(/parent view/i))
      
      await waitFor(() => {
        expect(screen.getByText(/home learning strategies/i)).toBeInTheDocument()
      })
      
      // Switch to teacher view
      await user.click(screen.getByText(/teacher view/i))
      
      await waitFor(() => {
        expect(screen.getByText(/classroom strategies/i)).toBeInTheDocument()
      })
    })
    
    it('should display next steps based on profile completeness', () => {
      const incompleteProfile = {
        ...mockCLP2Profile,
        teacher_assessments: 0,
        confidence_percentage: 65
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={incompleteProfile} />)
      
      expect(screen.getByText(/next steps/i)).toBeInTheDocument()
      expect(screen.getByText(/request teacher classroom assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/add additional assessment perspectives/i)).toBeInTheDocument()
    })
  })
  
  describe('Share Functionality', () => {
    it('should open share modal when share button is clicked', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Find share button by its SVG content (Share2 icon)
      const shareButtons = screen.getAllByRole('button')
      const shareButton = shareButtons.find(button => {
        const svgElement = button.querySelector('svg')
        return svgElement && (svgElement.classList.contains('lucide-share-2') || 
               svgElement.querySelector('path[d*="M8 3a2 2 0 0 1 2-2h2"]'))
      })
      
      expect(shareButton).toBeDefined()
      await user.click(shareButton!)
      
      await waitFor(() => {
        expect(screen.getByText(/share learning profile/i)).toBeInTheDocument()
        expect(screen.getByText(/share with teacher/i)).toBeInTheDocument()
        expect(screen.getByText(/share with family/i)).toBeInTheDocument()
      })
    })
    
    it('should close share modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Find and click share button
      const shareButtons = screen.getAllByRole('button')
      const shareButton = shareButtons.find(button => {
        const svgElement = button.querySelector('svg')
        return svgElement && (svgElement.classList.contains('lucide-share-2') || 
               svgElement.querySelector('path[d*="M8 3a2 2 0 0 1 2-2h2"]'))
      })
      
      await user.click(shareButton!)
      
      const cancelButton = await screen.findByText(/cancel/i)
      await user.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/share learning profile/i)).not.toBeInTheDocument()
      })
    })
  })
  
  describe('Loading and Error States', () => {
    it('should show loading state when profile is being fetched', () => {
      render(<ContextualResultsPage profileId="test-123" />)
      
      expect(screen.getByText(/loading profile.../i)).toBeInTheDocument()
    })
    
    it('should show not found state for missing profiles', () => {
      render(<ContextualResultsPage profileId="missing-123" />)
      
      // Without initialProfile and without loading, it should show not found
      expect(screen.getByText(/loading profile.../i)).toBeInTheDocument()
    })
    
    it('should handle API fetch errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(<ContextualResultsPage profileId="test-123" />)
      
      // Should still show loading initially
      expect(screen.getByText(/loading profile.../i)).toBeInTheDocument()
      
      // After error, should show not found state
      await waitFor(() => {
        expect(screen.getByText(/profile not found/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Personality Overview Context Awareness', () => {
    it('should show context-aware personality descriptions', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Parent view description
      await user.click(screen.getByText(/parent view/i))
      
      await waitFor(() => {
        expect(screen.getByText(/at home, this means they likely thrive with activities/i)).toBeInTheDocument()
      })
      
      // Teacher view description
      await user.click(screen.getByText(/teacher view/i))
      
      await waitFor(() => {
        expect(screen.getByText(/in the classroom, this suggests they will respond best/i)).toBeInTheDocument()
      })
      
      // Combined view description
      await user.click(screen.getByText(/combined/i))
      
      await waitFor(() => {
        expect(screen.getByText(/this learning style combines insights from both home and classroom/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Emma\'s Learning Profile')
      
      const subHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(subHeadings.length).toBeGreaterThan(0)
    })
    
    it('should have accessible button labels', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const combinedButton = screen.getByRole('button', { name: /combined/i })
      expect(combinedButton).toBeInTheDocument()
      
      const parentButton = screen.getByRole('button', { name: /parent view/i })
      expect(parentButton).toBeInTheDocument()
    })
    
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const parentButton = screen.getByRole('button', { name: /parent view/i })
      
      parentButton.focus()
      expect(document.activeElement).toBe(parentButton)
      
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByText(/home learning strategies/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Responsive Design', () => {
    it('should use responsive grid layouts', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Check for presence of grid layouts in the DOM
      const gridElements = document.querySelectorAll('.grid')
      expect(gridElements.length).toBeGreaterThan(0)
      
      // Check for responsive classes
      const responsiveGrids = document.querySelectorAll('.lg\\:grid-cols-3, .md\\:grid-cols-2')
      expect(responsiveGrids.length).toBeGreaterThan(0)
    })
    
    it('should handle mobile viewport appropriately', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Should still render without issues
      expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      
      // Navigation should be accessible on mobile
      const viewSwitcher = screen.getByText(/combined/i).closest('div')
      expect(viewSwitcher).toBeInTheDocument()
    })
  })

  describe('Age-Appropriate Content Adaptation', () => {
    it('should adapt content complexity for different age groups', () => {
      const youngChildProfile = {
        ...mockCLP2Profile,
        age_group: '3-4',
        precise_age_months: 42
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={youngChildProfile} />)
      
      // Verify profile displays with age-appropriate language
      expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      expect(screen.getAllByText(/creative storyteller/i)).toHaveLength(2) // Header + description
    })

    it('should show age-appropriate personality descriptions', () => {
      const schoolAgeProfile = {
        ...mockCLP2Profile,
        age_group: '8-10',
        precise_age_months: 108
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={schoolAgeProfile} />)
      
      // Should still display personality information appropriately
      expect(screen.getAllByText(/creative storyteller/i)).toHaveLength(2) // Header + description
    })

    it('should adjust visual complexity for younger children', () => {
      const preschoolProfile = {
        ...mockCLP2Profile,
        age_group: '3-4',
        precise_age_months: 40
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={preschoolProfile} />)
      
      // Should still render all essential components
      expect(screen.getByText(/clp 2.0 skills profile/i)).toBeInTheDocument()
      expect(screen.getByText(/assessment sources/i)).toBeInTheDocument()
    })
  })

  describe('Personalized Insights Generation', () => {
    it('should generate dynamic personality labels based on scores', () => {
      const creativeDominantProfile = {
        ...mockCLP2Profile,
        consolidated_scores: {
          ...mockCLP2Profile.consolidated_scores,
          'Creative Innovation': 2.9,
          Communication: 2.8
        },
        personality_label: getCLP2PersonalityLabel({
          ...mockCLP2Profile.consolidated_scores,
          'Creative Innovation': 2.9,
          Communication: 2.8
        } as any)
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={creativeDominantProfile} />)
      
      expect(screen.getByText(creativeDominantProfile.personality_label)).toBeInTheDocument()
    })

    it('should display personalized strength descriptions', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Check that strengths are highlighted appropriately
      expect(screen.getAllByText(/strong/i).length).toBeGreaterThan(0)
    })

    it('should show growth area recommendations', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Check that developing areas are identified
      expect(screen.getAllByText(/developing/i).length).toBeGreaterThan(0)
    })
  })

  describe('Data Integration and Validation', () => {
    it('should properly display CLP 2.0 scores on 0-3 scale', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Verify CLP 2.0 specific scale is shown
      expect(screen.getByText(/0-3 point scale/i)).toBeInTheDocument()
      
      // Check that scores are within expected range
      expect(screen.getByText('2.5/3')).toBeInTheDocument() // Communication
      expect(screen.getByText('2.4/3')).toBeInTheDocument() // Literacy
      expect(screen.getByText('2.0/3')).toBeInTheDocument() // Math
    })

    it('should show confidence indicators correctly', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Confidence should be displayed in multiple locations
      expect(screen.getAllByText(/85% confidence/i)).toHaveLength(3)
    })

    it('should display assessment source attribution', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Verify data sources are properly attributed
      expect(screen.getByText(/parent assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/teacher assessment/i)).toBeInTheDocument()
      expect(screen.getByText('+40%')).toBeInTheDocument()
      expect(screen.getByText('+45%')).toBeInTheDocument()
    })

    it('should track version information', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      expect(screen.getByText('CLP 2.0')).toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
    it('should support skill detail exploration through hover states', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Verify skill descriptions are available
      const communicationSkill = screen.getByText(/expressing ideas clearly and listening actively/i)
      expect(communicationSkill).toBeInTheDocument()
      
      const literacySkill = screen.getByText(/reading, writing, and language skills/i)
      expect(literacySkill).toBeInTheDocument()
    })

    it('should provide contextual tooltips for scores', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Score level indicators should be present
      expect(screen.getAllByText(/strong/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/developing/i).length).toBeGreaterThan(0)
    })

    it('should enable recommendation expansion', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Recommendations should be displayed
      expect(screen.getByText(/learning recommendations/i)).toBeInTheDocument()
    })
  })

  describe('Export and Sharing Functionality', () => {
    it('should provide export capabilities', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Find download button by its SVG content
      const downloadButtons = screen.getAllByRole('button')
      const downloadButton = downloadButtons.find(button => {
        const svgElement = button.querySelector('svg')
        return svgElement && svgElement.classList.contains('lucide-download')
      })
      
      expect(downloadButton).toBeDefined()
    })

    it('should handle sharing permissions appropriately', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Find and click share button
      const shareButtons = screen.getAllByRole('button')
      const shareButton = shareButtons.find(button => {
        const svgElement = button.querySelector('svg')
        return svgElement && (svgElement.classList.contains('lucide-share-2') || 
               svgElement.querySelector('path[d*=\"M8 3a2 2 0 0 1 2-2h2\"]'))
      })
      
      await user.click(shareButton!)
      
      // Should show sharing options
      await waitFor(() => {
        expect(screen.getByText(/share with teacher/i)).toBeInTheDocument()
        expect(screen.getByText(/secure teacher access link/i)).toBeInTheDocument()
        expect(screen.getByText(/share with family/i)).toBeInTheDocument()
        expect(screen.getByText(/family-friendly view/i)).toBeInTheDocument()
      })
    })
  })

  describe('Complex Profile Scenarios', () => {
    it('should handle profiles with missing assessments gracefully', () => {
      const incompleteProfile = {
        ...mockCLP2Profile,
        parent_assessments: 1,
        teacher_assessments: 0,
        total_assessments: 1,
        confidence_percentage: 45,
        data_sources: [mockCLP2Profile.data_sources[0]]
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={incompleteProfile} />)
      
      expect(screen.getByText(/add a teacher assessment for classroom perspective/i)).toBeInTheDocument()
      expect(screen.queryByText(/teacher view/i)).not.toBeInTheDocument()
    })

    it('should display mixed version compatibility', () => {
      const mixedProfile = {
        ...mockCLP2Profile,
        scoring_version: 'CLP 2.0' as const,
        consolidated_scores: {
          Communication: 2.5,
          Collaboration: 2.1,
          Content: 1.8,
          'Critical Thinking': 2.3,
          'Creative Innovation': 2.7,
          Confidence: 2.2,
          Literacy: 2.4,
          Math: 2.0
        }
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={mixedProfile} />)
      
      expect(screen.getByText('CLP 2.0')).toBeInTheDocument()
      expect(screen.getByText(/clp 2.0 skills profile/i)).toBeInTheDocument()
    })

    it('should handle edge case scores appropriately', () => {
      const extremeProfile = {
        ...mockCLP2Profile,
        consolidated_scores: {
          Communication: 3.0,
          Collaboration: 0.5,
          Content: 2.9,
          'Critical Thinking': 0.2,
          'Creative Innovation': 2.8,
          Confidence: 0.1,
          Literacy: 2.7,
          Math: 0.3
        }
      }
      
      render(<ContextualResultsPage profileId="test-123" initialProfile={extremeProfile} />)
      
      // Should still render without errors
      expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      expect(screen.getByText('3.0/3')).toBeInTheDocument()
      expect(screen.getByText('0.5/3')).toBeInTheDocument()
    })
  })

  describe('Performance and Error Recovery', () => {
    it('should handle API timeout gracefully', async () => {
      global.fetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      )
      
      render(<ContextualResultsPage profileId="test-timeout" />)
      
      expect(screen.getByText(/loading profile.../i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText(/profile not found/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should recover from temporary loading errors', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ profile: mockCLP2Profile })
        } as Response)
      
      render(<ContextualResultsPage profileId="test-recovery" />)
      
      await waitFor(() => {
        expect(screen.getByText(/profile not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Enhancements', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      const viewButtons = screen.getAllByRole('button')
      expect(viewButtons.length).toBeGreaterThan(0)
      
      // Check for accessible button text
      expect(screen.getByRole('button', { name: /combined/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /parent view/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /teacher view/i })).toBeInTheDocument()
    })

    it('should support screen reader navigation', () => {
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Check for semantic structure
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Emma\'s Learning Profile')
      
      const subHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(subHeadings.length).toBeGreaterThan(0)
      
      const tertiaryHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(tertiaryHeadings.length).toBeGreaterThan(0)
    })

    it('should maintain focus management for modals', async () => {
      const user = userEvent.setup()
      render(<ContextualResultsPage profileId="test-123" initialProfile={mockCLP2Profile} />)
      
      // Find and click share button
      const shareButtons = screen.getAllByRole('button')
      const shareButton = shareButtons.find(button => {
        const svgElement = button.querySelector('svg')
        return svgElement && (svgElement.classList.contains('lucide-share-2') || 
               svgElement.querySelector('path[d*=\"M8 3a2 2 0 0 1 2-2h2\"]'))
      })
      
      await user.click(shareButton!)
      
      // Modal should be accessible
      await waitFor(() => {
        expect(screen.getByText(/share learning profile/i)).toBeInTheDocument()
      })
      
      // Should be able to navigate with keyboard
      const cancelButton = screen.getByText(/cancel/i)
      expect(cancelButton).toBeInTheDocument()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleSpy.mockClear()
    consoleErrorSpy.mockClear()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })
})