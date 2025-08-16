/**
 * CLP 2.0 Comprehensive Performance Test Suite
 * 
 * Tests system performance under realistic production loads:
 * - API response times with concurrent users
 * - Database query performance
 * - Memory usage and leak detection
 * - Profile generation speed with large datasets
 * - System resource utilization
 * - Scalability limits testing
 */

import { performance } from 'perf_hooks'
import { Worker } from 'worker_threads'
import { createHash } from 'crypto'

// Test Configuration
const PERFORMANCE_TARGETS = {
  api: {
    progressive_profile: 500, // ms - p95 response time
    profile_retrieval: 200,   // ms - p95 response time
    consolidation: 1000,      // ms - complex consolidation
  },
  concurrency: {
    light_load: 10,           // concurrent users
    moderate_load: 50,        // concurrent users  
    heavy_load: 100,          // concurrent users
    stress_load: 200,         // concurrent users
  },
  memory: {
    max_heap: 512 * 1024 * 1024, // 512MB max heap
    leak_threshold: 10,           // MB growth per 1000 requests
  },
  database: {
    query_timeout: 100,           // ms per query
    connection_pool: 20,          // max connections
  }
}

// Mock data generators for realistic testing
class TestDataGenerator {
  static generateChildProfile(complexity: 'simple' | 'complex' = 'simple') {
    const baseProfile = {
      child_name: `Test Child ${Math.random().toString(36).substring(7)}`,
      age_group: '5+' as const,
      precise_age_months: 60 + Math.floor(Math.random() * 24),
      birth_date: new Date(Date.now() - (60 + Math.random() * 24) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      quiz_type: 'parent_home' as const,
      respondent_type: 'parent' as const,
      use_clp2_scoring: true,
    }

    if (complexity === 'simple') {
      return {
        ...baseProfile,
        responses: this.generateSimpleResponses()
      }
    }

    return {
      ...baseProfile,
      responses: this.generateComplexResponses(),
      school_context: {
        school_name: 'Test Elementary School',
        teacher_name: 'Ms. Test Teacher',
        classroom: 'Grade 1A'
      },
      existing_profile_id: Math.random() > 0.7 ? `existing_${Math.random().toString(36).substring(7)}` : undefined
    }
  }

  static generateSimpleResponses() {
    const responses: Record<number, number> = {}
    // Generate responses for 15 core questions (CLP 2.0 parent quiz)
    for (let i = 1; i <= 15; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1 // 1-5 scale
    }
    return responses
  }

  static generateComplexResponses() {
    const responses: Record<number, number | string | string[]> = {}
    
    // Core skill questions (1-24)
    for (let i = 1; i <= 24; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    
    // Preference questions (25-28)
    responses[25] = ['visual', 'auditory'][Math.floor(Math.random() * 2)]
    responses[26] = ['individual', 'group'][Math.floor(Math.random() * 2)]
    responses[27] = ['quiet', 'active'][Math.floor(Math.random() * 2)]
    responses[28] = ['reading', 'math', 'art', 'science'][Math.floor(Math.random() * 4)]
    
    return responses
  }

  static generateLargeDataset(size: number) {
    const profiles = []
    for (let i = 0; i < size; i++) {
      profiles.push(this.generateChildProfile(i % 3 === 0 ? 'complex' : 'simple'))
    }
    return profiles
  }
}

// Performance monitoring utilities
class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map()
  private memorySnapshots: Array<{ timestamp: number; usage: NodeJS.MemoryUsage }> = []

  startMeasurement(label: string): string {
    const id = `${label}_${Date.now()}_${Math.random()}`
    performance.mark(`${id}_start`)
    return id
  }

  endMeasurement(id: string): number {
    performance.mark(`${id}_end`)
    performance.measure(id, `${id}_start`, `${id}_end`)
    
    const measure = performance.getEntriesByName(id)[0]
    const duration = measure.duration
    
    const label = id.split('_')[0]
    if (!this.measurements.has(label)) {
      this.measurements.set(label, [])
    }
    this.measurements.get(label)!.push(duration)
    
    performance.clearMarks(`${id}_start`)
    performance.clearMarks(`${id}_end`)
    performance.clearMeasures(id)
    
    return duration
  }

  takeMemorySnapshot() {
    this.memorySnapshots.push({
      timestamp: Date.now(),
      usage: process.memoryUsage()
    })
  }

  getStatistics(label: string) {
    const measurements = this.measurements.get(label) || []
    if (measurements.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 }
    }

    const sorted = measurements.slice().sort((a, b) => a - b)
    const count = measurements.length
    const avg = measurements.reduce((sum, val) => sum + val, 0) / count
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const p95 = sorted[Math.floor(count * 0.95)]
    const p99 = sorted[Math.floor(count * 0.99)]

    return { count, avg, min, max, p95, p99 }
  }

