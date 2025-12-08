const {
  shouldExcludePath,
  captureRequestBody,
  captureRelevantHeaders,
  logIncomingRequest,
  setupResponseInterceptors,
  handleResponseFinish
} = require('./requestLogger/helpers');

/**
 * Middleware para logging detallado de peticiones y respuestas
 * Captura payload entrante y response saliente
 */
const requestLogger = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  
  if (shouldExcludePath(req.path, userAgent)) {
    return next();
  }
  
  const startTime = Date.now();
  const requestBody = captureRequestBody(req.body);
  const relevantHeaders = captureRelevantHeaders(req.headers);
  
  logIncomingRequest(req, relevantHeaders, requestBody);
  
  const { responseBody, responseHeaders } = setupResponseInterceptors(res);
  
  res.on('finish', async () => {
    await handleResponseFinish({ req, res, startTime, relevantHeaders, requestBody, responseBody, responseHeaders });
  });
  
  next();
};

module.exports = requestLogger;
