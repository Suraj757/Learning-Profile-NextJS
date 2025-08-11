-- Enhanced Student-Centric Schema for Learning Profile Platform
-- Implements the architecture from ARCHITECTURE.md

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schools table (multi-tenant boundary)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    school_code TEXT UNIQUE, -- State/district assigned code
    address JSONB,
    principal_email TEXT,
    ferpa_officer_email TEXT,
    privacy_settings JSONB DEFAULT '{
        "allow_teacher_data_export": true,
        "require_assessment_approval": false,
        "data_retention_years": 7,
        "allow_cross_year_access": true
    }'::jsonb,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'school', 'district', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create districts table (optional - for future scaling)
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    district_code TEXT UNIQUE,
    state_code TEXT,
    superintendent_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced students table (permanent entities)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_number TEXT, -- School assigned ID (not unique across schools)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    grade_level TEXT,
    school_id UUID REFERENCES schools(id),
    
    -- Privacy & compliance
    ferpa_directory_opt_out BOOLEAN DEFAULT false,
    data_retention_preference TEXT DEFAULT 'standard' CHECK (data_retention_preference IN ('minimum', 'standard', 'extended')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure student numbers are unique within schools
    UNIQUE(school_id, student_number)
);

-- Student learning profiles (cumulative over time)
CREATE TABLE IF NOT EXISTS student_learning_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    personality_label TEXT,
    learning_style_scores JSONB, -- Flexible for different assessment types
    strengths JSONB,
    challenges JSONB,
    recommendations JSONB,
    raw_responses JSONB, -- Store original assessment responses
    
    -- Assessment metadata
    assessment_type TEXT DEFAULT 'speakaboos_v1',
    assessment_version TEXT DEFAULT '1.0',
    administered_by UUID REFERENCES teachers(id),
    school_year TEXT,
    grade_level TEXT,
    
    -- Data lineage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced teachers table with school affiliation
CREATE TABLE IF NOT EXISTS teachers_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE, -- For migration from existing teachers table
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    school_id UUID REFERENCES schools(id),
    employee_id TEXT, -- School assigned ID
    
    -- Teaching details
    grade_levels TEXT[], -- ['K', '1', '2'] for multi-grade teachers
    subject_areas TEXT[], -- ['Math', 'Science'] for specialists
    role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'specialist', 'admin', 'principal')),
    certification_status TEXT DEFAULT 'verified' CHECK (certification_status IN ('pending', 'verified', 'expired', 'revoked')),
    hire_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    
    -- Permissions
    permissions JSONB DEFAULT '{
        "view_student_profiles": true,
        "create_assessments": true,
        "export_data": false,
        "manage_classroom": true,
        "view_historical_data": false
    }'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Enhanced parents table
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en',
    
    -- Communication preferences
    communication_preferences JSONB DEFAULT '{
        "email_updates": true,
        "sms_updates": false,
        "assessment_notifications": true,
        "progress_reports": true
    }'::jsonb,
    
    -- Verification
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents JSONB, -- Store verification metadata
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES teachers_enhanced(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced classrooms with proper relationships
CREATE TABLE IF NOT EXISTS classrooms_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE, -- For migration from existing classrooms table
    school_id UUID REFERENCES schools(id) NOT NULL,
    primary_teacher_id UUID REFERENCES teachers_enhanced(id),
    
    -- Classroom details
    name TEXT NOT NULL,
    grade_level TEXT,
    subject_area TEXT, -- For middle/high school specialists
    school_year TEXT NOT NULL,
    room_number TEXT,
    max_enrollment INTEGER DEFAULT 30,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate classrooms
    UNIQUE(school_id, name, school_year)
);

-- Teacher-Student relationships (the key to data access control)
CREATE TABLE IF NOT EXISTS teacher_student_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers_enhanced(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms_enhanced(id),
    
    -- Relationship details
    relationship_type TEXT DEFAULT 'primary_teacher' CHECK (relationship_type IN ('primary_teacher', 'specialist', 'support', 'substitute')),
    school_year TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE, -- NULL = active relationship
    
    -- FERPA compliance
    educational_purpose TEXT NOT NULL, -- Required for FERPA
    permissions JSONB DEFAULT '{
        "view_profile": true,
        "view_assessments": true,
        "create_assessments": true,
        "share_with_parents": true,
        "export_data": false
    }'::jsonb,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES teachers_enhanced(id),
    
    -- Ensure no duplicate active relationships
    UNIQUE(teacher_id, student_id, school_year, relationship_type)
);

-- Parent-Student relationships (permanent with custody considerations)
CREATE TABLE IF NOT EXISTS parent_student_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    
    -- Relationship details
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('parent', 'guardian', 'custodian', 'emergency_contact')),
    custody_status TEXT DEFAULT 'full' CHECK (custody_status IN ('full', 'joint', 'limited', 'none')),
    
    -- Permissions
    can_access_data BOOLEAN DEFAULT true,
    can_consent_sharing BOOLEAN DEFAULT true,
    can_export_data BOOLEAN DEFAULT true,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_method TEXT CHECK (verification_method IN ('school_enrollment', 'birth_certificate', 'court_order', 'notarized_form')),
    verification_documents JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FERPA audit trail (compliance requirement)
