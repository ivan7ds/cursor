const { sequelize } = require('../../../database/connection');
const logger = require('../../../utils/logger');

const {
  buildBasicTokenValues,
  buildOptionalTokenValues
} = require('./tokenValuesHelpers');

/**
 * Valida que un token tenga los campos obligatorios
 * @param {Object} token - Datos del token
 * @returns {boolean} True si es válido, false si no
 */
function validateToken(token) {
  return !!(token.party_id && token.country_code && token.uid && token.type);
}

/**
 * Prepara los valores para insertar/actualizar un token
 * @param {Object} token - Datos del token
 * @returns {Array} Array de valores para la query SQL
 */
function prepareTokenValues(token) {
  const stableId = token.id || `${token.party_id}-${token.uid}`;
  const basicValues = buildBasicTokenValues(token, stableId);
  const optionalValues = buildOptionalTokenValues(token);

  return [
    ...basicValues,
    ...optionalValues
  ];
}

/**
 * Guarda un token individual en la base de datos
 * @param {Object} token - Datos del token
 */
async function saveToken(token) {
  const values = prepareTokenValues(token);
  
  await sequelize.query(`
    INSERT INTO external_operator_tokens (
      id, external_operator_party_id, external_operator_country_code, token_uid, type, contract_id, 
      visual_number, issuer, group_id, valid, whitelist, language, 
      default_profile_type, energy_contract, last_updated, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
      external_operator_party_id = EXCLUDED.external_operator_party_id,
      external_operator_country_code = EXCLUDED.external_operator_country_code,
      token_uid = EXCLUDED.token_uid,
      type = EXCLUDED.type,
      contract_id = EXCLUDED.contract_id,
      visual_number = EXCLUDED.visual_number,
      issuer = EXCLUDED.issuer,
      group_id = EXCLUDED.group_id,
      valid = EXCLUDED.valid,
      whitelist = EXCLUDED.whitelist,
      language = EXCLUDED.language,
      default_profile_type = EXCLUDED.default_profile_type,
      energy_contract = EXCLUDED.energy_contract,
      last_updated = EXCLUDED.last_updated,
      updated_at = NOW()
  `, {
    replacements: values
  });
}

/**
 * Procesa y guarda múltiples tokens
 * @param {Array} tokens - Array de tokens
 * @param {Array} errors - Array de errores
 * @returns {Promise<number>} Número de tokens guardados exitosamente
 */
async function processTokens(tokens, errors) {
  // Filtrar tokens válidos
  const validTokens = tokens.filter(token => {
    if (!validateToken(token)) {
      logger.warn(`⚠️ Token sin campos obligatorios party_id/country_code/uid/type, saltando...`);
      return false;
    }
    return true;
  });

  // Crear promesas para procesar todos los tokens válidos en paralelo
  const tokenPromises = validTokens.map(async (token) => {
    try {
      const stableId = token.id || `${token.party_id}-${token.uid}`;
      logger.info(`🔍 Procesando token: ${token.uid} (${token.party_id}_${token.country_code}) id=${stableId}`);
      
      await saveToken(token);
      logger.info(`✅ Token ${token.uid} guardado exitosamente`);
      return { success: true };
    } catch (tokenError) {
      logger.error(`❌ Error guardando token ${token.id || token.uid}:`, tokenError);
      errors.push(`Token ${token.id || token.uid}: ${tokenError.message}`);
      return { success: false };
    }
  });

  // Ejecutar todas las promesas y contar éxitos
  const results = await Promise.allSettled(tokenPromises);
  return results.filter(result => result.status === 'fulfilled' && result.value.success).length;
}

/**
 * Construye la respuesta exitosa para guardar tokens
 * @param {number} savedCount - Número de tokens guardados
 * @param {number} totalReceived - Total de tokens recibidos
 * @param {Array} errors - Array de errores
 * @returns {Object} Respuesta JSON
 */
function buildSaveTokensResponse(savedCount, totalReceived, errors) {
  return {
    status_code: 1000,
    data: {
      message: `${savedCount} tokens guardados exitosamente`,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      total_received: totalReceived,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      saved_count: savedCount,
      errors: errors.length > 0 ? errors : null
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    processTokens,
    buildSaveTokensResponse
};

