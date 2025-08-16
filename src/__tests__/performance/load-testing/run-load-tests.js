#!/usr/bin/env node

/**
 * Load Testing Orchestrator for CLP 2.0
 * 
 * Comprehensive load testing suite that combines:
 * - Autocannon HTTP load testing
 * - Artillery.io scenario testing  
 * - Custom concurrent user simulation
 * - Resource monitoring during tests
 * - Automated report generation
 */

const { spawn } = require('child_process')
const { performance } = require('perf_hooks')
const fs = require('fs').promises
const path = require('path')

// Import our custom load testing modules
const { AutocannonTestRunner, LOAD_TEST_CONFIG } = require('./autocannon-load-tests')

// Load Testing Configuration
const LOAD_TEST_ORCHESTRATOR_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  testSuites: {
    quick: {
      duration: 60,     // 1 minute
      users: [10, 25],  // concurrent users
      description: 'Quick smoke test for basic performance validation'
    },
    standard: {
      duration: 300,    // 5 minutes
      users: [10, 25, 50], // concurrent users
      description: 'Standard performance test for regular validation'
    },
    comprehensive: {
      duration: 900,    // 15 minutes
      users: [10, 25, 50, 100], // concurrent users
      description: 'Comprehensive performance test for release validation'
    },
    stress: {
      duration: 1800,   // 30 minutes
      users: [50, 100, 150, 200, 250], // concurrent users
      description: 'Stress test to find breaking points'
    }
  },
  monitoring: {
    resourceSamplingInterval: 5000, // 5 seconds
    healthCheckInterval: 30000,     // 30 seconds
    alertThresholds: {
      responseTime: 2000,  // ms
      errorRate: 0.05,     // 5%
      cpuUsage: 0.8,       // 80%
      memoryUsage: 0.9     // 90%
    }
  },
  reporting: {
    outputDir: './load-test-reports',
    generateGraphs: true,
    emailReport: false
  }
}

// System Resource Monitor
class SystemResourceMonitor {
  constructor() {
    this.snapshots = []
    this.isMonitoring = false
    this.monitoringInterval = null
  }

  start() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.snapshots = []

    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot()
    }, LOAD_TEST_ORCHESTRATOR_CONFIG.monitoring.resourceSamplingInterval)

    console.log('📊 System resource monitoring started')
  }

  stop() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('📊 System resource monitoring stopped')
  }

  takeSnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      loadAverage: require('os').loadavg(),
      freeMemory: require('os').freemem(),
      totalMemory: require('os').totalmem()
    }

    this.snapshots.push(snapshot)

    // Check for alerts
    this.checkAlerts(snapshot)
  }

  checkAlerts(snapshot) {
    const thresholds = LOAD_TEST_ORCHESTRATOR_CONFIG.monitoring.alertThresholds
    const memoryUsage = 1 - (snapshot.freeMemory / snapshot.totalMemory)

    if (memoryUsage > thresholds.memoryUsage) {
      console.warn(`⚠️  High memory usage: ${(memoryUsage * 100).toFixed(1)}%`)
    }

    if (snapshot.loadAverage[0] > require('os').cpus().length * thresholds.cpuUsage) {
      console.warn(`⚠️  High CPU load: ${snapshot.loadAverage[0].toFixed(2)}`)
    }
  }

  generateResourceReport() {
    if (this.snapshots.length === 0) {
      return { message: 'No resource data collected' }
    }

    const memoryUsages = this.snapshots.map(s => 1 - (s.freeMemory / s.totalMemory))
    const loadAverages = this.snapshots.map(s => s.loadAverage[0])

    return {
      duration: (this.snapshots[this.snapshots.length - 1].timestamp - this.snapshots[0].timestamp) / 1000,
      samples: this.snapshots.length,
      memory: {
        average: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
        max: Math.max(...memoryUsages),
        min: Math.min(...memoryUsages)
      },
      cpu: {
        average: loadAverages.reduce((sum, load) => sum + load, 0) / loadAverages.length,
        max: Math.max(...loadAverages),
        min: Math.min(...loadAverages)
      },
      snapshots: this.snapshots
    }
  }
}

