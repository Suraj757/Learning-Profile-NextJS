// Integration Workflow Tests
// Tests complete real-world workflows for multi-quiz consolidation

const request = require('supertest');
const { expect } = require('@jest/globals');

// Mock app setup (replace with actual app import)
const app = require('../src/app'); // Adjust path as needed

describe('Multi-Quiz Consolidation Integration Workflow', () => {
  let server;
  
  beforeAll(async () => {
    // Setup test server
    server = app.listen(0); // Use random port for testing
  });
  
  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  describe('Complete Parent-Teacher Collaboration Workflow', () => {
    let profileId;
    let parentAssessmentId;
    let teacherAssessmentId;
    
    test('Step 1: Parent creates initial profile', async () => {
      const parentData = {
        child_name: "Integration Test Child",
        age_group: "6-8",
        precise_age_months: 78,
        quiz_type: "parent_home",
        respondent_type: "parent",
        respondent_name: "Sarah TestParent",
        responses: {
          // Strong home performance
          1: 5, // Communication - excellent at home
          2: 4, // Communication
          4: 4, // Collaboration with siblings
          7: 5, // Content - very curious
          11: 4, // Critical Thinking
          13: 5, // Creative Innovation - very creative
          14: 5, // Creative Innovation
          16: 4, // Confidence - confident at home
          17: 4, // Confidence
          19: 4, // Literacy - loves reading
          20: 4, // Literacy
          21: 3, // Literacy
          22: 3, // Math - struggles with numbers
          23: 2, // Math
          24: 2, // Math - needs support
          // Preferences
          25: "hands_on_activities",
          26: "visual_kinesthetic",
          27: "small_groups",
          28: ["art", "storytelling", "science"]
        },
        use_clp2_scoring: true
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(parentData)
        .expect(200);

      expect(response.body.profile).toBeDefined();
      expect(response.body.is_new_profile).toBe(true);
      expect(response.body.profile.parent_assessments).toBe(1);
      expect(response.body.profile.teacher_assessments).toBe(0);
      
      // Store for next steps
      profileId = response.body.profile.id;
      parentAssessmentId = response.body.assessment?.id;
      
      // Validate initial confidence and completeness
      expect(response.body.profile.confidence_percentage).toBeGreaterThan(25);
      expect(response.body.profile.confidence_percentage).toBeLessThan(50);
      expect(response.body.profile.completeness_percentage).toBeGreaterThan(50);
      expect(response.body.profile.completeness_percentage).toBeLessThan(75);

      console.log(`✓ Parent profile created with ID: ${profileId}`);
    });

    test('Step 2: Retrieve profile before teacher assessment', async () => {
      const response = await request(server)
        .get(`/api/profiles/progressive?profileId=${profileId}`)
        .expect(200);

      expect(response.body.profile.id).toBe(profileId);
      expect(response.body.profile.total_assessments).toBe(1);
      
      // Should have parent context data
      expect(response.body.profile.child_name).toBe("Integration Test Child");
      expect(response.body.profile.consolidated_scores).toBeDefined();
    });

    test('Step 3: Teacher adds classroom assessment', async () => {
      const teacherData = {
        child_name: "Integration Test Child",
        existing_profile_id: profileId,
        quiz_type: "teacher_classroom",
        respondent_type: "teacher",
        respondent_name: "Ms. TestTeacher",
        responses: {
          // More reserved classroom performance
          1: 3, // Communication - quieter in class
          3: 3, // Communication
          4: 3, // Collaboration - works okay in groups
          5: 3, // Collaboration
          8: 4, // Content - good retention
          9: 3, // Content
          10: 4, // Critical Thinking - good problem solver
          12: 4, // Critical Thinking
          19: 3, // Literacy - average in class
          21: 3, // Literacy
          22: 2, // Math - below grade level
          24: 2  // Math - needs significant support
        },
        use_clp2_scoring: true,
        assessment_context: {
          school_name: "Test Elementary",
          teacher_name: "Ms. TestTeacher",
          completion_location: "classroom",
          notes: "Child seems more reserved in classroom setting but shows good problem-solving skills"
        }
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(teacherData)
        .expect(200);

      expect(response.body.profile.id).toBe(profileId);
      expect(response.body.is_new_profile).toBe(false);
      expect(response.body.profile.parent_assessments).toBe(1);
      expect(response.body.profile.teacher_assessments).toBe(1);
      expect(response.body.profile.total_assessments).toBe(2);

      // Confidence should increase with professional input
      expect(response.body.profile.confidence_percentage).toBeGreaterThan(60);
      expect(response.body.profile.completeness_percentage).toBeGreaterThan(80);

      teacherAssessmentId = response.body.assessment?.id;

      console.log(`✓ Teacher assessment added. Confidence: ${response.body.profile.confidence_percentage}%`);
    });

    test('Step 4: Validate consolidated scores reflect both perspectives', async () => {
      const response = await request(server)
        .get(`/api/profiles/progressive?profileId=${profileId}&context=consolidated`)
        .expect(200);

      const profile = response.body.profile;
      const scores = profile.consolidated_scores;

      // Creative Innovation should be high (strong at home, less observed at school)
      expect(scores['Creative Innovation']).toBeGreaterThan(4.0);

      // Communication should be moderate (high at home, lower at school)
      expect(scores.Communication).toBeGreaterThan(3.0);
      expect(scores.Communication).toBeLessThan(4.5);

      // Math should be low (consistent across both contexts)
      expect(scores.Math).toBeLessThan(3.0);

      // Critical Thinking should be good (teacher observed this strength)
      expect(scores['Critical Thinking']).toBeGreaterThan(3.5);
    });

    test('Step 5: Check context-specific recommendations', async () => {
      const response = await request(server)
        .get(`/api/profiles/progressive?profileId=${profileId}&context=parent`)
        .expect(200);

      expect(response.body.profile.view_context).toBe('parent');
      expect(response.body.profile.recommendations).toBeDefined();

      // Should include home-specific recommendations
      const recommendations = JSON.stringify(response.body.profile.recommendations);
      expect(recommendations).toMatch(/(home|family|creative)/i);
    });

    test('Step 6: Test CLP 2.0 consolidation endpoint', async () => {
      const clp2Response = await request(server)
        .get(`/api/profiles/clp2-consolidate?profile_id=${profileId}`)
        .expect(200);

      expect(clp2Response.body.profile).toBeDefined();
      expect(clp2Response.body.consolidation_analysis).toBeDefined();
      
      const analysis = clp2Response.body.consolidation_analysis;
      expect(analysis.completeness_score).toBeGreaterThan(70);
      expect(analysis.data_sources).toHaveLength(2);
      
      // Should identify context differential
      if (analysis.missing_contexts.length === 0) {
        expect(analysis.confidence_level).toMatch(/medium|high/);
      }
    });
  });

  describe('Progressive Skill Development Over Time', () => {
    let developmentalProfileId;
    
    test('Month 1: Initial assessment shows early skills', async () => {
      const initialData = {
        child_name: "Developmental Test Child",
        age_group: "4-5",
        precise_age_months: 54,
        birth_date: "2019-06-01",
        quiz_type: "parent_home",
        respondent_type: "parent",
        respondent_name: "Parent Observer",
        responses: {
          1: 3, 2: 3, 4: 4, 7: 3, 11: 2, 13: 4, 14: 3, 16: 3, 17: 3,
          19: 2, 20: 2, 21: 2, 22: 2, 23: 2, 24: 2
        },
        use_clp2_scoring: true
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(initialData)
        .expect(200);

      developmentalProfileId = response.body.profile.id;
      
      // Initial scores should be modest
      const scores = response.body.profile.consolidated_scores || response.body.profile.scores;
      expect(scores.Math).toBeLessThan(3.0);
      expect(scores.Literacy).toBeLessThan(3.0);
    });

    test('Month 3: Teacher assessment shows classroom development', async () => {
      const teacherData = {
        child_name: "Developmental Test Child",
        existing_profile_id: developmentalProfileId,
        quiz_type: "teacher_classroom",
        respondent_type: "teacher",
        responses: {
          1: 3, 3: 4, 4: 4, 5: 3, 8: 3, 9: 3, 10: 3, 12: 3,
          19: 3, 21: 3, 22: 3, 24: 2
        },
        use_clp2_scoring: true
      };

      await request(server)
        .post('/api/profiles/progressive')
        .send(teacherData)
        .expect(200);
    });

    test('Month 6: Parent retake shows significant growth', async () => {
      const growthData = {
        child_name: "Developmental Test Child",
        existing_profile_id: developmentalProfileId,
        precise_age_months: 60, // Child is now 5 years old
        quiz_type: "parent_home",
        respondent_type: "parent",
        responses: {
          // Significant improvements
          1: 4, 2: 4, 4: 4, 7: 4, 11: 4, 13: 4, 14: 4, 16: 4, 17: 4,
          19: 4, 20: 3, 21: 4, 22: 3, 23: 3, 24: 3
        },
        use_clp2_scoring: true
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(growthData)
        .expect(200);

      expect(response.body.profile.total_assessments).toBe(3);
      
      // Should show growth indicators
      if (response.body.profile.growth_indicators) {
        expect(response.body.profile.growth_indicators.length).toBeGreaterThan(0);
      }

      // Confidence should be high with consistent data over time
      expect(response.body.profile.confidence_percentage).toBeGreaterThan(75);
    });
  });

  describe('Special Needs and Support Scenarios', () => {
    test('Should handle assessment indicating significant support needs', async () => {
      const supportNeedsData = {
        child_name: "Support Needs Child",
        age_group: "6-8",
        quiz_type: "teacher_classroom",
        respondent_type: "teacher",
        respondent_name: "Special Education Teacher",
        responses: {
          // Consistently low scores indicating need for support
          1: 2, 3: 2, 4: 2, 5: 2, 8: 2, 9: 2, 10: 2, 12: 2,
          19: 2, 21: 2, 22: 1, 24: 1
        },
        use_clp2_scoring: true,
        assessment_context: {
          school_name: "Inclusive Elementary",
          notes: "Student requires significant support across multiple areas"
        }
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(supportNeedsData)
        .expect(200);

      // Should create profile even with low scores
      expect(response.body.profile).toBeDefined();
      
      // Should generate appropriate support recommendations
      if (response.body.recommendations) {
        const recommendations = JSON.stringify(response.body.recommendations);
        expect(recommendations).toMatch(/(support|intervention|scaffolding)/i);
      }
    });

    test('Should balance support needs with identified strengths', async () => {
      const mixedProfileData = {
        child_name: "Mixed Profile Child",
        age_group: "6-8",
        quiz_type: "parent_home",
        respondent_type: "parent",
        responses: {
          // Strong in creative areas, needs support in academics
          1: 4, 2: 4, 4: 3, 7: 3, 11: 3, 13: 5, 14: 5, 16: 4, 17: 4,
          19: 2, 20: 2, 21: 2, 22: 2, 23: 2, 24: 2
        },
        use_clp2_scoring: true
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(mixedProfileData)
        .expect(200);

      const scores = response.body.profile.consolidated_scores || response.body.profile.scores;
      
      // Should show clear distinction between strengths and needs
      expect(scores['Creative Innovation']).toBeGreaterThan(4.0);
      expect(scores.Literacy).toBeLessThan(3.0);
      expect(scores.Math).toBeLessThan(3.0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('Should handle missing required fields gracefully', async () => {
      const incompleteData = {
        child_name: "Incomplete Data Child"
        // Missing required fields
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toMatch(/required fields/i);
    });

    test('Should handle invalid quiz type', async () => {
      const invalidData = {
        child_name: "Invalid Quiz Type Child",
        age_group: "5+",
        quiz_type: "invalid_quiz_type",
        respondent_type: "parent",
        responses: { 1: 3, 2: 4 }
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toMatch(/invalid quiz type/i);
    });

    test('Should handle profile not found scenarios', async () => {
      const response = await request(server)
        .get('/api/profiles/progressive?profileId=nonexistent-id')
        .expect(404);

      expect(response.body.error).toMatch(/not found/i);
    });

    test('Should handle extremely sparse response data', async () => {
      const sparseData = {
        child_name: "Sparse Response Child",
        age_group: "5+",
        quiz_type: "parent_home",
        respondent_type: "parent",
        responses: { 1: 3 }, // Only one response
        use_clp2_scoring: true
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(sparseData)
        .expect(200);

      // Should create profile but with low confidence
      expect(response.body.profile.confidence_percentage).toBeLessThan(30);
      
      if (response.body.warnings) {
        expect(response.body.warnings).toContain('Incomplete assessment data may affect accuracy');
      }
    });
  });

  describe('Performance and Load Testing', () => {
    test('Should handle concurrent profile creations', async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => {
        return request(server)
          .post('/api/profiles/progressive')
          .send({
            child_name: `Concurrent Child ${i}`,
            age_group: "5+",
            quiz_type: "parent_home",
            respondent_type: "parent",
            responses: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 },
            use_clp2_scoring: true
          });
      });

      const responses = await Promise.all(concurrentRequests);
      
      // All requests should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.profile.child_name).toBe(`Concurrent Child ${index}`);
      });

      // All profiles should have unique IDs
      const profileIds = responses.map(r => r.body.profile.id);
      const uniqueIds = new Set(profileIds);
      expect(uniqueIds.size).toBe(profileIds.length);
    });

    test('Should maintain performance with complex consolidation', async () => {
      const startTime = Date.now();
      
      // Create complex profile with multiple assessments
      const complexData = {
        child_name: "Complex Profile Child",
        age_group: "8-10",
        precise_age_months: 96,
        quiz_type: "general", // Most comprehensive quiz type
        respondent_type: "parent",
        responses: Object.fromEntries(
          // Generate responses for all 28 questions
          Array.from({ length: 28 }, (_, i) => [i + 1, Math.floor(Math.random() * 5) + 1])
        ),
        use_clp2_scoring: true
      };

      const response = await request(server)
        .post('/api/profiles/progressive')
        .send(complexData)
        .expect(200);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(processingTime).toBeLessThan(2000); // 2 seconds

      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.completeness_percentage).toBeGreaterThan(95);
    });
  });
});

// Utility functions for integration tests
function generateRandomResponses(questionCount = 15, minScore = 1, maxScore = 5) {
  const responses = {};
  for (let i = 1; i <= questionCount; i++) {
    responses[i] = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
  }
  return responses;
}

function expectScoreInRange(score, min, max) {
  expect(score).toBeGreaterThanOrEqual(min);
  expect(score).toBeLessThanOrEqual(max);
}

function expectProfileStructure(profile) {
  expect(profile).toHaveProperty('id');
  expect(profile).toHaveProperty('child_name');
  expect(profile).toHaveProperty('confidence_percentage');
  expect(profile).toHaveProperty('completeness_percentage');
  expect(profile).toHaveProperty('total_assessments');
  expect(profile).toHaveProperty('parent_assessments');
  expect(profile).toHaveProperty('teacher_assessments');
}

module.exports = {
  generateRandomResponses,
  expectScoreInRange,
  expectProfileStructure
};