const logger = require('../../utils/logger');

const {
  sendLogMessage,
  sendPutLogs,
  sendPatchLogs
} = require('./loggingHelpers');
const {
  buildSessionBasicInfo,
  buildSessionConnectionInfo,
  buildSessionTokenInfo,
  buildSessionDates,
  buildSessionStatusAndCost
} = require('./sessionPayloadHelpers');

/**
 * Envía logs a la consola de recarga
 * @param {string} sessionId - ID de la sesión
 * @param {Object} sessionData - Datos de la sesión
 * @param {string} type - Tipo de notificación ('PUT' o 'PATCH')
 */

async function sendChargingLogs(sessionId, sessionData, type) {
  try {
    await sendLogMessage(`📥 Notificación ${type} recibida del CPO`, 'response', sessionId);
    await sendLogMessage(`   📝 Session ID: ${sessionId}`, 'session', sessionId);
    
    if (type === 'PUT') {
      await sendPutLogs(sessionId, sessionData);
    } else if (type === 'PATCH') {
      await sendPatchLogs(sessionId, sessionData);
    }
  } catch (logError) {
    logger.warn('⚠️ Could not send log to charging console:', logError.message);
  }
}

/**
 * Obtiene la prioridad de un estado de sesión
 * @param {string} status - Estado de la sesión
 * @returns {number} Prioridad del estado (mayor número = mayor prioridad)
 */
function getStatusPriority(status) {
  if (!status || typeof status !== 'string') {
    return 0;
  }
  const STATUS_PRIORITY = {
    PENDING: 1,
    PLANNED: 1,
    ACTIVE: 2,
    ON_HOLD: 2,
    SUSPENDED: 2,
    COMPLETED: 3,
    FINISHED: 3,
    CANCELED: 3,
    CANCELLED: 3,
    FORCED: 4
  };
  return STATUS_PRIORITY[status.toUpperCase()] || 0;
}

/**
 * Resuelve el costo total de una sesión
 * @param {Object} existingSession - Sesión existente
 * @param {*} totalCost - Costo total del request
 * @returns {number} Costo total resuelto
 */
function resolveTotalCost(existingSession, totalCost) {
  let resolvedTotalCost = existingSession?.total_cost ?? 0;
  if (totalCost !== undefined) {
    if (typeof totalCost === 'object') {
      resolvedTotalCost = totalCost.excl_vat || resolvedTotalCost;
    } else {
      resolvedTotalCost = totalCost;
    }
  }
  return resolvedTotalCost;
}

/**
 * Construye el payload para crear/actualizar una sesión
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 * @param {string} sessionId - Session ID
 * @param {Object} sessionData - Datos de la sesión
 * @param {Object} existingSession - Sesión existente
 * @returns {Object} Payload para la sesión
 */
function buildSessionPayload({ partyId, countryCode, sessionId, sessionData, existingSession }) {
  const resolvedTotalCost = resolveTotalCost(existingSession, sessionData.total_cost);
  const basicInfo = buildSessionBasicInfo(partyId, countryCode, sessionId);
  const connectionInfo = buildSessionConnectionInfo(sessionData, existingSession);
  const tokenInfo = buildSessionTokenInfo(sessionData, existingSession);
  const dates = buildSessionDates(sessionData, existingSession);
  const statusAndCost = buildSessionStatusAndCost(sessionData, existingSession, resolvedTotalCost);

  return {
    ...basicInfo,
    ...connectionInfo,
    ...tokenInfo,
    ...dates,
    ...statusAndCost
  };
}

/**
 * Construye los campos de actualización para PATCH
 * @param {Object} updateData - Datos de actualización
 * @returns {Object} Campos de actualización
 */
function buildPatchUpdateFields(updateData) {
  const updateFields = {};

  if (updateData.start_date_time !== undefined) {
    updateFields.start_datetime = updateData.start_date_time;
  }
  if (updateData.end_date_time !== undefined) {
    updateFields.end_datetime = updateData.end_date_time;
  }
  if (updateData.kwh !== undefined) {
    updateFields.kwh = updateData.kwh;
  }
  if (updateData.total_cost !== undefined) {
    let totalCost = 0;
    if (typeof updateData.total_cost === 'object') {
      totalCost = updateData.total_cost.excl_vat || 0;
    } else {
      totalCost = updateData.total_cost;
    }
    updateFields.total_cost = totalCost;
  }
  if (updateData.charging_periods !== undefined) {
    updateFields.charging_periods = JSON.stringify(updateData.charging_periods);
  }
  if (updateData.status !== undefined) {
    updateFields.status = updateData.status;
  }
  if (updateData.last_updated !== undefined) {
    updateFields.last_updated = updateData.last_updated;
  }

  return updateFields;
}

/**
 * Maneja la lógica completa de upsert de sesión
 * @param {Object} params - Parámetros de upsert
 * @param {string} params.partyId - Party ID
 * @param {string} params.countryCode - Country code
 * @param {string} params.sessionId - Session ID
 * @param {Object} params.sessionData - Datos de la sesión
 * @param {Object} params.existingSession - Sesión existente
 * @returns {Promise<boolean>} True si se actualizó, false si se creó
 */
async function upsertSession({ partyId, countryCode, sessionId, sessionData, existingSession }) {
  const { EmspSession } = require('../../models');
  
  const incomingPriority = getStatusPriority(sessionData.status);
  const currentPriority = getStatusPriority(existingSession?.status);

  if (existingSession && sessionData.status && incomingPriority < currentPriority) {
    return null; // Indica que se debe ignorar
  }

  const payload = buildSessionPayload({ partyId, countryCode, sessionId, sessionData, existingSession });

  if (existingSession) {
    await existingSession.update(payload);
    return true;
  } else {
    await EmspSession.create(payload);
    return false;
  }
}

/**
 * Actualiza una sesión existente usando PATCH
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 * @param {string} sessionId - Session ID
 * @param {Object} updateFields - Campos a actualizar
 * @returns {Promise<number>} Número de filas afectadas
 */
async function updateSession(partyId, countryCode, sessionId, updateFields) {
  const { EmspSession } = require('../../models');
  
  const [affectedRows] = await EmspSession.update(updateFields, {
    where: {
      emsp_country_code: countryCode,
      emsp_party_id: partyId,
      session_id: sessionId
    }
  });
  
  return affectedRows;
}

module.exports = {
    sendChargingLogs,
    getStatusPriority,
    resolveTotalCost,
    buildSessionPayload,
    buildPatchUpdateFields,
    upsertSession,
    updateSession
};

