const {
  buildValidTokenData,
  buildRouteParams,
  runTokenValidation
} = require('./tokenValidators.testHelpers');

/**
 * Ejecuta test para token completo con todos los campos
 */
function testCompleteValidToken() {
  const params = buildRouteParams('ES', 'ABC', 'token-123');
  const body = buildValidTokenData('ES', 'ABC', 'token-123', {
    visual_number: 'VISUAL-001',
    group_id: 'group-001',
    language: 'es',
    default_profile_type: 'REGULAR',
    energy_contract: {
      supplier_name: 'Energy Supplier Inc',
      contract_id: 'energy-contract-123'
    }
  });

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
  expect(result.value).toMatchObject(body);
}

/**
 * Ejecuta test para token mínimo con solo campos requeridos
 */
function testMinimalValidToken() {
  const params = buildRouteParams('PT', 'XYZ', 'minimal-token');
  const body = buildValidTokenData('PT', 'XYZ', 'minimal-token', {
    type: 'APP_USER',
    contract_id: 'contract-456',
    issuer: 'Minimal Issuer',
    valid: false,
    whitelist: 'NEVER',
    last_updated: '2025-01-15T10:30:00'
  });

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
}

/**
 * Ejecuta test para token con segundos fraccionales en timestamp
 */
function testTokenWithFractionalSeconds() {
  const params = buildRouteParams('ES', 'IPD', 'token-999');
  const body = buildValidTokenData('ES', 'IPD', 'token-999', {
    type: 'OTHER',
    contract_id: 'contract-999',
    issuer: 'Test Issuer',
    whitelist: 'ALWAYS',
    last_updated: '2025-01-15T10:30:00.123Z'
  });

  const result = runTokenValidation(params, body);
  expect(result.valid).toBe(true);
}

module.exports = {
    testCompleteValidToken,
    testMinimalValidToken,
    testTokenWithFractionalSeconds
};

