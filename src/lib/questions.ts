// Learning Assessment Questions - 6C Framework with Age-Specific Support
export const CATEGORIES = [
  'Communication',
  'Collaboration', 
  'Content',
  'Critical Thinking',
  'Creative Innovation',
  'Confidence',
  'Interests',
  'Motivation', 
  'School Experience'
] as const

// Category metadata with icons and colors for delightful UI
export const CATEGORY_METADATA = {
  'Communication': {
    icon: 'MessageCircle',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    emoji: '💬',
    description: 'How your child expresses ideas and connects with others'
  },
  'Collaboration': {
    icon: 'Users',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    emoji: '🤝',
    description: 'Working together and building relationships'
  },
  'Content': {
    icon: 'BookOpen',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    emoji: '📚',
    description: 'Curiosity and love for learning new things'
  },
  'Critical Thinking': {
    icon: 'Brain',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    emoji: '🧠',
    description: 'Problem-solving and analytical thinking'
  },
  'Creative Innovation': {
    icon: 'Palette',
    color: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    emoji: '🎨',
    description: 'Imagination and unique approaches to challenges'
  },
  'Confidence': {
    icon: 'Star',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    emoji: '⭐',
    description: 'Self-belief and willingness to take on challenges'
  },
  'Interests': {
    icon: 'Heart',
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    emoji: '❤️',
    description: 'What captures your child\'s attention and excitement'
  },
  'Motivation': {
    icon: 'Zap',
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    emoji: '⚡',
    description: 'How your child learns best and stays engaged'
  },
  'School Experience': {
    icon: 'GraduationCap',
    color: 'bg-teal-500',
    lightColor: 'bg-teal-50',
    emoji: '🎓',
    description: 'Your child\'s previous learning environments'
  }
} as const

export type Category = typeof CATEGORIES[number]
export type AgeGroup = '3-4' | '4-5' | '5+'

// Interest options from Interests.md
export const INTEREST_OPTIONS = [
  'Pets',
  'Wild Animals', 
  'Ocean Animals',
  'Farm Animals',
  'Dinosaurs',
  'Reptiles',
  'Trucks & Cars',
  'Trains',
  'Planes & Boats',
  'How Things Work',
  'Seasons & Weather', 
  'Plants',
  'Human Body',
  'Under the Sea',
  'On the Beach',
  'Superheroes',
  'Princesses',
  'Fairytales',
  'Sports',
  'Robots',
  'Nursery Rhymes',
  'Bugs',
  'Outer Space',
  'ABC & 123',
  'Monsters',
  'Friendships',
  'Kindness',
  'Musical Instruments',
  'Famous People',
  'Ancient Worlds',
  'Around the World'
] as const

// Engagement style options
export const ENGAGEMENT_OPTIONS = [
  'Movement-based activities (dancing, running, jumping)',
  'Pretend play and imaginative activities',
  'Hands-on building and crafts',
  'Digital games and apps'
] as const

// Learning modality options  
export const MODALITY_OPTIONS = [
  'Independent exploration and figuring things out alone',
  'Visual demonstrations and watching examples',
  'Step-by-step verbal instructions',
  'Story-based and imaginative explanations'
] as const

// Social preference options
export const SOCIAL_OPTIONS = [
  'Working independently',
  'Playing alongside others (parallel play)',
  'Collaborative group activities',
  'One-on-one time with adults'
] as const

export const LIKERT_SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' }
] as const

