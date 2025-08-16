-- CLP 2.0 Progressive Profile Functions
-- Advanced functions for handling multi-quiz progressive profile system

-- 1. Main RPC function for handling progressive profiles
CREATE OR REPLACE FUNCTION handle_clp_progressive_profile(
    p_child_name VARCHAR(100),
    p_age_group VARCHAR(10) DEFAULT '5+',
    p_precise_age_months INTEGER DEFAULT NULL,
    p_birth_date DATE DEFAULT NULL,
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
    v_calculated_age_months INTEGER;
    v_calculated_age_group VARCHAR(10);
    v_result JSONB;
BEGIN
    -- Calculate age-related fields
    IF p_birth_date IS NOT NULL THEN
        v_calculated_age_months := calculate_age_months(p_birth_date);
        v_calculated_age_group := get_age_group_from_months(v_calculated_age_months);
    ELSIF p_precise_age_months IS NOT NULL THEN
        v_calculated_age_months := p_precise_age_months;
        v_calculated_age_group := get_age_group_from_months(p_precise_age_months);
    ELSE
        v_calculated_age_months := NULL;
        v_calculated_age_group := p_age_group;
    END IF;

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
        quiz_version,
        respondent_type,
        respondent_id,
        precise_age_months,
        birth_date,
        profile_completion_percentage,
        confidence_score,
        email,
        birth_month,
        birth_year
    ) VALUES (
        p_child_name,
        COALESCE(v_calculated_age_months / 12, 0), -- Legacy age field
        v_calculated_age_group,
        p_grade,
        p_scores,
        p_personality_label,
        p_responses,
        p_quiz_type,
        '2.0', -- CLP 2.0 version
        p_respondent_type,
        p_respondent_id,
        v_calculated_age_months,
        p_birth_date,
        CASE 
            WHEN p_quiz_type = 'general' THEN 100.00
            WHEN p_quiz_type = 'parent_home' THEN 60.00
            WHEN p_quiz_type = 'teacher_classroom' THEN 70.00
            ELSE 50.00
        END,
        p_confidence_boost,
        '', -- Empty email for progressive profiles
        COALESCE(EXTRACT(MONTH FROM p_birth_date)::INTEGER, 1),
        COALESCE(EXTRACT(YEAR FROM p_birth_date)::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER)
    )
    RETURNING id INTO v_assessment_result_id;

    -- 2. Find existing consolidated profile or create new one
    IF p_existing_profile_id IS NOT NULL THEN
        v_consolidated_profile_id := p_existing_profile_id;
    ELSE
        -- Look for existing profile by child name (case-insensitive)
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
            precise_age_months,
            birth_date,
            consolidated_scores,
            personality_label,
            confidence_percentage,
            completeness_percentage,
            total_assessments,
            parent_assessments,
            teacher_assessments,
            sharing_token,
            primary_strengths,
            growth_opportunities,
            home_recommendations,
            classroom_recommendations
        ) VALUES (
            p_child_name,
            v_calculated_age_group,
            p_grade,
            v_calculated_age_months,
            p_birth_date,
            p_scores,
            determine_clp_personality(p_scores),
            p_confidence_boost,
            CASE 
                WHEN p_quiz_type = 'general' THEN 100.00
                WHEN p_quiz_type = 'parent_home' THEN 60.00
                WHEN p_quiz_type = 'teacher_classroom' THEN 70.00
                ELSE 50.00
            END,
            1,
            CASE WHEN p_respondent_type = 'parent' THEN 1 ELSE 0 END,
            CASE WHEN p_respondent_type = 'teacher' THEN 1 ELSE 0 END,
            SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 12),
            calculate_strengths_from_scores(p_scores),
            calculate_growth_areas_from_scores(p_scores),
            CASE WHEN p_respondent_type = 'parent' THEN generate_home_recommendations(p_scores) ELSE NULL END,
            CASE WHEN p_respondent_type = 'teacher' THEN generate_classroom_recommendations(p_scores) ELSE NULL END
        )
        RETURNING id INTO v_consolidated_profile_id;
        
        v_consolidated_scores := p_scores;
        v_new_confidence := p_confidence_boost;
        v_new_completeness := CASE 
            WHEN p_quiz_type = 'general' THEN 100.00
            WHEN p_quiz_type = 'parent_home' THEN 60.00
            WHEN p_quiz_type = 'teacher_classroom' THEN 70.00
            ELSE 50.00
        END;
        v_total_assessments := 1;
        v_parent_assessments := CASE WHEN p_respondent_type = 'parent' THEN 1 ELSE 0 END;
        v_teacher_assessments := CASE WHEN p_respondent_type = 'teacher' THEN 1 ELSE 0 END;
    ELSE
        -- Update existing consolidated profile
        v_is_new_profile := FALSE;
        
        -- Get current values
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
        
        -- Calculate new consolidated scores using the function
        v_consolidated_scores := calculate_consolidated_scores(v_consolidated_profile_id);
        
        -- Calculate updated confidence and completeness
        v_new_confidence := LEAST(100.00, v_new_confidence + (p_confidence_boost * 0.6)); -- Diminishing returns
        v_new_completeness := LEAST(100.00, v_new_completeness + 
            CASE 
                WHEN p_respondent_type = 'parent' AND v_parent_assessments = 0 THEN 40.00
                WHEN p_respondent_type = 'teacher' AND v_teacher_assessments = 0 THEN 30.00
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
            personality_label = determine_clp_personality(v_consolidated_scores),
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
            classroom_recommendations = CASE WHEN p_respondent_type = 'teacher' THEN generate_classroom_recommendations(v_consolidated_scores) ELSE classroom_recommendations END,
            -- Update age info if provided
            precise_age_months = COALESCE(v_calculated_age_months, precise_age_months),
            birth_date = COALESCE(p_birth_date, birth_date),
            age_group = COALESCE(v_calculated_age_group, age_group)
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
        'personality_label', determine_clp_personality(v_consolidated_scores),
        'confidence_percentage', v_new_confidence,
        'completeness_percentage', v_new_completeness,
        'total_assessments', v_total_assessments,
        'parent_assessments', v_parent_assessments,
        'teacher_assessments', v_teacher_assessments,
        'age_group', v_calculated_age_group,
        'precise_age_months', v_calculated_age_months,
        'sharing_token', (SELECT sharing_token FROM consolidated_profiles WHERE id = v_consolidated_profile_id)
    );
    
    -- Add previous assessments info if not new profile
    IF NOT v_is_new_profile THEN
        v_result := v_result || jsonb_build_object(
            'previous_assessments', (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'quiz_type', quiz_type,
                        'respondent_type', respondent_type,
                        'contributed_at', contributed_at,
                        'is_current', is_current
                    )
                ), '[]'::jsonb)
                FROM profile_data_sources
                WHERE profile_id = v_consolidated_profile_id
                ORDER BY contributed_at DESC
            )
        );
    END IF;

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in handle_clp_progressive_profile: % %', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql;

