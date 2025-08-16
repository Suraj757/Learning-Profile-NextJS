// CLP 2.0 Multi-Quiz Question System
// Separate Parent quiz (home context) and Teacher quiz (classroom context)

import { CLP2Question, CLP2_QUESTIONS, CLP2_EXTENDED_QUESTIONS, CLP2_PREFERENCE_QUESTIONS } from './clp-questions'

export interface QuizConfiguration {
  quizType: 'parent_home' | 'teacher_classroom' | 'general'
  questionCount: number
  includePreferences: boolean
  contextFocus: string
  questions: CLP2Question[]
  distributionRationale: string
}

// Parent Quiz: 15 skill questions + 4 preferences = 19 total
// Focus: Home behavior, family interactions, and learning preferences
export const PARENT_QUIZ_DISTRIBUTION = {
  // 6Cs (Core Skills) - 9 questions (1.5 per skill on average)
  Communication: [1, 2], // 2 questions - critical for parent observation
  Collaboration: [4], // 1 question - sibling/family dynamics
  Content: [7], // 1 question - curiosity and learning
  'Critical Thinking': [11], // 1 question - problem-solving at home
  'Creative Innovation': [13, 14], // 2 questions - creativity clearly visible at home
  Confidence: [16, 17], // 2 questions - resilience and self-assurance
  
  // Academic Skills - 6 questions (3 per skill)
  Literacy: [19, 20, 21], // 3 questions - reading/writing interest at home
  Math: [22, 23, 24], // 3 questions - number sense and patterns
  
  // Learning Preferences - 4 questions
  Preferences: [25, 26, 27, 28] // All preference questions for complete picture
}

// Teacher Quiz: 12 skill questions (no preferences)
// Focus: Classroom behavior, academic performance, and peer interactions
export const TEACHER_QUIZ_DISTRIBUTION = {
  // 6Cs (Core Skills) - 8 questions (1.3 per skill on average)
  Communication: [1, 3], // 2 questions - classroom discussion and listening
  Collaboration: [4, 5], // 2 questions - group work and sharing
  Content: [8, 9], // 2 questions - academic retention and application
  'Critical Thinking': [10, 12], // 2 questions - problem-solving and reasoning
  'Creative Innovation': [], // 0 questions - less observable in structured classroom
  Confidence: [], // 0 questions - overlaps with other areas in classroom
  
  // Academic Skills - 4 questions (2 per skill)
  Literacy: [19, 21], // 2 questions - reading interest and word patterns
  Math: [22, 24] // 2 questions - counting and problem-solving
}

// Generate Parent Quiz Questions
export function getParentQuizQuestions(ageGroup: '3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+' = '5-6'): QuizConfiguration {
  const selectedQuestions: CLP2Question[] = []
  
  // Combine core and extended questions for older children
  const allQuestions = ['6-8', '8-10', '10+'].includes(ageGroup) 
    ? [...CLP2_QUESTIONS, ...CLP2_EXTENDED_QUESTIONS] 
    : CLP2_QUESTIONS
  
  // Add skill questions based on distribution
  Object.entries(PARENT_QUIZ_DISTRIBUTION).forEach(([skill, questionIds]) => {
    if (skill !== 'Preferences') {
      questionIds.forEach(id => {
        const question = allQuestions.find(q => q.id === id)
        if (question && question.ageGroups.includes(ageGroup)) {
          selectedQuestions.push({
            ...question,
            context: 'home' as const,
            text: adaptQuestionForParent(question.text)
          })
        }
      })
    }
  })
  
  // For older children (6+), add some extended questions for comprehensive assessment
  if (['6-8', '8-10', '10+'].includes(ageGroup)) {
    const extendedQuestions = CLP2_EXTENDED_QUESTIONS.filter(q => 
      q.ageGroups.includes(ageGroup) && 
      (q.context === 'universal' || q.context === 'home') &&
      selectedQuestions.find(sq => sq.skill === q.skill && sq.id !== q.id) // Add if we don't already have 3+ questions for this skill
    ).slice(0, 6) // Add up to 6 additional questions
    
    extendedQuestions.forEach(q => {
      selectedQuestions.push({
        ...q,
        context: 'home' as const,
        text: adaptQuestionForParent(q.text)
      })
    })
  }
  
  // Add all preference questions
  selectedQuestions.push(...CLP2_PREFERENCE_QUESTIONS.filter(q => q.ageGroups.includes(ageGroup)))
  
  return {
    quizType: 'parent_home',
    questionCount: selectedQuestions.length,
    includePreferences: true,
    contextFocus: 'Home behavior, family interactions, learning preferences',
    questions: selectedQuestions,
    distributionRationale: 'Emphasizes skills most observable by parents: communication, creativity, academic interests, and complete learning preferences for personalized support'
  }
}

