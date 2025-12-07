const { sequelize } = require('../../../database/connection');
const logger = require('../../../utils/logger');
const { buildAuthorizationHeader } = require('../../../utils/tokenEncoding');
const { buildUrl } = require('../../../utils/urlSanitizer');


/**
 * Obtiene tokens de una organización externa
 * @param {Object} org - Organización externa
 * @returns {Promise<Array|null>} Array de tokens o null si hay error
 */
async function fetchTokensFromOrganization(org) {
  try {
    logger.info(`🔍 Consultando tokens de ${org.party_id} (${org.url})`);

    const tokensUrl = buildUrl(org.url, '/ocpi/emsp/2.2/tokens');

    const response = await fetch(tokensUrl, {
      method: 'GET',
      headers: {
        'Authorization': buildAuthorizationHeader(org.token, org.token_base64_encoded || false),
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        logger.info(`📥 Procesando ${data.data.length} tokens de ${org.party_id}`);
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
 * Guarda un token individual en la base de datos
 * @param {Object} token - Datos del token
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con saved y duplicate
 */
async function saveToken(token, org) {
  try {
    const [result] = await sequelize.query(`
      INSERT INTO emsp_tokens (
        id, emsp_party_id, emsp_country_code, token_uid, type,
        contract_id, issuer, valid, whitelist, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        valid = EXCLUDED.valid,
        whitelist = EXCLUDED.whitelist,
        last_updated = EXCLUDED.last_updated,
        updated_at = NOW()
    `, {
      replacements: [
        token.uid,
        org.party_id,
        org.country_code,
        token.uid,
        token.type || 'RFID',
        token.contract_id || null,
        token.issuer || 'Unknown',
        token.valid !== undefined ? token.valid : true,
        token.whitelist || 'ALLOWED',
        token.last_updated || new Date().toISOString()
      ]
    });

    return {
      saved: result.rowCount > 0,
      duplicate: result.rowCount === 0
    };
  } catch (tokenError) {
    logger.error(`❌ Error procesando token:`, tokenError);
    throw tokenError;
  }
}

/**
 * Procesa y guarda tokens de una organización
 * @param {Array} tokens - Array de tokens
 * @param {Object} org - Organización externa
 * @param {Array} allTokens - Array acumulativo de todos los tokens
 * @param {Array} errors - Array de errores
 * @returns {Promise<Object>} Objeto con savedCount y duplicateCount
 */
/**
 * Procesa un token individual
 * @param {Object} token - Datos del token
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con el token procesado y el resultado
 */
async function processSingleToken(token, org) {
  const processedToken = {
    ...token,
    // eslint-disable-next-line camelcase -- Campo requerido por la estructura de datos
    source_organization: {
      party_id: org.party_id,
      country_code: org.country_code,
      url: org.url
    }
  };

  const result = await saveToken(token, org);
  return { processedToken, result };
}

async function processTokensFromOrg(tokens, org, allTokens, errors) {
  let savedCount = 0;
  let duplicateCount = 0;

  // Crear promesas para procesar todos los tokens en paralelo
  const tokenPromises = tokens.map(token => processSingleToken(token, org));

  // Ejecutar todas las promesas y procesar resultados
  const results = await Promise.allSettled(tokenPromises);

  results.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      const { processedToken, result } = settledResult.value;
      allTokens.push(processedToken);
      
      if (result.saved) {
        savedCount++;
      } else if (result.duplicate) {
        duplicateCount++;
      }
    } else {
      logger.error(`❌ Error procesando token:`, settledResult.reason);
      errors.push(`Error procesando token: ${settledResult.reason.message}`);
    }
  });

  return { savedCount, duplicateCount };
}

/**
 * Construye la respuesta exitosa para obtener tokens externos
 * @param {Object} params - Parámetros de la respuesta
 * @param {Array} params.allTokens - Todos los tokens obtenidos
 * @param {number} params.organizationsCount - Número de organizaciones consultadas
 * @param {number} params.savedCount - Número de tokens guardados
 * @param {number} params.duplicateCount - Número de tokens duplicados
 * @param {Array} params.errors - Array de errores
 * @returns {Object} Respuesta JSON
 */
function buildGetTokensResponse({ allTokens, organizationsCount, savedCount, duplicateCount, errors }) {
  return {
    status_code: 1000,
    data: allTokens,
    metadata: {
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      total_tokens: allTokens.length,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      organizations_consulted: organizationsCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      tokens_saved: savedCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      tokens_duplicates: duplicateCount,
      errors,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    fetchTokensFromOrganization,
    processTokensFromOrg,
    buildGetTokensResponse
};

