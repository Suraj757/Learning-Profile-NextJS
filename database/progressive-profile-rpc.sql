-- RPC Function for handling progressive profile creation and updates
-- This function handles the complex logic of managing multiple assessments per child

CREATE OR REPLACE FUNCTION handle_progressive_profile(
    p_child_name VARCHAR(100),
    p_age_group VARCHAR(10) DEFAULT '5+',
    p_grade VARCHAR(50) DEFAULT NULL,
    p_quiz_type VARCHAR(50) DEFAULT 'general',
    p_respondent_type VARCHAR(20) DEFAULT 'parent',
    p_respondent_id UUID DEFAULT NULL,
    p_respondent_name VARCHAR(100) DEFAULT NULL,
    p_responses JSONB DEFAULT '{}',
    p_scores JSONB DEFAULT '{}',
    p_personality_label VARCHAR(100) DEFAULT 'Unique Learner',
    p_existing_profile_id UUID DEFAULT NULL,
    p_contribution_weight DECIMAL(5,2) DEFAULT 1.00,
    p_confidence_boost DECIMAL(5,2) DEFAULT 30.00,
    p_school_context JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_consolidated_profile_id UUID;
    v_assessment_result_id UUID;
    v_is_new_profile BOOLEAN := FALSE;
    v_consolidated_scores JSONB;
    v_new_confidence DECIMAL(5,2);
    v_new_completeness DECIMAL(5,2);
    v_total_assessments INTEGER;
    v_parent_assessments INTEGER;
    v_teacher_assessments INTEGER;
    v_result JSONB;
BEGIN
    -- 1. Create the individual assessment result
    INSERT INTO assessment_results (
        child_name,
        age,
        age_group,
        grade_level,
        scores,
        personality_label,
        raw_responses,
        quiz_type,
        respondent_type,
        respondent_id,
        email,
        birth_month,
        birth_year
    ) VALUES (
        p_child_name,
        0, -- Legacy field
        p_age_group,
        p_grade,
        p_scores,
        p_personality_label,
        p_responses,
        p_quiz_type,
        p_respondent_type,
        p_respondent_id,
        '', -- Empty email for progressive profiles
        1,  -- Default birth month
        EXTRACT(YEAR FROM NOW())::INTEGER
    )
    RETURNING id INTO v_assessment_result_id;

    -- 2. Find existing consolidated profile or create new one
    IF p_existing_profile_id IS NOT NULL THEN
        -- Use provided profile ID
        v_consolidated_profile_id := p_existing_profile_id;
    ELSE
        -- Look for existing profile by child name
        SELECT id INTO v_consolidated_profile_id
        FROM consolidated_profiles
        WHERE LOWER(TRIM(child_name)) = LOWER(TRIM(p_child_name))
        LIMIT 1;
    END IF;

    IF v_consolidated_profile_id IS NULL THEN
        -- Create new consolidated profile
        v_is_new_profile := TRUE;
        
        INSERT INTO consolidated_profiles (
            child_name,
            age_group,
            grade_level,
            consolidated_scores,
            personality_label,
            confidence_percentage,
            completeness_percentage,
            total_assessments,
            parent_assessments,
            teacher_assessments,
            sharing_token,
            primary_strengths,
            growth_opportunities
        ) VALUES (
            p_child_name,
            p_age_group,
            p_grade,
            p_scores,
            p_personality_label,
            p_confidence_boost,
            CASE 
                WHEN p_quiz_type = 'general' THEN 100.00
                ELSE 33.33
            END,
            1,
            CASE WHEN p_respondent_type = 'parent' THEN 1 ELSE 0 END,
            CASE WHEN p_respondent_type = 'teacher' THEN 1 ELSE 0 END,
            SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 12),
            calculate_strengths_from_scores(p_scores),
            calculate_growth_areas_from_scores(p_scores)
        )
        RETURNING id INTO v_consolidated_profile_id;
        
        v_consolidated_scores := p_scores;
        v_new_confidence := p_confidence_boost;
        v_new_completeness := CASE WHEN p_quiz_type = 'general' THEN 100.00 ELSE 33.33 END;
        v_total_assessments := 1;
        v_parent_assessments := CASE WHEN p_respondent_type = 'parent' THEN 1 ELSE 0 END;
        v_teacher_assessments := CASE WHEN p_respondent_type = 'teacher' THEN 1 ELSE 0 END;
    ELSE
        -- Update existing consolidated profile
        v_is_new_profile := FALSE;
        
        -- Calculate new consolidated scores
        v_consolidated_scores := calculate_consolidated_scores(v_consolidated_profile_id);
        
        -- Get current values for updating
        SELECT 
            confidence_percentage,
            completeness_percentage,
            total_assessments,
            parent_assessments,
            teacher_assessments
        INTO 
            v_new_confidence,
            v_new_completeness,
            v_total_assessments,
            v_parent_assessments,
            v_teacher_assessments
        FROM consolidated_profiles
        WHERE id = v_consolidated_profile_id;
        
        -- Calculate new values
        v_new_confidence := LEAST(100.00, v_new_confidence + (p_confidence_boost * 0.5)); -- Diminishing returns
        v_new_completeness := LEAST(100.00, v_new_completeness + 
            CASE 
                WHEN p_respondent_type = 'parent' AND v_parent_assessments = 0 THEN 30.00
                WHEN p_respondent_type = 'teacher' AND v_teacher_assessments = 0 THEN 35.00
                ELSE 15.00
            END
        );
        v_total_assessments := v_total_assessments + 1;
        v_parent_assessments := v_parent_assessments + CASE WHEN p_respondent_type = 'parent' THEN 1 ELSE 0 END;
        v_teacher_assessments := v_teacher_assessments + CASE WHEN p_respondent_type = 'teacher' THEN 1 ELSE 0 END;
        
        -- Update consolidated profile
        UPDATE consolidated_profiles
        SET
            consolidated_scores = v_consolidated_scores,
            personality_label = determine_consolidated_personality(v_consolidated_scores),
            confidence_percentage = v_new_confidence,
            completeness_percentage = v_new_completeness,
            total_assessments = v_total_assessments,
            parent_assessments = v_parent_assessments,
            teacher_assessments = v_teacher_assessments,
            updated_at = NOW(),
            last_parent_update = CASE WHEN p_respondent_type = 'parent' THEN NOW() ELSE last_parent_update END,
            last_teacher_update = CASE WHEN p_respondent_type = 'teacher' THEN NOW() ELSE last_teacher_update END,
            primary_strengths = calculate_strengths_from_scores(v_consolidated_scores),
            growth_opportunities = calculate_growth_areas_from_scores(v_consolidated_scores),
            home_recommendations = CASE WHEN p_respondent_type = 'parent' THEN generate_home_recommendations(v_consolidated_scores) ELSE home_recommendations END,
            classroom_recommendations = CASE WHEN p_respondent_type = 'teacher' THEN generate_classroom_recommendations(v_consolidated_scores) ELSE classroom_recommendations END
        WHERE id = v_consolidated_profile_id;
    END IF;

    -- 3. Record the data source contribution
    INSERT INTO profile_data_sources (
        profile_id,
        quiz_type,
        respondent_type,
        respondent_id,
        assessment_result_id,
        data_weight,
        confidence_contribution,
        contributed_at,
        last_updated
    ) VALUES (
        v_consolidated_profile_id,
        p_quiz_type,
        p_respondent_type,
        p_respondent_id,
        v_assessment_result_id,
        p_contribution_weight,
        p_confidence_boost,
        NOW(),
        NOW()
    )
    ON CONFLICT (profile_id, quiz_type, respondent_type, respondent_id)
    DO UPDATE SET
        assessment_result_id = EXCLUDED.assessment_result_id,
        data_weight = EXCLUDED.data_weight,
        confidence_contribution = EXCLUDED.confidence_contribution,
        last_updated = NOW(),
        is_current = TRUE;

    -- 4. Prepare return data
    v_result := jsonb_build_object(
        'profile_id', v_consolidated_profile_id,
        'assessment_result_id', v_assessment_result_id,
        'is_new_profile', v_is_new_profile,
        'consolidated_scores', v_consolidated_scores,
        'personality_label', determine_consolidated_personality(v_consolidated_scores),
        'confidence_percentage', v_new_confidence,
        'completeness_percentage', v_new_completeness,
        'total_assessments', v_total_assessments,
        'parent_assessments', v_parent_assessments,
        'teacher_assessments', v_teacher_assessments
    );
    
    -- Add previous assessments info if not new profile
    IF NOT v_is_new_profile THEN
        v_result := v_result || jsonb_build_object(
            'previous_assessments', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'quiz_type', quiz_type,
                        'respondent_type', respondent_type,
                        'contributed_at', contributed_at,
                        'is_current', is_current
                    )
                )
                FROM profile_data_sources
                WHERE profile_id = v_consolidated_profile_id
                ORDER BY contributed_at DESC
            )
        );
    END IF;

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in handle_progressive_profile: % %', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql;

