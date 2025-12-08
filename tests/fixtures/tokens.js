/**
 * Fixtures de datos para tests de Tokens
 */

/**
 * Token básico válido según OCPI 2.2
 */
const basicToken = {
  uid: 'TOKEN_TEST_001',
  type: 'RFID',
  auth_id: 'AUTH_001',
  issuer: 'Test Issuer',
  valid: true,
  whitelist: 'ALWAYS',
  language: 'es',
  last_updated: new Date().toISOString()
};

/**
 * Token completo con todos los campos opcionales
 */
const completeToken = {
  ...basicToken,
  uid: 'TOKEN_TEST_002',
  type: 'RFID',
  auth_id: 'AUTH_002',
  issuer: 'Complete Test Issuer',
  valid: true,
  whitelist: 'ALWAYS',
  language: 'es',
  last_updated: new Date().toISOString(),
  visual_number: '1234-5678-9012-3456',
  group_id: 'GROUP_001',
  contract_id: 'CONTRACT_001',
  energy_contract: {
    supplier_name: 'Energy Supplier',
    contract_id: 'ENERGY_CONTRACT_001'
  }
};

/**
 * Token con restricciones
 */
const tokenWithRestrictions = {
  ...basicToken,
  uid: 'TOKEN_TEST_003',
  valid: true,
  whitelist: 'ALLOWED',
  allowed: [
    {
      party_id: 'TEST',
      country_code: 'ES'
    }
  ]
};

/**
 * Token inválido (faltan campos requeridos)
 */
const invalidToken = {
  uid: 'TOKEN_INVALID'
  // Faltan campos requeridos: type, auth_id, issuer, valid, whitelist
};

module.exports = {
  basicToken,
  completeToken,
  tokenWithRestrictions,
  invalidToken
};

