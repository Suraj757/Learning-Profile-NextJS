# CLP 2.0 Implementation Plan

## Technical Implementation Details

### 1. Question Bank Restructuring

#### A. Update Questions Schema
```typescript
// src/lib/questions.ts - Enhanced question interface
export interface CLP2Question extends Question {
  id: number
  text: string
  category: 'Collaboration' | 'Communication' | 'Critical Thinking' | 'Creativity & Curiosity' | 'Confidence' | 'Literacy' | 'Math'
  subcategory?: string
  ageGroups: AgeGroup[]
  contexts: ('parent' | 'teacher' | 'shared')[]
  clp2Scoring: {
    strongResponse: { optionIndex: number; points: 1.0 }
    partialResponse: { optionIndex: number; points: 0.5 }
    noAlignmentResponses: { optionIndexes: number[]; points: 0 }
  }
  developmentalFocus: 'emerging' | 'developing' | 'strength'
  priorityLevel: number // For question selection algorithm
}
```

#### B. Restructured Question Distribution
```typescript
// 24 Core Questions + 4 Preference Questions = 28 Total
export const CLP2_QUESTION_DISTRIBUTION = {
  skills: {
    'Collaboration': 3,
    'Communication': 3, 
    'Critical Thinking': 3,
    'Creativity & Curiosity': 3,
    'Confidence': 3,
    'Literacy': 3,
    'Math': 3
  },
  preferences: {
    'Engagement': 1,
    'Modality': 1,
    'Social Level': 1,
    'Interests': 1
  }
} as const;
```

### 2. Quiz Type Implementation

#### A. Quiz Generator Service
```typescript
// src/services/quizGenerator.ts
export interface QuizGenerationParams {
  ageGroup: AgeGroup
  respondentType: 'parent' | 'teacher'
  childId?: string
  existingProfileData?: PartialProfile
}

export class CLP2QuizGenerator {
  async generateQuiz(params: QuizGenerationParams): Promise<CLP2Quiz> {
    // 1. Select age-appropriate question pool
    const questionPool = this.getAgeAppropriateQuestions(params.ageGroup);
    
    // 2. Filter by respondent context
    const contextQuestions = this.filterByContext(questionPool, params.respondentType);
    
    // 3. Ensure skill distribution (3 questions per skill)
    const skillQuestions = this.selectSkillQuestions(contextQuestions);
    
    // 4. Add preference questions
    const preferenceQuestions = this.getPreferenceQuestions(params.ageGroup);
    
    // 5. Validate and return
    return this.validateAndBuildQuiz(skillQuestions, preferenceQuestions);
  }

  private selectSkillQuestions(questions: CLP2Question[]): CLP2Question[] {
    const selected: CLP2Question[] = [];
    
    for (const skill of Object.keys(CLP2_QUESTION_DISTRIBUTION.skills)) {
      const skillQuestions = questions.filter(q => q.category === skill);
      const sortedByPriority = skillQuestions.sort((a, b) => a.priorityLevel - b.priorityLevel);
      selected.push(...sortedByPriority.slice(0, 3));
    }
    
    return selected;
  }

  private filterByContext(questions: CLP2Question[], context: 'parent' | 'teacher'): CLP2Question[] {
    return questions.filter(q => 
      q.contexts.includes(context) || q.contexts.includes('shared')
    );
  }
}
```

#### B. Quiz Types Enum
```typescript
// src/types/quiz.ts
export enum QuizType {
  PARENT_HOME = 'parent_home',
  TEACHER_CLASSROOM = 'teacher_classroom',
  COMBINED_ASSESSMENT = 'combined'
}

export interface CLP2Quiz {
  id: string
  type: QuizType
  ageGroup: AgeGroup
  skillQuestions: CLP2Question[] // Always 21 questions (3 per skill * 7 skills)
  preferenceQuestions: CLP2Question[] // Always 4 questions
  totalQuestions: 28 // 24 skills + 4 preferences
  estimatedMinutes: number
  metadata: {
    version: '2.0'
    generatedAt: Date
    respondentType: 'parent' | 'teacher'
  }
}
```

### 3. Scoring System Migration