-- Helper function to calculate strengths from scores
CREATE OR REPLACE FUNCTION calculate_strengths_from_scores(scores JSONB)
RETURNS TEXT[] AS $$
DECLARE
    strengths TEXT[] := '{}';
    category TEXT;
    score DECIMAL;
BEGIN
    FOR category IN SELECT * FROM jsonb_object_keys(scores)
    LOOP
        score := (scores->>category)::DECIMAL;
        IF score >= 4.0 THEN
            strengths := strengths || ARRAY[category];
        END IF;
    END LOOP;
    
    -- If no clear strengths, return top 2 categories
    IF array_length(strengths, 1) IS NULL OR array_length(strengths, 1) = 0 THEN
        SELECT ARRAY_AGG(category ORDER BY (scores->>category)::DECIMAL DESC LIMIT 2)
        INTO strengths
        FROM jsonb_object_keys(scores) AS category
        WHERE category IN ('Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence');
    END IF;
    
    RETURN strengths;
END;
$$ LANGUAGE plpgsql;

-- Helper function to calculate growth areas from scores
CREATE OR REPLACE FUNCTION calculate_growth_areas_from_scores(scores JSONB)
RETURNS TEXT[] AS $$
DECLARE
    growth_areas TEXT[] := '{}';
    category TEXT;
    score DECIMAL;