// Health Check Monitor
class HealthCheckMonitor {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.healthChecks = []
    this.isMonitoring = false
    this.monitoringInterval = null
  }

  start() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.healthChecks = []

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck()
    }, LOAD_TEST_ORCHESTRATOR_CONFIG.monitoring.healthCheckInterval)

    console.log('🔍 Health check monitoring started')
  }

  stop() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('🔍 Health check monitoring stopped')
  }

  async performHealthCheck() {
    const startTime = performance.now()
    
    try {
      const fetch = require('node-fetch').default || require('node-fetch')
      const response = await fetch(`${this.baseUrl}/api/health`, { timeout: 10000 })
      const endTime = performance.now()

      const healthCheck = {
        timestamp: Date.now(),
        responseTime: endTime - startTime,
        status: response.status,
        healthy: response.ok
      }

      this.healthChecks.push(healthCheck)

      if (!response.ok) {
        console.warn(`⚠️  Health check failed: ${response.status}`)
      }

    } catch (error) {
      const endTime = performance.now()
      
      const healthCheck = {
        timestamp: Date.now(),
        responseTime: endTime - startTime,
        status: 0,
        healthy: false,
        error: error.message
      }

      this.healthChecks.push(healthCheck)
      console.warn(`⚠️  Health check error: ${error.message}`)
    }
  }

  generateHealthReport() {
    if (this.healthChecks.length === 0) {
      return { message: 'No health check data collected' }
    }

    const healthyChecks = this.healthChecks.filter(check => check.healthy)
    const responseTimes = this.healthChecks.map(check => check.responseTime)

    return {
      totalChecks: this.healthChecks.length,
      healthyChecks: healthyChecks.length,
      availability: healthyChecks.length / this.healthChecks.length,
      averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      checks: this.healthChecks
    }
  }
}

// Artillery.io Test Runner
class ArtilleryTestRunner {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async generateArtilleryConfig(scenario) {
    const config = {
      config: {
        target: this.baseUrl,
        phases: [
          {
            duration: Math.floor(scenario.duration * 0.2), // 20% ramp-up
            arrivalRate: Math.floor(scenario.maxUsers * 0.1)
          },
          {
            duration: Math.floor(scenario.duration * 0.6), // 60% sustained
            arrivalRate: scenario.maxUsers
          },
          {
            duration: Math.floor(scenario.duration * 0.2), // 20% ramp-down
            arrivalRate: Math.floor(scenario.maxUsers * 0.1)
          }
        ],
        payload: {
          path: './artillery-test-data.csv',
          fields: ['child_name', 'age_group', 'quiz_type']
        }
      },
      scenarios: [
        {
          name: 'Progressive Profile Creation',
          weight: 70,
          flow: [
            {
              post: {
                url: '/api/profiles/progressive',
                headers: { 'Content-Type': 'application/json' },
                json: {
                  child_name: '{{ child_name }}',
                  age_group: '{{ age_group }}',
                  quiz_type: '{{ quiz_type }}',
                  respondent_type: 'parent',
                  use_clp2_scoring: true,
                  responses: this.generateSampleResponses()
                }
              }
            }
          ]
        },
        {
          name: 'Profile Retrieval',
          weight: 30,
          flow: [
            {
              get: {
                url: '/api/profiles/progressive?profileId=test_profile_{{ $randomString() }}'
              }
            }
          ]
        }
      ]
    }

    return config
  }

