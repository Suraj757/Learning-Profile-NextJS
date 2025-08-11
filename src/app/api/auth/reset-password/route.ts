import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, updateUser } from '@/lib/auth/user-storage'

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // In production, you would:
    // 1. Verify the token hasn't expired
    // 2. Check token against stored reset tokens
    // 3. Ensure token is valid for this user
    
    // For demo purposes, we'll accept any token
    // In production, add proper token verification here

    // Hash the new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Update user with new password
    const updateResult = updateUser(email, {
      passwordHash,
      needsPasswordSetup: false, // User has now set up their password
      updatedAt: new Date().toISOString()
    })

    if (!updateResult) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Log successful password reset
    console.log(`[PASSWORD_RESET] Successful password reset for: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error during password reset' },
      { status: 500 }
    )
  }
}