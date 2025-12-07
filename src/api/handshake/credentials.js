const { URL } = require('url');

const { v4: uuidv4 } = require('uuid');

const { Credentials } = require('../../models');

const { buildRejectedCredentialsResponse } = require('./builders');

/**
 * Crea credenciales temporales para organización externa rechazada
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 * @param {string} sanitizedUrl - URL sanitizada
 * @returns {Object} Credenciales temporales
 */
function createTempCredentials(partyId, countryCode, sanitizedUrl) {
  return {
    id: uuidv4(),
    token: `temp_${uuidv4().replace(/-/g, '')}`,
    url: sanitizedUrl,
    business_details: {
      name: `External Organization ${partyId}`,
      website: sanitizedUrl
    },
    party_id: partyId,
    country_code: countryCode,
    external_party_id: `${countryCode}-${partyId}`,
    valid: false,
    temp: true,
    last_updated: new Date().toISOString()
  };
}

/**
 * Maneja el caso cuando las credenciales son rechazadas
 * @param {Object} params - Parámetros de manejo
 * @param {string} params.partyId - Party ID
 * @param {string} params.countryCode - Country code
 * @param {string} params.sanitizedUrl - URL sanitizada
 * @param {Object} params.ourCredentials - Nuestras credenciales
 * @param {Object} params.res - Response object
 */
async function handleRejectedCredentials({ partyId, countryCode, sanitizedUrl, ourCredentials, res }) {
  console.log('⚠️ POST /credentials rechazado, el operador externo iniciará el handshake');

  const externalCredentials = createTempCredentials(partyId, countryCode, sanitizedUrl);

  try {
    await Credentials.create(externalCredentials);
    console.log('✅ Información de organización externa guardada (pendiente de handshake)');
  } catch (dbError) {
    console.error('❌ Error guardando información de organización externa:', dbError);
  }

  return res.status(200).json(buildRejectedCredentialsResponse(partyId, countryCode, sanitizedUrl, ourCredentials));
}

/**
 * Crea y guarda las credenciales externas exitosas
 * @param {Object} params - Parámetros de guardado
 * @param {Object} params.credentialsResponse - Respuesta de credentials
 * @param {string} params.partyId - Party ID
 * @param {string} params.countryCode - Country code
 * @param {Array} params.operatorEndpoints - Endpoints del operador
 * @param {string} params.token - Token temporal original
 */
const { sanitizeUrl } = require('../../utils/urlSanitizer');

async function saveExternalCredentials({ credentialsResponse, partyId, countryCode, operatorEndpoints, token, tokenBase64Encoded }) {
  const externalUrl = new URL(credentialsResponse.data.data.url);
  // Construir URL base sin barra final para evitar dobles barras al concatenar
  let baseUrl = `${externalUrl.protocol}//${externalUrl.host}`;
  if (externalUrl.port) {
    baseUrl = `${externalUrl.protocol}//${externalUrl.hostname}:${externalUrl.port}`;
  }
  // Asegurar que no termine en barra usando la función helper
  baseUrl = sanitizeUrl(baseUrl);

  const cpoRole = credentialsResponse.data.data.roles?.find(role => role.role === 'CPO');
  const businessDetails = cpoRole?.business_details || {
    name: `External Organization ${partyId}`,
    website: baseUrl
  };

  const externalCredentials = {
    id: uuidv4(),
    token: credentialsResponse.data.data.token,
    url: baseUrl,
    business_details: businessDetails,
    party_id: partyId,
    country_code: countryCode,
    valid: true,
    temp: false,
    external_party_id: partyId,
    token_base64_encoded: !!tokenBase64Encoded,
    last_updated: new Date().toISOString()
  };

  console.log('🔍 Objeto externalCredentials construido:', JSON.stringify(externalCredentials, null, 2));

  if (operatorEndpoints.length > 0) {
    externalCredentials.endpoints = operatorEndpoints;
  }

  await Credentials.create(externalCredentials);

  // Invalidar token temporal si existe
  if (token !== credentialsResponse.data.token) {
    await Credentials.update(
      { valid: false },
      { where: { token } }
    );
  }
}

/**
 * Crea credenciales temporales para el handshake inicial
 * @param {Object} params - Parámetros de creación
 * @param {string} params.partyId - Party ID
 * @param {string} params.countryCode - Country code
 * @param {string} params.url - URL de la organización externa
 * @param {string} params.initialToken - Token inicial generado
 * @param {Object} params.ourCredentials - Nuestras credenciales
 * @returns {Object} Credenciales de handshake
 */
function createHandshakeCredentials({ partyId, countryCode, url, initialToken, ourCredentials }) {
  return {
    id: uuidv4(),
    token: initialToken,
    url,
    business_details: ourCredentials.business_details,
    party_id: partyId,
    country_code: countryCode,
    valid: true,
    temp: true,
    last_updated: new Date().toISOString()
  };
}

module.exports = {
    createTempCredentials,
    handleRejectedCredentials,
    saveExternalCredentials,
    createHandshakeCredentials
};

