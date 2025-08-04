/**
 * Enhanced Data Structures for Day 1 Success Kit
 * Comprehensive types for classroom analytics, risk assessment, and optimization
 */

// Base learning styles
export type LearningStyle = 'creative' | 'analytical' | 'collaborative' | 'confident'

// Enhanced 6C scores structure
export interface SixCScores {
  communication: number
  collaboration: number
  content: number
  critical_thinking: number
  creative_innovation: number
  confidence: number
}

// Risk assessment types
export interface RiskFactor {
  id: string
  type: 'learning_style_mismatch' | 'low_engagement' | 'social_isolation' | 'academic_struggle'
  severity: 'low' | 'medium' | 'high'
  description: string
  indicators: string[]
  intervention_strategies: string[]
  timeline: 'immediate' | 'short_term' | 'ongoing'
}

// Seating and collaboration preferences
export interface SeatingPreferences {
  preferred_group_size: number
  collaboration_comfort: 'high' | 'medium' | 'low'
  focus_requirements: 'quiet' | 'moderate' | 'stimulating'
  energy_level: 'high' | 'medium' | 'low'
  peer_interactions: 'leader' | 'collaborator' | 'independent'
  proximity_needs: 'close_to_teacher' | 'near_peers' | 'flexible'
}

// Progress tracking over time
export interface ProgressEntry {
  id: string
  date: string
  metric_type: 'six_c_score' | 'engagement' | 'behavior' | 'academic'
  metric_name: string
  value: number
  max_value: number
  notes?: string
  context?: string
}

// Parent communication insights
export interface ParentInsight {
  id: string
  category: 'home_behavior' | 'learning_preferences' | 'challenges' | 'strengths'
  insight: string
  relevance_score: number
  communication_strategies: string[]
  talking_points: string[]
}

// Enhanced student profile
export interface EnhancedStudentProfile {
  id: string
  name: string
  grade: string
  classroom_id: string
  learning_style: LearningStyle
  six_c_scores: SixCScores
  risk_factors: RiskFactor[]
  seating_preferences: SeatingPreferences
  parent_insights: ParentInsight[]
  progress_timeline: ProgressEntry[]
  
  // Metadata
  created_at: string
  updated_at: string
  last_assessment_date: string
  
  // Teaching compatibility
  teaching_style_compatibility: TeachingStyleCompatibility
  
  // Academic performance indicators
  engagement_level: number // 1-5 scale
  participation_frequency: number // 1-5 scale
  peer_interaction_quality: number // 1-5 scale
}

// Teaching style compatibility analysis
export interface TeachingStyleCompatibility {
  default_teaching_approach: 'direct_instruction' | 'collaborative' | 'inquiry_based' | 'mixed'
  compatibility_score: number // 1-10 scale
  adaptation_strategies: string[]
  success_indicators: string[]
  warning_signs: string[]
}

// Classroom overview analytics
export interface ClassroomOverview {
  id: string
  name: string
  grade_level: string
  teacher_id: string
  
  // Student distribution
  total_students: number
  learning_style_distribution: {
    creative: number
    analytical: number
    collaborative: number
    confident: number
  }
  
  // Average scores
  average_six_c_scores: SixCScores
  
  // Risk assessment summary
  at_risk_students: number
  moderate_risk_students: number
  low_risk_students: number
  
  // Engagement metrics
  overall_engagement: number
  participation_trends: ProgressEntry[]
  
  // Teaching style analysis
  teaching_compatibility: {
    high_compatibility: number
    medium_compatibility: number
    low_compatibility: number
  }
  
  created_at: string
  updated_at: string
}

// At-risk student analysis
export interface AtRiskAnalysis {
  student_id: string
  student_name: string
  risk_level: 'high' | 'medium' | 'low'
  primary_risk_factors: RiskFactor[]
  intervention_priority: number // 1-10 scale
  
  // Specific recommendations
  immediate_actions: InterventionAction[]
  short_term_strategies: InterventionAction[]
  long_term_support: InterventionAction[]
  
