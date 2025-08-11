'use client'
import { useState, useEffect } from 'react'
import { Teacher } from './supabase'

// Session data stored in secure cookie
interface SecureSession {
  userId: string
  email: string
  userType: 'teacher' | 'parent'
  authenticatedAt: string
  teacherData?: Teacher
}

// Client-side teacher authentication hook
export function useTeacherAuth() {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for secure session cookie first
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('edu-session='))
      ?.split('=')[1]

    if (sessionCookie) {
      try {
        const sessionData: SecureSession = JSON.parse(decodeURIComponent(sessionCookie))
        if (sessionData && sessionData.userId && sessionData.userType === 'teacher') {
          // If we have teacher data in session, use it
          if (sessionData.teacherData) {
            console.log('Found secure teacher session:', sessionData.teacherData)
            setTeacher(sessionData.teacherData)
          } else {
            // Create teacher object from session data with proper ID extraction
            let numericId: number = Date.now() // fallback
            
            // First check if teacherData already has the correct ID
            if (sessionData.teacherData?.id && typeof sessionData.teacherData.id === 'number') {
              numericId = sessionData.teacherData.id
              console.log('Using teacher ID from session data:', numericId)
            } else if (sessionData.userId.includes('teacher_suraj_plus_001')) {
              numericId = 1001
            } else if (sessionData.userId.includes('teacher_suraj_plus_002')) {
              numericId = 1002
            } else if (sessionData.userId.includes('teacher_suraj_001')) {
              numericId = 1000
            } else if (sessionData.userId.includes('teacher_')) {
              // Try to extract from user ID
              const idParts = sessionData.userId.split('_')
              if (idParts.length > 1 && idParts[1] !== 'suraj') {
                const extracted = parseInt(idParts[1])
                if (!isNaN(extracted)) numericId = extracted
              }
            } else {
              const directParse = parseInt(sessionData.userId)
              if (!isNaN(directParse)) numericId = directParse
            }
              
            const teacherFromSession: Teacher = {
              id: numericId,
              email: sessionData.email,
              name: sessionData.email.split('@')[0], // Fallback name
              school: '',
              grade_level: '',
              ambassador_status: false,
              created_at: sessionData.authenticatedAt,
              isOfflineDemo: sessionData.email.includes('demo')
            }
            console.log('Created teacher from session:', teacherFromSession)
            setTeacher(teacherFromSession)
          }
        }
      } catch (error) {
        console.error('Error parsing secure session:', error)
        // Clear invalid cookie
        document.cookie = 'edu-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
    } else {
      // Fall back to old localStorage method for existing users (temporary migration)
      const storedTeacher = localStorage.getItem('teacher_session')
      if (storedTeacher) {
        try {
          const teacherData = JSON.parse(storedTeacher)
          console.log('Migrating teacher from localStorage:', teacherData)
          setTeacher(teacherData)
          
          // Migrate to secure session
          const sessionData: SecureSession = {
            userId: teacherData.id.toString(),
            email: teacherData.email,
            userType: 'teacher',
            authenticatedAt: new Date().toISOString(),
            teacherData: teacherData
          }
          
          const cookieValue = encodeURIComponent(JSON.stringify(sessionData))
          document.cookie = `edu-session=${cookieValue}; path=/; secure; samesite=strict; max-age=86400`
          
          // Clean up old localStorage
          localStorage.removeItem('teacher_session')
        } catch (error) {
          console.error('Error parsing stored teacher:', error)
          localStorage.removeItem('teacher_session')
        }
      } else {
        console.log('No teacher session found')
      }
    }
    setLoading(false)
  }, [])

  const login = (teacherData: Teacher) => {
    setTeacher(teacherData)
    
    // Create secure session
    const sessionData: SecureSession = {
      userId: teacherData.id.toString(),
      email: teacherData.email,
      userType: 'teacher',
      authenticatedAt: new Date().toISOString(),
      teacherData: teacherData
    }
    
    // Set secure cookie
    const cookieValue = encodeURIComponent(JSON.stringify(sessionData))
    document.cookie = `edu-session=${cookieValue}; path=/; secure; samesite=strict; max-age=86400` // 24 hours
    
    // Also update localStorage for backward compatibility (temporary)
    localStorage.setItem('teacher_session', JSON.stringify(teacherData))
  }

  const logout = () => {
    setTeacher(null)
    
    // Clear secure cookie
    document.cookie = 'edu-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    
    // Clear localStorage
    localStorage.removeItem('teacher_session')
  }

  return {
    teacher,
    loading,
    isAuthenticated: !!teacher,
    login,
    logout
  }
}

// Generate assessment link with teacher tracking
export function generateAssessmentLink(assignmentToken: string, baseUrl: string = '') {
  return `${baseUrl}/assessment/start?ref=${assignmentToken}`
}

// Generate unique assignment token
export function generateAssignmentToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format teacher display name
export function formatTeacherName(teacher: Teacher): string {
  return teacher.name || teacher.email.split('@')[0]
}

// Generate classroom invite code
export function generateClassroomCode(teacherId: number, classroomId: number): string {
  return `${teacherId}-${classroomId}-${Date.now().toString(36)}`
}