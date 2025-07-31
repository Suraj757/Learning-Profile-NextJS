'use client'

import { motion } from 'framer-motion'
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Scores } from '@/lib/scoring'

interface RadarChartProps {
  scores: Scores
}

// Color mapping for strength levels
const getStrengthColor = (score: number) => {
  if (score >= 4.5) return '#10b981' // Emerald - Exceptional
  if (score >= 4.0) return '#3b82f6' // Blue - Strong
  if (score >= 3.5) return '#f59e0b' // Amber - Developing
  return '#ef4444' // Red - Emerging
}

const getStrengthLabel = (score: number) => {
  if (score >= 4.5) return 'Exceptional'
  if (score >= 4.0) return 'Strong'
  if (score >= 3.5) return 'Developing'
  return 'Emerging'
}

export default function RadarChart({ scores }: RadarChartProps) {
  // Transform scores data for the radar chart
  const chartData = Object.entries(scores).map(([category, score]) => ({
    category: category.replace(/([A-Z])/g, ' $1').trim(), // Add spaces before capital letters
    score: score,
    fullMark: 5
  }))

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Score: <span className="font-semibold" style={{ color: getStrengthColor(score) }}>
              {score.toFixed(1)}/5.0
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Level: <span className="font-semibold">{getStrengthLabel(score)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Learning Strengths Radar</h2>
        <p className="text-gray-600">Interactive visualization of your child&apos;s 6C capabilities</p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid 
              stroke="#e5e7eb" 
              strokeWidth={1}
              gridType="polygon"
            />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
              className="text-sm"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 5]} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickCount={6}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#3b82f6"
              fill="rgba(59, 130, 246, 0.2)"
              strokeWidth={3}
              dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
              fillOpacity={0.3}
            />
            <Tooltip content={<CustomTooltip />} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Strength Level Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-4 grid grid-cols-2 gap-2 text-sm"
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-gray-600">Exceptional (4.5+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600">Strong (4.0+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-600">Developing (3.5+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">Emerging (&lt;3.5)</span>
        </div>
      </motion.div>
    </motion.div>
  )
}