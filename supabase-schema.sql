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