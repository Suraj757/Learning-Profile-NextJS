/**
 * Test Suite: Teacher Login Page Component
 * 
 * Tests the teacher login page component functionality including:
 * - Page rendering without infinite loops or blank pages
 * - Form elements and validation
 * - Error handling and success states
 * - Login flow integration
 * - Accessibility features
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeacherLoginPage from '@/app/teacher/login/page'

// Mock next/navigation
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

// Mock window.location for redirect tests
delete (window as any).location
window.location = { href: '' } as Location

describe('Teacher Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    window.location.href = ''
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the login page without errors', () => {
      render(<TeacherLoginPage />)
      
      expect(screen.getByText('Teacher Sign In')).toBeInTheDocument()
      expect(screen.getByText('Begin Learning Profile')).toBeInTheDocument()
    })

    it('should render all required form elements', () => {
      render(<TeacherLoginPage />)
      
      expect(screen.getByLabelText(/school email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in to dashboard/i })).toBeInTheDocument()
    })

    it('should render FERPA compliance notice', () => {
      render(<TeacherLoginPage />)
      
      expect(screen.getByText('FERPA Compliant Platform')).toBeInTheDocument()
      expect(screen.getByText(/your student data is protected under ferpa/i)).toBeInTheDocument()
    })

    it('should render navigation links', () => {
      render(<TeacherLoginPage />)
      
      expect(screen.getByText('Back to Home')).toBeInTheDocument()
      expect(screen.getByText('Create Teacher Account')).toBeInTheDocument()
      expect(screen.getByText('Launch Demo Dashboard →')).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(<TeacherLoginPage />)
      
      expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
    })

    it('should render Google sign-in option', () => {
      render(<TeacherLoginPage />)
      
      expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('autoComplete', 'email')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
      
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('Form Interaction', () => {
    it('should update form fields when user types', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'securepassword')
      
      expect(emailInput).toHaveValue('teacher@school.edu')
      expect(passwordInput).toHaveValue('securepassword')
    })

    it('should toggle password visibility', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: /show password/i })
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should disable submit button when form is incomplete', () => {
      render(<TeacherLoginPage />)
      
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when form is complete', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      
      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password')
      
      expect(submitButton).toBeEnabled()
    })

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup()
      
      // Mock failed login response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' })
      })
      
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      
      // Fill form and submit to get error
      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
      
      // Start typing in email field
      await user.type(emailInput, 'x')
      
      // Error should be cleared
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call login API with correct parameters', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: {
            userId: 'teacher-1',
            email: 'teacher@school.edu',
            userType: 'teacher',
            name: 'Test Teacher',
            authenticatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            permissions: {},
            teacherData: { id: 'teacher-1', name: 'Test Teacher' }
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
      
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'teacher@school.edu',
          password: 'password123',
          userType: 'teacher'
        }),
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 100))
      )
      
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      
      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(screen.getByText('Signing In...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should display error message on failed login', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid email or password' })
      })
      
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      
      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      
      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
      })
    })

    it('should redirect to password setup for users who need it', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          needsPasswordSetup: true,
          userId: 'teacher-1'
        })
      })
      
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      
      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/setup-password?email=teacher%40school.edu&userId=teacher-1')
      })
    })

    it('should show success message and redirect on successful login', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: {
            userId: 'teacher-1',
            email: 'teacher@school.edu',
            userType: 'teacher',
            name: 'Test Teacher',
            authenticatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            permissions: {},
            teacherData: { id: 'teacher-1', name: 'Test Teacher' }
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
      
      await waitFor(() => {
        expect(screen.getByText('Login successful! Taking you to your dashboard...')).toBeInTheDocument()
      })
      
      // Check that redirect happens after delay
      await waitFor(() => {
        expect(window.location.href).toBe('/teacher/dashboard')
      }, { timeout: 1000 })
    })

    it('should handle missing session data error', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: null // Missing session data
        })
      })
      
      render(<TeacherLoginPage />)
      
      const emailInput = screen.getByLabelText(/school email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      
      await user.type(emailInput, 'teacher@school.edu')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Login succeeded but session data is missing. Please try again.')).toBeInTheDocument()
      })
    })
  })

  describe('Additional Actions', () => {
    it('should navigate to forgot password page', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)
      
      const forgotPasswordLink = screen.getByText('Forgot your password?')
      await user.click(forgotPasswordLink)
      
      expect(mockPush).toHaveBeenCalledWith('/teacher/forgot-password')
    })

    it('should show Google Sign-In coming soon message', async () => {
      const user = userEvent.setup()
      render(<TeacherLoginPage />)
      
      const googleSignInButton = screen.getByText('Continue with Google')
      await user.click(googleSignInButton)
      
      expect(screen.getByText('Google Sign-In coming soon! Please use email/password for now.')).toBeInTheDocument()
    })
  })

  describe('LocalStorage Bridge Functionality', () => {
    it('should store teacher session bridge data on successful login', async () => {
      const user = userEvent.setup()
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
      
      const teacherData = { id: 'teacher-1', name: 'Test Teacher' }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionData: {
            userId: 'teacher-1',
            email: 'teacher@school.edu',
            userType: 'teacher',
            name: 'Test Teacher',
            authenticatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            permissions: {},
            teacherData
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
      
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith(
          'teacher_session_bridge',
          JSON.stringify(teacherData)
        )
      })
      
      mockSetItem.mockRestore()
    })
  })
})