// Learning Assessment Questions - 6C Framework
export const CATEGORIES = [
  'Communication',
  'Collaboration', 
  'Content',
  'Critical Thinking',
  'Creative Innovation',
  'Confidence'
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
  }
} as const

export type Category = typeof CATEGORIES[number]

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
}

// Encouraging progress messages for milestone moments
export const PROGRESS_MESSAGES = [
  { at: 4, message: "You're doing amazing! ✨", subtext: "Your insights about your child are so valuable" },
  { at: 8, message: "Fantastic progress! 🎉", subtext: "You've completed the first two learning areas" },
  { at: 12, message: "Halfway there! 🚀", subtext: "You're building such a complete picture" },
  { at: 16, message: "You're on a roll! 💪", subtext: "Your child is lucky to have such an observant parent" },
  { at: 20, message: "Almost done! 🏁", subtext: "Just a few more questions to unlock their learning profile" },
  { at: 24, message: "You did it! 🎊", subtext: "Time to see your child's unique learning superpowers" }
] as const

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
    encouragingIntro: "Last question! How does [name] work on their own? 🚀",
    example: "Homework, personal projects, or solo activities"
  }
]