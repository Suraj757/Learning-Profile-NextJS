import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { userExists, createUser } from '@/lib/auth/user-storage'

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

// Create new teacher user (in production, save to database)
async function createTeacher(data: TeacherRegistration): Promise<any> {
  // Hash password
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(data.password, saltRounds)
  
  // Generate unique user ID
  const userId = `teacher_${Date.now()}_${Math.random().toString(36).substring(2)}`
  
  // Create teacher object
  const newTeacher = {
    id: userId,
    email: data.email.toLowerCase(),
    name: data.name.trim(),
    school: data.school.trim(),
    gradeLevel: data.gradeLevel || '',
    userType: 'teacher' as const,
    passwordHash: hashedPassword,
    isActive: true,
    isVerified: false, // Requires email verification
    createdAt: new Date().toISOString(),
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

  // Store in shared storage (in production, save to database)
  createUser(newTeacher.email, newTeacher)
  
  console.log('[REGISTRATION] New teacher created:', {
    id: newTeacher.id,
    email: newTeacher.email,
    name: newTeacher.name,
    school: newTeacher.school
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