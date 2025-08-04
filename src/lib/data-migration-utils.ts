/**
 * Data Migration and Population Utilities
 * Transform existing student data into enhanced structures
 */

import { createClient } from './supabase'
import { 
  EnhancedStudentProfile, 
  RiskFactor, 
  SeatingPreferences, 
  ParentInsight,
  SixCScores,
  LearningStyle 
} from './types-enhanced'
import { StudentCardData } from './student-card-data'
import { RiskAssessmentEngine, ClassroomAnalyticsEngine } from './analytics-utils'

export class DataMigrationEngine {
  /**
   * Migrate existing student card data to enhanced profile structure
   */
  static async migrateStudentCardData(
    studentCards: StudentCardData[],
    classroomId: string
  ): Promise<{
    success: boolean;
    migrated_count: number;
    errors: string[];
  }> {
    const supabase = createClient()
    if (!supabase) {
      return { success: false, migrated_count: 0, errors: ['Database not configured'] }
    }

    const errors: string[] = []
    let migratedCount = 0

    for (const card of studentCards) {
      try {
        // Create base profile if it doesn't exist
        const baseProfile = await this.createOrUpdateBaseProfile(card)
        if (!baseProfile) {
          errors.push(`Failed to create base profile for ${card.child_name}`)
          continue
        }

        // Create enhanced profile
        const enhancedProfile = await this.createEnhancedProfile(card, baseProfile.id, classroomId)
        if (!enhancedProfile) {
          errors.push(`Failed to create enhanced profile for ${card.child_name}`)
          continue
        }

        // Generate and save risk factors
        await this.generateAndSaveRiskFactors(card, enhancedProfile.id)

        // Generate and save parent insights
        await this.generateAndSaveParentInsights(card, enhancedProfile.id)

        // Generate initial progress entries
        await this.generateInitialProgress(card, enhancedProfile.id)

        migratedCount++
      } catch (error) {
        console.error(`Error migrating ${card.child_name}:`, error)
        errors.push(`Migration failed for ${card.child_name}: ${error}`)
      }
    }

    return {
      success: errors.length === 0,
      migrated_count: migratedCount,
      errors
    }
  }

  /**
   * Generate realistic demo data for a classroom
   */
  static async generateDemoClassroomData(
    classroomId: string,
    studentCount: number = 24
  ): Promise<{
    success: boolean;
    students: EnhancedStudentProfile[];
    analytics: any;
  }> {
    const supabase = createClient()
    if (!supabase) {
      return { success: false, students: [], analytics: null }
    }

    // Generate diverse student profiles
    const demoStudents = this.generateDemoStudentProfiles(studentCount)
    
    // Migrate each demo student
    const migrationResult = await this.migrateStudentCardData(demoStudents, classroomId)
    
    if (!migrationResult.success) {
      return { success: false, students: [], analytics: null }
    }

    // Fetch the created enhanced profiles
    const { data: enhancedProfiles } = await supabase
      .from('enhanced_student_profiles')
      .select(`
        *,
        profiles:profile_id (
          id,
          child_name,
          grade,
          personality_label,
          scores,
          created_at
        ),
        student_risk_factors (
          id,
          risk_type,
          severity,
          description,
          indicators,
          intervention_strategies,
          timeline,
          status
        ),
        parent_insights (
          id,
          category,
          insight,
          relevance_score,
          communication_strategies,
          talking_points
        ),
        student_progress (
          id,
          date_recorded,
          metric_type,
          metric_name,
          value,
          max_value,
          notes,
          context
        )
      `)
      .eq('classroom_id', classroomId)

    // Transform to enhanced student profiles
    const students = this.transformToEnhancedProfiles(enhancedProfiles || [])

    // Generate analytics
    const analytics = ClassroomAnalyticsEngine.calculateClassroomInsights(students)

    return {
      success: true,
      students,
      analytics
    }
  }

