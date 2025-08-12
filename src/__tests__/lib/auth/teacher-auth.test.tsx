/**
 * Tests for useTeacherAuth hook from /lib/teacher-auth.ts
 */

import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTeacherAuth } from '@/lib/teacher-auth'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
})

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
}

describe('useTeacherAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    consoleSpy.log.mockClear()
    consoleSpy.error.mockClear()
    
    // Clear document.cookie
    document.cookie = ''
  })

  afterAll(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('Initial state and loading', () => {
    it('starts with null teacher and not authenticated', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const { result } = renderHook(() => useTeacherAuth())
      
      expect(result.current.teacher).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('completes initialization and sets loading to false', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const { result } = renderHook(() => useTeacherAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Bridge session handling', () => {
    it('loads teacher from bridge session immediately', async () => {
      const bridgeTeacher = {
        id: 1001,
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        school: 'Test School',
        grade_level: 'K-5',
        ambassador_status: false,
        created_at: '2023-01-01'
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'teacher_session_bridge') {
          return JSON.stringify(bridgeTeacher)
        }
        return null
      })

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toEqual(bridgeTeacher)
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.loading).toBe(false)
      })

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'useTeacherAuth: Found bridge session, using immediately:',
        bridgeTeacher
      )
    })

    it('handles corrupted bridge session gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'teacher_session_bridge') {
          return 'invalid-json'
        }
        return null
      })

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toBe(null)
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('teacher_session_bridge')
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'useTeacherAuth: Error parsing bridge session:',
        expect.any(Error)
      )
    })
  })

  describe('Client session cookie handling', () => {
    it('loads teacher from valid client session cookie', async () => {
      const clientSessionData = {
        userId: 'teacher_001',
        email: 'teacher@school.edu',
        userType: 'teacher',
        authenticatedAt: '2023-01-01T00:00:00Z',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }

      const cookieValue = `edu-session-client=${encodeURIComponent(JSON.stringify(clientSessionData))}`
      document.cookie = cookieValue

      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toEqual(
          expect.objectContaining({
            email: 'teacher@school.edu',
            name: 'teacher'
          })
        )
        expect(result.current.isAuthenticated).toBe(true)
      })

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'useTeacherAuth: Found client session cookie:',
        clientSessionData
      )
    })

    it('clears expired client session cookie', async () => {
      const expiredSessionData = {
        userId: 'teacher_001',
        email: 'teacher@school.edu',
        userType: 'teacher',
        authenticatedAt: '2023-01-01T00:00:00Z',
        expiresAt: '2023-01-01T01:00:00Z' // Already expired
      }

      const cookieValue = `edu-session-client=${encodeURIComponent(JSON.stringify(expiredSessionData))}`
      document.cookie = cookieValue

      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toBe(null)
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(consoleSpy.log).toHaveBeenCalledWith('useTeacherAuth: Client session expired, clearing cookies')
    })

    it('detects demo accounts from email in client session', async () => {
      const clientSessionData = {
        userId: 'teacher_001',
        email: 'demo@school.edu',
        userType: 'teacher',
        authenticatedAt: '2023-01-01T00:00:00Z',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const cookieValue = `edu-session-client=${encodeURIComponent(JSON.stringify(clientSessionData))}`
      document.cookie = cookieValue

      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher?.isOfflineDemo).toBe(true)
      })
    })

    it('handles corrupted client session cookie gracefully', async () => {
      document.cookie = 'edu-session-client=invalid-json'
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toBe(null)
      })

      expect(consoleSpy.error).toHaveBeenCalledWith(
        'useTeacherAuth: Error parsing client session:',
        expect.any(Error)
      )
    })
  })

  describe('Secure session cookie handling', () => {
    it('loads teacher from secure session cookie with teacher data', async () => {
      const teacherData = {
        id: 1001,
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        school: 'Test School',
        grade_level: 'K-5',
        ambassador_status: false,
        created_at: '2023-01-01'
      }

      const sessionData = {
        userId: 'teacher_001',
        email: 'teacher@school.edu',
        userType: 'teacher',
        authenticatedAt: '2023-01-01T00:00:00Z',
        teacherData: teacherData
      }

      const cookieValue = `edu-session=${encodeURIComponent(JSON.stringify(sessionData))}`
      document.cookie = cookieValue

      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toEqual(teacherData)
      })

      expect(consoleSpy.log).toHaveBeenCalledWith('Found secure teacher session:', teacherData)
    })

    it('creates teacher from session data without teacher data', async () => {
      const sessionData = {
        userId: 'teacher_suraj_plus_001',
        email: 'suraj+1@speakaboos.com',
        userType: 'teacher',
        authenticatedAt: '2023-01-01T00:00:00Z'
      }

      const cookieValue = `edu-session=${encodeURIComponent(JSON.stringify(sessionData))}`
      document.cookie = cookieValue

      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toEqual(
          expect.objectContaining({
            id: 1001, // Should extract correct ID from user ID
            email: 'suraj+1@speakaboos.com',
            name: 'suraj+1',
            isOfflineDemo: false
          })
        )
      })
    })

    it('extracts correct numeric IDs for known users', async () => {
      const testCases = [
        { userId: 'teacher_suraj_plus_001', expectedId: 1001 },
        { userId: 'teacher_suraj_plus_002', expectedId: 1002 },
        { userId: 'teacher_suraj_001', expectedId: 1000 }
      ]

      for (const { userId, expectedId } of testCases) {
        const sessionData = {
          userId,
          email: 'teacher@school.edu',
          userType: 'teacher' as const,
          authenticatedAt: '2023-01-01T00:00:00Z'
        }

        const cookieValue = `edu-session=${encodeURIComponent(JSON.stringify(sessionData))}`
        document.cookie = cookieValue

        const { result } = renderHook(() => useTeacherAuth())
        
        await waitFor(() => {
          expect(result.current.teacher?.id).toBe(expectedId)
        })

        // Clear for next iteration
        document.cookie = ''
      }
    })

    it('handles corrupted secure session cookie gracefully', async () => {
      document.cookie = 'edu-session=invalid-json'
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toBe(null)
      })

      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Error parsing secure session:',
        expect.any(Error)
      )
    })
  })

  describe('LocalStorage migration', () => {
    it('migrates teacher from localStorage to secure session', async () => {
      const teacherData = {
        id: 1001,
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        school: 'Test School',
        grade_level: 'K-5',
        ambassador_status: false,
        created_at: '2023-01-01'
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'teacher_session') {
          return JSON.stringify(teacherData)
        }
        return null
      })

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toEqual(teacherData)
      })

      expect(consoleSpy.log).toHaveBeenCalledWith('Migrating teacher from localStorage:', teacherData)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('teacher_session')
    })

    it('handles corrupted localStorage teacher data gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'teacher_session') {
          return 'invalid-json'
        }
        return null
      })

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toBe(null)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('teacher_session')
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Error parsing stored teacher:',
        expect.any(Error)
      )
    })
  })

  describe('Login functionality', () => {
    it('sets teacher and creates secure session on login', () => {
      const teacherData = {
        id: 1001,
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        school: 'Test School',
        grade_level: 'K-5',
        ambassador_status: false,
        created_at: '2023-01-01'
      }

      const { result } = renderHook(() => useTeacherAuth())

      act(() => {
        result.current.login(teacherData)
      })

      expect(result.current.teacher).toEqual(teacherData)
      expect(result.current.isAuthenticated).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'teacher_session',
        JSON.stringify(teacherData)
      )
    })
  })

  describe('Logout functionality', () => {
    it('clears all session data on logout', () => {
      const teacherData = {
        id: 1001,
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        school: 'Test School',
        grade_level: 'K-5',
        ambassador_status: false,
        created_at: '2023-01-01'
      }

      const { result } = renderHook(() => useTeacherAuth())

      // First login
      act(() => {
        result.current.login(teacherData)
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.teacher).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('teacher_session')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('teacher_session_bridge')
    })
  })

  describe('No session scenarios', () => {
    it('handles no session found gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      document.cookie = ''

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toBe(null)
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.loading).toBe(false)
      })

      expect(consoleSpy.log).toHaveBeenCalledWith('useTeacherAuth: No teacher session found')
    })
  })

  describe('Priority and edge cases', () => {
    it('prioritizes bridge session over cookies', async () => {
      const bridgeTeacher = {
        id: 1001,
        email: 'bridge@school.edu',
        name: 'Bridge Teacher',
        school: 'Bridge School',
        grade_level: 'K-5',
        ambassador_status: false,
        created_at: '2023-01-01'
      }

      const clientSessionData = {
        userId: 'teacher_002',
        email: 'client@school.edu',
        userType: 'teacher',
        authenticatedAt: '2023-01-01T00:00:00Z',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'teacher_session_bridge') {
          return JSON.stringify(bridgeTeacher)
        }
        return null
      })

      const cookieValue = `edu-session-client=${encodeURIComponent(JSON.stringify(clientSessionData))}`
      document.cookie = cookieValue

      const { result } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result.current.teacher).toEqual(bridgeTeacher)
        expect(result.current.teacher?.email).toBe('bridge@school.edu')
      })
    })

    it('handles multiple initialization calls correctly', async () => {
      const teacherData = {
        id: 1001,
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        school: 'Test School',
        grade_level: 'K-5',
        ambassador_status: false,
        created_at: '2023-01-01'
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'teacher_session_bridge') {
          return JSON.stringify(teacherData)
        }
        return null
      })

      // Render the hook multiple times to ensure it handles re-initialization correctly
      const { result: result1 } = renderHook(() => useTeacherAuth())
      const { result: result2 } = renderHook(() => useTeacherAuth())

      await waitFor(() => {
        expect(result1.current.teacher).toEqual(teacherData)
        expect(result2.current.teacher).toEqual(teacherData)
      })
    })
  })

  describe('Authentication state consistency', () => {
    it('maintains consistent isAuthenticated state', () => {
      const { result } = renderHook(() => useTeacherAuth())

      // Initial state
      expect(result.current.isAuthenticated).toBe(!!result.current.teacher)

      // After login
      const teacherData = {
        id: 1001,
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        school: 'Test School',
        grade_level: 'K-5',
        ambassador_status: false,
        created_at: '2023-01-01'
      }

      act(() => {
        result.current.login(teacherData)
      })

      expect(result.current.isAuthenticated).toBe(!!result.current.teacher)
      expect(result.current.isAuthenticated).toBe(true)

      // After logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(!!result.current.teacher)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})