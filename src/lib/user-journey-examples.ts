// User Journey Examples for Enhanced Age Selection System
// Demonstrates how different precise ages are handled

import { createPreciseAge, getQuestionsForPreciseAge, getAgeGroupInfo } from './age-routing'
import type { AgeGroup } from './questions'

export interface UserJourneyExample {
  id: string
  childName: string
  ageInput: {
    years: number
    months: number
    inputMethod: 'age' | 'birthdate'
    birthDate?: string
  }
  scenario: string
  expectedOutcome: {
    ageGroup: AgeGroup
    questionCount: number
    questionSet: 'pure' | 'hybrid' | 'extended'
    description: string
    adaptations: string[]
  }
  parentExperience: {
    ageSelectionRationale: string
    questionComplexity: string
    resultAccuracy: string
  }
  teacherIntegration?: {
    classroomApplication: string
    sharedInsights: string[]
  }
}

/**
 * Comprehensive user journey examples covering different age ranges
 */
export const USER_JOURNEY_EXAMPLES: UserJourneyExample[] = [
  {
    id: 'emma-3-2',
    childName: 'Emma',
    ageInput: {
      years: 3,
      months: 2,
      inputMethod: 'age'
    },
    scenario: 'Parent has a young 3-year-old who just started preschool',
    expectedOutcome: {
      ageGroup: '3-4',
      questionCount: 26,
      questionSet: 'pure',
      description: 'Early preschool development',
      adaptations: [
        'Home-based scenarios (dinner time, playground)',
        'Simple choice options',
        'Basic emotional expression questions'
      ]
    },
    parentExperience: {
      ageSelectionRationale: 'Emma is still developing basic communication and social skills. The 3-year questions focus on simple scenarios she can relate to.',
      questionComplexity: 'Questions feel just right - not too advanced. Focus on everyday situations at home and simple interactions.',
      resultAccuracy: 'Profile accurately captures Emma\'s emerging social skills and communication style in familiar environments.'
    },
    teacherIntegration: {
      classroomApplication: 'Teacher can use the profile to understand Emma needs more parallel play opportunities and gentle social encouragement.',
      sharedInsights: [
        'Responds well to visual cues and demonstrations',
        'Needs predictable routines for confidence',
        'Thrives with hands-on exploration'
      ]
    }
  },

  {
    id: 'jayden-4-8',
    childName: 'Jayden',
    ageInput: {
      years: 4,
      months: 8,
      inputMethod: 'birthdate',
      birthDate: '2020-01-15'
    },
    scenario: 'Parent using birthdate input for pre-K child showing mixed developmental levels',
    expectedOutcome: {
      ageGroup: '4-5',
      questionCount: 26,
      questionSet: 'pure',
      description: 'Kindergarten readiness stage',
      adaptations: [
        'School-preparation scenarios',
        'Advanced social interaction questions', 
        'Beginning academic readiness assessment'
      ]
    },
    parentExperience: {
      ageSelectionRationale: 'Used birthdate for precision. Jayden is almost 5 and showing readiness for more complex social situations.',
      questionComplexity: 'Perfect level - questions include preschool AND early school scenarios. Captures his growing independence.',
      resultAccuracy: 'Profile shows Jayden\'s readiness for kindergarten while identifying areas where he still needs support.'
    },
    teacherIntegration: {
      classroomApplication: 'Teacher can plan kindergarten transition activities based on his collaboration strengths and communication preferences.',
      sharedInsights: [
        'Ready for group problem-solving activities',
        'Benefits from peer interaction and collaborative learning',
        'Shows leadership potential in small groups'
      ]
    }
  },

  {
    id: 'alex-6-5',
    childName: 'Alex',
    ageInput: {
      years: 6,
      months: 5,
      inputMethod: 'age'
    },
    scenario: 'Parent of first-grader wanting comprehensive assessment for school support',
    expectedOutcome: {
      ageGroup: '5+',
      questionCount: 28,
      questionSet: 'extended',
      description: 'Extended elementary learning stage',
      adaptations: [
        'School-focused scenarios',
        'Homework and peer relationship contexts',
        'Advanced problem-solving situations',
        'Independent learning assessment'
      ]
    },
    parentExperience: {
      ageSelectionRationale: 'Alex is in first grade and needs assessment that reflects his school-based learning experiences.',
      questionComplexity: 'Questions perfectly match his world - homework, classroom discussions, group projects. Very relevant.',
      resultAccuracy: 'Profile captures his academic confidence and learning preferences in formal educational settings.'
    },
    teacherIntegration: {
      classroomApplication: 'Teacher can differentiate instruction based on his critical thinking strengths and preferred collaboration style.',
      sharedInsights: [
        'Excels in analytical problem-solving',
        'Prefers structured learning with clear expectations',
        'Benefits from opportunities to teach and explain to peers'
      ]
    }
  },

  {
    id: 'sofia-7-3',
    childName: 'Sofia',
    ageInput: {
      years: 7,
      months: 3,
      inputMethod: 'age'
    },
    scenario: 'Parent of second-grader using assessment for advanced learner support',
    expectedOutcome: {
      ageGroup: '5+',
      questionCount: 28,
      questionSet: 'extended',
      description: 'Extended elementary learning stage',
      adaptations: [
        'Complex academic scenarios',
        'Independent research and project contexts',
        'Advanced peer collaboration situations',
        'Leadership and teaching opportunities'
      ]
    },
    parentExperience: {
      ageSelectionRationale: 'Sofia is academically advanced and needs assessment that matches her sophisticated thinking and school experiences.',
      questionComplexity: 'Questions address her reality - complex projects, leadership roles, advanced problem-solving. Very fitting.',
      resultAccuracy: 'Profile identifies her creative innovation strengths and preference for independent, challenging work.'
    },
    teacherIntegration: {
      classroomApplication: 'Teacher can provide enrichment opportunities and peer mentoring roles that match her advanced capabilities.',
      sharedInsights: [
        'Thrives on creative, open-ended challenges',
        'Benefits from leadership and mentoring opportunities',
        'Prefers independent exploration with optional collaboration'
      ]
    }
  },

  {
    id: 'marcus-4-2-special-needs',
    childName: 'Marcus',
    ageInput: {
      years: 4,
      months: 2,
      inputMethod: 'age'
    },
    scenario: 'Parent of child with developmental delays choosing age group carefully',
    expectedOutcome: {
      ageGroup: '3-4', // Recommended to use simpler questions
      questionCount: 26,
      questionSet: 'pure',
      description: 'Early preschool development',
      adaptations: [
        'Simplified scenarios',
        'Clear, concrete situations',
        'Focus on basic skill development'
      ]
    },
    parentExperience: {
      ageSelectionRationale: 'Marcus has developmental delays. System recommended using 3-4 year questions for better accuracy.',
      questionComplexity: 'Questions are more appropriate for his actual abilities rather than chronological age. Good recommendation.',
      resultAccuracy: 'Profile accurately reflects his strengths and areas for growth without being discouraging.'
    },
    teacherIntegration: {
      classroomApplication: 'Teacher can use profile to create individualized support strategies and celebrate Marcus\'s unique strengths.',
      sharedInsights: [
        'Benefits from visual supports and concrete examples',
        'Thrives in structured, predictable environments',
        'Shows creativity through hands-on activities'
      ]
    }
  },

  {
    id: 'zoe-5-0-teacher-referred',
    childName: 'Zoe',
    ageInput: {
      years: 5,
      months: 0,
      inputMethod: 'birthdate',
      birthDate: '2019-08-15'
    },
    scenario: 'Teacher-referred assessment for kindergarten student showing mixed performance',
    expectedOutcome: {
      ageGroup: '5+',
      questionCount: 28,
      questionSet: 'pure',
      description: 'Early elementary learning stage',
      adaptations: [
        'Kindergarten-appropriate scenarios',
        'Academic and social skill assessment',
        'Classroom behavior contexts'
      ]
    },
    parentExperience: {
      ageSelectionRationale: 'Teacher sent the assessment. Used exact birthdate for precision since teacher will see results.',
      questionComplexity: 'Questions address both home and school behaviors. Good for teacher-parent communication.',
      resultAccuracy: 'Profile helps explain why Zoe excels in some areas but struggles in others. Very insightful.'
    },
    teacherIntegration: {
      classroomApplication: 'Teacher can adjust instruction style and group arrangements based on Zoe\'s communication and confidence patterns.',
      sharedInsights: [
        'Communicates well one-on-one but hesitant in groups',
        'Shows high creativity but needs confidence support',
        'Benefits from choice and autonomy in learning activities'
      ]
    }
  }
]

