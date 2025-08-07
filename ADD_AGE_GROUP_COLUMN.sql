-- Migration: Add age_group column to assessment_results table
-- Run this in your Supabase SQL editor to support age-specific questions

-- Add age_group column to assessment_results table
ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT '5+';

-- Add comment to explain the column
COMMENT ON COLUMN assessment_results.age_group IS 'Age group for assessment: 3-4, 4-5, or 5+';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_results_age_group ON assessment_results(age_group);

-- Update existing records to have default age_group if null
UPDATE assessment_results 
SET age_group = '5+' 
WHERE age_group IS NULL;