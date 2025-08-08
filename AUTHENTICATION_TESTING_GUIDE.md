# Authentication System Testing Guide

## Overview

This comprehensive testing guide will help you verify that the authentication system is working correctly and provides proper security protections for student data. The tests are organized from basic functionality to advanced security scenarios.

## Prerequisites

1. **Development Environment**:
   ```bash
   npm run dev
   ```
   Server should be running on `http://localhost:3000`

2. **Testing Tools** (optional but recommended):
   - **curl** - Command line HTTP testing
   - **Browser Developer Tools** - Network and Application tabs
   - **Postman** - API testing (alternative to curl)

## Quick Start Testing

### 1. Basic Authentication Flow

**Test the complete user journey in 2 minutes:**

1. **Access Protected Route** (should redirect):
   - Go to `http://localhost:3000/teacher/dashboard`
   - ✅ **Expected**: Automatic redirect to `/auth/login?returnTo=%2Fteacher%2Fdashboard`

2. **Login with Demo Credentials**:
   - Email: `demo@teacher.edu`
   - Password: `demo123`
   - User Type: `teacher`
   - ✅ **Expected**: Successful login, redirect to teacher dashboard

3. **Verify Access**:
   - You should now see the teacher dashboard
   - ✅ **Expected**: Dashboard loads with your user info displayed

4. **Test Logout**:
   - Use logout button or go to new incognito window
   - Try accessing `http://localhost:3000/teacher/dashboard` again
   - ✅ **Expected**: Redirected back to login page

**✅ Success Criteria**: Complete flow works without errors

## Detailed Testing Scenarios

### Test Suite 1: Route Protection

#### Test 1.1: Protected Routes Redirect
Test that protected routes properly redirect unauthenticated users.

**Test Steps**:
```bash
# Open incognito window or clear cookies
# Test each protected route:

curl -I "http://localhost:3000/teacher/dashboard"
curl -I "http://localhost:3000/teacher/student-cards" 
curl -I "http://localhost:3000/results/student123"
```

**✅ Expected Results**:
- HTTP Status: `307 Temporary Redirect`
- Location header: `/auth/login?returnTo=[original-path]`

#### Test 1.2: Public Routes Accessible
Test that public routes remain accessible without authentication.

**Test Steps**:
```bash
curl -I "http://localhost:3000/"
curl -I "http://localhost:3000/assessment/start"
curl -I "http://localhost:3000/demo"
curl -I "http://localhost:3000/teachers"
curl -I "http://localhost:3000/auth/login"
```

**✅ Expected Results**:
- HTTP Status: `200 OK`
- No redirects to login page

### Test Suite 2: Authentication API

#### Test 2.1: Valid Login
Test successful authentication with demo credentials.

**Test Steps**:
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' \
  -c cookies.txt -v
```

**✅ Expected Results**:
```json
{
  "success": true,
  "user": {
    "id": "teacher_demo_001",
    "email": "demo@teacher.edu", 
    "name": "Demo Teacher",
    "userType": "teacher"
  },
  "sessionData": { ... },
  "message": "Login successful"
}
```
- HTTP Status: `200 OK`
- `Set-Cookie` header with `edu-session`
- Session cookie is HttpOnly and Secure (in production)

#### Test 2.2: Invalid Credentials
Test authentication failure with wrong credentials.

**Test Steps**:
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "wrong@email.com", "password": "wrongpass", "userType": "teacher"}'
```

**✅ Expected Results**:
```json
{
  "error": "Invalid credentials or user type"
}
```
- HTTP Status: `401 Unauthorized`
- No session cookie set

#### Test 2.3: Missing Required Fields
Test validation of required login fields.

**Test Steps**:
```bash
# Missing email
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"password": "demo123", "userType": "teacher"}'

# Missing userType  
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123"}'
```

**✅ Expected Results**:
- HTTP Status: `400 Bad Request`
- Error message about missing required fields

### Test Suite 3: Session Management

#### Test 3.1: Session Validation
Test that valid sessions allow access to protected routes.

**Test Steps**:
```bash
# First, login and save cookies
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' \
  -c cookies.txt

# Then access protected route with session
curl -I "http://localhost:3000/teacher/dashboard" -b cookies.txt
```

**✅ Expected Results**:
- HTTP Status: `200 OK`
- No redirect to login page
- Security headers present

#### Test 3.2: Session Status Check
Test the session status endpoint.

**Test Steps**:
```bash
# With valid session
curl "http://localhost:3000/api/auth/login" -b cookies.txt

# Without session  
curl "http://localhost:3000/api/auth/login"
```

**✅ Expected Results**:

