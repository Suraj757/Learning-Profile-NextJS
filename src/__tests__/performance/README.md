# CLP 2.0 Performance Testing Suite

A comprehensive performance testing framework for the CLP 2.0 system that validates system performance under realistic production loads.

## Overview

This performance testing suite provides:

- **Load Testing**: High-volume concurrent user simulation
- **API Benchmarking**: Response time and throughput analysis
- **Memory Testing**: Memory leak detection and usage monitoring
- **Stress Testing**: System breaking point identification
- **Resource Monitoring**: CPU, memory, and system utilization tracking
- **Automated Reporting**: Detailed performance analysis and recommendations

## Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Required for memory testing
node --version  # Node.js 16+ required
```

### Running Performance Tests

#### Quick Performance Validation (5-10 minutes)
```bash
npm run perf:quick
```

#### Standard Performance Testing (15-30 minutes)
```bash
npm run perf:standard
```

#### Comprehensive Performance Testing (45-60 minutes)
```bash
npm run perf:comprehensive
```

#### CI/CD Optimized Tests (10-15 minutes)
```bash
npm run perf:ci
```

#### Nightly Comprehensive Testing (60-90 minutes)
```bash
npm run perf:nightly
```

## Individual Test Components

### Load Testing
```bash
# Quick load test
npm run load:quick

# Standard load test
npm run load:standard

# Comprehensive load test
npm run load:comprehensive

# Stress testing
npm run load:stress
```

### Memory Testing
```bash
# Short-term memory testing
npm run memory:short

# Long-term memory testing (with --expose-gc)
npm run memory:long
```

### API Benchmarking
```bash
# API performance benchmarks
npm run benchmark:api

# Load testing with Autocannon
npm run benchmark:load
```

## Performance Test Architecture

### Test Suite Structure

```
src/__tests__/performance/
├── clp2-performance-suite.test.ts     # Jest performance unit tests
├── performance-suite-runner.js        # Main orchestrator
├── load-testing/
│   ├── run-load-tests.js              # Load test orchestrator
│   └── autocannon-load-tests.js       # HTTP load testing
├── memory-testing/
│   └── memory-leak-detection.js       # Memory analysis
├── benchmarks/
│   └── api-benchmarks.js              # API performance benchmarks
└── README.md                          # This file
```

### Test Components

#### 1. Performance Unit Tests (`clp2-performance-suite.test.ts`)
- Jest-based performance tests
- API response time validation
- Concurrent user simulation
- Memory usage monitoring
- Database query performance
- Scalability testing

#### 2. Load Testing (`load-testing/`)
- **Autocannon Integration**: High-performance HTTP load testing
- **Artillery Support**: Realistic user journey simulation
- **Concurrent User Testing**: 10-200+ concurrent users
- **Resource Monitoring**: Real-time system monitoring
- **Breaking Point Detection**: Stress testing to failure

#### 3. Memory Testing (`memory-testing/`)
- **Memory Leak Detection**: Long-running memory analysis
- **Garbage Collection Monitoring**: GC efficiency tracking
- **Memory Pressure Testing**: Large dataset processing
- **Concurrent Memory Testing**: Multi-worker memory validation

#### 4. API Benchmarking (`benchmarks/`)
- **Response Time Analysis**: P50, P95, P99 latency measurements
- **Throughput Testing**: Requests per second validation
- **Database Performance**: Query optimization analysis
- **Error Handling Performance**: Error response benchmarking

## Performance Targets

### API Performance
- **Progressive Profile Creation**: <500ms P95 response time
- **Profile Retrieval**: <200ms P95 response time
- **Complex Consolidation**: <1000ms P95 response time

### Throughput
- **Minimum**: 50 requests/second
- **Target**: 100 requests/second  
- **Excellent**: 200+ requests/second

### Reliability
- **Error Rate**: <2% under normal load
- **Success Rate**: >98% for all operations
- **Availability**: >99% uptime

### Resource Usage
- **Memory**: <512MB heap usage
- **Memory Growth**: <50MB per 1000 operations
- **CPU**: <80% sustained usage

## Test Scenarios

### 1. Quick Performance Validation
**Duration**: 5-10 minutes  
**Purpose**: Smoke testing for basic performance validation  
**Tests**: Unit performance, quick API benchmarks

### 2. Standard Performance Testing
**Duration**: 15-30 minutes  
**Purpose**: Regular performance validation  
**Tests**: All components with standard load levels

### 3. Comprehensive Performance Testing  
**Duration**: 45-60 minutes  
**Purpose**: Release validation and thorough analysis  
**Tests**: All components with extended load testing

### 4. CI/CD Performance Testing
**Duration**: 10-15 minutes  
**Purpose**: Automated pipeline performance validation  
**Tests**: Parallel execution of critical performance tests

### 5. Nightly Performance Testing
**Duration**: 60-90 minutes  
**Purpose**: Deep performance analysis and trend monitoring  
**Tests**: All tests including endurance testing

## Configuration

### Environment Variables

```bash
# Test target (default: http://localhost:3000)
TEST_BASE_URL=http://localhost:3000

# Slack notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Email notifications (optional)
PERFORMANCE_EMAIL_RECIPIENTS=team@example.com,alerts@example.com

