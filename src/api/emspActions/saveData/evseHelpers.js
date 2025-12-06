const { sequelize } = require('../../../database/connection');
const logger = require('../../../utils/logger');

/**
 * Guarda un EVSE individual en la base de datos
 * @param {Object} evse - Datos del EVSE
 * @param {string} cpoUrl - URL del CPO
 * @param {string} cpoToken - Token del CPO
 * @param {string} cpoVersion - Versión del CPO
 */
async function saveEVSE(evse, cpoUrl, cpoToken, cpoVersion) {
  await sequelize.query(`
    INSERT INTO emsp_evses (
      cpo_url, cpo_token, cpo_version, evse_id, location_id, party_id, country_code,
      status, capabilities, connectors, floor_level, coordinates, physical_reference,
      directions, restrictions, last_updated, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON CONFLICT (evse_id, location_id, party_id, country_code) 
    DO UPDATE SET
      cpo_url = EXCLUDED.cpo_url,
      cpo_token = EXCLUDED.cpo_token,
      cpo_version = EXCLUDED.cpo_version,
      status = EXCLUDED.status,
      capabilities = EXCLUDED.capabilities,
      connectors = EXCLUDED.connectors,
      floor_level = EXCLUDED.floor_level,
      coordinates = EXCLUDED.coordinates,
      physical_reference = EXCLUDED.physical_reference,
      directions = EXCLUDED.directions,
      restrictions = EXCLUDED.restrictions,
      last_updated = EXCLUDED.last_updated,
      updated_at = NOW()
  `, {
    replacements: [
      cpoUrl,
      cpoToken || null,
      cpoVersion || '2.2',
      evse.uid,
      evse.location_id,
      evse.party_id,
      evse.country_code,
      evse.status,
      JSON.stringify(evse.capabilities || []),
      JSON.stringify(evse.connectors || []),
      evse.floor_level,
      JSON.stringify(evse.coordinates || {}),
      evse.physical_reference,
      evse.directions,
      JSON.stringify(evse.restrictions || {}),
      evse.last_updated || new Date().toISOString()
    ]
  });
}

/**
 * Procesa y guarda múltiples EVSEs
 * @param {Object} params - Parámetros de procesamiento
 * @param {Array} params.evses - Array de EVSEs
 * @param {string} params.cpoUrl - URL del CPO
 * @param {string} params.cpoToken - Token del CPO
 * @param {string} params.cpoVersion - Versión del CPO
 * @param {Array} params.errors - Array de errores
 * @returns {Promise<number>} Número de EVSEs guardados exitosamente
 */
async function processEVSEs({ evses, cpoUrl, cpoToken, cpoVersion, errors }) {
  // Crear promesas para procesar todos los EVSEs en paralelo
  const evsePromises = evses.map(async (evse) => {
    try {
      await saveEVSE(evse, cpoUrl, cpoToken, cpoVersion);
      return { success: true };
    } catch (evseError) {
      logger.error(`❌ Error guardando EVSE ${evse.uid}:`, evseError);
      errors.push(`EVSE ${evse.uid}: ${evseError.message}`);
      return { success: false };
    }
  });

  // Ejecutar todas las promesas y contar éxitos
  const results = await Promise.allSettled(evsePromises);
  return results.filter(result => result.status === 'fulfilled' && result.value.success).length;
}

/**
 * Construye la respuesta exitosa para guardar EVSEs
 * @param {number} savedCount - Número de EVSEs guardados
 * @param {number} totalReceived - Total de EVSEs recibidos
 * @param {Array} errors - Array de errores
 * @param {string} cpoUrl - URL del CPO
 * @returns {Object} Respuesta JSON
 */
function buildSaveEVSEsResponse(savedCount, totalReceived, errors, cpoUrl) {
  return {
    status_code: 1000,
    data: {
      message: `${savedCount} EVSEs guardados exitosamente`,
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
    processEVSEs,
    buildSaveEVSEsResponse
};

