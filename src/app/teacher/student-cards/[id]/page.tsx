'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Printer,
  Mail,
  Download,
  Edit
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import AuthRequired from '@/components/teacher/AuthRequired'
import StudentCard from '@/components/teacher/StudentCard'
import { generateStudentCardData, StudentCardData } from '@/lib/student-card-data'

export default function SingleStudentCardPage() {
  const { teacher } = useTeacherAuth()
  const params = useParams()
  const router = useRouter()
  const [card, setCard] = useState<StudentCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (teacher && params.id) {
      loadStudentCard()
    }
  }, [teacher, params.id])

  const loadStudentCard = async () => {
    try {
      // For demo purposes, generate the data and find the specific card
      const allCards = generateStudentCardData()
      const foundCard = allCards.find(c => c.id.toString() === params.id)
      
      if (foundCard) {
        setCard(foundCard)
        // Load any saved notes for this student
        const savedNotes = localStorage.getItem(`student_notes_${foundCard.id}`)
        if (savedNotes) {
          setNotes(savedNotes)
        }
      } else {
        router.push('/teacher/student-cards')
      }
    } catch (error) {
      console.error('Error loading student card:', error)
      router.push('/teacher/student-cards')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEmailParent = () => {
    if (!card) return
    const subject = `Learning Profile Insights for ${card.child_name}`
    const body = `Dear Parent,\n\nI wanted to share some insights about ${card.child_name}'s learning style and how we can best support them in the classroom.\n\nBest regards,\n${teacher?.name}`
    window.open(`mailto:${card.parent_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const handleSaveNotes = () => {
    if (card) {
      localStorage.setItem(`student_notes_${card.id}`, notes)
      setEditMode(false)
    }
  }

  if (loading) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-begin-cream flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
            <p className="text-begin-blue">Loading student card...</p>
          </div>
        </div>
      </AuthRequired>
    )
  }

  if (!card) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-begin-cream flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-begin-blue mb-4">Card Not Found</h2>
            <Link 
              href="/teacher/student-cards"
              className="btn-begin-primary"
            >
              Back to Student Cards
            </Link>
          </div>
        </div>
      </AuthRequired>
    )
  }

  return (
    <AuthRequired>
      <div className="min-h-screen bg-begin-cream print:bg-white">
        {/* Header - Hidden in Print */}
        <header className="bg-white shadow-sm border-b border-begin-gray print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-begin-teal to-begin-cyan rounded-lg">
                  <ArrowLeft className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-begin-blue">{card.child_name}'s Reference Card</span>
                  <p className="text-sm text-begin-blue/70">{card.learning_style} Learner</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="btn-begin-secondary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Card
                </button>
                <button
                  onClick={handleEmailParent}
                  className="btn-begin-secondary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Parent
                </button>
                <Link 
                  href="/teacher/student-cards"
                  className="flex items-center gap-2 text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to All Cards
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Card */}
            <div className="lg:col-span-2">
              <StudentCard
                card={card}
                onPrint={handlePrint}
                onEmailParent={handleEmailParent}
              />
            </div>

            {/* Teacher Notes & Actions - Hidden in Print */}
            <div className="space-y-6 print:hidden">
              {/* Quick Actions */}
              <div className="card-begin">
                <h3 className="text-heading font-bold text-begin-blue mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                  >
                    <Printer className="h-5 w-5 text-begin-teal" />
                    Print This Card
                  </button>
                  <button
                    onClick={handleEmailParent}
                    className="w-full flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                  >
                    <Mail className="h-5 w-5 text-begin-teal" />
                    Email Parent
                  </button>
                  <Link
                    href={`/results/${card.assessment_results?.id}`}
                    className="w-full flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                  >
                    <Download className="h-5 w-5 text-begin-teal" />
                    Full Assessment Report
                  </Link>
                </div>
              </div>

              {/* Teacher Notes */}
              <div className="card-begin">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-heading font-bold text-begin-blue">Teacher Notes</h3>
                  <button
                    onClick={() => editMode ? handleSaveNotes() : setEditMode(true)}
                    className="flex items-center gap-2 text-begin-teal hover:text-begin-teal-hover text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    {editMode ? 'Save Notes' : 'Edit Notes'}
                  </button>
                </div>
                
                {editMode ? (
                  <div className="space-y-3">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your observations, what's working, what to try next..."
                      className="w-full h-32 p-3 border border-begin-gray rounded-card focus:outline-none focus:ring-2 focus:ring-begin-teal focus:border-transparent resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNotes}
                        className="btn-begin-primary text-sm px-4 py-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="btn-begin-secondary text-sm px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[100px]">
                    {notes ? (
                      <p className="text-begin-blue text-sm leading-relaxed whitespace-pre-wrap">{notes}</p>
                    ) : (
                      <p className="text-begin-blue/50 text-sm italic">
                        Click "Edit Notes" to add your observations and strategies for {card.child_name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Reference */}
              <div className="card-begin bg-begin-cyan/5 border border-begin-cyan/20">
                <h3 className="text-heading font-bold text-begin-blue mb-4">Quick Reference</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-begin-blue">Learning Style:</span>
                    <span className="ml-2 text-begin-blue/80">{card.learning_style}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-begin-blue">Parent Email:</span>
                    <span className="ml-2 text-begin-blue/80">{card.parent_email}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-begin-blue">Grade Level:</span>
                    <span className="ml-2 text-begin-blue/80">{card.assessment_results?.grade_level}</span>
                  </div>
                </div>
              </div>

              {/* Tips for This Learning Style */}
              <div className="card-begin bg-begin-teal/5 border border-begin-teal/20">
                <h3 className="text-heading font-bold text-begin-blue mb-4">
                  {card.learning_style} Learner Tips
                </h3>
                <div className="space-y-2 text-sm text-begin-blue/80">
                  {card.learning_style === 'Creative' && (
                    <>
                      <p>• Offer choices in how they demonstrate learning</p>
                      <p>• Use visual and hands-on activities</p>
                      <p>• Allow time for exploration before structure</p>
                      <p>• Connect to real-world creative applications</p>
                    </>
                  )}
                  {card.learning_style === 'Analytical' && (
                    <>
                      <p>• Provide clear step-by-step instructions</p>
                      <p>• Use graphic organizers and templates</p>
                      <p>• Explain the reasoning behind tasks</p>
                      <p>• Give extra processing time</p>
                    </>
                  )}
                  {card.learning_style === 'Collaborative' && (
                    <>
                      <p>• Use pair and small group activities</p>
                      <p>• Allow discussion before independent work</p>
                      <p>• Create peer learning opportunities</p>
                      <p>• Assign community building roles</p>
                    </>
                  )}
                  {card.learning_style === 'Confident' && (
                    <>
                      <p>• Provide leadership opportunities</p>
                      <p>• Offer challenging extension activities</p>
                      <p>• Use their confidence to help others</p>
                      <p>• Set high but achievable goals</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}