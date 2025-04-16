#!/bin/bash
# Script to test API endpoints after deployment

echo "===== API ENDPOINT TEST SCRIPT ====="
echo "Testing API endpoints for the scraper service"
echo

# Set base URL - change this to your Railway deployment URL
BASE_URL="https://local-web-insights-canada-production.up.railway.app"

# Test basic health endpoint
echo "1. Testing /health endpoint"
curl -s "$BASE_URL/health" | jq .
echo

# Test super debug endpoint
echo "2. Testing /super-debug endpoint"
curl -s "$BASE_URL/super-debug" | jq .
echo

# Test API health endpoint
echo "3. Testing /api/health endpoint"
curl -s "$BASE_URL/api/health" | jq .
echo

# Test direct start endpoint with minimal payload
echo "4. Testing /start endpoint (direct)"
curl -s -X POST "$BASE_URL/start" \
  -H "Content-Type: application/json" \
  -d '{"location":"Ottawa","jobId":"test-123"}' | jq .
echo

# Test API start endpoint with minimal payload
echo "5. Testing /api/start endpoint"
curl -s -X POST "$BASE_URL/api/start" \
  -H "Content-Type: application/json" \
  -d '{"location":"Toronto","jobId":"test-456"}' | jq .
echo

# Check available routes
echo "6. Testing /debug-routes endpoint"
curl -s "$BASE_URL/debug-routes" | jq .
echo

echo "===== TEST COMPLETE ====="
