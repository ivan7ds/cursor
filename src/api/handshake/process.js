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
 * @returns {Promise<Object>} Resultado del handshake
 */
async function executeHandshakeProcess({ sanitizedUrl, token, partyId, countryCode, ourCredentials }) {
  const detailsEndpoint = await getOcpiVersionAndDetailsEndpoint(sanitizedUrl, token);
  
  const detailsUrl = buildDetailsUrl(detailsEndpoint, sanitizedUrl);
  const detailsResponse = await getOperatorDetails(detailsUrl, token);
  const operatorEndpoints = detailsResponse.endpoints || [];
  const detailsData = detailsResponse.data || detailsResponse;
  
  const credentialsPayload = buildCredentialsPayload(ourCredentials);
  const credentialsUrl = buildCredentialsUrl(detailsData, detailsEndpoint, sanitizedUrl);
  
  const credentialsResponse = await sendCredentials(credentialsUrl, credentialsPayload, token);
  await saveExternalCredentials({ credentialsResponse, partyId, countryCode, operatorEndpoints, token });
  
  return {
    credentialsResponse,
    operatorEndpoints
  };
}

module.exports = {
    executeHandshakeProcess
};

