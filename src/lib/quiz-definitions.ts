// Multi-Quiz System Definitions
// Supports different quiz types with different questions, targeting different respondents

import { Question, AgeGroup, CATEGORIES } from './questions'

export type QuizType = 'parent_home' | 'teacher_classroom' | 'student_self' | 'general'
export type RespondentType = 'parent' | 'teacher' | 'student' | 'general'

export interface QuizDefinition {
  id: string
  quiz_type: QuizType
  name: string
  description: string
  target_respondent: RespondentType
  
  // Quiz structure
  question_count: number
  estimated_duration_minutes: number
  supported_age_groups: AgeGroup[]
  
  // Question configuration - can override default questions
  custom_questions?: Question[]
  question_filter?: (questions: Question[]) => Question[]
  question_customizer?: (question: Question, context: QuizContext) => Question
  
  // UI customization
  intro_text: string
  completion_message: string
  result_page_template: 'parent_focused' | 'teacher_focused' | 'student_focused' | 'standard'
  
  // Scoring and weighting
  scoring_weight: number // How much this quiz contributes to overall profile (0-1)
  confidence_boost: number // How much this quiz increases profile confidence
  
  // Context-specific settings
  context_settings: {
    emphasize_categories?: string[] // Which 6C categories to emphasize
    include_interests?: boolean
    include_motivations?: boolean
    include_school_experience?: boolean
    show_progress_indicators?: boolean
  }
  
  // Access control
  requires_invitation?: boolean // Teacher quizzes might require invitation
  can_be_shared?: boolean
  
  created_at: string
  is_active: boolean
}

export interface QuizContext {
  child_name: string
  age_group: AgeGroup
  grade?: string
  quiz_type: QuizType
  respondent_type: RespondentType
  respondent_name?: string
  school_context?: {
    school_name?: string
    teacher_name?: string
    classroom?: string
  }
  existing_profile?: {
    id: string
    completion_percentage: number
    last_updated: string
  }
}

