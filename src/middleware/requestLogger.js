const logger = require('../utils/logger');

/**
 * Middleware para logging detallado de peticiones y respuestas
 * Captura payload entrante y response saliente
 */
const requestLogger = (req, res, next) => {
  // Excluir endpoints de logs para evitar bucles infinitos
  if (req.path === '/logs/recent' || req.path === '/logs/stream') {
    return next();
  }
  
  // Excluir peticiones del navegador (aplicación web)
  const userAgent = req.get('User-Agent') || '';
  if (userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari')) {
    return next();
  }
  
  // Excluir recursos estáticos
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  // Excluir health check
  if (req.path === '/health') {
    return next();
  }
  
  // Excluir peticiones de la interfaz web (API calls desde el frontend)
  if (req.path.startsWith('/api/') && userAgent.includes('Mozilla')) {
    return next();
  }
  
  // Capturar el tiempo de inicio
  const startTime = Date.now();
  
  // Capturar el body de la petición (si existe)
  let requestBody = null;
  if (req.body && Object.keys(req.body).length > 0) {
    requestBody = JSON.parse(JSON.stringify(req.body));
  }
  
  // Capturar headers relevantes
  const relevantHeaders = {
    'authorization': req.headers.authorization ? `${req.headers.authorization.substring(0, 20)}...` : undefined,
    'ocpi-token': req.headers['ocpi-token'] ? `${req.headers['ocpi-token'].substring(0, 20)}...` : undefined,
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
    'accept': req.headers['accept']
  };
  
  // Filtrar headers undefined
  Object.keys(relevantHeaders).forEach(key => {
    if (relevantHeaders[key] === undefined) {
      delete relevantHeaders[key];
    }
  });
  
  // Log de la petición entrante
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
  
  // Interceptar la respuesta para capturar el body
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
  
  // Capturar cuando la respuesta se envía
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Log detallado de la petición completa
    logger.info(`🌐 ${req.method} ${req.path}`, {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      path: req.path,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: `${responseTime}ms`,
      requestHeaders: relevantHeaders,
      requestBody: requestBody,
      responseHeaders: responseHeaders,
      responseBody: responseBody,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      query: Object.keys(req.query).length > 0 ? req.query : undefined
    });
    
    // Log resumido para debugging rápido (solo si no es una petición del navegador)
    const userAgent = req.get('User-Agent') || '';
    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome') && !userAgent.includes('Safari')) {
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
  });
  
  next();
};

module.exports = requestLogger;
