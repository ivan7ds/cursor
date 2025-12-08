
/**
 * Construye el payload para iniciar una sesión
 * @param {Object} token - Token a usar
 * @param {Object} evse - EVSE donde iniciar la sesión
 * @returns {Object} Payload de inicio de sesión
 */
function buildStartSessionPayload(token, evse) {
  const responseUrl = `${process.env.OCPI_BASE_URL || 'http://localhost:3000'}/ocpi/commands/START_SESSION`;
  
  return {
    response_url: responseUrl,
    token: {
      country_code: token.country_code || process.env.OCPI_COUNTRY_CODE,
      party_id: token.party_id || process.env.OCPI_PARTY_ID,
      uid: token.uid,
      type: token.type,
      contract_id: token.contract_id || 'DEFAULT_CONTRACT',
      issuer: token.issuer || process.env.OCPI_PARTY_ID,
      valid: token.valid || true,
      whitelist: token.whitelist || 'ALWAYS',
      last_updated: token.last_updated || new Date().toISOString()
    },
    location_id: evse.location_id || 'LOCATION_ID',
    evse_uid: evse.uid
  };
}

/**
 * Construye la URL del endpoint para iniciar sesión
 * @param {Object} operator - Operador destino
 * @returns {string} URL del endpoint
 */
function buildStartSessionEndpoint(operator) {
  return `${operator.url}/ocpi/cpo/2.2/commands/START_SESSION`;
}

/**
 * Construye los headers para la petición de inicio de sesión
 * @param {Object} operator - Operador destino
 * @returns {Object} Headers de la petición
 */
function buildStartSessionHeaders(operator) {
  return {
    'Authorization': `Token ${operator.token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Procesa la respuesta exitosa del inicio de sesión
 * @param {Object} response - Respuesta HTTP
 * @returns {Object} Resultado procesado
 */
function processStartSessionResponse(response) {
  if (response.status === 200 && response.data.status_code === 1000) {
    const result = response.data.data?.result;
    if (result === 'ACCEPTED') {
      const sessionId = response.data.data?.session_id || `session_${Date.now()}`;
      return {
        success: true,
        sessionId,
        message: 'Session accepted'
      };
    } else {
      return {
        success: false,
        message: `Session rejected: ${result}`
      };
    }
  } else {
    return {
      success: false,
      message: `HTTP ${response.status}: ${response.data?.status_message || 'Unknown error'}`
    };
  }
}

/**
 * Construye la respuesta de error para inicio de sesión
 * @param {Error} error - Error ocurrido
 * @returns {Object} Respuesta de error
 */
function buildStartSessionErrorResponse(error) {
  return {
    success: false,
    message: `Error: ${error.message}`
  };
}

module.exports = {
    buildStartSessionPayload,
    buildStartSessionEndpoint,
    buildStartSessionHeaders,
    processStartSessionResponse,
    buildStartSessionErrorResponse
};

