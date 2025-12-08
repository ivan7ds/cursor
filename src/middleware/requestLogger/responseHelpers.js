const logger = require('../../utils/logger');

/**
 * Construye el log detallado de la respuesta
 * @param {Object} params - Parámetros de logging
 * @param {Object} params.req - Request object
 * @param {Object} params.res - Response object
 * @param {number} params.responseTime - Tiempo de respuesta en ms
 * @param {Object} params.relevantHeaders - Headers relevantes
 * @param {Object} params.requestBody - Cuerpo de la petición
 * @param {Object} params.responseHeaders - Headers de la respuesta
 * @param {Object} params.responseBody - Cuerpo de la respuesta
 */
function logDetailedResponse({ req, res, responseTime, relevantHeaders, requestBody, responseHeaders, responseBody }) {
  logger.info(`🌐 ${req.method} ${req.path}`, {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    responseTime: `${responseTime}ms`,
    requestHeaders: relevantHeaders,
    requestBody,
    responseHeaders,
    responseBody,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    query: Object.keys(req.query).length > 0 ? req.query : undefined
  });
}

/**
 * Construye el objeto de error para logging
 * @param {Object} params - Parámetros de construcción
 * @param {Object} params.req - Request object
 * @param {Object} params.res - Response object
 * @param {Object} params.relevantHeaders - Headers relevantes
 * @param {Object} params.requestBody - Cuerpo de la petición
 * @param {Object} params.responseHeaders - Headers de la respuesta
 * @param {Object} params.responseBody - Cuerpo de la respuesta
 * @returns {Object} Objeto de error para logging
 */
function buildErrorLogObject({ req, res, relevantHeaders, requestBody, responseHeaders, responseBody }) {
  return {
    error_type: res.statusCode >= 500 ? 'SERVER_ERROR' : 'API_RESPONSE',
    direction: 'INBOUND',
    endpoint: req.originalUrl || req.url,
    method: req.method,
    status_code: res.statusCode,
    error_message: res.statusMessage || `HTTP ${res.statusCode}`,
    request_body: requestBody,
    response_body: responseBody,
    request_headers: relevantHeaders,
    response_headers: responseHeaders,
    ip_address: req.ip || req.connection?.remoteAddress || null,
    user_agent: req.get('user-agent') || null
  };
}

/**
 * Logs errores de aplicación si el código de estado es >= 400
 * @param {Object} params - Parámetros de logging
 * @param {Object} params.req - Request object
 * @param {Object} params.res - Response object
 * @param {Object} params.relevantHeaders - Headers relevantes
 * @param {Object} params.requestBody - Cuerpo de la petición
 * @param {Object} params.responseHeaders - Headers de la respuesta
 * @param {Object} params.responseBody - Cuerpo de la respuesta
 * @returns {Promise<void>}
 */
async function logApplicationErrors({ req, res, relevantHeaders, requestBody, responseHeaders, responseBody }) {
  if (res.statusCode >= 400) {
    const { logApplicationError } = require('../../utils/applicationErrorLogger');
    const errorLogObject = buildErrorLogObject({ req, res, relevantHeaders, requestBody, responseHeaders, responseBody });
    await logApplicationError(errorLogObject);
  }
}

/**
 * Verifica si el user agent es de un navegador
 * @param {string} userAgent - User agent string
 * @returns {boolean} True si es navegador, false en caso contrario
 */
function isBrowserUserAgent(userAgent) {
  return userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');
}

/**
 * Logs el resumen de la petición API
 * @param {Object} params - Parámetros de logging
 * @param {Object} params.req - Request object
 * @param {Object} params.res - Response object
 * @param {number} params.responseTime - Tiempo de respuesta en ms
 * @param {Object} params.requestBody - Cuerpo de la petición
 * @param {Object} params.responseBody - Cuerpo de la respuesta
 */
function logApiRequestSummary({ req, res, responseTime, requestBody, responseBody }) {
  const userAgent = req.get('User-Agent') || '';
  if (!isBrowserUserAgent(userAgent)) {
    logger.info('📊 API Request Summary', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      requestSize: requestBody ? JSON.stringify(requestBody).length : 0,
      responseSize: responseBody ? JSON.stringify(responseBody).length : 0,
      ip: req.ip
    });
  }
}

module.exports = {
    logDetailedResponse,
    logApplicationErrors,
    logApiRequestSummary
};

