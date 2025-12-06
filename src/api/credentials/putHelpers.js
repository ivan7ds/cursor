const { v4: uuidv4 } = require('uuid');

const { Credentials } = require('../../models');

/**
 * Actualiza credenciales existentes
 * @param {Object} existingCredentials - Credenciales existentes
 * @param {string} token - Nuevo token
 * @param {string} url - Nueva URL
 * @param {Object} businessDetails - Detalles del negocio
 * @returns {Promise<void>}
 */
async function updateExistingCredentials(existingCredentials, token, url, businessDetails) {
  await existingCredentials.update({
    token,
    url,
    business_details: businessDetails,
    last_updated: new Date()
  });
}

/**
 * Crea nuevas credenciales
 * @param {string} token - Token
 * @param {string} url - URL
 * @param {Object} businessDetails - Detalles del negocio
 * @param {string} systemPartyId - Party ID del sistema
 * @param {string} systemCountryCode - Código de país del sistema
 * @returns {Promise<void>}
 */
async function createNewCredentials({ token, url, businessDetails, systemPartyId, systemCountryCode }) {
  await Credentials.create({
    id: uuidv4(),
    token,
    url,
    business_details: businessDetails,
    party_id: systemPartyId,
    country_code: systemCountryCode,
    last_updated: new Date()
  });
}

/**
 * Genera un nuevo token OCPI
 * @returns {string} Nuevo token
 */
function generateNewToken() {
  return `OCPI_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Construye la URL base limpia
 * @param {Object} req - Request object
 * @returns {string} URL base limpia
 */
function buildCleanBaseUrl(req) {
  const baseUrl = process.env.OCPI_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return baseUrl.replace(/\/$/, '');
}

/**
 * Construye los roles para la respuesta
 * @param {string} systemPartyId - Party ID del sistema
 * @param {string} systemCountryCode - Código de país del sistema
 * @returns {Array} Array de roles
 */
function buildRoles(systemPartyId, systemCountryCode) {
  return [
    {
      role: "CPO",
      business_details: {
        name: systemPartyId
      },
      party_id: systemPartyId,
      country_code: systemCountryCode
    },
    {
      role: "EMSP",
      business_details: {
        name: systemPartyId
      },
      party_id: systemPartyId,
      country_code: systemCountryCode
    }
  ];
}

/**
 * Construye la respuesta para PUT credentials
 * @param {string} newToken - Nuevo token
 * @param {string} cleanBaseUrl - URL base limpia
 * @param {string} systemPartyId - Party ID del sistema
 * @param {string} systemCountryCode - Código de país del sistema
 * @returns {Object} Respuesta JSON
 */
function buildPutCredentialsResponse(newToken, cleanBaseUrl, systemPartyId, systemCountryCode) {
  return {
    status_code: 1000,
    data: {
      token: newToken,
      url: `${cleanBaseUrl}/ocpi/cpo/versions`,
      roles: buildRoles(systemPartyId, systemCountryCode)
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    updateExistingCredentials,
    createNewCredentials,
    generateNewToken,
    buildCleanBaseUrl,
    buildPutCredentialsResponse
};

