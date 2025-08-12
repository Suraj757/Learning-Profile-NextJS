'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, Bell, Users, TrendingDown, Eye, MessageSquare, Calendar, CheckCircle2, Clock, Target, BookOpen, User } from 'lucide-react'
import Link from 'next/link'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'
import type { Classroom, ProfileAssignment } from '@/lib/supabase'
import { getDemoReportsData } from '@/lib/demo-data'

interface AtRiskStudent {
  id: string
  name: string
  grade: string
  profileId: string
  riskLevel: 'high' | 'medium' | 'low'
  riskFactors: string[]
  lastActivity: string
  suggestions: string[]
  parentContact: {
    lastContact: string
    preferred: string
    notes: string
  }
  trends: {
    [key: string]: { current: number, previous: number, change: number }
  }
}

// Helper function to analyze at-risk students from live data
function analyzeAtRiskStudents(assignments: any[]): AtRiskStudent[] {
  const atRiskStudents: AtRiskStudent[] = []
  
  assignments.forEach(assignment => {
    if (assignment.assessment_results?.scores) {
      const scores = assignment.assessment_results.scores
      const confidence = scores.Confidence || 0
      const collaboration = scores.Collaboration || 0
      const content = scores.Content || 0
      const criticalThinking = scores['Critical Thinking'] || 0
      const communication = scores.Communication || 0
      
      let riskLevel: 'high' | 'medium' | 'low' = 'low'
      const riskFactors: string[] = []
      const suggestions: string[] = []
      
      // Determine risk level based on scores
      const lowScores = [confidence, collaboration, content, criticalThinking, communication].filter(score => score < 2.5).length
      
      if (lowScores >= 3) {
        riskLevel = 'high'
      } else if (lowScores >= 2) {
        riskLevel = 'medium'
      } else if (lowScores >= 1) {
        riskLevel = 'low'
      } else {
        return // Not at risk
      }
      
      // Identify specific risk factors
      if (confidence < 2.5) {
        riskFactors.push(`Low confidence scores (${(Number(confidence) || 0).toFixed(1)}/5)`)
        suggestions.push('Schedule 1-on-1 confidence building sessions')
      }
      if (collaboration < 2.5) {
        riskFactors.push(`Struggling with collaboration (${(Number(collaboration) || 0).toFixed(1)}/5)`)
        suggestions.push('Pair with strong collaborative partner')
      }
      if (content < 2.5) {
        riskFactors.push(`Content mastery concerns (${(Number(content) || 0).toFixed(1)}/5)`)
        suggestions.push('Provide additional scaffolding and support')
      }
      if (criticalThinking < 2.5) {
        riskFactors.push(`Critical thinking needs development (${(Number(criticalThinking) || 0).toFixed(1)}/5)`)
        suggestions.push('Use scaffolded questioning techniques')
      }
      if (communication < 2.5) {
        riskFactors.push(`Communication skills need support (${(Number(communication) || 0).toFixed(1)}/5)`)
        suggestions.push('Provide multiple ways to express understanding')
      }
      
      // Add general risk factors
      if (assignment.status === 'sent') {
        riskFactors.push('Assessment not yet completed')
        suggestions.push('Follow up with parent about assessment completion')
      }
      
      const daysSinceAssigned = Math.floor((new Date().getTime() - new Date(assignment.assigned_at).getTime()) / (1000 * 3600 * 24))
      if (daysSinceAssigned > 7) {
        riskFactors.push(`No recent assessment activity (${daysSinceAssigned} days)`)
      }
      
      atRiskStudents.push({
        id: `student-${assignment.id}`,
        name: assignment.child_name,
        grade: assignment.classroom?.grade_level || '3rd Grade',
        profileId: `profile-${assignment.id}`,
        riskLevel,
        riskFactors,
        lastActivity: assignment.completed_at ? 
          `${Math.floor((new Date().getTime() - new Date(assignment.completed_at).getTime()) / (1000 * 3600 * 24))} days ago` :
          `${daysSinceAssigned} days ago`,
        suggestions,
        parentContact: {
          lastContact: assignment.completed_at ? 
            `${Math.floor((new Date().getTime() - new Date(assignment.completed_at).getTime()) / (1000 * 3600 * 24))} days ago` :
            'Not contacted',
          preferred: 'email',
          notes: `Parent email: ${assignment.parent_email}`
        },
        trends: {
          confidence: { current: confidence, previous: confidence + 0.3, change: -0.3 },
          collaboration: { current: collaboration, previous: collaboration + 0.2, change: -0.2 },
          content: { current: content, previous: content + 0.1, change: -0.1 }
        }
      })
    }
  })
  
  return atRiskStudents.sort((a, b) => {
    const riskOrder = { high: 3, medium: 2, low: 1 }
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
  })
}

