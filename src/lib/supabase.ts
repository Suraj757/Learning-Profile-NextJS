import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Use fallback values during build time if env vars are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have real values (not placeholders)
export const supabase = (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') 
  ? null 
  : createSupabaseClient(supabaseUrl, supabaseKey)

// Server-side client for RSC
export function createClient() {
  if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
    return null
  }
  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Database schema types
export interface LearningProfile {
  id: string
  child_name: string
  grade: string
  responses: Record<number, number>
  scores: Record<string, number>
  personality_label: string
  description: string
  is_public: boolean
  share_token: string
  created_at: string
  updated_at: string
}

export interface ProfileResponse {
  id: string
  profile_id: string
  question_id: number
  response_value: number
  created_at: string
}

export interface ProfileResult {
  id: string
  profile_id: string
  scores: Record<string, number>
  personality_label: string
  description: string
  created_at: string
}

// Database functions
export async function createProfile(profileData: {
  child_name: string
  grade: string
  responses: Record<number, number>
  scores: Record<string, number>
  personality_label: string
  description: string
}): Promise<{ data: LearningProfile | null; error: any }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  
  const shareToken = generateShareToken()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      child_name: profileData.child_name,
      grade: profileData.grade,
      responses: profileData.responses,
      scores: profileData.scores,
      personality_label: profileData.personality_label,
      description: profileData.description,
      is_public: true,
      share_token: shareToken
    })
    .select()
    .single()

  return { data, error }
}

export async function getProfile(profileId: string): Promise<{ data: LearningProfile | null; error: any }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  return { data, error }
}

export async function getProfileByShareToken(shareToken: string): Promise<{ data: LearningProfile | null; error: any }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('share_token', shareToken)
    .eq('is_public', true)
    .single()

  return { data, error }
}

export async function updateProfilePrivacy(profileId: string, isPublic: boolean): Promise<{ error: any }> {
  if (!supabase) {
    return { error: new Error('Supabase not configured') }
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_public: isPublic })
    .eq('id', profileId)

  return { error }
}

function generateShareToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Legacy interfaces for backward compatibility
export interface Teacher {
  id: number
  email: string
  name: string
  school?: string
  grade_level?: string
  ambassador_status: boolean
  created_at: string
  onboarding_completed?: boolean
  onboarding_completed_at?: string
  onboarding_skipped?: boolean
  onboarding_skipped_at?: string
  isOfflineDemo?: boolean
  isOfflineAccount?: boolean
}

export interface AssessmentResult {
  id: number
  child_name: string
  age: number
  scores: Record<string, number>
  personality_label: string
  raw_responses: Record<string, number>
  email: string
  birth_month: number
  birth_year: number
  created_at: string
}

export interface ProfileAssignment {
  id: number
  teacher_id: number
  parent_email: string
  child_name: string
  assignment_token: string
  status: 'sent' | 'completed'
  assessment_id?: number
  assigned_at: string
  completed_at?: string
}

export interface Classroom {
  id: number
  teacher_id: number
  name: string
  grade_level: string
  school_year: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: number
  classroom_id: number
  child_name: string
  parent_email: string
  grade_level: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: number
  teacher_id: number
  name: string
  subject: string
  content: string
  template_type: 'invitation' | 'reminder' | 'thank_you'
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface TeacherSession {
  id: number
  teacher_id: number
  session_token: string
  expires_at: string
  created_at: string
}

export interface Communication {
  id: number
  teacher_id: number
  parent_email: string
  student_id?: number
  subject: string
  message: string
  response?: string
  status: 'sent' | 'read' | 'replied'
  sent_at: string
  replied_at?: string
}

// Teacher Authentication Functions
export async function createTeacher(data: {
  email: string
  name: string
  school?: string
  grade_level?: string
  id?: number
}) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const insertData: any = {
    email: data.email,
    name: data.name,
    school: data.school,
    grade_level: data.grade_level,
    ambassador_status: false
  }
  
