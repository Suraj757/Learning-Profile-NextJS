-- Educational Platform Security Database Schema
-- FERPA/COPPA Compliant Authentication & Authorization System
-- Migration to secure existing vulnerable system

-- 1. Create secure users table with educational context
CREATE TABLE IF NOT EXISTS secure_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    
    -- User Identity
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL, -- enum: teacher, parent, admin, auditor
    
    -- Educational Context
    school_district_id UUID,
    school_id UUID,
    grade_levels TEXT[], -- Array of grade levels user can access
    
    -- Security
    password_hash VARCHAR(255), -- For admin accounts
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255), -- Encrypted
    backup_codes TEXT[], -- Encrypted recovery codes
    
    -- Account Status
    account_status account_status DEFAULT 'pending_verification', -- enum
    suspended_until TIMESTAMPTZ,
    suspension_reason TEXT,
    
    -- COPPA Compliance (for parents)
    parental_consent_verified BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMPTZ,
    consent_method VARCHAR(50), -- 'email', 'phone', 'written'
    consent_ip_address INET,
    
    -- FERPA Compliance 
    ferpa_training_completed BOOLEAN DEFAULT FALSE,
    ferpa_agreement_date TIMESTAMPTZ,
    ferpa_training_expiry TIMESTAMPTZ,
    
    -- Professional Information (teachers)
    certification_number VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    
    -- Contact Information
    phone_number VARCHAR(20),
    emergency_contact_phone VARCHAR(20),
    
    -- Privacy Settings
    directory_listing_allowed BOOLEAN DEFAULT FALSE,
    communication_preferences JSONB DEFAULT '{"email": true, "phone": false, "text": false}'::jsonb,
    
    -- Audit Trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES secure_users(id),
    last_login TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    
    -- Data Retention
    data_retention_date TIMESTAMPTZ, -- When to delete user data
    deletion_requested BOOLEAN DEFAULT FALSE
);

-- Create enum types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('teacher', 'parent', 'admin', 'auditor', 'student');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending_verification', 'deactivated');
    END IF;
END
$$;

-- 2. Enhanced teacher profiles with classroom assignments
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES secure_users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) UNIQUE NOT NULL, -- School system ID
    
    -- Professional Information
    certification_type VARCHAR(100),
    years_experience INTEGER,
    education_level VARCHAR(50),
    specializations TEXT[],
    
    -- Classroom Management Permissions
    can_create_classrooms BOOLEAN DEFAULT TRUE,
    can_assign_assessments BOOLEAN DEFAULT TRUE,
    can_communicate_with_parents BOOLEAN DEFAULT TRUE,
    can_export_data BOOLEAN DEFAULT FALSE,
    max_students_per_class INTEGER DEFAULT 30,
    
    -- Professional Development
    professional_development_hours INTEGER DEFAULT 0,
    last_training_date DATE,
    required_training_completed BOOLEAN DEFAULT FALSE,
    
    -- Performance Tracking
    student_outcome_scores JSONB,
    peer_collaboration_score INTEGER,
    parent_satisfaction_score INTEGER,
    
    -- Emergency Information
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Parent profiles with child relationships
CREATE TABLE IF NOT EXISTS parent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES secure_users(id) ON DELETE CASCADE,
    parent_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Relationship Information
    relationship_type VARCHAR(50) NOT NULL, -- 'mother', 'father', 'guardian', 'stepparent'
    primary_contact BOOLEAN DEFAULT FALSE,
    emergency_contact BOOLEAN DEFAULT FALSE,
    pickup_authorized BOOLEAN DEFAULT TRUE,
    
    -- Legal Information
    custody_status VARCHAR(50), -- 'full', 'joint', 'limited', 'none'
    court_orders TEXT[], -- References to court orders affecting access
    custody_restrictions TEXT,
    
    -- Communication Preferences
    preferred_language VARCHAR(10) DEFAULT 'en',
    interpreter_needed BOOLEAN DEFAULT FALSE,
    best_contact_time TIME,
    contact_method_priority TEXT[] DEFAULT ARRAY['email', 'phone'],
    
    -- COPPA Specific
    children_under_13 INTEGER DEFAULT 0,
    data_sharing_agreements JSONB,
    third_party_consent JSONB,
    
    -- Work/Schedule Information
    work_schedule JSONB, -- For scheduling communications
    employer VARCHAR(100),
    work_phone VARCHAR(20),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Secure student profiles (FERPA protected)