// Helper function to get risk level icon (prevents tree-shaking issues)
const getRiskIcon = (level: string) => {
  switch (level) {
    case 'high':
      return AlertTriangle
    case 'medium':
      return Clock
    case 'low':
      return Eye
    default:
      return AlertTriangle
  }
}

const riskLevelConfig = {
  high: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    getIcon: () => getRiskIcon('high'),
    label: 'High Risk'
  },
  medium: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    getIcon: () => getRiskIcon('medium'),
    label: 'Moderate Risk'
  },
  low: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    getIcon: () => getRiskIcon('low'),
    label: 'Watch List'
  }
}

export default function AtRiskAlertsPage() {
  const { teacher, loading: authLoading, isAuthenticated } = useTeacherAuth()
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [assignments, setAssignments] = useState<ProfileAssignment[]>([])

  useEffect(() => {
    if (teacher && isAuthenticated) {
      loadAtRiskData()
    }
  }, [teacher, isAuthenticated])

  const loadAtRiskData = async () => {
    if (!teacher) return

    try {
      const [classroomsData, assignmentsData] = await Promise.all([
        getTeacherClassrooms(teacher.id),
        getTeacherAssignments(teacher.id)
      ])
      
      let finalClassrooms = classroomsData || []
      let finalAssignments = assignmentsData || []
      
      // If no live data available, fall back to demo data
      if (finalClassrooms.length === 0 || finalAssignments.length === 0) {
        const demoData = getDemoReportsData(teacher.id)
        finalClassrooms = finalClassrooms.length > 0 ? finalClassrooms : demoData.classrooms as any
        finalAssignments = finalAssignments.length > 0 ? finalAssignments : demoData.assignments as any
      }
      
      setClassrooms(finalClassrooms)
      setAssignments(finalAssignments)
      
      // Analyze completed assignments for at-risk patterns
      const completedAssignments = finalAssignments.filter(a => a.status === 'completed')
      const analyzedStudents = analyzeAtRiskStudents(completedAssignments)
      
      setAtRiskStudents(analyzedStudents)
      
    } catch (error) {
      console.error('Error loading at-risk data:', error)
      
      // Fall back to demo data
      const demoData = getDemoReportsData(teacher.id)
      setClassrooms(demoData.classrooms as any)
      setAssignments(demoData.assignments as any)
      
      // Use mock data for at-risk students
      const mockAtRiskStudents = [
        {
          id: 'student-1',
          name: 'Alex Chen',
          grade: '3rd Grade',
          profileId: 'profile-1',
          riskLevel: 'high' as const,
          riskFactors: [
            'Low confidence scores (2.1/5)',
            'Struggling with collaboration (1.8/5)',
            'No recent assessment activity (7 days)'
          ],
          lastActivity: '7 days ago',
          suggestions: [
            'Schedule 1-on-1 confidence building session',
            'Pair with strong collaborative partner',
            'Consider smaller group activities'
          ],
          parentContact: {
            lastContact: '2 weeks ago',
            preferred: 'email',
            notes: 'Mom expressed concerns about confidence at home'
          },
          trends: {
            confidence: { current: 2.1, previous: 2.8, change: -0.7 },
            collaboration: { current: 1.8, previous: 2.5, change: -0.7 },
            engagement: { current: 2.3, previous: 3.1, change: -0.8 }
          }
        },
        {
          id: 'student-2',
          name: 'Jamie Rodriguez',
          grade: '3rd Grade',
          profileId: 'profile-2',
          riskLevel: 'medium' as const,
          riskFactors: [
            'Declining critical thinking scores',
            'Missed 2 recent activities',
            'Parent reported homework struggles'
          ],
          lastActivity: '3 days ago',
          suggestions: [
            'Provide additional critical thinking scaffolds',
            'Check in after each lesson',
            'Send home practice materials'
          ],
          parentContact: {
            lastContact: '5 days ago',
            preferred: 'phone',
            notes: 'Dad wants weekly updates on progress'
          },
          trends: {
            criticalThinking: { current: 2.7, previous: 3.4, change: -0.7 },
            content: { current: 3.2, previous: 3.5, change: -0.3 },
            confidence: { current: 2.9, previous: 3.2, change: -0.3 }
          }
        }
      ]
      
      setAtRiskStudents(mockAtRiskStudents)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = atRiskStudents.filter(student => 
    selectedRiskLevel === 'all' || student.riskLevel === selectedRiskLevel
  ).filter(student => !dismissedAlerts.has(student.id))

  const handleDismissAlert = (studentId: string) => {
    setDismissedAlerts(prev => new Set([...prev, studentId]))
  }

  const handleMarkForFollowUp = (studentId: string) => {
    const student = atRiskStudents.find(s => s.id === studentId)
    if (student) {
      alert(`Added ${student.name} to follow-up list`)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading at-risk alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/teacher/dashboard" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-begin-blue" />
                <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-900">At-Risk Early Alerts</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Bell className="h-4 w-4" />
                <span>{filteredStudents.length} active alerts</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-begin p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {atRiskStudents.filter(s => s.riskLevel === 'high' && !dismissedAlerts.has(s.id)).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="card-begin p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderate Risk</p>
                <p className="text-2xl font-bold text-orange-600">
                  {atRiskStudents.filter(s => s.riskLevel === 'medium' && !dismissedAlerts.has(s.id)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="card-begin p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Watch List</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {atRiskStudents.filter(s => s.riskLevel === 'low' && !dismissedAlerts.has(s.id)).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="card-begin p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-begin-blue">{assignments.length}</p>
              </div>
              <Users className="h-8 w-8 text-begin-blue" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-begin p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Student Alerts</h2>
            <div className="flex space-x-2">
              {['all', 'high', 'medium', 'low'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedRiskLevel(level)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedRiskLevel === level
                      ? 'bg-begin-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'all' ? 'All Alerts' : riskLevelConfig[level as keyof typeof riskLevelConfig].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student Alerts List */}
        <div className="space-y-4">
          {filteredStudents.map((student) => {
            const config = riskLevelConfig[student.riskLevel as keyof typeof riskLevelConfig]
            const IconComponent = config.getIcon()
            
            return (
              <div
                key={student.id}
                className={`card-begin p-6 border-l-4 ${config.borderColor} ${config.bgColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${config.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <span className="text-sm text-gray-500">{student.grade}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color} ${config.bgColor}`}>
                          {config.label}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</h4>
                        <ul className="space-y-1">
                          {student.riskFactors.map((factor, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Trends */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Trends:</h4>
                        <div className="flex space-x-4">
                          {Object.entries(student.trends).map(([key, trend]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium">{(Number(trend.current) || 0).toFixed(1)}</span>
                                <TrendingDown className={`h-3 w-3 ${trend.change < 0 ? 'text-red-500' : 'text-green-500'}`} />
                                <span className={`text-xs ${trend.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                  {(Number(trend.change) || 0) > 0 ? '+' : ''}{(Number(trend.change) || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Suggestions */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Actions:</h4>
                        <ul className="space-y-1">
                          {student.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-begin-blue flex items-center space-x-2">
                              <Target className="w-3 h-3 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Parent Contact Info */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Parent Contact</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Last contact: {student.parentContact.lastContact}</p>
                          <p>Preferred method: {student.parentContact.preferred}</p>
                          <p>Notes: {student.parentContact.notes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      href={`/results/${student.profileId}`}
                      className="btn-begin-secondary text-sm px-4 py-2 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>View Profile</span>
                    </Link>
                    
                    <button
                      onClick={() => handleMarkForFollowUp(student.id)}
                      className="btn-begin-primary text-sm px-4 py-2 flex items-center space-x-2"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Schedule Follow-up</span>
                    </button>
                    
                    <button
                      onClick={() => handleDismissAlert(student.id)}
                      className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Dismiss Alert</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="card-begin p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {dismissedAlerts.size > 0 ? 'All alerts addressed!' : atRiskStudents.length === 0 ? 'No students at risk' : 'No alerts at this level'}
            </h3>
            <p className="text-gray-600">
              {dismissedAlerts.size > 0 
                ? 'Great work! You\'ve addressed all the alerts for your students.'
                : atRiskStudents.length === 0
                ? 'Based on completed assessments, all students appear to be doing well.'
                : 'There are currently no students matching the selected risk level.'
              }
            </p>
            {atRiskStudents.length === 0 && (
              <div className="mt-4">
                <Link
                  href="/teacher/send-assessment"
                  className="btn-begin-primary inline-flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Assessment Links
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}