# Test environment
NODE_ENV=test
```

### Performance Thresholds

The test suite uses configurable performance thresholds:

```javascript
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
```

## Reports and Analysis

### Automated Reports

Performance tests generate comprehensive reports:

1. **JSON Report**: Detailed machine-readable results
2. **Text Summary**: Human-readable performance summary
3. **Slack Notifications**: Real-time alerts for critical issues
4. **Email Reports**: Scheduled performance summaries

### Report Location

```
./performance-reports/
├── performance-report-{suite}-{timestamp}.json
├── performance-summary-{suite}-{timestamp}.txt
└── load-test-report-{suite}-{timestamp}.json
```

### Performance Grading

Tests receive grades based on performance metrics:

- **Grade A**: Excellent performance, all targets met
- **Grade B**: Good performance, minor optimizations possible
- **Grade C**: Acceptable performance, some issues identified
- **Grade D**: Poor performance, significant issues requiring attention
- **Grade F**: Critical performance issues, system not production-ready

## Advanced Usage

### Custom Load Testing

```bash
# Custom Autocannon test
node src/__tests__/performance/load-testing/autocannon-load-tests.js

# Custom memory testing duration
node --expose-gc src/__tests__/performance/memory-testing/memory-leak-detection.js --duration=300000

# Custom API benchmarking
node src/__tests__/performance/benchmarks/api-benchmarks.js --quick
```

### Profiling with Clinic.js

```bash
# CPU profiling
clinic doctor -- node src/__tests__/performance/load-testing/run-load-tests.js

# Memory profiling  
clinic heapprofiler -- node src/__tests__/performance/memory-testing/memory-leak-detection.js

# Performance profiling
clinic flame -- node src/__tests__/performance/benchmarks/api-benchmarks.js
```

### Memory Leak Detection

```bash
# Run with garbage collection exposed
node --expose-gc src/__tests__/performance/memory-testing/memory-leak-detection.js

# Generate heap snapshots
node --inspect src/__tests__/performance/memory-testing/memory-leak-detection.js
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Performance Testing
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  pull_request:
    paths: ['src/**', 'package.json']

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run perf:ci
        env:
          TEST_BASE_URL: http://localhost:3000
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    stages {
        stage('Performance Testing') {
            steps {
                sh 'npm ci'
                sh 'npm run perf:standard'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'performance-reports/**'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'performance-reports',
                        reportFiles: '*.html',
                        reportName: 'Performance Report'
                    ])
                }
            }
        }
    }
}
```

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Run with memory monitoring
node --max-old-space-size=4096 src/__tests__/performance/performance-suite-runner.js

# Enable garbage collection
node --expose-gc --max-old-space-size=4096 src/__tests__/performance/memory-testing/memory-leak-detection.js
```

#### Network Timeouts
```bash
# Increase timeout values
TEST_TIMEOUT=300000 npm run perf:standard
```

#### Port Conflicts
```bash
# Use different port
TEST_BASE_URL=http://localhost:3001 npm run perf:quick
```

### Performance Debugging

#### Identify Bottlenecks
```bash
# CPU profiling
clinic doctor -- npm run perf:standard

# Memory profiling
clinic heapprofiler -- npm run memory:short

# I/O profiling
clinic bubbleprof -- npm run load:quick
```

#### Memory Analysis
```bash
# Heap snapshot analysis
node --inspect-brk src/__tests__/performance/memory-testing/memory-leak-detection.js

# V8 heap statistics
node --trace-gc src/__tests__/performance/memory-testing/memory-leak-detection.js
```

## Performance Optimization Guidelines

### API Optimization
1. **Response Time**: Target <200ms for simple operations
2. **Caching**: Implement Redis/memory caching for frequent queries
3. **Database**: Optimize queries and add appropriate indexes
4. **Payload Size**: Minimize response payload sizes

### Memory Optimization
1. **Memory Leaks**: Monitor for steadily increasing memory usage
2. **Garbage Collection**: Ensure efficient GC with proper object cleanup
3. **Object Pools**: Reuse objects in high-frequency operations
4. **Streaming**: Use streams for large data processing

### Scalability Optimization
1. **Connection Pooling**: Configure appropriate database connection pools
2. **Async Processing**: Use async/await for I/O operations
3. **Load Balancing**: Distribute load across multiple instances
4. **Caching Layers**: Implement multi-tier caching strategies

## Contributing

When adding new performance tests:

1. **Follow Patterns**: Use existing test patterns and utilities
2. **Add Documentation**: Document test purpose and expected outcomes
3. **Set Thresholds**: Define appropriate performance thresholds
4. **Include Cleanup**: Ensure proper resource cleanup
5. **Update Reports**: Include new metrics in reporting

### Example New Test

```javascript
describe('New Feature Performance', () => {
  test('should handle high load efficiently', async () => {
    const monitor = new PerformanceMonitor()
    monitor.start()
    
    // Your test implementation
    
    const stats = monitor.getStatistics('new_feature')
    expect(stats.p95).toBeLessThan(YOUR_THRESHOLD)
    
    monitor.stop()
  })
})
```

## Support

For performance testing issues:

1. **Check Reports**: Review generated performance reports first
2. **Run Diagnostics**: Use built-in diagnostic tools
3. **Monitor Resources**: Check system resource usage during tests
4. **Review Logs**: Examine test output and error logs
5. **Contact Team**: Reach out to the performance engineering team

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: CLP 2.0 Performance Team