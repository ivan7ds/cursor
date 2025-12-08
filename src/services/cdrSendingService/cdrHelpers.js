const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');

/**
 * Prepara los datos del CDR para almacenamiento en base de datos
 * @param {Object} cdrPayload - Payload del CDR
 * @returns {Object} Datos del CDR preparados para la BD
 */
function prepareCDRData(cdrPayload) {
  return {
    id: cdrPayload.id,
    country_code: cdrPayload.country_code,
    party_id: cdrPayload.party_id,
    session_id: cdrPayload.session_id,
    evse_uid: cdrPayload.cdr_location.evse_uid,
    connector_id: cdrPayload.cdr_location.connector_id,
    id_token: cdrPayload.cdr_token.uid,
    start_datetime: new Date(cdrPayload.start_date_time),
    end_datetime: new Date(cdrPayload.end_date_time),
    total_energy: cdrPayload.total_energy,
    total_cost: cdrPayload.total_cost.excl_vat,
    currency: cdrPayload.currency,
    total_parking_time: null, // No disponible en el payload actual
    total_time: cdrPayload.total_time,
    last_updated: new Date(cdrPayload.last_updated)
  };
}

/**
 * Construye el query SQL para insertar/actualizar un CDR
 * @returns {string} Query SQL
 */
function buildCDRInsertQuery() {
  return `
    INSERT INTO cdrs (
      id, country_code, party_id, session_id, evse_uid, 
      connector_id, id_token, start_datetime, end_datetime, 
      total_energy, total_cost, currency, total_parking_time, 
      total_time, last_updated, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
      country_code = EXCLUDED.country_code,
      party_id = EXCLUDED.party_id,
      session_id = EXCLUDED.session_id,
      evse_uid = EXCLUDED.evse_uid,
      connector_id = EXCLUDED.connector_id,
      id_token = EXCLUDED.id_token,
      start_datetime = EXCLUDED.start_datetime,
      end_datetime = EXCLUDED.end_datetime,
      total_energy = EXCLUDED.total_energy,
      total_cost = EXCLUDED.total_cost,
      currency = EXCLUDED.currency,
      total_parking_time = EXCLUDED.total_parking_time,
      total_time = EXCLUDED.total_time,
      last_updated = EXCLUDED.last_updated,
      updated_at = NOW()
  `;
}

/**
 * Construye los replacements para el query SQL del CDR
 * @param {Object} cdrData - Datos del CDR
 * @returns {Array} Array de replacements
 */
function buildCDRReplacements(cdrData) {
  return [
    cdrData.id,
    cdrData.country_code,
    cdrData.party_id,
    cdrData.session_id,
    cdrData.evse_uid,
    cdrData.connector_id,
    cdrData.id_token,
    cdrData.start_datetime,
    cdrData.end_datetime,
    cdrData.total_energy,
    cdrData.total_cost,
    cdrData.currency,
    cdrData.total_parking_time,
    cdrData.total_time,
    cdrData.last_updated
  ];
}

/**
 * Almacena un CDR en la base de datos
 * @param {Object} cdrPayload - Payload del CDR
 * @returns {Promise<Object>} Datos del CDR almacenado
 */
async function storeCDRInDatabase(cdrPayload) {
  logger.info(`💾 Almacenando CDR ${cdrPayload.id} en base de datos`);

  const cdrData = prepareCDRData(cdrPayload);
  const query = buildCDRInsertQuery();
  const replacements = buildCDRReplacements(cdrData);

  await sequelize.query(query, { replacements });

  logger.info(`✅ CDR ${cdrPayload.id} almacenado exitosamente`);
  return cdrData;
}

/**
 * Procesa los resultados del envío de CDRs a múltiples organizaciones
 * @param {Array} results - Resultados de Promise.allSettled
 * @returns {Object} Estadísticas de envío
 */
function processCDRSendResults(results) {
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;

  return { successful, failed };
}

/**
 * Construye la respuesta cuando no hay organizaciones configuradas
 * @param {string} cdrId - ID del CDR
 * @returns {Object} Respuesta
 */
function buildNoOrganizationsResponse(cdrId) {
  return {
    success: true,
    cdr_id: cdrId,
    sent_to: 0,
    message: 'CDR almacenado localmente, no hay EMSPs configurados'
  };
}

/**
 * Construye la respuesta exitosa del procesamiento de CDR
 * @param {Object} params - Parámetros de construcción
 * @param {string} params.cdrId - ID del CDR
 * @param {number} params.organizationsCount - Número de organizaciones
 * @param {number} params.successful - Número de envíos exitosos
 * @param {number} params.failed - Número de envíos fallidos
 * @param {Array} params.results - Resultados del envío
 * @returns {Object} Respuesta
 */
function buildCDRProcessResponse({ cdrId, organizationsCount, successful, failed, results }) {
  return {
    success: true,
    cdr_id: cdrId,
    sent_to: organizationsCount,
    successful,
    failed,
    results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
  };
}

/**
 * Construye la respuesta exitosa del envío de CDR a una organización
 * @param {string} cdrId - ID del CDR
 * @param {string} organizationId - ID de la organización
 * @param {Object} responseData - Datos de la respuesta
 * @returns {Object} Respuesta exitosa
 */
function buildCDRSendSuccessResponse(cdrId, organizationId, responseData) {
  return {
    success: true,
    organization: organizationId,
    cdr_id: cdrId,
    response: responseData
  };
}

/**
 * Construye la respuesta de error del envío de CDR a una organización
 * @param {string} cdrId - ID del CDR
 * @param {string} organizationId - ID de la organización
 * @param {Object} errorData - Datos del error
 * @param {number} status - Código de estado HTTP
 * @returns {Object} Respuesta de error
 */
function buildCDRSendErrorResponse(cdrId, organizationId, errorData, status = null) {
  return {
    success: false,
    organization: organizationId,
    cdr_id: cdrId,
    error: errorData,
    ...(status && { status })
  };
}

module.exports = {
    storeCDRInDatabase,
    processCDRSendResults,
    buildNoOrganizationsResponse,
    buildCDRProcessResponse,
    buildCDRSendSuccessResponse,
    buildCDRSendErrorResponse
};