*With session*:
```json
{
  "authenticated": true,
  "user": {
    "id": "teacher_demo_001",
    "email": "demo@teacher.edu",
    "name": "Demo Teacher", 
    "userType": "teacher"
  }
}
```

*Without session*:
```json
{
  "authenticated": false
}
```

#### Test 3.3: Logout Functionality
Test that logout properly clears sessions.

**Test Steps**:
```bash
# Login first
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' \
  -c cookies.txt

# Verify access works
curl -I "http://localhost:3000/teacher/dashboard" -b cookies.txt

# Logout
curl -X POST "http://localhost:3000/api/auth/logout" -b cookies.txt -c cookies.txt

# Verify access no longer works
curl -I "http://localhost:3000/teacher/dashboard" -b cookies.txt
```

**✅ Expected Results**:
- Logout returns success message
- Session cookie is cleared (maxAge=0)
- Protected routes redirect to login after logout

### Test Suite 4: User Types and Permissions

#### Test 4.1: Teacher Account Access
Test teacher-specific functionality.

**Test Steps**:
1. Login with teacher demo account
2. Navigate to teacher-specific pages:
   - `/teacher/dashboard`
   - `/teacher/student-cards`
   - `/teacher/send-assessment`

**✅ Expected Results**:
- All teacher pages accessible
- User shown as "Demo Teacher"
- Teacher-specific features visible

#### Test 4.2: Parent Account Access
Test parent-specific functionality.

**Test Steps**:
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@parent.com", "password": "demo123", "userType": "parent"}' \
  -c parent_cookies.txt
```

**✅ Expected Results**:
- Login successful with parent user type
- Different permission set than teacher
- Parent-specific UI elements

### Test Suite 5: Security Headers

#### Test 5.1: Security Headers Present
Test that proper security headers are set on authenticated routes.

**Test Steps**:
```bash
# Login first
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' \
  -c cookies.txt

# Check headers on protected route
curl -I "http://localhost:3000/teacher/dashboard" -b cookies.txt
```

**✅ Expected Headers**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Test Suite 6: Edge Cases and Error Handling

#### Test 6.1: Expired Session Handling
Test behavior when session expires.

**Test Steps**:
1. Login and note the session expiration time
2. Wait for session to expire (or manually modify cookie expiration)
3. Try to access protected route

**✅ Expected Results**:
- Redirect to login page
- Clear error message about session expiration

#### Test 6.2: Invalid Session Data
Test handling of corrupted session cookies.

**Test Steps**:
```bash
# Set invalid cookie manually
curl -I "http://localhost:3000/teacher/dashboard" \
  -H "Cookie: edu-session=invalid-data"
```

**✅ Expected Results**:
- Redirect to login page
- No error messages exposed to user
- System handles gracefully

#### Test 6.3: Concurrent Sessions
Test behavior with multiple sessions.

**Test Steps**:
1. Login in Browser 1
2. Login in Browser 2 with same account
3. Test access from both browsers

**✅ Expected Results**:
- Both sessions should work
- No interference between sessions
- Proper isolation

## Browser-Based Testing

### Manual UI Testing

#### Test UI-1: Login Form Validation
1. Go to `/auth/login`
2. Try submitting with:
   - Empty fields
   - Invalid email format  
   - Short password
   - Wrong user type

**✅ Expected Results**:
- Clear validation messages
- Form doesn't submit until valid
- Good user experience

#### Test UI-2: User Type Switching
1. Go to login page
2. Switch between "Teacher" and "Parent" user types
3. Note changes in form appearance

**✅ Expected Results**:
- Email placeholder changes
- Instructions update appropriately
- Registration options change

#### Test UI-3: Remember Return URL
1. Try to access `/teacher/student-cards` without login
2. Complete login process
3. Verify redirect after login

**✅ Expected Results**:
- Redirected to original requested page
- Not just dashboard

### Browser Developer Tools Testing

#### DevTools-1: Cookie Inspection
1. Login to the application
2. Open Developer Tools → Application → Cookies
3. Find `edu-session` cookie

**✅ Expected Properties**:
- HttpOnly: ✓ (prevents JavaScript access)
- Secure: ✓ (in production)
- SameSite: Strict
- Expiration: 24 hours from creation

#### DevTools-2: Network Request Analysis
1. Open Developer Tools → Network
2. Perform login
3. Navigate to protected pages

**✅ Expected Behavior**:
- Login request shows 200 status
- Protected page requests show 200 (not 307)
- Session cookie sent with all requests

## Load and Performance Testing

### Basic Load Testing

#### Load-1: Multiple Login Attempts
```bash
# Test concurrent logins
for i in {1..10}; do
  curl -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' &
