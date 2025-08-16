// CLP 2.0 Comprehensive Test Data
// Realistic response scenarios for testing scoring algorithms across all age groups

export interface TestScenario {
  name: string
  description: string
  ageGroup: '3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+'
  quizType: 'parent_home' | 'teacher_classroom' | 'general'
  responses: Record<number, number | string | string[]>
  expectedScores: {
    Communication: number
    Collaboration: number
    Content: number
    'Critical Thinking': number
    'Creative Innovation': number
    Confidence: number
    Literacy: number
    Math: number
  }
  expectedPersonality: string
  expectedStrengths: string[]
  expectedGrowthAreas: string[]
}

// Test Scenarios for 3-4 Year Olds (Early Preschool)
export const PRESCHOOL_3_4_SCENARIOS: TestScenario[] = [
  {
    name: "Highly Communicative Preschooler",
    description: "3-year-old with strong verbal skills and social communication",
    ageGroup: "3-4",
    quizType: "parent_home",
    responses: {
      1: 5, // Clearly expresses thoughts - Strongly Agree (1.0 points)
      2: 5, // Asks thoughtful questions - Strongly Agree (1.0 points)
      3: 4, // Listens carefully - Agree (0.5 points)
      4: 3, // Enjoys working with others - Neutral (0.5 points)
      5: 2, // Shares materials - Disagree (0.0 points)
      7: 4, // Shows curiosity - Agree (0.5 points)
      8: 3, // Remembers details - Neutral (0.5 points)
      11: 5, // Asks why/how questions - Strongly Agree (1.0 points)
      13: 4, // Original ideas - Agree (0.5 points)
      14: 5, // New uses for objects - Strongly Agree (1.0 points)
      16: 3, // Tries new activities - Neutral (0.5 points)
      18: 5, // Comfortable sharing ideas - Strongly Agree (1.0 points)
      19: 4, // Interest in books - Agree (0.5 points)
      20: 3, // Retells stories - Neutral (0.5 points)
      22: 4, // Enjoys counting - Agree (0.5 points)
      23: 3, // Notices patterns - Neutral (0.5 points)
      25: "listening", // Engagement preference
      26: "interactive", // Activity preference
      27: "one-on-one", // Social preference
      28: ["stories", "art"] // Interests
    },
    expectedScores: {
      Communication: 5.0, // (1.0 + 1.0 + 0.5) / 3 * 4 + 1 = 4.33 → 5.0
      Collaboration: 2.0, // (0.5 + 0.0) / 2 * 4 + 1 = 2.0
      Content: 3.0, // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
      'Critical Thinking': 5.0, // 1.0 / 1 * 4 + 1 = 5.0
      'Creative Innovation': 4.0, // (0.5 + 1.0) / 2 * 4 + 1 = 4.0
      Confidence: 4.0, // (0.5 + 1.0) / 2 * 4 + 1 = 4.0
      Literacy: 3.67, // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
      Math: 3.0 // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
    },
    expectedPersonality: "Language Leader",
    expectedStrengths: ["Communication", "Critical Thinking"],
    expectedGrowthAreas: ["Collaboration"]
  },
  {
    name: "Creative Explorer Preschooler",
    description: "3-year-old with high creativity but developing social skills",
    ageGroup: "3-4",
    quizType: "parent_home",
    responses: {
      1: 3, // Clearly expresses thoughts - Neutral (0.5 points)
      2: 4, // Asks thoughtful questions - Agree (0.5 points)
      3: 2, // Listens carefully - Disagree (0.0 points)
      4: 4, // Enjoys working with others - Agree (0.5 points)
      5: 3, // Shares materials - Neutral (0.5 points)
      7: 5, // Shows curiosity - Strongly Agree (1.0 points)
      8: 4, // Remembers details - Agree (0.5 points)
      11: 5, // Asks why/how questions - Strongly Agree (1.0 points)
      13: 5, // Original ideas - Strongly Agree (1.0 points)
      14: 5, // New uses for objects - Strongly Agree (1.0 points)
      16: 5, // Tries new activities - Strongly Agree (1.0 points)
      18: 3, // Comfortable sharing ideas - Neutral (0.5 points)
      19: 3, // Interest in books - Neutral (0.5 points)
      20: 2, // Retells stories - Disagree (0.0 points)
      22: 3, // Enjoys counting - Neutral (0.5 points)
      23: 4, // Notices patterns - Agree (0.5 points)
      25: "hands-on",
      26: "creative",
      27: "independent",
      28: ["building", "art", "science"]
    },
    expectedScores: {
      Communication: 2.33, // (0.5 + 0.5 + 0.0) / 3 * 4 + 1 = 2.33
      Collaboration: 3.0, // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
      Content: 4.0, // (1.0 + 0.5) / 2 * 4 + 1 = 4.0
      'Critical Thinking': 5.0, // 1.0 / 1 * 4 + 1 = 5.0
      'Creative Innovation': 5.0, // (1.0 + 1.0) / 2 * 4 + 1 = 5.0
      Confidence: 4.0, // (1.0 + 0.5) / 2 * 4 + 1 = 4.0
      Literacy: 2.0, // (0.5 + 0.0) / 2 * 4 + 1 = 2.0
      Math: 3.0 // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
    },
    expectedPersonality: "Creative Problem Solver",
    expectedStrengths: ["Creative Innovation", "Critical Thinking"],
    expectedGrowthAreas: ["Literacy", "Communication"]
  }
]