// Generate Teacher Quiz Questions  
export function getTeacherQuizQuestions(ageGroup: '3-4' | '4-5' | '5-6' | '6-8' | '8-10' | '10+' = '5-6'): QuizConfiguration {
  const selectedQuestions: CLP2Question[] = []
  
  // Combine core and extended questions for older children
  const allQuestions = ['6-8', '8-10', '10+'].includes(ageGroup) 
    ? [...CLP2_QUESTIONS, ...CLP2_EXTENDED_QUESTIONS] 
    : CLP2_QUESTIONS
  
  // Add skill questions based on distribution
  Object.entries(TEACHER_QUIZ_DISTRIBUTION).forEach(([skill, questionIds]) => {
    questionIds.forEach(id => {
      const question = allQuestions.find(q => q.id === id)
      if (question && question.ageGroups.includes(ageGroup)) {
        selectedQuestions.push({
          ...question,
          context: 'classroom' as const,
          text: adaptQuestionForTeacher(question.text)
        })
      }
    })
  })
  
  // For older children (6+), add extended questions that are classroom-relevant
  if (['6-8', '8-10', '10+'].includes(ageGroup)) {
    const classroomExtendedQuestions = CLP2_EXTENDED_QUESTIONS.filter(q => 
      q.ageGroups.includes(ageGroup) && 
      (q.context === 'classroom' || q.context === 'universal') &&
      q.id >= 29 // Extended questions only
    ).slice(0, 8) // Add up to 8 extended questions for comprehensive classroom assessment
    
    classroomExtendedQuestions.forEach(q => {
      selectedQuestions.push({
        ...q,
        context: 'classroom' as const,
        text: adaptQuestionForTeacher(q.text)
      })
    })
  }
  
  return {
    quizType: 'teacher_classroom',
    questionCount: selectedQuestions.length,
    includePreferences: false,
    contextFocus: 'Classroom behavior, academic performance, peer interactions',
    questions: selectedQuestions,
    distributionRationale: 'Focuses on skills most observable in classroom: communication, collaboration, content mastery, and academic abilities'
  }
}

