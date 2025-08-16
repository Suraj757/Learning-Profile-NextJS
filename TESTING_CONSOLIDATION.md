# Multi-Quiz Consolidation System Testing

This document outlines comprehensive testing for the multi-quiz consolidation system that handles Parent + Teacher assessments with progressive profile building.

## 🎯 Test Coverage Overview

The testing suite validates 8 critical areas:

1. **Parent + Teacher Consolidation Logic**
2. **Confidence Weighting Algorithms** 
3. **Progressive Profile Building Over Time**
4. **Skill Score Merging and Averaging**
5. **Conflict Resolution for Differing Scores**
6. **Progressive Profile API Endpoints**
7. **Database Operations**
8. **Incomplete Assessment Handling**

## 🧪 Test Scenarios

### Scenario 1: Aligned Assessments
Tests when parent and teacher observations align closely, resulting in high confidence consolidated profiles.

**Expected Outcomes:**
- Confidence ≥ 85%
- Completeness ≥ 90%
- Consistent strength identification
- High-quality recommendations

### Scenario 2: Conflicting Assessments  
Tests handling of significant differences between home and school behavior.

**Expected Outcomes:**
- Confidence ≤ 70% (flagged for review)
- Context-differential indicators
- Specialized recommendations
- Professional intervention suggestions

### Scenario 3: Progressive Building
Tests profile development over academic year with multiple assessment points.

**Expected Outcomes:**
- Increasing confidence with quality data
- Growth tracking over time
- Developmental milestone detection
- Diminishing returns for repeated assessments

### Scenario 4: Incomplete Data
Tests handling of partial assessments and collaborative completion.

**Expected Outcomes:**
- Graceful degradation with incomplete data
- Appropriate confidence penalties
- Clear warnings to users
- Successful consolidation of partial data

## 🚀 Running Tests

### Quick Start
```bash
# Install dependencies
npm install

# Run all consolidation tests
npm run test:all-consolidation

# Run specific test suites
npm run test:consolidation     # Scenario-based tests
npm run test:algorithms        # Algorithm validation
npm run test:integration       # End-to-end workflows

# Run API validation
npm run test:api

# Generate manual test instructions
npm run test:manual
```

### Detailed Test Commands

```bash
# Individual test files
npx jest tests/consolidation-scenarios.test.js
npx jest tests/consolidation-algorithms.test.js  
npx jest tests/integration-workflow.test.js

# With coverage reporting
npm run test:coverage

# Watch mode for development
npx jest --watch tests/

# Verbose output for debugging
npx jest --verbose tests/consolidation-scenarios.test.js
```

## 📊 Test Structure

### 1. Scenario-Based Tests (`consolidation-scenarios.test.js`)
- Real-world usage patterns
- Parent-teacher collaboration workflows
- Progressive development scenarios
- Edge cases and error conditions

### 2. Algorithm Tests (`consolidation-algorithms.test.js`)
- Mathematical consolidation accuracy
- Confidence weighting formulas
- Skill score merging logic
- Context differential calculations

### 3. Integration Tests (`integration-workflow.test.js`)
- Complete API workflows
- Database consistency
- Performance validation
- Error handling

## 🎨 Test Data Patterns

### High-Performing Child (Aligned)
```javascript
const alignedHighPerformer = {
  parent: { Communication: 5, Collaboration: 5, Creative: 5 },
  teacher: { Communication: 4, Collaboration: 4, Academic: 4 },
  expected: { confidence: 85, personality: "Creative Collaborator" }
}
```

### Support-Needed Child (Conflicting)
```javascript
const conflictingSupport = {
  parent: { Creative: 5, Confidence: 4 }, // Strong at home
  teacher: { Communication: 2, Academic: 2 }, // Struggles in school
  expected: { confidence: 60, flags: ["home_school_differential"] }
}
```

### Progressive Development
```javascript
const progressiveGrowth = [
  { month: 1, Math: 2.0, Literacy: 2.5 },
  { month: 3, Math: 2.5, Literacy: 3.0 },
  { month: 6, Math: 3.0, Literacy: 4.0 }  // Clear growth pattern
]
```

