const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { EVSE, Location, Token, Credentials, Session, CDR } = require('../models');
const logger = require('../utils/logger');
const AuthorizationService = require('../services/authorizationService');
const EMSPCredentialsHelper = require('../utils/emspCredentialsHelper');
const cdrSendingService = require('../services/cdrSendingService');

/**
 * Envía notificación al response_url con el resultado del comando
 * @param {string} responseUrl - URL donde notificar el resultado
 * @param {string} result - Resultado del comando (ACCEPTED, REJECTED, etc.)
 * @param {string} message - Mensaje descriptivo del resultado
 * @param {string} tokenUid - UID del token utilizado
 */
async function notifyCommandResult(responseUrl, result, message, tokenUid) {
  try {
    // Buscar las credenciales del EMSP basándose en la URL de respuesta
    const emspCredentials = await Credentials.findOne({
      where: {
        url: {
          [require('sequelize').Op.like]: '%' + new URL(responseUrl).hostname + '%'
        }
      }
    });

    if (!emspCredentials) {
      logger.error('❌ EMSP credentials not found for response URL', {
        response_url: responseUrl,
        hostname: new URL(responseUrl).hostname
      });
      return { 
        success: false, 
        error: 'EMSP credentials not found',
        status: null 
      };
    }

    const payload = {
      result: result
    };

    logger.info('📤 Sending command result notification', {
      response_url: responseUrl,
      result: result,
      token_uid: tokenUid,
      emsp_party_id: emspCredentials.party_id,
      emsp_country_code: emspCredentials.country_code,
      payload: payload
    });

    const response = await axios.post(responseUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CPO-OCPI-2.2/1.0.0',
        'Authorization': `Token ${emspCredentials.token}`
      },
      timeout: 10000 // 10 segundos timeout
    });

    logger.info('✅ Command result notification sent successfully', {
      response_url: responseUrl,
      result: result,
      status_code: response.status,
      emsp_party_id: emspCredentials.party_id,
      response_time: response.headers['x-response-time'] || 'N/A'
    });

    return { success: true, status: response.status };

  } catch (error) {
    logger.error('❌ Failed to send command result notification', {
      response_url: responseUrl,
      result: result,
      error: error.message,
      status_code: error.response?.status,
      response_data: error.response?.data
    });

    return { 
      success: false, 
      error: error.message,
      status: error.response?.status 
    };
  }
}

