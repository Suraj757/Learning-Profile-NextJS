/**
 * Test Runner for Comprehensive Education App Testing
 * Command-line interface for running test scenarios
 */

import { createComprehensiveTestScenario, testNavigationFlow, TEST_TEACHERS, cleanupTestData } from './comprehensive-test-data'
import { testAllParentScenarios, createParentAccounts } from './parent-invitation-flow'

export interface TestPlan {
  name: string
  description: string
  steps: TestStep[]
}

export interface TestStep {
  name: string
  action: () => Promise<any>
  expected: string
}

export const TEST_PLANS: TestPlan[] = [
  {
    name: 'Complete School Environment Setup',
    description: 'Creates a full school environment with multiple teachers, classrooms, and students',
    steps: [
      {
        name: 'Create comprehensive test scenario',
        action: async () => await createComprehensiveTestScenario(),
        expected: 'Should create 9 teachers with classrooms and students'
      },
      {
        name: 'Test navigation for first teacher',
        action: async () => await testNavigationFlow(TEST_TEACHERS[0].email),
        expected: 'All navigation components should work'
      },
      {
        name: 'Create parent accounts',
        action: async () => await createParentAccounts(),
        expected: 'Parent accounts should be created for testing'
      },
      {
        name: 'Test parent invitation flow',
        action: async () => await testAllParentScenarios(),
        expected: 'Should simulate realistic parent responses'
      }
    ]
  },
  {
    name: 'New Teacher Onboarding',
    description: 'Tests the complete new teacher experience',
    steps: [
      {
        name: 'Create new teacher scenarios',
        action: async () => {
          const { createSpecificTeacherScenario } = await import('./comprehensive-test-data')
          return await createSpecificTeacherScenario('new')
        },
        expected: 'Should create 2 new teachers with minimal data'
      },
      {
        name: 'Test onboarding flow',
        action: async () => {
          const newTeachers = TEST_TEACHERS.filter(t => t.scenario === 'new')
          const results = await Promise.all(
            newTeachers.map(teacher => testNavigationFlow(teacher.email))
          )
          return { tested_teachers: newTeachers.length, results }
        },
        expected: 'New teachers should need onboarding setup'
      }
    ]
  },
  {
    name: 'Parent Engagement Analysis',
    description: 'Deep dive into parent response patterns',
    steps: [
      {
        name: 'Run parent flow simulation',
        action: async () => await testAllParentScenarios(),
        expected: 'Should provide realistic completion rates and barriers'
      },
      {
        name: 'Analyze response patterns',
        action: async () => {
          const results = await testAllParentScenarios()
          const analysis = {
            completion_by_scenario: Object.entries(results.results).map(([scenario, data]) => ({
              scenario,
              outcome: (data as any).final_outcome,
              completion_pct: (data as any).engagement_metrics.completion_percentage
            })),
            avg_completion_rate: results.summary.completion_rate,
            top_barriers: results.summary.common_barriers
          }
          return analysis
        },
        expected: 'Should identify patterns in parent responses'
      }
    ]
  }
]