// Pre-defined quiz types with their configurations
export const QUIZ_DEFINITIONS: Record<QuizType, QuizDefinition> = {
  parent_home: {
    id: 'parent_home',
    quiz_type: 'parent_home',
    name: 'Parent Home Assessment',
    description: 'Understanding how your child learns and behaves at home to give teachers valuable insights',
    target_respondent: 'parent',
    
    question_count: 15,
    estimated_duration_minutes: 5,
    supported_age_groups: ['3-4', '4-5', '5+'],
    
    // Custom question filtering for parent context
    question_filter: (questions: Question[]) => {
      // Focus on questions that parents can observe at home
      const parent_relevant_ids = [1, 2, 3, 4, 5, 9, 10, 13, 17, 18, 21, 22, 25, 26, 29]
      return questions.filter(q => parent_relevant_ids.includes(q.id))
    },
    
    question_customizer: (question: Question, context: QuizContext) => ({
      ...question,
      // Customize question text for parent context
      text: question.text.replace(/\[name\]/g, context.child_name),
      encouragingIntro: question.encouragingIntro?.replace(/\[name\]/g, context.child_name),
      example: addParentContextToExample(question.example)
    }),
    
    intro_text: 'Help us understand how {child_name} learns and behaves at home. Your insights will give teachers valuable information about your child\'s learning style and help create the perfect classroom experience.',
    completion_message: 'Thank you! Your insights about {child_name}\'s home behavior will help teachers understand their learning style better.',
    result_page_template: 'parent_focused',
    
    scoring_weight: 0.6, // Parents have more comprehensive view
    confidence_boost: 30, // Significant confidence boost from parent input
    
    context_settings: {
      emphasize_categories: ['Communication', 'Collaboration', 'Creative Innovation'],
      include_interests: true,
      include_motivations: true,
      include_school_experience: true,
      show_progress_indicators: true
    },
    
    requires_invitation: false,
    can_be_shared: true,
    created_at: new Date().toISOString(),
    is_active: true
  },

  teacher_classroom: {
    id: 'teacher_classroom',
    quiz_type: 'teacher_classroom',
    name: 'Teacher Classroom Assessment',
    description: 'Professional assessment of student behavior and learning patterns in the classroom environment',
    target_respondent: 'teacher',
    
    question_count: 12,
    estimated_duration_minutes: 4,
    supported_age_groups: ['3-4', '4-5', '5+'],
    
    // Custom question filtering for teacher context
    question_filter: (questions: Question[]) => {
      // Focus on questions teachers can observe in classroom
      const teacher_relevant_ids = [5, 6, 7, 8, 11, 12, 14, 15, 16, 19, 20, 23]
      return questions.filter(q => teacher_relevant_ids.includes(q.id))
    },
    
    question_customizer: (question: Question, context: QuizContext) => ({
      ...question,
      text: customizeQuestionForTeacher(question.text, context),
      encouragingIntro: question.encouragingIntro?.replace(/\[name\]/g, context.child_name),
      example: addTeacherContextToExample(question.example)
    }),
    
    intro_text: 'Share your professional observations about {child_name}\'s classroom behavior and learning patterns. This assessment will enhance their learning profile with valuable educator insights.',
    completion_message: 'Assessment complete! Your professional insights will be integrated with parent observations to create a comprehensive learning profile for {child_name}.',
    result_page_template: 'teacher_focused',
    
    scoring_weight: 0.8, // Teachers have professional expertise
    confidence_boost: 40, // High confidence boost from professional assessment
    
    context_settings: {
      emphasize_categories: ['Content', 'Critical Thinking', 'Collaboration', 'Confidence'],
      include_interests: false, // Teachers focus less on personal interests
      include_motivations: true,
      include_school_experience: false, // Teachers know this already
      show_progress_indicators: true
    },
    
    requires_invitation: true, // Teachers need to be invited to assess specific students
    can_be_shared: true,
    created_at: new Date().toISOString(),
    is_active: true
  },

  student_self: {
    id: 'student_self',
    quiz_type: 'student_self',
    name: 'Student Self-Assessment',
    description: 'Age-appropriate self-reflection for older students to contribute to their own learning profile',
    target_respondent: 'student',
    
    question_count: 10,
    estimated_duration_minutes: 3,
    supported_age_groups: ['5+'], // Only for older students
    
    question_filter: (questions: Question[]) => {
      // Simple questions students can answer about themselves
      const student_relevant_ids = [1, 5, 9, 13, 17, 21, 22, 25, 26, 29]
      return questions.filter(q => student_relevant_ids.includes(q.id))
    },
    
    question_customizer: (question: Question, context: QuizContext) => ({
      ...question,
      text: convertToFirstPerson(question.text),
      encouragingIntro: makeStudentFriendly(question.encouragingIntro),
      example: addStudentContextToExample(question.example)
    }),
    
    intro_text: 'Hi {child_name}! This quick quiz will help your teacher understand how you like to learn. Answer honestly - there are no wrong answers!',
    completion_message: 'Great job, {child_name}! Your answers will help your teacher create better learning experiences just for you.',
    result_page_template: 'student_focused',
    
    scoring_weight: 0.3, // Lower weight as students may not have full self-awareness
    confidence_boost: 15, // Modest boost from self-assessment
    
    context_settings: {
      emphasize_categories: ['Communication', 'Confidence', 'Creative Innovation'],
      include_interests: true,
      include_motivations: true,
      include_school_experience: false,
      show_progress_indicators: false // Less overwhelming for students
    },
    
    requires_invitation: true,
    can_be_shared: false, // Student assessments kept private until appropriate
    created_at: new Date().toISOString(),
    is_active: true
  },

  general: {
    id: 'general',
    quiz_type: 'general',
    name: 'General Learning Profile Assessment',
    description: 'Comprehensive assessment covering all aspects of learning style and preferences',
    target_respondent: 'general',
    
    question_count: 24, // All questions
    estimated_duration_minutes: 7,
    supported_age_groups: ['3-4', '4-5', '5+'],
    
    // No filtering - use all questions
    question_filter: (questions: Question[]) => questions,
    
    question_customizer: (question: Question, context: QuizContext) => ({
      ...question,
      text: question.text.replace(/\[name\]/g, context.child_name),
      encouragingIntro: question.encouragingIntro?.replace(/\[name\]/g, context.child_name)
    }),
    
    intro_text: 'Create a comprehensive learning profile for {child_name}. This assessment covers all aspects of their learning style and preferences.',
    completion_message: 'Profile complete! You\'ve created a comprehensive learning profile for {child_name}.',
    result_page_template: 'standard',
    
    scoring_weight: 1.0, // Full weight for comprehensive assessment
    confidence_boost: 50, // Maximum confidence for complete assessment
    
    context_settings: {
      include_interests: true,
      include_motivations: true,
      include_school_experience: true,
      show_progress_indicators: true
    },
    
    requires_invitation: false,
    can_be_shared: true,
    created_at: new Date().toISOString(),
    is_active: true
  }
}

