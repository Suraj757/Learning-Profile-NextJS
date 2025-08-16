/**
 * Jest Configuration for Performance Testing
 * 
 * Specialized Jest configuration optimized for performance testing:
 * - Extended timeouts for long-running tests
 * - Memory and resource monitoring
 * - Custom reporters for performance metrics
 * - Isolated test environment
 */

const baseConfig = require('./jest.config.js')

module.exports = {
  ...baseConfig,
  
  // Test file patterns for performance tests
  testMatch: [
    '<rootDir>/src/__tests__/performance/**/*.test.(js|ts)',
    '<rootDir>/src/__tests__/performance/**/*.perf.(js|ts)'
  ],
  
  // Extended timeouts for performance tests
  testTimeout: 300000, // 5 minutes default
  
  // Performance test environment setup
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/performance/setup/performance-setup.js'
  ],
  
  // Custom test environment for performance testing
  testEnvironment: 'node',
  
  // Disable parallel execution for performance tests to avoid resource conflicts
  maxWorkers: 1,
  
  // Memory and performance monitoring
  logHeapUsage: true,
  detectOpenHandles: true,
  forceExit: true,
  
  // Custom reporters for performance metrics
  reporters: [
    'default',
    ['<rootDir>/src/__tests__/performance/reporters/performance-reporter.js', {
      outputFile: './performance-reports/jest-performance-results.json',
      includeConsoleOutput: true
    }]
  ],
  
  // Coverage configuration for performance tests
  collectCoverage: false, // Disable coverage for performance tests
  
  // Module resolution for performance testing utilities
  moduleNameMapping: {
    '^@/performance/(.*)$': '<rootDir>/src/__tests__/performance/$1',
    '^@/test-utils/(.*)$': '<rootDir>/src/__tests__/utils/$1'
  },
  
  // Global variables for performance testing
  globals: {
    'ts-jest': {
      useESM: true
    },
    PERFORMANCE_TESTING: true,
    BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    PERFORMANCE_THRESHOLDS: {
      api_response_time: 500,
      throughput: 50,
      error_rate: 0.02,
      memory_growth: 50,
      cpu_usage: 0.8
    }
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        compilerOptions: {
          module: 'esnext',
          target: 'es2020'
        }
      }
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test sequence configuration
  testSequencer: '<rootDir>/src/__tests__/performance/config/performance-sequencer.js',
  
  // Cache configuration for performance tests
  cacheDirectory: '<rootDir>/.jest-cache/performance',
  
  // Verbose output for debugging
  verbose: true,
  
  // Performance test specific settings
  slowTestThreshold: 30, // 30 seconds
  
  // Error handling
  errorOnDeprecated: false,
  bail: false, // Continue running tests even if some fail
  
  // Watch mode disabled for performance tests
  watchman: false,
  
  // Node.js options for performance testing
  nodeOptions: [
    '--max-old-space-size=4096',
    '--expose-gc'
  ]
}