'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Users, BookOpen, Brain, Lightbulb, Shield } from 'lucide-react'
import { Scores } from '@/lib/scoring'

interface DetailedBreakdownProps {
  scores: Scores
}

// Icon mapping for categories
const categoryIcons = {
  'Communication': MessageCircle,
  'Collaboration': Users,
  'Content': BookOpen,
  'Critical Thinking': Brain,
  'Creative Innovation': Lightbulb,
  'Confidence': Shield
}

// Color mapping for strength levels
const getStrengthColor = (score: number) => {
  if (score >= 4.5) return 'from-emerald-500 to-green-500'
  if (score >= 4.0) return 'from-blue-500 to-indigo-500'
  if (score >= 3.5) return 'from-amber-500 to-orange-500'
  return 'from-red-500 to-pink-500'
}

const getStrengthBg = (score: number) => {
  if (score >= 4.5) return 'bg-emerald-50 border-emerald-200'
  if (score >= 4.0) return 'bg-blue-50 border-blue-200'
  if (score >= 3.5) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

const getStrengthLabel = (score: number) => {
  if (score >= 4.5) return 'Exceptional'
  if (score >= 4.0) return 'Strong'
  if (score >= 3.5) return 'Developing'
  return 'Emerging'
}

// Recommendations for each category
const categoryRecommendations = {
  'Communication': [
    'Encourage storytelling and presentation opportunities',
    'Practice active listening exercises',
    'Join debate club or public speaking activities'
  ],
  'Collaboration': [
    'Engage in team sports or group projects',
    'Practice peer tutoring and mentoring',
    'Develop conflict resolution skills'
  ],
  'Content': [
    'Provide rich, varied learning materials',
    'Connect new concepts to prior knowledge',
    'Encourage independent research projects'
  ],
  'Critical Thinking': [
    'Present open-ended problem-solving challenges',
    'Encourage questioning and analysis',
    'Practice comparing and contrasting activities'
  ],
  'Creative Innovation': [
    'Provide opportunities for artistic expression',
    'Encourage brainstorming and idea generation',
    'Support experimental and imaginative play'
  ],
  'Confidence': [
    'Celebrate effort and progress, not just results',
    'Provide safe spaces for risk-taking',
    'Build on existing strengths and interests'
  ]
}

export default function DetailedBreakdown({ scores }: DetailedBreakdownProps) {
  // Sort scores by value to show strongest areas first
  const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Detailed Strengths Analysis</h2>
        <p className="text-gray-600">Individual category scores with personalized recommendations</p>
      </div>

      <div className="space-y-4">
        {sortedScores.map(([category, score], index) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons]
          const recommendations = categoryRecommendations[category as keyof typeof categoryRecommendations]
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className={`border rounded-lg p-4 ${getStrengthBg(score)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getStrengthColor(score)}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{category}</h3>
                    <p className="text-sm text-gray-600">{getStrengthLabel(score)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{score.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">out of 5.0</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / 5) * 100}%` }}
                    transition={{ delay: 0.2 * index, duration: 0.8, ease: "easeOut" }}
                    className={`h-2 rounded-full bg-gradient-to-r ${getStrengthColor(score)}`}
                  ></motion.div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
                {recommendations.map((rec, recIndex) => (
                  <motion.div
                    key={recIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + 0.1 * index + 0.1 * recIndex, duration: 0.4 }}
                    className="flex items-start space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
      >
        <h3 className="font-semibold text-gray-800 mb-2">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Strongest Area: </span>
            <span className="text-gray-600">{sortedScores[0][0]}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Growth Opportunity: </span>
            <span className="text-gray-600">{sortedScores[sortedScores.length - 1][0]}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Average Score: </span>
            <span className="text-gray-600">
              {(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(1)}/5.0
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Strong Areas: </span>
            <span className="text-gray-600">
              {Object.values(scores).filter(score => score >= 4.0).length} of 6
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}