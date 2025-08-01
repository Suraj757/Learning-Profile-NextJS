'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Eye,
  Download,
  Users,
  BarChart3,
  Star,
  TrendingUp
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import AuthRequired from '@/components/teacher/AuthRequired'

interface StudentProfile {
  id: number
  child_name: string
  parent_email: string
  completed_at: string
  assessment_results: {
    id: number
    personality_label: string
    scores: Record<string, number>
    grade_level: string
  }
}

export default function TeacherProfilesPage() {
  const { teacher } = useTeacherAuth()
  const [profiles, setProfiles] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalProfiles: 0,
    personalityTypes: {} as Record<string, number>,
    averageScores: {} as Record<string, number>
  })

  useEffect(() => {
    if (teacher) {
      loadProfiles()
    }
  }, [teacher])

  const loadProfiles = async () => {
    if (!teacher) return

    try {
      const response = await fetch(`/api/profiles?teacherId=${teacher.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setProfiles(data.assignments || [])
        calculateAnalytics(data.assignments || [])
      } else {
        console.error('Error fetching profiles:', data.error)
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (profileData: StudentProfile[]) => {
    const personalityTypes: Record<string, number> = {}
    const scoresSums: Record<string, number> = {}
    const scoresCounts: Record<string, number> = {}

    profileData.forEach(profile => {
      const result = profile.assessment_results
      if (!result) return

      // Count personality types
      personalityTypes[result.personality_label] = (personalityTypes[result.personality_label] || 0) + 1

      // Sum scores for averages
      Object.entries(result.scores).forEach(([key, value]) => {
        scoresSums[key] = (scoresSums[key] || 0) + value
        scoresCounts[key] = (scoresCounts[key] || 0) + 1
      })
    })

    // Calculate averages
    const averageScores: Record<string, number> = {}
    Object.keys(scoresSums).forEach(key => {
      averageScores[key] = Math.round(scoresSums[key] / scoresCounts[key])
    })

    setAnalytics({
      totalProfiles: profileData.length,
      personalityTypes,
      averageScores
    })
  }

  if (loading) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-begin-cream flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
            <p className="text-begin-blue">Loading student profiles...</p>
          </div>
        </div>
      </AuthRequired>
    )
  }

  const topPersonalityType = Object.entries(analytics.personalityTypes)
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <AuthRequired>
      <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">Student Profiles</span>
                <p className="text-sm text-begin-blue/70">View completed learning profiles</p>
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
        {/* Analytics Overview */}
        {analytics.totalProfiles > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-blue/80 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Completed Profiles</p>
                  <p className="text-2xl font-bold">{analytics.totalProfiles}</p>
                </div>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </div>

            <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-teal/80 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Most Common Type</p>
                  <p className="text-lg font-bold">
                    {topPersonalityType ? topPersonalityType[0] : 'N/A'}
                  </p>
                  <p className="text-xs opacity-75">
                    {topPersonalityType ? `${topPersonalityType[1]} students` : ''}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 opacity-80" />
              </div>
            </div>

            <div className="card-begin bg-gradient-to-br from-begin-cyan to-begin-cyan/80 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Class Average</p>
                  <p className="text-lg font-bold">
                    {Object.keys(analytics.averageScores).length > 0 
                      ? `${Math.round(Object.values(analytics.averageScores).reduce((a, b) => a + b, 0) / Object.values(analytics.averageScores).length)}/5`
                      : 'N/A'
                    }
                  </p>
                  <p className="text-xs opacity-75">Across all 6C areas</p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </div>
          </div>
        )}

        <div className="card-begin">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-lg font-bold text-begin-blue">Student Learning Profiles</h2>
            {profiles.length > 0 && (
              <button
                onClick={() => {
                  // TODO: Implement CSV export
                  console.log('Export functionality coming soon')
                }}
                className="btn-begin-secondary text-sm px-4 py-2 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            )}
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-begin-gray mx-auto mb-4" />
              <h3 className="text-heading font-semibold text-begin-blue mb-2">No completed profiles yet</h3>
              <p className="text-begin-blue/70 mb-4">
                Student profiles will appear here once parents complete their assessments
              </p>
              <Link
                href="/teacher/send-assessment"
                className="btn-begin-primary inline-flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Send Your First Assessment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-begin-gray">
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Learning Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Grade</th>
                    <th className="text-left py-3 px-4 font-semibold text-begin-blue">Completed</th>
                    <th className="text-right py-3 px-4 font-semibold text-begin-blue">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-begin-gray/50 hover:bg-begin-cream/30">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-begin-blue">{profile.child_name}</p>
                          <p className="text-sm text-begin-blue/60">{profile.parent_email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-begin-teal rounded-full"></div>
                          <span className="font-medium text-begin-blue">
                            {profile.assessment_results?.personality_label || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-begin-blue">
                          {profile.assessment_results?.grade_level || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-begin-blue/70">
                          {new Date(profile.completed_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/results/${profile.assessment_results?.id}`}
                            className="p-2 text-begin-teal hover:text-begin-teal-hover transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Insights */}
        {analytics.totalProfiles > 2 && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="card-begin">
              <h3 className="text-heading font-bold text-begin-blue mb-4">Personality Type Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analytics.personalityTypes)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-begin-blue font-medium">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-begin-gray w-20 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-begin-teal h-full rounded-full"
                            style={{ width: `${(count / analytics.totalProfiles) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-begin-blue/70 min-w-[2rem]">{count}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="card-begin">
              <h3 className="text-heading font-bold text-begin-blue mb-4">Class 6C Averages</h3>
              <div className="space-y-3">
                {Object.entries(analytics.averageScores).map(([skill, average]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-begin-blue font-medium capitalize">{skill}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= average 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-begin-blue/70 min-w-[2rem]">{average}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthRequired>
  )
}