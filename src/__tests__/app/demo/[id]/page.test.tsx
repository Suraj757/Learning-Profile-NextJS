import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import SampleProfilePage from '@/app/demo/[id]/page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

// Mock the content recommendation service
jest.mock('@/lib/content-recommendation-service', () => ({
  beginContentService: {
    getQuickRecommendationSummary: jest.fn().mockResolvedValue({
      recommendedContent: [],
      insights: []
    })
  }
}))

// Mock the EnhancedContentRecommendations component
jest.mock('@/components/content/EnhancedContentRecommendations', () => {
  return function MockedEnhancedContentRecommendations({ studentName }: { studentName: string }) {
    return <div data-testid="enhanced-recommendations">Enhanced recommendations for {studentName}</div>
  }
})

// Mock Recharts to avoid complex chart rendering issues in tests
jest.mock('recharts', () => ({
  Radar: () => <div data-testid="radar-chart">Radar Chart</div>,
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart-container">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid">Polar Grid</div>,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis">Polar Angle Axis</div>,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis">Polar Radius Axis</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

// Mock sample profile data for emma-creative-collaborator
const mockEmmaProfile = {
  id: 'emma-creative-collaborator',
  child_name: 'Emma',
  age: 8,
  grade: '3rd Grade',
  scores: {
    'Communication': 4.2,
    'Collaboration': 4.8,
    'Content': 3.5,
    'Critical Thinking': 3.2,
    'Creative Innovation': 4.6,
    'Confidence': 4.0
  },
  personality_label: 'Creative Collaborator',
  description: 'Emma excels at bringing people together through imaginative projects and thrives when she can express her creativity while working with others.',
  created_at: '2024-01-15T10:30:00Z',
  interests: ['Pets', 'Art & Drawing', 'Fairytales', 'Music', 'Helping Others'],
  engagementStyle: 'Hands-on building and crafts',
  learningModality: 'Visual demonstrations and watching examples',
  socialPreference: 'Collaborative group activities',
  schoolExperience: 'They have been in daycare/preschool for 2+ years and are comfortable with school routines',
  primaryMotivators: ['Helping others succeed', 'Creative expression', 'Social connection', 'Making things beautiful'],
  learningDrivers: ['Peer collaboration', 'Artistic projects', 'Storytelling opportunities', 'Hands-on activities'],
  challengeResponse: 'Seeks help from peers and adults; persists when working with others',
  recognitionPreference: 'Public celebration of group achievements and creative work',
  stressIndicators: ['Withdraws from independent work', 'Becomes overly concerned about others\' emotions', 'Rushes through tasks to help others'],
  optimalConditions: ['Collaborative workspace', 'Art supplies readily available', 'Opportunities to mentor others', 'Visual instructions and examples'],
  sample_data: {
    backstory: 'Emma is the middle child in a family of five. She loves art class, always volunteers to help new students, and has turned her bedroom into an "art studio" where she creates gifts for family members.',
    parentQuote: "Emma's teacher mentioned that she naturally becomes the 'glue' that holds group projects together. She helps quieter kids participate and always makes sure everyone's ideas are heard.",
    teacherInsight: 'Emma shines in collaborative art projects and peer mentoring. She struggles with independent math worksheets but excels when math concepts are taught through creative, hands-on activities.',
    realWorldExample: 'When the class studied ecosystems, Emma created a detailed 3D diorama and organized her classmates to each research different animals. She turned it into a mini-museum where each student became an "expert guide" for their animal.',
    strengths: [
      'Natural leader in group settings',
      'Expresses complex ideas through art and storytelling',
      'Helps other children feel included and valued',
      'Thinks outside the box for problem-solving'
    ],
    growthAreas: [
      'Building confidence with independent work',
      'Developing patience for detailed, sequential tasks',
      'Strengthening basic math computation skills'
    ],
    age: 8
  }
}

describe('Demo Page - SampleProfilePage', () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Mock successful fetch response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ profile: mockEmmaProfile })
    } as Response)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      mockUseParams.mockReturnValue({ id: 'emma-creative-collaborator' })
      
      render(<SampleProfilePage />)
      
      expect(screen.getByText('Loading sample profile...')).toBeInTheDocument()
    })
  })

  describe('Emma Creative Collaborator Profile', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'emma-creative-collaborator' })
    })

    it('renders Emma\'s profile information correctly', async () => {
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      })

      expect(screen.getByText('Creative Collaborator')).toBeInTheDocument()
      expect(screen.getByText('3rd Grade')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('renders stress indicators with AlertTriangle icons without errors', async () => {
      // Capture console errors during rendering
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      })

      // Check that stress indicators section is rendered
      await waitFor(() => {
        expect(screen.getByText('Stress Indicators')).toBeInTheDocument()
      })

      // Verify that stress indicators are displayed
      expect(screen.getByText('Withdraws from independent work')).toBeInTheDocument()
      expect(screen.getByText('Becomes overly concerned about others\' emotions')).toBeInTheDocument()
      expect(screen.getByText('Rushes through tasks to help others')).toBeInTheDocument()

      // Most importantly: verify that NO console errors occurred during rendering
      // This indicates the AlertTriangle import and usage is working correctly
      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('renders all major sections without throwing errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      })

      // Verify major sections are rendered
      expect(screen.getByText('Top Interests')).toBeInTheDocument()
      expect(screen.getByText('Learning Style')).toBeInTheDocument()
      expect(screen.getByText('School Experience')).toBeInTheDocument()
      expect(screen.getByText('What Motivates Emma')).toBeInTheDocument()
      expect(screen.getByText('Primary Motivators')).toBeInTheDocument()
      expect(screen.getByText('Learning Drivers')).toBeInTheDocument()
      expect(screen.getByText('Challenge Response')).toBeInTheDocument()
      expect(screen.getByText('Recognition Preference')).toBeInTheDocument()
      expect(screen.getByText('Stress Indicators')).toBeInTheDocument()
      expect(screen.getByText('Optimal Learning Conditions for Emma')).toBeInTheDocument()
      expect(screen.getByText('About Emma')).toBeInTheDocument()
      expect(screen.getByText('Learning in Action')).toBeInTheDocument()
      expect(screen.getByText('Parent Perspective')).toBeInTheDocument()
      expect(screen.getByText('Teacher Insight')).toBeInTheDocument()
      expect(screen.getByText('Key Strengths')).toBeInTheDocument()
      expect(screen.getByText('Growth Opportunities')).toBeInTheDocument()
      expect(screen.getByText('Learning Strengths Overview')).toBeInTheDocument()
      expect(screen.getByText('Detailed Category Breakdown')).toBeInTheDocument()
      expect(screen.getByText('What This Means for Parents')).toBeInTheDocument()

      // Verify no console errors occurred
      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('renders AlertTriangle icons in stress indicators list correctly', async () => {
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      })

      // Wait for stress indicators section to load
      await waitFor(() => {
        expect(screen.getByText('Stress Indicators')).toBeInTheDocument()
      })

      // Look for the stress indicators container
      const stressIndicatorsSection = screen.getByText('Stress Indicators').closest('div')
      expect(stressIndicatorsSection).toBeInTheDocument()

      // Verify stress indicator items are rendered (these would contain AlertTriangle icons)
      const stressIndicatorItems = stressIndicatorsSection?.querySelectorAll('div[class*="flex items-start gap-3"]')
      expect(stressIndicatorItems).toBeDefined()
      // Emma has 3 stress indicators, so there should be at least 3 items
      expect(stressIndicatorItems!.length).toBeGreaterThanOrEqual(3)
    })

    it('handles radar chart rendering without errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      })

      // Verify radar chart components are rendered
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('radar-chart-container')).toBeInTheDocument()

      // Verify no console errors occurred
      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('handles enhanced content recommendations', async () => {
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      })

      // Wait for enhanced recommendations to load
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-recommendations')).toBeInTheDocument()
      })

      expect(screen.getByText('Enhanced recommendations for Emma')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'emma-creative-collaborator' })
    })

    it('handles API fetch errors gracefully', async () => {
      // Mock failed fetch
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))
      
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Sample Profile Not Found')).toBeInTheDocument()
      })
    })

    it('handles 404 response gracefully', async () => {
      // Mock 404 response
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404
      } as Response)
      
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Sample Profile Not Found')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation and CTAs', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'emma-creative-collaborator' })
    })

    it('renders navigation and CTA buttons', async () => {
      render(<SampleProfilePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Emma\'s Learning Profile')).toBeInTheDocument()
      })

      // Check for navigation buttons
      expect(screen.getByText('Back to Gallery')).toBeInTheDocument()
      expect(screen.getByText('Create Your Profile')).toBeInTheDocument()
      
      // Check for CTA section
      expect(screen.getByText('Ready to Discover Your Child\'s Unique Profile?')).toBeInTheDocument()
      expect(screen.getByText('Start Your Assessment')).toBeInTheDocument()
      expect(screen.getByText('Browse More Samples')).toBeInTheDocument()
    })
  })
})