// Enhanced Authentication Hooks - Educational Platform
// Supports both secure enterprise auth and simplified UX flows
// Based on UX research findings for better teacher experience

'use client'
import { useState, useEffect, useCallback, useContext, createContext } from 'react'
import { SecureUser, SecureSession, UserRole } from './types'

// Authentication Context
interface AuthContextType {
  user: SecureUser | null
  session: SecureSession | null
  loading: boolean
  permissions: string[]
  educationalContext: {
    activeSchoolId?: string
    activeClassroomId?: string
  }
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  logout: () => Promise<void>
  switchContext: (context: EducationalContext) => Promise<void>
  checkPermission: (action: string, resource: string, resourceId?: string) => boolean
  refreshSession: () => Promise<void>
}

interface LoginCredentials {
  email: string
  password?: string
  role: UserRole
  schoolId?: string
  educationalPurpose?: string
}

interface LoginResult {
  success: boolean
  error?: string
  requiresMFA?: boolean
  challengeId?: string
  requiresCOPPA?: boolean
  requiresFERPA?: boolean
}

interface EducationalContext {
  schoolId?: string
  classroomId?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

// Secure Authentication Provider
export function SecureAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SecureUser | null>(null)
  const [session, setSession] = useState<SecureSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])
  const [educationalContext, setEducationalContext] = useState<{
    activeSchoolId?: string
    activeClassroomId?: string
  }>({})

  // Initialize authentication state
  useEffect(() => {
    initializeAuth()
  }, [])

  // Session refresh timer
  useEffect(() => {
    if (session && user) {
      const refreshInterval = setInterval(() => {
        checkSessionHealth()
      }, 5 * 60 * 1000) // Check every 5 minutes

      return () => clearInterval(refreshInterval)
    }
  }, [session, user])

  // Initialize authentication from secure cookie/session
  const initializeAuth = async () => {
    try {
      setLoading(true)
      
      // Check for existing session
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Request-Source': 'auth-init'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSession(data.session)
        setPermissions(data.permissions || [])
        setEducationalContext({
          activeSchoolId: data.session?.active_school_id,
          activeClassroomId: data.session?.active_classroom_id
        })
        
        // Log successful session restoration
        console.log('🔐 Session restored for user:', data.user.email)
      } else if (response.status === 401) {
        // Session expired or invalid
        console.log('🔑 No valid session found')
        clearAuthState()
      } else {
        throw new Error('Session verification failed')
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      clearAuthState()
    } finally {
      setLoading(false)
    }
  }

  // Secure login with educational compliance
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Educational-Purpose': credentials.educationalPurpose || 'classroom_management'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setSession(data.session)
        setPermissions(data.educational_context?.permissions || [])
        setEducationalContext({
          activeSchoolId: data.educational_context?.active_school_id,
          activeClassroomId: data.educational_context?.active_classroom_id
        })
        
        // Log successful login
        await logAuthEvent('secure_login_success', data.user.id)
        
        return { success: true }
      } else if (data.requires_mfa) {
        return {
          success: false,
          requiresMFA: true,
          challengeId: data.challenge_id
        }
      } else if (data.requires_coppa_consent) {
        return {
          success: false,
          requiresCOPPA: true
        }
      } else if (data.requires_ferpa_training) {
        return {
          success: false,
          requiresFERPA: true
        }
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Network error during login'
      }
    }
  }, [])

  // Secure logout with session cleanup
  const logout = useCallback(async () => {
    try {
      // Log logout attempt
      if (user) {
        await logAuthEvent('secure_logout_initiated', user.id)
      }

      // Call logout API to invalidate session
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Educational-Purpose': 'session_termination'
        }
      })

      if (response.ok) {
        console.log('🔓 Secure logout successful')
      } else {
        console.warn('Logout API failed, clearing local state anyway')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthState()
      
      // Redirect to login page
      window.location.href = '/teacher/register'
    }
  }, [user])

  // Switch educational context (school/classroom)
  const switchContext = useCallback(async (context: EducationalContext) => {
    if (!session) throw new Error('No active session')

    try {
      const response = await fetch('/api/auth/switch-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Educational-Purpose': 'context_switch'
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: session.session_id,
          newContext: context
        })
      })

      if (response.ok) {
        const data = await response.json()
        setEducationalContext({
          activeSchoolId: context.schoolId,
          activeClassroomId: context.classroomId
        })
        
        // Update permissions for new context
        setPermissions(data.permissions || [])
        
        await logAuthEvent('context_switch', user?.id, {
          newSchoolId: context.schoolId,
          newClassroomId: context.classroomId
        })
        
        console.log('🏫 Educational context switched:', context)
      } else {
        throw new Error('Context switch failed')
      }
    } catch (error) {
      console.error('Context switch error:', error)
      throw error
    }
  }, [session, user])

  // Check specific permissions
  const checkPermission = useCallback((
    action: string, 
    resource: string, 
    resourceId?: string
  ): boolean => {
    if (!user || !permissions.length) return false

    // Build permission string
    const permissionString = `${action}:${resource}`
    const wildcardPermission = `${action}:*`
    const resourcePermission = `*:${resource}`

    // Check exact match, wildcard matches
    return permissions.includes(permissionString) ||
           permissions.includes(wildcardPermission) ||
           permissions.includes(resourcePermission) ||
           permissions.includes('*:*') // Super admin

  }, [user, permissions])

  // Session health monitoring
  const checkSessionHealth = useCallback(async () => {
    if (!session || !user) return

    try {
      const response = await fetch('/api/auth/heartbeat', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Session-ID': session.session_id
        }
      })

      if (!response.ok) {
        console.warn('⚠️ Session health check failed')
        
        if (response.status === 401) {
          console.log('🔑 Session expired, logging out')
          await logout()
        }
      }
    } catch (error) {
      console.error('Session health check error:', error)
    }
  }, [session, user, logout])

  // Refresh session token
  const refreshSession = useCallback(async () => {
    if (!session) return

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Educational-Purpose': 'session_refresh'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        console.log('🔄 Session refreshed successfully')
      } else {
        console.warn('Session refresh failed')
        if (response.status === 401) {
          await logout()
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }, [session, logout])

  // Clear authentication state
  const clearAuthState = () => {
    setUser(null)
    setSession(null)
    setPermissions([])
    setEducationalContext({})
  }

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    permissions,
    educationalContext,
    login,
    logout,
    switchContext,
    checkPermission,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Main authentication hook
export function useSecureAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useSecureAuth must be used within SecureAuthProvider')
  }
  
  return context
}

