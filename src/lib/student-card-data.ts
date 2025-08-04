// Generate realistic sample data for student learning style cards

export interface StudentCardData {
  id: number
  child_name: string
  parent_email: string
  learning_style: 'Creative' | 'Analytical' | 'Collaborative' | 'Confident'
  avatar_url?: string
  strengths: string[]
  challenges: string[]
  quick_wins: string[]
  parent_insight: string
  emergency_backup: string
  assessment_results?: {
    id: number
    personality_label: string
    scores: Record<string, number>
    grade_level: string
  }
}

const creativeStrengths = [
  "Generates unique solutions to problems",
  "Expresses ideas through art, stories, and imagination", 
  "Thinks outside the box during brainstorming",
  "Connects unrelated concepts in innovative ways",
  "Uses metaphors and analogies to explain understanding",
  "Enjoys open-ended projects with multiple solutions",
  "Creates elaborate stories and imaginative scenarios"
]

const analyticalStrengths = [
  "Breaks down complex problems into manageable steps",
  "Identifies patterns and logical sequences",
  "Asks detailed questions to understand concepts fully",
  "Organizes information systematically",
  "Uses data and evidence to support conclusions",
  "Excels at step-by-step processes and procedures",
  "Spots inconsistencies and errors in reasoning"
]

const collaborativeStrengths = [
  "Facilitates group discussions and keeps teams on task",
  "Listens actively and incorporates others' ideas",
  "Mediates conflicts and finds compromises",
  "Encourages quieter classmates to participate",
  "Builds on teammates' suggestions constructively",
  "Creates inclusive environments where everyone contributes",
  "Takes turns naturally and shares resources willingly"
]

const confidentStrengths = [
  "Volunteers to lead group projects and presentations",
  "Speaks up when they disagree or have questions",
  "Tries new challenges without fear of making mistakes",
  "Bounces back quickly from setbacks or criticism",
  "Helps classmates feel more confident about their abilities",
  "Takes initiative on classroom activities and discussions",
  "Advocates for themselves and others when needed"
]

const creativeQuickWins = [
  "Let them illustrate their answers or create visual representations",
  "Offer choice in how they demonstrate their learning",
  "Use storytelling to introduce new concepts",
  "Allow time for brainstorming before requiring specific answers",
  "Incorporate movement or hands-on activities",
  "Connect lessons to real-world creative applications"
]

const analyticalQuickWins = [
  "Provide clear, step-by-step instructions and rubrics",
  "Use graphic organizers and structured note-taking templates",
  "Explain the 'why' behind rules and procedures",
  "Offer extra time to process and organize thoughts",
  "Use data, charts, and concrete examples",
  "Break large assignments into smaller, sequential tasks"
]

const collaborativeQuickWins = [
  "Use think-pair-share and small group activities",
  "Assign roles that utilize their social leadership skills",
  "Create opportunities for peer teaching and mentoring",
  "Allow discussion time before individual work",
  "Use group problem-solving for challenging concepts",
  "Let them help organize classroom community activities"
]

const confidentQuickWins = [
  "Give them leadership roles and special responsibilities",
  "Offer challenging extension activities when they finish early",
  "Let them present to the class or younger students",
  "Encourage them to ask questions and challenge ideas respectfully",
  "Use their confidence to help other students feel comfortable",
  "Provide opportunities for healthy competition and goal-setting"
]

const creativeChallenges = [
  "May struggle with rigid timelines and detailed instructions",
  "Might resist structured activities with only one right answer"
]

const analyticalChallenges = [
  "May become overwhelmed by open-ended creative tasks",
  "Might struggle when asked to make quick decisions"
]

const collaborativeChallenges = [
  "May feel anxious or less productive during independent work",
  "Might talk too much during quiet work time"
]

const confidentChallenges = [
  "May appear overconfident or dominate group discussions",
  "Might take on too much responsibility and become overwhelmed"
]

const creativeEmergencyPlans = [
  "Offer a creative alternative - 'How could you show this in a different way?'",
  "Give them a choice between 2-3 structured options",
  "Allow them to work with a partner for accountability"
]