CREATE TABLE IF NOT EXISTS secure_student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) UNIQUE NOT NULL, -- School district ID
    
    -- Personal Information (Encrypted)
    first_name_encrypted TEXT NOT NULL,
    last_name_encrypted TEXT NOT NULL,
    date_of_birth_encrypted TEXT NOT NULL,
    ssn_encrypted TEXT, -- Only if legally required
    
    -- Display Information (Non-identifying)
    display_first_name VARCHAR(50), -- Parent-approved display name
    grade_level VARCHAR(10) NOT NULL,
    gender VARCHAR(20),
    
    -- Educational Context
    school_id UUID NOT NULL,
    current_classroom_id UUID,
    primary_teacher_id UUID REFERENCES teacher_profiles(id),
    
    -- Parent/Guardian Relationships
    parent_ids UUID[] NOT NULL, -- References to parent_profiles
    emergency_contact_ids UUID[],
    authorized_pickup_ids UUID[],
    
    -- Special Needs & Accommodations (Encrypted)
    iep_status BOOLEAN DEFAULT FALSE,
    iep_details_encrypted TEXT,
    section_504_status BOOLEAN DEFAULT FALSE,
    section_504_details_encrypted TEXT,
    medical_alerts_encrypted TEXT,
    dietary_restrictions_encrypted TEXT,
    
    -- Academic Information
    enrollment_date DATE NOT NULL,
    expected_graduation_date DATE,
    previous_schools JSONB,
    grade_retention_history JSONB,
    
    -- Learning Profile Integration
    learning_profile_id UUID, -- Links to existing profiles table
    assessment_results_encrypted TEXT, -- Encrypted assessment data
    
    -- Privacy Controls
    photo_permission BOOLEAN DEFAULT FALSE,
    video_permission BOOLEAN DEFAULT FALSE,
    directory_listing_permission BOOLEAN DEFAULT FALSE,
    third_party_sharing_permission BOOLEAN DEFAULT FALSE,
    research_participation_permission BOOLEAN DEFAULT FALSE,
    
    -- Data Protection
    data_classification VARCHAR(50) DEFAULT 'confidential',
    retention_period_years INTEGER DEFAULT 7, -- FERPA retention period
    deletion_scheduled_date DATE,
    
    -- Audit Trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES secure_users(id),
    last_accessed TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0
);

-- 5. Secure sessions with enhanced tracking
CREATE TABLE IF NOT EXISTS secure_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES secure_users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    
    -- Session Timing
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    idle_timeout_minutes INTEGER DEFAULT 30,
    
    -- Security Information
    ip_address INET NOT NULL,
    user_agent TEXT,
    browser_fingerprint VARCHAR(255),
    
    -- Educational Context
    active_school_id UUID,
    active_classroom_id UUID,
    educational_purpose TEXT,
    
    -- Security Flags
    mfa_verified BOOLEAN DEFAULT FALSE,
    session_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    
    -- Risk Assessment
    risk_score INTEGER DEFAULT 0, -- 0-100 security risk score
    suspicious_activity BOOLEAN DEFAULT FALSE,
    security_alerts TEXT[],
    
    -- Geographic Information
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Device Information
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    os_type VARCHAR(50),
    browser_type VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Permissions and access control
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES secure_users(id) ON DELETE CASCADE,
    resource_type resource_type NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    actions permission_action[] NOT NULL,
    
    -- Educational Context
    granted_by UUID REFERENCES secure_users(id),
    educational_interest TEXT NOT NULL, -- FERPA requirement
    legitimate_purpose TEXT NOT NULL,
    
    -- Permission Conditions
    conditions JSONB, -- Time restrictions, IP restrictions, etc.
    expires_at TIMESTAMPTZ,
    
    -- Approval Process
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES secure_users(id),
    approved_at TIMESTAMPTZ,
    
    -- Usage Tracking
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    first_used TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT
);

