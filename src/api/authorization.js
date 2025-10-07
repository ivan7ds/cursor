const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const AuthorizationService = require('../services/authorizationService');

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

    // Usar el servicio de autorización
    const result = await AuthorizationService.authorizeToken(token_uid, {
      type,
      issuer,
      locationId: location_id,
      evseUid: evse_uid
    });

    // Determinar el código de estado HTTP
    const httpStatus = result.success ? 200 : (result.status_code === 2000 ? 400 : 200);

    return res.status(httpStatus).json({
      status_code: result.status_code,
      status_message: result.status_message,
      data: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
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
});

module.exports = router;
