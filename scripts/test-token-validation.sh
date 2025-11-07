#!/bin/bash

# Script para probar la validación del endpoint PUT /ocpi/cpo/2.2/tokens
# Asegúrate de que la aplicación esté corriendo en localhost:3000

BASE_URL="http://localhost:3000/ocpi/cpo/2.2/tokens"
TOKEN="ocpi_token_ivn_2024_secure_key"

echo "🧪 Testing Token PUT Validation"
echo "================================"
echo ""

# Test 1: Valid complete token
echo "✅ Test 1: Valid complete token"
curl -X PUT "$BASE_URL/ES/IPD/test-token-001" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "ES",
    "party_id": "IPD",
    "uid": "test-token-001",
    "type": "RFID",
    "contract_id": "contract-12345",
    "visual_number": "VISUAL-001",
    "issuer": "Test Company Inc",
    "group_id": "group-001",
    "valid": true,
    "whitelist": "ALLOWED",
    "language": "es",
    "default_profile_type": "REGULAR",
    "energy_contract": {
      "supplier_name": "Energy Supplier SA",
      "contract_id": "energy-contract-789"
    },
    "last_updated": "2025-01-15T10:30:00Z"
  }'
echo -e "\n\n"

# Test 2: Minimal valid token
echo "✅ Test 2: Minimal valid token (only required fields)"
curl -X PUT "$BASE_URL/PT/XYZ/minimal-token" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "PT",
    "party_id": "XYZ",
    "uid": "minimal-token",
    "type": "APP_USER",
    "contract_id": "contract-456",
    "issuer": "Minimal Issuer",
    "valid": false,
    "whitelist": "NEVER",
    "last_updated": "2025-01-15T10:30:00Z"
  }'
echo -e "\n\n"

# Test 3: Missing required field (type)
echo "❌ Test 3: Missing required field (type) - should fail"
curl -X PUT "$BASE_URL/ES/ABC/invalid-token-001" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "ES",
    "party_id": "ABC",
    "uid": "invalid-token-001",
    "contract_id": "contract-123",
    "issuer": "Test Company",
    "valid": true,
    "whitelist": "ALLOWED",
    "last_updated": "2025-01-15T10:30:00Z"
  }'
echo -e "\n\n"

# Test 4: Invalid token type
echo "❌ Test 4: Invalid token type - should fail"
curl -X PUT "$BASE_URL/ES/ABC/invalid-token-002" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "ES",
    "party_id": "ABC",
    "uid": "invalid-token-002",
    "type": "INVALID_TYPE",
    "contract_id": "contract-123",
    "issuer": "Test Company",
    "valid": true,
    "whitelist": "ALLOWED",
    "last_updated": "2025-01-15T10:30:00Z"
  }'
echo -e "\n\n"

# Test 5: Path/body mismatch
echo "❌ Test 5: UID mismatch between path and body - should fail"
curl -X PUT "$BASE_URL/ES/ABC/token-path" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "ES",
    "party_id": "ABC",
    "uid": "token-body-different",
    "type": "RFID",
    "contract_id": "contract-123",
    "issuer": "Test Company",
    "valid": true,
    "whitelist": "ALLOWED",
    "last_updated": "2025-01-15T10:30:00Z"
  }'
echo -e "\n\n"

# Test 6: Invalid timestamp format (with timezone offset)
echo "❌ Test 6: Invalid timestamp with timezone offset - should fail"
curl -X PUT "$BASE_URL/ES/ABC/invalid-token-003" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "ES",
    "party_id": "ABC",
    "uid": "invalid-token-003",
    "type": "RFID",
    "contract_id": "contract-123",
    "issuer": "Test Company",
    "valid": true,
    "whitelist": "ALLOWED",
    "last_updated": "2025-01-15T10:30:00+00:00"
  }'
echo -e "\n\n"

# Test 7: Invalid language code
echo "❌ Test 7: Invalid language code - should fail"
curl -X PUT "$BASE_URL/ES/ABC/invalid-token-004" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "ES",
    "party_id": "ABC",
    "uid": "invalid-token-004",
    "type": "RFID",
    "contract_id": "contract-123",
    "issuer": "Test Company",
    "valid": true,
    "whitelist": "ALLOWED",
    "language": "xyz",
    "last_updated": "2025-01-15T10:30:00Z"
  }'
echo -e "\n\n"

# Test 8: Invalid energy_contract (missing required field)
echo "❌ Test 8: Invalid energy_contract (missing supplier_name) - should fail"
curl -X PUT "$BASE_URL/ES/ABC/invalid-token-005" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "ES",
    "party_id": "ABC",
    "uid": "invalid-token-005",
    "type": "RFID",
    "contract_id": "contract-123",
    "issuer": "Test Company",
    "valid": true,
    "whitelist": "ALLOWED",
    "energy_contract": {
      "contract_id": "energy-contract-123"
    },
    "last_updated": "2025-01-15T10:30:00Z"
  }'
echo -e "\n\n"

echo "================================"
echo "🏁 Test completed!"