  /**
   * Create or update base profile from student card data
   */
  private static async createOrUpdateBaseProfile(card: StudentCardData): Promise<any> {
    const supabase = createClient()
    if (!supabase) return null

    const shareToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    
    const profileData = {
      child_name: card.child_name,
      grade: card.assessment_results?.grade_level || '3rd Grade',
      responses: this.generateRealisticResponses(),
      scores: card.assessment_results?.scores || this.generateScoresFromStyle(card.learning_style),
      personality_label: `${card.learning_style} Learner`,
      description: this.generateProfileDescription(card),
      is_public: true,
      share_token: shareToken
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating base profile:', error)
      return null
    }

    return data
  }

  /**
   * Create enhanced profile from student card data
   */
  private static async createEnhancedProfile(
    card: StudentCardData,
    profileId: string,
    classroomId: string
  ): Promise<any> {
    const supabase = createClient()
    if (!supabase) return null

    const sixCScores = this.extractSixCScores(card)
    const seatingPreferences = this.generateSeatingPreferences(card)
    const teachingCompatibility = this.generateTeachingCompatibility(card)

    const enhancedData = {
      profile_id: profileId,
      classroom_id: classroomId,
      communication_score: sixCScores.communication,
      collaboration_score: sixCScores.collaboration,
      content_score: sixCScores.content,
      critical_thinking_score: sixCScores.critical_thinking,
      creative_innovation_score: sixCScores.creative_innovation,
      confidence_score: sixCScores.confidence,
      engagement_level: this.generateEngagementLevel(card),
      participation_frequency: this.generateParticipationFrequency(card),
      peer_interaction_quality: this.generatePeerInteractionQuality(card),
      seating_preferences: seatingPreferences,
      teaching_compatibility: teachingCompatibility
    }

    const { data, error } = await supabase
      .from('enhanced_student_profiles')
      .insert(enhancedData)
      .select()
      .single()

    if (error) {
      console.error('Error creating enhanced profile:', error)
      return null
    }

    return data
  }

  /**
   * Generate and save risk factors for a student
   */
  private static async generateAndSaveRiskFactors(card: StudentCardData, studentProfileId: string): Promise<void> {
    const supabase = createClient()
    if (!supabase) return

    const riskFactors = this.generateRiskFactorsFromCard(card)
    
    if (riskFactors.length === 0) return

    const riskFactorInserts = riskFactors.map(rf => ({
      student_profile_id: studentProfileId,
      risk_type: rf.type,
      severity: rf.severity,
      description: rf.description,
      indicators: rf.indicators,
      intervention_strategies: rf.intervention_strategies,
      timeline: rf.timeline,
      status: 'active',
      next_review_date: this.calculateNextReviewDate(rf.severity)
    }))

    const { error } = await supabase
      .from('student_risk_factors')
      .insert(riskFactorInserts)

    if (error) {
      console.error('Error saving risk factors:', error)
    }
  }

  /**
   * Generate and save parent insights
   */
  private static async generateAndSaveParentInsights(card: StudentCardData, studentProfileId: string): Promise<void> {
    const supabase = createClient()
    if (!supabase) return

    const insights = this.generateParentInsightsFromCard(card)

    const insightInserts = insights.map(insight => ({
      student_profile_id: studentProfileId,
      category: insight.category,
      insight: insight.insight,
      relevance_score: insight.relevance_score,
      communication_strategies: insight.communication_strategies,
      talking_points: insight.talking_points
    }))

    const { error } = await supabase
      .from('parent_insights')
      .insert(insightInserts)

    if (error) {
      console.error('Error saving parent insights:', error)
    }
  }

  /**
   * Generate initial progress entries
   */
  private static async generateInitialProgress(card: StudentCardData, studentProfileId: string): Promise<void> {
    const supabase = createClient()
    if (!supabase) return

    const progressEntries = this.generateInitialProgressEntries(card)

    const progressInserts = progressEntries.map(entry => ({
      student_profile_id: studentProfileId,
      date_recorded: entry.date,
      metric_type: entry.metric_type,
      metric_name: entry.metric_name,
      value: entry.value,
      max_value: entry.max_value,
      notes: entry.notes,
      context: entry.context
    }))

    const { error } = await supabase
      .from('student_progress')
      .insert(progressInserts)

    if (error) {
      console.error('Error saving progress entries:', error)
    }
  }

