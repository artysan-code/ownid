#!/bin/bash

# OwnID Backend API Test Script

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api/v1"

echo "🧪 Testing OwnID Backend API"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}1. Testing Health Check${NC}"
response=$(curl -s "$BASE_URL/health")
echo "Response: $response"
if [[ $response == *"ok"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi
echo ""

# Test 2: Register User
echo -e "${BLUE}2. Testing User Registration${NC}"
response=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "Response: $response"

# Extract token
token=$(echo $response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [[ -n $token ]]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Token: $token"
else
    echo -e "${RED}✗ Registration failed (user might already exist)${NC}"
fi
echo ""

# Test 3: Login
echo -e "${BLUE}3. Testing User Login${NC}"
response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "Response: $response"

# Extract token
token=$(echo $response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [[ -n $token ]]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Token: $token"
else
    echo -e "${RED}✗ Login failed${NC}"
    exit 1
fi
echo ""

# Test 4: Get Current User (Protected)
echo -e "${BLUE}4. Testing Get Current User (Protected)${NC}"
response=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $token")
echo "Response: $response"
if [[ $response == *"email"* ]]; then
    echo -e "${GREEN}✓ Get current user successful${NC}"
else
    echo -e "${RED}✗ Get current user failed${NC}"
fi
echo ""

# Test 5: OAuth Authorize
echo -e "${BLUE}5. Testing OAuth Authorization${NC}"
response=$(curl -s -X POST "$API_URL/oauth/authorize" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test-client",
    "redirect_uri": "http://localhost:3000/callback",
    "scope": "age_verified",
    "state": "random-state-123"
  }')
echo "Response: $response"
echo ""

echo "=============================="
echo -e "${GREEN}✅ API Tests Completed${NC}"
