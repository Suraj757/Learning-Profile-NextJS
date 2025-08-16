#!/usr/bin/env node

/**
 * CLP 2.0 Performance Testing Suite Runner
 * 
 * Comprehensive performance testing orchestrator that runs:
 * - Jest performance tests
 * - Load testing with Autocannon
 * - Memory leak detection
 * - API benchmarking
 * - System resource monitoring
 * - Automated report generation and analysis
 */

const { spawn } = require('child_process')
const { performance } = require('perf_hooks')
const fs = require('fs').promises
const path = require('path')

// Performance Testing Configuration
const PERFORMANCE_SUITE_CONFIG = {
  testSuites: {
    quick: {
      description: 'Quick performance validation (5-10 minutes)',
      tests: ['unit-performance', 'api-benchmarks-quick'],
      parallel: true,
      timeout: 600000 // 10 minutes
    },
    standard: {
      description: 'Standard performance test suite (15-30 minutes)',
      tests: ['unit-performance', 'api-benchmarks', 'load-testing-standard', 'memory-testing-short'],
      parallel: false,
      timeout: 1800000 // 30 minutes
    },
    comprehensive: {
      description: 'Comprehensive performance validation (45-60 minutes)',
      tests: ['unit-performance', 'api-benchmarks', 'load-testing-comprehensive', 'memory-testing-medium', 'stress-testing'],
      parallel: false,
      timeout: 3600000 // 60 minutes
    },
    ci: {
      description: 'CI/CD optimized performance tests (10-15 minutes)',
      tests: ['unit-performance', 'api-benchmarks-quick', 'load-testing-quick'],
      parallel: true,
      timeout: 900000 // 15 minutes
    },
    nightly: {
      description: 'Nightly comprehensive testing (60-90 minutes)',
      tests: ['unit-performance', 'api-benchmarks', 'load-testing-comprehensive', 'memory-testing-long', 'stress-testing', 'endurance-testing'],
      parallel: false,
      timeout: 5400000 // 90 minutes
    }
  },
  
  testCommands: {
    'unit-performance': {
      command: 'npm',
      args: ['run', 'test:performance'],
      description: 'Jest performance unit tests',
      timeout: 300000 // 5 minutes
    },
    'api-benchmarks': {
      command: 'node',
      args: ['src/__tests__/performance/benchmarks/api-benchmarks.js'],
      description: 'API performance benchmarking',
      timeout: 600000 // 10 minutes
    },
    'api-benchmarks-quick': {
      command: 'node',
      args: ['src/__tests__/performance/benchmarks/api-benchmarks.js', '--quick'],
      description: 'Quick API performance benchmarks',
      timeout: 300000 // 5 minutes
    },
    'load-testing-quick': {
      command: 'node',
      args: ['src/__tests__/performance/load-testing/run-load-tests.js', 'quick'],
      description: 'Quick load testing',
      timeout: 300000 // 5 minutes
    },
    'load-testing-standard': {
      command: 'node',
      args: ['src/__tests__/performance/load-testing/run-load-tests.js', 'standard'],
      description: 'Standard load testing',
      timeout: 900000 // 15 minutes
    },
    'load-testing-comprehensive': {
      command: 'node',
      args: ['src/__tests__/performance/load-testing/run-load-tests.js', 'comprehensive'],
      description: 'Comprehensive load testing',
      timeout: 1800000 // 30 minutes
    },
    'memory-testing-short': {
      command: 'node',
      args: ['--expose-gc', 'src/__tests__/performance/memory-testing/memory-leak-detection.js', '--short'],
      description: 'Short-term memory testing',
      timeout: 300000 // 5 minutes
    },
    'memory-testing-medium': {
      command: 'node',
      args: ['--expose-gc', 'src/__tests__/performance/memory-testing/memory-leak-detection.js', '--medium'],
      description: 'Medium-term memory testing',
      timeout: 900000 // 15 minutes
    },
    'memory-testing-long': {
      command: 'node',
      args: ['--expose-gc', 'src/__tests__/performance/memory-testing/memory-leak-detection.js', '--long'],
      description: 'Long-term memory testing',
      timeout: 1800000 // 30 minutes
    },
    'stress-testing': {
      command: 'node',
      args: ['src/__tests__/performance/load-testing/autocannon-load-tests.js', '--stress'],
      description: 'System stress testing',
      timeout: 1200000 // 20 minutes
    },
    'endurance-testing': {
      command: 'node',
      args: ['src/__tests__/performance/load-testing/run-load-tests.js', 'stress'],
      description: 'System endurance testing',
      timeout: 2400000 // 40 minutes
    }
  },

  reporting: {
    outputDir: './performance-reports',
    generateSummary: true,
    generateGraphs: false,
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
    emailRecipients: process.env.PERFORMANCE_EMAIL_RECIPIENTS?.split(',') || []
  },

  thresholds: {
    performance: {
      apiResponseTime: 500,      // ms
      throughput: 50,            // req/s
      errorRate: 0.02,           // 2%
      memoryGrowth: 50,          // MB
      cpuUsage: 0.8              // 80%
    },
    reliability: {
      successRate: 0.98,         // 98%
      availability: 0.99,        // 99%
      maxDowntime: 30000         // 30 seconds
    }
  }
}

