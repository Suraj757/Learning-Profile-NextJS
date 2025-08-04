-- Enhanced Database Schema for Day 1 Success Kit
-- Comprehensive classroom analytics, risk assessment, and optimization features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced student profiles table (extends existing profiles)
CREATE TABLE IF NOT EXISTS enhanced_student_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL,
    
    -- 6C Scores breakdown
    communication_score INTEGER NOT NULL CHECK (communication_score >= 1 AND communication_score <= 5),
    collaboration_score INTEGER NOT NULL CHECK (collaboration_score >= 1 AND collaboration_score <= 5),
    content_score INTEGER NOT NULL CHECK (content_score >= 1 AND content_score <= 5),
    critical_thinking_score INTEGER NOT NULL CHECK (critical_thinking_score >= 1 AND critical_thinking_score <= 5),
    creative_innovation_score INTEGER NOT NULL CHECK (creative_innovation_score >= 1 AND creative_innovation_score <= 5),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 1 AND confidence_score <= 5),
    
    -- Engagement and behavior metrics
    engagement_level INTEGER NOT NULL DEFAULT 3 CHECK (engagement_level >= 1 AND engagement_level <= 5),
    participation_frequency INTEGER NOT NULL DEFAULT 3 CHECK (participation_frequency >= 1 AND participation_frequency <= 5),
    peer_interaction_quality INTEGER NOT NULL DEFAULT 3 CHECK (peer_interaction_quality >= 1 AND peer_interaction_quality <= 5),
    
    -- Seating preferences (JSONB for flexibility)
    seating_preferences JSONB NOT NULL DEFAULT '{}',
    
    -- Teaching style compatibility
    teaching_compatibility JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    last_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enhanced_profiles_classroom ON enhanced_student_profiles(classroom_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_profiles_profile ON enhanced_student_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_profiles_engagement ON enhanced_student_profiles(engagement_level);

-- Risk factors table
CREATE TABLE IF NOT EXISTS student_risk_factors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_profile_id UUID REFERENCES enhanced_student_profiles(id) ON DELETE CASCADE,
    
    risk_type TEXT NOT NULL CHECK (risk_type IN ('learning_style_mismatch', 'low_engagement', 'social_isolation', 'academic_struggle')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    description TEXT NOT NULL,
    indicators JSONB NOT NULL DEFAULT '[]',
    intervention_strategies JSONB NOT NULL DEFAULT '[]',
    timeline TEXT NOT NULL CHECK (timeline IN ('immediate', 'short_term', 'ongoing')),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
    identified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_review_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_factors_student ON student_risk_factors(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_risk_factors_severity ON student_risk_factors(severity);
CREATE INDEX IF NOT EXISTS idx_risk_factors_status ON student_risk_factors(status);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_profile_id UUID REFERENCES enhanced_student_profiles(id) ON DELETE CASCADE,
    
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('six_c_score', 'engagement', 'behavior', 'academic')),
    metric_name TEXT NOT NULL,
    value DECIMAL(5,2) NOT NULL,
    max_value DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    notes TEXT,
    context TEXT,
    
    recorded_by TEXT, -- teacher, system, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON student_progress(date_recorded);
CREATE INDEX IF NOT EXISTS idx_progress_metric ON student_progress(metric_type, metric_name);

-- Parent insights table
CREATE TABLE IF NOT EXISTS parent_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_profile_id UUID REFERENCES enhanced_student_profiles(id) ON DELETE CASCADE,
    
    category TEXT NOT NULL CHECK (category IN ('home_behavior', 'learning_preferences', 'challenges', 'strengths')),
    insight TEXT NOT NULL,
    relevance_score INTEGER NOT NULL DEFAULT 5 CHECK (relevance_score >= 1 AND relevance_score <= 10),
    communication_strategies JSONB NOT NULL DEFAULT '[]',
    talking_points JSONB NOT NULL DEFAULT '[]',
    
    source TEXT DEFAULT 'assessment', -- assessment, parent_survey, conference, etc.
    confidence_level INTEGER DEFAULT 8 CHECK (confidence_level >= 1 AND confidence_level <= 10),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_insights_student ON parent_insights(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_parent_insights_category ON parent_insights(category);
CREATE INDEX IF NOT EXISTS idx_parent_insights_relevance ON parent_insights(relevance_score);

-- Classroom analytics table
CREATE TABLE IF NOT EXISTS classroom_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    classroom_id UUID NOT NULL,
    analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Student distribution
    total_students INTEGER NOT NULL DEFAULT 0,
    creative_count INTEGER NOT NULL DEFAULT 0,
    analytical_count INTEGER NOT NULL DEFAULT 0,
    collaborative_count INTEGER NOT NULL DEFAULT 0,
    confident_count INTEGER NOT NULL DEFAULT 0,
    
    -- Average scores
    avg_communication DECIMAL(3,2) NOT NULL DEFAULT 0,
    avg_collaboration DECIMAL(3,2) NOT NULL DEFAULT 0,
    avg_content DECIMAL(3,2) NOT NULL DEFAULT 0,
    avg_critical_thinking DECIMAL(3,2) NOT NULL DEFAULT 0,
    avg_creative_innovation DECIMAL(3,2) NOT NULL DEFAULT 0,
    avg_confidence DECIMAL(3,2) NOT NULL DEFAULT 0,
    
    -- Risk summary
    high_risk_count INTEGER NOT NULL DEFAULT 0,
    medium_risk_count INTEGER NOT NULL DEFAULT 0,
    low_risk_count INTEGER NOT NULL DEFAULT 0,
    
    -- Engagement metrics
    overall_engagement DECIMAL(3,2) NOT NULL DEFAULT 0,
    participation_rate DECIMAL(3,2) NOT NULL DEFAULT 0,
    
    -- Teaching compatibility
    high_compatibility_count INTEGER NOT NULL DEFAULT 0,
    medium_compatibility_count INTEGER NOT NULL DEFAULT 0,
    low_compatibility_count INTEGER NOT NULL DEFAULT 0,
    
    teaching_recommendations JSONB NOT NULL DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classroom_analytics_classroom ON classroom_analytics(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_analytics_date ON classroom_analytics(analytics_date);

-- Seating arrangements table
CREATE TABLE IF NOT EXISTS seating_arrangements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    classroom_id UUID NOT NULL,
    arrangement_name TEXT NOT NULL,
    layout_type TEXT NOT NULL CHECK (layout_type IN ('rows', 'groups', 'u_shape', 'circle', 'mixed')),
    
    -- Student seat assignments (JSONB for flexibility)
    student_assignments JSONB NOT NULL DEFAULT '[]',
    
    -- Optimization scores
    collaboration_score INTEGER NOT NULL DEFAULT 0 CHECK (collaboration_score >= 0 AND collaboration_score <= 100),
    focus_score INTEGER NOT NULL DEFAULT 0 CHECK (focus_score >= 0 AND focus_score <= 100),
    behavior_management_score INTEGER NOT NULL DEFAULT 0 CHECK (behavior_management_score >= 0 AND behavior_management_score <= 100),
    overall_effectiveness INTEGER NOT NULL DEFAULT 0 CHECK (overall_effectiveness >= 0 AND overall_effectiveness <= 100),
    
    -- Usage tracking
    times_used INTEGER NOT NULL DEFAULT 0,
    total_days_used INTEGER NOT NULL DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    
    special_accommodations JSONB NOT NULL DEFAULT '[]',
    teacher_notes TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_seating_classroom ON seating_arrangements(classroom_id);
CREATE INDEX IF NOT EXISTS idx_seating_active ON seating_arrangements(is_active);
CREATE INDEX IF NOT EXISTS idx_seating_effectiveness ON seating_arrangements(overall_effectiveness);

-- Seating effectiveness tracking
CREATE TABLE IF NOT EXISTS seating_effectiveness (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    arrangement_id UUID REFERENCES seating_arrangements(id) ON DELETE CASCADE,
    
    date_used DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_hours DECIMAL(4,2) NOT NULL DEFAULT 0,
    
    -- Effectiveness metrics
    student_engagement_rating INTEGER CHECK (student_engagement_rating >= 1 AND student_engagement_rating <= 5),
    behavior_incidents INTEGER DEFAULT 0,
    collaboration_quality INTEGER CHECK (collaboration_quality >= 1 AND collaboration_quality <= 5),
    focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 5),
    
    teacher_satisfaction INTEGER CHECK (teacher_satisfaction >= 1 AND teacher_satisfaction <= 5),
    teacher_notes TEXT,
    
    adjustments_made JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seating_effectiveness_arrangement ON seating_effectiveness(arrangement_id);
CREATE INDEX IF NOT EXISTS idx_seating_effectiveness_date ON seating_effectiveness(date_used);

-- Parent communication templates table
CREATE TABLE IF NOT EXISTS parent_communication_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_profile_id UUID REFERENCES enhanced_student_profiles(id) ON DELETE CASCADE,
    
    template_type TEXT NOT NULL CHECK (template_type IN ('introduction', 'progress_update', 'challenge_discussion', 'celebration', 'conference_prep')),
    
    -- Generated content
    subject_line TEXT NOT NULL,
    greeting TEXT NOT NULL,
    main_content TEXT NOT NULL,
    learning_style_insights TEXT NOT NULL,
    specific_examples JSONB NOT NULL DEFAULT '[]',
    action_items JSONB NOT NULL DEFAULT '[]',
    closing TEXT NOT NULL,
    
    -- Customization
    tone TEXT NOT NULL DEFAULT 'friendly' CHECK (tone IN ('formal', 'friendly', 'encouraging', 'concerned')),
    length TEXT NOT NULL DEFAULT 'detailed' CHECK (length IN ('brief', 'detailed', 'comprehensive')),
    
    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communication_templates_student ON parent_communication_templates(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_communication_templates_type ON parent_communication_templates(template_type);

-- Communication log table
CREATE TABLE IF NOT EXISTS parent_communication_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_profile_id UUID REFERENCES enhanced_student_profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES parent_communication_templates(id) ON DELETE SET NULL,
    
    communication_type TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('email', 'phone', 'meeting', 'note', 'portal')),
    
    -- Content tracking
    subject TEXT,
    content TEXT NOT NULL,
    
    -- Response tracking
    sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened BOOLEAN DEFAULT false,
    opened_date TIMESTAMP WITH TIME ZONE,
    replied BOOLEAN DEFAULT false,
    replied_date TIMESTAMP WITH TIME ZONE,
    parent_response TEXT,
    
    -- Follow-up
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_completed BOOLEAN DEFAULT false,
    
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    teacher_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communication_log_student ON parent_communication_log(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_date ON parent_communication_log(sent_date);
CREATE INDEX IF NOT EXISTS idx_communication_log_follow_up ON parent_communication_log(follow_up_needed, follow_up_date);

-- Intervention tracking table
CREATE TABLE IF NOT EXISTS intervention_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    risk_factor_id UUID REFERENCES student_risk_factors(id) ON DELETE CASCADE,
    
    action_description TEXT NOT NULL,
    timeline TEXT NOT NULL,
    resources_needed JSONB NOT NULL DEFAULT '[]',
    success_indicators JSONB NOT NULL DEFAULT '[]',
    person_responsible TEXT NOT NULL CHECK (person_responsible IN ('teacher', 'counselor', 'parent', 'admin', 'specialist')),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'paused', 'discontinued')),
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    
    -- Effectiveness tracking
    progress_notes TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    outcome_achieved BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intervention_actions_risk ON intervention_actions(risk_factor_id);
CREATE INDEX IF NOT EXISTS idx_intervention_actions_status ON intervention_actions(status);
CREATE INDEX IF NOT EXISTS idx_intervention_actions_responsible ON intervention_actions(person_responsible);

-- Row Level Security policies
ALTER TABLE enhanced_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_arrangements ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_actions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be enhanced with proper authentication)
CREATE POLICY "Allow all operations for authenticated users" ON enhanced_student_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON student_risk_factors FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON student_progress FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON parent_insights FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON classroom_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON seating_arrangements FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON seating_effectiveness FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON parent_communication_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON parent_communication_log FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON intervention_actions FOR ALL USING (true);

-- Update triggers
CREATE TRIGGER update_enhanced_profiles_updated_at 
    BEFORE UPDATE ON enhanced_student_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_factors_updated_at 
    BEFORE UPDATE ON student_risk_factors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_insights_updated_at 
    BEFORE UPDATE ON parent_insights 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seating_arrangements_updated_at 
    BEFORE UPDATE ON seating_arrangements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intervention_actions_updated_at 
    BEFORE UPDATE ON intervention_actions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW classroom_overview AS
SELECT 
    c.id as classroom_id,
    c.name as classroom_name,
    c.grade_level,
    COUNT(esp.id) as total_students,
    COUNT(CASE WHEN p.personality_label LIKE '%Creative%' THEN 1 END) as creative_count,
    COUNT(CASE WHEN p.personality_label LIKE '%Analytical%' THEN 1 END) as analytical_count,
    COUNT(CASE WHEN p.personality_label LIKE '%Collaborative%' THEN 1 END) as collaborative_count,
    COUNT(CASE WHEN p.personality_label LIKE '%Confident%' THEN 1 END) as confident_count,
    AVG(esp.communication_score) as avg_communication,
    AVG(esp.collaboration_score) as avg_collaboration,
    AVG(esp.content_score) as avg_content,
    AVG(esp.critical_thinking_score) as avg_critical_thinking,
    AVG(esp.creative_innovation_score) as avg_creative_innovation,
    AVG(esp.confidence_score) as avg_confidence,
    AVG(esp.engagement_level) as avg_engagement,
    COUNT(CASE WHEN rf.severity = 'high' THEN 1 END) as high_risk_count,
    COUNT(CASE WHEN rf.severity = 'medium' THEN 1 END) as medium_risk_count,
    COUNT(CASE WHEN rf.severity = 'low' THEN 1 END) as low_risk_count
FROM classrooms c
LEFT JOIN enhanced_student_profiles esp ON c.id = esp.classroom_id::integer
LEFT JOIN profiles p ON esp.profile_id = p.id
LEFT JOIN student_risk_factors rf ON esp.id = rf.student_profile_id AND rf.status = 'active'
GROUP BY c.id, c.name, c.grade_level;

CREATE OR REPLACE VIEW at_risk_students AS
SELECT 
    esp.id as student_profile_id,
    p.child_name,
    p.personality_label,
    esp.classroom_id,
    CASE 
        WHEN COUNT(CASE WHEN rf.severity = 'high' THEN 1 END) > 0 THEN 'high'
        WHEN COUNT(CASE WHEN rf.severity = 'medium' THEN 1 END) > 0 THEN 'medium'
        ELSE 'low'
    END as overall_risk_level,
    COUNT(rf.id) as risk_factor_count,
    STRING_AGG(rf.description, '; ') as risk_descriptions,
    MIN(rf.next_review_date) as next_review_date
FROM enhanced_student_profiles esp
JOIN profiles p ON esp.profile_id = p.id
LEFT JOIN student_risk_factors rf ON esp.id = rf.student_profile_id AND rf.status = 'active'
GROUP BY esp.id, p.child_name, p.personality_label, esp.classroom_id;