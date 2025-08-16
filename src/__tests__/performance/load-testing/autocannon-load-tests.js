/**
 * Autocannon Load Testing Suite for CLP 2.0 APIs
 * 
 * High-performance load testing using autocannon for:
 * - Progressive profile creation endpoints
 * - Profile retrieval endpoints
 * - Concurrent user simulation
 * - Throughput and latency analysis
 */

const autocannon = require('autocannon')
const { performance } = require('perf_hooks')

// Load Test Configuration
const LOAD_TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  scenarios: {
    light: { connections: 10, duration: 30 },
    moderate: { connections: 50, duration: 60 },
    heavy: { connections: 100, duration: 120 },
    stress: { connections: 200, duration: 180 }
  },
  targets: {
    throughput: 100, // requests per second minimum
    latency_p95: 500, // milliseconds
    latency_p99: 1000, // milliseconds
    error_rate: 0.02 // 2% maximum error rate
  }
}

// Test data generators
class LoadTestDataGenerator {
  static generateProgressiveProfilePayload() {
    const childId = Math.random().toString(36).substring(7)
    
    return {
      child_name: `Load Test Child ${childId}`,
      age_group: ['3-4', '4-5', '5+'][Math.floor(Math.random() * 3)],
      precise_age_months: 36 + Math.floor(Math.random() * 48),
      birth_date: new Date(Date.now() - (36 + Math.random() * 48) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      quiz_type: ['parent_home', 'teacher_classroom'][Math.floor(Math.random() * 2)],
      respondent_type: ['parent', 'teacher'][Math.floor(Math.random() * 2)],
      respondent_name: `Respondent ${childId}`,
      use_clp2_scoring: true,
      responses: this.generateRandomResponses(),
      school_context: Math.random() > 0.5 ? {
        school_name: `Test School ${childId}`,
        teacher_name: `Teacher ${childId}`,
        classroom: `Room ${Math.floor(Math.random() * 30) + 1}`
      } : undefined
    }
  }

  static generateRandomResponses() {
    const responses = {}
    
    // Core CLP 2.0 questions (1-24)
    for (let i = 1; i <= 24; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    
    // Preference questions (25-28) - only for parent assessments
    if (Math.random() > 0.5) {
      responses[25] = ['visual', 'auditory', 'kinesthetic'][Math.floor(Math.random() * 3)]
      responses[26] = ['individual', 'small_group', 'large_group'][Math.floor(Math.random() * 3)]
      responses[27] = ['quiet', 'moderate', 'active'][Math.floor(Math.random() * 3)]
      responses[28] = ['reading', 'math', 'art', 'science', 'music'][Math.floor(Math.random() * 5)]
    }
    
    return responses
  }

  static generateProfileId() {
    return `profile_${Math.random().toString(36).substring(7)}`
  }
}

// Autocannon test runner
class AutocannonTestRunner {
  constructor(baseUrl = LOAD_TEST_CONFIG.baseUrl) {
    this.baseUrl = baseUrl
    this.results = []
  }

  async runProgressiveProfileLoadTest(scenario = 'moderate') {
    const config = LOAD_TEST_CONFIG.scenarios[scenario]
    
    console.log(`\n🚀 Starting Progressive Profile Load Test - ${scenario.toUpperCase()}`)
    console.log(`Connections: ${config.connections}, Duration: ${config.duration}s`)
    
    const instance = autocannon({
      url: `${this.baseUrl}/api/profiles/progressive`,
      connections: config.connections,
      duration: config.duration,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      setupClient: (client) => {
        // Setup custom request generation
        client.setBody(JSON.stringify(LoadTestDataGenerator.generateProgressiveProfilePayload()))
        
        // Vary the payload for each request
        client.on('reqError', (err) => {
          console.error('Request error:', err.message)
        })
        
        return client
      },
      // Generate unique payload for each request
      requests: [
        {
          method: 'POST',
          path: '/api/profiles/progressive',
          headers: {
            'Content-Type': 'application/json'
          },
          body: () => JSON.stringify(LoadTestDataGenerator.generateProgressiveProfilePayload())
        }
      ]
    })

    return new Promise((resolve, reject) => {
      instance.on('done', (result) => {
        this.analyzeResults(result, 'progressive_profile', scenario)
        resolve(result)
      })
      
      instance.on('error', (error) => {
        console.error('Load test error:', error)
        reject(error)
      })
    })
  }

  async runProfileRetrievalLoadTest(scenario = 'moderate') {
    const config = LOAD_TEST_CONFIG.scenarios[scenario]
    
    console.log(`\n📊 Starting Profile Retrieval Load Test - ${scenario.toUpperCase()}`)
    console.log(`Connections: ${config.connections}, Duration: ${config.duration}s`)

    const instance = autocannon({
      url: `${this.baseUrl}/api/profiles/progressive`,
      connections: config.connections,
      duration: config.duration,
      method: 'GET',
      requests: [
        {
          method: 'GET',
          path: () => `/api/profiles/progressive?profileId=${LoadTestDataGenerator.generateProfileId()}`
        }
      ]
    })

    return new Promise((resolve, reject) => {
      instance.on('done', (result) => {
        this.analyzeResults(result, 'profile_retrieval', scenario)
        resolve(result)
      })
      
      instance.on('error', (error) => {
        console.error('Load test error:', error)
        reject(error)
      })
    })
  }

  async runMixedWorkloadTest(scenario = 'moderate') {
    const config = LOAD_TEST_CONFIG.scenarios[scenario]
    
    console.log(`\n🔄 Starting Mixed Workload Test - ${scenario.toUpperCase()}`)
    console.log(`Connections: ${config.connections}, Duration: ${config.duration}s`)

    // 70% create, 30% retrieve - realistic production ratio
    const requests = []
    
    for (let i = 0; i < 7; i++) {
      requests.push({
        method: 'POST',
        path: '/api/profiles/progressive',
        headers: { 'Content-Type': 'application/json' },
        body: () => JSON.stringify(LoadTestDataGenerator.generateProgressiveProfilePayload())
      })
    }
    
    for (let i = 0; i < 3; i++) {
      requests.push({
        method: 'GET',
        path: () => `/api/profiles/progressive?profileId=${LoadTestDataGenerator.generateProfileId()}`
      })
    }

    const instance = autocannon({
      url: this.baseUrl,
      connections: config.connections,
      duration: config.duration,
      requests: requests
    })

    return new Promise((resolve, reject) => {
      instance.on('done', (result) => {
        this.analyzeResults(result, 'mixed_workload', scenario)
        resolve(result)
      })
      
      instance.on('error', (error) => {
        console.error('Load test error:', error)
        reject(error)
      })
    })
  }

  async runScenarioSuite(scenarios = ['light', 'moderate', 'heavy']) {
    console.log('🎯 Running Complete Load Test Scenario Suite')
    const suiteResults = {}

    for (const scenario of scenarios) {
      console.log(`\n--- Running ${scenario} scenario ---`)
      
      try {
        // Progressive Profile Tests
        const progressiveResult = await this.runProgressiveProfileLoadTest(scenario)
        suiteResults[`${scenario}_progressive`] = progressiveResult

        // Cool down period
        await this.cooldown(5000)

        // Profile Retrieval Tests
        const retrievalResult = await this.runProfileRetrievalLoadTest(scenario)
        suiteResults[`${scenario}_retrieval`] = retrievalResult

        // Cool down period
        await this.cooldown(5000)

        // Mixed Workload Tests
        const mixedResult = await this.runMixedWorkloadTest(scenario)
        suiteResults[`${scenario}_mixed`] = mixedResult

        // Cool down between scenarios
        await this.cooldown(10000)

      } catch (error) {
        console.error(`Error in ${scenario} scenario:`, error)
        suiteResults[`${scenario}_error`] = error.message
      }
    }

    this.generateSuiteReport(suiteResults)
    return suiteResults
  }

  async runStressTest() {
    console.log('💥 Starting Stress Test - Finding Breaking Point')
    
    const stressLevels = [50, 100, 150, 200, 250, 300]
    const stressResults = {}

    for (const connections of stressLevels) {
      console.log(`\n🔥 Stress Level: ${connections} connections`)
      
      try {
        const instance = autocannon({
          url: `${this.baseUrl}/api/profiles/progressive`,
          connections: connections,
          duration: 30, // Shorter duration for stress testing
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          requests: [{
            method: 'POST',
            path: '/api/profiles/progressive',
            headers: { 'Content-Type': 'application/json' },
            body: () => JSON.stringify(LoadTestDataGenerator.generateProgressiveProfilePayload())
          }]
        })

        const result = await new Promise((resolve, reject) => {
          instance.on('done', resolve)
          instance.on('error', reject)
        })

        stressResults[connections] = result
        this.analyzeResults(result, 'stress_test', connections.toString())

        // Check if we've hit a breaking point
        const errorRate = (result.errors / result.requests.total) || 0
        const avgLatency = result.latency.average

        if (errorRate > 0.1 || avgLatency > 5000) {
          console.log(`🛑 Breaking point reached at ${connections} connections`)
          console.log(`Error rate: ${(errorRate * 100).toFixed(2)}%, Avg latency: ${avgLatency}ms`)
          break
        }

        // Cool down between stress levels
        await this.cooldown(5000)

      } catch (error) {
        console.error(`Stress test failed at ${connections} connections:`, error)
        stressResults[`${connections}_error`] = error.message
        break
      }
    }

    this.generateStressReport(stressResults)
    return stressResults
  }

  analyzeResults(result, testType, scenario) {
    const analysis = {
      timestamp: new Date().toISOString(),
      testType,
      scenario,
      summary: {
        duration: result.duration,
        connections: result.connections,
        requests: result.requests,
        latency: result.latency,
        throughput: result.throughput,
        errors: result.errors || 0
      },
      performance: {
        rps: result.requests.average,
        errorRate: (result.errors || 0) / result.requests.total,
        latencyP95: result.latency.p95,
        latencyP99: result.latency.p99
      }
    }

    // Performance assessment
    const targets = LOAD_TEST_CONFIG.targets
    analysis.assessment = {
      throughputMet: analysis.performance.rps >= targets.throughput,
      latencyP95Met: analysis.performance.latencyP95 <= targets.latency_p95,
      latencyP99Met: analysis.performance.latencyP99 <= targets.latency_p99,
      errorRateMet: analysis.performance.errorRate <= targets.error_rate
    }

    // Overall pass/fail
    analysis.passed = Object.values(analysis.assessment).every(met => met)

    console.log(`\n📋 ${testType.toUpperCase()} - ${scenario.toUpperCase()} Results:`)
    console.log(`   Requests/sec: ${analysis.performance.rps.toFixed(1)} (target: ${targets.throughput}+) ${analysis.assessment.throughputMet ? '✅' : '❌'}`)
    console.log(`   Latency P95: ${analysis.performance.latencyP95}ms (target: ${targets.latency_p95}ms-) ${analysis.assessment.latencyP95Met ? '✅' : '❌'}`)
    console.log(`   Latency P99: ${analysis.performance.latencyP99}ms (target: ${targets.latency_p99}ms-) ${analysis.assessment.latencyP99Met ? '✅' : '❌'}`)
    console.log(`   Error Rate: ${(analysis.performance.errorRate * 100).toFixed(2)}% (target: ${targets.error_rate * 100}%-) ${analysis.assessment.errorRateMet ? '✅' : '❌'}`)
    console.log(`   Overall: ${analysis.passed ? '✅ PASS' : '❌ FAIL'}`)

    this.results.push(analysis)
    return analysis
  }

  generateSuiteReport(suiteResults) {
    console.log('\n📊 LOAD TEST SUITE SUMMARY REPORT')
    console.log('=' .repeat(60))
    
    const totalTests = Object.keys(suiteResults).length
    const passedTests = this.results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests

    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${failedTests}`)
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

    // Performance trends
    console.log('\n📈 PERFORMANCE TRENDS:')
    const scenarios = ['light', 'moderate', 'heavy']
    scenarios.forEach(scenario => {
      const progressiveTest = this.results.find(r => r.testType === 'progressive_profile' && r.scenario === scenario)
      const retrievalTest = this.results.find(r => r.testType === 'profile_retrieval' && r.scenario === scenario)
      
      if (progressiveTest && retrievalTest) {
        console.log(`\n${scenario.toUpperCase()}:`)
        console.log(`  Progressive Profile: ${progressiveTest.performance.rps.toFixed(1)} req/s, ${progressiveTest.performance.latencyP95}ms p95`)
        console.log(`  Profile Retrieval: ${retrievalTest.performance.rps.toFixed(1)} req/s, ${retrievalTest.performance.latencyP95}ms p95`)
      }
    })

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    if (failedTests > 0) {
      console.log('  • Investigate failed test scenarios for performance bottlenecks')
    }
    
    const highLatencyTests = this.results.filter(r => r.performance.latencyP95 > LOAD_TEST_CONFIG.targets.latency_p95)
    if (highLatencyTests.length > 0) {
      console.log('  • Optimize response times - high latency detected in multiple scenarios')
    }
    
    const highErrorRateTests = this.results.filter(r => r.performance.errorRate > LOAD_TEST_CONFIG.targets.error_rate)
    if (highErrorRateTests.length > 0) {
      console.log('  • Investigate error sources - high error rates detected')
    }

    console.log('=' .repeat(60))
  }

  generateStressReport(stressResults) {
    console.log('\n💥 STRESS TEST SUMMARY REPORT')
    console.log('=' .repeat(60))

    const levels = Object.keys(stressResults).filter(k => !k.includes('error')).map(Number).sort((a, b) => a - b)
    
    if (levels.length === 0) {
      console.log('No successful stress test levels completed')
      return
    }

    console.log(`Stress levels tested: ${levels.join(', ')} connections`)
    
    // Find breaking point
    let breakingPoint = null
    for (const level of levels) {
      const result = stressResults[level]
      const errorRate = (result.errors || 0) / result.requests.total
      
      if (errorRate > 0.05 || result.latency.average > 2000) {
        breakingPoint = level
        break
      }
    }

    if (breakingPoint) {
      console.log(`🛑 Breaking point: ${breakingPoint} concurrent connections`)
    } else {
      console.log(`✅ System handled maximum tested load: ${Math.max(...levels)} connections`)
    }

    // Performance degradation analysis
    console.log('\n📉 PERFORMANCE DEGRADATION:')
    levels.forEach(level => {
      const result = stressResults[level]
      const errorRate = ((result.errors || 0) / result.requests.total * 100).toFixed(2)
      console.log(`  ${level} connections: ${result.requests.average.toFixed(1)} req/s, ${result.latency.p95}ms p95, ${errorRate}% errors`)
    })

    console.log('=' .repeat(60))
  }

  async cooldown(ms) {
    console.log(`⏳ Cooling down for ${ms/1000}s...`)
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Main execution function
async function runLoadTests() {
  const runner = new AutocannonTestRunner()
  
  console.log('🎯 CLP 2.0 Load Testing Suite Starting...')
  console.log(`Base URL: ${LOAD_TEST_CONFIG.baseUrl}`)
  
  try {
    // Run scenario suite
    console.log('\n1️⃣ Running Standard Load Test Scenarios...')
    await runner.runScenarioSuite(['light', 'moderate', 'heavy'])
    
    // Run stress test
    console.log('\n2️⃣ Running Stress Tests...')
    await runner.runStressTest()
    
    console.log('\n🏁 Load Testing Complete!')
    
  } catch (error) {
    console.error('Load testing failed:', error)
    process.exit(1)
  }
}

// Export for use in other modules
module.exports = {
  AutocannonTestRunner,
  LoadTestDataGenerator,
  LOAD_TEST_CONFIG,
  runLoadTests
}

// Run if executed directly
if (require.main === module) {
  runLoadTests()
}