import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// Server-side client for RSC
export function createClient() {
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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  return { data, error }
}

export async function getProfileByShareToken(shareToken: string): Promise<{ data: LearningProfile | null; error: any }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('share_token', shareToken)
    .eq('is_public', true)
    .single()

  return { data, error }
}

export async function updateProfilePrivacy(profileId: string, isPublic: boolean): Promise<{ error: any }> {
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
}) {
  const { data: teacher, error } = await supabase
    .from('teachers')
    .insert([{
      email: data.email,
      name: data.name,
      school: data.school,
      grade_level: data.grade_level,
      ambassador_status: false
    }])
    .select()
    .single()
  
  if (error) throw error
  return teacher
}

export async function getTeacherByEmail(email: string) {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Classroom Management Functions
export async function createClassroom(teacherId: number, data: {
  name: string
  grade_level: string
  school_year: string
}) {
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
  
  if (error) throw error
  return classroom
}

export async function getTeacherClassrooms(teacherId: number) {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Student Management Functions
export async function addStudentToClassroom(classroomId: number, data: {
  child_name: string
  parent_email: string
  grade_level: string
  notes?: string
}) {
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
  
  if (error) throw error
  return assignment
}

export async function getTeacherAssignments(teacherId: number) {
  const { data, error } = await supabase
    .from('profile_assignments')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('assigned_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function updateAssignmentStatus(assignmentId: number, status: 'sent' | 'completed', assessmentId?: number) {
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