import { NextRequest, NextResponse } from 'next/server'

// Simple email validation for the test system
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      }, { status: 400 })
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(email)
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Please enter a valid email address'
      }, { status: 400 })
    }
    
    // Check if it's an educational email
    const domain = email.split('@')[1]?.toLowerCase()
    const isEducational = domain?.includes('.edu') || 
                         domain?.includes('school') || 
                         domain?.includes('district')
    
    return NextResponse.json({
      success: true,
      valid: true,
      email: email.toLowerCase(),
      domain: {
        name: domain,
        isEducational,
        type: isEducational ? 'educational' : 'personal'
      }
    })
    
  } catch (error) {
    console.error('Email validation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unable to validate email at this time'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 })
    }
    
    const domain = email.split('@')[1]?.toLowerCase()
    const isEducational = domain?.includes('.edu') || 
                         domain?.includes('school') || 
                         domain?.includes('district')
    
    return NextResponse.json({
      success: true,
      email: email.toLowerCase(),
      isEducational,
      domainType: isEducational ? 'educational' : 'personal'
    })
    
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unable to check email'
    }, { status: 500 })
  }
}