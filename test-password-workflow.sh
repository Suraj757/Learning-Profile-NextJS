#!/bin/bash

echo "🔐 Testing Password Management Workflow"
echo "======================================="

BASE_URL="http://localhost:3000"

echo ""
echo "📋 Test 1: Check if existing user needs password setup"
echo "---------------------------------------------------"
curl -s "${BASE_URL}/api/auth/setup-password?email=suraj@speakaboos.com" | python3 -m json.tool

echo ""
echo "📋 Test 2: Try login with user who needs password setup"
echo "--------------------------------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"suraj@speakaboos.com","password":"wrongpassword","userType":"teacher"}' | python3 -m json.tool

echo ""
echo "📋 Test 3: Set up password for existing user"
echo "--------------------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/setup-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"suraj@speakaboos.com","password":"SecurePass123","confirmPassword":"SecurePass123"}' | python3 -m json.tool

echo ""
echo "📋 Test 4: Login with newly set password"
echo "----------------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"suraj@speakaboos.com","password":"SecurePass123","userType":"teacher"}' | python3 -m json.tool

echo ""
echo "📋 Test 5: Register new teacher account"
echo "---------------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Teacher","email":"test@teacher.edu","password":"NewPass123","confirmPassword":"NewPass123","school":"Test School","gradeLevel":"3rd Grade"}' | python3 -m json.tool

echo ""
echo "📋 Test 6: Login with newly registered teacher"
echo "----------------------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@teacher.edu","password":"NewPass123","userType":"teacher"}' | python3 -m json.tool

echo ""
echo "📋 Test 7: Demo user login (legacy simple passwords)"
echo "----------------------------------------------------"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@teacher.edu","password":"demo123","userType":"teacher"}' | python3 -m json.tool

echo ""
echo "🎉 Password Management Workflow Tests Complete!"
echo "==============================================="