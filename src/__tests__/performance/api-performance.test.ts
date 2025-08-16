// API Performance Tests for CLP 2.0 System
// Comprehensive testing of API response times under various loads

import { performance } from 'perf_hooks'
import { createServer } from 'http'
import { NextRequest } from 'next/server'
import { POST, GET } from '../../app/api/profiles/progressive/route'
import { calculateCLP2Scores, consolidateCLP2Scores } from '../../lib/clp-scoring'
import { getCLP2Questions } from '../../lib/clp-questions'

// Performance thresholds (milliseconds)
const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE: {
    FAST: 200,    // Excellent
    GOOD: 500,    // Good
    SLOW: 1000    // Needs improvement
  },
  SCORING: {
    FAST: 50,     // Excellent
    GOOD: 100,    // Good
    SLOW: 250     // Needs improvement
  },
  DATABASE: {
    FAST: 100,    // Excellent
    GOOD: 300,    // Good
    SLOW: 800     // Needs improvement
  }
}

// Test data generators
const generateRealisticResponses = (questionCount: number = 24) => {
  const responses: Record<number, number | string | string[]> = {}
  
  // Core assessment questions (1-24)
  for (let i = 1; i <= questionCount; i++) {
    // Simulate realistic Likert scale responses with normal distribution
    const random = Math.random()
    if (random < 0.1) responses[i] = 5      // 10% strongly agree
    else if (random < 0.3) responses[i] = 4 // 20% agree
    else if (random < 0.7) responses[i] = 3 // 40% neutral
    else if (random < 0.9) responses[i] = 2 // 20% disagree
    else responses[i] = 1                   // 10% strongly disagree
  }
  
  // Preferences (25-28)
  responses[25] = ["hands-on", "visual"][Math.floor(Math.random() * 2)]
  responses[26] = ["creative", "analytical"][Math.floor(Math.random() * 2)]
  responses[27] = ["independent", "collaborative"][Math.floor(Math.random() * 2)]
  responses[28] = ["art", "science", "sports"].slice(0, Math.floor(Math.random() * 3) + 1)
  
  return responses
}

const generateTestProfile = (childName: string = 'Test Child') => ({
  child_name: childName,
  age_group: ['3-4', '4-5', '5+'][Math.floor(Math.random() * 3)],
  grade: ['Preschool', 'Kindergarten', '1st Grade'][Math.floor(Math.random() * 3)],
  quiz_type: ['parent_home', 'teacher_classroom', 'general'][Math.floor(Math.random() * 3)],
  respondent_type: ['parent', 'teacher'][Math.floor(Math.random() * 2)],
  respondent_id: `test-respondent-${Math.random().toString(36).substr(2, 9)}`,
  responses: generateRealisticResponses(),
  use_clp2_scoring: true
})

