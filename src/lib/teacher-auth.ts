'use client'
import { useState, useEffect } from 'react'
import { Teacher } from './supabase'

// Client-side teacher authentication hook
export function useTeacherAuth() {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored teacher session
    const storedTeacher = localStorage.getItem('teacher_session')
    if (storedTeacher) {
      try {
        const teacherData = JSON.parse(storedTeacher)
        setTeacher(teacherData)
      } catch (error) {
        localStorage.removeItem('teacher_session')
      }
    }
    setLoading(false)
  }, [])

  const login = (teacherData: Teacher) => {
    setTeacher(teacherData)
    localStorage.setItem('teacher_session', JSON.stringify(teacherData))
  }

  const logout = () => {
    setTeacher(null)
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