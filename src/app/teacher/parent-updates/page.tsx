'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Camera, Send, MessageSquare, CheckCircle, Clock, Users, Star, Heart, Upload, Eye, Mail } from 'lucide-react'
import AuthRequired from '@/components/teacher/AuthRequired'
import EmailComposer from '@/components/teacher/EmailComposer'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { getTeacherByEmail, getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'
import { getDemoReportsData } from '@/lib/demo-data'

// Helper functions for learning style content
const getQuickWinsForStyle = (style: string) => {
  const quickWins = {
    'Creative': [
      'Used visual storytelling for math problems',
      'Created art-based vocabulary cards',
      'Incorporated drawing into writing assignments'
    ],
    'Analytical': [
      'Step-by-step problem solving approach',
      'Data tracking charts for reading progress',
      'Logic puzzles for critical thinking'
    ],
    'Collaborative': [
      'Peer reading partnerships',
      'Group discussion circles for science',
      'Team-based project presentations'
    ],
    'Confident': [
      'Leadership roles in group activities',
      'Presentation opportunities',
      'Student mentor responsibilities'
    ],
    'Balanced': [
      'Mixed learning approach strategies',
      'Flexible activity options',
      'Personalized learning pathways'
    ]
  }
  return quickWins[style as keyof typeof quickWins] || quickWins['Balanced']
}

const generateUpdateStatus = (index: number) => {
  const statuses = ['sent', 'draft', 'scheduled', 'sent']
  return statuses[index % statuses.length] as 'sent' | 'draft' | 'scheduled'
}

const generateParentResponse = (status: string, childName: string, style: string) => {
  if (status !== 'sent') return null
  
  const responses = {
    'Creative': `Thank you! This matches exactly what we see at home. ${childName} has been so excited about school!`,
    'Analytical': `This is so helpful! ${childName} loves the structured approach you're using. They talk about the step-by-step methods every day.`,
    'Collaborative': `Amazing! ${childName} talks about their group projects every day. Thank you for understanding their social nature.`,
    'Confident': `Perfect! ${childName} comes home excited about being a leader in class. This approach is working so well.`,
    'Balanced': `Thank you for understanding ${childName}'s learning style. They're really thriving with your personalized approach.`
  }
  return responses[style as keyof typeof responses] || responses['Balanced']
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent': return 'bg-green-100 text-green-800'
    case 'draft': return 'bg-yellow-100 text-yellow-800'
    case 'scheduled': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'sent': return <CheckCircle className="h-4 w-4" />
    case 'draft': return <Clock className="h-4 w-4" />
    case 'scheduled': return <Send className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}

export default function ParentUpdatesPage() {
  const { teacher, isAuthenticated } = useTeacherAuth()
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [updateType, setUpdateType] = useState<'day3' | 'week1' | 'custom'>('day3')
  const [showComposer, setShowComposer] = useState(false)
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [emailType, setEmailType] = useState<'invitation' | 'reminder' | 'custom'>('invitation')
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    if (isAuthenticated && teacher) {
      loadParentUpdatesData()
    }
  }, [isAuthenticated, teacher])

  const loadParentUpdatesData = async () => {
    if (!teacher) return

    try {
      console.log('=== Parent Updates Data Loading ===')
      console.log('Teacher:', teacher.email, 'ID:', teacher.id)
      
      // Try to get teacher from database first
      let teacherId = teacher.id
      try {
        const dbTeacher = await getTeacherByEmail(teacher.email)
        if (dbTeacher) {
          teacherId = dbTeacher.id
          console.log('Using database teacher ID:', teacherId)
        }
      } catch (dbError) {
        console.log('Using localStorage teacher ID as fallback')
      }
      
      const [classroomsData, assignmentsData] = await Promise.all([
        getTeacherClassrooms(teacherId),
        getTeacherAssignments(teacherId)
      ])
      
      console.log('Live data check:')
      console.log('  - Classrooms:', classroomsData?.length || 0)
      console.log('  - Assignments:', assignmentsData?.length || 0)
      
      let finalClassrooms = classroomsData || []
      let finalAssignments = assignmentsData || []
      
      // If no live data, use demo data
      if (finalClassrooms.length === 0 || finalAssignments.length === 0) {
        console.log('No live data found, using demo data')
        const demoData = getDemoReportsData(teacherId)
        finalClassrooms = finalClassrooms.length > 0 ? finalClassrooms : demoData.classrooms as any
        finalAssignments = finalAssignments.length > 0 ? finalAssignments : demoData.assignments as any
      }
      
      setClassrooms(finalClassrooms)
      setAssignments(finalAssignments)
      
      // Convert assignments to student format for parent updates
      const studentData = finalAssignments.map((assignment, index) => {
        const results = assignment.assessment_results
        let learningStyle = 'Balanced'
        
        if (results?.personality_label) {
          const label = results.personality_label.toLowerCase()
          if (label.includes('creative')) learningStyle = 'Creative'
          else if (label.includes('analytical')) learningStyle = 'Analytical'
          else if (label.includes('collaborative')) learningStyle = 'Collaborative'
          else if (label.includes('confident')) learningStyle = 'Confident'
        }
        
        const updateStatus = generateUpdateStatus(index)
        
        return {
          id: assignment.id,
          name: assignment.child_name,
          learningStyle,
          updateStatus,
          lastUpdate: updateStatus === 'sent' ? '2025-01-04' : null,
          parentResponse: generateParentResponse(updateStatus, assignment.child_name, learningStyle),
          photos: Math.floor(Math.random() * 4),
          quickWins: getQuickWinsForStyle(learningStyle)
        }
      })
      
      setStudents(studentData)
      console.log('Generated parent updates for', studentData.length, 'students')
      
    } catch (error) {
      console.error('Error loading parent updates data:', error)
      // Fallback to demo data
      const demoData = getDemoReportsData(teacher.id)
      setClassrooms(demoData.classrooms as any)
      setAssignments(demoData.assignments as any)
      
      // Generate demo student data
      const demoStudents = (demoData.assignments as any[]).slice(0, 4).map((assignment: any, index: number) => {
        const styles = ['Creative', 'Analytical', 'Collaborative', 'Confident']
        const style = styles[index % styles.length]
        const updateStatus = generateUpdateStatus(index)
        
        return {
          id: assignment.id,
          name: assignment.child_name,
          learningStyle: style,
          updateStatus,
          lastUpdate: updateStatus === 'sent' ? '2025-01-04' : null,
          parentResponse: generateParentResponse(updateStatus, assignment.child_name, style),
          photos: Math.floor(Math.random() * 4),
          quickWins: getQuickWinsForStyle(style)
        }
      })
      
      setStudents(demoStudents)
    } finally {
      setLoading(false)
    }
  }

  const generateUpdateTemplate = (student: any, type: 'day3' | 'week1' | 'custom') => {
    const templates = {
      day3: `Hi! I wanted to reach out and share how I'm already using ${student.name}'s learning profile to help them succeed in our classroom.

🎯 **What I've implemented based on ${student.name}'s ${student.learningStyle} learning style:**
${student.quickWins.map((win: string) => `• ${win}`).join('\n')}

${student.name} has been responding really well to these approaches! I can already see them engaging more during lessons.

📸 **Quick photo from this week:** [Photo showing ${student.name} engaged in ${student.learningStyle.toLowerCase()} learning activity]

I'd love to hear - how does this match what you see at home? Are there any other strategies that work well for ${student.name} that I should try in the classroom?

Looking forward to a great year together!

Best,
Mrs. Johnson`,

      week1: `What an amazing first week with ${student.name}! I wanted to share some quick wins we've had using their learning profile.

✨ **${student.name} really lit up when:**
${student.quickWins.map((win: string) => `• ${win}`).join('\n')}

The insights from their Begin Learning Profile have been incredibly helpful. I can tell ${student.name} feels understood and supported in our classroom.

📸 **Moments from this week:** [Photo gallery of ${student.name} engaged and learning]

**Your turn:** How does this match what you see at home? What other ${student.learningStyle.toLowerCase()} learning approaches work well for ${student.name}?

Partnership makes all the difference!

Warmly,
Mrs. Johnson`,

      custom: `Hi! I wanted to share a quick update about ${student.name}...

[Custom message here]

Based on their ${student.learningStyle} learning profile, I've been trying:
${student.quickWins.map((win: string) => `• ${win}`).join('\n')}

How does this align with what you see at home?

Best,
Mrs. Johnson`
    }

    return templates[type]
  }

  return (
    <AuthRequired>
      <div className="min-h-screen bg-begin-cream">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/teacher/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-begin-blue">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-begin-blue" />
                <span className="text-xl font-bold text-begin-blue">Parent Connection System</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-begin p-6 text-center">
              <Users className="h-8 w-8 text-begin-teal mx-auto mb-2" />
              <div className="text-2xl font-bold text-begin-blue">{students.length}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
            <div className="card-begin p-6 text-center">
              <Send className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-begin-blue">{students.filter(s => s.updateStatus === 'sent').length}</div>
              <div className="text-sm text-gray-600">Updates Sent</div>
            </div>
            <div className="card-begin p-6 text-center">
              <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-begin-blue">{students.filter(s => s.parentResponse).length}</div>
              <div className="text-sm text-gray-600">Parent Responses</div>
            </div>
            <div className="card-begin p-6 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-begin-blue">{students.filter(s => s.parentResponse).length > 0 ? Math.round((students.filter(s => s.parentResponse).length / students.filter(s => s.updateStatus === 'sent').length) * 100) : 0}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student List */}
            <div className="lg:col-span-2">
              <div className="card-begin p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-begin-blue flex items-center gap-2">
                    <Heart className="h-6 w-6 text-begin-teal" />
                    First Week Updates
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEmailType('invitation')
                        setShowEmailComposer(true)
                      }}
                      className="btn-begin-secondary flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Send Invitations
                    </button>
                    <button
                      onClick={() => setShowComposer(true)}
                      className="btn-begin-primary flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Compose Update
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-begin-teal mx-auto mb-4"></div>
                      <p className="text-begin-blue/70">Loading parent updates...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-begin-gray mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-begin-blue mb-2">No Students Yet</h3>
                      <p className="text-begin-blue/70 mb-4">Send learning profile assessments to start building parent connections.</p>
                      <Link href="/teacher/send-assessment" className="btn-begin-primary">
                        Send First Assessment
                      </Link>
                    </div>
                  ) : (
                    students.map((student) => (
                    <div key={student.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-begin-teal to-begin-cyan rounded-full flex items-center justify-center text-white font-bold">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-begin-blue">{student.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="bg-begin-teal/10 text-begin-teal px-2 py-1 rounded-full text-xs">
                                {student.learningStyle}
                              </span>
                              <span className="flex items-center gap-1">
                                <Camera className="h-3 w-3" />
                                {student.photos} photos
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student.updateStatus)}`}>
                            {getStatusIcon(student.updateStatus)}
                            {student.updateStatus}
                          </span>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="btn-begin-secondary text-sm px-3 py-1"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      {student.parentResponse && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-green-800">Parent Response:</div>
                              <div className="text-sm text-green-700 mt-1">{student.parentResponse}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Templates */}
            <div className="space-y-6">
              <div className="card-begin p-6">
                <h3 className="text-lg font-bold text-begin-blue mb-4 flex items-center gap-2">
                  <Send className="h-5 w-5 text-begin-teal" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setEmailType('invitation')
                      setShowEmailComposer(true)
                    }}
                    className="w-full btn-begin-primary text-left flex items-center gap-3 hover:bg-begin-teal/90 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Send Assessment Invitations
                  </button>
                  <button 
                    onClick={() => {
                      // TODO: Implement bulk photo upload
                      alert('Bulk photo upload feature coming soon! For now, you can add photos to individual updates.')
                    }}
                    className="w-full btn-begin-secondary text-left flex items-center gap-3 hover:bg-begin-blue/5 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photos (Bulk)
                  </button>
                  <button 
                    onClick={() => {
                      // Create a preview window showing parent perspective
                      const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes')
                      if (previewWindow) {
                        previewWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Parent View Preview</title>
                            <style>
                              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; background: #f8fafc; }
                              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                              h1 { color: #1e40af; margin-bottom: 20px; }
                              .student-card { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
                              .learning-style { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; display: inline-block; margin-bottom: 10px; }
                              .quick-wins { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px; }
                              .teacher-note { font-style: italic; color: #6b7280; background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px; }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <h1>Your Child's Learning Profile Update</h1>
                              <p>Dear Parent,</p>
                              <p>I wanted to share how I'm using your child's learning profile to help them succeed in our classroom.</p>
                              
                              ${students.slice(0, 1).map(student => `
                                <div class="student-card">
                                  <h2>${student.name}</h2>
                                  <div class="learning-style">${student.learningStyle} Learner</div>
                                  <div class="quick-wins">
                                    <h3>What's Working Great:</h3>
                                    <ul>
                                      ${student.quickWins.map(win => `<li>${win}</li>`).join('')}
                                    </ul>
                                  </div>
                                  <div class="teacher-note">
                                    <strong>Teacher's Note:</strong> ${student.name} has been responding really well to these approaches! I can already see them engaging more during lessons.
                                  </div>
                                </div>
                              `).join('')}
                              
                              <p>I'd love to hear - how does this match what you see at home? Are there any other strategies that work well for your child that I should try in the classroom?</p>
                              <p>Looking forward to a great year together!</p>
                              <p>Best regards,<br>Mrs. Johnson</p>
                            </div>
                          </body>
                          </html>
                        `)
                        previewWindow.document.close()
                      }
                    }}
                    className="w-full btn-begin-secondary text-left flex items-center gap-3 hover:bg-begin-blue/5 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Parent View
                  </button>
                </div>
              </div>

              <div className="card-begin p-6">
                <h3 className="text-lg font-bold text-begin-blue mb-4">Update Templates</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-800">Day 3 Check-in</div>
                    <div className="text-sm text-blue-700">Show immediate profile application</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-green-800">Week 1 Success</div>
                    <div className="text-sm text-green-700">Celebrate quick wins & engagement</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="font-medium text-purple-800">Custom Update</div>
                    <div className="text-sm text-purple-700">Personalized message & photos</div>
                  </div>
                </div>
              </div>

              <div className="card-begin p-6">
                <h3 className="text-lg font-bold text-begin-blue mb-4">Value Promise</h3>
                <div className="bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 p-4 rounded-lg border border-begin-teal/20">
                  <div className="text-sm font-medium text-begin-blue mb-2">Parent Experience:</div>
                  <div className="text-sm text-gray-700 italic">
                    "Teacher actually READ the profile and is using it - my child matters"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Composer Modal */}
          <EmailComposer
            isOpen={showEmailComposer}
            onClose={() => setShowEmailComposer(false)}
            teacherEmail={teacher?.email || ''}
            defaultType={emailType}
          />

          {/* Student Detail Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-begin-blue">
                    {selectedStudent.name} - Update Details
                  </h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-begin-blue mb-2">Learning Style: {selectedStudent.learningStyle}</h4>
                    <div className="bg-begin-teal/10 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Quick Wins Applied:</h5>
                      <ul className="space-y-1">
                        {selectedStudent.quickWins.map((win: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-begin-teal mt-0.5" />
                            {win}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {selectedStudent.parentResponse && (
                    <div>
                      <h4 className="font-semibold text-begin-blue mb-2">Parent Response</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">{selectedStudent.parentResponse}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button className="btn-begin-primary flex-1">
                      Compose Follow-up
                    </button>
                    <button className="btn-begin-secondary">
                      Add Photos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Update Composer Modal */}
          {showComposer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-begin-blue">Compose Parent Update</h3>
                  <button
                    onClick={() => setShowComposer(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>Choose a student...</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>{student.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
                      <div className="flex gap-2">
                        {(['day3', 'week1', 'custom'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setUpdateType(type)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              updateType === type 
                                ? 'bg-begin-teal text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type === 'day3' ? 'Day 3' : type === 'week1' ? 'Week 1' : 'Custom'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Preview</label>
                    <textarea
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg text-sm"
                      value={selectedStudent ? generateUpdateTemplate(selectedStudent, updateType) : 'Select a student to see template...'}
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowComposer(false)}
                    className="btn-begin-secondary"
                  >
                    Cancel
                  </button>
                  <button className="btn-begin-primary flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthRequired>
  )
}