/**
 * Test Suite: Authentication Hooks
 * 
 * Tests the authentication hooks including:
 * - useSimpleAuth hook state management
 * - useTeacherAuth hook functionality
 * - Session validation and refresh
 * - Authentication context provider
 * - Error handling and recovery
 */

import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSimpleAuth, SecureAuthProvider, useTeacherAuth } from '@/lib/auth/hooks'

// Mock fetch globally
global.fetch = jest.fn()

describe('Authentication Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('useSimpleAuth Hook', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useSimpleAuth())

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.sessionData).toBeNull()
      expect(result.current.context).toBeNull()
    })

    it('should check session on mount and set authenticated state', async () => {
      const mockUser = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        name: 'John Teacher',
        userType: 'teacher',
        isVerified: true
      }

      const mockSession = {
        userId: 'teacher-1',
        email: 'teacher@school.edu',
        userType: 'teacher',
        authenticatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const mockContext = {
        isOfflineDemo: false,
        hasRealData: true,
        isEduDomain: true,
        dataSource: 'real_data' as const
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          authenticated: true,
          user: mockUser,
          session: mockSession,
          dataState: mockContext
        })
      })

      const { result } = renderHook(() => useSimpleAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.sessionData).toEqual(mockSession)
      expect(result.current.context).toEqual(mockContext)

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      })
    })

    it('should handle unauthenticated state', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          authenticated: false,
          reason: 'No session found'
        })
      })

      const { result } = renderHook(() => useSimpleAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.sessionData).toBeNull()
      expect(result.current.context).toBeNull()
    })

    it('should handle session check errors gracefully', async () => {
      // Mock console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useSimpleAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)

      consoleSpy.mockRestore()
    })

    describe('Login Functionality', () => {
      it('should successfully login with valid credentials', async () => {
        const mockUser = {
          id: 'teacher-1',
          email: 'teacher@school.edu',
          name: 'John Teacher',
          userType: 'teacher',
          isVerified: true
        }

        const mockSessionData = {
          userId: 'teacher-1',
          email: 'teacher@school.edu',
          userType: 'teacher',
          authenticatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }

        // Mock session check (initial)
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({ authenticated: false })
        })

        const { result } = renderHook(() => useSimpleAuth())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Mock login response
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({
            success: true,
            user: mockUser,
            sessionData: mockSessionData,
            context: { isOfflineDemo: false, hasRealData: true, isEduDomain: true, dataSource: 'real_data' }
          })
        })

        let loginResult
        await act(async () => {
          loginResult = await result.current.login('teacher@school.edu', 'password123', 'teacher', false)
        })

        expect(loginResult).toEqual({ success: true, data: expect.any(Object) })
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.sessionData).toEqual(mockSessionData)

        expect(global.fetch).toHaveBeenLastCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: 'teacher@school.edu',
            password: 'password123',
            userType: 'teacher',
            rememberMe: false
          })
        })
      })

      it('should handle login failure with error message', async () => {
        // Mock session check (initial)
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({ authenticated: false })
        })

        const { result } = renderHook(() => useSimpleAuth())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Mock login failure
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({
            success: false,
            error: 'Invalid email or password',
            field: 'password',
            suggestions: ['Check your password and try again']
          })
        })

        let loginResult
        await act(async () => {
          loginResult = await result.current.login('teacher@school.edu', 'wrongpassword', 'teacher')
        })

        expect(loginResult).toEqual({
          success: false,
          error: 'Invalid email or password',
          field: 'password',
          suggestions: ['Check your password and try again']
        })

        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })

      it('should handle network errors during login', async () => {
        // Mock console.error to suppress error output in tests
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

        // Mock session check (initial)
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({ authenticated: false })
        })

        const { result } = renderHook(() => useSimpleAuth())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        // Mock network error
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

        let loginResult
        await act(async () => {
          loginResult = await result.current.login('teacher@school.edu', 'password123', 'teacher')
        })

        expect(loginResult).toEqual({
          success: false,
          error: 'Network error - please check your connection and try again'
        })

        consoleSpy.mockRestore()
      })
    })

    describe('Logout Functionality', () => {
      it('should successfully logout and clear state', async () => {
        const mockUser = {
          id: 'teacher-1',
          email: 'teacher@school.edu',
          name: 'John Teacher',
          userType: 'teacher',
          isVerified: true
        }

        // Mock initial authenticated state
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({
            authenticated: true,
            user: mockUser,
            session: { userId: 'teacher-1' },
            dataState: {}
          })
        })

        const { result } = renderHook(() => useSimpleAuth())

        await waitFor(() => {
          expect(result.current.isAuthenticated).toBe(true)
        })

        // Mock logout response
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({ success: true })
        })

        // Mock window.location
        delete (window as any).location
        window.location = { href: '' } as any

        await act(async () => {
          await result.current.logout()
        })

        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.sessionData).toBeNull()
        expect(result.current.context).toBeNull()

        expect(global.fetch).toHaveBeenLastCalledWith('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })

        expect(window.location.href).toBe('/auth/login')
      })

      it('should handle logout errors gracefully', async () => {
        // Mock console.error to suppress error output in tests
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

        const mockUser = {
          id: 'teacher-1',
          email: 'teacher@school.edu',
          name: 'John Teacher',
          userType: 'teacher',
          isVerified: true
        }

        // Mock initial authenticated state
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({
            authenticated: true,
            user: mockUser,
            session: { userId: 'teacher-1' },
            dataState: {}
          })
        })

        const { result } = renderHook(() => useSimpleAuth())

        await waitFor(() => {
          expect(result.current.isAuthenticated).toBe(true)
        })

        // Mock logout error
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

        // Mock window.location
        delete (window as any).location
        window.location = { href: '' } as any

        await act(async () => {
          await result.current.logout()
        })

        // Should still clear state and redirect even on error
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(window.location.href).toBe('/auth/login')

        consoleSpy.mockRestore()
      })
    })

    describe('Session Refresh', () => {
      it('should successfully refresh session', async () => {
        // Mock initial authenticated state
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({
            authenticated: true,
            user: { id: 'teacher-1' },
            session: { userId: 'teacher-1' },
            dataState: {}
          })
        })

        const { result } = renderHook(() => useSimpleAuth())

        await waitFor(() => {
          expect(result.current.isAuthenticated).toBe(true)
        })

        // Mock refresh response
        ;(global.fetch as jest.Mock)
          .mockResolvedValueOnce({
            json: async () => ({ success: true })
          })
          .mockResolvedValueOnce({
            json: async () => ({
              authenticated: true,
              user: { id: 'teacher-1', name: 'Updated Teacher' },
              session: { userId: 'teacher-1', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
              dataState: {}
            })
          })

        let refreshResult
        await act(async () => {
          refreshResult = await result.current.refreshSession()
        })

        expect(refreshResult).toBe(true)
        expect(result.current.user?.name).toBe('Updated Teacher')

        expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'refresh' })
        })
      })

      it('should handle failed session refresh', async () => {
        // Mock console.error to suppress error output in tests
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

        // Mock initial authenticated state
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({
            authenticated: true,
            user: { id: 'teacher-1' },
            session: { userId: 'teacher-1' },
            dataState: {}
          })
        })

        const { result } = renderHook(() => useSimpleAuth())

        await waitFor(() => {
          expect(result.current.isAuthenticated).toBe(true)
        })

        // Mock failed refresh
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Session refresh failed'))

        let refreshResult
        await act(async () => {
          refreshResult = await result.current.refreshSession()
        })

        expect(refreshResult).toBe(false)

        consoleSpy.mockRestore()
      })
    })

    describe('Periodic Session Validation', () => {
      it('should set up periodic session check when authenticated', async () => {
        jest.useFakeTimers()

        const mockUser = {
          id: 'teacher-1',
          email: 'teacher@school.edu',
          name: 'John Teacher',
          userType: 'teacher',
          isVerified: true
        }

        // Mock initial authenticated state
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          json: async () => ({
            authenticated: true,
            user: mockUser,
            session: { userId: 'teacher-1' },
            dataState: {}
          })
        })

        const { result } = renderHook(() => useSimpleAuth())

        await waitFor(() => {
          expect(result.current.isAuthenticated).toBe(true)
        })

        // Clear the initial session check call
        ;(global.fetch as jest.Mock).mockClear()

        // Mock session validation response
        ;(global.fetch as jest.Mock).mockResolvedValue({
          json: async () => ({
            authenticated: true,
            user: mockUser,
            session: { userId: 'teacher-1' },
            dataState: {}
          })
        })

        // Fast-forward 5 minutes
        act(() => {
          jest.advanceTimersByTime(5 * 60 * 1000)
        })

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
            method: 'GET',
            credentials: 'include'
          })
        })

        jest.useRealTimers()
      })
    })
  })

  describe('useTeacherAuth Hook', () => {
    const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SecureAuthProvider>{children}</SecureAuthProvider>
    )

    it('should return teacher-specific state', async () => {
      const mockTeacher = {
        id: 'teacher-1',
        email: 'teacher@school.edu',
        name: 'John Teacher',
        role: 'teacher',
        grade_levels: ['K', '1st', '2nd'],
        isActive: true,
        isVerified: true
      }

      // Mock session endpoint
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          authenticated: true,
          user: mockTeacher,
          session: { session_id: 'session-1' },
          permissions: ['read:student_profile']
        })
      })

      const { result } = renderHook(() => useTeacherAuth(), {
        wrapper: TestWrapper
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.teacher).toEqual(mockTeacher)
      expect(result.current.classrooms).toEqual(['K', '1st', '2nd'])
      expect(result.current.canAccessStudent('student-1')).toBe(true)
    })

    it('should return null for non-teacher users', async () => {
      const mockParent = {
        id: 'parent-1',
        email: 'parent@email.com',
        name: 'John Parent',
        role: 'parent',
        isActive: true,
        isVerified: true
      }

      // Mock session endpoint
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          authenticated: true,
          user: mockParent,
          session: { session_id: 'session-1' },
          permissions: []
        })
      })

      const { result } = renderHook(() => useTeacherAuth(), {
        wrapper: TestWrapper
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.teacher).toBeNull()
      expect(result.current.classrooms).toEqual([])
      expect(result.current.canAccessStudent('student-1')).toBe(false)
    })

    it('should handle unauthenticated state', async () => {
      // Mock unauthenticated response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          authenticated: false,
          reason: 'No session found'
        })
      })

      const { result } = renderHook(() => useTeacherAuth(), {
        wrapper: TestWrapper
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.teacher).toBeNull()
      expect(result.current.classrooms).toEqual([])
      expect(result.current.canAccessStudent('student-1')).toBe(false)
    })
  })
})