// Parent-friendly scale with encouraging language
export const PARENT_SCALE = [
  { 
    value: 1, 
    label: 'Never', 
    emoji: '😔',
    description: "I haven't seen this behavior yet",
    color: 'bg-red-50 border-red-200 text-red-700'
  },
  { 
    value: 2, 
    label: 'Rarely', 
    emoji: '🤔',
    description: "I've noticed this once in a while",
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  },
  { 
    value: 3, 
    label: 'Sometimes', 
    emoji: '😊',
    description: "This happens fairly regularly",
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  },
  { 
    value: 4, 
    label: 'Often', 
    emoji: '😄',
    description: "This is pretty common for my child",
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  { 
    value: 5, 
    label: 'Always', 
    emoji: '🌟',
    description: "This describes my child perfectly!",
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  }
] as const

export interface Question {
  id: number
  text: string
  category: Category
  encouragingIntro?: string
  example?: string
  questionType?: 'likert' | 'multipleChoice' | 'checkbox' | 'dropdown'
  options?: readonly string[]
  scoring?: {
    option1: { score: number; category?: Category; subcategory?: string }
    option2: { score: number; category?: Category; subcategory?: string }
    option3?: { score: number; category?: Category; subcategory?: string }
    option4?: { score: number; category?: Category; subcategory?: string }
  }
}

export interface QuestionOption {
  text: string
  value: number
  score: number
  category?: Category
  subcategory?: string
}

// Encouraging progress messages for milestone moments - will be adjusted per age group
export const getProgressMessages = (totalQuestions: number) => {
  const quarter = Math.floor(totalQuestions / 4)
  const half = Math.floor(totalQuestions / 2)
  const threeQuarter = Math.floor(totalQuestions * 0.75)
  
  return [
    { at: quarter, message: "You're doing amazing! ✨", subtext: "Your insights about your child are so valuable" },
    { at: half, message: "Halfway there! 🚀", subtext: "You're building such a complete picture" },
    { at: threeQuarter, message: "Almost done! 🏁", subtext: "Just a few more questions to unlock their learning profile" },
    { at: totalQuestions, message: "You did it! 🎊", subtext: "Time to see your child's unique learning superpowers" }
  ]
}

// Age-specific questions following the 6C framework
export const AGE_SPECIFIC_QUESTIONS: Record<AgeGroup, Question[]> = {
  '3-4': [
    // Collaboration (3 questions)
    {
      id: 1,
      text: "When they notice another child playing nearby, they're most likely to:",
      category: "Collaboration",
      encouragingIntro: "Let's start with how [name] plays with others! 🤝",
    },
    {
      id: 2,
      text: "When they're building with blocks and see you walk by, they're most likely to:",
      category: "Collaboration",
      encouragingIntro: "How does [name] invite others to join their play? 🧱",
    },
    {
      id: 3,
      text: "While you're making dinner, they're most likely to:",
      category: "Collaboration",
      encouragingIntro: "Does [name] want to be part of family activities? 🍽️",
    },
    // Communication (3 questions)
    {
      id: 4,
      text: "They want something to eat. They're most likely to:",
      category: "Communication",
      encouragingIntro: "How does [name] express their needs? 💬",
    },
    {
      id: 5,
      text: "After scraping their knee, they're most likely to:",
      category: "Communication",
      encouragingIntro: "How does [name] communicate when they're hurt? 🩹",
    },
    {
      id: 6,
      text: "When you ask, 'What did you do today?' they're most likely to:",
      category: "Communication",
      encouragingIntro: "Can [name] share about their experiences? 📖",
    },
    // Critical Thinking (3 questions)
    {
      id: 7,
      text: "When something in their usual schedule is different — like nap is late or someone else picks them up — they're most likely to:",
      category: "Critical Thinking",
      encouragingIntro: "How does [name] handle changes? 🧠",
    },
    {
      id: 8,
      text: "If you say, 'Get your cup then your shoes,' they're most likely to:",
      category: "Critical Thinking",
      encouragingIntro: "Can [name] follow multi-step instructions? 🔄",
    },
    {
      id: 9,
      text: "When they can't reach a toy or item they want, they're most likely to:",
      category: "Critical Thinking",
      encouragingIntro: "How does [name] solve problems? 🎯",
    },
    // Creative Innovation (3 questions)
    {
      id: 10,
      text: "When they find something interesting outside (like a bright colored rock or big bug), they're most likely to:",
      category: "Creative Innovation",
      encouragingIntro: "How curious is [name] about the world? 🎨",
    },
    {
      id: 11,
      text: "When you bring out art supplies, they're most likely to:",
      category: "Creative Innovation",
      encouragingIntro: "How does [name] approach creative activities? ✨",
    },
    {
      id: 12,
      text: "When given a new kind of toy (like slime or magnets), they're most likely to:",
      category: "Creative Innovation",
      encouragingIntro: "How does [name] explore new things? 🔍",
    },
    // Confidence (3 questions)
    {
      id: 13,
      text: "At a birthday party full of new kids, they're most likely to:",
      category: "Confidence",
      encouragingIntro: "How confident is [name] in new situations? ⭐",
    },
    {
      id: 14,
      text: "When trying to zip their coat but it's tricky, they're most likely to:",
      category: "Confidence",
      encouragingIntro: "How does [name] handle challenges? 💪",
    },
    {
      id: 15,
      text: "When they see a climbing structure they haven't tried before at the park, they're most likely to:",
      category: "Confidence",
      encouragingIntro: "How adventurous is [name]? 🚀",
    },
    // Content/Academic Readiness (6 questions)
    {
      id: 16,
      text: "When you say 'What letter does your name start with?' they're most likely to:",
      category: "Content",
      encouragingIntro: "Let's explore [name]'s early literacy skills! 📚",
    },
    {
      id: 17,
      text: "When your child picks up a crayon or marker, they're most likely to:",
      category: "Content",
      encouragingIntro: "How are [name]'s early writing skills developing? ✏️",
    },
    {
      id: 18,
      text: "When you say, 'What rhymes with hat?' they're most likely to:",
      category: "Content",
      encouragingIntro: "Can [name] play with sounds and words? 🎵",
    },
    {
      id: 19,
      text: "When you ask your child to count a small group of toys (like 5 bears), they're most likely to:",
      category: "Content",
      encouragingIntro: "How are [name]'s counting skills? 🔢",
    },
    {
      id: 20,
      text: "When you show two snack piles (like 2 grapes vs. 4 grapes) and ask which has more, they're most likely to:",
      category: "Content",
      encouragingIntro: "Does [name] understand more and less? ⚖️",
    },
    {
      id: 21,
      text: "When playing with shape toys or puzzles, they're most likely to:",
      category: "Content",
      encouragingIntro: "Can [name] recognize and name shapes? 🔶",
    },
    // Interests (1 question)
    {
      id: 22,
      text: "Which topics does [name] get most excited about? (Select up to 5)",
      category: "Interests",
      questionType: "checkbox",
      options: [...INTEREST_OPTIONS] as string[],
      encouragingIntro: "What makes [name]'s eyes light up? ❤️",
    },
    // Motivation - Engagement Style (1 question)
    {
      id: 23,
      text: "[name] learns and stays engaged best through:",
      category: "Motivation",
      questionType: "multipleChoice",
      options: [...ENGAGEMENT_OPTIONS] as string[],
      encouragingIntro: "How does [name] love to learn? ⚡",
    },
    // Motivation - Learning Modality (1 question)
    {
      id: 24,
      text: "When learning something new, [name] prefers:",
      category: "Motivation", 
      questionType: "multipleChoice",
      options: [...MODALITY_OPTIONS] as string[],
      encouragingIntro: "What helps [name] understand new things? 🧠",
    },
    // Motivation - Social Preference (1 question)
    {
      id: 25,
      text: "During learning activities, [name] typically prefers:",
      category: "Motivation",
      questionType: "multipleChoice", 
      options: [...SOCIAL_OPTIONS] as string[],
      encouragingIntro: "How does [name] like to learn with others? 🤝",
    },
    // School Experience (1 question)
    {
      id: 26,
      text: "[name]'s previous childcare/school experience:",
      category: "School Experience",
      questionType: "multipleChoice",
      options: [
        "This is their first time in a structured learning environment",
        "They've been in daycare/preschool for less than 6 months", 
        "They've been in daycare/preschool for 6 months to 1 year",
        "They've been in daycare/preschool for more than 1 year"
      ],
      encouragingIntro: "Tell us about [name]'s learning journey so far! 🎓",
    }
  ],

  '4-5': [
    // Collaboration (3 questions)
    {
      id: 1,
      text: "During a board-game turn, they're most likely to:",
      category: "Collaboration",
      encouragingIntro: "Let's see how [name] plays games with others! 🎲",
    },
    {
      id: 2,
      text: "When another child is building a block tower nearby, they're most likely to:",
      category: "Collaboration",
      encouragingIntro: "How does [name] join others' activities? 🏗️",
    },
    {
      id: 3,
      text: "If another person trips and looks upset, they're most likely to:",
      category: "Collaboration",
      encouragingIntro: "How empathetic is [name] towards others? 💝",
    },
    // Communication (3 questions)
    {
      id: 4,
      text: "You ask, 'What happened at school today?' They're most likely to:",
      category: "Communication",
      encouragingIntro: "How does [name] share their experiences? 🗣️",
    },
    {
      id: 5,
      text: "When their picture rips accidentally, they're most likely to:",
      category: "Communication",
      encouragingIntro: "How does [name] express their feelings? 😊",
    },
    {
      id: 6,
      text: "When playing with other children, they're most likely to:",
      category: "Communication",
      encouragingIntro: "How social is [name] during play? 🤗",
    },
    // Critical Thinking (3 questions)
    {
      id: 7,
      text: "When they need a phone for pretend play but can't find one, they're most likely to:",
      category: "Critical Thinking",
      encouragingIntro: "How creative is [name]'s problem-solving? 🧠",
    },
    {
      id: 8,
      text: "You ask, 'How do you think Grandma feels when we visit?' They're most likely to:",
      category: "Critical Thinking",
      encouragingIntro: "Can [name] understand others' emotions? 💭",
    },
    {
      id: 9,
      text: "When something in their routine is different (like a missing bedtime story or a new teacher), they're most likely to:",
      category: "Critical Thinking",
      encouragingIntro: "How does [name] notice and adapt to changes? 🔄",
    },
    // Creative Innovation (3 questions)
    {
      id: 10,
      text: "While watching a butterfly, they're most likely to:",
      category: "Creative Innovation",
      encouragingIntro: "How curious and observant is [name]? 🦋",
    },
    {
      id: 11,
      text: "During free-build with blocks, they're most likely to:",
      category: "Creative Innovation",
      encouragingIntro: "How creative is [name]'s building and imagination? 🧱",
    },
    {
      id: 12,
      text: "They discover glue, bottle caps, and yarn in the craft bin. They're most likely to:",
      category: "Creative Innovation",
      encouragingIntro: "How does [name] approach open-ended materials? 🎨",
    },
    // Confidence (3 questions)
    {
      id: 13,
      text: "When it's time to put on shoes, they're most likely to:",
      category: "Confidence",
      encouragingIntro: "How independent is [name] with daily tasks? 👟",
    },
    {
      id: 14,
      text: "Choosing what to do at the playground, they're most likely to:",
      category: "Confidence",
      encouragingIntro: "How does [name] make choices and take initiative? 🏃",
    },
    {
      id: 15,
      text: "Working on a tricky puzzle, they're most likely to:",
      category: "Confidence",
      encouragingIntro: "How does [name] persist through challenges? 🧩",
    },
    // Content/Academic Skills (6 questions)
    {
      id: 16,
      text: "When you say the word 'cat' and ask, 'What sound does it start with?' they're most likely to:",
      category: "Content",
      encouragingIntro: "Let's explore [name]'s phonics skills! 🔤",
    },
    {
      id: 17,
      text: "When your child picks up a crayon or marker, they're most likely to:",
      category: "Content",
      encouragingIntro: "How are [name]'s writing skills developing? ✍️",
    },
    {
      id: 18,
      text: "When we read books together, they're most likely to:",
      category: "Content",
      encouragingIntro: "How engaged is [name] with reading? 📖",
    },
    {
      id: 19,
      text: "When you ask your child to count a small group of toys (like 8 bears), they're most likely to:",
      category: "Content",
      encouragingIntro: "How are [name]'s counting skills progressing? 📊",
    },
    {
      id: 20,
      text: "When you show two snack piles (like 2 grapes vs. 4 grapes) and ask which has more, they're most likely to:",
      category: "Content",
      encouragingIntro: "Can [name] compare quantities? ⚖️",
    },
    {
      id: 21,
      text: "When playing with shape toys or puzzles, they're most likely to:",
      category: "Content",
      encouragingIntro: "How well does [name] recognize shapes? 🔷",
    },
    // Interests (1 question)
    {
      id: 22,
      text: "Which topics does [name] get most excited about? (Select up to 5)",
      category: "Interests",
      questionType: "checkbox",
      options: [...INTEREST_OPTIONS] as string[],
      encouragingIntro: "What makes [name]'s eyes light up? ❤️",
    },
    // Motivation - Engagement Style (1 question)
    {
      id: 23,
      text: "[name] learns and stays engaged best through:",
      category: "Motivation",
      questionType: "multipleChoice",
      options: [...ENGAGEMENT_OPTIONS] as string[],
      encouragingIntro: "How does [name] love to learn? ⚡",
    },
    // Motivation - Learning Modality (1 question)
    {
      id: 24,
      text: "When learning something new, [name] prefers:",
      category: "Motivation", 
      questionType: "multipleChoice",
      options: [...MODALITY_OPTIONS] as string[],
      encouragingIntro: "What helps [name] understand new things? 🧠",
    },
    // Motivation - Social Preference (1 question)
    {
      id: 25,
      text: "During learning activities, [name] typically prefers:",
      category: "Motivation",
      questionType: "multipleChoice", 
      options: [...SOCIAL_OPTIONS] as string[],
      encouragingIntro: "How does [name] like to learn with others? 🤝",
    },
    // School Experience (1 question)
    {
      id: 26,
      text: "[name]'s previous childcare/school experience:",
      category: "School Experience",
      questionType: "multipleChoice",
      options: [
        "This is their first time in a structured learning environment",
        "They've been in daycare/preschool for less than 6 months", 
        "They've been in daycare/preschool for 6 months to 1 year",
        "They've been in daycare/preschool for more than 1 year"
      ],
      encouragingIntro: "Tell us about [name]'s learning journey so far! 🎓",
    }
  ],

  '5+': []  // Will be populated with existing questions below
}

// Age-specific question options
export const AGE_SPECIFIC_OPTIONS: Record<AgeGroup, Record<number, QuestionOption[]>> = {
  '3-4': {
    1: [
      { text: "Sit nearby and play alongside them.", value: 1, score: 4, category: "Collaboration" },
      { text: "Watch for a while but stay back.", value: 2, score: 3, category: "Collaboration" },
      { text: "Stick close to you or play alone.", value: 3, score: 2, category: "Collaboration" },
      { text: "Run up and try to take the toy.", value: 4, score: 1, category: "Collaboration" }
    ],
    2: [
      { text: "Say, 'Come play with me!'", value: 1, score: 5, category: "Collaboration" },
      { text: "Hand you a block.", value: 2, score: 4, category: "Collaboration" },
      { text: "Look up for a second, then go back to playing.", value: 3, score: 2, category: "Collaboration" },
      { text: "Keep focused and not notice you at all.", value: 4, score: 1, category: "Collaboration" }
    ],
    3: [
      { text: "Pull over a chair and ask to help.", value: 1, score: 5, category: "Collaboration" },
      { text: "Watch and chat about what you're doing.", value: 2, score: 4, category: "Collaboration" },
      { text: "Peek in and then go back to playing.", value: 3, score: 2, category: "Collaboration" },
      { text: "Stay completely focused on their own thing.", value: 4, score: 1, category: "Collaboration" }
    ],
    4: [
      { text: "Use words or short sentences to ask, like 'I want a snack.'", value: 1, score: 5, category: "Communication" },
      { text: "Say one word, like 'Snack.'", value: 2, score: 4, category: "Communication" },
      { text: "Point to what they want.", value: 3, score: 3, category: "Communication" },
      { text: "Cry or whine until I guess what they need.", value: 4, score: 1, category: "Communication" }
    ],
    5: [
      { text: "Say, 'That hurt!' or 'I'm sad.'", value: 1, score: 5, category: "Communication" },
      { text: "Point to the spot and say 'Owie.'", value: 2, score: 4, category: "Communication" },
      { text: "Cry and scream without saying anything.", value: 3, score: 1, category: "Communication" },
      { text: "Ignore it, act like nothing happened.", value: 4, score: 1, category: "Communication" }
    ],
    6: [
      { text: "Say something like, 'I painted and played blocks!'", value: 1, score: 5, category: "Communication" },
      { text: "Share a word or two — 'Blocks' or 'Snack.'", value: 2, score: 3, category: "Communication" },
      { text: "Shrug or stay quiet.", value: 3, score: 1, category: "Communication" },
      { text: "Say 'I don't know.'", value: 4, score: 1, category: "Communication" }
    ],
    7: [
      { text: "Notice right away and say what is different.", value: 1, score: 5, category: "Critical Thinking" },
      { text: "Seem confused and ask what is happening.", value: 2, score: 3, category: "Critical Thinking" },
      { text: "Go along with it but act extra clingy or emotional.", value: 3, score: 2, category: "Critical Thinking" },
      { text: "Not notice.", value: 4, score: 1, category: "Critical Thinking" }
    ],
    8: [
      { text: "Do both in order.", value: 1, score: 5, category: "Critical Thinking" },
      { text: "Get one, then ask what else to do, or get their shoes first.", value: 2, score: 3, category: "Critical Thinking" },
      { text: "Do something else, like play or run into another room.", value: 3, score: 2, category: "Critical Thinking" },
      { text: "Not move until you do it with them, or ask 'get it for me.'", value: 4, score: 1, category: "Critical Thinking" }
    ],
    9: [
      { text: "Try to solve the problem by getting a stool or climbing to reach it, for example.", value: 1, score: 5, category: "Critical Thinking" },
      { text: "Ask for help.", value: 2, score: 3, category: "Critical Thinking" },
      { text: "Get frustrated and cry.", value: 3, score: 1, category: "Critical Thinking" },
      { text: "Walk away to find something else to do or play with.", value: 4, score: 1, category: "Critical Thinking" }
    ],
    10: [
      { text: "Touch it, talk about it, and ask questions.", value: 1, score: 5, category: "Creative Innovation" },
      { text: "Look closely but don't ask questions about it or interact with it.", value: 2, score: 3, category: "Creative Innovation" },
      { text: "Say something like 'wow,' or 'ew' and walk away.", value: 3, score: 2, category: "Creative Innovation" },
      { text: "Ignore it, or not point it out.", value: 4, score: 1, category: "Creative Innovation" }
    ],
    11: [
      { text: "Become focused and use different materials to create something.", value: 1, score: 5, category: "Creative Innovation" },
      { text: "Make a few marks, then show you.", value: 2, score: 3, category: "Creative Innovation" },
      { text: "Engage briefly, then move on.", value: 3, score: 2, category: "Creative Innovation" },
      { text: "Say 'I don't want to' or avoid the activity.", value: 4, score: 1, category: "Creative Innovation" }
    ],
    12: [
      { text: "Explore right away to see what it does.", value: 1, score: 5, category: "Creative Innovation" },
      { text: "Watch you or others first, then try.", value: 2, score: 4, category: "Creative Innovation" },
      { text: "Interact with it cautiously, unsure.", value: 3, score: 2, category: "Creative Innovation" },
      { text: "Try it once and then walk away.", value: 4, score: 1, category: "Creative Innovation" }
    ],
    13: [
      { text: "Say hello and play with the other kids.", value: 1, score: 5, category: "Confidence" },
      { text: "Watch and follow the other kids.", value: 2, score: 4, category: "Confidence" },
      { text: "Hang close to you before warming up.", value: 3, score: 2, category: "Confidence" },
      { text: "Hide behind you or ask to leave.", value: 4, score: 1, category: "Confidence" }
    ],
    14: [
      { text: "Keep trying until it works.", value: 1, score: 5, category: "Confidence" },
      { text: "Try, then ask for help.", value: 2, score: 4, category: "Confidence" },
      { text: "Try once, then give up.", value: 3, score: 2, category: "Confidence" },
      { text: "Expect you or another adult to jump in and help them do it.", value: 4, score: 1, category: "Confidence" }
    ],
    15: [
      { text: "Run up and start climbing with excitement.", value: 1, score: 5, category: "Confidence" },
      { text: "Ask for your help to try it.", value: 2, score: 3, category: "Confidence" },
      { text: "Watch other children do it.", value: 3, score: 2, category: "Confidence" },
      { text: "Skip it.", value: 4, score: 1, category: "Confidence" }
    ],
    16: [
      { text: "Say the first letter in their name.", value: 1, score: 5, category: "Content", subcategory: "Phonics, Literacy" },
      { text: "Say another letter in their name.", value: 2, score: 3, category: "Content", subcategory: "Phonics, Literacy" },
      { text: "Say a letter not in their name or another word.", value: 3, score: 2, category: "Content", subcategory: "Phonics, Literacy" },
      { text: "Say 'I don't know,' or ignore your question.", value: 4, score: 1, category: "Content", subcategory: "Phonics, Literacy" }
    ],
    17: [
      { text: "Try to write letters or their name.", value: 1, score: 5, category: "Content", subcategory: "Writing, Literacy" },
      { text: "Make scribbles and lines that look like writing.", value: 2, score: 4, category: "Content", subcategory: "Writing, Literacy" },
      { text: "Draw shapes or pictures.", value: 3, score: 3, category: "Content", subcategory: "Writing, Literacy" },
      { text: "Scribble.", value: 4, score: 2, category: "Content", subcategory: "Writing, Literacy" }
    ],
    18: [
      { text: "Say a rhyme like 'bat' or 'cat.'", value: 1, score: 5, category: "Content", subcategory: "Reading, Literacy" },
      { text: "Say a silly rhyme like 'zat.'", value: 2, score: 4, category: "Content", subcategory: "Reading, Literacy" },
      { text: "Say a word that doesn't rhyme.", value: 3, score: 2, category: "Content", subcategory: "Reading, Literacy" },
      { text: "Say 'I don't know,' or ignore you.", value: 4, score: 1, category: "Content", subcategory: "Reading, Literacy" }
    ],
    19: [
      { text: "Count each one with one-to-one accuracy while tapping the bears ('1, 2, 3, 4, 5').", value: 1, score: 5, category: "Content", subcategory: "Counting, Math" },
      { text: "Count in order but might skip some bears or double-count.", value: 2, score: 3, category: "Content", subcategory: "Counting, Math" },
      { text: "Count and say numbers out of order.", value: 3, score: 2, category: "Content", subcategory: "Counting, Math" },
      { text: "Guess a number or say, 'I don't know.'", value: 4, score: 1, category: "Content", subcategory: "Counting, Math" }
    ],
    20: [
      { text: "Count and then tell you the group with 4 grapes.", value: 1, score: 5, category: "Content", subcategory: "Counting, Math" },
      { text: "Point to the group with 4 grapes right away.", value: 2, score: 4, category: "Content", subcategory: "Counting, Math" },
      { text: "Guess.", value: 3, score: 2, category: "Content", subcategory: "Counting, Math" },
      { text: "Say, 'I don't know.'", value: 4, score: 1, category: "Content", subcategory: "Counting, Math" }
    ],
    21: [
      { text: "Match and name all the shapes like circle, square, triangle.", value: 1, score: 5, category: "Content", subcategory: "Shapes, Math" },
      { text: "Match shapes and name some, not all shapes.", value: 2, score: 4, category: "Content", subcategory: "Shapes, Math" },
      { text: "Fit some together, guess randomly, doesn't name shapes without support.", value: 3, score: 2, category: "Content", subcategory: "Shapes, Math" },
      { text: "Ask for your help.", value: 4, score: 1, category: "Content", subcategory: "Shapes, Math" }
    ],
    // Note: Questions 22-26 use special question types (checkbox/multipleChoice) and are handled differently
  },
  
  '4-5': {
    1: [
      { text: "Wait and cheer for others.", value: 1, score: 5, category: "Collaboration" },
      { text: "Wait patiently.", value: 2, score: 4, category: "Collaboration" },
      { text: "Skip ahead when no one is watching.", value: 3, score: 2, category: "Collaboration" },
      { text: "Ask, 'Is it my turn yet?'", value: 4, score: 1, category: "Collaboration" }
    ],
    2: [
      { text: "Ask, 'Can I help?'", value: 1, score: 5, category: "Collaboration" },
      { text: "Give a suggestion or compliment.", value: 2, score: 4, category: "Collaboration" },
      { text: "Grab a block and add without asking.", value: 3, score: 2, category: "Collaboration" },
      { text: "Watch.", value: 4, score: 1, category: "Collaboration" }
    ],
    3: [
      { text: "Go over, ask 'Are you okay?' and offer help.", value: 1, score: 5, category: "Collaboration" },
      { text: "Look concerned and tell an adult.", value: 2, score: 4, category: "Collaboration" },
      { text: "Stare for a moment, then keep playing.", value: 3, score: 2, category: "Collaboration" },
      { text: "Ignore it.", value: 4, score: 1, category: "Collaboration" }
    ],
    4: [
      { text: "Tell you a detailed story about something that happened during their day.", value: 1, score: 5, category: "Communication" },
      { text: "Mention a few things that happened.", value: 2, score: 4, category: "Communication" },
      { text: "Give a short phrase like 'Played outside.'", value: 3, score: 2, category: "Communication" },
      { text: "Say 'I don't know' or ignore.", value: 4, score: 1, category: "Communication" }
    ],
    5: [
      { text: "Say, 'I'm sad my picture ripped.'", value: 1, score: 5, category: "Communication" },
      { text: "Look upset and ask for help in fixing it.", value: 2, score: 4, category: "Communication" },
      { text: "Crumple the paper without explaining feelings.", value: 3, score: 2, category: "Communication" },
      { text: "Cry or tantrum without words or gestures.", value: 4, score: 1, category: "Communication" }
    ],
    6: [
      { text: "Talks to others, shares ideas, and makes up stories together.", value: 1, score: 5, category: "Communication" },
      { text: "Says things like 'Can I play?' or joins in simple talk.", value: 2, score: 4, category: "Communication" },
      { text: "Plays near others and doesn't talk much.", value: 3, score: 2, category: "Communication" },
      { text: "Prefers to play alone.", value: 4, score: 1, category: "Communication" }
    ],
    7: [
      { text: "Find something else, like a block or their hand and hold it to their ear and have a pretend conversation.", value: 1, score: 5, category: "Critical Thinking" },
      { text: "Change the story, for example, instead of making a phone call, they send a letter.", value: 2, score: 4, category: "Critical Thinking" },
      { text: "Ask a grown-up to get them a phone or toy phone.", value: 3, score: 2, category: "Critical Thinking" },
      { text: "Stop playing because they don't have what they need.", value: 4, score: 1, category: "Critical Thinking" }
    ],
    8: [
      { text: "Say something like, 'She's happy because she loves us!'", value: 1, score: 5, category: "Critical Thinking" },
      { text: "Say, 'Happy!'", value: 2, score: 3, category: "Critical Thinking" },
      { text: "Say, 'I don't know'.", value: 3, score: 1, category: "Critical Thinking" },
      { text: "Guess an emotion but seem unsure.", value: 4, score: 2, category: "Critical Thinking" }
    ],
    9: [
      { text: "Notice right away and ask questions about it.", value: 1, score: 5, category: "Critical Thinking" },
      { text: "Seem to notice and wait to see what happens.", value: 2, score: 4, category: "Critical Thinking" },
      { text: "React if someone else points it out.", value: 3, score: 2, category: "Critical Thinking" },
      { text: "Doesn't notice or seem to care.", value: 4, score: 1, category: "Critical Thinking" }
    ],
    10: [
      { text: "Ask questions like, 'Where is it going? How does it fly?'", value: 1, score: 5, category: "Creative Innovation" },
      { text: "Point it out to you, make a comment about it, and watch silently.", value: 2, score: 4, category: "Creative Innovation" },
      { text: "Say something like, 'A butterfly!' or 'Wow!' and then do something else.", value: 3, score: 2, category: "Creative Innovation" },
      { text: "Ignore the butterfly.", value: 4, score: 1, category: "Creative Innovation" }
    ],
    11: [
      { text: "Invent an original model and explain what it is.", value: 1, score: 5, category: "Creative Innovation" },
      { text: "Copy an example or build a basic tower.", value: 2, score: 3, category: "Creative Innovation" },
      { text: "Stack blocks randomly.", value: 3, score: 2, category: "Creative Innovation" },
      { text: "Ask for help.", value: 4, score: 1, category: "Creative Innovation" }
    ],
    12: [
      { text: "Invent something ('It's a rocket!').", value: 1, score: 5, category: "Creative Innovation" },
      { text: "Use the glue to stick some things together and explain what it is.", value: 2, score: 4, category: "Creative Innovation" },
      { text: "Follow an example or your suggestion.", value: 3, score: 2, category: "Creative Innovation" },
      { text: "Say 'I don't know what to make.'", value: 4, score: 1, category: "Creative Innovation" }
    ],
    13: [
      { text: "Try, adjust, and succeed mostly on their own.", value: 1, score: 5, category: "Confidence" },
      { text: "Try first, then ask for help.", value: 2, score: 4, category: "Confidence" },
      { text: "Wait for you to start, then help a little.", value: 3, score: 2, category: "Confidence" },
      { text: "Wait for you to do it all.", value: 4, score: 1, category: "Confidence" }
    ],
    14: [
      { text: "Pick what they want to do and go on their own while you watch.", value: 1, score: 5, category: "Confidence" },
      { text: "Pick what they want to do and ask for you to come with them.", value: 2, score: 4, category: "Confidence" },
      { text: "Follow what their friends choose to do.", value: 3, score: 2, category: "Confidence" },
      { text: "Ask you to come with them.", value: 4, score: 1, category: "Confidence" }
    ],
    15: [
      { text: "Keep trying different pieces until it's complete.", value: 1, score: 5, category: "Confidence" },
      { text: "Work for a bit, then ask for help.", value: 2, score: 4, category: "Confidence" },
      { text: "Ask you to do it with them.", value: 3, score: 2, category: "Confidence" },
      { text: "Pick something different when it gets hard.", value: 4, score: 1, category: "Confidence" }
    ],
    16: [
      { text: "Say the first sound, /k/.", value: 1, score: 5, category: "Content", subcategory: "Phonics, Literacy" },
      { text: "Say 'C!'", value: 2, score: 4, category: "Content", subcategory: "Phonics, Literacy" },
      { text: "Say another letter or sound.", value: 3, score: 2, category: "Content", subcategory: "Phonics, Literacy" },
      { text: "Say 'I don't know,' or ignore your question.", value: 4, score: 1, category: "Content", subcategory: "Phonics, Literacy" }
    ],
    17: [
      { text: "Write some words and try to write sentences.", value: 1, score: 5, category: "Content", subcategory: "Writing, Literacy" },
      { text: "Write some letters and draw.", value: 2, score: 4, category: "Content", subcategory: "Writing, Literacy" },
      { text: "Draw shapes or pictures.", value: 3, score: 3, category: "Content", subcategory: "Writing, Literacy" },
      { text: "Make scribbles and lines that look like writing.", value: 4, score: 2, category: "Content", subcategory: "Writing, Literacy" }
    ],
    18: [
      { text: "Join in by repeating parts, predicting what happens next, or 'reading' from memory.", value: 1, score: 5, category: "Content", subcategory: "Reading, Literacy" },
      { text: "Listen and talk about the pictures or characters.", value: 2, score: 4, category: "Content", subcategory: "Reading, Literacy" },
      { text: "Sit and listen to you.", value: 3, score: 2, category: "Content", subcategory: "Reading, Literacy" },
      { text: "Not stay interested, walk away or change the subject.", value: 4, score: 1, category: "Content", subcategory: "Reading, Literacy" }
    ],
    19: [
      { text: "Count each one with one-to-one accuracy while tapping the bears ('1, 2, 3, 4, 5...') and tell you there are 8 bears when they are done counting.", value: 1, score: 5, category: "Content", subcategory: "Counting, Math" },
      { text: "Count in order each one in order but not say how many there are when they are done counting.", value: 2, score: 4, category: "Content", subcategory: "Counting, Math" },
      { text: "Count in order but might skip some bears or double-count.", value: 3, score: 2, category: "Content", subcategory: "Counting, Math" },
      { text: "Guess a number or say, 'I don't know.'", value: 4, score: 1, category: "Content", subcategory: "Counting, Math" }
    ],
    20: [
      { text: "Count and then tell you the group with 4 grapes.", value: 1, score: 5, category: "Content", subcategory: "Counting, Math" },
      { text: "Point to the group with 4 grapes right away (not guessing).", value: 2, score: 4, category: "Content", subcategory: "Counting, Math" },
      { text: "Guess.", value: 3, score: 2, category: "Content", subcategory: "Counting, Math" },
      { text: "Say, 'I don't know.'", value: 4, score: 1, category: "Content", subcategory: "Counting, Math" }
    ],
    21: [
      { text: "Match and name all the shapes like circle, rectangle, triangle.", value: 1, score: 5, category: "Content", subcategory: "Shapes, Math" },
      { text: "Match shapes and name some of them shapes.", value: 2, score: 4, category: "Content", subcategory: "Shapes, Math" },
      { text: "Fit some together and need support naming shapes.", value: 3, score: 2, category: "Content", subcategory: "Shapes, Math" },
      { text: "Ask for your help.", value: 4, score: 1, category: "Content", subcategory: "Shapes, Math" }
    ],
    // Note: Questions 22-26 use special question types (checkbox/multipleChoice) and are handled differently
  },
  
  '5+': {}  // Uses Likert scale, not multiple choice
}

// Original questions for 5+ and backward compatibility
export const QUESTIONS: Question[] = [
  // Communication (4 questions) 💬
  { 
    id: 1, 
    text: "During group discussions or show-and-tell, [name] enthusiastically shares detailed stories and experiences.", 
    category: "Communication",
    encouragingIntro: "Let's start with how [name] loves to share! 💬",
    example: "Think about family dinners, playdates, or school presentations"
  },
  { 
    id: 2, 
    text: "When explaining ideas or instructions to others, [name] speaks clearly and uses vocabulary that others can understand.", 
    category: "Communication",
    encouragingIntro: "Now, about [name]'s speaking style 🗣️",
    example: "Like when they teach a friend a game or explain what they learned"
  },
  { 
    id: 3, 
    text: "In conversations and discussions, [name] listens carefully to others before jumping in with their own thoughts.", 
    category: "Communication",
    encouragingIntro: "How well does [name] listen? 👂",
    example: "Notice if they wait for others to finish speaking before responding"
  },
  { 
    id: 4, 
    text: "When sharing with a group, [name] uses eye contact and gestures to help others understand their ideas.", 
    category: "Communication",
    encouragingIntro: "Let's explore [name]'s presentation style! 🎭",
    example: "Watch how they use their hands and eyes when telling stories"
  },

  // Collaboration (4 questions) 🤝
  { 
    id: 5, 
    text: "During group activities and games, [name] naturally takes turns and makes sure everyone gets included.", 
    category: "Collaboration",
    encouragingIntro: "Time to think about [name] as a teammate! 🤝",
    example: "Board games, sports, group projects - how do they share the spotlight?"
  },
  { 
    id: 6, 
    text: "In team activities, [name] jumps in with ideas and helps the group stay organized and on track.", 
    category: "Collaboration",
    encouragingIntro: "Does [name] step up as a team player? 🌟",
    example: "Think about group work at school or family projects at home"
  },
  { 
    id: 7, 
    text: "When disagreements happen in groups, [name] tries to find compromises that work for everyone.", 
    category: "Collaboration",
    encouragingIntro: "How does [name] handle group conflicts? 🕊️",
    example: "When siblings disagree or friends have different ideas"
  },
  { 
    id: 8, 
    text: "During team activities, [name] cheers on their teammates and gets excited about group victories.", 
    category: "Collaboration",
    encouragingIntro: "Let's explore [name]'s team spirit! 🎉",
    example: "Notice if they celebrate others' successes, not just their own"
  },

  // Content (4 questions) 📚
  { 
    id: 9, 
    text: "When [name] learns something new, they seem to 'get it' quickly and remember it well across different subjects.", 
    category: "Content",
    encouragingIntro: "Now let's dive into [name]'s love of learning! 📚",
    example: "Whether it's math, reading, science, or art - how fast do they pick things up?"
  },
  { 
    id: 10, 
    text: "When [name] learns something new, they often connect it to things they already know and share those connections.", 
    category: "Content",
    encouragingIntro: "Does [name] connect the dots between ideas? 🔗",
    example: "Like saying 'This reminds me of...' or 'It's just like when we...'" 
  },
  { 
    id: 11, 
    text: "During learning time, [name] shows real curiosity and asks questions that show they're thinking deeply.", 
    category: "Content",
    encouragingIntro: "How curious is [name] about the world? 🤔",
    example: "The kinds of 'why' and 'what if' questions that make you think"
  },
  { 
    id: 12, 
    text: "When [name] faces new challenges, they use what they've learned before to figure out solutions.", 
    category: "Content",
    encouragingIntro: "Can [name] apply their knowledge creatively? 💡",
    example: "Using math skills for cooking, or reading strategies for new books"
  },

  // Critical Thinking (4 questions) 🧠
  { 
    id: 13, 
    text: "When [name] faces a problem, they think of different ways to solve it before picking the best approach.", 
    category: "Critical Thinking",
    encouragingIntro: "Time to explore [name]'s problem-solving superpowers! 🧠",
    example: "Building something, fixing a toy, or figuring out a puzzle"
  },
  { 
    id: 14, 
    text: "During conversations, [name] asks questions that show they're really thinking deeply about topics.", 
    category: "Critical Thinking",
    encouragingIntro: "How does [name]'s mind work? 🤯",
    example: "Questions that go beyond the obvious and make you pause to think"
  },
  { 
    id: 15, 
    text: "When someone tells [name] something new, they think about it carefully rather than just accepting it right away.", 
    category: "Critical Thinking",
    encouragingIntro: "Does [name] think for themselves? 🕵️",
    example: "They might ask 'Are you sure?' or 'How do you know that?'"
  },
  { 
    id: 16, 
    text: "When facing big challenges, [name] breaks them down into smaller, easier-to-handle pieces.", 
    category: "Critical Thinking",
    encouragingIntro: "How does [name] tackle tough problems? 🧩",
    example: "Like cleaning their room by doing one section at a time"
  },

  // Creative Innovation (4 questions) 🎨
  { 
    id: 17, 
    text: "During creative activities, [name] comes up with original, imaginative ideas that surprise and delight others.", 
    category: "Creative Innovation",
    encouragingIntro: "Let's celebrate [name]'s creative spark! 🎨",
    example: "Art projects, storytelling, building - do they create something totally unique?"
  },
  { 
    id: 18, 
    text: "When [name] faces challenges, they think of creative, 'outside-the-box' solutions that others might not consider.", 
    category: "Creative Innovation",
    encouragingIntro: "How creative is [name]'s problem-solving? 💫",
    example: "Using unconventional tools or approaches that actually work!"
  },
  { 
    id: 19, 
    text: "In their art, writing, or projects, [name] adds special personal touches that make their work uniquely theirs.", 
    category: "Creative Innovation",
    encouragingIntro: "What makes [name]'s work special? ✨",
    example: "That signature style or special detail that screams 'This is [name]'s!'"
  },
  { 
    id: 20, 
    text: "During free-play or open-ended activities, [name] loves to experiment and try new ways of doing things.", 
    category: "Creative Innovation",
    encouragingIntro: "How does [name] explore and experiment? 🔬",
    example: "Mixing colors, trying new materials, or inventing their own rules"
  },

  // Confidence (4 questions) ⭐
  { 
    id: 21, 
    text: "When [name] faces something new or challenging, they show excitement and eagerness to give it a try.", 
    category: "Confidence",
    encouragingIntro: "Finally, let's explore [name]'s inner confidence! ⭐",
    example: "New sports, difficult puzzles, or unfamiliar activities"
  },
  { 
    id: 22, 
    text: "In group settings, [name] shares their opinions and ideas without worrying too much about what others think.", 
    category: "Confidence",
    encouragingIntro: "How comfortable is [name] sharing their thoughts? 💭",
    example: "In class discussions, family conversations, or with friends"
  },
  { 
    id: 23, 
    text: "When [name] makes mistakes, they bounce back quickly, learn from them, and keep trying.", 
    category: "Confidence",
    encouragingIntro: "How does [name] handle setbacks? 💪",
    example: "Mistakes in homework, sports, or games - do they give up or keep going?"
  },
  { 
    id: 24, 
    text: "When working independently, [name] approaches tasks with confidence and sticks with them even when they get tricky.", 
    category: "Confidence",
    encouragingIntro: "How does [name] work on their own? 🚀",
    example: "Homework, personal projects, or solo activities"
  },
  
  // Additional Questions for Interests, Motivation, and School Experience
  // Interests (1 question)
  {
    id: 25,
    text: "Which topics does [name] get most excited about?",
    category: "Interests",
    questionType: "checkbox",
    options: [...INTEREST_OPTIONS] as string[],
    encouragingIntro: "What makes [name]'s eyes light up? ❤️",
    example: "Select up to 5 topics that really capture their attention"
  },
  // Motivation - Engagement Style (1 question)
  {
    id: 26,
    text: "[name] learns and stays engaged best through activities that involve:",
    category: "Motivation",
    encouragingIntro: "How does [name] love to learn? ⚡",
    example: "Think about when they're most focused and excited to learn"
  },
  // Motivation - Learning Modality (1 question)
  {
    id: 27,
    text: "When [name] is learning something new, they prefer to:",
    category: "Motivation", 
    encouragingIntro: "What helps [name] understand new things? 🧠",
    example: "Consider how they best absorb and process new information"
  },
  // Motivation - Social Preference (1 question)
  {
    id: 28,
    text: "During learning activities, [name] typically thrives when they can:",
    category: "Motivation",
    encouragingIntro: "How does [name] like to learn with others? 🤝",
    example: "Think about their most successful learning experiences"
  },
  // School Experience (1 question)
  {
    id: 29,
    text: "[name]'s experience with structured learning environments has been:",
    category: "School Experience",
    encouragingIntro: "Almost done! Tell us about [name]'s learning journey so far! 🎓",
    example: "Consider daycare, preschool, organized activities, or formal classes"
  }
]

// Populate the 5+ questions from existing questions
AGE_SPECIFIC_QUESTIONS['5+'] = QUESTIONS

// Function to get questions for a specific age group
export function getQuestionsForAge(ageGroup: AgeGroup): Question[] {
  return AGE_SPECIFIC_QUESTIONS[ageGroup] || QUESTIONS
}

// Function to get options for a specific age group and question
export function getOptionsForAgeAndQuestion(ageGroup: AgeGroup, questionId: number): QuestionOption[] {
  if (ageGroup === '5+') {
    // For 5+ age group, return the standard Likert scale
    return PARENT_SCALE.map(option => ({
      text: `${option.emoji} ${option.label}`,
      value: option.value,
      score: option.value,
      category: getQuestionsForAge(ageGroup).find(q => q.id === questionId)?.category
    }))
  }
  
  return AGE_SPECIFIC_OPTIONS[ageGroup]?.[questionId] || []
}

// Function to determine age group from grade or age
export function getAgeGroupFromGrade(grade: string): AgeGroup {
  const lowerGrade = grade.toLowerCase()
  
  if (lowerGrade.includes('pre-k') || lowerGrade.includes('3') || lowerGrade.includes('three')) {
    return '3-4'
  } else if (lowerGrade.includes('k') || lowerGrade.includes('4') || lowerGrade.includes('four')) {
    return '4-5'
  } else {
    return '5+'
  }
}

// Function to get age group display name
export function getAgeGroupDisplayName(ageGroup: AgeGroup): string {
  switch (ageGroup) {
    case '3-4':
      return '3-4 years old'
    case '4-5':
      return '4-5 years old'
    case '5+':
      return '5+ years old'
    default:
      return '5+ years old'
  }
}

// Function to check if age group uses multiple choice
export function usesMultipleChoice(ageGroup: AgeGroup): boolean {
  return ageGroup === '3-4' || ageGroup === '4-5'
}

// Legacy export for backward compatibility (updated for new question count)
export const PROGRESS_MESSAGES_24 = getProgressMessages(24) // Old count
export const PROGRESS_MESSAGES_26 = getProgressMessages(26) // 3-4 and 4-5 age groups
export const PROGRESS_MESSAGES_29 = getProgressMessages(29) // 5+ age group
export const PROGRESS_MESSAGES = PROGRESS_MESSAGES_29 // Default to 5+