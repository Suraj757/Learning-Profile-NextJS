#!/bin/bash

echo "🔍 Debugging Password Setup Issue"
echo "================================="

BASE_URL="http://localhost:3000"

echo ""
echo "1. Check initial state"
curl -s "${BASE_URL}/api/auth/setup-password?email=suraj@speakaboos.com" | python3 -m json.tool

echo ""
echo "2. Set up password"
curl -s -X POST "${BASE_URL}/api/auth/setup-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"suraj@speakaboos.com","password":"SecurePass123","confirmPassword":"SecurePass123"}' | python3 -m json.tool

echo ""
echo "3. Check state after password setup"
curl -s "${BASE_URL}/api/auth/setup-password?email=suraj@speakaboos.com" | python3 -m json.tool

echo ""
echo "4. Try to login"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"suraj@speakaboos.com","password":"SecurePass123","userType":"teacher"}' | python3 -m json.tool

echo ""
echo "Debug complete!"