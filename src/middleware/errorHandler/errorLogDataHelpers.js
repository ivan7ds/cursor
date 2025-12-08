/**
 * Extrae el tipo de error con valor por defecto
 * @param {Error} err - Error ocurrido
 * @returns {string} Tipo de error
 */
function getErrorType(err) {
  return err.name || 'SERVER_ERROR';
}

/**
 * Extrae el endpoint de la request
 * @param {Object} req - Request object
 * @returns {string} Endpoint
 */
function getEndpoint(req) {
  return req.originalUrl || req.url;
}

/**
 * Extrae el código de estado del error
 * @param {Error} err - Error ocurrido
 * @returns {number} Código de estado
 */
function getStatusCode(err) {
  return err.statusCode || 500;
}

/**
 * Extrae el mensaje de error con valor por defecto
 * @param {Error} err - Error ocurrido
 * @returns {string} Mensaje de error
 */
function getErrorMessage(err) {
  return err.message || 'Internal Server Error';
}

/**
 * Extrae la dirección IP de la request
 * @param {Object} req - Request object
 * @returns {string|null} Dirección IP
 */
function getIpAddress(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

/**
 * Extrae el user agent de la request
 * @param {Object} req - Request object
 * @returns {string|null} User agent
 */
function getUserAgent(req) {
  return req.get('user-agent') || null;
}

/**
 * Construye los datos de error para logging
 * @param {Error} err - Error ocurrido
 * @param {Object} req - Request object
 * @returns {Object} Datos de error para logging
 */
function buildErrorLogData(err, req) {
  return {
    error_type: getErrorType(err),
    direction: 'INBOUND',
    endpoint: getEndpoint(req),
    method: req.method,
    status_code: getStatusCode(err),
    error_message: getErrorMessage(err),
    error_stack: err.stack || null,
    request_body: req.body || null,
    request_headers: req.headers || null,
    ip_address: getIpAddress(req),
    user_agent: getUserAgent(req)
  };
}

module.exports = {
  buildErrorLogData
};

