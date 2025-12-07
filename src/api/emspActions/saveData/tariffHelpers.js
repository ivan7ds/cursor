const { sequelize } = require('../../../database/connection');
const logger = require('../../../utils/logger');

/**
 * Valida que un tariff tenga los campos obligatorios
 * @param {Object} tariff - Datos del tariff
 * @returns {boolean} True si es válido, false si no
 */
function validateTariff(tariff) {
  return !!(tariff.party_id && tariff.country_code && tariff.id);
}

/**
 * Extrae el nombre del tariff desde tariff_alt_text o name
 * @param {Object|Array|string} altText - Tariff alt text
 * @param {string} fallbackName - Nombre alternativo
 * @returns {string|null} Nombre extraído o null
 */
function extractTariffName(altText, fallbackName) {
  if (fallbackName && typeof fallbackName === 'string' && fallbackName.trim().length > 0) {
    return fallbackName;
  }

  if (!altText) {
    return null;
  }

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
 * Prepara los valores para insertar/actualizar un tariff
 * @param {Object} tariff - Datos del tariff
 * @returns {Array} Array de valores para la query SQL
 */
function prepareTariffValues(tariff) {
  const tariffName = extractTariffName(tariff.tariff_alt_text, tariff.name);
  
  return [
    tariff.id,
    tariff.party_id,
    tariff.country_code,
    tariff.id, // tariff_id es el mismo que id
    tariff.currency || 'EUR',
    tariff.type || 'REGULAR',
    tariffName,
    JSON.stringify(tariff.elements || []),
    tariff.start_date_time || null,
    tariff.end_date_time || null,
    tariff.last_updated || new Date().toISOString()
  ];
}

/**
 * Guarda un tariff individual en la base de datos
 * @param {Object} tariff - Datos del tariff
 */
async function saveTariff(tariff) {
  const values = prepareTariffValues(tariff);
  
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

/**
 * Procesa y guarda múltiples tariffs
 * @param {Array} tariffs - Array de tariffs
 * @param {Array} errors - Array de errores
 * @returns {Promise<number>} Número de tariffs guardados exitosamente
 */
async function processTariffs(tariffs, errors) {
  // Filtrar tariffs válidos
  const validTariffs = tariffs.filter(tariff => {
    if (!validateTariff(tariff)) {
      logger.warn(`⚠️ Tariff sin campos obligatorios party_id/country_code/id, saltando...`);
      return false;
    }
    return true;
  });

  // Crear promesas para procesar todos los tariffs válidos en paralelo
  const tariffPromises = validTariffs.map(async (tariff) => {
    try {
      logger.info(`🔍 Procesando tariff: ${tariff.id} (${tariff.party_id}_${tariff.country_code})`);
      await saveTariff(tariff);
      logger.info(`✅ Tariff ${tariff.id} guardado exitosamente`);
      return { success: true };
    } catch (tariffError) {
      logger.error(`❌ Error guardando tariff ${tariff.id}:`, tariffError);
      errors.push(`Tariff ${tariff.id}: ${tariffError.message}`);
      return { success: false };
    }
  });

  // Ejecutar todas las promesas y contar éxitos
  const results = await Promise.allSettled(tariffPromises);
  return results.filter(result => result.status === 'fulfilled' && result.value.success).length;
}

/**
 * Construye la respuesta exitosa para guardar tariffs
 * @param {number} savedCount - Número de tariffs guardados
 * @param {number} totalReceived - Total de tariffs recibidos
 * @param {Array} errors - Array de errores
 * @param {string} cpoUrl - URL del CPO
 * @returns {Object} Respuesta JSON
 */
function buildSaveTariffsResponse(savedCount, totalReceived, errors, cpoUrl) {
  return {
    status_code: 1000,
    data: {
      message: `${savedCount} tariffs guardados exitosamente`,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      total_received: totalReceived,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      saved_count: savedCount,
      errors: errors.length > 0 ? errors : null,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      cpo_url: cpoUrl
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    processTariffs,
    buildSaveTariffsResponse
};

