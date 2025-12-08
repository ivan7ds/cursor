const axios = require('axios');

const logger = require('../../../utils/logger');

/**
 * POST /ocpi/cpo/2.2/commands/START_SESSION/:commandId - Recibir resultado del comando START_SESSION
 */
function setupStartSessionResultRoute(router) {
  router.post('/START_SESSION/:commandId', async (req, res) => {
    const { commandId } = req.params;
    const { result: _result, message, session_id: sessionId } = req.body || {};

    logger.info('📨 START_SESSION command result received', {
      command_id: commandId,
      result: _result,
      message,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    });

    try {
      await axios.post('http://localhost:3000/api/charging-logs', {
        message: `📨 Resultado START_SESSION (${commandId}): ${_result || 'UNKNOWN'}`,
        type: 'response',
        sessionId: sessionId || commandId
      });
      if (message) {
        await axios.post('http://localhost:3000/api/charging-logs', {
          message: `   📝 Detalle: ${message}`,
          type: 'info',
          sessionId: sessionId || commandId
        });
      }
    } catch (logError) {
      logger.warn('⚠️ Could not log START_SESSION command result', {
        command_id: commandId,
        error: logError.message
      });
    }

    return res.status(200).json({
      status_code: 1000,
      status_message: 'Command result received',
      data: {
        command_id: commandId,
        result: _result || 'UNKNOWN'
      },
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = {
    setupStartSessionResultRoute
};