BEGIN
    FOR category IN SELECT * FROM jsonb_object_keys(scores)
    LOOP
        score := (scores->>category)::DECIMAL;
        IF score < 3.0 THEN
            growth_areas := growth_areas || ARRAY[category];
        END IF;
    END LOOP;
    
    -- If no clear growth areas, return bottom 2 categories
    IF array_length(growth_areas, 1) IS NULL OR array_length(growth_areas, 1) = 0 THEN
        SELECT ARRAY_AGG(category ORDER BY (scores->>category)::DECIMAL ASC LIMIT 2)
        INTO growth_areas
        FROM jsonb_object_keys(scores) AS category
        WHERE category IN ('Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence');
    END IF;
    
    RETURN growth_areas;
END;
$$ LANGUAGE plpgsql;

-- Helper function to determine personality from consolidated scores
CREATE OR REPLACE FUNCTION determine_consolidated_personality(scores JSONB)
RETURNS TEXT AS $$
DECLARE
    top_categories TEXT[];
    personality_label TEXT;
BEGIN
    -- Get top 2 categories
    SELECT ARRAY_AGG(category ORDER BY score DESC LIMIT 2)
    INTO top_categories
    FROM (
        SELECT category, (scores->>category)::DECIMAL as score
        FROM jsonb_object_keys(scores) AS category
        WHERE category IN ('Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence')
    ) ranked_scores;
    
    -- Map combinations to personality labels
    personality_label := CASE
        WHEN top_categories @> ARRAY['Communication', 'Collaboration'] OR top_categories @> ARRAY['Collaboration', 'Communication'] THEN 'Social Communicator'
        WHEN top_categories @> ARRAY['Communication', 'Creative Innovation'] OR top_categories @> ARRAY['Creative Innovation', 'Communication'] THEN 'Creative Storyteller'
        WHEN top_categories @> ARRAY['Collaboration', 'Creative Innovation'] OR top_categories @> ARRAY['Creative Innovation', 'Collaboration'] THEN 'Creative Collaborator'
        WHEN top_categories @> ARRAY['Content', 'Critical Thinking'] OR top_categories @> ARRAY['Critical Thinking', 'Content'] THEN 'Analytical Scholar'
        WHEN top_categories @> ARRAY['Creative Innovation', 'Critical Thinking'] OR top_categories @> ARRAY['Critical Thinking', 'Creative Innovation'] THEN 'Creative Problem Solver'
        WHEN top_categories @> ARRAY['Confidence', 'Communication'] OR top_categories @> ARRAY['Communication', 'Confidence'] THEN 'Confident Leader'
        WHEN top_categories @> ARRAY['Collaboration', 'Confidence'] OR top_categories @> ARRAY['Confidence', 'Collaboration'] THEN 'Natural Leader'
        ELSE 'Unique Learner'
    END;
    
    RETURN personality_label;
