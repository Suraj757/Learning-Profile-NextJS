// Begin content recommendation service based on learning profiles
import { LearningProfile } from './supabase'

export interface BeginContent {
  id: string
  title: string
  description: string
  ageRange: string
  category: 'codespark' | 'homer' | 'little-passports' | 'parent-resource' | 'classroom-activity'
  app: 'CodeSpark' | 'HOMER' | 'Little Passports' | 'Begin Parent Resources' | 'Classroom Tools'
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  thumbnailUrl?: string
  contentUrl?: string
  recommendationScore?: number
  educationalValue: number
  alignmentReason: string
  parentValue: string // What this gives parents
  teacherValue: string // What this gives teachers
  studentEngagement: string // Why kids will love it
  skillsFocused: string[] // Core skills developed
  implementationTips: string[] // How to use effectively
}

export interface ContentRecommendations {
  forTeachers: {
    classroomActivities: BeginContent[]
    individualSupports: BeginContent[]
    interventionResources: BeginContent[]
    assessmentTools: BeginContent[]
  }
  forParents: {
    homeActivities: BeginContent[]
    reinforcementContent: BeginContent[]
    familyProjects: BeginContent[]
    skillBuilders: BeginContent[]
  }
  forStudents: {
    engagementHooks: BeginContent[]
    strengthBuilders: BeginContent[]
    challengeActivities: BeginContent[]
    exploratory: BeginContent[]
  }
}

