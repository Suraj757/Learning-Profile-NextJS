import { NextRequest, NextResponse } from 'next/server'
import { GET as sessionGet } from '../session/route'

/**
 * Auth Verification Endpoint
 * 
 * This is an alias for the session endpoint to maintain compatibility
 * with authentication systems that expect /api/auth/verify.
 * 
 * Redirects all requests to the main session endpoint.
 */

export async function GET(request: NextRequest) {
  // Simply delegate to the session endpoint
  return sessionGet(request)
}

// For consistency, also support POST if needed
export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'POST not supported on verify endpoint. Use /api/auth/session instead.',
    redirect: '/api/auth/session'
  }, { status: 405 })
}