// Helper functions for question customization
function addParentContextToExample(example?: string): string | undefined {
  if (!example) return example
  return `${example} (Think about what you observe at home)`
}

function addTeacherContextToExample(example?: string): string | undefined {
  if (!example) return example
  return `${example} (Consider your classroom observations)`
}

function addStudentContextToExample(example?: string): string | undefined {
  if (!example) return example
  return `${example} (Think about how you feel and act)`
}

function customizeQuestionForTeacher(text: string, context: QuizContext): string {
  // Convert parent-oriented questions to teacher-oriented
  return text
    .replace(/your child/g, `${context.child_name}`)
    .replace(/they're most likely to/g, `this student typically`)
    .replace(/When /, `In the classroom, when `)
    .replace(/at home/g, `in class`)
}

function convertToFirstPerson(text: string): string {
  // Convert third-person to first-person for student self-assessment
  return text
    .replace(/\[name\]/g, `you`)
    .replace(/they are/g, `you are`)
    .replace(/they're/g, `you're`)
    .replace(/their/g, `your`)
    .replace(/them/g, `you`)
}

function makeStudentFriendly(intro?: string): string | undefined {
  if (!intro) return intro
  // Simplify language for students
  return intro
    .replace(/Let's explore/g, `Tell us about`)
    .replace(/\[name\]/g, `you`)
    .replace(/your child/g, `you`)
}

// API functions
export function getQuizDefinition(quiz_type: QuizType): QuizDefinition {
  return QUIZ_DEFINITIONS[quiz_type]
}

export function getQuestionsForQuiz(quiz_type: QuizType, age_group: AgeGroup, context: QuizContext): Question[] {
  const definition = getQuizDefinition(quiz_type)
  
  // Start with age-appropriate questions
  const baseQuestions = getQuestionsForAge(age_group)
  
  // Apply quiz-specific filtering
  let questions = definition.question_filter ? definition.question_filter(baseQuestions) : baseQuestions
  
  // Apply customization
  if (definition.question_customizer) {
    questions = questions.map(q => definition.question_customizer!(q, context))
  }
  
  return questions.slice(0, definition.question_count)
}

export function calculateQuizContribution(quiz_type: QuizType, responses: Record<number, any>): {
  weight: number
  confidence_boost: number
  categories_covered: string[]
} {
  const definition = getQuizDefinition(quiz_type)
  
  return {
    weight: definition.scoring_weight,
    confidence_boost: definition.confidence_boost,
    categories_covered: definition.context_settings.emphasize_categories || CATEGORIES.filter(c => c !== 'Interests' && c !== 'Motivation' && c !== 'School Experience')
  }
}

// Import required functions from questions module
import { getQuestionsForAge } from './questions'