/**
 * Get example by child age for demonstration purposes
 */
export function getExampleByAge(years: number, months: number): UserJourneyExample | undefined {
  const totalMonths = years * 12 + months
  
  return USER_JOURNEY_EXAMPLES.find(example => {
    const exampleTotalMonths = example.ageInput.years * 12 + example.ageInput.months
    return Math.abs(exampleTotalMonths - totalMonths) <= 6 // Within 6 months
  })
}

/**
 * Get examples for a specific age group
 */
export function getExamplesByAgeGroup(ageGroup: AgeGroup): UserJourneyExample[] {
  return USER_JOURNEY_EXAMPLES.filter(example => example.expectedOutcome.ageGroup === ageGroup)
}

/**
 * Generate demo data for testing precise age system
 */
export function generateDemoData() {
  return USER_JOURNEY_EXAMPLES.map(example => {
    const preciseAge = createPreciseAge(example.ageInput.years, example.ageInput.months)
    const routing = getQuestionsForPreciseAge(preciseAge)
    const ageInfo = getAgeGroupInfo(preciseAge)
    
    return {
      ...example,
      systemOutput: {
        routing,
        ageInfo,
        validation: {
          isValid: true,
          warnings: example.ageInput.years < 3 ? ['Child is younger than recommended age'] : [],
          errors: []
        }
      }
    }
  })
}

/**
 * Edge cases and special scenarios
 */
export const EDGE_CASE_EXAMPLES = [
  {
    scenario: 'Very young child (2 years 10 months)',
    age: { years: 2, months: 10 },
    expectedBehavior: 'System shows warning but allows assessment with 3-4 year questions',
    reasoning: 'Some advanced 2-year-olds may benefit from assessment, but results should be interpreted carefully'
  },
  {
    scenario: 'Older child (8 years 6 months)',
    age: { years: 8, months: 6 },
    expectedBehavior: 'System uses extended 5+ questions with school-age adaptations',
    reasoning: 'Questions remain relevant by focusing on advanced academic and social contexts'
  },
  {
    scenario: 'Child with developmental delays (chronological 5, developmental 3)',
    age: { years: 5, months: 0 },
    expectedBehavior: 'System recommends using 3-4 year questions for better accuracy',
    reasoning: 'Parents can choose age group that matches child\'s actual abilities'
  },
  {
    scenario: 'Advanced learner (chronological 4, performing at 6-year level)',
    age: { years: 4, months: 6 },
    expectedBehavior: 'System offers 4-5 year questions but suggests 5+ if child is advanced',
    reasoning: 'Flexible system accommodates different developmental trajectories'
  }
]