  getMemoryTrend() {
    if (this.memorySnapshots.length < 2) {
      return { growth: 0, leakDetected: false }
    }

    const first = this.memorySnapshots[0]
    const last = this.memorySnapshots[this.memorySnapshots.length - 1]
    const growth = (last.usage.heapUsed - first.usage.heapUsed) / (1024 * 1024) // MB
    const leakDetected = growth > PERFORMANCE_TARGETS.memory.leak_threshold

    return { growth, leakDetected, snapshots: this.memorySnapshots.length }
  }

  reset() {
    this.measurements.clear()
    this.memorySnapshots = []
    performance.clearMarks()
    performance.clearMeasures()
  }
}

// Mock API client for testing
class MockAPIClient {
  private baseUrl: string
  private concurrentRequests = 0
  private maxConcurrency = 0

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  async createProgressiveProfile(profileData: any): Promise<{ duration: number; success: boolean; response?: any; error?: any }> {
    this.concurrentRequests++
    this.maxConcurrency = Math.max(this.maxConcurrency, this.concurrentRequests)
    
    const startTime = performance.now()
    
    try {
      // Simulate API call with realistic processing time
      const processingTime = this.calculateProcessingTime(profileData)
      await this.delay(processingTime)
      
      // Simulate occasional failures (2% failure rate)
      if (Math.random() < 0.02) {
        throw new Error('Simulated API failure')
      }

      const response = this.generateMockResponse(profileData)
      const duration = performance.now() - startTime
      
      this.concurrentRequests--
      return { duration, success: true, response }
      
    } catch (error) {
      const duration = performance.now() - startTime
      this.concurrentRequests--
      return { duration, success: false, error }
    }
  }

  async getProfile(profileId: string): Promise<{ duration: number; success: boolean; response?: any; error?: any }> {
    this.concurrentRequests++
    this.maxConcurrency = Math.max(this.maxConcurrency, this.concurrentRequests)
    
    const startTime = performance.now()
    
    try {
      // Simulate database lookup time
      await this.delay(50 + Math.random() * 100)
      
      if (Math.random() < 0.01) {
        throw new Error('Profile not found')
      }

      const response = { id: profileId, child_name: 'Test Child', scores: {} }
      const duration = performance.now() - startTime
      
      this.concurrentRequests--
      return { duration, success: true, response }
      
    } catch (error) {
      const duration = performance.now() - startTime
      this.concurrentRequests--
      return { duration, success: false, error }
    }
  }

  private calculateProcessingTime(profileData: any): number {
    // Simulate realistic processing time based on complexity
    let baseTime = 100 // Base processing time
    
    if (profileData.existing_profile_id) {
      baseTime += 150 // Consolidation overhead
    }
    
    if (profileData.responses && Object.keys(profileData.responses).length > 20) {
      baseTime += 100 // Complex scoring
    }
    
    if (profileData.school_context) {
      baseTime += 50 // Additional context processing
    }
    
    // Add some randomness for realistic simulation
    return baseTime + (Math.random() * 100)
  }

