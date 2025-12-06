const logger = require('../../utils/logger');

const { getValidToken } = require('./dataRetrieval');
const { startSession } = require('./sessionManagement');
const { stopSession } = require('./sessionManagement');

/**
 * Prueba una sesión con un token válido
 */
async function testSessionWithValidToken(operator, evse, service) {
  try {
    logger.info('🔑 Testing session with valid token...');

    const validToken = await getValidToken();
    if (!validToken) {
      logger.warn('⚠️ No valid token found for session test');
      return;
    }

    const sessionResult = await startSession(operator, evse, validToken);

    if (sessionResult.success) {
      logger.info('✅ Session started successfully with valid token');

      const sessionId = sessionResult.sessionId;
      service.activeSessions.set(sessionId, {
        operator,
        evse,
        token: validToken,
        startTime: new Date(),
        endTime: new Date(Date.now() + service.sessionDurationMs)
      });

      setTimeout(async () => {
        await stopSession(operator, sessionId, service);
      }, service.sessionDurationMs);
    } else {
      logger.warn('⚠️ Session start failed with valid token');
    }
  } catch (error) {
    logger.error('❌ Error testing session with valid token:', error);
  }
}

/**
 * Prueba una sesión con un token inválido
 */
async function testSessionWithInvalidToken(operator, evse) {
  try {
    logger.info('🔑 Testing session with invalid token...');

    const invalidToken = {
      country_code: process.env.OCPI_COUNTRY_CODE,
      party_id: process.env.OCPI_PARTY_ID,
      uid: `INVALID_TOKEN_${Date.now()}`,
      type: 'APP_USER',
      contract_id: 'INVALID_CONTRACT',
      issuer: process.env.OCPI_PARTY_ID,
      valid: false,
      whitelist: 'NEVER',
      last_updated: new Date().toISOString()
    };

    const sessionResult = await startSession(operator, evse, invalidToken);

    if (!sessionResult.success) {
      logger.info('✅ Session correctly rejected with invalid token');
    } else {
      logger.warn('⚠️ Session unexpectedly accepted with invalid token');
    }
  } catch (error) {
    logger.error('❌ Error testing session with invalid token:', error);
  }
}

module.exports = {
    testSessionWithValidToken,
    testSessionWithInvalidToken
};

