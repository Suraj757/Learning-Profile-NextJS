import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { userExists, createUser } from '@/lib/auth/user-storage'
import { createTeacher as createSupabaseTeacher } from '@/lib/supabase'

// Teacher registration interface
interface TeacherRegistration {
  email: string
  password: string
  confirmPassword: string
  name: string
  school: string
  gradeLevel: string
}

// Validation helper
function validateRegistration(data: TeacherRegistration): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Valid email address is required')
  }

  // Password validation
  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match')
  }

  // Password strength validation
  const hasUpperCase = /[A-Z]/.test(data.password)
  const hasLowerCase = /[a-z]/.test(data.password)
  const hasNumber = /\d/.test(data.password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    errors.push('Password must contain uppercase, lowercase, and number')
  }

  // Required fields
  if (!data.name?.trim()) {
    errors.push('Full name is required')
  }

  if (!data.school?.trim()) {
    errors.push('School name is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Shared user storage is now imported from @/lib/auth/user-storage

// Create new teacher user (save to both auth system and database)
async function createTeacher(data: TeacherRegistration): Promise<any> {
  // Hash password
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(data.password, saltRounds)
  
  let supabaseTeacher = null
  let numericTeacherId = Date.now() // Fallback numeric ID
  
  // Try to create teacher in Supabase database first
  try {
    supabaseTeacher = await createSupabaseTeacher({
      email: data.email.toLowerCase(),
      name: data.name.trim(),
      school: data.school.trim(),
      grade_level: data.gradeLevel || ''
    })
    numericTeacherId = supabaseTeacher.id
    console.log('[REGISTRATION] Teacher created in Supabase:', supabaseTeacher.id)
  } catch (error) {
    console.warn('[REGISTRATION] Failed to create teacher in Supabase, using auth-only:', error.message)
    // Continue with auth-only registration
  }
  
  // Generate user ID (use Supabase ID if available, otherwise timestamp)
  const userId = supabaseTeacher ? supabaseTeacher.id.toString() : `teacher_${numericTeacherId}_${Math.random().toString(36).substring(2)}`
  
  // Create teacher object for auth system
  const newTeacher = {
    id: userId,
    numericId: numericTeacherId, // Store numeric ID for database queries
    email: data.email.toLowerCase(),
    name: data.name.trim(),
    school: data.school.trim(),
    gradeLevel: data.gradeLevel || '',
    userType: 'teacher' as const,
    passwordHash: hashedPassword,
    isActive: true,
    isVerified: false, // Requires email verification
    createdAt: new Date().toISOString(),
    supabaseCreated: !!supabaseTeacher, // Track whether Supabase record exists
    permissions: {
      canViewStudentProfiles: false, // Activated after verification
      canCreateAssessments: false,   // Activated after verification
      canViewClassroomAnalytics: false,
      canExportStudentData: false,
      canInviteParents: false,
      classroomIds: [], // Assigned by admin
      schoolId: '' // Set by admin
    }
  }

  // Store in auth system
  createUser(newTeacher.email, newTeacher)
  
  console.log('[REGISTRATION] Teacher created in auth system:', {
    id: newTeacher.id,
    numericId: newTeacher.numericId,
    email: newTeacher.email,
    name: newTeacher.name,
    school: newTeacher.school,
    supabaseCreated: newTeacher.supabaseCreated
  })

  return newTeacher
}

// Send verification email (placeholder)
async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // TODO: In production, send real email
  console.log(`[EMAIL] Verification email for ${email}: http://localhost:3000/auth/verify?token=${token}`)
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'demo-secret-key-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const data: TeacherRegistration = await request.json()

    // Validate input data
    const validation = validateRegistration(data)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          errors: validation.errors 
        },
        { status: 400 }
      )
    }

    // Check if email already exists
    if (userExists(data.email)) {
      return NextResponse.json(
        { 
          success: false,
          errors: ['An account with this email already exists'] 
        },
        { status: 409 }
      )
    }

    // Create new teacher
    const newTeacher = await createTeacher(data)

    // Generate email verification token
    const verificationToken = await new SignJWT({
      userId: newTeacher.id,
      email: newTeacher.email,
      purpose: 'email_verification'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Verification token expires in 24 hours
      .sign(JWT_SECRET)

    // Send verification email
    await sendVerificationEmail(data.email, verificationToken)

    // Get IP address for audit logging
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Log registration attempt
    console.log(`[AUTH] Teacher registration: ${data.email} from ${ip}`)

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: newTeacher.id,
        email: newTeacher.email,
        name: newTeacher.name,
        school: newTeacher.school,
        isVerified: false
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        success: false,
        errors: ['Internal server error during registration'] 
      },
      { status: 500 }
    )
  }
}