#!/bin/bash

echo "🎯 Final Password Management Workflow Test"
echo "=========================================="

BASE_URL="http://localhost:3000"

echo ""
echo "✅ Test 1: NEW TEACHER REGISTRATION"
echo "------------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Teacher Test",
    "email": "newteacher@test.edu", 
    "password": "NewPassword123",
    "confirmPassword": "NewPassword123",
    "school": "Test Elementary",
    "gradeLevel": "2nd Grade"
  }' | python3 -m json.tool

echo ""
echo "✅ Test 2: LOGIN WITH NEW TEACHER"
echo "----------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newteacher@test.edu",
    "password": "NewPassword123", 
    "userType": "teacher"
  }' | python3 -m json.tool

echo ""
echo "✅ Test 3: EXISTING USER PASSWORD SETUP (suraj@speakaboos.com)"
echo "--------------------------------------------------------------"

echo ""
echo "3a. Check if user needs password setup:"
curl -s "${BASE_URL}/api/auth/setup-password?email=suraj@speakaboos.com" | python3 -m json.tool

echo ""
echo "3b. Set up password:"
curl -s -X POST "${BASE_URL}/api/auth/setup-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "suraj@speakaboos.com",
    "password": "SurajSecure123", 
    "confirmPassword": "SurajSecure123"
  }' | python3 -m json.tool

echo ""
echo "3c. Try to login with new password:"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "suraj@speakaboos.com",
    "password": "SurajSecure123",
    "userType": "teacher"
  }' | python3 -m json.tool

echo ""
echo "✅ Test 4: DEMO USER LOGIN (backwards compatibility)"
echo "---------------------------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@teacher.edu",
    "password": "demo123",
    "userType": "teacher"
  }' | python3 -m json.tool

echo ""
echo "✅ Test 5: VALIDATION TESTS"
echo "---------------------------"

echo ""
echo "5a. Try weak password (should fail):"
curl -s -X POST "${BASE_URL}/api/auth/setup-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "suraj@speakaboos.com",
    "password": "weak", 
    "confirmPassword": "weak"
  }' | python3 -m json.tool

echo ""
echo "5b. Try password mismatch (should fail):"
curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fail Test",
    "email": "fail@test.edu",
    "password": "Password123",
    "confirmPassword": "DifferentPassword123",
    "school": "Test School"
  }' | python3 -m json.tool

echo ""
echo "🎉 Complete Password Management Workflow Test Finished!"
echo "======================================================="