  // Include specific ID if provided (for test accounts)
  if (data.id) {
    insertData.id = data.id
  }
  
  const { data: teacher, error } = await supabase
    .from('teachers')
    .insert([insertData])
    .select()
    .single()
  
  if (error) throw error
  return teacher
}

export async function getTeacherByEmail(email: string) {
  if (!supabase) {
    console.warn('Supabase not configured, cannot fetch teacher by email')
    return null
  }
  
  try {
    // Handle URL encoding issues with + characters
    const normalizedEmail = decodeURIComponent(email.toLowerCase())
    
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', normalizedEmail)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.warn('Teacher lookup failed:', error.message)
      return null
    }
    return data
  } catch (error) {
    console.warn('Error in getTeacherByEmail:', error.message)
    return null
  }
}

// Sync teacher from authentication system to database
export async function ensureTeacherExists(teacherId: number, email?: string) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  // Check if teacher already exists
  const { data: existingTeacher, error: checkError } = await supabase
    .from('teachers')
    .select('id')
    .eq('id', teacherId)
    .single()
  
  if (!checkError && existingTeacher) {
    return existingTeacher // Teacher already exists
  }
  
  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Error checking teacher existence: ${checkError.message}`)
  }
  
  // Teacher doesn't exist, create it
  let teacherData = {
    id: teacherId,
    email: email || 'unknown@teacher.com',
    name: 'Teacher',
    school: null,
    grade_level: null,
    ambassador_status: false
  }
  
  // Map known test accounts
  const knownAccounts = {
    1000: { email: 'suraj@speakaboos.com', name: 'Suraj Kumar', school: 'Speakaboos Elementary', grade_level: '3rd Grade' },
    1001: { email: 'suraj+1@speakaboos.com', name: 'Suraj Kumar', school: 'Speakaboos Elementary', grade_level: '3rd Grade' },
    1002: { email: 'suraj+2@speakaboos.com', name: 'Suraj Kumar', school: 'Speakaboos Elementary', grade_level: '3rd Grade' }
  }
  
  if (knownAccounts[teacherId as keyof typeof knownAccounts]) {
    teacherData = { ...teacherData, ...knownAccounts[teacherId as keyof typeof knownAccounts] }
  }
  
  const { data: newTeacher, error: createError } = await supabase
    .from('teachers')
    .insert([teacherData])
    .select()
    .single()
  
  if (createError) {
    throw new Error(`Failed to create teacher record: ${createError.message}`)
  }
  
  console.log(`Created teacher record for ID ${teacherId}: ${teacherData.email}`)
  return newTeacher
}

// Classroom Management Functions
export async function createClassroom(teacherId: number, data: {
  name: string
  grade_level: string
  school_year: string
}) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  // First try to find existing classroom
  const { data: existingClassroom, error: findError } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('name', data.name)
    .eq('school_year', data.school_year)
    .single()
  
  if (existingClassroom) {
    console.log('✅ Using existing classroom:', existingClassroom.id, existingClassroom.name)
    return existingClassroom
  }
  
  // If not found, create new one
  const { data: classroom, error } = await supabase
    .from('classrooms')
    .insert([{
      teacher_id: teacherId,
      name: data.name,
      grade_level: data.grade_level,
      school_year: data.school_year
    }])
    .select()
    .single()
  
  if (error) {
    // Handle race condition - another process might have created it
    if (error.code === '23505' || error.message?.includes('duplicate')) {
      console.log('🔄 Classroom created by another process, fetching...')
      const { data: raceClassroom, error: raceError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('name', data.name)
        .eq('school_year', data.school_year)
        .single()
      
      if (raceClassroom) {
        return raceClassroom
      }
      if (raceError) {
        console.error('Failed to fetch classroom after race condition:', raceError)
      }
    }
    throw error
  }
  
  console.log('✅ Created new classroom:', classroom.id, classroom.name)
  return classroom
}

export async function getTeacherClassrooms(teacherId: number) {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty classrooms array')
    return []
  }
  
  try {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.warn('Failed to fetch teacher classrooms:', error.message)
      return []
    }
    return data || []
  } catch (error) {
    console.warn('Error in getTeacherClassrooms:', error.message)
    return []
  }
}

// Student Management Functions
export async function addStudentToClassroom(classroomId: number, data: {
  child_name: string
  parent_email: string
  grade_level: string
  notes?: string
}) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const { data: student, error } = await supabase
    .from('students')
    .insert([{
      classroom_id: classroomId,
      child_name: data.child_name,
      parent_email: data.parent_email,
      grade_level: data.grade_level,
      notes: data.notes
    }])
    .select()
    .single()
  
  if (error) throw error
  return student
}

export async function getClassroomStudents(classroomId: number) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('child_name')
  
  if (error) throw error
  return data
}

// Assignment Functions
export async function createProfileAssignment(data: {
  teacher_id: number
  parent_email: string
  child_name: string
  student_id?: number
}) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  // Ensure the teacher exists in the database
  await ensureTeacherExists(data.teacher_id)
  
  const assignment_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  const { data: assignment, error } = await supabase
    .from('profile_assignments')
    .insert([{
      teacher_id: data.teacher_id,
      parent_email: data.parent_email,
      child_name: data.child_name,
      assignment_token,
      status: 'sent'
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Profile assignment creation failed:', error)
    throw new Error(`Failed to create assignment: ${error.message}`)
  }
  
  return assignment
}

export async function getTeacherAssignments(teacherId: number) {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty assignments array')
    return []
  }
  
  try {
    // First get the assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('assigned_at', { ascending: false })
    
    if (assignmentsError) {
      console.warn('Failed to fetch teacher assignments:', assignmentsError.message)
      return []
    }
    
    if (!assignments || assignments.length === 0) {
      return assignments || []
    }
  
  // Get assessment results for completed assignments that have assessment_id
  const completedAssignments = assignments.filter(a => a.status === 'completed' && a.assessment_id)
  
  if (completedAssignments.length > 0) {
    const assessmentIds = completedAssignments.map(a => a.assessment_id).filter(Boolean)
    
    if (assessmentIds.length > 0) {
      // Try assessment_results table first (likely the correct one)
      const { data: assessmentResults, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('id, child_name, scores, personality_label, age, raw_responses, email, birth_month, birth_year')
        .in('id', assessmentIds)
      
      if (!assessmentError && assessmentResults) {
        console.log('✅ Found assessment results:', assessmentResults.length)
        // Match assessment results to assignments
        assignments.forEach(assignment => {
          if (assignment.assessment_id) {
            const matchingResult = assessmentResults.find(r => r.id === assignment.assessment_id)
            if (matchingResult) {
              assignment.assessment_results = matchingResult
            }
          }
        })
      } else {
        console.log('❌ Assessment results query failed:', assessmentError)
        // Fallback: try profiles table with string conversion
        const stringIds = assessmentIds.map(id => id.toString())
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, child_name, scores, personality_label, description, grade')
          .in('id', stringIds)
        
        if (!profilesError && profiles) {
          console.log('✅ Found profiles as fallback:', profiles.length)
          assignments.forEach(assignment => {
            if (assignment.assessment_id) {
              const matchingProfile = profiles.find(p => p.id === assignment.assessment_id.toString())
              if (matchingProfile) {
                assignment.assessment_results = matchingProfile
              }
            }
          })
        } else {
          console.log('❌ Both assessment_results and profiles queries failed')
        }
      }
    }
  }
  
  return assignments || []
  } catch (error) {
    console.warn('Error in getTeacherAssignments:', error.message)
    return []
  }
}

export async function updateAssignmentStatus(assignmentId: number, status: 'sent' | 'completed', assessmentId?: number) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const updateData: any = { status }
  if (assessmentId) updateData.assessment_id = assessmentId
  if (status === 'completed') updateData.completed_at = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('profile_assignments')
    .update(updateData)
    .eq('id', assignmentId)
    .select()
    .single()
  
  if (error) throw error
  return data
}