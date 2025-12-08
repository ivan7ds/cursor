const logger = require('../../utils/logger');

/**
 * Finaliza una sesión y actualiza su estado
 * @param {Object} session - Sesión a finalizar
 * @param {Date} endTime - Tiempo de finalización
 * @returns {Promise<void>}
 */
async function endSession(session, endTime) {
  await session.update({
    status: 'COMPLETED',
    end_datetime: endTime,
    last_updated: endTime
  });
}

/**
 * Calcula el tiempo total en segundos entre dos fechas
 * @param {Date} startTime - Tiempo de inicio
 * @param {Date} endTime - Tiempo de finalización
 * @returns {number} Tiempo total en segundos
 */
function calculateTotalTime(startTime, endTime) {
  return Math.floor((endTime - startTime) / 1000);
}

/**
 * Actualiza el CDR asociado a una sesión finalizada
 * @param {Object} cdr - CDR a actualizar
 * @param {Date} startTime - Tiempo de inicio de la sesión
 * @param {Date} endTime - Tiempo de finalización
 * @returns {Promise<void>}
 */
async function updateCDRForEndedSession(cdr, startTime, endTime) {
  const totalTimeSeconds = calculateTotalTime(startTime, endTime);
  
  await cdr.update({
    end_datetime: endTime,
    total_time: totalTimeSeconds,
    last_updated: endTime
  });

  logger.info('✅ CDR actualizado al finalizar sesión', {
    cdr_id: cdr.id,
    total_time_seconds: totalTimeSeconds
  });
}

/**
 * Libera el EVSE asociado a una sesión finalizada
 * @param {string} evseId - ID del EVSE
 * @returns {Promise<void>}
 */
async function releaseEVSE(evseId) {
  const { EVSE } = require('../../models');
  
  await EVSE.update(
    { 
      status: 'AVAILABLE',
      last_updated: new Date()
    },
    { 
      where: { id: evseId } 
    }
  );

  logger.info('✅ EVSE liberado', { evse_id: evseId });
}

/**
 * Valida que una sesión existe y está activa
 * @param {Object} session - Sesión a validar
 * @param {string} sessionId - ID de la sesión
 * @returns {Object|null} Objeto con error o null si es válida
 */
function validateSessionForEnding(session, sessionId) {
  if (!session) {
    return {
      status: 404,
      json: {
        status_code: 2004,
        status_message: 'Session not found',
        timestamp: new Date().toISOString()
      }
    };
  }

  if (session.status !== 'ACTIVE') {
    return {
      status: 400,
      json: {
        status_code: 2000,
        status_message: 'Session is not active',
        timestamp: new Date().toISOString()
      }
    };
  }

  return null;
}

/**
 * Maneja el proceso completo de finalización de sesión
 * @param {Object} session - Sesión a finalizar
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Date>} Tiempo de finalización
 */
async function handleSessionEnding(session, sessionId) {
  const endTime = new Date();
  await endSession(session, endTime);

  const { CDR } = require('../../models');
  const cdr = await CDR.findOne({
    where: { session_id: sessionId }
  });

  if (cdr) {
    const startTime = new Date(session.start_datetime);
    await updateCDRForEndedSession(cdr, startTime, endTime);
  }

  await releaseEVSE(session.evse_uid);

  return endTime;
}

/**
 * Construye la respuesta exitosa para finalizar sesión
 * @param {string} sessionId - ID de la sesión
 * @param {Date} endDatetime - Tiempo de finalización
 * @returns {Object} Respuesta JSON
 */
function buildEndSessionResponse(sessionId, endDatetime) {
  return {
    status_code: 1000,
    status_message: 'Session ended successfully',
    data: {
      session_id: sessionId,
      status: 'COMPLETED',
      end_datetime: endDatetime,
      evse_status: 'AVAILABLE'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    validateSessionForEnding,
    handleSessionEnding,
    buildEndSessionResponse
};

