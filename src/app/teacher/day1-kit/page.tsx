'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
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
  AlertTriangle,
  Download,
  Send,
  Star,
  Target,
  UserCheck,
  PieChart,
  Layout,
  MessageSquare,
  Copy,
  Printer,
  Timer,
  TrendingUp,
  Lightbulb,
  Home,
  School,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
  Calendar,
  MapPin,
  Zap,
  Sparkles
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { getTeacherClassrooms, getTeacherAssignments, supabase, getTeacherByEmail } from '@/lib/supabase'
import type { Classroom, ProfileAssignment } from '@/lib/supabase'
import DelightfulLoading from '@/components/loading/DelightfulLoading'
import EnhancedContentRecommendations from '@/components/content/EnhancedContentRecommendations'
import { beginContentService } from '@/lib/content-recommendation-service'
import { getDemoReportsData, createDemoDataForTeacher } from '@/lib/demo-data'
import { getTeacherDatabaseId, migrateTeacherToSupabase } from '@/lib/teacher-migration'
import { seedRealDataForSuraj } from '@/lib/seed-real-data'

// Wrapper component to handle async content loading
function ContentRecommendationsWrapper({ learningProfile, studentName }: { 
  learningProfile: any
  studentName: string 
}) {
  const [recommendations, setRecommendations] = useState<any>(null)
  
  useEffect(() => {
    async function loadRecommendations() {
      try {
        const recs = await beginContentService.getQuickRecommendationSummary(learningProfile)
        setRecommendations(recs)
      } catch (error) {
        console.error('Error loading recommendations:', error)
      }
    }
    loadRecommendations()
  }, [learningProfile])

  if (!recommendations) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-begin-teal" />
        <span className="ml-2 text-begin-blue/70">Loading personalized content...</span>
      </div>
    )
  }

  return (
    <EnhancedContentRecommendations
      recommendations={recommendations}
      studentName={studentName}
      learningProfile={learningProfile.personality_label}
    />
  )
}

// Helper function to get demo Day 1 Kit data
function getDemoDay1KitData() {
  return {
    classroom: {
      name: "Mrs. Demo's 3rd Grade",
      grade: "3rd Grade",
      studentCount: 24,
      profilesCompleted: 20,
      schoolStartDate: "2024-08-26",
      daysUntilStart: 2
    },
    learningStyleDistribution: {
      creative: 6,
      analytical: 4,
      collaborative: 7,
      confident: 3,
      balanced: 4
    },
    atRiskStudents: [
      {
        name: "Marcus Chen",
        issue: "May struggle with group work (strongly analytical)",
        solution: "Pair with Sofia for collaborative projects",
        avatar: "MC"
      },
      {
        name: "Aiden Wilson", 
        issue: "Needs independent work options (prefers solo)",
        solution: "Provide choice boards and extension activities",
        avatar: "AW"
      },
      {
        name: "Maya Patel",
        issue: "Building confidence for class participation",
        solution: "Start with small group sharing before whole class",
        avatar: "MP"
      }
    ],
    seatingRecommendations: [
      { student: "Emma Johnson", position: "Front left", reason: "Natural helper - good mentor position" },
      { student: "Sofia Rodriguez", position: "Center table", reason: "Social hub - connects all groups" },
      { student: "Marcus Chen", position: "Quiet corner", reason: "Needs focused environment" }
    ],
    emailTemplates: [
      {
        type: "Creative Learners",
        subject: "Your Creative Learner - Let's Build Amazing Things Together!",
        preview: "I'm so excited to share that [Child Name] shows incredible creative potential...",
        studentCount: 6
      },
      {
        type: "Analytical Learners", 
        subject: "Your Analytical Thinker - Ready for Deep Learning!",
        preview: "I want you to know that [Child Name] has remarkable analytical abilities...",
        studentCount: 4
      },
      {
        type: "Collaborative Learners",
        subject: "Your Team Player - Building Connections and Learning!",
        preview: "[Child Name] has such a gift for bringing people together and learning with others...",
        studentCount: 7
      }
    ]
  }
}

// Helper function to analyze learning style distribution from actual student data
function analyzeLearningStyleDistribution(assignments: any[]) {
  const distribution = {
    creative: 0,
    analytical: 0,
    collaborative: 0,
    confident: 0,
    balanced: 0
  }
  
  assignments.forEach(assignment => {
    // Check both assessment_results and status to ensure we only count truly completed assessments
    if (assignment.status === 'completed' && assignment.assessment_results && assignment.assessment_results.personality_label) {
      const label = assignment.assessment_results.personality_label.toLowerCase()
      if (label.includes('creative')) distribution.creative++
      else if (label.includes('analytical')) distribution.analytical++
      else if (label.includes('collaborative')) distribution.collaborative++
      else if (label.includes('confident')) distribution.confident++
      else distribution.balanced++
    }
  })
  
  return distribution
}

