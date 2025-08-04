'use client'
import { Suspense, lazy } from 'react'
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
  Line,
  AreaChart,
  Area
} from 'recharts'

interface ChartProps {
  data: any[]
  className?: string
  height?: number
}

const COLORS = {
  primary: '#007A72',
  secondary: '#10B981', 
  accent: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  blue: '#3B82F6',
  red: '#EF4444',
  gray: '#6B7280'
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

// Enhanced Pie Chart with better tooltips and labels
export function EnhancedPieChart({ data, className, height = 300 }: ChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0)
  
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={Math.min(height * 0.3, 120)}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || PERSONALITY_COLORS[entry.name as keyof typeof PERSONALITY_COLORS] || COLORS.primary} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [
              `${value} students (${((value / total) * 100).toFixed(1)}%)`,
              'Count'
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Radar Chart for 6C Skills
export function SkillsRadarChart({ data, className, height = 300 }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            domain={[0, 5]} 
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickCount={6}
          />
          <Radar
            name="Class Average"
            dataKey="score"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
          />
          <Tooltip 
            formatter={(value: number) => [value.toFixed(1), 'Score']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Bar Chart for student comparisons
export function StudentProgressBar({ data, className, height = 300, interactive = false }: ChartProps & { interactive?: boolean }) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [value.toFixed(1), 'Score']}
            labelFormatter={(label) => `Student: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="score" 
            fill={COLORS.primary}
            radius={[4, 4, 0, 0]}
            style={interactive ? { cursor: 'pointer' } : {}}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Multi-line chart for progress tracking
export function ProgressLineChart({ data, className, height = 300 }: ChartProps) {
  const skillColors = {
    Communication: COLORS.primary,
    Collaboration: COLORS.secondary,
    Content: COLORS.blue,
    'Critical Thinking': COLORS.purple,
    'Creative Innovation': COLORS.accent,
    Confidence: COLORS.pink
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            domain={[0, 5]}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {Object.entries(skillColors).map(([skill, color]) => (
            <Line 
              key={skill}
              type="monotone" 
              dataKey={skill.replace(' ', '')} 
              stroke={color} 
              strokeWidth={2} 
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6, fill: color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Area chart for completion rates
export function CompletionAreaChart({ data, className, height = 300 }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'rate' ? `${value}%` : value,
              name === 'rate' ? 'Completion Rate' : 'Assessments'
            ]}
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
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke={COLORS.accent}
            strokeWidth={2}
            dot={{ fill: COLORS.accent }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Comparison radar chart for two students
export function ComparisonRadarChart({ 
  data, 
  student1Name, 
  student2Name, 
  className, 
  height = 300 
}: ChartProps & { student1Name: string; student2Name: string }) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <PolarRadiusAxis 
            domain={[0, 5]} 
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickCount={6}
          />
          <Radar
            name={student1Name}
            dataKey={student1Name}
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
          />
          <Radar
            name={student2Name}
            dataKey={student2Name}
            stroke={COLORS.accent}
            fill={COLORS.accent}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ fill: COLORS.accent, strokeWidth: 2, r: 4 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Loading placeholder for charts
export function ChartSkeleton({ height = 300, className }: { height?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-begin-teal mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading chart...</p>
      </div>
    </div>
  )
}