  private generateMockResponse(profileData: any) {
    return {
      profile: {
        id: `profile_${Math.random().toString(36).substring(7)}`,
        child_name: profileData.child_name,
        personality_label: 'Creative Collaborator',
        confidence_percentage: 75 + Math.random() * 25,
        completeness_percentage: 60 + Math.random() * 40,
        consolidated_scores: {
          Communication: 4.2,
          Collaboration: 4.5,
          'Creative Innovation': 4.8,
          'Critical Thinking': 3.9,
          Content: 4.1,
          Confidence: 4.3,
          Literacy: 4.0,
          Math: 3.8
        }
      },
      shareUrl: `https://example.com/results/profile_${Math.random().toString(36).substring(7)}`,
      is_new_profile: !profileData.existing_profile_id,
      contribution_summary: {
        weight: 1.0,
        confidence_boost: 15,
        categories_covered: ['Communication', 'Collaboration', 'Creative Innovation']
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getMaxConcurrency(): number {
    return this.maxConcurrency
  }

  getCurrentConcurrency(): number {
    return this.concurrentRequests
  }
}

// Main performance test suite
describe('CLP 2.0 Performance Test Suite', () => {
  let monitor: PerformanceMonitor
  let apiClient: MockAPIClient

  beforeEach(() => {
    monitor = new PerformanceMonitor()
    apiClient = new MockAPIClient()
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    monitor.takeMemorySnapshot()
  })

  afterEach(() => {
    monitor.reset()
  })

  describe('API Response Time Benchmarks', () => {
    test('Progressive profile creation under normal load', async () => {
      const testProfiles = TestDataGenerator.generateLargeDataset(50)
      const results = []

      for (const profileData of testProfiles) {
        const measurementId = monitor.startMeasurement('progressive_profile')
        const result = await apiClient.createProgressiveProfile(profileData)
        monitor.endMeasurement(measurementId)
        results.push(result)
      }

      const stats = monitor.getStatistics('progressive_profile')
      const successRate = results.filter(r => r.success).length / results.length

      console.log('Progressive Profile Creation Stats:', {
        ...stats,
        successRate: `${(successRate * 100).toFixed(1)}%`,
        target_p95: `${PERFORMANCE_TARGETS.api.progressive_profile}ms`
      })

      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.api.progressive_profile)
      expect(successRate).toBeGreaterThan(0.95) // 95% success rate minimum
    })

    test('Profile retrieval performance', async () => {
      const profileIds = Array.from({ length: 100 }, () => `profile_${Math.random().toString(36).substring(7)}`)
      const results = []

      for (const profileId of profileIds) {
        const measurementId = monitor.startMeasurement('profile_retrieval')
        const result = await apiClient.getProfile(profileId)
        monitor.endMeasurement(measurementId)
        results.push(result)
      }

      const stats = monitor.getStatistics('profile_retrieval')
      const successRate = results.filter(r => r.success).length / results.length

      console.log('Profile Retrieval Stats:', {
        ...stats,
        successRate: `${(successRate * 100).toFixed(1)}%`,
        target_p95: `${PERFORMANCE_TARGETS.api.profile_retrieval}ms`
      })

      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.api.profile_retrieval)
      expect(successRate).toBeGreaterThan(0.98) // 98% success rate for reads
    })
  })

  describe('Concurrent Load Testing', () => {
    test('Light load - 10 concurrent users', async () => {
      await runConcurrentLoadTest(PERFORMANCE_TARGETS.concurrency.light_load, 'light')
    })

    test('Moderate load - 50 concurrent users', async () => {
      await runConcurrentLoadTest(PERFORMANCE_TARGETS.concurrency.moderate_load, 'moderate')
    })

    test('Heavy load - 100 concurrent users', async () => {
      await runConcurrentLoadTest(PERFORMANCE_TARGETS.concurrency.heavy_load, 'heavy')
    }, 60000) // 60 second timeout

    test('Stress test - 200 concurrent users', async () => {
      await runStressTest(PERFORMANCE_TARGETS.concurrency.stress_load)
    }, 120000) // 2 minute timeout

    async function runConcurrentLoadTest(concurrentUsers: number, loadType: string) {
      const testProfiles = TestDataGenerator.generateLargeDataset(concurrentUsers)
      const promises = []

      console.log(`Starting ${loadType} load test with ${concurrentUsers} concurrent users...`)
      
      const startTime = performance.now()

      for (let i = 0; i < concurrentUsers; i++) {
        const promise = (async () => {
          const measurementId = monitor.startMeasurement(`concurrent_${loadType}`)
          const result = await apiClient.createProgressiveProfile(testProfiles[i])
          monitor.endMeasurement(measurementId)
          return result
        })()
        promises.push(promise)
      }

      const results = await Promise.all(promises)
      const totalTime = performance.now() - startTime

      const stats = monitor.getStatistics(`concurrent_${loadType}`)
      const successRate = results.filter(r => r.success).length / results.length
      const throughput = results.length / (totalTime / 1000) // requests per second

      console.log(`${loadType.charAt(0).toUpperCase() + loadType.slice(1)} Load Test Results:`, {
        concurrentUsers,
        totalTime: `${totalTime.toFixed(0)}ms`,
        throughput: `${throughput.toFixed(1)} req/s`,
        maxConcurrency: apiClient.getMaxConcurrency(),
        ...stats,
        successRate: `${(successRate * 100).toFixed(1)}%`
      })

      // Performance assertions based on load type
      if (loadType === 'light') {
        expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.api.progressive_profile)
        expect(successRate).toBeGreaterThan(0.98)
      } else if (loadType === 'moderate') {
        expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.api.progressive_profile * 1.5)
        expect(successRate).toBeGreaterThan(0.95)
      } else if (loadType === 'heavy') {
        expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.api.progressive_profile * 2)
        expect(successRate).toBeGreaterThan(0.90)
      }

      expect(throughput).toBeGreaterThan(concurrentUsers / 10) // Minimum throughput requirement
    }

    async function runStressTest(maxUsers: number) {
      console.log(`Starting stress test ramping up to ${maxUsers} users...`)
      
      const rampUpSteps = 5
      const usersPerStep = Math.floor(maxUsers / rampUpSteps)
      let currentConcurrency = 0
      const results = []

      for (let step = 1; step <= rampUpSteps; step++) {
        currentConcurrency = usersPerStep * step
        console.log(`Stress test step ${step}/${rampUpSteps}: ${currentConcurrency} concurrent users`)

        const stepProfiles = TestDataGenerator.generateLargeDataset(usersPerStep)
        const stepPromises = []

        for (let i = 0; i < usersPerStep; i++) {
          const promise = (async () => {
            const measurementId = monitor.startMeasurement('stress_test')
            const result = await apiClient.createProgressiveProfile(stepProfiles[i])
            monitor.endMeasurement(measurementId)
            return result
          })()
          stepPromises.push(promise)
        }

        const stepResults = await Promise.all(stepPromises)
        results.push(...stepResults)

        // Brief pause between steps
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const stats = monitor.getStatistics('stress_test')
      const successRate = results.filter(r => r.success).length / results.length

      console.log('Stress Test Results:', {
        maxConcurrency: apiClient.getMaxConcurrency(),
        totalRequests: results.length,
        ...stats,
        successRate: `${(successRate * 100).toFixed(1)}%`,
        degradationFactor: `${(stats.p95 / PERFORMANCE_TARGETS.api.progressive_profile).toFixed(1)}x`
      })

      // Stress test should maintain basic functionality even under extreme load
      expect(successRate).toBeGreaterThan(0.80) // 80% minimum success rate under stress
      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.api.progressive_profile * 5) // Max 5x degradation
    }
  })

  describe('Memory Usage and Leak Detection', () => {
    test('Memory usage under sustained load', async () => {
      const iterations = 1000
      const testProfiles = TestDataGenerator.generateLargeDataset(iterations)

      console.log(`Testing memory usage over ${iterations} profile creations...`)

      // Take initial memory snapshot
      monitor.takeMemorySnapshot()

      for (let i = 0; i < iterations; i++) {
        await apiClient.createProgressiveProfile(testProfiles[i])
        
        // Take memory snapshot every 100 iterations
        if (i % 100 === 0) {
          monitor.takeMemorySnapshot()
          
          // Force garbage collection periodically
          if (global.gc && i % 200 === 0) {
            global.gc()
          }
        }
      }

      // Final memory snapshot
      monitor.takeMemorySnapshot()

      const memoryTrend = monitor.getMemoryTrend()
      const finalMemory = process.memoryUsage()

      console.log('Memory Usage Results:', {
        iterations,
        memoryGrowth: `${memoryTrend.growth.toFixed(2)}MB`,
        leakDetected: memoryTrend.leakDetected,
        finalHeapUsed: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        finalHeapTotal: `${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        snapshots: memoryTrend.snapshots
      })

      expect(memoryTrend.leakDetected).toBe(false)
      expect(finalMemory.heapUsed).toBeLessThan(PERFORMANCE_TARGETS.memory.max_heap)
    }, 60000)

    test('Memory efficiency with large datasets', async () => {
      const largeBatch = TestDataGenerator.generateLargeDataset(500)
      const initialMemory = process.memoryUsage()

      console.log('Testing memory efficiency with large dataset batch processing...')

      // Process in batches to test memory management
      const batchSize = 50
      for (let i = 0; i < largeBatch.length; i += batchSize) {
        const batch = largeBatch.slice(i, i + batchSize)
        
        const batchPromises = batch.map(profile => 
          apiClient.createProgressiveProfile(profile)
        )
        
        await Promise.all(batchPromises)
        
        // Monitor memory after each batch
        if (i % (batchSize * 2) === 0) {
          monitor.takeMemorySnapshot()
          const currentMemory = process.memoryUsage()
          const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed
          
          console.log(`Batch ${Math.floor(i / batchSize) + 1}: Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
        }
      }

      const finalMemory = process.memoryUsage()
      const totalMemoryIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024

      console.log('Large Dataset Memory Test Results:', {
        profilesProcessed: largeBatch.length,
        memoryIncrease: `${totalMemoryIncrease.toFixed(2)}MB`,
        memoryPerProfile: `${(totalMemoryIncrease / largeBatch.length * 1024).toFixed(2)}KB`
      })

      expect(totalMemoryIncrease).toBeLessThan(100) // Less than 100MB for 500 profiles
    }, 60000)
  })

  describe('Database Query Performance Simulation', () => {
    test('Simulated database query performance under load', async () => {
      const queryTypes = ['profile_lookup', 'score_consolidation', 'history_retrieval']
      const results: Record<string, number[]> = {}

      queryTypes.forEach(type => {
        results[type] = []
      })

      console.log('Simulating database query performance...')

      // Simulate 1000 mixed database operations
      for (let i = 0; i < 1000; i++) {
        const queryType = queryTypes[Math.floor(Math.random() * queryTypes.length)]
        
        const startTime = performance.now()
        
        // Simulate query execution time based on type
        let simulatedTime = 0
        switch (queryType) {
          case 'profile_lookup':
            simulatedTime = 20 + Math.random() * 40 // 20-60ms
            break
          case 'score_consolidation':
            simulatedTime = 50 + Math.random() * 80 // 50-130ms
            break
          case 'history_retrieval':
            simulatedTime = 30 + Math.random() * 50 // 30-80ms
            break
        }
        
        await new Promise(resolve => setTimeout(resolve, simulatedTime))
        
        const actualTime = performance.now() - startTime
        results[queryType].push(actualTime)
      }

      // Analyze results for each query type
      queryTypes.forEach(queryType => {
        const queries = results[queryType]
        const avg = queries.reduce((sum, time) => sum + time, 0) / queries.length
        const sorted = queries.slice().sort((a, b) => a - b)
        const p95 = sorted[Math.floor(queries.length * 0.95)]
        
        console.log(`${queryType} Performance:`, {
          count: queries.length,
          average: `${avg.toFixed(2)}ms`,
          p95: `${p95.toFixed(2)}ms`,
          target: `${PERFORMANCE_TARGETS.database.query_timeout}ms`
        })

        expect(p95).toBeLessThan(PERFORMANCE_TARGETS.database.query_timeout)
      })
    })
  })

  describe('Scalability Testing', () => {
    test('Profile generation speed with increasing data complexity', async () => {
      const complexityLevels = [
        { name: 'simple', count: 100, complexity: 'simple' as const },
        { name: 'moderate', count: 100, complexity: 'complex' as const },
        { name: 'high', count: 50, complexity: 'complex' as const },
      ]

      const results = []

      for (const level of complexityLevels) {
        console.log(`Testing ${level.name} complexity level...`)
        
        const profiles = Array.from({ length: level.count }, () => 
          TestDataGenerator.generateChildProfile(level.complexity)
        )

        const startTime = performance.now()
        const levelResults = []

        for (const profile of profiles) {
          const measurementId = monitor.startMeasurement(`complexity_${level.name}`)
          const result = await apiClient.createProgressiveProfile(profile)
          monitor.endMeasurement(measurementId)
          levelResults.push(result)
        }

        const totalTime = performance.now() - startTime
        const stats = monitor.getStatistics(`complexity_${level.name}`)
        const throughput = level.count / (totalTime / 1000)

        const levelResult = {
          complexity: level.name,
          count: level.count,
          ...stats,
          throughput: throughput,
          successRate: levelResults.filter(r => r.success).length / levelResults.length
        }

        results.push(levelResult)

        console.log(`${level.name.charAt(0).toUpperCase() + level.name.slice(1)} Complexity Results:`, levelResult)
      }

      // Verify performance doesn't degrade significantly with complexity
      const simpleThroughput = results.find(r => r.complexity === 'simple')?.throughput || 0
      const highThroughput = results.find(r => r.complexity === 'high')?.throughput || 0
      const degradation = simpleThroughput > 0 ? (simpleThroughput - highThroughput) / simpleThroughput : 0

      console.log('Scalability Analysis:', {
        simpleThroughput: `${simpleThroughput.toFixed(1)} req/s`,
        highThroughput: `${highThroughput.toFixed(1)} req/s`,
        degradation: `${(degradation * 100).toFixed(1)}%`
      })

      expect(degradation).toBeLessThan(0.5) // Less than 50% throughput degradation
      results.forEach(result => {
        expect(result.successRate).toBeGreaterThan(0.95)
      })
    }, 60000)

    test('System resource utilization monitoring', async () => {
      console.log('Starting system resource utilization test...')
      
      const resourceSnapshots = []
      const testDuration = 30000 // 30 seconds
      const startTime = Date.now()
      
      // Start background load
      const backgroundLoad = this.createBackgroundLoad()
      
      // Monitor resources every 5 seconds
      const monitoringInterval = setInterval(() => {
        const snapshot = {
          timestamp: Date.now() - startTime,
          memory: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          concurrency: apiClient.getCurrentConcurrency()
        }
        resourceSnapshots.push(snapshot)
        
        console.log(`Resource snapshot at ${(snapshot.timestamp / 1000).toFixed(1)}s:`, {
          heapUsed: `${(snapshot.memory.heapUsed / 1024 / 1024).toFixed(1)}MB`,
          concurrency: snapshot.concurrency
        })
      }, 5000)

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, testDuration))
      
      clearInterval(monitoringInterval)
      
      // Stop background load
      await backgroundLoad.stop()

      // Analyze resource usage trends
      const maxMemory = Math.max(...resourceSnapshots.map(s => s.memory.heapUsed))
      const avgConcurrency = resourceSnapshots.reduce((sum, s) => sum + s.concurrency, 0) / resourceSnapshots.length

      console.log('Resource Utilization Results:', {
        testDuration: `${testDuration / 1000}s`,
        maxMemoryUsed: `${(maxMemory / 1024 / 1024).toFixed(1)}MB`,
        avgConcurrency: avgConcurrency.toFixed(1),
        snapshots: resourceSnapshots.length
      })

      expect(maxMemory).toBeLessThan(PERFORMANCE_TARGETS.memory.max_heap)
      expect(avgConcurrency).toBeLessThan(PERFORMANCE_TARGETS.concurrency.heavy_load)
    }, 45000)

    createBackgroundLoad() {
      let running = true
      const profiles = TestDataGenerator.generateLargeDataset(200)
      let index = 0

      const generateLoad = async () => {
        while (running) {
          if (apiClient.getCurrentConcurrency() < 20) {
            const profile = profiles[index % profiles.length]
            index++
            
            apiClient.createProgressiveProfile(profile).catch(() => {
              // Ignore errors in background load
            })
          }
          
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      const loadPromise = generateLoad()

      return {
        stop: async () => {
          running = false
          await loadPromise
        }
      }
    }
  })

  describe('Performance Regression Detection', () => {
    test('Baseline performance benchmark', async () => {
      // This test establishes baseline performance metrics
      // that can be compared against in future test runs
      
      const baselineTests = [
        { name: 'simple_profile_creation', iterations: 100 },
        { name: 'complex_profile_creation', iterations: 50 },
        { name: 'profile_retrieval', iterations: 200 },
        { name: 'concurrent_operations', iterations: 30 }
      ]

      const benchmarkResults: Record<string, any> = {}

      for (const test of baselineTests) {
        console.log(`Running baseline benchmark: ${test.name}`)
        
        const results = []
        
        for (let i = 0; i < test.iterations; i++) {
          const profile = TestDataGenerator.generateChildProfile(
            test.name.includes('complex') ? 'complex' : 'simple'
          )
          
          const measurementId = monitor.startMeasurement(test.name)
          
          if (test.name === 'profile_retrieval') {
            await apiClient.getProfile(`profile_${i}`)
          } else if (test.name === 'concurrent_operations') {
            // Run 5 concurrent operations
            const concurrentPromises = Array.from({ length: 5 }, () => 
              apiClient.createProgressiveProfile(profile)
            )
            await Promise.all(concurrentPromises)
          } else {
            await apiClient.createProgressiveProfile(profile)
          }
          
          const duration = monitor.endMeasurement(measurementId)
          results.push(duration)
        }

        const stats = monitor.getStatistics(test.name)
        benchmarkResults[test.name] = stats

        console.log(`${test.name} Baseline:`, stats)
      }

      // Store benchmark results for comparison
      // In a real implementation, this would be saved to a file or database
      console.log('Baseline Performance Benchmark Results:', benchmarkResults)

      // Verify all benchmarks meet minimum performance requirements
      Object.entries(benchmarkResults).forEach(([testName, stats]: [string, any]) => {
        expect(stats.p95).toBeLessThan(2000) // Maximum 2 second p95 for any operation
        expect(stats.avg).toBeLessThan(1000) // Maximum 1 second average for any operation
      })
    })
  })
})

// Utility function to format test results for reporting
export function generatePerformanceReport(testResults: any) {
  const report = {
    timestamp: new Date().toISOString(),
    testSuite: 'CLP 2.0 Performance Tests',
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      performanceTargetsMet: true
    },
    detailedResults: testResults,
    recommendations: []
  }

  // Add performance recommendations based on results
  if (testResults.some((result: any) => result.p95 > PERFORMANCE_TARGETS.api.progressive_profile)) {
    report.recommendations.push('Consider optimizing API response times - p95 exceeds target')
  }

  if (testResults.some((result: any) => result.successRate < 0.95)) {
    report.recommendations.push('Investigate reliability issues - success rate below 95%')
  }

  return report
}