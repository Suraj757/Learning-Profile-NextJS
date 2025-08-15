// Extended Questions for 6+ Year Olds
// Maintains CLP 2.0 compliance: 24 questions + 4 preferences = 28 total

import type { Question, Category } from './questions'
import { INTEREST_OPTIONS, ENGAGEMENT_OPTIONS, MODALITY_OPTIONS, SOCIAL_OPTIONS } from './questions'

/**
 * Extended question set for children 6+ years old
 * Adapts the 5+ questions with increased academic and social complexity
 */
export const EXTENDED_QUESTIONS_6_PLUS: Question[] = [
  // Communication (4 questions) 💬
  { 
    id: 1, 
    text: "During class presentations or group discussions at school, [name] confidently shares detailed stories and experiences with classmates.", 
    category: "Communication",
    encouragingIntro: "Let's explore how [name] communicates at school! 💬",
    example: "Think about show-and-tell, book reports, or sharing time in class"
  },
  { 
    id: 2, 
    text: "When explaining homework problems or teaching classmates something new, [name] uses clear language that others can understand.", 
    category: "Communication",
    encouragingIntro: "How well does [name] explain things to others? 🗣️",
    example: "Like when they help a friend with math or explain a game's rules"
  },
  { 
    id: 3, 
    text: "During family discussions and conversations with friends, [name] listens carefully to others before sharing their own ideas.", 
    category: "Communication",
    encouragingIntro: "Let's see how [name] participates in conversations! 👂",
    example: "Notice if they wait for others to finish speaking during dinner talks"
  },
  { 
    id: 4, 
    text: "When presenting to the class or telling stories to friends, [name] uses eye contact and gestures to help others understand their ideas.", 
    category: "Communication",
    encouragingIntro: "How does [name] connect with their audience? 🎭",
    example: "Watch how they use their hands and eyes when sharing experiences"
  },

  // Collaboration (4 questions) 🤝
  { 
    id: 5, 
    text: "During school group work and team sports, [name] naturally takes turns and makes sure everyone gets included in activities.", 
    category: "Collaboration",
    encouragingIntro: "Time to explore [name]'s teamwork skills! 🤝",
    example: "Group projects, team sports, playground games - how do they include others?"
  },
  { 
    id: 6, 
    text: "In collaborative school assignments and group activities, [name] contributes ideas and helps keep the team organized and focused.", 
    category: "Collaboration",
    encouragingIntro: "Does [name] step up as a team leader? 🌟",
    example: "Think about science projects, group presentations, or team challenges"
  },
  { 
    id: 7, 
    text: "When disagreements happen during group work or with friends, [name] tries to find solutions that work for everyone involved.", 
    category: "Collaboration",
    encouragingIntro: "How does [name] handle conflicts with peers? 🕊️",
    example: "When classmates disagree on project ideas or playground rules"
  },
  { 
    id: 8, 
    text: "During team activities and group competitions, [name] celebrates their teammates' successes and gets excited about group achievements.", 
    category: "Collaboration",
    encouragingIntro: "Let's explore [name]'s team spirit! 🎉",
    example: "Notice if they cheer for others' successes, not just their own"
  },

  // Content (4 questions) 📚
  { 
    id: 9, 
    text: "When [name] learns new concepts in school subjects, they seem to understand quickly and remember information well across different topics.", 
    category: "Content",
    encouragingIntro: "How does [name] handle school learning? 📚",
    example: "Whether it's reading, math, science, or social studies - how fast do they pick up new material?"
  },
  { 
    id: 10, 
    text: "When [name] learns something new in school, they often connect it to previous lessons and share those connections with others.", 
    category: "Content",
    encouragingIntro: "Does [name] connect different ideas together? 🔗",
    example: "Like saying 'This math problem is like the one we did yesterday' or 'This story reminds me of...'" 
  },
  { 
    id: 11, 
    text: "During lessons and homework time, [name] asks thoughtful questions that show they're thinking deeply about the subject.", 
    category: "Content",
    encouragingIntro: "How curious is [name] about school subjects? 🤔",
    example: "The kinds of 'why' and 'what if' questions that show real thinking"
  },
  { 
    id: 12, 
    text: "When [name] faces challenging assignments, they use strategies and knowledge from previous lessons to work through problems.", 
    category: "Content",
    encouragingIntro: "Can [name] apply what they've learned? 💡",
    example: "Using reading strategies for new books, or math skills for word problems"
  },

  // Critical Thinking (4 questions) 🧠
  { 
    id: 13, 
    text: "When [name] encounters difficult homework or school problems, they think of multiple approaches before choosing the best solution.", 
    category: "Critical Thinking",
    encouragingIntro: "Let's explore [name]'s problem-solving skills! 🧠",
    example: "Math word problems, science experiments, or research projects"
  },
  { 
    id: 14, 
    text: "During class discussions and family conversations, [name] asks questions that show they're analyzing topics deeply.", 
    category: "Critical Thinking",
    encouragingIntro: "How analytically does [name] think? 🤯",
    example: "Questions that go beyond the obvious and make others think harder"
  },
  { 
    id: 15, 
    text: "When teachers or friends share information, [name] thinks about it carefully rather than just accepting it immediately.", 
    category: "Critical Thinking",
    encouragingIntro: "Does [name] think independently? 🕵️",
    example: "They might ask 'How do we know that?' or 'What if we tried this instead?'"
  },
  { 
    id: 16, 
    text: "When facing large school projects or complex tasks, [name] breaks them down into smaller, manageable steps.", 
    category: "Critical Thinking",
    encouragingIntro: "How does [name] tackle big challenges? 🧩",
    example: "Like organizing a book report or science fair project into smaller parts"
  },

  // Creative Innovation (4 questions) 🎨
  { 
    id: 17, 
    text: "During art class, creative writing, and personal projects, [name] comes up with original ideas that surprise and impress others.", 
    category: "Creative Innovation",
    encouragingIntro: "Let's celebrate [name]'s creativity! 🎨",
    example: "School art projects, story writing, or personal interests - do they create something unique?"
  },
  { 
    id: 18, 
    text: "When [name] faces challenging school problems, they think of creative, unusual solutions that other students might not consider.", 
    category: "Creative Innovation",
    encouragingIntro: "How creative is [name]'s problem-solving? 💫",
    example: "Using innovative approaches for projects or finding new ways to study"
  },
  { 
    id: 19, 
    text: "In their school work, art, and personal projects, [name] adds special touches that make their work distinctly their own.", 
    category: "Creative Innovation",
    encouragingIntro: "What makes [name]'s work special? ✨",
    example: "That signature style or personal flair that says 'This is clearly [name]'s work!'"
  },
  { 
    id: 20, 
    text: "During free time and open-ended school activities, [name] loves to experiment with new ideas and approaches.", 
    category: "Creative Innovation",
    encouragingIntro: "How does [name] explore and innovate? 🔬",
    example: "Free writing time, art exploration, or independent research topics"
  },

  // Confidence (4 questions) ⭐
  { 
    id: 21, 
    text: "When [name] faces new school subjects or challenging assignments, they show excitement and confidence in tackling them.", 
    category: "Confidence",
    encouragingIntro: "Let's explore [name]'s confidence! ⭐",
    example: "New math concepts, reading chapter books, or science experiments"
  },
  { 
    id: 22, 
    text: "In classroom discussions and social situations at school, [name] shares their opinions confidently without worrying too much about peer judgment.", 
    category: "Confidence",
    encouragingIntro: "How comfortable is [name] expressing themselves? 💭",
    example: "Class discussions, lunch table conversations, or playground interactions"
  },
  { 
    id: 23, 
    text: "When [name] makes mistakes on homework or in school activities, they bounce back quickly, learn from them, and keep trying.", 
    category: "Confidence",
    encouragingIntro: "How does [name] handle academic setbacks? 💪",
    example: "Wrong answers in class, challenging homework, or difficult tests"
  },
  { 
    id: 24, 
    text: "When doing homework or working on independent school assignments, [name] approaches tasks confidently and persists through difficulties.", 
    category: "Confidence",
    encouragingIntro: "How does [name] work independently? 🚀",
    example: "Homework time, independent reading, or solo projects"
  },
  
  // Interests (1 question) - Enhanced for school age
  {
    id: 25,
    text: "Which school subjects and topics does [name] get most excited about? (Select up to 5)",
    category: "Interests",
    questionType: "checkbox",
    options: [
      // Academic subjects
      'Reading & Literature', 'Creative Writing', 'Math & Numbers', 'Science Experiments',
      'History & Social Studies', 'Geography & Maps', 'Art & Drawing', 'Music & Instruments',
      
      // STEM & Technology
      'Coding & Technology', 'Engineering & Building', 'Robotics', 'Space & Astronomy',
      
      // Active & Social
      'Sports & Physical Activity', 'Team Games', 'Drama & Theater', 'Public Speaking',
      
      // Nature & Animals
      'Animals & Wildlife', 'Plants & Gardening', 'Environment & Ecology', 'Weather & Climate',
      
      // Creative & Practical
      'Cooking & Nutrition', 'Fashion & Design', 'Photography', 'Crafts & Making',
      
      // Cultural & Global
      'Different Cultures', 'Languages', 'Current Events', 'Community Service'
    ] as string[],
    encouragingIntro: "What school subjects make [name]'s eyes light up? ❤️",
    example: "Think about which topics they choose for free research or ask to learn more about"
  },

  // Motivation - Enhanced Engagement Style (1 question)
  {
    id: 26,
    text: "[name] learns best and stays most engaged during school activities that involve:",
    category: "Motivation",
    questionType: "multipleChoice",
    options: [
      "Hands-on experiments, building, and interactive activities",
      "Reading, research, and independent study projects", 
      "Group discussions, presentations, and collaborative work",
      "Creative projects, art, music, and self-expression",
      "Physical movement, outdoor learning, and active participation",
      "Technology, digital tools, and multimedia projects"
    ] as string[],
    encouragingIntro: "How does [name] learn best in school? ⚡",
    example: "Think about when they're most focused and excited during learning"
  },

  // Motivation - Learning Modality for School Age (1 question)
  {
    id: 27,
    text: "When [name] learns new school concepts, they prefer to:",
    category: "Motivation", 
    questionType: "multipleChoice",
    options: [
      "Explore and discover through hands-on investigation",
      "See examples and visual demonstrations first",
      "Receive step-by-step explanations and clear instructions",
      "Connect new learning to stories, real-life situations, or personal interests",
      "Discuss and talk through ideas with teachers and classmates",
      "Practice and repeat until they master the skill"
    ] as string[],
    encouragingIntro: "What helps [name] understand new school material? 🧠",
    example: "Consider how they best absorb new information in different subjects"
  },

  // School Experience & Social Learning (1 question)
  {
    id: 28,
    text: "In their current school environment, [name] typically:",
    category: "School Experience",
    questionType: "multipleChoice",
    options: [
      "Thrives in independent work and self-directed learning",
      "Enjoys collaborative group projects and team learning",
      "Prefers one-on-one support and guidance from teachers",
      "Excels in structured, teacher-led instruction",
      "Learns best through peer interaction and social learning",
      "Succeeds with a mix of different learning formats"
    ] as string[],
    encouragingIntro: "How does [name] thrive in their school setting? 🎓",
    example: "Think about their most successful learning experiences this year"
  }
]