-- Create enum for permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_action') THEN
        CREATE TYPE permission_action AS ENUM ('read', 'write', 'delete', 'share', 'export', 'audit');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
        CREATE TYPE resource_type AS ENUM ('student_profile', 'classroom', 'assessment_result', 'communication', 'audit_log', 'system_settings');
    END IF;
END
$$;

-- 7. Comprehensive audit log for FERPA compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Classification
    event_type audit_event_type NOT NULL,
    event_category VARCHAR(50) NOT NULL, -- 'data_access', 'user_management', 'system_config'
    severity audit_severity DEFAULT 'medium',
    
    -- User Information
    user_id UUID REFERENCES secure_users(id),
    user_role user_role,
    user_name VARCHAR(200), -- Denormalized for audit trail
    session_id VARCHAR(255),
    
    -- Resource Information
    resource_type resource_type,
    resource_id VARCHAR(255),
    student_id UUID, -- Specific tracking for student data access
    
    -- Action Details
    action_performed TEXT NOT NULL,
    action_result VARCHAR(50), -- 'success', 'failure', 'partial'
    before_state JSONB, -- State before action
    after_state JSONB, -- State after action
    
    -- Context Information
    educational_purpose TEXT,
    legitimate_interest TEXT, -- FERPA requirement
    data_shared_with TEXT[], -- Who received the data
    sharing_purpose TEXT,
    
    -- Technical Details
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path TEXT,
    response_code INTEGER,
    
    -- Compliance Information
    ferpa_compliant BOOLEAN DEFAULT TRUE,
    coppa_compliant BOOLEAN DEFAULT TRUE,
    privacy_impact_assessment BOOLEAN DEFAULT FALSE,
    
    -- Geographic Information
    country_code VARCHAR(2),
    state_code VARCHAR(2),
    
    -- Data Protection
    retention_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 years'),
    archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    
    -- Review Information
    requires_review BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES secure_users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Additional Metadata
    metadata JSONB,
    correlation_id UUID, -- For tracing related events
    parent_audit_id UUID REFERENCES audit_log(id) -- For event chains
);

-- Create audit enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_event_type') THEN
        CREATE TYPE audit_event_type AS ENUM (
            'login', 'logout', 'access_granted', 'access_denied', 'data_viewed', 'data_modified', 
            'data_deleted', 'data_shared', 'data_exported', 'permission_granted', 'permission_revoked',
            'user_created', 'user_modified', 'user_deleted', 'session_created', 'session_expired',
            'security_alert', 'privacy_violation', 'system_error'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_severity') THEN
        CREATE TYPE audit_severity AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END
$$;

-- 8. Data access requests (FERPA right to review)
CREATE TABLE IF NOT EXISTS data_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL, -- Public facing request number
    
    -- Requester Information
    requester_id UUID REFERENCES secure_users(id),
    requester_type VARCHAR(50) NOT NULL, -- 'parent', 'student', 'legal_guardian'
    requester_name VARCHAR(200) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(20),
    
    -- Request Details
    student_id UUID NOT NULL REFERENCES secure_student_profiles(id),
    student_name VARCHAR(200) NOT NULL, -- For tracking
    requested_data_types TEXT[] NOT NULL, -- What data is requested
    date_range_start DATE,
    date_range_end DATE,
    specific_records TEXT[], -- Specific record IDs if known
    
    -- Legal Basis
    legal_basis TEXT NOT NULL, -- FERPA section, etc.
    relationship_verification BOOLEAN DEFAULT FALSE,
    identity_verified BOOLEAN DEFAULT FALSE,
    verification_documents TEXT[], -- Document references
    
    -- Processing Information
    status request_status DEFAULT 'pending',
    received_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES secure_users(id),
    processing_notes TEXT,
    
    -- FERPA Compliance (45-day rule)
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '45 days'),
    extended_due_date DATE, -- If extension granted
    extension_reason TEXT,
    
    -- Review Process
    legal_review_required BOOLEAN DEFAULT TRUE,
    legal_reviewed_by UUID REFERENCES secure_users(id),
    legal_approved_at TIMESTAMPTZ,
    
    -- Fulfillment
    data_prepared_by UUID REFERENCES secure_users(id),
    data_prepared_at TIMESTAMPTZ,
    quality_reviewed_by UUID REFERENCES secure_users(id),
    quality_approved_at TIMESTAMPTZ,
    
    -- Delivery
    delivery_method VARCHAR(50), -- 'secure_email', 'portal', 'mail', 'pickup'
    delivered_at TIMESTAMPTZ,
    delivery_confirmation VARCHAR(255),
    data_format VARCHAR(20), -- 'PDF', 'JSON', 'CSV'
    
    -- Cost Information (if applicable)
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    payment_required BOOLEAN DEFAULT FALSE,
    payment_received_at TIMESTAMPTZ,
    
    -- Follow-up
    requester_notified BOOLEAN DEFAULT FALSE,
    satisfaction_survey_sent BOOLEAN DEFAULT FALSE,
    complaint_filed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create request status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM (
            'pending', 'acknowledged', 'under_review', 'legal_review', 'approved', 
            'denied', 'in_progress', 'ready', 'delivered', 'completed', 'cancelled'
        );
    END IF;
