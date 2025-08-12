import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { userExists, createUser } from '@/lib/auth/user-storage'
import { createTeacher as createSupabaseTeacher } from '@/lib/supabase'
import { validatePassword, validateEducationalEmail, generatePassphraseSuggestion } from '@/lib/auth/password-validation'

// Teacher registration interface
interface TeacherRegistration {
  email: string
  password: string
  confirmPassword: string
  name: string
  school: string
  gradeLevel: string
}

// Enhanced validation with educational UX focus
function validateRegistration(data: TeacherRegistration): { 
  isValid: boolean; 
  errors: string[]; 
  suggestions: string[];
  warnings: string[];
  context: any;
} {
  const errors: string[] = []
  const suggestions: string[] = []
  const warnings: string[] = []
  
  // Enhanced email validation with educational context
  const emailValidation = validateEducationalEmail(data.email)
  if (!emailValidation.isValid) {
    errors.push('Please enter a valid email address')
  }
  
  // Add educational domain feedback
  if (emailValidation.warnings.length > 0) {
    warnings.push(...emailValidation.warnings)
  }
  
  if (emailValidation.suggestions.length > 0) {
    suggestions.push(...emailValidation.suggestions)
  }

  // Password confirmation check
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match - please retype your password carefully')
  }

  // Enhanced password validation
  if (data.password) {
    const passwordValidation = validatePassword(data.password, data.email)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }
    
    if (passwordValidation.suggestions.length > 0) {
      suggestions.push(...passwordValidation.suggestions)
    }
    
    // Strength-based suggestions
    if (passwordValidation.strength === 'weak' && emailValidation.isEduDomain) {
      suggestions.push('As an educator, consider using a phrase like "coffee morning sunshine" - easier to remember!')
    }
  }

  // Required fields with helpful messaging
  if (!data.name?.trim()) {
    errors.push('Please enter your full name as you\'d like it to appear to students and parents')
  }

  if (!data.school?.trim()) {
    errors.push('School name is required to help us provide relevant educational features')
  }

  // Validate school name format
  if (data.school?.trim() && data.school.trim().length < 3) {
    errors.push('Please enter the complete name of your school or educational institution')
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    warnings,
    context: {
      isEduDomain: emailValidation.isEduDomain,
      passphraseSuggestion: generatePassphraseSuggestion()
    }
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

    // Enhanced validation with UX feedback
    const validation = validateRegistration(data)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          errors: validation.errors,
          suggestions: validation.suggestions,
          warnings: validation.warnings,
          context: validation.context,
          field: validation.errors[0]?.includes('email') ? 'email' :
                 validation.errors[0]?.includes('name') ? 'name' :
                 validation.errors[0]?.includes('school') ? 'school' :
                 validation.errors[0]?.includes('match') ? 'confirmPassword' : 'password'
        },
        { status: 400 }
      )
    }

    // Enhanced email existence check
    if (userExists(data.email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'An account with this email address already exists. Would you like to sign in instead?',
          field: 'email',
          action: 'redirect_to_login',
          suggestions: [
            'Try signing in with your existing password',
            'Use the "Forgot Password" link if you need to reset your password',
            'Contact support if you\'re having trouble accessing your account'
          ]
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
      message: validation.context.isEduDomain 
        ? 'Welcome to the educational platform! Registration successful. Please check your email to verify your account and unlock all teacher features.'
        : 'Registration successful! Please check your email to verify your account.',
      user: {
        id: newTeacher.id,
        email: newTeacher.email,
        name: newTeacher.name,
        school: newTeacher.school,
        gradeLevel: newTeacher.gradeLevel,
        isVerified: false,
        isEduDomain: validation.context.isEduDomain
      },
      nextSteps: [
        'Check your email for a verification link',
        'Click the verification link to activate your account',
        validation.context.isEduDomain 
          ? 'Once verified, you\'ll have access to all educational features'
          : 'Once verified, you can start using the platform'
      ],
      context: {
        isEduDomain: validation.context.isEduDomain,
        hasFullAccess: false,
        requiresVerification: true
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    const errorResponse = {
      success: false,
      error: 'We\'re experiencing technical difficulties with account creation. Please try again in a moment.',
      field: 'system',
      suggestions: [
        'Try again in a few minutes',
        'Check your internet connection',
        'Contact support if this issue continues'
      ]
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = `Registration error: ${error.message}`
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}