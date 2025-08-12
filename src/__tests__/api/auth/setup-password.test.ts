/**
 * Tests for /api/auth/setup-password endpoint
 */

// Mock bcrypt before importing the route
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$hashedPasswordExample'),
  compare: jest.fn().mockResolvedValue(true)
}))

// Mock user storage functions
jest.mock('@/lib/auth/user-storage', () => ({
  getUserByEmail: jest.fn(),
  updateUser: jest.fn()
}))

// Mock password validation functions
jest.mock('@/lib/auth/password-validation', () => ({
  validatePassword: jest.fn(),
  validateEducationalEmail: jest.fn()
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn().mockImplementation((body, options = {}) => ({
      status: options.status || 200,
      headers: new Map(),
      json: async () => body
    }))
  }
}))

import { POST, GET } from '@/app/api/auth/setup-password/route'
import bcrypt from 'bcryptjs'

// Get references to mocked functions after import
const mockGetUserByEmail = require('@/lib/auth/user-storage').getUserByEmail as jest.MockedFunction<any>
const mockUpdateUser = require('@/lib/auth/user-storage').updateUser as jest.MockedFunction<any>
const mockValidatePassword = require('@/lib/auth/password-validation').validatePassword as jest.MockedFunction<any>
const mockValidateEducationalEmail = require('@/lib/auth/password-validation').validateEducationalEmail as jest.MockedFunction<any>

// Mock console methods to avoid noise in tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
}

