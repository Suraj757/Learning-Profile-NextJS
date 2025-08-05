// API route specifically for sending assessment invitations to parents
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'
import { getTeacherByEmail, getTeacherAssignments, getTeacherClassrooms } from '@/lib/supabase'

interface AssessmentInvitationRequest {
  teacherEmail: string
  assignmentId?: string // If provided, send for specific assignment
  classroomId?: string  // If provided, send for specific classroom
  studentIds?: string[] // If provided, send for specific students
  includeCompleted?: boolean // Whether to include students who already completed
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentInvitationRequest = await request.json()
    
    // Validate required fields
    if (!body.teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Teacher email is required' },
        { status: 400 }
      )
    }

    // Get teacher data
    const teacher = await getTeacherByEmail(body.teacherEmail)
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Get teacher's assignments and classrooms
    const [assignments, classrooms] = await Promise.all([
      getTeacherAssignments(teacher.id),
      getTeacherClassrooms(teacher.id)
    ])

    if (!assignments || assignments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No assignments found for this teacher' },
        { status: 404 }
      )
    }

    // Filter assignments based on request parameters
    let targetAssignments = assignments

    if (body.assignmentId) {
      targetAssignments = assignments.filter(a => a.id === body.assignmentId)
      if (targetAssignments.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Assignment not found' },
          { status: 404 }
        )
      }
    }

    if (body.classroomId) {
      targetAssignments = targetAssignments.filter(a => a.classroom_id === body.classroomId)
    }

    if (body.studentIds && body.studentIds.length > 0) {
      targetAssignments = targetAssignments.filter(a => 
        body.studentIds!.includes(a.student_id)
      )
    }

    // Filter out completed assessments unless explicitly requested
    if (!body.includeCompleted) {
      targetAssignments = targetAssignments.filter(a => 
        !a.assessment_results || a.assessment_results.length === 0
      )
    }

    if (targetAssignments.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: 'No eligible assignments found (may already be completed)'
      })
    }

    // Prepare student data for email service
    const students = targetAssignments.map(assignment => ({
      childName: assignment.student_name || 'Student',
      parentEmail: assignment.parent_email,
      assignmentToken: assignment.token
    }))

    // Get classroom info for the teacher
    const primaryClassroom = classrooms?.[0]
    
    // Prepare teacher data
    const teacherData = {
      teacherName: teacher.full_name || teacher.email,
      teacherEmail: teacher.email,
      schoolName: primaryClassroom?.school_name,
      gradeLevel: primaryClassroom?.grade_level,
      dueDate: undefined // Could be set based on assignment due dates
    }

    console.log(`Sending assessment invitations to ${students.length} parents for teacher ${teacher.email}`)

    // Send invitation emails
    const result = await emailService.sendAssessmentInvitations(students, teacherData)
    
    console.log(`Assessment invitations sent: ${result.sent} successful, ${result.failed} failed`)

    // Log the email send for tracking
    // TODO: Store email send records in database for tracking and analytics

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: students.length,
      teacherName: teacherData.teacherName,
      results: result.results,
      message: `Sent assessment invitations to ${result.sent} parents`
    })

  } catch (error) {
    console.error('Assessment invitation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to preview what emails would be sent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherEmail = searchParams.get('teacherEmail')
    const assignmentId = searchParams.get('assignmentId')
    const classroomId = searchParams.get('classroomId')
    
    if (!teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Teacher email is required' },
        { status: 400 }
      )
    }

    // Get teacher data
    const teacher = await getTeacherByEmail(teacherEmail)
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Get assignments
    const assignments = await getTeacherAssignments(teacher.id)
    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        success: true,
        preview: [],
        message: 'No assignments found'
      })
    }

    // Filter assignments
    let targetAssignments = assignments

    if (assignmentId) {
      targetAssignments = assignments.filter(a => a.id === assignmentId)
    }

    if (classroomId) {
      targetAssignments = targetAssignments.filter(a => a.classroom_id === classroomId)
    }

    // Show only incomplete assessments in preview
    const incompleteAssignments = targetAssignments.filter(a => 
      !a.assessment_results || a.assessment_results.length === 0
    )

    const preview = incompleteAssignments.map(assignment => ({
      studentName: assignment.student_name || 'Student',
      parentEmail: assignment.parent_email,
      assignmentId: assignment.id,
      classroomId: assignment.classroom_id,
      status: 'pending'
    }))

    return NextResponse.json({
      success: true,
      preview,
      total: preview.length,
      teacherName: teacher.full_name || teacher.email,
      message: `${preview.length} assessment invitations ready to send`
    })

  } catch (error) {
    console.error('Assessment invitation preview error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}