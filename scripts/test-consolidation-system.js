#!/usr/bin/env node

// Comprehensive Test Script for Multi-Quiz Consolidation System
// This script tests the actual API endpoints and database operations

const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data reflecting real-world scenarios
const TEST_DATA = {
  // High-performing child with aligned assessments
  aligned_high_performer: {
    child_name: "Sophie Williams",
    age_group: "6+",
    precise_age_months: 72,
    parent_assessment: {
      quiz_type: "parent_home",
      respondent_type: "parent",
      respondent_name: "Jennifer Williams",
      responses: {
        1: 5, 2: 5, 4: 5, 7: 4, 11: 4, 13: 5, 14: 5, 16: 5, 17: 4,
        19: 5, 20: 4, 21: 5, 22: 4, 23: 4, 24: 3,
        25: "project_based", 26: "visual_kinesthetic", 27: "pairs", 28: ["science", "art"]
      }
    },
    teacher_assessment: {
      quiz_type: "teacher_classroom",
      respondent_type: "teacher",
      respondent_name: "Ms. Anderson",
      responses: {
        1: 4, 3: 5, 4: 5, 5: 4, 8: 4, 9: 4, 10: 4, 12: 4,
        19: 4, 21: 4, 22: 4, 24: 3
      }
    },
    expected: {
      confidence_min: 80,
      completeness_min: 90,
      top_skills: ["Communication", "Collaboration", "Creative Innovation"],
      personality_type: "Creative Collaborator"
    }
  },

  // Child needing support with conflicting views
  conflicting_support_needed: {
    child_name: "Marcus Johnson",
    age_group: "5+",
    precise_age_months: 66,
    parent_assessment: {
      quiz_type: "parent_home",
      respondent_type: "parent",
      respondent_name: "Angela Johnson",
      responses: {
        1: 4, 2: 4, 4: 2, 7: 3, 11: 5, 13: 5, 14: 4, 16: 4, 17: 3,
        19: 3, 20: 3, 21: 2, 22: 2, 23: 2, 24: 2,
        25: "independent_work", 26: "kinesthetic", 27: "individual", 28: ["building", "puzzles"]
      }
    },
    teacher_assessment: {
      quiz_type: "teacher_classroom",
      respondent_type: "teacher",
      respondent_name: "Mr. Thompson",
      responses: {
        1: 2, 3: 2, 4: 2, 5: 2, 8: 2, 9: 2, 10: 3, 12: 2,
        19: 2, 21: 2, 22: 2, 24: 2
      }
    },
    expected: {
      confidence_max: 70,
      context_differential: "high",
      support_recommendations: true,
      priority_areas: ["Collaboration", "Communication"]
    }
  },

  // Incomplete assessment scenarios
  incomplete_progressive: {
    child_name: "Zoe Chen",
    age_group: "4-5",
    partial_parent: {
      quiz_type: "parent_home",
      respondent_type: "parent",
      respondent_name: "Lisa Chen",
      responses: {
        1: 3, 2: 4, 4: 4, 7: 3, 11: 3, 13: 4
        // Incomplete - missing many responses
      }
    },
    complete_teacher: {
      quiz_type: "teacher_classroom",
      respondent_type: "teacher",
      respondent_name: "Mrs. Garcia",
      responses: {
        1: 3, 3: 3, 4: 4, 5: 3, 8: 3, 9: 3, 10: 3, 12: 3,
        19: 3, 21: 3, 22: 3, 24: 3
      }
    }
  }
};

