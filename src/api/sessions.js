const express = require('express');
const router = express.Router();
const { Session, EVSE, Credentials } = require('../models');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Obtener todas las sesiones
 * GET /ocpi/cpo/2.2/sessions
 */
router.get('/', async (req, res) => {
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

    // Buscar la sesión
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Session not found',
        timestamp: new Date().toISOString()
      });
    }

    if (session.status !== 'ACTIVE') {
      return res.status(400).json({
        status_code: 2000,
        status_message: 'Session is not active',
        timestamp: new Date().toISOString()
      });
    }

    // Actualizar la sesión
    await session.update({
      status: 'COMPLETED',
      end_datetime: new Date(),
      last_updated: new Date()
    });

    // Cambiar el estado del EVSE a AVAILABLE
    await EVSE.update(
      { 
        status: 'AVAILABLE',
        last_updated: new Date()
      },
      { 
        where: { id: session.evse_uid }
      }
    );

    logger.info('✅ Sesión finalizada y EVSE actualizado', {
      session_id: id,
      evse_uid: session.evse_uid,
      new_status: 'AVAILABLE'
    });

    // Enviar notificaciones al EMSP (asíncrono)
    setImmediate(async () => {
      await notifyEMSPAboutEVSEStatusChange(session.evse_uid, 'AVAILABLE');
      await notifyEMSPAboutSessionEnd(session);
    });

    res.status(200).json({
      status_code: 1000,
      status_message: 'Session ended successfully',
      data: {
        session_id: id,
        status: 'COMPLETED',
        end_datetime: session.end_datetime,
        evse_status: 'AVAILABLE'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Error finalizando sesión:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Notifica al EMSP sobre el cambio de estado del EVSE
 */
async function notifyEMSPAboutEVSEStatusChange(evseUid, newStatus) {
  try {
    // Obtener información del EVSE
    const evse = await EVSE.findByPk(evseUid);

    if (!evse) {
      logger.error('❌ EVSE not found for status change notification', { evseUid });
      return;
    }

    // Obtener credenciales del EMSP
    const emspCredentials = await Credentials.findOne({
      where: {
        party_id: 'EPK' // EMSP conectado
      }
    });

    if (!emspCredentials) {
      logger.error('❌ EMSP credentials not found for EVSE status notification');
      return;
    }

    // Construir URL del endpoint del EMSP
    const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
    const emspUrl = `${baseUrl}/ocpi/emsp/2.2/locations/ES/IPD/${evse.location_id}/${evseUid}`;

    // Preparar payload PATCH
    const payload = {
      status: newStatus,
      last_updated: new Date().toISOString()
    };

    logger.info('📤 Sending PATCH to EMSP about EVSE status change (session end)', {
      emsp_url: emspUrl,
      evse_uid: evseUid,
      new_status: newStatus,
      payload
    });

    // Enviar notificación PATCH
    const response = await axios.patch(emspUrl, payload, {
      headers: {
        'Authorization': `Token ${emspCredentials.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'IPD-CPO-OCPI-2.2'
      },
      timeout: 10000
    });

    logger.info('✅ EVSE status change notification sent successfully (session end)', {
      emsp_url: emspUrl,
      evse_uid: evseUid,
      new_status: newStatus,
      status_code: response.status
    });

  } catch (error) {
    logger.error('❌ Failed to notify EMSP about EVSE status change (session end)', {
      evse_uid: evseUid,
      new_status: newStatus,
      error: error.message,
      status_code: error.response?.status
    });
  }
}

/**
 * Notifica al EMSP sobre el final de la sesión
 */
async function notifyEMSPAboutSessionEnd(session) {
  try {
    // Obtener credenciales del EMSP
    const emspCredentials = await Credentials.findOne({
      where: {
        party_id: 'EPK' // EMSP conectado
      }
    });

    if (!emspCredentials) {
      logger.error('❌ EMSP credentials not found for session end notification');
      return;
    }

    // Construir URL del endpoint del EMSP
    const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
    const emspUrl = `${baseUrl}/ocpi/emsp/2.2/sessions/ES/IPD/${session.id}`;

    // Preparar payload PUT
    const payload = {
      country_code: session.country_code,
      party_id: session.party_id,
      id: session.id,
      start_date_time: session.start_datetime.toISOString(),
      end_date_time: session.end_datetime.toISOString(),
      location_id: session.location_id,
      evse_uid: session.evse_uid,
      connector_id: session.connector_id,
      kwh: session.kwh || 0,
      last_updated: session.last_updated.toISOString()
    };

    logger.info('📤 Sending PUT to EMSP about session end', {
      emsp_url: emspUrl,
      session_id: session.id,
      evse_uid: session.evse_uid,
      payload
    });

    // Enviar notificación PUT
    const response = await axios.put(emspUrl, payload, {
      headers: {
        'Authorization': `Token ${emspCredentials.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'IPD-CPO-OCPI-2.2'
      },
      timeout: 10000
    });

    logger.info('✅ Session end notification sent successfully', {
      emsp_url: emspUrl,
      session_id: session.id,
      evse_uid: session.evse_uid,
      status_code: response.status
    });

  } catch (error) {
    logger.error('❌ Failed to notify EMSP about session end', {
      session_id: session.id,
      evse_uid: session.evse_uid,
      error: error.message,
      status_code: error.response?.status
    });
  }
}

module.exports = router;