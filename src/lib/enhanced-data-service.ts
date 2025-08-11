// Enhanced data service for student-centric architecture
// Provides backward compatibility while building toward the new system

import { supabase } from './supabase'
import type { 
  Student, 
  Teacher, 
  Classroom, 
  TeacherStudentRelationship,
  School 
} from './types-enhanced'

export class EnhancedDataService {
  
  // =============================================================================
  // SCHOOL MANAGEMENT
  // =============================================================================
  
  /**
   * Get or create default school for migration
   */
  static async getOrCreateDefaultSchool(): Promise<School> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    // Try to find existing default school
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('*')
      .eq('school_code', 'DEFAULT_SCHOOL')
      .single()
      
    if (existingSchool) {
      return existingSchool
    }
    
    // Create default school for migration
    const { data: school, error } = await supabase
      .from('schools')
      .insert([{
        name: 'Learning Profile School',
        school_code: 'DEFAULT_SCHOOL',
        privacy_settings: {
          allowTeacherDataExport: true,
          requireAssessmentApproval: false,
          dataRetentionYears: 7,
          allowCrossYearAccess: true
        }
      }])
      .select()
      .single()
      
    if (error) throw error
    return school
  }
  
  // =============================================================================
  // STUDENT MANAGEMENT (CORE ENTITIES)
  // =============================================================================
  
  /**
   * Create or update student (permanent entity)
   */
  static async upsertStudent(studentData: {
    firstName: string
    lastName: string
    gradeLevel?: string
    schoolId: string
    studentNumber?: string
    dateOfBirth?: string
  }): Promise<Student> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    // Try to find existing student by name and school
    const { data: existingStudent } = await supabase
      .from('students')
      .select('*')
      .eq('first_name', studentData.firstName)
      .eq('last_name', studentData.lastName)
      .eq('school_id', studentData.schoolId)
      .single()
      
    if (existingStudent) {
      // Update existing student
      const { data: updatedStudent, error } = await supabase
        .from('students')
        .update({
          grade_level: studentData.gradeLevel,
          student_number: studentData.studentNumber,
          date_of_birth: studentData.dateOfBirth,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStudent.id)
        .select()
        .single()
        
      if (error) throw error
      return this.mapStudentFromDB(updatedStudent)
    }
    
    // Create new student
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert([{
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        grade_level: studentData.gradeLevel,
        school_id: studentData.schoolId,
        student_number: studentData.studentNumber,
        date_of_birth: studentData.dateOfBirth,
        ferpa_directory_opt_out: false,
        data_retention_preference: 'standard'
      }])
      .select()
      .single()
      
    if (error) throw error
    return this.mapStudentFromDB(newStudent)
  }
  
  /**
   * Get students with full context
   */
  static async getStudentsForTeacher(teacherId: string, schoolYear?: string): Promise<Student[]> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    const query = supabase
      .from('students')
      .select(`
        *,
        teacher_student_relationships (
          *,
          classrooms_enhanced (*)
        )
      `)
      .eq('teacher_student_relationships.teacher_id', teacherId)
    
    if (schoolYear) {
      query.eq('teacher_student_relationships.school_year', schoolYear)
    }
    
    // Only active relationships
    query.is('teacher_student_relationships.end_date', null)
    
    const { data: students, error } = await query
    
    if (error) throw error
    
    return students?.map(student => this.mapStudentFromDB(student)) || []
  }
  
  // =============================================================================
  // RELATIONSHIP MANAGEMENT (ACCESS CONTROL)
  // =============================================================================
  
  /**
   * Create teacher-student relationship (this controls access)
   */
  static async createTeacherStudentRelationship(data: {
    teacherId: string
    studentId: string
    classroomId?: string
    relationshipType?: 'primary_teacher' | 'specialist' | 'support' | 'substitute'
    schoolYear: string
    educationalPurpose: string
  }): Promise<TeacherStudentRelationship> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('teacher_student_relationships')
      .select('*')
      .eq('teacher_id', data.teacherId)
      .eq('student_id', data.studentId)
      .eq('school_year', data.schoolYear)
      .eq('relationship_type', data.relationshipType || 'primary_teacher')
      .is('end_date', null)
      .single()
      
    if (existing) {
      return this.mapRelationshipFromDB(existing)
    }
    
    // Create new relationship
    const { data: relationship, error } = await supabase
      .from('teacher_student_relationships')
      .insert([{
        teacher_id: data.teacherId,
        student_id: data.studentId,
        classroom_id: data.classroomId,
        relationship_type: data.relationshipType || 'primary_teacher',
        school_year: data.schoolYear,
        start_date: new Date().toISOString().split('T')[0],
        educational_purpose: data.educationalPurpose,
        permissions: {
          viewProfile: true,
          viewAssessments: true,
          createAssessments: true,
          shareWithParents: true,
          exportData: false
        },
        created_by: data.teacherId
      }])
      .select()
      .single()
      
    if (error) throw error
    return this.mapRelationshipFromDB(relationship)
  }
  
  /**
   * Migrate legacy assignment to student-centric model
   */
  static async migrateAssignmentToStudentModel(assignment: any): Promise<{
    student: Student
    relationship: TeacherStudentRelationship
  }> {
    // Get or create default school
    const defaultSchool = await this.getOrCreateDefaultSchool()
    
    // Parse student name
    const nameParts = assignment.child_name?.split(' ') || ['Unknown', 'Student']
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || 'Student'
    
    // Create or update student
    const student = await this.upsertStudent({
      firstName,
      lastName,
      gradeLevel: '3rd Grade', // Default for now
      schoolId: defaultSchool.id,
      studentNumber: `MIGRATED_${assignment.id}`
    })
    
    // Create teacher-student relationship
    const relationship = await this.createTeacherStudentRelationship({
      teacherId: assignment.teacher_id.toString(),
      studentId: student.id,
      schoolYear: '2024-2025',
      educationalPurpose: 'Learning profile assessment and classroom instruction'
    })
    
    return { student, relationship }
  }
  
  // =============================================================================
  // ACCESS CONTROL HELPERS
  // =============================================================================
  
  /**
   * Check if teacher can access student data
   */
  static async canTeacherAccessStudent(
    teacherId: string, 
    studentId: string, 
    educationalPurpose: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!supabase) {
      return { allowed: false, reason: 'Database not available' }
    }
    
    // Check for active relationship
    const { data: relationship } = await supabase
      .from('teacher_student_relationships')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId)
      .is('end_date', null)
      .single()
      
    if (!relationship) {
      return { 
        allowed: false, 
        reason: 'No active teacher-student relationship found' 
      }
    }
    
    // Check permissions
    if (!relationship.permissions?.viewProfile) {
      return { 
        allowed: false, 
        reason: 'Teacher does not have permission to view student profiles' 
      }
    }
    
    // Log access attempt (FERPA compliance)
    await this.logDataAccess({
      userId: teacherId,
      userType: 'teacher',
      action: 'view_profile',
      resourceType: 'student_profile',
      resourceId: studentId,
      studentId: studentId,
      educationalPurpose,
      outcome: 'success'
    })
    
    return { allowed: true }
  }
  
  /**
   * Log data access for FERPA compliance
   */
  static async logDataAccess(logData: {
    userId: string
    userType: 'teacher' | 'parent' | 'admin'
    action: string
    resourceType: string
    resourceId: string
    studentId: string
    educationalPurpose: string
    outcome: 'success' | 'failure' | 'unauthorized'
    details?: Record<string, any>
  }): Promise<void> {
    if (!supabase) return
    
    try {
      await supabase
        .from('ferpa_audit_log')
        .insert([{
          user_id: logData.userId,
          user_type: logData.userType,
          user_email: '', // Would get from user session
          action: logData.action,
          resource_type: logData.resourceType,
          resource_id: logData.resourceId,
          student_id: logData.studentId,
          educational_purpose: logData.educationalPurpose,
          outcome: logData.outcome,
          details: logData.details,
          ip_address: null, // Would get from request
          user_agent: null // Would get from request
        }])
    } catch (error) {
      console.error('Failed to log data access:', error)
    }
  }
  
  // =============================================================================
  // DATA MAPPING HELPERS
  // =============================================================================
  
  private static mapStudentFromDB(dbStudent: any): Student {
    return {
      id: dbStudent.id,
      studentNumber: dbStudent.student_number,
      firstName: dbStudent.first_name,
      lastName: dbStudent.last_name,
      dateOfBirth: dbStudent.date_of_birth,
      gradeLevel: dbStudent.grade_level,
      schoolId: dbStudent.school_id,
      ferpaDirectoryOptOut: dbStudent.ferpa_directory_opt_out || false,
      dataRetentionPreference: dbStudent.data_retention_preference || 'standard',
      fullName: `${dbStudent.first_name} ${dbStudent.last_name}`,
      createdAt: dbStudent.created_at,
      updatedAt: dbStudent.updated_at
    }
  }
  
  private static mapRelationshipFromDB(dbRelationship: any): TeacherStudentRelationship {
    return {
      id: dbRelationship.id,
      teacherId: dbRelationship.teacher_id,
      studentId: dbRelationship.student_id,
      classroomId: dbRelationship.classroom_id,
      relationshipType: dbRelationship.relationship_type,
      schoolYear: dbRelationship.school_year,
      startDate: dbRelationship.start_date,
      endDate: dbRelationship.end_date,
      educationalPurpose: dbRelationship.educational_purpose,
      permissions: dbRelationship.permissions || {
        viewProfile: true,
        viewAssessments: true,
        createAssessments: true,
        shareWithParents: true,
        exportData: false
      },
      isActive: !dbRelationship.end_date,
      createdAt: dbRelationship.created_at,
      createdBy: dbRelationship.created_by
    }
  }
  
  // =============================================================================
  // BACKWARD COMPATIBILITY
  // =============================================================================
  
  /**
   * Get classroom data in legacy format for existing components
   */
  static async getLegacyClassroomData(teacherId: number): Promise<{
    classrooms: any[]
    assignments: any[]
    isEnhanced: boolean
  }> {
    // This method provides backward compatibility
    // while gradually migrating to the new system
    
    try {
      // Try enhanced system first
      const students = await this.getStudentsForTeacher(teacherId.toString(), '2024-2025')
      
      if (students.length > 0) {
        // Convert enhanced data to legacy format
        const legacyAssignments = students.map((student, index) => ({
          id: index + 1,
          child_name: student.fullName,
          parent_email: `parent${index + 1}@example.com`, // Placeholder
          status: 'completed', // Assume completed for now
          teacher_id: teacherId,
          assessment_results: {
            personality_label: 'Creative Thinker', // Placeholder
            scores: {
              creative: 0.7,
              analytical: 0.5,
              collaborative: 0.6,
              confident: 0.5
            }
          }
        }))
        
        const legacyClassrooms = [{
          id: 1,
          name: `Enhanced Classroom`,
          teacher_id: teacherId,
          grade_level: students[0]?.gradeLevel || '3rd Grade',
          school_year: '2024-2025'
        }]
        
        return {
          classrooms: legacyClassrooms,
          assignments: legacyAssignments,
          isEnhanced: true
        }
      }
    } catch (error) {
      console.error('Enhanced system not available:', error)
    }
    
    // Fall back to legacy system
    const { getTeacherClassrooms, getTeacherAssignments } = await import('./supabase')
    
    const [classrooms, assignments] = await Promise.all([
      getTeacherClassrooms(teacherId),
      getTeacherAssignments(teacherId)
    ])
    
    return {
      classrooms: classrooms || [],
      assignments: assignments || [],
      isEnhanced: false
    }
  }
}