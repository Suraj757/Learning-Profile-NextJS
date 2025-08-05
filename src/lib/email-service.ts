// Email service for teacher-parent communication
import { Resend } from 'resend'
import { renderTemplate, DEFAULT_TEMPLATES, EmailTemplateData } from './email-templates'

// Initialize Resend client (conditionally for build compatibility)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailSendRequest {
  to: string[]
  subject: string
  content: string
  templateType?: 'invitation' | 'reminder' | 'thank_you' | 'custom'
  templateData?: EmailTemplateData
  replyTo?: string
  tags?: string[]
}

export interface EmailSendResponse {
  success: boolean
  messageId?: string
  error?: string
  details?: any
}

export interface BulkEmailRequest {
  emails: Array<{
    to: string
    templateData: EmailTemplateData
  }>
  templateType: 'invitation' | 'reminder' | 'thank_you'
  replyTo?: string
  tags?: string[]
}

export interface BulkEmailResponse {
  success: boolean
  sent: number
  failed: number
  results: Array<{
    email: string
    success: boolean
    messageId?: string
    error?: string
  }>
}

export class EmailService {
  private fromEmail: string
  private fromName: string

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'learning-profiles@beginlearning.com'
    this.fromName = process.env.FROM_NAME || 'Begin Learning Profiles'
  }

  /**
   * Send a single email using a template
   */
  async sendTemplatedEmail(request: EmailSendRequest): Promise<EmailSendResponse> {
    try {
      // Validate API key
      if (!process.env.RESEND_API_KEY) {
        return {
          success: false,
          error: 'Email service not configured (missing RESEND_API_KEY)'
        }
      }

      // Get template content
      let subject = request.subject
      let content = request.content

      if (request.templateType && request.templateData) {
        const template = DEFAULT_TEMPLATES[request.templateType]
        subject = renderTemplate(template.subject, request.templateData)
        content = renderTemplate(template.content, request.templateData)
      }

      // Check if Resend is initialized
      if (!resend) {
        return {
          success: false,
          error: 'Email service not configured (Resend client not initialized)'
        }
      }

      // Send email
      const result = await resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: request.to,
        subject: subject,
        html: this.formatEmailHTML(content),
        text: content,
        reply_to: request.replyTo,
        tags: request.tags?.map(tag => ({ name: 'category', value: tag }))
      })

      if (result.error) {
        console.error('Email send error:', result.error)
        return {
          success: false,
          error: result.error.message || 'Failed to send email',
          details: result.error
        }
      }

      return {
        success: true,
        messageId: result.data?.id,
      }

    } catch (error) {
      console.error('Email service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email service error',
        details: error
      }
    }
  }

  /**
   * Send emails to multiple recipients with personalized content
   */
  async sendBulkTemplatedEmails(request: BulkEmailRequest): Promise<BulkEmailResponse> {
    const results: BulkEmailResponse['results'] = []
    let sent = 0
    let failed = 0

    // Send emails in batches to avoid rate limits
    const batchSize = 10
    const batches = this.chunkArray(request.emails, batchSize)

    for (const batch of batches) {
      const batchPromises = batch.map(async (emailData) => {
        const emailRequest: EmailSendRequest = {
          to: [emailData.to],
          subject: '', // Will be filled by template
          content: '', // Will be filled by template
          templateType: request.templateType,
          templateData: emailData.templateData,
          replyTo: request.replyTo,
          tags: request.tags
        }

        const result = await this.sendTemplatedEmail(emailRequest)
        
        if (result.success) {
          sent++
        } else {
          failed++
        }

        return {
          email: emailData.to,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Small delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(100)
      }
    }

    return {
      success: sent > 0,
      sent,
      failed,
      results
    }
  }

  /**
   * Send assessment invitation emails to parents
   */
  async sendAssessmentInvitations(
    students: Array<{
      childName: string
      parentEmail: string
      assignmentToken: string
    }>,
    teacherData: {
      teacherName: string
      teacherEmail: string
      schoolName?: string
      gradeLevel?: string
      dueDate?: string
    }
  ): Promise<BulkEmailResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://learning-profile-next.vercel.app'
    
    const emails = students.map(student => ({
      to: student.parentEmail,
      templateData: {
        ...teacherData,
        childName: student.childName,
        parentEmail: student.parentEmail,
        assessmentLink: `${baseUrl}/assessment/start?ref=${student.assignmentToken}&source=teacher`
      }
    }))

    return this.sendBulkTemplatedEmails({
      emails,
      templateType: 'invitation',
      replyTo: teacherData.teacherEmail,
      tags: ['assessment-invitation', 'teacher-communication']
    })
  }

  /**
   * Send reminder emails for incomplete assessments
   */
  async sendAssessmentReminders(
    students: Array<{
      childName: string
      parentEmail: string
      assignmentToken: string
    }>,
    teacherData: {
      teacherName: string
      teacherEmail: string
      schoolName?: string
      gradeLevel?: string
      dueDate?: string
    }
  ): Promise<BulkEmailResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://learning-profile-next.vercel.app'
    
    const emails = students.map(student => ({
      to: student.parentEmail,
      templateData: {
        ...teacherData,
        childName: student.childName,
        parentEmail: student.parentEmail,
        assessmentLink: `${baseUrl}/assessment/start?ref=${student.assignmentToken}&source=teacher`
      }
    }))

    return this.sendBulkTemplatedEmails({
      emails,
      templateType: 'reminder',
      replyTo: teacherData.teacherEmail,
      tags: ['assessment-reminder', 'teacher-communication']
    })
  }

  /**
   * Send thank you emails for completed assessments
   */
  async sendThankYouEmails(
    students: Array<{
      childName: string
      parentEmail: string
    }>,
    teacherData: {
      teacherName: string
      teacherEmail: string
      schoolName?: string
      gradeLevel?: string
    }
  ): Promise<BulkEmailResponse> {
    const emails = students.map(student => ({
      to: student.parentEmail,
      templateData: {
        ...teacherData,
        childName: student.childName,
        parentEmail: student.parentEmail,
        assessmentLink: '' // Not needed for thank you emails
      }
    }))

    return this.sendBulkTemplatedEmails({
      emails,
      templateType: 'thank_you',
      replyTo: teacherData.teacherEmail,
      tags: ['assessment-thank-you', 'teacher-communication']
    })
  }

  /**
   * Format plain text content as HTML email
   */
  private formatEmailHTML(content: string): string {
    // Convert line breaks to HTML breaks
    let html = content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')
    
    // Wrap in paragraph tags
    html = `<p>${html}</p>`
    
    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Convert links
    html = html.replace(/https?:\/\/[^\s]+/g, '<a href="$&" style="color: #3b82f6;">$&</a>')
    
    // Add email styling
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        ${html}
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This email was sent from the Begin Learning Profile platform.</p>
        </div>
      </div>
    `
  }

  /**
   * Utility function to chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Test email service configuration
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        return { success: false, error: 'RESEND_API_KEY not configured' }
      }

      if (!resend) {
        return { success: false, error: 'Resend client not initialized' }
      }

      // Send a test email to the configured from address
      const result = await resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [this.fromEmail],
        subject: 'Email Service Test',
        text: 'This is a test email to verify the email service is working correctly.'
      })

      if (result.error) {
        return { success: false, error: result.error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export types for use in API routes
export type { EmailSendRequest, EmailSendResponse, BulkEmailRequest, BulkEmailResponse }