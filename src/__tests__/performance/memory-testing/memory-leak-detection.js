/**
 * Memory Leak Detection and Analysis for CLP 2.0
 * 
 * Comprehensive memory testing including:
 * - Memory leak detection over extended operations
 * - Heap usage analysis and trends
 * - Garbage collection monitoring
 * - Memory pressure testing
 * - Resource cleanup verification
 */

const { performance } = require('perf_hooks')
const v8 = require('v8')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

// Memory Test Configuration
const MEMORY_TEST_CONFIG = {
  thresholds: {
    maxHeapSize: 512 * 1024 * 1024,      // 512MB max heap
    leakThreshold: 50 * 1024 * 1024,     // 50MB leak threshold
    gcEfficiencyThreshold: 0.7,          // 70% minimum GC efficiency
    memoryGrowthRate: 1024 * 1024,       // 1MB per 1000 operations max
  },
  testDuration: {
    shortTest: 60000,    // 1 minute
    mediumTest: 300000,  // 5 minutes
    longTest: 900000,    // 15 minutes
  },
  samplingInterval: 1000, // 1 second
  operationsPerCycle: 100,
}

// Memory monitoring utilities
class MemoryMonitor {
  constructor() {
    this.snapshots = []
    this.gcEvents = []
    this.startTime = Date.now()
    this.isMonitoring = false
    this.monitoringInterval = null
  }

  start() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.startTime = Date.now()
    this.snapshots = []
    this.gcEvents = []

    // Enable GC events monitoring
    if (global.gc) {
      const originalGC = global.gc
      global.gc = () => {
        const beforeGC = process.memoryUsage()
        originalGC()
        const afterGC = process.memoryUsage()
        
        this.gcEvents.push({
          timestamp: Date.now() - this.startTime,
          beforeGC,
          afterGC,
          freed: beforeGC.heapUsed - afterGC.heapUsed
        })
      }
    }

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot()
    }, MEMORY_TEST_CONFIG.samplingInterval)

    this.takeSnapshot() // Initial snapshot
    console.log('📊 Memory monitoring started')
  }

  stop() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    this.takeSnapshot() // Final snapshot
    console.log('📊 Memory monitoring stopped')
  }

  takeSnapshot() {
    const memUsage = process.memoryUsage()
    const heapStats = v8.getHeapStatistics()
    
    const snapshot = {
      timestamp: Date.now() - this.startTime,
      memory: memUsage,
      heap: heapStats,
      cpuUsage: process.cpuUsage()
    }

    this.snapshots.push(snapshot)
    return snapshot
  }

  forceGC() {
    if (global.gc) {
      const before = process.memoryUsage()
      global.gc()
      const after = process.memoryUsage()
      
      console.log(`🗑️  GC: Freed ${((before.heapUsed - after.heapUsed) / 1024 / 1024).toFixed(2)}MB`)
      return after
    } else {
      console.warn('⚠️  Global GC not available. Run with --expose-gc flag.')
      return process.memoryUsage()
    }
  }

  analyzeMemoryTrend() {
    if (this.snapshots.length < 2) {
      return { trend: 'insufficient_data', growth: 0, efficiency: 0 }
    }

    const first = this.snapshots[0]
    const last = this.snapshots[this.snapshots.length - 1]
    const duration = (last.timestamp - first.timestamp) / 1000 // seconds

    // Calculate memory growth
    const heapGrowth = last.memory.heapUsed - first.memory.heapUsed
    const growthRate = heapGrowth / duration // bytes per second

    // Calculate GC efficiency
    const totalFreed = this.gcEvents.reduce((sum, event) => sum + event.freed, 0)
    const totalAllocated = last.memory.heapUsed + totalFreed
    const gcEfficiency = totalAllocated > 0 ? totalFreed / totalAllocated : 0

    // Detect trends
    let trend = 'stable'
    if (growthRate > MEMORY_TEST_CONFIG.thresholds.memoryGrowthRate / 1000) {
      trend = 'increasing'
    } else if (growthRate < -1000) {
      trend = 'decreasing'
    }

    return {
      trend,
      growth: heapGrowth,
      growthRate,
      duration,
      gcEfficiency,
      gcEvents: this.gcEvents.length,
      totalFreed,
      snapshots: this.snapshots.length
    }
  }

  detectMemoryLeaks() {
    const analysis = this.analyzeMemoryTrend()
    
    const leakIndicators = {
      highGrowthRate: analysis.growthRate > MEMORY_TEST_CONFIG.thresholds.memoryGrowthRate / 1000,
      lowGcEfficiency: analysis.gcEfficiency < MEMORY_TEST_CONFIG.thresholds.gcEfficiencyThreshold,
      steadyIncrease: analysis.trend === 'increasing',
      excessiveHeapSize: this.snapshots[this.snapshots.length - 1]?.memory.heapUsed > MEMORY_TEST_CONFIG.thresholds.maxHeapSize
    }

    const leakDetected = Object.values(leakIndicators).some(indicator => indicator)

    return {
      leakDetected,
      indicators: leakIndicators,
      analysis,
      recommendation: this.generateRecommendations(leakIndicators, analysis)
    }
  }

  generateRecommendations(indicators, analysis) {
    const recommendations = []

    if (indicators.highGrowthRate) {
      recommendations.push('High memory growth rate detected - investigate object retention')
    }
    
    if (indicators.lowGcEfficiency) {
      recommendations.push('Low GC efficiency - check for memory leaks or large object allocations')
    }
    
    if (indicators.steadyIncrease) {
      recommendations.push('Steady memory increase - monitor for cumulative memory leaks')
    }
    
    if (indicators.excessiveHeapSize) {
      recommendations.push('Heap size exceeds threshold - consider memory optimization')
    }

    if (analysis.gcEvents < 5 && analysis.duration > 60) {
      recommendations.push('Few GC events - may indicate memory pressure or large heap')
    }

    return recommendations
  }

  generateReport() {
    const leakAnalysis = this.detectMemoryLeaks()
    const trend = this.analyzeMemoryTrend()

    return {
      timestamp: new Date().toISOString(),
      testDuration: trend.duration,
      memoryAnalysis: {
        initialHeap: this.snapshots[0]?.memory.heapUsed || 0,
        finalHeap: this.snapshots[this.snapshots.length - 1]?.memory.heapUsed || 0,
        heapGrowth: trend.growth,
        growthRate: trend.growthRate,
        maxHeapUsed: Math.max(...this.snapshots.map(s => s.memory.heapUsed))
      },
      gcAnalysis: {
        events: trend.gcEvents,
        efficiency: trend.gcEfficiency,
        totalFreed: trend.totalFreed
      },
      leakDetection: leakAnalysis,
      snapshots: this.snapshots.length,
      recommendations: leakAnalysis.recommendation
    }
  }
}

