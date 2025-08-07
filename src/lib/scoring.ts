import { CATEGORIES, getQuestionsForAge, getOptionsForAgeAndQuestion, type AgeGroup } from './questions'

export interface Scores {
  [key: string]: number
}

export function calculateScores(responses: Record<number, number | string | string[]>, ageGroup: AgeGroup | string = '5+'): Scores {
  const scores: Scores = {}
  const validAgeGroup = (ageGroup === '3-4' || ageGroup === '4-5' || ageGroup === '5+') ? ageGroup as AgeGroup : '5+'
  const questions = getQuestionsForAge(validAgeGroup)
  
  // Validate responses input
  if (!responses || typeof responses !== 'object') {
    console.warn('Invalid responses object provided to calculateScores:', responses)
    return {}
  }
  
  console.log(`Calculating scores for age group: ${validAgeGroup}`, {
    totalQuestions: questions.length,
    responseCount: Object.keys(responses).length,
    ageGroup: validAgeGroup
  })
  
  CATEGORIES.forEach(category => {
    // Skip non-scoring categories
    if (category === 'Interests' || category === 'Motivation' || category === 'School Experience') {
      // Store raw responses for these categories instead of scores
      const categoryQuestions = questions.filter(q => q.category === category)
      categoryQuestions.forEach(question => {
        const responseValue = responses[question.id]
        if (responseValue !== undefined) {
          // Handle different response types (arrays for interests, strings for other categories)
          scores[`${category}_${question.id}`] = responseValue
        }
      })
      return
    }
    
    const categoryQuestions = questions.filter(q => q.category === category)
    let categoryScore = 0
    let totalPossibleScore = 0
    
    categoryQuestions.forEach(question => {
      const responseValue = responses[question.id]
      if (responseValue !== undefined && typeof responseValue === 'number') {
        if (validAgeGroup === '3-4' || validAgeGroup === '4-5') {
          // For multiple choice questions, use the score from the option
          const options = getOptionsForAgeAndQuestion(validAgeGroup, question.id)
          const selectedOption = options.find(opt => opt.value === responseValue)
          if (selectedOption) {
            categoryScore += selectedOption.score
            totalPossibleScore += 5 // Max score for any option
          } else {
            console.warn(`No option found for question ${question.id}, value ${responseValue} in age group ${validAgeGroup}`)
            // Use response value as fallback if option not found
            categoryScore += Math.min(5, Math.max(1, responseValue))
            totalPossibleScore += 5
          }
        } else {
          // For Likert scale (5+ age group), use the response value directly
          const normalizedValue = Math.min(5, Math.max(1, responseValue))
          categoryScore += normalizedValue
          totalPossibleScore += 5 // Max Likert scale value
        }
      } else if (responseValue !== undefined) {
        console.warn(`Invalid response value for question ${question.id}:`, responseValue, typeof responseValue)
      }
    })
    
    // Calculate average score (normalized to 1-5 scale)
    if (totalPossibleScore > 0) {
      const normalizedScore = (categoryScore / totalPossibleScore) * 5
      scores[category] = Math.round(normalizedScore * 100) / 100 // Round to 2 decimal places
    } else {
      scores[category] = 0
    }
  })
  
  // Ensure all 6C categories have numeric values
  const requiredCategories = ['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence']
  requiredCategories.forEach(category => {
    if (!(category in scores) || typeof scores[category] !== 'number' || isNaN(scores[category])) {
      console.warn(`Missing or invalid score for ${category}, setting to 0`)
      scores[category] = 0
    }
  })
  
  console.log('Final calculated scores:', scores)
  return scores
}

export function getPersonalityLabel(scores: Scores): string {
  // Find the top 2 highest scoring categories, ensuring numeric values
  const sortedScores = Object.entries(scores)
    .map(([category, score]) => [category, Number(score) || 0] as [string, number])
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
  
  const [primary, secondary] = sortedScores.map(([category]) => category)
  
  // Personality label mapping (includes all combinations in both directions)
  const labelMap: Record<string, string> = {
    'Communication-Collaboration': 'Social Communicator',
    'Collaboration-Communication': 'Social Communicator',
    'Communication-Content': 'Knowledge Sharer', 
    'Content-Communication': 'Knowledge Sharer',
    'Communication-Critical Thinking': 'Thoughtful Speaker',
    'Critical Thinking-Communication': 'Thoughtful Speaker',
    'Communication-Creative Innovation': 'Creative Storyteller',
    'Creative Innovation-Communication': 'Creative Storyteller',
    'Communication-Confidence': 'Confident Leader',
    'Confidence-Communication': 'Confident Leader',
    'Collaboration-Content': 'Team Scholar',
    'Content-Collaboration': 'Team Scholar',
    'Collaboration-Critical Thinking': 'Strategic Partner',
    'Critical Thinking-Collaboration': 'Strategic Partner',
    'Collaboration-Creative Innovation': 'Creative Collaborator',
    'Creative Innovation-Collaboration': 'Creative Collaborator',
    'Collaboration-Confidence': 'Natural Leader',
    'Confidence-Collaboration': 'Natural Leader',
    'Content-Critical Thinking': 'Analytical Scholar',
    'Critical Thinking-Content': 'Analytical Scholar',
    'Content-Creative Innovation': 'Innovative Thinker',
    'Creative Innovation-Content': 'Innovative Thinker',
    'Content-Confidence': 'Confident Learner',
    'Confidence-Content': 'Confident Learner',
    'Critical Thinking-Creative Innovation': 'Creative Problem Solver',
    'Creative Innovation-Critical Thinking': 'Creative Problem Solver',
    'Critical Thinking-Confidence': 'Bold Analyst',
    'Confidence-Critical Thinking': 'Bold Analyst',
    'Creative Innovation-Confidence': 'Fearless Creator',
    'Confidence-Creative Innovation': 'Fearless Creator'
  }
  
  const key = `${primary}-${secondary}`
  return labelMap[key] || 'Unique Learner'
}

export function generateDescription(scores: Scores): string {
  const topCategory = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0][0]
  
  const descriptions: Record<string, string> = {
    'Communication': 'Your child excels at expressing ideas clearly and connecting with others through words.',
    'Collaboration': 'Your child thrives in group settings and naturally works well with peers.',
    'Content': 'Your child shows strong academic curiosity and retains information effectively.',
    'Critical Thinking': 'Your child approaches problems analytically and thinks deeply about concepts.',
    'Creative Innovation': 'Your child brings original ideas and imaginative solutions to challenges.',
    'Confidence': 'Your child shows self-assurance and resilience when facing new challenges.'
  }
  
  return descriptions[topCategory] || 'Your child has a unique combination of learning strengths.'
}