done
wait
```

**✅ Expected Results**:
- All requests succeed
- No rate limiting errors (in development)
- Consistent response times

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: "Middleware not redirecting"
**Symptoms**: Can access protected routes without login
**Check**:
1. Middleware file exists at `src/middleware.ts`
2. Route is listed in `PROTECTED_ROUTES`
3. Route is not in `PUBLIC_ROUTES`
4. Middleware config matcher is correct

**Debug**:
```bash
# Check if route requires auth
node -e "
const PROTECTED_ROUTES = ['/teacher/dashboard', ...];
const pathname = '/teacher/dashboard';
console.log('Protected:', PROTECTED_ROUTES.some(r => pathname.startsWith(r)));
"
```

#### Issue: "Login succeeds but still redirected"
**Symptoms**: Login API returns success, but protected routes still redirect
**Check**:
1. Session cookie is being set
2. Cookie domain and path are correct
3. Middleware authentication logic
4. Session data format

**Debug**:
```bash
# Check session cookie
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' \
  -v
# Look for Set-Cookie in response headers
```

#### Issue: "Session expires immediately"
**Symptoms**: Need to login repeatedly
**Check**:
1. Cookie expiration settings
2. System clock synchronization
3. JWT secret consistency
4. Session data corruption

**Debug**:
```bash
# Check cookie expiration
curl "http://localhost:3000/api/auth/login" -b cookies.txt
# Should return authenticated: true
```

### Debug Mode

Enable detailed logging for troubleshooting:

1. **Console Logs**: Check browser console for errors
2. **Network Tab**: Monitor request/response details  
3. **Application Tab**: Inspect cookies and local storage
4. **Server Logs**: Check terminal running `npm run dev`

## Security Testing

### Basic Security Checks

#### Security-1: XSS Prevention
Test that user input is properly sanitized:
1. Try entering `<script>alert('xss')</script>` in login form
2. Check that it's not executed
3. Verify proper escaping

#### Security-2: CSRF Protection
Test Cross-Site Request Forgery protection:
1. Try making login request from different origin
2. Check SameSite cookie settings
3. Verify proper CORS handling

#### Security-3: Session Hijacking Prevention
Test session security:
1. Verify HttpOnly cookie setting
2. Check Secure flag in production
3. Test session invalidation on logout

## Automated Testing Script

Save this as `test-auth.sh` for automated testing:

```bash
#!/bin/bash

echo "🔐 Authentication System Test Suite"
echo "=================================="

# Test 1: Protected route redirects
echo "Test 1: Protected route protection..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/teacher/dashboard")
if [ "$STATUS" = "307" ]; then
    echo "✅ Protected route correctly redirects"
else
    echo "❌ Protected route test failed (Status: $STATUS)"
fi

# Test 2: Public route accessible
echo "Test 2: Public route access..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/")
if [ "$STATUS" = "200" ]; then
    echo "✅ Public route accessible"
else
    echo "❌ Public route test failed (Status: $STATUS)"
fi

# Test 3: Login API works
echo "Test 3: Login API..."
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' \
  -c cookies.txt)

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Login API works"
else
    echo "❌ Login API test failed"
    echo "Response: $RESPONSE"
fi

# Test 4: Authenticated access
echo "Test 4: Authenticated route access..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/teacher/dashboard" -b cookies.txt)
if [ "$STATUS" = "200" ]; then
    echo "✅ Authenticated access works"
else
    echo "❌ Authenticated access failed (Status: $STATUS)"
fi

# Cleanup
rm -f cookies.txt

echo "=================================="
echo "🎉 Test suite complete!"
```

Make it executable and run:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

## Test Results Documentation

After running tests, document your results:

### Test Report Template

```markdown
# Authentication Test Results

**Date**: [Date]
**Tester**: [Your Name]  
**Environment**: [Development/Staging/Production]

## Summary
- ✅ Basic Authentication Flow: PASS
- ✅ Route Protection: PASS
- ✅ Session Management: PASS
- ✅ User Types: PASS
- ✅ Security Headers: PASS
- ✅ Error Handling: PASS

## Detailed Results

### Route Protection Tests
- Protected routes redirect: ✅ PASS
- Public routes accessible: ✅ PASS
- Proper return URLs: ✅ PASS

### Authentication API Tests
- Valid login: ✅ PASS
- Invalid credentials: ✅ PASS
- Missing fields: ✅ PASS

### Session Management Tests
- Session validation: ✅ PASS
- Session status check: ✅ PASS
- Logout functionality: ✅ PASS

## Issues Found
[None / List any issues]

## Recommendations
[Any improvements or additional tests needed]
```

This comprehensive testing guide ensures your authentication system is secure, functional, and ready for educational use with proper student data protection.