// Test Result Collector
class TestResultCollector {
  constructor() {
    this.results = {}
    this.startTime = Date.now()
    this.systemInfo = this.collectSystemInfo()
  }

  collectSystemInfo() {
    const os = require('os')
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    }
  }

  addResult(testName, result) {
    this.results[testName] = {
      ...result,
      timestamp: new Date().toISOString()
    }
  }

  getResults() {
    return {
      systemInfo: this.systemInfo,
      testDuration: Date.now() - this.startTime,
      results: this.results,
      summary: this.generateSummary()
    }
  }

  generateSummary() {
    const testResults = Object.values(this.results)
    const totalTests = testResults.length
    const passedTests = testResults.filter(result => result.success).length
    const failedTests = totalTests - passedTests

    const performanceMetrics = this.extractPerformanceMetrics(testResults)
    const overallAssessment = this.assessOverallPerformance(performanceMetrics)

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: totalTests > 0 ? passedTests / totalTests : 0,
      performanceMetrics,
      overallAssessment,
      criticalIssues: this.identifyCriticalIssues(testResults)
    }
  }

  extractPerformanceMetrics(testResults) {
    const metrics = {
      responseTime: [],
      throughput: [],
      errorRate: [],
      memoryUsage: [],
      cpuUsage: []
    }

    testResults.forEach(result => {
      if (result.performance) {
        if (result.performance.responseTime) metrics.responseTime.push(result.performance.responseTime)
        if (result.performance.throughput) metrics.throughput.push(result.performance.throughput)
        if (result.performance.errorRate) metrics.errorRate.push(result.performance.errorRate)
        if (result.performance.memoryUsage) metrics.memoryUsage.push(result.performance.memoryUsage)
        if (result.performance.cpuUsage) metrics.cpuUsage.push(result.performance.cpuUsage)
      }
    })

    // Calculate aggregated metrics
    const aggregated = {}
    Object.entries(metrics).forEach(([key, values]) => {
      if (values.length > 0) {
        aggregated[key] = {
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          samples: values.length
        }
      }
    })

    return aggregated
  }

  assessOverallPerformance(metrics) {
    const thresholds = PERFORMANCE_SUITE_CONFIG.thresholds.performance
    const issues = []
    const successes = []

    // Check API response time
    if (metrics.responseTime && metrics.responseTime.average > thresholds.apiResponseTime) {
      issues.push(`High average response time: ${metrics.responseTime.average.toFixed(0)}ms (threshold: ${thresholds.apiResponseTime}ms)`)
    } else if (metrics.responseTime) {
      successes.push('API response times within acceptable range')
    }

    // Check throughput
    if (metrics.throughput && metrics.throughput.average < thresholds.throughput) {
      issues.push(`Low throughput: ${metrics.throughput.average.toFixed(1)} req/s (threshold: ${thresholds.throughput} req/s)`)
    } else if (metrics.throughput) {
      successes.push('Throughput meets performance targets')
    }

    // Check error rate
    if (metrics.errorRate && metrics.errorRate.average > thresholds.errorRate) {
      issues.push(`High error rate: ${(metrics.errorRate.average * 100).toFixed(2)}% (threshold: ${thresholds.errorRate * 100}%)`)
    } else if (metrics.errorRate) {
      successes.push('Error rates within acceptable range')
    }

    // Check memory usage
    if (metrics.memoryUsage && metrics.memoryUsage.max > thresholds.memoryGrowth) {
      issues.push(`High memory usage: ${metrics.memoryUsage.max.toFixed(1)}MB (threshold: ${thresholds.memoryGrowth}MB)`)
    } else if (metrics.memoryUsage) {
      successes.push('Memory usage within acceptable range')
    }

    const overallGrade = this.calculatePerformanceGrade(issues.length, successes.length)

    return {
      grade: overallGrade,
      issues,
      successes,
      recommendation: this.generateRecommendation(issues, overallGrade)
    }
  }

  calculatePerformanceGrade(issueCount, successCount) {
    const totalChecks = issueCount + successCount
    if (totalChecks === 0) return 'N/A'

    const successRate = successCount / totalChecks
    
    if (successRate >= 0.9) return 'A'
    if (successRate >= 0.8) return 'B'
    if (successRate >= 0.7) return 'C'
    if (successRate >= 0.6) return 'D'
    return 'F'
  }

  generateRecommendation(issues, grade) {
    if (issues.length === 0) {
      return 'Performance is within acceptable parameters. Continue monitoring.'
    }

    const recommendations = ['Performance issues detected:']
    
    if (grade === 'F') {
      recommendations.push('CRITICAL: Immediate performance optimization required before production deployment')
    } else if (grade === 'D') {
      recommendations.push('WARNING: Significant performance issues require attention')
    } else {
      recommendations.push('NOTICE: Minor performance optimizations recommended')
    }

    recommendations.push('Specific issues to address:')
    issues.forEach(issue => recommendations.push(`  - ${issue}`))

    return recommendations.join('\n')
  }

  identifyCriticalIssues(testResults) {
    const criticalIssues = []

    testResults.forEach(result => {
      if (!result.success) {
        criticalIssues.push({
          test: result.testName || 'Unknown',
          type: 'TEST_FAILURE',
          message: result.error || 'Test failed without specific error message'
        })
      }

      if (result.performance) {
        // Check for critical performance issues
        if (result.performance.responseTime > 2000) {
          criticalIssues.push({
            test: result.testName || 'Unknown',
            type: 'HIGH_LATENCY',
            message: `Response time ${result.performance.responseTime}ms exceeds 2 second critical threshold`
          })
        }

        if (result.performance.errorRate > 0.05) {
          criticalIssues.push({
            test: result.testName || 'Unknown',
            type: 'HIGH_ERROR_RATE',
            message: `Error rate ${(result.performance.errorRate * 100).toFixed(2)}% exceeds 5% critical threshold`
          })
        }
      }
    })

    return criticalIssues
  }
}