// Begin content database with real app content
const BEGIN_CONTENT_DATABASE: BeginContent[] = [
  // HOMER Reading & Language Content
  {
    id: 'homer-001',
    title: 'HOMER Reading Stories',
    description: 'Guided reading lessons with interactive stories, phonics practice, and comprehension questions',
    ageRange: '3-8',
    category: 'homer',
    app: 'HOMER',
    tags: ['reading', 'phonics', 'comprehension', 'vocabulary'],
    difficulty: 'beginner',
    duration: '15-20 min',
    educationalValue: 10,
    alignmentReason: 'Perfect for building foundational reading skills with personalized progression',
    parentValue: 'See daily reading progress and get specific tips for supporting literacy at home',
    teacherValue: 'Detailed reading level reports and suggested classroom reinforcement activities',
    studentEngagement: 'Interactive stories with beloved characters and rewards for reading milestones',
    skillsFocused: ['Phonics', 'Reading Comprehension', 'Vocabulary', 'Fluency'],
    implementationTips: ['Start with 10-minute sessions', 'Celebrate reading streak badges', 'Discuss stories together']
  },
  {
    id: 'homer-002',
    title: 'HOMER Creative Expression',
    description: 'Art and creativity activities that combine drawing, storytelling, and imagination',
    ageRange: '2-6',
    category: 'homer',
    app: 'HOMER',
    tags: ['creativity', 'art', 'storytelling', 'self-expression'],
    difficulty: 'beginner',
    duration: '10-25 min',
    educationalValue: 8,
    alignmentReason: 'Develops creative expression while building early literacy concepts',
    parentValue: 'See your child\'s creative work and get conversation starters about their art',
    teacherValue: 'Use student artwork for classroom displays and writing prompts',
    studentEngagement: 'Create their own stories and characters with easy-to-use digital art tools',
    skillsFocused: ['Creative Expression', 'Fine Motor Skills', 'Narrative Skills', 'Visual Arts'],
    implementationTips: ['Save and share artwork', 'Ask open-ended questions about creations', 'Display work proudly']
  },

  // CodeSpark Programming & Logic Content
  {
    id: 'codespark-001',
    title: 'CodeSpark Game Creation',
    description: 'Kids create their own games using drag-and-drop coding blocks, learning programming fundamentals',
    ageRange: '4-10',
    category: 'codespark',
    app: 'CodeSpark',
    tags: ['coding', 'logic', 'creativity', 'problem-solving', 'STEM'],
    difficulty: 'intermediate',
    duration: '20-45 min',
    educationalValue: 10,
    alignmentReason: 'Perfect for developing logical thinking and problem-solving through hands-on coding',
    parentValue: 'Watch your child create actual games and learn future-ready skills in a fun way',
    teacherValue: 'Students develop computational thinking while working on engaging projects',
    studentEngagement: 'Create games with their favorite characters and share with friends',
    skillsFocused: ['Computational Thinking', 'Logic', 'Sequencing', 'Problem Solving', 'Creativity'],
    implementationTips: ['Start with guided puzzles', 'Encourage experimentation', 'Share creations with family']
  },
  {
    id: 'codespark-002',
    title: 'CodeSpark Puzzle Adventures',
    description: 'Step-by-step coding puzzles that teach programming concepts through play',
    ageRange: '4-8',
    category: 'codespark',
    app: 'CodeSpark',
    tags: ['coding', 'puzzles', 'logic', 'sequence', 'critical-thinking'],
    difficulty: 'beginner',
    duration: '10-20 min',
    educationalValue: 9,
    alignmentReason: 'Builds critical thinking through structured programming challenges',
    parentValue: 'See how coding improves your child\'s logical thinking and persistence',
    teacherValue: 'Integrate computational thinking into daily problem-solving activities',
    studentEngagement: 'Help cute characters solve problems using code commands',
    skillsFocused: ['Sequencing', 'Logic', 'Pattern Recognition', 'Debugging', 'Persistence'],
    implementationTips: ['Celebrate debugging successes', 'Connect to math patterns', 'Try offline sequencing games']
  },

  // Little Passports Geography & Cultural Learning
  {
    id: 'passports-001',
    title: 'Little Passports World Explorer',
    description: 'Interactive geography adventures exploring countries, cultures, and traditions around the world',
    ageRange: '5-12',
    category: 'little-passports',
    app: 'Little Passports',
    tags: ['geography', 'culture', 'exploration', 'curiosity', 'global-awareness'],
    difficulty: 'intermediate',
    duration: '20-40 min',
    educationalValue: 9,
    alignmentReason: 'Develops curiosity and cultural awareness through immersive exploration',
    parentValue: 'Share in your child\'s excitement about different cultures and plan future travels together',
    teacherValue: 'Connect geography lessons to real cultural experiences and student interests',
    studentEngagement: 'Travel the world with Sam and Sofia, collect souvenirs and learn amazing facts',
    skillsFocused: ['Geography', 'Cultural Awareness', 'Reading Comprehension', 'Critical Thinking'],
    implementationTips: ['Use a world map to track adventures', 'Try foods from featured countries', 'Connect to current events']
  },
  {
    id: 'passports-002',
    title: 'Little Passports Science Expeditions',
    description: 'Hands-on science experiments and activities exploring natural phenomena and scientific concepts',
    ageRange: '6-11',
    category: 'little-passports',
    app: 'Little Passports',
    tags: ['science', 'experiments', 'STEM', 'hands-on', 'discovery'],
    difficulty: 'intermediate',
    duration: '30-60 min',
    educationalValue: 10,
    alignmentReason: 'Perfect for hands-on learners who love discovery and experimentation',
    parentValue: 'Do real science experiments together and see your child\'s natural curiosity flourish',
    teacherValue: 'Supplement science curriculum with engaging, tested experiments',
    studentEngagement: 'Become a real scientist with cool experiments and awesome discoveries',
    skillsFocused: ['Scientific Method', 'Observation', 'Hypothesis Testing', 'Critical Thinking'],
    implementationTips: ['Set up a science journal', 'Take photos of experiments', 'Ask "what if" questions']
  },

  // HOMER Math & Numbers Content
  {
    id: 'homer-003',
    title: 'HOMER Math Adventures',
    description: 'Interactive math games covering counting, shapes, patterns, and early arithmetic with adaptive learning',
    ageRange: '3-8',
    category: 'homer',
    app: 'HOMER',
    tags: ['math', 'numbers', 'counting', 'shapes', 'patterns'],
    difficulty: 'beginner',
    duration: '15-25 min',
    educationalValue: 10,
    alignmentReason: 'Builds math confidence through personalized, engaging activities',
    parentValue: 'Track math progress and get specific ways to reinforce concepts during daily activities',
    teacherValue: 'Identify specific math skills to focus on and get suggested manipulatives to use',
    studentEngagement: 'Solve math problems with favorite characters and earn cool rewards',
    skillsFocused: ['Number Recognition', 'Counting', 'Basic Addition', 'Shapes', 'Patterns'],
    implementationTips: ['Use everyday objects for counting', 'Look for shapes on walks', 'Make math part of cooking']
  },
  {
    id: 'homer-004',
    title: 'HOMER Social-Emotional Learning',
    description: 'Stories and activities focused on feelings, empathy, friendship, and emotional regulation',
    ageRange: '2-7',
    category: 'homer',
    app: 'HOMER',
    tags: ['social-emotional', 'feelings', 'empathy', 'friendship', 'character'],
    difficulty: 'beginner',
    duration: '10-20 min',
    educationalValue: 9,
    alignmentReason: 'Essential for developing emotional intelligence and social skills',
    parentValue: 'Get conversation starters about feelings and tools for managing emotions at home',
    teacherValue: 'Support classroom community building and conflict resolution skills',
    studentEngagement: 'Learn about feelings with relatable characters and interactive stories',
    skillsFocused: ['Emotional Recognition', 'Empathy', 'Friendship Skills', 'Self-Regulation'],
    implementationTips: ['Practice feeling words daily', 'Role-play social situations', 'Create a feelings chart']
  },

  // Begin Parent Resources Content
  {
    id: 'parent-001',
    title: 'Learning Through Play Guide',
    description: 'Research-backed strategies for turning everyday activities into powerful learning opportunities',
    ageRange: '2-10',
    category: 'parent-resource',
    app: 'Begin Parent Resources',
    tags: ['parent-support', 'play-based-learning', 'everyday-activities', 'development'],
    difficulty: 'beginner',
    duration: '5-10 min read',
    educationalValue: 8,
    alignmentReason: 'Empowers parents to support learning naturally throughout the day',
    parentValue: 'Turn daily routines into learning opportunities without extra work or materials',
    teacherValue: 'Share with families to extend classroom learning at home',
    studentEngagement: 'Learning happens during fun family time and everyday activities',
    skillsFocused: ['Holistic Development', 'Family Engagement', 'Natural Learning'],
    implementationTips: ['Start with one new activity per week', 'Focus on conversation over perfection', 'Celebrate small moments']
  },
  {
    id: 'parent-002',
    title: 'Screen Time That Builds Skills',
    description: 'Curated recommendations for educational screen time that actually supports development',
    ageRange: '3-12',
    category: 'parent-resource',
    app: 'Begin Parent Resources',
    tags: ['screen-time', 'educational-media', 'digital-wellness', 'skill-building'],
    difficulty: 'intermediate',
    duration: '3-5 min read',
    educationalValue: 7,
    alignmentReason: 'Helps parents make intentional choices about educational technology',
    parentValue: 'Feel confident about screen time choices and maximize learning value',
    teacherValue: 'Recommend quality educational content that aligns with classroom goals',
    studentEngagement: 'Enjoy screen time that feels fun but builds real skills',
    skillsFocused: ['Digital Literacy', 'Media Literacy', 'Self-Regulation'],
    implementationTips: ['Set learning goals for screen time', 'Watch together when possible', 'Discuss content afterwards']
  },

  // Classroom Activity Tools
  {
    id: 'classroom-001',
    title: 'Learning Profile Classroom Strategies',
    description: 'Specific teaching strategies tailored to different learning profiles and personality types',
    ageRange: '5-12',
    category: 'classroom-activity',
    app: 'Classroom Tools',
    tags: ['differentiation', 'teaching-strategies', 'learning-profiles', 'classroom-management'],
    difficulty: 'intermediate',
    duration: '30-45 min implementation',
    educationalValue: 10,
    alignmentReason: 'Direct application of learning profile insights to improve instruction',
    parentValue: 'Understand how your child learns best and advocate for appropriate supports',
    teacherValue: 'Get specific, actionable strategies for differentiating instruction effectively',
    studentEngagement: 'Experience learning that matches their natural strengths and interests',
    skillsFocused: ['Personalized Learning', 'Engagement', 'Skill Development'],
    implementationTips: ['Start with one strategy per week', 'Document what works', 'Share successes with families']
  },
  {
    id: 'classroom-002',
    title: 'Family-School Connection Activities',
    description: 'Ready-to-use activities that help families support classroom learning at home',
    ageRange: '4-11',
    category: 'classroom-activity',
    app: 'Classroom Tools',
    tags: ['family-engagement', 'home-school-connection', 'parent-support', 'communication'],
    difficulty: 'beginner',
    duration: '15-30 min',
    educationalValue: 8,
    alignmentReason: 'Strengthens learning through consistent home-school partnership',
    parentValue: 'Feel confident supporting your child\'s learning with clear, doable activities',
    teacherValue: 'Extend classroom learning effectively without overwhelming families',
    studentEngagement: 'Share school learning with family in fun, meaningful ways',
    skillsFocused: ['Family Engagement', 'Skill Reinforcement', 'Communication'],
    implementationTips: ['Send home with clear instructions', 'Follow up on family experiences', 'Celebrate home learning']
  },

  // Advanced Learning Challenges
  {
    id: 'codespark-003',
    title: 'CodeSpark Advanced Game Design',
    description: 'Complex game creation projects using advanced coding concepts and creative problem-solving',
    ageRange: '8-12',
    category: 'codespark',
    app: 'CodeSpark',
    tags: ['advanced-coding', 'game-design', 'creative-problem-solving', 'STEM'],
    difficulty: 'advanced',
    duration: '45-90 min',
    educationalValue: 10,
    alignmentReason: 'Challenges advanced learners with complex programming concepts',
    parentValue: 'See your child tackle real programming challenges and create impressive projects',
    teacherValue: 'Extend STEM learning for advanced students with authentic coding projects',
    studentEngagement: 'Create complex games and share them with friends and family',
    skillsFocused: ['Advanced Logic', 'Systems Thinking', 'Creative Problem Solving', 'Persistence'],
    implementationTips: ['Encourage iteration and improvement', 'Connect to real programming careers', 'Showcase student creations']
  },
  {
    id: 'passports-003',
    title: 'Little Passports Cultural Deep Dives',
    description: 'In-depth exploration of specific cultures, including history, traditions, food, and current events',
    ageRange: '8-14',
    category: 'little-passports',
    app: 'Little Passports',
    tags: ['cultural-studies', 'global-awareness', 'critical-thinking', 'research'],
    difficulty: 'advanced',
    duration: '60-120 min',
    educationalValue: 9,
    alignmentReason: 'Develops deep cultural understanding and research skills',
    parentValue: 'Explore the world together and build global awareness as a family',
    teacherValue: 'Integrate with social studies curriculum and current events discussions',
    studentEngagement: 'Become an expert on different countries and cultures around the world',
    skillsFocused: ['Cultural Competency', 'Research Skills', 'Critical Analysis', 'Global Awareness'],
    implementationTips: ['Connect to current events', 'Find pen pals from featured countries', 'Plan themed family meals']
  },

  // Additional HOMER Content
  {
    id: 'homer-005',
    title: 'HOMER Thinking Skills Games',
    description: 'Brain games and puzzles that develop logic, memory, and problem-solving skills',
    ageRange: '4-8',
    category: 'homer',
    app: 'HOMER',
    tags: ['critical-thinking', 'memory', 'logic', 'problem-solving', 'brain-games'],
    difficulty: 'intermediate',
    duration: '10-20 min',
    educationalValue: 8,
    alignmentReason: 'Perfect for developing analytical thinking and cognitive flexibility',
    parentValue: 'Watch your child develop stronger thinking skills through engaging brain games',
    teacherValue: 'Use as brain breaks that actually build cognitive skills',
    studentEngagement: 'Fun puzzles and challenges that feel like games, not work',
    skillsFocused: ['Logical Reasoning', 'Memory', 'Pattern Recognition', 'Problem Solving'],
    implementationTips: ['Start with shorter sessions', 'Celebrate problem-solving process', 'Connect to daily life puzzles']
  },
  {
    id: 'homer-006',
    title: 'HOMER Family Learning Activities',
    description: 'Activities designed for parents and children to do together, building bonds while learning',
    ageRange: '3-7',
    category: 'homer',
    app: 'HOMER',
    tags: ['family-engagement', 'collaboration', 'bonding', 'shared-learning'],
    difficulty: 'beginner',
    duration: '15-30 min',
    educationalValue: 9,
    alignmentReason: 'Strengthens family connections while reinforcing learning concepts',
    parentValue: 'Spend quality time with your child while supporting their education',
    teacherValue: 'Send home activities that engage families in the learning process',
    studentEngagement: 'Learn alongside parents and siblings in fun, pressure-free ways',
    skillsFocused: ['Family Bonding', 'Communication', 'Shared Learning', 'Confidence Building'],
    implementationTips: ['Set aside regular family learning time', 'Focus on fun over perfection', 'Let children lead when possible']
  },

  // Additional CodeSpark Content
  {
    id: 'codespark-004',
    title: 'CodeSpark Storytelling with Code',
    description: 'Create interactive stories where characters respond to code commands',
    ageRange: '5-9',
    category: 'codespark',
    app: 'CodeSpark',
    tags: ['storytelling', 'creativity', 'coding', 'narrative', 'character-development'],
    difficulty: 'beginner',
    duration: '20-30 min',
    educationalValue: 8,
    alignmentReason: 'Combines creativity with logical thinking through interactive storytelling',
    parentValue: 'See your child create stories that come to life through programming',
    teacherValue: 'Integrate coding with literacy and creative writing activities',
    studentEngagement: 'Bring their own stories to life with animated characters',
    skillsFocused: ['Creative Storytelling', 'Sequencing', 'Cause and Effect', 'Digital Literacy'],
    implementationTips: ['Start with simple character movements', 'Encourage story sharing', 'Connect to traditional storytelling']
  },

  // Additional Little Passports Content
  {
    id: 'passports-004',
    title: 'Little Passports USA Edition',
    description: 'Explore different states and regions of the United States through interactive activities',
    ageRange: '6-12',
    category: 'little-passports',
    app: 'Little Passports',
    tags: ['geography', 'USA', 'states', 'local-culture', 'history'],
    difficulty: 'intermediate',
    duration: '25-45 min',
    educationalValue: 9,
    alignmentReason: 'Builds connection to local geography and American culture',
    parentValue: 'Explore your own country together and plan future family trips',
    teacherValue: 'Perfect complement to state history and geography curriculum',
    studentEngagement: 'Discover amazing facts about places they might visit or live',
    skillsFocused: ['US Geography', 'State History', 'Cultural Awareness', 'Research Skills'],
    implementationTips: ['Connect to family heritage', 'Plan virtual or real visits', 'Create state comparison charts']
  },

  // Additional Parent Resources Content
  {
    id: 'parent-003',
    title: 'Building Independence Gradually',
    description: 'Age-appropriate strategies for fostering independence while maintaining support',
    ageRange: '4-12',
    category: 'parent-resource',
    app: 'Begin Parent Resources',
    tags: ['independence', 'confidence', 'life-skills', 'gradual-release', 'self-reliance'],
    difficulty: 'intermediate',
    duration: '8-12 min read',
    educationalValue: 8,
    alignmentReason: 'Helps children develop confidence and self-reliance at their own pace',
    parentValue: 'Learn how to support independence without pushing too hard or too fast',
    teacherValue: 'Share strategies with families for building classroom independence',
    studentEngagement: 'Feel proud and capable as they master new responsibilities',
    skillsFocused: ['Self-Reliance', 'Confidence', 'Life Skills', 'Problem Solving'],
    implementationTips: ['Start with small, achievable tasks', 'Celebrate independent successes', 'Provide scaffolding as needed']
  },

  // Additional Classroom Tools
  {
    id: 'classroom-003',
    title: 'Flexible Grouping Strategies',
    description: 'Dynamic grouping techniques that adapt to different learning profiles and activities',
    ageRange: '5-12',
    category: 'classroom-activity',
    app: 'Classroom Tools',
    tags: ['flexible-grouping', 'differentiation', 'collaboration', 'peer-learning'],
    difficulty: 'intermediate',
    duration: '20-40 min setup',
    educationalValue: 9,
    alignmentReason: 'Maximizes learning by matching group dynamics to learning objectives',
    parentValue: 'Understand how teachers group students for optimal learning',
    teacherValue: 'Increase engagement and achievement through strategic grouping',
    studentEngagement: 'Work with different classmates and experience varied learning approaches',
    skillsFocused: ['Collaboration', 'Adaptability', 'Peer Learning', 'Social Skills'],
    implementationTips: ['Change groups regularly', 'Mix strengths and challenges', 'Teach group work skills explicitly']
  }
]