  // Helper methods for data generation

  private static generateDemoStudentProfiles(count: number): StudentCardData[] {
    const names = [
      'Emma Thompson', 'Liam Wilson', 'Sofia Martinez', 'Aiden Johnson',
      'Maya Chen', 'Marcus Brown', 'Zoe Anderson', 'Carlos Rodriguez',
      'Ava Taylor', 'Noah Miller', 'Ryan Foster', 'Chloe Wright',
      'Tyler Hayes', 'Sophia Lee', 'Mason Clark', 'Isabella Davis',
      'Ethan Garcia', 'Lily Patel', 'Jordan Kim', 'Alex Rivera',
      'Grace O\'Connor', 'Dylan Murphy', 'Nora Singh', 'Caleb Zhang'
    ]

    const emails = names.map(name => 
      `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1].toLowerCase()}@email.com`
    )

    const styles: LearningStyle[] = ['creative', 'analytical', 'collaborative', 'confident']
    const grades = ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade']

    return Array.from({ length: count }, (_, i) => {
      const name = names[i % names.length]
      const style = styles[Math.floor(Math.random() * styles.length)]
      
      return {
        id: i + 1,
        child_name: i < names.length ? name : `${name} ${i + 1}`,
        parent_email: i < emails.length ? emails[i] : `parent${i + 1}@email.com`,
        learning_style: this.capitalizeFirst(style) as any,
        strengths: this.generateStrengthsForStyle(style),
        challenges: this.generateChallengesForStyle(style),
        quick_wins: this.generateQuickWinsForStyle(style),
        parent_insight: this.generateParentInsightForStyle(style, name),
        emergency_backup: this.generateEmergencyBackupForStyle(style),
        assessment_results: {
          id: i + 100,
          personality_label: `${this.capitalizeFirst(style)} Learner`,
          scores: this.generateScoresFromStyle(this.capitalizeFirst(style) as any),
          grade_level: grades[Math.floor(Math.random() * grades.length)]
        }
      }
    })
  }

  private static generateScoresFromStyle(style: string): Record<string, number> {
    const baseScores = {
      Communication: 3,
      Collaboration: 3,
      Content: 3,
      'Critical Thinking': 3,
      'Creative Innovation': 3,
      Confidence: 3
    }

    // Adjust based on learning style
    switch (style.toLowerCase()) {
      case 'creative':
        baseScores['Creative Innovation'] = 4 + Math.floor(Math.random() * 2)
        baseScores['Communication'] = 3 + Math.floor(Math.random() * 2)
        break
      case 'analytical':
        baseScores['Critical Thinking'] = 4 + Math.floor(Math.random() * 2)
        baseScores['Content'] = 3 + Math.floor(Math.random() * 2)
        break
      case 'collaborative':
        baseScores['Collaboration'] = 4 + Math.floor(Math.random() * 2)
        baseScores['Communication'] = 3 + Math.floor(Math.random() * 2)
        break
      case 'confident':
        baseScores['Confidence'] = 4 + Math.floor(Math.random() * 2)
        baseScores['Communication'] = 3 + Math.floor(Math.random() * 2)
        break
    }

    // Add some randomness to other scores
    Object.keys(baseScores).forEach(key => {
      if (baseScores[key] === 3) {
        baseScores[key] += Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
        baseScores[key] = Math.max(1, Math.min(5, baseScores[key]))
      }
    })

    return baseScores
  }

  private static extractSixCScores(card: StudentCardData): SixCScores {
    const scores = card.assessment_results?.scores || {}
    return {
      communication: scores['Communication'] || 3,
      collaboration: scores['Collaboration'] || 3,
      content: scores['Content'] || 3,
      critical_thinking: scores['Critical Thinking'] || 3,
      creative_innovation: scores['Creative Innovation'] || 3,
      confidence: scores['Confidence'] || 3
    }
  }

