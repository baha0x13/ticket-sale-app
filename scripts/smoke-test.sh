#!/bin/bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3030}"

echo "==> Checking healthz"
curl --fail "$API_URL/healthz"

echo "==> Registering a throwaway CI test user"
TOKEN=$(curl --fail -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"ci-test@example.com","password":"password123","name":"CI Test"}' \
  | jq -r '.token')

echo "==> Fetching movies with the new token"
curl --fail "$API_URL/movies" -H "Authorization: Bearer $TOKEN"

echo "==> Smoke test passed"
