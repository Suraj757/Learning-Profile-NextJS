// Shared user storage for development (in production, this would be a database)

// In-memory user storage Map
const REGISTERED_USERS: Map<string, any> = new Map()

// Demo user database (for backwards compatibility)
const DEMO_USERS = {
  'demo@teacher.edu': {
    id: 'teacher_demo_001',
    email: 'demo@teacher.edu',
    name: 'Demo Teacher',
    userType: 'teacher' as const,
    password: 'demo123',
    isActive: true,
    isVerified: true,
    permissions: {
      canViewStudentProfiles: true,
      canCreateAssessments: true,
      canViewClassroomAnalytics: true,
      canExportStudentData: true,
      canInviteParents: true,
      classroomIds: ['classroom_001', 'classroom_002'],
      schoolId: 'demo_school'
    }
  },
  'demo@parent.com': {
    id: 'parent_demo_001',
    email: 'demo@parent.com',
    name: 'Demo Parent',
    userType: 'parent' as const,
    password: 'demo123',
    isActive: true,
    isVerified: true,
    permissions: {
      canViewOwnChildData: true,
      canExportChildData: true,
      canDeleteChildData: true,
      canManageConsent: true,
      childIds: ['student_001']
    }
  }
}

// Initialize with existing teacher accounts (only if not already exists)
if (!REGISTERED_USERS.has('suraj@speakaboos.com')) {
  REGISTERED_USERS.set('suraj@speakaboos.com', {
    id: 'teacher_suraj_001',
    email: 'suraj@speakaboos.com',
    name: 'Suraj Kumar',
    userType: 'teacher' as const,
    passwordHash: '$2a$12$placeholder.will.be.set.when.password.created',
    isActive: true,
    isVerified: true,
    needsPasswordSetup: true,
    permissions: {
      canViewStudentProfiles: true,
      canCreateAssessments: true,
      canViewClassroomAnalytics: true,
      canExportStudentData: true,
      canInviteParents: true,
      classroomIds: ['classroom_speakaboos_001'],
      schoolId: 'speakaboos'
    }
  })
}

// Add the specific teacher accounts with + symbol for testing
if (!REGISTERED_USERS.has('suraj+1@speakaboos.com')) {
  REGISTERED_USERS.set('suraj+1@speakaboos.com', {
    id: 'teacher_suraj_plus_001',
    email: 'suraj+1@speakaboos.com',
    name: 'Suraj Kumar (Test Account)',
    userType: 'teacher' as const,
    // For testing purposes, using bcrypt hash of "test123"
    passwordHash: '$2b$12$/2zv2.b3AFtH/6DIF.Sdg.GtvHh5tlQ7J2o6P3h19U1vp.s.pUXwy',
    isActive: true,
    isVerified: true,
    school: 'Speakaboos Elementary',
    grade_level: '3rd Grade',
    permissions: {
      canViewStudentProfiles: true,
      canCreateAssessments: true,
      canViewClassroomAnalytics: true,
      canExportStudentData: true,
      canInviteParents: true,
      classroomIds: ['classroom_speakaboos_test_001'],
      schoolId: 'speakaboos'
    }
  })
}

// Add second test account
if (!REGISTERED_USERS.has('suraj+2@speakaboos.com')) {
  REGISTERED_USERS.set('suraj+2@speakaboos.com', {
    id: 'teacher_suraj_plus_002',
    email: 'suraj+2@speakaboos.com',
    name: 'Suraj Kumar (Test Account 2)',
    userType: 'teacher' as const,
    // For testing purposes, using bcrypt hash of "test123"
    passwordHash: '$2b$12$/2zv2.b3AFtH/6DIF.Sdg.GtvHh5tlQ7J2o6P3h19U1vp.s.pUXwy',
    isActive: true,
    isVerified: true,
    school: 'Speakaboos Elementary',
    grade_level: '3rd Grade',
    permissions: {
      canViewStudentProfiles: true,
      canCreateAssessments: true,
      canViewClassroomAnalytics: true,
      canExportStudentData: true,
      canInviteParents: true,
      classroomIds: ['classroom_speakaboos_test_002'],
      schoolId: 'speakaboos'
    }
  })
}

// User storage functions
export function getUserByEmail(email: string): any | null {
  const normalizedEmail = email.toLowerCase()
  
  // Check registered users first
  const registeredUser = REGISTERED_USERS.get(normalizedEmail)
  if (registeredUser) {
    return registeredUser
  }

  // Check demo users
  const demoUser = DEMO_USERS[normalizedEmail as keyof typeof DEMO_USERS]
  if (demoUser) {
    return demoUser
  }

  return null
}

export function createUser(email: string, userData: any): void {
  REGISTERED_USERS.set(email.toLowerCase(), userData)
}

export function updateUser(email: string, updates: any): boolean {
  const user = REGISTERED_USERS.get(email.toLowerCase())
  if (user) {
    Object.assign(user, updates)
    REGISTERED_USERS.set(email.toLowerCase(), user)
    return true
  }
  return false
}

export function userExists(email: string): boolean {
  const normalizedEmail = email.toLowerCase()
  
  // Check registered users
  if (REGISTERED_USERS.has(normalizedEmail)) {
    return true
  }
  
  // Check demo users
  if (DEMO_USERS[normalizedEmail as keyof typeof DEMO_USERS]) {
    return true
  }
  
  // Check existing accounts
  const existingEmails = ['suraj@speakaboos.com']
  return existingEmails.includes(normalizedEmail)
}

// Export the storage for debugging (don't use in production)
export function getRegisteredUsers() {
  return REGISTERED_USERS
}

export function getDemoUsers() {
  return DEMO_USERS
}