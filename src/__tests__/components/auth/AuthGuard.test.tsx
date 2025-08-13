/**
 * Test Suite: Auth Guard Components
 * 
 * Tests protected route access control including:
 * - AuthGuard component from hooks
 * - AuthRequired component for teacher routes
 * - Loading states and fallback rendering
 * - Redirect behavior for unauthenticated users
 * - Permission-based access control
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthGuard } from '@/lib/auth/hooks'
import AuthRequired from '@/components/teacher/AuthRequired'

// Mock Next.js router
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

// Mock teacher auth hook
const mockTeacherAuth = {
  teacher: null,
  loading: false,
  isAuthenticated: false,
  login: jest.fn(),
}

jest.mock('@/lib/teacher-auth', () => ({
  useTeacherAuth: () => mockTeacherAuth,
}))

// Mock Supabase functions
jest.mock('@/lib/supabase', () => ({
  getTeacherByEmail: jest.fn(),
  createTeacher: jest.fn(),
}))

// Mock auth hooks
const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  permissions: [],
  educationalContext: {},
  login: jest.fn(),
  logout: jest.fn(),
  switchContext: jest.fn(),
  checkPermission: jest.fn(),
  refreshSession: jest.fn(),
}

jest.mock('@/lib/auth/hooks', () => ({
  ...jest.requireActual('@/lib/auth/hooks'),
  useSecureAuth: () => mockAuthContext,
}))

describe('Auth Guard Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
    
    // Reset mock auth states
    mockTeacherAuth.teacher = null
    mockTeacherAuth.loading = false
    mockTeacherAuth.isAuthenticated = false
    mockAuthContext.user = null
    mockAuthContext.loading = false
    mockAuthContext.permissions = []
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('AuthGuard Component', () => {
    const TestContent = () => <div>Protected Content</div>

    it('should show loading state while checking authentication', () => {
      mockAuthContext.loading = true

      render(
        <AuthGuard>
          <TestContent />
        </AuthGuard>
      )

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should show authentication required message when not authenticated', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = null

      render(
        <AuthGuard>
          <TestContent />
        </AuthGuard>
      )

      expect(screen.getByText('Authentication required')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should render protected content when authenticated', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        role: 'teacher',
        school_id: 'school-1',
        isActive: true,
        isVerified: true
      }

      render(
        <AuthGuard>
          <TestContent />
        </AuthGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByText('Authentication required')).not.toBeInTheDocument()
    })

    it('should check required role when specified', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = {
        id: 'parent-1',
        email: 'parent@email.com',
        role: 'parent',
        isActive: true,
        isVerified: true
      }

      render(
        <AuthGuard requiredRole="teacher">
          <TestContent />
        </AuthGuard>
      )

      expect(screen.getByText('Insufficient permissions')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should allow access when user has required role', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        role: 'teacher',
        isActive: true,
        isVerified: true
      }

      render(
        <AuthGuard requiredRole="teacher">
          <TestContent />
        </AuthGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByText('Insufficient permissions')).not.toBeInTheDocument()
    })

    it('should check required permissions when specified', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        role: 'teacher',
        isActive: true,
        isVerified: true
      }
      mockAuthContext.checkPermission = jest.fn().mockReturnValue(false)

      render(
        <AuthGuard requiredPermission="read:student_profile">
          <TestContent />
        </AuthGuard>
      )

      expect(mockAuthContext.checkPermission).toHaveBeenCalledWith('read', 'student_profile')
      expect(screen.getByText('Access denied')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should allow access when user has required permission', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        role: 'teacher',
        isActive: true,
        isVerified: true
      }
      mockAuthContext.checkPermission = jest.fn().mockReturnValue(true)

      render(
        <AuthGuard requiredPermission="read:student_profile">
          <TestContent />
        </AuthGuard>
      )

      expect(mockAuthContext.checkPermission).toHaveBeenCalledWith('read', 'student_profile')
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByText('Access denied')).not.toBeInTheDocument()
    })

    it('should render custom fallback when provided', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = null

      const CustomFallback = () => <div>Custom Access Denied</div>

      render(
        <AuthGuard fallback={<CustomFallback />}>
          <TestContent />
        </AuthGuard>
      )

      expect(screen.getByText('Custom Access Denied')).toBeInTheDocument()
      expect(screen.queryByText('Authentication required')).not.toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('AuthRequired Component (Teacher Routes)', () => {
    const TestContent = () => <div>Teacher Dashboard Content</div>

    it('should show loading state while checking teacher authentication', () => {
      mockTeacherAuth.loading = true

      render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      expect(screen.getByText('Loading teacher dashboard...')).toBeInTheDocument()
      expect(screen.queryByText('Teacher Dashboard Content')).not.toBeInTheDocument()
    })

    it('should show teacher login required message when not authenticated', () => {
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      expect(screen.getByText('Teacher Login Required')).toBeInTheDocument()
      expect(screen.getByText('You need to be logged in as a teacher to access this page.')).toBeInTheDocument()
      expect(screen.queryByText('Teacher Dashboard Content')).not.toBeInTheDocument()
    })

    it('should render protected content when teacher is authenticated', () => {
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = true
      mockTeacherAuth.teacher = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        name: 'John Teacher'
      }

      render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      expect(screen.getByText('Teacher Dashboard Content')).toBeInTheDocument()
      expect(screen.queryByText('Teacher Login Required')).not.toBeInTheDocument()
    })

    it('should redirect to login after delay when not authenticated', async () => {
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      // Fast-forward the redirect timer
      jest.advanceTimersByTime(100)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/teacher/login')
      })
    })

    it('should provide demo teacher login option', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      const { getTeacherByEmail, createTeacher } = require('@/lib/supabase')
      const mockDemoTeacher = {
        id: 'demo-1',
        email: 'demo@school.edu',
        name: 'Demo Teacher',
        school: 'Demo Elementary School',
        grade_level: '3rd Grade'
      }

      getTeacherByEmail.mockResolvedValue(mockDemoTeacher)

      render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      const demoButton = screen.getByText('🎯 Try Demo Teacher Account')
      await user.click(demoButton)

      await waitFor(() => {
        expect(getTeacherByEmail).toHaveBeenCalledWith('demo@school.edu')
        expect(mockTeacherAuth.login).toHaveBeenCalledWith(mockDemoTeacher)
      })
    })

    it('should create demo teacher if not exists', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      const { getTeacherByEmail, createTeacher } = require('@/lib/supabase')
      const newDemoTeacher = {
        id: 'demo-1',
        email: 'demo@school.edu',
        name: 'Demo Teacher',
        school: 'Demo Elementary School',
        grade_level: '3rd Grade'
      }

      getTeacherByEmail.mockResolvedValue(null) // Doesn't exist
      createTeacher.mockResolvedValue(newDemoTeacher)

      render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      const demoButton = screen.getByText('🎯 Try Demo Teacher Account')
      await user.click(demoButton)

      await waitFor(() => {
        expect(getTeacherByEmail).toHaveBeenCalledWith('demo@school.edu')
        expect(createTeacher).toHaveBeenCalledWith({
          email: 'demo@school.edu',
          name: 'Demo Teacher',
          school: 'Demo Elementary School',
          grade_level: '3rd Grade'
        })
        expect(mockTeacherAuth.login).toHaveBeenCalledWith(newDemoTeacher)
      })
    })

    it('should fallback to offline demo on database error', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      const { getTeacherByEmail } = require('@/lib/supabase')
      getTeacherByEmail.mockRejectedValue(new Error('Database error'))

      // Spy on console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      const demoButton = screen.getByText('🎯 Try Demo Teacher Account')
      await user.click(demoButton)

      await waitFor(() => {
        expect(mockTeacherAuth.login).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 999999,
            name: 'Demo Teacher (Offline)',
            email: 'demo@offline.local',
            isOfflineDemo: true
          })
        )
      })

      consoleSpy.mockRestore()
    })

    it('should provide link to teacher login page', () => {
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      const loginLink = screen.getByText('Go to Teacher Login')
      expect(loginLink).toHaveAttribute('href', '/teacher/login')
    })

    it('should render custom fallback when provided', () => {
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      const CustomFallback = () => <div>Custom Teacher Access Required</div>

      render(
        <AuthRequired fallback={<CustomFallback />}>
          <TestContent />
        </AuthRequired>
      )

      expect(screen.getByText('Custom Teacher Access Required')).toBeInTheDocument()
      expect(screen.queryByText('Teacher Login Required')).not.toBeInTheDocument()
      expect(screen.queryByText('Teacher Dashboard Content')).not.toBeInTheDocument()
    })

    it('should clear redirect timer on component unmount', () => {
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      const { unmount } = render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      // Unmount before timer completes
      unmount()

      // Fast-forward past the original timer delay
      jest.advanceTimersByTime(200)

      // Should not redirect after unmount
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not redirect if authentication state changes before timer', async () => {
      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false

      const { rerender } = render(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      // Simulate authentication before timer completes
      mockTeacherAuth.isAuthenticated = true
      mockTeacherAuth.teacher = { id: 'teacher-1', name: 'Teacher' }

      rerender(
        <AuthRequired>
          <TestContent />
        </AuthRequired>
      )

      // Fast-forward past timer
      jest.advanceTimersByTime(200)

      // Should not redirect since user became authenticated
      expect(mockPush).not.toHaveBeenCalled()
      expect(screen.getByText('Teacher Dashboard Content')).toBeInTheDocument()
    })
  })

  describe('Protected Route Access Patterns', () => {
    it('should handle multiple protection layers', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        role: 'teacher',
        isActive: true,
        isVerified: true
      }
      mockAuthContext.checkPermission = jest.fn().mockReturnValue(true)

      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = true
      mockTeacherAuth.teacher = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        name: 'John Teacher'
      }

      const TestContent = () => <div>Fully Protected Content</div>

      render(
        <AuthGuard requiredRole="teacher" requiredPermission="read:student_profile">
          <AuthRequired>
            <TestContent />
          </AuthRequired>
        </AuthGuard>
      )

      expect(screen.getByText('Fully Protected Content')).toBeInTheDocument()
    })

    it('should handle nested protection failure at outer level', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = null // Not authenticated

      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = true // This won't matter since outer guard fails
      mockTeacherAuth.teacher = { id: 'teacher-1', name: 'Teacher' }

      const TestContent = () => <div>Fully Protected Content</div>

      render(
        <AuthGuard requiredRole="teacher">
          <AuthRequired>
            <TestContent />
          </AuthRequired>
        </AuthGuard>
      )

      expect(screen.getByText('Authentication required')).toBeInTheDocument()
      expect(screen.queryByText('Fully Protected Content')).not.toBeInTheDocument()
    })

    it('should handle nested protection failure at inner level', () => {
      mockAuthContext.loading = false
      mockAuthContext.user = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        role: 'teacher',
        isActive: true,
        isVerified: true
      }

      mockTeacherAuth.loading = false
      mockTeacherAuth.isAuthenticated = false // Inner protection fails
      mockTeacherAuth.teacher = null

      const TestContent = () => <div>Fully Protected Content</div>

      render(
        <AuthGuard requiredRole="teacher">
          <AuthRequired>
            <TestContent />
          </AuthRequired>
        </AuthGuard>
      )

      expect(screen.getByText('Teacher Login Required')).toBeInTheDocument()
      expect(screen.queryByText('Fully Protected Content')).not.toBeInTheDocument()
    })
  })
})