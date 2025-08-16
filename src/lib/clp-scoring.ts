// CLP 2.0 Scoring Engine
// Implements the new 0-3 point scoring system with 8 skills × 3 questions structure

export interface CLP2Scores {
  // 6Cs Framework (Core Categories)
  Communication: number
  Collaboration: number
  Content: number
  'Critical Thinking': number
  'Creative Innovation': number
  Confidence: number
  
  // Academic Skills
  Literacy: number
  Math: number
  
  // Learning Preferences (not scored, but tracked)
  Engagement?: string | string[]
  Modality?: string | string[]
  Social?: string | string[]
  Interests?: string | string[]
}

export interface CLP2Response {
  questionId: number
  value: number | string | string[]
  skillCategory: keyof CLP2Scores
  points: number // 0, 0.5, or 1.0 points
}

// CLP 2.0 Question to Skill Mapping (8 skills × 3 questions = 24 questions)
export const CLP2_SKILL_MAPPING: Record<number, keyof CLP2Scores> = {
  // Communication (Questions 1-3)
  1: 'Communication',
  2: 'Communication', 
  3: 'Communication',
  
  // Collaboration (Questions 4-6)
  4: 'Collaboration',
  5: 'Collaboration',
  6: 'Collaboration',
  
  // Content (Questions 7-9)
  7: 'Content',
  8: 'Content',
  9: 'Content',
  
  // Critical Thinking (Questions 10-12)
  10: 'Critical Thinking',
  11: 'Critical Thinking',
  12: 'Critical Thinking',
  
  // Creative Innovation (Questions 13-15)
  13: 'Creative Innovation',
  14: 'Creative Innovation',
  15: 'Creative Innovation',
  
  // Confidence (Questions 16-18)
  16: 'Confidence',
  17: 'Confidence',
  18: 'Confidence',
  
  // Literacy (Questions 19-21)
  19: 'Literacy',
  20: 'Literacy',
  21: 'Literacy',
  
  // Math (Questions 22-24)
  22: 'Math',
  23: 'Math',
  24: 'Math'
}

// CLP 2.0 Response to Points Mapping
export function getPointsFromResponse(
  questionId: number, 
  response: number | string | string[], 
  quizType: 'parent_home' | 'teacher_classroom' | 'general' = 'general'
): number {
  // For CLP 2.0, responses are mapped to 0, 0.5, or 1.0 points
  if (typeof response === 'number') {
    // Likert scale responses (1-5) mapped to CLP 2.0 points
    if (response >= 5) return 1.0      // Strongly Agree
    if (response >= 4) return 0.5      // Agree  
    if (response >= 3) return 0.5      // Neutral (some evidence)
    if (response >= 2) return 0.0      // Disagree
    if (response >= 1) return 0.0      // Strongly Disagree
  }
  
  // Multiple choice responses - points based on developmental appropriateness
  if (typeof response === 'string' || Array.isArray(response)) {
    // For interests and preferences, store raw value but don't score
    const skill = CLP2_SKILL_MAPPING[questionId]
    if (skill === 'Interests' || skill === 'Engagement' || skill === 'Modality' || skill === 'Social') {
      return 0 // Preference questions don't contribute to skill scores
    }
  }
  
  return 0 // Default: no points if unable to parse
}

