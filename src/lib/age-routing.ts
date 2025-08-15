// Age-to-Question Routing Algorithm for Enhanced Age Selection System
import type { AgeGroup, Question } from './questions'
import { AGE_SPECIFIC_QUESTIONS, QUESTIONS } from './questions'

export interface PreciseAge {
  years: number
  months: number
  totalMonths: number
}

export interface AgeRouting {
  ageGroup: AgeGroup
  questionSet: 'pure' | 'hybrid' | 'extended'
  questions: Question[]
  metadata: {
    description: string
    rationale: string
    adaptations: string[]
  }
}

/**
 * Convert age input to precise age object
 */
export function createPreciseAge(years: number, months: number): PreciseAge {
  return {
    years,
    months,
    totalMonths: years * 12 + months
  }
}

/**
 * Enhanced age-to-question routing algorithm
 * Handles edge cases and provides smooth transitions between age groups
 */
export function getQuestionsForPreciseAge(preciseAge: PreciseAge): AgeRouting {
  const { totalMonths } = preciseAge
  
  // Age boundaries in months
  const boundaries = {
    early3: 36,   // 3.0 years
    mid3: 42,     // 3.5 years  
    early4: 48,   // 4.0 years
    mid4: 54,     // 4.5 years
    early5: 60,   // 5.0 years
    mid5: 66,     // 5.5 years
    early6: 72,   // 6.0 years
    mid6: 78,     // 6.5 years
    extended: 96  // 8.0 years
  }

  // Route to appropriate question set based on precise age
  if (totalMonths < boundaries.mid3) {
    // Ages 3.0-3.4: Pure 3-year-old questions
    return {
      ageGroup: '3-4',
      questionSet: 'pure',
      questions: AGE_SPECIFIC_QUESTIONS['3-4'],
      metadata: {
        description: 'Early preschool development',
        rationale: 'Using simplified scenarios focused on basic social and communication skills',
        adaptations: [
          'Home-based scenarios (dinner time, playground)',
          'Simple choice options',
          'Basic emotional expression questions'
        ]
      }
    }
  } else if (totalMonths < boundaries.early5) {
    // Ages 3.5-4.11: 4-year bridge questions (hybrid approach)
    return {
      ageGroup: '4-5',
      questionSet: 'hybrid',
      questions: createBridgeQuestions(preciseAge),
      metadata: {
        description: 'Transitional preschool to pre-K stage',
        rationale: 'Blending 3-year scenarios with increased complexity for developing skills',
        adaptations: [
          'Mix of home and social scenarios',
          'Slightly more complex problem-solving',
          'Introduction of empathy-based questions'
        ]
      }
    }
  } else if (totalMonths < boundaries.mid5) {
    // Ages 5.0-5.4: Pure 5-year (4-5 group) questions  
    return {
      ageGroup: '4-5',
      questionSet: 'pure',
      questions: AGE_SPECIFIC_QUESTIONS['4-5'],
      metadata: {
        description: 'Kindergarten readiness stage',
        rationale: 'Age-appropriate questions for pre-K and early kindergarten skills',
        adaptations: [
          'School-preparation scenarios',
          'Advanced social interaction questions',
          'Beginning academic readiness assessment'
        ]
      }
    }
  } else if (totalMonths < boundaries.early6) {
    // Ages 5.5-5.11: Enhanced 5+ questions (early elementary)
    return {
      ageGroup: '5+',
      questionSet: 'pure',
      questions: QUESTIONS, // Standard 5+ questions
      metadata: {
        description: 'Early elementary learning stage',
        rationale: 'Comprehensive 6C framework assessment with Likert scale responses',
        adaptations: [
          'Complex scenario-based questions',
          'Nuanced response options (5-point scale)',
          'Advanced academic and social skills'
        ]
      }
    }
  } else {
    // Ages 6.0+: Extended range questions
    return {
      ageGroup: '5+',
      questionSet: 'extended',
      questions: createExtendedQuestions(preciseAge),
      metadata: {
        description: 'Extended elementary learning stage',
        rationale: 'Adapted 5+ questions with increased academic and social complexity',
        adaptations: [
          'School-focused scenarios',
          'Homework and peer relationship contexts',
          'Advanced problem-solving situations',
          'Independent learning assessment'
        ]
      }
    }
  }
}

/**
 * Create bridge questions for 4-year-olds (missing question set)
 * Strategy: Interpolate between 3-4 and 4-5 complexity
 */
function createBridgeQuestions(preciseAge: PreciseAge): Question[] {
  const base3Questions = AGE_SPECIFIC_QUESTIONS['3-4']
  const base5Questions = AGE_SPECIFIC_QUESTIONS['4-5']
  
  // For 4-year-olds, use enhanced 3-year questions with some 5-year complexity
  const bridgeQuestions: Question[] = base3Questions.map((q3, index) => {
    const q5 = base5Questions[index]
    
    // Use 3-year question structure but with slightly more complex scenarios
    if (q5) {
      return {
        ...q3,
        text: enhanceQuestionComplexity(q3.text, preciseAge),
        encouragingIntro: q3.encouragingIntro?.replace('3-4', '4') || q5.encouragingIntro
      }
    }
    return q3
  })
  
  return bridgeQuestions
}

/**
 * Create extended questions for 6+ year olds
 * Strategy: Enhance 5+ questions with school-focused scenarios
 */
