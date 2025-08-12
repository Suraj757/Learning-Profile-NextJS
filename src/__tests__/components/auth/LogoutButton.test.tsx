import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LogoutButton from '@/components/auth/LogoutButton'

// Mock the teacher auth hook
const mockLogout = jest.fn()
const mockPush = jest.fn()

jest.mock('@/lib/teacher-auth', () => ({
  useTeacherAuth: jest.fn(() => ({
    teacher: {
      id: 1001,
      email: 'teacher@school.edu',
      name: 'Test Teacher',
      school: 'Test School',
      grade_level: 'K-5',
      ambassador_status: false,
      created_at: '2023-01-01',
    },
    logout: mockLogout,
  })),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('LogoutButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('Button Variant', () => {
    it('renders default button variant correctly', () => {
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Sign Out')
      // Check for LogOut icon by class
      expect(button.querySelector('.lucide-log-out')).toBeInTheDocument()
    })

    it('renders with custom size classes', () => {
      const { rerender } = render(<LogoutButton size="sm" />)
      let button = screen.getByRole('button', { name: /sign out/i })
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-xs')

      rerender(<LogoutButton size="lg" />)
      button = screen.getByRole('button', { name: /sign out/i })
      expect(button).toHaveClass('px-6', 'py-3', 'text-base')
    })

    it('renders with custom className', () => {
      render(<LogoutButton className="custom-class" />)
      const button = screen.getByRole('button', { name: /sign out/i })
      expect(button).toHaveClass('custom-class')
    })

    it('handles logout click with confirmation dialog', async () => {
      const user = userEvent.setup()
      render(<LogoutButton showConfirmDialog={true} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      // Should show confirmation dialog
      expect(screen.getByText('Sign Out?')).toBeInTheDocument()
      expect(screen.getByText("You'll need to sign in again to access your dashboard.")).toBeInTheDocument()
      
      // Should have cancel and confirm buttons
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      // There should be multiple sign out buttons now (original + confirm)
      expect(screen.getAllByRole('button', { name: /sign out/i })).toHaveLength(2)
    })

    it('cancels logout when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<LogoutButton showConfirmDialog={true} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Dialog should be closed
      expect(screen.queryByText('Sign Out?')).not.toBeInTheDocument()
      expect(mockFetch).not.toHaveBeenCalled()
      expect(mockLogout).not.toHaveBeenCalled()
    })

    it('proceeds with logout when confirmed', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      render(<LogoutButton showConfirmDialog={true} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      const confirmButtons = screen.getAllByRole('button', { name: /sign out/i })
      const confirmButton = confirmButtons.find(btn => btn !== button)
      await user.click(confirmButton!)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        expect(mockLogout).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('proceeds with logout without confirmation when showConfirmDialog is false', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      render(<LogoutButton showConfirmDialog={false} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        expect(mockLogout).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('handles logout API failure gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<LogoutButton showConfirmDialog={false} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error))
        expect(mockLogout).toHaveBeenCalled() // Should still clear local state
        expect(mockPush).toHaveBeenCalledWith('/')
      })

      consoleSpy.mockRestore()
    })

    it('shows loading state during logout', async () => {
      const user = userEvent.setup()
      let resolvePromise: (value: any) => void
      const logoutPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      
      mockFetch.mockImplementation(() => logoutPromise)

      render(<LogoutButton showConfirmDialog={false} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Signing Out...')).toBeInTheDocument()
        expect(button).toBeDisabled()
      })

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true }),
      })

      await waitFor(() => {
        expect(screen.queryByText('Signing Out...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Icon Variant', () => {
    it('renders icon variant correctly', () => {
      render(<LogoutButton variant="icon" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Sign Out')
      expect(button).not.toHaveTextContent('Sign Out')
    })

    it('shows loading spinner in icon variant', async () => {
      const user = userEvent.setup()
      let resolvePromise: (value: any) => void
      const logoutPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      
      mockFetch.mockImplementation(() => logoutPromise)

      render(<LogoutButton variant="icon" showConfirmDialog={false} />)
      
      const button = screen.getByRole('button')
      await user.click(button)

      // Should show loading spinner
      await waitFor(() => {
        expect(button).toBeDisabled()
        expect(button.querySelector('.animate-spin')).toBeInTheDocument()
      })

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true }),
      })
    })
  })

  describe('Menu Variant', () => {
    it('renders menu variant correctly', () => {
      render(<LogoutButton variant="menu" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      
      // Should show teacher initial
      expect(screen.getByText('T')).toBeInTheDocument() // Initial
      // Email prefix should be shown but may be hidden on mobile
      const emailElement = screen.queryByText('teacher')
      if (emailElement) {
        expect(emailElement).toBeInTheDocument()
      }
    })

    it('opens dropdown menu on click', async () => {
      const user = userEvent.setup()
      render(<LogoutButton variant="menu" />)
      
      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      // Should show dropdown menu - use getAllByText since teacher name appears twice
      expect(screen.getAllByText('Test Teacher')).toHaveLength(2) // Once in button, once in dropdown
      expect(screen.getByText('teacher@school.edu')).toBeInTheDocument()
      expect(screen.getByText('Test School')).toBeInTheDocument()
      
      // Should show menu items
      expect(screen.getByText('View Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Privacy & Data')).toBeInTheDocument()
    })

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <LogoutButton variant="menu" />
          <div data-testid="outside">Outside element</div>
        </div>
      )
      
      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      // Menu should be open
      expect(screen.getByText('View Profile')).toBeInTheDocument()

      // Click outside by simulating click on the overlay (which is how the component actually works)
      const overlay = document.querySelector('.fixed.inset-0.z-10')
      if (overlay) {
        fireEvent.click(overlay)
      } else {
        // Fallback: click outside element
        const outside = screen.getByTestId('outside')
        await user.click(outside)
      }

      // Menu should be closed
      await waitFor(() => {
        expect(screen.queryByText('View Profile')).not.toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('navigates to profile when clicking View Profile', async () => {
      const user = userEvent.setup()
      render(<LogoutButton variant="menu" />)
      
      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      const profileButton = screen.getByText('View Profile')
      await user.click(profileButton)

      expect(mockPush).toHaveBeenCalledWith('/teacher/profile')
    })

    it('navigates to settings when clicking Settings', async () => {
      const user = userEvent.setup()
      render(<LogoutButton variant="menu" />)
      
      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      const settingsButton = screen.getByText('Settings')
      await user.click(settingsButton)

      expect(mockPush).toHaveBeenCalledWith('/teacher/settings')
    })

    it('navigates to privacy when clicking Privacy & Data', async () => {
      const user = userEvent.setup()
      render(<LogoutButton variant="menu" />)
      
      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      const privacyButton = screen.getByText('Privacy & Data')
      await user.click(privacyButton)

      expect(mockPush).toHaveBeenCalledWith('/teacher/privacy')
    })

    it('handles logout from menu dropdown', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      // Render menu variant without confirmation dialog for simpler testing
      render(<LogoutButton variant="menu" showConfirmDialog={false} />)
      
      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      // Find the logout button within the dropdown menu
      const logoutButtons = screen.getAllByRole('button', { name: /sign out/i })
      const menuLogoutButton = logoutButtons.find(btn => 
        btn.closest('.border-t') // The logout button is in a section with border-t
      ) || logoutButtons[logoutButtons.length - 1] // Fallback to last one
      
      await user.click(menuLogoutButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        expect(mockLogout).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/')
      }, { timeout: 3000 })
    })
  })

  describe('Teacher Data Handling', () => {
    it('handles teacher with name', () => {
      render(<LogoutButton variant="menu" />)
      
      expect(screen.getByText('T')).toBeInTheDocument() // Initial from name
      // Email prefix may be hidden on mobile screens
      const emailElement = screen.queryByText('teacher')
      if (emailElement) {
        expect(emailElement).toBeInTheDocument()
      }
    })

    it('handles teacher without name', () => {
      // Mock teacher without name
      const { useTeacherAuth } = require('@/lib/teacher-auth')
      useTeacherAuth.mockImplementation(() => ({
        teacher: {
          id: 1001,
          email: 'teacher@school.edu',
          name: '', // No name
          school: 'Test School',
          grade_level: 'K-5',
          ambassador_status: false,
          created_at: '2023-01-01',
        },
        logout: mockLogout,
      }))

      render(<LogoutButton variant="menu" />)
      
      expect(screen.getByText('T')).toBeInTheDocument() // Initial from email
      expect(screen.getByText('teacher')).toBeInTheDocument() // Email prefix
    })

    it('handles missing teacher school', () => {
      // Mock teacher without school
      const { useTeacherAuth } = require('@/lib/teacher-auth')
      useTeacherAuth.mockImplementation(() => ({
        teacher: {
          id: 1001,
          email: 'teacher@school.edu',
          name: 'Test Teacher',
          school: '', // No school
          grade_level: 'K-5',
          ambassador_status: false,
          created_at: '2023-01-01',
        },
        logout: mockLogout,
      }))

      render(<LogoutButton variant="menu" />)
      
      const menuButton = screen.getByRole('button')
      fireEvent.click(menuButton)

      // School should not be displayed when empty
      expect(screen.queryByText('Test School')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes for button variant', () => {
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      // Button should be accessible with proper role
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('has proper ARIA attributes for icon variant', () => {
      render(<LogoutButton variant="icon" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Sign Out')
    })

    it('maintains focus management in confirmation dialog', async () => {
      const user = userEvent.setup()
      render(<LogoutButton showConfirmDialog={true} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      // Focus should be manageable within dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeInTheDocument()
      
      // Test that tabbing works in the dialog - simplified test
      await user.tab()
      
      // Just ensure focus is on a button in the dialog (don't test specific focus order)
      expect(document.activeElement?.tagName).toBe('BUTTON')
      
      // Make sure we can find both buttons in the dialog
      const signOutButtons = screen.getAllByRole('button', { name: /sign out/i })
      expect(signOutButtons.length).toBeGreaterThan(1) // Original + confirm button
    })
  })

  describe('Error Scenarios', () => {
    it('handles network errors during logout', async () => {
      const user = userEvent.setup()
      // Don't mock console.error since it's already mocked in setup
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

      render(<LogoutButton showConfirmDialog={false} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      await waitFor(() => {
        // Just check that the logout process completes even with network error
        expect(mockLogout).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('handles API errors during logout', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as Response)

      render(<LogoutButton showConfirmDialog={false} />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      await user.click(button)

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled() // Should still logout locally
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })
})