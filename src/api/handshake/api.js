const { URL } = require('url');

const axios = require('axios');
const { buildAuthorizationHeader } = require('../../utils/tokenEncoding');

/**
 * Obtiene la versión OCPI y el endpoint de details
 * @param {string} sanitizedUrl - URL sanitizada
 * @param {string} token - Token de autenticación
 * @param {boolean} tokenBase64Encoded - Flag indicando si el token debe codificarse en Base64
 * @returns {Promise<string>} Endpoint de details
 */
async function getOcpiVersionAndDetailsEndpoint(sanitizedUrl, token, tokenBase64Encoded = false) {
  console.log('📡 Paso 1: Obteniendo versión OCPI...');
  const authHeader = buildAuthorizationHeader(token, tokenBase64Encoded);
  console.log('🔐 Authorization header:', tokenBase64Encoded ? `Token [BASE64_ENCODED]` : `Token ${token.substring(0, 10)}...`);
  const versionsUrl = `${sanitizedUrl.replace(/\/$/, '')}/ocpi/versions`;
  const versionsResponse = await axios.get(versionsUrl, {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    }
  });

  console.log('✅ Versión OCPI obtenida:', versionsResponse.data);
  const versionData = versionsResponse.data.data || versionsResponse.data;
  const detailsEndpoint = versionData.find(v => v.version === '2.2')?.url;

  console.log('🔍 Respuesta completa de versions:', JSON.stringify(versionData, null, 2));
  console.log('🔍 Details endpoint extraído:', detailsEndpoint);

  if (!detailsEndpoint) {
    throw new Error('OCPI 2.2 not supported by external organization');
  }

  return detailsEndpoint;
}

/**
 * Obtiene los detalles del operador externo
 * @param {string} detailsUrl - URL de details
 * @param {string} token - Token de autenticación
 * @param {boolean} tokenBase64Encoded - Flag indicando si el token debe codificarse en Base64
 * @returns {Promise<Object>} Respuesta de details con endpoints
 */
async function getOperatorDetails(detailsUrl, token, tokenBase64Encoded = false) {
  console.log('📡 Paso 2: Obteniendo detalles del operador...');
  const detailsResponse = await axios.get(detailsUrl, {
    headers: {
      'Authorization': buildAuthorizationHeader(token, tokenBase64Encoded),
      'Content-Type': 'application/json'
    }
  });

  console.log('✅ Detalles del operador obtenidos:', detailsResponse.data);
  return detailsResponse.data;
}

/**
 * Envía las credenciales al operador externo
 * @param {string} credentialsUrl - URL de credentials
 * @param {Object} credentialsPayload - Payload de credenciales
 * @param {string} token - Token de autenticación
 * @param {boolean} tokenBase64Encoded - Flag indicando si el token debe codificarse en Base64
 * @returns {Promise<Object>} Respuesta de credentials
 */
async function sendCredentials(credentialsUrl, credentialsPayload, token, tokenBase64Encoded = false) {
  console.log('📡 Paso 3: Enviando credenciales...');
  console.log('📤 Enviando credenciales a organización externa:', credentialsPayload);

  const credentialsResponse = await axios.post(credentialsUrl, credentialsPayload, {
    headers: {
      'Authorization': buildAuthorizationHeader(token, tokenBase64Encoded),
      'Content-Type': 'application/json'
    }
  });

  console.log('✅ Respuesta de credenciales:', credentialsResponse.data);
  console.log('🔍 Estructura de datos:', JSON.stringify(credentialsResponse.data, null, 2));
  return credentialsResponse;
}

module.exports = {
    getOcpiVersionAndDetailsEndpoint,
    getOperatorDetails,
    sendCredentials
};

