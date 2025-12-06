const express = require('express');

const router = express.Router();
const AuthorizationService = require('../services/authorizationService');
const logger = require('../utils/logger');

/**
 * Determina el código de estado HTTP basado en el resultado de autorización
 * @param {Object} result - Resultado de la autorización
 * @returns {number} - Código de estado HTTP
 */
function getHttpStatusFromResult(result) {
  return result.success ? 200 : (result.status_code === 2000 ? 400 : 200);
}

/**
 * Maneja errores de autorización
 * @param {Error} error - Error ocurrido
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
function handleAuthorizationError(error, req, res) {
  logger.error('❌ Authorization error:', {
    error: error.message,
    stack: error.stack,
    token_uid: req.params.token_uid,
    body: req.body
  });

  return res.status(500).json({
    status_code: 2000,
    status_message: "Internal server error during authorization",
    timestamp: new Date().toISOString()
  });
}

/**
 * POST /ocpi/cpo/2.2/tokens/{token_uid}/authorize
 * Real-time authorization endpoint según especificación OCPI 2.2.1
 * 
 * Este endpoint permite a los CPOs autorizar tokens en tiempo real
 * antes de permitir el inicio de una sesión de carga.
 */
router.post('/:token_uid/authorize', async (req, res) => {
  try {
    const { token_uid } = req.params;
    const { type, issuer, location_id, evse_uid } = req.body;

    logger.info('🔐 Real-time authorization request received', {
      token_uid,
      type,
      issuer,
      location_id,
      evse_uid,
      timestamp: new Date().toISOString()
    });

    const result = await AuthorizationService.authorizeToken(token_uid, {
      type,
      issuer,
      locationId: location_id,
      evseUid: evse_uid
    });

    return res.status(getHttpStatusFromResult(result)).json({
      status_code: result.status_code,
      status_message: result.status_message,
      data: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleAuthorizationError(error, req, res);
  }
});

module.exports = router;