// Mock workload generators for memory testing
class MemoryTestWorkloads {
  static async profileCreationWorkload(iterations = 1000) {
    const profiles = []
    
    for (let i = 0; i < iterations; i++) {
      const profile = {
        id: `profile_${i}_${Math.random().toString(36).substring(7)}`,
        child_name: `Test Child ${i}`,
        age_group: '5+',
        responses: this.generateLargeResponseSet(),
        scores: this.generateScores(),
        metadata: {
          timestamp: Date.now(),
          iteration: i,
          largeData: new Array(100).fill(`data_chunk_${i}`)
        }
      }
      
      profiles.push(profile)
      
      // Simulate processing
      await this.delay(1)
      
      // Clean up some profiles to test GC
      if (profiles.length > 500) {
        profiles.splice(0, 100)
      }
    }
    
    return profiles
  }

  static async scoringWorkload(iterations = 1000) {
    const results = []
    
    for (let i = 0; i < iterations; i++) {
      const responses = this.generateLargeResponseSet()
      
      // Simulate complex scoring calculations
      const scores = {}
      for (const [questionId, response] of Object.entries(responses)) {
        scores[`skill_${questionId}`] = this.complexCalculation(response, i)
      }
      
      const result = {
        id: i,
        scores,
        calculations: new Array(50).fill().map((_, idx) => ({
          step: idx,
          value: Math.random() * 1000,
          timestamp: Date.now()
        })),
        temporary_data: new Array(200).fill(`temp_${i}_${Math.random()}`)
      }
      
      results.push(result)
      
      // Simulate memory cleanup
      if (i % 100 === 0 && global.gc) {
        global.gc()
      }
      
      await this.delay(2)
    }
    
    return results
  }

