/**
 * Test Suite: QuizContextSelector Component
 * 
 * Tests the CLP 2.0 multi-quiz context selection component:
 * - Parent home assessment context
 * - Teacher classroom assessment context  
 * - General comprehensive assessment context
 * - Context-specific question counts and timing
 * - Detailed information display
 * - Accessibility and responsive design
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuizContextSelector from '@/components/QuizContextSelector'

// Mock the multi-quiz-system module
jest.mock('@/lib/multi-quiz-system', () => ({
  getParentQuizQuestions: jest.fn((ageGroup) => ({
    questionCount: 19,
    questions: Array.from({ length: 19 }, (_, i) => ({ id: i + 1 }))
  })),
  getTeacherQuizQuestions: jest.fn((ageGroup) => ({
    questionCount: 12,
    questions: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }))
  })),
  getSkillCoverage: jest.fn((contextType) => {
    const mockCoverage = [
      { skill: 'Communication', coverage: contextType === 'parent_home' ? 'full' : 'partial' },
      { skill: 'Collaboration', coverage: 'full' },
      { skill: 'Content', coverage: contextType === 'teacher_classroom' ? 'full' : 'partial' },
      { skill: 'Critical Thinking', coverage: 'full' },
      { skill: 'Creative Innovation', coverage: 'partial' },
      { skill: 'Confidence', coverage: 'full' },
      { skill: 'Literacy', coverage: contextType === 'teacher_classroom' ? 'full' : 'none' },
      { skill: 'Math', coverage: contextType === 'teacher_classroom' ? 'full' : 'none' }
    ]
    return mockCoverage
  })
}))

describe('QuizContextSelector', () => {
  const mockOnContextSelect = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  describe('Context Options Rendering', () => {
    it('should render all three assessment context options', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      expect(screen.getByText(/parent assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/home & family context/i)).toBeInTheDocument()
      
      expect(screen.getByText(/teacher assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/classroom & academic context/i)).toBeInTheDocument()
      
      expect(screen.getByText(/complete assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/comprehensive profile/i)).toBeInTheDocument()
    })
    
    it('should display correct question counts and timing estimates', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      // Parent assessment: 19 questions, ~14 min (19 * 0.75)
      expect(screen.getByText(/~14 min/i)).toBeInTheDocument()
      expect(screen.getByText(/19 questions/i)).toBeInTheDocument()
      
      // Teacher assessment: 12 questions, ~7 min (12 * 0.6)
      expect(screen.getByText(/~7 min/i)).toBeInTheDocument()
      expect(screen.getByText(/12 questions/i)).toBeInTheDocument()
      
      // Complete assessment: 28 questions, ~18 min
      expect(screen.getByText(/~18 min/i)).toBeInTheDocument()
      expect(screen.getByText(/28 questions/i)).toBeInTheDocument()
    })
    
    it('should show proper skill focus descriptions', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      expect(screen.getByText(/communication, creativity, academic foundations/i)).toBeInTheDocument()
      expect(screen.getByText(/collaboration, content mastery, academic skills/i)).toBeInTheDocument()
      expect(screen.getByText(/all 6cs \+ literacy \+ math \+ preferences/i)).toBeInTheDocument()
    })
  })
  
  describe('Context Selection Interaction', () => {
    it('should handle parent assessment selection', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')
      await user.click(parentCard!)
      
      expect(mockOnContextSelect).toHaveBeenCalledWith({
        quizType: 'parent_home',
        ageGroup: '5+',
        questionCount: 19,
        estimatedTime: 15 // Math.ceil(19 * 0.75)
      })
      
      // Should show selected state
      expect(parentCard).toHaveClass('ring-2')
    })
    
    it('should handle teacher assessment selection', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="4-5" />)
      
      const teacherCard = screen.getByText(/teacher assessment/i).closest('div')
      await user.click(teacherCard!)
      
      expect(mockOnContextSelect).toHaveBeenCalledWith({
        quizType: 'teacher_classroom',
        ageGroup: '4-5',
        questionCount: 12,
        estimatedTime: 8 // Math.ceil(12 * 0.6)
      })
    })
    
    it('should handle complete assessment selection', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="3-4" />)
      
      const completeCard = screen.getByText(/complete assessment/i).closest('div')
      await user.click(completeCard!)
      
      expect(mockOnContextSelect).toHaveBeenCalledWith({
        quizType: 'general',
        ageGroup: '3-4',
        questionCount: 28,
        estimatedTime: 18
      })
    })
    
    it('should handle button click within card', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentButton = within(screen.getByText(/parent assessment/i).closest('div')!)
        .getByText(/choose this assessment/i)
      
      await user.click(parentButton)
      
      expect(mockOnContextSelect).toHaveBeenCalledWith({
        quizType: 'parent_home',
        ageGroup: '5+',
        questionCount: 19,
        estimatedTime: 15
      })
    })
  })
  
  describe('Detailed Information Display', () => {
    it('should toggle detailed information for parent assessment', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')!
      const infoButton = within(parentCard).getByRole('button', { name: '' }) // Info icon
      
      // Click to show details
      await user.click(infoButton)
      
      await waitFor(() => {
        expect(screen.getByText(/what's included:/i)).toBeInTheDocument()
        expect(screen.getByText(/home behavior/i)).toBeInTheDocument()
        expect(screen.getByText(/family interactions/i)).toBeInTheDocument()
        expect(screen.getByText(/learning preferences/i)).toBeInTheDocument()
        expect(screen.getByText(/academic interests/i)).toBeInTheDocument()
      })
      
      expect(screen.getByText(/benefits:/i)).toBeInTheDocument()
      expect(screen.getByText(/complete learning preferences profile/i)).toBeInTheDocument()
      expect(screen.getByText(/comprehensive 19-question assessment/i)).toBeInTheDocument()
      
      // Click again to hide details
      await user.click(infoButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/what's included:/i)).not.toBeInTheDocument()
      })
    })
    
    it('should show skill coverage visualization', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')!
      const infoButton = within(parentCard).getByRole('button', { name: '' })
      
      await user.click(infoButton)
      
      await waitFor(() => {
        expect(screen.getByText(/skill coverage:/i)).toBeInTheDocument()
        
        // Check for different coverage indicators
        const checkCircles = screen.getAllByTestId(/check-circle|full-coverage/i)
        const partialCircles = screen.getAllByTestId(/partial-coverage/i)
        
        expect(checkCircles.length).toBeGreaterThan(0)
      })
    })
    
    it('should not show skill coverage for general assessment', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const generalCard = screen.getByText(/complete assessment/i).closest('div')!
      const infoButton = within(generalCard).getByRole('button', { name: '' })
      
      await user.click(infoButton)
      
      await waitFor(() => {
        expect(screen.getByText(/what's included:/i)).toBeInTheDocument()
        expect(screen.queryByText(/skill coverage:/i)).not.toBeInTheDocument()
      })
    })
  })
  
  describe('Help Section', () => {
    it('should display context selection help', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      expect(screen.getByText(/need help choosing\?/i)).toBeInTheDocument()
      
      // Parent section
      expect(screen.getByText(/choose parent assessment if:/i)).toBeInTheDocument()
      expect(screen.getByText(/you're a parent or family member/i)).toBeInTheDocument()
      expect(screen.getByText(/you want home-specific insights/i)).toBeInTheDocument()
      
      // Teacher section
      expect(screen.getByText(/choose teacher assessment if:/i)).toBeInTheDocument()
      expect(screen.getByText(/you're an educator or teacher/i)).toBeInTheDocument()
      expect(screen.getByText(/you focus on classroom behavior/i)).toBeInTheDocument()
      
      // Complete section
      expect(screen.getByText(/choose complete assessment if:/i)).toBeInTheDocument()
      expect(screen.getByText(/you want the most comprehensive profile/i)).toBeInTheDocument()
      expect(screen.getByText(/multiple people will use the results/i)).toBeInTheDocument()
    })
  })
  
  describe('Visual States and Styling', () => {
    it('should apply proper styling for unselected state', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')
      expect(parentCard).toHaveClass('border-pink-200', 'bg-pink-50')
      expect(parentCard).not.toHaveClass('ring-2')
    })
    
    it('should apply proper styling for selected state', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')
      await user.click(parentCard!)
      
      expect(parentCard).toHaveClass('ring-2', 'ring-offset-2')
    })
    
    it('should show different colors for different contexts', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')
      const teacherCard = screen.getByText(/teacher assessment/i).closest('div')
      const generalCard = screen.getByText(/complete assessment/i).closest('div')
      
      expect(parentCard).toHaveClass('border-pink-200', 'bg-pink-50')
      expect(teacherCard).toHaveClass('border-blue-200', 'bg-blue-50')
      expect(generalCard).toHaveClass('border-green-200', 'bg-green-50')
    })
    
    it('should update button text based on selection state', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')!
      const button = within(parentCard).getByText(/choose this assessment/i)
      
      await user.click(parentCard)
      
      await waitFor(() => {
        expect(within(parentCard).getByText(/selected/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Age Group Variations', () => {
    it('should handle different age groups correctly', () => {
      const { rerender } = render(
        <QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="3-4" />
      )
      
      expect(screen.getByText(/28 questions/i)).toBeInTheDocument()
      
      rerender(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="6+" />)
      
      expect(screen.getByText(/28 questions/i)).toBeInTheDocument() // General assessment stays same
    })
  })
  
  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      // Cards should be clickable and accessible
      const parentCard = screen.getByText(/parent assessment/i).closest('div')
      expect(parentCard).toHaveClass('cursor-pointer')
      
      // Info buttons should be accessible
      const infoButtons = screen.getAllByRole('button', { name: '' })
      expect(infoButtons).toHaveLength(3) // One for each context
    })
    
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')!
      const parentButton = within(parentCard).getByText(/choose this assessment/i)
      
      // Focus and activate with keyboard
      parentButton.focus()
      expect(document.activeElement).toBe(parentButton)
      
      await user.keyboard('{Enter}')
      expect(mockOnContextSelect).toHaveBeenCalled()
    })
    
    it('should provide screen reader friendly content', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      // Timing and question count should be clearly associated
      expect(screen.getByText(/~14 min/i)).toBeInTheDocument()
      expect(screen.getByText(/19 questions/i)).toBeInTheDocument()
      
      // Context descriptions should be clear
      expect(screen.getByText(/focus on behavior, learning, and development at home/i)).toBeInTheDocument()
    })
  })
  
  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <QuizContextSelector 
          onContextSelect={mockOnContextSelect} 
          ageGroup="5+" 
          className="custom-class" 
        />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
  
  describe('Error Handling', () => {
    it('should handle missing onContextSelect callback gracefully', () => {
      expect(() => {
        render(<QuizContextSelector onContextSelect={undefined as any} ageGroup="5+" />)
      }).not.toThrow()
    })
    
    it('should handle invalid age group gracefully', () => {
      expect(() => {
        render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="invalid" as any />)
      }).not.toThrow()
    })
  })
  
  describe('Responsive Design', () => {
    it('should use responsive grid classes', () => {
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const gridContainer = screen.getByText(/parent assessment/i).closest('div')!.parentElement
      expect(gridContainer).toHaveClass('grid', 'md:grid-cols-3')
    })
    
    it('should handle touch interactions on mobile', async () => {
      const user = userEvent.setup()
      render(<QuizContextSelector onContextSelect={mockOnContextSelect} ageGroup="5+" />)
      
      const parentCard = screen.getByText(/parent assessment/i).closest('div')!
      
      // Should be touch-friendly
      expect(parentCard).toHaveClass('cursor-pointer')
      
      // Touch interaction should work
      await user.click(parentCard)
      expect(mockOnContextSelect).toHaveBeenCalled()
    })
  })
})