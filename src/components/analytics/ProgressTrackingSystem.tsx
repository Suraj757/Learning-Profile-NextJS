'use client'
import { useState, useMemo } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  Eye,
  Filter,
  Download
} from 'lucide-react'
import { SampleProfile } from '@/lib/sample-profiles'

interface ProgressTrackingSystemProps {
  students: SampleProfile[]
  classroomName: string
  onExportData?: () => void
}

interface AssessmentData {
  date: string
  student: string
  completed: boolean
  completionTime?: number // minutes
  parentEngagement: 'high' | 'medium' | 'low'
  scores: Record<string, number>
}

interface ParentEngagementMetrics {
  totalParents: number
  responseRate: number
  avgCompletionTime: number
  followUpNeeded: number
  highlyEngaged: number
}

export default function ProgressTrackingSystem({ 
  students, 
  classroomName,
  onExportData 
}: ProgressTrackingSystemProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedMetric, setSelectedMetric] = useState<'completion' | 'engagement' | 'scores'>('completion')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')

  // Generate mock timeline data based on students
  const timelineData = useMemo(() => {
    const data: AssessmentData[] = []
    const now = new Date()
    
    students.forEach((student, index) => {
      // Generate assessment completion dates (some completed, some pending)
      const daysAgo = Math.floor(Math.random() * 30) + 1
      const completionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      
      // 80% completion rate for demo
      const completed = Math.random() > 0.2
      
      if (completed) {
        data.push({
          date: completionDate.toISOString().split('T')[0],
          student: student.childName,
          completed: true,
          completionTime: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
          parentEngagement: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          scores: student.scores
        })
      } else {
        // Pending assessment
        data.push({
          date: completionDate.toISOString().split('T')[0],
          student: student.childName,
          completed: false,
          parentEngagement: 'low',
          scores: {}
        })
      }
    })
    
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [students])

  // Calculate completion rate over time
  const completionTrendData = useMemo(() => {
    const completedByDate = timelineData
      .filter(d => d.completed)
      .reduce((acc, item) => {
        const date = item.date
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const totalByDate = timelineData
      .reduce((acc, item) => {
        const date = item.date
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return Object.keys(completedByDate)
      .sort()
      .map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: completedByDate[date] || 0,
        total: totalByDate[date] || 0,
        rate: Math.round(((completedByDate[date] || 0) / (totalByDate[date] || 1)) * 100)
      }))
  }, [timelineData])

  // Calculate parent engagement metrics
  const parentEngagementMetrics = useMemo((): ParentEngagementMetrics => {
    const completedAssessments = timelineData.filter(d => d.completed)
    const totalParents = students.length
    const responseRate = Math.round((completedAssessments.length / totalParents) * 100)
    const avgCompletionTime = completedAssessments.reduce((sum, d) => sum + (d.completionTime || 0), 0) / completedAssessments.length
    const highlyEngaged = completedAssessments.filter(d => d.parentEngagement === 'high').length
    const followUpNeeded = timelineData.filter(d => !d.completed || d.parentEngagement === 'low').length

    return {
      totalParents,
      responseRate,
      avgCompletionTime: Math.round(avgCompletionTime),
      followUpNeeded,
      highlyEngaged
    }
  }, [timelineData, students.length])

  // Score evolution data
  const scoreEvolutionData = useMemo(() => {
    if (selectedStudent === 'all') {
      // Average scores over time
      const scoresByDate = timelineData
        .filter(d => d.completed)
        .reduce((acc, item) => {
          const date = item.date
          if (!acc[date]) {
            acc[date] = { 
              date, 
              scores: Object.keys(item.scores).reduce((s, key) => ({ ...s, [key]: [] }), {} as Record<string, number[]>)
            }
          }
          
          Object.entries(item.scores).forEach(([key, value]) => {
            acc[date].scores[key].push(value)
          })
          
          return acc
        }, {} as Record<string, { date: string; scores: Record<string, number[]> }>)

      return Object.values(scoresByDate)
        .map(({ date, scores }) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          ...Object.fromEntries(
            Object.entries(scores).map(([key, values]) => [
              key.replace(' ', ''),
              values.reduce((sum, v) => sum + v, 0) / values.length
            ])
          )
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else {
      // Individual student progress (mock trend data)
      const student = students.find(s => s.childName === selectedStudent)
      if (!student) return []
      
      // Generate 5 data points over time showing progression
      return Array.from({ length: 5 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (4 - i) * 7)
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          ...Object.fromEntries(
            Object.entries(student.scores).map(([key, value]) => [
              key.replace(' ', ''),
              value + (Math.random() - 0.5) * 0.5 // Small variations
            ])
          )
        }
      })
    }
  }, [timelineData, selectedStudent, students])

  // Engagement distribution data
  const engagementDistribution = useMemo(() => {
    const distribution = timelineData
      .filter(d => d.completed)
      .reduce((acc, item) => {
        acc[item.parentEngagement] = (acc[item.parentEngagement] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return [
      { name: 'High Engagement', value: distribution.high || 0, color: '#10B981' },
      { name: 'Medium Engagement', value: distribution.medium || 0, color: '#F59E0B' },
      { name: 'Low Engagement', value: distribution.low || 0, color: '#EF4444' }
    ]
  }, [timelineData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-begin-blue">Progress Tracking Dashboard</h2>
          <p className="text-begin-blue/70">{classroomName} • Assessment completion and parent engagement</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-begin-gray rounded-card text-sm"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="quarter">Past Quarter</option>
            <option value="year">Past Year</option>
          </select>
          <button
            onClick={onExportData}
            className="btn-begin-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-blue/80 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Response Rate</p>
              <p className="text-2xl font-bold">{parentEngagementMetrics.responseRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">High Engagement</p>
              <p className="text-2xl font-bold">{parentEngagementMetrics.highlyEngaged}</p>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="card-begin bg-gradient-to-br from-begin-teal to-begin-teal/80 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg. Time</p>
              <p className="text-2xl font-bold">{parentEngagementMetrics.avgCompletionTime}m</p>
            </div>
            <Clock className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="card-begin bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Follow-up Needed</p>
              <p className="text-2xl font-bold">{parentEngagementMetrics.followUpNeeded}</p>
            </div>
            <Mail className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="card-begin bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Parents</p>
              <p className="text-2xl font-bold">{parentEngagementMetrics.totalParents}</p>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Completion Timeline */}
        <div className="card-begin">
          <h3 className="text-heading-lg font-bold text-begin-blue mb-6">Assessment Completion Timeline</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'rate' ? 'Completion Rate (%)' : 'Assessments']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#007A72"
                  fill="#007A72"
                  fillOpacity={0.6}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Parent Engagement Distribution */}
        <div className="card-begin">
          <h3 className="text-heading-lg font-bold text-begin-blue mb-6">Parent Engagement Levels</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engagementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Score Evolution */}
      <div className="card-begin">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-heading-lg font-bold text-begin-blue">Score Evolution Over Time</h3>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-begin-blue/70" />
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-3 py-1 border border-begin-gray rounded-card text-sm"
            >
              <option value="all">Class Average</option>
              {students.map(student => (
                <option key={student.id} value={student.childName}>
                  {student.childName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreEvolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                domain={[0, 5]}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line type="monotone" dataKey="Communication" stroke="#007A72" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Collaboration" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Content" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="CriticalThinking" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="CreativeInnovation" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Confidence" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assessment Status Table */}
      <div className="card-begin">
        <h3 className="text-heading-lg font-bold text-begin-blue mb-6">Individual Assessment Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-begin-gray">
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Student</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Status</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Completion Date</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Time Taken</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Parent Engagement</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Action</th>
              </tr>
            </thead>
            <tbody>
              {timelineData.map((assessment, index) => (
                <tr key={index} className="border-b border-begin-gray/50 hover:bg-begin-cream/30">
                  <td className="py-3 px-4 font-medium text-begin-blue">{assessment.student}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assessment.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assessment.completed ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-begin-blue/70">
                    {assessment.completed ? new Date(assessment.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-begin-blue/70">
                    {assessment.completionTime ? `${assessment.completionTime}m` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assessment.parentEngagement === 'high' ? 'bg-green-100 text-green-800' :
                      assessment.parentEngagement === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {assessment.parentEngagement === 'high' ? 'High' :
                       assessment.parentEngagement === 'medium' ? 'Medium' : 'Low'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {assessment.completed ? (
                      <button className="text-begin-teal hover:text-begin-teal-hover text-sm font-medium">
                        View Results
                      </button>
                    ) : (
                      <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                        Send Reminder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}