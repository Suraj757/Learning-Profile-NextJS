-- Fix foreign key constraint violation for profile_assignments
-- This script adds the missing teacher records that are referenced by the authentication system

-- Insert the missing teacher records for test accounts
INSERT INTO teachers (id, email, name, school, grade_level, ambassador_status, created_at, updated_at)
VALUES 
  (1001, 'suraj+1@speakaboos.com', 'Suraj Kumar', 'Speakaboos Elementary', '3rd Grade', false, NOW(), NOW()),
  (1002, 'suraj+2@speakaboos.com', 'Suraj Kumar', 'Speakaboos Elementary', '3rd Grade', false, NOW(), NOW()),
  (1000, 'suraj@speakaboos.com', 'Suraj Kumar', 'Speakaboos Elementary', '3rd Grade', false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  school = EXCLUDED.school,
  grade_level = EXCLUDED.grade_level,
  updated_at = NOW();

-- Verify the teachers were created
SELECT id, email, name, school, grade_level FROM teachers WHERE id IN (1000, 1001, 1002);

-- Check if there are any orphaned profile_assignments
SELECT pa.id, pa.teacher_id, pa.parent_email, pa.child_name 
FROM profile_assignments pa 
LEFT JOIN teachers t ON pa.teacher_id = t.id 
WHERE t.id IS NULL;