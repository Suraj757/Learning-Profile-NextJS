-- Multi-Quiz Progressive Profile System Database Enhancement
-- Extends existing schema to support multiple quiz types contributing to single profiles

-- 1. Add quiz context support to existing assessment_results table
ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS quiz_type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS quiz_version VARCHAR(20) DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS respondent_type VARCHAR(20) DEFAULT 'parent', -- 'parent', 'teacher', 'self'
ADD COLUMN IF NOT EXISTS respondent_id UUID, -- Links to teacher_profiles or parent_profiles
ADD COLUMN IF NOT EXISTS profile_completion_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2) DEFAULT 50.00; -- Profile confidence based on data sources

-- 2. Create quiz_definitions table for different quiz types
CREATE TABLE IF NOT EXISTS quiz_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_type VARCHAR(50) NOT NULL UNIQUE, -- 'parent_home', 'teacher_classroom', 'student_self'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_respondent VARCHAR(20) NOT NULL, -- 'parent', 'teacher', 'student'
    
    -- Quiz configuration
    question_count INTEGER NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 5,
    age_groups TEXT[] DEFAULT ARRAY['3-4', '4-5', '5+'], -- Supported age groups
    
    -- Question mapping
    question_ids INTEGER[] NOT NULL, -- Array of question IDs for this quiz
    question_order INTEGER[] NOT NULL, -- Custom question ordering
    
    -- Context-specific settings
    context_intro_text TEXT,
    context_instructions TEXT,
    result_page_template VARCHAR(50) DEFAULT 'standard',
    
    -- Status and versioning
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create profile_data_sources table to track contributions
CREATE TABLE IF NOT EXISTS profile_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES assessment_results(id) ON DELETE CASCADE,
    quiz_type VARCHAR(50) NOT NULL,
    respondent_type VARCHAR(20) NOT NULL,
    respondent_id UUID, -- Teacher or parent ID
    
    -- Data contribution tracking
    assessment_result_id UUID REFERENCES assessment_results(id),
    data_weight DECIMAL(5,2) DEFAULT 1.00, -- Weight of this data source (0-1)
    confidence_contribution DECIMAL(5,2) DEFAULT 0.00,
    
    -- Temporal tracking
    contributed_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Data freshness
    expires_at TIMESTAMPTZ, -- When this data becomes stale
    is_current BOOLEAN DEFAULT TRUE,
    
    UNIQUE(profile_id, quiz_type, respondent_type, respondent_id)
);

-- 4. Create consolidated_profiles table for the single source of truth
CREATE TABLE IF NOT EXISTS consolidated_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_name VARCHAR(100) NOT NULL,
    
    -- Child details
    age_group VARCHAR(10),
    grade_level VARCHAR(50),
    school_year VARCHAR(10),
    
    -- Consolidated scores (weighted average from all sources)
    consolidated_scores JSONB NOT NULL,
    
    -- Profile metadata
    personality_label VARCHAR(100),
    confidence_percentage DECIMAL(5,2) DEFAULT 0.00,
    completeness_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Data source summary
    total_assessments INTEGER DEFAULT 0,
    parent_assessments INTEGER DEFAULT 0,
    teacher_assessments INTEGER DEFAULT 0,
    
    -- Last updates from each source
    last_parent_update TIMESTAMPTZ,
    last_teacher_update TIMESTAMPTZ,
    
    -- Consolidated insights
    primary_strengths TEXT[],
    growth_opportunities TEXT[],
    recommended_strategies JSONB,
    
    -- Context-aware recommendations
    home_recommendations JSONB, -- For parents
    classroom_recommendations JSONB, -- For teachers
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Privacy and sharing
    sharing_token VARCHAR(50) UNIQUE,
    is_public BOOLEAN DEFAULT FALSE,
    parent_consent BOOLEAN DEFAULT FALSE,
    teacher_access_granted BOOLEAN DEFAULT FALSE
);

-- 5. Insert quiz definitions for parent and teacher contexts
INSERT INTO quiz_definitions (quiz_type, name, description, target_respondent, question_count, question_ids, question_order, context_intro_text, result_page_template) VALUES
('parent_home', 'Parent Home Behavior Assessment', 'Assessment focusing on home behavior, learning preferences, and family interactions', 'parent', 15, 
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], -- Customize with actual question IDs
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
 'Help us understand how your child learns and behaves at home. This will give teachers valuable insights into your child''s learning style.',
 'parent_focused'),

('teacher_classroom', 'Teacher Classroom Assessment', 'Assessment focusing on classroom behavior, academic performance, and peer interactions', 'teacher', 12,
 ARRAY[16,17,18,19,20,21,22,23,24,25,26,27], -- Different question set
 ARRAY[16,17,18,19,20,21,22,23,24,25,26,27],
 'Share your observations about this student''s classroom behavior and learning patterns. This will enhance their learning profile.',
 'teacher_focused');