## ⚖️ Validation Criteria

### Confidence Calculation
- **High (80%+)**: Aligned assessments, professional input, complete data
- **Medium (60-79%)**: Some conflicts, mostly complete data
- **Low (<60%)**: Significant conflicts, incomplete data, flags needed

### Consolidation Quality
- **Excellent**: Multiple sources, high agreement, developmental appropriateness
- **Good**: Some disagreement, mostly complete, contextually aware
- **Concerning**: Major conflicts, incomplete, requires intervention

### Performance Standards
- API response time: < 2 seconds
- Concurrent handling: 10+ simultaneous requests
- Database consistency: 100% accuracy
- Memory efficiency: No leaks or excessive usage

## 🔧 Test Configuration

### Jest Configuration
```json
{
  "testEnvironment": "node",
  "testTimeout": 30000,
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
  "collectCoverageFrom": [
    "src/lib/**/*.{js,ts}",
    "src/app/api/**/*.{js,ts}"
  ]
}
```

### Environment Variables
```bash
# Required for testing
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=test
SUPABASE_URL=your_test_supabase_url
SUPABASE_ANON_KEY=your_test_key
```

## 📝 Manual Testing Scenarios

### Parent-Teacher Alignment Test
1. Parent completes home assessment (high creativity scores)
2. Teacher completes classroom assessment (confirms creativity)
3. **Verify**: Consolidated profile shows "Creative" strengths
4. **Check**: Confidence 80%+, consistent recommendations

### Home-School Differential Test
1. Parent rates child as confident and communicative
2. Teacher rates same child as shy and reserved
3. **Verify**: System flags differential appropriately
4. **Check**: Lower confidence, context-specific recommendations

### Progressive Development Test
1. Initial parent assessment (September)
2. Teacher assessment added (October) 
3. Parent retake showing growth (January)
4. **Verify**: Growth indicators, increasing confidence
5. **Check**: Developmental appropriateness

## 🚨 Error Scenarios to Test

### Data Integrity
- Missing required fields
- Invalid quiz types
- Malformed responses
- Non-existent profile IDs

### System Limits
- Extremely large response sets
- Concurrent profile modifications
- Database timeout scenarios
- Memory pressure situations

### Edge Cases
- All minimum scores (1s)
- All maximum scores (5s)
- Mixed numeric/string responses
- Partial assessment completion

## 📈 Success Metrics

### Test Coverage Goals
- **Unit Tests**: 90%+ line coverage
- **Integration Tests**: All critical paths
- **Scenario Tests**: Real-world patterns
- **Performance Tests**: Load handling

### Quality Benchmarks
- All tests pass consistently
- Performance within acceptable ranges
- Error handling graceful
- User experience maintained

## 🛠️ Troubleshooting Tests

### Common Issues
1. **Database Connection**: Ensure test DB is running
2. **API Timing**: Increase timeout for slow operations
3. **Mock Data**: Verify test data reflects real scenarios
4. **Environment**: Check all required env vars are set

### Debug Commands
```bash
# Run with debug output
DEBUG=* npm run test:consolidation

# Single test with verbose logging
npx jest --verbose --no-cache tests/consolidation-scenarios.test.js

# Check test database state
npm run test:db-check
```

## 📋 Test Checklist

Before deploying consolidation features:

- [ ] All scenario tests pass
- [ ] Algorithm tests validate mathematics
- [ ] Integration tests confirm API behavior
- [ ] Performance tests meet benchmarks
- [ ] Error handling tests pass
- [ ] Manual testing completed
- [ ] Edge cases handled appropriately
- [ ] Documentation updated
- [ ] Production monitoring planned

## 🎯 Continuous Integration

### GitHub Actions Example
```yaml
name: Consolidation Tests
on: [push, pull_request]
jobs:
  test-consolidation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:all-consolidation
      - run: npm run test:coverage
```

## 📞 Support

For testing issues or questions:
- Review test logs for specific error messages
- Check database connection and permissions
- Verify environment configuration
- Consult API documentation for endpoint details

The consolidation system is designed to handle real-world complexity while maintaining data integrity and user experience. These tests ensure it performs reliably across all scenarios.