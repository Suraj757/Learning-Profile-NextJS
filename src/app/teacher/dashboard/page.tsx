'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Mail, 
  BarChart3, 
  Settings, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Send
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'
import type { Classroom, ProfileAssignment } from '@/lib/supabase'

export default function TeacherDashboardPage() {
  const { teacher, loading: authLoading, isAuthenticated } = useTeacherAuth()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [assignments, setAssignments] = useState<ProfileAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/teacher/register')
      return
    }

    if (teacher) {
      loadDashboardData()
    }
  }, [teacher, authLoading, isAuthenticated, router])

  const loadDashboardData = async () => {
    if (!teacher) return

    try {
      const [classroomsData, assignmentsData] = await Promise.all([
        getTeacherClassrooms(teacher.id),
        getTeacherAssignments(teacher.id)
      ])
      
      setClassrooms(classroomsData || [])
      setAssignments(assignmentsData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalAssignments = assignments.length
  const completedAssignments = assignments.filter(a => a.status === 'completed').length
  const pendingAssignments = totalAssignments - completedAssignments
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">Teacher Dashboard</span>
                <p className="text-sm text-begin-blue/70">Welcome back, {teacher?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/teacher/settings"
                className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors"
              >
                <Settings className="h-6 w-6" />
              </Link>
              <Link 
                href="/"
                className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-begin-teal to-begin-cyan text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading-lg font-bold mb-2">Welcome to Begin Learning Profiles!</h2>
                <p className="text-body opacity-90">Get started by creating your first classroom and inviting parents to complete learning profiles.</p>
              </div>
              <button 
                onClick={() => setShowWelcome(false)}
                className="text-white/80 hover:text-white p-2"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-blue/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Classrooms</p>
                <p className="text-2xl font-bold">{classrooms.length}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-teal/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Assignments Sent</p>
                <p className="text-2xl font-bold">{totalAssignments}</p>
              </div>
              <Mail className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">{completedAssignments}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-begin-cyan to-begin-cyan/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Classrooms Section */}
            <div className="card-begin">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-lg font-bold text-begin-blue">Your Classrooms</h2>
                <Link 
                  href="/teacher/classroom/create"
                  className="btn-begin-primary flex items-center gap-2 text-sm px-4 py-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Classroom
                </Link>
              </div>

              {classrooms.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-begin-gray mx-auto mb-4" />
                  <h3 className="text-heading font-semibold text-begin-blue mb-2">No classrooms yet</h3>
                  <p className="text-begin-blue/70 mb-4">Create your first classroom to start managing learning profiles</p>
                  <Link 
                    href="/teacher/classroom/create"
                    className="btn-begin-primary inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Classroom
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {classrooms.map((classroom) => (
                    <div key={classroom.id} className="border border-begin-gray rounded-card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-begin-blue">{classroom.name}</h3>
                          <p className="text-sm text-begin-blue/70">{classroom.grade_level} • {classroom.school_year}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/teacher/classroom/${classroom.id}/students`}
                            className="text-begin-teal hover:text-begin-teal-hover font-medium text-sm"
                          >
                            Manage Students
                          </Link>
                          <Link 
                            href={`/teacher/classroom/${classroom.id}/analytics`}
                            className="text-begin-cyan hover:text-begin-cyan/80 font-medium text-sm"
                          >
                            View Analytics
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Assignments */}
            <div className="card-begin">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-lg font-bold text-begin-blue">Recent Assignments</h2>
                <Link 
                  href="/teacher/assignments"
                  className="text-begin-teal hover:text-begin-teal-hover font-medium"
                >
                  View All
                </Link>
              </div>

              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-begin-gray mx-auto mb-3" />
                  <p className="text-begin-blue/70">No assignments sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-begin-cream/50 rounded-card">
                      <div className="flex items-center space-x-3">
                        {assignment.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-begin-cyan" />
                        )}
                        <div>
                          <p className="font-medium text-begin-blue">{assignment.child_name}</p>
                          <p className="text-sm text-begin-blue/70">{assignment.parent_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-begin-blue">
                          {assignment.status === 'completed' ? 'Completed' : 'Pending'}
                        </p>
                        <p className="text-xs text-begin-blue/70">
                          {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card-begin">
              <h3 className="text-heading font-bold text-begin-blue mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/teacher/classroom/create"
                  className="flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                >
                  <Plus className="h-5 w-5 text-begin-teal" />
                  Create New Classroom
                </Link>
                <Link 
                  href="/teacher/send-assessment"
                  className="flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                >
                  <Send className="h-5 w-5 text-begin-teal" />
                  Send Assessment Link
                </Link>
                <Link 
                  href="/teacher/reports"
                  className="flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                >
                  <Download className="h-5 w-5 text-begin-teal" />
                  Export Reports
                </Link>
                <Link 
                  href="/teacher/profiles"
                  className="flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-begin-teal" />
                  View Student Profiles
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="card-begin bg-begin-cyan/5 border border-begin-cyan/20">
              <h3 className="text-heading font-bold text-begin-blue mb-4">💡 Pro Tips</h3>
              <div className="space-y-3 text-sm text-begin-blue/80">
                <p>• Send assessment links at the beginning of the school year for best results</p>
                <p>• Use the analytics to identify learning style patterns in your classroom</p>
                <p>• Export reports before parent-teacher conferences</p>
                <p>• Follow up with parents who haven't completed assessments</p>
              </div>
            </div>

            {/* Support */}
            <div className="card-begin bg-begin-teal/5 border border-begin-teal/20">
              <h3 className="text-heading font-bold text-begin-blue mb-4">Need Help?</h3>
              <p className="text-sm text-begin-blue/80 mb-4">
                Get the most out of Begin Learning Profiles with our teacher resources.
              </p>
              <Link 
                href="/teacher/help"
                className="text-begin-teal hover:text-begin-teal-hover font-medium text-sm"
              >
                View Help Center →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}