// Role-specific hooks for type safety
export function useTeacherAuth(): {
  teacher: SecureUser | null
  classrooms: string[]
  canAccessStudent: (studentId: string) => boolean
  loading: boolean
} {
  const { user, loading, educationalContext, checkPermission } = useSecureAuth()
  
  const teacher = user?.role === 'teacher' ? user : null
  
  const canAccessStudent = (studentId: string): boolean => {
    return teacher ? checkPermission('read', 'student_profile', studentId) : false
  }

  return {
    teacher,
    classrooms: teacher?.grade_levels || [],
    canAccessStudent,
    loading
  }
}

export function useParentAuth(): {
  parent: SecureUser | null
  children: string[]
  canAccessChild: (childId: string) => boolean
  loading: boolean
} {
  const { user, loading, checkPermission } = useSecureAuth()
  
  const parent = user?.role === 'parent' ? user : null
  
  const canAccessChild = (childId: string): boolean => {
    return parent ? checkPermission('read', 'student_profile', childId) : false
  }

  return {
    parent,
    children: [], // Would be fetched from parent profile
    canAccessChild,
    loading
  }
}

export function useAdminAuth(): {
  admin: SecureUser | null
  schools: string[]
  canManageSchool: (schoolId: string) => boolean
  loading: boolean
} {
  const { user, loading, checkPermission } = useSecureAuth()
  
  const admin = user?.role === 'admin' ? user : null
  
  const canManageSchool = (schoolId: string): boolean => {
    return admin ? checkPermission('manage', 'school', schoolId) : false
  }

  return {
    admin,
    schools: admin?.school_id ? [admin.school_id] : [],
    canManageSchool,
    loading
  }
}

