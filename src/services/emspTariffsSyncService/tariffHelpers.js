const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');

/**
 * Extrae el nombre del tariff desde tariff_alt_text
 * @param {*} altText - Texto alternativo del tariff
 * @returns {string|null} Nombre extraído o null
 */
function extractTariffName(altText) {
  if (!altText) return null;

  if (typeof altText === 'string') {
    return altText;
  }

  if (Array.isArray(altText)) {
    const entry = altText.find(item => item && typeof item.text === 'string' && item.text.trim().length > 0);
    return entry ? entry.text : null;
  }

  if (typeof altText === 'object' && typeof altText.text === 'string') {
    return altText.text;
  }

  return null;
}

/**
 * Valida los campos obligatorios del tariff
 * @param {Object} tariffData - Datos del tariff
 * @param {string} emspPartyId - Party ID del EMSP
 * @param {string} emspCountryCode - Código de país del EMSP
 * @returns {boolean} True si es válido, false en caso contrario
 */
function validateTariffRequiredFields(tariffData, emspPartyId, emspCountryCode) {
  return !!(tariffData.id && emspPartyId && emspCountryCode);
}

/**
 * Prepara los valores para insertar/actualizar un tariff
 * @param {Object} tariffData - Datos del tariff
 * @param {string} emspPartyId - Party ID del EMSP
 * @param {string} emspCountryCode - Código de país del EMSP
 * @param {string} now - Timestamp actual
 * @returns {Array} Array de valores para la query SQL
 */
function prepareTariffValues(tariffData, emspPartyId, emspCountryCode, now) {
  const tariffName = extractTariffName(tariffData.tariff_alt_text);

  return [
    tariffData.id,
    emspPartyId,
    emspCountryCode,
    tariffData.id, // tariff_id es el mismo que id
    tariffData.currency || 'EUR',
    tariffData.type || 'REGULAR',
    tariffName,
    JSON.stringify(tariffData.elements || []),
    tariffData.start_date_time || null,
    tariffData.end_date_time || null,
    tariffData.last_updated || now
  ];
}

/**
 * Inserta o actualiza un tariff en la base de datos
 * @param {Array} values - Valores para la query SQL
 * @returns {Promise<void>}
 */
async function upsertTariff(values) {
  await sequelize.query(`
    INSERT INTO external_operator_tariffs (
      id, external_operator_party_id, external_operator_country_code, tariff_id, currency, type, 
      name, elements, start_date_time, end_date_time, last_updated, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
      external_operator_party_id = EXCLUDED.external_operator_party_id,
      external_operator_country_code = EXCLUDED.external_operator_country_code,
      tariff_id = EXCLUDED.tariff_id,
      currency = EXCLUDED.currency,
      type = EXCLUDED.type,
      name = EXCLUDED.name,
      elements = EXCLUDED.elements,
      start_date_time = EXCLUDED.start_date_time,
      end_date_time = EXCLUDED.end_date_time,
      last_updated = EXCLUDED.last_updated,
      updated_at = NOW()
  `, {
    replacements: values
  });
}

module.exports = {
    validateTariffRequiredFields,
    prepareTariffValues,
    upsertTariff
};

