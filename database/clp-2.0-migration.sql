-- CLP 2.0 Database Migration
-- Comprehensive migration to support multi-quiz progressive profile system
-- Run this migration to enable the CLP 2.0 features

BEGIN;

-- 1. Update assessment_results table to support CLP 2.0 features
DO $$ 
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'quiz_type') THEN
        ALTER TABLE assessment_results ADD COLUMN quiz_type VARCHAR(50) DEFAULT 'general';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'quiz_version') THEN
        ALTER TABLE assessment_results ADD COLUMN quiz_version VARCHAR(20) DEFAULT '2.0';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'respondent_type') THEN
        ALTER TABLE assessment_results ADD COLUMN respondent_type VARCHAR(20) DEFAULT 'parent';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'respondent_id') THEN
        ALTER TABLE assessment_results ADD COLUMN respondent_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'profile_completion_percentage') THEN
        ALTER TABLE assessment_results ADD COLUMN profile_completion_percentage DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'confidence_score') THEN
        ALTER TABLE assessment_results ADD COLUMN confidence_score DECIMAL(5,2) DEFAULT 50.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'precise_age_months') THEN
        ALTER TABLE assessment_results ADD COLUMN precise_age_months INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'birth_date') THEN
        ALTER TABLE assessment_results ADD COLUMN birth_date DATE;
    END IF;
END $$;

-- 2. Create quiz_definitions table for different quiz types
CREATE TABLE IF NOT EXISTS quiz_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_type VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_respondent VARCHAR(20) NOT NULL,
    
    -- Quiz configuration
    question_count INTEGER NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 5,
    age_groups TEXT[] DEFAULT ARRAY['3-4', '4-5', '5+'],
    
    -- Question mapping  
    question_ids INTEGER[] NOT NULL,
    question_order INTEGER[] NOT NULL,
    
    -- Context-specific settings
    context_intro_text TEXT,
    context_instructions TEXT,
    result_page_template VARCHAR(50) DEFAULT 'standard',
    
    -- Status and versioning
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '2.0',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create profile_data_sources table to track contributions
CREATE TABLE IF NOT EXISTS profile_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    quiz_type VARCHAR(50) NOT NULL,
    respondent_type VARCHAR(20) NOT NULL,
    respondent_id UUID,
    
    -- Data contribution tracking
    assessment_result_id UUID,
    data_weight DECIMAL(5,2) DEFAULT 1.00,
    confidence_contribution DECIMAL(5,2) DEFAULT 0.00,
    
    -- Temporal tracking
    contributed_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Data freshness
    expires_at TIMESTAMPTZ,
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
    precise_age_months INTEGER,
    birth_date DATE,
    
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
    home_recommendations JSONB,
    classroom_recommendations JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Privacy and sharing
    sharing_token VARCHAR(50) UNIQUE,
    is_public BOOLEAN DEFAULT FALSE,
    parent_consent BOOLEAN DEFAULT FALSE,
    teacher_access_granted BOOLEAN DEFAULT FALSE
);

-- 5. Insert initial quiz definitions for CLP 2.0
INSERT INTO quiz_definitions (quiz_type, name, description, target_respondent, question_count, question_ids, question_order, context_intro_text, result_page_template) VALUES
('parent_home', 'Parent Home Behavior Assessment', 'CLP 2.0 Assessment focusing on home behavior, learning preferences, and family interactions', 'parent', 15, 
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
 'Help us understand how your child learns and behaves at home. This CLP 2.0 assessment will give teachers valuable insights into your child''s learning style.',
 'parent_focused'),

('teacher_classroom', 'Teacher Classroom Assessment', 'CLP 2.0 Assessment focusing on classroom behavior, academic performance, and peer interactions', 'teacher', 12,
 ARRAY[16,17,18,19,20,21,22,23,24,25,26,27],
 ARRAY[16,17,18,19,20,21,22,23,24,25,26,27],
 'Share your observations about this student''s classroom behavior and learning patterns. This CLP 2.0 assessment will enhance their learning profile.',
 'teacher_focused'),

('general', 'General Learning Profile Assessment', 'Complete CLP 2.0 Assessment covering all 8 skills and 4 learning preferences', 'parent', 24,
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
 'Complete assessment to build your child''s comprehensive learning profile using the CLP 2.0 framework.',
 'standard')
ON CONFLICT (quiz_type) DO UPDATE SET
    question_count = EXCLUDED.question_count,
    question_ids = EXCLUDED.question_ids,
    question_order = EXCLUDED.question_order,
    updated_at = NOW();

