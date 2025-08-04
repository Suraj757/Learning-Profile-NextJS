import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { AtRiskAnalysis, RiskFactor, InterventionAction } from '@/lib/types-enhanced'

/**
 * GET /api/teacher/classroom/[id]/at-risk
 * 
 * Comprehensive at-risk student analysis including:
 * - Students who might struggle with default teaching approaches
 * - Specific intervention recommendations per student
 * - Risk factors based on learning style mismatches
 * - Progress monitoring for at-risk students
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

    // Get all students in the classroom with their profiles and risk factors
    const { data: studentData, error: studentError } = await supabase
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
          status,
          identified_date,
          last_review_date,
          next_review_date
        )
      `)
      .eq('classroom_id', classroomId)

    if (studentError) {
      return NextResponse.json(
        { error: 'Failed to fetch student data' },
        { status: 500 }
      )
    }

    if (!studentData || studentData.length === 0) {
      return NextResponse.json([])
    }

    // Get intervention actions for all risk factors
    const riskFactorIds = studentData
      .flatMap(student => student.student_risk_factors || [])
      .map(rf => rf.id)

    let interventionActions: any[] = []
    if (riskFactorIds.length > 0) {
      const { data: interventions } = await supabase
        .from('intervention_actions')
        .select('*')
        .in('risk_factor_id', riskFactorIds)
      
      interventionActions = interventions || []
    }

    // Process each student and build at-risk analysis
    const atRiskAnalysis: AtRiskAnalysis[] = studentData
      .filter(student => {
        const riskFactors = student.student_risk_factors || []
        return riskFactors.some((rf: any) => rf.status === 'active')
      })
      .map(student => {
        const profile = student.profiles as any
        const riskFactors = (student.student_risk_factors || [])
          .filter((rf: any) => rf.status === 'active')
          .map((rf: any) => ({
            id: rf.id,
            type: rf.risk_type,
            severity: rf.severity,
            description: rf.description,
            indicators: rf.indicators || [],
            intervention_strategies: rf.intervention_strategies || [],
            timeline: rf.timeline
          }))

        // Determine overall risk level
        const hasHighRisk = riskFactors.some(rf => rf.severity === 'high')
        const hasMediumRisk = riskFactors.some(rf => rf.severity === 'medium')
        const riskLevel = hasHighRisk ? 'high' : hasMediumRisk ? 'medium' : 'low'

        // Calculate intervention priority (1-10 scale)
        const interventionPriority = calculateDetailedInterventionPriority(
          riskFactors,
          student.engagement_level,
          student.participation_frequency
        )

        // Get interventions for this student's risk factors
        const studentInterventions = interventionActions.filter(action => 
          riskFactors.some(rf => rf.id === action.risk_factor_id)
        )

        return {
          student_id: student.id,
          student_name: profile.child_name,
          risk_level: riskLevel as 'high' | 'medium' | 'low',
          primary_risk_factors: riskFactors
            .sort((a, b) => {
              const severityOrder = { high: 3, medium: 2, low: 1 }
              return severityOrder[b.severity as keyof typeof severityOrder] - 
                     severityOrder[a.severity as keyof typeof severityOrder]
            })
            .slice(0, 3), // Top 3 most severe risk factors
          intervention_priority: interventionPriority,
          immediate_actions: generateImmediateActions(riskFactors, student, studentInterventions),
          short_term_strategies: generateShortTermStrategies(riskFactors, student, studentInterventions),
          long_term_support: generateLongTermSupport(riskFactors, student, studentInterventions),
          check_in_frequency: determineCheckInFrequency(riskLevel, riskFactors),
          success_metrics: generateSuccessMetrics(riskFactors, student),
          escalation_triggers: generateEscalationTriggers(riskFactors, riskLevel)
        }
      })
      .sort((a, b) => b.intervention_priority - a.intervention_priority) // Sort by priority

    return NextResponse.json(atRiskAnalysis)

  } catch (error) {
    console.error('Error fetching at-risk analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teacher/classroom/[id]/at-risk
 * 
 * Create or update risk assessments for students
 */
