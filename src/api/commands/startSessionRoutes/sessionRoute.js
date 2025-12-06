const logger = require('../../../utils/logger');
const { validateStartSessionMiddleware } = require('../../../validators/commandValidators');

const { executeAuthorizationFlow } = require('./authorizationFlow');
const { handleEVSENotFound, handleInternalError } = require('./errorHandlers');
const { executeSessionFlow } = require('./sessionFlow');
const { findEVSEForSession } = require('./sessionHelpers');

/**
 * POST /ocpi/cpo/2.2/commands/START_SESSION - Iniciar sesión de carga
 */
function setupStartSessionRoute(router) {
  router.post('/START_SESSION', validateStartSessionMiddleware, async (req, res) => {
    try {
      const { response_url, token, location_id, evse_uid } = req.validatedCommand;

      logger.info('🚀 START_SESSION Command Received', {
        response_url,
        token: token?.uid,
        location_id,
        evse_uid,
        timestamp: new Date().toISOString()
      });

      const evse = await findEVSEForSession(evse_uid, location_id);
      if (!evse) {
        await handleEVSENotFound({ response_url, evse_uid, location_id, token, res });
        return;
      }

      const authorized = await executeAuthorizationFlow({
        token,
        evse,
        location_id,
        evse_uid,
        response_url,
        res
      });

      if (!authorized) {
        return;
      }

      await executeSessionFlow({
        token,
        evse,
        evse_uid,
        location_id,
        response_url,
        res
      });
    } catch (error) {
      await handleInternalError(error, req, res);
    }
  });
}

module.exports = {
    setupStartSessionRoute
};
