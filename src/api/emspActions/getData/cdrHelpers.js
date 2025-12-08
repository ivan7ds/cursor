const { sequelize } = require('../../../database/connection');
const logger = require('../../../utils/logger');
const { buildAuthorizationHeader } = require('../../../utils/tokenEncoding');
const { buildUrl } = require('../../../utils/urlSanitizer');

const {
  buildCDRBasicValues,
  buildCDRLocationValues,
  buildCDRAuthValues,
  buildCDRDates,
  buildCDRCostValues
} = require('./cdrDataHelpers');

/**
 * Obtiene CDRs de una organización externa
 * @param {Object} org - Organización externa
 * @returns {Promise<Array|null>} Array de CDRs o null si hay error
 */
async function fetchCDRsFromOrganization(org) {
  try {
    logger.info(`🔍 Consultando CDRs de ${org.party_id} (${org.url})`);

    const cdrsUrl = buildUrl(org.url, '/ocpi/cpo/2.2/cdrs');

    const response = await fetch(cdrsUrl, {
      method: 'GET',
      headers: {
        'Authorization': buildAuthorizationHeader(org.token, org.token_base64_encoded || false),
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        logger.info(`📥 Procesando ${data.data.length} CDRs de ${org.party_id}`);
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
 * Guarda un CDR individual en la base de datos
 * @param {Object} cdr - Datos del CDR
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con saved y duplicate
 */
async function saveCDR(cdr, org) {
  try {
    const basicValues = buildCDRBasicValues(cdr, org);
    const locationValues = buildCDRLocationValues(cdr);
    const authValues = buildCDRAuthValues(cdr);
    const dates = buildCDRDates(cdr);
    const costValues = buildCDRCostValues(cdr);

    const replacements = [
      ...basicValues,
      ...locationValues,
      ...authValues,
      ...dates,
      ...costValues
    ];

    const [result] = await sequelize.query(`
      INSERT INTO external_operator_cdrs (
        id, external_operator_party_id, external_operator_country_code, cdr_id, session_id, evse_uid,
        connector_id, id_token, start_datetime, end_datetime,
        total_energy, currency, total_cost, total_time, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        end_datetime = EXCLUDED.end_datetime,
        total_energy = EXCLUDED.total_energy,
        total_cost = EXCLUDED.total_cost,
        total_time = EXCLUDED.total_time,
        last_updated = EXCLUDED.last_updated,
        updated_at = NOW()
    `, {
      replacements
    });

    return {
      saved: result.rowCount > 0,
      duplicate: result.rowCount === 0
    };
  } catch (cdrError) {
    logger.error(`❌ Error procesando CDR:`, cdrError);
    throw cdrError;
  }
}

/**
 * Procesa un CDR individual
 * @param {Object} cdr - Datos del CDR
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con el CDR procesado y el resultado
 */
async function processSingleCDR(cdr, org) {
  const processedCDR = {
    ...cdr,
    // eslint-disable-next-line camelcase -- Campo requerido por la estructura de datos
    source_organization: {
      party_id: org.party_id,
      country_code: org.country_code,
      url: org.url
    }
  };

  const result = await saveCDR(cdr, org);
  return { processedCDR, result };
}

/**
 * Procesa y guarda CDRs de una organización
 * @param {Array} cdrs - Array de CDRs
 * @param {Object} org - Organización externa
 * @param {Array} allCDRs - Array acumulativo de todos los CDRs
 * @param {Array} errors - Array de errores
 * @returns {Promise<Object>} Objeto con savedCount y duplicateCount
 */
async function processCDRsFromOrg(cdrs, org, allCDRs, errors) {
  let savedCount = 0;
  let duplicateCount = 0;

  // Crear promesas para procesar todos los CDRs en paralelo
  const cdrPromises = cdrs.map(cdr => processSingleCDR(cdr, org));

  // Ejecutar todas las promesas y procesar resultados
  const results = await Promise.allSettled(cdrPromises);

  results.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      const { processedCDR, result } = settledResult.value;
      allCDRs.push(processedCDR);
      
      if (result.saved) {
        savedCount++;
      } else if (result.duplicate) {
        duplicateCount++;
      }
    } else {
      logger.error(`❌ Error procesando CDR:`, settledResult.reason);
      errors.push(`Error procesando CDR: ${settledResult.reason.message}`);
    }
  });

  return { savedCount, duplicateCount };
}

/**
 * Construye la respuesta exitosa para obtener CDRs externos
 * @param {Object} params - Parámetros de la respuesta
 * @param {Array} params.allCDRs - Todos los CDRs obtenidos
 * @param {number} params.organizationsCount - Número de organizaciones consultadas
 * @param {number} params.savedCount - Número de CDRs guardados
 * @param {number} params.duplicateCount - Número de CDRs duplicados
 * @param {Array} params.errors - Array de errores
 * @returns {Object} Respuesta JSON
 */
function buildGetCDRsResponse({ allCDRs, organizationsCount, savedCount, duplicateCount, errors }) {
  return {
    status_code: 1000,
    data: allCDRs,
    metadata: {
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      total_cdrs: allCDRs.length,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      organizations_consulted: organizationsCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      cdrs_saved: savedCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      cdrs_duplicates: duplicateCount,
      errors,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    fetchCDRsFromOrganization,
    processCDRsFromOrg,
    buildGetCDRsResponse
};