export async function POST(
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

    const body = await request.json()
    const { student_id, risk_factors, interventions } = body

    // Validate required fields
    if (!student_id || !risk_factors) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert or update risk factors
    const riskFactorInserts = risk_factors.map((rf: any) => ({
      student_profile_id: student_id,
      risk_type: rf.type,
      severity: rf.severity,
      description: rf.description,
      indicators: rf.indicators || [],
      intervention_strategies: rf.intervention_strategies || [],
      timeline: rf.timeline,
      status: 'active',
      next_review_date: calculateNextReviewDate(rf.severity, rf.timeline)
    }))

    const { data: insertedRiskFactors, error: riskError } = await supabase
      .from('student_risk_factors')
      .insert(riskFactorInserts)
      .select()

    if (riskError) {
      return NextResponse.json(
        { error: 'Failed to create risk factors' },
        { status: 500 }
      )
    }

    // Insert intervention actions if provided
    if (interventions && interventions.length > 0 && insertedRiskFactors) {
      const interventionInserts = interventions.map((intervention: any) => ({
        risk_factor_id: insertedRiskFactors[0]?.id, // Simplified - would need better mapping
        action_description: intervention.action,
        timeline: intervention.timeline,
        resources_needed: intervention.resources_needed || [],
        success_indicators: intervention.success_indicators || [],
        person_responsible: intervention.person_responsible || 'teacher',
        status: 'planned',
        target_completion_date: calculateTargetDate(intervention.timeline)
      }))

      await supabase
        .from('intervention_actions')
        .insert(interventionInserts)
    }

    return NextResponse.json({ 
      success: true, 
      risk_factors: insertedRiskFactors 
    })

  } catch (error) {
    console.error('Error creating risk assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateDetailedInterventionPriority(
  riskFactors: RiskFactor[],
  engagementLevel: number,
  participationFrequency: number
): number {
  let priority = 0

  // Base priority from risk factors
  riskFactors.forEach(rf => {
    switch (rf.severity) {
      case 'high':
        priority += 3
        break
      case 'medium':
        priority += 2
        break
      case 'low':
        priority += 1
        break
    }
  })

  // Adjust for engagement and participation
  if (engagementLevel <= 2) priority += 2
  if (participationFrequency <= 2) priority += 2

  // Consider risk factor types
  const hasLearningMismatch = riskFactors.some(rf => rf.type === 'learning_style_mismatch')
  const hasSocialIsolation = riskFactors.some(rf => rf.type === 'social_isolation')
  
  if (hasLearningMismatch) priority += 1
  if (hasSocialIsolation) priority += 1

  return Math.min(priority, 10) // Cap at 10
}

function generateImmediateActions(
  riskFactors: RiskFactor[],
  student: any,
  existingInterventions: any[]
): InterventionAction[] {
  const actions: InterventionAction[] = []

  // High-severity risk factors need immediate attention
  const highRiskFactors = riskFactors.filter(rf => rf.severity === 'high')
  
  highRiskFactors.forEach(rf => {
    switch (rf.type) {
      case 'learning_style_mismatch':
        actions.push({
          id: `immediate-${rf.id}`,
          action: 'Implement learning style accommodations in next lesson',
          timeline: '1-2 days',
          resources_needed: ['Differentiated materials', 'Alternative activity options'],
          success_indicators: ['Increased engagement', 'Better task completion'],
          person_responsible: 'teacher'
        })
        break
      
      case 'low_engagement':
        actions.push({
          id: `immediate-${rf.id}`,
          action: 'One-on-one check-in to understand barriers',
          timeline: '1 day',
          resources_needed: ['5-10 minutes of teacher time'],
          success_indicators: ['Student opens up about challenges', 'Identifies specific needs'],
          person_responsible: 'teacher'
        })
        break
      
      case 'social_isolation':
        actions.push({
          id: `immediate-${rf.id}`,
          action: 'Facilitate structured peer interaction',
          timeline: '1-2 days',
          resources_needed: ['Partner activity', 'Social skills support'],
          success_indicators: ['Positive peer interaction', 'Student participation'],
          person_responsible: 'teacher'
        })
        break
      
      case 'academic_struggle':
        actions.push({
          id: `immediate-${rf.id}`,
          action: 'Provide additional scaffolding for current concepts',
          timeline: '1-3 days',
          resources_needed: ['Simplified materials', 'Visual aids', 'Extra practice'],
          success_indicators: ['Improved understanding', 'Confidence increase'],
          person_responsible: 'teacher'
        })
        break
    }
  })

  // If engagement is very low, add immediate engagement strategy
  if (student.engagement_level <= 2) {
    actions.push({
      id: `immediate-engagement-${student.id}`,
      action: 'Incorporate student interests into next lesson',
      timeline: '1-2 days',
      resources_needed: ['Student interest survey', 'Flexible lesson materials'],
      success_indicators: ['Visible excitement', 'Voluntary participation'],
      person_responsible: 'teacher'
    })
  }

  return actions.slice(0, 3) // Limit to top 3 immediate actions
}

function generateShortTermStrategies(
  riskFactors: RiskFactor[],
  student: any,
  existingInterventions: any[]
): InterventionAction[] {
  const strategies: InterventionAction[] = []

  riskFactors.forEach(rf => {
    switch (rf.type) {
      case 'learning_style_mismatch':
        strategies.push({
          id: `short-term-${rf.id}`,
          action: 'Develop personalized learning approach based on style preferences',
          timeline: '1-2 weeks',
          resources_needed: ['Learning style resources', 'Differentiated assignments'],
          success_indicators: ['Sustained engagement', 'Improved performance'],
          person_responsible: 'teacher'
        })
        break
      
      case 'low_engagement':
        strategies.push({
          id: `short-term-${rf.id}`,
          action: 'Implement choice-based learning opportunities',
          timeline: '2-3 weeks',
          resources_needed: ['Multiple activity options', 'Student choice boards'],
          success_indicators: ['Increased initiative', 'Better attendance'],
          person_responsible: 'teacher'
        })
        break
      
      case 'social_isolation':
        strategies.push({
          id: `short-term-${rf.id}`,
          action: 'Structured social skills development program',
          timeline: '2-4 weeks',
          resources_needed: ['Social skills curriculum', 'Peer buddy system'],
          success_indicators: ['Friendship formation', 'Group participation'],
          person_responsible: 'counselor'
        })
        break
      
      case 'academic_struggle':
        strategies.push({
          id: `short-term-${rf.id}`,
          action: 'Intensive skill-building intervention',
          timeline: '3-4 weeks',
          resources_needed: ['Targeted materials', 'Additional practice time'],
          success_indicators: ['Skill mastery', 'Grade improvement'],
          person_responsible: 'teacher'
        })
        break
    }
  })

  return strategies
}

function generateLongTermSupport(
  riskFactors: RiskFactor[],
  student: any,
  existingInterventions: any[]
): InterventionAction[] {
  const support: InterventionAction[] = []

  // Always include progress monitoring
  support.push({
    id: `long-term-monitoring-${student.id}`,
    action: 'Ongoing progress monitoring and data collection',
    timeline: 'Ongoing',
    resources_needed: ['Progress tracking tools', 'Regular assessment'],
    success_indicators: ['Sustained improvement', 'Data-driven decisions'],
    person_responsible: 'teacher'
  })

  // Parent communication for sustained support
  support.push({
    id: `long-term-parent-${student.id}`,
    action: 'Regular parent communication and home-school collaboration',
    timeline: 'Ongoing',
    resources_needed: ['Communication schedule', 'Progress reports'],
    success_indicators: ['Parent engagement', 'Consistent support'],
    person_responsible: 'teacher'
  })

  // Skill generalization
  if (riskFactors.some(rf => rf.type === 'academic_struggle')) {
    support.push({
      id: `long-term-academic-${student.id}`,
      action: 'Support skill generalization across subjects',
      timeline: '6+ weeks',
      resources_needed: ['Cross-curricular materials', 'Collaboration with other teachers'],
      success_indicators: ['Skills transfer', 'Independent application'],
      person_responsible: 'teacher'
    })
  }

  return support
}

function determineCheckInFrequency(
  riskLevel: string,
  riskFactors: RiskFactor[]
): 'daily' | 'weekly' | 'bi_weekly' {
  if (riskLevel === 'high') return 'daily'
  if (riskLevel === 'medium') return 'weekly'
  
  // Special cases
  const hasImmediateTimeline = riskFactors.some(rf => rf.timeline === 'immediate')
  if (hasImmediateTimeline) return 'daily'
  
  return 'bi_weekly'
}

function generateSuccessMetrics(riskFactors: RiskFactor[], student: any): string[] {
  const metrics = new Set<string>()

  // Base metrics for all students
  metrics.add('Increased classroom engagement')
  metrics.add('Improved task completion rate')
  metrics.add('Positive peer interactions')

  // Risk-specific metrics
  riskFactors.forEach(rf => {
    switch (rf.type) {
      case 'learning_style_mismatch':
        metrics.add('Better performance on preferred activity types')
        metrics.add('Reduced frustration with assignments')
        break
      case 'low_engagement':
        metrics.add('Voluntary participation in discussions')
        metrics.add('Sustained attention during lessons')
        break
      case 'social_isolation':
        metrics.add('Initiates interactions with peers')
        metrics.add('Participates in group activities')
        break
      case 'academic_struggle':
        metrics.add('Improvement in specific skill areas')
        metrics.add('Increased confidence in academic tasks')
        break
    }
  })

  return Array.from(metrics)
}

function generateEscalationTriggers(riskFactors: RiskFactor[], riskLevel: string): string[] {
  const triggers = [
    'No improvement after 2 weeks of targeted intervention',
    'Regression in key behavioral or academic areas',
    'New concerning behaviors or risk factors emerge',
    'Student expresses increased frustration or distress',
    'Parent reports concerns about home behavior'
  ]

  if (riskLevel === 'high') {
    triggers.push('Immediate safety or wellbeing concerns')
    triggers.push('Significant disruption to learning environment')
  }

  return triggers
}

function calculateNextReviewDate(severity: string, timeline: string): string {
  const now = new Date()
  let daysToAdd = 14 // Default 2 weeks

  if (severity === 'high') {
    daysToAdd = 7 // 1 week for high severity
  } else if (timeline === 'immediate') {
    daysToAdd = 3 // 3 days for immediate timeline
  }

  const reviewDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
  return reviewDate.toISOString()
}

function calculateTargetDate(timeline: string): string {
  const now = new Date()
  let daysToAdd = 14

  if (timeline.includes('1-2 days')) daysToAdd = 2
  else if (timeline.includes('1-2 weeks')) daysToAdd = 14
  else if (timeline.includes('2-3 weeks')) daysToAdd = 21
  else if (timeline.includes('3-4 weeks')) daysToAdd = 28

  const targetDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
  return targetDate.toISOString()
}