  generateSampleResponses() {
    const responses = {}
    for (let i = 1; i <= 15; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    return responses
  }

  async generateTestData() {
    const testData = []
    const childNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
    const ageGroups = ['3-4', '4-5', '5+']
    const quizTypes = ['parent_home', 'teacher_classroom']

    for (let i = 0; i < 1000; i++) {
      testData.push([
        childNames[Math.floor(Math.random() * childNames.length)] + '_' + i,
        ageGroups[Math.floor(Math.random() * ageGroups.length)],
        quizTypes[Math.floor(Math.random() * quizTypes.length)]
      ])
    }

    const csvContent = 'child_name,age_group,quiz_type\n' + 
      testData.map(row => row.join(',')).join('\n')

    await fs.writeFile('./artillery-test-data.csv', csvContent)
    return testData.length
  }

  async runArtilleryTest(scenario) {
    console.log(`🎯 Running Artillery test for ${scenario.name}...`)

    try {
      // Generate test configuration
      const config = await this.generateArtilleryConfig(scenario)
      const configPath = `./artillery-config-${scenario.name.toLowerCase().replace(/\s+/g, '-')}.yml`
      
      await fs.writeFile(configPath, require('yaml').stringify(config))

      // Generate test data
      await this.generateTestData()

      // Run artillery test
      return new Promise((resolve, reject) => {
        const artillery = spawn('artillery', ['run', '--output', `artillery-report-${Date.now()}.json`, configPath], {
          stdio: 'pipe'
        })

        let output = ''
        let errorOutput = ''

        artillery.stdout.on('data', (data) => {
          output += data.toString()
          process.stdout.write(data)
        })

        artillery.stderr.on('data', (data) => {
          errorOutput += data.toString()
          process.stderr.write(data)
        })

        artillery.on('close', (code) => {
          if (code === 0) {
            resolve({ output, success: true })
          } else {
            reject(new Error(`Artillery test failed with code ${code}: ${errorOutput}`))
          }
        })
      })

    } catch (error) {
      console.error(`Artillery test failed: ${error.message}`)
      throw error
    }
  }
}

// Main Load Test Orchestrator
class LoadTestOrchestrator {
  constructor() {
    this.baseUrl = LOAD_TEST_ORCHESTRATOR_CONFIG.baseUrl
    this.resourceMonitor = new SystemResourceMonitor()
    this.healthMonitor = new HealthCheckMonitor(this.baseUrl)
    this.autocannonRunner = new AutocannonTestRunner(this.baseUrl)
    this.artilleryRunner = new ArtilleryTestRunner(this.baseUrl)
    this.results = {}
    this.reportDir = LOAD_TEST_ORCHESTRATOR_CONFIG.reporting.outputDir
  }

  async runTestSuite(suiteName = 'standard') {
    console.log(`🚀 Starting Load Test Suite: ${suiteName.toUpperCase()}`)
    console.log(`Target: ${this.baseUrl}`)
    
    const suite = LOAD_TEST_ORCHESTRATOR_CONFIG.testSuites[suiteName]
    if (!suite) {
      throw new Error(`Unknown test suite: ${suiteName}`)
    }

    console.log(`Description: ${suite.description}`)
    console.log(`Duration: ${suite.duration}s per test`)
    console.log(`Concurrent users: ${suite.users.join(', ')}`)

    // Ensure report directory exists
    await this.ensureReportDirectory()

    // Start monitoring
    this.resourceMonitor.start()
    this.healthMonitor.start()

    const suiteStartTime = performance.now()
    const suiteResults = {
      suiteName,
      startTime: new Date().toISOString(),
      tests: {}
    }

    try {
      // Run Autocannon tests for each user level
      for (const userCount of suite.users) {
        console.log(`\n--- Testing with ${userCount} concurrent users ---`)
        
        const testName = `autocannon_${userCount}_users`
        const testConfig = {
          connections: userCount,
          duration: Math.min(suite.duration, 300) // Cap individual tests at 5 minutes
        }

        try {
          const autocannonResult = await this.runAutocannonTest(testConfig)
          suiteResults.tests[testName] = {
            type: 'autocannon',
            userCount,
            ...autocannonResult
          }
        } catch (error) {
          console.error(`Autocannon test failed for ${userCount} users:`, error.message)
          suiteResults.tests[testName] = {
            type: 'autocannon',
            userCount,
            error: error.message,
            success: false
          }
        }

        // Cool down between tests
        await this.cooldown(10000)
      }

      // Run Artillery test for realistic user journey
      if (suiteName !== 'quick') {
        console.log('\n--- Running Artillery User Journey Test ---')
        
        try {
          const artilleryScenario = {
            name: `Artillery_${suiteName}`,
            duration: Math.min(suite.duration, 600), // Cap at 10 minutes
            maxUsers: Math.max(...suite.users)
          }

          const artilleryResult = await this.artilleryRunner.runArtilleryTest(artilleryScenario)
          suiteResults.tests.artillery_journey = {
            type: 'artillery',
            ...artilleryResult
          }
        } catch (error) {
          console.error('Artillery test failed:', error.message)
          suiteResults.tests.artillery_journey = {
            type: 'artillery',
            error: error.message,
            success: false
          }
        }
      }

      // Run stress test to find breaking point
      if (suiteName === 'stress' || suiteName === 'comprehensive') {
        console.log('\n--- Running Stress Test ---')
        
        try {
          const stressResult = await this.autocannonRunner.runStressTest()
          suiteResults.tests.stress_test = {
            type: 'stress',
            ...stressResult
          }
        } catch (error) {
          console.error('Stress test failed:', error.message)
          suiteResults.tests.stress_test = {
            type: 'stress',
            error: error.message,
            success: false
          }
        }
      }

    } finally {
      // Stop monitoring
      this.resourceMonitor.stop()
      this.healthMonitor.stop()
    }

    const suiteEndTime = performance.now()
    suiteResults.endTime = new Date().toISOString()
    suiteResults.totalDuration = (suiteEndTime - suiteStartTime) / 1000

    // Add monitoring data
    suiteResults.resourceReport = this.resourceMonitor.generateResourceReport()
    suiteResults.healthReport = this.healthMonitor.generateHealthReport()

    // Store results
    this.results[suiteName] = suiteResults

    // Generate report
    await this.generateReport(suiteResults)

    console.log(`\n✅ Load Test Suite "${suiteName}" completed in ${(suiteResults.totalDuration / 60).toFixed(1)} minutes`)
    
    return suiteResults
  }

