/**
 * Helper para generar tokens y credenciales de prueba
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Genera un token OCPI de prueba
 * @param {Object} options - Opciones del token
 * @param {string} options.partyId - Party ID (default: 'TEST')
 * @param {string} options.countryCode - Código de país (default: 'ES')
 * @param {string} options.type - Tipo de token (default: 'RFID')
 * @returns {string} Token generado
 */
function generateTestToken(options = {}) {
  const {
    partyId = process.env.OCPI_PARTY_ID || 'TEST',
    countryCode = process.env.OCPI_COUNTRY_CODE || 'ES',
    type = 'RFID'
  } = options;

  return `TEST_TOKEN_${partyId}_${countryCode}_${type}_${uuidv4()}`;
}

/**
 * Genera un token JWT de prueba
 * @param {Object} payload - Payload del token
 * @param {string} secret - Secret para firmar (default: 'test_secret')
 * @returns {string} JWT token
 */
function generateJWTToken(payload = {}, secret = 'test_secret') {
  const defaultPayload = {
    party_id: process.env.OCPI_PARTY_ID || 'TEST',
    country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
    ...payload
  };

  return jwt.sign(defaultPayload, secret, { expiresIn: '1h' });
}

/**
 * Genera headers de autenticación OCPI
 * @param {Object} options - Opciones del token
 * @returns {Object} Headers con Authorization
 */
function generateAuthHeaders(options = {}) {
  const token = generateTestToken(options);
  return {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Genera credenciales de prueba para una organización externa
 * @param {Object} options - Opciones de las credenciales
 * @returns {Object} Objeto con credenciales
 */
function generateTestCredentials(options = {}) {
  const {
    partyId = 'EXT',
    countryCode = 'ES',
    url = 'https://test-emsp.example.com'
  } = options;

  return {
    id: uuidv4(),
    token: generateTestToken({ partyId, countryCode }),
    url,
    party_id: partyId,
    country_code: countryCode,
    valid: true,
    temp: false,
    last_updated: new Date().toISOString()
  };
}

module.exports = {
  generateTestToken,
  generateJWTToken,
  generateAuthHeaders,
  generateTestCredentials
};