export class BeginContentRecommendationService {
  /**
   * Generate personalized content recommendations based on learning profile
   */
  async getPersonalizedRecommendations(
    learningProfile: LearningProfile,
    context: 'teacher' | 'parent' | 'student' = 'teacher'
  ): Promise<ContentRecommendations> {
    const { personality_label, scores } = learningProfile
    
    // Analyze learning profile strengths and growth areas
    const strengths = this.identifyStrengths(scores)
    const growthAreas = this.identifyGrowthAreas(scores)
    
    // Generate content tags based on profile
    const profileTags = this.generateProfileTags(personality_label, scores)
    
    // Get content recommendations for each audience
    const teacherContent = await this.getTeacherRecommendations(profileTags, strengths, growthAreas)
    const parentContent = await this.getParentRecommendations(profileTags, strengths, growthAreas)
    const studentContent = await this.getStudentRecommendations(profileTags, strengths, growthAreas)
    
    return {
      forTeachers: teacherContent,
      forParents: parentContent,
      forStudents: studentContent
    }
  }

  /**
   * Get content recommendations specifically for teachers
   */
  private async getTeacherRecommendations(
    profileTags: string[],
    strengths: string[],
    growthAreas: string[]
  ) {
    const allContent = this.scoreContent(profileTags, strengths, growthAreas)
    
    return {
      classroomActivities: allContent
        .filter(c => c.category === 'classroom-activity')
        .slice(0, 3),
      individualSupports: allContent
        .filter(c => c.tags.some(tag => strengths.includes(tag)))
        .slice(0, 3),
      interventionResources: allContent
        .filter(c => c.tags.some(tag => growthAreas.includes(tag)))
        .slice(0, 3),
      assessmentTools: allContent
        .filter(c => c.tags.includes('assessment') || c.educationalValue >= 9)
        .slice(0, 2)
    }
  }

