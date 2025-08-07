import { CATEGORIES } from './questions'

export interface SampleProfile {
  id: string
  childName: string
  age: number
  grade: string
  scores: Record<string, number>
  personalityLabel: string
  description: string
  createdAt: string
  backstory: string
  parentQuote: string
  teacherInsight: string
  realWorldExample: string
  strengths: string[]
  growthAreas: string[]
  interests?: string[]
  engagementStyle?: string
  learningModality?: string
  socialPreference?: string
  schoolExperience?: string
  rawResponses?: Record<string, any>
  isPublic?: boolean
  shareToken?: string
}

// Diverse sample profiles representing different learning styles and backgrounds
export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: 'emma-creative-collaborator',
    childName: 'Emma',
    age: 8,
    grade: '3rd Grade',
    scores: {
      'Communication': 4.2,
      'Collaboration': 4.8,
      'Content': 3.5,
      'Critical Thinking': 3.2,
      'Creative Innovation': 4.6,
      'Confidence': 4.0
    },
    personalityLabel: 'Creative Collaborator',
    description: 'Emma excels at bringing people together through imaginative projects and thrives when she can express her creativity while working with others.',
    createdAt: '2024-01-15T10:30:00Z',
    backstory: 'Emma is the middle child in a family of five. She loves art class, always volunteers to help new students, and has turned her bedroom into an "art studio" where she creates gifts for family members.',
    parentQuote: "Emma's teacher mentioned that she naturally becomes the 'glue' that holds group projects together. She helps quieter kids participate and always makes sure everyone's ideas are heard.",
    teacherInsight: 'Emma shines in collaborative art projects and peer mentoring. She struggles with independent math worksheets but excels when math concepts are taught through creative, hands-on activities.',
    realWorldExample: 'When the class studied ecosystems, Emma created a detailed 3D diorama and organized her classmates to each research different animals. She turned it into a mini-museum where each student became an "expert guide" for their animal.',
    strengths: [
      'Natural leader in group settings',
      'Expresses complex ideas through art and storytelling',
      'Helps other children feel included and valued',
      'Thinks outside the box for problem-solving'
    ],
    growthAreas: [
      'Building confidence with independent work',
      'Developing patience for detailed, sequential tasks',
      'Strengthening basic math computation skills'
    ],
    interests: ['Pets', 'Art & Drawing', 'Fairytales', 'Music', 'Helping Others'],
    engagementStyle: 'Hands-on building and crafts',
    learningModality: 'Visual demonstrations and watching examples',
    socialPreference: 'Collaborative group activities',
    schoolExperience: 'They have been in daycare/preschool for 2+ years and are comfortable with school routines',
    rawResponses: {
      '22': ['Pets', 'Art & Drawing', 'Fairytales', 'Music', 'Helping Others'],
      '23': 'Hands-on building and crafts',
      '24': 'Visual demonstrations and watching examples',
      '25': 'Collaborative group activities',
      '26': 'They have been in daycare/preschool for 2+ years and are comfortable with school routines'
    },
    isPublic: true,
    shareToken: 'emma-sample-2024'
  },
  
  {
    id: 'marcus-analytical-scholar',
    childName: 'Marcus',
    age: 10,
    grade: '5th Grade',
    scores: {
      'Communication': 3.8,
      'Collaboration': 3.2,
      'Content': 4.9,
      'Critical Thinking': 4.7,
      'Creative Innovation': 3.4,
      'Confidence': 4.1
    },
    personalityLabel: 'Analytical Scholar',
    description: 'Marcus has an exceptional ability to understand complex concepts and thinks deeply about how systems work, showing remarkable academic curiosity.',
    createdAt: '2024-01-20T14:15:00Z',
    backstory: 'Marcus is an only child who loves spending time at the library. He can explain how computers work, has memorized the periodic table for fun, and asks "but why?" about everything.',
    parentQuote: "Marcus will spend hours researching topics that interest him. Last month he taught me more about renewable energy than I learned in college. But getting him to participate in group discussions is still a challenge.",
    teacherInsight: 'Marcus consistently produces high-quality individual work and asks insightful questions that push the whole class to think deeper. He needs encouragement to share his knowledge with peers and structured support for collaborative projects.',
    realWorldExample: 'During a science unit on weather, Marcus not only completed the assignment but also researched microclimates, created his own weather tracking system, and presented data showing how different areas of the school playground had different temperatures.',
    strengths: [
      'Exceptional research and analysis skills',
      'Quickly grasps complex academic concepts',
      'Independent learner with strong focus',
      'Asks thought-provoking questions'
    ],
    growthAreas: [
      'Sharing knowledge with peers confidently',
      'Working effectively in team environments',
      'Expressing creativity beyond academic subjects'
    ],
    interests: ['How Things Work', 'Robots', 'Space & Planets', 'Computers', 'Dinosaurs'],
    engagementStyle: 'Digital games and apps',
    learningModality: 'Independent exploration and figuring things out alone',
    socialPreference: 'Working independently',
    schoolExperience: 'They have been in daycare/preschool for 2+ years and are comfortable with school routines',
    rawResponses: {
      '22': ['How Things Work', 'Robots', 'Space & Planets', 'Computers', 'Dinosaurs'],
      '23': 'Digital games and apps',
      '24': 'Independent exploration and figuring things out alone',
      '25': 'Working independently',
      '26': 'They have been in daycare/preschool for 2+ years and are comfortable with school routines'
    },
    isPublic: true,
    shareToken: 'marcus-sample-2024'
  },
  
  {
    id: 'sofia-social-connector',
    childName: 'Sofia',
    age: 6,
    grade: '1st Grade',
    scores: {
      'Communication': 4.5,
      'Collaboration': 4.9,
      'Content': 3.7,
      'Critical Thinking': 3.3,
      'Creative Innovation': 3.8,
      'Confidence': 4.3
    },
    personalityLabel: 'Social Connector',
    description: 'Sofia naturally builds bridges between people and learns best through interaction, discussion, and helping others understand new concepts.',
    createdAt: '2024-01-25T09:45:00Z',
    backstory: 'Sofia is the eldest of three siblings and has been helping care for her younger brothers since she was four. She knows every kid in her neighborhood and always makes sure no one is left out during playground games.',
    parentQuote: "Sofia comes home every day with stories about her classmates. She remembers everyone's birthdays, knows who's feeling sad, and often asks if she can invite kids over who seem lonely. She learns so much better when she can talk through ideas with others.",
    teacherInsight: 'Sofia is my classroom helper who naturally supports struggling students. She explains concepts in ways that make sense to her peers and creates an inclusive environment. She needs opportunities for discussion and peer interaction to process new learning.',
    realWorldExample: 'When learning about community helpers, Sofia organized the class to "interview" each other about their family members\' jobs. She created a class book where each student felt proud to share their family\'s contributions to the community.',
    strengths: [
      'Exceptional emotional intelligence and empathy',
      'Natural teaching ability with peers',
      'Strong verbal communication skills',
      'Creates inclusive, welcoming environments'
    ],
    growthAreas: [
      'Building independent work stamina',
      'Developing confidence in solo problem-solving',
      'Strengthening analytical thinking skills'
    ],
    interests: ['Helping Others', 'Family & Friends', 'Animals', 'Stories & Books', 'Cooking'],
    engagementStyle: 'Pretend play and imaginative activities',
    learningModality: 'Story-based and imaginative explanations',
    socialPreference: 'One-on-one time with adults',
    schoolExperience: 'They have been in daycare/preschool for less than 6 months',
    rawResponses: {
      '22': ['Helping Others', 'Family & Friends', 'Animals', 'Stories & Books', 'Cooking'],
      '23': 'Pretend play and imaginative activities',
      '24': 'Story-based and imaginative explanations',
      '25': 'One-on-one time with adults',
      '26': 'They have been in daycare/preschool for less than 6 months'
    },
    isPublic: true,
    shareToken: 'sofia-sample-2024'
  },
  
  {
    id: 'aiden-independent-explorer',
    childName: 'Aiden',
    age: 9,
    grade: '4th Grade',
    scores: {
      'Communication': 3.4,
      'Collaboration': 2.9,
      'Content': 4.2,
      'Critical Thinking': 4.4,
      'Creative Innovation': 4.1,
      'Confidence': 4.6
    },
    personalityLabel: 'Independent Explorer',
    description: 'Aiden shows remarkable self-direction and confidence in tackling challenges independently, preferring to work at his own pace and explore ideas deeply.',
    createdAt: '2024-02-01T11:20:00Z',
    backstory: 'Aiden loves to take things apart and figure out how they work. He has his own workshop space in the garage where he builds inventions from recycled materials. He prefers one-on-one conversations over large groups.',
    parentQuote: "Aiden is happiest when he can dive deep into a project and work at his own pace. He gets frustrated in group work when others want to rush or when he has to wait for consensus. But the things he creates and discovers when given freedom are amazing.",
    teacherInsight: 'Aiden produces exceptional work when given choice and autonomy. He needs minimal guidance once he understands the expectations and often exceeds requirements by exploring extensions independently. Group work requires careful structuring to leverage his strengths.',
    realWorldExample: 'For a simple assignment about simple machines, Aiden built a complex Rube Goldberg machine in his garage that incorporated six different simple machines. He documented the engineering process and taught himself about physics concepts beyond grade level.',
    strengths: [
      'Exceptional self-motivation and persistence',
      'Advanced problem-solving abilities',
      'Innovative thinking and creativity',
      'Strong independent work skills'
    ],
    growthAreas: [
      'Participating actively in group discussions',
      'Seeking help when needed instead of struggling alone',
      'Communicating ideas clearly to larger groups'
    ],
    interests: ['How Things Work', 'Robots', 'Building & Construction', 'Puzzles', 'Inventions'],
    engagementStyle: 'Hands-on building and crafts',
    learningModality: 'Independent exploration and figuring things out alone',
    socialPreference: 'Working independently',
    schoolExperience: 'They have been in daycare/preschool for 1-2 years',
    rawResponses: {
      '22': ['How Things Work', 'Robots', 'Building & Construction', 'Puzzles', 'Inventions'],
      '23': 'Hands-on building and crafts',
      '24': 'Independent exploration and figuring things out alone',
      '25': 'Working independently',
      '26': 'They have been in daycare/preschool for 1-2 years'
    },
    isPublic: true,
    shareToken: 'aiden-sample-2024'
  },
  
  {
    id: 'zara-confident-builder',
    childName: 'Zara',
    age: 7,
    grade: '2nd Grade',
    scores: {
      'Communication': 4.1,
      'Collaboration': 4.0,
      'Content': 3.9,
      'Critical Thinking': 3.7,
      'Creative Innovation': 4.3,
      'Confidence': 4.8
    },
    personalityLabel: 'Confident Builder',
    description: 'Zara approaches every challenge with enthusiasm and self-assurance, building skills steadily across all areas while maintaining a positive, can-do attitude.',
    createdAt: '2024-02-05T16:10:00Z',
    backstory: 'Zara is known in her family as the "yes, I can!" kid. Whether it\'s learning to ride a bike, trying a new food, or tackling a difficult puzzle, she approaches everything with confidence and determination.',
    parentQuote: "Zara never says 'I can't do this.' Instead, she says 'I can't do this YET.' She bounces back from mistakes quickly and is always willing to try new things. Her confidence is contagious - she encourages her friends to be brave too.",
    teacherInsight: 'Zara is a joy to have in class because she approaches every activity with enthusiasm. She\'s willing to take risks, share her thinking, and support classmates who lack confidence. She responds well to challenges and celebrates growth over perfection.',
    realWorldExample: 'When Zara struggled with multiplication facts, instead of getting discouraged, she created her own board game to practice. She taught it to other students and turned what could have been a frustrating experience into a fun, social learning opportunity.',
    strengths: [
      'Remarkable resilience and growth mindset',
      'Natural encourager and confidence-builder for others',
      'Willing to take appropriate risks in learning',
      'Balances individual achievement with team support'
    ],
    growthAreas: [
      'Developing deeper critical analysis skills',
      'Learning to slow down and check work carefully',
      'Building patience for complex, multi-step processes'
    ],
    interests: ['Sports', 'Art & Drawing', 'Music', 'Helping Others', 'Games & Puzzles'],
    engagementStyle: 'Movement-based activities (dancing, running, jumping)',
    learningModality: 'Visual demonstrations and watching examples',
    socialPreference: 'Collaborative group activities',
    schoolExperience: 'They have been in daycare/preschool for 6 months to 1 year',
    rawResponses: {
      '22': ['Sports', 'Art & Drawing', 'Music', 'Helping Others', 'Games & Puzzles'],
      '23': 'Movement-based activities (dancing, running, jumping)',
      '24': 'Visual demonstrations and watching examples',
      '25': 'Collaborative group activities',
      '26': 'They have been in daycare/preschool for 6 months to 1 year'
    },
    isPublic: true,
    shareToken: 'zara-sample-2024'
  },
  
  {
    id: 'kai-thoughtful-innovator',
    childName: 'Kai',
    age: 11,
    grade: '6th Grade',
    scores: {
      'Communication': 3.9,
      'Collaboration': 3.6,
      'Content': 4.1,
      'Critical Thinking': 4.8,
      'Creative Innovation': 4.7,
      'Confidence': 3.8
    },
    personalityLabel: 'Creative Problem Solver',
    description: 'Kai combines deep analytical thinking with innovative approaches, finding unique solutions to complex problems while building confidence in their abilities.',
    createdAt: '2024-02-10T13:25:00Z',
    backstory: 'Kai loves puzzles, codes, and brain teasers. They spend free time designing video games, writing stories with complex plots, and figuring out more efficient ways to do everyday tasks. Kai is thoughtful and sometimes needs processing time before sharing ideas.',
    parentQuote: "Kai sees solutions that adults miss. They redesigned our family chore system to be more fair and efficient, and they're always finding creative ways to solve problems. Sometimes I have to remind them that their ideas are valuable and worth sharing.",
    teacherInsight: 'Kai produces innovative, thoughtful work that often exceeds expectations. They need wait time to process questions and benefit from opportunities to develop ideas before sharing with the group. Their unique perspectives enrich class discussions when they feel comfortable participating.',
    realWorldExample: 'For a social studies project on community problems, Kai identified that students were wasting food at lunch. They designed a system for students to share unwanted food items and presented it to the principal with data showing it could reduce waste by 40%.',
    strengths: [
      'Exceptional creative problem-solving abilities',
      'Sees connections others miss',
      'Strong analytical and design thinking',
      'Innovative approach to challenges'
    ],
    growthAreas: [
      'Building confidence to share ideas more readily',
      'Developing stronger collaboration skills',
      'Learning to value the process as much as the outcome'
    ],
    interests: ['Computers', 'Puzzles & Brain Teasers', 'How Things Work', 'Building & Construction', 'Art & Drawing'],
    engagementStyle: 'Digital games and apps',
    learningModality: 'Independent exploration and figuring things out alone',
    socialPreference: 'Playing alongside others (parallel play)',
    schoolExperience: 'They have been in daycare/preschool for 2+ years and are comfortable with school routines',
    rawResponses: {
      '22': ['Computers', 'Puzzles & Brain Teasers', 'How Things Work', 'Building & Construction', 'Art & Drawing'],
      '23': 'Digital games and apps',
      '24': 'Independent exploration and figuring things out alone',
      '25': 'Playing alongside others (parallel play)',
      '26': 'They have been in daycare/preschool for 2+ years and are comfortable with school routines'
    },
    isPublic: true,
    shareToken: 'kai-sample-2024'
  },
  
  {
    id: 'maya-developing-communicator',
    childName: 'Maya',
    age: 5,
    grade: 'Kindergarten',
    scores: {
      'Communication': 3.1,
      'Collaboration': 3.8,
      'Content': 4.3,
      'Critical Thinking': 3.2,
      'Creative Innovation': 3.7,
      'Confidence': 3.4
    },
    personalityLabel: 'Emerging Scholar',
    description: 'Maya shows strong academic potential and curiosity about learning, with developing skills in communication and confidence that will grow with support and encouragement.',
    createdAt: '2024-02-15T08:30:00Z',
    backstory: 'Maya is naturally curious and asks lots of questions about how things work. She loves books, especially non-fiction about animals and space. She can be shy in large groups but opens up in one-on-one conversations.',
    parentQuote: "Maya absorbs information like a sponge and remembers everything she reads. She's still building confidence to speak up in groups, but when she's comfortable, she shares the most insightful observations. She just needs time to warm up.",
    teacherInsight: 'Maya demonstrates strong academic readiness and genuine curiosity about learning. She excels in structured activities and benefits from gentle encouragement to participate in group discussions. She shows leadership potential that emerges in small group settings.',
    realWorldExample: 'During a unit on life cycles, Maya became fascinated with butterfly metamorphosis. She asked to research additional insects and created detailed drawings showing the life cycles of five different insects, teaching her family what she learned.',
    strengths: [
      'Strong academic curiosity and memory',
      'Careful observer who notices details',
      'Kind and considerate with peers',
      'Shows deep interest in learning new facts'
    ],
    growthAreas: [
      'Building confidence to participate in large group discussions',
      'Developing stronger verbal communication skills',
      'Learning to express ideas and opinions more boldly'
    ],
    interests: ['Wild Animals', 'Space & Planets', 'Stories & Books', 'Dinosaurs', 'How Things Work'],
    engagementStyle: 'Pretend play and imaginative activities',
    learningModality: 'Story-based and imaginative explanations',
    socialPreference: 'One-on-one time with adults',
    schoolExperience: 'This is their first time in a structured learning environment',
    rawResponses: {
      '22': ['Wild Animals', 'Space & Planets', 'Stories & Books', 'Dinosaurs', 'How Things Work'],
      '23': 'Pretend play and imaginative activities',
      '24': 'Story-based and imaginative explanations',
      '25': 'One-on-one time with adults',
      '26': 'This is their first time in a structured learning environment'
    },
    isPublic: true,
    shareToken: 'maya-sample-2024'
  },

  {
    id: 'diego-balanced-learner',
    childName: 'Diego',
    age: 12,
    grade: '7th Grade',
    scores: {
      'Communication': 4.0,
      'Collaboration': 4.2,
      'Content': 3.8,
      'Critical Thinking': 4.1,
      'Creative Innovation': 3.9,
      'Confidence': 4.3
    },
    personalityLabel: 'Natural Leader',
    description: 'Diego demonstrates well-rounded abilities across all learning areas with particular strength in leadership and bringing out the best in others.',
    createdAt: '2024-02-20T15:45:00Z',
    backstory: 'Diego is the captain of his soccer team and student council representative. He has a natural ability to help others feel valued and excels at seeing different perspectives. He wants to be a teacher when he grows up.',
    parentQuote: "Diego has always been the kid other kids gravitate toward. He's fair, a good listener, and somehow knows how to help everyone contribute their best. Teachers constantly tell me how he helps create a positive classroom environment.",
    teacherInsight: 'Diego is an ideal student who elevates the entire classroom culture. He supports struggling students without making them feel embarrassed, challenges high achievers to think deeper, and helps me see when lessons need adjustment. He shows strong potential for leadership roles.',
    realWorldExample: 'When the class had a heated debate about school uniforms, Diego facilitated a respectful discussion where he helped each side really listen to the other. He proposed a compromise solution that the administration actually considered implementing.',
    strengths: [
      'Natural leadership and facilitation abilities',
      'Strong emotional intelligence and empathy',
      'Adapts communication style to different audiences',
      'Brings out the best in others'
    ],
    growthAreas: [
      'Challenging himself to take on more complex academic work',
      'Learning to advocate for his own needs, not just others',
      'Developing deeper expertise in areas of personal interest'
    ],
    interests: ['Sports', 'Leadership & Teamwork', 'Helping Others', 'Community & Social Issues', 'Games & Strategy'],
    engagementStyle: 'Collaborative group activities',
    learningModality: 'Step-by-step verbal instructions',
    socialPreference: 'Collaborative group activities',
    schoolExperience: 'They have been in daycare/preschool for 2+ years and are comfortable with school routines',
    rawResponses: {
      '22': ['Sports', 'Leadership & Teamwork', 'Helping Others', 'Community & Social Issues', 'Games & Strategy'],
      '23': 'Collaborative group activities',
      '24': 'Step-by-step verbal instructions',
      '25': 'Collaborative group activities',
      '26': 'They have been in daycare/preschool for 2+ years and are comfortable with school routines'
    },
    isPublic: true,
    shareToken: 'diego-sample-2024'
  }
]