describe('/api/auth/setup-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    consoleSpy.log.mockClear()
    consoleSpy.warn.mockClear()
    consoleSpy.error.mockClear()
    // Access the mocked NextResponse from the jest module
    const { NextResponse } = require('next/server')
    NextResponse.json.mockClear()
    
    // Set up default mocks
    mockValidateEducationalEmail.mockReturnValue({
      isValid: true,
      isEduDomain: true,
      warnings: [],
      suggestions: []
    })
    
    mockValidatePassword.mockReturnValue({
      isValid: true,
      errors: [],
      suggestions: [],
      strength: 'strong'
    })
  })

  afterAll(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.warn.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('POST /api/auth/setup-password', () => {
    const validPasswordData = {
      email: 'teacher@school.edu',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!'
    }

    const mockUser = {
      id: 'teacher_001',
      email: 'teacher@school.edu',
      name: 'Test Teacher',
      userType: 'teacher',
      needsPasswordSetup: true,
      isActive: true,
      isVerified: true
    }

    it('successfully sets up password for valid user', async () => {
      mockGetUserByEmail.mockReturnValue(mockUser)
      mockUpdateUser.mockReturnValue(true)

      const request = {
        json: async () => validPasswordData,
        ip: null,
        headers: {
          get: jest.fn().mockImplementation((key) => {
            if (key === 'x-forwarded-for') return '192.168.1.100'
            return null
          })
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.setupCompleted).toBe(true)
      expect(data.user.email).toBe('teacher@school.edu')
      expect(data.nextStep.action).toBe('redirect_to_login')

      // Should hash the password
      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPassword123!', 12)

      // Should update user
      expect(mockUpdateUser).toHaveBeenCalledWith('teacher@school.edu', {
        passwordHash: '$2b$12$hashedPasswordExample',
        needsPasswordSetup: false,
        passwordSetupAt: expect.any(String)
      })

      // Should log password setup
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[AUTH] Password setup completed: teacher@school.edu from 192.168.1.100'
      )
    })

    it('handles password validation errors', async () => {
      mockValidatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password must be at least 8 characters long'],
        suggestions: ['Try making your password longer'],
        strength: 'weak'
      })

      const request = {
        json: async () => ({
          email: 'teacher@school.edu',
          password: 'weak',
          confirmPassword: 'weak'
        })
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toContain('Password must be at least 8 characters long')
      expect(data.suggestions).toContain('Try making your password longer')
      expect(data.field).toBe('password')
    })

    it('handles email validation errors', async () => {
      mockValidateEducationalEmail.mockReturnValue({
        isValid: false,
        isEduDomain: false,
        warnings: ['Please enter a valid email address'],
        suggestions: []
      })

      const request = {
        json: async () => ({
          email: 'invalid-email',
          password: 'StrongPassword123!',
          confirmPassword: 'StrongPassword123!'
        })
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toContain('Valid email address is required')
      expect(data.field).toBe('email')
    })

    it('handles password mismatch', async () => {
      const request = {
        json: async () => ({
          email: 'teacher@school.edu',
          password: 'StrongPassword123!',
          confirmPassword: 'DifferentPassword123!'
        })
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toContain('Passwords do not match - please retype your password carefully')
      expect(data.field).toBe('confirmPassword')
    })

    it('handles user not found', async () => {
      mockGetUserByEmail.mockReturnValue(null)

      const request = {
        json: async () => validPasswordData
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('We couldn\'t find an account with this email address')
      expect(data.field).toBe('email')
      expect(data.suggestions).toContain('Double-check your email address for typos')
    })

    it('handles user that doesn\'t need password setup', async () => {
      mockGetUserByEmail.mockReturnValue({
        ...mockUser,
        needsPasswordSetup: false
      })

      const request = {
        json: async () => validPasswordData
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Your password has already been set up. You can now use the regular login page.')
      expect(data.action).toBe('redirect_to_login')
    })

    it('handles database update failure', async () => {
      mockGetUserByEmail.mockReturnValue(mockUser)
      mockUpdateUser.mockReturnValue(false)

      const request = {
        json: async () => validPasswordData
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('We encountered an issue saving your password')
      expect(data.field).toBe('system')
    })

    it('handles bcrypt hashing errors', async () => {
      mockGetUserByEmail.mockReturnValue(mockUser)
      const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>
      mockBcryptHash.mockRejectedValueOnce(new Error('Hashing failed'))

      const request = {
        json: async () => validPasswordData
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('We\'re experiencing technical difficulties')
      expect(consoleSpy.error).toHaveBeenCalledWith('Password setup error:', expect.any(Error))
    })

    it('shows different success message for .edu domains', async () => {
      mockGetUserByEmail.mockReturnValue(mockUser)
      mockUpdateUser.mockReturnValue(true)

      const request = {
        json: async () => validPasswordData,
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.message).toContain('Welcome to the educational platform!')
      expect(data.user.isEduDomain).toBe(true)
    })

    it('shows generic success message for non-.edu domains', async () => {
      mockValidateEducationalEmail.mockReturnValue({
        isValid: true,
        isEduDomain: false,
        warnings: [],
        suggestions: []
      })

      mockGetUserByEmail.mockReturnValue({
        ...mockUser,
        email: 'teacher@company.com'
      })
      mockUpdateUser.mockReturnValue(true)

      const request = {
        json: async () => ({
          ...validPasswordData,
          email: 'teacher@company.com'
        }),
        ip: null,
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.message).toBe('Password set up successfully! You can now log in to access your account.')
      expect(data.user.isEduDomain).toBe(false)
    })

    it('handles malformed JSON request', async () => {
      const request = {
        json: async () => {
          throw new SyntaxError('Invalid JSON')
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('We\'re experiencing technical difficulties')
    })

    it('includes debug logs for update process', async () => {
      mockGetUserByEmail.mockReturnValue(mockUser)
      mockUpdateUser.mockReturnValue(true)

      const request = {
        json: async () => validPasswordData,
        ip: null,
        headers: { get: jest.fn().mockReturnValue(null) }
      } as any

      await POST(request)

      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] Update success: true')
      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] User after update:', expect.any(Object))
    })

    it('validates passwords with educational context warnings', async () => {
      mockValidateEducationalEmail.mockReturnValue({
        isValid: true,
        isEduDomain: false,
        warnings: ['This doesn\'t appear to be an educational email address'],
        suggestions: ['Educational emails typically end in .edu']
      })

      mockGetUserByEmail.mockReturnValue(mockUser)
      mockUpdateUser.mockReturnValue(true)

      const request = {
        json: async () => validPasswordData,
        ip: null,
        headers: { get: jest.fn().mockReturnValue(null) }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      // Warnings are included in validation but don't prevent success
    })

    it('shows development error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const request = {
        json: async () => {
          throw new Error('Test error for development')
        }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.error).toContain('Password setup error: Test error for development')

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('GET /api/auth/setup-password', () => {
    it('returns setup status for existing user needing setup', async () => {
      const mockUser = {
        id: 'teacher_001',
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        userType: 'teacher',
        needsPasswordSetup: true
      }

      mockGetUserByEmail.mockReturnValue(mockUser)

      const request = {
        url: 'http://localhost:3000/api/auth/setup-password?email=teacher@school.edu'
      } as any

      const response = await GET(request)
      const data = await response.json()

      expect(data.needsSetup).toBe(true)
      expect(data.exists).toBe(true)
      expect(data.user.email).toBe('teacher@school.edu')
      expect(data.context.message).toContain('Please set up your password')
    })

    it('returns setup status for user that doesn\'t need setup', async () => {
      const mockUser = {
        id: 'teacher_001',
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        userType: 'teacher',
        needsPasswordSetup: false
      }

      mockGetUserByEmail.mockReturnValue(mockUser)

      const request = {
        url: 'http://localhost:3000/api/auth/setup-password?email=teacher@school.edu'
      } as any

      const response = await GET(request)
      const data = await response.json()

      expect(data.needsSetup).toBe(false)
      expect(data.exists).toBe(true)
      expect(data.context.message).toContain('Account is already set up and ready to use')
    })

    it('returns status for non-existent user', async () => {
      mockGetUserByEmail.mockReturnValue(null)

      const request = {
        url: 'http://localhost:3000/api/auth/setup-password?email=nonexistent@school.edu'
      } as any

      const response = await GET(request)
      const data = await response.json()

      expect(data.needsSetup).toBe(false)
      expect(data.exists).toBe(false)
      expect(data.user).toBeUndefined()
    })

    it('handles missing email parameter', async () => {
      const request = {
        url: 'http://localhost:3000/api/auth/setup-password'
      } as any

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email parameter required')
    })

    it('handles errors during GET request gracefully', async () => {
      mockGetUserByEmail.mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = {
        url: 'http://localhost:3000/api/auth/setup-password?email=teacher@school.edu'
      } as any

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(consoleSpy.error).toHaveBeenCalledWith('Password setup check error:', expect.any(Error))
    })

    it('includes educational domain context in response', async () => {
      const mockUser = {
        id: 'teacher_001',
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        userType: 'teacher',
        needsPasswordSetup: true
      }

      mockGetUserByEmail.mockReturnValue(mockUser)

      const request = {
        url: 'http://localhost:3000/api/auth/setup-password?email=teacher@school.edu'
      } as any

      const response = await GET(request)
      const data = await response.json()

      expect(data.context.isEduDomain).toBe(true)
      expect(data.user.isEduDomain).toBe(true)
    })

    it('handles non-educational domains correctly', async () => {
      mockValidateEducationalEmail.mockReturnValue({
        isValid: true,
        isEduDomain: false,
        warnings: [],
        suggestions: []
      })

      const mockUser = {
        id: 'teacher_001',
        email: 'teacher@company.com',
        name: 'Test Teacher',
        userType: 'teacher',
        needsPasswordSetup: true
      }

      mockGetUserByEmail.mockReturnValue(mockUser)

      const request = {
        url: 'http://localhost:3000/api/auth/setup-password?email=teacher@company.com'
      } as any

      const response = await GET(request)
      const data = await response.json()

      expect(data.context.isEduDomain).toBe(false)
      expect(data.user.isEduDomain).toBe(false)
    })

    it('handles users with missing needsPasswordSetup flag', async () => {
      const mockUser = {
        id: 'teacher_001',
        email: 'teacher@school.edu',
        name: 'Test Teacher',
        userType: 'teacher'
        // needsPasswordSetup is undefined
      }

      mockGetUserByEmail.mockReturnValue(mockUser)

      const request = {
        url: 'http://localhost:3000/api/auth/setup-password?email=teacher@school.edu'
      } as any

      const response = await GET(request)
      const data = await response.json()

      expect(data.needsSetup).toBe(false) // Should default to false
      expect(data.exists).toBe(true)
    })
  })
})