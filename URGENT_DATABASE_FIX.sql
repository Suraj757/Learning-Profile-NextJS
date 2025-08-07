-- URGENT: Run this in your Supabase SQL Editor to fix the assessment completion error
-- This adds the missing age_group column that's causing the "Failed to save your profile" error

-- Add the age_group column to assessment_results table
ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT '5+';

-- Add an index for performance
CREATE INDEX IF NOT EXISTS idx_assessment_results_age_group ON assessment_results(age_group);

-- Update existing records to have a default age group
UPDATE assessment_results 
SET age_group = '5+' 
WHERE age_group IS NULL;

-- Also add to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT '5+';

CREATE INDEX IF NOT EXISTS idx_profiles_age_group ON profiles(age_group);

UPDATE profiles 
SET age_group = '5+' 
WHERE age_group IS NULL;

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name IN ('assessment_results', 'profiles') 
AND column_name = 'age_group';