  static async consolidationWorkload(iterations = 500) {
    const consolidatedProfiles = new Map()
    
    for (let i = 0; i < iterations; i++) {
      const childName = `child_${i % 50}` // Simulate 50 children with multiple assessments
      
      if (!consolidatedProfiles.has(childName)) {
        consolidatedProfiles.set(childName, {
          name: childName,
          assessments: [],
          consolidatedScores: {},
          history: []
        })
      }
      
      const profile = consolidatedProfiles.get(childName)
      
      // Add new assessment
      const assessment = {
        id: `assessment_${i}`,
        scores: this.generateScores(),
        timestamp: Date.now(),
        rawData: new Array(300).fill().map((_, idx) => ({
          question: idx,
          response: Math.random(),
          metadata: `meta_${i}_${idx}`
        }))
      }
      
      profile.assessments.push(assessment)
      profile.history.push(`Event ${i} at ${Date.now()}`)
      
      // Simulate consolidation calculation
      profile.consolidatedScores = this.consolidateScores(profile.assessments)
      
      // Simulate data retention policies
      if (profile.assessments.length > 10) {
        profile.assessments.splice(0, 5) // Keep only recent assessments
      }
      
      if (profile.history.length > 100) {
        profile.history.splice(0, 50) // Keep only recent history
      }
      
      await this.delay(5)
    }
    
    return Array.from(consolidatedProfiles.values())
  }

  static generateLargeResponseSet() {
    const responses = {}
    
    // Generate responses for extended question set
    for (let i = 1; i <= 50; i++) {
      responses[i] = Math.floor(Math.random() * 5) + 1
    }
    
    // Add complex preference data
    for (let i = 51; i <= 60; i++) {
      responses[i] = new Array(10).fill().map(() => Math.random().toString(36).substring(7))
    }
    
    return responses
  }

  static generateScores() {
    const skills = ['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence', 'Literacy', 'Math']
    const scores = {}
    
    skills.forEach(skill => {
      scores[skill] = Math.random() * 5
    })
    
    return scores
  }

  static complexCalculation(response, iteration) {
    // Simulate complex calculation that creates temporary objects
    const tempArrays = []
    
    for (let i = 0; i < 10; i++) {
      tempArrays.push(new Array(100).fill(response * iteration * Math.random()))
    }
    
    return tempArrays.reduce((sum, arr) => sum + arr[0], 0) / tempArrays.length
  }