// Test Scenarios for 5-6 Year Olds (Kindergarten)
export const KINDERGARTEN_5_6_SCENARIOS: TestScenario[] = [
  {
    name: "Academic All-Star Kindergartner",
    description: "5-year-old with strong literacy and math readiness",
    ageGroup: "5-6",
    quizType: "parent_home",
    responses: {
      1: 4, // Communication
      2: 4,
      3: 5,
      4: 4, // Collaboration
      5: 4,
      6: 3,
      7: 4, // Content
      8: 5,
      9: 4,
      10: 4, // Critical Thinking
      11: 4,
      12: 3,
      13: 3, // Creative Innovation
      14: 4,
      15: 3,
      16: 4, // Confidence
      17: 4,
      18: 3,
      19: 5, // Literacy
      20: 5,
      21: 5,
      22: 5, // Math
      23: 4,
      24: 5,
      25: "visual",
      26: "quiet",
      27: "small-group",
      28: ["stories", "science", "building"]
    },
    expectedScores: {
      Communication: 4.33, // (0.5 + 0.5 + 1.0) / 3 * 4 + 1 = 3.67
      Collaboration: 3.67, // (0.5 + 0.5 + 0.5) / 3 * 4 + 1 = 3.0
      Content: 4.33, // (0.5 + 1.0 + 0.5) / 3 * 4 + 1 = 3.67
      'Critical Thinking': 3.67, // (0.5 + 0.5 + 0.5) / 3 * 4 + 1 = 3.0
      'Creative Innovation': 3.33, // (0.5 + 0.5 + 0.5) / 3 * 4 + 1 = 3.0
      Confidence: 3.67, // (0.5 + 0.5 + 0.5) / 3 * 4 + 1 = 3.0
      Literacy: 5.0, // (1.0 + 1.0 + 1.0) / 3 * 4 + 1 = 5.0
      Math: 4.67 // (1.0 + 0.5 + 1.0) / 3 * 4 + 1 = 4.33
    },
    expectedPersonality: "Academic All-Star",
    expectedStrengths: ["Literacy", "Math"],
    expectedGrowthAreas: ["Creative Innovation"]
  },
  {
    name: "Social Leader Kindergartner",
    description: "5-year-old with strong collaboration and confidence",
    ageGroup: "5-6",
    quizType: "teacher_classroom",
    responses: {
      1: 5, // Communication (adapted for classroom)
      3: 4,
      4: 5, // Collaboration
      5: 5,
      6: 4,
      8: 3, // Content
      9: 3,
      10: 3, // Critical Thinking
      12: 4,
      19: 3, // Literacy
      21: 3,
      22: 3, // Math
      24: 3
    },
    expectedScores: {
      Communication: 4.5, // (1.0 + 0.5) / 2 * 4 + 1 = 4.0
      Collaboration: 4.67, // (1.0 + 1.0 + 0.5) / 3 * 4 + 1 = 4.33
      Content: 3.0, // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
      'Critical Thinking': 3.5, // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
      'Creative Innovation': 1.0, // No responses
      Confidence: 1.0, // No responses
      Literacy: 3.0, // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
      Math: 3.0 // (0.5 + 0.5) / 2 * 4 + 1 = 3.0
    },
    expectedPersonality: "Social Communicator",
    expectedStrengths: ["Collaboration", "Communication"],
    expectedGrowthAreas: ["Creative Innovation", "Confidence"]
  }
]

