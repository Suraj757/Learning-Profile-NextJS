#!/bin/bash

# Authentication System Test Suite
# Run this script to verify authentication system functionality

echo "🔐 Begin Learning Authentication System Test Suite"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASS=0
FAIL=0

# Helper function for test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((FAIL++))
        if [ ! -z "$3" ]; then
            echo -e "${YELLOW}   Details: $3${NC}"
        fi
    fi
}

# Check if server is running
echo "🌐 Checking server availability..."
if curl -s -f "http://localhost:3000" > /dev/null; then
    echo -e "${GREEN}✅ Server is running on localhost:3000${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start with: npm run dev${NC}"
    exit 1
fi
echo ""

# Test Suite 1: Route Protection
echo "📁 Test Suite 1: Route Protection"
echo "================================"

# Test 1.1: Protected routes redirect
echo "Test 1.1: Protected routes redirect to login..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/teacher/dashboard")
if [ "$STATUS" = "307" ]; then
    test_result 0 "Protected route /teacher/dashboard redirects (307)"
else
    test_result 1 "Protected route /teacher/dashboard should redirect" "Got status: $STATUS"
fi

# Test 1.2: Public routes accessible  
echo "Test 1.2: Public routes remain accessible..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/")
if [ "$STATUS" = "200" ]; then
    test_result 0 "Public route / is accessible (200)"
else
    test_result 1 "Public route / should be accessible" "Got status: $STATUS"
fi

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/auth/login")
if [ "$STATUS" = "200" ]; then
    test_result 0 "Login page /auth/login is accessible (200)"
else
    test_result 1 "Login page /auth/login should be accessible" "Got status: $STATUS"
fi

echo ""

# Test Suite 2: Authentication API
echo "🔑 Test Suite 2: Authentication API"
echo "===================================="

# Test 2.1: Valid login
echo "Test 2.1: Valid login credentials..."
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' \
  -c cookies.txt -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    test_result 0 "Valid login returns success (200)"
    
    # Check if cookie was set
    if [ -f "cookies.txt" ] && grep -q "edu-session" cookies.txt; then
        test_result 0 "Session cookie is set"
    else
        test_result 1 "Session cookie should be set"
    fi
else
    test_result 1 "Valid login should succeed" "Status: $HTTP_CODE"
fi

# Test 2.2: Invalid login
echo "Test 2.2: Invalid login credentials..."
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "wrong@email.com", "password": "wrongpass", "userType": "teacher"}' \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "401" ] && echo "$BODY" | grep -q "error"; then
    test_result 0 "Invalid login returns error (401)"
else
    test_result 1 "Invalid login should return 401 error" "Status: $HTTP_CODE"
fi

# Test 2.3: Missing fields
echo "Test 2.3: Missing required fields..."
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"password": "demo123", "userType": "teacher"}' \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "400" ]; then
    test_result 0 "Missing email returns 400 error"
else
    test_result 1 "Missing email should return 400 error" "Status: $HTTP_CODE"
fi

echo ""

# Test Suite 3: Session Management
echo "🎫 Test Suite 3: Session Management"  
echo "===================================="

# Test 3.1: Session allows access
echo "Test 3.1: Valid session allows access to protected routes..."
if [ -f "cookies.txt" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/teacher/dashboard" -b cookies.txt)
    if [ "$STATUS" = "200" ]; then
        test_result 0 "Authenticated access to protected route (200)"
    else
        test_result 1 "Authenticated user should access protected route" "Status: $STATUS"
    fi
else
    test_result 1 "Session cookie file not found" "Login test may have failed"
fi

# Test 3.2: Session status check
echo "Test 3.2: Session status endpoint..."
if [ -f "cookies.txt" ]; then
    RESPONSE=$(curl -s "http://localhost:3000/api/auth/login" -b cookies.txt)
    if echo "$RESPONSE" | grep -q '"authenticated":true'; then
        test_result 0 "Session status returns authenticated"
    else
        test_result 1 "Session status should show authenticated" "Response: $RESPONSE"
    fi
fi

# Test 3.3: Logout functionality
echo "Test 3.3: Logout clears session..."
if [ -f "cookies.txt" ]; then
    LOGOUT_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/logout" -b cookies.txt -c cookies.txt -w "\nHTTP_CODE:%{http_code}")
    HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    
    if [ "$HTTP_CODE" = "200" ]; then
        test_result 0 "Logout endpoint returns success (200)"
        
        # Test that protected route now redirects
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/teacher/dashboard" -b cookies.txt)
        if [ "$STATUS" = "307" ]; then
            test_result 0 "After logout, protected route redirects (307)"
        else
            test_result 1 "After logout, protected route should redirect" "Status: $STATUS"
        fi
    else
        test_result 1 "Logout should return 200" "Status: $HTTP_CODE"
    fi
fi

echo ""

# Test Suite 4: Security Headers
echo "🛡️  Test Suite 4: Security Headers"
echo "=================================="

# Login again for security header tests
curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@teacher.edu", "password": "demo123", "userType": "teacher"}' \
  -c cookies.txt > /dev/null

echo "Test 4.1: Security headers on authenticated routes..."
HEADERS=$(curl -s -I "http://localhost:3000/teacher/dashboard" -b cookies.txt)

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    test_result 0 "X-Content-Type-Options header present"
else
    test_result 1 "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "x-frame-options"; then
    test_result 0 "X-Frame-Options header present"
else
    test_result 1 "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -qi "x-xss-protection"; then
    test_result 0 "X-XSS-Protection header present"
else
    test_result 1 "X-XSS-Protection header missing"
fi

echo ""

# Test Suite 5: User Types
echo "👥 Test Suite 5: User Types"
echo "============================"

echo "Test 5.1: Parent account login..."
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@parent.com", "password": "demo123", "userType": "parent"}' \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"userType":"parent"'; then
    test_result 0 "Parent account login successful"
else
    test_result 1 "Parent account login should succeed" "Status: $HTTP_CODE"
fi

echo ""

# Test Suite 6: Edge Cases
echo "⚠️  Test Suite 6: Edge Cases"
echo "============================="

echo "Test 6.1: Invalid session data handling..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/teacher/dashboard" \
  -H "Cookie: edu-session=invalid-data")

if [ "$STATUS" = "307" ]; then
    test_result 0 "Invalid session data redirects to login (307)"
else
    test_result 1 "Invalid session should redirect to login" "Status: $STATUS"
fi

echo "Test 6.2: Empty session cookie handling..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/teacher/dashboard" \
  -H "Cookie: edu-session=")

if [ "$STATUS" = "307" ]; then
    test_result 0 "Empty session cookie redirects to login (307)"
else
    test_result 1 "Empty session should redirect to login" "Status: $STATUS"
fi

echo ""

# Cleanup
if [ -f "cookies.txt" ]; then
    rm cookies.txt
fi

# Final Results
echo "=================================================="
echo "🎯 Test Results Summary"
echo "=================================================="
echo -e "${GREEN}✅ Passed: $PASS tests${NC}"
echo -e "${RED}❌ Failed: $FAIL tests${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Authentication system is working correctly.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test the system manually using the browser"
    echo "2. Review AUTHENTICATION_SYSTEM.md for detailed documentation"
    echo "3. Check DATA_POLICY.md for privacy compliance information"
    echo "4. See AUTHENTICATION_TESTING_GUIDE.md for more comprehensive tests"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Ensure the development server is running (npm run dev)"
    echo "2. Check middleware.ts is present and configured correctly"
    echo "3. Verify authentication API endpoints are working"
    echo "4. Review server console logs for errors"
    exit 1
fi