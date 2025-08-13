/**
 * Test Suite: Authentication Integration Flow
 * 
 * Tests the complete authentication flow including:
 * - Login form submission with API integration
 * - Session management and persistence
 * - Error handling across the flow
 * - Redirect behavior after authentication
 * - Cross-component authentication state
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeacherLoginPage from '@/app/teacher/login/page'

// Mock modules
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('@/lib/auth/user-storage', () => ({
  getUserByEmail: jest.fn(),
}))

// Mock window.location for redirect testing
delete (window as any).location
window.location = {
  href: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
} as any

describe('Authentication Integration Flow', () => {
  const { getUserByEmail } = require('@/lib/auth/user-storage')

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    window.location.href = ''
    localStorage.clear()
    
    // Reset Date mock
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Complete Login Flow', () => {
    const validUser = {
      id: 'teacher-1',
      email: 'teacher@school.edu',
      name: 'John Teacher',
      userType: 'teacher',
      school: 'Test Elementary',
      isActive: true,
      isVerified: true,
      needsPasswordSetup: false,
      permissions: { canViewStudentProfiles: true }
    }

    it('should complete full authentication flow successfully', async () => {
      const user = userEvent.setup()
      
      // Mock successful login API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: {
            userId: validUser.id,
            email: validUser.email,
            userType: validUser.userType,
            name: validUser.name,
            authenticatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            permissions: validUser.permissions,
            teacherData: {
              id: validUser.id,
              name: validUser.name,
              school: validUser.school
            }
          }
        })
      })

      render(<TeacherLoginPage />)

      // Fill in the login form
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(emailInput, validUser.email)
      await user.type(passwordInput, 'validpassword123')
      await user.click(submitButton)

      // Verify API call
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: validUser.email,
          password: 'validpassword123',
          userType: 'teacher'
        }),
      })

      // Verify loading state
      expect(screen.getByText('Signing In...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Login successful! Taking you to your dashboard...')).toBeInTheDocument()
      })

      // Verify localStorage bridge is set
      await waitFor(() => {
        const bridgeData = localStorage.getItem('teacher_session_bridge')
        expect(bridgeData).toBeTruthy()
        
        const parsedData = JSON.parse(bridgeData!)
        expect(parsedData).toEqual({
          id: validUser.id,
          name: validUser.name,
          school: validUser.school
        })
      })

      // Verify redirect happens
      await waitFor(() => {
        expect(window.location.href).toBe('/teacher/dashboard')
      }, { timeout: 1000 })
    })

    it('should handle password setup flow for existing users', async () => {
      const user = userEvent.setup()
      
      // Mock login response requiring password setup
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          needsPasswordSetup: true,
          userId: 'teacher-2'
        })
      })

      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(emailInput, 'newteacher@school.edu')
      await user.type(passwordInput, 'temppassword')
      await user.click(submitButton)

      // Should redirect to password setup
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/setup-password?email=newteacher%40school.edu&userId=teacher-2')
      })
    })

    it('should handle server errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock server error (500)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Database connection failed' })
      })

      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Database connection failed')).toBeInTheDocument()
      })

      // Form should be re-enabled
      expect(submitButton).not.toBeDisabled()
    })

    it('should handle authentication failures', async () => {
      const user = userEvent.setup()
      
      // Mock authentication failure
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid email or password' })
      })

      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })

      // Form should be re-enabled
      expect(submitButton).not.toBeDisabled()
    })

    it('should handle network connectivity issues', async () => {
      const user = userEvent.setup()
      
      // Mock network error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'))

      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should show generic error message
      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
      })

      // Form should be re-enabled
      expect(submitButton).not.toBeDisabled()
    })

    it('should validate session data completeness', async () => {
      const user = userEvent.setup()
      
      // Mock login response with incomplete session data
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: {
            userId: 'teacher-1',
            email: 'teacher@school.edu',
            // Missing teacherData
          }
        })
      })

      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should show session data missing error
      await waitFor(() => {
        expect(screen.getByText('Login succeeded but session data is missing. Please try again.')).toBeInTheDocument()
      })

      // Should not redirect
      expect(window.location.href).toBe('')
    })
  })

  describe('Session State Management', () => {
    it('should properly manage session state across login attempts', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      // First attempt - failed
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' })
      })

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'wrongpass')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Clear and try again - successful
      await user.clear(passwordInput)
      await user.type(passwordInput, 'correctpass')

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: {
            userId: 'teacher-1',
            email: 'teacher@school.edu',
            userType: 'teacher',
            name: 'Teacher',
            authenticatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            permissions: {},
            teacherData: { id: 'teacher-1', name: 'Teacher' }
          }
        })
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Login successful! Taking you to your dashboard...')).toBeInTheDocument()
      })

      // Error should be cleared
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })

    it('should clear error states when user modifies input', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      // First attempt - failed
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' })
      })

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'wrongpass')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Modify email input - error should clear
      await user.type(emailInput, 'x')
      
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })

    it('should handle success state properly', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      // Successful login
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: {
            userId: 'teacher-1',
            email: 'teacher@school.edu',
            userType: 'teacher',
            name: 'Teacher',
            authenticatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            permissions: {},
            teacherData: { id: 'teacher-1', name: 'Teacher' }
          }
        })
      })

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      // Check success state
      await waitFor(() => {
        expect(screen.getByText('Login successful! Taking you to your dashboard...')).toBeInTheDocument()
      })

      // Loading state should show "Redirecting..."
      expect(screen.getByText('Redirecting...')).toBeInTheDocument()
      
      // Button should remain disabled during success/redirect
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Validation Integration', () => {
    it('should enforce email format validation', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      // Enter invalid email format
      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')

      // Try to submit - browser validation should prevent it
      expect(emailInput).toBeInvalid()
    })

    it('should require both email and password to enable submit', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      // Initially disabled
      expect(submitButton).toBeDisabled()

      // Only email - still disabled
      await user.type(emailInput, 'teacher@school.edu')
      expect(submitButton).toBeDisabled()

      // Both email and password - enabled
      await user.type(passwordInput, 'password')
      expect(submitButton).toBeEnabled()

      // Clear password - disabled again
      await user.clear(passwordInput)
      expect(submitButton).toBeDisabled()
    })

    it('should disable form during submission', async () => {
      const user = userEvent.setup()
      
      // Mock slow response
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 200))
      )

      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      // All inputs should be disabled during submission
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Signing In...')).toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('should recover from errors and allow retry', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)

      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      // First attempt - network error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
      })

      // Form should be enabled for retry
      expect(submitButton).toBeEnabled()
      expect(emailInput).toBeEnabled()
      expect(passwordInput).toBeEnabled()

      // Second attempt - success
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: {
            userId: 'teacher-1',
            email: 'teacher@school.edu',
            userType: 'teacher',
            name: 'Teacher',
            authenticatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            permissions: {},
            teacherData: { id: 'teacher-1', name: 'Teacher' }
          }
        })
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Login successful! Taking you to your dashboard...')).toBeInTheDocument()
      })
    })
  })
})