// Permission checking hook
export function usePermissions() {
  const { checkPermission, permissions } = useSecureAuth()
  
  return {
    hasPermission: checkPermission,
    permissions,
    
    // Common permission checks
    canReadProfile: (profileId: string) => checkPermission('read', 'student_profile', profileId),
    canWriteProfile: (profileId: string) => checkPermission('write', 'student_profile', profileId),
    canManageClassroom: (classroomId: string) => checkPermission('manage', 'classroom', classroomId),
    canCommunicateParents: () => checkPermission('communicate', 'parents'),
    canExportData: () => checkPermission('export', 'data'),
    canViewAuditLogs: () => checkPermission('read', 'audit_log')
  }
}

// Security monitoring hook
export function useSecurityMonitoring() {
  const { user, session } = useSecureAuth()
  
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([])
  const [lastActivity, setLastActivity] = useState<Date | null>(null)

  useEffect(() => {
    if (user && session) {
      // Monitor for security events
      const monitoringInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/auth/security-status', {
            credentials: 'include'
          })
          
          if (response.ok) {
            const data = await response.json()
            setSecurityAlerts(data.alerts || [])
            setLastActivity(new Date(data.lastActivity))
          }
        } catch (error) {
          console.error('Security monitoring error:', error)
        }
      }, 30 * 1000) // Check every 30 seconds

      return () => clearInterval(monitoringInterval)
    }
  }, [user, session])

  return {
    securityAlerts,
    lastActivity,
    hasSecurityAlerts: securityAlerts.length > 0,
    criticalAlerts: securityAlerts.filter(alert => 
      alert.includes('SUSPICIOUS') || alert.includes('UNAUTHORIZED')
    )
  }
}

// Audit logging utility
async function logAuthEvent(eventType: string, userId?: string, metadata?: any) {
  try {
    await fetch('/api/auth/audit', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventType,
        userId,
        metadata,
        timestamp: new Date().toISOString(),
        source: 'client_auth_hooks'
      })
    })
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}

// Auth guard components
export function AuthGuard({ 
  children, 
  requiredRole,
  requiredPermission,
  fallback 
}: {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: string
  fallback?: React.ReactNode
}) {
  const { user, loading, checkPermission } = useSecureAuth()

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  if (!user) {
    return fallback || <div>Authentication required</div>
  }

  if (requiredRole && user.role !== requiredRole) {
    return fallback || <div>Insufficient permissions</div>
  }

  if (requiredPermission && !checkPermission(...requiredPermission.split(':'))) {
    return fallback || <div>Access denied</div>
  }

  return <>{children}</>
}

// Simplified authentication hooks for better UX (alongside existing secure hooks)

export interface SimpleUser {
  id: string
  email: string
  name: string
  userType: 'teacher' | 'parent' | 'admin'
  school?: string
  gradeLevel?: string
  isVerified: boolean
  isEduDomain?: boolean
}

export interface SimpleSessionData {
  userId: string
  email: string
  userType: string
  authenticatedAt: string
  expiresAt: string
  rememberMe?: boolean
  isEduDomain?: boolean
}

export interface SimpleAuthState {
  user: SimpleUser | null
  loading: boolean
  isAuthenticated: boolean
  sessionData: SimpleSessionData | null
  context: {
    isOfflineDemo: boolean
    hasRealData: boolean
    isEduDomain: boolean
    dataSource: 'offline_demo' | 'demo_data' | 'real_data' | 'unknown'
  } | null
}

export interface SimpleAuthActions {
  login: (email: string, password: string, userType: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; data?: any }>
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  checkSession: () => Promise<void>
}