// Run a specific test plan
export async function runTestPlan(planName: string): Promise<{
  success: boolean
  results: any[]
  errors: string[]
  summary: string
}> {
  console.log(`🚀 Running test plan: ${planName}`)
  
  const plan = TEST_PLANS.find(p => p.name === planName)
  if (!plan) {
    return {
      success: false,
      results: [],
      errors: [`Test plan "${planName}" not found`],
      summary: 'Test plan not found'
    }
  }
  
  console.log(`📋 ${plan.description}`)
  console.log(`🔧 Running ${plan.steps.length} test steps...`)
  
  const results: any[] = []
  const errors: string[] = []
  
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i]
    console.log(`\n⏳ Step ${i + 1}/${plan.steps.length}: ${step.name}`)
    console.log(`   Expected: ${step.expected}`)
    
    try {
      const startTime = Date.now()
      const result = await step.action()
      const duration = Date.now() - startTime
      
      results.push({
        step_name: step.name,
        success: result.success !== false,
        result,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      })
      
      if (result.success === false) {
        console.log(`   ❌ FAILED: ${result.message || 'Unknown error'}`)
        errors.push(`Step "${step.name}" failed: ${result.message || 'Unknown error'}`)
      } else {
        console.log(`   ✅ SUCCESS (${duration}ms)`)
        if (result.message) {
          console.log(`   📝 ${result.message}`)
        }
      }
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`)
      errors.push(`Step "${step.name}" threw error: ${error.message}`)
      results.push({
        step_name: step.name,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  const successfulSteps = results.filter(r => r.success).length
  const totalTime = results.reduce((sum, r) => sum + (r.duration_ms || 0), 0)
  
  const summary = `Test plan "${planName}" completed: ${successfulSteps}/${plan.steps.length} steps successful in ${totalTime}ms`
  
  console.log(`\n🏁 Test Plan Complete`)
  console.log(`   Success Rate: ${successfulSteps}/${plan.steps.length} (${Math.round(successfulSteps/plan.steps.length*100)}%)`)
  console.log(`   Total Time: ${totalTime}ms`)
  console.log(`   Errors: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors:`)
    errors.forEach(error => console.log(`   • ${error}`))
  }
  
  return {
    success: errors.length === 0,
    results,
    errors,
    summary
  }
}

// Run all test plans in sequence
export async function runAllTestPlans(): Promise<{
  success: boolean
  plan_results: any[]
  total_errors: number
  summary: string
}> {
  console.log(`🎯 Running all ${TEST_PLANS.length} test plans...`)
  
  const planResults: any[] = []
  let totalErrors = 0
  
  for (const plan of TEST_PLANS) {
    console.log(`\n${'='.repeat(60)}`)
    const result = await runTestPlan(plan.name)
    planResults.push({
      plan_name: plan.name,
      ...result
    })
    totalErrors += result.errors.length
    
    // Add delay between plans to avoid overwhelming the system
    if (TEST_PLANS.indexOf(plan) < TEST_PLANS.length - 1) {
      console.log('\n⏸️  Waiting 5 seconds before next test plan...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  const successfulPlans = planResults.filter(p => p.success).length
  const summary = `All test plans completed: ${successfulPlans}/${TEST_PLANS.length} plans successful, ${totalErrors} total errors`
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🏆 FINAL RESULTS`)
  console.log(`   Plans: ${successfulPlans}/${TEST_PLANS.length} successful`)
  console.log(`   Errors: ${totalErrors}`)
  console.log(`   Status: ${totalErrors === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
  
  return {
    success: totalErrors === 0,
    plan_results: planResults,
    total_errors: totalErrors,
    summary
  }
}

// Quick health check
export async function runHealthCheck(): Promise<{
  success: boolean
  checks: Record<string, boolean>
  errors: string[]
}> {
  console.log('🏥 Running system health check...')
  
  const checks: Record<string, boolean> = {}
  const errors: string[] = []
  
  try {
    // Check Supabase connection
    const { supabase } = await import('./supabase')
    checks.supabase_available = supabase !== null
    if (!supabase) {
      errors.push('Supabase client not configured')
    }
    
    // Check test data availability
    checks.test_teachers_loaded = TEST_TEACHERS.length > 0
    if (TEST_TEACHERS.length === 0) {
      errors.push('No test teachers defined')
    }
    
    // Check if we can create a simple test scenario
    try {
      const testResult = await testAllParentScenarios()
      checks.parent_flow_simulation = testResult.success
      if (!testResult.success) {
        errors.push('Parent flow simulation failed')
      }
    } catch (error) {
      checks.parent_flow_simulation = false
      errors.push(`Parent flow test error: ${error.message}`)
    }
    
    console.log('✅ Health check completed')
    return {
      success: errors.length === 0,
      checks,
      errors
    }
    
  } catch (error) {
    console.log('❌ Health check failed')
    return {
      success: false,
      checks,
      errors: [`Health check error: ${error.message}`]
    }
  }
}

export default {
  runTestPlan,
  runAllTestPlans,
  runHealthCheck,
  TEST_PLANS
}