  private static generateSeatingPreferences(card: StudentCardData): SeatingPreferences {
    const style = card.learning_style.toLowerCase()
    
    const preferences: SeatingPreferences = {
      preferred_group_size: 4,
      collaboration_comfort: 'medium',
      focus_requirements: 'moderate',
      energy_level: 'medium',
      peer_interactions: 'collaborator',
      proximity_needs: 'flexible'
    }

    switch (style) {
      case 'creative':
        preferences.preferred_group_size = 3 + Math.floor(Math.random() * 3)
        preferences.focus_requirements = 'stimulating'
        preferences.energy_level = 'high'
        break
      case 'analytical':
        preferences.preferred_group_size = 2 + Math.floor(Math.random() * 2)
        preferences.focus_requirements = 'quiet'
        preferences.collaboration_comfort = 'low'
        preferences.proximity_needs = 'close_to_teacher'
        break
      case 'collaborative':
        preferences.preferred_group_size = 4 + Math.floor(Math.random() * 3)
        preferences.collaboration_comfort = 'high'
        preferences.peer_interactions = 'leader'
        break
      case 'confident':
        preferences.preferred_group_size = 4 + Math.floor(Math.random() * 3)
        preferences.peer_interactions = 'leader'
        preferences.energy_level = 'high'
        break
    }

    return preferences
  }

  private static generateTeachingCompatibility(card: StudentCardData): any {
    const style = card.learning_style.toLowerCase()
    const baseScore = 6 + Math.floor(Math.random() * 3)

    const compatibility = {
      default_teaching_approach: 'mixed',
      compatibility_score: baseScore,
      adaptation_strategies: [],
      success_indicators: [],
      warning_signs: []
    }

    switch (style) {
      case 'creative':
        compatibility.adaptation_strategies = [
          'Provide open-ended assignments',
          'Allow creative expression in responses',
          'Use visual and artistic elements'
        ]
        compatibility.success_indicators = [
          'Engaged during creative activities',
          'Generates unique solutions',
          'Shows enthusiasm for projects'
        ]
        break
      case 'analytical':
        compatibility.adaptation_strategies = [
          'Provide clear step-by-step instructions',
          'Use logical sequencing',
          'Explain reasoning behind concepts'
        ]
        compatibility.success_indicators = [
          'Asks detailed questions',
          'Follows procedures accurately',
          'Shows deep understanding'
        ]
        break
      case 'collaborative':
        compatibility.adaptation_strategies = [
          'Incorporate group work regularly',
          'Use discussion-based learning',
          'Provide peer interaction opportunities'
        ]
        compatibility.success_indicators = [
          'Actively participates in groups',
          'Helps facilitate discussions',
          'Learns well from peers'
        ]
        break
      case 'confident':
        compatibility.adaptation_strategies = [
          'Provide leadership opportunities',
          'Offer challenging extensions',
          'Use student as peer helper'
        ]
        compatibility.success_indicators = [
          'Takes initiative in activities',
          'Helps motivate classmates',
          'Thrives with responsibility'
        ]
        break
    }

    return compatibility
  }