END;
$$ LANGUAGE plpgsql;

-- Helper function to generate home recommendations
CREATE OR REPLACE FUNCTION generate_home_recommendations(scores JSONB)
RETURNS JSONB AS $$
DECLARE
    recommendations JSONB := '{}';
    top_strength TEXT;
    growth_area TEXT;
BEGIN
    -- Get top strength
    SELECT category INTO top_strength
    FROM jsonb_object_keys(scores) AS category
    WHERE category IN ('Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence')
    ORDER BY (scores->>category)::DECIMAL DESC
    LIMIT 1;
    
    -- Get primary growth area
    SELECT category INTO growth_area
    FROM jsonb_object_keys(scores) AS category
    WHERE category IN ('Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence')
    ORDER BY (scores->>category)::DECIMAL ASC
    LIMIT 1;
    
    -- Generate context-specific recommendations
    recommendations := jsonb_build_object(
        'daily_activities', ARRAY[
            'Create consistent learning routines that leverage their ' || top_strength || ' strengths',
            'Provide opportunities to practice ' || growth_area || ' skills in low-pressure settings',
            'Use their interests to make learning engaging and relevant'
        ],
        'communication_tips', ARRAY[
            'Share specific examples of their learning progress with teachers',
            'Ask open-ended questions about their school day',
            'Celebrate effort and growth, not just achievements'
        ],
        'environment_setup', ARRAY[
            'Design learning spaces that minimize distractions',
            'Have materials readily available for hands-on exploration',
            'Create quiet zones for focused work when needed'
        ]
    );
    
    RETURN recommendations;
END;
$$ LANGUAGE plpgsql;

-- Helper function to generate classroom recommendations
CREATE OR REPLACE FUNCTION generate_classroom_recommendations(scores JSONB)
RETURNS JSONB AS $$
DECLARE
    recommendations JSONB := '{}';
    top_strength TEXT;
    growth_area TEXT;
BEGIN
    -- Get top strength
    SELECT category INTO top_strength
    FROM jsonb_object_keys(scores) AS category
    WHERE category IN ('Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence')
    ORDER BY (scores->>category)::DECIMAL DESC
    LIMIT 1;
    
    -- Get primary growth area
    SELECT category INTO growth_area
    FROM jsonb_object_keys(scores) AS category
    WHERE category IN ('Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence')
    ORDER BY (scores->>category)::DECIMAL ASC
    LIMIT 1;
    
    -- Generate professional teaching recommendations
    recommendations := jsonb_build_object(
        'instructional_strategies', ARRAY[
            'Incorporate ' || top_strength || '-based activities into lesson plans',
            'Provide scaffolding and support for ' || growth_area || ' development',
            'Use multiple modalities to present new concepts'
        ],
        'classroom_management', ARRAY[
            'Consider seating arrangements that support their learning style',
            'Provide choice in how they demonstrate understanding',
            'Use their strengths to support peer learning'
        ],
        'assessment_approaches', ARRAY[
            'Offer multiple ways to show learning beyond traditional tests',
            'Include formative assessments to track growth over time',
            'Celebrate progress in their growth areas'
        ]
    );
    
    RETURN recommendations;
END;
$$ LANGUAGE plpgsql;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION handle_progressive_profile TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_consolidated_scores TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_strengths_from_scores TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_growth_areas_from_scores TO authenticated;
GRANT EXECUTE ON FUNCTION determine_consolidated_personality TO authenticated;
GRANT EXECUTE ON FUNCTION generate_home_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION generate_classroom_recommendations TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION handle_progressive_profile IS 'Main function for creating and updating progressive learning profiles with multiple data sources';
COMMENT ON FUNCTION calculate_consolidated_scores IS 'Calculates weighted average scores from all contributing assessments';
COMMENT ON FUNCTION determine_consolidated_personality IS 'Determines personality label based on top scoring categories in consolidated scores';