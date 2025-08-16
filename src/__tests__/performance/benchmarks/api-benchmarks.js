/**
 * API Performance Benchmarking Suite for CLP 2.0
 * 
 * Comprehensive API performance testing including:
 * - Response time benchmarks for all endpoints
 * - Throughput analysis under various loads
 * - Database query performance profiling
 * - Caching effectiveness measurement
 * - API optimization recommendations
 */

const { performance } = require('perf_hooks')
const fetch = require('node-fetch').default || require('node-fetch')

// Benchmark Configuration
const BENCHMARK_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  endpoints: {
    progressive_profile_create: '/api/profiles/progressive',
    progressive_profile_get: '/api/profiles/progressive',
    consolidation: '/api/profiles/clp2-consolidate/route',
    quiz_questions: '/api/quiz/questions',
    scoring: '/api/scoring/clp2'
  },
  targets: {
    response_time: {
      excellent: 100,    // ms
      good: 200,         // ms  
      acceptable: 500,   // ms
      poor: 1000        // ms
    },
    throughput: {
      minimum: 50,       // req/s
      target: 100,       // req/s
      excellent: 200     // req/s
    },
    database: {
      simple_query: 50,  // ms
      complex_query: 200, // ms
      consolidation: 500  // ms
    }
  },
  test_volumes: {
    warm_up: 10,
    baseline: 100,
    stress: 500,
    endurance: 1000
  }
}