#### A. CLP 2.0 Scoring Engine
```typescript
// src/lib/scoring-clp2.ts
export interface CLP2Scores {
  skills: {
    collaboration: number
    communication: number
    criticalThinking: number
    creativityCuriosity: number
    confidence: number
    literacy: number
    math: number
    content: number // literacy + math combined
  }
  tiers: {
    [skillName: string]: 'strength' | 'developing' | 'emerging'
  }
  preferences: {
    engagement: string
    modality: string
    socialLevel: string
    interests: string[]
  }
  metadata: {
    totalPossiblePoints: number
    confidenceScore: number
    completionRate: number
  }
}

export class CLP2ScoringEngine {
  calculateScores(responses: Record<number, number>, quiz: CLP2Quiz): CLP2Scores {
    const skillScores = this.calculateSkillScores(responses, quiz.skillQuestions);
    const tiers = this.calculateTiers(skillScores);
    const preferences = this.extractPreferences(responses, quiz.preferenceQuestions);
    
    return {
      skills: {
        ...skillScores,
        content: skillScores.literacy + skillScores.math
      },
      tiers,
      preferences,
      metadata: this.calculateMetadata(responses, quiz)
    };
  }

  private calculateSkillScores(responses: Record<number, number>, questions: CLP2Question[]): Record<string, number> {
    const scores: Record<string, number> = {};
    
    // Group questions by skill
    const questionsBySkill = this.groupQuestionsBySkill(questions);
    
    for (const [skill, skillQuestions] of Object.entries(questionsBySkill)) {
      let skillTotal = 0;
      
      for (const question of skillQuestions) {
        const responseValue = responses[question.id];
        if (responseValue !== undefined) {
          skillTotal += this.getQuestionScore(question, responseValue);
        }
      }
      
      scores[skill.toLowerCase().replace(/\s+/g, '')] = Math.round(skillTotal * 100) / 100;
    }
    
    return scores;
  }

  private getQuestionScore(question: CLP2Question, responseValue: number): number {
    const { strongResponse, partialResponse, noAlignmentResponses } = question.clp2Scoring;
    
    if (responseValue === strongResponse.optionIndex) {
      return strongResponse.points;
    } else if (responseValue === partialResponse.optionIndex) {
      return partialResponse.points;
    } else if (noAlignmentResponses.optionIndexes.includes(responseValue)) {
      return 0;
    }
    
    // Fallback for unexpected values
    return 0;
  }

  private calculateTiers(scores: Record<string, number>): Record<string, string> {
    const tiers: Record<string, string> = {};
    
    for (const [skill, score] of Object.entries(scores)) {
      if (score >= 2.5) {
        tiers[skill] = 'strength';
      } else if (score >= 1.0) {
        tiers[skill] = 'developing';
      } else {
        tiers[skill] = 'emerging';
      }
    }
    
    return tiers;
  }
}
```

#### B. Archetype Assignment (5-Gate System)
```typescript
// src/lib/archetype-clp2.ts
export class CLP2ArchetypeEngine {
  assignArchetype(scores: CLP2Scores, ageGroup: AgeGroup): string {
    const greenBars = this.countGreenBars(scores.tiers);
    const isGreen = (skill: string) => scores.tiers[skill] === 'strength';
    
    // Gate 1: Well-Rounded High-Flyer (≥4 green bars)
    if (greenBars >= 4) {
      return this.getArchetypeCode(ageGroup, 'A');
    }
    
    // Gate 2: Language & Creativity Lead
    const languageArtsGreen = [
      isGreen('creativitycuriosity'),
      isGreen('communication'), 
      isGreen('literacy')
    ].filter(Boolean).length;
    
    if (languageArtsGreen >= 2 && !isGreen('math') && greenBars < 4) {
      return this.getArchetypeCode(ageGroup, 'B');
    }
    
    // Gate 3: STEM/Logic Lead
    if ((isGreen('math') || isGreen('criticalthinking')) && 
        !isGreen('communication') && greenBars < 4) {
      return this.getArchetypeCode(ageGroup, 'C');
    }
    
    // Gate 4: Social/Confidence Lead
    if ((isGreen('collaboration') || isGreen('confidence')) && greenBars < 4) {
      return this.getArchetypeCode(ageGroup, 'D');
    }
    
    // Gate 5: Emerging Explorer (everything else)
    return this.getArchetypeCode(ageGroup, 'E');
  }

  private countGreenBars(tiers: Record<string, string>): number {
    return Object.values(tiers).filter(tier => tier === 'strength').length;
  }

  private getArchetypeCode(ageGroup: AgeGroup, gateCode: string): string {
    return `${ageGroup}-${gateCode}`;
  }
}
```