function createExtendedQuestions(preciseAge: PreciseAge): Question[] {
  return QUESTIONS.map(question => ({
    ...question,
    text: adaptQuestionForExtendedAge(question.text, preciseAge),
    example: adaptExampleForExtendedAge(question.example, preciseAge),
    encouragingIntro: question.encouragingIntro
  }))
}

/**
 * Enhance question complexity for bridge questions
 */
function enhanceQuestionComplexity(questionText: string, preciseAge: PreciseAge): string {
  // Add context that bridges 3-year and 5-year complexity
  const enhancements: Record<string, string> = {
    'When they notice another child playing nearby': 'When they see another child playing a game they\'d like to try',
    'While you\'re making dinner': 'When you\'re busy preparing a family meal',
    'When they can\'t reach a toy': 'When they want to get something that\'s stored up high',
    'At a birthday party full of new kids': 'At a playdate with children they haven\'t met before',
    'When you ask, \'What did you do today?\'': 'When you ask them to tell you about their day at preschool'
  }
  
  for (const [original, enhanced] of Object.entries(enhancements)) {
    if (questionText.includes(original)) {
      return questionText.replace(original, enhanced)
    }
  }
  
  return questionText
}

/**
 * Adapt questions for extended age range (6+ years)
 */
function adaptQuestionForExtendedAge(questionText: string, preciseAge: PreciseAge): string {
  // Add school and homework contexts for older children
  const schoolAdaptations: Record<string, string> = {
    'During group discussions or show-and-tell': 'During class presentations or group discussions at school',
    'In team activities': 'During group projects or team activities at school',
    'When [name] learns something new': 'When [name] learns new concepts in school or at home',
    'During conversations': 'During family discussions or conversations with friends',
    'When facing big challenges': 'When working on challenging homework or school projects',
    'During creative activities': 'During art class, creative writing, or personal projects',
    'In group settings': 'In classroom discussions or social situations at school',
    'When working independently': 'When doing homework or working on solo school assignments'
  }
  
  for (const [original, adapted] of Object.entries(schoolAdaptations)) {
    if (questionText.includes(original)) {
      return questionText.replace(original, adapted)
    }
  }
  
  return questionText
}

/**
 * Adapt examples for extended age range
 */
function adaptExampleForExtendedAge(example: string | undefined, preciseAge: PreciseAge): string | undefined {
  if (!example) return example
  
  const exampleAdaptations: Record<string, string> = {
    'family dinners, playdates': 'family dinners, school discussions, friend conversations',
    'Board games, sports, group projects': 'School group work, team sports, collaborative activities',
    'Building something, fixing a toy': 'Solving math problems, completing assignments, working on projects',
    'Art projects, storytelling, building': 'School art class, creative writing assignments, science projects',
    'New sports, difficult puzzles': 'Challenging homework, new school subjects, extracurricular activities',
    'Homework, personal projects': 'School assignments, independent reading, personal interests'
  }
  
  let adaptedExample = example
  for (const [original, adapted] of Object.entries(exampleAdaptations)) {
    adaptedExample = adaptedExample.replace(original, adapted)
  }
  
  return adaptedExample
}

/**
 * Get age group display information
 */
export function getAgeGroupInfo(preciseAge: PreciseAge) {
  const routing = getQuestionsForPreciseAge(preciseAge)
  const { years, months } = preciseAge
  
  return {
    ageGroup: routing.ageGroup,
    display: `${years} years, ${months} months`,
    description: routing.metadata.description,
    questionCount: routing.questions.length,
    questionSet: routing.questionSet,
    adaptations: routing.metadata.adaptations
  }
}

/**
 * Validate age input
 */
export function validateAge(years: number, months: number): {
  isValid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []
  
  if (years < 3) {
    warnings.push('Assessment is designed for children 3+ years. Results may not be accurate.')
  }
  
  if (years > 10) {
    warnings.push('Assessment covers up to 8+ years. Questions are adapted for older children.')
  }
  
  if (months < 0 || months > 11) {
    errors.push('Months must be between 0 and 11.')
  }
  
  if (years < 0) {
    errors.push('Age must be positive.')
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

/**
 * Get recommended age group based on developmental considerations
 */
export function getRecommendedAgeGroup(preciseAge: PreciseAge, hasSpecialNeeds: boolean = false): {
  recommended: AgeGroup
  rationale: string
  alternatives: Array<{ ageGroup: AgeGroup; reason: string }>
} {
  const { totalMonths } = preciseAge
  const standardRouting = getQuestionsForPreciseAge(preciseAge)
  
  if (hasSpecialNeeds) {
    // For special needs, recommend one level below standard for better accuracy
    if (totalMonths >= 60) {
      return {
        recommended: '4-5',
        rationale: 'For children with special needs, using slightly simpler questions often provides more accurate results.',
        alternatives: [
          { ageGroup: '5+', reason: 'If your child excels academically despite other challenges' },
          { ageGroup: '3-4', reason: 'If your child needs more basic developmental assessment' }
        ]
      }
    } else if (totalMonths >= 48) {
      return {
        recommended: '3-4',
        rationale: 'Simpler scenarios may better capture your child\'s abilities.',
        alternatives: [
          { ageGroup: '4-5', reason: 'If your child shows advanced skills in some areas' }
        ]
      }
    }
  }
  
  return {
    recommended: standardRouting.ageGroup,
    rationale: standardRouting.metadata.rationale,
    alternatives: []
  }
}