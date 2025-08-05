// Email composer component for sending parent communications
'use client'
import { useState, useEffect } from 'react'
import { Send, Users, Mail, CheckCircle, AlertCircle, Clock, X, Eye } from 'lucide-react'

interface EmailComposerProps {
  isOpen: boolean
  onClose: () => void
  teacherEmail: string
  defaultType?: 'invitation' | 'reminder' | 'custom'
  selectedStudents?: Array<{
    id: string
    name: string
    parentEmail: string
  }>
}

interface EmailPreview {
  studentName: string
  parentEmail: string
  assignmentId?: string
  status: string
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

export default function EmailComposer({ 
  isOpen, 
  onClose, 
  teacherEmail, 
  defaultType = 'invitation',
  selectedStudents = []
}: EmailComposerProps) {
  const [emailType, setEmailType] = useState<'invitation' | 'reminder' | 'custom'>(defaultType)
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState<EmailPreview[]>([])
  const [sendResult, setSendResult] = useState<EmailSendResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Load email preview when component opens
  useEffect(() => {
    if (isOpen && emailType !== 'custom') {
      loadEmailPreview()
    }
  }, [isOpen, emailType, teacherEmail])

  const loadEmailPreview = async () => {
    if (emailType === 'custom') return

    setLoading(true)
    try {
      const response = await fetch(`/api/emails/assessment-invitations?teacherEmail=${encodeURIComponent(teacherEmail)}`)
      const data = await response.json()
      
      if (data.success) {
        setPreview(data.preview || [])
      } else {
        console.error('Failed to load email preview:', data.error)
        setPreview([])
      }
    } catch (error) {
      console.error('Error loading email preview:', error)
      setPreview([])
    } finally {
      setLoading(false)
    }
  }

  const sendEmails = async () => {
    setSending(true)
    setSendResult(null)

    try {
      if (emailType === 'custom') {
        // Send custom emails to selected students
        if (selectedStudents.length === 0) {
          throw new Error('No students selected for custom email')
        }

        const emailData = {
          emails: selectedStudents.map(student => ({
            to: student.parentEmail,
            templateData: {
              teacherName: 'Teacher', // This would come from teacher data
              teacherEmail,
              childName: student.name,
              parentEmail: student.parentEmail,
              assessmentLink: '' // Not needed for custom emails
            }
          })),
          templateType: 'custom' as const,
          customSubject,
          customMessage,
          replyTo: teacherEmail,
          tags: ['custom-communication', 'teacher-parent']
        }

        const response = await fetch('/api/emails/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData)
        })

        const result = await response.json()
        setSendResult(result)

      } else {
        // Send assessment invitations or reminders
        const response = await fetch('/api/emails/assessment-invitations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherEmail,
            includeCompleted: emailType === 'reminder'
          })
        })

        const result = await response.json()
        setSendResult(result)
      }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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

          {/* Email Preview */}
          {!loading && preview.length > 0 && emailType !== 'custom' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Recipients ({preview.length})
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>
              
              {showPreview && (
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {preview.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 text-sm">
                      <span>{item.studentName}</span>
                      <span className="text-gray-600">{item.parentEmail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom Email Recipients */}
          {emailType === 'custom' && selectedStudents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Recipients ({selectedStudents.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {selectedStudents.map((student) => (
                  <div key={student.id} className="flex justify-between items-center py-1 text-sm">
                    <span>{student.name}</span>
                    <span className="text-gray-600">{student.parentEmail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send Result */}
          {sendResult && (
            <div className={`mb-6 p-4 rounded-lg ${
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
                <div className="mt-3 text-sm">
                  <details>
                    <summary className="cursor-pointer text-red-700 font-medium">
                      View failed emails
                    </summary>
                    <div className="mt-2 space-y-1">
                      {sendResult.results
                        .filter(r => !r.success)
                        .map((result, index) => (
                          <div key={index} className="text-red-600">
                            {result.email}: {result.error}
                          </div>
                        ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading email recipients...</p>
            </div>
          )}

          {/* No Recipients Message */}
          {!loading && preview.length === 0 && emailType !== 'custom' && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No eligible recipients found</p>
              <p className="text-sm">All assessments may already be completed</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={sendEmails}
            disabled={sending || (emailType !== 'custom' && preview.length === 0) || (emailType === 'custom' && (!customSubject || !customMessage || selectedStudents.length === 0))}
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
  )
}