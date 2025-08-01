// Email template system for teacher-parent communication

export interface EmailTemplateData {
  teacherName: string
  teacherEmail: string
  childName: string
  parentEmail: string
  schoolName?: string
  gradeLevel?: string
  assessmentLink: string
  dueDate?: string
}

// Default email templates
export const DEFAULT_TEMPLATES = {
  invitation: {
    subject: "Help Your Child's Teacher Understand Their Learning Style - {{childName}}",
    content: `Dear Parent/Guardian,

I hope this message finds you well! I'm {{teacherName}}, {{childName}}'s teacher this year{{#if schoolName}} at {{schoolName}}{{/if}}.

I'm excited to work with {{childName}} and want to ensure I understand their unique learning style from Day 1. To help me provide the best possible learning experience, I'm asking all families to complete a quick 5-minute Begin Learning Profile.

**What is the Begin Learning Profile?**
- A research-based assessment that identifies your child's learning strengths
- Takes just 5 minutes to complete
- Provides personalized recommendations for both home and school
- Helps me differentiate instruction from the very first day

**Complete {{childName}}'s Learning Profile:**
{{assessmentLink}}

The assessment focuses on the 6 C's framework: Communication, Collaboration, Content, Critical Thinking, Creative Innovation, and Confidence. Your responses will help me understand how {{childName}} learns best and what strategies will be most effective.

{{#if dueDate}}Please complete this by {{dueDate}} so I can review all profiles before our first parent-teacher conference.{{/if}}

Thank you for taking the time to help me understand {{childName}}'s unique learning style. Together, we can ensure they have an amazing year!

Best regards,
{{teacherName}}
{{#if schoolName}}{{schoolName}}{{/if}}
{{teacherEmail}}

---
This assessment is part of the Begin Learning Profile system, used by over 50,000 families to strengthen school-home connections.`
  },

  reminder: {
    subject: "Reminder: {{childName}}'s Learning Profile - Just 5 Minutes!",
    content: `Dear Parent/Guardian,

I hope you're having a great week! This is a friendly reminder about completing {{childName}}'s Begin Learning Profile.

I sent an assessment link a few days ago, and I wanted to follow up because understanding your child's learning style will really help me provide the best possible classroom experience for {{childName}}.

**Quick Assessment Link:**
{{assessmentLink}}

**Why this matters:**
- Takes only 5 minutes to complete
- Helps me understand how {{childName}} learns best
- Provides personalized recommendations for home and school
- Ensures I can differentiate instruction from Day 1

{{#if dueDate}}I'm hoping to have all profiles completed by {{dueDate}} so I can review them before our upcoming conferences.{{/if}}

If you have any questions about the assessment or need technical help, please don't hesitate to reach out to me directly.

Thank you for your partnership in {{childName}}'s education!

Warm regards,
{{teacherName}}
{{teacherEmail}}

P.S. The Begin Learning Profile is completely secure and only used to help me understand your child's learning preferences.`
  },

  thank_you: {
    subject: "Thank you! {{childName}}'s Learning Profile Complete",
    content: `Dear Parent/Guardian,

Thank you so much for completing {{childName}}'s Begin Learning Profile! I really appreciate you taking the time to help me understand their unique learning style.

**What I learned about {{childName}}:**
I've reviewed their learning profile and I'm excited to use these insights to:
- Tailor my teaching approach to their strengths
- Provide activities that match their learning preferences
- Ensure they feel confident and engaged in our classroom

**What's next:**
- I'll be incorporating these insights into my lesson planning
- You'll see personalized Begin product recommendations based on their profile
- We can discuss their learning style in more detail during parent-teacher conferences

**Your child's results:**
The full learning profile and personalized recommendations are available at the link you used to complete the assessment. You can reference this anytime and share it with other teachers or tutors.

Thank you again for this valuable partnership. I'm looking forward to a wonderful year with {{childName}}!

Best regards,
{{teacherName}}
{{#if schoolName}}{{schoolName}}{{/if}}
{{teacherEmail}}

---
Questions about Begin Learning Profiles? Visit our help center or contact support.`
  }
}

// Template rendering function (simple Handlebars-like syntax)
export function renderTemplate(template: string, data: EmailTemplateData): string {
  let rendered = template

  // Replace simple variables
  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(regex, value)
    }
  })

  // Handle conditional blocks {{#if variable}}...{{/if}}
  rendered = rendered.replace(/{{#if (\w+)}}(.*?){{\/if}}/gs, (match, variable, content) => {
    return data[variable as keyof EmailTemplateData] ? content : ''
  })

  // Clean up any remaining unused variables
  rendered = rendered.replace(/{{.*?}}/g, '')

  return rendered.trim()
}

// Generate assessment link with tracking
export function generateAssessmentLink(assignmentToken: string, baseUrl?: string): string {
  const domain = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${domain}/assessment/start?ref=${assignmentToken}&source=teacher`
}

// Validate email template
export function validateTemplate(template: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredVariables = ['teacherName', 'childName', 'assessmentLink']
  
  requiredVariables.forEach(variable => {
    if (!template.includes(`{{${variable}}}`)) {
      errors.push(`Missing required variable: {{${variable}}}`)
    }
  })

  if (template.length > 5000) {
    errors.push('Template is too long (max 5000 characters)')
  }

  if (template.length < 100) {
    errors.push('Template is too short (min 100 characters)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Preview template with sample data
export function previewTemplate(template: string): string {
  const sampleData: EmailTemplateData = {
    teacherName: 'Mrs. Johnson',
    teacherEmail: 'mjohnson@school.edu',
    childName: 'Emma',
    parentEmail: 'parent@email.com',
    schoolName: 'Lincoln Elementary',
    gradeLevel: '3rd Grade',
    assessmentLink: 'https://beginlearning.com/assessment/start?ref=abc123',
    dueDate: 'Friday, September 15th'
  }

  return renderTemplate(template, sampleData)
}