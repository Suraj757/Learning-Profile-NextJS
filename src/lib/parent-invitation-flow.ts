/**
 * Parent Invitation Flow Testing System
 * Tests the complete parent experience from invitation to assessment completion
 */

import { supabase } from './supabase'

export interface ParentTestScenario {
  parent_email: string
  parent_name: string
  child_name: string
  scenario: 'compliant_parent' | 'busy_parent' | 'non_english' | 'tech_challenged' | 'skeptical_parent'
  description: string
  response_time: 'immediate' | 'within_day' | 'within_week' | 'needs_reminder' | 'never_responds'
  completion_rate: 'full' | 'partial' | 'abandoned' | 'refused'
  preferred_contact: 'email' | 'phone' | 'text' | 'school_pickup'
  languages: string[]
  concerns?: string[]
  completion_barriers?: string[]
}

export const PARENT_TEST_SCENARIOS: ParentTestScenario[] = [
  // Compliant Parent - Ideal scenario
  {
    parent_email: "sarah.compliant@parenttest.com",
    parent_name: "Sarah Johnson", 
    child_name: "Emma Johnson",
    scenario: "compliant_parent",
    description: "Engaged parent who responds quickly and completes assessments fully",
    response_time: "immediate",
    completion_rate: "full",
    preferred_contact: "email",
    languages: ["English"],
  },
  
  // Busy Parent - Common scenario
  {
    parent_email: "busy.parent@workingfam.com",
    parent_name: "Michael Rodriguez",
    child_name: "Carlos Rodriguez", 
    scenario: "busy_parent",
    description: "Working parent who needs reminders and starts/stops assessment multiple times",
    response_time: "needs_reminder",
    completion_rate: "partial",
    preferred_contact: "text",
    languages: ["English", "Spanish"],
    completion_barriers: ["Time constraints", "Interrupted sessions", "Mobile device issues"]
  },
  
  // Non-English Speaking Parent
  {
    parent_email: "maria.espanol@familia.com", 
    parent_name: "Maria Garcia",
    child_name: "Sofia Garcia",
    scenario: "non_english",
    description: "Spanish-speaking parent who needs translated materials and support",
    response_time: "within_week",
    completion_rate: "full",
    preferred_contact: "phone",
    languages: ["Spanish"],
    concerns: ["Language barrier", "Cultural appropriateness", "Understanding instructions"]
  },
  
  // Tech-Challenged Parent
  {
    parent_email: "grandma.caregiver@oldschool.net",
    parent_name: "Dorothy Wilson",
    child_name: "Aiden Wilson",
    scenario: "tech_challenged", 
    description: "Older caregiver who struggles with technology and needs phone support",
    response_time: "within_day",
    completion_rate: "partial",
    preferred_contact: "phone",
    languages: ["English"],
    completion_barriers: ["Technology confusion", "Small text", "Complex navigation", "No smartphone"]
  },
  
  // Skeptical Parent
  {
    parent_email: "privacy.concerned@secure.com",
    parent_name: "Jennifer Chen",
    child_name: "Lily Chen", 
    scenario: "skeptical_parent",
    description: "Privacy-conscious parent who questions data collection and needs reassurance",
    response_time: "never_responds",
    completion_rate: "refused",
    preferred_contact: "email",
    languages: ["English"],
    concerns: ["Data privacy", "Assessment validity", "Labeling concerns", "School oversight"]
  }
]

export interface InvitationTest {
  success: boolean
  timeline: {
    invitation_sent: Date
    invitation_opened?: Date
    assessment_started?: Date
    assessment_completed?: Date
    reminder_sent?: Date
  }
  engagement_metrics: {
    email_opens: number
    link_clicks: number
    session_starts: number
    questions_answered: number
    total_questions: number
    completion_percentage: number
  }
  barriers_encountered: string[]
  support_interactions: string[]
  final_outcome: 'completed' | 'partial' | 'abandoned' | 'refused' | 'pending'
}

