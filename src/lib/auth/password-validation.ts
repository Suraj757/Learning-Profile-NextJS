// Enhanced password validation for educational users
// Based on UX research findings - simplified, passphrase-focused approach

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  suggestions: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
}

export interface PasswordPolicy {
  minLength: number
  maxLength: number
  requirePassphrase: boolean
  allowCommonPasswords: boolean
  requireMixedCase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  eduDomainRelaxed: boolean
}

// UX-informed password policy for teachers
export const TEACHER_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requirePassphrase: true,
  allowCommonPasswords: false,
  requireMixedCase: false, // Relaxed for UX
  requireNumbers: false, // Relaxed for UX  
  requireSpecialChars: false, // Relaxed for UX
  eduDomainRelaxed: true // Additional relaxation for .edu domains
}

// Common educational passwords to avoid
const COMMON_EDU_PASSWORDS = [
  'password', 'password123', 'admin', 'teacher', 'classroom',
  'school123', 'education', 'learning', 'student', 'test123',
  'welcome', 'changeme', '12345678', 'qwerty123'
]

// Passphrase word list for suggestions
const PASSPHRASE_WORDS = [
  'apple', 'beach', 'cloud', 'dance', 'eagle', 'forest', 'garden', 'happy',
  'island', 'jungle', 'kitten', 'lemon', 'music', 'nature', 'ocean', 'peace',
  'quiet', 'river', 'sunset', 'tiger', 'unique', 'valley', 'winter', 'yellow'
]

export function validatePassword(
  password: string, 
  email?: string,
  customPolicy?: Partial<PasswordPolicy>
): PasswordValidationResult {
  const policy = { ...TEACHER_PASSWORD_POLICY, ...customPolicy }
  const errors: string[] = []
  const suggestions: string[] = []
  
  // Check if email is from .edu domain for relaxed requirements
  const isEduDomain = email?.toLowerCase().endsWith('.edu') || false
  const isRelaxedUser = policy.eduDomainRelaxed && isEduDomain

  // Length validation
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`)
  }
  
  if (password.length > policy.maxLength) {
    errors.push(`Password must not exceed ${policy.maxLength} characters`)
  }

  // Check for common passwords
  if (!policy.allowCommonPasswords) {
    const lowerPassword = password.toLowerCase()
    if (COMMON_EDU_PASSWORDS.some(common => lowerPassword.includes(common))) {
      errors.push('Please avoid common passwords like "password123" or "classroom"')
      suggestions.push('Consider using a memorable phrase instead')
    }
  }

  // Passphrase detection and encouragement
  const words = password.toLowerCase().split(/[\s\-_]+/).filter(word => word.length > 2)
  const isPassphrase = words.length >= 3 && password.length >= 12
  
  if (policy.requirePassphrase && !isPassphrase && !isRelaxedUser) {
    errors.push('Consider using a passphrase with 3+ words (e.g., "sunny beach vacation")')
    suggestions.push('Passphrases are easier to remember and more secure than complex passwords')
  }

  // Traditional complexity checks (relaxed for .edu domains)
  if (!isRelaxedUser) {
    if (policy.requireMixedCase) {
      const hasUpper = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      if (!hasUpper || !hasLower) {
        errors.push('Password should contain both uppercase and lowercase letters')
      }
    }

    if (policy.requireNumbers) {
      if (!/\d/.test(password)) {
        errors.push('Password should contain at least one number')
      }
    }

    if (policy.requireSpecialChars) {
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password should contain at least one special character')
      }
    }
  }

  // Email-based validation
  if (email) {
    const emailPrefix = email.split('@')[0].toLowerCase()
    if (password.toLowerCase().includes(emailPrefix) && emailPrefix.length > 3) {
      errors.push('Password should not contain your email username')
    }
  }

  // Calculate strength
  let strength: PasswordValidationResult['strength'] = 'weak'
  
  if (password.length >= 12 && isPassphrase) {
    strength = 'strong'
  } else if (password.length >= 10 && (isPassphrase || hasComplexity(password))) {
    strength = 'good'
  } else if (password.length >= 8) {
    strength = 'fair'
  }

  // Add suggestions based on context
  if (suggestions.length === 0 && errors.length > 0) {
    if (isEduDomain) {
      suggestions.push('As an educator, you have relaxed requirements - try a memorable phrase!')
    } else {
      suggestions.push('Try combining 3-4 words you\'ll remember (e.g., "coffee morning sunshine")')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    strength
  }
}

function hasComplexity(password: string): boolean {
  let score = 0
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
  return score >= 3
}

export function generatePassphraseSuggestion(): string {
  const shuffled = [...PASSPHRASE_WORDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).join(' ')
}

export function isEduDomain(email: string): boolean {
  return email.toLowerCase().includes('.edu')
}

// Validate email for educational context
export function validateEducationalEmail(email: string): {
  isValid: boolean
  isEduDomain: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)
  const isEdu = isEduDomain(email)
  
  if (!isValid) {
    return { isValid: false, isEduDomain: false, warnings: ['Please enter a valid email address'], suggestions: [] }
  }
  
  if (!isEdu) {
    warnings.push('This doesn\'t appear to be an educational email address')
    suggestions.push('Educational emails typically end in .edu, .k12.us, or similar')
    suggestions.push('You can still proceed, but some features may be limited')
  }
  
  // Check for common educational domains
  const eduPatterns = ['.edu', '.k12.', '.sch.', '.school.', 'schools.']
  const isEducational = eduPatterns.some(pattern => email.toLowerCase().includes(pattern))
  
  if (isEducational && !isEdu) {
    // Detected educational but not .edu
    suggestions.push('We detected this may be a school email - you\'ll have full access to educational features')
  }
  
  return {
    isValid: true,
    isEduDomain: isEdu,
    warnings,
    suggestions
  }
}