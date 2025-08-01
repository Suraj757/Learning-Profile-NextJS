'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Plus, 
  Users, 
  Mail, 
  Send,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { 
  getClassroomStudents, 
  addStudentToClassroom, 
  createProfileAssignment,
  getTeacherAssignments 
} from '@/lib/supabase'
import type { Student, ProfileAssignment, Classroom } from '@/lib/supabase'

export default function ClassroomStudentsPage() {
  const { teacher, isAuthenticated } = useTeacherAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<ProfileAssignment[]>([])
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newStudent, setNewStudent] = useState({
    child_name: '',
    parent_email: '',
    notes: ''
  })
  const [formError, setFormError] = useState('')
  const [sendingAssignments, setSendingAssignments] = useState<number[]>([])
  
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const classroomId = parseInt(params.id as string)

  useEffect(() => {
    if (searchParams.get('created') === 'true') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/teacher/register')
      return
    }

    if (teacher && classroomId) {
      loadClassroomData()
    }
  }, [teacher, classroomId, isAuthenticated, router])

  const loadClassroomData = async () => {
    try {
      const [studentsData, assignmentsData] = await Promise.all([
        getClassroomStudents(classroomId),
        getTeacherAssignments(teacher!.id)
      ])
      
      setStudents(studentsData || [])
      setAssignments(assignmentsData?.filter(a => 
        studentsData?.some(s => s.child_name === a.child_name && s.parent_email === a.parent_email)
      ) || [])
    } catch (error) {
      console.error('Error loading classroom data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    try {
      if (!newStudent.child_name.trim() || !newStudent.parent_email.trim()) {
        throw new Error('Please fill in all required fields')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newStudent.parent_email)) {
        throw new Error('Please enter a valid email address')
      }

      await addStudentToClassroom(classroomId, {
        child_name: newStudent.child_name.trim(),
        parent_email: newStudent.parent_email.trim(),
        grade_level: classroom?.grade_level || '',
        notes: newStudent.notes.trim() || undefined
      })

      setNewStudent({ child_name: '', parent_email: '', notes: '' })
      setShowAddForm(false)
      loadClassroomData()
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong')
    }
  }

  const handleSendAssignment = async (student: Student) => {
    if (!teacher) return

    setSendingAssignments(prev => [...prev, student.id])
    
    try {
      await createProfileAssignment({
        teacher_id: teacher.id,
        parent_email: student.parent_email,
        child_name: student.child_name,
        student_id: student.id
      })
      
      loadClassroomData()
    } catch (error) {
      console.error('Error sending assignment:', error)
    } finally {
      setSendingAssignments(prev => prev.filter(id => id !== student.id))
    }
  }

  const getStudentAssignment = (student: Student) => {
    return assignments.find(a => 
      a.child_name === student.child_name && a.parent_email === student.parent_email
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading classroom...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">Classroom Students</span>
                <p className="text-sm text-begin-blue/70">Manage your student roster and assignments</p>
              </div>
            </div>
            <Link 
              href="/teacher/dashboard"
              className="flex items-center gap-2 text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <p className="text-green-800">Classroom created successfully! Now add your students to get started.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-blue/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-teal/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Assignments Sent</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <Mail className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">{assignments.filter(a => a.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        <div className="card-begin">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-lg font-bold text-begin-blue">Student Roster</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-begin-primary flex items-center gap-2 text-sm px-4 py-2"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </button>
            </div>
          </div>

          {/* Add Student Form */}
          {showAddForm && (
            <div className="mb-6 p-6 bg-begin-cream/50 rounded-card border border-begin-gray">
              <h3 className="text-heading font-semibold text-begin-blue mb-4">Add New Student</h3>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-card">
                  <p className="text-red-800 text-sm">{formError}</p>
                </div>
              )}

              <form onSubmit={handleAddStudent} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-begin-blue mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={newStudent.child_name}
                    onChange={(e) => setNewStudent(prev => ({...prev, child_name: e.target.value}))}
                    className="w-full px-3 py-2 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                    placeholder="Enter student's full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-begin-blue mb-2">
                    Parent Email *
                  </label>
                  <input
                    type="email"
                    value={newStudent.parent_email}
                    onChange={(e) => setNewStudent(prev => ({...prev, parent_email: e.target.value}))}
                    className="w-full px-3 py-2 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                    placeholder="parent@email.com"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-begin-blue mb-2">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={newStudent.notes}
                    onChange={(e) => setNewStudent(prev => ({...prev, notes: e.target.value}))}
                    className="w-full px-3 py-2 border border-begin-gray rounded-card focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                    placeholder="Any special notes about this student"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="btn-begin-primary text-sm px-4 py-2"
                  >
                    Add Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setFormError('')
                      setNewStudent({ child_name: '', parent_email: '', notes: '' })
                    }}
                    className="btn-begin-secondary text-sm px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Students Table */}
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-begin-gray mx-auto mb-4" />
              <h3 className="text-heading font-semibold text-begin-blue mb-2">No students yet</h3>
              <p className="text-begin-blue/70 mb-4">Add your first student to start managing learning profiles</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-begin-primary inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Student
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-begin-gray">
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Parent Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Assessment Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-begin-blue">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const assignment = getStudentAssignment(student)
                    const isSending = sendingAssignments.includes(student.id)
                    
                    return (
                      <tr key={student.id} className="border-b border-begin-gray/50 hover:bg-begin-cream/30">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-begin-blue">{student.child_name}</p>
                            {student.notes && (
                              <p className="text-sm text-begin-blue/60">{student.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-begin-blue">{student.parent_email}</p>
                        </td>
                        <td className="py-4 px-4">
                          {assignment ? (
                            <div className="flex items-center gap-2">
                              {assignment.status === 'completed' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-green-700 font-medium">Completed</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4 text-begin-cyan" />
                                  <span className="text-begin-cyan font-medium">Sent</span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-begin-blue/60">Not sent</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {assignment?.status === 'completed' ? (
                              <Link
                                href={`/teacher/student/${student.id}/profile`}
                                className="p-2 text-begin-teal hover:text-begin-teal-hover transition-colors"
                                title="View Profile"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            ) : assignment ? (
                              <button
                                onClick={() => handleSendAssignment(student)}
                                disabled={isSending}
                                className="p-2 text-begin-cyan hover:text-begin-cyan/80 transition-colors disabled:opacity-50"
                                title="Resend Assignment"
                              >
                                {isSending ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-begin-cyan"></div>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendAssignment(student)}
                                disabled={isSending}
                                className="p-2 text-begin-teal hover:text-begin-teal-hover transition-colors disabled:opacity-50"
                                title="Send Assessment"
                              >
                                {isSending ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-begin-teal"></div>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}