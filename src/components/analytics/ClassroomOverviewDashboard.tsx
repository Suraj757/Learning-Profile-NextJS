'use client'
import { useState, useMemo } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Filter,
  Eye,
  Brain,
  Target,
  BookOpen
} from 'lucide-react'
import { SampleProfile } from '@/lib/sample-profiles'
import { LearningStyle, SixCScores } from '@/lib/types-enhanced'

interface ClassroomOverviewDashboardProps {
  students: SampleProfile[]
  classroomName: string
  grade: string
  onExport?: () => void
  onStudentSelect?: (student: SampleProfile) => void
}

const LEARNING_STYLE_COLORS = {
  creative: '#F59E0B',
  analytical: '#3B82F6', 
  collaborative: '#10B981',
  confident: '#8B5CF6'
}

const PERSONALITY_COLORS = {
  'Creative Collaborator': '#F59E0B',
  'Analytical Scholar': '#3B82F6',
  'Social Connector': '#10B981',
  'Independent Explorer': '#6366F1',
  'Confident Builder': '#8B5CF6',
  'Creative Problem Solver': '#EC4899',
  'Emerging Scholar': '#14B8A6',
  'Natural Leader': '#F97316'
}

export default function ClassroomOverviewDashboard({ 
  students, 
  classroomName, 
  grade,
  onExport,
  onStudentSelect 
}: ClassroomOverviewDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<'all' | keyof SixCScores>('all')

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!students.length) return null

    // Personality type distribution
    const personalityDistribution = students.reduce((acc, student) => {
      const type = student.personalityLabel
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Average 6C scores
    const avgScores = {
      Communication: students.reduce((sum, s) => sum + s.scores.Communication, 0) / students.length,
      Collaboration: students.reduce((sum, s) => sum + s.scores.Collaboration, 0) / students.length,
      Content: students.reduce((sum, s) => sum + s.scores.Content, 0) / students.length,
      'Critical Thinking': students.reduce((sum, s) => sum + s.scores['Critical Thinking'], 0) / students.length,
      'Creative Innovation': students.reduce((sum, s) => sum + s.scores['Creative Innovation'], 0) / students.length,
      Confidence: students.reduce((sum, s) => sum + s.scores.Confidence, 0) / students.length
    }

    // Individual student progress tracking
    const studentProgress = students.map(student => ({
      name: student.childName,
      overall: Object.values(student.scores).reduce((sum, score) => sum + score, 0) / 6,
      ...student.scores
    }))

    // Risk assessment (simplified - based on lower scores)
    const riskAssessment = students.map(student => {
      const avgScore = Object.values(student.scores).reduce((sum, score) => sum + score, 0) / 6
      const minScore = Math.min(...Object.values(student.scores))
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low'
      if (avgScore < 3.0 || minScore < 2.5) riskLevel = 'high'
      else if (avgScore < 3.5 || minScore < 3.0) riskLevel = 'medium'
      
      return {
        student: student.childName,
        riskLevel,
        avgScore,
        minScore,
        areas: Object.entries(student.scores)
          .filter(([_, score]) => score < 3.5)
          .map(([area, _]) => area)
      }
    })

    const riskCounts = riskAssessment.reduce((acc, item) => {
      acc[item.riskLevel]++
      return acc
    }, { low: 0, medium: 0, high: 0 })

    return {
      personalityDistribution,
      avgScores,
      studentProgress,
      riskAssessment,
      riskCounts,
      totalStudents: students.length
    }
  }, [students])

  if (!analytics) {
    return (
      <div className="card-begin p-8 text-center">
        <Users className="h-12 w-12 text-begin-gray mx-auto mb-4" />
        <h3 className="text-heading font-semibold text-begin-blue mb-2">No Student Data</h3>
        <p className="text-begin-blue/70">Add students to see classroom analytics</p>
      </div>
    )
  }

  // Prepare chart data
  const personalityChartData = Object.entries(analytics.personalityDistribution).map(([type, count]) => ({
    name: type,
    value: count,
    percentage: Math.round((count / analytics.totalStudents) * 100)
  }))

  const radarChartData = [
    Object.entries(analytics.avgScores).map(([category, score]) => ({
      category: category.replace(' ', '\n'),
      score: score,
      fullMark: 5
    }))
  ][0]

  const progressChartData = selectedMetric === 'all' 
    ? analytics.studentProgress.map(student => ({
        name: student.name,
        score: student.overall
      }))
    : analytics.studentProgress.map(student => ({
        name: student.name,
        score: student[selectedMetric as keyof typeof student] as number
      }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-begin-blue">{classroomName} Analytics</h1>
          <p className="text-begin-blue/70">{grade} • {analytics.totalStudents} students</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onExport}
            className="btn-begin-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-begin bg-gradient-to-br from-begin-blue to-begin-blue/80 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Students</p>
              <p className="text-2xl font-bold">{analytics.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="card-begin bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Low Risk</p>
              <p className="text-2xl font-bold">{analytics.riskCounts.low}</p>
            </div>
            <Target className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="card-begin bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Medium Risk</p>
              <p className="text-2xl font-bold">{analytics.riskCounts.medium}</p>
            </div>
            <Eye className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="card-begin bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Needs Support</p>
              <p className="text-2xl font-bold">{analytics.riskCounts.high}</p>
            </div>
            <AlertTriangle className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Personality Distribution */}
        <div className="card-begin">
          <h3 className="text-heading-lg font-bold text-begin-blue mb-6">Learning Profile Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={personalityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {personalityChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PERSONALITY_COLORS[entry.name as keyof typeof PERSONALITY_COLORS] || '#8884d8'} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average 6C Scores */}
        <div className="card-begin">
          <h3 className="text-heading-lg font-bold text-begin-blue mb-6">Class Average - 6C Skills</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Class Average"
                  dataKey="score"
                  stroke="#007A72"
                  fill="#007A72"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Individual Student Progress */}
      <div className="card-begin">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-heading-lg font-bold text-begin-blue">Individual Student Tracking</h3>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-begin-blue/70" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 border border-begin-gray rounded-card text-sm"
            >
              <option value="all">Overall Average</option>
              <option value="Communication">Communication</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Content">Content</option>
              <option value="Critical Thinking">Critical Thinking</option>
              <option value="Creative Innovation">Creative Innovation</option>
              <option value="Confidence">Confidence</option>
            </select>
          </div>
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 5]}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(1), selectedMetric === 'all' ? 'Overall' : selectedMetric]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="score" 
                fill="#007A72"
                radius={[4, 4, 0, 0]}
                onClick={(data) => {
                  const student = students.find(s => s.childName === data.name)
                  if (student && onStudentSelect) {
                    onStudentSelect(student)
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Assessment Table */}
      <div className="card-begin">
        <h3 className="text-heading-lg font-bold text-begin-blue mb-6">Support Recommendations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-begin-gray">
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Student</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Risk Level</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Average Score</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Areas for Growth</th>
                <th className="text-left py-3 px-4 font-medium text-begin-blue">Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics.riskAssessment
                .sort((a, b) => {
                  const riskOrder = { high: 3, medium: 2, low: 1 }
                  return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
                })
                .map((assessment) => (
                <tr key={assessment.student} className="border-b border-begin-gray/50 hover:bg-begin-cream/30">
                  <td className="py-3 px-4 font-medium text-begin-blue">{assessment.student}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assessment.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      assessment.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {assessment.riskLevel === 'high' ? 'Needs Support' :
                       assessment.riskLevel === 'medium' ? 'Monitor' : 'On Track'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-begin-blue/70">{assessment.avgScore.toFixed(1)}/5.0</td>
                  <td className="py-3 px-4 text-begin-blue/70">
                    {assessment.areas.length > 0 ? assessment.areas.join(', ') : 'All areas strong'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        const student = students.find(s => s.childName === assessment.student)
                        if (student && onStudentSelect) {
                          onStudentSelect(student)
                        }
                      }}
                      className="text-begin-teal hover:text-begin-teal-hover text-sm font-medium"
                    >
                      View Profile
                    </button>
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