const analyticalEmergencyPlans = [
  "Break the task into smaller, numbered steps",
  "Provide a model or example to follow",
  "Give extra processing time and check in privately"
]

const collaborativeEmergencyPlans = [
  "Move them near a supportive peer or create a quick partnership",
  "Allow quiet discussion or let them explain their thinking aloud",
  "Give them a small group leadership role to regain engagement"
]

const confidentEmergencyPlans = [
  "Give them a special challenge or extension task",
  "Ask them to help a struggling classmate",
  "Channel their energy into a leadership role for the activity"
]

const parentInsights = {
  Creative: [
    "At home, Emma comes up with the most creative games and stories. She needs time to think and explore ideas before being asked for the 'right' answer.",
    "Sofia loves to draw and create. When she's stuck on homework, I let her draw or build something related to the topic first.",
    "Maya sees connections everywhere - she'll relate math to her art projects or science to a book she read. She needs variety to stay engaged.",
    "Alex builds elaborate Lego creations and tells detailed stories. They work best when they can move around while thinking.",
    "Jordan makes up songs to remember things and turns everything into a story. They need creative outlets during learning."
  ],
  Analytical: [
    "Liam asks 'why' about everything and loves to understand how things work. He needs clear explanations and time to process new information.",
    "Aiden organizes his room by color and category. He works best with clear expectations and step-by-step instructions.",
    "Marcus loves puzzles and building sets. He gets frustrated when instructions aren't clear or when he has to guess.",
    "Isabella asks very detailed questions and remembers specific facts from months ago. She thrives with structured learning.",
    "Ethan takes notes on everything and loves to make lists. He needs organized materials and predictable routines."
  ],
  Collaborative: [
    "Zoe is always organizing playdates and group activities. She learns best when she can talk through ideas with others.",
    "Carlos naturally includes everyone and makes sure no one feels left out. He struggles with independent work but shines in groups.",
    "Ava loves to teach her little brother what she learned at school. She processes information better when she can share it.",
    "Noah is the peacemaker among his siblings. He works well with others but needs social interaction to stay motivated.",
    "Lily always wants to work with friends on projects. She needs social connection to feel comfortable taking academic risks."
  ],
  Confident: [
    "Ryan takes on leadership roles naturally and isn't afraid to try new things. He needs challenges to stay engaged.",
    "Chloe speaks up for herself and others. She thrives when given responsibility and meaningful challenges.",
    "Tyler bounces back from mistakes quickly and encourages his friends. He needs variety and opportunities to lead.",
    "Sophia takes initiative on projects and isn't afraid to ask for help. She works best with high expectations.",
    "Mason stands up for what he believes in and takes on big challenges. He needs goals that stretch his abilities."
  ]
}

