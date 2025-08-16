// Consolidation Algorithm Validation Tests
// Tests the core mathematical and logical operations for multi-quiz consolidation

const { consolidateCLP2Scores, calculateCLP2Scores, getCLP2StrengthsAndGrowth } = require('../src/lib/clp-scoring');
const { getParentQuizQuestions, getTeacherQuizQuestions, validateQuizConfiguration } = require('../src/lib/multi-quiz-system');

describe('Consolidation Algorithms Deep Validation', () => {

  describe('CLP 2.0 Score Consolidation Mathematics', () => {
    test('should correctly weight parent and teacher assessments', () => {
      const parentScores = {
        Communication: 4.0,
        Collaboration: 5.0,
        Content: 3.0,
        'Critical Thinking': 3.5,
        'Creative Innovation': 4.5,
        Confidence: 4.0,
        Literacy: 3.5,
        Math: 2.5
      };

      const teacherScores = {
        Communication: 3.0,
        Collaboration: 4.0,
        Content: 4.0,
        'Critical Thinking': 4.0,
        'Creative Innovation': 3.0,
        Confidence: 3.5,
        Literacy: 4.0,
        Math: 3.5
      };

      const consolidatedScores = consolidateCLP2Scores([
        {
          scores: parentScores,
          weight: 0.6,
          quizType: 'parent_home',
          respondentType: 'parent'
        },
        {
          scores: teacherScores,
          weight: 0.8,
          quizType: 'teacher_classroom',
          respondentType: 'teacher'
        }
      ]);

      // Communication: (4.0 * 0.6 + 3.0 * 0.8) / (0.6 + 0.8) = 3.43
      expect(consolidatedScores.Communication).toBeCloseTo(3.43, 2);

      // Collaboration: (5.0 * 0.6 + 4.0 * 0.8) / (0.6 + 0.8) = 4.43  
      expect(consolidatedScores.Collaboration).toBeCloseTo(4.43, 2);

      // Math: (2.5 * 0.6 + 3.5 * 0.8) / (0.6 + 0.8) = 3.07
      expect(consolidatedScores.Math).toBeCloseTo(3.07, 2);
    });

    test('should handle missing scores in one assessment', () => {
      const parentScores = {
        Communication: 4.0,
        Collaboration: 5.0,
        'Creative Innovation': 4.5, // High creativity at home
        Literacy: 3.5
      };

      const teacherScores = {
        Communication: 3.0,
        Collaboration: 4.0,
        'Critical Thinking': 4.0, // Only observed in classroom
        Math: 3.5
      };

      const consolidatedScores = consolidateCLP2Scores([
        {
          scores: parentScores,
          weight: 0.6,
          quizType: 'parent_home',
          respondentType: 'parent'
        },
        {
          scores: teacherScores,
          weight: 0.8,
          quizType: 'teacher_classroom', 
          respondentType: 'teacher'
        }
      ]);

      // Skills present in both assessments should be weighted
      expect(consolidatedScores.Communication).toBeCloseTo(3.43, 2);
      expect(consolidatedScores.Collaboration).toBeCloseTo(4.43, 2);

      // Skills present in only one assessment should use that value
      expect(consolidatedScores['Creative Innovation']).toBe(4.5);
      expect(consolidatedScores['Critical Thinking']).toBe(4.0);
      expect(consolidatedScores.Literacy).toBe(3.5);
      expect(consolidatedScores.Math).toBe(3.5);
    });

    test('should apply diminishing returns for multiple same-type assessments', () => {
      const firstParentScores = {
        Communication: 3.0,
        Collaboration: 4.0,
        Math: 2.0
      };

      const secondParentScores = {
        Communication: 5.0,
        Collaboration: 5.0,
        Math: 4.0
      };

      // First parent assessment gets full weight
      const firstConsolidation = consolidateCLP2Scores([
        {
          scores: firstParentScores,
          weight: 0.6,
          quizType: 'parent_home',
          respondentType: 'parent'
        }
      ]);

      // Second parent assessment should get reduced weight
      const secondConsolidation = consolidateCLP2Scores([
        {
          scores: firstParentScores,
          weight: 0.6,
          quizType: 'parent_home',
          respondentType: 'parent'
        },
        {
          scores: secondParentScores,
          weight: 0.3, // Reduced weight for repeat assessment type
          quizType: 'parent_home',
          respondentType: 'parent'
        }
      ]);

      // Communication improvement should be moderated by diminishing returns
      const improvementEffect = secondConsolidation.Communication - firstConsolidation.Communication;
      expect(improvementEffect).toBeGreaterThan(0);
      expect(improvementEffect).toBeLessThan(2.0); // Should not get full benefit of improvement
    });
  });

  describe('Confidence Weighting Validation', () => {
    test('should calculate confidence based on data quality and consistency', () => {
      // High agreement between parent and teacher
      const highAgreementData = [
        { scores: { Communication: 4.0, Math: 3.0 }, weight: 0.6, quizType: 'parent_home' },
        { scores: { Communication: 4.2, Math: 3.1 }, weight: 0.8, quizType: 'teacher_classroom' }
      ];

      const highAgreementConfidence = calculateConsolidationConfidence(highAgreementData);
      expect(highAgreementConfidence).toBeGreaterThan(80);

      // Low agreement between assessments
      const lowAgreementData = [
        { scores: { Communication: 5.0, Math: 4.5 }, weight: 0.6, quizType: 'parent_home' },
        { scores: { Communication: 2.0, Math: 2.0 }, weight: 0.8, quizType: 'teacher_classroom' }
      ];

      const lowAgreementConfidence = calculateConsolidationConfidence(lowAgreementData);
      expect(lowAgreementConfidence).toBeLessThan(60);
    });

    test('should boost confidence with professional educator input', () => {
      const parentOnlyData = [
        { scores: { Communication: 4.0, Math: 3.0 }, weight: 0.6, quizType: 'parent_home' }
      ];

      const withTeacherData = [
        { scores: { Communication: 4.0, Math: 3.0 }, weight: 0.6, quizType: 'parent_home' },
        { scores: { Communication: 3.8, Math: 3.2 }, weight: 0.8, quizType: 'teacher_classroom' }
      ];

      const parentConfidence = calculateConsolidationConfidence(parentOnlyData);
      const withTeacherConfidence = calculateConsolidationConfidence(withTeacherData);

      expect(withTeacherConfidence).toBeGreaterThan(parentConfidence + 20);
    });

    test('should penalize confidence for incomplete assessments', () => {
      const completeData = [
        {
          scores: {
            Communication: 4.0, Collaboration: 4.0, Content: 3.0,
            'Critical Thinking': 3.5, 'Creative Innovation': 4.0,
            Confidence: 4.0, Literacy: 3.5, Math: 3.0
          },
          weight: 0.6,
          quizType: 'parent_home'
        }
      ];

      const incompleteData = [
        {
          scores: { Communication: 4.0, Math: 3.0 }, // Only 2 out of 8 skills
          weight: 0.6,
          quizType: 'parent_home'
        }
      ];

      const completeConfidence = calculateConsolidationConfidence(completeData);
      const incompleteConfidence = calculateConsolidationConfidence(incompleteData);

      expect(completeConfidence).toBeGreaterThan(incompleteConfidence + 20);
    });
  });

  describe('Progressive Profile Building Logic', () => {
    test('should maintain skill score history over time', () => {
      const timelineData = [
        {
          timestamp: '2024-01-01',
          scores: { Communication: 3.0, Math: 2.5, Literacy: 3.0 },
          weight: 0.6,
          quizType: 'parent_home'
        },
        {
          timestamp: '2024-02-01',
          scores: { Communication: 3.2, Math: 2.5, Literacy: 3.5 },
          weight: 0.8,
          quizType: 'teacher_classroom'
        },
        {
          timestamp: '2024-04-01',
          scores: { Communication: 4.0, Math: 3.0, Literacy: 4.0 },
          weight: 0.6,
          quizType: 'parent_home'
        }
      ];

      const progressiveProfile = buildProgressiveProfile(timelineData);

      // Should show growth over time
      expect(progressiveProfile.growthIndicators.Communication).toBeGreaterThan(0.5);
      expect(progressiveProfile.growthIndicators.Literacy).toBeGreaterThan(0.5);
      
      // Should identify consistent vs. emerging strengths
      expect(progressiveProfile.consistentStrengths).toContain('Communication');
      expect(progressiveProfile.emergingStrengths).toContain('Literacy');
    });

    test('should detect developmental milestones', () => {
      const developmentalData = [
        {
          age_months: 60, // 5 years old
          scores: { Math: 2.0, 'Critical Thinking': 2.5, Literacy: 3.0 }
        },
        {
          age_months: 66, // 5.5 years old
          scores: { Math: 3.0, 'Critical Thinking': 3.5, Literacy: 4.0 }
        }
      ];

      const milestones = detectDevelopmentalMilestones(developmentalData);

      expect(milestones.significantGrowthAreas).toContain('Math');
      expect(milestones.strongProgressIndicators).toContain('Critical Thinking');
      expect(milestones.expectedGrowthPattern).toBe(true);
    });
  });

  describe('Conflict Resolution Algorithms', () => {
    test('should identify context-specific performance patterns', () => {
      const homeScores = {
        Communication: 5.0,
        Confidence: 4.5,
        'Creative Innovation': 5.0
      };

      const schoolScores = {
        Communication: 2.5,
        Confidence: 2.0,
        'Creative Innovation': 3.0
      };

      const contextAnalysis = analyzeContextualDifferences(homeScores, schoolScores);

      expect(contextAnalysis.significantDifferences).toContain('Communication');
      expect(contextAnalysis.significantDifferences).toContain('Confidence');
      expect(contextAnalysis.contextPattern).toBe('home_advantaged');
      expect(contextAnalysis.recommendationsNeeded).toBe(true);
    });

    test('should provide balanced consolidation for moderate conflicts', () => {
      const moderateConflictData = [
        {
          scores: { Collaboration: 4.0, 'Critical Thinking': 3.0 },
          weight: 0.6,
          quizType: 'parent_home'
        },
        {
          scores: { Collaboration: 2.5, 'Critical Thinking': 4.5 },
          weight: 0.8,
          quizType: 'teacher_classroom'
        }
      ];

      const consolidatedScores = consolidateCLP2Scores(moderateConflictData);
      
      // Should not be heavily skewed toward either assessment
      expect(consolidatedScores.Collaboration).toBeCloseTo(3.1, 1);
      expect(consolidatedScores['Critical Thinking']).toBeCloseTo(3.9, 1);
    });

    test('should flag severe conflicts for manual review', () => {
      const severeConflictData = [
        {
          scores: { Communication: 5.0, Collaboration: 5.0 },
          weight: 0.6,
          quizType: 'parent_home'
        },
        {
          scores: { Communication: 1.0, Collaboration: 1.5 },
          weight: 0.8,
          quizType: 'teacher_classroom'
        }
      ];

      const conflictAnalysis = detectSevereConflicts(severeConflictData);
      
      expect(conflictAnalysis.requiresManualReview).toBe(true);
      expect(conflictAnalysis.conflictSeverity).toBe('high');
      expect(conflictAnalysis.affectedSkills).toContain('Communication');
      expect(conflictAnalysis.recommendedAction).toBe('schedule_conference');
    });
  });

  describe('Quiz Configuration Validation', () => {
    test('should validate parent quiz configuration for all age groups', () => {
      const ageGroups = ['3-4', '4-5', '5-6', '6-8', '8-10', '10+'];
      
      ageGroups.forEach(ageGroup => {
        const parentQuiz = getParentQuizQuestions(ageGroup);
        const validation = validateQuizConfiguration(parentQuiz);
        
        expect(validation.isValid).toBe(true);
        expect(parentQuiz.questions.length).toBeGreaterThan(10);
        expect(parentQuiz.includePreferences).toBe(true);
      });
    });

    test('should validate teacher quiz configuration for classroom context', () => {
      const ageGroups = ['3-4', '4-5', '5-6', '6-8', '8-10', '10+'];
      
      ageGroups.forEach(ageGroup => {
        const teacherQuiz = getTeacherQuizQuestions(ageGroup);
        const validation = validateQuizConfiguration(teacherQuiz);
        
        expect(validation.isValid).toBe(true);
        expect(teacherQuiz.questions.length).toBeGreaterThan(8);
        expect(teacherQuiz.includePreferences).toBe(false);
      });
    });

    test('should ensure complementary skill coverage between parent and teacher quizzes', () => {
      const parentQuiz = getParentQuizQuestions('6-8');
      const teacherQuiz = getTeacherQuizQuestions('6-8');
      
      const parentSkills = new Set(parentQuiz.questions.map(q => q.skill));
      const teacherSkills = new Set(teacherQuiz.questions.map(q => q.skill));
      
      // Both should cover core 6Cs
      const core6Cs = ['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence'];
      const parentCoverage = core6Cs.filter(skill => parentSkills.has(skill));
      const teacherCoverage = core6Cs.filter(skill => teacherSkills.has(skill));
      
      // Each quiz should cover at least 4 of the 6Cs
      expect(parentCoverage.length).toBeGreaterThanOrEqual(4);
      expect(teacherCoverage.length).toBeGreaterThanOrEqual(4);
      
      // Combined coverage should include all 6Cs
      const combinedSkills = new Set([...parentSkills, ...teacherSkills]);
      core6Cs.forEach(skill => {
        expect(combinedSkills.has(skill)).toBe(true);
      });
    });
  });

  describe('Scoring Version Compatibility', () => {
    test('should handle CLP 2.0 scoring consistently across quiz types', () => {
      const standardResponses = {
        1: 4, 2: 4, 4: 3, 7: 5, 11: 3, 13: 4, 16: 4,
        19: 3, 22: 3
      };

      const parentScores = calculateCLP2Scores(standardResponses, 'parent_home', '6-8');
      const teacherScores = calculateCLP2Scores(standardResponses, 'teacher_classroom', '6-8');
      const generalScores = calculateCLP2Scores(standardResponses, 'general', '6-8');

      // All scoring methods should produce scores in valid ranges
      Object.values(parentScores).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBeGreaterThanOrEqual(1.0);
          expect(score).toBeLessThanOrEqual(5.0);
        }
      });

      // Quiz type shouldn't dramatically alter scoring for same responses
      const parentComm = parentScores.Communication;
      const teacherComm = teacherScores.Communication;
      
      if (parentComm && teacherComm) {
        expect(Math.abs(parentComm - teacherComm)).toBeLessThan(1.0);
      }
    });
  });
});