// Test execution framework
class ConsolidationTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: [],
      performance: {},
      detailed_results: []
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Multi-Quiz Consolidation System Tests\n');
    
    try {
      await this.testProgressiveProfileAPI();
      await this.testCLP2ConsolidationAPI();
      await this.testConflictResolution();
      await this.testProgressiveBuilding();
      await this.testIncompleteHandling();
      await this.testDatabaseOperations();
      await this.testPerformanceScenarios();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.results.failed++;
    }
    
    this.generateReport();
  }

  async testProgressiveProfileAPI() {
    console.log('📝 Testing Progressive Profile API...');
    
    const testCase = TEST_DATA.aligned_high_performer;
    
    try {
      // Test 1: Create initial parent profile
      const startTime = performance.now();
      
      const parentResponse = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: testCase.child_name,
        age_group: testCase.age_group,
        precise_age_months: testCase.precise_age_months,
        ...testCase.parent_assessment,
        use_clp2_scoring: true
      });
      
      const parentTime = performance.now() - startTime;
      this.results.performance.parent_creation = parentTime;
      
      this.assert(parentResponse.is_new_profile === true, 'Should create new profile for parent');
      this.assert(parentResponse.profile.parent_assessments === 1, 'Should have 1 parent assessment');
      this.assert(parentResponse.profile.teacher_assessments === 0, 'Should have 0 teacher assessments');
      this.assert(parentResponse.profile.completeness_percentage >= 50, 'Should have reasonable completeness');
      
      console.log(`  ✅ Parent profile created (${parentTime.toFixed(2)}ms)`);
      
      // Test 2: Add teacher assessment to existing profile
      const teacherStartTime = performance.now();
      
      const teacherResponse = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: testCase.child_name,
        existing_profile_id: parentResponse.profile.id,
        ...testCase.teacher_assessment,
        use_clp2_scoring: true
      });
      
      const teacherTime = performance.now() - teacherStartTime;
      this.results.performance.teacher_addition = teacherTime;
      
      this.assert(teacherResponse.is_new_profile === false, 'Should update existing profile');
      this.assert(teacherResponse.profile.parent_assessments === 1, 'Should maintain parent assessment count');
      this.assert(teacherResponse.profile.teacher_assessments === 1, 'Should have 1 teacher assessment');
      this.assert(teacherResponse.profile.total_assessments === 2, 'Should have 2 total assessments');
      
      // Validate confidence boost
      this.assert(
        teacherResponse.profile.confidence_percentage >= testCase.expected.confidence_min,
        `Confidence should be >= ${testCase.expected.confidence_min}%`
      );
      
      console.log(`  ✅ Teacher assessment added (${teacherTime.toFixed(2)}ms)`);
      
      // Test 3: Retrieve consolidated profile
      const retrieveStartTime = performance.now();
      
      const retrieveResponse = await this.makeAPIRequest(
        `/profiles/progressive?profileId=${teacherResponse.profile.id}`, 
        'GET'
      );
      
      const retrieveTime = performance.now() - retrieveStartTime;
      this.results.performance.profile_retrieval = retrieveTime;
      
      this.assert(retrieveResponse.profile !== null, 'Should retrieve existing profile');
      this.assert(retrieveResponse.profile.id === teacherResponse.profile.id, 'Should return correct profile');
      
      console.log(`  ✅ Profile retrieved (${retrieveTime.toFixed(2)}ms)`);
      
      this.results.passed += 3;
      
    } catch (error) {
      console.error('  ❌ Progressive Profile API test failed:', error.message);
      this.results.failed++;
      this.results.detailed_results.push({
        test: 'Progressive Profile API',
        status: 'failed',
        error: error.message
      });
    }
  }

  async testCLP2ConsolidationAPI() {
    console.log('\n🔄 Testing CLP 2.0 Consolidation API...');
    
    const testCase = TEST_DATA.aligned_high_performer;
    
    try {
      // Test consolidated profile creation using CLP 2.0 endpoint
      const response = await this.makeAPIRequest('/profiles/clp2-consolidate', 'POST', {
        child_name: `CLP2_${testCase.child_name}`,
        age_group: testCase.age_group,
        precise_age_months: testCase.precise_age_months,
        ...testCase.parent_assessment
      });
      
      // Validate CLP 2.0 specific features
      this.assert(response.profile.scoring_version === 'CLP 2.0', 'Should use CLP 2.0 scoring');
      this.assert(response.assessment.question_count > 0, 'Should record question count');
      this.assert(response.consolidation !== undefined, 'Should include consolidation data');
      this.assert(response.recommendations !== undefined, 'Should include recommendations');
      
      // Test consolidation analysis
      const analysisResponse = await this.makeAPIRequest(
        `/profiles/clp2-consolidate?profile_id=${response.profile.id}`, 
        'GET'
      );
      
      this.assert(analysisResponse.profile !== null, 'Should return profile analysis');
      this.assert(analysisResponse.consolidation_analysis !== undefined, 'Should include analysis');
      
      console.log('  ✅ CLP 2.0 consolidation working correctly');
      this.results.passed += 2;
      
    } catch (error) {
      console.error('  ❌ CLP 2.0 Consolidation test failed:', error.message);
      this.results.failed++;
    }
  }

  async testConflictResolution() {
    console.log('\n⚖️ Testing Conflict Resolution...');
    
    const testCase = TEST_DATA.conflicting_support_needed;
    
    try {
      // Create parent assessment
      const parentResponse = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: testCase.child_name,
        age_group: testCase.age_group,
        precise_age_months: testCase.precise_age_months,
        ...testCase.parent_assessment,
        use_clp2_scoring: true
      });
      
      // Add conflicting teacher assessment
      const consolidatedResponse = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: testCase.child_name,
        existing_profile_id: parentResponse.profile.id,
        ...testCase.teacher_assessment,
        use_clp2_scoring: true
      });
      
      // Validate conflict handling
      this.assert(
        consolidatedResponse.profile.confidence_percentage <= testCase.expected.confidence_max,
        'Conflicting data should reduce confidence'
      );
      
      // Check for conflict indicators in the response
      if (consolidatedResponse.analysis && consolidatedResponse.analysis.conflicts) {
        this.assert(
          consolidatedResponse.analysis.conflicts.length > 0,
          'Should identify conflicts'
        );
      } else {
        this.results.warnings.push('Conflict detection may not be implemented');
      }
      
      console.log('  ✅ Conflict resolution handling validated');
      this.results.passed++;
      
    } catch (error) {
      console.error('  ❌ Conflict resolution test failed:', error.message);
      this.results.failed++;
    }
  }

  async testProgressiveBuilding() {
    console.log('\n📈 Testing Progressive Profile Building...');
    
    const childName = `Progressive_${Date.now()}`;
    let profileId = null;
    
    try {
      // Step 1: Initial incomplete parent assessment
      const step1Response = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: childName,
        age_group: "5+",
        quiz_type: "parent_home",
        respondent_type: "parent",
        responses: { 1: 3, 2: 4, 4: 4, 7: 3 }, // Very incomplete
        use_clp2_scoring: true
      });
      
      profileId = step1Response.profile.id;
      const step1Confidence = step1Response.profile.confidence_percentage;
      
      this.assert(step1Confidence < 50, 'Initial incomplete assessment should have low confidence');
      
      // Step 2: Add teacher assessment (more complete)
      const step2Response = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: childName,
        existing_profile_id: profileId,
        quiz_type: "teacher_classroom",
        respondent_type: "teacher",
        responses: {
          1: 3, 3: 3, 4: 4, 5: 3, 8: 3, 9: 3, 10: 3, 12: 3,
          19: 3, 21: 3, 22: 3, 24: 3
        },
        use_clp2_scoring: true
      });
      
      const step2Confidence = step2Response.profile.confidence_percentage;
      
      this.assert(
        step2Confidence > step1Confidence,
        'Teacher assessment should boost confidence'
      );
      
      // Step 3: Parent completes full assessment
      const step3Response = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: childName,
        existing_profile_id: profileId,
        quiz_type: "parent_home",
        respondent_type: "parent",
        responses: {
          1: 4, 2: 4, 4: 5, 7: 4, 11: 3, 13: 4, 14: 4, 16: 4, 17: 4,
          19: 3, 20: 3, 21: 3, 22: 3, 23: 3, 24: 3
        },
        use_clp2_scoring: true
      });
      
      const step3Confidence = step3Response.profile.confidence_percentage;
      
      this.assert(
        step3Confidence >= step2Confidence,
        'Complete parent assessment should maintain or boost confidence'
      );
      
      this.assert(
        step3Response.profile.total_assessments === 3,
        'Should track all three assessment attempts'
      );
      
      console.log('  ✅ Progressive building pattern validated');
      this.results.passed++;
      
    } catch (error) {
      console.error('  ❌ Progressive building test failed:', error.message);
      this.results.failed++;
    }
  }

  async testIncompleteHandling() {
    console.log('\n🔄 Testing Incomplete Assessment Handling...');
    
    const testCase = TEST_DATA.incomplete_progressive;
    
    try {
      // Test partial parent assessment
      const partialResponse = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: testCase.child_name,
        age_group: testCase.age_group,
        ...testCase.partial_parent,
        use_clp2_scoring: true
      });
      
      // Should create profile despite incomplete data
      this.assert(partialResponse.profile !== null, 'Should handle incomplete assessments');
      this.assert(
        partialResponse.profile.confidence_percentage < 40,
        'Incomplete assessment should have reduced confidence'
      );
      
      // Add complete teacher assessment
      const completeResponse = await this.makeAPIRequest('/profiles/progressive', 'POST', {
        child_name: testCase.child_name,
        existing_profile_id: partialResponse.profile.id,
        ...testCase.complete_teacher,
        use_clp2_scoring: true
      });
      
      // Should improve confidence with complete data
      this.assert(
        completeResponse.profile.confidence_percentage > partialResponse.profile.confidence_percentage,
        'Complete teacher assessment should boost confidence'
      );
      
      console.log('  ✅ Incomplete assessment handling validated');
      this.results.passed++;
      
    } catch (error) {
      console.error('  ❌ Incomplete handling test failed:', error.message);
      this.results.failed++;
    }
  }

  async testDatabaseOperations() {
    console.log('\n🗄️ Testing Database Operations...');
    
    try {
      // Test database consistency by creating and retrieving multiple profiles
      const profileIds = [];
      
      for (let i = 0; i < 3; i++) {
        const response = await this.makeAPIRequest('/profiles/progressive', 'POST', {
          child_name: `DBTest_Child_${i}`,
          age_group: "5+",
          quiz_type: "general",
          respondent_type: "parent",
          responses: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 },
          use_clp2_scoring: true
        });
        
        profileIds.push(response.profile.id);
      }
      
      // Verify all profiles can be retrieved
      for (const id of profileIds) {
        const retrieved = await this.makeAPIRequest(
          `/profiles/progressive?profileId=${id}`, 
          'GET'
        );
        
        this.assert(retrieved.profile !== null, `Profile ${id} should be retrievable`);
        this.assert(retrieved.profile.id === id, 'Retrieved profile should match requested ID');
      }
      
      console.log(`  ✅ Database operations validated for ${profileIds.length} profiles`);
      this.results.passed++;
      
    } catch (error) {
      console.error('  ❌ Database operations test failed:', error.message);
      this.results.failed++;
    }
  }

  async testPerformanceScenarios() {
    console.log('\n⚡ Testing Performance Scenarios...');
    
    try {
      const performanceTests = [];
      
      // Test concurrent profile creation
      const concurrentPromises = [];
      for (let i = 0; i < 5; i++) {
        concurrentPromises.push(
          this.makeAPIRequest('/profiles/progressive', 'POST', {
            child_name: `Perf_Test_${i}`,
            age_group: "5+",
            quiz_type: "parent_home",
            respondent_type: "parent",
            responses: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 },
            use_clp2_scoring: true
          })
        );
      }
      
      const startTime = performance.now();
      const results = await Promise.all(concurrentPromises);
      const concurrentTime = performance.now() - startTime;
      
      this.assert(results.length === 5, 'All concurrent requests should complete');
      this.assert(concurrentTime < 5000, 'Concurrent requests should complete within 5 seconds');
      
      this.results.performance.concurrent_creation = concurrentTime;
      
      console.log(`  ✅ Performance validated - 5 concurrent requests in ${concurrentTime.toFixed(2)}ms`);
      this.results.passed++;
      
    } catch (error) {
      console.error('  ❌ Performance test failed:', error.message);
      this.results.failed++;
    }
  }

  async makeAPIRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorData}`);
    }
    
    return await response.json();
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MULTI-QUIZ CONSOLIDATION TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    
    if (this.results.warnings.length > 0) {
      console.log('\nWarnings:');
      this.results.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning}`);
      });
    }
    
    console.log('\n⚡ Performance Metrics:');
    Object.entries(this.results.performance).forEach(([metric, time]) => {
      console.log(`  ${metric}: ${time.toFixed(2)}ms`);
    });
    
    if (this.results.detailed_results.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.detailed_results.forEach(result => {
        console.log(`  ${result.test}: ${result.error}`);
      });
    }
    
    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      console.log('🎉 Excellent! Multi-quiz consolidation system is working well.');
    } else if (successRate >= 70) {
      console.log('👍 Good! Some issues need attention but core functionality works.');
    } else {
      console.log('⚠️  Critical issues detected. System needs attention before production use.');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Manual Test Scenarios for Real-World Validation
class ManualTestScenarios {
  static generateTestInstructions() {
    return `
MANUAL TESTING SCENARIOS FOR MULTI-QUIZ CONSOLIDATION

🧪 Scenario 1: Perfect Parent-Teacher Alignment
1. Parent completes home assessment with high scores across all areas
2. Teacher completes classroom assessment with similar high scores
3. Verify consolidated profile shows high confidence (80%+)
4. Check that strengths are consistently identified across both contexts

🧪 Scenario 2: Significant Home-School Differential  
1. Parent rates child as highly creative and confident at home
2. Teacher rates same child as shy and reserved in classroom
3. Verify system flags this differential appropriately
4. Check recommendations address context-specific support needs

🧪 Scenario 3: Progressive Building Over Academic Year
1. Start with parent assessment in September
2. Add teacher assessment in October after observation period
3. Parent retakes assessment in January showing growth
4. Teacher updates assessment in March
5. Verify profile confidence increases and shows developmental progress

🧪 Scenario 4: Collaborative Completion
1. Parent starts assessment but only completes 60%
2. Teacher is invited to complete their portion
3. Parent returns later to finish remaining questions
4. Verify seamless profile building throughout process

🧪 Scenario 5: Special Needs Considerations
1. Parent assessment indicates specific support needs
2. Teacher assessment confirms and adds professional observations
3. Verify system generates appropriate interventions and recommendations
4. Check that profile emphasizes both strengths and support needs

📋 VALIDATION CHECKLIST:
□ Profile confidence increases appropriately with quality data
□ Conflicting assessments are flagged and handled gracefully
□ Progressive building maintains data integrity
□ API endpoints respond within acceptable timeframes (< 2 seconds)
□ Database operations maintain consistency
□ Sharing URLs work correctly for both contexts
□ Recommendations are contextually appropriate
□ CLP 2.0 scoring produces meaningful insights
    `;
  }
}

// Main execution
if (require.main === module) {
  const testSuite = new ConsolidationTestSuite();
  
  console.log('Multi-Quiz Consolidation System Test Suite');
  console.log('==========================================\n');
  
  // Check if we're in test mode or generating manual test scenarios
  const args = process.argv.slice(2);
  
  if (args.includes('--manual')) {
    console.log(ManualTestScenarios.generateTestInstructions());
  } else {
    testSuite.runAllTests().catch(error => {
      console.error('Test suite execution failed:', error);
      process.exit(1);
    });
  }
}

module.exports = { ConsolidationTestSuite, ManualTestScenarios, TEST_DATA };