// Helper function to identify at-risk students from actual data
function identifyAtRiskStudents(assignments: any[]) {
  const atRiskStudents = []
  
  assignments.forEach(assignment => {
    if (assignment.status === 'completed' && assignment.assessment_results?.scores) {
      const scores = assignment.assessment_results.scores
      const confidence = scores.Confidence || 0
      const collaboration = scores.Collaboration || 0
      const content = scores.Content || 0
      
      if (confidence < 2.5 || collaboration < 2.5 || content < 2.5) {
        const issues = []
        const solutions = []
        
        if (confidence < 2.5) {
          issues.push(`Low confidence scores (${(Number(confidence) || 0).toFixed(1)}/5)`)
          solutions.push('Schedule 1-on-1 confidence building sessions')
        }
        if (collaboration < 2.5) {
          issues.push(`Struggling with collaboration (${(Number(collaboration) || 0).toFixed(1)}/5)`)
          solutions.push('Pair with strong collaborative partner')
        }
        if (content < 2.5) {
          issues.push(`Content mastery concerns (${(Number(content) || 0).toFixed(1)}/5)`)
          solutions.push('Provide additional scaffolding and support')
        }
        
        atRiskStudents.push({
          name: assignment.child_name,
          issue: issues[0] || 'May need additional support',
          solution: solutions[0] || 'Consider smaller group activities',
          avatar: assignment.child_name.split(' ').map(n => n[0]).join('').toUpperCase()
        })
      }
    }
  })
  
  return atRiskStudents.slice(0, 5) // Limit to top 5 at-risk students
}

// Helper function to generate seating recommendations
function generateSeatingRecommendations(assignments: any[]) {
  const recommendations = []
  
  assignments.forEach(assignment => {
    if (assignment.status === 'completed' && assignment.assessment_results && assignment.assessment_results.personality_label) {
      const label = assignment.assessment_results.personality_label.toLowerCase()
      const scores = assignment.assessment_results.scores || {}
      
      console.log('🪑 Generating seating for:', assignment.child_name, 'label:', label, 'scores:', Object.keys(scores))
      
      // More flexible score checking - use any available score > 3.5
      const highScores = Object.entries(scores).filter(([key, value]) => typeof value === 'number' && value > 3.5)
      const hasHighScore = highScores.length > 0
      
      if (label.includes('collaborative')) {
        recommendations.push({
          student: assignment.child_name,
          position: 'Center table',
          reason: hasHighScore ? 'Strong collaborator - connects all groups' : 'Social hub - connects all groups'
        })
      } else if (label.includes('analytical')) {
        recommendations.push({
          student: assignment.child_name,
          position: 'Quiet corner',
          reason: hasHighScore ? 'Analytical thinker - needs focused environment' : 'Needs focused environment for deep thinking'
        })
      } else if (label.includes('creative')) {
        recommendations.push({
          student: assignment.child_name,
          position: 'Art/creation area',
          reason: hasHighScore ? 'Creative innovator - benefits from materials access' : 'Benefits from access to creative materials'
        })
      } else if (label.includes('confident')) {
        recommendations.push({
          student: assignment.child_name,
          position: 'Front leadership position',
          reason: hasHighScore ? 'Natural leader - excellent mentor position' : 'Natural helper - good mentor position'
        })
      } else {
        // Fallback for any other personality types
        recommendations.push({
          student: assignment.child_name,
          position: 'Flexible seating area',
          reason: `${label} learner - adaptable placement`
        })
      }
    }
  })
  
  console.log('🪑 Generated seating recommendations:', recommendations.length)
  return recommendations.slice(0, 6) // Limit to top 6 recommendations
}

// Helper function to generate email templates based on actual class composition
function generateEmailTemplates(assignments: any[]) {
  const styleGroups = {
    creative: [],
    analytical: [],
    collaborative: [],
    confident: []
  }
  
  assignments.forEach(assignment => {
    if (assignment.status === 'completed' && assignment.assessment_results && assignment.assessment_results.personality_label) {
      const label = assignment.assessment_results.personality_label.toLowerCase()
      console.log('📧 Categorizing for email:', assignment.child_name, 'as:', label)
      
      if (label.includes('creative')) styleGroups.creative.push(assignment)
      else if (label.includes('analytical')) styleGroups.analytical.push(assignment)
      else if (label.includes('collaborative')) styleGroups.collaborative.push(assignment)
      else if (label.includes('confident')) styleGroups.confident.push(assignment)
    }
  })
  
  console.log('📧 Email group sizes:', Object.entries(styleGroups).map(([key, arr]) => `${key}: ${arr.length}`).join(', '))
  
  const templates = []
  
  if (styleGroups.creative.length > 0) {
    templates.push({
      type: 'Creative Learners',
      subject: 'Your Creative Learner - Let\'s Build Amazing Things Together!',
      preview: 'I\'m so excited to share that [Child Name] shows incredible creative potential...',
      studentCount: styleGroups.creative.length
    })
  }
  
  if (styleGroups.analytical.length > 0) {
    templates.push({
      type: 'Analytical Learners',
      subject: 'Your Analytical Thinker - Ready for Deep Learning!',
      preview: 'I want you to know that [Child Name] has remarkable analytical abilities...',
      studentCount: styleGroups.analytical.length
    })
  }
  
  if (styleGroups.collaborative.length > 0) {
    templates.push({
      type: 'Collaborative Learners',
      subject: 'Your Team Player - Building Connections and Learning!',
      preview: '[Child Name] has such a gift for bringing people together and learning with others...',
      studentCount: styleGroups.collaborative.length
    })
  }
  
  if (styleGroups.confident.length > 0) {
    templates.push({
      type: 'Confident Learners',
      subject: 'Your Natural Leader - Ready to Shine!',
      preview: '[Child Name] shows remarkable confidence and leadership potential...',
      studentCount: styleGroups.confident.length
    })
  }
  
  return templates
}

