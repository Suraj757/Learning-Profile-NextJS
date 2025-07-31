'use client'

import { motion } from 'framer-motion'
import { Download, Share2, BookOpen, Users, Target, Printer } from 'lucide-react'
import { Scores } from '@/lib/scoring'

interface ActionItemsProps {
  scores: Scores
  personalityLabel: string
}

// Product recommendations based on learning style
const getProductRecommendations = (personalityLabel: string, scores: Scores) => {
  const topCategories = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([category]) => category)

  const recommendations = []

  // Base recommendations for all learners
  recommendations.push({
    category: 'Educational Apps',
    items: ['Khan Academy Kids', 'Scratch Programming', 'Duolingo']
  })

  // Specific recommendations based on top strengths
  if (topCategories.includes('Communication')) {
    recommendations.push({
      category: 'Communication Tools',
      items: ['Story Builder', 'Presentation software', 'Recording equipment']
    })
  }

  if (topCategories.includes('Collaboration')) {
    recommendations.push({
      category: 'Collaborative Activities',
      items: ['Group board games', 'Team sports equipment', 'Group project kits']
    })
  }

  if (topCategories.includes('Creative Innovation')) {
    recommendations.push({
      category: 'Creative Materials',
      items: ['Art supplies', 'Building blocks (LEGO)', 'Music instruments']
    })
  }

  if (topCategories.includes('Critical Thinking')) {
    recommendations.push({
      category: 'Problem Solving',
      items: ['Logic puzzles', 'Strategy games', 'Science experiment kits']
    })
  }

  if (topCategories.includes('Content')) {
    recommendations.push({
      category: 'Learning Resources',
      items: ['Encyclopedia sets', 'Educational documentaries', 'Interactive textbooks']
    })
  }

  if (topCategories.includes('Confidence')) {
    recommendations.push({
      category: 'Confidence Building',
      items: ['Public speaking courses', 'Leadership camps', 'Performance opportunities']
    })
  }

  return recommendations.slice(0, 3) // Return top 3 recommendation categories
}

// Tips for teachers and parents
const getParentTeacherTips = (personalityLabel: string, scores: Scores) => {
  const topCategory = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0][0]

  const tips = {
    'Communication': [
      'Provide regular opportunities for verbal expression',
      'Encourage storytelling and show-and-tell activities',
      'Practice active listening and give full attention when they speak'
    ],
    'Collaboration': [
      'Assign group projects and team-based activities',
      'Teach conflict resolution and compromise skills',
      'Model collaborative behavior in daily interactions'
    ],
    'Content': [
      'Connect new learning to their existing interests',
      'Provide rich, varied learning materials and resources',
      'Encourage questions and deeper exploration of topics'
    ],
    'Critical Thinking': [
      'Ask open-ended questions that require analysis',
      'Present problems without immediately giving solutions',
      'Encourage them to evaluate different perspectives'
    ],
    'Creative Innovation': [
      'Provide time for unstructured, imaginative play',
      'Celebrate unique approaches and original ideas',
      'Offer various creative mediums and materials'
    ],
    'Confidence': [
      'Focus on effort and improvement, not just outcomes',
      'Provide safe opportunities to take appropriate risks',
      'Build on their existing strengths and interests'
    ]
  }

  return tips[topCategory as keyof typeof tips] || tips.Content
}

export default function ActionItems({ scores, personalityLabel }: ActionItemsProps) {
  const recommendations = getProductRecommendations(personalityLabel, scores)
  const tips = getParentTeacherTips(personalityLabel, scores)

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${personalityLabel} Learning Profile`,
          text: 'Check out this personalized learning profile!',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Profile URL copied to clipboard!')
    }
  }

  const handleDownload = () => {
    // This would typically generate a PDF report
    alert('PDF download functionality would be implemented here')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Product Recommendations */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Product Recommendations</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Curated products that align with your child&apos;s learning style as a <strong>{personalityLabel}</strong>
        </p>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + 0.1 * index, duration: 0.4 }}
              className="border-l-4 border-blue-400 pl-4"
            >
              <h4 className="font-semibold text-gray-800 mb-2">{rec.category}</h4>
              <ul className="space-y-1">
                {rec.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tips for Teachers/Parents */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Tips for Success</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Practical strategies for teachers and parents to support learning
        </p>

        <div className="space-y-3">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + 0.1 * index, duration: 0.4 }}
              className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">{tip}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200"
        >
          <p className="text-sm text-green-800">
            <strong>Remember:</strong> Every child is unique. Use these insights as a starting point to understand and support their individual learning journey.
          </p>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Take Action</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Share these insights and start implementing strategies today!
        </p>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Profile</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Print Profile</span>
          </motion.button>
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
        >
          <h4 className="font-semibold text-gray-800 mb-2">Next Steps</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Discuss these results with your child&apos;s teacher</li>
            <li>• Implement 1-2 recommended strategies this week</li>
            <li>• Monitor progress and adjust approaches as needed</li>
            <li>• Consider retaking the assessment in 6 months</li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}