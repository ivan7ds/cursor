/**
 * Construye la respuesta de error para ValidationError
 * @returns {Object} Respuesta de error
 */
function buildValidationErrorResponse() {
  return {
    status: 400,
    json: {
      status_code: 2001,
      status_message: 'Invalid or missing parameters',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Construye la respuesta de error para SequelizeValidationError
 * @returns {Object} Respuesta de error
 */
function buildSequelizeValidationErrorResponse() {
  return {
    status: 400,
    json: {
      status_code: 2001,
      status_message: 'Invalid data format',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Construye la respuesta de error para SequelizeUniqueConstraintError
 * @returns {Object} Respuesta de error
 */
function buildUniqueConstraintErrorResponse() {
  return {
    status: 409,
    json: {
      status_code: 2002,
      status_message: 'Resource already exists',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Construye la respuesta de error para SequelizeForeignKeyConstraintError
 * @returns {Object} Respuesta de error
 */
function buildForeignKeyConstraintErrorResponse() {
  return {
    status: 400,
    json: {
      status_code: 2003,
      status_message: 'Referenced resource does not exist',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Construye la respuesta de error genérica
 * @param {Error} err - Error ocurrido
 * @returns {Object} Respuesta de error
 */
function buildGenericErrorResponse(err) {
  return {
    status: err.statusCode || 500,
    json: {
      status_code: err.statusCode || 2000,
      status_message: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
    buildValidationErrorResponse,
    buildSequelizeValidationErrorResponse,
    buildUniqueConstraintErrorResponse,
    buildForeignKeyConstraintErrorResponse,
    buildGenericErrorResponse
};