/**
 * 7+ Year Old Adaptations - For children 7-8+ years
 * Even more advanced academic and social contexts
 */
export const EXTENDED_QUESTIONS_7_PLUS: Question[] = EXTENDED_QUESTIONS_6_PLUS.map(question => {
  const sevenPlusAdaptations: Record<string, string> = {
    // More advanced academic contexts
    "school subjects": "advanced school subjects and independent research",
    "homework problems": "complex homework assignments and multi-step problems", 
    "class presentations": "formal presentations and academic discussions",
    "group work": "collaborative research projects and team investigations",
    "school activities": "extracurricular activities and academic competitions",
    
    // More sophisticated social contexts  
    "friends": "close friendships and peer relationships",
    "classmates": "study groups and academic peer interactions",
    "family discussions": "family debates and complex conversations",
    
    // Advanced academic skills
    "new concepts": "abstract concepts and advanced material",
    "challenging assignments": "independent research and long-term projects",
    "difficult homework": "complex problem-solving and critical analysis",
    "school problems": "academic challenges and strategic thinking tasks"
  }
  
  let adaptedText = question.text
  let adaptedExample = question.example || ''
  
  // Apply adaptations to question text
  for (const [original, advanced] of Object.entries(sevenPlusAdaptations)) {
    adaptedText = adaptedText.replace(new RegExp(original, 'gi'), advanced)
    adaptedExample = adaptedExample.replace(new RegExp(original, 'gi'), advanced)
  }
  
  return {
    ...question,
    text: adaptedText,
    example: adaptedExample || question.example
  }
})

