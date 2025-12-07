const { getOcpiVersionAndDetailsEndpoint, getOperatorDetails, sendCredentials } = require('./api');
const { buildDetailsUrl, buildCredentialsPayload, buildCredentialsUrl } = require('./builders');
const { saveExternalCredentials } = require('./credentials');

/**
 * Ejecuta el proceso completo de handshake OCPI
 * @param {string} sanitizedUrl - URL sanitizada
 * @param {string} token - Token de autenticación
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 * @param {Object} ourCredentials - Nuestras credenciales
 * @param {boolean} tokenBase64Encoded - Flag indicando si el token debe codificarse en Base64
 * @returns {Promise<Object>} Resultado del handshake
 */
async function executeHandshakeProcess({ sanitizedUrl, token, partyId, countryCode, ourCredentials, tokenBase64Encoded }) {
  // El token offline (proporcionado por el operador) se usa SIN codificar durante el handshake
  // Solo el token permanente que recibimos después del handshake se codificará en Base64
  const detailsEndpoint = await getOcpiVersionAndDetailsEndpoint(sanitizedUrl, token, false);
  
  const detailsUrl = buildDetailsUrl(detailsEndpoint, sanitizedUrl);
  const detailsResponse = await getOperatorDetails(detailsUrl, token, false);
  const operatorEndpoints = detailsResponse.endpoints || [];
  const detailsData = detailsResponse.data || detailsResponse;
  
  const credentialsPayload = buildCredentialsPayload(ourCredentials);
  const credentialsUrl = buildCredentialsUrl(detailsData, detailsEndpoint, sanitizedUrl);
  
  const credentialsResponse = await sendCredentials(credentialsUrl, credentialsPayload, token, false);
  // El flag tokenBase64Encoded se guarda para usar con el token permanente recibido
  await saveExternalCredentials({ credentialsResponse, partyId, countryCode, operatorEndpoints, token, tokenBase64Encoded });
  
  return {
    credentialsResponse,
    operatorEndpoints
  };
}

module.exports = {
    executeHandshakeProcess
};

