'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Settings,
  BarChart3,
  Users,
  TrendingUp,
  BookOpen
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'
import { SAMPLE_PROFILES, SampleProfile } from '@/lib/sample-profiles'
import ClassroomOverviewDashboard from '@/components/analytics/ClassroomOverviewDashboard'
import StudentComparisonTool from '@/components/analytics/StudentComparisonTool'
import ProgressTrackingSystem from '@/components/analytics/ProgressTrackingSystem'
import DelightfulLoading from '@/components/loading/DelightfulLoading'

type AnalyticsView = 'overview' | 'comparison' | 'progress'

function ClassroomAnalyticsContent() {
  const params = useParams()
  const router = useRouter()
  const { teacher, isAuthenticated } = useTeacherAuth()
  const [loading, setLoading] = useState(true)
  const [classroom, setClassroom] = useState<any>(null)
  const [students, setStudents] = useState<SampleProfile[]>([])
  const [activeView, setActiveView] = useState<AnalyticsView>('overview')
  const [selectedStudent, setSelectedStudent] = useState<SampleProfile | null>(null)

  const classroomId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/teacher/register')
      return
    }
    
    loadClassroomData()
  }, [isAuthenticated, classroomId, router])

  const loadClassroomData = async () => {
    if (!teacher) return

    try {
      console.log('🏫 Loading classroom analytics for classroom:', classroomId)
      
      // Get classroom info and assignments
      const [classrooms, assignments] = await Promise.all([
        getTeacherClassrooms(teacher.id),
        getTeacherAssignments(teacher.id)
      ])
      
      const currentClassroom = classrooms?.find(c => c.id.toString() === classroomId)
      
      if (!currentClassroom) {
        console.log('❌ Classroom not found, using fallback')
        setClassroom({
          id: classroomId,
          name: "Demo Classroom",
          grade_level: '3rd Grade',
          school_year: '2024-2025'
        })
        setStudents(SAMPLE_PROFILES.slice(0, 6))
        return
      }
      
      setClassroom(currentClassroom)
      
      // Convert completed assignments to student profiles for analytics
      const completedAssignments = assignments?.filter(a => 
        a.status === 'completed' && 
        a.assessment_results &&
        a.assessment_results.personality_label
      ) || []
      
      console.log('📊 Found completed assignments:', completedAssignments.length)
      
      if (completedAssignments.length > 0) {
        // Convert assessment results to SampleProfile format for analytics components
        const realStudentProfiles: SampleProfile[] = completedAssignments.map((assignment, index) => {
          const results = assignment.assessment_results!
          
          return {
            id: assignment.id.toString(),
            childName: assignment.child_name,
            grade: results.grade || currentClassroom.grade_level,
            personalityType: results.personality_label,
            scores: results.scores || {},
            // Generate compatible data for analytics components
            responses: Object.entries(results.scores || {}).reduce((acc, [key, value], i) => {
              acc[i + 1] = Math.round(value)
              return acc
            }, {} as Record<number, number>),
            traits: {
              dominant: results.personality_label,
              secondary: Object.keys(results.scores || {})
                .sort((a, b) => (results.scores[b] || 0) - (results.scores[a] || 0))[1] || 'Balanced'
            },
            created_at: assignment.completed_at || assignment.assigned_at
          }
        })
        
        setStudents(realStudentProfiles)
        console.log('✅ Using real student data for analytics')
      } else {
        // Fallback to sample data if no completed assessments
        console.log('⚠️ No completed assessments, using sample data')
        setStudents(SAMPLE_PROFILES.slice(0, 6))
      }

    } catch (error) {
      console.error('❌ Error loading classroom data:', error)
      // Fallback data
      setClassroom({
        id: classroomId,
        name: "Demo Classroom",
        grade_level: '3rd Grade',
        school_year: '2024-2025'
      })
      setStudents(SAMPLE_PROFILES.slice(0, 6))
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    // In a real app, this would generate and download a comprehensive report
    const reportData = {
      classroom: classroom?.name,
      students: students.length,
      generatedAt: new Date().toISOString(),
      analytics: {
        personalityDistribution: students.reduce((acc, s) => {
          acc[s.personalityLabel] = (acc[s.personalityLabel] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        averageScores: students.reduce((acc, s) => {
          Object.entries(s.scores).forEach(([key, value]) => {
            acc[key] = (acc[key] || 0) + value
          })
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Create downloadable file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${classroom?.name || 'classroom'}-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleStudentSelect = (student: SampleProfile) => {
    setSelectedStudent(student)
    // Could navigate to individual student view or open modal
  }

  const handleGroupingRecommendation = (suggestedGroup: SampleProfile[]) => {
    alert(`Suggested group:\n${suggestedGroup.map(s => s.childName).join(', ')}\n\nThis group balances different learning styles and complementary skills for optimal collaboration.`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-begin-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DelightfulLoading 
            type="teacher"
            size="lg"
            customMessages={[
              "📊 Gathering classroom analytics...",
              "📈 Calculating learning insights...",
              "🎯 Analyzing student progress...",
              "📚 Preparing visual reports...",
              "✨ Almost ready to reveal insights!"
            ]}
          />
        </div>
      </div>
    )
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-begin-gray mx-auto mb-4" />
          <h2 className="text-heading-lg font-bold text-begin-blue mb-2">Classroom Not Found</h2>
          <p className="text-begin-blue/70 mb-4">The requested classroom could not be found.</p>
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="btn-begin-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/teacher/dashboard')}
                className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-begin-blue">Analytics Dashboard</h1>
                <p className="text-sm text-begin-blue/70">{classroom.name} • {classroom.grade_level}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportReport}
                className="btn-begin-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
              <button className="btn-begin-secondary flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveView('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'overview'
                  ? 'border-begin-teal text-begin-teal'
                  : 'border-transparent text-begin-blue/70 hover:text-begin-blue hover:border-begin-gray'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Classroom Overview
              </div>
            </button>
            <button
              onClick={() => setActiveView('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'comparison'
                  ? 'border-begin-teal text-begin-teal'
                  : 'border-transparent text-begin-blue/70 hover:text-begin-blue hover:border-begin-gray'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Student Comparison
              </div>
            </button>
            <button
              onClick={() => setActiveView('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'progress'
                  ? 'border-begin-teal text-begin-teal'
                  : 'border-transparent text-begin-blue/70 hover:text-begin-blue hover:border-begin-gray'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress Tracking
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'overview' && (
          <ClassroomOverviewDashboard
            students={students}
            classroomName={classroom.name}
            grade={classroom.grade_level}
            onExport={handleExportReport}
            onStudentSelect={handleStudentSelect}
          />
        )}

        {activeView === 'comparison' && (
          <StudentComparisonTool
            students={students}
            onGroupingRecommendation={handleGroupingRecommendation}
          />
        )}

        {activeView === 'progress' && (
          <ProgressTrackingSystem
            students={students}
            classroomName={classroom.name}
            onExportData={handleExportReport}
          />
        )}
      </main>

      {/* Selected Student Modal/Sidebar (could be implemented) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading-lg font-bold text-begin-blue">
                {selectedStudent.childName}'s Profile
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-begin-blue/70 hover:text-begin-blue"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-begin-blue mb-2">Learning Profile</h4>
                <p className="text-begin-blue/70">{selectedStudent.personalityLabel}</p>
                <p className="text-sm text-begin-blue/60">{selectedStudent.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-begin-blue mb-2">6C Scores</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedStudent.scores).map(([category, score]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-sm text-begin-blue/70">{category}:</span>
                      <span className="font-medium text-begin-blue">{score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-begin-blue mb-2">Strengths</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedStudent.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-begin-blue/70">{strength}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-begin-blue mb-2">Growth Areas</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedStudent.growthAreas.map((area, index) => (
                    <li key={index} className="text-sm text-begin-blue/70">{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClassroomAnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading analytics...</p>
        </div>
      </div>
    }>
      <ClassroomAnalyticsContent />
    </Suspense>
  )
}