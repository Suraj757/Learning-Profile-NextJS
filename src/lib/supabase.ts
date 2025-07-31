import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// Server-side client for RSC
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Database schema types
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

export interface LearningProfile {
  id: string
  child_name: string
  grade: string
  responses: Record<number, number>
  scores?: Record<string, number>
  personality_label?: string
  description?: string
  created_at: string
  updated_at: string
}