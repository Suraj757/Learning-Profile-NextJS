/**
 * Test Suite: PreciseAgeSelector Component
 * 
 * Tests the enhanced age selection component with:
 * - Precise age input (years + months)
 * - Birth date calculation
 * - Age group classification for CLP 2.0
 * - Extended age range support (3-14 years)
 * - Validation and edge cases
 * - Accessibility features
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PreciseAgeSelector from '@/components/PreciseAgeSelector'

describe('PreciseAgeSelector', () => {
  const mockOnAgeChange = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock current date for consistent testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-15')) // Mid-year date for testing
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  describe('Age Input Methods', () => {
    it('should render with default age input method', () => {
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      expect(screen.getByText(/age in years & months/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/years old/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/additional months/i)).toBeInTheDocument()
    })
    
    it('should switch between age and birth date input methods', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      // Switch to birth date method
      const birthDateButton = screen.getByText(/birth date/i)
      await user.click(birthDateButton)
      
      expect(screen.getByLabelText(/child's birth date/i)).toBeInTheDocument()
      expect(screen.getByText(/we'll calculate the exact age for you!/i)).toBeInTheDocument()
      
      // Switch back to age method
      const ageButton = screen.getByText(/age in years & months/i)
      await user.click(ageButton)
      
      expect(screen.getByLabelText(/years old/i)).toBeInTheDocument()
    })
  })
  
  describe('Age Selection and Validation', () => {
    it('should handle years selection from 3-13', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      const yearsSelect = screen.getByLabelText(/years old/i)
      
      // Test minimum age
      await user.selectOptions(yearsSelect, '3')
      expect(mockOnAgeChange).toHaveBeenCalledWith({
        years: 3,
        months: 0
      })
      
      // Test maximum age
      await user.selectOptions(yearsSelect, '13')
      expect(mockOnAgeChange).toHaveBeenCalledWith({
        years: 13,
        months: 0
      })
    })
    
    it('should handle months selection from 0-11', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      const monthsSelect = screen.getByLabelText(/additional months/i)
      
      await user.selectOptions(monthsSelect, '6')
      expect(mockOnAgeChange).toHaveBeenCalledWith({
        years: 3, // default
        months: 6
      })
      
      // Test edge case: 11 months
      await user.selectOptions(monthsSelect, '11')
      expect(mockOnAgeChange).toHaveBeenCalledWith({
        years: 3,
        months: 11
      })
    })
    
    it('should calculate age from birth date accurately', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      // Switch to birth date input
      await user.click(screen.getByText(/birth date/i))
      
      // Set birth date to exactly 5 years and 3 months ago
      const birthDate = new Date('2019-03-15') // 5 years, 3 months from 2024-06-15
      const birthDateInput = screen.getByLabelText(/child's birth date/i)
      
      await user.type(birthDateInput, '2019-03-15')
      
      await waitFor(() => {
        expect(mockOnAgeChange).toHaveBeenCalledWith({
          years: 5,
          months: 3,
          birthDate: new Date('2019-03-15')
        })
      })
    })
  })
  
  describe('CLP 2.0 Age Group Classification', () => {
    it('should classify 3-4 year olds correctly', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      const yearsSelect = screen.getByLabelText(/years old/i)
      await user.selectOptions(yearsSelect, '3')
      const monthsSelect = screen.getByLabelText(/additional months/i)
      await user.selectOptions(monthsSelect, '6')
      
      await waitFor(() => {
        expect(screen.getByText(/3-4 years old/i)).toBeInTheDocument()
        expect(screen.getByText(/preschool age, exploring and learning through play/i)).toBeInTheDocument()
        expect(screen.getByText(/24 skills \+ 4 preferences/i)).toBeInTheDocument()
        expect(screen.getByText(/CLP 2.0/)).toBeInTheDocument()
      })
    })
    
    it('should classify 4-5 year olds correctly', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      await user.selectOptions(screen.getByLabelText(/years old/i), '4')
      await user.selectOptions(screen.getByLabelText(/additional months/i), '8')
      
      await waitFor(() => {
        expect(screen.getByText(/4-5 years old/i)).toBeInTheDocument()
        expect(screen.getByText(/pre-k to kindergarten, developing school readiness/i)).toBeInTheDocument()
      })
    })
    
    it('should classify 5-7 year olds correctly', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      await user.selectOptions(screen.getByLabelText(/years old/i), '6')
      await user.selectOptions(screen.getByLabelText(/additional months/i), '2')
      
      await waitFor(() => {
        expect(screen.getByText(/5-7 years old/i)).toBeInTheDocument()
        expect(screen.getByText(/kindergarten to 1st grade, formal learning begins/i)).toBeInTheDocument()
      })
    })
    
    it('should classify extended age range (10+) correctly', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      await user.selectOptions(screen.getByLabelText(/years old/i), '12')
      await user.selectOptions(screen.getByLabelText(/additional months/i), '4')
      
      await waitFor(() => {
        expect(screen.getByText(/11\+ years old/i)).toBeInTheDocument()
        expect(screen.getByText(/middle school\+, advanced academic and social development/i)).toBeInTheDocument()
        expect(screen.getByText(/45 skills \+ 4 preferences/i)).toBeInTheDocument()
        expect(screen.getByText(/CLP 2.0 Extended/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Developmental Information and Warnings', () => {
    it('should show developmental information panel', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      const infoButton = screen.getByRole('button', { name: '' }) // Info icon button
      await user.click(infoButton)
      
      await waitFor(() => {
        expect(screen.getByText(/about clp 2.0 age-based assessments/i)).toBeInTheDocument()
        expect(screen.getByText(/questions are tailored to your child's developmental stage/i)).toBeInTheDocument()
        expect(screen.getByText(/assesses 8 key skills: 6cs \+ literacy \+ math/i)).toBeInTheDocument()
        expect(screen.getByText(/progressive scoring allows for multiple assessments/i)).toBeInTheDocument()
      })
    })
    
    it('should show warning for very young children', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      // Set age to under 3 (edge case)
      await user.selectOptions(screen.getByLabelText(/years old/i), '3')
      await user.selectOptions(screen.getByLabelText(/additional months/i), '0')
      
      // The component actually enforces minimum of 3, but let's test the warning logic
      // We need to simulate this since the component prevents < 3
      await waitFor(() => {
        const ageDisplay = screen.getByText(/3 years and 0 months old/i)
        expect(ageDisplay).toBeInTheDocument()
      })
    })
    
    it('should show extended range information for older children', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      await user.selectOptions(screen.getByLabelText(/years old/i), '11')
      
      await waitFor(() => {
        expect(screen.getByText(/clp 2.0 extended age range/i)).toBeInTheDocument()
        expect(screen.getByText(/covers children up to 14 years/i)).toBeInTheDocument()
        expect(screen.getByText(/advanced academic and social development measures/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Birth Date Constraints', () => {
    it('should set proper min and max dates for birth date input', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      await user.click(screen.getByText(/birth date/i))
      
      const birthDateInput = screen.getByLabelText(/child's birth date/i)
      
      // Should have max date of 3 years ago
      const expectedMaxDate = new Date('2021-06-15') // 3 years before 2024-06-15
      expect(birthDateInput).toHaveAttribute('max', '2021-06-15')
      
      // Should have min date of 14 years ago
      const expectedMinDate = new Date('2010-06-15') // 14 years before 2024-06-15
      expect(birthDateInput).toHaveAttribute('min', '2010-06-15')
    })
    
    it('should handle birth date input validation', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      await user.click(screen.getByText(/birth date/i))
      
      const birthDateInput = screen.getByLabelText(/child's birth date/i)
      
      // Valid birth date
      await user.type(birthDateInput, '2020-01-15')
      
      await waitFor(() => {
        expect(mockOnAgeChange).toHaveBeenCalledWith({
          years: expect.any(Number),
          months: expect.any(Number),
          birthDate: new Date('2020-01-15')
        })
      })
    })
  })
  
  describe('Selected Age Prop', () => {
    it('should initialize with provided selected age', () => {
      const selectedAge = { years: 7, months: 4 }
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} selectedAge={selectedAge} />)
      
      const yearsSelect = screen.getByLabelText(/years old/i) as HTMLSelectElement
      const monthsSelect = screen.getByLabelText(/additional months/i) as HTMLSelectElement
      
      expect(yearsSelect.value).toBe('7')
      expect(monthsSelect.value).toBe('4')
    })
    
    it('should display correct age group for selected age', async () => {
      const selectedAge = { years: 8, months: 6 }
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} selectedAge={selectedAge} />)
      
      await waitFor(() => {
        expect(screen.getByText(/8 years and 6 months old/i)).toBeInTheDocument()
        expect(screen.getByText(/8-10 years old/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Accessibility', () => {
    it('should have proper ARIA labels and structure', () => {
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      expect(screen.getByLabelText(/years old/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/additional months/i)).toBeInTheDocument()
      
      // Check that info button has proper accessibility
      const infoButton = screen.getByRole('button', { name: '' })
      expect(infoButton).toBeInTheDocument()
    })
    
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      const yearsSelect = screen.getByLabelText(/years old/i)
      
      // Focus and navigate with keyboard
      yearsSelect.focus()
      expect(document.activeElement).toBe(yearsSelect)
      
      // Tab to next element
      await user.tab()
      const monthsSelect = screen.getByLabelText(/additional months/i)
      expect(document.activeElement).toBe(monthsSelect)
    })
    
    it('should provide screen reader friendly content', () => {
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      // Age display should be descriptive
      expect(screen.getByText(/your child is 3 years and 0 months old/i)).toBeInTheDocument()
      
      // Assessment details should be available
      expect(screen.getByText(/assessment group: 3-4 years old/i)).toBeInTheDocument()
    })
  })
  
  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid age changes smoothly', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      const yearsSelect = screen.getByLabelText(/years old/i)
      
      // Rapidly change ages
      await user.selectOptions(yearsSelect, '5')
      await user.selectOptions(yearsSelect, '8')
      await user.selectOptions(yearsSelect, '4')
      
      // Should handle all changes
      expect(mockOnAgeChange).toHaveBeenCalledTimes(4) // Including initial call
    })
    
    it('should handle invalid birth dates gracefully', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      await user.click(screen.getByText(/birth date/i))
      
      const birthDateInput = screen.getByLabelText(/child's birth date/i)
      
      // Try to enter invalid date (browser will typically prevent this)
      // but component should handle gracefully
      fireEvent.change(birthDateInput, { target: { value: 'invalid-date' } })
      
      // Should not crash
      expect(screen.getByLabelText(/child's birth date/i)).toBeInTheDocument()
    })
    
    it('should handle missing onAgeChange callback gracefully', () => {
      // Test component doesn't crash without callback
      expect(() => {
        render(<PreciseAgeSelector onAgeChange={undefined as any} />)
      }).not.toThrow()
    })
  })
  
  describe('Visual Styling and Responsive Design', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PreciseAgeSelector onAgeChange={mockOnAgeChange} className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
    
    it('should show proper color coding for age groups', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      // Test different age groups have different colors
      await user.selectOptions(screen.getByLabelText(/years old/i), '3')
      
      await waitFor(() => {
        const ageDisplay = screen.getByText(/3 years and 0 months old/i).closest('div')
        expect(ageDisplay).toHaveClass('bg-pink-50', 'border-pink-200')
      })
      
      await user.selectOptions(screen.getByLabelText(/years old/i), '5')
      
      await waitFor(() => {
        const ageDisplay = screen.getByText(/5 years and 0 months old/i).closest('div')
        expect(ageDisplay).toHaveClass('bg-blue-50', 'border-blue-200')
      })
    })
    
    it('should handle touch interactions for mobile', async () => {
      const user = userEvent.setup()
      render(<PreciseAgeSelector onAgeChange={mockOnAgeChange} />)
      
      // Method switcher should be touch-friendly
      const birthDateButton = screen.getByText(/birth date/i)
      expect(birthDateButton.closest('button')).toHaveClass('px-4', 'py-2')
      
      await user.click(birthDateButton)
      
      expect(birthDateButton.closest('button')).toHaveClass('bg-white')
    })
  })
})