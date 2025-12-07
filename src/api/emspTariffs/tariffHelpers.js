const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');

/**
 * Verifica si una tarifa existe
 * @param {string} tariffId - ID de la tarifa
 * @returns {Promise<boolean>} True si existe, false si no
 */
async function tariffExists(tariffId) {
  const [existingTariff] = await sequelize.query(`
    SELECT id FROM external_operator_tariffs WHERE id = ?
  `, {
    replacements: [tariffId],
    type: sequelize.QueryTypes.SELECT
  });
  
  return !!existingTariff;
}

/**
 * Prepara los valores para actualizar o crear una tarifa
 * @param {Object} tariffData - Datos de la tarifa
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 * @returns {Array} Array de valores para la query SQL
 */
function prepareTariffValues(tariffData, partyId, countryCode) {
  return [
    partyId,
    countryCode,
    tariffData.currency,
    tariffData.type || null,
    JSON.stringify(tariffData.tariff_alt_text || []),
    tariffData.tariff_alt_url || null,
    JSON.stringify(tariffData.min_price || null),
    JSON.stringify(tariffData.max_price || null),
    JSON.stringify(tariffData.elements),
    tariffData.start_date_time || null,
    tariffData.end_date_time || null,
    JSON.stringify(tariffData.energy_mix || null),
    tariffData.last_updated
  ];
}

/**
 * Actualiza una tarifa existente
 * @param {string} tariffId - ID de la tarifa
 * @param {Object} tariffData - Datos de la tarifa
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 */
async function updateTariff(tariffId, tariffData, partyId, countryCode) {
  const values = prepareTariffValues(tariffData, partyId, countryCode);
  values.push(tariffId); // Para el WHERE id = ?

  await sequelize.query(`
    UPDATE external_operator_tariffs SET
      external_operator_party_id = ?,
      external_operator_country_code = ?,
      currency = ?,
      type = ?,
      tariff_alt_text = ?,
      tariff_alt_url = ?,
      min_price = ?,
      max_price = ?,
      elements = ?,
      start_date_time = ?,
      end_date_time = ?,
      energy_mix = ?,
      last_updated = ?
    WHERE id = ?
  `, {
    replacements: values,
    type: sequelize.QueryTypes.UPDATE
  });

  logger.info(`✅ Tariff updated in external_operator_tariffs: ${tariffId}`);
}

/**
 * Crea una nueva tarifa
 * @param {string} tariffId - ID de la tarifa
 * @param {Object} tariffData - Datos de la tarifa
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 */
async function createTariff(tariffId, tariffData, partyId, countryCode) {
  const values = prepareTariffValues(tariffData, partyId, countryCode);
  values.unshift(tariffId); // Insertar al inicio: id

  await sequelize.query(`
    INSERT INTO external_operator_tariffs (
      id, external_operator_party_id, external_operator_country_code, currency, type,
      tariff_alt_text, tariff_alt_url, min_price, max_price,
      elements, start_date_time, end_date_time, energy_mix, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, {
    replacements: values,
    type: sequelize.QueryTypes.INSERT
  });

  logger.info(`✅ Tariff created in external_operator_tariffs: ${tariffId}`);
}

/**
 * Construye los campos de actualización para PATCH
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

module.exports = {
    tariffExists,
    updateTariff,
    createTariff,
    buildTariffPatchFields
};