### 4. Progressive Profile Building

#### A. Multi-Respondent Integration
```typescript
// src/services/profileBuilder.ts
export interface MultiRespondentData {
  parentResponses?: AssessmentResponse
  teacherResponses?: AssessmentResponse
  childId: string
  ageGroup: AgeGroup
}

export class CLP2ProfileBuilder {
  async buildProfile(data: MultiRespondentData): Promise<LearningProfile> {
    // 1. Calculate individual scores
    const parentScores = data.parentResponses ? 
      this.scoringEngine.calculateScores(data.parentResponses.responses, data.parentResponses.quiz) : null;
    
    const teacherScores = data.teacherResponses ? 
      this.scoringEngine.calculateScores(data.teacherResponses.responses, data.teacherResponses.quiz) : null;
    
    // 2. Create composite scores
    const compositeScores = this.createCompositeScores(parentScores, teacherScores);
    
    // 3. Determine archetype
    const archetype = this.archetypeEngine.assignArchetype(compositeScores, data.ageGroup);
    
    // 4. Generate activity recommendations
    const activities = await this.activityEngine.generatePersonalizedSet(compositeScores, data.ageGroup);
    
    // 5. Build final profile
    return {
      childId: data.childId,
      archetype,
      scores: compositeScores,
      activities,
      confidence: this.calculateConfidenceScore(parentScores, teacherScores),
      generatedAt: new Date(),
      version: '2.0'
    };
  }

  private createCompositeScores(parent: CLP2Scores | null, teacher: CLP2Scores | null): CLP2Scores {
    if (!parent && !teacher) {
      throw new Error('At least one respondent score required');
    }
    
    if (!teacher) return parent!;
    if (!parent) return teacher!;
    
    // Weighted average based on question context relevance
    const composite: CLP2Scores = {
      skills: {},
      tiers: {},
      preferences: parent.preferences, // Parent preferences take precedence
      metadata: {
        totalPossiblePoints: parent.metadata.totalPossiblePoints,
        confidenceScore: this.calculateCompositeConfidence(parent, teacher),
        completionRate: Math.min(parent.metadata.completionRate, teacher.metadata.completionRate)
      }
    };
    
    // Skill-specific weighting
    const skillWeights = {
      collaboration: { parent: 0.4, teacher: 0.6 }, // More classroom-relevant
      communication: { parent: 0.5, teacher: 0.5 }, // Equal context relevance
      criticalthinking: { parent: 0.3, teacher: 0.7 }, // More academic
      creativitycuriosity: { parent: 0.6, teacher: 0.4 }, // More home-relevant
      confidence: { parent: 0.5, teacher: 0.5 }, // Equal relevance
      literacy: { parent: 0.4, teacher: 0.6 }, // More academic
      math: { parent: 0.3, teacher: 0.7 }, // More academic
    };
    
    for (const [skill, weights] of Object.entries(skillWeights)) {
      const parentScore = parent.skills[skill] || 0;
      const teacherScore = teacher.skills[skill] || 0;
      
      composite.skills[skill] = (parentScore * weights.parent) + (teacherScore * weights.teacher);
    }
    
    // Recalculate tiers based on composite scores
    composite.tiers = this.calculateTiers(composite.skills);
    
    return composite;
  }
}
```

### 5. Database Migrations

#### A. Question Table Migration
```sql
-- Migration: Add CLP 2.0 support to questions table
ALTER TABLE questions 
ADD COLUMN clp2_version BOOLEAN DEFAULT FALSE,
ADD COLUMN quiz_contexts JSON, -- ['parent', 'teacher', 'shared']
ADD COLUMN clp2_scoring JSON, -- Scoring rules
ADD COLUMN priority_level INTEGER DEFAULT 1,
ADD COLUMN developmental_focus ENUM('emerging', 'developing', 'strength');

-- Update existing questions to mark as legacy
UPDATE questions SET clp2_version = FALSE WHERE clp2_version IS NULL;

-- Add indexes for performance
CREATE INDEX idx_questions_clp2_context ON questions(clp2_version, age_group);
CREATE INDEX idx_questions_skill_context ON questions(category, clp2_version);
```