// Test Runner
class PerformanceTestRunner {
  constructor() {
    this.collector = new TestResultCollector()
    this.runningTests = new Map()
  }

  async runTest(testName, testConfig) {
    console.log(`🚀 Starting ${testName}: ${testConfig.description}`)
    
    const startTime = performance.now()
    const testProcess = spawn(testConfig.command, testConfig.args, {
      stdio: 'pipe',
      cwd: process.cwd()
    })

    this.runningTests.set(testName, testProcess)

    let stdout = ''
    let stderr = ''

    testProcess.stdout.on('data', (data) => {
      const output = data.toString()
      stdout += output
      // Show real-time output for important information
      if (output.includes('✅') || output.includes('❌') || output.includes('WARNING') || output.includes('ERROR')) {
        process.stdout.write(`[${testName}] ${output}`)
      }
    })

    testProcess.stderr.on('data', (data) => {
      const output = data.toString()
      stderr += output
      console.error(`[${testName}] ${output}`)
    })

    const timeoutHandle = setTimeout(() => {
      console.warn(`⚠️  ${testName} timed out after ${testConfig.timeout / 1000}s`)
      testProcess.kill('SIGTERM')
    }, testConfig.timeout)

    return new Promise((resolve) => {
      testProcess.on('close', (code) => {
        clearTimeout(timeoutHandle)
        this.runningTests.delete(testName)
        
        const endTime = performance.now()
        const duration = endTime - startTime

        const result = {
          testName,
          success: code === 0,
          exitCode: code,
          duration,
          stdout,
          stderr,
          performance: this.extractPerformanceData(stdout, stderr)
        }

        if (code === 0) {
          console.log(`✅ ${testName} completed successfully in ${(duration / 1000).toFixed(1)}s`)
        } else {
          console.log(`❌ ${testName} failed with exit code ${code} after ${(duration / 1000).toFixed(1)}s`)
        }

        this.collector.addResult(testName, result)
        resolve(result)
      })
    })
  }