  /**
   * Get content recommendations specifically for parents
   */
  private async getParentRecommendations(
    profileTags: string[],
    strengths: string[],
    growthAreas: string[]
  ) {
    const allContent = this.scoreContent(profileTags, strengths, growthAreas)
    
    return {
      homeActivities: allContent
        .filter(c => c.tags.includes('family-engagement') || c.category === 'parent-resource')
        .slice(0, 4),
      reinforcementContent: allContent
        .filter(c => c.tags.some(tag => strengths.includes(tag)) && c.difficulty === 'beginner')
        .slice(0, 3),
      familyProjects: allContent
        .filter(c => c.duration.includes('30') || c.difficulty === 'intermediate')
        .slice(0, 2),
      skillBuilders: allContent
        .filter(c => c.tags.some(tag => growthAreas.includes(tag)))
        .slice(0, 3)
    }
  }

  /**
   * Get content recommendations specifically for students
   */
  private async getStudentRecommendations(
    profileTags: string[],
    strengths: string[],
    growthAreas: string[]
  ) {
    const allContent = this.scoreContent(profileTags, strengths, growthAreas)
    
    return {
      engagementHooks: allContent
        .filter(c => (c.category === 'codespark' || c.category === 'homer') && c.recommendationScore! >= 8)
        .slice(0, 3),
      strengthBuilders: allContent
        .filter(c => c.tags.some(tag => strengths.includes(tag)))
        .slice(0, 3),
      challengeActivities: allContent
        .filter(c => c.difficulty === 'advanced' && c.educationalValue >= 9)
        .slice(0, 2),
      exploratory: allContent
        .filter(c => c.tags.includes('creativity') || c.tags.includes('exploration'))
        .slice(0, 3)
    }
  }

