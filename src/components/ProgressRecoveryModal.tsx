'use client'
import React, { useState } from 'react'
import { X, Clock, User, BookOpen, ArrowRight, Mail, Loader2, AlertCircle } from 'lucide-react'
import { ProgressSession, recoverProgressByEmail } from '@/lib/progress-manager'

interface ProgressRecoveryModalProps {
  isOpen: boolean
  onClose: () => void
  onResumeSession: (sessionId: string) => void
}

export default function ProgressRecoveryModal({
  isOpen,
  onClose,
  onResumeSession
}: ProgressRecoveryModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ProgressSession[]>([])
  const [showSessions, setShowSessions] = useState(false)

  if (!isOpen) return null

  const handleRecoverProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await recoverProgressByEmail(email)
      
      if (result.error) {
        setError(result.error)
      } else if (result.found && result.progress_sessions.length > 0) {
        setSessions(result.progress_sessions)
        setShowSessions(true)
      } else {
        setError('No saved progress found for this email address.')
      }
    } catch (err) {
      setError('Failed to recover progress. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeSession = (sessionId: string) => {
    onResumeSession(sessionId)
    onClose()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-begin-blue">Resume Your Progress</h2>
            <p className="text-sm text-gray-600 mt-1">Continue where you left off</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {!showSessions ? (
            <>
              {/* Email Recovery Form */}
              <div className="mb-6">
                <div className="bg-begin-teal/5 p-4 rounded-xl border border-begin-teal/20 mb-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-begin-teal mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-begin-blue mb-1">Cross-Device Recovery</h3>
                      <p className="text-sm text-gray-600">
                        Enter your email to find any saved assessment progress from other devices.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRecoverProgress} className="space-y-4">
                  <div>
                    <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      id="recovery-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-begin-teal focus:border-transparent"
                      placeholder="parent@example.com"
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!email.trim() || isLoading}
                    className="w-full btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Find My Progress
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Local Storage Option */}
              <div className="border-t border-gray-100 pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Or continue with your current device's saved progress
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-begin-secondary flex items-center gap-2 mx-auto"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Continue with Local Progress
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sessions List */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    setShowSessions(false)
                    setSessions([])
                    setError(null)
                  }}
                  className="text-sm text-begin-teal hover:text-begin-blue flex items-center gap-1 mb-4"
                >
                  ← Back to email search
                </button>
                
                <h3 className="font-medium text-begin-blue mb-2">
                  Found {sessions.length} saved assessment{sessions.length === 1 ? '' : 's'}
                </h3>
              </div>

              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-begin-teal/50 hover:bg-begin-teal/5 transition-all cursor-pointer"
                    onClick={() => handleResumeSession(session.session_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-begin-teal" />
                          <span className="font-medium text-begin-blue">
                            {session.child_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({session.grade})
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>Question {session.current_question} of {session.total_questions}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Saved {formatDate(session.last_saved)}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-begin-teal to-begin-cyan h-2 rounded-full transition-all duration-300"
                            style={{ width: `${session.progress_percentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{session.progress_percentage}% complete</span>
                          <span>{session.responses_count} answers saved</span>
                        </div>
                      </div>

                      <ArrowRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>

              {sessions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved progress found for this email.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}