/**
 * @swagger
 * /ocpi/cpo/2.2/commands/START_SESSION:
 *   post:
 *     summary: Iniciar sesión de carga
 *     description: Endpoint para que EMSPs inicien sesiones de carga en EVSEs
 *     tags: [Commands]
 *     security:
 *       - OCPI: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response_url
 *               - token
 *               - location_id
 *               - evse_uid
 *             properties:
 *               response_url:
 *                 type: string
 *                 description: URL para notificar el resultado del comando
 *               token:
 *                 type: object
 *                 description: Token de autorización
 *               location_id:
 *                 type: string
 *                 description: ID de la ubicación
 *               evse_uid:
 *                 type: string
 *                 description: UID del EVSE
 *     responses:
 *       200:
 *         description: Comando procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                 status_message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: string
 *                       enum: [ACCEPTED, REJECTED]
 *                     timeout:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error en la petición
 *       404:
 *         description: EVSE no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/START_SESSION', async (req, res) => {
  try {
    const { response_url, token, location_id, evse_uid } = req.body;
    
    logger.info('🚀 START_SESSION Command Received', {
      response_url,
      token: token?.uid,
      location_id,
      evse_uid,
      timestamp: new Date().toISOString()
    });

    // Validar campos requeridos
    if (!response_url || !token || !location_id || !evse_uid) {
      logger.error('❌ START_SESSION: Missing required fields', {
        response_url: !!response_url,
        token: !!token,
        location_id: !!location_id,
        evse_uid: !!evse_uid
      });
      
      return res.status(400).json({
        status_code: 2000,
        status_message: "Missing required fields",
        data: {
          result: "REJECTED",
          timeout: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // Buscar el EVSE
    const evse = await EVSE.findOne({
      where: {
        id: evse_uid,
        location_id: location_id,
        deleted_at: null
      }
    });

    if (!evse) {
      logger.error('❌ START_SESSION: EVSE not found', {
        evse_uid,
        location_id
      });
      
      // Primero responder al EMSP
      const response = {
        status_code: 2000,
        status_message: "EVSE not found",
        data: {
          result: "REJECTED",
          timeout: 0
        },
        timestamp: new Date().toISOString()
      };
      
      res.status(404).json(response);
      
      // Después enviar notificación al response_url (asíncrono)
      setImmediate(async () => {
        await notifyCommandResult(
          response_url,
          'REJECTED',
          'Remote start rejected: EVSE not found',
          token.uid
        );
      });
      
      return;
    }

    // Real-time authorization del token
    logger.info('🔐 START_SESSION: Performing real-time authorization', {
      token_uid: token.uid,
      location_id,
      evse_uid
    });

    const authResult = await AuthorizationService.authorizeToken(token.uid, {
      type: token.type,
      issuer: token.issuer,
      locationId: location_id,
      evseUid: evse_uid
    });

    if (!authResult.success || authResult.data.allowed !== "ALLOWED") {
      logger.error('❌ START_SESSION: Token authorization failed', {
        token_uid: token.uid,
        auth_result: authResult,
        location_id,
        evse_uid
      });
      
      // Primero responder al EMSP
      const response = {
        status_code: 1000,
        status_message: `Start rejected: ${authResult.status_message}`,
        data: {
          result: "REJECTED",
          timeout: 0
        },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
      
      // Después enviar notificación al response_url (asíncrono)
      setImmediate(async () => {
        await notifyCommandResult(
          response_url,
          'REJECTED',
          `Remote start rejected: ${authResult.status_message}`,
          token.uid
        );
      });
      
      return;
    }

    logger.info('✅ START_SESSION: Token authorized successfully', {
      token_uid: token.uid,
      validity: authResult.data.validity,
      location_id,
      evse_uid
    });

    // Verificar si el EVSE está disponible
    if (evse.status !== 'AVAILABLE') {
      logger.error('❌ START_SESSION: EVSE not available', {
        evse_uid,
        evse_status: evse.status
      });
      
      // Primero responder al EMSP
      const response = {
        status_code: 1000,
        status_message: `Start rejected: EVSE not available (status: ${evse.status})`,
        data: {
          result: "REJECTED",
          timeout: 0
        },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
      
      // Después enviar notificación al response_url (asíncrono)
      setImmediate(async () => {
        await notifyCommandResult(
          response_url,
          'REJECTED',
          `Remote start rejected: EVSE not available (status: ${evse.status})`,
          token.uid
        );
      });
      
      return;
    }

    // TODO: Aquí se implementaría la lógica real de inicio de sesión
    // Por ahora, solo aceptamos la petición si el EVSE está disponible
    
    logger.info('✅ START_SESSION: Command accepted', {
      evse_uid,
      evse_status: evse.status,
      token_uid: token.uid,
      response_url
    });

    // Crear sesión en la base de datos usando la información del token del eMSP
    const sessionId = uuidv4();
    const session = await Session.create({
      id: sessionId,
      country_code: token.country_code || process.env.OCPI_COUNTRY_CODE || 'ES',
      party_id: token.party_id || process.env.OCPI_PARTY_ID || 'IPD',
      evse_uid: evse_uid,
      connector_id: evse.connectors && evse.connectors[0] ? evse.connectors[0].id : null,
      id_token: token.uid,
      start_datetime: new Date(),
      status: 'ACTIVE',
      last_updated: new Date()
    });

    // Crear CDR con los datos del token entrante
    const cdrId = uuidv4();
    const cdr = await CDR.create({
      id: cdrId,
      country_code: token.country_code,
      party_id: token.party_id,
      session_id: sessionId,
      evse_uid: evse_uid,
      connector_id: evse.connectors && evse.connectors[0] ? evse.connectors[0].id : null,
      id_token: token.uid,
      start_datetime: new Date(),
      end_datetime: new Date(), // Se actualizará cuando termine la sesión
      total_energy: 0.0,
      total_cost: 0.0,
      currency: 'EUR',
      total_parking_time: 0,
      total_time: 0, // Se calculará cuando termine la sesión
      last_updated: new Date()
    });

    // Almacenar datos adicionales del token en el CDR (usando campos personalizados si existen)
    // Nota: Si la tabla CDR no tiene campos para type y contract_id, 
    // estos se usarán como valores por defecto en las notificaciones

    // Cambiar estado del EVSE a CHARGING
    await EVSE.update(
      { 
        status: 'CHARGING',
        last_updated: new Date()
      },
      { 
        where: { id: evse_uid }
      }
    );

    logger.info('✅ START_SESSION: Session and CDR created, EVSE status updated', {
      session_id: sessionId,
      cdr_id: cdrId,
      evse_uid,
      new_status: 'CHARGING',
      token_country_code: token.country_code,
      token_party_id: token.party_id,
      token_uid: token.uid
    });

    // Primero responder al EMSP
    const response = {
      status_code: 1000,
      status_message: "Start accepted",
      data: {
        result: "ACCEPTED",
        timeout: 300
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

    // Después enviar notificaciones al EMSP (asíncrono)
    setImmediate(async () => {
      // 1. Enviar notificación al response_url
      const notificationResult = await notifyCommandResult(
        response_url,
        'ACCEPTED',
        'Remote start executed',
        token.uid
      );

      if (notificationResult.success) {
        logger.info('✅ START_SESSION: Notification sent successfully', {
          response_url,
          result: response.data.result,
          notification_status: notificationResult.status
        });
      } else {
        logger.warn('⚠️ START_SESSION: Notification failed but command accepted', {
          response_url,
          result: response.data.result,
          notification_error: notificationResult.error
        });
      }

      // 2. Enviar PATCH al EMSP con el cambio de estado del EVSE
      await notifyEMSPAboutEVSEStatusChange(evse_uid, 'CHARGING');

      // 3. Enviar PUT al EMSP con la información de la sesión
      await notifyEMSPAboutSession(sessionId, evse_uid, token, location_id);
    });

  } catch (error) {
    logger.error('❌ START_SESSION: Internal server error', {
      error: error.message,
      stack: error.stack
    });

    // Intentar enviar notificación de error si tenemos response_url
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
      status_message: "Internal server error",
      data: {
        result: "REJECTED",
        timeout: 0
      },
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
    const evse = await EVSE.findByPk(evseUid, {
      include: [{
        model: Location,
        as: 'location',
        required: true
      }]
    });

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

        logger.info('📤 Sending PATCH to EMSP about EVSE status change', {
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

        logger.info('✅ EVSE status change notification sent successfully', {
          emsp_url: emspUrl,
          emsp_party_id: emspCredentials.party_id,
          evse_uid: evseUid,
          new_status: newStatus,
          status_code: response.status
        });
      } catch (emspError) {
        logger.error('❌ Failed to notify specific EMSP about EVSE status change', {
          emsp_party_id: emspCredentials.party_id,
          evse_uid: evseUid,
          new_status: newStatus,
          error: emspError.message,
          status_code: emspError.response?.status
        });
      }
    }

  } catch (error) {
    logger.error('❌ Failed to notify EMSP about EVSE status change', {
      evse_uid: evseUid,
      new_status: newStatus,
      error: error.message,
      status_code: error.response?.status
    });
  }
}

/**
 * Notifica al EMSP sobre la nueva sesión creada
 */
