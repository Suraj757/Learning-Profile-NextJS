/**
 * Analytics and Risk Prediction Utilities
 * Advanced algorithms for classroom analytics and student risk assessment
 */

import { 
  EnhancedStudentProfile, 
  RiskFactor, 
  RiskPredictionInput, 
  LearningStyle,
  SixCScores,
  ClassroomOverview,
  AtRiskAnalysis
} from './types-enhanced'

// Risk Assessment Algorithms
export class RiskAssessmentEngine {
  /**
   * Predict risk factors for a student based on their profile and behavior data
   */
  static predictRiskFactors(
    student: EnhancedStudentProfile,
    classroomAverage: SixCScores,
    historicalData?: any[]
  ): RiskFactor[] {
    const risks: RiskFactor[] = []

    // Learning Style Mismatch Risk
    const learningStyleRisk = this.assessLearningStyleMismatch(student)
    if (learningStyleRisk) risks.push(learningStyleRisk)

    // Low Engagement Risk
    const engagementRisk = this.assessEngagementRisk(student, classroomAverage)
    if (engagementRisk) risks.push(engagementRisk)

    // Social Isolation Risk
    const socialRisk = this.assessSocialIsolationRisk(student)
    if (socialRisk) risks.push(socialRisk)

    // Academic Struggle Risk
    const academicRisk = this.assessAcademicStruggleRisk(student, classroomAverage)
    if (academicRisk) risks.push(academicRisk)

    // Sort by severity
    return risks.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  private static assessLearningStyleMismatch(student: EnhancedStudentProfile): RiskFactor | null {
    const { teaching_style_compatibility } = student
    
    if (!teaching_style_compatibility || teaching_style_compatibility.compatibility_score >= 7) {
      return null
    }

    const severity = teaching_style_compatibility.compatibility_score < 4 ? 'high' : 
                    teaching_style_compatibility.compatibility_score < 6 ? 'medium' : 'low'

    return {
      id: `learning-mismatch-${student.id}`,
      type: 'learning_style_mismatch',
      severity: severity as any,
      description: `${student.learning_style} learning style may not align well with current teaching approach`,
      indicators: [
        'Lower engagement during certain activity types',
        'Struggles with default instructional methods',
        'Shows different performance across teaching styles'
      ],
      intervention_strategies: this.getLearningStyleInterventions(student.learning_style),
      timeline: severity === 'high' ? 'immediate' : 'short_term'
    }
  }

  private static assessEngagementRisk(student: EnhancedStudentProfile, classroomAverage: SixCScores): RiskFactor | null {
    const engagementThreshold = 2.5
    const participationThreshold = 2.5

    if (student.engagement_level > engagementThreshold && student.participation_frequency > participationThreshold) {
      return null
    }

    const severity = (student.engagement_level <= 2 || student.participation_frequency <= 2) ? 'high' :
                    (student.engagement_level <= 2.5 || student.participation_frequency <= 2.5) ? 'medium' : 'low'

    return {
      id: `engagement-${student.id}`,
      type: 'low_engagement',
      severity: severity as any,
      description: 'Student showing signs of disengagement from classroom activities',
      indicators: [
        `Engagement level: ${student.engagement_level}/5`,
        `Participation frequency: ${student.participation_frequency}/5`,
        'May appear distracted or uninterested',
        'Limited voluntary participation'
      ],
      intervention_strategies: [
        'Incorporate student interests into lessons',
        'Provide choice in learning activities',
        'Use interactive and hands-on approaches',
        'Set achievable short-term goals',
        'Offer frequent positive reinforcement'
      ],
      timeline: severity === 'high' ? 'immediate' : 'short_term'
    }
  }

  private static assessSocialIsolationRisk(student: EnhancedStudentProfile): RiskFactor | null {
    const peerInteractionThreshold = 2.5
    const collaborationThreshold = 2

    if (student.peer_interaction_quality > peerInteractionThreshold && 
        student.six_c_scores.collaboration > collaborationThreshold) {
      return null
    }

    const severity = (student.peer_interaction_quality <= 2 || student.six_c_scores.collaboration <= 1) ? 'high' :
                    (student.peer_interaction_quality <= 2.5 || student.six_c_scores.collaboration <= 2) ? 'medium' : 'low'

    // Exception: Analytical learners may naturally have lower collaboration scores
    if (student.learning_style === 'analytical' && severity === 'medium') {
      return null // This might be normal for their learning style
    }

    return {
      id: `social-isolation-${student.id}`,
      type: 'social_isolation',
      severity: severity as any,
      description: 'Student may be experiencing social isolation or difficulty connecting with peers',
      indicators: [
        `Peer interaction quality: ${student.peer_interaction_quality}/5`,
        `Collaboration score: ${student.six_c_scores.collaboration}/5`,
        'Limited peer relationships',
        'Reluctance to participate in group activities',
        'May work alone even when group work is encouraged'
      ],
      intervention_strategies: [
        'Facilitate structured peer interactions',
        'Assign compatible group partners',
        'Use peer buddy systems',
        'Teach social skills explicitly',
        'Create opportunities for shared interests',
        'Provide social scripts for common interactions'
      ],
      timeline: 'ongoing'
    }
  }

  private static assessAcademicStruggleRisk(student: EnhancedStudentProfile, classroomAverage: SixCScores): RiskFactor | null {
    const overallAverage = (
      student.six_c_scores.communication +
      student.six_c_scores.content +
      student.six_c_scores.critical_thinking
    ) / 3

    const classroomOverallAverage = (
      classroomAverage.communication +
      classroomAverage.content +
      classroomAverage.critical_thinking
    ) / 3

    // Check if significantly below classroom average
    const performanceGap = classroomOverallAverage - overallAverage
    
    if (performanceGap < 0.5) return null

    const severity = performanceGap > 1.5 ? 'high' : performanceGap > 1 ? 'medium' : 'low'

    // Check for declining trends in progress timeline
    const recentProgress = student.progress_timeline.slice(0, 5)
    const decliningTrend = this.checkForDecliningTrend(recentProgress)

    return {
      id: `academic-struggle-${student.id}`,
      type: 'academic_struggle',
      severity: (decliningTrend && severity !== 'low') ? 'high' : severity as any,
      description: 'Student may be struggling to keep up with academic expectations',
      indicators: [
        `Overall academic performance below classroom average`,
        `Performance gap: ${performanceGap.toFixed(1)} points`,
        decliningTrend ? 'Declining progress trend observed' : 'Consistent performance concerns',
        'May need additional scaffolding or support'
      ],
      intervention_strategies: [
        'Provide additional scaffolding for complex concepts',
        'Break down assignments into smaller steps',
        'Use multi-sensory learning approaches',
        'Offer additional practice opportunities',
        'Consider peer tutoring or mentoring',
        'Collaborate with specialized support staff if needed'
      ],
      timeline: severity === 'high' ? 'immediate' : 'short_term'
    }
  }

  private static checkForDecliningTrend(progressData: any[]): boolean {
    if (progressData.length < 3) return false

    const scores = progressData.map(p => p.value / p.max_value).slice(0, 3)
    return scores[0] < scores[1] && scores[1] < scores[2]
  }

  private static getLearningStyleInterventions(learningStyle: LearningStyle): string[] {
    const interventions = {
      creative: [
        'Provide open-ended projects and creative choices',
        'Use arts integration and visual representations',
        'Allow for multiple solution pathways',
        'Incorporate storytelling and imagination',
        'Offer flexible deadlines when possible'
      ],
      analytical: [
        'Provide clear, step-by-step instructions',
        'Use graphic organizers and structured frameworks',
        'Explain the reasoning behind procedures',
        'Offer additional processing time',
        'Use data and concrete examples'
      ],
      collaborative: [
        'Incorporate regular group work and discussions',
        'Use think-pair-share strategies',
        'Provide peer learning opportunities',
        'Allow for collaborative problem-solving',
        'Create structured social interactions'
      ],
      confident: [
        'Provide leadership and mentoring opportunities',
        'Offer challenging extension activities',
        'Use student as peer helper or tutor',
        'Encourage goal-setting and self-advocacy',
        'Provide presentation and sharing opportunities'
      ]
    }

    return interventions[learningStyle] || []
  }
}

// Classroom Analytics Engine
export class ClassroomAnalyticsEngine {
  /**
   * Calculate comprehensive classroom analytics
   */
  static calculateClassroomInsights(
    students: EnhancedStudentProfile[],
    historicalData?: any[]
  ): {
    learningStyleOptimization: any;
    engagementAnalysis: any;
    riskDistribution: any;
    teachingRecommendations: string[];
  } {
    return {
      learningStyleOptimization: this.analyzeLearningStyleDistribution(students),
      engagementAnalysis: this.analyzeEngagementPatterns(students),
      riskDistribution: this.analyzeRiskDistribution(students),
      teachingRecommendations: this.generateTeachingRecommendations(students)
    }
  }