  // Monitoring plan
  check_in_frequency: 'daily' | 'weekly' | 'bi_weekly'
  success_metrics: string[]
  escalation_triggers: string[]
}

export interface InterventionAction {
  id: string
  action: string
  timeline: string
  resources_needed: string[]
  success_indicators: string[]
  person_responsible: 'teacher' | 'counselor' | 'parent' | 'admin'
}

// Seating optimization
export interface SeatingArrangement {
  id: string
  classroom_id: string
  arrangement_name: string
  layout_type: 'rows' | 'groups' | 'u_shape' | 'circle' | 'mixed'
  
  // Student assignments
  student_assignments: StudentSeat[]
  
  // Optimization scores
  collaboration_score: number
  focus_score: number
  behavior_management_score: number
  overall_effectiveness: number
  
  // Considerations
  special_accommodations: SpecialAccommodation[]
  teacher_notes: string
  
  created_at: string
  last_used: string
}

export interface StudentSeat {
  student_id: string
  position: {
    row: number
    seat: number
    zone?: string
  }
  rationale: string[]
  compatibility_factors: string[]
}

export interface SpecialAccommodation {
  student_id: string
  accommodation_type: string
  description: string
  positioning_requirements: string[]
}

// Parent communication templates
export interface ParentCommunicationTemplate {
  id: string
  template_type: 'introduction' | 'progress_update' | 'challenge_discussion' | 'celebration' | 'conference_prep'
  student_profile: EnhancedStudentProfile
  
  // Personalized content
  subject_line: string
  greeting: string
  main_content: string
  learning_style_insights: string
  specific_examples: string[]
  action_items: string[]
  closing: string
  
  // Customization options
  tone: 'formal' | 'friendly' | 'encouraging' | 'concerned'
  length: 'brief' | 'detailed' | 'comprehensive'
  
  generated_at: string
}

// API Response Types
export interface ClassroomAnalyticsResponse {
  overview: ClassroomOverview
  students: EnhancedStudentProfile[]
  at_risk_analysis: AtRiskAnalysis[]
  seating_recommendations: SeatingArrangement[]
  teaching_insights: TeachingInsight[]
}

export interface TeachingInsight {
  category: 'learning_styles' | 'engagement' | 'collaboration' | 'differentiation'
  insight: string
  data_points: string[]
  actionable_strategies: string[]
  priority: 'high' | 'medium' | 'low'
}

// Risk prediction algorithm inputs
export interface RiskPredictionInput {
  six_c_scores: SixCScores
  learning_style: LearningStyle
  engagement_metrics: {
    participation_rate: number
    assignment_completion: number
    peer_interaction_quality: number
  }
  behavioral_indicators: {
    attention_span: number
    following_directions: number
    self_advocacy: number
  }
  academic_performance: {
    grade_trends: number[]
    assessment_scores: number[]
    progress_rate: number
  }
}

// Database schema extensions
export interface ClassroomAnalytics {
  id: string
  classroom_id: string
  analytics_date: string
  learning_style_distribution: Record<LearningStyle, number>
  average_scores: SixCScores
  engagement_metrics: Record<string, number>
  risk_summary: {
    high_risk: number
    medium_risk: number
    low_risk: number
  }
  teaching_recommendations: string[]
  created_at: string
}

export interface StudentRiskAssessment {
  id: string
  student_id: string
  assessment_date: string
  risk_level: 'high' | 'medium' | 'low'
  risk_factors: RiskFactor[]
  intervention_plan: InterventionAction[]
  last_review_date: string
  next_review_date: string
  status: 'active' | 'monitoring' | 'resolved'
}

export interface SeatingOptimizationHistory {
  id: string
  classroom_id: string
  arrangement: SeatingArrangement
  effectiveness_rating: number
  teacher_feedback: string
  student_feedback_summary: string
  duration_used: number // days
  outcomes: string[]
  created_at: string
}

export interface ParentCommunicationLog {
  id: string
  student_id: string
  template_id: string
  communication_type: string
  sent_date: string
  opened: boolean
  replied: boolean
  parent_response?: string
  follow_up_needed: boolean
  effectiveness_rating?: number
}