// Calculate CLP 2.0 scores from responses
export function calculateCLP2Scores(
  responses: Record<number, number | string | string[]>, 
  quizType: 'parent_home' | 'teacher_classroom' | 'general' = 'general',
  ageGroup: '3-4' | '4-5' | '5+' = '5+'
): CLP2Scores {
  const scores: CLP2Scores = {
    Communication: 0,
    Collaboration: 0,
    Content: 0,
    'Critical Thinking': 0,
    'Creative Innovation': 0,
    Confidence: 0,
    Literacy: 0,
    Math: 0
  }
  
  // Track points per skill for averaging
  const skillPoints: Record<keyof CLP2Scores, number[]> = {
    Communication: [],
    Collaboration: [],
    Content: [],
    'Critical Thinking': [],
    'Creative Innovation': [],
    Confidence: [],
    Literacy: [],
    Math: []
  }
  
  // Process each response
  Object.entries(responses).forEach(([questionIdStr, response]) => {
    const questionId = parseInt(questionIdStr)
    const skill = CLP2_SKILL_MAPPING[questionId]
    
    if (skill && skill in skillPoints) {
      const points = getPointsFromResponse(questionId, response, quizType)
      skillPoints[skill].push(points)
    } else {
      // Handle preference questions
      if (questionId > 24) {
        // Store preferences without scoring
        const prefKey = questionId === 25 ? 'Engagement' : 
                        questionId === 26 ? 'Modality' :
                        questionId === 27 ? 'Social' : 'Interests'
        // @ts-ignore - Dynamic property assignment for preferences
        scores[prefKey] = response
      }
    }
  })
  
  // Calculate final scores (average points × 4 to get 0-4 scale, then clamp to 0-5 for compatibility)
  Object.entries(skillPoints).forEach(([skill, points]) => {
    if (points.length > 0) {
      const averagePoints = points.reduce((sum, p) => sum + p, 0) / points.length
      // Convert 0-1 point scale to 0-5 score scale for compatibility
      // 0 points = 1.0 score, 0.5 points = 3.0 score, 1.0 points = 5.0 score
      scores[skill as keyof CLP2Scores] = Math.round((1 + (averagePoints * 4)) * 100) / 100
    } else {
      // No responses for this skill - set minimum score
      scores[skill as keyof CLP2Scores] = 1.0
    }
  })
  
  console.log('CLP 2.0 Scores calculated:', scores)
  return scores
}

// Get CLP 2.0 personality label based on top skills
export function getCLP2PersonalityLabel(scores: CLP2Scores): string {
  // Filter out preference fields and get numeric scores
  const numericScores = Object.entries(scores)
    .filter(([key, value]) => 
      typeof value === 'number' && 
      !['Engagement', 'Modality', 'Social', 'Interests'].includes(key)
    )
    .map(([skill, score]) => [skill, score as number] as [string, number])
    .sort(([,a], [,b]) => b - a)
  
  if (numericScores.length < 2) return 'Unique Learner'
  
  const [primarySkill] = numericScores[0]
  const [secondarySkill] = numericScores[1]
  
  // CLP 2.0 Personality Label Mapping
  const labelMap: Record<string, string> = {
    // Communication combinations
    'Communication-Collaboration': 'Social Communicator',
    'Communication-Creative Innovation': 'Creative Storyteller', 
    'Communication-Confidence': 'Confident Leader',
    'Communication-Content': 'Knowledge Communicator',
    'Communication-Critical Thinking': 'Thoughtful Communicator',
    'Communication-Literacy': 'Language Leader',
    'Communication-Math': 'Mathematical Communicator',
    
    // Collaboration combinations  
    'Collaboration-Communication': 'Social Communicator',
    'Collaboration-Creative Innovation': 'Creative Collaborator',
    'Collaboration-Confidence': 'Natural Leader',
    'Collaboration-Content': 'Team Scholar',
    'Collaboration-Critical Thinking': 'Strategic Partner',
    'Collaboration-Literacy': 'Reading Partner',
    'Collaboration-Math': 'Math Team Player',
    
    // Creative Innovation combinations
    'Creative Innovation-Communication': 'Creative Storyteller',
    'Creative Innovation-Collaboration': 'Creative Collaborator', 
    'Creative Innovation-Critical Thinking': 'Creative Problem Solver',
    'Creative Innovation-Confidence': 'Fearless Creator',
    'Creative Innovation-Content': 'Innovative Learner',
    'Creative Innovation-Literacy': 'Creative Writer',
    'Creative Innovation-Math': 'Mathematical Innovator',
    
    // Critical Thinking combinations
    'Critical Thinking-Creative Innovation': 'Creative Problem Solver',
    'Critical Thinking-Content': 'Analytical Scholar',
    'Critical Thinking-Communication': 'Thoughtful Communicator',
    'Critical Thinking-Collaboration': 'Strategic Partner',
    'Critical Thinking-Confidence': 'Bold Analyst',
    'Critical Thinking-Literacy': 'Critical Reader',
    'Critical Thinking-Math': 'Mathematical Thinker',
    
    // Confidence combinations
    'Confidence-Communication': 'Confident Leader',
    'Confidence-Collaboration': 'Natural Leader',
    'Confidence-Creative Innovation': 'Fearless Creator',
    'Confidence-Critical Thinking': 'Bold Analyst',
    'Confidence-Content': 'Confident Scholar',
    'Confidence-Literacy': 'Reading Champion',
    'Confidence-Math': 'Math Confident',
    
    // Academic combinations
    'Literacy-Math': 'Academic All-Star',
    'Math-Literacy': 'Academic All-Star',
    'Content-Literacy': 'Knowledge Reader',
    'Content-Math': 'Mathematical Scholar',
    'Literacy-Communication': 'Language Leader',
    'Math-Critical Thinking': 'Mathematical Thinker'
  }
  
  const key = `${primarySkill}-${secondarySkill}`
  const reverseKey = `${secondarySkill}-${primarySkill}`
  
  return labelMap[key] || labelMap[reverseKey] || 'Unique Learner'
}

