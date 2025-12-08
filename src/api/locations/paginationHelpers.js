const logger = require('../../utils/logger');

/**
 * Valida los parámetros de paginación
 * @param {string} offset - Offset como string
 * @param {string} limit - Limit como string
 * @returns {Object|null} Error si es inválido, null si es válido
 */
function validatePaginationParams(offset, limit) {
  const offsetInt = parseInt(offset);
  const limitInt = parseInt(limit);
  
  if (isNaN(offsetInt) || offsetInt < 0) {
    return {
      status: 400,
      json: {
        status_code: 2001,
        status_message: 'Invalid offset parameter. Must be a non-negative integer.',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  if (isNaN(limitInt) || limitInt < 1 || limitInt > 1000) {
    return {
      status: 400,
      json: {
        status_code: 2001,
        status_message: 'Invalid limit parameter. Must be between 1 and 1000.',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  return null;
}

/**
 * Construye el objeto where para la consulta
 * @param {string} countryCode - Código de país
 * @param {string} partyId - Party ID
 * @returns {Object} Objeto where para Sequelize
 */
function buildWhereClause(countryCode, partyId) {
  const where = {};
  if (countryCode) where.country_code = countryCode;
  if (partyId) where.party_id = partyId;
  where.deleted_at = null; // Filtrar locations eliminadas (soft delete)
  return where;
}

/**
 * Calcula la información de paginación
 * @param {number} totalCount - Total de registros
 * @param {number} offsetInt - Offset como número
 * @param {number} limitInt - Limit como número
 * @returns {Object} Información de paginación
 */
function calculatePaginationInfo(totalCount, offsetInt, limitInt) {
  const hasNextPage = (offsetInt + limitInt) < totalCount;
  const hasPrevPage = offsetInt > 0;
  
  logger.info(`Pagination debug: total=${totalCount}, limit=${limitInt}, offset=${offsetInt}`);
  logger.info(`Calculated: hasNext=${hasNextPage}, hasPrev=${hasPrevPage}`);
  
  return { hasNextPage, hasPrevPage };
}

/**
 * Construye los headers de paginación OCPI 2.2
 * @param {number} totalCount - Total de registros
 * @param {number} limitInt - Limit como número
 * @param {boolean} hasNextPage - Si hay página siguiente
 * @param {Object} req - Request object
 * @returns {Object} Headers de paginación
 */
function buildPaginationHeaders(totalCount, limitInt, hasNextPage, req) {
  const headers = {
    'X-Total-Count': totalCount.toString(),
    'X-Limit': limitInt.toString()
  };
  
  if (hasNextPage) {
    const nextOffset = parseInt(req.query.offset || 0) + limitInt;
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const queryParams = new URLSearchParams(req.query);
    queryParams.set('offset', nextOffset.toString());
    queryParams.set('limit', limitInt.toString());
    
    const nextPageUrl = `${baseUrl}?${queryParams.toString()}`;
    headers.Link = `<${nextPageUrl}>; rel="next"`;
  }
  
  return headers;
}

module.exports = {
    validatePaginationParams,
    buildWhereClause,
    calculatePaginationInfo,
    buildPaginationHeaders
};

