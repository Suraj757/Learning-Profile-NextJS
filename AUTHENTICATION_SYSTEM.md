# Authentication System Documentation

## Overview

The Begin Learning Profile platform implements a comprehensive authentication and authorization system designed specifically for educational environments. This system ensures FERPA compliance while protecting student data and maintaining proper educational relationships.

## Architecture

### Core Components

1. **Middleware Protection** (`/src/middleware.ts`)
   - Route-level authentication enforcement
   - Automatic redirects for unauthorized access
   - Security headers injection
   - Audit logging for all access attempts

2. **Authentication API** (`/src/app/api/auth/`)
   - JWT-based session management
   - Secure cookie handling
   - User type verification (teacher/parent)
   - Session lifecycle management

3. **Role-Based Access Control** (`/src/lib/auth/`)
   - Educational relationship verification
   - Permission-based data access
   - FERPA-compliant purpose validation
   - Audit trail generation

4. **User Interface** (`/src/app/auth/login/`)
   - Responsive login form
   - User type selection
   - Error handling and feedback
   - Demo credentials support

## Security Features

### Authentication Flow

1. **Initial Access**: User attempts to access protected resource
2. **Middleware Check**: System verifies session existence and validity
3. **Redirect**: Unauthenticated users redirected to `/auth/login`
4. **Login Process**: User provides credentials and user type
5. **Session Creation**: JWT token generated with educational context
6. **Cookie Setting**: Secure HTTP-only cookie established
7. **Access Granted**: User can access authorized resources

### Protected Routes

The following routes require authentication:

- `/teacher/dashboard` - Teacher dashboard and analytics
- `/teacher/student-cards` - Student reference cards
- `/teacher/classroom/*` - Classroom management pages
- `/teacher/assignments` - Assignment management
- `/teacher/send-assessment` - Assessment distribution
- `/results/*` - Student profile results
- `/api/profiles/*` - Student profile API endpoints
- `/api/teacher/*` - Teacher-specific API endpoints

### Public Routes

These routes remain accessible without authentication:

- `/` - Homepage
- `/assessment/*` - Student assessment flow
- `/demo/*` - Demo profiles and samples
- `/teachers` - Teacher landing page
- `/teacher/register` - Teacher registration
- `/teacher/help` - Help documentation
- `/auth/*` - Authentication pages

## User Types and Permissions

### Teachers
**Access Level**: Classroom-scoped student data

**Permissions**:
- `canViewStudentProfiles`: Access student learning profiles
- `canCreateAssessments`: Send assessment invitations
- `canViewClassroomAnalytics`: View classroom-level insights
- `canExportStudentData`: Export student data for educational purposes
- `canInviteParents`: Send parent invitations

**Data Access Rules**:
- Only students in assigned classrooms
- Must provide educational purpose for access
- All actions logged for FERPA compliance
- Cannot access sensitive personal information without specific permissions

### Parents
**Access Level**: Own children only

**Permissions**:
- `canViewOwnChildData`: View child's learning profile
- `canExportChildData`: Export child's data
- `canDeleteChildData`: Request data deletion
- `canManageConsent`: Manage data sharing preferences

**Data Access Rules**:
- Only verified parent-child relationships
- Full access to child's educational data
- Can modify privacy settings
- Can withdraw consent for data sharing

### Demo Users

For testing purposes, the following demo accounts are available:

**Teacher Demo Account**:
- Email: `demo@teacher.edu`
- Password: `demo123`
- User Type: `teacher`

**Parent Demo Account**:
- Email: `demo@parent.com`
- Password: `demo123`
- User Type: `parent`

## Session Management

### JWT Token Structure

```json
{
  "sub": "user_id",
  "iss": "learning-profile-platform",
  "aud": "educational-users",
  "exp": 1725897487,
  "iat": 1725810687,
  "session_id": "sess_1725810687_abc123",
  "role": "teacher",
  "school_id": "demo_school",
  "classroom_id": "classroom_001",
  "mfa_verified": false,
  "permissions": {
    "canViewStudentProfiles": true,
    "canCreateAssessments": true,
    // ... additional permissions
  }
}
```

### Session Security

- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS-only transmission in production
- **SameSite**: CSRF protection
- **Expiration**: 24 hours for parents, 8 hours for teachers
- **Automatic Refresh**: Sessions refresh when nearing expiration

