const axios = require('axios');

const logger = require('../../utils/logger');

const CHARGING_LOGS_URL = 'http://localhost:3000/api/charging-logs';

/**
 * Envía un log a la consola de charging
 * @param {string} message - Mensaje del log
 * @param {string} type - Tipo de log
 * @param {string} sessionId - ID de sesión
 * @returns {Promise<void>}
 */
async function sendLogMessage(message, type, sessionId) {
  await axios.post(CHARGING_LOGS_URL, {
    message,
    type,
    sessionId
  });
}

/**
 * Envía logs para notificación PUT
 * @param {string} sessionId - ID de sesión
 * @param {Object} sessionData - Datos de la sesión
 * @returns {Promise<void>}
 */
async function sendPutLogs(sessionId, sessionData) {
  await sendLogMessage(`   📊 Estado: ${sessionData.status}`, 'info', sessionId);
  await sendLogMessage(`   ⚡ Energía: ${sessionData.kwh || 0} kWh`, 'info', sessionId);
  await sendLogMessage(`   🔌 EVSE: ${sessionData.evse_uid}`, 'evse', sessionId);
}

/**
 * Envía logs para notificación PATCH
 * @param {string} sessionId - ID de sesión
 * @param {Object} sessionData - Datos de la sesión
 * @returns {Promise<void>}
 */
async function sendPatchLogs(sessionId, sessionData) {
  await sendLogMessage(`   🔄 Campos actualizados: ${Object.keys(sessionData).join(', ')}`, 'debug', sessionId);
  
  if (sessionData.kwh !== undefined) {
    await sendLogMessage(`   ⚡ Energía: ${sessionData.kwh} kWh`, 'info', sessionId);
  }
  
  if (sessionData.total_cost !== undefined) {
    const cost = typeof sessionData.total_cost === 'object' ? sessionData.total_cost.excl_vat : sessionData.total_cost;
    await sendLogMessage(`   💰 Costo: ${cost} EUR`, 'info', sessionId);
  }
  
  if (sessionData.status !== undefined) {
    await sendLogMessage(`   📊 Estado: ${sessionData.status}`, 'info', sessionId);
  }
  
  if (sessionData.charging_periods !== undefined) {
    await sendLogMessage(`   ⏱️ Períodos de carga: ${sessionData.charging_periods.length} períodos`, 'info', sessionId);
  }
}

module.exports = {
    sendLogMessage,
    sendPutLogs,
    sendPatchLogs
};