  async runAutocannonTest(config) {
    const instance = require('autocannon')({
      url: `${this.baseUrl}/api/profiles/progressive`,
      connections: config.connections,
      duration: config.duration,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      requests: [{
        method: 'POST',
        path: '/api/profiles/progressive',
        headers: { 'Content-Type': 'application/json' },
        body: () => JSON.stringify(this.generateTestPayload())
      }]
    })

    return new Promise((resolve, reject) => {
      instance.on('done', (result) => {
        const analysisResult = this.analyzeAutocannonResult(result)
        resolve(analysisResult)
      })
      
      instance.on('error', (error) => {
        reject(error)
      })
    })
  }

  generateTestPayload() {
    return {
      child_name: `Load Test Child ${Math.random().toString(36).substring(7)}`,
      age_group: ['3-4', '4-5', '5+'][Math.floor(Math.random() * 3)],
      quiz_type: ['parent_home', 'teacher_classroom'][Math.floor(Math.random() * 2)],
      respondent_type: ['parent', 'teacher'][Math.floor(Math.random() * 2)],
      use_clp2_scoring: true,
      responses: this.generateSampleResponses()
    }
  }

  generateSampleResponses() {
    const responses = {}
    for (let i = 1; i <= 15; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    return responses
  }

  analyzeAutocannonResult(result) {
    const analysis = {
      summary: {
        duration: result.duration,
        connections: result.connections,
        totalRequests: result.requests.total,
        totalBytes: result.throughput.total,
        totalErrors: result.errors || 0
      },
      performance: {
        requestsPerSecond: result.requests.average,
        bytesPerSecond: result.throughput.average,
        errorRate: (result.errors || 0) / result.requests.total,
        latency: {
          average: result.latency.average,
          min: result.latency.min,
          max: result.latency.max,
          p50: result.latency.p50,
          p95: result.latency.p95,
          p99: result.latency.p99
        }
      },
      assessment: this.assessPerformance(result)
    }

    return analysis
  }

  assessPerformance(result) {
    const thresholds = LOAD_TEST_ORCHESTRATOR_CONFIG.monitoring.alertThresholds
    
    const issues = []
    const successes = []

    // Check response time
    if (result.latency.p95 > thresholds.responseTime) {
      issues.push(`High P95 latency: ${result.latency.p95}ms (threshold: ${thresholds.responseTime}ms)`)
    } else {
      successes.push('Response times within acceptable range')
    }

    // Check error rate
    const errorRate = (result.errors || 0) / result.requests.total
    if (errorRate > thresholds.errorRate) {
      issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}% (threshold: ${thresholds.errorRate * 100}%)`)
    } else {
      successes.push('Error rate within acceptable range')
    }

    // Check throughput
    const minThroughput = LOAD_TEST_CONFIG.targets.throughput.minimum
    if (result.requests.average < minThroughput) {
      issues.push(`Low throughput: ${result.requests.average.toFixed(1)} req/s (minimum: ${minThroughput} req/s)`)
    } else {
      successes.push('Throughput meets minimum requirements')
    }

    return {
      overall: issues.length === 0 ? 'PASS' : 'FAIL',
      issues,
      successes,
      score: Math.max(0, 100 - (issues.length * 25)) // Deduct 25 points per issue
    }
  }

  async ensureReportDirectory() {
    try {
      await fs.access(this.reportDir)
    } catch {
      await fs.mkdir(this.reportDir, { recursive: true })
      console.log(`Created report directory: ${this.reportDir}`)
    }
  }

  async generateReport(suiteResults) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportFileName = `load-test-report-${suiteResults.suiteName}-${timestamp}.json`
    const reportPath = path.join(this.reportDir, reportFileName)

    // Generate detailed report
    const report = {
      ...suiteResults,
      metadata: {
        generatedAt: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        testConfiguration: LOAD_TEST_ORCHESTRATOR_CONFIG
      },
      summary: this.generateSummary(suiteResults),
      recommendations: this.generateRecommendations(suiteResults)
    }

    // Save JSON report
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 Detailed report saved: ${reportPath}`)

    // Generate human-readable summary
    const summaryFileName = `load-test-summary-${suiteResults.suiteName}-${timestamp}.txt`
    const summaryPath = path.join(this.reportDir, summaryFileName)
    const summaryText = this.generateTextSummary(report)
    await fs.writeFile(summaryPath, summaryText)
    console.log(`📋 Summary report saved: ${summaryPath}`)

    return { reportPath, summaryPath, report }
  }