## Educational Purpose Validation

All access to student data requires an educational purpose that meets FERPA requirements:

### Required Fields
- `purpose`: Specific reason for data access (minimum 10 characters)
- `justification`: Detailed explanation (minimum 20 characters)
- `category`: One of: 'instruction', 'assessment', 'safety', 'special_services', 'research'
- `requiredBy`: Who requested the access

### Example Valid Purpose
```json
{
  "purpose": "Review learning profile to prepare individualized instruction",
  "justification": "Student shows challenges in reading comprehension based on recent assessments. Need to understand learning preferences to modify instructional approach.",
  "category": "instruction",
  "requiredBy": "teacher"
}
```

## Audit Logging

All authentication events and data access attempts are logged:

### Logged Events
- Login attempts (successful/failed)
- Logout events
- Session creation/expiration
- Protected route access
- Data export requests
- Permission changes
- Security events (IP changes, suspicious activity)

### Audit Log Entry Structure
```json
{
  "id": "audit_1725810687_xyz789",
  "userId": "teacher_demo_001",
  "userType": "teacher",
  "action": "view_profile",
  "resourceType": "student_profile",
  "resourceId": "student_123",
  "studentId": "student_123",
  "educationalPurpose": "Assessment preparation",
  "timestamp": "2025-08-08T14:31:27.261Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "outcome": "success"
}
```

## Security Headers

The middleware adds security headers to all authenticated responses:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Error Handling

### Authentication Errors

- **401 Unauthorized**: No valid session found
- **403 Forbidden**: Valid session but insufficient permissions
- **400 Bad Request**: Missing required fields (email, password, userType)
- **500 Internal Server Error**: System error during authentication

### Error Response Format
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-08-08T14:31:27.261Z"
}
```

## Migration from Previous System

The authentication system includes compatibility with the existing localStorage-based authentication:

1. **Detection**: Middleware checks for old localStorage data in headers
2. **Migration**: Automatic session upgrade on next login
3. **Cleanup**: Old authentication data is cleared
4. **Seamless**: Users experience no disruption

## Configuration

### Environment Variables

```env
# JWT Secret (REQUIRED in production)
JWT_SECRET=your-production-secret-key

# Session Configuration
SESSION_MAX_AGE=28800  # 8 hours for teachers
PARENT_SESSION_MAX_AGE=86400  # 24 hours for parents

# Security Settings
NODE_ENV=production  # Enables secure cookies
```

### Development vs Production

**Development**:
- Demo users enabled
- Simple password validation
- Console logging active
- Insecure cookies (HTTP allowed)

**Production**:
- Real user database required
- Bcrypt password hashing
- Database audit logging
- Secure cookies only (HTTPS)
- Rate limiting enabled

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/login` - Check session status
- `POST /api/auth/logout` - User logout

### Protected APIs

- `GET /api/profiles/[id]` - Get student profile (requires auth + educational purpose)
- `POST /api/profiles` - Create student profile (public for assessments)
- `GET /api/teacher/*` - Teacher-specific endpoints

## Integration Points

### Frontend Components
- Login form with user type selection
- Session state management
- Automatic redirects for expired sessions
- Error boundary for auth failures

### Database Integration
- User profiles and authentication data
- Session storage and management
- Audit log persistence
- Educational relationship verification

## Troubleshooting

### Common Issues

1. **Infinite Redirect Loops**
   - Check middleware route configuration
   - Verify public routes are properly excluded
   - Ensure login page is accessible

2. **Session Not Persisting**
   - Verify cookie settings (httpOnly, secure, sameSite)
   - Check domain and path configuration
   - Ensure JWT secret is consistent

3. **Permission Denied Errors**
   - Verify user type and permissions
   - Check educational relationship data
   - Validate session token claims

### Debug Mode

Enable debug logging by setting `NODE_ENV=development`:

```bash
npm run dev
```

This will output detailed middleware processing logs to help diagnose issues.

## Next Steps

1. **Database Integration**: Replace demo users with real database
2. **Multi-Factor Authentication**: Add MFA for enhanced security  
3. **Advanced Audit Logging**: Database-backed audit trail
4. **Rate Limiting**: Prevent brute force attacks
5. **Session Monitoring**: Real-time security monitoring