#!/usr/bin/env node

/**
 * Edge Case Test Runner
 * Runs comprehensive edge case and error handling tests for the CLP 2.0 system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  RESET: '\x1b[0m'
};

const log = (color, message) => console.log(`${color}${message}${COLORS.RESET}`);

class EdgeCaseTestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      suites: []
    };
  }

  async runAllEdgeCaseTests() {
    log(COLORS.CYAN, '🧪 Running Comprehensive Edge Case Tests for CLP 2.0');
    log(COLORS.WHITE, '='.repeat(60));

    const testSuites = [
      {
        name: 'API Endpoint Edge Cases',
        pattern: 'src/__tests__/api/edge-cases/**/*.test.ts',
        description: 'Tests API endpoints with malformed inputs, network failures, and invalid requests'
      },
      {
        name: 'Scoring System Error Handling',
        pattern: 'src/__tests__/lib/edge-cases/clp-scoring-error-handling.test.ts',
        description: 'Tests scoring algorithms with invalid data, extreme values, and calculation errors'
      },
      {
        name: 'Multi-Quiz System Errors',
        pattern: 'src/__tests__/lib/edge-cases/multi-quiz-system-errors.test.ts',
        description: 'Tests quiz generation and validation with edge cases and malformed configurations'
      },
      {
        name: 'Network Failure Simulation',
        pattern: 'src/__tests__/integration/edge-cases/network-failure-simulation.test.ts',
        description: 'Simulates network timeouts, connection failures, and service interruptions'
      },
      {
        name: 'Database Concurrency Tests',
        pattern: 'src/__tests__/integration/edge-cases/database-concurrency.test.ts',
        description: 'Tests database deadlocks, connection pool exhaustion, and race conditions'
      },
      {
        name: 'Input Validation Comprehensive',
        pattern: 'src/__tests__/integration/edge-cases/input-validation-comprehensive.test.ts',
        description: 'Comprehensive input validation, security testing, and data sanitization'
      }
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    this.printSummary();
    this.generateReport();
  }

  async runTestSuite(suite) {
    log(COLORS.BLUE, `\n📋 Running: ${suite.name}`);
    log(COLORS.WHITE, `Description: ${suite.description}`);
    log(COLORS.WHITE, '-'.repeat(50));

    try {
      // Check if test file exists
      const testFiles = this.findTestFiles(suite.pattern);
      if (testFiles.length === 0) {
        log(COLORS.YELLOW, `⚠️  No test files found for pattern: ${suite.pattern}`);
        this.results.suites.push({
          name: suite.name,
          status: 'skipped',
          reason: 'No test files found'
        });
        return;
      }

      // Run tests with coverage
      const command = `npm test -- ${suite.pattern} --coverage --verbose --no-cache`;
      
      log(COLORS.WHITE, `🏃 Executing: ${command}`);
      
      const output = execSync(command, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse Jest output
      const results = this.parseJestOutput(output);
      
      this.results.total += results.total;
      this.results.passed += results.passed;
      this.results.failed += results.failed;
      this.results.skipped += results.skipped;

      this.results.suites.push({
        name: suite.name,
        status: results.failed === 0 ? 'passed' : 'failed',
        ...results,
        output: output
      });

      if (results.failed === 0) {
        log(COLORS.GREEN, `✅ ${suite.name}: All tests passed (${results.passed}/${results.total})`);
      } else {
        log(COLORS.RED, `❌ ${suite.name}: ${results.failed} test(s) failed`);
      }

    } catch (error) {
      log(COLORS.RED, `💥 Error running ${suite.name}: ${error.message}`);
      
      this.results.suites.push({
        name: suite.name,
        status: 'error',
        error: error.message,
        output: error.stdout || error.stderr || ''
      });
    }
  }

  findTestFiles(pattern) {
    const glob = require('glob');
    try {
      return glob.sync(pattern, { cwd: process.cwd() });
    } catch (error) {
      return [];
    }
  }

  parseJestOutput(output) {
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Parse Jest test results
    const testResultsMatch = output.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    if (testResultsMatch) {
      results.failed = parseInt(testResultsMatch[1]);
      results.passed = parseInt(testResultsMatch[2]);
      results.total = parseInt(testResultsMatch[3]);
    } else {
      // Alternative parsing for different Jest output formats
      const passedMatch = output.match(/(\d+)\s+passed/);
      const failedMatch = output.match(/(\d+)\s+failed/);
      const totalMatch = output.match(/(\d+)\s+total/);

      if (passedMatch) results.passed = parseInt(passedMatch[1]);
      if (failedMatch) results.failed = parseInt(failedMatch[1]);
      if (totalMatch) results.total = parseInt(totalMatch[1]);
    }

    // Handle skipped tests
    const skippedMatch = output.match(/(\d+)\s+skipped/);
    if (skippedMatch) {
      results.skipped = parseInt(skippedMatch[1]);
    }

    return results;
  }

  printSummary() {
    log(COLORS.CYAN, '\n📊 Test Summary');
    log(COLORS.WHITE, '='.repeat(60));
    
    log(COLORS.WHITE, `Total Tests: ${this.results.total}`);
    log(COLORS.GREEN, `Passed: ${this.results.passed}`);
    log(COLORS.RED, `Failed: ${this.results.failed}`);
    log(COLORS.YELLOW, `Skipped: ${this.results.skipped}`);

    const successRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    
    log(COLORS.CYAN, `Success Rate: ${successRate}%`);

    log(COLORS.WHITE, '\n📋 Suite Results:');
    this.results.suites.forEach(suite => {
      const statusIcon = suite.status === 'passed' ? '✅' : 
                        suite.status === 'failed' ? '❌' : 
                        suite.status === 'error' ? '💥' : '⚠️';
      log(COLORS.WHITE, `  ${statusIcon} ${suite.name}: ${suite.status}`);
    });

    if (this.results.failed > 0) {
      log(COLORS.RED, '\n⚠️  Some edge case tests failed. Review the details above.');
      process.exit(1);
    } else {
      log(COLORS.GREEN, '\n🎉 All edge case tests passed! The system handles edge cases robustly.');
    }
  }

  generateReport() {
    const reportPath = path.join(process.cwd(), 'edge-case-test-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        successRate: this.results.total > 0 ? 
          ((this.results.passed / this.results.total) * 100).toFixed(1) : 0
      },
      suites: this.results.suites.map(suite => ({
        name: suite.name,
        status: suite.status,
        passed: suite.passed || 0,
        failed: suite.failed || 0,
        total: suite.total || 0,
        error: suite.error || null
      })),
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(COLORS.CYAN, `\n📄 Detailed report saved to: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed > 0) {
      recommendations.push('Review failed test cases and implement additional error handling');
    }

    if (this.results.skipped > 0) {
      recommendations.push('Investigate skipped tests and ensure they are properly configured');
    }

    const failedSuites = this.results.suites.filter(suite => suite.status === 'failed');
    if (failedSuites.length > 0) {
      failedSuites.forEach(suite => {
        recommendations.push(`Address failures in ${suite.name} test suite`);
      });
    }

    if (recommendations.length === 0) {
      recommendations.push('Edge case coverage is comprehensive - continue monitoring');
      recommendations.push('Consider adding new edge cases as system evolves');
      recommendations.push('Regular review of error handling effectiveness');
    }

    return recommendations;
  }

  async runSpecificEdgeCases() {
    log(COLORS.MAGENTA, '\n🎯 Running Specific Edge Case Categories');
    
    const categories = [
      {
        name: 'Security & Injection Tests',
        command: 'npm test -- --testNamePattern="(XSS|injection|security|pollution)" --verbose'
      },
      {
        name: 'Network & Timeout Tests',
        command: 'npm test -- --testNamePattern="(timeout|network|connection)" --verbose'
      },
      {
        name: 'Data Validation Tests',
        command: 'npm test -- --testNamePattern="(validation|malformed|boundary)" --verbose'
      },
      {
        name: 'Concurrency & Race Condition Tests',
        command: 'npm test -- --testNamePattern="(concurrent|race|deadlock)" --verbose'
      },
      {
        name: 'Memory & Performance Tests',
        command: 'npm test -- --testNamePattern="(memory|performance|stress)" --verbose'
      }
    ];

    for (const category of categories) {
      log(COLORS.BLUE, `\n🔍 ${category.name}`);
      try {
        execSync(category.command, {
          cwd: process.cwd(),
          stdio: 'inherit'
        });
        log(COLORS.GREEN, `✅ ${category.name} completed`);
      } catch (error) {
        log(COLORS.RED, `❌ ${category.name} failed`);
      }
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new EdgeCaseTestRunner();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Edge Case Test Runner for CLP 2.0

Usage:
  node scripts/run-edge-case-tests.js [options]

Options:
  --all              Run all edge case test suites (default)
  --specific         Run specific edge case categories
  --api              Run only API endpoint edge cases
  --scoring          Run only scoring system error handling
  --network          Run only network failure simulation
  --database         Run only database concurrency tests
  --validation       Run only input validation tests
  --help, -h         Show this help message

Examples:
  node scripts/run-edge-case-tests.js --all
  node scripts/run-edge-case-tests.js --specific
  node scripts/run-edge-case-tests.js --api --scoring
    `);
    return;
  }

  if (args.includes('--specific')) {
    await runner.runSpecificEdgeCases();
  } else if (args.length === 0 || args.includes('--all')) {
    await runner.runAllEdgeCaseTests();
  } else {
    // Run specific test suites based on flags
    const suiteMap = {
      '--api': 'src/__tests__/api/edge-cases/**/*.test.ts',
      '--scoring': 'src/__tests__/lib/edge-cases/clp-scoring-error-handling.test.ts',
      '--network': 'src/__tests__/integration/edge-cases/network-failure-simulation.test.ts',
      '--database': 'src/__tests__/integration/edge-cases/database-concurrency.test.ts',
      '--validation': 'src/__tests__/integration/edge-cases/input-validation-comprehensive.test.ts'
    };

    for (const [flag, pattern] of Object.entries(suiteMap)) {
      if (args.includes(flag)) {
        const command = `npm test -- ${pattern} --coverage --verbose`;
        log(COLORS.BLUE, `Running: ${command}`);
        try {
          execSync(command, { stdio: 'inherit' });
        } catch (error) {
          log(COLORS.RED, `Failed to run ${flag} tests`);
        }
      }
    }
  }
}

// Export for programmatic use
module.exports = EdgeCaseTestRunner;

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(COLORS.RED, `💥 Fatal error: ${error.message}`);
    process.exit(1);
  });
}