// Simulate parent invitation flow
export async function simulateParentInvitationFlow(scenario: ParentTestScenario): Promise<InvitationTest> {
  const startTime = new Date()
  const test: InvitationTest = {
    success: false,
    timeline: {
      invitation_sent: startTime
    },
    engagement_metrics: {
      email_opens: 0,
      link_clicks: 0, 
      session_starts: 0,
      questions_answered: 0,
      total_questions: 26, // Standard assessment length
      completion_percentage: 0
    },
    barriers_encountered: scenario.completion_barriers || [],
    support_interactions: [],
    final_outcome: 'pending'
  }

  // Simulate response timing
  let responseDelay = 0
  switch (scenario.response_time) {
    case 'immediate': responseDelay = 0; break
    case 'within_day': responseDelay = Math.random() * 24 * 60 * 60 * 1000; break
    case 'within_week': responseDelay = Math.random() * 7 * 24 * 60 * 60 * 1000; break
    case 'needs_reminder': responseDelay = 3 * 24 * 60 * 60 * 1000; break // 3 days
    case 'never_responds': responseDelay = -1; break // Never responds
  }

  if (responseDelay === -1) {
    test.final_outcome = 'refused'
    return test
  }

  // Simulate email opening
  test.timeline.invitation_opened = new Date(startTime.getTime() + responseDelay)
  test.engagement_metrics.email_opens = scenario.scenario === 'busy_parent' ? Math.floor(Math.random() * 3) + 1 : 1

  // Simulate clicking assessment link
  if (scenario.scenario !== 'tech_challenged' || Math.random() > 0.3) {
    test.timeline.assessment_started = new Date(test.timeline.invitation_opened.getTime() + Math.random() * 60 * 60 * 1000)
    test.engagement_metrics.link_clicks = 1
    test.engagement_metrics.session_starts = 1
  }

  // Simulate assessment completion based on scenario
  switch (scenario.completion_rate) {
    case 'full':
      test.engagement_metrics.questions_answered = test.engagement_metrics.total_questions
      test.engagement_metrics.completion_percentage = 100
      test.timeline.assessment_completed = new Date(test.timeline.assessment_started!.getTime() + Math.random() * 30 * 60 * 1000)
      test.final_outcome = 'completed'
      test.success = true
      break
      
    case 'partial':
      test.engagement_metrics.questions_answered = Math.floor(test.engagement_metrics.total_questions * (0.3 + Math.random() * 0.4))
      test.engagement_metrics.completion_percentage = Math.floor((test.engagement_metrics.questions_answered / test.engagement_metrics.total_questions) * 100)
      test.final_outcome = 'partial'
      // Multiple session attempts for busy parents
      if (scenario.scenario === 'busy_parent') {
        test.engagement_metrics.session_starts = Math.floor(Math.random() * 3) + 2
        test.support_interactions.push("Abandoned mid-session", "Restarted assessment", "Requested mobile-friendly version")
      }
      break
      
    case 'abandoned':
      test.engagement_metrics.questions_answered = Math.floor(test.engagement_metrics.total_questions * Math.random() * 0.3)
      test.engagement_metrics.completion_percentage = Math.floor((test.engagement_metrics.questions_answered / test.engagement_metrics.total_questions) * 100)
      test.final_outcome = 'abandoned'
      if (scenario.scenario === 'tech_challenged') {
        test.support_interactions.push("Called school for help", "Requested paper version", "Asked for technical assistance")
      }
      break
      
    case 'refused':
      test.engagement_metrics.questions_answered = 0
      test.engagement_metrics.completion_percentage = 0
      test.final_outcome = 'refused'
      if (scenario.scenario === 'skeptical_parent') {
        test.support_interactions.push("Requested privacy policy", "Asked about data deletion", "Questioned assessment purpose")
      }
      break
  }

  // Add reminder if needed
  if (scenario.response_time === 'needs_reminder') {
    test.timeline.reminder_sent = new Date(startTime.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days
  }

  return test
}

// Test all parent scenarios
export async function testAllParentScenarios(): Promise<{
  success: boolean
  results: Record<string, InvitationTest>
  summary: {
    total_invitations: number
    completed: number
    partial: number
    abandoned: number
    refused: number
    completion_rate: number
    common_barriers: string[]
  }
}> {
  console.log('🔔 Testing parent invitation flow scenarios...')
  
  const results: Record<string, InvitationTest> = {}
  
  // Run each scenario
  for (const scenario of PARENT_TEST_SCENARIOS) {
    console.log(`Testing ${scenario.scenario}: ${scenario.parent_name}`)
    results[scenario.scenario] = await simulateParentInvitationFlow(scenario)
  }
  
  // Calculate summary statistics
  const outcomes = Object.values(results)
  const summary = {
    total_invitations: outcomes.length,
    completed: outcomes.filter(r => r.final_outcome === 'completed').length,
    partial: outcomes.filter(r => r.final_outcome === 'partial').length,
    abandoned: outcomes.filter(r => r.final_outcome === 'abandoned').length,
    refused: outcomes.filter(r => r.final_outcome === 'refused').length,
    completion_rate: 0,
    common_barriers: [] as string[]
  }
  
  summary.completion_rate = Math.round((summary.completed / summary.total_invitations) * 100)
  
  // Find common barriers
  const barrierCounts: Record<string, number> = {}
  outcomes.forEach(outcome => {
    outcome.barriers_encountered.forEach(barrier => {
      barrierCounts[barrier] = (barrierCounts[barrier] || 0) + 1
    })
  })
  
  summary.common_barriers = Object.entries(barrierCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([barrier]) => barrier)
  
  console.log('✅ Parent invitation flow testing completed')
  console.log(`📊 Results: ${summary.completion_rate}% completion rate, ${summary.common_barriers.length} common barriers identified`)
  
  return {
    success: true,
    results,
    summary
  }
}

// Create realistic parent accounts in database
export async function createParentAccounts(): Promise<{
  success: boolean
  parents_created: number
  errors: string[]
}> {
  if (!supabase) {
    return { success: false, parents_created: 0, errors: ['Supabase not configured'] }
  }

  console.log('👨‍👩‍👧‍👦 Creating parent accounts for testing...')
  
  const errors: string[] = []
  let created = 0

  try {
    for (const scenario of PARENT_TEST_SCENARIOS) {
      try {
        // Create parent profile (if parents table exists)
        const parentData = {
          email: scenario.parent_email,
          first_name: scenario.parent_name.split(' ')[0],
          last_name: scenario.parent_name.split(' ').slice(1).join(' '),
          preferred_language: scenario.languages[0] === 'Spanish' ? 'es' : 'en',
          communication_preferences: {
            email_updates: scenario.preferred_contact === 'email',
            sms_updates: scenario.preferred_contact === 'text', 
            assessment_notifications: true,
            progress_reports: true
          },
          verification_status: 'pending'
        }

        // Check if parent already exists
        const { data: existingParent } = await supabase
          .from('parents')
          .select('id')
          .eq('email', scenario.parent_email)
          .single()

        if (!existingParent) {
          const { error: parentError } = await supabase
            .from('parents')
            .insert([parentData])

          if (parentError && !parentError.message.includes('does not exist')) {
            errors.push(`Failed to create parent ${scenario.parent_name}: ${parentError.message}`)
          } else if (!parentError) {
            created++
            console.log(`✅ Created parent: ${scenario.parent_name}`)
          }
        } else {
          console.log(`Parent ${scenario.parent_name} already exists`)
        }

      } catch (error) {
        errors.push(`Error creating parent ${scenario.parent_name}: ${error.message}`)
      }
    }

    return {
      success: errors.length === 0,
      parents_created: created,
      errors
    }

  } catch (error) {
    return {
      success: false,
      parents_created: created, 
      errors: [`Parent creation failed: ${error.message}`]
    }
  }
}

// Generate parent invitation emails with realistic scenarios  
export function generateParentInvitationEmail(scenario: ParentTestScenario, teacherName: string, assignmentToken: string): {
  subject: string
  html_content: string
  text_content: string
} {
  const assessmentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/assessment/start?token=${assignmentToken}`
  
  const isSpanish = scenario.languages.includes('Spanish') && !scenario.languages.includes('English')
  
  if (isSpanish) {
    return {
      subject: `Perfil de Aprendizaje para ${scenario.child_name}`,
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1F2937;">Hola ${scenario.parent_name.split(' ')[0]},</h2>
          <p>Soy ${teacherName}, maestra de ${scenario.child_name}. Me encantaría conocer mejor cómo aprende ${scenario.child_name} para poder apoyarle mejor en el salón de clases.</p>
          <p>¿Podrías completar este breve cuestionario? Toma aproximadamente 10 minutos.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${assessmentUrl}" style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Comenzar Cuestionario</a>
          </div>
          <p>Si tienes preguntas, no dudes en contactarme.</p>
          <p>Gracias por tu tiempo,<br/>${teacherName}</p>
        </div>
      `,
      text_content: `Hola ${scenario.parent_name.split(' ')[0]}, soy ${teacherName}, maestra de ${scenario.child_name}. Por favor completa este cuestionario: ${assessmentUrl}`
    }
  }

  return {
    subject: `Learning Profile for ${scenario.child_name}`,
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1F2937;">Hi ${scenario.parent_name.split(' ')[0]},</h2>
        <p>I'm ${teacherName}, ${scenario.child_name}'s teacher. I'd love to learn more about how ${scenario.child_name} learns best so I can better support them in the classroom.</p>
        <p>Would you mind completing this brief questionnaire? It takes about 10 minutes and will help me understand ${scenario.child_name}'s learning style.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${assessmentUrl}" style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Assessment</a>
        </div>
        <p style="font-size: 14px; color: #6B7280;">This assessment is secure and private. Your responses will only be used to help ${scenario.child_name} succeed in school.</p>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Thank you for your time,<br/>${teacherName}</p>
      </div>
    `,
    text_content: `Hi ${scenario.parent_name.split(' ')[0]}, I'm ${teacherName}, ${scenario.child_name}'s teacher. Please complete this learning assessment: ${assessmentUrl}`
  }
}

export default {
  simulateParentInvitationFlow,
  testAllParentScenarios,
  createParentAccounts,
  generateParentInvitationEmail,
  PARENT_TEST_SCENARIOS
}