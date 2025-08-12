'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  School, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Trash2,
  Eye,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Settings,
  TestTube,
  Zap,
  Star,
  UserCheck,
  GraduationCap,
  Heart,
  Target
} from 'lucide-react'

interface TestTeacher {
  email: string
  name: string
  scenario: 'new' | 'experienced' | 'mixed_data' | 'substitute' | 'specialist'
  description: string
  school: string
  grade_level: string
  demo_data_level: 'minimal' | 'partial' | 'full'
  years_experience?: number
}

interface ScenarioResult {
  success: boolean
  message: string
  details?: {
    teachers: any[]
    classrooms: any[]
    students: any[]
    assessments: any[]
    errors: string[]
  }
}

interface NavigationTestResult {
  success: boolean
  results: Record<string, boolean>
  errors: string[]
}

export default function TestScenariosPage() {
  const [teachers, setTeachers] = useState<TestTeacher[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScenarioResult | null>(null)
  const [navResults, setNavResults] = useState<Record<string, NavigationTestResult>>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'parents' | 'scenarios' | 'navigation'>('overview')
  const [parentFlowResults, setParentFlowResults] = useState<any>(null)

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      const response = await fetch('/api/test-scenarios?action=list_teachers')
      const data = await response.json()
      if (data.success) {
        setTeachers(data.teachers)
      }
    } catch (error) {
      console.error('Failed to load teachers:', error)
    }
  }

  const runScenario = async (action: string, scenario?: string, teacherEmail?: string) => {
    setLoading(true)
    setResults(null)
    
    // Special handling for parent flow testing
    if (action === 'test_parent_flow') {
      setParentFlowResults(null)
    }
    
    try {
      const body: any = { action }
      if (scenario) body.scenario = scenario
      if (teacherEmail) body.teacherEmail = teacherEmail
      
      const response = await fetch('/api/test-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const result = await response.json()
      setResults(result)
      
      // Refresh teachers list after creation
      if (action.includes('create')) {
        setTimeout(loadTeachers, 1000)
      }
    } catch (error) {
      setResults({
        success: false,
        message: `Error: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const testNavigation = async (teacherEmail: string) => {
    try {
      const response = await fetch('/api/test-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_navigation', teacherEmail })
      })
      
      const result = await response.json()
      setNavResults(prev => ({ ...prev, [teacherEmail]: result }))
    } catch (error) {
      setNavResults(prev => ({ ...prev, [teacherEmail]: {
        success: false,
        results: {},
        errors: [error.message]
      }}))
    }
  }

  const scenarioColors = {
    new: 'from-blue-500 to-blue-600',
    experienced: 'from-green-500 to-green-600',
    mixed_data: 'from-purple-500 to-purple-600',
    specialist: 'from-orange-500 to-orange-600',
    substitute: 'from-gray-500 to-gray-600'
  }

  const scenarioIcons = {
    new: UserCheck,
    experienced: Star,
    mixed_data: BarChart3,
    specialist: GraduationCap,
    substitute: Heart
  }

  const scenarioStats = teachers.reduce((acc, teacher) => {
    acc[teacher.scenario] = (acc[teacher.scenario] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-begin-teal to-begin-cyan rounded-lg">
                <TestTube className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-begin-blue">Test Scenario Manager</h1>
                <p className="text-begin-blue/70">Create and manage realistic test environments</p>
              </div>
            </div>
            <Link 
              href="/teacher/dashboard"
              className="btn-begin-secondary flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Back to App
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-card shadow-sm mb-8">
          <div className="flex border-b border-begin-gray">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'teachers', name: 'Test Teachers', icon: Users },
              { id: 'parents', name: 'Parent Flow', icon: Heart },
              { id: 'scenarios', name: 'Scenarios', icon: Play },
              { id: 'navigation', name: 'Navigation Tests', icon: Eye }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-begin-teal border-b-2 border-begin-teal'
                      : 'text-begin-blue/70 hover:text-begin-blue'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(scenarioStats).map(([scenario, count]) => {
                const Icon = scenarioIcons[scenario as keyof typeof scenarioIcons]
                return (
                  <div key={scenario} className={`card-begin bg-gradient-to-br ${scenarioColors[scenario as keyof typeof scenarioColors]} text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 capitalize">{scenario.replace('_', ' ')}</p>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                      <Icon className="h-6 w-6 opacity-80" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-begin">
                <h2 className="text-heading-lg font-bold text-begin-blue mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => runScenario('create_comprehensive')}
                    disabled={loading}
                    className="w-full btn-begin-primary flex items-center justify-center gap-2 text-sm py-3"
                  >
                    <Zap className="h-4 w-4" />
                    Create Complete Test Environment
                  </button>
                  
                  <button
                    onClick={() => runScenario('cleanup')}
                    disabled={loading}
                    className="w-full btn-begin-secondary text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 text-sm py-3"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clean Up All Test Data
                  </button>
                </div>
              </div>

              <div className="card-begin">
                <h2 className="text-heading-lg font-bold text-begin-blue mb-6">Test Scenarios</h2>
                <div className="space-y-3">
                  {[
                    { scenario: 'new', label: 'New Teachers', desc: 'First-year teachers needing setup' },
                    { scenario: 'experienced', label: 'Experienced Teachers', desc: 'Veterans with full data' },
                    { scenario: 'mixed_data', label: 'Mixed Data', desc: 'Partial completion scenarios' },
                    { scenario: 'specialist', label: 'Specialists', desc: 'ESL, Special Ed teachers' },
                    { scenario: 'substitute', label: 'Substitutes', desc: 'Temporary assignments' }
                  ].map(({ scenario, label, desc }) => (
                    <button
                      key={scenario}
                      onClick={() => runScenario('create_specific', scenario)}
                      disabled={loading}
                      className="w-full p-3 text-left border border-begin-gray rounded-card hover:bg-begin-cream/50 transition-colors"
                    >
                      <div className="font-medium text-begin-blue">{label}</div>
                      <div className="text-sm text-begin-blue/70">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Display */}
            {results && (
              <div className="card-begin">
                <div className="flex items-center gap-3 mb-4">
                  {results.success ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  )}
                  <h3 className="text-heading-lg font-bold text-begin-blue">
                    {results.success ? 'Success!' : 'Error'}
                  </h3>
                </div>
                
                <div className="bg-begin-cream/50 rounded-card p-4 mb-4">
                  <p className="text-begin-blue">{results.message}</p>
                </div>

                {results.details && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-card">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{results.details.teachers.length}</div>
                      <div className="text-sm text-blue-600/70">Teachers</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-card">
                      <School className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{results.details.classrooms.length}</div>
                      <div className="text-sm text-green-600/70">Classrooms</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-card">
                      <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{results.details.students.length}</div>
                      <div className="text-sm text-purple-600/70">Students</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-card">
                      <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">{results.details.assessments.length}</div>
                      <div className="text-sm text-orange-600/70">Assessments</div>
                    </div>
                  </div>
                )}

                {results.details?.errors && results.details.errors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-card">
                    <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {results.details.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Parents Tab */}
        {activeTab === 'parents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-heading-lg font-bold text-begin-blue">Parent Invitation Flow Testing</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => runScenario('create_parent_accounts')}
                  disabled={loading}
                  className="btn-begin-secondary flex items-center gap-2 text-sm"
                >
                  <Users className="h-4 w-4" />
                  Create Parent Accounts
                </button>
                <button
                  onClick={() => runScenario('test_parent_flow')}
                  disabled={loading}
                  className="btn-begin-primary flex items-center gap-2 text-sm"
                >
                  <TestTube className="h-4 w-4" />
                  Test Parent Flow
                </button>
              </div>
            </div>

            {/* Parent Flow Results */}
            {results && results.summary && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="card-begin bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center">
                  <div className="text-2xl font-bold">{results.summary.total_invitations}</div>
                  <div className="text-sm opacity-90">Total Invitations</div>
                </div>
                <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white text-center">
                  <div className="text-2xl font-bold">{results.summary.completed}</div>
                  <div className="text-sm opacity-90">Completed</div>
                </div>
                <div className="card-begin bg-gradient-to-br from-yellow-500 to-yellow-600 text-white text-center">
                  <div className="text-2xl font-bold">{results.summary.partial}</div>
                  <div className="text-sm opacity-90">Partial</div>
                </div>
                <div className="card-begin bg-gradient-to-br from-red-500 to-red-600 text-white text-center">
                  <div className="text-2xl font-bold">{results.summary.abandoned + results.summary.refused}</div>
                  <div className="text-sm opacity-90">Not Completed</div>
                </div>
                <div className="card-begin bg-gradient-to-br from-purple-500 to-purple-600 text-white text-center">
                  <div className="text-2xl font-bold">{results.summary.completion_rate}%</div>
                  <div className="text-sm opacity-90">Completion Rate</div>
                </div>
              </div>
            )}

            {/* Parent Scenarios */}
            <div className="card-begin">
              <h3 className="text-heading font-bold text-begin-blue mb-4">Parent Test Scenarios</h3>
              <div className="space-y-4">
                {[
                  { scenario: 'compliant_parent', name: 'Sarah Johnson', desc: 'Engaged parent - responds quickly', color: 'green' },
                  { scenario: 'busy_parent', name: 'Michael Rodriguez', desc: 'Working parent - needs reminders', color: 'yellow' },
                  { scenario: 'non_english', name: 'Maria Garcia', desc: 'Spanish-speaking parent', color: 'blue' },
                  { scenario: 'tech_challenged', name: 'Dorothy Wilson', desc: 'Struggles with technology', color: 'orange' },
                  { scenario: 'skeptical_parent', name: 'Jennifer Chen', desc: 'Privacy-concerned parent', color: 'red' }
                ].map(({ scenario, name, desc, color }) => (
                  <div key={scenario} className="flex items-center justify-between p-4 bg-begin-cream/30 rounded-card">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                      <div>
                        <div className="font-medium text-begin-blue">{name}</div>
                        <div className="text-sm text-begin-blue/70">{desc}</div>
                      </div>
                    </div>
                    {results?.results?.[scenario] && (
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          results.results[scenario].final_outcome === 'completed' ? 'text-green-600' :
                          results.results[scenario].final_outcome === 'partial' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {results.results[scenario].final_outcome}
                        </div>
                        <div className="text-xs text-begin-blue/50">
                          {results.results[scenario].engagement_metrics.completion_percentage}% complete
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Common Barriers */}
            {results?.summary?.common_barriers && (
              <div className="card-begin">
                <h3 className="text-heading font-bold text-begin-blue mb-4">Common Barriers</h3>
                <div className="space-y-2">
                  {results.summary.common_barriers.map((barrier, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-card">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-red-700">{barrier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="card-begin bg-begin-teal/5 border border-begin-teal/20">
              <h3 className="text-heading font-bold text-begin-blue mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-begin-teal" />
                Recommendations for Parent Engagement
              </h3>
              <div className="space-y-3 text-sm text-begin-blue/80">
                <p>• Send invitations during optimal times (Tuesday-Thursday, 7-9 PM)</p>
                <p>• Include estimated completion time (10-15 minutes) in invitation</p>
                <p>• Provide mobile-friendly assessment links</p>
                <p>• Send automatic reminders after 3 days for non-responses</p>
                <p>• Offer multilingual support for non-English speaking families</p>
                <p>• Include phone support option for tech-challenged parents</p>
                <p>• Address privacy concerns with clear data usage statements</p>
                <p>• Allow assessment saving and resuming for busy parents</p>
              </div>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-heading-lg font-bold text-begin-blue">Test Teachers ({teachers.length})</h2>
              <button
                onClick={loadTeachers}
                className="btn-begin-secondary flex items-center gap-2 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="grid gap-4">
              {teachers.map((teacher) => {
                const Icon = scenarioIcons[teacher.scenario]
                return (
                  <div key={teacher.email} className="card-begin">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${scenarioColors[teacher.scenario]} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-begin-blue">{teacher.name}</h3>
                          <p className="text-sm text-begin-blue/70">{teacher.email}</p>
                          <p className="text-sm text-begin-blue/70">{teacher.school} • {teacher.grade_level}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              teacher.scenario === 'new' ? 'bg-blue-100 text-blue-700' :
                              teacher.scenario === 'experienced' ? 'bg-green-100 text-green-700' :
                              teacher.scenario === 'mixed_data' ? 'bg-purple-100 text-purple-700' :
                              teacher.scenario === 'specialist' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {teacher.scenario.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-begin-blue/50">
                              {teacher.demo_data_level} data • {teacher.years_experience || 0} years
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teacher/login?email=${encodeURIComponent(teacher.email)}`}
                          className="btn-begin-secondary text-sm px-3 py-2 flex items-center gap-2"
                        >
                          <Eye className="h-3 w-3" />
                          Login As
                        </Link>
                        <button
                          onClick={() => testNavigation(teacher.email)}
                          className="btn-begin-primary text-sm px-3 py-2 flex items-center gap-2"
                        >
                          <TestTube className="h-3 w-3" />
                          Test
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-begin-blue/70">
                      {teacher.description}
                    </div>
                    
                    {/* Navigation Test Results */}
                    {navResults[teacher.email] && (
                      <div className="mt-4 p-3 bg-begin-cream/50 rounded-card">
                        <div className="flex items-center gap-2 mb-2">
                          {navResults[teacher.email].success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium text-begin-blue">Navigation Test Results</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {Object.entries(navResults[teacher.email].results).map(([key, success]) => (
                            <div key={key} className={`flex items-center gap-1 ${success ? 'text-green-600' : 'text-red-600'}`}>
                              {success ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                              {key.replace('_', ' ')}
                            </div>
                          ))}
                        </div>
                        {navResults[teacher.email].errors.length > 0 && (
                          <div className="mt-2 text-xs text-red-600">
                            Errors: {navResults[teacher.email].errors.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {teachers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-begin-gray mx-auto mb-4" />
                <h3 className="text-heading font-semibold text-begin-blue mb-2">No test teachers found</h3>
                <p className="text-begin-blue/70 mb-4">Create test scenarios to see teachers here</p>
                <button
                  onClick={() => runScenario('create_comprehensive')}
                  className="btn-begin-primary inline-flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Create Test Environment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
              <p className="text-begin-blue font-medium">Creating test scenario...</p>
              <p className="text-sm text-begin-blue/70 mt-1">This may take a few minutes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}