  generateSummary(suiteResults) {
    const tests = Object.values(suiteResults.tests).filter(test => test.success !== false)
    const failedTests = Object.values(suiteResults.tests).filter(test => test.success === false)

    const summary = {
      totalTests: Object.keys(suiteResults.tests).length,
      successfulTests: tests.length,
      failedTests: failedTests.length,
      overallSuccess: failedTests.length === 0,
      averageScore: tests.length > 0 ? tests.reduce((sum, test) => sum + (test.assessment?.score || 0), 0) / tests.length : 0
    }

    if (tests.length > 0) {
      // Aggregate performance metrics
      const autocannonTests = tests.filter(test => test.type === 'autocannon')
      if (autocannonTests.length > 0) {
        summary.performance = {
          maxThroughput: Math.max(...autocannonTests.map(test => test.performance.requestsPerSecond)),
          averageP95Latency: autocannonTests.reduce((sum, test) => sum + test.performance.latency.p95, 0) / autocannonTests.length,
          averageErrorRate: autocannonTests.reduce((sum, test) => sum + test.performance.errorRate, 0) / autocannonTests.length
        }
      }
    }

    return summary
  }

  generateRecommendations(suiteResults) {
    const recommendations = []
    const tests = Object.values(suiteResults.tests)

    // Check for failed tests
    const failedTests = tests.filter(test => test.success === false)
    if (failedTests.length > 0) {
      recommendations.push(`${failedTests.length} test(s) failed - investigate error messages and system logs`)
    }

    // Check performance issues
    const performanceIssues = tests
      .filter(test => test.assessment && test.assessment.issues.length > 0)
      .flatMap(test => test.assessment.issues)

    if (performanceIssues.length > 0) {
      recommendations.push('Performance issues detected:')
      performanceIssues.forEach(issue => recommendations.push(`  - ${issue}`))
    }

    // Check resource usage
    if (suiteResults.resourceReport && suiteResults.resourceReport.memory) {
      if (suiteResults.resourceReport.memory.max > 0.8) {
        recommendations.push('High memory usage detected - consider memory optimization')
      }
      if (suiteResults.resourceReport.cpu.max > require('os').cpus().length * 0.8) {
        recommendations.push('High CPU usage detected - consider CPU optimization or scaling')
      }
    }

    // Check availability
    if (suiteResults.healthReport && suiteResults.healthReport.availability < 0.99) {
      recommendations.push(`Service availability below 99%: ${(suiteResults.healthReport.availability * 100).toFixed(2)}%`)
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests passed successfully - no immediate actions required')
    }

    return recommendations
  }

