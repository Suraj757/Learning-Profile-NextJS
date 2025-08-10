// Helper functions to migrate existing teachers to Supabase
import { createTeacher, getTeacherByEmail } from './supabase'
import { getUserByEmail } from './auth/user-storage'

export interface MigrationResult {
  success: boolean
  teacherId?: number
  error?: string
  skipped?: boolean
}

/**
 * Migrate a teacher from the auth system to Supabase database
 * This ensures they have a proper database record for API queries
 */
export async function migrateTeacherToSupabase(email: string): Promise<MigrationResult> {
  try {
    // Check if teacher already exists in Supabase
    const existingTeacher = await getTeacherByEmail(email)
    if (existingTeacher) {
      console.log('Teacher already exists in Supabase:', existingTeacher.id)
      return { success: true, teacherId: existingTeacher.id, skipped: true }
    }

    // Get teacher from auth system
    const authTeacher = getUserByEmail(email)
    if (!authTeacher) {
      return { success: false, error: 'Teacher not found in auth system' }
    }

    // Create teacher in Supabase
    const supabaseTeacher = await createTeacher({
      email: authTeacher.email,
      name: authTeacher.name || email.split('@')[0],
      school: authTeacher.school || '',
      grade_level: authTeacher.gradeLevel || ''
    })

    console.log('Successfully migrated teacher to Supabase:', supabaseTeacher.id)
    return { success: true, teacherId: supabaseTeacher.id }

  } catch (error) {
    console.error('Failed to migrate teacher to Supabase:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get the correct teacher ID for database queries
 * Handles both migrated and unmigrated teachers
 */
export async function getTeacherDatabaseId(email: string): Promise<number | null> {
  try {
    // First try to get from Supabase
    const supabaseTeacher = await getTeacherByEmail(email)
    if (supabaseTeacher) {
      return supabaseTeacher.id
    }

    // If not in Supabase, try to migrate
    const migrationResult = await migrateTeacherToSupabase(email)
    if (migrationResult.success && migrationResult.teacherId) {
      return migrationResult.teacherId
    }

    // If migration fails, check if auth teacher has numericId
    const authTeacher = getUserByEmail(email)
    if (authTeacher && authTeacher.numericId) {
      return authTeacher.numericId
    }

    console.warn('Could not determine database ID for teacher:', email)
    return null

  } catch (error) {
    console.error('Error getting teacher database ID:', error)
    return null
  }
}

/**
 * Update auth teacher record with Supabase ID
 * This links the auth system to the database record
 */
export function linkAuthTeacherToSupabase(email: string, supabaseId: number): boolean {
  try {
    const { updateUser } = require('./auth/user-storage')
    return updateUser(email, { 
      numericId: supabaseId, 
      supabaseCreated: true 
    })
  } catch (error) {
    console.error('Failed to link auth teacher to Supabase:', error)
    return false
  }
}