  private static generateRiskFactorsFromCard(card: StudentCardData): RiskFactor[] {
    const risks: RiskFactor[] = []
    
    // Generate realistic risk factors based on challenges
    if (card.challenges.some(c => c.includes('rigid') || c.includes('structured'))) {
      risks.push({
        id: `risk-${Date.now()}-1`,
        type: 'learning_style_mismatch',
        severity: Math.random() > 0.7 ? 'medium' : 'low',
        description: 'May struggle with highly structured activities that don\'t match learning style',
        indicators: [
          'Shows decreased engagement with rigid tasks',
          'Performs better with flexible approaches'
        ],
        intervention_strategies: [
          'Provide alternative ways to demonstrate learning',
          'Offer choices in assignment completion'
        ],
        timeline: 'short_term'
      })
    }

    if (card.challenges.some(c => c.includes('anxious') || c.includes('overwhelmed'))) {
      risks.push({
        id: `risk-${Date.now()}-2`,
        type: 'low_engagement',
        severity: 'medium',
        description: 'May become overwhelmed by complex or open-ended tasks',
        indicators: [
          'Shows anxiety with new or complex tasks',
          'May shut down when overwhelmed'
        ],
        intervention_strategies: [
          'Break tasks into smaller steps',
          'Provide additional scaffolding and support'
        ],
        timeline: 'immediate'
      })
    }

    // Randomly add some risk factors for demo purposes
    if (Math.random() > 0.8) {
      risks.push({
        id: `risk-${Date.now()}-3`,
        type: 'social_isolation',
        severity: 'low',
        description: 'Occasionally prefers independent work over group activities',
        indicators: [
          'Sometimes chooses to work alone',
          'May need encouragement to join groups'
        ],
        intervention_strategies: [
          'Pair with compatible classmates',
          'Provide structured social opportunities'
        ],
        timeline: 'ongoing'
      })
    }

    return risks
  }

  private static generateParentInsightsFromCard(card: StudentCardData): ParentInsight[] {
    return [{
      id: `insight-${Date.now()}`,
      category: 'home_behavior',
      insight: card.parent_insight,
      relevance_score: 8 + Math.floor(Math.random() * 3),
      communication_strategies: [
        'Share specific examples of classroom successes',
        'Discuss learning style preferences',
        'Collaborate on home-school consistency'
      ],
      talking_points: [
        `${card.child_name}'s ${card.learning_style.toLowerCase()} learning style`,
        'Strategies that work well at school',
        'Ways to support learning at home'
      ]
    }]
  }

  private static generateInitialProgressEntries(card: StudentCardData): any[] {
    const entries: any[] = []
    const sixCScores = this.extractSixCScores(card)
    const today = new Date()

    Object.entries(sixCScores).forEach(([metric, score]) => {
      // Create a few historical data points
      for (let i = 0; i < 3; i++) {
        const date = new Date(today.getTime() - (i * 7 * 24 * 60 * 60 * 1000)) // Weekly intervals
        const variation = (Math.random() - 0.5) * 0.5 // Small random variation
        const value = Math.max(1, Math.min(5, score + variation))

        entries.push({
          date: date.toISOString().split('T')[0],
          metric_type: 'six_c_score',
          metric_name: metric.replace('_', ' '),
          value: value,
          max_value: 5,
          notes: this.generateProgressNote(metric, value),
          context: 'Initial assessment period'
        })
      }
    })

    return entries
  }

  // Utility helper methods
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private static generateStrengthsForStyle(style: string): string[] {
    const strengthsMap: Record<string, string[]> = {
      creative: [
        'Generates unique solutions to problems',
        'Expresses ideas through art and stories',
        'Thinks outside the box during brainstorming'
      ],
      analytical: [
        'Breaks down complex problems systematically',
        'Identifies patterns and logical sequences',
        'Asks detailed questions to understand fully'
      ],
      collaborative: [
        'Facilitates group discussions effectively',
        'Listens actively and incorporates others\' ideas',
        'Creates inclusive environments for all'
      ],
      confident: [
        'Volunteers to lead projects and presentations',
        'Takes on challenges without fear of mistakes',
        'Helps classmates feel more confident'
      ]
    }
    
    return strengthsMap[style] || []
  }

  private static generateChallengesForStyle(style: string): string[] {
    const challengesMap: Record<string, string[]> = {
      creative: [
        'May struggle with rigid timelines',
        'Might resist structured activities with only one solution'
      ],
      analytical: [
        'May become overwhelmed by open-ended tasks',
        'Might struggle with quick decision-making'
      ],
      collaborative: [
        'May feel anxious during independent work',
        'Might talk too much during quiet time'
      ],
      confident: [
        'May appear overconfident at times',
        'Might take on too much responsibility'
      ]
    }
    
    return challengesMap[style] || []
  }

