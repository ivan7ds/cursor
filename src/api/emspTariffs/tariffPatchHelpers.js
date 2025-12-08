const logger = require('../../utils/logger');

/**
 * Valida que la tarifa existe
 * @param {Object} sequelize - Instancia de Sequelize
 * @param {string} tariffId - ID de la tarifa
 * @param {string} countryCode - Código de país
 * @param {string} partyId - Party ID
 * @returns {Promise<boolean>} True si existe, false en caso contrario
 */
async function validateTariffExists(sequelize, tariffId, countryCode, partyId) {
  const [existingTariff] = await sequelize.query(`
    SELECT id FROM external_operator_tariffs WHERE id = ?
  `, {
    replacements: [tariffId],
    type: sequelize.QueryTypes.SELECT
  });

  if (!existingTariff) {
    logger.warn(`⚠️ Tariff not found: ${tariffId}`, {
      country_code: countryCode,
      party_id: partyId,
      tariff_id: tariffId
    });
  }

  return !!existingTariff;
}

/**
 * Construye la respuesta de error cuando la tarifa no existe
 * @returns {Object} Respuesta de error
 */
function buildTariffNotFoundResponse() {
  return {
    status: 404,
    json: {
      status_code: 2001,
      status_message: 'Tariff not found',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Construye los campos de actualización para PATCH de tarifa
 * @param {Object} updateData - Datos de actualización
 * @returns {Object} Objeto con updateFields y replacements
 */
function buildTariffPatchFields(updateData) {
  const updateFields = [];
  const replacements = [];

  const fieldMap = {
    currency: 'currency',
    type: 'type',
    tariff_alt_text: 'tariff_alt_text',
    tariff_alt_url: 'tariff_alt_url',
    min_price: 'min_price',
    max_price: 'max_price',
    elements: 'elements',
    start_date_time: 'start_date_time',
    end_date_time: 'end_date_time',
    energy_mix: 'energy_mix',
    last_updated: 'last_updated'
  };

  const jsonFields = ['tariff_alt_text', 'min_price', 'max_price', 'elements', 'energy_mix'];

  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (updateData[key] !== undefined) {
      updateFields.push(`${dbField} = ?`);
      if (jsonFields.includes(key)) {
        replacements.push(JSON.stringify(updateData[key]));
      } else {
        replacements.push(updateData[key]);
      }
    }
  }

  return { updateFields, replacements };
}

/**
 * Ejecuta la actualización de la tarifa en la base de datos
 * @param {Object} sequelize - Instancia de Sequelize
 * @param {Array} updateFields - Campos de actualización
 * @param {Array} replacements - Valores de reemplazo para la query
 * @param {string} tariffId - ID de la tarifa
 * @returns {Promise<void>}
 */
async function executeTariffUpdate(sequelize, updateFields, replacements, tariffId) {
  replacements.push(tariffId);
  await sequelize.query(`
    UPDATE external_operator_tariffs SET ${updateFields.join(', ')} WHERE id = ?
  `, { replacements });
}

/**
 * Construye la respuesta de éxito para PATCH de tarifa
 * @returns {Object} Respuesta de éxito
 */
function buildTariffPatchSuccessResponse() {
  return {
    status_code: 1000,
    status_message: 'Success',
    timestamp: new Date().toISOString()
  };
}

/**
 * Construye la respuesta de error para PATCH de tarifa
 * @param {Error} error - Error ocurrido
 * @param {Object} params - Parámetros de la petición
 * @param {Object} body - Cuerpo de la petición
 * @returns {Object} Respuesta de error
 */
function buildTariffPatchErrorResponse(error, params, body) {
  logger.error(`❌ Error patching tariff: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    params,
    body
  });

  return {
    status: 500,
    json: {
      status_code: 2000,
      status_message: `Internal server error: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
    validateTariffExists,
    buildTariffNotFoundResponse,
    buildTariffPatchFields,
    executeTariffUpdate,
    buildTariffPatchSuccessResponse,
    buildTariffPatchErrorResponse
};

