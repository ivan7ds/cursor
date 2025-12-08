const express = require('express');

const router = express.Router();
const { Session } = require('../models');
const logger = require('../utils/logger');

const {
  notifyEMSPAboutEVSEStatusChange,
  notifyEMSPAboutSessionEnd,
  sendCDRToEMSPs
} = require('./sessions/notificationHelpers');
const {
  validateSessionForEnding,
  handleSessionEnding,
  buildEndSessionResponse
} = require('./sessions/sessionHelpers');

/**
 * Obtener todas las sesiones
 * GET /ocpi/cpo/2.2/sessions
 */
router.get('/', async (_req, res) => {
  try {
    logger.info('📋 Obteniendo lista de sesiones');

    // Obtener todas las sesiones
    const sessions = await Session.findAll({
      order: [['start_datetime', 'DESC']]
    });

    // Transformar los datos para el frontend
    const transformedSessions = sessions.map(session => ({
      id: session.id,
      auth_id: session.id_token, // Para mostrar en la tabla
      location_id: session.evse_uid, // Para mostrar en la tabla
      status: session.status,
      start_date_time: session.start_datetime,
      end_date_time: session.end_datetime,
      kwh: session.kwh || 0,
      total_cost: session.total_cost, // Añadir campo total_cost
      country_code: session.country_code,
      party_id: session.party_id
    }));

    logger.info(`✅ ${sessions.length} sesiones encontradas`);

    res.status(200).json({
      status_code: 1000,
      status_message: 'Success',
      data: transformedSessions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Error obteniendo sesiones:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Finalizar una sesión activa
 * POST /api/sessions/:id/end
 */
router.post('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('🛑 Finalizando sesión', { session_id: id });

    const session = await Session.findByPk(id);
    
    const validationError = validateSessionForEnding(session, id);
    if (validationError) {
      return res.status(validationError.status).json(validationError.json);
    }

    const endTime = await handleSessionEnding(session, id);

    logger.info('✅ Sesión finalizada y EVSE actualizado', {
      session_id: id,
      evse_uid: session.evse_uid,
      new_status: 'AVAILABLE'
    });

    setImmediate(async () => {
      await notifyEMSPAboutEVSEStatusChange(session.evse_uid, 'AVAILABLE');
      await notifyEMSPAboutSessionEnd(session);
      await sendCDRToEMSPs(session);
    });

    res.status(200).json(buildEndSessionResponse(id, endTime));

  } catch (error) {
    logger.error('❌ Error finalizando sesión:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});


module.exports = router;