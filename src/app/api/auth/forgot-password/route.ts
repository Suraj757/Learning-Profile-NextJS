import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/auth/user-storage'

// In production, this would send actual emails
// For demo, we'll just return success and log the reset link
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = getUserByEmail(email)
    
    if (!user) {
      // For security, always return success even if user doesn't exist
      // This prevents email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, we have sent a password reset link.'
      })
    }

    // Generate password reset token (in production, store this securely)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/teacher/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // Log the reset link for demo purposes
    console.log(`[PASSWORD_RESET] Reset link for ${email}: ${resetUrl}`)
    
    // In production, you would:
    // 1. Store the resetToken with expiration in database
    // 2. Send email with reset link
    // 3. Verify token when user clicks the link

    // For demo, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
      // In demo mode, also return the reset link for testing
      resetLink: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}