CREATE TABLE IF NOT EXISTS ferpa_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User info
    user_id UUID NOT NULL, -- Can reference teachers_enhanced, parents, or admins
    user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'parent', 'admin', 'system')),
    user_email TEXT NOT NULL,
    
    -- Action details
    action TEXT NOT NULL CHECK (action IN ('view_profile', 'edit_profile', 'export_data', 'create_assessment', 'send_invitation', 'login', 'logout', 'delete_data', 'share_data')),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('student_profile', 'assessment', 'classroom', 'user_account')),
    resource_id UUID NOT NULL,
    
    -- FERPA requirements
    student_id UUID REFERENCES students(id), -- Required when accessing student data
    educational_purpose TEXT NOT NULL, -- Required for FERPA compliance
    
    -- Technical details
    ip_address INET,
    user_agent TEXT,
    outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'unauthorized')),
    details JSONB, -- Additional context
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent management (for COPPA compliance and parent control)
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    
    -- Consent details
    consent_type TEXT NOT NULL CHECK (consent_type IN ('ferpa', 'data_sharing', 'research', 'third_party', 'begin_app')),
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Legal details
    consent_version TEXT NOT NULL, -- Track policy versions
    ip_address INET,
    digital_signature TEXT,
    witness_email TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced profile assignments (bridge to legacy system)
CREATE TABLE IF NOT EXISTS profile_assignments_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE, -- For migration
    
    -- Relationships
    teacher_id UUID REFERENCES teachers_enhanced(id),
    student_id UUID REFERENCES students(id),
    parent_id UUID REFERENCES parents(id),
    classroom_id UUID REFERENCES classrooms_enhanced(id),
    
    -- Assignment details
    assignment_token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'in_progress', 'completed', 'expired')),
    
    -- Assessment results (embedded for performance)
    assessment_results JSONB,
    learning_profile_id UUID REFERENCES student_learning_profiles(id),
    
    -- Timestamps
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Begin app integration tables
CREATE TABLE IF NOT EXISTS begin_content_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    learning_profile_id UUID REFERENCES student_learning_profiles(id),
    
    -- Content details
    content_type TEXT NOT NULL CHECK (content_type IN ('activity', 'game', 'lesson', 'assessment', 'video')),
    content_id TEXT NOT NULL, -- Begin app content identifier
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT,
    estimated_duration INTEGER, -- Minutes
    
    -- Recommendation metadata
    recommendation_score DECIMAL(3,2) CHECK (recommendation_score BETWEEN 0.00 AND 1.00),
    recommendation_reason JSONB,
    alignment_tags TEXT[],
    
    -- Usage tracking
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    engagement_score DECIMAL(3,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_grade_level ON students(grade_level);
CREATE INDEX IF NOT EXISTS idx_learning_profiles_student_id ON student_learning_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_profiles_school_year ON student_learning_profiles(school_year);
CREATE INDEX IF NOT EXISTS idx_teacher_student_rel_teacher ON teacher_student_relationships(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_rel_student ON teacher_student_relationships(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_rel_active ON teacher_student_relationships(teacher_id, student_id) WHERE end_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_parent_student_rel_parent ON parent_student_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_rel_student ON parent_student_relationships(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON ferpa_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_student_id ON ferpa_audit_log(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON ferpa_audit_log(timestamp);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_enhanced_updated_at BEFORE UPDATE ON teachers_enhanced FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classrooms_enhanced_updated_at BEFORE UPDATE ON classrooms_enhanced FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profile_assignments_enhanced_updated_at BEFORE UPDATE ON profile_assignments_enhanced FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_relationships ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (to be customized based on auth system)
-- Teachers can only see students in their relationships
CREATE POLICY teachers_see_their_students ON students
    FOR SELECT
    USING (id IN (
        SELECT student_id FROM teacher_student_relationships 
        WHERE teacher_id = auth.uid() AND end_date IS NULL
    ));

-- Parents can only see their own children
CREATE POLICY parents_see_their_children ON students
    FOR SELECT
    USING (id IN (
        SELECT student_id FROM parent_student_relationships 
        WHERE parent_id = auth.uid() AND can_access_data = true
    ));

-- Comments for documentation
COMMENT ON TABLE students IS 'Permanent student entities that persist across teachers and years';
COMMENT ON TABLE student_learning_profiles IS 'Cumulative learning assessments over time';
COMMENT ON TABLE teacher_student_relationships IS 'Time-bound relationships controlling data access';
COMMENT ON TABLE parent_student_relationships IS 'Permanent family relationships with custody awareness';
COMMENT ON TABLE ferpa_audit_log IS 'FERPA-compliant audit trail for all student data access';
COMMENT ON COLUMN teacher_student_relationships.educational_purpose IS 'Required FERPA justification for data access';
COMMENT ON COLUMN ferpa_audit_log.educational_purpose IS 'Educational justification for this data access event';