  extractPerformanceData(stdout, stderr) {
    const performance = {}

    // Extract response time metrics
    const responseTimeMatch = stdout.match(/(?:response time|latency|p95).*?(\d+\.?\d*)\s*ms/i)
    if (responseTimeMatch) {
      performance.responseTime = parseFloat(responseTimeMatch[1])
    }

    // Extract throughput metrics
    const throughputMatch = stdout.match(/(\d+\.?\d*)\s*(?:req\/s|requests per second)/i)
    if (throughputMatch) {
      performance.throughput = parseFloat(throughputMatch[1])
    }

    // Extract error rate
    const errorRateMatch = stdout.match(/error rate.*?(\d+\.?\d*)%/i)
    if (errorRateMatch) {
      performance.errorRate = parseFloat(errorRateMatch[1]) / 100
    }

    // Extract memory usage
    const memoryMatch = stdout.match(/memory.*?(\d+\.?\d*)\s*MB/i)
    if (memoryMatch) {
      performance.memoryUsage = parseFloat(memoryMatch[1])
    }

    return Object.keys(performance).length > 0 ? performance : null
  }

  async runTestSuite(suiteName) {
    const suite = PERFORMANCE_SUITE_CONFIG.testSuites[suiteName]
    if (!suite) {
      throw new Error(`Unknown test suite: ${suiteName}`)
    }

    console.log(`🎯 Running Performance Test Suite: ${suiteName.toUpperCase()}`)
    console.log(`Description: ${suite.description}`)
    console.log(`Tests: ${suite.tests.join(', ')}`)
    console.log(`Parallel execution: ${suite.parallel ? 'Yes' : 'No'}`)

    const suiteStartTime = performance.now()

    try {
      if (suite.parallel) {
        // Run tests in parallel
        const testPromises = suite.tests.map(testName => {
          const testConfig = PERFORMANCE_SUITE_CONFIG.testCommands[testName]
          if (!testConfig) {
            console.warn(`⚠️  Unknown test: ${testName}`)
            return Promise.resolve({ testName, success: false, error: 'Unknown test' })
          }
          return this.runTest(testName, testConfig)
        })

        await Promise.all(testPromises)
      } else {
        // Run tests sequentially
        for (const testName of suite.tests) {
          const testConfig = PERFORMANCE_SUITE_CONFIG.testCommands[testName]
          if (!testConfig) {
            console.warn(`⚠️  Unknown test: ${testName}`)
            continue
          }

          await this.runTest(testName, testConfig)
          
          // Brief pause between tests
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }

      const suiteEndTime = performance.now()
      const suiteDuration = suiteEndTime - suiteStartTime

      console.log(`\n🏁 Test suite "${suiteName}" completed in ${(suiteDuration / 60000).toFixed(1)} minutes`)

      return this.collector.getResults()

    } catch (error) {
      console.error(`❌ Test suite "${suiteName}" failed:`, error)
      throw error
    }
  }

  async gracefulShutdown() {
    console.log('🛑 Graceful shutdown initiated...')
    
    for (const [testName, process] of this.runningTests) {
      console.log(`Terminating ${testName}...`)
      process.kill('SIGTERM')
      
      // Give process time to clean up
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      if (!process.killed) {
        console.log(`Force killing ${testName}...`)
        process.kill('SIGKILL')
      }
    }
  }
}

// Report Generator
class PerformanceReportGenerator {
  constructor() {
    this.outputDir = PERFORMANCE_SUITE_CONFIG.reporting.outputDir
  }