  private static analyzeLearningStyleDistribution(students: EnhancedStudentProfile[]) {
    const distribution = students.reduce((acc, student) => {
      acc[student.learning_style] = (acc[student.learning_style] || 0) + 1
      return acc
    }, {} as Record<LearningStyle, number>)

    const total = students.length
    const percentages = Object.entries(distribution).map(([style, count]) => ({
      style,
      count,
      percentage: Math.round((count / total) * 100)
    }))

    // Find dominant and underrepresented styles
    const dominant = percentages.find(p => p.percentage > 40)
    const underrepresented = percentages.filter(p => p.percentage < 15)

    return {
      distribution: percentages,
      dominant_style: dominant?.style,
      underrepresented_styles: underrepresented.map(u => u.style),
      recommendations: this.getStyleDistributionRecommendations(percentages)
    }
  }

  private static analyzeEngagementPatterns(students: EnhancedStudentProfile[]) {
    const avgEngagement = students.reduce((sum, s) => sum + s.engagement_level, 0) / students.length
    const avgParticipation = students.reduce((sum, s) => sum + s.participation_frequency, 0) / students.length

    const lowEngagement = students.filter(s => s.engagement_level <= 2).length
    const highEngagement = students.filter(s => s.engagement_level >= 4).length

    const engagementByStyle = students.reduce((acc, student) => {
      if (!acc[student.learning_style]) {
        acc[student.learning_style] = { total: 0, count: 0 }
      }
      acc[student.learning_style].total += student.engagement_level
      acc[student.learning_style].count += 1
      return acc
    }, {} as Record<LearningStyle, { total: number; count: number }>)

    const styleEngagementAverages = Object.entries(engagementByStyle).map(([style, data]) => ({
      style,
      average: data.total / data.count
    }))

    return {
      overall_engagement: avgEngagement,
      overall_participation: avgParticipation,
      low_engagement_count: lowEngagement,
      high_engagement_count: highEngagement,
      engagement_by_style: styleEngagementAverages,
      recommendations: this.getEngagementRecommendations(avgEngagement, styleEngagementAverages)
    }
  }