#### B. Assessment Response Migration
```sql
-- Migration: Create CLP 2.0 assessment tables
CREATE TABLE clp2_assessments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  child_id BIGINT NOT NULL,
  quiz_type ENUM('parent', 'teacher', 'combined') NOT NULL,
  age_group ENUM('3-4', '4-5', '5+') NOT NULL,
  quiz_data JSON NOT NULL, -- Full quiz configuration
  responses JSON NOT NULL, -- User responses
  scores JSON NOT NULL, -- Calculated scores
  archetype VARCHAR(10), -- e.g., "3-4-B"
  confidence_score DECIMAL(3,2),
  completion_time_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (child_id) REFERENCES children(id),
  INDEX idx_child_quiz_type (child_id, quiz_type),
  INDEX idx_archetype (archetype),
  INDEX idx_created_at (created_at)
);

-- Migration: Create learning profiles table
CREATE TABLE clp2_learning_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  child_id BIGINT NOT NULL UNIQUE,
  archetype VARCHAR(10) NOT NULL,
  skill_scores JSON NOT NULL,
  skill_tiers JSON NOT NULL,
  preferences JSON NOT NULL,
  confidence_score DECIMAL(3,2),
  parent_assessment_id BIGINT,
  teacher_assessment_id BIGINT,
  activity_set JSON, -- Generated activity recommendations
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (parent_assessment_id) REFERENCES clp2_assessments(id),
  FOREIGN KEY (teacher_assessment_id) REFERENCES clp2_assessments(id),
  INDEX idx_archetype (archetype),
  INDEX idx_confidence (confidence_score)
);
```

### 6. API Endpoint Updates

#### A. Quiz Generation Endpoint
```typescript
// src/pages/api/clp2/quiz/generate.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { childId, respondentType, ageGroup } = req.body;
    
    // Validate parameters
    if (!['parent', 'teacher'].includes(respondentType)) {
      return res.status(400).json({ error: 'Invalid respondent type' });
    }
    
    // Generate quiz
    const quizGenerator = new CLP2QuizGenerator();
    const quiz = await quizGenerator.generateQuiz({
      ageGroup,
      respondentType,
      childId
    });
    
    // Store quiz configuration for later scoring
    await this.storeQuizConfiguration(quiz, childId);
    
    res.status(200).json({ quiz });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Quiz generation failed' });
  }
}
```

#### B. Assessment Submission Endpoint
```typescript
// src/pages/api/clp2/assessment/submit.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { quizId, responses, completionTime } = req.body;
    
    // Retrieve quiz configuration
    const quiz = await this.getQuizConfiguration(quizId);
    
    // Calculate scores using CLP 2.0 engine
    const scoringEngine = new CLP2ScoringEngine();
    const scores = scoringEngine.calculateScores(responses, quiz);
    
    // Store assessment
    const assessment = await this.storeAssessment({
      quizId,
      responses,
      scores,
      completionTime,
      quiz
    });
    
    // Check if profile can be built (have required respondents)
    const profileBuilder = new CLP2ProfileBuilder();
    const profile = await profileBuilder.attemptProfileBuild(assessment.childId);
    
    res.status(200).json({ 
      assessment,
      profile: profile || null,
      requiresAdditionalRespondent: !profile
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ error: 'Assessment submission failed' });
  }
}
```

### 7. Frontend Component Updates

#### A. Quiz Interface Component
```typescript
// src/components/clp2/QuizInterface.tsx
interface CLP2QuizInterfaceProps {
  quiz: CLP2Quiz
  onSubmit: (responses: Record<number, number>) => Promise<void>
  respondentType: 'parent' | 'teacher'
}

export function CLP2QuizInterface({ quiz, onSubmit, respondentType }: CLP2QuizInterfaceProps) {
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [currentSection, setCurrentSection] = useState<'skills' | 'preferences'>('skills');
  
  const progress = (Object.keys(responses).length / quiz.totalQuestions) * 100;
  
  return (
    <div className="clp2-quiz-container">
      <QuizHeader 
        type={respondentType}
        progress={progress}
        totalQuestions={quiz.totalQuestions}
      />
      
      {currentSection === 'skills' && (
        <SkillQuestionsSection 
          questions={quiz.skillQuestions}
          responses={responses}
          onResponseChange={setResponses}
          ageGroup={quiz.ageGroup}
        />
      )}
      
      {currentSection === 'preferences' && (
        <PreferenceQuestionsSection 
          questions={quiz.preferenceQuestions}
          responses={responses}
          onResponseChange={setResponses}
        />
      )}
      
      <QuizNavigation 
        canProceed={Object.keys(responses).length >= quiz.skillQuestions.length}
        onSectionChange={setCurrentSection}
        currentSection={currentSection}
        onSubmit={() => onSubmit(responses)}
      />
    </div>
  );
}
```

