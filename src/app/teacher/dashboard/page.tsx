'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Mail, 
  BarChart3, 
  Settings,
  Heart,
  Zap, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Send,
  CreditCard
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/auth/hooks'
import AuthenticatedHeader from '@/components/auth/AuthenticatedHeader'
import { DemoDataBanner } from '@/components/ui/DemoDataIndicator'
import { getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'
import type { Classroom, ProfileAssignment } from '@/lib/supabase'
import DelightfulLoading from '@/components/loading/DelightfulLoading'
import { createDemoDataForTeacher, getDemoReportsData } from '@/lib/demo-data'
import { getOnboardingStatus, OnboardingStatus } from '@/lib/teacher-onboarding'
import { getTeacherDatabaseId, migrateTeacherToSupabase } from '@/lib/teacher-migration'

function TeacherDashboardContent() {
  const { teacher, loading: authLoading } = useTeacherAuth()
  const isAuthenticated = !!teacher
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [assignments, setAssignments] = useState<ProfileAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [onboardingState, setOnboardingState] = useState<{ shouldShow: OnboardingStatus; reason: string; suggestions: string[] } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('welcome') === 'true' || searchParams.get('onboarding') === 'completed') {
      setShowWelcome(true)
    }
  }, [searchParams])

  useEffect(() => {
    console.log('Dashboard auth check:', { authLoading, isAuthenticated, teacher: !!teacher })
    
    if (!authLoading && !isAuthenticated) {
      console.log('Redirecting to teacher login - not authenticated')
      router.push('/teacher/login')
      return
    }

    if (teacher) {
      console.log('Loading dashboard data for teacher:', teacher.name)
      loadDashboardData()
    }
  }, [teacher, authLoading, isAuthenticated, router])

  const loadDashboardData = async () => {
    if (!teacher) return

    try {
      // Get the correct teacher database ID (with automatic migration if needed)
      let teacherId: number | null = null
      let classroomsData: any[] = []
      let assignmentsData: any[] = []

      // For demo accounts, use fallback data immediately
      if (teacher.email === 'demo@school.edu' || teacher.isOfflineDemo || teacher.isOfflineAccount) {
        console.log('Using demo data for offline/demo account')
        const demoData = getDemoReportsData(teacher.id)
        setClassrooms(demoData.classrooms as any)
        setAssignments(demoData.assignments as any)
        
        // Still check onboarding status with demo data
        const onboardingStatus = getOnboardingStatus(
          teacher, 
          demoData.classrooms as any, 
          demoData.assignments as any,
          searchParams
        )
        setOnboardingState({
          shouldShow: onboardingStatus.shouldShow,
          reason: onboardingStatus.reason,
          suggestions: onboardingStatus.suggestions
        })
        return
      }

      // For regular teachers, get database ID
      try {
        teacherId = await getTeacherDatabaseId(teacher.email)
        if (!teacherId) {
          console.log('Attempting to migrate teacher to database...')
          const migrationResult = await migrateTeacherToSupabase(teacher.email)
          if (migrationResult.success) {
            teacherId = migrationResult.teacherId || null
          }
        }

        if (teacherId) {
          // Fetch real data from database
          const [dbClassroomsData, dbAssignmentsData] = await Promise.all([
            getTeacherClassrooms(teacherId),
            getTeacherAssignments(teacherId)
          ])
          
          classroomsData = dbClassroomsData || []
          assignmentsData = dbAssignmentsData || []

          // If teacher has no data, create some demo data
          if (classroomsData.length === 0 && assignmentsData.length === 0) {
            console.log('Creating demo data for new teacher')
            await createDemoDataForTeacher(teacherId)
            
            // Refetch after creating demo data
            const [newClassroomsData, newAssignmentsData] = await Promise.all([
              getTeacherClassrooms(teacherId),
              getTeacherAssignments(teacherId)
            ])
            
            classroomsData = newClassroomsData || []
            assignmentsData = newAssignmentsData || []
          }
        } else {
          throw new Error('Could not establish teacher in database')
        }
      } catch (dbError) {
        console.warn('Database operations failed, using demo data fallback:', dbError.message)
        const demoData = getDemoReportsData(teacher.id)
        classroomsData = demoData.classrooms as any
        assignmentsData = demoData.assignments as any
      }

      // Set the data
      setClassrooms(classroomsData)
      setAssignments(assignmentsData)
      
      // Check onboarding status
      const onboardingStatus = getOnboardingStatus(
        teacher, 
        classroomsData, 
        assignmentsData,
        searchParams
      )
      setOnboardingState({
        shouldShow: onboardingStatus.shouldShow,
        reason: onboardingStatus.reason,
        suggestions: onboardingStatus.suggestions
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      
      // Final fallback to demo data
      const demoData = getDemoReportsData(teacher.id)
      setClassrooms(demoData.classrooms as any)
      setAssignments(demoData.assignments as any)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-begin-cream">
        {/* Header Skeleton */}
        <header className="bg-white shadow-sm border-b border-begin-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-begin-teal" />
                <div>
                  <span className="text-2xl font-bold text-begin-blue">Teacher Dashboard</span>
                  <div className="h-4 bg-gray-200 rounded w-32 mt-1 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DelightfulLoading 
            type="teacher"
            size="lg"
            customMessages={[
              "📚 Organizing your classroom insights...",
              "📈 Calculating student progress...",
              "⭐ Gathering achievement highlights...",
              "🎨 Designing your teaching dashboard...",
              "💡 Preparing learning recommendations...",
              "🎆 Almost ready for the grand reveal!"
            ]}
          />
          
          {/* Dashboard skeleton preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-begin p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse" />
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
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
      {/* Enhanced Header with Auth Components */}
      <AuthenticatedHeader 
        title="Teacher Dashboard" 
        subtitle={`Welcome back, ${teacher?.name || teacher?.email?.split('@')[0] || 'Teacher'}`}
        showAuthState={true}
        showNotifications={true}
      />

      {/* Welcome Message */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-begin-teal to-begin-cyan text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading-lg font-bold mb-2">Welcome to Begin Learning Profiles!</h2>
                <p className="text-body opacity-90 mb-3">Get started by creating your first classroom and inviting parents to complete learning profiles.</p>
                <Link 
                  href="/teacher/onboarding"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-card text-sm font-medium transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Take the 5-Minute Tour
                </Link>
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

      {/* Smart Onboarding Banner */}
      {onboardingState && onboardingState.shouldShow === 'suggested' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get More Value from Learning Profiles</h3>
                  <p className="text-sm opacity-90">{onboardingState.reason}</p>
                  {onboardingState.suggestions.length > 0 && (
                    <p className="text-xs opacity-75 mt-1">💡 {onboardingState.suggestions[0]}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/teacher/onboarding?tour=true"
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-card text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Take Tour
                </Link>
                <button
                  onClick={() => setOnboardingState(null)}
                  className="text-white/80 hover:text-white p-1"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Required Onboarding Redirect */}
      {onboardingState && onboardingState.shouldShow === 'required' && (
        <div className="bg-begin-teal text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">Welcome! Let's Get You Started</h2>
              <p className="mb-4 opacity-90">{onboardingState.reason}</p>
              <Link
                href="/teacher/onboarding"
                className="btn-begin-primary bg-white text-begin-teal hover:bg-begin-gray/10"
              >
                Start 5-Minute Setup
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Data Indicator */}
        <DemoDataBanner 
          message="You are viewing demo data to explore the platform. Create real assessments to see actual student insights."
          actionText="Create First Classroom"
          onAction={() => router.push('/teacher/classroom/create')}
        />
        
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
                            className="text-begin-cyan hover:text-begin-cyan/80 font-medium text-sm flex items-center gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Analytics
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
                
                {/* NEW TIER 1 FEATURES */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="text-xs font-medium text-begin-teal mb-2">🚀 NEW: Back-to-School Ready</div>
                  
                  <Link 
                    href="/teacher/day1-kit"
                    className="flex items-center gap-3 p-3 text-begin-blue hover:bg-yellow-50 rounded-card transition-colors relative"
                  >
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium">Day 1 Success Kit</div>
                      <div className="text-xs text-gray-600">Know your class by Day 1</div>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</div>
                  </Link>
                  
                  <Link 
                    href="/teacher/student-cards"
                    className="flex items-center gap-3 p-3 text-begin-blue hover:bg-purple-50 rounded-card transition-colors relative"
                  >
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Student Reference Cards</div>
                      <div className="text-xs text-gray-600">Instant intervention guides</div>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</div>
                  </Link>
                  
                  <Link 
                    href="/teacher/parent-updates"
                    className="flex items-center gap-3 p-3 text-begin-blue hover:bg-green-50 rounded-card transition-colors relative"
                  >
                    <Heart className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Parent Connection System</div>
                      <div className="text-xs text-gray-600">First week trust building</div>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</div>
                  </Link>
                  
                  <Link 
                    href="/teacher/alerts"
                    className="flex items-center gap-3 p-3 text-begin-blue hover:bg-red-50 rounded-card transition-colors relative"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium">At-Risk Early Alerts</div>
                      <div className="text-xs text-gray-600">Identify students needing support</div>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</div>
                  </Link>
              </div>
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

export default function TeacherDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading dashboard...</p>
        </div>
      </div>
    }>
      <TeacherDashboardContent />
    </Suspense>
  )
}