async function notifyEMSPAboutSession(sessionId, evseUid, token, locationId) {
  try {
    // Obtener información de la sesión
    const session = await Session.findByPk(sessionId);
    const evse = await EVSE.findByPk(evseUid);

    if (!session || !evse) {
      logger.error('❌ Session or EVSE not found for session notification', { 
        sessionId, evseUid 
      });
      return;
    }

    // Obtener credenciales del EMSP basándose en la información del token
    const emspCredentials = await EMSPCredentialsHelper.getCredentialsByToken(token);

    if (!emspCredentials) {
      logger.error('❌ EMSP credentials not found for session notification', {
        token_party_id: token.party_id,
        token_country_code: token.country_code
      });
      return;
    }

    // Construir URL del endpoint del EMSP
    const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
    const partyId = process.env.OCPI_PARTY_ID || 'IPD';
    const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
    const emspUrl = `${baseUrl}/ocpi/emsp/2.2/sessions/${countryCode}/${partyId}/${sessionId}`;

    // Preparar payload PUT
    const payload = {
      country_code: session.country_code,
      party_id: session.party_id,
      id: sessionId,
      start_date_time: session.start_datetime.toISOString(),
      location_id: locationId,
      evse_uid: evseUid,
      connector_id: session.connector_id,
      cdr_token: {
        country_code: token.country_code,
        party_id: token.party_id,
        uid: token.uid,
        type: token.type,
        contract_id: token.contract_id
      },
      auth_method: "WHITELIST",
      currency: "EUR",
      status: session.status,
      kwh: 0.0,
      last_updated: session.last_updated.toISOString()
    };

    logger.info('📤 Sending PUT to EMSP about new session', {
      emsp_url: emspUrl,
      session_id: sessionId,
      evse_uid: evseUid,
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

    logger.info('✅ Session notification sent successfully', {
      emsp_url: emspUrl,
      session_id: sessionId,
      evse_uid: evseUid,
      status_code: response.status
    });

  } catch (error) {
    logger.error('❌ Failed to notify EMSP about new session', {
      session_id: sessionId,
      evse_uid: evseUid,
      error: error.message,
      status_code: error.response?.status
    });
  }
}

/**
 * Endpoint para recibir comando STOP_SESSION del EMSP
 */
router.post('/STOP_SESSION', async (req, res) => {
  try {
    const { response_url, session_id } = req.body;

    logger.info('🛑 STOP_SESSION Command Received', {
      response_url,
      session_id,
      timestamp: new Date().toISOString()
    });

    // Validar parámetros requeridos
    if (!response_url || !session_id) {
      logger.error('❌ STOP_SESSION: Missing required parameters', {
        response_url: !!response_url,
        session_id: !!session_id
      });

      const response = {
        status_code: 2000,
        status_message: "Missing required parameters",
        data: {
          result: "REJECTED",
          timeout: 0
        },
        timestamp: new Date().toISOString()
      };

      return res.status(400).json(response);
    }

    // Buscar la sesión en la base de datos
    const session = await Session.findByPk(session_id);
    if (!session) {
      logger.error('❌ STOP_SESSION: Session not found', { session_id });

      const response = {
        status_code: 2000,
        status_message: "Session not found",
        data: {
          result: "REJECTED",
          timeout: 0
        },
        timestamp: new Date().toISOString()
      };

      return res.status(404).json(response);
    }

    // Verificar que la sesión esté activa
    if (session.status !== 'ACTIVE') {
      logger.warn('⚠️ STOP_SESSION: Session is not active', { 
        session_id, 
        current_status: session.status 
      });

      const response = {
        status_code: 2000,
        status_message: `Session is not active (status: ${session.status})`,
        data: {
          result: "REJECTED",
          timeout: 0
        },
        timestamp: new Date().toISOString()
      };

      return res.status(400).json(response);
    }

    // Obtener el EVSE asociado
    const evse = await EVSE.findByPk(session.evse_uid);
    if (!evse) {
      logger.error('❌ STOP_SESSION: EVSE not found', { evse_uid: session.evse_uid });

      const response = {
        status_code: 2000,
        status_message: "EVSE not found",
        data: {
          result: "REJECTED",
          timeout: 0
        },
        timestamp: new Date().toISOString()
      };

      return res.status(404).json(response);
    }

    logger.info('✅ STOP_SESSION: Command accepted', {
      session_id,
      evse_uid: session.evse_uid,
      response_url
    });

    // Finalizar la sesión
    const endTime = new Date();
    await session.update({
      status: 'COMPLETED',
      end_datetime: endTime,
      last_updated: endTime
    });

    // Actualizar el CDR asociado
    const cdr = await CDR.findOne({
      where: { session_id: session_id }
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
        session_id: session_id,
        total_time_seconds: totalTimeSeconds
      });
    }

    // Cambiar estado del EVSE a AVAILABLE
    await EVSE.update(
      { 
        status: 'AVAILABLE',
        last_updated: endTime
      },
      { 
        where: { id: session.evse_uid }
      }
    );

    logger.info('✅ STOP_SESSION: Session completed and EVSE status updated', {
      session_id,
      evse_uid: session.evse_uid,
      new_status: 'AVAILABLE'
    });

    // Primero responder al EMSP
    const response = {
      status_code: 1000,
      status_message: "Stop accepted",
      data: {
        result: "ACCEPTED",
        timeout: 0
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

    // Notificar al EMSP de forma asíncrona
    setImmediate(async () => {
      try {
        // 1. Enviar PUT al EMSP con la sesión finalizada
        await notifyEMSPAboutSessionStop(session, evse);

        // 2. Enviar PATCH al EMSP con el cambio de estado del EVSE
        await notifyEMSPAboutEVSEStatusChange(session.evse_uid, 'AVAILABLE');
        
        // 3. Enviar CDR a EMSPs externos
        await sendCDRToEMSPs(session);
      } catch (error) {
        logger.error('❌ STOP_SESSION: Notification failed but command accepted', {
          response_url,
          result: "ACCEPTED",
          notification_error: error.message
        });
      }
    });

  } catch (error) {
    logger.error('❌ STOP_SESSION: Internal server error', {
      error: error.message,
      stack: error.stack
    });

    const response = {
      status_code: 2000,
      status_message: "Internal server error",
      data: {
        result: "REJECTED",
        timeout: 0
      },
      timestamp: new Date().toISOString()
    };

    res.status(500).json(response);
  }
});

/**
 * Notifica al EMSP sobre la sesión finalizada
 */
async function notifyEMSPAboutSessionStop(session, evse) {
  try {
    // Obtener credenciales del EMSP basándose en la información de la sesión
    const emspCredentials = await EMSPCredentialsHelper.getCredentialsBySession(session);

    if (!emspCredentials) {
      logger.error('❌ EMSP credentials not found for session stop notification', {
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

    // Preparar payload PUT
    const payload = {
      country_code: session.country_code,
      party_id: session.party_id,
      id: session.id,
      start_date_time: session.start_datetime.toISOString(),
      end_date_time: session.end_datetime.toISOString(),
      location_id: evse.location_id,
      evse_uid: session.evse_uid,
      connector_id: session.connector_id,
      cdr_token: cdr ? {
        country_code: cdr.country_code,
        party_id: cdr.party_id,
        uid: cdr.id_token,
        type: "OTHER",
        contract_id: "ES-EFI-CE2A21CBB-4"
      } : null,
      auth_method: "WHITELIST",
      currency: "EUR",
      status: session.status,
      kwh: session.kwh || 0,
      last_updated: session.last_updated.toISOString()
    };

    logger.info('📤 Sending PUT to EMSP about session stop', {
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

    logger.info('✅ Session stop notification sent successfully', {
      emsp_url: emspUrl,
      session_id: session.id,
      evse_uid: session.evse_uid,
      status_code: response.status
    });

  } catch (error) {
    logger.error('❌ Failed to notify EMSP about session stop', {
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
