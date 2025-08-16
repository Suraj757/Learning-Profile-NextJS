// CLP 2.0 Question Definitions
// 24 questions (8 skills × 3 questions) + 4 preference questions

import { CLP2_SKILL_MAPPING } from './clp-scoring'

export interface CLP2Question {
  id: number
  text: string
  skill: string // Maps to CLP2Scores keys
  context: 'home' | 'classroom' | 'universal' // Where this question is most relevant
  responseType: 'likert' | 'multipleChoice' | 'multiSelect'
  options?: Array<{
    value: number | string
    text: string
    points: number // 0, 0.5, or 1.0 for CLP 2.0 scoring
  }>
  ageGroups: Array<'3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+'>
}

// CLP 2.0 Core Question Set (24 questions for 8 skills)
export const CLP2_QUESTIONS: CLP2Question[] = [
  // Communication (Questions 1-3)
  {
    id: 1,
    text: "My child clearly expresses their thoughts and feelings to others",
    skill: "Communication",
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 2, 
    text: "My child asks thoughtful questions when they don't understand something",
    skill: "Communication",
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 3,
    text: "My child listens carefully when others are speaking",
    skill: "Communication", 
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },

  // Collaboration (Questions 4-6)
  {
    id: 4,
    text: "My child enjoys working with others on projects or activities",
    skill: "Collaboration",
    context: "universal", 
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 5,
    text: "My child shares materials and takes turns without being reminded",
    skill: "Collaboration",
    context: "universal",
    responseType: "likert", 
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 6,
    text: "My child helps resolve conflicts between friends peacefully",
    skill: "Collaboration",
    context: "universal",
    responseType: "likert",
    ageGroups: ["4-5", "5-6", "6-8", "8-10", "10+"]
  },

  // Content (Questions 7-9)
  {
    id: 7,
    text: "My child shows curiosity about how things work",
    skill: "Content", 
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 8,
    text: "My child remembers details from stories, lessons, or experiences",
    skill: "Content",
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 9,
    text: "My child applies what they've learned to new situations",
    skill: "Content",
    context: "universal", 
    responseType: "likert",
    ageGroups: ["4-5", "5-6", "6-8", "8-10", "10+"]
  },

  // Critical Thinking (Questions 10-12)
  {
    id: 10,
    text: "My child thinks through problems step by step",
    skill: "Critical Thinking",
    context: "universal",
    responseType: "likert",
    ageGroups: ["4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 11,
    text: "My child asks 'why' or 'how' questions about things they observe",
    skill: "Critical Thinking",
    context: "universal",
    responseType: "likert", 
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 12,
    text: "My child can explain their reasoning when making decisions",
    skill: "Critical Thinking",
    context: "universal",
    responseType: "likert",
    ageGroups: ["5-6", "6-8", "8-10", "10+"]
  },

  // Creative Innovation (Questions 13-15)
  {
    id: 13,
    text: "My child comes up with original ideas for games, stories, or projects",
    skill: "Creative Innovation",
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 14,
    text: "My child finds new uses for everyday objects during play",
    skill: "Creative Innovation", 
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 15,
    text: "My child enjoys experimenting with different ways to solve problems",
    skill: "Creative Innovation",
    context: "universal",
    responseType: "likert",
    ageGroups: ["4-5", "5-6", "6-8", "8-10", "10+"]
  },

  // Confidence (Questions 16-18)
  {
    id: 16,
    text: "My child tries new activities even when they might be challenging",
    skill: "Confidence",
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 17,
    text: "My child bounces back quickly from disappointments or setbacks",
    skill: "Confidence",
    context: "universal", 
    responseType: "likert",
    ageGroups: ["4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 18,
    text: "My child feels comfortable sharing their ideas with others",
    skill: "Confidence",
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },

  // Literacy (Questions 19-21)
  {
    id: 19,
    text: "My child shows interest in books, letters, or writing",
    skill: "Literacy",
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 20,
    text: "My child can retell stories in their own words",
    skill: "Literacy",
    context: "universal",
    responseType: "likert", 
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 21,
    text: "My child recognizes patterns in words or enjoys word games",
    skill: "Literacy",
    context: "universal",
    responseType: "likert",
    ageGroups: ["4-5", "5-6", "6-8", "8-10", "10+"]
  },

  // Math (Questions 22-24)  
  {
    id: 22,
    text: "My child enjoys counting, sorting, or organizing objects",
    skill: "Math",
    context: "universal",
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 23,
    text: "My child notices patterns, shapes, or sizes in their environment",
    skill: "Math",
    context: "universal", 
    responseType: "likert",
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 24,
    text: "My child can solve simple problems involving numbers or quantities",
    skill: "Math",
    context: "universal",
    responseType: "likert",
    ageGroups: ["4-5", "5-6", "6-8", "8-10", "10+"]
  }
]

// Extended Age Questions for Elementary+ (Questions 29-52)
// These provide more nuanced assessment for older children (6-12 years)
export const CLP2_EXTENDED_QUESTIONS: CLP2Question[] = [
  // Communication - Advanced (Questions 29-31)
  {
    id: 29,
    text: "My child articulates complex ideas and thoughts clearly",
    skill: "Communication",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 30,
    text: "My child actively participates in group discussions and debates",
    skill: "Communication",
    context: "classroom",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 31,
    text: "My child demonstrates understanding through detailed explanations",
    skill: "Communication", 
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },

  // Collaboration - Advanced (Questions 32-34)
  {
    id: 32,
    text: "My child takes on leadership roles in group projects",
    skill: "Collaboration",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 33,
    text: "My child mediates conflicts and helps build consensus",
    skill: "Collaboration",
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },
  {
    id: 34,
    text: "My child collaborates effectively across diverse groups",
    skill: "Collaboration",
    context: "classroom",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },

  // Content - Academic Focus (Questions 35-37)
  {
    id: 35,
    text: "My child makes connections between different subject areas",
    skill: "Content",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 36,
    text: "My child demonstrates mastery of grade-level academic concepts",
    skill: "Content",
    context: "classroom",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 37,
    text: "My child seeks out additional learning opportunities on topics of interest",
    skill: "Content",
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },

  // Critical Thinking - Advanced Analysis (Questions 38-40)
  {
    id: 38,
    text: "My child analyzes information from multiple sources",
    skill: "Critical Thinking",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 39,
    text: "My child evaluates the credibility and reliability of information",
    skill: "Critical Thinking",
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },
  {
    id: 40,
    text: "My child draws logical conclusions based on evidence",
    skill: "Critical Thinking",
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },

  // Creative Innovation - Complex Projects (Questions 41-43)
  {
    id: 41,
    text: "My child develops innovative solutions to complex problems",
    skill: "Creative Innovation",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 42,
    text: "My child combines ideas from different domains in original ways",
    skill: "Creative Innovation",
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },
  {
    id: 43,
    text: "My child persists through multiple iterations to refine creative work",
    skill: "Creative Innovation",
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },

  // Confidence - Self-Advocacy (Questions 44-46)
  {
    id: 44,
    text: "My child advocates for their learning needs and preferences",
    skill: "Confidence",
    context: "classroom",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 45,
    text: "My child demonstrates resilience when facing academic challenges",
    skill: "Confidence",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 46,
    text: "My child takes intellectual risks in their learning",
    skill: "Confidence",
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },

  // Literacy - Advanced Skills (Questions 47-49)
  {
    id: 47,
    text: "My child reads complex texts independently and with comprehension",
    skill: "Literacy",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 48,
    text: "My child writes clearly and persuasively for different purposes",
    skill: "Literacy",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 49,
    text: "My child analyzes themes, characters, and literary devices",
    skill: "Literacy",
    context: "classroom",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },

  // Math - Abstract Thinking (Questions 50-52)
  {
    id: 50,
    text: "My child applies mathematical concepts to real-world situations",
    skill: "Math",
    context: "universal",
    responseType: "likert",
    ageGroups: ["6-8", "8-10", "10+"]
  },
  {
    id: 51,
    text: "My child works comfortably with abstract mathematical concepts",
    skill: "Math",
    context: "classroom",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  },
  {
    id: 52,
    text: "My child explains mathematical reasoning clearly to others",
    skill: "Math",
    context: "universal",
    responseType: "likert",
    ageGroups: ["8-10", "10+"]
  }
]

// CLP 2.0 Learning Preference Questions (Questions 25-28)
export const CLP2_PREFERENCE_QUESTIONS: CLP2Question[] = [
  {
    id: 25,
    text: "How does your child engage best with new learning?",
    skill: "Engagement",
    context: "universal",
    responseType: "multipleChoice",
    options: [
      { value: "hands-on", text: "Hands-on exploration and manipulation", points: 0 },
      { value: "visual", text: "Looking at pictures, diagrams, and demonstrations", points: 0 },
      { value: "listening", text: "Listening to explanations and discussions", points: 0 },
      { value: "movement", text: "Moving around while learning", points: 0 }
    ],
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 26,
    text: "What type of activities does your child prefer?",
    skill: "Modality", 
    context: "universal",
    responseType: "multipleChoice",
    options: [
      { value: "quiet", text: "Quiet, focused individual work", points: 0 },
      { value: "interactive", text: "Interactive discussions and conversations", points: 0 },
      { value: "creative", text: "Creative and artistic expression", points: 0 },
      { value: "physical", text: "Physical and kinesthetic activities", points: 0 }
    ],
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 27,
    text: "How does your child work best with others?",
    skill: "Social",
    context: "universal", 
    responseType: "multipleChoice",
    options: [
      { value: "independent", text: "Independently, then sharing results", points: 0 },
      { value: "small-group", text: "In small groups of 2-3 children", points: 0 },
      { value: "large-group", text: "In larger group settings", points: 0 },
      { value: "one-on-one", text: "One-on-one with an adult", points: 0 }
    ],
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  },
  {
    id: 28,
    text: "What types of topics or activities interest your child most?",
    skill: "Interests",
    context: "universal",
    responseType: "multiSelect",
    options: [
      { value: "animals", text: "Animals and nature", points: 0 },
      { value: "building", text: "Building and construction", points: 0 },
      { value: "art", text: "Art and crafts", points: 0 },
      { value: "music", text: "Music and rhythm", points: 0 },
      { value: "stories", text: "Stories and books", points: 0 },
      { value: "science", text: "Science and experiments", points: 0 },
      { value: "sports", text: "Sports and physical activities", points: 0 },
      { value: "technology", text: "Technology and computers", points: 0 }
    ],
    ageGroups: ["3-4", "4-5", "5-6", "6-8", "8-10", "10+"]
  }
]

// Context-specific question variations
export const CLP2_PARENT_VARIATIONS: Record<number, string> = {
  1: "My child clearly expresses their thoughts and feelings at home",
  4: "My child enjoys working with family members on activities", 
  6: "My child helps resolve conflicts with siblings peacefully",
  9: "My child applies what they learn at school to situations at home",
  12: "My child can explain their reasoning when we discuss family decisions",
  17: "My child bounces back quickly from disappointments at home"
}

export const CLP2_TEACHER_VARIATIONS: Record<number, string> = {
  1: "This student clearly expresses their thoughts and feelings in classroom discussions",
  4: "This student enjoys working with classmates on group projects",
  6: "This student helps resolve conflicts between peers during classroom activities", 
  9: "This student applies learned concepts to new academic situations",
  12: "This student can explain their reasoning during classroom problem-solving",
  17: "This student bounces back quickly from academic challenges or setbacks"
}

// Get questions for specific quiz type and age group
export function getCLP2Questions(
  quizType: 'parent_home' | 'teacher_classroom' | 'general',
  ageGroup: '3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+' = '5-6'
): CLP2Question[] {
  // Combine core and extended questions based on age group
  let allQuestions = [...CLP2_QUESTIONS]
  
  // Include extended questions for older children (6+)
  if (['6-8', '8-10', '10+'].includes(ageGroup)) {
    allQuestions = [...allQuestions, ...CLP2_EXTENDED_QUESTIONS]
  }
  
  // Filter by age group
  let questions = allQuestions.filter(q => q.ageGroups.includes(ageGroup))
  
  // Apply context-specific variations
  if (quizType === 'parent_home') {
    questions = questions.map(q => ({
      ...q,
      text: CLP2_PARENT_VARIATIONS[q.id] || q.text
    }))
  } else if (quizType === 'teacher_classroom') {
    questions = questions.map(q => ({
      ...q, 
      text: CLP2_TEACHER_VARIATIONS[q.id] || q.text
    }))
  }
  
  // For parent quiz, include all 24 questions + preferences
  if (quizType === 'parent_home') {
    return [...questions, ...CLP2_PREFERENCE_QUESTIONS]
  }
  
  // For teacher quiz, focus on classroom-relevant questions
  if (quizType === 'teacher_classroom') {
    // Prioritize academic and classroom-focused questions for older children
    if (['6-8', '8-10', '10+'].includes(ageGroup)) {
      // Include more academic-focused questions for older students
      questions = questions.filter(q => 
        q.context === 'classroom' || 
        q.context === 'universal' ||
        q.id >= 29 // Extended questions
      )
      // Ensure balanced coverage of all skills
      const skillGroups = ['Communication', 'Collaboration', 'Content', 'Critical Thinking', 
                          'Creative Innovation', 'Confidence', 'Literacy', 'Math']
      const balancedQuestions: CLP2Question[] = []
      
      // Take 1-2 questions per skill, prioritizing extended questions for older ages
      skillGroups.forEach(skill => {
        const skillQuestions = questions.filter(q => q.skill === skill)
        balancedQuestions.push(...skillQuestions.slice(0, 2))
      })
      
      return balancedQuestions.slice(0, 15) // Slightly more questions for comprehensive assessment
    }
    return questions.slice(0, 12) // Standard limit for younger children
  }
  
  // General quiz includes everything
  return [...questions, ...CLP2_PREFERENCE_QUESTIONS]
}

// Get age-appropriate questions for precise age in months
export function getCLP2QuestionsForAge(ageInMonths: number): CLP2Question[] {
  let ageGroup: '3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+' = '5-6'
  
  if (ageInMonths < 42) {
    ageGroup = '3-4' // Under 3.5 years
  } else if (ageInMonths < 66) { 
    ageGroup = '4-5' // 3.5 to 5.5 years
  } else if (ageInMonths < 84) {
    ageGroup = '5-6' // 5.5 to 7 years (Kindergarten/1st grade)
  } else if (ageInMonths < 108) {
    ageGroup = '6-8' // 7 to 9 years (1st-3rd grade)
  } else if (ageInMonths < 132) {
    ageGroup = '8-10' // 9 to 11 years (3rd-5th grade)
  } else {
    ageGroup = '10+' // 11+ years (Middle school+)
  }
  
  return getCLP2Questions('general', ageGroup)
}

// Validate CLP 2.0 response
export function validateCLP2Response(
  questionId: number, 
  response: number | string | string[]
): boolean {
  const question = [...CLP2_QUESTIONS, ...CLP2_EXTENDED_QUESTIONS, ...CLP2_PREFERENCE_QUESTIONS]
    .find(q => q.id === questionId)
  
  if (!question) return false
  
  if (question.responseType === 'likert') {
    return typeof response === 'number' && response >= 1 && response <= 5
  }
  
  if (question.responseType === 'multipleChoice') {
    return question.options?.some(opt => opt.value === response) || false
  }
  
  if (question.responseType === 'multiSelect') {
    return Array.isArray(response) && 
           response.every(val => question.options?.some(opt => opt.value === val))
  }
  
  return false
}