#### B. Profile Display Component
```typescript
// src/components/clp2/ProfileDisplay.tsx
interface CLP2ProfileDisplayProps {
  profile: LearningProfile
  showConfidenceIndicators?: boolean
}

export function CLP2ProfileDisplay({ profile, showConfidenceIndicators = true }: CLP2ProfileDisplayProps) {
  return (
    <div className="clp2-profile-container">
      <ArchetypeHeader 
        archetype={profile.archetype}
        confidence={profile.confidence}
        showConfidence={showConfidenceIndicators}
      />
      
      <SkillBarsSection 
        scores={profile.scores.skills}
        tiers={profile.scores.tiers}
        format="clp2" // New 0-3 scale visualization
      />
      
      <PreferencesSection 
        engagement={profile.scores.preferences.engagement}
        modality={profile.scores.preferences.modality}
        socialLevel={profile.scores.preferences.socialLevel}
        interests={profile.scores.preferences.interests}
      />
      
      <ActivityRecommendations 
        activities={profile.activities}
        preferences={profile.scores.preferences}
        growthAreas={this.identifyGrowthAreas(profile.scores.tiers)}
      />
    </div>
  );
}
```

### 8. Testing Strategy

#### A. Unit Tests
```typescript
// tests/scoring/clp2-scoring.test.ts
describe('CLP2ScoringEngine', () => {
  test('calculates correct skill scores for 3-question sets', () => {
    const responses = { 1: 1, 2: 2, 3: 1 }; // Strong, Partial, Strong
    const expectedScore = (1.0 + 0.5 + 1.0); // 2.5 points
    
    const result = scoringEngine.calculateSkillScore('collaboration', responses, mockQuestions);
    expect(result).toBe(2.5);
  });

  test('assigns correct tiers based on score ranges', () => {
    expect(scoringEngine.getTier(2.7)).toBe('strength');
    expect(scoringEngine.getTier(1.5)).toBe('developing');
    expect(scoringEngine.getTier(0.3)).toBe('emerging');
  });
});
```

#### B. Integration Tests
```typescript
// tests/integration/quiz-generation.test.ts
describe('Quiz Generation Flow', () => {
  test('generates valid parent quiz for 3-4 age group', async () => {
    const quiz = await quizGenerator.generateQuiz({
      ageGroup: '3-4',
      respondentType: 'parent'
    });
    
    expect(quiz.skillQuestions).toHaveLength(21); // 3 per skill * 7 skills
    expect(quiz.preferenceQuestions).toHaveLength(4);
    expect(quiz.totalQuestions).toBe(28);
    
    // Verify all questions are appropriate for parent context
    quiz.skillQuestions.forEach(q => {
      expect(q.contexts).toContain('parent');
    });
  });
});
```

### 9. Performance Considerations

#### A. Caching Strategy
```typescript
// src/lib/cache/quiz-cache.ts
export class QuizCache {
  private static cache = new Map<string, CLP2Quiz>();
  
  static generateCacheKey(ageGroup: AgeGroup, respondentType: string): string {
    return `${ageGroup}-${respondentType}`;
  }
  
  static async getOrGenerate(params: QuizGenerationParams): Promise<CLP2Quiz> {
    const key = this.generateCacheKey(params.ageGroup, params.respondentType);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    const quiz = await new CLP2QuizGenerator().generateQuiz(params);
    this.cache.set(key, quiz);
    
    return quiz;
  }
}
```

#### B. Database Optimization
```sql
-- Optimized indexes for common query patterns
CREATE INDEX idx_clp2_child_respondent ON clp2_assessments(child_id, quiz_type, created_at DESC);
CREATE INDEX idx_clp2_archetype_age ON clp2_learning_profiles(archetype, age_group);
CREATE INDEX idx_questions_context_skill ON questions(quiz_contexts, category, age_group);
```

This implementation plan provides the technical foundation for migrating to CLP 2.0 while maintaining system performance and user experience quality. The modular approach allows for incremental deployment and testing of each component.