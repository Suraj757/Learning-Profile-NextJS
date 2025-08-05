// Improved Email composer with student selection and preview
'use client'
import { useState, useEffect } from 'react'
import { Send, Users, Mail, CheckCircle, AlertCircle, Clock, X, Eye, EyeOff, UserCheck } from 'lucide-react'

interface Student {
  id: string
  name: string
  parentEmail: string
  assignmentId?: string
  status?: string
}

interface ImprovedEmailComposerProps {
  isOpen: boolean
  onClose: () => void
  teacherEmail: string
  defaultType?: 'invitation' | 'reminder' | 'custom'
}

interface EmailSendResult {
  success: boolean
  sent: number
  failed: number
  results?: Array<{
    email: string
    success: boolean
    error?: string
  }>
}

interface EmailPreviewContent {
  subject: string
  content: string
  studentName: string
  parentEmail: string
}

export default function ImprovedEmailComposer({ 
  isOpen, 
  onClose, 
  teacherEmail, 
  defaultType = 'invitation'
}: ImprovedEmailComposerProps) {
  const [emailType, setEmailType] = useState<'invitation' | 'reminder' | 'custom'>(defaultType)
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [sendResult, setSendResult] = useState<EmailSendResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState<EmailPreviewContent | null>(null)

  // Load available students when component opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableStudents()
    }
  }, [isOpen, emailType, teacherEmail])

  const loadAvailableStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/emails/assessment-invitations?teacherEmail=${encodeURIComponent(teacherEmail)}`)
      const data = await response.json()
      
      if (data.success && data.preview) {
        const students: Student[] = data.preview.map((item: any) => ({
          id: item.assignmentId?.toString() || Math.random().toString(),
          name: item.studentName || 'Student',
          parentEmail: item.parentEmail,
          assignmentId: item.assignmentId,
          status: item.status || 'pending'
        }))
        setAvailableStudents(students)
        
        // Auto-select all students for invitations/reminders
        if (emailType !== 'custom') {
          setSelectedStudents(new Set(students.map(s => s.id)))
        }
      } else {
        console.error('Failed to load students:', data.error)
        setAvailableStudents([])
      }
    } catch (error) {
      console.error('Error loading students:', error)
      setAvailableStudents([])
    } finally {
      setLoading(false)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents)
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId)
    } else {
      newSelection.add(studentId)
    }
    setSelectedStudents(newSelection)
  }

  const selectAllStudents = () => {
    setSelectedStudents(new Set(availableStudents.map(s => s.id)))
  }

  const clearSelection = () => {
    setSelectedStudents(new Set())
  }

  const getSelectedStudentsList = () => {
    return availableStudents.filter(student => selectedStudents.has(student.id))
  }

  const generateEmailPreview = async () => {
    const selectedList = getSelectedStudentsList()
    if (selectedList.length === 0) return

    const firstStudent = selectedList[0]
    
    // Generate preview content based on email type
    let subject = ''
    let content = ''
    
    if (emailType === 'invitation') {
      subject = `Help Your Child's Teacher Understand Their Learning Style - ${firstStudent.name}`
      content = `Dear Parent/Guardian,

I hope this message finds you well! I'm ${teacherEmail.split('@')[0]}, ${firstStudent.name}'s teacher this year.

I'm excited to work with ${firstStudent.name} and want to ensure I understand their unique learning style from Day 1. To help me provide the best possible learning experience, I'm asking all families to complete a quick 5-minute Begin Learning Profile.

**What is the Begin Learning Profile?**
- A research-based assessment that identifies your child's learning strengths
- Takes just 5 minutes to complete
- Provides personalized recommendations for both home and school
- Helps me differentiate instruction from the very first day

**Complete ${firstStudent.name}'s Learning Profile:**
[Assessment Link - Would be personalized for each student]

Thank you for taking the time to help me understand ${firstStudent.name}'s unique learning style. Together, we can ensure they have an amazing year!

Best regards,
${teacherEmail.split('@')[0]}
${teacherEmail}`
    } else if (emailType === 'reminder') {
      subject = `Reminder: ${firstStudent.name}'s Learning Profile - Just 5 Minutes!`
      content = `Dear Parent/Guardian,

I hope you're having a great week! This is a friendly reminder about completing ${firstStudent.name}'s Begin Learning Profile.

I sent an assessment link a few days ago, and I wanted to follow up because understanding your child's learning style will really help me provide the best possible classroom experience for ${firstStudent.name}.

**Quick Assessment Link:**
[Assessment Link - Would be personalized for each student]

**Why this matters:**
- Takes only 5 minutes to complete
- Helps me understand how ${firstStudent.name} learns best
- Provides personalized recommendations for home and school
- Ensures I can differentiate instruction from Day 1

If you have any questions about the assessment or need technical help, please don't hesitate to reach out to me directly.

Thank you for your partnership in ${firstStudent.name}'s education!

Warm regards,
${teacherEmail.split('@')[0]}
${teacherEmail}`
    } else {
      subject = customSubject || `Update about ${firstStudent.name}`
      content = customMessage || 'Custom message content would appear here...'
    }

    setPreviewContent({
      subject,
      content,
      studentName: firstStudent.name,
      parentEmail: firstStudent.parentEmail
    })
    setShowPreview(true)
  }

  const sendEmails = async () => {
    const selectedList = getSelectedStudentsList()
    if (selectedList.length === 0) {
      alert('Please select at least one student to send emails to.')
      return
    }

    setSending(true)
    setSendResult(null)

    try {
      const response = await fetch('/api/emails/assessment-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherEmail,
          studentIds: selectedList.map(s => s.assignmentId).filter(Boolean),
          includeCompleted: emailType === 'reminder'
        })
      })

      const result = await response.json()
      setSendResult(result)

    } catch (error) {
      console.error('Error sending emails:', error)
      setSendResult({
        success: false,
        sent: 0,
        failed: 1,
        results: [{ email: 'unknown', success: false, error: error instanceof Error ? error.message : 'Unknown error' }]
      })
    } finally {
      setSending(false)
    }
  }

  const getEmailTypeInfo = () => {
    switch (emailType) {
      case 'invitation':
        return {
          title: 'Assessment Invitations',
          description: 'Send initial assessment invitations to parents',
          buttonText: 'Send Invitations',
          icon: <Mail className="h-5 w-5" />
        }
      case 'reminder':
        return {
          title: 'Assessment Reminders',
          description: 'Send reminders for incomplete assessments',
          buttonText: 'Send Reminders',
          icon: <Clock className="h-5 w-5" />
        }
      case 'custom':
        return {
          title: 'Custom Email',
          description: 'Send a custom message to selected parents',
          buttonText: 'Send Custom Email',
          icon: <Send className="h-5 w-5" />
        }
    }
  }

  if (!isOpen) return null

  const typeInfo = getEmailTypeInfo()
  const selectedCount = selectedStudents.size

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {typeInfo.icon}
            <div>
              <h2 className="text-xl font-semibold">{typeInfo.title}</h2>
              <p className="text-sm text-gray-600">{typeInfo.description}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Panel - Configuration */}
          <div className="w-1/2 p-6 border-r overflow-y-auto">
            {/* Email Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setEmailType('invitation')}
                  className={`p-3 text-center rounded-lg border ${
                    emailType === 'invitation' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Invitations</div>
                </button>
                <button
                  onClick={() => setEmailType('reminder')}
                  className={`p-3 text-center rounded-lg border ${
                    emailType === 'reminder' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Reminders</div>
                </button>
                <button
                  onClick={() => setEmailType('custom')}
                  className={`p-3 text-center rounded-lg border ${
                    emailType === 'custom' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Send className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Custom</div>
                </button>
              </div>
            </div>

            {/* Custom Email Fields */}
            {emailType === 'custom' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter your message to parents..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Student Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Select Students ({selectedCount} of {availableStudents.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllStudents}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-600 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs text-gray-600 mt-2">Loading students...</p>
                </div>
              ) : availableStudents.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-2 rounded border cursor-pointer hover:bg-gray-50 ${
                        selectedStudents.has(student.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{student.name}</div>
                        <div className="text-xs text-gray-600">{student.parentEmail}</div>
                      </div>
                      {selectedStudents.has(student.id) && (
                        <UserCheck className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No students found</p>
                  <p className="text-xs">No pending assessments available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Email Preview</h3>
              <button
                onClick={generateEmailPreview}
                disabled={selectedCount === 0}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Generate Preview
              </button>
            </div>

            {previewContent ? (
              <div className="bg-white rounded-lg border p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</label>
                  <div className="mt-1 font-medium">{previewContent.subject}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                  <div className="mt-1 text-sm">{previewContent.parentEmail}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Message</label>
                  <div className="mt-1 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border max-h-96 overflow-y-auto">
                    {previewContent.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select students and click "Generate Preview" to see email content</p>
              </div>
            )}

            {/* Send Result */}
            {sendResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                sendResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {sendResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    sendResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {sendResult.success ? 'Emails Sent Successfully!' : 'Some Emails Failed'}
                  </span>
                </div>
                <p className={`text-sm ${
                  sendResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {sendResult.sent} sent, {sendResult.failed} failed
                </p>
                
                {sendResult.results && sendResult.failed > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-red-700">View errors</summary>
                    <div className="mt-2 space-y-1 text-xs">
                      {sendResult.results
                        .filter(r => !r.success)
                        .map((result, index) => (
                          <div key={index} className="text-red-600">
                            {result.email}: {result.error}
                          </div>
                        ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedCount > 0 ? `${selectedCount} recipients selected` : 'No recipients selected'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={sendEmails}
              disabled={sending || selectedCount === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {typeInfo.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}