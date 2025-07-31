import { CATEGORIES, QUESTIONS } from './questions'

export interface Scores {
  [key: string]: number
}

export function calculateScores(responses: Record<number, number>): Scores {
  const scores: Scores = {}
  
  CATEGORIES.forEach(category => {
    const categoryQuestions = QUESTIONS.filter(q => q.category === category)
    const categoryResponses = categoryQuestions.map(q => responses[q.id] || 0)
    const sum = categoryResponses.reduce((acc, score) => acc + score, 0)
    const average = sum / categoryQuestions.length
    scores[category] = Math.round(average * 100) / 100 // Round to 2 decimal places
  })
  
  return scores
}

export function getPersonalityLabel(scores: Scores): string {
  // Find the top 2 highest scoring categories
  const sortedScores = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
  
  const [primary, secondary] = sortedScores.map(([category]) => category)
  
  // Personality label mapping
  const labelMap: Record<string, string> = {
    'Communication-Collaboration': 'Social Communicator',
    'Communication-Content': 'Knowledge Sharer', 
    'Communication-Critical Thinking': 'Thoughtful Speaker',
    'Communication-Creative Innovation': 'Creative Storyteller',
    'Communication-Confidence': 'Confident Leader',
    'Collaboration-Content': 'Team Scholar',
    'Collaboration-Critical Thinking': 'Strategic Partner',
    'Collaboration-Creative Innovation': 'Creative Collaborator',
    'Collaboration-Confidence': 'Natural Leader',
    'Content-Critical Thinking': 'Analytical Scholar',
    'Content-Creative Innovation': 'Innovative Thinker',
    'Content-Confidence': 'Confident Learner',
    'Critical Thinking-Creative Innovation': 'Creative Problem Solver',
    'Critical Thinking-Confidence': 'Bold Analyst',
    'Creative Innovation-Confidence': 'Fearless Creator'
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