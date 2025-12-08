const logger = require('../../utils/logger');

/**
 * Verifica si una ruta debe ser excluida del logging
 * @param {string} path - Ruta de la petición
 * @param {string} userAgent - User agent de la petición
 * @returns {boolean} True si debe ser excluida, false si no
 */
function shouldExcludePath(path, userAgent) {
  // Excluir endpoints de logs para evitar bucles infinitos
  if (path === '/logs/recent' || path === '/logs/stream') {
    return true;
  }
  
  // Excluir peticiones del navegador (aplicación web)
  if (userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari')) {
    return true;
  }
  
  // Excluir recursos estáticos
  if (path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return true;
  }
  
  // Excluir health check
  if (path === '/health') {
    return true;
  }
  
  // Excluir peticiones de la interfaz web (API calls desde el frontend)
  if (path.startsWith('/api/') && userAgent.includes('Mozilla')) {
    return true;
  }
  
  return false;
}

/**
 * Captura el body de la petición de forma segura
 * @param {Object} body - Request body
 * @returns {Object|null} Body copiado o null
 */
function captureRequestBody(body) {
  if (body && Object.keys(body).length > 0) {
    try {
      return JSON.parse(JSON.stringify(body));
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Captura headers relevantes de la petición
 * @param {Object} headers - Request headers
 * @returns {Object} Headers relevantes filtrados
 */
function captureRelevantHeaders(headers) {
  const relevantHeaders = {
    'authorization': headers.authorization ? `${headers.authorization.substring(0, 20)}...` : undefined,
    'ocpi-token': headers['ocpi-token'] ? `${headers['ocpi-token'].substring(0, 20)}...` : undefined,
    'content-type': headers['content-type'],
    'user-agent': headers['user-agent'],
    'accept': headers.accept
  };
  
  // Filtrar headers undefined
  Object.keys(relevantHeaders).forEach(key => {
    if (relevantHeaders[key] === undefined) {
      delete relevantHeaders[key];
    }
  });
  
  return relevantHeaders;
}

/**
 * Registra la petición entrante
 * @param {Object} req - Request object
 * @param {Object} relevantHeaders - Headers relevantes
 * @param {Object} requestBody - Request body capturado
 */
function logIncomingRequest(req, relevantHeaders, requestBody) {
  logger.info('🚀 API Request Incoming', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    ip: req.ip,
    headers: relevantHeaders,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    body: requestBody,
    userAgent: req.get('User-Agent')
  });
}

/**
 * Configura interceptores para capturar la respuesta
 * @param {Object} res - Response object
 * @returns {Object} Objeto con responseBody y responseHeaders
 */
function setupResponseInterceptors(res) {
  const originalSend = res.send;
  const originalJson = res.json;
  
  let responseBody = null;
  let responseHeaders = null;
  
  // Interceptar res.send()
  res.send = function(data) {
    responseBody = data;
    responseHeaders = res.getHeaders();
    return originalSend.call(this, data);
  };
  
  // Interceptar res.json()
  res.json = function(data) {
    responseBody = data;
    responseHeaders = res.getHeaders();
    return originalJson.call(this, data);
  };
  
  return { responseBody, responseHeaders };
}

/**
 * Registra la respuesta saliente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} startTime - Tiempo de inicio de la petición
 * @param {*} responseBody - Body de la respuesta
 * @param {Object} responseHeaders - Headers de la respuesta
 */
function logOutgoingResponse({ req, res, startTime, responseBody, responseHeaders }) {
  const duration = Date.now() - startTime;
  
  logger.info('✅ API Response Outgoing', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    headers: responseHeaders,
    body: responseBody
  });
}

/**
 * Maneja el evento 'finish' de la respuesta
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} startTime - Tiempo de inicio
 * @param {Object} relevantHeaders - Headers relevantes
 * @param {*} requestBody - Request body
 * @param {*} responseBody - Response body
 * @param {Object} responseHeaders - Response headers
 */
const {
  logDetailedResponse,
  logApplicationErrors,
  logApiRequestSummary
} = require('./responseHelpers');

async function handleResponseFinish({ req, res, startTime, relevantHeaders, requestBody, responseBody, responseHeaders }) {
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  logDetailedResponse({ req, res, responseTime, relevantHeaders, requestBody, responseHeaders, responseBody });
  await logApplicationErrors({ req, res, relevantHeaders, requestBody, responseHeaders, responseBody });
  logApiRequestSummary({ req, res, responseTime, requestBody, responseBody });
}

module.exports = {
    shouldExcludePath,
    captureRequestBody,
    captureRelevantHeaders,
    logIncomingRequest,
    setupResponseInterceptors,
    handleResponseFinish
};

