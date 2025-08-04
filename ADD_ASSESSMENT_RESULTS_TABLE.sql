-- Migration: Add missing assessment_results table
-- Run this in your Supabase SQL editor to fix the "Failed to save profile" error

-- Assessment Results table (for teacher assignments)
CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    child_name TEXT NOT NULL,
    age INTEGER DEFAULT 0,
    scores JSONB NOT NULL,
    personality_label TEXT NOT NULL,
    raw_responses JSONB NOT NULL,
    email TEXT DEFAULT '',
    birth_month INTEGER DEFAULT 1,
    birth_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
    grade_level TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_created_at ON assessment_results(created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_results_child_name ON assessment_results(child_name);

-- RLS for assessment_results table
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Anyone can create assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Anyone can view assessment results" ON assessment_results;

CREATE POLICY "Anyone can create assessment results" ON assessment_results
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view assessment results" ON assessment_results
    FOR SELECT USING (true);

-- Update profile_assignments table to properly reference assessment_results
-- Note: This will only work if the profile_assignments table exists and has no data
-- If you have existing data, you may need to handle this migration differently
ALTER TABLE profile_assignments 
DROP CONSTRAINT IF EXISTS profile_assignments_assessment_id_fkey;

ALTER TABLE profile_assignments 
ADD CONSTRAINT profile_assignments_assessment_id_fkey 
FOREIGN KEY (assessment_id) REFERENCES assessment_results(id) ON DELETE SET NULL;