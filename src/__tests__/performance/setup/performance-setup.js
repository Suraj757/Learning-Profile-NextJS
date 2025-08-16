/**
 * Performance Testing Setup
 * 
 * Global setup and configuration for performance tests:
 * - Environment validation
 * - Resource monitoring initialization
 * - Performance threshold configuration
 * - Test utilities setup
 */

const { performance } = require('perf_hooks')

// Global performance monitoring
global.performanceMonitor = {
  measurements: new Map(),
  resources: [],
  
  start(label) {
    const id = `${label}_${Date.now()}_${Math.random()}`
    performance.mark(`${id}_start`)
    return id
  },
  
  end(id) {
    performance.mark(`${id}_end`)
    performance.measure(id, `${id}_start`, `${id}_end`)
    
    const measure = performance.getEntriesByName(id)[0]
    const duration = measure.duration
    
    const label = id.split('_')[0]
    if (!this.measurements.has(label)) {
      this.measurements.set(label, [])
    }
    this.measurements.get(label).push(duration)
    
    // Cleanup
    performance.clearMarks(`${id}_start`)
    performance.clearMarks(`${id}_end`)
    performance.clearMeasures(id)
    
    return duration
  },
  
  getStats(label) {
    const measurements = this.measurements.get(label) || []
    if (measurements.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0 }
    }
    
    const sorted = measurements.slice().sort((a, b) => a - b)
    return {
      count: measurements.length,
      avg: measurements.reduce((sum, val) => sum + val, 0) / measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(measurements.length * 0.5)],
      p95: sorted[Math.floor(measurements.length * 0.95)],
      p99: sorted[Math.floor(measurements.length * 0.99)]
    }
  },
  
  takeResourceSnapshot() {
    this.resources.push({
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    })
  },
  
  getResourceTrend() {
    if (this.resources.length < 2) return { memoryGrowth: 0, cpuAvg: 0 }
    
    const first = this.resources[0]
    const last = this.resources[this.resources.length - 1]
    
    const memoryGrowth = (last.memory.heapUsed - first.memory.heapUsed) / 1024 / 1024 // MB
    const cpuAvg = this.resources.reduce((sum, r) => sum + (r.cpu.user + r.cpu.system), 0) / this.resources.length
    
    return { memoryGrowth, cpuAvg }
  },
  
  reset() {
    this.measurements.clear()
    this.resources = []
    performance.clearMarks()
    performance.clearMeasures()
  }
}

// Global test utilities
global.testUtils = {
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  
  generateTestData(count = 100) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Test Item ${i}`,
      value: Math.random() * 1000,
      timestamp: Date.now() + i
    }))
  },
  
  async withTimeout(promise, timeout = 30000) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
      )
    ])
  },
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },
  
  formatDuration(ms) {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }
}

// Performance expectations helper
global.expectPerformance = {
  toBeWithinThreshold(received, threshold, metric = 'value') {
    const pass = received <= threshold
    if (pass) {
      return {
        message: () => `Expected ${metric} ${received} to exceed threshold ${threshold}`,
        pass: true
      }
    } else {
      return {
        message: () => `Expected ${metric} ${received} to be within threshold ${threshold}`,
        pass: false
      }
    }
  },
  
  toHaveAcceptablePerformance(stats, thresholds) {
    const issues = []
    
    if (stats.avg > thresholds.avgResponseTime) {
      issues.push(`Average response time ${stats.avg.toFixed(0)}ms exceeds ${thresholds.avgResponseTime}ms`)
    }
    
    if (stats.p95 > thresholds.p95ResponseTime) {
      issues.push(`P95 response time ${stats.p95.toFixed(0)}ms exceeds ${thresholds.p95ResponseTime}ms`)
    }
    
    const pass = issues.length === 0
    return {
      message: () => pass 
        ? `Performance metrics within acceptable range`
        : `Performance issues detected: ${issues.join(', ')}`,
      pass
    }
  }
}

// Environment validation
function validateEnvironment() {
  const requiredEnvVars = ['NODE_ENV']
  const missing = requiredEnvVars.filter(env => !process.env[env])
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`)
  }
  
  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  
  if (majorVersion < 16) {
    console.warn(`⚠️  Node.js version ${nodeVersion} may not support all performance testing features. Recommended: 16+`)
  }
  
  // Check available memory
  const totalMemory = require('os').totalmem()
  const freeMemory = require('os').freemem()
  
  if (freeMemory < 1024 * 1024 * 1024) { // Less than 1GB free
    console.warn(`⚠️  Low available memory: ${global.testUtils.formatBytes(freeMemory)}`)
  }
  
  console.log(`📊 Performance testing environment:`)
  console.log(`   Node.js: ${nodeVersion}`)
  console.log(`   Platform: ${process.platform} ${process.arch}`)
  console.log(`   Memory: ${global.testUtils.formatBytes(freeMemory)} free / ${global.testUtils.formatBytes(totalMemory)} total`)
  console.log(`   CPUs: ${require('os').cpus().length}`)
}

// Jest hooks
beforeAll(async () => {
  console.log('🚀 Initializing performance testing environment...')
  
  validateEnvironment()
  
  // Initialize resource monitoring
  global.performanceMonitor.takeResourceSnapshot()
  
  // Set up periodic resource monitoring during tests
  global.resourceMonitoringInterval = setInterval(() => {
    global.performanceMonitor.takeResourceSnapshot()
  }, 5000) // Every 5 seconds
  
  console.log('✅ Performance testing environment ready')
})

afterAll(async () => {
  console.log('🏁 Cleaning up performance testing environment...')
  
  // Stop resource monitoring
  if (global.resourceMonitoringInterval) {
    clearInterval(global.resourceMonitoringInterval)
  }
  
  // Final resource snapshot
  global.performanceMonitor.takeResourceSnapshot()
  
  // Log final resource usage
  const resourceTrend = global.performanceMonitor.getResourceTrend()
  console.log(`📈 Resource usage summary:`)
  console.log(`   Memory growth: ${resourceTrend.memoryGrowth.toFixed(2)}MB`)
  console.log(`   CPU usage: ${resourceTrend.cpuAvg.toFixed(2)}µs`)
  
  // Cleanup
  global.performanceMonitor.reset()
  
  console.log('✅ Performance testing cleanup complete')
})

beforeEach(async () => {
  // Take snapshot before each test
  global.performanceMonitor.takeResourceSnapshot()
})

afterEach(async () => {
  // Take snapshot after each test
  global.performanceMonitor.takeResourceSnapshot()
  
  // Force garbage collection if available
  if (global.gc && typeof global.gc === 'function') {
    global.gc()
  }
})

// Handle unhandled rejections in performance tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection in performance test:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in performance test:', error)
})

// Export for use in tests
module.exports = {
  performanceMonitor: global.performanceMonitor,
  testUtils: global.testUtils,
  expectPerformance: global.expectPerformance
}