-- 2. Helper function to calculate strengths from CLP 2.0 scores
CREATE OR REPLACE FUNCTION calculate_strengths_from_scores(scores JSONB)
RETURNS TEXT[] AS $$
DECLARE
    strengths TEXT[] := '{}';
    category TEXT;
    score DECIMAL;
BEGIN
    -- Check all CLP 2.0 categories
    FOR category IN SELECT unnest(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence', 'Literacy', 'Math'])
    LOOP
        IF scores ? category THEN
            score := (scores->>category)::DECIMAL;
            IF score >= 4.0 THEN
                strengths := strengths || ARRAY[category];
            END IF;
        END IF;
    END LOOP;
    
    -- If no clear strengths, return top 2 categories
    IF array_length(strengths, 1) IS NULL OR array_length(strengths, 1) = 0 THEN
        SELECT ARRAY_AGG(category ORDER BY (scores->>category)::DECIMAL DESC LIMIT 2)
        INTO strengths
        FROM jsonb_object_keys(scores) AS category
        WHERE category = ANY(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence', 'Literacy', 'Math']);
    END IF;
    
    RETURN COALESCE(strengths, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- 3. Helper function to calculate growth areas from CLP 2.0 scores
CREATE OR REPLACE FUNCTION calculate_growth_areas_from_scores(scores JSONB)
RETURNS TEXT[] AS $$
DECLARE
    growth_areas TEXT[] := '{}';
    category TEXT;
    score DECIMAL;
BEGIN
    -- Check all CLP 2.0 categories
    FOR category IN SELECT unnest(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence', 'Literacy', 'Math'])
    LOOP
        IF scores ? category THEN
            score := (scores->>category)::DECIMAL;
            IF score < 3.0 THEN
                growth_areas := growth_areas || ARRAY[category];
            END IF;
        END IF;
    END LOOP;
    
    -- If no clear growth areas, return bottom 2 categories
    IF array_length(growth_areas, 1) IS NULL OR array_length(growth_areas, 1) = 0 THEN
        SELECT ARRAY_AGG(category ORDER BY (scores->>category)::DECIMAL ASC LIMIT 2)
        INTO growth_areas
        FROM jsonb_object_keys(scores) AS category
        WHERE category = ANY(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence', 'Literacy', 'Math']);
    END IF;
    
    RETURN COALESCE(growth_areas, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- 4. Helper function to generate CLP 2.0 home recommendations
CREATE OR REPLACE FUNCTION generate_home_recommendations(scores JSONB)
RETURNS JSONB AS $$
DECLARE
    recommendations JSONB := '{}';
    top_strength TEXT;
    growth_area TEXT;
    literacy_score DECIMAL;
    math_score DECIMAL;
BEGIN
    -- Get top strength from 6Cs
    SELECT category INTO top_strength
    FROM jsonb_object_keys(scores) AS category
    WHERE category = ANY(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence'])
    ORDER BY (scores->>category)::DECIMAL DESC
    LIMIT 1;
    
    -- Get primary growth area from 6Cs
    SELECT category INTO growth_area
    FROM jsonb_object_keys(scores) AS category
    WHERE category = ANY(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence'])
    ORDER BY (scores->>category)::DECIMAL ASC
    LIMIT 1;
    
    -- Get academic scores
    literacy_score := COALESCE((scores->>'Literacy')::DECIMAL, 3.0);
    math_score := COALESCE((scores->>'Math')::DECIMAL, 3.0);
    
    -- Generate CLP 2.0 context-specific recommendations
    recommendations := jsonb_build_object(
        'daily_activities', ARRAY[
            'Create consistent learning routines that leverage their ' || COALESCE(top_strength, 'unique') || ' strengths',
            'Provide opportunities to practice ' || COALESCE(growth_area, 'various') || ' skills in low-pressure settings',
            CASE 
                WHEN literacy_score < 3.0 THEN 'Focus on daily reading activities and storytelling'
                WHEN math_score < 3.0 THEN 'Incorporate counting and number games into daily activities'
                ELSE 'Use their interests to make learning engaging and relevant'
            END
        ],
        'communication_tips', ARRAY[
            'Share specific examples of their learning progress with teachers',
            'Ask open-ended questions about their school day',
            'Celebrate effort and growth, not just achievements',
            'Use the CLP 2.0 insights to communicate with educators'
        ],
        'environment_setup', ARRAY[
            'Design learning spaces that minimize distractions',
            'Have materials readily available for hands-on exploration',
            'Create quiet zones for focused work when needed',
            CASE 
                WHEN literacy_score >= 4.0 THEN 'Provide rich reading materials and writing tools'
                WHEN math_score >= 4.0 THEN 'Include manipulatives and counting games'
                ELSE 'Adapt environment to support their learning style'
            END
        ],
        'academic_support', CASE
            WHEN literacy_score < 3.0 AND math_score < 3.0 THEN 
                jsonb_build_object('priority', 'both_academics', 'focus', 'Balanced literacy and numeracy support')
            WHEN literacy_score < 3.0 THEN
                jsonb_build_object('priority', 'literacy', 'focus', 'Reading comprehension and writing skills')
            WHEN math_score < 3.0 THEN
                jsonb_build_object('priority', 'math', 'focus', 'Number sense and mathematical reasoning')
            ELSE
                jsonb_build_object('priority', 'enrichment', 'focus', 'Advanced learning opportunities')
        END
    );
    
    RETURN recommendations;
END;
$$ LANGUAGE plpgsql;

-- 5. Helper function to generate CLP 2.0 classroom recommendations
CREATE OR REPLACE FUNCTION generate_classroom_recommendations(scores JSONB)
RETURNS JSONB AS $$
DECLARE
    recommendations JSONB := '{}';
    top_strength TEXT;
    growth_area TEXT;
    literacy_score DECIMAL;
    math_score DECIMAL;
BEGIN
    -- Get top strength from 6Cs
    SELECT category INTO top_strength
    FROM jsonb_object_keys(scores) AS category
    WHERE category = ANY(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence'])
    ORDER BY (scores->>category)::DECIMAL DESC
    LIMIT 1;
    
    -- Get primary growth area from 6Cs
    SELECT category INTO growth_area
    FROM jsonb_object_keys(scores) AS category
    WHERE category = ANY(ARRAY['Communication', 'Collaboration', 'Content', 'Critical Thinking', 'Creative Innovation', 'Confidence'])
    ORDER BY (scores->>category)::DECIMAL ASC
    LIMIT 1;
    
    -- Get academic scores
    literacy_score := COALESCE((scores->>'Literacy')::DECIMAL, 3.0);
    math_score := COALESCE((scores->>'Math')::DECIMAL, 3.0);
    
    -- Generate professional CLP 2.0 teaching recommendations
    recommendations := jsonb_build_object(
        'instructional_strategies', ARRAY[
            'Incorporate ' || COALESCE(top_strength, 'strength-based') || ' activities into lesson plans',
            'Provide scaffolding and support for ' || COALESCE(growth_area, 'developing') || ' skills',
            'Use multiple modalities to present new concepts',
            CASE 
                WHEN literacy_score < 3.0 THEN 'Implement targeted literacy interventions and phonics support'
                WHEN math_score < 3.0 THEN 'Use concrete manipulatives and visual math representations'
                ELSE 'Provide enrichment opportunities in academic strengths'
            END
        ],
        'classroom_management', ARRAY[
            'Consider seating arrangements that support their learning style',
            'Provide choice in how they demonstrate understanding',
            'Use their strengths to support peer learning',
            'Implement CLP 2.0 insights for personalized approaches'
        ],
        'assessment_approaches', ARRAY[
            'Offer multiple ways to show learning beyond traditional tests',
            'Include formative assessments to track growth over time',
            'Celebrate progress in their growth areas',
            'Use CLP 2.0 framework for comprehensive evaluation'
        ],
        'academic_interventions', CASE
            WHEN literacy_score < 3.0 AND math_score < 3.0 THEN 
                jsonb_build_object('priority', 'multi_academic', 'strategies', ARRAY['Small group instruction', 'Integrated literacy-math activities', 'Progress monitoring'])
            WHEN literacy_score < 3.0 THEN
                jsonb_build_object('priority', 'literacy_focus', 'strategies', ARRAY['Guided reading', 'Phonics intervention', 'Writing support'])
            WHEN math_score < 3.0 THEN
                jsonb_build_object('priority', 'math_focus', 'strategies', ARRAY['Concrete manipulatives', 'Visual problem solving', 'Number sense activities'])
            ELSE
                jsonb_build_object('priority', 'enrichment', 'strategies', ARRAY['Advanced projects', 'Peer tutoring opportunities', 'Independent research'])
        END
    );
    
    RETURN recommendations;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant appropriate permissions
GRANT EXECUTE ON FUNCTION handle_clp_progressive_profile TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_strengths_from_scores TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_growth_areas_from_scores TO authenticated;
GRANT EXECUTE ON FUNCTION generate_home_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION generate_classroom_recommendations TO authenticated;

-- 7. Add helpful comments
COMMENT ON FUNCTION handle_clp_progressive_profile IS 'CLP 2.0 main function for creating and updating progressive learning profiles with multiple data sources';
COMMENT ON FUNCTION calculate_strengths_from_scores IS 'CLP 2.0 function to identify strengths from 8-skill assessment scores';
COMMENT ON FUNCTION calculate_growth_areas_from_scores IS 'CLP 2.0 function to identify growth areas from 8-skill assessment scores';
COMMENT ON FUNCTION generate_home_recommendations IS 'CLP 2.0 function to generate personalized home learning recommendations';
COMMENT ON FUNCTION generate_classroom_recommendations IS 'CLP 2.0 function to generate personalized classroom teaching recommendations';