/**
 * Academic Skills Assessment for Extended Ages
 * Additional questions that can be optionally included for comprehensive assessment
 */
export const ACADEMIC_ENHANCEMENT_QUESTIONS: Question[] = [
  {
    id: 30,
    text: "When reading chapter books or longer texts, [name] demonstrates strong comprehension and can discuss complex themes and characters.",
    category: "Content",
    encouragingIntro: "How are [name]'s advanced reading skills? 📖",
    example: "Chapter books, non-fiction texts, or reading assignments"
  },
  {
    id: 31, 
    text: "In mathematics, [name] can apply problem-solving strategies to multi-step word problems and explain their reasoning.",
    category: "Critical Thinking",
    encouragingIntro: "How does [name] handle complex math challenges? 🔢",
    example: "Word problems that require multiple operations or logical reasoning"
  },
  {
    id: 32,
    text: "When writing stories or reports, [name] organizes their ideas clearly and uses varied vocabulary to express complex thoughts.",
    category: "Communication", 
    encouragingIntro: "How advanced is [name]'s writing? ✍️",
    example: "Creative writing assignments, research reports, or personal narratives"
  }
]

/**
 * Get appropriate question set based on precise age
 */
export function getExtendedQuestions(ageInYears: number): Question[] {
  if (ageInYears >= 7) {
    return EXTENDED_QUESTIONS_7_PLUS
  } else if (ageInYears >= 6) {
    return EXTENDED_QUESTIONS_6_PLUS  
  } else {
    // Fallback to standard 5+ questions
    return []
  }
}

