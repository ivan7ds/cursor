const { validateTokenPut, TOKEN_TYPES, WHITELIST_TYPES, PROFILE_TYPES } = require('../tokenValidators');

/**
 * Construye datos de token válidos básicos
 * @param {string} countryCode - Código de país
 * @param {string} partyId - Party ID
 * @param {string} uid - UID del token
 * @param {Object} overrides - Campos adicionales o sobrescritos
 * @returns {Object} Datos del token
 */
function buildValidTokenData(countryCode, partyId, uid, overrides = {}) {
  return {
    country_code: countryCode,
    party_id: partyId,
    uid,
    type: 'RFID',
    contract_id: 'contract-123',
    issuer: 'Test Company',
    valid: true,
    whitelist: 'ALLOWED',
    last_updated: '2025-01-15T10:30:00Z',
    ...overrides
  };
}

/**
 * Construye parámetros de ruta para tests
 * @param {string} countryCode - Código de país
 * @param {string} partyId - Party ID
 * @param {string} uid - UID del token
 * @returns {Object} Parámetros de ruta
 */
function buildRouteParams(countryCode, partyId, uid) {
  return {
    country_code: countryCode,
    party_id: partyId,
    uid
  };
}

/**
 * Ejecuta un test de validación de token
 * @param {Object} params - Parámetros de ruta
 * @param {Object} body - Body del request
 * @returns {Object} Resultado de la validación
 */
function runTokenValidation(params, body) {
  return validateTokenPut(params, body);
}

/**
 * Ejecuta tests para todos los tipos de token
 * @param {Function} testFn - Función de test de Jest
 */
function testAllTokenTypes(testFn) {
  TOKEN_TYPES.forEach(type => {
    const params = buildRouteParams('ES', 'TST', `token-${type}`);
    const body = buildValidTokenData('ES', 'TST', `token-${type}`, { type });
    testFn(params, body);
  });
}

/**
 * Ejecuta tests para todos los tipos de whitelist
 * @param {Function} testFn - Función de test de Jest
 */
function testAllWhitelistTypes(testFn) {
  WHITELIST_TYPES.forEach(whitelist => {
    const params = buildRouteParams('ES', 'TST', `token-${whitelist}`);
    const body = buildValidTokenData('ES', 'TST', `token-${whitelist}`, { whitelist });
    testFn(params, body);
  });
}

/**
 * Ejecuta tests para todos los tipos de perfil
 * @param {Function} testFn - Función de test de Jest
 */
function testAllProfileTypes(testFn) {
  PROFILE_TYPES.forEach(profileType => {
    const params = buildRouteParams('ES', 'TST', `token-${profileType}`);
    const body = buildValidTokenData('ES', 'TST', `token-${profileType}`, {
      default_profile_type: profileType
    });
    testFn(params, body);
  });
}

module.exports = {
    buildValidTokenData,
    buildRouteParams,
    runTokenValidation,
    testAllTokenTypes,
    testAllWhitelistTypes,
    testAllProfileTypes
};