// Test Scenarios for 8-10 Year Olds (Elementary)
export const ELEMENTARY_8_10_SCENARIOS: TestScenario[] = [
  {
    name: "Advanced Critical Thinker",
    description: "9-year-old with strong analytical and communication skills",
    ageGroup: "8-10",
    quizType: "teacher_classroom",
    responses: {
      1: 5, // Communication
      3: 5,
      29: 4, // Extended communication
      4: 4, // Collaboration
      5: 4,
      32: 3, // Extended collaboration
      8: 5, // Content
      9: 5,
      35: 4, // Extended content
      10: 5, // Critical Thinking
      12: 5,
      38: 5, // Extended critical thinking
      19: 4, // Literacy
      21: 4,
      47: 5, // Extended literacy
      22: 3, // Math
      24: 3,
      50: 4 // Extended math
    },
    expectedScores: {
      Communication: 4.67, // (1.0 + 1.0 + 0.5) / 3 * 4 + 1 = 4.33
      Collaboration: 3.67, // (0.5 + 0.5 + 0.5) / 3 * 4 + 1 = 3.0
      Content: 4.67, // (1.0 + 1.0 + 0.5) / 3 * 4 + 1 = 4.33
      'Critical Thinking': 5.0, // (1.0 + 1.0 + 1.0) / 3 * 4 + 1 = 5.0
      'Creative Innovation': 1.0, // No responses
      Confidence: 1.0, // No responses
      Literacy: 4.33, // (0.5 + 0.5 + 1.0) / 3 * 4 + 1 = 3.67
      Math: 3.33 // (0.5 + 0.5 + 0.5) / 3 * 4 + 1 = 3.0
    },
    expectedPersonality: "Analytical Scholar",
    expectedStrengths: ["Critical Thinking", "Communication"],
    expectedGrowthAreas: ["Creative Innovation", "Confidence"]
  }
]

// Edge Case Scenarios
export const EDGE_CASE_SCENARIOS: TestScenario[] = [
  {
    name: "All Minimum Responses",
    description: "Child with all strongly disagree responses",
    ageGroup: "5-6",
    quizType: "general",
    responses: {
      1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1,
      10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1,
      19: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1
    },
    expectedScores: {
      Communication: 1.0, Collaboration: 1.0, Content: 1.0, 'Critical Thinking': 1.0,
      'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 1.0, Math: 1.0
    },
    expectedPersonality: "Unique Learner",
    expectedStrengths: [],
    expectedGrowthAreas: ["Communication", "Collaboration"]
  },
  {
    name: "All Maximum Responses",
    description: "Child with all strongly agree responses",
    ageGroup: "5-6",
    quizType: "general",
    responses: {
      1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5,
      10: 5, 11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5,
      19: 5, 20: 5, 21: 5, 22: 5, 23: 5, 24: 5
    },
    expectedScores: {
      Communication: 5.0, Collaboration: 5.0, Content: 5.0, 'Critical Thinking': 5.0,
      'Creative Innovation': 5.0, Confidence: 5.0, Literacy: 5.0, Math: 5.0
    },
    expectedPersonality: "Unique Learner",
    expectedStrengths: ["Communication", "Collaboration"],
    expectedGrowthAreas: []
  },
  {
    name: "Empty Responses",
    description: "No responses provided",
    ageGroup: "5-6",
    quizType: "general",
    responses: {},
    expectedScores: {
      Communication: 1.0, Collaboration: 1.0, Content: 1.0, 'Critical Thinking': 1.0,
      'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 1.0, Math: 1.0
    },
    expectedPersonality: "Unique Learner",
    expectedStrengths: [],
    expectedGrowthAreas: []
  }
]

// Multi-Quiz Consolidation Test Data
export const MULTI_QUIZ_SCENARIOS = [
  {
    name: "Parent-Teacher Agreement",
    description: "Parent and teacher responses align closely",
    sources: [
      {
        scores: {
          Communication: 4.5, Collaboration: 3.8, Content: 4.2, 'Critical Thinking': 3.5,
          'Creative Innovation': 4.0, Confidence: 3.9, Literacy: 4.3, Math: 3.7
        },
        weight: 0.6,
        quizType: "parent_home",
        respondentType: "parent"
      },
      {
        scores: {
          Communication: 4.2, Collaboration: 4.0, Content: 4.0, 'Critical Thinking': 3.8,
          'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 4.1, Math: 3.9
        },
        weight: 0.4,
        quizType: "teacher_classroom",
        respondentType: "teacher"
      }
    ],
    expectedConsolidated: {
      Communication: 4.38, // (4.5 * 0.6 + 4.2 * 0.4) = 4.38
      Collaboration: 3.88, // (3.8 * 0.6 + 4.0 * 0.4) = 3.88
      Content: 4.12, // (4.2 * 0.6 + 4.0 * 0.4) = 4.12
      'Critical Thinking': 3.62, // (3.5 * 0.6 + 3.8 * 0.4) = 3.62
      'Creative Innovation': 2.8, // (4.0 * 0.6 + 1.0 * 0.4) = 2.8
      Confidence: 2.74, // (3.9 * 0.6 + 1.0 * 0.4) = 2.74
      Literacy: 4.22, // (4.3 * 0.6 + 4.1 * 0.4) = 4.22
      Math: 3.78 // (3.7 * 0.6 + 3.9 * 0.4) = 3.78
    }
  },
  {
    name: "Parent-Teacher Disagreement",
    description: "Significant differences between parent and teacher perspectives",
    sources: [
      {
        scores: {
          Communication: 5.0, Collaboration: 2.0, Content: 3.0, 'Critical Thinking': 4.0,
          'Creative Innovation': 5.0, Confidence: 4.5, Literacy: 3.5, Math: 2.8
        },
        weight: 0.5,
        quizType: "parent_home",
        respondentType: "parent"
      },
      {
        scores: {
          Communication: 2.5, Collaboration: 4.5, Content: 4.8, 'Critical Thinking': 2.2,
          'Creative Innovation': 1.0, Confidence: 1.0, Literacy: 4.9, Math: 4.5
        },
        weight: 0.5,
        quizType: "teacher_classroom",
        respondentType: "teacher"
      }
    ],
    expectedConsolidated: {
      Communication: 3.75, // (5.0 * 0.5 + 2.5 * 0.5) = 3.75
      Collaboration: 3.25, // (2.0 * 0.5 + 4.5 * 0.5) = 3.25
      Content: 3.9, // (3.0 * 0.5 + 4.8 * 0.5) = 3.9
      'Critical Thinking': 3.1, // (4.0 * 0.5 + 2.2 * 0.5) = 3.1
      'Creative Innovation': 3.0, // (5.0 * 0.5 + 1.0 * 0.5) = 3.0
      Confidence: 2.75, // (4.5 * 0.5 + 1.0 * 0.5) = 2.75
      Literacy: 4.2, // (3.5 * 0.5 + 4.9 * 0.5) = 4.2
      Math: 3.65 // (2.8 * 0.5 + 4.5 * 0.5) = 3.65
    }
  }
]

