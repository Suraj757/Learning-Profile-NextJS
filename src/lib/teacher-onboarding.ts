import { Teacher, Classroom } from './supabase'

export type OnboardingStatus = 
  | 'required'           // Must show onboarding 
  | 'suggested'          // Show prominent tour button
  | 'available'          // Show subtle tour option
  | 'hidden'             // Don't show onboarding

export interface OnboardingState {
  shouldShow: OnboardingStatus
  reason: string
  daysSinceRegistration: number
  hasCompletedSetup: boolean
  suggestions: string[]
}

/**
 * Determines if and how onboarding should be presented to a teacher
 */
export function getOnboardingStatus(
  teacher: Teacher, 
  classrooms: Classroom[] = [],
  assignments: any[] = [],
  searchParams?: URLSearchParams
): OnboardingState {
  const now = new Date()
  const registrationDate = new Date(teacher.created_at)
  const daysSinceRegistration = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Explicit tour request
  if (searchParams?.get('tour') === 'true') {
    return {
      shouldShow: 'required',
      reason: 'Explicitly requested tour',
      daysSinceRegistration,
      hasCompletedSetup: classrooms.length > 0,
      suggestions: ['Complete all 5 steps to get the most value']
    }
  }

  // Brand new teachers (never completed or skipped onboarding)
  if (!teacher.onboarding_completed && !teacher.onboarding_skipped) {
    return {
      shouldShow: 'required',
      reason: 'First-time teacher - onboarding required',
      daysSinceRegistration,
      hasCompletedSetup: false,
      suggestions: [
        'See real student insights in action',
        'Learn how to send assessments to families',
        'Discover daily classroom tools'
      ]
    }
  }

  // Teachers who skipped onboarding but haven't set up anything
  if (teacher.onboarding_skipped && classrooms.length === 0 && daysSinceRegistration >= 3) {
    return {
      shouldShow: 'suggested',
      reason: 'Skipped onboarding but no classroom setup after 3+ days',
      daysSinceRegistration,
      hasCompletedSetup: false,
      suggestions: [
        'Take the 5-minute tour to get started',
        'See what student insights look like',
        'Create your first classroom'
      ]
    }
  }

  // Teachers with classrooms but no assessments sent (after 1 week)
  if (classrooms.length > 0 && assignments.length === 0 && daysSinceRegistration >= 7) {
    return {
      shouldShow: 'suggested',
      reason: 'Has classrooms but no assessments sent after 1 week',
      daysSinceRegistration,
      hasCompletedSetup: true,
      suggestions: [
        'Learn how to send assessment links to parents',
        'See the parent experience',
        'Discover student reference cards'
      ]
    }
  }

  // Re-engagement for inactive teachers (no activity in 2+ weeks)
  if (daysSinceRegistration >= 14 && assignments.length === 0) {
    return {
      shouldShow: 'suggested',
      reason: 'Inactive teacher - re-engagement opportunity',
      daysSinceRegistration,
      hasCompletedSetup: classrooms.length > 0,
      suggestions: [
        'Refresh your memory with the quick tour',
        'Explore new features',
        'Get tips from successful teachers'
      ]
    }
  }

  // Teachers can always access onboarding if they want
  return {
    shouldShow: 'available',
    reason: 'Optional tour available',
    daysSinceRegistration,
    hasCompletedSetup: classrooms.length > 0 && assignments.length > 0,
    suggestions: []
  }
}

/**
 * Updates teacher's onboarding completion status
 */
export async function markOnboardingCompleted(teacherId: number): Promise<boolean> {
  try {
    const { supabase } = await import('./supabase')
    
    if (!supabase) {
      // For offline teachers, update localStorage
      const storedTeacher = localStorage.getItem('teacher_session')
      if (storedTeacher) {
        const teacherData = JSON.parse(storedTeacher)
        teacherData.onboarding_completed = true
        teacherData.onboarding_completed_at = new Date().toISOString()
        localStorage.setItem('teacher_session', JSON.stringify(teacherData))
      }
      return true
    }

    const { error } = await supabase
      .from('teachers')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', teacherId)

    if (error) {
      console.error('Error marking onboarding as completed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating onboarding status:', error)
    return false
  }
}

/**
 * Updates teacher's onboarding skipped status
 */
export async function markOnboardingSkipped(teacherId: number): Promise<boolean> {
  try {
    const { supabase } = await import('./supabase')
    
    if (!supabase) {
      // For offline teachers, update localStorage
      const storedTeacher = localStorage.getItem('teacher_session')
      if (storedTeacher) {
        const teacherData = JSON.parse(storedTeacher)
        teacherData.onboarding_skipped = true
        teacherData.onboarding_skipped_at = new Date().toISOString()
        localStorage.setItem('teacher_session', JSON.stringify(teacherData))
      }
      return true
    }

    const { error } = await supabase
      .from('teachers')
      .update({
        onboarding_skipped: true,
        onboarding_skipped_at: new Date().toISOString()
      })
      .eq('id', teacherId)

    if (error) {
      console.error('Error marking onboarding as skipped:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating onboarding skip status:', error)
    return false
  }
}

/**
 * Gets onboarding analytics for a teacher
 */
export function getOnboardingAnalytics(teacher: Teacher): {
  completionTime?: number  // minutes from registration to completion
  skipTime?: number       // minutes from registration to skip
  currentStep?: number    // if in progress
  engagementLevel: 'high' | 'medium' | 'low'
} {
  const registrationDate = new Date(teacher.created_at)
  
  let completionTime: number | undefined
  let skipTime: number | undefined
  
  if (teacher.onboarding_completed_at) {
    const completedDate = new Date(teacher.onboarding_completed_at)
    completionTime = Math.floor((completedDate.getTime() - registrationDate.getTime()) / (1000 * 60))
  }
  
  if (teacher.onboarding_skipped_at) {
    const skippedDate = new Date(teacher.onboarding_skipped_at)
    skipTime = Math.floor((skippedDate.getTime() - registrationDate.getTime()) / (1000 * 60))
  }
  
  // Determine engagement level
  let engagementLevel: 'high' | 'medium' | 'low' = 'medium'
  
  if (teacher.onboarding_completed && completionTime && completionTime <= 10) {
    engagementLevel = 'high' // Completed quickly
  } else if (teacher.onboarding_skipped && skipTime && skipTime <= 2) {
    engagementLevel = 'low' // Skipped immediately
  } else if (!teacher.onboarding_completed && !teacher.onboarding_skipped) {
    const daysSinceRegistration = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceRegistration > 7) {
      engagementLevel = 'low' // Hasn't engaged after a week
    }
  }
  
  return {
    completionTime,
    skipTime,
    engagementLevel
  }
}