// Benchmark data generators
class BenchmarkDataGenerator {
  static generateProfilePayload(complexity = 'standard') {
    const base = {
      child_name: `Benchmark Child ${Math.random().toString(36).substring(7)}`,
      age_group: ['3-4', '4-5', '5+'][Math.floor(Math.random() * 3)],
      quiz_type: ['parent_home', 'teacher_classroom'][Math.floor(Math.random() * 2)],
      respondent_type: ['parent', 'teacher'][Math.floor(Math.random() * 2)],
      use_clp2_scoring: true
    }

    switch (complexity) {
      case 'minimal':
        return {
          ...base,
          responses: this.generateMinimalResponses()
        }
      
      case 'standard':
        return {
          ...base,
          precise_age_months: 36 + Math.floor(Math.random() * 48),
          birth_date: new Date(Date.now() - (36 + Math.random() * 48) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          responses: this.generateStandardResponses()
        }
      
      case 'complex':
        return {
          ...base,
          precise_age_months: 60 + Math.floor(Math.random() * 24),
          birth_date: new Date(Date.now() - (60 + Math.random() * 24) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          grade: ['K', '1', '2'][Math.floor(Math.random() * 3)],
          respondent_name: `Respondent ${Math.random().toString(36).substring(7)}`,
          responses: this.generateComplexResponses(),
          school_context: {
            school_name: `Benchmark School ${Math.floor(Math.random() * 100)}`,
            teacher_name: `Teacher ${Math.random().toString(36).substring(7)}`,
            classroom: `Room ${Math.floor(Math.random() * 50) + 1}`
          },
          existing_profile_id: Math.random() > 0.7 ? `existing_${Math.random().toString(36).substring(7)}` : undefined
        }
      
      default:
        return base
    }
  }

  static generateMinimalResponses() {
    const responses = {}
    // Minimal CLP 2.0 questions (8 core questions)
    for (let i = 1; i <= 8; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    return responses
  }

  static generateStandardResponses() {
    const responses = {}
    // Standard CLP 2.0 questions (15 questions)
    for (let i = 1; i <= 15; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    return responses
  }

  static generateComplexResponses() {
    const responses = {}
    
    // All CLP 2.0 skill questions (24 questions)
    for (let i = 1; i <= 24; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    
    // Preference questions
    responses[25] = ['visual', 'auditory', 'kinesthetic'][Math.floor(Math.random() * 3)]
    responses[26] = ['individual', 'small_group', 'large_group'][Math.floor(Math.random() * 3)]
    responses[27] = ['quiet', 'moderate', 'active'][Math.floor(Math.random() * 3)]
    responses[28] = ['reading', 'math', 'art', 'science', 'music'][Math.floor(Math.random() * 5)]
    
    return responses
  }

  static generateProfileId() {
    return `profile_${Math.random().toString(36).substring(7)}`
  }

  static generateBatchPayloads(count, complexity = 'standard') {
    return Array.from({ length: count }, () => this.generateProfilePayload(complexity))
  }
}

// HTTP Client with performance monitoring
class BenchmarkHTTPClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.requestLog = []
  }

  async request(method, endpoint, payload = null, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const startTime = performance.now()
    const startMemory = process.memoryUsage()

    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    if (payload && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(payload)
    }

    try {
      const response = await fetch(url, requestOptions)
      const endTime = performance.now()
      const endMemory = process.memoryUsage()
      
      const duration = endTime - startTime
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed

      let responseData = null
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        url,
        status: response.status,
        duration,
        memoryDelta,
        payloadSize: payload ? JSON.stringify(payload).length : 0,
        responseSize: JSON.stringify(responseData).length,
        success: response.ok
      }

      this.requestLog.push(logEntry)
      
      return {
        success: response.ok,
        status: response.status,
        data: responseData,
        duration,
        memoryDelta,
        headers: Object.fromEntries(response.headers.entries())
      }

    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      const logEntry = {
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        url,
        status: 0,
        duration,
        memoryDelta: 0,
        payloadSize: payload ? JSON.stringify(payload).length : 0,
        responseSize: 0,
        success: false,
        error: error.message
      }

      this.requestLog.push(logEntry)

      return {
        success: false,
        status: 0,
        data: null,
        duration,
        memoryDelta: 0,
        error: error.message
      }
    }
  }

  getRequestStats(endpoint = null) {
    const filteredLogs = endpoint 
      ? this.requestLog.filter(log => log.endpoint === endpoint)
      : this.requestLog

    if (filteredLogs.length === 0) {
      return { count: 0, averageDuration: 0, successRate: 0, throughput: 0 }
    }

    const durations = filteredLogs.map(log => log.duration)
    const successCount = filteredLogs.filter(log => log.success).length
    
    const sortedDurations = durations.slice().sort((a, b) => a - b)
    const totalDuration = filteredLogs[filteredLogs.length - 1].timestamp.getTime?.() - filteredLogs[0].timestamp.getTime?.() || 1000

    return {
      count: filteredLogs.length,
      successRate: successCount / filteredLogs.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p50: sortedDurations[Math.floor(durations.length * 0.5)],
      p95: sortedDurations[Math.floor(durations.length * 0.95)],
      p99: sortedDurations[Math.floor(durations.length * 0.99)],
      throughput: filteredLogs.length / (totalDuration / 1000) || 0
    }
  }

  clearLog() {
    this.requestLog = []
  }
}

// Main benchmark runner
class APIBenchmarkRunner {
  constructor() {
    this.client = new BenchmarkHTTPClient(BENCHMARK_CONFIG.baseUrl)
    this.results = {}
  }

  async runWarmUp() {
    console.log('🔥 Warming up server...')
    
    const warmUpPayloads = BenchmarkDataGenerator.generateBatchPayloads(
      BENCHMARK_CONFIG.test_volumes.warm_up, 
      'minimal'
    )

    for (const payload of warmUpPayloads) {
      await this.client.request('POST', BENCHMARK_CONFIG.endpoints.progressive_profile_create, payload)
    }

    // Clear warm-up requests from stats
    this.client.clearLog()
    console.log('✅ Server warm-up completed')
  }

  async benchmarkProgressiveProfileCreation() {
    console.log('\n📊 Benchmarking Progressive Profile Creation...')
    
    const complexityLevels = ['minimal', 'standard', 'complex']
    const results = {}

    for (const complexity of complexityLevels) {
      console.log(`  Testing ${complexity} complexity...`)
      
      const payloads = BenchmarkDataGenerator.generateBatchPayloads(
        BENCHMARK_CONFIG.test_volumes.baseline,
        complexity
      )

      const startTime = performance.now()
      
      for (const payload of payloads) {
        await this.client.request('POST', BENCHMARK_CONFIG.endpoints.progressive_profile_create, payload)
      }

      const endTime = performance.now()
      const stats = this.client.getRequestStats(BENCHMARK_CONFIG.endpoints.progressive_profile_create)
      
      results[complexity] = {
        ...stats,
        totalTime: endTime - startTime,
        complexity
      }

      console.log(`    ${complexity}: ${stats.p95.toFixed(0)}ms p95, ${stats.successRate.toFixed(3)} success rate`)
      
      this.client.clearLog()
    }

    this.results.progressive_profile_creation = results
    return results
  }

  async benchmarkProfileRetrieval() {
    console.log('\n📋 Benchmarking Profile Retrieval...')
    
    // Create some profiles first
    const setupPayloads = BenchmarkDataGenerator.generateBatchPayloads(50, 'standard')
    const profileIds = []

    for (const payload of setupPayloads) {
      const response = await this.client.request('POST', BENCHMARK_CONFIG.endpoints.progressive_profile_create, payload)
      if (response.success && response.data.profile?.id) {
        profileIds.push(response.data.profile.id)
      }
    }

    this.client.clearLog()

    // Test profile retrieval
    const retrievalCount = Math.min(profileIds.length, BENCHMARK_CONFIG.test_volumes.baseline)
    const startTime = performance.now()

    for (let i = 0; i < retrievalCount; i++) {
      const profileId = profileIds[i % profileIds.length]
      await this.client.request('GET', `${BENCHMARK_CONFIG.endpoints.progressive_profile_get}?profileId=${profileId}`)
    }

    const endTime = performance.now()
    const stats = this.client.getRequestStats(BENCHMARK_CONFIG.endpoints.progressive_profile_get)

    const results = {
      ...stats,
      totalTime: endTime - startTime,
      profilesRetrieved: retrievalCount
    }

    console.log(`  Profile Retrieval: ${stats.p95.toFixed(0)}ms p95, ${stats.successRate.toFixed(3)} success rate`)

    this.results.profile_retrieval = results
    return results
  }

  async benchmarkConcurrentOperations() {
    console.log('\n🔄 Benchmarking Concurrent Operations...')
    
    const concurrencyLevels = [5, 10, 20, 50]
    const results = {}

    for (const concurrency of concurrencyLevels) {
      console.log(`  Testing ${concurrency} concurrent requests...`)
      
      this.client.clearLog()
      
      const payloads = BenchmarkDataGenerator.generateBatchPayloads(concurrency, 'standard')
      const startTime = performance.now()

      // Execute concurrent requests
      const promises = payloads.map(payload => 
        this.client.request('POST', BENCHMARK_CONFIG.endpoints.progressive_profile_create, payload)
      )

      await Promise.all(promises)
      
      const endTime = performance.now()
      const stats = this.client.getRequestStats(BENCHMARK_CONFIG.endpoints.progressive_profile_create)

      results[concurrency] = {
        ...stats,
        totalTime: endTime - startTime,
        concurrency,
        actualThroughput: concurrency / ((endTime - startTime) / 1000)
      }

      console.log(`    ${concurrency} concurrent: ${stats.p95.toFixed(0)}ms p95, ${results[concurrency].actualThroughput.toFixed(1)} req/s`)
    }

    this.results.concurrent_operations = results
    return results
  }

  async benchmarkThroughput() {
    console.log('\n⚡ Benchmarking Maximum Throughput...')
    
    this.client.clearLog()
    
    const testDuration = 60000 // 60 seconds
    const endTime = Date.now() + testDuration
    const payloads = BenchmarkDataGenerator.generateBatchPayloads(1000, 'standard')
    let requestCount = 0
    
    console.log(`  Running throughput test for ${testDuration / 1000} seconds...`)
    
    const startTime = performance.now()
    
    while (Date.now() < endTime) {
      const payload = payloads[requestCount % payloads.length]
      await this.client.request('POST', BENCHMARK_CONFIG.endpoints.progressive_profile_create, payload)
      requestCount++
      
      if (requestCount % 100 === 0) {
        console.log(`    Completed ${requestCount} requests...`)
      }
    }
    
    const totalTime = performance.now() - startTime
    const stats = this.client.getRequestStats(BENCHMARK_CONFIG.endpoints.progressive_profile_create)

    const results = {
      ...stats,
      testDuration: totalTime,
      requestCount,
      sustainedThroughput: requestCount / (totalTime / 1000)
    }

    console.log(`  Sustained Throughput: ${results.sustainedThroughput.toFixed(1)} req/s over ${(totalTime / 1000).toFixed(1)}s`)

    this.results.throughput = results
    return results
  }

  async benchmarkDatabaseOperations() {
    console.log('\n🗄️  Benchmarking Database Operations...')
    
    const operationTypes = {
      simple_create: { complexity: 'minimal', count: 200 },
      complex_create: { complexity: 'complex', count: 100 },
      batch_retrieval: { operation: 'retrieval', count: 150 }
    }

    const results = {}

    for (const [operationType, config] of Object.entries(operationTypes)) {
      console.log(`  Testing ${operationType}...`)
      
      this.client.clearLog()
      const startTime = performance.now()

      if (config.operation === 'retrieval') {
        // Test retrieval operations
        for (let i = 0; i < config.count; i++) {
          const profileId = BenchmarkDataGenerator.generateProfileId()
          await this.client.request('GET', `${BENCHMARK_CONFIG.endpoints.progressive_profile_get}?profileId=${profileId}`)
        }
      } else {
        // Test creation operations
        const payloads = BenchmarkDataGenerator.generateBatchPayloads(config.count, config.complexity)
        
        for (const payload of payloads) {
          await this.client.request('POST', BENCHMARK_CONFIG.endpoints.progressive_profile_create, payload)
        }
      }

      const endTime = performance.now()
      const stats = this.client.getRequestStats()

      results[operationType] = {
        ...stats,
        totalTime: endTime - startTime,
        operationType,
        estimatedDbTime: stats.averageDuration * 0.7 // Estimate 70% is DB time
      }

      console.log(`    ${operationType}: ${stats.averageDuration.toFixed(0)}ms avg, ~${results[operationType].estimatedDbTime.toFixed(0)}ms DB time`)
    }

    this.results.database_operations = results
    return results
  }

  async benchmarkErrorHandling() {
    console.log('\n⚠️  Benchmarking Error Handling...')
    
    this.client.clearLog()
    
    const errorScenarios = [
      { name: 'missing_fields', payload: { child_name: 'Test' } }, // Missing required fields
      { name: 'invalid_data', payload: { child_name: '', age_group: 'invalid', responses: 'not_an_object' } },
      { name: 'malformed_json', raw: '{"invalid": json}' },
      { name: 'large_payload', payload: this.generateLargePayload() }
    ]

    const results = {}

    for (const scenario of errorScenarios) {
      console.log(`  Testing ${scenario.name}...`)
      
      const scenarioStartTime = performance.now()
      
      for (let i = 0; i < 50; i++) {
        if (scenario.raw) {
          // Send raw malformed request
          await this.client.request('POST', BENCHMARK_CONFIG.endpoints.progressive_profile_create, null, {
            body: scenario.raw,
            headers: { 'Content-Type': 'application/json' }
          })
        } else {
          await this.client.request('POST', BENCHMARK_CONFIG.endpoints.progressive_profile_create, scenario.payload)
        }
      }

      const scenarioEndTime = performance.now()
      const scenarioStats = this.client.getRequestStats()

      results[scenario.name] = {
        ...scenarioStats,
        scenarioTime: scenarioEndTime - scenarioStartTime
      }

      console.log(`    ${scenario.name}: ${scenarioStats.averageDuration.toFixed(0)}ms avg response`)
      
      this.client.clearLog()
    }

    this.results.error_handling = results
    return results
  }

  generateLargePayload() {
    const payload = BenchmarkDataGenerator.generateProfilePayload('complex')
    
    // Add large data structures
    payload.large_metadata = {
      history: new Array(1000).fill().map((_, i) => ({
        event: i,
        timestamp: Date.now() - i * 1000,
        data: `Large data chunk ${i}`.repeat(100)
      })),
      preferences: new Array(500).fill().map((_, i) => ({
        category: `category_${i}`,
        values: new Array(20).fill(`value_${i}`)
      }))
    }
    
    return payload
  }

  async runFullBenchmarkSuite() {
    console.log('🚀 Starting Complete API Benchmark Suite...')
    console.log(`Base URL: ${BENCHMARK_CONFIG.baseUrl}`)
    
    try {
      await this.runWarmUp()
      
      await this.benchmarkProgressiveProfileCreation()
      await this.benchmarkProfileRetrieval()
      await this.benchmarkConcurrentOperations()
      await this.benchmarkThroughput()
      await this.benchmarkDatabaseOperations()
      await this.benchmarkErrorHandling()
      
      this.generatePerformanceReport()
      
    } catch (error) {
      console.error('Benchmark suite failed:', error)
      throw error
    }
  }

  generatePerformanceReport() {
    console.log('\n📈 PERFORMANCE BENCHMARK REPORT')
    console.log('=' .repeat(80))
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.keys(this.results).length,
        overallScore: this.calculateOverallScore()
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    }

    // Summary statistics
    console.log('SUMMARY:')
    console.log(`  Tests Completed: ${report.summary.totalTests}`)
    console.log(`  Overall Performance Score: ${report.summary.overallScore}/100`)
    
    // Key metrics
    if (this.results.progressive_profile_creation) {
      const standardResults = this.results.progressive_profile_creation.standard
      console.log(`  Standard Profile Creation P95: ${standardResults.p95.toFixed(0)}ms`)
    }
    
    if (this.results.throughput) {
      console.log(`  Maximum Sustained Throughput: ${this.results.throughput.sustainedThroughput.toFixed(1)} req/s`)
    }

    // Performance assessment
    console.log('\nPERFORMANCE ASSESSMENT:')
    Object.entries(this.results).forEach(([testType, result]) => {
      const assessment = this.assessPerformance(testType, result)
      console.log(`  ${testType}: ${assessment.grade} (${assessment.score}/100)`)
    })

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log('\nRECOMMENDATIONS:')
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`)
      })
    }

    console.log('=' .repeat(80))
    
    return report
  }

  calculateOverallScore() {
    const testScores = Object.entries(this.results).map(([testType, result]) => {
      const assessment = this.assessPerformance(testType, result)
      return assessment.score
    })

    return testScores.length > 0 
      ? Math.round(testScores.reduce((sum, score) => sum + score, 0) / testScores.length)
      : 0
  }

  assessPerformance(testType, result) {
    const targets = BENCHMARK_CONFIG.targets
    let score = 100
    let grade = 'A'

    switch (testType) {
      case 'progressive_profile_creation':
        const standardP95 = result.standard?.p95 || 1000
        if (standardP95 > targets.response_time.poor) {
          score = 30
          grade = 'F'
        } else if (standardP95 > targets.response_time.acceptable) {
          score = 60
          grade = 'D'
        } else if (standardP95 > targets.response_time.good) {
          score = 80
          grade = 'B'
        }
        break

      case 'throughput':
        const throughput = result.sustainedThroughput || 0
        if (throughput < targets.throughput.minimum) {
          score = 40
          grade = 'F'
        } else if (throughput < targets.throughput.target) {
          score = 70
          grade = 'C'
        } else if (throughput < targets.throughput.excellent) {
          score = 90
          grade = 'A'
        }
        break

      case 'concurrent_operations':
        const highConcurrencyResult = result[50] || result[20] || result[10]
        if (highConcurrencyResult && highConcurrencyResult.p95 > targets.response_time.poor) {
          score = 50
          grade = 'D'
        } else if (highConcurrencyResult && highConcurrencyResult.p95 > targets.response_time.acceptable) {
          score = 75
          grade = 'B'
        }
        break

      default:
        // Generic assessment based on response times
        const avgP95 = result.p95 || result.averageDuration || 1000
        if (avgP95 > targets.response_time.poor) {
          score = 40
          grade = 'F'
        } else if (avgP95 > targets.response_time.acceptable) {
          score = 70
          grade = 'C'
        } else if (avgP95 > targets.response_time.good) {
          score = 85
          grade = 'B'
        }
    }

    return { score, grade }
  }

  generateRecommendations() {
    const recommendations = []

    // Check response times
    if (this.results.progressive_profile_creation?.standard?.p95 > BENCHMARK_CONFIG.targets.response_time.acceptable) {
      recommendations.push('Optimize progressive profile creation API - response times exceed acceptable threshold')
    }

    // Check throughput
    if (this.results.throughput?.sustainedThroughput < BENCHMARK_CONFIG.targets.throughput.target) {
      recommendations.push('Improve system throughput - consider horizontal scaling or performance optimization')
    }

    // Check concurrent performance
    const concurrentResults = this.results.concurrent_operations
    if (concurrentResults) {
      const degradation = this.calculateConcurrencyDegradation(concurrentResults)
      if (degradation > 0.5) { // More than 50% degradation
        recommendations.push('Address performance degradation under concurrent load - consider connection pooling or async processing')
      }
    }

    // Check error handling
    if (this.results.error_handling) {
      const avgErrorResponseTime = Object.values(this.results.error_handling)
        .reduce((sum, result) => sum + (result.averageDuration || 0), 0) / Object.keys(this.results.error_handling).length
      
      if (avgErrorResponseTime > BENCHMARK_CONFIG.targets.response_time.good) {
        recommendations.push('Optimize error handling performance - error responses are slower than expected')
      }
    }

    // Check database operations
    if (this.results.database_operations) {
      const dbResults = this.results.database_operations
      if (dbResults.complex_create?.estimatedDbTime > BENCHMARK_CONFIG.targets.database.complex_query) {
        recommendations.push('Optimize database queries for complex operations - consider indexing or query optimization')
      }
    }

    return recommendations
  }

  calculateConcurrencyDegradation(concurrentResults) {
    const results = Object.values(concurrentResults)
    if (results.length < 2) return 0

    const baseline = results[0].p95
    const highest = results[results.length - 1].p95
    
    return baseline > 0 ? (highest - baseline) / baseline : 0
  }
}

// Main execution function
async function runAPIBenchmarks() {
  const runner = new APIBenchmarkRunner()
  
  try {
    await runner.runFullBenchmarkSuite()
    console.log('\n✅ API Benchmark Suite completed successfully!')
    
  } catch (error) {
    console.error('\n❌ API Benchmark Suite failed:', error)
    process.exit(1)
  }
}

// Export for use in other modules
module.exports = {
  APIBenchmarkRunner,
  BenchmarkDataGenerator,
  BenchmarkHTTPClient,
  BENCHMARK_CONFIG,
  runAPIBenchmarks
}

// Run if executed directly
if (require.main === module) {
  runAPIBenchmarks()
}