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
  Zap
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'
import type { Classroom, ProfileAssignment } from '@/lib/supabase'
import DelightfulLoading from '@/components/loading/DelightfulLoading'
import { getDemoReportsData } from '@/lib/demo-data'
import { SAMPLE_PROFILES, getSampleProfile } from '@/lib/sample-profiles'

// Mock Day 1 Kit Data - this would come from actual classroom data
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

function Day1KitContent() {
  const { teacher, loading: authLoading, isAuthenticated } = useTeacherAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'seating' | 'emails'>('overview')
  const [showSeatingHelp, setShowSeatingHelp] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [timeUntilSchool, setTimeUntilSchool] = useState({ days: 2, hours: 14, minutes: 23 })
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/teacher/register')
      return
    }

    if (teacher) {
      setLoading(false)
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
                <p className="text-sm text-begin-blue/70">{mockDay1Data.classroom.name}</p>
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
              School starts {mockDay1Data.classroom.schoolStartDate} - You're ready to make it amazing!
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
                    <p className="text-2xl font-bold">{mockDay1Data.classroom.studentCount}</p>
                  </div>
                  <Users className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-teal/80 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Profiles Complete</p>
                    <p className="text-2xl font-bold">{mockDay1Data.classroom.profilesCompleted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round((mockDay1Data.classroom.profilesCompleted / mockDay1Data.classroom.studentCount) * 100)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="card-begin bg-gradient-to-br from-begin-cyan to-begin-cyan/80 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">At-Risk Alerts</p>
                    <p className="text-2xl font-bold">{mockDay1Data.atRiskStudents.length}</p>
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
                <div className="space-y-4">
                  {Object.entries(mockDay1Data.learningStyleDistribution).map(([style, count]) => (
                    <div key={style} className="flex items-center justify-between p-4 bg-begin-cream/50 rounded-lg">
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
                        <span className="text-2xl font-bold text-begin-blue">{count}</span>
                        <span className="text-sm text-begin-blue/70">students</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-begin-cream/30 rounded-lg p-6">
                  <h3 className="font-bold text-begin-blue mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-begin-teal" />
                    Key Insights
                  </h3>
                  <div className="space-y-3 text-sm text-begin-blue/80">
                    <p>• Your class leans heavily collaborative (29%) - plan for lots of group work</p>
                    <p>• Strong creative contingent (25%) - incorporate arts and hands-on projects</p>
                    <p>• Analytical learners (17%) will need independent challenges</p>
                    <p>• Balance whole-class and small-group instruction</p>
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
                  <div className="text-sm text-gray-700">18 students (75%)</div>
                  <div className="text-xs text-gray-600 mt-2">Your collaborative teaching style aligns well</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-1">Needs Adaptation</div>
                  <div className="text-sm text-gray-700">4 students (17%)</div>
                  <div className="text-xs text-gray-600 mt-2">Require different approaches</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600 mb-1">Watch Closely</div>
                  <div className="text-sm text-gray-700">2 students (8%)</div>
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
              {mockDay1Data.atRiskStudents.map((student, index) => (
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
              ))}
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

            {/* Seating Chart Visualization */}
            <div className="card-begin">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-heading font-bold text-begin-blue">Recommended Layout</h3>
                <button
                  onClick={() => setShowSeatingHelp(!showSeatingHelp)}
                  className="flex items-center gap-2 text-begin-teal hover:text-begin-teal-hover text-sm print:hidden"
                >
                  {showSeatingHelp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showSeatingHelp ? 'Hide' : 'Show'} Legend
                </button>
              </div>

              {showSeatingHelp && (
                <div className="mb-6 p-4 bg-begin-cream/50 rounded-lg print:hidden">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-200 rounded"></div>
                      <span>Creative</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-200 rounded"></div>
                      <span>Analytical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-200 rounded"></div>
                      <span>Collaborative</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-200 rounded"></div>
                      <span>Confident</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Simple Seating Grid */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center mb-4 p-2 bg-begin-blue text-white rounded font-medium">
                  Teacher's Desk
                </div>
                <div className="grid grid-cols-6 gap-3 max-w-4xl mx-auto">
                  {[
                    { name: "Emma J", type: "creative", pos: "Front helper" },
                    { name: "Sofia R", type: "collaborative", pos: "Social hub" },
                    { name: "Marcus C", type: "analytical", pos: "Quiet focus" },
                    { name: "Zara K", type: "confident", pos: "Leadership" },
                    { name: "Aiden W", type: "analytical", pos: "Independent" },
                    { name: "Maya P", type: "collaborative", pos: "Support" },
                    { name: "Diego M", type: "confident", pos: "Facilitator" },
                    { name: "Kai T", type: "creative", pos: "Innovation" },
                    { name: "Alex B", type: "collaborative", pos: "Team player" },
                    { name: "Sam L", type: "analytical", pos: "Detail focus" },
                    { name: "Riley N", type: "creative", pos: "Art corner" },
                    { name: "Jordan P", type: "confident", pos: "Presenter" },
                    { name: "Casey D", type: "collaborative", pos: "Connector" },
                    { name: "Morgan F", type: "analytical", pos: "Research" },
                    { name: "Taylor H", type: "creative", pos: "Project lead" },
                    { name: "Avery S", type: "confident", pos: "Motivator" },
                    { name: "Quinn R", type: "collaborative", pos: "Mediator" },
                    { name: "Blake W", type: "analytical", pos: "Problem solver" },
                    { name: "River C", type: "creative", pos: "Storyteller" },
                    { name: "Sage M", type: "confident", pos: "Encourager" },
                    { name: "Drew K", type: "collaborative", pos: "Helper" },
                    { name: "Rowan T", type: "analytical", pos: "Researcher" },
                    { name: "Finley L", type: "creative", pos: "Designer" },
                    { name: "Parker V", type: "confident", pos: "Leader" }
                  ].map((student, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-xs text-center font-medium ${
                        student.type === 'creative' ? 'bg-purple-200 text-purple-800' :
                        student.type === 'analytical' ? 'bg-blue-200 text-blue-800' :
                        student.type === 'collaborative' ? 'bg-green-200 text-green-800' :
                        'bg-orange-200 text-orange-800'
                      }`}
                    >
                      <div className="font-bold">{student.name}</div>
                      <div className="text-xs opacity-75">{student.pos}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Seating Strategies */}
            <div className="card-begin">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-begin-teal" />
                Strategic Placement Notes
              </h3>
              <div className="space-y-4">
                {mockDay1Data.seatingRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-begin-cream/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-begin-blue">{rec.student}</span>
                      <span className="text-begin-blue/70"> → {rec.position}</span>
                      <p className="text-sm text-begin-blue/80 mt-1">{rec.reason}</p>
                    </div>
                  </div>
                ))}
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
              {mockDay1Data.emailTemplates.map((template, index) => (
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
              ))}
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