-- 6. Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_results_quiz_type ON assessment_results(quiz_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_results_respondent ON assessment_results(respondent_type, respondent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_results_precise_age ON assessment_results(precise_age_months);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_data_sources_profile ON profile_data_sources(profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consolidated_profiles_sharing ON consolidated_profiles(sharing_token) WHERE sharing_token IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consolidated_profiles_child_name ON consolidated_profiles(LOWER(child_name));

-- 7. Create function to calculate consolidated scores
CREATE OR REPLACE FUNCTION calculate_consolidated_scores(profile_id UUID)
RETURNS JSONB AS $$
DECLARE
    consolidated_scores JSONB := '{}';
    source_record RECORD;
    category TEXT;
    total_weight DECIMAL := 0;
    weighted_sum DECIMAL := 0;
BEGIN
    -- Initialize category scores for CLP 2.0 (6Cs + Literacy + Math)
    FOR category IN SELECT unnest(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence', 'Literacy', 'Math'])
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

-- 8. Create function to determine CLP 2.0 personality labels
CREATE OR REPLACE FUNCTION determine_clp_personality(scores JSONB)
RETURNS TEXT AS $$
DECLARE
    top_categories TEXT[];
    personality_label TEXT;
    comm_score DECIMAL;
    collab_score DECIMAL;
    creative_score DECIMAL;
    critical_score DECIMAL;
    confidence_score DECIMAL;
    content_score DECIMAL;
BEGIN
    -- Extract individual scores
    comm_score := COALESCE((scores->>'Communication')::DECIMAL, 0);
    collab_score := COALESCE((scores->>'Collaboration')::DECIMAL, 0);
    creative_score := COALESCE((scores->>'Creative Innovation')::DECIMAL, 0);
    critical_score := COALESCE((scores->>'Critical Thinking')::DECIMAL, 0);
    confidence_score := COALESCE((scores->>'Confidence')::DECIMAL, 0);
    content_score := COALESCE((scores->>'Content')::DECIMAL, 0);
    
    -- CLP 2.0 personality mapping based on dominant traits
    IF comm_score >= 4.0 AND collab_score >= 4.0 THEN
        personality_label := 'Social Communicator';
    ELSIF creative_score >= 4.0 AND comm_score >= 4.0 THEN
        personality_label := 'Creative Storyteller';
    ELSIF creative_score >= 4.0 AND critical_score >= 4.0 THEN
        personality_label := 'Creative Problem Solver';
    ELSIF critical_score >= 4.0 AND content_score >= 4.0 THEN
        personality_label := 'Analytical Scholar';
    ELSIF confidence_score >= 4.0 AND comm_score >= 4.0 THEN
        personality_label := 'Confident Leader';
    ELSIF collab_score >= 4.0 AND creative_score >= 4.0 THEN
        personality_label := 'Creative Collaborator';
    ELSIF confidence_score >= 4.0 AND collab_score >= 4.0 THEN
        personality_label := 'Natural Leader';
    ELSIF creative_score >= 4.0 THEN
        personality_label := 'Creative Innovator';
    ELSIF comm_score >= 4.0 THEN
        personality_label := 'Strong Communicator';
    ELSIF critical_score >= 4.0 THEN
        personality_label := 'Critical Thinker';
    ELSE
        personality_label := 'Unique Learner';
    END IF;
    
    RETURN personality_label;
END;
$$ LANGUAGE plpgsql;

-- 9. Create CLP 2.0 age routing function
CREATE OR REPLACE FUNCTION get_age_group_from_months(age_months INTEGER)
RETURNS VARCHAR(10) AS $$
BEGIN
    CASE 
        WHEN age_months < 42 THEN RETURN '3-4'; -- Under 3.5 years
        WHEN age_months < 66 THEN RETURN '4-5'; -- 3.5 to 5.5 years  
        ELSE RETURN '5+'; -- 5.5+ years
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to calculate age in months from birth date
CREATE OR REPLACE FUNCTION calculate_age_months(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) * 12 + 
           EXTRACT(MONTH FROM AGE(CURRENT_DATE, birth_date));
END;
$$ LANGUAGE plpgsql;

-- 11. Create view for easy profile access with context
CREATE OR REPLACE VIEW profile_with_context AS
SELECT 
    cp.*,
    -- Data source summary
    COALESCE(
        json_agg(
            json_build_object(
                'quiz_type', pds.quiz_type,
                'respondent_type', pds.respondent_type,
                'contributed_at', pds.contributed_at,
                'confidence_contribution', pds.confidence_contribution,
                'is_current', pds.is_current
            )
        ) FILTER (WHERE pds.id IS NOT NULL),
        '[]'::json
    ) AS data_sources,
    
    -- Latest assessment dates
    MAX(CASE WHEN pds.respondent_type = 'parent' THEN pds.last_updated END) AS last_parent_assessment,
    MAX(CASE WHEN pds.respondent_type = 'teacher' THEN pds.last_updated END) AS last_teacher_assessment
    
FROM consolidated_profiles cp
LEFT JOIN profile_data_sources pds ON cp.id = pds.profile_id
GROUP BY cp.id;

-- 12. Add helpful comments
COMMENT ON TABLE quiz_definitions IS 'CLP 2.0 quiz definitions for different assessment types (parent, teacher, student)';
COMMENT ON TABLE profile_data_sources IS 'Tracks which assessments contribute to each consolidated profile in CLP 2.0';
COMMENT ON TABLE consolidated_profiles IS 'CLP 2.0 single source of truth for student learning profiles, aggregating data from multiple quiz sources';
COMMENT ON FUNCTION calculate_consolidated_scores IS 'CLP 2.0 function to calculate weighted average scores from multiple assessment sources';
COMMENT ON FUNCTION determine_clp_personality IS 'CLP 2.0 personality determination based on 8 skills framework';

-- 13. Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION calculate_consolidated_scores TO authenticated;
GRANT EXECUTE ON FUNCTION determine_clp_personality TO authenticated;
GRANT EXECUTE ON FUNCTION get_age_group_from_months TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_age_months TO authenticated;

COMMIT;

-- Success message
SELECT 'CLP 2.0 Database Migration Completed Successfully! 
New tables: quiz_definitions, profile_data_sources, consolidated_profiles
New functions: calculate_consolidated_scores, determine_clp_personality, get_age_group_from_months, calculate_age_months
Enhanced: assessment_results table with CLP 2.0 columns' AS migration_status;