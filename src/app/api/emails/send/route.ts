// API route for sending individual emails
import { NextRequest, NextResponse } from 'next/server'
import { emailService, EmailSendRequest } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body: EmailSendRequest = await request.json()
    
    // Basic validation
    if (!body.to || !Array.isArray(body.to) || body.to.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients (to) are required' },
        { status: 400 }
      )
    }

    if (!body.subject || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = body.to.filter(email => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid email addresses: ${invalidEmails.join(', ')}` },
        { status: 400 }
      )
    }

    // Send email
    const result = await emailService.sendTemplatedEmail(body)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, details: result.details },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to test email service configuration
export async function GET() {
  try {
    const testResult = await emailService.testConfiguration()
    
    return NextResponse.json({
      success: testResult.success,
      configured: !!process.env.RESEND_API_KEY,
      error: testResult.error,
      message: testResult.success 
        ? 'Email service is properly configured' 
        : 'Email service configuration issue'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to test email configuration' },
      { status: 500 }
    )
  }
}