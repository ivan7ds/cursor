const express = require('express');

const router = express.Router();
const { Session, EVSE, Credentials, CDR, Location } = require('../models');
const cdrSendingService = require('../services/cdrSendingService');
const EMSPCredentialsHelper = require('../utils/emspCredentialsHelper');
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
    const endTime = new Date();
    await session.update({
      status: 'COMPLETED',
      end_datetime: endTime,
      last_updated: endTime
    });

    // Actualizar el CDR asociado
    const cdr = await CDR.findOne({
      where: { session_id: id }
    });

    if (cdr) {
      const startTime = new Date(session.start_datetime);
      const totalTimeSeconds = Math.floor((endTime - startTime) / 1000);
      
      await cdr.update({
        end_datetime: endTime,
        total_time: totalTimeSeconds,
        last_updated: endTime
      });

      logger.info('✅ CDR actualizado al finalizar sesión', {
        cdr_id: cdr.id,
        session_id: id,
        total_time_seconds: totalTimeSeconds
      });
    }

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
      
      // Enviar CDR a EMSPs externos
      await sendCDRToEMSPs(session);
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

    // Obtener todas las credenciales de eMSPs válidas
    const emspCredentialsList = await EMSPCredentialsHelper.getAllValidCredentials();

    if (!emspCredentialsList || emspCredentialsList.length === 0) {
      logger.error('❌ No valid EMSP credentials found for EVSE status notification');
      return;
    }

    // Notificar a todos los eMSPs conectados
    const partyId = process.env.OCPI_PARTY_ID || 'IPD';
    const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
    
    for (const emspCredentials of emspCredentialsList) {
      try {
        // Construir URL del endpoint del EMSP
        const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
        const emspUrl = `${baseUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evse.location_id}/${evseUid}`;

        // Preparar payload PATCH
        const payload = {
          status: newStatus,
          last_updated: new Date().toISOString()
        };

        logger.info('📤 Sending PATCH to EMSP about EVSE status change (session end)', {
          emsp_url: emspUrl,
          emsp_party_id: emspCredentials.party_id,
          evse_uid: evseUid,
          new_status: newStatus,
          payload
        });

        // Enviar notificación PATCH
        const response = await axios.patch(emspUrl, payload, {
          headers: {
            'Authorization': `Token ${emspCredentials.token}`,
            'Content-Type': 'application/json',
            'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
          },
          timeout: 10000
        });

        logger.info('✅ EVSE status change notification sent successfully (session end)', {
          emsp_url: emspUrl,
          emsp_party_id: emspCredentials.party_id,
          evse_uid: evseUid,
          new_status: newStatus,
          status_code: response.status
        });
      } catch (emspError) {
        logger.error('❌ Failed to notify specific EMSP about EVSE status change (session end)', {
          emsp_party_id: emspCredentials.party_id,
          evse_uid: evseUid,
          new_status: newStatus,
          error: emspError.message,
          status_code: emspError.response?.status
        });
      }
    }

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
    // Obtener credenciales del EMSP basándose en la información de la sesión
    const emspCredentials = await EMSPCredentialsHelper.getCredentialsBySession(session);

    if (!emspCredentials) {
      logger.error('❌ EMSP credentials not found for session end notification', {
        session_party_id: session.party_id,
        session_country_code: session.country_code
      });
      return;
    }

    // Construir URL del endpoint del EMSP
    const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
    const partyId = process.env.OCPI_PARTY_ID || 'IPD';
    const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
    const emspUrl = `${baseUrl}/ocpi/emsp/2.2/sessions/${countryCode}/${partyId}/${session.id}`;

    // Obtener información del token desde el CDR asociado
    const cdr = await CDR.findOne({
      where: { session_id: session.id }
    });

    // Obtener el EVSE para acceder a su location_id
    const evse = await EVSE.findByPk(session.evse_uid);
    if (!evse) {
      logger.error('❌ EVSE not found for session end notification', { 
        session_id: session.id, 
        evse_uid: session.evse_uid 
      });
      return;
    }

    // Preparar payload PUT
    const payload = {
      country_code: session.country_code,
      party_id: session.party_id,
      id: session.id,
      start_date_time: session.start_datetime.toISOString(),
      end_date_time: session.end_datetime.toISOString(),
      location_id: evse.location_id, // ✅ Obtener location_id del EVSE
      evse_uid: session.evse_uid,
      connector_id: session.connector_id,
      cdr_token: cdr ? {
        country_code: cdr.country_code,
        party_id: cdr.party_id,
        uid: cdr.id_token,
        type: "OTHER", // Valor por defecto - se podría almacenar en CDR si se agrega el campo
        contract_id: "ES-EFI-CE2A21CBB-4" // Valor por defecto - se podría almacenar en CDR si se agrega el campo
      } : null,
      auth_method: "WHITELIST",
      currency: "EUR",
      status: session.status,
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
        'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
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

/**
 * Envía CDR a todos los EMSPs configurados
 * @param {Object} session - Datos de la sesión completada
 */
async function sendCDRToEMSPs(session) {
  try {
    logger.info(`📤 Enviando CDR para sesión ${session.id} a EMSPs externos`);

    // Obtener datos de la ubicación y EVSE
    const evse = await EVSE.findByPk(session.evse_uid);
    if (!evse) {
      logger.warn(`⚠️ EVSE ${session.evse_uid} no encontrado para CDR`);
      return;
    }

    const location = await Location.findByPk(evse.location_id);
    if (!location) {
      logger.warn(`⚠️ Location ${evse.location_id} no encontrada para CDR`);
      return;
    }

    // Preparar datos de la sesión para el CDR
    const sessionData = {
      id: session.id,
      start_date_time: session.start_datetime,
      end_date_time: session.end_datetime,
      kwh: session.kwh || 0.0,
      currency: 'EUR',
      total_cost: session.total_cost || 0.0,
      auth_id: {
        uid: session.auth_id || session.id,
        type: 'OTHER',
        contract_id: 'IPD-001'
      },
      auth_method: 'AUTH_REQUEST',
      connector_id: session.connector_id || '1',
      charging_periods: session.charging_periods || []
    };

    // Preparar datos de la ubicación
    const locationData = {
      id: location.id,
      name: location.name,
      address: location.address,
      city: location.city,
      postal_code: location.postal_code,
      country: location.country,
      coordinates: location.coordinates
    };

    // Preparar datos del EVSE
    const evseData = {
      uid: evse.id,
      evse_id: evse.evse_id,
      connectors: evse.connectors || []
    };

    // Procesar y enviar CDR
    const result = await cdrSendingService.processAndSendCDR(sessionData, locationData, evseData);
    
    if (result.success) {
      logger.info(`✅ CDR procesado exitosamente`, {
        cdr_id: result.cdr_id,
        sent_to: result.sent_to,
        successful: result.successful,
        failed: result.failed
      });
    } else {
      logger.error(`❌ Error procesando CDR:`, result.error);
    }

  } catch (error) {
    logger.error('❌ Error enviando CDR a EMSPs:', error);
  }
}

module.exports = router;