// Adapt questions for parent context
function adaptQuestionForParent(questionText: string): string {
  const parentAdaptations: Record<string, string> = {
    // Communication adaptations
    'clearly expresses their thoughts and feelings to others': 'clearly expresses their thoughts and feelings to family members',
    'asks thoughtful questions when they don\'t understand something': 'asks thoughtful questions at home when they don\'t understand something',
    'listens carefully when others are speaking': 'listens carefully when family members are speaking',
    
    // Collaboration adaptations
    'enjoys working with others on projects or activities': 'enjoys working with family members on household activities or projects',
    'shares materials and takes turns without being reminded': 'shares toys/materials with siblings and takes turns without being reminded',
    'helps resolve conflicts between friends peacefully': 'helps resolve conflicts with siblings or playmates peacefully',
    
    // Content adaptations
    'shows curiosity about how things work': 'shows curiosity about how things work around the house',
    'remembers details from stories, lessons, or experiences': 'remembers details from family stories, outings, or experiences',
    'applies what they\'ve learned to new situations': 'applies what they learn to new situations at home',
    
    // Critical Thinking adaptations
    'thinks through problems step by step': 'thinks through everyday problems step by step',
    'asks \'why\' or \'how\' questions about things they observe': 'asks \'why\' or \'how\' questions about things they see at home',
    'can explain their reasoning when making decisions': 'can explain their reasoning during family decisions or choices',
    
    // Creative Innovation adaptations
    'comes up with original ideas for games, stories, or projects': 'comes up with original ideas for games, stories, or family activities',
    'finds new uses for everyday objects during play': 'finds creative new uses for household objects during play',
    'enjoys experimenting with different ways to solve problems': 'enjoys experimenting with different ways to solve problems at home',
    
    // Confidence adaptations
    'tries new activities even when they might be challenging': 'tries new activities at home even when they might be challenging',
    'bounces back quickly from disappointments or setbacks': 'bounces back quickly from disappointments or setbacks at home',
    'feels comfortable sharing their ideas with others': 'feels comfortable sharing their ideas with family members',
    
    // Academic adaptations
    'shows interest in books, letters, or writing': 'shows interest in books, letters, or writing at home',
    'can retell stories in their own words': 'can retell family stories or book stories in their own words',
    'recognizes patterns in words or enjoys word games': 'recognizes patterns in words or enjoys word games during family time',
    'enjoys counting, sorting, or organizing objects': 'enjoys counting, sorting, or organizing objects around the house',
    'notices patterns, shapes, or sizes in their environment': 'notices patterns, shapes, or sizes around the house or neighborhood',
    'can solve simple problems involving numbers or quantities': 'can solve simple problems involving numbers during daily activities',
    
    // Extended questions adaptations for older children (home context)
    'articulates complex ideas and thoughts clearly': 'articulates complex ideas and thoughts clearly to family members',
    'actively participates in group discussions and debates': 'actively participates in family discussions and conversations',
    'demonstrates understanding through detailed explanations': 'demonstrates understanding by explaining things clearly to family',
    'takes on leadership roles in group projects': 'takes on leadership roles in family activities or with siblings',
    'mediates conflicts and helps build consensus': 'mediates conflicts and helps build consensus in family situations',
    'collaborates effectively across diverse groups': 'collaborates well with different family members and friends',
    'makes connections between different subject areas': 'makes connections between what they learn at school and home activities',
    'demonstrates mastery of grade-level academic concepts': 'shows strong understanding of what they\'re learning at school',
    'seeks out additional learning opportunities on topics of interest': 'seeks out books, videos, or activities about topics that interest them',
    'analyzes information from multiple sources': 'compares and analyzes information from different books, shows, or conversations',
    'evaluates the credibility and reliability of information': 'questions whether information they hear or read makes sense',
    'draws logical conclusions based on evidence': 'draws logical conclusions based on what they observe at home',
    'develops innovative solutions to complex problems': 'comes up with creative solutions to problems around the house',
    'combines ideas from different domains in original ways': 'combines ideas from different areas in creative and original ways',
    'persists through multiple iterations to refine creative work': 'keeps working on creative projects until they\'re satisfied with the result',
    'advocates for their learning needs and preferences': 'speaks up about what helps them learn best at home',
    'demonstrates resilience when facing academic challenges': 'bounces back from challenges with schoolwork or learning',
    'takes intellectual risks in their learning': 'tries challenging new learning activities even when they might be difficult',
    'reads complex texts independently and with comprehension': 'reads challenging books independently and understands them well',
    'writes clearly and persuasively for different purposes': 'writes clearly whether for school, personal, or creative purposes',
    'analyzes themes, characters, and literary devices': 'talks thoughtfully about characters, themes, and writing techniques in books',
    'applies mathematical concepts to real-world situations': 'uses math concepts they\'ve learned in everyday situations at home',
    'works comfortably with abstract mathematical concepts': 'understands and works with complex math ideas beyond simple counting',
    'explains mathematical reasoning clearly to others': 'explains how they solved math problems to family members'
  }
  
  let adaptedText = questionText
  Object.entries(parentAdaptations).forEach(([original, adapted]) => {
    adaptedText = adaptedText.replace(original, adapted)
  })
  
  return adaptedText
}