const sampleStudents = [
  // Creative Students
  {
    name: "Emma Thompson",
    email: "jennifer.thompson@email.com",
    style: "Creative" as const,
    grade: "3rd Grade"
  },
  {
    name: "Sofia Martinez", 
    email: "maria.martinez@email.com",
    style: "Creative" as const,
    grade: "2nd Grade"
  },
  {
    name: "Maya Chen",
    email: "david.chen@email.com", 
    style: "Creative" as const,
    grade: "4th Grade"
  },
  {
    name: "Alex Rivera",
    email: "carmen.rivera@email.com",
    style: "Creative" as const,
    grade: "1st Grade"
  },
  {
    name: "Jordan Kim",
    email: "sarah.kim@email.com",
    style: "Creative" as const,
    grade: "3rd Grade"
  },
  
  // Analytical Students
  {
    name: "Liam Wilson",
    email: "michael.wilson@email.com",
    style: "Analytical" as const,
    grade: "4th Grade"
  },
  {
    name: "Aiden Johnson",
    email: "lisa.johnson@email.com", 
    style: "Analytical" as const,
    grade: "2nd Grade"
  },
  {
    name: "Marcus Brown",
    email: "robert.brown@email.com",
    style: "Analytical" as const,
    grade: "3rd Grade"
  },
  {
    name: "Isabella Davis",
    email: "amanda.davis@email.com",
    style: "Analytical" as const,
    grade: "4th Grade"
  },
  {
    name: "Ethan Garcia",
    email: "carlos.garcia@email.com",
    style: "Analytical" as const,
    grade: "1st Grade"
  },

  // Collaborative Students  
  {
    name: "Zoe Anderson",
    email: "michelle.anderson@email.com",
    style: "Collaborative" as const,
    grade: "3rd Grade"
  },
  {
    name: "Carlos Rodriguez",
    email: "elena.rodriguez@email.com",
    style: "Collaborative" as const,
    grade: "2nd Grade"
  },
  {
    name: "Ava Taylor", 
    email: "jennifer.taylor@email.com",
    style: "Collaborative" as const,
    grade: "4th Grade"
  },
  {
    name: "Noah Miller",
    email: "jason.miller@email.com",
    style: "Collaborative" as const,
    grade: "1st Grade"
  },
  {
    name: "Lily Patel",
    email: "priya.patel@email.com",
    style: "Collaborative" as const,
    grade: "3rd Grade"
  },

  // Confident Students
  {
    name: "Ryan Foster",
    email: "kevin.foster@email.com",
    style: "Confident" as const,
    grade: "4th Grade"
  },
  {
    name: "Chloe Wright",
    email: "stephanie.wright@email.com",
    style: "Confident" as const,
    grade: "2nd Grade"
  },
  {
    name: "Tyler Hayes",
    email: "brian.hayes@email.com", 
    style: "Confident" as const,
    grade: "3rd Grade"
  },
  {
    name: "Sophia Lee",
    email: "grace.lee@email.com",
    style: "Confident" as const,
    grade: "4th Grade"
  },
  {
    name: "Mason Clark",
    email: "jessica.clark@email.com",
    style: "Confident" as const,
    grade: "1st Grade"
  }
]

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function generateStudentCardData(): StudentCardData[] {
  return sampleStudents.map((student, index) => {
    let strengths: string[]
    let challenges: string[]
    let quickWins: string[]
    let emergencyPlan: string
    
    switch (student.style) {
      case 'Creative':
        strengths = getRandomItems(creativeStrengths, 3)
        challenges = getRandomItems(creativeChallenges, 2)
        quickWins = getRandomItems(creativeQuickWins, 3)
        emergencyPlan = getRandomItem(creativeEmergencyPlans)
        break
      case 'Analytical':
        strengths = getRandomItems(analyticalStrengths, 3)
        challenges = getRandomItems(analyticalChallenges, 2)
        quickWins = getRandomItems(analyticalQuickWins, 3)
        emergencyPlan = getRandomItem(analyticalEmergencyPlans)
        break
      case 'Collaborative':
        strengths = getRandomItems(collaborativeStrengths, 3)
        challenges = getRandomItems(collaborativeChallenges, 2)
        quickWins = getRandomItems(collaborativeQuickWins, 3)
        emergencyPlan = getRandomItem(collaborativeEmergencyPlans)
        break
      case 'Confident':
        strengths = getRandomItems(confidentStrengths, 3)
        challenges = getRandomItems(confidentChallenges, 2)
        quickWins = getRandomItems(confidentQuickWins, 3)
        emergencyPlan = getRandomItem(confidentEmergencyPlans)
        break
    }

    return {
      id: index + 1,
      child_name: student.name,
      parent_email: student.email,
      learning_style: student.style,
      strengths,
      challenges,
      quick_wins: quickWins,
      parent_insight: getRandomItem(parentInsights[student.style]),
      emergency_backup: emergencyPlan,
      assessment_results: {
        id: index + 100,
        personality_label: `${student.style} Learner`,
        scores: {
          Communication: Math.floor(Math.random() * 2) + 3,
          Collaboration: Math.floor(Math.random() * 2) + 3,
          Content: Math.floor(Math.random() * 2) + 3,
          'Critical Thinking': Math.floor(Math.random() * 2) + 3,
          'Creative Innovation': Math.floor(Math.random() * 2) + 3,
          Confidence: Math.floor(Math.random() * 2) + 3
        },
        grade_level: student.grade
      }
    }
  })
}