  generateTextSummary(report) {
    const lines = [
      '=' .repeat(80),
      `LOAD TEST REPORT - ${report.suiteName.toUpperCase()}`,
      '=' .repeat(80),
      '',
      `Test Suite: ${report.suiteName}`,
      `Start Time: ${report.startTime}`,
      `End Time: ${report.endTime}`,
      `Total Duration: ${(report.totalDuration / 60).toFixed(1)} minutes`,
      `Target URL: ${this.baseUrl}`,
      '',
      '📊 SUMMARY:',
      `  Total Tests: ${report.summary.totalTests}`,
      `  Successful: ${report.summary.successfulTests}`,
      `  Failed: ${report.summary.failedTests}`,
      `  Overall Result: ${report.summary.overallSuccess ? '✅ PASS' : '❌ FAIL'}`,
      `  Average Score: ${report.summary.averageScore.toFixed(1)}/100`,
      ''
    ]

    if (report.summary.performance) {
      lines.push(
        '⚡ PERFORMANCE:',
        `  Max Throughput: ${report.summary.performance.maxThroughput.toFixed(1)} req/s`,
        `  Average P95 Latency: ${report.summary.performance.averageP95Latency.toFixed(0)}ms`,
        `  Average Error Rate: ${(report.summary.performance.averageErrorRate * 100).toFixed(2)}%`,
        ''
      )
    }

    if (report.resourceReport && report.resourceReport.memory) {
      lines.push(
        '💾 RESOURCE USAGE:',
        `  Peak Memory: ${(report.resourceReport.memory.max * 100).toFixed(1)}%`,
        `  Peak CPU: ${report.resourceReport.cpu.max.toFixed(2)}`,
        `  Resource Samples: ${report.resourceReport.samples}`,
        ''
      )
    }

    if (report.healthReport) {
      lines.push(
        '🔍 HEALTH MONITORING:',
        `  Total Health Checks: ${report.healthReport.totalChecks}`,
        `  Availability: ${(report.healthReport.availability * 100).toFixed(2)}%`,
        `  Average Response Time: ${report.healthReport.averageResponseTime.toFixed(0)}ms`,
        ''
      )
    }

    lines.push(
      '💡 RECOMMENDATIONS:',
      ...report.recommendations.map(rec => `  • ${rec}`),
      '',
      '=' .repeat(80)
    )

    return lines.join('\n')
  }

  async cooldown(ms) {
    console.log(`⏳ Cooling down for ${ms / 1000}s...`)
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const suiteName = args[0] || 'standard'
  
  const validSuites = Object.keys(LOAD_TEST_ORCHESTRATOR_CONFIG.testSuites)
  
  if (!validSuites.includes(suiteName)) {
    console.error(`Invalid test suite: ${suiteName}`)
    console.error(`Valid suites: ${validSuites.join(', ')}`)
    process.exit(1)
  }

  const orchestrator = new LoadTestOrchestrator()

  try {
    console.log('🎯 CLP 2.0 Load Testing Orchestrator')
    console.log('=====================================')
    
    const results = await orchestrator.runTestSuite(suiteName)
    
    console.log('\n📈 FINAL RESULTS:')
    console.log(`Suite: ${suiteName}`)
    console.log(`Overall: ${results.summary?.overallSuccess ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Score: ${results.summary?.averageScore?.toFixed(1) || 'N/A'}/100`)
    
    if (!results.summary?.overallSuccess) {
      console.log('\n❌ Some tests failed. Check the detailed report for more information.')
      process.exit(1)
    }
    
    console.log('\n✅ All load tests completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Load testing failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Export for use as module
module.exports = {
  LoadTestOrchestrator,
  SystemResourceMonitor,
  HealthCheckMonitor,
  ArtilleryTestRunner,
  LOAD_TEST_ORCHESTRATOR_CONFIG
}

// Run if executed directly
if (require.main === module) {
  main()
}