  /**
   * Score content based on learning profile alignment
   */
  private scoreContent(profileTags: string[], strengths: string[], growthAreas: string[]): BeginContent[] {
    return BEGIN_CONTENT_DATABASE.map(content => {
      let score = 0
      
      // Base score from educational value
      score += content.educationalValue
      
      // Bonus for profile tag matches
      const tagMatches = content.tags.filter(tag => profileTags.includes(tag)).length
      score += tagMatches * 2
      
      // Bonus for strength area alignment
      const strengthMatches = content.tags.filter(tag => strengths.includes(tag)).length
      score += strengthMatches * 1.5
      
      // Bonus for growth area alignment
      const growthMatches = content.tags.filter(tag => growthAreas.includes(tag)).length
      score += growthMatches * 1.5
      
      return {
        ...content,
        recommendationScore: Math.round(score * 10) / 10
      }
    }).sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
  }

  /**
   * Generate content tags based on learning profile
   */
  private generateProfileTags(personalityLabel: string, scores: any): string[] {
    const tags: string[] = []
    
    // Add personality-based tags
    const personalityType = personalityLabel.toLowerCase()
    if (personalityType.includes('creative')) tags.push('creativity', 'art', 'creative-problem-solving')
    if (personalityType.includes('analytical')) tags.push('logic', 'critical-thinking', 'problem-solving', 'STEM')
    if (personalityType.includes('collaborative')) tags.push('collaboration', 'teamwork', 'social-emotional')
    if (personalityType.includes('confident')) tags.push('confidence', 'leadership', 'advanced-coding')
    
    // Add score-based tags
    if (scores.communication >= 7) tags.push('reading', 'vocabulary', 'storytelling')
    if (scores.collaboration >= 7) tags.push('family-engagement', 'social-emotional', 'friendship')
    if (scores.content >= 7) tags.push('math', 'numbers', 'science')
    if (scores.critical_thinking >= 7) tags.push('coding', 'logic', 'problem-solving')
    if (scores.creative_innovation >= 7) tags.push('creativity', 'art', 'game-design')
    if (scores.confidence >= 7) tags.push('advanced-coding', 'cultural-studies', 'leadership')
    
    return [...new Set(tags)] // Remove duplicates
  }