-- 6. Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_results_quiz_type ON assessment_results(quiz_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_results_respondent ON assessment_results(respondent_type, respondent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_data_sources_profile ON profile_data_sources(profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consolidated_profiles_sharing ON consolidated_profiles(sharing_token) WHERE sharing_token IS NOT NULL;

-- 7. Create function to calculate consolidated scores
CREATE OR REPLACE FUNCTION calculate_consolidated_scores(profile_id UUID)
RETURNS JSONB AS $$
DECLARE
    consolidated_scores JSONB := '{}';
    source_record RECORD;
    category_scores JSONB;
    category TEXT;
    total_weight DECIMAL := 0;
    weighted_sum DECIMAL := 0;
BEGIN
    -- Initialize category scores
    FOR category IN SELECT unnest(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence'])
    LOOP
        total_weight := 0;
        weighted_sum := 0;
        
        -- Sum weighted scores from all data sources for this category
        FOR source_record IN 
            SELECT pds.data_weight, ar.scores
            FROM profile_data_sources pds
            JOIN assessment_results ar ON pds.assessment_result_id = ar.id
            WHERE pds.profile_id = calculate_consolidated_scores.profile_id
            AND pds.is_current = TRUE
        LOOP
            IF source_record.scores ? category THEN
                weighted_sum := weighted_sum + ((source_record.scores->>category)::DECIMAL * source_record.data_weight);
                total_weight := total_weight + source_record.data_weight;
            END IF;
        END LOOP;
        
        -- Calculate weighted average
        IF total_weight > 0 THEN
            consolidated_scores := consolidated_scores || jsonb_build_object(category, ROUND(weighted_sum / total_weight, 2));
        ELSE
            consolidated_scores := consolidated_scores || jsonb_build_object(category, 0);
        END IF;
    END LOOP;
    
    RETURN consolidated_scores;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to update consolidated profiles when assessment data changes
CREATE OR REPLACE FUNCTION update_consolidated_profile()
RETURNS TRIGGER AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Find the consolidated profile this assessment belongs to
    SELECT cp.id INTO profile_record
    FROM consolidated_profiles cp
    WHERE cp.child_name = COALESCE(NEW.child_name, OLD.child_name);
    
    -- If consolidated profile exists, update it
    IF FOUND THEN
        UPDATE consolidated_profiles 
        SET 
            consolidated_scores = calculate_consolidated_scores(profile_record.id),
            updated_at = NOW(),
            total_assessments = (
                SELECT COUNT(*) 
                FROM profile_data_sources pds 
                WHERE pds.profile_id = profile_record.id AND pds.is_current = TRUE
            ),
            parent_assessments = (
                SELECT COUNT(*) 
                FROM profile_data_sources pds 
                WHERE pds.profile_id = profile_record.id 
                AND pds.respondent_type = 'parent' AND pds.is_current = TRUE
            ),
            teacher_assessments = (
                SELECT COUNT(*) 
                FROM profile_data_sources pds 
                WHERE pds.profile_id = profile_record.id 
                AND pds.respondent_type = 'teacher' AND pds.is_current = TRUE
            )
        WHERE id = profile_record.id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
DROP TRIGGER IF EXISTS trigger_update_consolidated_profile ON assessment_results;
CREATE TRIGGER trigger_update_consolidated_profile
    AFTER INSERT OR UPDATE OR DELETE ON assessment_results
    FOR EACH ROW EXECUTE FUNCTION update_consolidated_profile();

-- 9. Create view for easy profile access with context
CREATE OR REPLACE VIEW profile_with_context AS
SELECT 
    cp.*,
    -- Data source summary
    json_agg(
        json_build_object(
            'quiz_type', pds.quiz_type,
            'respondent_type', pds.respondent_type,
            'contributed_at', pds.contributed_at,
            'confidence_contribution', pds.confidence_contribution,
            'is_current', pds.is_current
        )
    ) AS data_sources,
    
    -- Latest assessment dates
    MAX(CASE WHEN pds.respondent_type = 'parent' THEN pds.last_updated END) AS last_parent_assessment,
    MAX(CASE WHEN pds.respondent_type = 'teacher' THEN pds.last_updated END) AS last_teacher_assessment
    
FROM consolidated_profiles cp
LEFT JOIN profile_data_sources pds ON cp.id = pds.profile_id
GROUP BY cp.id;

-- Comments for documentation
COMMENT ON TABLE quiz_definitions IS 'Defines different types of quizzes (parent, teacher, student) with their specific question sets and configurations';
COMMENT ON TABLE profile_data_sources IS 'Tracks which assessments contribute to each consolidated profile';
COMMENT ON TABLE consolidated_profiles IS 'Single source of truth for student learning profiles, aggregating data from multiple quiz sources';
COMMENT ON FUNCTION calculate_consolidated_scores IS 'Calculates weighted average scores from multiple assessment sources';