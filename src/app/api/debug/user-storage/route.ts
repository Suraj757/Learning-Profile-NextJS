import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, getRegisteredUsers, getDemoUsers } from '@/lib/auth/user-storage'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (email) {
      const user = getUserByEmail(email)
      return NextResponse.json({
        email,
        user,
        found: !!user
      })
    } else {
      const registeredUsers = getRegisteredUsers()
      const demoUsers = getDemoUsers()
      
      return NextResponse.json({
        registeredUsers: Array.from(registeredUsers.entries()),
        demoUsers,
        totalRegisteredUsers: registeredUsers.size
      })
    }
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Debug endpoint error' },
      { status: 500 }
    )
  }
}