// Helper functions for testing (these would be implemented in your actual system)
function calculateConsolidationConfidence(assessmentData) {
  // Mock implementation - replace with actual algorithm
  let baseConfidence = 30;
  let agreementBonus = 0;
  let professionalBonus = 0;
  let completenessBonus = 0;

  if (assessmentData.length > 1) {
    // Calculate agreement between assessments
    const commonSkills = findCommonSkills(assessmentData);
    if (commonSkills.length > 0) {
      const avgDifference = calculateAverageSkillDifference(assessmentData, commonSkills);
      agreementBonus = Math.max(0, 30 - (avgDifference * 10));
    }
  }

  // Professional educator bonus
  const hasTeacher = assessmentData.some(data => data.quizType === 'teacher_classroom');
  if (hasTeacher) {
    professionalBonus = 25;
  }

  // Completeness bonus
  const maxSkills = 8; // CLP 2.0 has 8 core skills
  const avgSkillCount = assessmentData.reduce((sum, data) => {
    return sum + Object.keys(data.scores).length;
  }, 0) / assessmentData.length;
  
  completenessBonus = (avgSkillCount / maxSkills) * 20;

  return Math.min(100, baseConfidence + agreementBonus + professionalBonus + completenessBonus);
}

function findCommonSkills(assessmentData) {
  if (assessmentData.length === 0) return [];
  
  let commonSkills = Object.keys(assessmentData[0].scores);
  
  for (let i = 1; i < assessmentData.length; i++) {
    const currentSkills = Object.keys(assessmentData[i].scores);
    commonSkills = commonSkills.filter(skill => currentSkills.includes(skill));
  }
  
  return commonSkills;
}