function Day1KitContent() {
  const { teacher, loading: authLoading, isAuthenticated } = useTeacherAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'seating' | 'emails'>('overview')
  const [showSeatingHelp, setShowSeatingHelp] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [timeUntilSchool, setTimeUntilSchool] = useState({ days: 2, hours: 14, minutes: 23 })
  const [day1Data, setDay1Data] = useState<any>(null)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [assignments, setAssignments] = useState<ProfileAssignment[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Day1Kit: Not authenticated, redirecting to login')
      router.push('/teacher/login')
      return
    }

    if (teacher) {
      console.log('Day1Kit: Teacher authenticated, loading data for:', teacher.name)
      loadDay1KitData()
    }
  }, [teacher, authLoading, isAuthenticated, router])

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilSchool(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 }
        }
        return prev
      })
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const loadDay1KitData = async () => {
    if (!teacher) return

    try {
      console.log('=== Day 1 Kit Data Loading Debug v2 ===')
      console.log('Teacher from localStorage:', teacher.email, 'ID:', teacher.id)
      console.log('Supabase connection status:', !!supabase)
      console.log('Environment check:')
      console.log('  - SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
      console.log('  - SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...')
      
      // Check if Supabase is configured
      if (!supabase) {
        console.log('❌ Supabase not configured, using demo data')
        throw new Error('Supabase not configured')
      }
      
      // Declare variables in the main scope
      let classroomsData: any[] = []
      let assignmentsData: any[] = []
      
      // Get the correct teacher database ID (with automatic migration if needed)
      let teacherId: number | null = null
      try {
        console.log('🔍 Getting teacher database ID for:', teacher.email)
        teacherId = await getTeacherDatabaseId(teacher.email)
        console.log('📋 Teacher database ID result:', teacherId)
        
        if (!teacherId) {
          console.log('⚠️ Could not get teacher database ID, trying to migrate...')
          const migrationResult = await migrateTeacherToSupabase(teacher.email)
          if (migrationResult.success) {
            teacherId = migrationResult.teacherId || null
            console.log('✅ Teacher migrated successfully, ID:', teacherId)
          } else {
            console.log('❌ Teacher migration failed:', migrationResult.error)
            throw new Error('Could not establish teacher in database')
          }
        }
        
        if (!teacherId) {
          throw new Error('Teacher ID is null after all attempts')
        }
        
        console.log('✅ Using teacher ID:', teacherId)
        
        const [dbClassroomsData, dbAssignmentsData] = await Promise.all([
          getTeacherClassrooms(teacherId),
          getTeacherAssignments(teacherId)
        ])
        
        classroomsData = dbClassroomsData || []
        assignmentsData = dbAssignmentsData || []
        
        console.log('📊 Live data check:')
        console.log('  - Classrooms:', classroomsData.length, classroomsData.map(c => c.name))
        console.log('  - Assignments:', assignmentsData.length, 'completed:', assignmentsData.filter(a => a.status === 'completed').length)
        console.log('  - Assignments with assessment_results:', assignmentsData.filter(a => a.assessment_results).length)
        console.log('  - Assignments with assessment_id:', assignmentsData.filter(a => a.assessment_id).length)
        
        // Debug ALL assignments to understand the data structure
        if (assignmentsData.length > 0) {
          console.log('📋 DETAILED assignment analysis:')
          assignmentsData.forEach((assignment, i) => {
            console.log(`  📝 Assignment ${i + 1}:`, {
              id: assignment.id,
              child_name: assignment.child_name,
              status: assignment.status,
              assessment_id: assignment.assessment_id,
              has_results: !!assignment.assessment_results,
              results_structure: assignment.assessment_results ? Object.keys(assignment.assessment_results) : null,
              personality_label: assignment.assessment_results?.personality_label,
              scores_available: assignment.assessment_results?.scores ? Object.keys(assignment.assessment_results.scores) : null
            })
          })
          
          // Test the analysis function directly
          console.log('🧪 Testing analysis function:')
          const testDistribution = analyzeLearningStyleDistribution(assignmentsData)
          console.log('  - Learning style distribution result:', testDistribution)
          
          const testAtRisk = identifyAtRiskStudents(assignmentsData)
          console.log('  - At-risk students result:', testAtRisk.length, 'students')
        }
        
        // If teacher exists but has no data, create appropriate data
        if (classroomsData.length === 0 && assignmentsData.length === 0) {
          if (teacher.email === 'suraj+1@speakaboos.com' || teacherId === 1001) {
            console.log('Creating real student data for suraj+1@speakaboos.com')
            await seedRealDataForSuraj()
          } else {
            console.log('Teacher exists but has no data, creating demo data')
            await createDemoDataForTeacher(teacherId)
          }
          
          // Refetch data after creating data
          const [newClassroomsData, newAssignmentsData] = await Promise.all([
            getTeacherClassrooms(teacherId),
            getTeacherAssignments(teacherId)
          ])
          
          classroomsData = newClassroomsData || []
          assignmentsData = newAssignmentsData || []
          
          console.log('After creating data - Classrooms:', classroomsData.length, 'Assignments:', assignmentsData.length)
        }
        
      } catch (dbError) {
        console.log('❌ Database operations failed:', dbError.message)
        console.log('⚠️ Using fallback demo data')
        
        // Use demo data as complete fallback
        const demoData = getDemoReportsData(teacher.id)
        classroomsData = demoData.classrooms as any
        assignmentsData = demoData.assignments as any
      }
      
      console.log('📊 Final data status:')
      console.log('  - Classrooms:', classroomsData.length)
      console.log('  - Assignments:', assignmentsData.length)
      
      // If no live data available, fall back to demo data
      if (classroomsData.length === 0 || assignmentsData.length === 0) {
        console.log('⚠️  No live data found, using demo data')
        console.log('    Reason: Classrooms =', classroomsData.length, 'Assignments =', assignmentsData.length)
        const demoData = getDemoReportsData(teacher.id)
        classroomsData = classroomsData.length > 0 ? classroomsData : demoData.classrooms as any
        assignmentsData = assignmentsData.length > 0 ? assignmentsData : demoData.assignments as any
      } else {
        console.log('✅ Using live data from database')
      }
      
      setClassrooms(classroomsData)
      setAssignments(assignmentsData)
      
      // Generate Day 1 Kit data from actual classroom data
      const primaryClassroom = classroomsData[0] || { name: 'Your Classroom', grade_level: '3rd Grade' }
      const completedAssignments = assignmentsData.filter(a => a.status === 'completed')
      
      const generatedDay1Data = {
        classroom: {
          name: primaryClassroom.name,
          grade: primaryClassroom.grade_level,
          studentCount: assignmentsData.length,
          profilesCompleted: completedAssignments.length,
          schoolStartDate: "2024-08-26",
          daysUntilStart: Math.max(0, Math.ceil((new Date('2024-08-26').getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
        },
        learningStyleDistribution: analyzeLearningStyleDistribution(completedAssignments),
        atRiskStudents: identifyAtRiskStudents(completedAssignments),
        seatingRecommendations: generateSeatingRecommendations(completedAssignments),
        emailTemplates: generateEmailTemplates(completedAssignments)
      }
      
      setDay1Data(generatedDay1Data)
      
    } catch (error) {
      console.error('❌ Error loading Day 1 Kit data:', error)
      console.error('❌ Error details:', error.message, error.stack)
      
      // Fall back to demo data on error
      console.log('⚠️  Falling back to demo data due to error')
      const demoData = getDemoReportsData(teacher.id)
      setClassrooms(demoData.classrooms as any)
      setAssignments(demoData.assignments as any)
      
      // Generate demo Day 1 data
      const mockDay1Data = {
        classroom: {
          name: "Mrs. Demo's 3rd Grade",
          grade: "3rd Grade",
          studentCount: 24,
          profilesCompleted: 20,
          schoolStartDate: "2024-08-26",
          daysUntilStart: 2
        },
        learningStyleDistribution: {
          creative: 6,
          analytical: 4,
          collaborative: 7,
          confident: 3,
          balanced: 4
        },
        atRiskStudents: [
          {
            name: "Marcus Chen",
            issue: "May struggle with group work (strongly analytical)",
            solution: "Pair with Sofia for collaborative projects",
            avatar: "MC"
          },
          {
            name: "Aiden Wilson", 
            issue: "Needs independent work options (prefers solo)",
            solution: "Provide choice boards and extension activities",
            avatar: "AW"
          },
          {
            name: "Maya Patel",
            issue: "Building confidence for class participation",
            solution: "Start with small group sharing before whole class",
            avatar: "MP"
          }
        ],
        seatingRecommendations: [
          { student: "Emma Johnson", position: "Front left", reason: "Natural helper - good mentor position" },
          { student: "Sofia Rodriguez", position: "Center table", reason: "Social hub - connects all groups" },
          { student: "Marcus Chen", position: "Quiet corner", reason: "Needs focused environment" }
        ],
        emailTemplates: [
          {
            type: "Creative Learners",
            subject: "Your Creative Learner - Let's Build Amazing Things Together!",
            preview: "I'm so excited to share that [Child Name] shows incredible creative potential...",
            studentCount: 6
          },
          {
            type: "Analytical Learners", 
            subject: "Your Analytical Thinker - Ready for Deep Learning!",
            preview: "I want you to know that [Child Name] has remarkable analytical abilities...",
            studentCount: 4
          },
          {
            type: "Collaborative Learners",
            subject: "Your Team Player - Building Connections and Learning!",
            preview: "[Child Name] has such a gift for bringing people together and learning with others...",
            studentCount: 7
          }
        ]
      }
      
      setDay1Data(mockDay1Data)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-begin-cream">
        <header className="bg-white shadow-sm border-b border-begin-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <span className="text-2xl font-bold text-begin-blue">Day 1 Success Kit</span>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DelightfulLoading 
            type="teacher"
            size="lg"
            customMessages={[
              "📚 Analyzing your classroom insights...",
              "🎯 Identifying at-risk students...",
              "🪑 Optimizing seating arrangements...",
              "✉️ Preparing parent communication...",
              "🚀 Building your Day 1 success plan...",
              "🎆 Almost ready for the grand reveal!"
            ]}
          />
        </div>
      </div>
    )
  }

  // Don't render until we have data
  if (!day1Data) {
    return (
      <div className="min-h-screen bg-begin-cream">
        <header className="bg-white shadow-sm border-b border-begin-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <span className="text-2xl font-bold text-begin-blue">Day 1 Success Kit</span>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DelightfulLoading 
            type="teacher"
            size="lg"
            customMessages={[
              "📚 Analyzing your classroom insights...",
              "🎯 Identifying at-risk students...",
              "🪑 Optimizing seating arrangements...",
              "✉️ Preparing parent communication...",
              "🚀 Building your Day 1 success plan...",
              "🎆 Almost ready for the grand reveal!"
            ]}
          />
        </div>
      </div>
    )
  }

  const copyTemplate = (template: any) => {
    navigator.clipboard.writeText(template.preview)
    // TODO: Show toast notification
  }

  const printKit = () => {
    window.print()
  }

  const exportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting PDF...')
  }

  return (
    <div className="min-h-screen bg-begin-cream print:bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray print:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">Day 1 Success Kit</span>
                <p className="text-sm text-begin-blue/70">{day1Data.classroom.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 print:hidden">
              <button
                onClick={printKit}
                className="flex items-center gap-2 px-4 py-2 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print Kit
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <Link 
                href="/teacher/dashboard"
                className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Countdown Timer */}
      <div className="bg-gradient-to-r from-begin-teal to-begin-cyan text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="h-6 w-6" />
              <h2 className="text-heading-lg font-bold">48 Hours to Success</h2>
            </div>
            <div className="flex items-center justify-center gap-6 text-2xl font-bold">
              <div className="text-center">
                <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[4rem]">
                  {timeUntilSchool.days}
                </div>
                <div className="text-sm opacity-90 mt-1">Days</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[4rem]">
                  {timeUntilSchool.hours}
                </div>
                <div className="text-sm opacity-90 mt-1">Hours</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[4rem]">
                  {timeUntilSchool.minutes}
                </div>
                <div className="text-sm opacity-90 mt-1">Minutes</div>
              </div>
            </div>
            <p className="text-body opacity-90 mt-4">
              School starts {day1Data.classroom.schoolStartDate} - You're ready to make it amazing!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 print:hidden">
          <div className="border-b border-begin-gray">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Classroom Overview', icon: PieChart },
                { id: 'alerts', label: 'Early Alerts', icon: AlertTriangle },
                { id: 'seating', label: 'Seating Chart', icon: Layout },
                { id: 'emails', label: 'Parent Emails', icon: MessageSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-begin-teal text-begin-teal'
                      : 'border-transparent text-begin-blue/70 hover:text-begin-blue hover:border-begin-gray'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Classroom Overview Tab */}
        {(activeTab === 'overview' || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <div className="space-y-8 print:break-after-page">
            <div className="text-center print:mb-8">
              <h1 className="text-hero font-bold text-begin-blue mb-4">
                Welcome to Your Day 1 Success Kit!
              </h1>
              <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
                Walk into Day 1 knowing your class better than you've ever known a class by Halloween. 
                Here's everything you need for a successful school year launch.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-blue/80 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Students</p>
                    <p className="text-2xl font-bold">{day1Data.classroom.studentCount}</p>
                  </div>
                  <Users className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-teal/80 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Profiles Complete</p>
                    <p className="text-2xl font-bold">{day1Data.classroom.profilesCompleted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {day1Data.classroom.studentCount > 0 ? Math.round((day1Data.classroom.profilesCompleted / day1Data.classroom.studentCount) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="card-begin bg-gradient-to-br from-begin-cyan to-begin-cyan/80 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">At-Risk Alerts</p>
                    <p className="text-2xl font-bold">{day1Data.atRiskStudents.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 opacity-80" />
                </div>
              </div>
            </div>

            {/* Learning Style Distribution */}
            <div className="card-begin">
              <h2 className="text-heading-lg font-bold text-begin-blue mb-6 flex items-center gap-3">
                <PieChart className="h-6 w-6 text-begin-teal" />
                Learning Style Distribution
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Interactive Bar Chart */}
                <div className="space-y-6">
                  {Object.entries(day1Data.learningStyleDistribution).map(([style, count]) => {
                    const percentage = Math.round((count / Math.max(day1Data.classroom.studentCount, 1)) * 100)
                    const maxCount = Math.max(...Object.values(day1Data.learningStyleDistribution), 1)
                    const barWidth = (count / maxCount) * 100
                    
                    return (
                      <div key={style} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${
                              style === 'creative' ? 'bg-purple-500' :
                              style === 'analytical' ? 'bg-blue-500' :
                              style === 'collaborative' ? 'bg-green-500' :
                              style === 'confident' ? 'bg-orange-500' :
                              'bg-gray-500'
                            }`} />
                            <span className="font-medium text-begin-blue capitalize">{style} Learners</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-begin-blue">{count}</span>
                            <span className="text-sm text-begin-blue/70 bg-begin-cream px-2 py-1 rounded-full">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Animated Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              style === 'creative' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                              style === 'analytical' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                              style === 'collaborative' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                              style === 'confident' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        
                        {/* Student Count Dots */}
                        <div className="flex gap-1 flex-wrap">
                          {Array.from({ length: count }, (_, i) => (
                            <div 
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                style === 'creative' ? 'bg-purple-400' :
                                style === 'analytical' ? 'bg-blue-400' :
                                style === 'collaborative' ? 'bg-green-400' :
                                style === 'confident' ? 'bg-orange-400' :
                                'bg-gray-400'
                              }`}
                              style={{ 
                                animationDelay: `${i * 100}ms`,
                                animation: 'fadeIn 0.5s ease-in-out forwards'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="bg-begin-cream/30 rounded-lg p-6">
                  <h3 className="font-bold text-begin-blue mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-begin-teal" />
                    Key Insights & Action Items
                  </h3>
                  <div className="space-y-4">
                    {day1Data.learningStyleDistribution.collaborative > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Collaborative Focus ({Math.round((day1Data.learningStyleDistribution.collaborative / Math.max(day1Data.classroom.studentCount, 1)) * 100)}%)
                            </p>
                            <p className="text-xs text-green-700">Plan for group projects, peer partnerships, and discussion circles</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {day1Data.learningStyleDistribution.creative > 0 && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">✓</span>
                          <div>
                            <p className="text-sm font-medium text-purple-800">
                              Creative Contingent ({Math.round((day1Data.learningStyleDistribution.creative / Math.max(day1Data.classroom.studentCount, 1)) * 100)}%)
                            </p>
                            <p className="text-xs text-purple-700">Incorporate arts, hands-on projects, and creative expression</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {day1Data.learningStyleDistribution.analytical > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">✓</span>
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Analytical Learners ({Math.round((day1Data.learningStyleDistribution.analytical / Math.max(day1Data.classroom.studentCount, 1)) * 100)}%)
                            </p>
                            <p className="text-xs text-blue-700">Provide independent challenges and step-by-step processes</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {day1Data.learningStyleDistribution.confident > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">✓</span>
                          <div>
                            <p className="text-sm font-medium text-orange-800">
                              Confident Students ({Math.round((day1Data.learningStyleDistribution.confident / Math.max(day1Data.classroom.studentCount, 1)) * 100)}%)
                            </p>
                            <p className="text-xs text-orange-700">Offer leadership roles and presentation opportunities</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Teaching Style Match */}
            <div className="card-begin bg-gradient-to-br from-begin-teal/5 to-begin-cyan/5 border border-begin-teal/20">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-begin-teal" />
                Your Teaching Style Match
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-begin-teal/20">
                  <div className="text-2xl font-bold text-green-600 mb-1">Great Match</div>
                  <div className="text-sm text-gray-700">{Math.floor(day1Data.classroom.studentCount * 0.75)} students (75%)</div>
                  <div className="text-xs text-gray-600 mt-2">Your teaching style aligns well</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-1">Needs Adaptation</div>
                  <div className="text-sm text-gray-700">{Math.floor(day1Data.classroom.studentCount * 0.17)} students (17%)</div>
                  <div className="text-xs text-gray-600 mt-2">Require different approaches</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600 mb-1">Watch Closely</div>
                  <div className="text-sm text-gray-700">{day1Data.atRiskStudents.length} students</div>
                  <div className="text-xs text-gray-600 mt-2">May struggle without support</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Early Alerts Tab */}
        {(activeTab === 'alerts' || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <div className="space-y-8 print:break-after-page">
            <div className="text-center mb-8">
              <h2 className="text-hero font-bold text-begin-blue mb-4 flex items-center justify-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                Early Alert System
              </h2>
              <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
                Students who might struggle with your default teaching style - proactive strategies included
              </p>
            </div>

            <div className="space-y-6">
              {day1Data.atRiskStudents.length === 0 ? (
                <div className="card-begin text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-heading font-bold text-begin-blue mb-2">Great news!</h3>
                  <p className="text-begin-blue/70">
                    Based on the completed assessments, no students appear to be at high risk. 
                    Your teaching style seems well-matched to your current class composition.
                  </p>
                </div>
              ) : (
                day1Data.atRiskStudents.map((student, index) => (
                  <div key={index} className="card-begin border-l-4 border-orange-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-700">
                        {student.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-heading font-bold text-begin-blue">{student.name}</h3>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            Needs Attention
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-red-600 mb-1 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Potential Challenge
                            </h4>
                            <p className="text-sm text-begin-blue/80">{student.issue}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-green-600 mb-1 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Recommended Strategy
                            </h4>
                            <p className="text-sm text-begin-blue/80">{student.solution}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* General Strategies */}
            <div className="card-begin bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Universal Strategies for Success
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-700 mb-3">Week 1 Focus</h4>
                  <ul className="space-y-2 text-sm text-begin-blue/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Observe student preferences in different activities
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Try multiple grouping strategies
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Provide choice when possible
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-3">Long-term Success</h4>
                  <ul className="space-y-2 text-sm text-begin-blue/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Regular check-ins with flagged students
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Flexible grouping based on learning styles
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Celebrate different types of contributions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seating Chart Tab */}
        {(activeTab === 'seating' || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <div className="space-y-8 print:break-after-page">
            <div className="text-center mb-8">
              <h2 className="text-hero font-bold text-begin-blue mb-4 flex items-center justify-center gap-3">
                <Layout className="h-8 w-8 text-begin-teal" />
                Optimized Seating Chart
              </h2>
              <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
                Strategic seating based on collaboration styles and learning preferences
              </p>
            </div>

            {/* Key Seating Strategies */}
            <div className="card-begin">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-begin-teal" />
                Strategic Placement Notes
              </h3>
              <div className="space-y-4">
                {day1Data.seatingRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Layout className="h-12 w-12 text-begin-gray mx-auto mb-3" />
                    <p className="text-begin-blue/70">
                      Seating recommendations will appear here once more assessments are completed.
                    </p>
                  </div>
                ) : (
                  day1Data.seatingRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-begin-cream/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-begin-blue">{rec.student}</span>
                        <span className="text-begin-blue/70"> → {rec.position}</span>
                        <p className="text-sm text-begin-blue/80 mt-1">{rec.reason}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Parent Emails Tab */}
        {(activeTab === 'emails' || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-hero font-bold text-begin-blue mb-4 flex items-center justify-center gap-3">
                <MessageSquare className="h-8 w-8 text-begin-teal" />
                Parent Communication Templates
              </h2>
              <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
                Pre-written emails showing parents you understand their child's unique learning style
              </p>
            </div>

            <div className="space-y-6">
              {day1Data.emailTemplates.length === 0 ? (
                <div className="card-begin text-center py-12">
                  <MessageSquare className="h-16 w-16 text-begin-gray mx-auto mb-4" />
                  <h3 className="text-heading font-semibold text-begin-blue mb-2">Email templates coming soon</h3>
                  <p className="text-begin-blue/70">
                    Templates will be generated once more learning style assessments are completed.
                  </p>
                </div>
              ) : (
                day1Data.emailTemplates.map((template, index) => (
                  <div key={index} className="card-begin">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-heading font-bold text-begin-blue">{template.type}</h3>
                        <p className="text-sm text-begin-blue/70">{template.studentCount} students in your class</p>
                      </div>
                      <div className="flex gap-2 print:hidden">
                        <button
                          onClick={() => copyTemplate(template)}
                          className="flex items-center gap-2 px-3 py-2 text-begin-teal hover:bg-begin-teal/10 rounded-card transition-colors text-sm"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </button>
                        <button
                          onClick={() => setSelectedTemplate(selectedTemplate === index ? null : index)}
                          className="flex items-center gap-2 px-3 py-2 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          {selectedTemplate === index ? 'Hide' : 'Preview'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-begin-cream/30 p-4 rounded-lg mb-4">
                      <div className="text-sm text-begin-blue/70 mb-1">Subject:</div>
                      <div className="font-medium text-begin-blue">{template.subject}</div>
                    </div>
                    
                    <div className="text-sm text-begin-blue/80 italic">
                      {template.preview}...
                    </div>

                    {selectedTemplate === index && (
                      <div className="mt-4 p-4 bg-white border border-begin-gray rounded-lg">
                        <div className="space-y-4 text-sm text-begin-blue/80">
                          <p>Dear [Parent Name],</p>
                          <p>
                            I'm so excited to share that [Child Name] shows incredible {template.type.toLowerCase().replace(' learners', '')} potential, 
                            and I want you to know how I plan to support their unique learning style this year.
                          </p>
                          <p>
                            Based on their learning profile, I can see that [Child Name] {
                              template.type.includes('Creative') ? 'thrives when they can express ideas through art, storytelling, and hands-on projects. I\'ll be incorporating plenty of creative opportunities into our daily learning.' :
                              template.type.includes('Analytical') ? 'loves to dig deep into concepts and ask "why" and "how" questions. I\'ll provide challenging extensions and research opportunities to feed their curiosity.' :
                              template.type.includes('Confident') ? 'shows natural leadership abilities and isn\'t afraid to take on challenges. I\'ll provide opportunities for them to shine and support their classmates.' :
                              'learns best through collaboration and discussion with peers. I\'ll create many opportunities for group work and peer teaching.'
                            }
                          </p>
                          <p>
                            I'm committed to helping [Child Name] not just succeed academically, but truly thrive as a learner. 
                            Please don't hesitate to reach out if you have any questions or insights about how [Child Name] learns best at home.
                          </p>
                          <p>
                            Looking forward to a wonderful year together!
                          </p>
                          <p>
                            Warm regards,<br />
                            [Your Name]
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Send Options */}
            <div className="card-begin bg-gradient-to-br from-begin-teal/5 to-begin-cyan/5 border border-begin-teal/20 print:hidden">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-begin-teal" />
                Quick Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link 
                  href="/teacher/send-assessment"
                  className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <Mail className="h-5 w-5 text-begin-teal" />
                  <div>
                    <div className="font-medium text-begin-blue">Send to All Parents</div>
                    <div className="text-sm text-begin-blue/70">Batch email all templates</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-begin-blue/50 ml-auto" />
                </Link>
                
                <button className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <Calendar className="h-5 w-5 text-begin-teal" />
                  <div className="text-left">
                    <div className="font-medium text-begin-blue">Schedule Emails</div>
                    <div className="text-sm text-begin-blue/70">Send day before school</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-begin-blue/50 ml-auto" />
                </button>

                <button className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <RefreshCw className="h-5 w-5 text-begin-teal" />
                  <div className="text-left">
                    <div className="font-medium text-begin-blue">Customize Templates</div>
                    <div className="text-sm text-begin-blue/70">Add personal touches</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-begin-blue/50 ml-auto" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Begin Content Recommendations Section */}
        {(() => {
          const completedAssignments = assignments.filter(a => a.status === 'completed' && a.assessment_results)
          
          if (completedAssignments.length === 0) return null
          
          return (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-begin-blue mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-begin-teal" />
                  Personalized Learning Content
                </h2>
                <p className="text-begin-blue/70">
                  Real Begin app activities tailored to each student's learning profile
                </p>
              </div>
              
              {completedAssignments.slice(0, 3).map((assignment, index) => {
                const learningProfile = assignment.assessment_results
                if (!learningProfile || !learningProfile.personality_label) return null
                
                return (
                  <div key={assignment.id} className="card-begin p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-begin-blue mb-1">
                        {assignment.child_name || assignment.student_name || `Student ${index + 1}`}
                      </h3>
                      <p className="text-sm text-begin-blue/70">
                        {learningProfile.personality_label} Learning Profile
                      </p>
                    </div>
                    
                    <ContentRecommendationsWrapper 
                      learningProfile={learningProfile}
                      studentName={assignment.child_name || assignment.student_name || `Student ${index + 1}`}
                    />
                  </div>
                )
              })}
              
              {completedAssignments.length > 3 && (
                <div className="card-begin bg-gradient-to-r from-purple-50 to-blue-50 text-center py-8">
                  <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-bold text-begin-blue mb-2">
                    Content for All {completedAssignments.length} Students
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Personalized Begin content recommendations available for your entire class
                  </p>
                  <Link
                    href="/teacher/student-cards"
                    className="btn-begin-primary inline-flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    View All Student Content
                  </Link>
                </div>
              )}
            </div>
          )
        })()}

        {/* Success Promise */}
        <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-teal text-white text-center py-12 print:break-before-page">
          <Star className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-hero font-bold mb-4">Your Day 1 Success Promise</h2>
          <p className="text-body-lg max-w-3xl mx-auto mb-8 opacity-90">
            "I walk into Day 1 knowing my class better than I've ever known a class by Halloween. 
            Every student feels seen, understood, and set up for success from the very first moment."
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <UserCheck className="h-8 w-8 mx-auto mb-3 opacity-90" />
              <div className="font-bold mb-2">Every Student Known</div>
              <div className="opacity-80">Learning styles, preferences, and needs identified</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Target className="h-8 w-8 mx-auto mb-3 opacity-90" />
              <div className="font-bold mb-2">Proactive Strategies</div>
              <div className="opacity-80">Potential challenges identified with solutions ready</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-90" />
              <div className="font-bold mb-2">Parent Partnership</div>
              <div className="opacity-80">Families know you understand their child</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Day1KitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading Day 1 Success Kit...</p>
        </div>
      </div>
    }>
      <Day1KitContent />
    </Suspense>
  )
}