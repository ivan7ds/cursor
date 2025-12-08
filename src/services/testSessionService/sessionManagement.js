const axios = require('axios');

const logger = require('../../utils/logger');

const {
  buildStartSessionPayload,
  buildStartSessionEndpoint,
  buildStartSessionHeaders,
  processStartSessionResponse,
  buildStartSessionErrorResponse
} = require('./sessionHelpers');

/**
 * Inicia una sesión de prueba
 */
async function startSession(operator, evse, token) {
  try {
    const payload = buildStartSessionPayload(token, evse);
    logger.info(`📤 Sending START_SESSION to ${operator.party_id} for EVSE ${evse.uid}`);

    const endpoint = buildStartSessionEndpoint(operator);
    const headers = buildStartSessionHeaders(operator);
    const response = await axios.post(endpoint, payload, {
      headers,
      timeout: 10000
    });

    return processStartSessionResponse(response);
  } catch (error) {
    logger.error('❌ Error starting session:', error.message);
    return buildStartSessionErrorResponse(error);
  }
}

/**
 * Detiene una sesión de prueba
 */
async function stopSession(operator, sessionId, service) {
  try {
    logger.info(`🛑 Stopping session ${sessionId}...`);

    const responseUrl = `${process.env.OCPI_BASE_URL || 'http://localhost:3000'}/ocpi/commands/STOP_SESSION`;

    const payload = {
      response_url: responseUrl,
      session_id: sessionId
    };

    const response = await axios.post(`${operator.url}/ocpi/cpo/2.2/commands/STOP_SESSION`, payload, {
      headers: {
        'Authorization': `Token ${operator.token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.status === 200 && response.data.status_code === 1000) {
      const result = response.data.data?.result;
      if (result === 'ACCEPTED') {
        logger.info(`✅ Session ${sessionId} stopped successfully`);
      } else {
        logger.warn(`⚠️ Session ${sessionId} stop rejected: ${result}`);
      }
    } else {
      logger.warn(`⚠️ Session ${sessionId} stop failed: HTTP ${response.status}`);
    }

    service.activeSessions.delete(sessionId);
  } catch (error) {
    logger.error(`❌ Error stopping session ${sessionId}:`, error.message);
  }
}

module.exports = {
    startSession,
    stopSession
};

