import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { ParentCommunicationTemplate, EnhancedStudentProfile } from '@/lib/types-enhanced'

/**
 * POST /api/teacher/communication/generate-template
 * 
 * Generate personalized parent communication templates based on:
 * - Student's learning profile and 6C scores
 * - Learning style-specific insights and strategies
 * - Recent progress and areas of focus
 * - Parent insights from assessments
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      student_id, 
      template_type, 
      tone = 'friendly', 
      length = 'detailed',
      custom_context = '',
      specific_topics = []
    } = body

    if (!student_id || !template_type) {
      return NextResponse.json(
        { error: 'Missing required fields: student_id and template_type' },
        { status: 400 }
      )
    }

    // Get student profile and related data
    const { data: studentProfile, error: profileError } = await supabase
      .from('enhanced_student_profiles')
      .select(`
        *,
        profiles:profile_id (
          id,
          child_name,
          grade,
          personality_label,
          scores,
          description,
          created_at
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
      .eq('id', student_id)
      .single()

    if (profileError || !studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Get recent progress data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const { data: recentProgress } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_profile_id', student_id)
      .gte('date_recorded', thirtyDaysAgo.toISOString())
      .order('date_recorded', { ascending: false })

    // Get risk factors if any
    const { data: riskFactors } = await supabase
      .from('student_risk_factors')
      .select('*')
      .eq('student_profile_id', student_id)
      .eq('status', 'active')

    // Transform data into enhanced student profile
    const profile = studentProfile.profiles as any
    const enhancedStudent: EnhancedStudentProfile = {
      id: studentProfile.id,
      name: profile.child_name,
      grade: profile.grade,
      classroom_id: studentProfile.classroom_id,
      learning_style: getLearningStyleFromLabel(profile.personality_label),
      six_c_scores: {
        communication: studentProfile.communication_score,
        collaboration: studentProfile.collaboration_score,
        content: studentProfile.content_score,
        critical_thinking: studentProfile.critical_thinking_score,
        creative_innovation: studentProfile.creative_innovation_score,
        confidence: studentProfile.confidence_score
      },
      risk_factors: (riskFactors || []).map(rf => ({
        id: rf.id,
        type: rf.risk_type,
        severity: rf.severity,
        description: rf.description,
        indicators: rf.indicators || [],
        intervention_strategies: rf.intervention_strategies || [],
        timeline: rf.timeline
      })),
      seating_preferences: studentProfile.seating_preferences || {},
      parent_insights: (studentProfile.parent_insights || []).map((pi: any) => ({
        id: pi.id,
        category: pi.category,
        insight: pi.insight,
        relevance_score: pi.relevance_score,
        communication_strategies: pi.communication_strategies || [],
        talking_points: pi.talking_points || []
      })),
      progress_timeline: (recentProgress || []).map(pd => ({
        id: pd.id,
        date: pd.date_recorded,
        metric_type: pd.metric_type,
        metric_name: pd.metric_name,
        value: parseFloat(pd.value.toString()),
        max_value: parseFloat(pd.max_value.toString()),
        notes: pd.notes,
        context: pd.context
      })),
      created_at: studentProfile.created_at,
      updated_at: studentProfile.updated_at,
      last_assessment_date: studentProfile.last_assessment_date,
      teaching_style_compatibility: studentProfile.teaching_compatibility || {},
      engagement_level: studentProfile.engagement_level,
      participation_frequency: studentProfile.participation_frequency,
      peer_interaction_quality: studentProfile.peer_interaction_quality
    }

    // Generate the communication template
    const template = generateCommunicationTemplate(
      enhancedStudent,
      template_type,
      tone,
      length,
      custom_context,
      specific_topics
    )

    // Save the template to database
    const { data: savedTemplate, error: saveError } = await supabase
      .from('parent_communication_templates')
      .insert({
        student_profile_id: student_id,
        template_type,
        subject_line: template.subject_line,
        greeting: template.greeting,
        main_content: template.main_content,
        learning_style_insights: template.learning_style_insights,
        specific_examples: template.specific_examples,
        action_items: template.action_items,
        closing: template.closing,
        tone,
        length
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving template:', saveError)
      // Still return the generated template even if save fails
    }

    return NextResponse.json({
      template,
      saved_template_id: savedTemplate?.id
    })

  } catch (error) {
    console.error('Error generating communication template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/teacher/communication/generate-template
 * 
 * Get saved communication templates for a student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const url = new URL(request.url)
    const studentId = url.searchParams.get('student_id')
    const templateType = url.searchParams.get('template_type')

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing student_id parameter' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('parent_communication_templates')
      .select('*')
      .eq('student_profile_id', studentId)
      .order('generated_at', { ascending: false })

    if (templateType) {
      query = query.eq('template_type', templateType)
    }

    const { data: templates, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    return NextResponse.json({ templates: templates || [] })

  } catch (error) {
    console.error('Error fetching communication templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Template generation functions
function generateCommunicationTemplate(
  student: EnhancedStudentProfile,
  templateType: string,
  tone: string,
  length: string,
  customContext: string,
  specificTopics: string[]
): ParentCommunicationTemplate {
  const template: ParentCommunicationTemplate = {
    id: `template-${Date.now()}`,
    template_type: templateType as any,
    student_profile: student,
    subject_line: generateSubjectLine(student, templateType, tone),
    greeting: generateGreeting(student, tone),
    main_content: generateMainContent(student, templateType, length, customContext, specificTopics),
    learning_style_insights: generateLearningStyleInsights(student),
    specific_examples: generateSpecificExamples(student, templateType),
    action_items: generateActionItems(student, templateType),
    closing: generateClosing(student, tone),
    tone: tone as any,
    length: length as any,
    generated_at: new Date().toISOString()
  }

  return template
}

function generateSubjectLine(student: EnhancedStudentProfile, templateType: string, tone: string): string {
  const name = student.name
  
  switch (templateType) {
    case 'introduction':
      return tone === 'formal' 
        ? `Learning Profile Introduction for ${name}`
        : `Getting to know ${name} as a learner!`
    
    case 'progress_update':
      return tone === 'formal'
        ? `Academic Progress Update - ${name}`
        : `Great things happening with ${name}!`
    
    case 'challenge_discussion':
      return tone === 'concerned'
        ? `Important discussion about ${name}'s learning`
        : `Working together to support ${name}`
    
    case 'celebration':
      return `Celebrating ${name}'s awesome progress!`
    
    case 'conference_prep':
      return `Preparing for ${name}'s parent conference`
    
    default:
      return `Update about ${name}`
  }
}

function generateGreeting(student: EnhancedStudentProfile, tone: string): string {
  const greetings = {
    formal: "Dear Parent/Guardian,",
    friendly: "Hello!",
    encouraging: "Hi there!",
    concerned: "Dear Parent/Guardian,"
  }
  
  return greetings[tone as keyof typeof greetings] || greetings.friendly
}

function generateMainContent(
  student: EnhancedStudentProfile,
  templateType: string,
  length: string,
  customContext: string,
  specificTopics: string[]
): string {
  const name = student.name
  const learningStyle = student.learning_style
  const strengths = getTopStrengths(student)
  
  let content = ""

  // Add custom context if provided
  if (customContext) {
    content += `${customContext}\n\n`
  }

  switch (templateType) {
    case 'introduction':
      content += generateIntroductionContent(student, length)
      break
    
    case 'progress_update':
      content += generateProgressUpdateContent(student, length)
      break
    
    case 'challenge_discussion':
      content += generateChallengeDiscussionContent(student, length)
      break
    
    case 'celebration':
      content += generateCelebrationContent(student, length)
      break
    
    case 'conference_prep':
      content += generateConferencePrepContent(student, length)
      break
    
    default:
      content += `I wanted to share some insights about ${name}'s learning journey with you.`
  }

  // Add specific topics if requested
  if (specificTopics.length > 0) {
    content += `\n\nSpecifically, I'd like to discuss:\n`
    specificTopics.forEach(topic => {
      content += `• ${topic}\n`
    })
  }

  return content
}

function generateIntroductionContent(student: EnhancedStudentProfile, length: string): string {
  const name = student.name
  const learningStyle = student.learning_style
  const grade = student.grade
  
  let content = `I'm excited to share ${name}'s learning profile with you! `
  
  if (length === 'comprehensive') {
    content += `Based on our recent assessment, ${name} shows a strong ${learningStyle} learning style, which means they thrive when learning opportunities align with their natural preferences.\n\n`
    
    content += `Here's what this means for ${name}:\n`
    content += generateLearningStyleExplanation(learningStyle)
    
    content += `\n\nI've also identified ${name}'s strongest areas in our 6C framework:\n`
    content += generateStrengthsOverview(student)
    
  } else if (length === 'detailed') {
    content += `${name} is a ${learningStyle} learner, which gives us valuable insights into how they learn best.\n\n`
    content += generateLearningStyleExplanation(learningStyle)
    
  } else {
    content += `${name} is a ${learningStyle} learner, and I'm excited to tailor their learning experience accordingly!`
  }
  
  return content
}

function generateProgressUpdateContent(student: EnhancedStudentProfile, length: string): string {
  const name = student.name
  const recentProgress = student.progress_timeline.slice(0, 3) // Most recent 3 entries
  
  let content = `I wanted to update you on ${name}'s recent progress in our classroom.\n\n`
  
  if (recentProgress.length > 0) {
    content += `Recent highlights:\n`
    recentProgress.forEach(progress => {
      const percentage = Math.round((progress.value / progress.max_value) * 100)
      content += `• ${progress.metric_name}: ${percentage}% (${progress.notes || 'showing good progress'})\n`
    })
    content += `\n`
  }
  
  // Add engagement insights
  const engagementLevel = student.engagement_level
  if (engagementLevel >= 4) {
    content += `${name} has been highly engaged in classroom activities, particularly excelling in areas that align with their ${student.learning_style} learning style.\n\n`
  } else if (engagementLevel >= 3) {
    content += `${name} shows good engagement overall, and I'm working to incorporate more ${student.learning_style} learning opportunities.\n\n`
  } else {
    content += `I'm focusing on increasing ${name}'s engagement by incorporating more activities that match their ${student.learning_style} learning preferences.\n\n`
  }
  
  if (length === 'comprehensive') {
    content += generateDetailedProgressAnalysis(student)
  }
  
  return content
}

function generateChallengeDiscussionContent(student: EnhancedStudentProfile, length: string): string {
  const name = student.name
  const challenges = student.risk_factors.filter(rf => rf.severity === 'medium' || rf.severity === 'high')
  
  let content = `I wanted to reach out to discuss some areas where ${name} could benefit from additional support.\n\n`
  
  if (challenges.length > 0) {
    content += `I've noticed that ${name} may be experiencing some challenges with:\n`
    challenges.forEach(challenge => {
      content += `• ${challenge.description}\n`
    })
    content += `\n`
    
    content += `The good news is that these are common challenges, and I have specific strategies we can implement to help ${name} succeed.\n\n`
    
    if (length !== 'brief') {
      content += `Based on ${name}'s ${student.learning_style} learning style, here are some approaches that typically work well:\n`
      content += generateLearningStyleStrategies(student.learning_style, challenges)
    }
  } else {
    content += `While ${name} is generally doing well, I wanted to proactively discuss some strategies to help them reach their full potential.\n\n`
  }
  
  return content
}

function generateCelebrationContent(student: EnhancedStudentProfile, length: string): string {
  const name = student.name
  const strengths = getTopStrengths(student)
  
  let content = `I have some wonderful news to share about ${name}!\n\n`
  
  content += `${name} has been absolutely shining in the classroom recently. Here are some specific highlights:\n\n`
  
  // Find recent positive progress
  const positiveProgress = student.progress_timeline
    .filter(p => p.value / p.max_value >= 0.8)
    .slice(0, 3)
  
  if (positiveProgress.length > 0) {
    positiveProgress.forEach(progress => {
      const percentage = Math.round((progress.value / progress.max_value) * 100)
      content += `🌟 ${progress.metric_name}: ${percentage}% - ${progress.notes || 'Excellent work!'}\n`
    })
    content += `\n`
  }
  
  content += `What I find particularly impressive is how ${name} leverages their ${student.learning_style} learning style. `
  content += generateSuccessStoryExamples(student)
  
  if (length === 'comprehensive') {
    content += `\n\n${name}'s growth in the 6C areas has been remarkable:\n`
    content += generateDetailedCelebration(student)
  }
  
  return content
}

function generateConferencePrepContent(student: EnhancedStudentProfile, length: string): string {
  const name = student.name
  
  let content = `I'm looking forward to our upcoming parent conference to discuss ${name}'s progress and learning journey.\n\n`
  
  content += `To make our time together as productive as possible, here's what we'll be discussing:\n\n`
  
  content += `📊 Academic Progress:\n`
  content += generateAcademicSummary(student)
  
  content += `\n\n🎯 Learning Style Insights:\n`
  content += `${name} is a ${student.learning_style} learner, which means they particularly excel when ${getLearningStyleDescription(student.learning_style)}\n`
  
  content += `\n\n💪 Strengths & Growth Areas:\n`
  content += generateStrengthsAndGrowthAreas(student)
  
  if (student.risk_factors.length > 0) {
    content += `\n\n🤝 Areas for Collaboration:\n`
    content += `We'll discuss strategies to support ${name} in areas where they may need additional encouragement.\n`
  }
  
  content += `\n\nPlease come prepared with any questions or concerns you'd like to discuss. I'm here to support ${name}'s success!`
  
  return content
}

function generateLearningStyleInsights(student: EnhancedStudentProfile): string {
  const learningStyle = student.learning_style
  const name = student.name
  
  let insights = `As a ${learningStyle} learner, ${name} `
  
  switch (learningStyle) {
    case 'creative':
      insights += `thrives when given opportunities for self-expression, open-ended projects, and creative problem-solving. They often think outside the box and benefit from activities that allow for multiple solutions or approaches.`
      break
    
    case 'analytical':
      insights += `excels with structured, step-by-step approaches to learning. They appreciate clear expectations, logical sequences, and opportunities to dig deep into understanding the 'why' behind concepts.`
      break
    
    case 'collaborative':
      insights += `learns best through interaction with others. They shine in group settings, peer discussions, and activities where they can share ideas and learn from their classmates.`
      break
    
    case 'confident':
      insights += `benefits from leadership opportunities, challenging tasks, and situations where they can take initiative. They're natural motivators and often help boost their classmates' confidence too.`
      break
  }
  
  // Add specific insights from parent data if available
  const parentInsights = student.parent_insights.filter(pi => pi.relevance_score >= 7)
  if (parentInsights.length > 0) {
    insights += `\n\nThis aligns perfectly with what you've shared about ${name} at home: "${parentInsights[0].insight}"`
  }
  
  return insights
}

function generateSpecificExamples(student: EnhancedStudentProfile, templateType: string): string[] {
  const examples: string[] = []
  const name = student.name
  const learningStyle = student.learning_style
  
  // Generate examples based on template type and learning style
  switch (templateType) {
    case 'introduction':
    case 'progress_update':
      examples.push(`${name} particularly excels during ${getLearningStyleActivity(learningStyle)} activities`)
      examples.push(`I've noticed ${name} ${getLearningStyleBehavior(learningStyle)}`)
      if (student.progress_timeline.length > 0) {
        const recentProgress = student.progress_timeline[0]
        examples.push(`Recent success: ${recentProgress.metric_name} - ${recentProgress.notes || 'showed great improvement'}`)
      }
      break
    
    case 'celebration':
      examples.push(`${name} amazed me when they ${generateSuccessExample(student)}`)
      examples.push(`Their ${learningStyle} approach really shined during ${generateActivityExample(learningStyle)}`)
      break
      
    case 'challenge_discussion':
      if (student.risk_factors.length > 0) {
        examples.push(`I've observed that ${name} ${generateChallengeExample(student.risk_factors[0])}`)
      }
      examples.push(`With the right support, ${name} can leverage their ${learningStyle} strengths to overcome this`)
      break
  }
  
  return examples
}

function generateActionItems(student: EnhancedStudentProfile, templateType: string): string[] {
  const actionItems: string[] = []
  const name = student.name
  const learningStyle = student.learning_style
  
  switch (templateType) {
    case 'introduction':
      actionItems.push(`Try incorporating ${getLearningStyleHomeTip(learningStyle)} during homework time`)
      actionItems.push(`Ask ${name} to explain new concepts in their own words`)
      actionItems.push(`Celebrate their unique ${learningStyle} approach to problem-solving`)
      break
    
    case 'progress_update':
      if (student.engagement_level < 4) {
        actionItems.push(`Continue encouraging ${name}'s ${learningStyle} learning preferences at home`)
      }
      actionItems.push(`Keep an eye out for ${name} applying classroom learning at home`)
      actionItems.push(`Share any observations about ${name}'s learning preferences you notice`)
      break
    
    case 'challenge_discussion':
      student.risk_factors.forEach(rf => {
        rf.intervention_strategies.slice(0, 2).forEach(strategy => {
          actionItems.push(adaptStrategyForParents(strategy, name))
        })
      })
      actionItems.push(`Schedule a follow-up conversation in 2 weeks to discuss progress`)
      break
    
    case 'celebration':
      actionItems.push(`Continue encouraging ${name}'s ${learningStyle} strengths`)
      actionItems.push(`Ask ${name} to share what they're most proud of in school`)
      actionItems.push(`Celebrate this success together as a family!`)
      break
    
    case 'conference_prep':
      actionItems.push(`Think about any questions or concerns you'd like to discuss`)
      actionItems.push(`Consider ${name}'s learning preferences you've observed at home`)
      actionItems.push(`Bring any work samples or examples you'd like to share`)
      break
  }
  
  return actionItems.filter(item => item.length > 0)
}

function generateClosing(student: EnhancedStudentProfile, tone: string): string {
  const name = student.name
  
  const closings = {
    formal: `Thank you for your partnership in supporting ${name}'s educational journey. Please don't hesitate to reach out if you have any questions or concerns.\n\nSincerely,\n[Teacher Name]`,
    
    friendly: `I'm so grateful to have ${name} in our classroom and to partner with you in their learning journey. Please reach out anytime!\n\nBest regards,\n[Teacher Name]`,
    
    encouraging: `${name} is lucky to have such supportive parents, and I'm excited to continue working together to help them thrive!\n\nWith appreciation,\n[Teacher Name]`,
    
    concerned: `I appreciate your partnership as we work together to support ${name}. Please feel free to contact me with any questions or to schedule a follow-up conversation.\n\nSincerely,\n[Teacher Name]`
  }
  
  return closings[tone as keyof typeof closings] || closings.friendly
}

// Helper functions
function getLearningStyleFromLabel(label: string): any {
  if (label.toLowerCase().includes('creative')) return 'creative'
  if (label.toLowerCase().includes('analytical')) return 'analytical'
  if (label.toLowerCase().includes('collaborative')) return 'collaborative'
  if (label.toLowerCase().includes('confident')) return 'confident'
  return 'creative'
}

function getTopStrengths(student: EnhancedStudentProfile): string[] {
  const scores = student.six_c_scores
  const strengths: Array<{name: string, score: number}> = [
    { name: 'Communication', score: scores.communication },
    { name: 'Collaboration', score: scores.collaboration },
    { name: 'Content Mastery', score: scores.content },
    { name: 'Critical Thinking', score: scores.critical_thinking },
    { name: 'Creative Innovation', score: scores.creative_innovation },
    { name: 'Confidence', score: scores.confidence }
  ]
  
  return strengths
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.name)
}

function getLearningStyleActivity(learningStyle: string): string {
  const activities = {
    creative: 'open-ended art projects and creative writing',
    analytical: 'step-by-step problem solving and research activities', 
    collaborative: 'group discussions and peer learning',
    confident: 'presentation opportunities and leadership roles'
  }
  return activities[learningStyle as keyof typeof activities] || 'various learning'
}

function getLearningStyleBehavior(learningStyle: string): string {
  const behaviors = {
    creative: 'comes up with unique solutions and approaches',
    analytical: 'asks thoughtful questions and seeks to understand processes',
    collaborative: 'helps facilitate group work and includes all voices',
    confident: 'takes initiative and encourages their classmates'
  }
  return behaviors[learningStyle as keyof typeof behaviors] || 'engages actively'
}

function getLearningStyleHomeTip(learningStyle: string): string {
  const tips = {
    creative: 'visual aids, drawing, or creative storytelling',
    analytical: 'breaking tasks into clear steps and using organizers',
    collaborative: 'discussing concepts together or teaching siblings',
    confident: 'letting them lead explanations and set their own goals'
  }
  return tips[learningStyle as keyof typeof tips] || 'varied approaches'
}

function generateSuccessExample(student: EnhancedStudentProfile): string {
  const examples = [
    'solved a problem in a completely unique way',
    'helped a classmate understand a difficult concept',
    'took initiative on a challenging project',
    'demonstrated incredible creativity in their approach',
    'showed remarkable persistence and growth mindset'
  ]
  return examples[Math.floor(Math.random() * examples.length)]
}

function generateActivityExample(learningStyle: string): string {
  const activities = {
    creative: 'our creative problem-solving challenge',
    analytical: 'our research and analysis project',
    collaborative: 'our group presentation',
    confident: 'their leadership of the team activity'
  }
  return activities[learningStyle as keyof typeof activities] || 'classroom activities'
}

function generateLearningStyleExplanation(learningStyle: string): string {
  const explanations = {
    creative: 'Creative learners thrive with opportunities for self-expression, imagination, and finding unique solutions to problems. They often excel when given choices in how to demonstrate their learning.',
    
    analytical: 'Analytical learners prefer structured, logical approaches to learning. They excel when given clear steps, detailed explanations, and opportunities to understand the reasoning behind concepts.',
    
    collaborative: 'Collaborative learners flourish in social learning environments. They learn best through discussion, group work, and opportunities to share ideas with others.',
    
    confident: 'Confident learners benefit from leadership opportunities and challenging tasks. They often excel when given responsibility and chances to help others succeed.'
  }
  return explanations[learningStyle as keyof typeof explanations] || ''
}

function adaptStrategyForParents(strategy: string, studentName: string): string {
  // Convert classroom strategies to home-appropriate versions
  const adaptations: Record<string, string> = {
    'Check in with student': `Have regular one-on-one conversations with ${studentName} about their day`,
    'Provide visual aids': `Use visual organizers or drawings to help ${studentName} with homework`,
    'Offer choices': `Give ${studentName} options in how they approach homework or chores`,
    'Break tasks into steps': `Help ${studentName} break larger assignments into smaller, manageable parts`,
    'Encourage peer interaction': `Arrange study sessions or playdates with classmates`,
    'Create structured environment': `Establish consistent homework routines and organized study spaces`
  }
  
  return adaptations[strategy] || `Support ${studentName} by ${strategy.toLowerCase()}`
}