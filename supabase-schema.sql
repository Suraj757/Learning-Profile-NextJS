-- Learning Profiles Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    responses JSONB NOT NULL,
    scores JSONB NOT NULL,
    personality_label TEXT NOT NULL,
    description TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    share_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_share_token ON profiles(share_token);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(is_public);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (is_public = true);

-- Policy to allow anyone to insert profiles (for anonymous assessment creation)
CREATE POLICY "Anyone can create profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- Policy to allow profile owners to update their profiles (optional future feature)
-- This would require authentication and user tracking
-- CREATE POLICY "Users can update own profiles" ON profiles
--     FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Responses table for normalized storage (future enhancement)
-- This allows for more detailed analytics and question-level insights
CREATE TABLE IF NOT EXISTS responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    response_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_profile_id ON responses(profile_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);

-- RLS for responses table
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responses are viewable with public profiles" ON responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = responses.profile_id 
            AND profiles.is_public = true
        )
    );

CREATE POLICY "Anyone can insert responses" ON responses
    FOR INSERT WITH CHECK (true);

-- Optional: Results table for caching computed results (future enhancement)
CREATE TABLE IF NOT EXISTS results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scores JSONB NOT NULL,
    personality_label TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_results_profile_id ON results(profile_id);

-- RLS for results table
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Results are viewable with public profiles" ON results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = results.profile_id 
            AND profiles.is_public = true
        )
    );

CREATE POLICY "Anyone can insert results" ON results
    FOR INSERT WITH CHECK (true);

-- Teachers table for teacher functionality
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    school TEXT,
    grade_level TEXT,
    classroom_name TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    ambassador_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_invite_code ON teachers(invite_code);

-- RLS for teachers table
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own profile" ON teachers
    FOR SELECT USING (true); -- For now, allow all reads for simplicity

CREATE POLICY "Anyone can create teacher accounts" ON teachers
    FOR INSERT WITH CHECK (true);

-- Assignment progress table for progress saving
CREATE TABLE IF NOT EXISTS assessment_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    child_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    parent_email TEXT,
    responses JSONB DEFAULT '{}',
    current_question INTEGER DEFAULT 1,
    assignment_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_progress_session_id ON assessment_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_progress_parent_email ON assessment_progress(parent_email);
CREATE INDEX IF NOT EXISTS idx_assessment_progress_expires_at ON assessment_progress(expires_at);

-- RLS for assessment_progress table
ALTER TABLE assessment_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage assessment progress" ON assessment_progress
    FOR ALL USING (true);

-- Teacher assignments table (linking teachers to student profiles)
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assignment_token TEXT NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_id ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_profile_id ON teacher_assignments(profile_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_token ON teacher_assignments(assignment_token);

-- RLS for teacher_assignments table
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their assignments" ON teacher_assignments
    FOR SELECT USING (true); -- Simplified for now

CREATE POLICY "Anyone can create assignments" ON teacher_assignments
    FOR INSERT WITH CHECK (true);

-- Update triggers for new tables
CREATE TRIGGER update_teachers_updated_at 
    BEFORE UPDATE ON teachers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_progress_updated_at 
    BEFORE UPDATE ON assessment_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Additional tables for teacher functionality
CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    school_year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON classrooms(teacher_id);

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can manage their classrooms" ON classrooms FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_classroom_id ON students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students are viewable by teachers" ON students FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS profile_assignments (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    parent_email TEXT NOT NULL,
    child_name TEXT NOT NULL,
    assignment_token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'completed')),
    assessment_id INTEGER,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_profile_assignments_teacher_id ON profile_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_token ON profile_assignments(assignment_token);

ALTER TABLE profile_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can manage their assignments" ON profile_assignments FOR ALL USING (true);

-- Update triggers for new tables
CREATE TRIGGER update_classrooms_updated_at 
    BEFORE UPDATE ON classrooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();