// Adapt questions for teacher context
function adaptQuestionForTeacher(questionText: string): string {
  const teacherAdaptations: Record<string, string> = {
    // Communication adaptations
    'My child clearly expresses': 'This student clearly expresses',
    'My child asks': 'This student asks',
    'My child listens': 'This student listens',
    'to others': 'to classmates and teachers',
    'when others are speaking': 'during classroom discussions',
    
    // Collaboration adaptations
    'enjoys working with others': 'enjoys working with classmates',
    'on projects or activities': 'on group projects or classroom activities',
    'shares materials and takes turns': 'shares classroom materials and takes turns',
    'without being reminded': 'without teacher reminders',
    'between friends': 'between classmates',
    
    // Content adaptations
    'shows curiosity about how things work': 'shows curiosity about academic topics and how things work',
    'from stories, lessons, or experiences': 'from lessons, instruction, or classroom experiences',
    'to new situations': 'to new academic situations or subjects',
    
    // Critical Thinking adaptations
    'thinks through problems': 'thinks through academic problems or classroom challenges',
    'about things they observe': 'about academic content or classroom observations',
    'when making decisions': 'during classroom problem-solving or discussions',
    
    // Academic adaptations
    'shows interest in books, letters, or writing': 'shows interest in classroom reading, writing, or literacy activities',
    'can retell stories': 'can retell classroom stories or lessons',
    'or enjoys word games': 'or engages with classroom word activities',
    'enjoys counting, sorting, or organizing objects': 'enjoys math activities, counting, or organizing classroom materials',
    'in their environment': 'in the classroom environment or academic materials',
    'involving numbers or quantities': 'involving numbers during math instruction or activities',
    
    // Extended questions adaptations for older children (classroom context)
    'articulates complex ideas and thoughts clearly': 'articulates complex academic ideas and thoughts clearly in classroom discussions',
    'actively participates in group discussions and debates': 'actively participates in classroom discussions and academic debates',
    'demonstrates understanding through detailed explanations': 'demonstrates understanding through detailed explanations of academic concepts',
    'takes on leadership roles in group projects': 'takes on leadership roles in classroom group projects',
    'mediates conflicts and helps build consensus': 'mediates conflicts and helps build consensus during group work',
    'collaborates effectively across diverse groups': 'collaborates effectively with diverse classmates',
    'makes connections between different subject areas': 'makes connections between different academic subjects',
    'demonstrates mastery of grade-level academic concepts': 'demonstrates mastery of grade-level academic concepts in class',
    'seeks out additional learning opportunities on topics of interest': 'seeks out additional academic resources or asks for enrichment activities',
    'analyzes information from multiple sources': 'analyzes information from multiple academic sources',
    'evaluates the credibility and reliability of information': 'evaluates the credibility of academic sources and information',
    'draws logical conclusions based on evidence': 'draws logical conclusions based on academic evidence and data',
    'develops innovative solutions to complex problems': 'develops innovative solutions to complex academic problems',
    'combines ideas from different domains in original ways': 'combines ideas from different academic domains in original ways',
    'persists through multiple iterations to refine creative work': 'persists through multiple drafts to refine academic work',
    'advocates for their learning needs and preferences': 'advocates for their academic learning needs and preferences',
    'demonstrates resilience when facing academic challenges': 'demonstrates resilience when facing challenging academic material',
    'takes intellectual risks in their learning': 'takes intellectual risks in academic learning and discussions',
    'reads complex texts independently and with comprehension': 'reads complex academic texts independently with strong comprehension',
    'writes clearly and persuasively for different purposes': 'writes clearly and persuasively for different academic purposes',
    'analyzes themes, characters, and literary devices': 'analyzes themes, characters, and literary devices in class discussions',
    'applies mathematical concepts to real-world situations': 'applies mathematical concepts to academic problems and real-world situations',
    'works comfortably with abstract mathematical concepts': 'works comfortably with grade-level abstract mathematical concepts',
    'explains mathematical reasoning clearly to others': 'explains mathematical reasoning clearly to classmates and teachers'
  }
  
  let adaptedText = questionText
  Object.entries(teacherAdaptations).forEach(([original, adapted]) => {
    adaptedText = adaptedText.replace(original, adapted)
  })
  
  return adaptedText
}

