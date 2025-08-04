import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { ClassroomAnalyticsResponse, ClassroomOverview, EnhancedStudentProfile, AtRiskAnalysis, SeatingArrangement, TeachingInsight, LearningStyle } from '@/lib/types-enhanced'

/**
 * GET /api/teacher/classroom/[id]/overview
 * 
 * Comprehensive classroom dashboard data including:
 * - Learning style distribution with percentages
 * - Individual student profiles with 6C scores
 * - Teaching style compatibility analysis
 * - Progress tracking over time
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const classroomId = params.id

    // Get classroom basic info
    const { data: classroom, error: classroomError } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .single()

    if (classroomError || !classroom) {
      return NextResponse.json(
        { error: 'Classroom not found' },
        { status: 404 }
      )
    }

    // Get enhanced student profiles with base profile data
    const { data: studentProfiles, error: profilesError } = await supabase
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
        )
      `)
      .eq('classroom_id', classroomId)

    if (profilesError) {
      return NextResponse.json(
        { error: 'Failed to fetch student profiles' },
        { status: 500 }
      )
    }

    // Get risk factors for all students
    const studentIds = studentProfiles?.map(sp => sp.id) || []
    const { data: riskFactors } = await supabase
      .from('student_risk_factors')
      .select('*')
      .in('student_profile_id', studentIds)
      .eq('status', 'active')

    // Get progress data for trends
    const { data: progressData } = await supabase
      .from('student_progress')
      .select('*')
      .in('student_profile_id', studentIds)
      .gte('date_recorded', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('date_recorded', { ascending: true })

    // Get parent insights
    const { data: parentInsights } = await supabase
      .from('parent_insights')
      .select('*')
      .in('student_profile_id', studentIds)

    if (!studentProfiles) {
      return NextResponse.json(
        { error: 'No student data found' },
        { status: 404 }
      )
    }

    // Transform data to match our enhanced types
    const enhancedStudents: EnhancedStudentProfile[] = studentProfiles.map(sp => {
      const profile = sp.profiles as any
      const studentRiskFactors = riskFactors?.filter(rf => rf.student_profile_id === sp.id) || []
      const studentProgress = progressData?.filter(pd => pd.student_profile_id === sp.id) || []
      const studentInsights = parentInsights?.filter(pi => pi.student_profile_id === sp.id) || []

      return {
        id: sp.id,
        name: profile.child_name,
        grade: profile.grade,
        classroom_id: sp.classroom_id,
        learning_style: getLearningStyleFromLabel(profile.personality_label),
        six_c_scores: {
          communication: sp.communication_score,
          collaboration: sp.collaboration_score,
          content: sp.content_score,
          critical_thinking: sp.critical_thinking_score,
          creative_innovation: sp.creative_innovation_score,
          confidence: sp.confidence_score
        },
        risk_factors: studentRiskFactors.map(rf => ({
          id: rf.id,
          type: rf.risk_type as any,
          severity: rf.severity as any,
          description: rf.description,
          indicators: rf.indicators || [],
          intervention_strategies: rf.intervention_strategies || [],
          timeline: rf.timeline as any
        })),
        seating_preferences: sp.seating_preferences || getDefaultSeatingPreferences(),
        parent_insights: studentInsights.map(pi => ({
          id: pi.id,
          category: pi.category as any,
          insight: pi.insight,
          relevance_score: pi.relevance_score,
          communication_strategies: pi.communication_strategies || [],
          talking_points: pi.talking_points || []
        })),
        progress_timeline: studentProgress.map(pd => ({
          id: pd.id,
          date: pd.date_recorded,
          metric_type: pd.metric_type as any,
          metric_name: pd.metric_name,
          value: parseFloat(pd.value.toString()),
          max_value: parseFloat(pd.max_value.toString()),
          notes: pd.notes,
          context: pd.context
        })),
        created_at: sp.created_at,
        updated_at: sp.updated_at,
        last_assessment_date: sp.last_assessment_date,
        teaching_style_compatibility: sp.teaching_compatibility || getDefaultTeachingCompatibility(),
        engagement_level: sp.engagement_level,
        participation_frequency: sp.participation_frequency,
        peer_interaction_quality: sp.peer_interaction_quality
      }
    })

    // Calculate learning style distribution
    const learningStyleCounts = enhancedStudents.reduce((acc, student) => {
      acc[student.learning_style] = (acc[student.learning_style] || 0) + 1
      return acc
    }, {} as Record<LearningStyle, number>)

    // Calculate average scores
    const averageScores = enhancedStudents.reduce((acc, student) => {
      acc.communication += student.six_c_scores.communication
      acc.collaboration += student.six_c_scores.collaboration
      acc.content += student.six_c_scores.content
      acc.critical_thinking += student.six_c_scores.critical_thinking
      acc.creative_innovation += student.six_c_scores.creative_innovation
      acc.confidence += student.six_c_scores.confidence
      return acc
    }, {
      communication: 0,
      collaboration: 0,
      content: 0,
      critical_thinking: 0,
      creative_innovation: 0,
      confidence: 0
    })

    const studentCount = enhancedStudents.length
    if (studentCount > 0) {
      Object.keys(averageScores).forEach(key => {
        averageScores[key as keyof typeof averageScores] /= studentCount
      })
    }

    // Build classroom overview
    const overview: ClassroomOverview = {
      id: classroom.id,
      name: classroom.name,
      grade_level: classroom.grade_level,
      teacher_id: classroom.teacher_id.toString(),
      total_students: studentCount,
      learning_style_distribution: {
        creative: learningStyleCounts.creative || 0,
        analytical: learningStyleCounts.analytical || 0,
        collaborative: learningStyleCounts.collaborative || 0,
        confident: learningStyleCounts.confident || 0
      },
      average_six_c_scores: averageScores,
      at_risk_students: enhancedStudents.filter(s => s.risk_factors.some(rf => rf.severity === 'high')).length,
      moderate_risk_students: enhancedStudents.filter(s => s.risk_factors.some(rf => rf.severity === 'medium')).length,
      low_risk_students: enhancedStudents.filter(s => s.risk_factors.length === 0 || s.risk_factors.every(rf => rf.severity === 'low')).length,
      overall_engagement: enhancedStudents.reduce((sum, s) => sum + s.engagement_level, 0) / studentCount || 0,
      participation_trends: [], // Would be calculated from progress data
      teaching_compatibility: {
        high_compatibility: enhancedStudents.filter(s => s.teaching_style_compatibility.compatibility_score >= 8).length,
        medium_compatibility: enhancedStudents.filter(s => s.teaching_style_compatibility.compatibility_score >= 5 && s.teaching_style_compatibility.compatibility_score < 8).length,
        low_compatibility: enhancedStudents.filter(s => s.teaching_style_compatibility.compatibility_score < 5).length
      },
      created_at: classroom.created_at,
      updated_at: classroom.updated_at
    }

    // Generate at-risk analysis
    const atRiskAnalysis: AtRiskAnalysis[] = enhancedStudents
      .filter(student => student.risk_factors.length > 0)
      .map(student => {
        const highRiskFactors = student.risk_factors.filter(rf => rf.severity === 'high')
        const riskLevel = highRiskFactors.length > 0 ? 'high' : 
                         student.risk_factors.some(rf => rf.severity === 'medium') ? 'medium' : 'low'

        return {
          student_id: student.id,
          student_name: student.name,
          risk_level: riskLevel as any,
          primary_risk_factors: student.risk_factors.slice(0, 3), // Top 3 risk factors
          intervention_priority: calculateInterventionPriority(student.risk_factors),
          immediate_actions: generateImmediateActions(student.risk_factors),
          short_term_strategies: generateShortTermStrategies(student.risk_factors),
          long_term_support: generateLongTermSupport(student.risk_factors),
          check_in_frequency: riskLevel === 'high' ? 'daily' : riskLevel === 'medium' ? 'weekly' : 'bi_weekly',
          success_metrics: generateSuccessMetrics(student.risk_factors),
          escalation_triggers: generateEscalationTriggers(student.risk_factors)
        }
      })

    // Generate teaching insights
    const teachingInsights: TeachingInsight[] = generateTeachingInsights(enhancedStudents, overview)

    const response: ClassroomAnalyticsResponse = {
      overview,
      students: enhancedStudents,
      at_risk_analysis: atRiskAnalysis,
      seating_recommendations: [], // Would be generated by seating optimization algorithm
      teaching_insights: teachingInsights
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching classroom overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function getLearningStyleFromLabel(label: string): LearningStyle {
  if (label.toLowerCase().includes('creative')) return 'creative'
  if (label.toLowerCase().includes('analytical')) return 'analytical'
  if (label.toLowerCase().includes('collaborative')) return 'collaborative'
  if (label.toLowerCase().includes('confident')) return 'confident'
  return 'creative' // default
}

function getDefaultSeatingPreferences() {
  return {
    preferred_group_size: 4,
    collaboration_comfort: 'medium' as const,
    focus_requirements: 'moderate' as const,
    energy_level: 'medium' as const,
    peer_interactions: 'collaborator' as const,
    proximity_needs: 'flexible' as const
  }
}

function getDefaultTeachingCompatibility() {
  return {
    default_teaching_approach: 'mixed' as const,
    compatibility_score: 6,
    adaptation_strategies: [],
    success_indicators: [],
    warning_signs: []
  }
}

function calculateInterventionPriority(riskFactors: any[]): number {
  return riskFactors.reduce((priority, rf) => {
    if (rf.severity === 'high') return priority + 3
    if (rf.severity === 'medium') return priority + 2
    return priority + 1
  }, 0)
}

function generateImmediateActions(riskFactors: any[]) {
  return riskFactors
    .filter(rf => rf.timeline === 'immediate')
    .map(rf => ({
      id: `immediate-${rf.id}`,
      action: rf.intervention_strategies[0] || 'Check in with student',
      timeline: '1-2 days',
      resources_needed: ['Teacher time', 'Observation checklist'],
      success_indicators: ['Improved engagement', 'Positive response'],
      person_responsible: 'teacher' as const
    }))
}

function generateShortTermStrategies(riskFactors: any[]) {
  return riskFactors
    .filter(rf => rf.timeline === 'short_term')
    .map(rf => ({
      id: `short-term-${rf.id}`,
      action: rf.intervention_strategies[1] || 'Implement targeted support',
      timeline: '1-2 weeks',
      resources_needed: ['Differentiated materials', 'Small group time'],
      success_indicators: ['Progress on specific skills', 'Increased participation'],
      person_responsible: 'teacher' as const
    }))
}

function generateLongTermSupport(riskFactors: any[]) {
  return riskFactors
    .filter(rf => rf.timeline === 'ongoing')
    .map(rf => ({
      id: `long-term-${rf.id}`,
      action: rf.intervention_strategies[2] || 'Ongoing monitoring and support',
      timeline: '4+ weeks',
      resources_needed: ['Parent communication', 'Progress tracking tools'],
      success_indicators: ['Sustained improvement', 'Independent application'],
      person_responsible: 'teacher' as const
    }))
}

function generateSuccessMetrics(riskFactors: any[]): string[] {
  return [
    'Increased engagement in classroom activities',
    'Improved peer interactions',
    'Better task completion rates',
    'Positive behavior changes',
    'Academic progress indicators'
  ]
}

function generateEscalationTriggers(riskFactors: any[]): string[] {
  return [
    'No improvement after 2 weeks of intervention',
    'Regression in key areas',
    'New concerning behaviors emerge',
    'Parent concerns increase',
    'Impact on other students'
  ]
}

function generateTeachingInsights(students: EnhancedStudentProfile[], overview: ClassroomOverview): TeachingInsight[] {
  const insights: TeachingInsight[] = []

  // Learning style distribution insight
  const totalStudents = overview.total_students
  const dominantStyle = Object.entries(overview.learning_style_distribution)
    .reduce((a, b) => overview.learning_style_distribution[a[0] as LearningStyle] > overview.learning_style_distribution[b[0] as LearningStyle] ? a : b)[0]

  if (overview.learning_style_distribution[dominantStyle as LearningStyle] / totalStudents > 0.4) {
    insights.push({
      category: 'learning_styles',
      insight: `Your classroom has a strong ${dominantStyle} learner majority (${Math.round(overview.learning_style_distribution[dominantStyle as LearningStyle] / totalStudents * 100)}%)`,
      data_points: [`${overview.learning_style_distribution[dominantStyle as LearningStyle]} out of ${totalStudents} students`],
      actionable_strategies: [
        `Incorporate more ${dominantStyle}-friendly activities`,
        'Ensure other learning styles are still supported',
        'Use peer mentoring between different learning styles'
      ],
      priority: 'high'
    })
  }

  // Engagement insight
  if (overview.overall_engagement < 3.5) {
    insights.push({
      category: 'engagement',
      insight: 'Classroom engagement levels are below optimal',
      data_points: [`Average engagement: ${overview.overall_engagement.toFixed(1)}/5`],
      actionable_strategies: [
        'Increase variety in instructional methods',
        'Incorporate more interactive activities',
        'Check in with individual students about preferences'
      ],
      priority: 'high'
    })
  }

  // Collaboration insight
  const collaborativePercentage = overview.learning_style_distribution.collaborative / totalStudents
  if (collaborativePercentage > 0.3) {
    insights.push({
      category: 'collaboration',
      insight: 'High percentage of collaborative learners suggests group work opportunities',
      data_points: [`${Math.round(collaborativePercentage * 100)}% collaborative learners`],
      actionable_strategies: [
        'Implement regular small group activities',
        'Use think-pair-share strategies',
        'Create collaborative project opportunities'
      ],
      priority: 'medium'
    })
  }

  return insights
}