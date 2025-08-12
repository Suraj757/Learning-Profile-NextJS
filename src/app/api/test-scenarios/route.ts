import { NextRequest, NextResponse } from 'next/server'
import { 
  createComprehensiveTestScenario, 
  createSpecificTeacherScenario,
  testNavigationFlow,
  cleanupTestData,
  TEST_TEACHERS
} from '@/lib/comprehensive-test-data'
import {
  testAllParentScenarios,
  createParentAccounts,
  PARENT_TEST_SCENARIOS
} from '@/lib/parent-invitation-flow'

export async function POST(request: NextRequest) {
  try {
    const { action, scenario, teacherEmail } = await request.json()

    switch (action) {
      case 'create_comprehensive':
        console.log('🚀 API: Creating comprehensive test scenario...')
        const comprehensive = await createComprehensiveTestScenario()
        return NextResponse.json(comprehensive)

      case 'create_specific':
        if (!scenario) {
          return NextResponse.json({ 
            success: false, 
            message: 'Scenario type required for specific creation' 
          })
        }
        console.log(`🎯 API: Creating ${scenario} teacher scenario...`)
        const specific = await createSpecificTeacherScenario(scenario)
        return NextResponse.json(specific)

      case 'test_navigation':
        if (!teacherEmail) {
          return NextResponse.json({ 
            success: false, 
            message: 'Teacher email required for navigation test' 
          })
        }
        console.log(`🔍 API: Testing navigation for ${teacherEmail}...`)
        const navTest = await testNavigationFlow(teacherEmail)
        return NextResponse.json(navTest)

      case 'cleanup':
        console.log('🧹 API: Cleaning up test data...')
        const cleanup = await cleanupTestData()
        return NextResponse.json(cleanup)

      case 'test_parent_flow':
        console.log('👨‍👩‍👧‍👦 API: Testing parent invitation flow...')
        const parentFlow = await testAllParentScenarios()
        return NextResponse.json(parentFlow)

      case 'create_parent_accounts':
        console.log('👨‍👩‍👧‍👦 API: Creating parent accounts...')
        const parentAccounts = await createParentAccounts()
        return NextResponse.json(parentAccounts)

      case 'list_teachers':
        return NextResponse.json({
          success: true,
          teachers: TEST_TEACHERS.map(t => ({
            email: t.email,
            name: t.name,
            scenario: t.scenario,
            description: t.description,
            school: t.school,
            grade_level: t.grade_level
          }))
        })

      case 'list_parents':
        return NextResponse.json({
          success: true,
          parents: PARENT_TEST_SCENARIOS.map(p => ({
            email: p.parent_email,
            name: p.parent_name,
            child_name: p.child_name,
            scenario: p.scenario,
            description: p.description,
            response_time: p.response_time,
            completion_rate: p.completion_rate
          }))
        })

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action. Use: create_comprehensive, create_specific, test_navigation, cleanup, list_teachers, test_parent_flow, create_parent_accounts, or list_parents' 
        })
    }
  } catch (error) {
    console.error('❌ Test scenarios API error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Unknown error occurred' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'list_teachers') {
    return NextResponse.json({
      success: true,
      teachers: TEST_TEACHERS.map(t => ({
        email: t.email,
        name: t.name,
        scenario: t.scenario,
        description: t.description,
        school: t.school,
        grade_level: t.grade_level,
        demo_data_level: t.demo_data_level,
        years_experience: t.years_experience
      }))
    })
  }

  if (action === 'list_parents') {
    return NextResponse.json({
      success: true,
      parents: PARENT_TEST_SCENARIOS.map(p => ({
        email: p.parent_email,
        name: p.parent_name,
        child_name: p.child_name,
        scenario: p.scenario,
        description: p.description,
        response_time: p.response_time,
        completion_rate: p.completion_rate,
        preferred_contact: p.preferred_contact,
        languages: p.languages
      }))
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Test scenarios API is ready',
    available_actions: [
      'create_comprehensive - Creates all test teachers and their data',
      'create_specific - Creates teachers for specific scenario (new/experienced/mixed_data/specialist/substitute)',
      'test_navigation - Tests navigation flow for specific teacher email',
      'test_parent_flow - Simulates parent invitation and completion scenarios',
      'create_parent_accounts - Creates parent accounts in database for testing',
      'cleanup - Removes all test data',
      'list_teachers - Lists all available test teacher scenarios',
      'list_parents - Lists all parent test scenarios'
    ],
    example_requests: {
      create_comprehensive: 'POST /api/test-scenarios { "action": "create_comprehensive" }',
      create_specific: 'POST /api/test-scenarios { "action": "create_specific", "scenario": "new" }',
      test_navigation: 'POST /api/test-scenarios { "action": "test_navigation", "teacherEmail": "sarah.martinez@riverside.edu" }',
      test_parent_flow: 'POST /api/test-scenarios { "action": "test_parent_flow" }',
      create_parent_accounts: 'POST /api/test-scenarios { "action": "create_parent_accounts" }',
      cleanup: 'POST /api/test-scenarios { "action": "cleanup" }',
      list_teachers: 'GET /api/test-scenarios?action=list_teachers',
      list_parents: 'GET /api/test-scenarios?action=list_parents'
    }
  })
}