// Generate CLP 2.0 strengths and growth areas
export function getCLP2StrengthsAndGrowth(scores: CLP2Scores): {
  strengths: string[]
  growthAreas: string[]
} {
  const numericScores = Object.entries(scores)
    .filter(([key, value]) => 
      typeof value === 'number' && 
      !['Engagement', 'Modality', 'Social', 'Interests'].includes(key)
    )
    .map(([skill, score]) => [skill, score as number] as [string, number])
  
  const strengths = numericScores
    .filter(([, score]) => score >= 4.0) // High strength threshold
    .map(([skill]) => skill)
  
  const growthAreas = numericScores
    .filter(([, score]) => score < 3.0) // Growth area threshold
    .map(([skill]) => skill)
  
  // If no clear strengths/growth areas, use relative ranking
  if (strengths.length === 0) {
    const sorted = numericScores.sort(([,a], [,b]) => b - a)
    return {
      strengths: sorted.slice(0, 2).map(([skill]) => skill),
      growthAreas: sorted.slice(-2).map(([skill]) => skill)
    }
  }
  
  return { strengths, growthAreas }
}

// Convert legacy scores to CLP 2.0 format
export function convertLegacyToCLP2(legacyScores: Record<string, number>): CLP2Scores {
  const clp2Scores: CLP2Scores = {
    Communication: legacyScores.Communication || 3.0,
    Collaboration: legacyScores.Collaboration || 3.0,
    Content: legacyScores.Content || 3.0,
    'Critical Thinking': legacyScores['Critical Thinking'] || 3.0,
    'Creative Innovation': legacyScores['Creative Innovation'] || 3.0,
    Confidence: legacyScores.Confidence || 3.0,
    Literacy: legacyScores.Literacy || 3.0,
    Math: legacyScores.Math || 3.0
  }
  
  return clp2Scores
}

// Weighted consolidation for multiple quiz sources
export function consolidateCLP2Scores(
  sourceScores: Array<{
    scores: CLP2Scores
    weight: number
    quizType: string
    respondentType: string
  }>
): CLP2Scores {
  const consolidatedScores: CLP2Scores = {
    Communication: 0,
    Collaboration: 0,
    Content: 0,
    'Critical Thinking': 0,
    'Creative Innovation': 0,
    Confidence: 0,
    Literacy: 0,
    Math: 0
  }
  
  const skillKeys = Object.keys(consolidatedScores) as Array<keyof CLP2Scores>
  
  skillKeys.forEach(skill => {
    let weightedSum = 0
    let totalWeight = 0
    
    sourceScores.forEach(source => {
      if (typeof source.scores[skill] === 'number') {
        weightedSum += (source.scores[skill] as number) * source.weight
        totalWeight += source.weight
      }
    })
    
    if (totalWeight > 0) {
      consolidatedScores[skill] = Math.round((weightedSum / totalWeight) * 100) / 100
    } else {
      consolidatedScores[skill] = 3.0 // Default neutral score
    }
  })
  
  console.log('CLP 2.0 Consolidated Scores:', consolidatedScores)
  return consolidatedScores
}

// Export constants for use in other modules
export const CLP2_SKILLS = [
  'Communication', 'Collaboration', 'Content', 'Critical Thinking', 
  'Creative Innovation', 'Confidence', 'Literacy', 'Math'
] as const

export const CLP2_PREFERENCES = [
  'Engagement', 'Modality', 'Social', 'Interests'
] as const