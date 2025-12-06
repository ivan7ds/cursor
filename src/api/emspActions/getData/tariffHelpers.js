const { sequelize } = require('../../../database/connection');
const logger = require('../../../utils/logger');


/**
 * Obtiene tariffs de una organización externa
 * @param {Object} org - Organización externa
 * @returns {Promise<Array|null>} Array de tariffs o null si hay error
 */
async function fetchTariffsFromOrganization(org) {
  try {
    logger.info(`🔍 Consultando tariffs de ${org.party_id} (${org.url})`);

    const tariffsUrl = `${org.url}/ocpi/cpo/2.2/tariffs`;

    const response = await fetch(tariffsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${org.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        logger.info(`📥 Procesando ${data.data.length} tariffs de ${org.party_id}`);
        return data.data;
      }
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} - ${errorText}`);
    }
  } catch (error) {
    logger.error(`❌ Error consultando ${org.party_id}:`, error);
    throw error;
  }
  
  return null;
}

/**
 * Guarda un tariff individual en la base de datos
 * @param {Object} tariff - Datos del tariff
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con saved y duplicate
 */
async function saveTariff(tariff, org) {
  try {
    const [result] = await sequelize.query(`
      INSERT INTO emsp_tariffs (
        id, emsp_party_id, emsp_country_code, tariff_id, currency, type, elements, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        currency = EXCLUDED.currency,
        type = EXCLUDED.type,
        elements = EXCLUDED.elements,
        last_updated = EXCLUDED.last_updated,
        updated_at = NOW()
    `, {
      replacements: [
        tariff.id,
        org.party_id,
        org.country_code,
        tariff.id,
        tariff.currency || 'EUR',
        tariff.type || 'REGULAR',
        JSON.stringify(tariff.elements || []),
        tariff.last_updated || new Date().toISOString()
      ]
    });

    return {
      saved: result.rowCount > 0,
      duplicate: result.rowCount === 0
    };
  } catch (tariffError) {
    logger.error(`❌ Error procesando tariff:`, tariffError);
    throw tariffError;
  }
}

/**
 * Procesa y guarda tariffs de una organización
 * @param {Array} tariffs - Array de tariffs
 * @param {Object} org - Organización externa
 * @param {Array} allTariffs - Array acumulativo de todos los tariffs
 * @param {Array} errors - Array de errores
 * @returns {Promise<Object>} Objeto con savedCount y duplicateCount
 */
/**
 * Procesa un tariff individual
 * @param {Object} tariff - Datos del tariff
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con el tariff procesado y el resultado
 */
async function processSingleTariff(tariff, org) {
  const processedTariff = {
    ...tariff,
    // eslint-disable-next-line camelcase -- Campo requerido por la estructura de datos
    source_organization: {
      party_id: org.party_id,
      country_code: org.country_code,
      url: org.url
    }
  };

  const result = await saveTariff(tariff, org);
  return { processedTariff, result };
}

async function processTariffsFromOrg(tariffs, org, allTariffs, errors) {
  let savedCount = 0;
  let duplicateCount = 0;

  // Crear promesas para procesar todos los tariffs en paralelo
  const tariffPromises = tariffs.map(tariff => processSingleTariff(tariff, org));

  // Ejecutar todas las promesas y procesar resultados
  const results = await Promise.allSettled(tariffPromises);

  results.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      const { processedTariff, result } = settledResult.value;
      allTariffs.push(processedTariff);
      
      if (result.saved) {
        savedCount++;
      } else if (result.duplicate) {
        duplicateCount++;
      }
    } else {
      logger.error(`❌ Error procesando tariff:`, settledResult.reason);
      errors.push(`Error procesando tariff: ${settledResult.reason.message}`);
    }
  });

  return { savedCount, duplicateCount };
}

/**
 * Construye la respuesta exitosa para obtener tariffs externos
 * @param {Object} params - Parámetros de la respuesta
 * @param {Array} params.allTariffs - Todos los tariffs obtenidos
 * @param {number} params.organizationsCount - Número de organizaciones consultadas
 * @param {number} params.savedCount - Número de tariffs guardados
 * @param {number} params.duplicateCount - Número de tariffs duplicados
 * @param {Array} params.errors - Array de errores
 * @returns {Object} Respuesta JSON
 */
function buildGetTariffsResponse({ allTariffs, organizationsCount, savedCount, duplicateCount, errors }) {
  return {
    status_code: 1000,
    data: allTariffs,
    metadata: {
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      total_tariffs: allTariffs.length,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      organizations_consulted: organizationsCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      tariffs_saved: savedCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      tariffs_duplicates: duplicateCount,
      errors,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    fetchTariffsFromOrganization,
    processTariffsFromOrg,
    buildGetTariffsResponse
};

