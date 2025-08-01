// Progress Management Utilities
export interface AssessmentProgress {
  session_id: string
  child_name: string
  grade: string
  responses: Record<number, number>
  current_question: number
  parent_email?: string
  assignment_token?: string
  last_saved?: string
  expires_at?: string
}

export interface ProgressSession {
  session_id: string
  child_name: string
  grade: string
  current_question: number
  total_questions: number
  progress_percentage: number
  responses_count: number
  last_saved: string
  expires_at: string
  assignment_token?: string
}

// Generate a unique session ID
export function generateSessionId(): string {
  return 'assessment_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
}

// Get or create session ID from storage
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId()
  
  let sessionId = localStorage.getItem('assessment_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('assessment_session_id', sessionId)
  }
  return sessionId
}

// Clear session ID (when assessment is completed)
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('assessment_session_id')
  }
}

// Save progress to backend
export async function saveProgress(progress: Partial<AssessmentProgress>): Promise<{
  success: boolean
  error?: string
  last_saved?: string
  expires_at?: string
}> {
  try {
    const response = await fetch('/api/assessment-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(progress)
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to save progress' }
    }

    return {
      success: true,
      last_saved: data.last_saved,
      expires_at: data.expires_at
    }
  } catch (error) {
    console.error('Error saving progress:', error)
    return { success: false, error: 'Network error while saving progress' }
  }
}

// Load progress from backend
export async function loadProgress(sessionId: string): Promise<{
  progress: AssessmentProgress | null
  found: boolean
  error?: string
}> {
  try {
    const response = await fetch(`/api/assessment-progress?session_id=${encodeURIComponent(sessionId)}`)
    const data = await response.json()
    
    if (!response.ok) {
      return { progress: null, found: false, error: data.error || 'Failed to load progress' }
    }

    return {
      progress: data.progress,
      found: data.found
    }
  } catch (error) {
    console.error('Error loading progress:', error)
    return { progress: null, found: false, error: 'Network error while loading progress' }
  }
}

// Recover progress by email for cross-device access
export async function recoverProgressByEmail(parentEmail: string): Promise<{
  progress_sessions: ProgressSession[]
  found: boolean
  error?: string
}> {
  try {
    const response = await fetch('/api/assessment-progress/recover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ parent_email: parentEmail })
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { progress_sessions: [], found: false, error: data.error || 'Failed to recover progress' }
    }

    return {
      progress_sessions: data.progress_sessions,
      found: data.found
    }
  } catch (error) {
    console.error('Error recovering progress:', error)
    return { progress_sessions: [], found: false, error: 'Network error while recovering progress' }
  }
}

// Delete progress (when assessment completed)
export async function deleteProgress(sessionId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const response = await fetch('/api/assessment-progress', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_id: sessionId })
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete progress' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting progress:', error)
    return { success: false, error: 'Network error while deleting progress' }
  }
}

// Auto-save progress with debouncing
export class ProgressAutoSaver {
  private timeoutId: NodeJS.Timeout | null = null
  private lastSaveTime = 0
  private readonly SAVE_DELAY = 2000 // 2 seconds debounce
  private readonly MIN_SAVE_INTERVAL = 5000 // Minimum 5 seconds between saves

  async saveWithDebounce(progress: Partial<AssessmentProgress>) {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    // Set new timeout
    this.timeoutId = setTimeout(async () => {
      const now = Date.now()
      
      // Respect minimum save interval
      if (now - this.lastSaveTime < this.MIN_SAVE_INTERVAL) {
        return
      }

      const result = await saveProgress(progress)
      if (result.success) {
        this.lastSaveTime = now
      }
    }, this.SAVE_DELAY)
  }

  cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}

// Format time remaining
export function formatTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Expired'
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days} day${days === 1 ? '' : 's'}`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'}`
  return 'Less than 1 hour'
}

// Local storage fallback for progress (when offline or backend unavailable)
export const LocalProgressManager = {
  save(progress: AssessmentProgress) {
    if (typeof window === 'undefined') return
    
    try {
      const key = `assessment_progress_${progress.session_id}`
      const data = {
        ...progress,
        last_saved: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving progress locally:', error)
    }
  },

  load(sessionId: string): AssessmentProgress | null {
    if (typeof window === 'undefined') return null
    
    try {
      const key = `assessment_progress_${sessionId}`
      const data = localStorage.getItem(key)
      if (!data) return null
      
      const progress = JSON.parse(data)
      
      // Check if expired
      if (progress.expires_at && new Date(progress.expires_at) < new Date()) {
        this.delete(sessionId)
        return null
      }
      
      return progress
    } catch (error) {
      console.error('Error loading progress locally:', error)
      return null
    }
  },

  delete(sessionId: string) {
    if (typeof window === 'undefined') return
    
    try {
      const key = `assessment_progress_${sessionId}`
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error deleting progress locally:', error)
    }
  },

  cleanup() {
    if (typeof window === 'undefined') return
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('assessment_progress_'))
      const now = new Date()
      
      keys.forEach(key => {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const progress = JSON.parse(data)
            if (progress.expires_at && new Date(progress.expires_at) < now) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error cleaning up local progress:', error)
    }
  }
}