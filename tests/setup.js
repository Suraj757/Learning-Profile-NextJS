// Jest test setup for multi-quiz consolidation tests

// Global test setup
beforeAll(() => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  
  // Mock console methods to avoid noise in test output
  global.console = {
    ...console,
    // Uncomment to suppress logs during testing
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

// Global test teardown
afterAll(() => {
  // Clean up any resources
});

// Mock Supabase for testing
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Custom matchers for testing learning profiles
expect.extend({
  toBeValidCLP2Score(received) {
    const pass = typeof received === 'number' && received >= 1.0 && received <= 5.0;
    return {
      message: () => `expected ${received} to be a valid CLP 2.0 score (1.0-5.0)`,
      pass,
    };
  },
  
  toHaveConsolidationStructure(received) {
    const requiredFields = [
      'profile_id', 'is_new_profile', 'consolidated_scores',
      'confidence_percentage', 'completeness_percentage'
    ];
    
    const hasAllFields = requiredFields.every(field => 
      received.hasOwnProperty(field)
    );
    
    return {
      message: () => `expected object to have consolidation structure with fields: ${requiredFields.join(', ')}`,
      pass: hasAllFields,
    };
  },
  
  toShowGrowthPattern(received, expectedGrowth) {
    if (!Array.isArray(received) || received.length < 2) {
      return {
        message: () => 'expected array with at least 2 data points',
        pass: false,
      };
    }
    
    const actualGrowth = received[received.length - 1].score - received[0].score;
    const pass = actualGrowth >= expectedGrowth;
    
    return {
      message: () => `expected growth of ${expectedGrowth}, got ${actualGrowth}`,
      pass,
    };
  }
});

// Global test utilities
global.testUtils = {
  // Generate realistic parent responses
  generateParentResponses: (skillEmphasis = {}) => {
    const baseResponses = {
      1: 4, 2: 4, 4: 4, 7: 3, 11: 3, 13: 4, 14: 4, 16: 4, 17: 3,
      19: 3, 20: 3, 21: 3, 22: 3, 23: 3, 24: 3,
      25: "hands_on_activities", 26: "visual", 27: "pairs", 28: ["art", "reading"]
    };
    
    // Apply skill emphasis
    Object.entries(skillEmphasis).forEach(([questionId, modifier]) => {
      if (baseResponses[questionId] && typeof baseResponses[questionId] === 'number') {
        baseResponses[questionId] = Math.max(1, Math.min(5, baseResponses[questionId] + modifier));
      }
    });
    
    return baseResponses;
  },
  
  // Generate realistic teacher responses  
  generateTeacherResponses: (classroomBehavior = 'typical') => {
    const behaviorPatterns = {
      typical: { 1: 3, 3: 3, 4: 4, 5: 3, 8: 3, 9: 3, 10: 3, 12: 3, 19: 3, 21: 3, 22: 3, 24: 3 },
      shy: { 1: 2, 3: 2, 4: 3, 5: 2, 8: 3, 9: 3, 10: 3, 12: 3, 19: 3, 21: 3, 22: 3, 24: 3 },
      outgoing: { 1: 4, 3: 5, 4: 5, 5: 4, 8: 3, 9: 3, 10: 3, 12: 3, 19: 3, 21: 3, 22: 3, 24: 3 },
      struggling: { 1: 2, 3: 2, 4: 2, 5: 2, 8: 2, 9: 2, 10: 2, 12: 2, 19: 2, 21: 2, 22: 2, 24: 2 },
      advanced: { 1: 4, 3: 4, 4: 4, 5: 4, 8: 5, 9: 4, 10: 5, 12: 4, 19: 4, 21: 4, 22: 4, 24: 4 }
    };
    
    return behaviorPatterns[classroomBehavior] || behaviorPatterns.typical;
  },
  
  // Create test profile data
  createTestProfile: (overrides = {}) => ({
    child_name: "Test Child",
    age_group: "5+",
    precise_age_months: 66,
    quiz_type: "parent_home",
    respondent_type: "parent",
    responses: global.testUtils.generateParentResponses(),
    use_clp2_scoring: true,
    ...overrides
  }),
  
  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Assert consolidation quality
  assertConsolidationQuality: (consolidation, expectedQuality = 'medium') => {
    const qualityThresholds = {
      low: { confidence: 40, completeness: 50 },
      medium: { confidence: 60, completeness: 70 },
      high: { confidence: 80, completeness: 90 }
    };
    
    const threshold = qualityThresholds[expectedQuality];
    expect(consolidation.confidence_percentage).toBeGreaterThanOrEqual(threshold.confidence);
    expect(consolidation.completeness_percentage).toBeGreaterThanOrEqual(threshold.completeness);
  }
};

// Suppress specific warnings during testing
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    // Suppress known warnings that don't affect test validity
    if (args[0].includes('Warning: ReactDOM.render is deprecated')) return;
    if (args[0].includes('Warning: componentWillMount has been renamed')) return;
  }
  originalWarn(...args);
};