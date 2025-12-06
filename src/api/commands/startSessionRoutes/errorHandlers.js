const logger = require('../../../utils/logger');
const { notifyCommandResult } = require('../notifications');

/**
 * Maneja el caso cuando el EVSE no se encuentra
 */
async function handleEVSENotFound(context) {
  const { response_url, evse_uid, location_id, token, res } = context;

  logger.error('❌ START_SESSION: EVSE not found', {
    evse_uid,
    location_id
  });

  const response = {
    status_code: 2000,
    status_message: 'EVSE not found',
    data: {
      result: 'REJECTED',
      timeout: 0
    },
    timestamp: new Date().toISOString()
  };

  res.status(404).json(response);

  setImmediate(async () => {
    await notifyCommandResult(
      response_url,
      'REJECTED',
      'Remote start rejected: EVSE not found',
      token.uid
    );
  });
}

/**
 * Maneja errores internos del servidor
 */
async function handleInternalError(error, req, res) {
  logger.error('❌ START_SESSION: Internal server error', {
    error: error.message,
    stack: error.stack
  });

  if (req.body?.response_url && req.body?.token?.uid) {
    try {
      await notifyCommandResult(
        req.body.response_url,
        'REJECTED',
        'Remote start rejected: internal server error',
        req.body.token.uid
      );
    } catch (notificationError) {
      logger.error('❌ Failed to send error notification', {
        error: notificationError.message
      });
    }
  }

  res.status(500).json({
    status_code: 2000,
    status_message: 'Internal server error',
    data: {
      result: 'REJECTED',
      timeout: 0
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = {
    handleEVSENotFound,
    handleInternalError
};
