-- Database Schema Updates for Enhanced Age Selection System
-- Supports precise age input and extended age ranges

-- 1. Add precise age fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS precise_age_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS precise_age_months INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_input_method VARCHAR(20) DEFAULT 'age_group'; -- 'age_group', 'precise_age', 'birth_date'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS question_set_type VARCHAR(20) DEFAULT 'pure'; -- 'pure', 'hybrid', 'extended'

-- 2. Add precise age fields to progress table  
ALTER TABLE progress ADD COLUMN IF NOT EXISTS precise_age_years INTEGER;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS precise_age_months INTEGER;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS age_input_method VARCHAR(20) DEFAULT 'age_group';
ALTER TABLE progress ADD COLUMN IF NOT EXISTS question_set_type VARCHAR(20) DEFAULT 'pure';

-- 3. Create computed columns for easier querying
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_age_months INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN precise_age_years IS NOT NULL AND precise_age_months IS NOT NULL 
    THEN precise_age_years * 12 + precise_age_months
    ELSE NULL
  END
) STORED;

ALTER TABLE progress ADD COLUMN IF NOT EXISTS total_age_months INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN precise_age_years IS NOT NULL AND precise_age_months IS NOT NULL 
    THEN precise_age_years * 12 + precise_age_months
    ELSE NULL
  END
) STORED;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_precise_age ON profiles(precise_age_years, precise_age_months);
CREATE INDEX IF NOT EXISTS idx_profiles_total_age_months ON profiles(total_age_months);
CREATE INDEX IF NOT EXISTS idx_profiles_question_set_type ON profiles(question_set_type);

CREATE INDEX IF NOT EXISTS idx_progress_precise_age ON progress(precise_age_years, precise_age_months);
CREATE INDEX IF NOT EXISTS idx_progress_total_age_months ON progress(total_age_months);

-- 5. Update existing records to have precise age data (migration script)
-- This would be run as a one-time migration to populate precise age from existing age_group data

UPDATE profiles 
SET 
  precise_age_years = CASE 
    WHEN age_group = '3-4' THEN 3
    WHEN age_group = '4-5' THEN 4  
    WHEN age_group = '5+' THEN 5
    ELSE 5
  END,
  precise_age_months = CASE 
    WHEN age_group = '3-4' THEN 6
    WHEN age_group = '4-5' THEN 6
    WHEN age_group = '5+' THEN 6
    ELSE 6
  END,
  age_input_method = 'age_group'
WHERE precise_age_years IS NULL;

UPDATE progress 
SET 
  precise_age_years = CASE 
    WHEN age_group = '3-4' THEN 3
    WHEN age_group = '4-5' THEN 4
    WHEN age_group = '5+' THEN 5
    ELSE 5
  END,
  precise_age_months = CASE 
    WHEN age_group = '3-4' THEN 6
    WHEN age_group = '4-5' THEN 6
    WHEN age_group = '5+' THEN 6
    ELSE 6
  END,
  age_input_method = 'age_group'
WHERE precise_age_years IS NULL;

-- 6. Create view for age group analytics
CREATE OR REPLACE VIEW age_group_analytics AS
SELECT 
  age_group,
  question_set_type,
  age_input_method,
  COUNT(*) as profile_count,
  AVG(total_age_months) as avg_age_months,
  MIN(total_age_months) as min_age_months,
  MAX(total_age_months) as max_age_months,
  AVG(
    CASE 
      WHEN responses IS NOT NULL 
      THEN json_array_length(responses::json)
      ELSE 0 
    END
  ) as avg_questions_answered
FROM profiles 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY age_group, question_set_type, age_input_method
ORDER BY age_group, question_set_type;

-- 7. Create function to determine age group from precise age
CREATE OR REPLACE FUNCTION get_age_group_from_precise_age(
  years INTEGER, 
  months INTEGER
) RETURNS VARCHAR(10) AS $$
DECLARE
  total_months INTEGER;
BEGIN
  total_months := years * 12 + months;
  
  IF total_months < 42 THEN -- < 3.5 years
    RETURN '3-4';
  ELSIF total_months < 66 THEN -- 3.5 - 5.5 years  
    RETURN '4-5';
  ELSE -- 5.5+ years
    RETURN '5+';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Create function to determine question set type
CREATE OR REPLACE FUNCTION get_question_set_type(
  years INTEGER,
  months INTEGER
) RETURNS VARCHAR(20) AS $$
DECLARE
  total_months INTEGER;
BEGIN
  total_months := years * 12 + months;
  
  IF total_months < 42 THEN -- < 3.5 years
    RETURN 'pure';
  ELSIF total_months < 54 THEN -- 3.5 - 4.5 years (bridge/hybrid)
    RETURN 'hybrid';
  ELSIF total_months < 72 THEN -- 4.5 - 6.0 years
    RETURN 'pure';
  ELSE -- 6.0+ years
    RETURN 'extended';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Create triggers to auto-populate age_group from precise age
CREATE OR REPLACE FUNCTION update_age_group_from_precise_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.precise_age_years IS NOT NULL AND NEW.precise_age_months IS NOT NULL THEN
    NEW.age_group := get_age_group_from_precise_age(NEW.precise_age_years, NEW.precise_age_months);
    NEW.question_set_type := get_question_set_type(NEW.precise_age_years, NEW.precise_age_months);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to both tables