END
$$;

-- 9. Parent-child relationships (COPPA critical)
CREATE TABLE IF NOT EXISTS parent_child_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES secure_student_profiles(id) ON DELETE CASCADE,
    
    -- Relationship Details
    relationship_type VARCHAR(50) NOT NULL, -- 'biological_parent', 'adoptive_parent', 'legal_guardian', 'stepparent'
    legal_status VARCHAR(50), -- 'full_custody', 'joint_custody', 'visitation_rights', 'emergency_contact'
    
    -- Permissions
    educational_decisions BOOLEAN DEFAULT FALSE,
    medical_decisions BOOLEAN DEFAULT FALSE,
    pickup_authorization BOOLEAN DEFAULT FALSE,
    emergency_contact BOOLEAN DEFAULT FALSE,
    
    -- Legal Documentation
    custody_order_reference VARCHAR(100),
    court_jurisdiction VARCHAR(100),
    legal_documentation TEXT[], -- References to legal documents
    
    -- COPPA Consent (for children under 13)
    coppa_consent_given BOOLEAN DEFAULT FALSE,
    coppa_consent_date TIMESTAMPTZ,
    coppa_consent_method VARCHAR(50), -- 'electronic', 'written', 'phone'
    coppa_consent_ip_address INET,
    consent_withdrawn BOOLEAN DEFAULT FALSE,
    consent_withdrawn_date TIMESTAMPTZ,
    
    -- Communication Rights
    can_receive_communications BOOLEAN DEFAULT TRUE,
    communication_frequency VARCHAR(50) DEFAULT 'normal', -- 'high', 'normal', 'low', 'emergency_only'
    preferred_language VARCHAR(10) DEFAULT 'en',
    
    -- Access Rights
    can_access_grades BOOLEAN DEFAULT TRUE,
    can_access_attendance BOOLEAN DEFAULT TRUE,
    can_access_assessments BOOLEAN DEFAULT TRUE,
    can_access_behavioral_records BOOLEAN DEFAULT FALSE,
    can_access_medical_records BOOLEAN DEFAULT FALSE,
    
    -- Restrictions
    access_restrictions TEXT,
    court_imposed_limitations TEXT,
    temporary_restrictions JSONB, -- Time-limited restrictions
    
    -- Verification
    relationship_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES secure_users(id),
    verified_at TIMESTAMPTZ,
    verification_method VARCHAR(100),
    verification_documents TEXT[],
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    effective_date DATE DEFAULT CURRENT_DATE,
    end_date DATE, -- When relationship ends (graduation, transfer, etc.)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique parent-child relationships
    UNIQUE(parent_id, student_id)
);