  static consolidateScores(assessments) {
    const consolidated = {}
    const tempCalculations = []
    
    assessments.forEach(assessment => {
      Object.entries(assessment.scores).forEach(([skill, score]) => {
        if (!consolidated[skill]) {
          consolidated[skill] = []
        }
        consolidated[skill].push(score)
        
        // Create temporary calculation objects
        tempCalculations.push({
          skill,
          score,
          weight: Math.random(),
          timestamp: Date.now(),
          metadata: new Array(20).fill(`calc_${skill}_${score}`)
        })
      })
    })
    
    // Calculate weighted averages
    Object.keys(consolidated).forEach(skill => {
      const scores = consolidated[skill]
      consolidated[skill] = scores.reduce((sum, score) => sum + score, 0) / scores.length
    })
    
    return consolidated
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Memory test runner
class MemoryTestRunner {
  constructor() {
    this.monitor = new MemoryMonitor()
    this.testResults = []
  }

  async runShortTermMemoryTest() {
    console.log('\n🏃‍♂️ Running Short-term Memory Test (1 minute)...')
    
    this.monitor.start()
    
    try {
      // Run profile creation workload
      await MemoryTestWorkloads.profileCreationWorkload(200)
      
      // Force GC and wait
      this.monitor.forceGC()
      await this.wait(2000)
      
      // Run scoring workload
      await MemoryTestWorkloads.scoringWorkload(150)
      
      // Force GC again
      this.monitor.forceGC()
      await this.wait(2000)
      
    } finally {
      this.monitor.stop()
    }
    
    const report = this.monitor.generateReport()
    this.testResults.push({ test: 'short_term', report })
    
    console.log('📊 Short-term Memory Test Results:')
    this.printReport(report)
    
    return report
  }

  async runMediumTermMemoryTest() {
    console.log('\n🏃‍♂️ Running Medium-term Memory Test (5 minutes)...')
    
    this.monitor.start()
    
    try {
      const endTime = Date.now() + MEMORY_TEST_CONFIG.testDuration.mediumTest
      let iteration = 0
      
      while (Date.now() < endTime) {
        // Cycle through different workloads
        const workloadType = iteration % 3
        
        switch (workloadType) {
          case 0:
            await MemoryTestWorkloads.profileCreationWorkload(50)
            break
          case 1:
            await MemoryTestWorkloads.scoringWorkload(75)
            break
          case 2:
            await MemoryTestWorkloads.consolidationWorkload(25)
            break
        }
        
        // Periodic cleanup
        if (iteration % 10 === 0) {
          this.monitor.forceGC()
          await this.wait(1000)
        }
        
        iteration++
        console.log(`💫 Medium-term test iteration ${iteration} completed`)
      }
      
    } finally {
      this.monitor.stop()
    }
    
    const report = this.monitor.generateReport()
    this.testResults.push({ test: 'medium_term', report })
    
    console.log('📊 Medium-term Memory Test Results:')
    this.printReport(report)
    
    return report
  }

  async runLongTermMemoryTest() {
    console.log('\n🏃‍♂️ Running Long-term Memory Test (15 minutes)...')
    
    this.monitor.start()
    
    try {
      const endTime = Date.now() + MEMORY_TEST_CONFIG.testDuration.longTest
      let iteration = 0
      
      while (Date.now() < endTime) {
        // Simulate realistic production load
        const promises = []
        
        // Concurrent workloads
        promises.push(MemoryTestWorkloads.profileCreationWorkload(25))
        promises.push(MemoryTestWorkloads.scoringWorkload(30))
        promises.push(MemoryTestWorkloads.consolidationWorkload(10))
        
        await Promise.all(promises)
        
        // Periodic maintenance
        if (iteration % 5 === 0) {
          this.monitor.forceGC()
          await this.wait(2000)
          
          const currentAnalysis = this.monitor.analyzeMemoryTrend()
          console.log(`🔍 Long-term test checkpoint ${iteration}: ${(currentAnalysis.growth / 1024 / 1024).toFixed(2)}MB growth, ${currentAnalysis.gcEvents} GC events`)
        }
        
        iteration++
      }
      
    } finally {
      this.monitor.stop()
    }
    
    const report = this.monitor.generateReport()
    this.testResults.push({ test: 'long_term', report })
    
    console.log('📊 Long-term Memory Test Results:')
    this.printReport(report)
    
    return report
  }

  async runMemoryPressureTest() {
    console.log('\n💥 Running Memory Pressure Test...')
    
    this.monitor.start()
    
    try {
      const largeDataSets = []
      
      // Gradually increase memory pressure
      for (let pressure = 1; pressure <= 10; pressure++) {
        console.log(`📈 Memory pressure level ${pressure}/10`)
        
        // Create large data structures
        const dataSet = {
          id: pressure,
          largeArray: new Array(1000000).fill().map((_, i) => ({
            index: i,
            data: Math.random().toString(36),
            metadata: new Array(10).fill(`meta_${i}`)
          }))
        }
        
        largeDataSets.push(dataSet)
        
        // Simulate operations on large data
        await MemoryTestWorkloads.profileCreationWorkload(50)
        
        const currentMemory = process.memoryUsage()
        console.log(`   Heap used: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`)
        
        // Check if we're approaching memory limits
        if (currentMemory.heapUsed > MEMORY_TEST_CONFIG.thresholds.maxHeapSize * 0.8) {
          console.log('⚠️  Approaching memory limit, triggering cleanup')
          largeDataSets.splice(0, Math.floor(largeDataSets.length / 2))
          this.monitor.forceGC()
          await this.wait(3000)
        }
        
        await this.wait(1000)
      }
      
    } finally {
      this.monitor.stop()
    }
    
    const report = this.monitor.generateReport()
    this.testResults.push({ test: 'memory_pressure', report })
    
    console.log('📊 Memory Pressure Test Results:')
    this.printReport(report)
    
    return report
  }

  async runConcurrentMemoryTest() {
    console.log('\n🔄 Running Concurrent Memory Test...')
    
    this.monitor.start()
    
    try {
      // Create multiple workers for concurrent operations
      const workerPromises = []
      const numWorkers = 4
      
      for (let i = 0; i < numWorkers; i++) {
        const workerPromise = this.runWorkerMemoryTest(i)
        workerPromises.push(workerPromise)
      }
      
      // Wait for all workers to complete
      await Promise.all(workerPromises)
      
    } finally {
      this.monitor.stop()
    }
    
    const report = this.monitor.generateReport()
    this.testResults.push({ test: 'concurrent', report })
    
    console.log('📊 Concurrent Memory Test Results:')
    this.printReport(report)
    
    return report
  }

  async runWorkerMemoryTest(workerId) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { workerId, test: 'worker_memory_test' }
      })
      
      worker.on('message', (message) => {
        if (message.type === 'completed') {
          console.log(`👷 Worker ${workerId} completed: ${message.operations} operations`)
          resolve(message)
        }
      })
      
