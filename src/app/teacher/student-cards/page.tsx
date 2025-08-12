'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Eye,
  Download,
  Users,
  Search,
  Filter,
  Grid3X3,
  List,
  Printer,
  Mail,
  NotebookPen,
  AlertTriangle,
  Zap,
  Star,
  MessageCircle,
  Target,
  Heart
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/auth/hooks'
import AuthenticatedHeader from '@/components/auth/AuthenticatedHeader'
import { DemoDataBanner, DemoDataWrapper } from '@/components/ui/DemoDataIndicator'
import { getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'
import type { Classroom, ProfileAssignment } from '@/lib/supabase'
import { AuthGuard } from '@/lib/auth/hooks'
import StudentCard from '@/components/teacher/StudentCard'
import { generateStudentCardData } from '@/lib/student-card-data'
import { getDemoReportsData } from '@/lib/demo-data'
import { seedRealDataForSuraj } from '@/lib/seed-real-data'
import { INTEREST_OPTIONS, ENGAGEMENT_OPTIONS, MODALITY_OPTIONS, SOCIAL_OPTIONS } from '@/lib/questions'

// Helper function to extract motivators, interests, and school experience from raw responses
function extractStudentAdditionalData(rawResponses: Record<string, any>) {
  if (!rawResponses) return {
    interests: [],
    engagementStyle: null,
    learningModality: null,
    socialPreference: null,
    schoolExperience: null
  }
  
  // Helper function to convert response to text
  const getResponseText = (questionId: string, response: any, options?: readonly string[]) => {
    if (!response && response !== 0) return null
    
    if (Array.isArray(response)) {
      // For interests (checkboxes) - could be array of strings or indices
      return response.map(item => {
        if (typeof item === 'string') return item
        if (typeof item === 'number' && options) return options[item]
        return item
      }).filter(Boolean)
    }
    
    if (typeof response === 'string') return response
    if (typeof response === 'number' && options) return options[response]
    
    return response
  }
  
  // School experience options
  const SCHOOL_EXPERIENCE_OPTIONS = [
    "This is their first time in a structured learning environment",
    "They've been in daycare/preschool for less than 6 months", 
    "They've been in daycare/preschool for 6 months to 1 year",
    "They've been in daycare/preschool for 1-2 years",
    "They've been in daycare/preschool for 2+ years and are comfortable with school routines"
  ]
  
  const extractedData = {
    interests: getResponseText('22', rawResponses['22'], INTEREST_OPTIONS) || [],
    engagementStyle: getResponseText('23', rawResponses['23'], ENGAGEMENT_OPTIONS),
    learningModality: getResponseText('24', rawResponses['24'], MODALITY_OPTIONS),
    socialPreference: getResponseText('25', rawResponses['25'], SOCIAL_OPTIONS),
    schoolExperience: getResponseText('26', rawResponses['26'], SCHOOL_EXPERIENCE_OPTIONS)
  }
  
  // Ensure interests is always an array
  if (!Array.isArray(extractedData.interests)) {
    extractedData.interests = []
  }
  
  return extractedData
}

interface StudentCardData {
  id: number
  child_name: string
  parent_email: string
  learning_style: 'Creative' | 'Analytical' | 'Collaborative' | 'Confident'
  avatar_url?: string
  strengths: string[]
  challenges: string[]
  quick_wins: string[]
  parent_insight: string
  emergency_backup: string
  interests?: string[]
  engagementStyle?: string
  learningModality?: string
  socialPreference?: string
  schoolExperience?: string
  assessment_results?: {
    id: number
    personality_label: string
    scores: Record<string, number>
    grade_level: string
    raw_responses?: Record<string, any>
  }
}

function StudentCardsContent() {
  const { teacher } = useTeacherAuth()
  const [studentCards, setStudentCards] = useState<StudentCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStyle, setFilterStyle] = useState<string>('all')
  const [sectionFilter, setSectionFilter] = useState<string>('all')
  const [selectedCard, setSelectedCard] = useState<StudentCardData | null>(null)
  
  const searchParams = useSearchParams()

  useEffect(() => {
    if (teacher) {
      loadStudentCards()
    }
  }, [teacher])

  const loadStudentCards = async () => {
    if (!teacher) return

    try {
      const [classroomsData, assignmentsData] = await Promise.all([
        getTeacherClassrooms(teacher.id),
        getTeacherAssignments(teacher.id)
      ])
      
      let finalAssignments = assignmentsData || []
      
      // If no live data available, create real data for suraj+1 or fall back to demo data
      if (finalAssignments.length === 0) {
        if (teacher.email === 'suraj+1@speakaboos.com' || teacher.id === 1001) {
          console.log('Creating real student data for suraj+1@speakaboos.com in student cards')
          try {
            await seedRealDataForSuraj()
            // Refetch data after seeding
            const newAssignmentsData = await getTeacherAssignments(teacher.id)
            finalAssignments = newAssignmentsData || []
            console.log('Refetched assignments after seeding:', finalAssignments.length)
          } catch (error) {
            console.error('Failed to seed real data, falling back to demo:', error)
            const demoData = getDemoReportsData(teacher.id)
            finalAssignments = demoData.assignments as any
          }
        } else {
          const demoData = getDemoReportsData(teacher.id)
          finalAssignments = demoData.assignments as any
        }
      }
      
      // Convert assignments to student card format
      const completedAssignments = finalAssignments.filter(a => a.status === 'completed')
      
      if (completedAssignments.length > 0) {
        // Use actual assessment data to create student cards
        const actualCards = completedAssignments.map((assignment, index) => {
          const assessmentResults = assignment.assessment_results
          const additionalData = extractStudentAdditionalData(assessmentResults?.raw_responses)
          
          // Determine learning style from personality label
          let learningStyle = 'Creative' as const
          if (assessmentResults?.personality_label) {
            const label = assessmentResults.personality_label.toLowerCase()
            if (label.includes('analytical')) learningStyle = 'Analytical'
            else if (label.includes('collaborative')) learningStyle = 'Collaborative' 
            else if (label.includes('confident')) learningStyle = 'Confident'
          }
          
          return {
            id: assignment.id,
            child_name: assignment.child_name,
            parent_email: assignment.parent_email,
            learning_style: learningStyle,
            strengths: getStrengthsForStyle(learningStyle),
            challenges: getChallengesForStyle(learningStyle),
            quick_wins: getQuickWinsForStyle(learningStyle),
            parent_insight: getParentInsightForStyle(learningStyle),
            emergency_backup: getEmergencyPlanForStyle(learningStyle),
            assessment_results: assessmentResults,
            interests: Array.isArray(additionalData.interests) ? additionalData.interests : [],
            engagementStyle: additionalData.engagementStyle,
            learningModality: additionalData.learningModality,
            socialPreference: additionalData.socialPreference,
            schoolExperience: additionalData.schoolExperience
          }
        })
        
        setStudentCards(actualCards)
      } else {
        // Fall back to generated sample data if no assessments completed
        const sampleCards = generateStudentCardData()
        setStudentCards(sampleCards)
      }
      
    } catch (error) {
      console.error('Error loading student cards:', error)
      
      // Fall back to sample data on error
      const sampleCards = generateStudentCardData()
      setStudentCards(sampleCards)
    } finally {
      setLoading(false)
    }
  }
  
  // Helper functions to get content based on learning style
  const getStrengthsForStyle = (style: string) => {
    const strengths = {
      Creative: [
        "Generates unique solutions to problems",
        "Expresses ideas through art, stories, and imagination", 
        "Thinks outside the box during brainstorming"
      ],
      Analytical: [
        "Breaks down complex problems into manageable steps",
        "Identifies patterns and logical sequences",
        "Uses data and evidence to support conclusions"
      ],
      Collaborative: [
        "Facilitates group discussions and keeps teams on task",
        "Listens actively and incorporates others' ideas",
        "Creates inclusive environments where everyone contributes"
      ],
      Confident: [
        "Volunteers to lead group projects and presentations",
        "Tries new challenges without fear of making mistakes",
        "Takes initiative on classroom activities and discussions"
      ]
    }
    return strengths[style] || strengths.Creative
  }
  
  const getChallengesForStyle = (style: string) => {
    const challenges = {
      Creative: ["May struggle with rigid timelines and detailed instructions", "Might resist structured activities with only one right answer"],
      Analytical: ["May become overwhelmed by open-ended creative tasks", "Might struggle when asked to make quick decisions"],
      Collaborative: ["May feel anxious or less productive during independent work", "Might talk too much during quiet work time"],
      Confident: ["May appear overconfident or dominate group discussions", "Might take on too much responsibility and become overwhelmed"]
    }
    return challenges[style] || challenges.Creative
  }
  
  const getQuickWinsForStyle = (style: string) => {
    const quickWins = {
      Creative: ["Let them illustrate their answers or create visual representations", "Offer choice in how they demonstrate their learning", "Use storytelling to introduce new concepts"],
      Analytical: ["Provide clear, step-by-step instructions and rubrics", "Use graphic organizers and structured note-taking templates", "Explain the 'why' behind rules and procedures"],
      Collaborative: ["Use think-pair-share and small group activities", "Assign roles that utilize their social leadership skills", "Create opportunities for peer teaching and mentoring"],
      Confident: ["Give them leadership roles and special responsibilities", "Offer challenging extension activities when they finish early", "Let them present to the class or younger students"]
    }
    return quickWins[style] || quickWins.Creative
  }
  
  const getParentInsightForStyle = (style: string) => {
    const insights = {
      Creative: "At home, they come up with the most creative games and stories. They need time to think and explore ideas before being asked for the 'right' answer.",
      Analytical: "They ask 'why' about everything and love to understand how things work. They need clear explanations and time to process new information.",
      Collaborative: "They are always organizing activities with friends. They learn best when they can talk through ideas with others.",
      Confident: "They take on leadership roles naturally and aren't afraid to try new things. They need challenges to stay engaged."
    }
    return insights[style] || insights.Creative
  }
  
  const getEmergencyPlanForStyle = (style: string) => {
    const plans = {
      Creative: "Offer a creative alternative - 'How could you show this in a different way?'",
      Analytical: "Break the task into smaller, numbered steps",
      Collaborative: "Move them near a supportive peer or create a quick partnership",
      Confident: "Give them a special challenge or extension task"
    }
    return plans[style] || plans.Creative
  }

  const filteredCards = studentCards.filter(card => {
    const matchesSearch = card.child_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.learning_style.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStyle === 'all' || card.learning_style === filterStyle
    return matchesSearch && matchesFilter
  })

  const handlePrintAll = () => {
    window.print()
  }

  const handlePrintCard = (card: StudentCardData) => {
    setSelectedCard(card)
    setTimeout(() => window.print(), 100)
  }

  const handleEmailParent = (card: StudentCardData) => {
    const subject = `Learning Profile Insights for ${card.child_name}`
    const body = `Dear Parent,\n\nI wanted to share some insights about ${card.child_name}'s learning style and how we can best support them in the classroom.\n\nBest regards,\n${teacher?.name}`
    window.open(`mailto:${card.parent_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Parent Email', 'Learning Style', 'Grade', 'Top Strength', 'Top Challenge', 'Quick Win Strategy', 'Parent Insight']
    const csvData = filteredCards.map(card => [
      card.child_name,
      card.parent_email,
      card.learning_style,
      card.assessment_results?.grade_level || 'N/A',
      card.strengths[0] || '',
      card.challenges[0] || '',
      card.quick_wins[0] || '',
      `"${card.parent_insight.replace(/"/g, '""')}"`
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `student-reference-cards-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-begin-cream flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-begin-teal mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="h-8 w-8 text-begin-teal/50" />
              </div>
            </div>
            <h3 className="text-heading font-semibold text-begin-blue mb-2">Loading Student Reference Cards</h3>
            <p className="text-begin-blue/70">Gathering personalized teaching insights...</p>
          </div>
        </div>
      </AuthRequired>
    )
  }

  const learningStyleColors = {
    Creative: 'blue',
    Analytical: 'green', 
    Collaborative: 'purple',
    Confident: 'orange'
  }

  const learningStyleStats = studentCards.reduce((acc, card) => {
    acc[card.learning_style] = (acc[card.learning_style] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <AuthRequired>
      <div className="min-h-screen bg-begin-cream print:bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-begin-gray print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-begin-teal to-begin-cyan rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-begin-blue">Student Reference Cards</span>
                  <p className="text-sm text-begin-blue/70">Instant access to learning style insights</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="btn-begin-secondary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={handlePrintAll}
                  className="btn-begin-secondary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print All Cards
                </button>
                <Link 
                  href="/teacher/dashboard"
                  className="flex items-center gap-2 text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-4">
          {/* Quick Stats - Hidden in Print */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:hidden">
            {Object.entries(learningStyleStats).map(([style, count]) => {
              const colors = {
                Creative: 'from-blue-500 to-blue-600',
                Analytical: 'from-green-500 to-green-600', 
                Collaborative: 'from-purple-500 to-purple-600',
                Confident: 'from-orange-500 to-orange-600'
              }
              return (
                <div key={style} className={`card-begin bg-gradient-to-br ${colors[style as keyof typeof colors]} text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">{style}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      {style === 'Creative' && <Zap className="h-4 w-4" />}
                      {style === 'Analytical' && <Target className="h-4 w-4" />}
                      {style === 'Collaborative' && <Users className="h-4 w-4" />}
                      {style === 'Confident' && <Star className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Search and Filter Controls - Hidden in Print */}
          <div className="card-begin mb-8 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-begin-blue/50 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search students or learning styles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-begin-gray rounded-card focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-begin-blue/70" />
                  <select
                    value={filterStyle}
                    onChange={(e) => setFilterStyle(e.target.value)}
                    className="border border-begin-gray rounded-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                  >
                    <option value="all">All Styles</option>
                    <option value="Creative">Creative</option>
                    <option value="Analytical">Analytical</option>
                    <option value="Collaborative">Collaborative</option>
                    <option value="Confident">Confident</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-begin-blue/70" />
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="border border-begin-gray rounded-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                  >
                    <option value="all">Show All Sections</option>
                    <option value="strengths">Strengths Only</option>
                    <option value="quick-wins">Quick Wins Only</option>
                    <option value="interests">Interests Only</option>
                    <option value="challenges">Challenges Only</option>
                    <option value="learning-prefs">Learning Preferences Only</option>
                    <option value="emergency">Emergency Plans Only</option>
                  </select>
                </div>
                
                <div className="flex items-center bg-begin-gray rounded-card p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid3X3 className="h-4 w-4 text-begin-blue" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="h-4 w-4 text-begin-blue" />
                  </button>
                </div>
              </div>
            </div>

            {filteredCards.length !== studentCards.length && (
              <div className="mt-4 p-3 bg-begin-cyan/10 border border-begin-cyan/20 rounded-card">
                <p className="text-sm text-begin-blue">
                  Showing {filteredCards.length} of {studentCards.length} students
                  {searchTerm && ` matching "${searchTerm}"`}
                  {filterStyle !== 'all' && ` with ${filterStyle} learning style`}
                  {sectionFilter !== 'all' && ` showing ${sectionFilter.replace('-', ' ')} only`}
                </p>
              </div>
            )}
          </div>

          {/* Cards Display */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 print:hidden">
              <Users className="h-16 w-16 text-begin-gray mx-auto mb-4" />
              <h3 className="text-heading font-semibold text-begin-blue mb-2">No cards found</h3>
              <p className="text-begin-blue/70 mb-4">
                {searchTerm || filterStyle !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Student cards will appear here once assessments are completed'
                }
              </p>
              {(!searchTerm && filterStyle === 'all') && (
                <Link
                  href="/teacher/send-assessment"
                  className="btn-begin-primary inline-flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Assessment Links
                </Link>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:gap-4">
                  {filteredCards.map((card) => (
                    <StudentCard
                      key={card.id}
                      card={card}
                      onPrint={() => handlePrintCard(card)}
                      onEmailParent={() => handleEmailParent(card)}
                      sectionFilter={sectionFilter}
                    />
                  ))}
                </div>
              ) : (
                <div className="card-begin print:shadow-none print:border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-begin-gray">
                          <th className="text-left py-3 px-4 font-semibold text-begin-blue">Student</th>
                          <th className="text-left py-3 px-4 font-semibold text-begin-blue">Learning Style</th>
                          <th className="text-left py-3 px-4 font-semibold text-begin-blue">Top Strength</th>
                          <th className="text-left py-3 px-4 font-semibold text-begin-blue">Quick Win</th>
                          <th className="text-right py-3 px-4 font-semibold text-begin-blue print:hidden">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCards.map((card) => (
                          <tr key={card.id} className="border-b border-begin-gray/50 hover:bg-begin-cream/30">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-begin-blue">{card.child_name}</p>
                                <p className="text-sm text-begin-blue/60">{card.parent_email}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  card.learning_style === 'Creative' ? 'bg-blue-500' :
                                  card.learning_style === 'Analytical' ? 'bg-green-500' :
                                  card.learning_style === 'Collaborative' ? 'bg-purple-500' :
                                  'bg-orange-500'
                                }`}></div>
                                <span className="font-medium text-begin-blue">{card.learning_style}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-begin-blue text-sm">{card.strengths[0]}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-begin-blue text-sm">{card.quick_wins[0]}</span>
                            </td>
                            <td className="py-4 px-4 print:hidden">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/teacher/student-cards/${card.id}`}
                                  className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors"
                                  title="View Full Card"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handlePrintCard(card)}
                                  className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors"
                                  title="Print Card"
                                >
                                  <Printer className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEmailParent(card)}
                                  className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors"
                                  title="Email Parent"
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Teacher Tips - Hidden in Print */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 print:hidden">
            <div className="card-begin bg-begin-teal/5 border border-begin-teal/20">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-begin-teal" />
                Using Reference Cards Effectively
              </h3>
              <div className="space-y-3 text-sm text-begin-blue/80">
                <p>• Keep cards handy during instruction for quick strategy reference</p>
                <p>• Use "Quick Wins" when a student seems disengaged or frustrated</p>
                <p>• Reference "Emergency Backup" plans during challenging moments</p>
                <p>• Share parent insights during parent-teacher conferences</p>
                <p>• Print individual cards for substitute teachers</p>
              </div>
            </div>

            <div className="card-begin bg-begin-cyan/5 border border-begin-cyan/20">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-begin-cyan" />
                Pro Teaching Tips
              </h3>
              <div className="space-y-3 text-sm text-begin-blue/80">
                <p>• Laminate cards for durability and frequent reference</p>
                <p>• Keep a "struggling student" stack for immediate intervention</p>
                <p>• Use cards to form balanced learning groups</p>
                <p>• Reference during lesson planning for differentiation</p>
                <p>• Update notes as you discover what works</p>
              </div>
            </div>

            <div className="card-begin bg-purple-50 border border-purple-200">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Section Filtering
              </h3>
              <div className="space-y-3 text-sm text-begin-blue/80">
                <p>• <strong>Strengths Only:</strong> Quick class overview of what each student does well</p>
                <p>• <strong>Quick Wins:</strong> Fast strategies when students need immediate support</p>
                <p>• <strong>Interests:</strong> Engagement hooks for lesson planning</p>
                <p>• <strong>Challenges:</strong> Potential roadblocks to watch for</p>
                <p>• <strong>Emergency Plans:</strong> Crisis intervention strategies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}

export default function StudentCardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading student cards...</p>
        </div>
      </div>
    }>
      <StudentCardsContent />
    </Suspense>
  )
}