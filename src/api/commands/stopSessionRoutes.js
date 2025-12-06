const axios = require('axios');

const { EVSE, Session, CDR } = require('../../models');
const logger = require('../../utils/logger');
const { validateStopSessionMiddleware } = require('../../validators/commandValidators');

const {
  notifyEMSPAboutEVSEStatusChange,
  notifyEMSPAboutSessionStop,
  sendCDRToEMSPs
} = require('./notifications');

/**
 * Rutas relacionadas con STOP_SESSION
 */

/**
 * POST /ocpi/cpo/2.2/commands/STOP_SESSION - Detener sesión de carga
 */
// eslint-disable-next-line max-lines-per-function
function setupStopSessionRoute(router) {
  // eslint-disable-next-line max-lines-per-function, max-statements
  router.post('/STOP_SESSION', validateStopSessionMiddleware, async (req, res) => {
    try {
      // Use validated data from middleware
      const { response_url, session_id } = req.validatedCommand;

      logger.info('🛑 STOP_SESSION Command Received', {
        response_url,
        session_id,
        timestamp: new Date().toISOString()
      });

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
        where: { session_id }
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
          session_id,
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
}

/**
 * POST /ocpi/cpo/2.2/commands/STOP_SESSION/:commandId - Recibir resultado del comando STOP_SESSION
 */
function setupStopSessionResultRoute(router) {
  router.post('/STOP_SESSION/:commandId', async (req, res) => {
    const { commandId } = req.params;
    const { result: _result, message, session_id: sessionId } = req.body || {};

    logger.info('📨 STOP_SESSION command result received', {
      command_id: commandId,
      result: _result,
      message,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    });

    try {
      await axios.post('http://localhost:3000/api/charging-logs', {
        message: `📨 Resultado STOP_SESSION (${commandId}): ${_result || 'UNKNOWN'}`,
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
      logger.warn('⚠️ Could not log STOP_SESSION command result', {
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
  setupStopSessionRoute,
  setupStopSessionResultRoute
};

