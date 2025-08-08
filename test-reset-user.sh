#!/bin/bash

echo "🔄 Resetting User and Testing Setup Flow"
echo "======================================="

BASE_URL="http://localhost:3000"

# First, restart the dev server to reset the in-memory storage
echo "1. Checking current user state"
curl -s "${BASE_URL}/api/debug/user-storage?email=suraj@speakaboos.com" | python3 -m json.tool

echo ""
echo "2. Setting up password with debugging"
response=$(curl -s -X POST "${BASE_URL}/api/auth/setup-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"suraj@speakaboos.com","password":"SecurePass123","confirmPassword":"SecurePass123"}')

echo "$response" | python3 -m json.tool

echo ""
echo "3. Checking user state after password setup"
curl -s "${BASE_URL}/api/debug/user-storage?email=suraj@speakaboos.com" | python3 -m json.tool

echo ""
echo "4. Trying to login"
curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"suraj@speakaboos.com","password":"SecurePass123","userType":"teacher"}' | python3 -m json.tool

echo ""
echo "Reset test complete!"