  private static generateQuickWinsForStyle(style: string): string[] {
    const winsMap: Record<string, string[]> = {
      creative: [
        'Allow creative choices in assignments',
        'Use storytelling to introduce concepts',
        'Incorporate visual and artistic elements'
      ],
      analytical: [
        'Provide clear step-by-step instructions',
        'Use graphic organizers',
        'Explain the reasoning behind procedures'
      ],
      collaborative: [
        'Use think-pair-share strategies',
        'Create small group opportunities',
        'Allow discussion before individual work'
      ],
      confident: [
        'Give leadership roles and responsibilities',
        'Offer challenging extension activities',
        'Let them present to the class'
      ]
    }
    
    return winsMap[style] || []
  }

  private static generateParentInsightForStyle(style: string, name: string): string {
    const insights: Record<string, string[]> = {
      creative: [
        `${name} comes up with the most creative games and stories at home.`,
        `${name} loves to draw and create. When stuck on homework, I let them create something related first.`,
        `${name} sees connections everywhere and turns everything into a story.`
      ],
      analytical: [
        `${name} asks 'why' about everything and loves to understand how things work.`,
        `${name} organizes their room by color and category. They work best with clear expectations.`,
        `${name} loves puzzles and gets frustrated when instructions aren't clear.`
      ],
      collaborative: [
        `${name} is always organizing playdates and group activities.`,
        `${name} naturally includes everyone and makes sure no one feels left out.`,
        `${name} loves to teach their siblings what they learned at school.`
      ],
      confident: [
        `${name} takes on leadership roles naturally and isn't afraid to try new things.`,
        `${name} speaks up for themselves and others when needed.`,
        `${name} bounces back quickly from mistakes and encourages friends.`
      ]
    }
    
    const styleInsights = insights[style] || [`${name} is a wonderful learner.`]
    return styleInsights[Math.floor(Math.random() * styleInsights.length)]
  }

  private static generateEmergencyBackupForStyle(style: string): string {
    const backups: Record<string, string[]> = {
      creative: [
        'Offer a creative alternative approach',
        'Give them choice between 2-3 options',
        'Allow them to work with a partner'
      ],
      analytical: [
        'Break the task into smaller steps',
        'Provide a model or example',
        'Give extra processing time'
      ],
      collaborative: [
        'Move them near a supportive peer',
        'Allow quiet discussion',
        'Give them a group leadership role'
      ],
      confident: [
        'Give them a special challenge',
        'Ask them to help a classmate',
        'Channel their energy into leadership'
      ]
    }
    
    const styleBackups = backups[style] || ['Check in individually']
    return styleBackups[Math.floor(Math.random() * styleBackups.length)]
  }

  private static generateRealisticResponses(): Record<number, number> {
    const responses: Record<number, number> = {}
    
    // Generate responses for a typical 20-question assessment
    for (let i = 1; i <= 20; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1 // 1-5 scale
    }
    
    return responses
  }

  private static generateProfileDescription(card: StudentCardData): string {
    return `${card.child_name} is a ${card.learning_style.toLowerCase()} learner who ${card.strengths[0]?.toLowerCase() || 'shows great potential'}. They thrive when given opportunities that align with their natural ${card.learning_style.toLowerCase()} approach to learning.`
  }

  private static generateEngagementLevel(card: StudentCardData): number {
    // Base engagement on learning style and randomize slightly
    const baseEngagement = {
      'Creative': 4,
      'Analytical': 3,
      'Collaborative': 4,
      'Confident': 4
    }
    
    const base = baseEngagement[card.learning_style] || 3
    return Math.max(1, Math.min(5, base + Math.floor(Math.random() * 3) - 1))
  }

  private static generateParticipationFrequency(card: StudentCardData): number {
    const baseParticipation = {
      'Creative': 3,
      'Analytical': 3,
      'Collaborative': 5,
      'Confident': 5
    }
    
    const base = baseParticipation[card.learning_style] || 3
    return Math.max(1, Math.min(5, base + Math.floor(Math.random() * 2) - 1))
  }

