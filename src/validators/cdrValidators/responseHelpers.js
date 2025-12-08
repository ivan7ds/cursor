const logger = require('../../utils/logger');

const { validateCdrResponse, validateCdrsResponse } = require('./validationFunctions');

/**
 * Valida un array de CDRs y filtra los válidos
 * @param {Array} cdrs - Array de CDRs a validar
 * @param {Function} originalJson - Función original de res.json
 * @returns {Object} Objeto con cdrs válidos y actualización de paginación
 */
function validateCdrsArray(cdrs, _originalJson) {
  const validation = validateCdrsResponse(cdrs);

  if (!validation.valid) {
    logger.warn('⚠️ CDR GET response validation found invalid CDRs', {
      total: cdrs.length,
      valid: validation.validCdrs.length,
      invalid: validation.invalidCdrs.length,
      errors: validation.errors
    });
  }

  return {
    validCdrs: validation.validCdrs,
    updatePagination: (pagination) => {
      if (pagination) {
        pagination.total = validation.validCdrs.length;
      }
    }
  };
}

/**
 * Valida un CDR individual
 * @param {Object} cdr - CDR a validar
 * @param {Function} originalJson - Función original de res.json
 * @returns {Object|null} CDR validado o null si es inválido
 */
function validateSingleCdr(cdr, originalJson) {
  const validation = validateCdrResponse(cdr);

  if (!validation.valid) {
    logger.error('❌ CDR GET response validation failed', {
      cdr_id: cdr.id,
      errors: validation.errors
    });

    originalJson({
      status_code: 2001,
      status_message: 'CDR data does not conform to OCPI 2.2 specification',
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });

    return null;
  }

  return validation.value;
}

/**
 * Procesa la validación del body de respuesta
 * @param {Object} body - Body de la respuesta
 * @param {Function} originalJson - Función original de res.json
 * @returns {Object|null} Body procesado o null si hay error
 */
function processResponseBody(body, originalJson) {
  if (body.status_code !== 1000 || !body.data) {
    return body;
  }

  const isArray = Array.isArray(body.data);

  if (isArray) {
    const { validCdrs, updatePagination } = validateCdrsArray(body.data, originalJson);
    body.data = validCdrs;
    updatePagination(body.pagination);
  } else {
    const validatedCdr = validateSingleCdr(body.data, originalJson);
    if (!validatedCdr) {
      return null; // Error ya fue enviado
    }
    body.data = validatedCdr;
  }

  return body;
}

module.exports = {
    validateCdrsArray,
    validateSingleCdr,
    processResponseBody
};