// Simplified authentication hook for better UX (based on research findings)
export function useSimpleAuth(): SimpleAuthState & SimpleAuthActions {
  const [authState, setAuthState] = useState<SimpleAuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    sessionData: null,
    context: null
  })
  
  // Check session status
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.authenticated && data.user) {
        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true,
          sessionData: data.session,
          context: data.dataState
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
          sessionData: null,
          context: null
        })
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Simplified login with enhanced error handling
  const login = useCallback(async (
    email: string, 
    password: string, 
    userType: string, 
    rememberMe: boolean = false
  ) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, userType, rememberMe })
      })
      
      const data = await response.json()
      
      if (data.success && data.user) {
        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true,
          sessionData: data.sessionData,
          context: data.context
        })
        
        return { success: true, data }
      } else {
        return { 
          success: false, 
          error: data.error || 'Login failed',
          field: data.field,
          suggestions: data.suggestions
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Network error - please check your connection and try again' 
      }
    }
  }, [])

  // Enhanced logout with cleanup
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        sessionData: null,
        context: null
      })
      
      // Clear any client-side storage
      localStorage.removeItem('teacher_session')
      localStorage.removeItem('teacher_session_bridge')
      
      // Redirect to login
      window.location.href = '/auth/login'
      
    } catch (error) {
      console.error('Logout error:', error)
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        sessionData: null,
        context: null
      })
      window.location.href = '/auth/login'
    }
  }, [])

  // Session refresh functionality
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'refresh' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await checkSession() // Refresh the current session data
        return true
      }
      
      return false
    } catch (error) {
      console.error('Session refresh failed:', error)
      return false
    }
  }, [checkSession])

  // Initialize session check on mount
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Set up periodic session validation (every 5 minutes)
  useEffect(() => {
    if (authState.isAuthenticated) {
      const interval = setInterval(() => {
        checkSession()
      }, 5 * 60 * 1000) // 5 minutes
      
      return () => clearInterval(interval)
    }
  }, [authState.isAuthenticated, checkSession])

  return {
    ...authState,
    login,
    logout,
    refreshSession,
    checkSession
  }
}

// Hook for password validation with real-time feedback
export function usePasswordValidation(email?: string) {
  const [validation, setValidation] = useState<{
    isValid: boolean
    errors: string[]
    suggestions: string[]
    strength: 'weak' | 'fair' | 'good' | 'strong'
  } | null>(null)
  
  const validatePassword = useCallback(async (password: string) => {
    if (!password) {
      setValidation(null)
      return
    }
    
    try {
      // Use the validation library directly for real-time feedback
      const { validatePassword: validate } = await import('./password-validation')
      const result = validate(password, email)
      setValidation(result)
    } catch (error) {
      console.error('Password validation error:', error)
    }
  }, [email])
  
  return {
    validation,
    validatePassword
  }
}

// Hook for email validation with educational context
export function useEmailValidation() {
  const [emailData, setEmailData] = useState<{
    valid: boolean
    exists: boolean
    isEducational: boolean
    recommendations: any[]
    authFlow: any
  } | null>(null)
  
  const [loading, setLoading] = useState(false)
  
  const validateEmail = useCallback(async (email: string, context?: string) => {
    if (!email) {
      setEmailData(null)
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, context })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEmailData({
          valid: data.valid,
          exists: data.exists,
          isEducational: data.domain.isEducational,
          recommendations: data.recommendations,
          authFlow: data.authFlow
        })
      } else {
        setEmailData(null)
      }
    } catch (error) {
      console.error('Email validation error:', error)
      setEmailData(null)
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    emailData,
    loading,
    validateEmail
  }
}

// Hook for session warnings and management
export function useSessionWarnings() {
  const [warnings, setWarnings] = useState<{
    expiringSoon: boolean
    hoursRemaining: number
  } | null>(null)
  
  const auth = useSimpleAuth()
  
  useEffect(() => {
    if (auth.sessionData?.expiresAt) {
      const checkExpiration = () => {
        const now = new Date()
        const expiresAt = new Date(auth.sessionData!.expiresAt)
        const hoursRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
        
        if (hoursRemaining <= 2 && hoursRemaining > 0) {
          setWarnings({
            expiringSoon: true,
            hoursRemaining
          })
        } else {
          setWarnings(null)
        }
      }
      
      // Check immediately
      checkExpiration()
      
      // Check every 30 minutes
      const interval = setInterval(checkExpiration, 30 * 60 * 1000)
      
      return () => clearInterval(interval)
    }
  }, [auth.sessionData])
  
  const extendSession = useCallback(async () => {
    const success = await auth.refreshSession()
    if (success) {
      setWarnings(null)
    }
    return success
  }, [auth.refreshSession])
  
  return {
    warnings,
    extendSession
  }
}

export default useSecureAuth