-- 10. Security and performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_users_email ON secure_users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_users_role ON secure_users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_users_school_id ON secure_users(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_users_status ON secure_users(account_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_sessions_user_id ON secure_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_sessions_expires_at ON secure_sessions(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_sessions_active ON secure_sessions(session_revoked, expires_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_student_id ON audit_log(student_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_profiles_teacher ON secure_student_profiles(primary_teacher_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_profiles_classroom ON secure_student_profiles(current_classroom_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_profiles_school ON secure_student_profiles(school_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parent_child_parent ON parent_child_relationships(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parent_child_student ON parent_child_relationships(student_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parent_child_active ON parent_child_relationships(active);

-- 11. Row Level Security (RLS) Policies
ALTER TABLE secure_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_own_data ON secure_users
    FOR ALL TO authenticated
    USING (id = auth.uid());

-- Teachers can only see students in their classrooms
CREATE POLICY teacher_student_access ON secure_student_profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM secure_users 
            WHERE id = auth.uid() 
            AND role = 'teacher'
            AND id = secure_student_profiles.primary_teacher_id
        )
    );

-- Parents can only see their own children
CREATE POLICY parent_child_access ON secure_student_profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM parent_child_relationships pcr
            JOIN parent_profiles pp ON pcr.parent_id = pp.id
            JOIN secure_users su ON pp.user_id = su.id
            WHERE su.id = auth.uid()
            AND pcr.student_id = secure_student_profiles.id
            AND pcr.active = true
        )
    );

-- Audit logs are read-only for most users
CREATE POLICY audit_read_access ON audit_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM secure_users
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'auditor' OR id = audit_log.user_id)
        )
    );

-- 12. Trigger functions for audit logging
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (
            event_type, user_id, resource_type, resource_id,
            action_performed, after_state, ferpa_compliant
        ) VALUES (
            'user_created', NEW.id, 'user_profile', NEW.id::text,
            'User account created', to_jsonb(NEW), true
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (
            event_type, user_id, resource_type, resource_id,
            action_performed, before_state, after_state, ferpa_compliant
        ) VALUES (
            'user_modified', NEW.id, 'user_profile', NEW.id::text,
            'User account modified', to_jsonb(OLD), to_jsonb(NEW), true
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (
            event_type, user_id, resource_type, resource_id,
            action_performed, before_state, ferpa_compliant
        ) VALUES (
            'user_deleted', OLD.id, 'user_profile', OLD.id::text,
            'User account deleted', to_jsonb(OLD), true
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
DROP TRIGGER IF EXISTS audit_secure_users ON secure_users;
CREATE TRIGGER audit_secure_users
    AFTER INSERT OR UPDATE OR DELETE ON secure_users
    FOR EACH ROW EXECUTE FUNCTION log_user_changes();

-- 13. Data retention and cleanup functions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM secure_sessions 
    WHERE expires_at < NOW() OR session_revoked = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO audit_log (
        event_type, action_performed, metadata
    ) VALUES (
        'system_maintenance', 
        'Cleaned up expired sessions',
        json_build_object('deleted_sessions', deleted_count)
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 14. Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON secure_users TO authenticated;
GRANT SELECT ON secure_student_profiles TO authenticated;
GRANT INSERT ON audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON secure_sessions TO authenticated;

-- Initial admin user (remove in production)
INSERT INTO secure_users (
    email, first_name, last_name, role, account_status, 
    ferpa_training_completed, email_verified
) VALUES (
    'admin@school.edu', 'System', 'Administrator', 'admin', 'active',
    true, true
) ON CONFLICT (email) DO NOTHING;

-- Migration notes and cleanup
COMMENT ON TABLE secure_users IS 'FERPA/COPPA compliant user management with educational context';
COMMENT ON TABLE secure_student_profiles IS 'Protected student information with encryption for PII';
COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for FERPA compliance';
COMMENT ON TABLE parent_child_relationships IS 'COPPA-compliant parent-child data access relationships';

-- Create maintenance job for session cleanup (run every hour)
-- This would typically be set up as a cron job or scheduled task
-- SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');