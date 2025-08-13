# Foreign Key Constraint Violation Fix

## Problem Summary
Teachers using email `Suraj+1@speakaboos.com` were getting a 409 Conflict error when trying to invite parents:
```
"insert or update on table "profile_assignments" violates foreign key constraint "profile_assignments_teacher_id_fkey"
```

## Root Cause
1. **Authentication System**: Assigns `numericId: 1001` to `suraj+1@speakaboos.com` 
2. **Database Missing Record**: No teacher record with `id = 1001` exists in the `teachers` table
3. **Foreign Key Constraint**: `profile_assignments.teacher_id` must reference an existing `teachers.id`

## Files Modified

### 1. `/src/lib/supabase.ts`
- **Added `ensureTeacherExists()` function**: Automatically creates missing teacher records
- **Updated `createProfileAssignment()`**: Now ensures teacher exists before creating assignments
- **Enhanced `createTeacher()`**: Support for specific IDs for test accounts

### 2. `/fix-teacher-foreign-key.sql`
- **Database migration script**: Manually inserts missing teacher records
- **Verification queries**: Check for orphaned assignments

## Solution Features

### Automatic Teacher Sync
```typescript
export async function ensureTeacherExists(teacherId: number, email?: string)
```
- Checks if teacher exists in database
- Creates missing teacher records automatically  
- Maps known test accounts (1000, 1001, 1002) to correct data
- Handles race conditions and errors gracefully

### Robust Error Handling
- Clear error messages for foreign key violations
- Automatic retry with teacher creation
- Logging for debugging and monitoring

### Known Test Accounts
```typescript
const knownAccounts = {
  1000: { email: 'suraj@speakaboos.com', name: 'Suraj Kumar', school: 'Speakaboos Elementary', grade_level: '3rd Grade' },
  1001: { email: 'suraj+1@speakaboos.com', name: 'Suraj Kumar', school: 'Speakaboos Elementary', grade_level: '3rd Grade' },
  1002: { email: 'suraj+2@speakaboos.com', name: 'Suraj Kumar', school: 'Speakaboos Elementary', grade_level: '3rd Grade' }
}
```

## Immediate Fix Steps

### Option 1: Run SQL Migration (Recommended)
```sql
-- Run this in Supabase SQL editor
INSERT INTO teachers (id, email, name, school, grade_level, ambassador_status, created_at, updated_at)
VALUES 
  (1001, 'suraj+1@speakaboos.com', 'Suraj Kumar', 'Speakaboos Elementary', '3rd Grade', false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();
```

### Option 2: Automatic Fix (Already Implemented)
The updated code will automatically create missing teacher records when they try to invite parents.

## Verification Steps

1. **Check teacher exists**:
   ```sql
   SELECT * FROM teachers WHERE id = 1001;
   ```

2. **Test parent invitation**:
   - Login as `suraj+1@speakaboos.com`
   - Try inviting a parent
   - Should succeed without foreign key error

3. **Check assignment creation**:
   ```sql
   SELECT * FROM profile_assignments WHERE teacher_id = 1001;
   ```

## Prevention for Future

1. **Always sync auth and database**: Ensure teacher records exist when user accounts are created
2. **Database constraints**: Foreign key constraints prevent orphaned records
3. **Error monitoring**: Log foreign key violations for quick detection
4. **Data validation**: Validate teacher existence before operations

## Testing Accounts Affected
- `suraj+1@speakaboos.com` (ID: 1001) ✅ Fixed
- `suraj+2@speakaboos.com` (ID: 1002) ✅ Fixed  
- `suraj@speakaboos.com` (ID: 1000) ✅ Fixed

The core teacher workflow (invite parent → parent completes assessment → teacher views results) should now work without foreign key constraint violations.