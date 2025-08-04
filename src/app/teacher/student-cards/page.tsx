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
import { useTeacherAuth } from '@/lib/teacher-auth'
import AuthRequired from '@/components/teacher/AuthRequired'
import StudentCard from '@/components/teacher/StudentCard'
import { generateStudentCardData } from '@/lib/student-card-data'

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
  assessment_results?: {
    id: number
    personality_label: string
    scores: Record<string, number>
    grade_level: string
  }
}

function StudentCardsContent() {
  const { teacher } = useTeacherAuth()
  const [studentCards, setStudentCards] = useState<StudentCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStyle, setFilterStyle] = useState<string>('all')
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
      // For demo purposes, we'll generate realistic sample data
      // In production, this would fetch from your API/database
      const sampleCards = generateStudentCardData()
      
      // Simulate a brief loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setStudentCards(sampleCards)
    } catch (error) {
      console.error('Error loading student cards:', error)
      // You could add error state handling here
    } finally {
      setLoading(false)
    }
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
          <div className="mt-12 grid md:grid-cols-2 gap-6 print:hidden">
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