function calculateAverageSkillDifference(assessmentData, commonSkills) {
  if (assessmentData.length < 2 || commonSkills.length === 0) return 0;
  
  let totalDifference = 0;
  let comparisons = 0;
  
  for (let i = 0; i < assessmentData.length - 1; i++) {
    for (let j = i + 1; j < assessmentData.length; j++) {
      for (const skill of commonSkills) {
        const diff = Math.abs(assessmentData[i].scores[skill] - assessmentData[j].scores[skill]);
        totalDifference += diff;
        comparisons++;
      }
    }
  }
  
  return comparisons > 0 ? totalDifference / comparisons : 0;
}

function buildProgressiveProfile(timelineData) {
  // Mock implementation for progressive profile building
  const growthIndicators = {};
  const consistentStrengths = [];
  const emergingStrengths = [];
  
  // Calculate growth for each skill
  const skills = new Set();
  timelineData.forEach(data => {
    Object.keys(data.scores).forEach(skill => skills.add(skill));
  });
  
  skills.forEach(skill => {
    const skillScores = timelineData
      .filter(data => data.scores[skill] !== undefined)
      .map(data => ({ score: data.scores[skill], timestamp: data.timestamp }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (skillScores.length > 1) {
      const growth = skillScores[skillScores.length - 1].score - skillScores[0].score;
      growthIndicators[skill] = growth;
      
      if (skillScores.every(s => s.score >= 3.5)) {
        consistentStrengths.push(skill);
      } else if (growth > 0.5) {
        emergingStrengths.push(skill);
      }
    }
  });
  
  return { growthIndicators, consistentStrengths, emergingStrengths };
}

function detectDevelopmentalMilestones(developmentalData) {
  const significantGrowthAreas = [];
  const strongProgressIndicators = [];
  
  if (developmentalData.length < 2) {
    return { significantGrowthAreas, strongProgressIndicators, expectedGrowthPattern: false };
  }
  
  const earlier = developmentalData[0];
  const later = developmentalData[developmentalData.length - 1];
  
  Object.keys(later.scores).forEach(skill => {
    if (earlier.scores[skill] !== undefined) {
      const growth = later.scores[skill] - earlier.scores[skill];
      if (growth >= 1.0) {
        significantGrowthAreas.push(skill);
      }
      if (growth >= 0.5) {
        strongProgressIndicators.push(skill);
      }
    }
  });
  
  return {
    significantGrowthAreas,
    strongProgressIndicators,
    expectedGrowthPattern: strongProgressIndicators.length > 0
  };
}

function analyzeContextualDifferences(homeScores, schoolScores) {
  const significantDifferences = [];
  let homeAdvantageCount = 0;
  let schoolAdvantageCount = 0;
  
  Object.keys(homeScores).forEach(skill => {
    if (schoolScores[skill] !== undefined) {
      const difference = homeScores[skill] - schoolScores[skill];
      if (Math.abs(difference) > 1.5) {
        significantDifferences.push(skill);
        if (difference > 0) {
          homeAdvantageCount++;
        } else {
          schoolAdvantageCount++;
        }
      }
    }
  });
  
  let contextPattern = 'balanced';
  if (homeAdvantageCount > schoolAdvantageCount * 2) {
    contextPattern = 'home_advantaged';
  } else if (schoolAdvantageCount > homeAdvantageCount * 2) {
    contextPattern = 'school_advantaged';
  }
  
  return {
    significantDifferences,
    contextPattern,
    recommendationsNeeded: significantDifferences.length > 2
  };
}

function detectSevereConflicts(assessmentData) {
  if (assessmentData.length < 2) {
    return { requiresManualReview: false, conflictSeverity: 'none' };
  }
  
  const commonSkills = findCommonSkills(assessmentData);
  const severeConflicts = [];
  
  for (const skill of commonSkills) {
    const scores = assessmentData.map(data => data.scores[skill]);
    const maxDiff = Math.max(...scores) - Math.min(...scores);
    
    if (maxDiff >= 3.0) {
      severeConflicts.push(skill);
    }
  }
  
  return {
    requiresManualReview: severeConflicts.length > 0,
    conflictSeverity: severeConflicts.length > 2 ? 'high' : severeConflicts.length > 0 ? 'medium' : 'low',
    affectedSkills: severeConflicts,
    recommendedAction: severeConflicts.length > 2 ? 'schedule_conference' : 'provide_context_recommendations'
  };
}

module.exports = {
  calculateConsolidationConfidence,
  buildProgressiveProfile,
  detectDevelopmentalMilestones,
  analyzeContextualDifferences,
  detectSevereConflicts
};