// Boundary Condition Test Data
export const BOUNDARY_CONDITIONS = {
  invalidResponses: {
    questionId: 1,
    responses: [
      { value: 0, valid: false }, // Below minimum
      { value: 6, valid: false }, // Above maximum
      { value: 2.5, valid: false }, // Non-integer
      { value: "invalid", valid: false }, // Wrong type
      { value: null, valid: false }, // Null
      { value: undefined, valid: false } // Undefined
    ]
  },
  validResponses: {
    questionId: 1,
    responses: [
      { value: 1, valid: true, expectedPoints: 0.0 },
      { value: 2, valid: true, expectedPoints: 0.0 },
      { value: 3, valid: true, expectedPoints: 0.5 },
      { value: 4, valid: true, expectedPoints: 0.5 },
      { value: 5, valid: true, expectedPoints: 1.0 }
    ]
  },
  ageGroupBoundaries: [
    { ageInMonths: 35, expectedGroup: '3-4' }, // Just under 3 years
    { ageInMonths: 42, expectedGroup: '3-4' }, // 3.5 years
    { ageInMonths: 65, expectedGroup: '4-5' }, // Just over 5 years
    { ageInMonths: 83, expectedGroup: '5-6' }, // Just under 7 years
    { ageInMonths: 107, expectedGroup: '6-8' }, // Just under 9 years
    { ageInMonths: 131, expectedGroup: '8-10' }, // Just under 11 years
    { ageInMonths: 150, expectedGroup: '10+' } // 12.5 years
  ]
}

// Performance Test Data
export const PERFORMANCE_TEST_DATA = {
  largeResponseSet: (() => {
    const responses: Record<number, number> = {}
    // Generate responses for all 52 possible questions
    for (let i = 1; i <= 52; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    return responses
  })(),
  
  multipleQuizSources: Array.from({ length: 10 }, (_, index) => ({
    scores: {
      Communication: Math.random() * 4 + 1,
      Collaboration: Math.random() * 4 + 1,
      Content: Math.random() * 4 + 1,
      'Critical Thinking': Math.random() * 4 + 1,
      'Creative Innovation': Math.random() * 4 + 1,
      Confidence: Math.random() * 4 + 1,
      Literacy: Math.random() * 4 + 1,
      Math: Math.random() * 4 + 1
    },
    weight: 1.0 / 10, // Equal weights
    quizType: index % 2 === 0 ? "parent_home" : "teacher_classroom",
    respondentType: index % 2 === 0 ? "parent" : "teacher"
  }))
}

// Export all test data
export const CLP2_TEST_DATA = {
  scenarios: {
    preschool: PRESCHOOL_3_4_SCENARIOS,
    kindergarten: KINDERGARTEN_5_6_SCENARIOS,
    elementary: ELEMENTARY_8_10_SCENARIOS,
    edgeCases: EDGE_CASE_SCENARIOS
  },
  multiQuiz: MULTI_QUIZ_SCENARIOS,
  boundaries: BOUNDARY_CONDITIONS,
  performance: PERFORMANCE_TEST_DATA
}