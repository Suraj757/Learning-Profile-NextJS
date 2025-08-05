// API route for sending bulk emails (assessment invitations, reminders, etc.)
import { NextRequest, NextResponse } from 'next/server'
import { emailService, BulkEmailRequest } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body: BulkEmailRequest = await request.json()
    
    // Basic validation
    if (!body.emails || !Array.isArray(body.emails) || body.emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email list is required' },
        { status: 400 }
      )
    }

    if (!body.templateType || !['invitation', 'reminder', 'thank_you'].includes(body.templateType)) {
      return NextResponse.json(
        { success: false, error: 'Valid template type is required (invitation, reminder, thank_you)' },
        { status: 400 }
      )
    }

    // Validate email format and required template data
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validationErrors: string[] = []

    body.emails.forEach((email, index) => {
      if (!emailRegex.test(email.to)) {
        validationErrors.push(`Invalid email at index ${index}: ${email.to}`)
      }
      
      if (!email.templateData?.teacherName) {
        validationErrors.push(`Missing teacherName at index ${index}`)
      }
      
      if (!email.templateData?.childName) {
        validationErrors.push(`Missing childName at index ${index}`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation errors', details: validationErrors },
        { status: 400 }
      )
    }

    // Limit bulk email size to prevent abuse
    if (body.emails.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Bulk email limited to 500 recipients per request' },
        { status: 400 }
      )
    }

    console.log(`Sending ${body.emails.length} ${body.templateType} emails...`)

    // Send bulk emails
    const result = await emailService.sendBulkTemplatedEmails(body)
    
    console.log(`Bulk email result: ${result.sent} sent, ${result.failed} failed`)

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: body.emails.length,
      results: result.results,
      message: `Successfully sent ${result.sent} emails, ${result.failed} failed`
    })

  } catch (error) {
    console.error('Bulk email API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}