/**
 * Enhanced academic interests for school-age children
 */
export const SCHOOL_AGE_INTERESTS = [
  // Core Academic Subjects
  'Reading & Literature', 'Creative Writing', 'Poetry', 'Math & Problem Solving',
  'Science Experiments', 'Biology & Life Science', 'Chemistry', 'Physics',
  'History & Timeline', 'Geography & Maps', 'Social Studies', 'Current Events',
  
  // STEM & Technology
  'Coding & Programming', 'Robotics & Engineering', 'Computer Science',
  'Space & Astronomy', 'Invention & Innovation', 'Math Competitions',
  
  // Arts & Creativity  
  'Visual Arts & Drawing', 'Music & Instruments', 'Drama & Theater',
  'Creative Writing', 'Photography', 'Design & Architecture',
  
  // Physical & Active
  'Sports & Athletics', 'Team Sports', 'Individual Sports',
  'Outdoor Activities', 'Physical Challenges', 'Dance & Movement',
  
  // Social & Leadership
  'Public Speaking', 'Debate & Discussion', 'Leadership Activities',
  'Community Service', 'Teaching Others', 'Team Leadership',
  
  // Specialized Interests
  'Foreign Languages', 'Different Cultures', 'Psychology & Behavior',
  'Economics & Money', 'Environmental Science', 'Health & Medicine',
  'Law & Justice', 'Politics & Government', 'Philosophy & Ethics'
] as const