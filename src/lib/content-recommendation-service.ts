// Begin content recommendation service based on learning profiles
import { LearningProfile } from './supabase'

export interface BeginContent {
  id: string
  title: string
  description: string
  ageRange: string
  category: 'game' | 'activity' | 'book' | 'video' | 'worksheet'
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  duration: string
  thumbnailUrl?: string
  contentUrl?: string
  recommendationScore?: number
  educationalValue: number
  alignmentReason: string
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

// Begin content database (simulated - would come from actual Begin API/database)
const BEGIN_CONTENT_DATABASE: BeginContent[] = [
  // Communication & Language Content
  {
    id: 'comm-001',
    title: 'Story Builder Adventure',
    description: 'Interactive storytelling game where children create characters and build narratives',
    ageRange: '6-10',
    category: 'game',
    tags: ['communication', 'creativity', 'language', 'storytelling'],
    difficulty: 'medium',
    duration: '15-20 min',
    educationalValue: 9,
    alignmentReason: 'Perfect for developing communication skills through narrative creation'
  },
  {
    id: 'comm-002',
    title: 'Family Story Time Kit',
    description: 'Guided prompts for family storytelling and discussion activities',
    ageRange: '5-12',
    category: 'activity',
    tags: ['communication', 'family', 'discussion', 'bonding'],
    difficulty: 'easy',
    duration: '10-30 min',
    educationalValue: 8,
    alignmentReason: 'Strengthens communication skills in a family setting'
  },

  // Collaboration & Social Content
  {
    id: 'collab-001',
    title: 'Team Problem Solvers',
    description: 'Collaborative puzzles that require teamwork and communication to solve',
    ageRange: '7-11',
    category: 'game',
    tags: ['collaboration', 'teamwork', 'problem-solving', 'social'],
    difficulty: 'medium',
    duration: '20-25 min',
    educationalValue: 9,
    alignmentReason: 'Builds collaboration skills through structured team challenges'
  },
  {
    id: 'collab-002',
    title: 'Classroom Helper Activities',
    description: 'Structured activities for students to work together on classroom projects',
    ageRange: '6-10',
    category: 'activity',
    tags: ['collaboration', 'classroom', 'helpers', 'responsibility'],
    difficulty: 'easy',
    duration: '15-45 min',
    educationalValue: 7,
    alignmentReason: 'Develops collaborative skills in classroom environment'
  },

  // Critical Thinking & Problem Solving Content
  {
    id: 'critical-001',
    title: 'Logic Detective Adventures',
    description: 'Mystery-solving games that develop logical reasoning and critical thinking',
    ageRange: '8-12',
    category: 'game',
    tags: ['critical-thinking', 'logic', 'mystery', 'reasoning'],
    difficulty: 'hard',
    duration: '25-35 min',
    educationalValue: 10,
    alignmentReason: 'Excellent for developing analytical and critical thinking skills'
  },
  {
    id: 'critical-002',
    title: 'Why & How Question Cards',
    description: 'Conversation starters that encourage deep thinking and questioning',
    ageRange: '6-11',
    category: 'activity',
    tags: ['critical-thinking', 'questions', 'curiosity', 'discussion'],
    difficulty: 'medium',
    duration: '10-20 min',
    educationalValue: 8,
    alignmentReason: 'Develops critical thinking through guided questioning'
  },

  // Creative Innovation Content
  {
    id: 'creative-001',
    title: 'Invention Workshop',
    description: 'Digital tool for designing and creating imaginary inventions',
    ageRange: '7-12',
    category: 'game',
    tags: ['creativity', 'invention', 'design', 'innovation'],
    difficulty: 'medium',
    duration: '20-40 min',
    educationalValue: 9,
    alignmentReason: 'Perfect for nurturing creative and innovative thinking'
  },
  {
    id: 'creative-002',
    title: 'Art & Science Fusion Projects',
    description: 'Hands-on activities combining artistic expression with scientific concepts',
    ageRange: '6-10',
    category: 'activity',
    tags: ['creativity', 'art', 'science', 'hands-on'],
    difficulty: 'medium',
    duration: '30-60 min',
    educationalValue: 8,
    alignmentReason: 'Integrates creative expression with learning objectives'
  },

  // Confidence Building Content
  {
    id: 'confidence-001',
    title: 'Public Speaking Practice Games',
    description: 'Fun, low-pressure games to build presentation and speaking confidence',
    ageRange: '7-12',
    category: 'game',
    tags: ['confidence', 'speaking', 'presentation', 'performance'],
    difficulty: 'medium',
    duration: '15-25 min',
    educationalValue: 9,
    alignmentReason: 'Builds confidence through structured speaking practice'
  },
  {
    id: 'confidence-002',
    title: 'Success Celebration Toolkit',
    description: 'Activities and prompts for recognizing and celebrating achievements',
    ageRange: '5-11',
    category: 'activity',
    tags: ['confidence', 'celebration', 'achievement', 'self-esteem'],
    difficulty: 'easy',
    duration: '5-15 min',
    educationalValue: 7,
    alignmentReason: 'Builds confidence through positive reinforcement patterns'
  },

  // Content Mastery & Academic Content
  {
    id: 'content-001',
    title: 'Math Adventure Quest',
    description: 'Story-driven math practice with adaptive difficulty levels',
    ageRange: '6-12',
    category: 'game',
    tags: ['math', 'adventure', 'practice', 'adaptive'],
    difficulty: 'medium',
    duration: '20-30 min',
    educationalValue: 10,
    alignmentReason: 'Reinforces academic content through engaging gameplay'
  },
  {
    id: 'content-002',
    title: 'Reading Comprehension Builders',
    description: 'Interactive stories with comprehension questions and vocabulary building',
    ageRange: '6-11',
    category: 'book',
    tags: ['reading', 'comprehension', 'vocabulary', 'stories'],
    difficulty: 'medium',
    duration: '15-25 min',
    educationalValue: 9,
    alignmentReason: 'Strengthens content mastery through structured reading practice'
  },

  // Multi-skill Integration Content
  {
    id: 'multi-001',
    title: 'Classroom Community Builders',
    description: 'Activities that build classroom culture while developing multiple skills',
    ageRange: '5-10',
    category: 'activity',
    tags: ['community', 'classroom', 'social', 'collaboration'],
    difficulty: 'easy',
    duration: '10-30 min',
    educationalValue: 8,
    alignmentReason: 'Develops multiple skills through community-building activities'
  },
  {
    id: 'multi-002',
    title: 'Project-Based Learning Kits',
    description: 'Complete project guides that integrate multiple learning objectives',
    ageRange: '7-12',
    category: 'activity',
    tags: ['project', 'integration', 'multi-skill', 'guided'],
    difficulty: 'hard',
    duration: '45-90 min',
    educationalValue: 10,
    alignmentReason: 'Integrates multiple skills through comprehensive project work'
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
        .filter(c => c.category === 'activity' && c.tags.includes('classroom'))
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
        .filter(c => c.category === 'activity' && (c.tags.includes('family') || c.tags.includes('home')))
        .slice(0, 4),
      reinforcementContent: allContent
        .filter(c => c.tags.some(tag => strengths.includes(tag)) && c.difficulty === 'easy')
        .slice(0, 3),
      familyProjects: allContent
        .filter(c => c.duration.includes('30') || c.difficulty === 'medium')
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
        .filter(c => c.category === 'game' && c.recommendationScore! >= 8)
        .slice(0, 3),
      strengthBuilders: allContent
        .filter(c => c.tags.some(tag => strengths.includes(tag)))
        .slice(0, 3),
      challengeActivities: allContent
        .filter(c => c.difficulty === 'hard' && c.educationalValue >= 9)
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
    if (personalityType.includes('creative')) tags.push('creativity', 'art', 'innovation')
    if (personalityType.includes('analytical')) tags.push('logic', 'critical-thinking', 'problem-solving')
    if (personalityType.includes('collaborative')) tags.push('collaboration', 'teamwork', 'social')
    if (personalityType.includes('confident')) tags.push('confidence', 'leadership', 'presentation')
    
    // Add score-based tags
    if (scores.communication >= 7) tags.push('communication', 'language', 'discussion')
    if (scores.collaboration >= 7) tags.push('collaboration', 'teamwork', 'social')
    if (scores.content >= 7) tags.push('academic', 'content', 'practice')
    if (scores.critical_thinking >= 7) tags.push('critical-thinking', 'logic', 'reasoning')
    if (scores.creative_innovation >= 7) tags.push('creativity', 'innovation', 'design')
    if (scores.confidence >= 7) tags.push('confidence', 'presentation', 'performance')
    
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
    
    // Get the highest-scored content from each category
    const allContent = [
      ...recommendations.forTeachers.classroomActivities,
      ...recommendations.forParents.homeActivities,
      ...recommendations.forStudents.engagementHooks
    ].sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
    
    return {
      topRecommendation: allContent[0] || BEGIN_CONTENT_DATABASE[0],
      strengthActivity: recommendations.forTeachers.individualSupports[0] || BEGIN_CONTENT_DATABASE[1],
      growthActivity: recommendations.forTeachers.interventionResources[0] || BEGIN_CONTENT_DATABASE[2],
      familyActivity: recommendations.forParents.homeActivities[0] || BEGIN_CONTENT_DATABASE[3]
    }
  }
}

// Export singleton instance
export const beginContentService = new BeginContentRecommendationService()

// Export types
export type { ContentRecommendations, BeginContent }