DROP TRIGGER IF EXISTS trigger_update_age_group_profiles ON profiles;
CREATE TRIGGER trigger_update_age_group_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_age_group_from_precise_age();

DROP TRIGGER IF EXISTS trigger_update_age_group_progress ON progress;
CREATE TRIGGER trigger_update_age_group_progress
  BEFORE INSERT OR UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_age_group_from_precise_age();

-- 10. Create age distribution report
CREATE OR REPLACE VIEW age_distribution_report AS
SELECT 
  CASE 
    WHEN total_age_months < 36 THEN 'Under 3 years'
    WHEN total_age_months < 42 THEN '3.0-3.5 years'
    WHEN total_age_months < 48 THEN '3.5-4.0 years'
    WHEN total_age_months < 54 THEN '4.0-4.5 years'
    WHEN total_age_months < 60 THEN '4.5-5.0 years'
    WHEN total_age_months < 66 THEN '5.0-5.5 years'
    WHEN total_age_months < 72 THEN '5.5-6.0 years'
    WHEN total_age_months < 78 THEN '6.0-6.5 years'
    WHEN total_age_months < 84 THEN '6.5-7.0 years'
    WHEN total_age_months < 90 THEN '7.0-7.5 years'
    WHEN total_age_months < 96 THEN '7.5-8.0 years'
    ELSE '8.0+ years'
  END as age_range,
  age_group,
  question_set_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM profiles 
WHERE total_age_months IS NOT NULL
GROUP BY 
  CASE 
    WHEN total_age_months < 36 THEN 'Under 3 years'
    WHEN total_age_months < 42 THEN '3.0-3.5 years'
    WHEN total_age_months < 48 THEN '3.5-4.0 years'
    WHEN total_age_months < 54 THEN '4.0-4.5 years'
    WHEN total_age_months < 60 THEN '4.5-5.0 years'
    WHEN total_age_months < 66 THEN '5.0-5.5 years'
    WHEN total_age_months < 72 THEN '5.5-6.0 years'
    WHEN total_age_months < 78 THEN '6.0-6.5 years'
    WHEN total_age_months < 84 THEN '6.5-7.0 years'
    WHEN total_age_months < 90 THEN '7.0-7.5 years'
    WHEN total_age_months < 96 THEN '7.5-8.0 years'
    ELSE '8.0+ years'
  END,
  age_group,
  question_set_type
ORDER BY MIN(total_age_months);

-- 11. Performance optimization for common queries
-- Index for finding profiles by precise age range
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON profiles(total_age_months, created_at);

-- Partial index for recent profiles only (performance optimization)
CREATE INDEX IF NOT EXISTS idx_profiles_recent_precise_age ON profiles(precise_age_years, precise_age_months, created_at)
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';

-- 12. Data validation constraints
ALTER TABLE profiles ADD CONSTRAINT chk_precise_age_years 
  CHECK (precise_age_years IS NULL OR (precise_age_years >= 0 AND precise_age_years <= 12));

ALTER TABLE profiles ADD CONSTRAINT chk_precise_age_months 
  CHECK (precise_age_months IS NULL OR (precise_age_months >= 0 AND precise_age_months <= 11));

ALTER TABLE profiles ADD CONSTRAINT chk_age_input_method 
  CHECK (age_input_method IN ('age_group', 'precise_age', 'birth_date'));

ALTER TABLE profiles ADD CONSTRAINT chk_question_set_type 
  CHECK (question_set_type IN ('pure', 'hybrid', 'extended'));

-- Apply same constraints to progress table
ALTER TABLE progress ADD CONSTRAINT chk_progress_precise_age_years 
  CHECK (precise_age_years IS NULL OR (precise_age_years >= 0 AND precise_age_years <= 12));

ALTER TABLE progress ADD CONSTRAINT chk_progress_precise_age_months 
  CHECK (precise_age_months IS NULL OR (precise_age_months >= 0 AND precise_age_months <= 11));

ALTER TABLE progress ADD CONSTRAINT chk_progress_age_input_method 
  CHECK (age_input_method IN ('age_group', 'precise_age', 'birth_date'));

ALTER TABLE progress ADD CONSTRAINT chk_progress_question_set_type 
  CHECK (question_set_type IN ('pure', 'hybrid', 'extended'));

-- 13. Create backup table for migration safety
CREATE TABLE IF NOT EXISTS profiles_backup_pre_precise_age AS 
SELECT * FROM profiles WHERE created_at < CURRENT_TIMESTAMP;

-- 14. Comments for documentation
COMMENT ON COLUMN profiles.precise_age_years IS 'Child age in years (0-12), used for precise age-based question routing';
COMMENT ON COLUMN profiles.precise_age_months IS 'Additional months (0-11), combined with years for precise age calculation';
COMMENT ON COLUMN profiles.birth_date IS 'Child birth date, used when parent inputs birthdate instead of age';
COMMENT ON COLUMN profiles.age_input_method IS 'How parent specified age: age_group (legacy), precise_age, or birth_date';
COMMENT ON COLUMN profiles.question_set_type IS 'Type of questions used: pure (standard), hybrid (bridge), or extended (6+ years)';
COMMENT ON COLUMN profiles.total_age_months IS 'Computed total age in months for easy querying and analysis';

-- This completes the database schema updates for the enhanced age selection system