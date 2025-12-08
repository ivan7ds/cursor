const logger = require('../../utils/logger');

const {
  validateTariffExists,
  buildTariffNotFoundResponse,
  buildTariffPatchFields,
  executeTariffUpdate,
  buildTariffPatchSuccessResponse
} = require('./tariffPatchHelpers');

/**
 * Procesa la petición PATCH de tarifa
 * @param {Object} params - Parámetros de la ruta
 * @param {Object} updateData - Datos de actualización
 * @param {Object} sequelize - Instancia de Sequelize
 * @returns {Promise<Object>} Resultado de la operación
 */
async function processTariffPatchRequest(params, updateData, sequelize) {
  const { country_code, party_id, tariff_id } = params;

  logger.info(`📥 PATCH Tariff received`, {
    country_code,
    party_id,
    tariff_id,
    updateFields: Object.keys(updateData),
    timestamp: new Date().toISOString()
  });

  const exists = await validateTariffExists(sequelize, tariff_id, country_code, party_id);
  if (!exists) {
    return { error: buildTariffNotFoundResponse() };
  }

  const { updateFields, replacements } = buildTariffPatchFields(updateData);
  
  if (updateFields.length === 0) {
    logger.warn(`⚠️ No fields to update for PATCH`, {
      country_code,
      party_id,
      tariff_id
    });
    return {
      error: {
        status: 400,
        json: {
          status_code: 2001,
          status_message: 'No fields to update',
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  await executeTariffUpdate(sequelize, updateFields, replacements, tariff_id);

  logger.info(`✅ Tariff patched: ${tariff_id}`, {
    updatedFields: Object.keys(updateData)
  });

  return { success: buildTariffPatchSuccessResponse() };
}

module.exports = {
    processTariffPatchRequest
};