// Helper functions for working with sample profiles
export const getSampleProfile = (id: string): SampleProfile | undefined => {
  return SAMPLE_PROFILES.find(profile => profile.id === id)
}

export const getSampleProfilesByGrade = (grade: string): SampleProfile[] => {
  return SAMPLE_PROFILES.filter(profile => profile.grade === grade)
}

export const getSampleProfilesByPersonality = (personalityLabel: string): SampleProfile[] => {
  return SAMPLE_PROFILES.filter(profile => profile.personalityLabel === personalityLabel)
}

export const getRandomSampleProfiles = (count: number = 3): SampleProfile[] => {
  const shuffled = [...SAMPLE_PROFILES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Generate realistic variety in scores while maintaining personality coherence
export const generateVariantProfile = (baseProfile: SampleProfile, variance: number = 0.3): SampleProfile => {
  const newScores = { ...baseProfile.scores }
  
  // Add small random variations to scores while keeping them within reasonable bounds
  Object.keys(newScores).forEach(category => {
    const baseScore = baseProfile.scores[category]
    const variation = (Math.random() - 0.5) * variance * 2
    newScores[category] = Math.max(1, Math.min(5, baseScore + variation))
  })
  
  return {
    ...baseProfile,
    id: `${baseProfile.id}-variant-${Date.now()}`,
    scores: newScores,
    createdAt: new Date().toISOString()
  }
}

// Get profiles that showcase specific features
export const getShowcaseProfiles = () => ({
  highPerformer: SAMPLE_PROFILES.find(p => p.id === 'marcus-analytical-scholar')!,
  balanced: SAMPLE_PROFILES.find(p => p.id === 'diego-balanced-learner')!,
  creative: SAMPLE_PROFILES.find(p => p.id === 'emma-creative-collaborator')!,
  developing: SAMPLE_PROFILES.find(p => p.id === 'maya-developing-communicator')!,
  independent: SAMPLE_PROFILES.find(p => p.id === 'aiden-independent-explorer')!,
  social: SAMPLE_PROFILES.find(p => p.id === 'sofia-social-connector')!
})

export default SAMPLE_PROFILES