  async ensureOutputDirectory() {
    try {
      await fs.access(this.outputDir)
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true })
      console.log(`Created report directory: ${this.outputDir}`)
    }
  }

  async generateReport(results, suiteName) {
    await this.ensureOutputDirectory()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportFileName = `performance-report-${suiteName}-${timestamp}.json`
    const reportPath = path.join(this.outputDir, reportFileName)

    // Generate comprehensive report
    const report = {
      suiteName,
      timestamp: new Date().toISOString(),
      ...results,
      metadata: {
        generatedBy: 'CLP 2.0 Performance Test Suite',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        configuration: PERFORMANCE_SUITE_CONFIG
      }
    }

    // Save JSON report
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 Performance report saved: ${reportPath}`)

    // Generate text summary
    const summaryFileName = `performance-summary-${suiteName}-${timestamp}.txt`
    const summaryPath = path.join(this.outputDir, summaryFileName)
    const summaryText = this.generateTextSummary(report)
    await fs.writeFile(summaryPath, summaryText)
    console.log(`📋 Performance summary saved: ${summaryPath}`)

    // Send notifications if configured
    await this.sendNotifications(report)

    return { reportPath, summaryPath, report }
  }

  generateTextSummary(report) {
    const lines = [
      '=' .repeat(80),
      `PERFORMANCE TEST REPORT - ${report.suiteName.toUpperCase()}`,
      '=' .repeat(80),
      '',
      `Test Suite: ${report.suiteName}`,
      `Generated: ${report.timestamp}`,
      `Duration: ${(report.testDuration / 60000).toFixed(1)} minutes`,
      `Platform: ${report.systemInfo.platform} ${report.systemInfo.arch}`,
      `Node.js: ${report.systemInfo.nodeVersion}`,
      '',
      '📊 SUMMARY:',
      `  Total Tests: ${report.summary.totalTests}`,
      `  Passed: ${report.summary.passedTests}`,
      `  Failed: ${report.summary.failedTests}`,
      `  Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%`,
      `  Overall Grade: ${report.summary.overallAssessment.grade}`,
      ''
    ]

    // Performance metrics
    if (report.summary.performanceMetrics && Object.keys(report.summary.performanceMetrics).length > 0) {
      lines.push('⚡ PERFORMANCE METRICS:')
      
      Object.entries(report.summary.performanceMetrics).forEach(([metric, data]) => {
        lines.push(`  ${metric}: avg=${data.average.toFixed(2)}, min=${data.min.toFixed(2)}, max=${data.max.toFixed(2)} (${data.samples} samples)`)
      })
      
      lines.push('')
    }

    // Critical issues
    if (report.summary.criticalIssues.length > 0) {
      lines.push('🚨 CRITICAL ISSUES:')
      report.summary.criticalIssues.forEach(issue => {
        lines.push(`  ${issue.type}: ${issue.message}`)
      })
      lines.push('')
    }

    // Assessment
    lines.push('📈 ASSESSMENT:')
    if (report.summary.overallAssessment.successes.length > 0) {
      lines.push('  Successes:')
      report.summary.overallAssessment.successes.forEach(success => {
        lines.push(`    ✅ ${success}`)
      })
    }
    
    if (report.summary.overallAssessment.issues.length > 0) {
      lines.push('  Issues:')
      report.summary.overallAssessment.issues.forEach(issue => {
        lines.push(`    ❌ ${issue}`)
      })
    }

    lines.push('')
    lines.push('💡 RECOMMENDATION:')
    lines.push(report.summary.overallAssessment.recommendation.split('\n').map(line => `  ${line}`).join('\n'))
    lines.push('')
    lines.push('=' .repeat(80))

    return lines.join('\n')
  }

  async sendNotifications(report) {
    // Slack notification
    if (PERFORMANCE_SUITE_CONFIG.reporting.slackWebhook) {
      try {
        await this.sendSlackNotification(report)
      } catch (error) {
        console.warn('Failed to send Slack notification:', error.message)
      }
    }

    // Email notification
    if (PERFORMANCE_SUITE_CONFIG.reporting.emailRecipients.length > 0) {
      try {
        await this.sendEmailNotification(report)
      } catch (error) {
        console.warn('Failed to send email notification:', error.message)
      }
    }
  }

  async sendSlackNotification(report) {
    const fetch = require('node-fetch').default || require('node-fetch')
    
    const color = report.summary.overallAssessment.grade === 'A' ? 'good' : 
                  report.summary.overallAssessment.grade === 'F' ? 'danger' : 'warning'

    const message = {
      text: `Performance Test Results - ${report.suiteName}`,
      attachments: [{
        color,
        title: `Performance Test Suite: ${report.suiteName}`,
        fields: [
          { title: 'Grade', value: report.summary.overallAssessment.grade, short: true },
          { title: 'Success Rate', value: `${(report.summary.successRate * 100).toFixed(1)}%`, short: true },
          { title: 'Tests Run', value: `${report.summary.passedTests}/${report.summary.totalTests}`, short: true },
          { title: 'Duration', value: `${(report.testDuration / 60000).toFixed(1)} min`, short: true }
        ],
        footer: 'CLP 2.0 Performance Testing',
        ts: Math.floor(Date.now() / 1000)
      }]
    }

    await fetch(PERFORMANCE_SUITE_CONFIG.reporting.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })

    console.log('📱 Slack notification sent')
  }

  async sendEmailNotification(report) {
    // Email implementation would go here
    // This is a placeholder for future email integration
    console.log('📧 Email notification would be sent to:', PERFORMANCE_SUITE_CONFIG.reporting.emailRecipients.join(', '))
  }
}

// Main CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const suiteName = args[0] || 'standard'
  
  const validSuites = Object.keys(PERFORMANCE_SUITE_CONFIG.testSuites)
  
  if (!validSuites.includes(suiteName)) {
    console.error(`❌ Invalid test suite: ${suiteName}`)
    console.error(`Valid suites: ${validSuites.join(', ')}`)
    process.exit(1)
  }

  const runner = new PerformanceTestRunner()
  const reportGenerator = new PerformanceReportGenerator()

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...')
    await runner.gracefulShutdown()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
    await runner.gracefulShutdown()
    process.exit(0)
  })

  try {
    console.log('🎯 CLP 2.0 Performance Testing Suite')
    console.log('====================================')
    
    const results = await runner.runTestSuite(suiteName)
    const { report } = await reportGenerator.generateReport(results, suiteName)
    
    console.log('\n📊 FINAL PERFORMANCE RESULTS:')
    console.log(`Suite: ${suiteName}`)
    console.log(`Grade: ${report.summary.overallAssessment.grade}`)
    console.log(`Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%`)
    console.log(`Critical Issues: ${report.summary.criticalIssues.length}`)
    
    if (report.summary.criticalIssues.length > 0) {
      console.log('\n🚨 Critical issues detected:')
      report.summary.criticalIssues.forEach(issue => {
        console.log(`  ${issue.type}: ${issue.message}`)
      })
    }
    
    if (report.summary.overallAssessment.grade === 'F' || report.summary.criticalIssues.length > 0) {
      console.log('\n❌ Performance tests failed. System not ready for production.')
      process.exit(1)
    } else if (report.summary.overallAssessment.grade === 'D') {
      console.log('\n⚠️  Performance tests show significant issues. Review required.')
      process.exit(2)
    } else {
      console.log('\n✅ Performance tests passed successfully!')
    }
    
  } catch (error) {
    console.error('\n❌ Performance testing suite failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Export for use as module
module.exports = {
  PerformanceTestRunner,
  TestResultCollector,
  PerformanceReportGenerator,
  PERFORMANCE_SUITE_CONFIG
}

// Run if executed directly
if (require.main === module) {
  main()
}