  /**
   * Identify strength areas from learning profile scores
   */
  private identifyStrengths(scores: any): string[] {
    const strengths: string[] = []
    
    if (scores.communication >= 8) strengths.push('communication')
    if (scores.collaboration >= 8) strengths.push('collaboration')
    if (scores.content >= 8) strengths.push('content')
    if (scores.critical_thinking >= 8) strengths.push('critical-thinking')
    if (scores.creative_innovation >= 8) strengths.push('creativity')
    if (scores.confidence >= 8) strengths.push('confidence')
    
    return strengths
  }

  /**
   * Identify growth areas from learning profile scores
   */
  private identifyGrowthAreas(scores: any): string[] {
    const growthAreas: string[] = []
    
    if (scores.communication <= 6) growthAreas.push('communication')
    if (scores.collaboration <= 6) growthAreas.push('collaboration')
    if (scores.content <= 6) growthAreas.push('content')
    if (scores.critical_thinking <= 6) growthAreas.push('critical-thinking')
    if (scores.creative_innovation <= 6) growthAreas.push('creativity')
    if (scores.confidence <= 6) growthAreas.push('confidence')
    
    return growthAreas
  }

  /**
   * Get quick recommendation summary for a learning profile
   */
  async getQuickRecommendationSummary(learningProfile: LearningProfile): Promise<{
    topRecommendation: BeginContent
    strengthActivity: BeginContent
    growthActivity: BeginContent
    familyActivity: BeginContent
  }> {
    const recommendations = await this.getPersonalizedRecommendations(learningProfile)
    
    // Get all content and sort by score
    const allContent = [
      ...recommendations.forTeachers.classroomActivities,
      ...recommendations.forTeachers.individualSupports,
      ...recommendations.forTeachers.interventionResources,
      ...recommendations.forParents.homeActivities,
      ...recommendations.forParents.reinforcementContent,
      ...recommendations.forParents.familyProjects,
      ...recommendations.forStudents.engagementHooks,
      ...recommendations.forStudents.strengthBuilders
    ].sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
    
    // Remove duplicates and ensure uniqueness
    const uniqueContent = allContent.filter((item, index, arr) => 
      arr.findIndex(other => other.id === item.id) === index
    )
    
    // Ensure we have at least 4 unique items by adding from database if needed
    const additionalContent = BEGIN_CONTENT_DATABASE
      .filter(item => !uniqueContent.find(existing => existing.id === item.id))
      .slice(0, Math.max(0, 4 - uniqueContent.length))
    
    const finalContent = [...uniqueContent, ...additionalContent].slice(0, 8)
    
    // Select diverse recommendations across different categories and apps
    const getUniqueRecommendation = (excludeIds: string[], preferredTags?: string[], preferredApps?: string[]) => {
      // First try to find content with preferred tags/apps
      if (preferredTags || preferredApps) {
        const preferred = finalContent.find(item => 
          !excludeIds.includes(item.id) && 
          (
            (preferredTags && item.tags.some(tag => preferredTags.includes(tag))) ||
            (preferredApps && preferredApps.includes(item.app))
          )
        )
        if (preferred) return preferred
      }
      
      // Fall back to any unique content
      return finalContent.find(item => !excludeIds.includes(item.id)) || finalContent[0]
    }
    
    const topRecommendation = finalContent[0] || BEGIN_CONTENT_DATABASE[0]
    const usedIds = [topRecommendation.id]
    
    const strengthActivity = getUniqueRecommendation(usedIds, [], ['HOMER', 'CodeSpark'])
    usedIds.push(strengthActivity.id)
    
    const growthActivity = getUniqueRecommendation(usedIds, ['critical-thinking', 'problem-solving'], ['Little Passports', 'Begin Parent Resources'])
    usedIds.push(growthActivity.id)
    
    const familyActivity = getUniqueRecommendation(usedIds, ['family-engagement', 'collaboration'], ['HOMER', 'Begin Parent Resources'])
    
    return {
      topRecommendation,
      strengthActivity,
      growthActivity,
      familyActivity
    }
  }
}

// Export singleton instance
export const beginContentService = new BeginContentRecommendationService()

// Export types
export type { ContentRecommendations, BeginContent }