  private static analyzeRiskDistribution(students: EnhancedStudentProfile[]) {
    const riskCounts = students.reduce((acc, student) => {
      const highRisk = student.risk_factors.some(rf => rf.severity === 'high')
      const mediumRisk = student.risk_factors.some(rf => rf.severity === 'medium')
      
      if (highRisk) acc.high++
      else if (mediumRisk) acc.medium++
      else acc.low++
      
      return acc
    }, { high: 0, medium: 0, low: 0 })

    const riskByType = students.reduce((acc, student) => {
      student.risk_factors.forEach(rf => {
        acc[rf.type] = (acc[rf.type] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    return {
      risk_distribution: riskCounts,
      risk_types: riskByType,
      total_at_risk: riskCounts.high + riskCounts.medium,
      risk_percentage: Math.round(((riskCounts.high + riskCounts.medium) / students.length) * 100)
    }
  }

  private static generateTeachingRecommendations(students: EnhancedStudentProfile[]): string[] {
    const recommendations: string[] = []
    const analytics = this.calculateClassroomInsights(students)

    // Learning style recommendations
    if (analytics.learningStyleOptimization.dominant_style) {
      recommendations.push(
        `Consider incorporating more ${analytics.learningStyleOptimization.dominant_style} learning activities (${analytics.learningStyleOptimization.distribution.find(d => d.style === analytics.learningStyleOptimization.dominant_style)?.percentage}% of class)`
      )
    }

    // Engagement recommendations
    if (analytics.engagementAnalysis.overall_engagement < 3.5) {
      recommendations.push('Focus on increasing overall classroom engagement through varied instructional methods')
    }

    // Risk-based recommendations
    if (analytics.riskDistribution.risk_percentage > 20) {
      recommendations.push('Consider implementing classroom-wide support strategies due to higher risk percentage')
    }

    // Specific style-based recommendations
    const lowEngagementStyles = analytics.engagementAnalysis.engagement_by_style
      .filter(style => style.average < 3)
      .map(style => style.style)

    lowEngagementStyles.forEach(style => {
      recommendations.push(`Increase ${style} learning opportunities to boost engagement for this group`)
    })

    return recommendations
  }

  private static getStyleDistributionRecommendations(percentages: any[]): string[] {
    const recommendations: string[] = []
    
    percentages.forEach(({ style, percentage }) => {
      if (percentage > 40) {
        recommendations.push(`High ${style} population - ensure activities cater to this majority while supporting other styles`)
      } else if (percentage < 15 && percentage > 0) {
        recommendations.push(`Small ${style} group - ensure these students receive targeted support`)
      }
    })

    return recommendations
  }

  private static getEngagementRecommendations(avgEngagement: number, styleAverages: any[]): string[] {
    const recommendations: string[] = []

    if (avgEngagement < 3) {
      recommendations.push('Overall engagement is low - consider more interactive and varied teaching methods')
    }

    styleAverages
      .filter(style => style.average < 3)
      .forEach(style => {
        recommendations.push(`${style.style} learners showing low engagement - incorporate more ${style.style}-friendly activities`)
      })

    return recommendations
  }
}

// Seating Optimization Algorithms
export class SeatingOptimizationEngine {
  /**
   * Calculate optimal seating compatibility scores
   */
  static calculateCompatibilityMatrix(students: EnhancedStudentProfile[]): number[][] {
    const matrix: number[][] = []
    
    for (let i = 0; i < students.length; i++) {
      matrix[i] = []
      for (let j = 0; j < students.length; j++) {
        if (i === j) {
          matrix[i][j] = 0
        } else {
          matrix[i][j] = this.calculatePairCompatibility(students[i], students[j])
        }
      }
    }
    
    return matrix
  }

  private static calculatePairCompatibility(student1: EnhancedStudentProfile, student2: EnhancedStudentProfile): number {
    let compatibility = 5 // Base score

    // Learning style compatibility
    compatibility += this.getLearningStyleCompatibility(student1.learning_style, student2.learning_style)

    // 6C scores compatibility (complementary vs similar)
    compatibility += this.getSixCCompatibility(student1.six_c_scores, student2.six_c_scores)

    // Risk factor considerations
    compatibility += this.getRiskFactorCompatibility(student1.risk_factors, student2.risk_factors)

    // Energy and focus compatibility
    compatibility += this.getEnergyCompatibility(student1.seating_preferences, student2.seating_preferences)

    return Math.max(0, Math.min(10, compatibility))
  }

  private static getLearningStyleCompatibility(style1: LearningStyle, style2: LearningStyle): number {
    const compatibilityMap: Record<LearningStyle, Record<LearningStyle, number>> = {
      creative: { creative: 1, analytical: -1, collaborative: 2, confident: 1 },
      analytical: { creative: -1, analytical: 1, collaborative: 0, confident: 0 },
      collaborative: { creative: 2, analytical: 0, collaborative: 2, confident: 1 },
      confident: { creative: 1, analytical: 0, collaborative: 1, confident: 0 }
    }

    return compatibilityMap[style1]?.[style2] || 0
  }

  private static getSixCCompatibility(scores1: SixCScores, scores2: SixCScores): number {
    // Calculate if students are complementary (one strong where other is weak)
    let complementarity = 0
    const skills = ['communication', 'collaboration', 'content', 'critical_thinking', 'creative_innovation', 'confidence'] as const

    skills.forEach(skill => {
      const diff = Math.abs(scores1[skill] - scores2[skill])
      if (diff >= 2) {
        complementarity += 1 // Complementary skills can help each other
      } else if (diff <= 1 && scores1[skill] >= 4 && scores2[skill] >= 4) {
        complementarity += 0.5 // Both strong in same area
      }
    })

    return Math.min(2, complementarity)
  }

  private static getRiskFactorCompatibility(risks1: RiskFactor[], risks2: RiskFactor[]): number {
    const hasHighRisk1 = risks1.some(r => r.severity === 'high')
    const hasHighRisk2 = risks2.some(r => r.severity === 'high')
    const hasSocialRisk1 = risks1.some(r => r.type === 'social_isolation')
    const hasSocialRisk2 = risks2.some(r => r.type === 'social_isolation')

    // Don't pair two high-risk students
    if (hasHighRisk1 && hasHighRisk2) return -3

    // Pair socially isolated student with collaborative one
    if (hasSocialRisk1 && !hasSocialRisk2) return 2
    if (hasSocialRisk2 && !hasSocialRisk1) return 2

    return 0
  }

  private static getEnergyCompatibility(prefs1: any, prefs2: any): number {
    if (!prefs1 || !prefs2) return 0

    const energy1 = prefs1.energy_level || 'medium'
    const energy2 = prefs2.energy_level || 'medium'

    if (energy1 === energy2) return 1
    if ((energy1 === 'high' && energy2 === 'low') || (energy1 === 'low' && energy2 === 'high')) return -2
    return 0
  }
}

// Progress Tracking and Prediction
export class ProgressTrackingEngine {
  /**
   * Predict future performance based on current trends
   */
  static predictProgressTrends(student: EnhancedStudentProfile, weeks: number = 4): any {
    const progressData = student.progress_timeline
      .filter(p => p.metric_type === 'six_c_score')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10) // Last 10 data points

    if (progressData.length < 3) {
      return { prediction: 'insufficient_data', confidence: 0 }
    }

    const trends = this.calculateTrends(progressData)
    const predictions = this.extrapolateTrends(trends, weeks)

    return {
      current_trends: trends,
      predictions: predictions,
      confidence: this.calculateConfidence(progressData, trends),
      recommendations: this.generateProgressRecommendations(trends, student)
    }
  }

  private static calculateTrends(progressData: any[]): any {
    const metrics = ['communication', 'collaboration', 'content', 'critical_thinking', 'creative_innovation', 'confidence']
    const trends: any = {}

    metrics.forEach(metric => {
      const metricData = progressData
        .filter(p => p.metric_name.toLowerCase().includes(metric))
        .map(p => ({ date: new Date(p.date), value: p.value / p.max_value }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())

      if (metricData.length >= 3) {
        trends[metric] = this.calculateLinearTrend(metricData)
      }
    })

    return trends
  }

  private static calculateLinearTrend(data: { date: Date; value: number }[]): any {
    const n = data.length
    const sumX = data.reduce((sum, point, index) => sum + index, 0)
    const sumY = data.reduce((sum, point) => sum + point.value, 0)
    const sumXY = data.reduce((sum, point, index) => sum + index * point.value, 0)
    const sumXX = data.reduce((sum, point, index) => sum + index * index, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return {
      slope,
      intercept,
      direction: slope > 0.05 ? 'improving' : slope < -0.05 ? 'declining' : 'stable',
      strength: Math.abs(slope)
    }
  }

  private static extrapolateTrends(trends: any, weeks: number): any {
    const predictions: any = {}

    Object.entries(trends).forEach(([metric, trend]: [string, any]) => {
      const futureValue = trend.intercept + trend.slope * weeks
      predictions[metric] = {
        predicted_value: Math.max(0, Math.min(1, futureValue)),
        trend_direction: trend.direction,
        confidence: this.getTrendConfidence(trend)
      }
    })

    return predictions
  }

  private static calculateConfidence(data: any[], trends: any): number {
    // Simple confidence calculation based on data consistency and trend strength
    const dataConsistency = Math.min(1, data.length / 10)
    const trendStrength = Object.values(trends).reduce((avg: number, trend: any) => 
      avg + Math.min(1, trend.strength * 10), 0) / Object.keys(trends).length

    return Math.round((dataConsistency * 0.6 + trendStrength * 0.4) * 100)
  }

  private static getTrendConfidence(trend: any): number {
    return Math.min(100, Math.round(trend.strength * 100))
  }

  private static generateProgressRecommendations(trends: any, student: EnhancedStudentProfile): string[] {
    const recommendations: string[] = []

    Object.entries(trends).forEach(([metric, trend]: [string, any]) => {
      if (trend.direction === 'declining' && trend.strength > 0.1) {
        recommendations.push(`Focus on ${metric} - showing declining trend`)
      } else if (trend.direction === 'improving' && trend.strength > 0.1) {
        recommendations.push(`Continue supporting ${metric} growth - positive trend`)
      }
    })

    // Learning style specific recommendations
    recommendations.push(...RiskAssessmentEngine['getLearningStyleInterventions'](student.learning_style).slice(0, 2))

    return recommendations
  }
}