// Get skill coverage analysis
export function getSkillCoverage(quizType: 'parent_home' | 'teacher_classroom'): {
  skill: string
  questionCount: number
  coverage: 'full' | 'partial' | 'none'
  rationale: string
}[] {
  const distribution = quizType === 'parent_home' ? PARENT_QUIZ_DISTRIBUTION : TEACHER_QUIZ_DISTRIBUTION
  
  const skillAnalysis = [
    {
      skill: 'Communication',
      questionCount: distribution.Communication.length,
      coverage: distribution.Communication.length >= 2 ? 'full' : distribution.Communication.length === 1 ? 'partial' : 'none',
      rationale: quizType === 'parent_home' 
        ? 'Critical for parent observation - home conversations and expression'
        : 'Essential in classroom - discussions and peer communication'
    },
    {
      skill: 'Collaboration', 
      questionCount: distribution.Collaboration.length,
      coverage: distribution.Collaboration.length >= 2 ? 'full' : distribution.Collaboration.length === 1 ? 'partial' : 'none',
      rationale: quizType === 'parent_home'
        ? 'Family dynamics and sibling interactions'
        : 'Core classroom skill - group work and peer interaction'
    },
    {
      skill: 'Content',
      questionCount: distribution.Content.length,
      coverage: distribution.Content.length >= 2 ? 'full' : distribution.Content.length === 1 ? 'partial' : 'none',
      rationale: quizType === 'parent_home'
        ? 'Home learning curiosity and knowledge retention'
        : 'Academic focus - classroom learning and retention'
    },
    {
      skill: 'Critical Thinking',
      questionCount: distribution['Critical Thinking'].length,
      coverage: distribution['Critical Thinking'].length >= 2 ? 'full' : distribution['Critical Thinking'].length === 1 ? 'partial' : 'none',
      rationale: quizType === 'parent_home'
        ? 'Problem-solving in family context'
        : 'Academic reasoning and classroom problem-solving'
    },
    {
      skill: 'Creative Innovation',
      questionCount: (distribution as any)['Creative Innovation']?.length || 0,
      coverage: ((distribution as any)['Creative Innovation']?.length || 0) >= 2 ? 'full' : ((distribution as any)['Creative Innovation']?.length || 0) === 1 ? 'partial' : 'none',
      rationale: quizType === 'parent_home'
        ? 'Highly observable at home through play and creativity'
        : 'Less observable in structured classroom environment'
    },
    {
      skill: 'Confidence',
      questionCount: (distribution as any).Confidence?.length || 0,
      coverage: ((distribution as any).Confidence?.length || 0) >= 2 ? 'full' : ((distribution as any).Confidence?.length || 0) === 1 ? 'partial' : 'none',
      rationale: quizType === 'parent_home'
        ? 'Clear in home environment - trying new things and resilience'
        : 'Overlaps with other skills in classroom assessment'
    },
    {
      skill: 'Literacy',
      questionCount: distribution.Literacy.length,
      coverage: distribution.Literacy.length >= 2 ? 'full' : distribution.Literacy.length === 1 ? 'partial' : 'none',
      rationale: quizType === 'parent_home'
        ? 'Home reading interest and story engagement'
        : 'Classroom literacy skills and academic reading'
    },
    {
      skill: 'Math', 
      questionCount: distribution.Math.length,
      coverage: distribution.Math.length >= 2 ? 'full' : distribution.Math.length === 1 ? 'partial' : 'none',
      rationale: quizType === 'parent_home'
        ? 'Number sense and patterns in daily activities'
        : 'Academic math skills and problem-solving'
    }
  ]
  
  return skillAnalysis.map(analysis => ({
    ...analysis,
    coverage: analysis.coverage as 'full' | 'partial' | 'none'
  }))
}

// Validate quiz configuration
export function validateQuizConfiguration(config: QuizConfiguration): {
  isValid: boolean
  warnings: string[]
  recommendations: string[]
} {
  const warnings: string[] = []
  const recommendations: string[] = []
  
  // Skip skill coverage analysis for general quizzes
  if (config.quizType === 'general') {
    return {
      isValid: true,
      warnings: config.questionCount > 50 ? ['Very long quiz may cause fatigue'] : [],
      recommendations: []
    }
  }
  
  const skillCoverage = getSkillCoverage(config.quizType)
  const noCoverage = skillCoverage.filter(s => s.coverage === 'none')
  const partialCoverage = skillCoverage.filter(s => s.coverage === 'partial')
  
  if (noCoverage.length > 0) {
    warnings.push(`No coverage for: ${noCoverage.map(s => s.skill).join(', ')}`)
  }
  
  if (partialCoverage.length > 2) {
    warnings.push(`Limited coverage for: ${partialCoverage.map(s => s.skill).join(', ')}`)
  }
  
  if (config.quizType === 'teacher_classroom' && config.includePreferences) {
    recommendations.push('Consider removing preferences from teacher quiz - focus on observable classroom behaviors')
  }
  
  if (config.questionCount < 10) {
    warnings.push('Very short quiz may not provide reliable assessment')
  }
  
  if (config.questionCount > 30) {
    warnings.push('Long quiz may cause fatigue and reduce response quality')
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  }
}