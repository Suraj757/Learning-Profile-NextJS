'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle,
  Clock,
  Send,
  Eye,
  Copy,
  Share2,
  TrendingUp,
  Award,
  Users
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { getTeacherAssignments } from '@/lib/supabase'
import type { ProfileAssignment } from '@/lib/supabase'

export default function AssignmentsPage() {
  const { teacher, isAuthenticated } = useTeacherAuth()
  const [assignments, setAssignments] = useState<ProfileAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'completed'>('all')
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/teacher/register')
      return
    }

    if (teacher) {
      loadAssignments()
      generateShareUrl()
    }
  }, [teacher, isAuthenticated, router])

  const loadAssignments = async () => {
    if (!teacher) return

    try {
      const data = await getTeacherAssignments(teacher.id)
      setAssignments(data || [])
    } catch (error) {
      console.error('Error loading assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateShareUrl = () => {
    if (typeof window !== 'undefined') {
      const referralCode = teacher?.email.split('@')[0] || 'teacher'
      setShareUrl(`${window.location.origin}/?ref=${referralCode}`)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading assignments...</p>
        </div>
      </div>
    )
  }

  const totalAssignments = assignments.length
  const completedAssignments = assignments.filter(a => a.status === 'completed').length
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true
    return assignment.status === filter
  })

  const handleCopyShareUrl = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
    }
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">My Assignments</span>
                <p className="text-sm text-begin-blue/70">Track learning profile completions</p>
              </div>
            </div>
            <Link 
              href="/teacher/dashboard"
              className="flex items-center gap-2 text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Metrics Banner */}
        {completionRate >= 80 && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-card p-6 mb-8">
            <div className="flex items-center gap-4">
              <Award className="h-12 w-12" />
              <div className="flex-1">
                <h3 className="text-heading-lg font-bold mb-2">🎉 Amazing Work!</h3>
                <p className="text-lg opacity-90">
                  You have an {completionRate}% completion rate! Your dedication to understanding each student is making a real difference.
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-white text-green-600 px-6 py-3 rounded-card font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <Share2 className="h-5 w-5" />
                Share Success
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-blue/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Sent</p>
                <p className="text-2xl font-bold">{totalAssignments}</p>
              </div>
              <Send className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">{completedAssignments}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-teal/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Success Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="card-begin bg-gradient-to-br from-begin-cyan to-begin-cyan/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending</p>
                <p className="text-2xl font-bold">{totalAssignments - completedAssignments}</p>
              </div>
              <Clock className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card-begin">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-lg font-bold text-begin-blue">Assignment History</h2>
                <div className="flex items-center gap-3">
                  {/* Filter Tabs */}
                  <div className="flex bg-begin-gray rounded-card p-1">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-card text-sm font-medium transition-colors ${
                        filter === 'all' 
                          ? 'bg-white text-begin-blue shadow-sm' 
                          : 'text-begin-blue/70 hover:text-begin-blue'
                      }`}
                    >
                      All ({totalAssignments})
                    </button>
                    <button
                      onClick={() => setFilter('completed')}
                      className={`px-4 py-2 rounded-card text-sm font-medium transition-colors ${
                        filter === 'completed' 
                          ? 'bg-white text-begin-blue shadow-sm' 
                          : 'text-begin-blue/70 hover:text-begin-blue'
                      }`}
                    >
                      Completed ({completedAssignments})
                    </button>
                    <button
                      onClick={() => setFilter('sent')}
                      className={`px-4 py-2 rounded-card text-sm font-medium transition-colors ${
                        filter === 'sent' 
                          ? 'bg-white text-begin-blue shadow-sm' 
                          : 'text-begin-blue/70 hover:text-begin-blue'
                      }`}
                    >
                      Pending ({totalAssignments - completedAssignments})
                    </button>
                  </div>
                  
                  <Link
                    href="/teacher/send-assessment"
                    className="btn-begin-primary text-sm px-4 py-2 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send New
                  </Link>
                </div>
              </div>

              {filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="h-16 w-16 text-begin-gray mx-auto mb-4" />
                  <h3 className="text-heading font-semibold text-begin-blue mb-2">
                    {filter === 'all' ? 'No assignments yet' : `No ${filter} assignments`}
                  </h3>
                  <p className="text-begin-blue/70 mb-4">
                    {filter === 'all' 
                      ? 'Send your first assessment to get started' 
                      : `No assignments with ${filter} status`}
                  </p>
                  {filter === 'all' && (
                    <Link
                      href="/teacher/send-assessment"
                      className="btn-begin-primary inline-flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Your First Assessment
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 bg-begin-cream/30 rounded-card hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        {assignment.status === 'completed' ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <Clock className="h-6 w-6 text-begin-cyan" />
                        )}
                        <div>
                          <p className="font-semibold text-begin-blue">{assignment.child_name}</p>
                          <p className="text-sm text-begin-blue/70">{assignment.parent_email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-begin-blue">
                            {assignment.status === 'completed' ? 'Completed' : 'Pending'}
                          </p>
                          <p className="text-xs text-begin-blue/60">
                            {assignment.status === 'completed' && assignment.completed_at
                              ? new Date(assignment.completed_at).toLocaleDateString()
                              : new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {assignment.status === 'completed' && assignment.assessment_id ? (
                          <Link
                            href={`/results/${assignment.assessment_id}`}
                            className="p-2 text-begin-teal hover:text-begin-teal-hover transition-colors"
                            title="View Profile"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                const link = `${window.location.origin}/assessment/start?ref=${assignment.assignment_token}`
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(link)
                                }
                              }
                            }}
                            className="p-2 text-begin-blue/70 hover:text-begin-blue transition-colors"
                            title="Copy Link"
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Viral Growth Card */}
            <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-cyan text-white">
              <h3 className="text-heading font-bold mb-4">🚀 Spread the Word!</h3>
              <p className="text-sm opacity-90 mb-4">
                Help other teachers discover Begin Learning Profiles and strengthen school-home connections.
              </p>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full bg-white text-begin-teal px-4 py-2 rounded-card font-semibold hover:bg-begin-cream transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share with Colleagues
              </button>
            </div>

            {/* Success Stats */}
            <div className="card-begin">
              <h3 className="text-heading font-bold text-begin-blue mb-4">Your Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-begin-blue/70">Students helped</span>
                  <span className="font-bold text-begin-blue">{completedAssignments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-begin-blue/70">Success rate</span>
                  <span className="font-bold text-begin-blue">{completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-begin-blue/70">Time saved</span>
                  <span className="font-bold text-begin-blue">{completedAssignments * 2}h</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-begin">
              <h3 className="text-heading font-bold text-begin-blue mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/teacher/send-assessment"
                  className="flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                >
                  <Send className="h-5 w-5 text-begin-teal" />
                  Send New Assessment
                </Link>
                <Link
                  href="/teacher/dashboard"
                  className="flex items-center gap-3 p-3 text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors"
                >
                  <Users className="h-5 w-5 text-begin-teal" />
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card p-8 max-w-md w-full">
            <h3 className="text-heading-lg font-bold text-begin-blue mb-4">Share with Fellow Teachers</h3>
            <p className="text-begin-blue/80 mb-6">
              Help other educators discover the power of learning profiles. Share your unique referral link:
            </p>
            
            <div className="bg-begin-cream p-4 rounded-card mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-begin-gray rounded-card text-sm"
                />
                <button
                  onClick={handleCopyShareUrl}
                  className="btn-begin-primary text-sm px-4 py-2"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 btn-begin-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const text = `I've been using Begin Learning Profiles to understand my students better from Day 1. It's amazing! Check it out: ${shareUrl}`
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
                  window.open(url, '_blank')
                }}
                className="flex-1 btn-begin-primary"
              >
                Share on Twitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}