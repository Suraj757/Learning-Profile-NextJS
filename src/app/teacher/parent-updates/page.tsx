'use client'
import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Camera, Send, MessageSquare, CheckCircle, Clock, Users, Star, Heart, Upload, Eye, Mail } from 'lucide-react'
import AuthRequired from '@/components/teacher/AuthRequired'

// Sample data for parent updates
const sampleStudents = [
  {
    id: 1,
    name: 'Emma Thompson',
    learningStyle: 'Creative',
    updateStatus: 'sent',
    lastUpdate: '2025-01-04',
    parentResponse: 'Thank you! This matches exactly what we see at home. Emma has been so excited about school!',
    photos: 2,
    quickWins: ['Used visual storytelling for math problems', 'Created art-based vocabulary cards']
  },
  {
    id: 2, 
    name: 'Marcus Johnson',
    learningStyle: 'Analytical',
    updateStatus: 'draft',
    lastUpdate: null,
    parentResponse: null,
    photos: 1,
    quickWins: ['Step-by-step problem solving approach', 'Data tracking charts for reading progress']
  },
  {
    id: 3,
    name: 'Sofia Martinez',
    learningStyle: 'Collaborative',
    updateStatus: 'sent',
    lastUpdate: '2025-01-04',
    parentResponse: 'Amazing! Sofia talks about her group projects every day. Thank you for understanding her social nature.',
    photos: 3,
    quickWins: ['Peer reading partnerships', 'Group discussion circles for science']
  },
  {
    id: 4,
    name: 'Alex Chen',
    learningStyle: 'Confident',
    updateStatus: 'scheduled',
    lastUpdate: null,
    parentResponse: null,
    photos: 0,
    quickWins: ['Leadership roles in group activities', 'Presentation opportunities']
  }
]

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
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [updateType, setUpdateType] = useState<'day3' | 'week1' | 'custom'>('day3')
  const [showComposer, setShowComposer] = useState(false)

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
              <div className="text-2xl font-bold text-begin-blue">{sampleStudents.length}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
            <div className="card-begin p-6 text-center">
              <Send className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-begin-blue">{sampleStudents.filter(s => s.updateStatus === 'sent').length}</div>
              <div className="text-sm text-gray-600">Updates Sent</div>
            </div>
            <div className="card-begin p-6 text-center">
              <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-begin-blue">{sampleStudents.filter(s => s.parentResponse).length}</div>
              <div className="text-sm text-gray-600">Parent Responses</div>
            </div>
            <div className="card-begin p-6 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-begin-blue">100%</div>
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
                  <button
                    onClick={() => setShowComposer(true)}
                    className="btn-begin-primary flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Compose Update
                  </button>
                </div>

                <div className="space-y-4">
                  {sampleStudents.map((student) => (
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
                  ))}
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
                  <button className="w-full btn-begin-primary text-left flex items-center gap-3">
                    <Mail className="h-4 w-4" />
                    Send Day 3 Updates (Batch)
                  </button>
                  <button className="w-full btn-begin-secondary text-left flex items-center gap-3">
                    <Upload className="h-4 w-4" />
                    Upload Photos (Bulk)
                  </button>
                  <button className="w-full btn-begin-secondary text-left flex items-center gap-3">
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
                        {sampleStudents.map(student => (
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