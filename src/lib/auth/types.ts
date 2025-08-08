// Educational User Management Types
// Designed for FERPA compliance and educational relationships

export type UserRole = 'teacher' | 'parent' | 'admin'

export interface BaseUser {
  id: string
  email: string
  name: string
  userType: UserRole
  createdAt: string
  lastLoginAt?: string
  isVerified: boolean
  isActive: boolean
}

export interface TeacherUser extends BaseUser {
  userType: 'teacher'
  school?: string
  gradeLevel?: string
  classrooms: ClassroomAssignment[]
  permissions: TeacherPermissions
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface ParentUser extends BaseUser {
  userType: 'parent'
  children: ChildRelationship[]
  permissions: ParentPermissions
  consentRecords: ConsentRecord[]
}

export interface AdminUser extends BaseUser {
  userType: 'admin'
  schoolDistrict?: string
  adminLevel: 'school' | 'district' | 'system'
  permissions: AdminPermissions
}

// Educational Relationships
export interface ClassroomAssignment {
  classroomId: string
  classroomName: string
  schoolYear: string
  isActive: boolean
  assignedAt: string
}

export interface ChildRelationship {
  childId: string
  childName: string
  relationshipType: 'parent' | 'guardian' | 'custodian'
  isVerified: boolean
  verifiedAt?: string
  custodyStatus?: 'full' | 'joint' | 'limited'
}

// FERPA-Compliant Permissions
export interface TeacherPermissions {
  canViewStudentProfiles: boolean
  canCreateAssessments: boolean
  canViewClassroomAnalytics: boolean
  canExportStudentData: boolean
  canInviteParents: boolean
  classroomIds: string[] // Only these classrooms
  schoolId?: string // School boundary
}

export interface ParentPermissions {
  canViewOwnChildData: boolean
  canExportChildData: boolean
  canDeleteChildData: boolean
  canManageConsent: boolean
  childIds: string[] // Only these children
}

export interface AdminPermissions {
  canManageTeachers: boolean
  canViewAllClassrooms: boolean
  canManageSchoolSettings: boolean
  canViewAuditLogs: boolean
  schoolIds: string[] // School boundaries
}

// Session Management
export interface SecureSession {
  userId: string
  userType: UserRole
  email: string
  authenticatedAt: string
  expiresAt: string
  sessionToken: string
  ipAddress?: string
  userAgent?: string
}

export interface SessionValidation {
  isValid: boolean
  user?: BaseUser
  permissions?: TeacherPermissions | ParentPermissions | AdminPermissions
  reason?: 'expired' | 'invalid_token' | 'user_inactive' | 'permission_denied'
}

// FERPA Audit Trail
export interface AuditLogEntry {
  id: string
  userId: string
  userType: UserRole
  action: AuditAction
  resourceType: 'student_profile' | 'assessment' | 'classroom' | 'user_account'
  resourceId: string
  studentId?: string // Required when accessing student data
  educationalPurpose: string // Required for FERPA compliance
  timestamp: string
  ipAddress: string
  userAgent: string
  outcome: 'success' | 'failure' | 'unauthorized'
  details?: Record<string, any>
}

export type AuditAction = 
  | 'view_profile'
  | 'edit_profile'
  | 'export_data'
  | 'create_assessment'
  | 'send_invitation'
  | 'login'
  | 'logout'
  | 'delete_data'
  | 'share_data'

// Consent Management (for future COPPA compliance)
export interface ConsentRecord {
  id: string
  studentId: string
  parentId: string
  consentType: 'ferpa' | 'data_sharing' | 'research' | 'third_party'
  granted: boolean
  grantedAt?: string
  withdrawnAt?: string
  expiresAt?: string
  consentVersion: string
  ipAddress: string
  digitalSignature?: string
}

// Educational Purpose Validation
export interface EducationalPurpose {
  purpose: string
  justification: string
  category: 'instruction' | 'assessment' | 'safety' | 'special_services' | 'research'
  requiredBy?: 'teacher' | 'administrator' | 'counselor' | 'parent_request'
}

// Data Access Control
export interface DataAccessRequest {
  userId: string
  studentId: string
  dataType: 'profile' | 'assessment' | 'behavioral' | 'academic'
  educationalPurpose: EducationalPurpose
  requestedAt: string
  approved?: boolean
  approvedBy?: string
  approvedAt?: string
  reason?: string
}

// Privacy Settings
export interface PrivacySettings {
  studentId: string
  parentId: string
  allowTeacherAccess: boolean
  allowSchoolAccess: boolean
  allowResearchAccess: boolean
  dataRetentionPreference: 'minimum' | 'standard' | 'extended'
  shareWithFutureTeachers: boolean
  notificationPreferences: {
    dataAccess: boolean
    dataExport: boolean
    dataDeletion: boolean
    policyUpdates: boolean
  }
  updatedAt: string
}

// Error Types for Auth System
export interface AuthError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export type AuthErrorCode = 
  | 'invalid_credentials'
  | 'session_expired'
  | 'permission_denied'
  | 'account_disabled'
  | 'verification_required'
  | 'rate_limited'
  | 'educational_relationship_required'