  private static generatePeerInteractionQuality(card: StudentCardData): number {
    const baseInteraction = {
      'Creative': 3,
      'Analytical': 2,
      'Collaborative': 5,
      'Confident': 4
    }
    
    const base = baseInteraction[card.learning_style] || 3
    return Math.max(1, Math.min(5, base + Math.floor(Math.random() * 2)))
  }

  private static calculateNextReviewDate(severity: string): string {
    const now = new Date()
    const daysToAdd = severity === 'high' ? 7 : severity === 'medium' ? 14 : 21
    const reviewDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
    return reviewDate.toISOString()
  }

  private static generateProgressNote(metric: string, value: number): string {
    const notes = {
      communication: value >= 4 ? 'Strong verbal and written expression' : value >= 3 ? 'Clear communication with support' : 'Developing communication skills',
      collaboration: value >= 4 ? 'Excellent teamwork and cooperation' : value >= 3 ? 'Works well with others' : 'Learning to collaborate effectively',
      content: value >= 4 ? 'Strong grasp of academic content' : value >= 3 ? 'Solid understanding with practice' : 'Building content knowledge',
      critical_thinking: value >= 4 ? 'Excellent analysis and reasoning' : value >= 3 ? 'Good problem-solving skills' : 'Developing thinking skills',
      creative_innovation: value >= 4 ? 'Highly creative and innovative' : value >= 3 ? 'Shows creative thinking' : 'Growing creative abilities',
      confidence: value >= 4 ? 'Very self-assured and positive' : value >= 3 ? 'Good self-confidence' : 'Building self-assurance'
    }
    
    return notes[metric as keyof typeof notes] || 'Making progress'
  }

  private static transformToEnhancedProfiles(data: any[]): EnhancedStudentProfile[] {
    return data.map(student => {
      const profile = student.profiles
      return {
        id: student.id,
        name: profile.child_name,
        grade: profile.grade,
        classroom_id: student.classroom_id,
        learning_style: this.getLearningStyleFromLabel(profile.personality_label),
        six_c_scores: {
          communication: student.communication_score,
          collaboration: student.collaboration_score,
          content: student.content_score,
          critical_thinking: student.critical_thinking_score,
          creative_innovation: student.creative_innovation_score,
          confidence: student.confidence_score
        },
        risk_factors: (student.student_risk_factors || []).map((rf: any) => ({
          id: rf.id,
          type: rf.risk_type,
          severity: rf.severity,
          description: rf.description,
          indicators: rf.indicators || [],
          intervention_strategies: rf.intervention_strategies || [],
          timeline: rf.timeline
        })),
        seating_preferences: student.seating_preferences || {},
        parent_insights: (student.parent_insights || []).map((pi: any) => ({
          id: pi.id,
          category: pi.category,
          insight: pi.insight,
          relevance_score: pi.relevance_score,
          communication_strategies: pi.communication_strategies || [],
          talking_points: pi.talking_points || []
        })),
        progress_timeline: (student.student_progress || []).map((pd: any) => ({
          id: pd.id,
          date: pd.date_recorded,
          metric_type: pd.metric_type,
          metric_name: pd.metric_name,
          value: parseFloat(pd.value.toString()),
          max_value: parseFloat(pd.max_value.toString()),
          notes: pd.notes,
          context: pd.context
        })),
        created_at: student.created_at,
        updated_at: student.updated_at,
        last_assessment_date: student.last_assessment_date,
        teaching_style_compatibility: student.teaching_compatibility || {},
        engagement_level: student.engagement_level,
        participation_frequency: student.participation_frequency,
        peer_interaction_quality: student.peer_interaction_quality
      }
    })
  }

  private static getLearningStyleFromLabel(label: string): LearningStyle {
    if (label.toLowerCase().includes('creative')) return 'creative'
    if (label.toLowerCase().includes('analytical')) return 'analytical'
    if (label.toLowerCase().includes('collaborative')) return 'collaborative'
    if (label.toLowerCase().includes('confident')) return 'confident'
    return 'creative'
  }
}