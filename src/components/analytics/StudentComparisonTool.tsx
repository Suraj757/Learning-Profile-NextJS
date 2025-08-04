'use client'
import { useState, useMemo } from 'react'
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { 
  Users, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  Target,
  Lightbulb,
  UserPlus,
  RefreshCw
} from 'lucide-react'
import { SampleProfile } from '@/lib/sample-profiles'

interface StudentComparisonToolProps {
  students: SampleProfile[]
  initialStudent1?: SampleProfile
  initialStudent2?: SampleProfile
  onGroupingRecommendation?: (students: SampleProfile[]) => void
}

const COMPARISON_COLORS = {
  student1: '#007A72',
  student2: '#F59E0B'
}

export default function StudentComparisonTool({ 
  students, 
  initialStudent1,
  initialStudent2,
  onGroupingRecommendation 
}: StudentComparisonToolProps) {
  const [student1, setStudent1] = useState<SampleProfile | null>(initialStudent1 || null)
  const [student2, setStudent2] = useState<SampleProfile | null>(initialStudent2 || null)
  const [comparisonMode, setComparisonMode] = useState<'radar' | 'bars'>('radar')

  // Generate comparison insights
  const comparisonInsights = useMemo(() => {
    if (!student1 || !student2) return null

    const scores1 = student1.scores
    const scores2 = student2.scores
    
    const strengths1: string[] = []
    const strengths2: string[] = []
    const complementary: string[] = []
    const similar: string[] = []

    Object.entries(scores1).forEach(([category, score1]) => {
      const score2 = scores2[category]
      const diff = Math.abs(score1 - score2)
      
      if (score1 >= 4.0 && score2 < 3.5) {
        strengths1.push(category)
      } else if (score2 >= 4.0 && score1 < 3.5) {
        strengths2.push(category)
      } else if (diff >= 1.5) {
        complementary.push(category)
      } else if (Math.abs(score1 - score2) <= 0.5 && score1 >= 3.5 && score2 >= 3.5) {
        similar.push(category)
      }
    })

    // Calculate compatibility score
    const compatibilityFactors = {
      complementary: complementary.length * 2,
      similar: similar.length * 1,
      personalityMatch: student1.personalityLabel === student2.personalityLabel ? -1 : 1
    }
    
    const compatibilityScore = Math.max(0, Math.min(10, 
      5 + compatibilityFactors.complementary + compatibilityFactors.similar + compatibilityFactors.personalityMatch
    ))

    // Generate grouping recommendations
    const groupingType = compatibilityScore >= 7 ? 'Excellent Partnership' :
                        compatibilityScore >= 5 ? 'Good Collaboration' :
                        'Needs Structured Support'

    const recommendations = []
    
    if (complementary.length > 0) {
      recommendations.push(`Leverage complementary skills in ${complementary.join(', ')} through peer tutoring`)
    }
    
    if (similar.length > 0) {
      recommendations.push(`Build on shared strengths in ${similar.join(', ')} for collaborative projects`)
    }
    
    if (strengths1.length > 0) {
      recommendations.push(`${student1.childName} can mentor in ${strengths1.join(', ')}`)
    }
    
    if (strengths2.length > 0) {
      recommendations.push(`${student2.childName} can mentor in ${strengths2.join(', ')}`)
    }

    return {
      strengths1,
      strengths2,
      complementary,
      similar,
      compatibilityScore,
      groupingType,
      recommendations
    }
  }, [student1, student2])

  // Prepare chart data
  const radarData = useMemo(() => {
    if (!student1 || !student2) return []
    
    return Object.keys(student1.scores).map(category => ({
      category: category.replace(' ', '\n'),
      [student1.childName]: student1.scores[category],
      [student2.childName]: student2.scores[category],
      fullMark: 5
    }))
  }, [student1, student2])

  const barData = useMemo(() => {
    if (!student1 || !student2) return []
    
    return Object.entries(student1.scores).map(([category, score1]) => ({
      category: category.replace(' ', ' '),
      [student1.childName]: score1,
      [student2.childName]: student2!.scores[category]
    }))
  }, [student1, student2])

  const handleRandomComparison = () => {
    const shuffled = [...students].sort(() => 0.5 - Math.random())
    setStudent1(shuffled[0])
    setStudent2(shuffled[1])
  }

  const generateGroupingSuggestions = () => {
    if (!comparisonInsights || !student1 || !student2) return

    // Find other students who would work well with this pair
    const otherStudents = students.filter(s => s.id !== student1.id && s.id !== student2.id)
    const suggestedGroup = [student1, student2]
    
    // Add 1-2 more students who complement the pair
    const candidates = otherStudents
      .map(student => {
        const avgScore = Object.values(student.scores).reduce((sum, score) => sum + score, 0) / 6
        const personality = student.personalityLabel
        
        // Simple compatibility logic
        let score = 0
        if (comparisonInsights.complementary.length > 0) score += 2
        if (personality !== student1.personalityLabel && personality !== student2.personalityLabel) score += 1
        if (avgScore >= 3.5) score += 1
        
        return { student, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(c => c.student)

    suggestedGroup.push(...candidates)
    
    if (onGroupingRecommendation) {
      onGroupingRecommendation(suggestedGroup)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-begin-blue">Student Comparison Tool</h2>
          <p className="text-begin-blue/70">Compare learning profiles to optimize partnerships and groupings</p>
        </div>
        <button
          onClick={handleRandomComparison}
          className="btn-begin-secondary flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Random Pair
        </button>
      </div>

      {/* Student Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-begin">
          <h3 className="text-heading font-bold text-begin-blue mb-4">Student 1</h3>
          <select
            value={student1?.id || ''}
            onChange={(e) => {
              const selected = students.find(s => s.id === e.target.value)
              setStudent1(selected || null)
            }}
            className="w-full px-3 py-2 border border-begin-gray rounded-card"
          >
            <option value="">Select a student...</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.childName} - {student.personalityLabel}
              </option>
            ))}
          </select>
          
          {student1 && (
            <div className="mt-4 p-4 bg-begin-cream/30 rounded-card">
              <h4 className="font-semibold text-begin-blue">{student1.childName}</h4>
              <p className="text-sm text-begin-blue/70 mb-2">{student1.personalityLabel}</p>
              <p className="text-sm text-begin-blue/70">{student1.description}</p>
            </div>
          )}
        </div>

        <div className="card-begin">
          <h3 className="text-heading font-bold text-begin-blue mb-4">Student 2</h3>
          <select
            value={student2?.id || ''}
            onChange={(e) => {
              const selected = students.find(s => s.id === e.target.value)
              setStudent2(selected || null)
            }}
            className="w-full px-3 py-2 border border-begin-gray rounded-card"
          >
            <option value="">Select a student...</option>
            {students.filter(s => s.id !== student1?.id).map(student => (
              <option key={student.id} value={student.id}>
                {student.childName} - {student.personalityLabel}
              </option>
            ))}
          </select>
          
          {student2 && (
            <div className="mt-4 p-4 bg-begin-cream/30 rounded-card">
              <h4 className="font-semibold text-begin-blue">{student2.childName}</h4>
              <p className="text-sm text-begin-blue/70 mb-2">{student2.personalityLabel}</p>
              <p className="text-sm text-begin-blue/70">{student2.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonInsights && student1 && student2 && (
        <>
          {/* Compatibility Score */}
          <div className="card-begin bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading-lg font-bold text-begin-blue">Partnership Compatibility</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-begin-teal">
                  {comparisonInsights.compatibilityScore}/10
                </div>
                <div className="text-sm text-begin-blue/70">{comparisonInsights.groupingType}</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-begin-teal to-begin-cyan h-3 rounded-full transition-all duration-500"
                style={{ width: `${comparisonInsights.compatibilityScore * 10}%` }}
              />
            </div>
          </div>

          {/* Visualization Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border border-begin-gray bg-white p-1">
              <button
                onClick={() => setComparisonMode('radar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  comparisonMode === 'radar' 
                    ? 'bg-begin-teal text-white' 
                    : 'text-begin-blue hover:bg-begin-cream/50'
                }`}
              >
                Radar View
              </button>
              <button
                onClick={() => setComparisonMode('bars')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  comparisonMode === 'bars' 
                    ? 'bg-begin-teal text-white' 
                    : 'text-begin-blue hover:bg-begin-cream/50'
                }`}
              >
                Bar Chart
              </button>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="card-begin">
            <h3 className="text-heading-lg font-bold text-begin-blue mb-6">Skills Comparison</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {comparisonMode === 'radar' ? (
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                    <Radar
                      name={student1.childName}
                      dataKey={student1.childName}
                      stroke={COMPARISON_COLORS.student1}
                      fill={COMPARISON_COLORS.student1}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name={student2.childName}
                      dataKey={student2.childName}
                      stroke={COMPARISON_COLORS.student2}
                      fill={COMPARISON_COLORS.student2}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                ) : (
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip />
                    <Bar dataKey={student1.childName} fill={COMPARISON_COLORS.student1} />
                    <Bar dataKey={student2.childName} fill={COMPARISON_COLORS.student2} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths & Growth Areas */}
            <div className="card-begin">
              <h3 className="text-heading-lg font-bold text-begin-blue mb-4">Individual Strengths</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-begin-teal mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {student1.childName}'s Strengths
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {comparisonInsights.strengths1.map(strength => (
                      <span key={strength} className="px-2 py-1 bg-begin-teal/10 text-begin-teal text-xs rounded-full">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {student2.childName}'s Strengths
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {comparisonInsights.strengths2.map(strength => (
                      <span key={strength} className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration Insights */}
            <div className="card-begin">
              <h3 className="text-heading-lg font-bold text-begin-blue mb-4">Collaboration Insights</h3>
              
              <div className="space-y-4">
                {comparisonInsights.complementary.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Complementary Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {comparisonInsights.complementary.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {comparisonInsights.similar.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Shared Strengths
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {comparisonInsights.similar.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card-begin">
            <h3 className="text-heading-lg font-bold text-begin-blue mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Teaching Recommendations
            </h3>
            
            <div className="space-y-3">
              {comparisonInsights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-begin-cream/30 rounded-card">
                  <ArrowRight className="h-4 w-4 text-begin-teal mt-0.5 flex-shrink-0" />
                  <p className="text-begin-blue text-sm">{rec}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-begin-gray">
              <button
                onClick={generateGroupingSuggestions}
                className="btn-begin-primary flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Generate Group Suggestions
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}