      worker.on('error', reject)
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker ${workerId} exited with code ${code}`))
        }
      })
    })
  }

  printReport(report) {
    const memMB = (bytes) => (bytes / 1024 / 1024).toFixed(2)
    
    console.log(`   Duration: ${report.testDuration.toFixed(1)}s`)
    console.log(`   Heap Growth: ${memMB(report.memoryAnalysis.heapGrowth)}MB`)
    console.log(`   Growth Rate: ${memMB(report.memoryAnalysis.growthRate)}/s`)
    console.log(`   Max Heap: ${memMB(report.memoryAnalysis.maxHeapUsed)}MB`)
    console.log(`   GC Events: ${report.gcAnalysis.events}`)
    console.log(`   GC Efficiency: ${(report.gcAnalysis.efficiency * 100).toFixed(1)}%`)
    console.log(`   Leak Detected: ${report.leakDetection.leakDetected ? '❌ YES' : '✅ NO'}`)
    
    if (report.recommendations.length > 0) {
      console.log('   Recommendations:')
      report.recommendations.forEach(rec => console.log(`     • ${rec}`))
    }
  }

  generateSummaryReport() {
    console.log('\n📋 MEMORY TEST SUITE SUMMARY')
    console.log('=' .repeat(60))
    
    const summary = {
      totalTests: this.testResults.length,
      leaksDetected: this.testResults.filter(r => r.report.leakDetection.leakDetected).length,
      averageGrowthRate: 0,
      recommendations: new Set()
    }
    
    // Calculate averages
    if (this.testResults.length > 0) {
      summary.averageGrowthRate = this.testResults.reduce((sum, r) => 
        sum + r.report.memoryAnalysis.growthRate, 0) / this.testResults.length
    }
    
    // Collect all recommendations
    this.testResults.forEach(r => {
      r.report.recommendations.forEach(rec => summary.recommendations.add(rec))
    })
    
    console.log(`Tests Run: ${summary.totalTests}`)
    console.log(`Memory Leaks Detected: ${summary.leaksDetected}`)
    console.log(`Overall Status: ${summary.leaksDetected === 0 ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Average Growth Rate: ${(summary.averageGrowthRate / 1024 / 1024).toFixed(2)}MB/s`)
    
    if (summary.recommendations.size > 0) {
      console.log('\nOverall Recommendations:')
      Array.from(summary.recommendations).forEach(rec => console.log(`  • ${rec}`))
    }
    
    console.log('=' .repeat(60))
    
    return summary
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Worker thread implementation for concurrent testing
if (!isMainThread) {
  (async function workerMain() {
    const { workerId, test } = workerData
    
    let operations = 0
    const startTime = Date.now()
    const duration = 30000 // 30 seconds
    
    try {
      while (Date.now() - startTime < duration) {
        // Simulate memory-intensive operations
        await MemoryTestWorkloads.profileCreationWorkload(20)
        await MemoryTestWorkloads.scoringWorkload(25)
        
        operations += 45
        
        // Periodic cleanup
        if (operations % 100 === 0 && global.gc) {
          global.gc()
        }
      }
      
      parentPort.postMessage({
        type: 'completed',
        workerId,
        operations,
        duration: Date.now() - startTime
      })
      
    } catch (error) {
      parentPort.postMessage({
        type: 'error',
        workerId,
        error: error.message
      })
    }
  })()
}

// Main execution function
async function runMemoryTests() {
  console.log('🧠 CLP 2.0 Memory Testing Suite Starting...')
  
  if (!global.gc) {
    console.warn('⚠️  Warning: Global GC not available. Run with --expose-gc flag for better testing.')
  }
  
  const runner = new MemoryTestRunner()
  
  try {
    // Run all memory tests
    await runner.runShortTermMemoryTest()
    await runner.wait(5000) // Rest between tests
    
    await runner.runMediumTermMemoryTest()
    await runner.wait(5000)
    
    await runner.runMemoryPressureTest()
    await runner.wait(5000)
    
    await runner.runConcurrentMemoryTest()
    
    // Generate summary
    const summary = runner.generateSummaryReport()
    
    if (summary.leaksDetected > 0) {
      console.log('\n❌ Memory leaks detected! Review recommendations above.')
      process.exit(1)
    } else {
      console.log('\n✅ All memory tests passed!')
    }
    
  } catch (error) {
    console.error('Memory testing failed:', error)
    process.exit(1)
  }
}

// Export for use in other modules
module.exports = {
  MemoryMonitor,
  MemoryTestWorkloads,
  MemoryTestRunner,
  runMemoryTests
}

// Run if executed directly
if (require.main === module) {
  runMemoryTests()
}