// Learning Assessment Questions - 6C Framework
export const CATEGORIES = [
  'Communication',
  'Collaboration', 
  'Content',
  'Critical Thinking',
  'Creative Innovation',
  'Confidence'
] as const

export type Category = typeof CATEGORIES[number]

export const LIKERT_SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' }
] as const

export interface Question {
  id: number
  text: string
  category: Category
}

export const QUESTIONS: Question[] = [
  // Communication (4 questions)
  { id: 1, text: "During group discussions or show-and-tell, [name] enthusiastically shares detailed stories and experiences.", category: "Communication" },
  { id: 2, text: "When explaining ideas or instructions to others, [name] speaks clearly and uses appropriate vocabulary.", category: "Communication" },
  { id: 3, text: "In classroom discussions, [name] listens attentively to others before responding or asking questions.", category: "Communication" },
  { id: 4, text: "When presenting to the class, [name] maintains eye contact and uses gestures to emphasize points.", category: "Communication" },

  // Collaboration (4 questions)
  { id: 5, text: "During group activities and games, [name] naturally takes turns and includes others.", category: "Collaboration" },
  { id: 6, text: "In team projects, [name] actively contributes ideas and helps coordinate group efforts.", category: "Collaboration" },
  { id: 7, text: "When conflicts arise in group work, [name] suggests compromises and helps find solutions.", category: "Collaboration" },
  { id: 8, text: "During collaborative activities, [name] encourages teammates and celebrates group successes.", category: "Collaboration" },

  // Content (4 questions)
  { id: 9, text: "When learning new concepts, [name] quickly grasps and retains information across different subjects.", category: "Content" },
  { id: 10, text: "During lessons, [name] demonstrates understanding by connecting new information to previous learning.", category: "Content" },
  { id: 11, text: "When working on academic tasks, [name] shows genuine curiosity and asks thoughtful questions.", category: "Content" },
  { id: 12, text: "In classroom activities, [name] applies learned concepts to new situations and problems.", category: "Content" },

  // Critical Thinking (4 questions)
  { id: 13, text: "When solving problems, [name] considers multiple approaches before choosing a solution.", category: "Critical Thinking" },
  { id: 14, text: "During discussions, [name] asks thoughtful questions that show deep thinking about topics.", category: "Critical Thinking" },
  { id: 15, text: "When presented with new information, [name] analyzes and evaluates it rather than accepting it immediately.", category: "Critical Thinking" },
  { id: 16, text: "In problem-solving activities, [name] breaks down complex challenges into manageable steps.", category: "Critical Thinking" },

  // Creative Innovation (4 questions)
  { id: 17, text: "During creative activities, [name] generates original and imaginative ideas or solutions.", category: "Creative Innovation" },
  { id: 18, text: "When faced with challenges, [name] thinks outside the box and suggests innovative approaches.", category: "Creative Innovation" },
  { id: 19, text: "In art, writing, or project work, [name] adds unique personal touches and creative elements.", category: "Creative Innovation" },
  { id: 20, text: "During open-ended activities, [name] experiments with different materials or methods.", category: "Creative Innovation" },

  // Confidence (4 questions)
  { id: 21, text: "When attempting new or challenging tasks, [name] shows enthusiasm and willingness to try.", category: "Confidence" },
  { id: 22, text: "In classroom situations, [name] expresses opinions and ideas without excessive self-doubt.", category: "Confidence" },
  { id: 23, text: "When making mistakes, [name] learns from them and continues working without giving up.", category: "Confidence" },
  { id: 24, text: "During independent work time, [name] tackles assignments with self-assurance and persistence.", category: "Confidence" }
]