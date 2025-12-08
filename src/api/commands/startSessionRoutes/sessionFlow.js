const logger = require('../../../utils/logger');

const { processSessionCreation } = require('./processSession');
const { sendAcceptanceAndNotify } = require('./responseHelpers');

/**
 * Ejecuta el flujo completo de creación de sesión
 */
async function executeSessionFlow(context) {
  const { token, evse, evse_uid, location_id, response_url, res } = context;

  logger.info('✅ START_SESSION: Command accepted', {
    evse_uid,
    evse_status: evse.status,
    token_uid: token.uid,
    response_url
  });

  const sessionId = await processSessionCreation(token, evse_uid, evse);

  await sendAcceptanceAndNotify({
    response_url,
    token,
    evse_uid,
    sessionId,
    location_id,
    res
  });
}

module.exports = {
    executeSessionFlow
};