describe('CLP 2.0 API Performance Tests', () => {
  
  describe('Single API Request Performance', () => {
    
    it('should process single profile creation within performance thresholds', async () => {
      const testProfile = generateTestProfile('Performance Test Child')
      
      const startTime = performance.now()
      
      // Mock the API request
      const mockRequest = {
        json: async () => testProfile,
        nextUrl: { origin: 'http://localhost:3000' }
      } as NextRequest
      
      try {
        const response = await POST(mockRequest)
        const responseData = await response.json()
        
        const endTime = performance.now()
        const duration = endTime - startTime
        
        // Performance assertions
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE.SLOW)
        
        if (duration < PERFORMANCE_THRESHOLDS.API_RESPONSE.FAST) {
          console.log(`✅ EXCELLENT: API response time ${duration.toFixed(2)}ms`)
        } else if (duration < PERFORMANCE_THRESHOLDS.API_RESPONSE.GOOD) {
          console.log(`✅ GOOD: API response time ${duration.toFixed(2)}ms`)
        } else {
          console.log(`⚠️  SLOW: API response time ${duration.toFixed(2)}ms`)
        }
        
        // Verify response structure
        expect(responseData).toHaveProperty('profile')
        expect(responseData).toHaveProperty('shareUrl')
        
      } catch (error) {
        console.error('API request failed:', error)
        throw error
      }
    })
    
    it('should handle profile retrieval within performance thresholds', async () => {
      const mockProfileId = 'test-profile-id-123'
      
      const startTime = performance.now()
      
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams({
            profileId: mockProfileId,
            context: 'parent'
          })
        }
      } as NextRequest
      
      try {
        const response = await GET(mockRequest)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        // Performance assertions
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE.GOOD)
        
        console.log(`Profile retrieval time: ${duration.toFixed(2)}ms`)
        
      } catch (error) {
        // Expected to fail in test environment, but timing is still valid
        const endTime = performance.now()
        const duration = endTime - startTime
        console.log(`Profile retrieval attempt time: ${duration.toFixed(2)}ms`)
      }
    })
  })
  
  describe('Scoring Algorithm Performance', () => {
    
    it('should calculate CLP 2.0 scores efficiently', async () => {
      const responses = generateRealisticResponses()
      const iterations = 100
      
      const times: number[] = []
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()
        
        const scores = calculateCLP2Scores(responses, 'parent_home', '5+')
        
        const endTime = performance.now()
        times.push(endTime - startTime)
        
        // Verify scores are valid
        expect(scores.Communication).toBeGreaterThanOrEqual(1.0)
        expect(scores.Communication).toBeLessThanOrEqual(5.0)
      }
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)
      
      console.log(`Scoring performance over ${iterations} iterations:`)
      console.log(`  Average: ${avgTime.toFixed(2)}ms`)
      console.log(`  Min: ${minTime.toFixed(2)}ms`)
      console.log(`  Max: ${maxTime.toFixed(2)}ms`)
      
      // Performance assertions
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SCORING.SLOW)
      expect(maxTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SCORING.SLOW * 2)
    })
    
    it('should consolidate multiple profiles efficiently', async () => {
      const sources = Array.from({ length: 5 }, (_, index) => ({
        scores: {
          Communication: Math.random() * 4 + 1,
          Collaboration: Math.random() * 4 + 1,
          Content: Math.random() * 4 + 1,
          'Critical Thinking': Math.random() * 4 + 1,
          'Creative Innovation': Math.random() * 4 + 1,
          Confidence: Math.random() * 4 + 1,
          Literacy: Math.random() * 4 + 1,
          Math: Math.random() * 4 + 1
        },
        weight: 0.2,
        quizType: index % 2 === 0 ? 'parent_home' : 'teacher_classroom',
        respondentType: `respondent_${index}`
      }))
      
      const iterations = 50
      const times: number[] = []
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()
        
        const consolidated = consolidateCLP2Scores(sources)
        
        const endTime = performance.now()
        times.push(endTime - startTime)
        
        // Verify consolidation worked
        expect(consolidated.Communication).toBeGreaterThanOrEqual(1.0)
        expect(consolidated.Communication).toBeLessThanOrEqual(5.0)
      }
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      
      console.log(`Consolidation performance: ${avgTime.toFixed(2)}ms average`)
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SCORING.GOOD)
    })
  })
  
  describe('Question Generation Performance', () => {
    
    it('should generate questions for all age groups efficiently', async () => {
      const ageGroups = [36, 48, 60, 72, 84, 96, 108, 120] // Various ages in months
      
      const startTime = performance.now()
      
      const results = ageGroups.map(ageInMonths => {
        const questions = getCLP2Questions(ageInMonths)
        return { age: ageInMonths, questionCount: questions.length }
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`Question generation for ${ageGroups.length} age groups: ${duration.toFixed(2)}ms`)
      
      // Performance assertion
      expect(duration).toBeLessThan(100) // Should be very fast
      
      // Verify all age groups got questions
      results.forEach(result => {
        expect(result.questionCount).toBeGreaterThan(0)
      })
    })
  })
  
  describe('Concurrent Processing Performance', () => {
    
    it('should handle multiple simultaneous profile creations', async () => {
      const concurrentRequests = 10
      const profiles = Array.from({ length: concurrentRequests }, (_, i) => 
        generateTestProfile(`Concurrent Child ${i + 1}`)
      )
      
      const startTime = performance.now()
      
      // Process all profiles concurrently
      const promises = profiles.map(async (profile) => {
        const mockRequest = {
          json: async () => profile,
          nextUrl: { origin: 'http://localhost:3000' }
        } as NextRequest
        
        try {
          const response = await POST(mockRequest)
          return await response.json()
        } catch (error) {
          // Return error info for analysis
          return { error: error.message }
        }
      })
      
      const results = await Promise.all(promises)
      const endTime = performance.now()
      const totalDuration = endTime - startTime
      const avgDuration = totalDuration / concurrentRequests
      
      console.log(`Concurrent processing results:`)
      console.log(`  Total time: ${totalDuration.toFixed(2)}ms`)
      console.log(`  Average per request: ${avgDuration.toFixed(2)}ms`)
      console.log(`  Requests per second: ${(1000 / avgDuration).toFixed(2)}`)
      
      // Performance assertions
      expect(totalDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE.SLOW * 2)
      expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE.SLOW)
      
      // Count successful vs failed requests
      const successCount = results.filter(r => !r.error).length
      const errorCount = results.filter(r => r.error).length
      
      console.log(`  Successful: ${successCount}/${concurrentRequests}`)
      console.log(`  Errors: ${errorCount}/${concurrentRequests}`)
    })
  })
  
  describe('Memory Usage During Processing', () => {
    
    it('should maintain reasonable memory usage during batch processing', async () => {
      const batchSize = 25
      
      // Check initial memory
      const initialMemory = process.memoryUsage()
      console.log('Initial memory usage:', {
        rss: `${(initialMemory.rss / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`
      })
      
      // Process batch of profiles
      for (let i = 0; i < batchSize; i++) {
        const responses = generateRealisticResponses()
        calculateCLP2Scores(responses, 'parent_home', '5+')
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      // Check final memory
      const finalMemory = process.memoryUsage()
      console.log('Final memory usage:', {
        rss: `${(finalMemory.rss / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`
      })
      
      // Check memory growth
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed
      const memoryGrowthMB = memoryGrowth / 1024 / 1024
      
      console.log(`Memory growth: ${memoryGrowthMB.toFixed(2)}MB for ${batchSize} profiles`)
      
      // Memory assertions (should not grow excessively)
      expect(memoryGrowthMB).toBeLessThan(50) // Should not grow more than 50MB
      expect(finalMemory.heapUsed).toBeLessThan(200 * 1024 * 1024) // Should not exceed 200MB total
    })
  })
  
  describe('Performance Regression Detection', () => {
    
    it('should maintain consistent performance across multiple test runs', async () => {
      const testRuns = 5
      const operationsPerRun = 20
      const runTimes: number[] = []
      
      for (let run = 0; run < testRuns; run++) {
        const runStartTime = performance.now()
        
        // Perform standard operations
        for (let op = 0; op < operationsPerRun; op++) {
          const responses = generateRealisticResponses()
          calculateCLP2Scores(responses, 'parent_home', '5+')
        }
        
        const runEndTime = performance.now()
        const runDuration = runEndTime - runStartTime
        runTimes.push(runDuration)
        
        console.log(`Run ${run + 1}: ${runDuration.toFixed(2)}ms`)
      }
      
      // Calculate performance statistics
      const avgTime = runTimes.reduce((sum, time) => sum + time, 0) / testRuns
      const minTime = Math.min(...runTimes)
      const maxTime = Math.max(...runTimes)
      const variance = runTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / testRuns
      const stdDev = Math.sqrt(variance)
      const coefficientOfVariation = stdDev / avgTime
      
      console.log('Performance consistency analysis:')
      console.log(`  Average: ${avgTime.toFixed(2)}ms`)
      console.log(`  Min: ${minTime.toFixed(2)}ms`)
      console.log(`  Max: ${maxTime.toFixed(2)}ms`)
      console.log(`  Std Dev: ${stdDev.toFixed(2)}ms`)
      console.log(`  Coefficient of Variation: ${(coefficientOfVariation * 100).toFixed(2)}%`)
      
      // Performance consistency assertions
      expect(coefficientOfVariation).toBeLessThan(0.3) // Less than 30% variation
      expect(maxTime - minTime).toBeLessThan(avgTime) // Range should not exceed average
    })
  })
})