const { RateLimiterRedis } = require('rate-limiter-flexible');
const { redisClient } = require('../database/redis');
const logger = require('../utils/logger');

// En desarrollo, permitir deshabilitar el rate limiting
const isDevelopment = process.env.NODE_ENV === 'development';
const disableRateLimit = process.env.DISABLE_RATE_LIMIT === 'true';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 2000, // Aumentado a 2000 para dashboard
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  blockDuration: 60 * 2, // Reducido a 2 minutos
});

const rateLimiterMiddleware = async (req, res, next) => {
  // En desarrollo, permitir deshabilitar el rate limiting
  if (isDevelopment && disableRateLimit) {
    logger.info('Rate limiting disabled in development mode');
    return next();
  }

  // Excluir ciertas rutas del rate limiting (dashboard y health)
  const excludedPaths = ['/health', '/logs/stream', '/logs/recent'];
  if (excludedPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Rate limiting más permisivo para el dashboard
  const isDashboardRequest = req.path.startsWith('/ocpi/cpo/2.2/') || req.path === '/';
  const rateLimiterToUse = isDashboardRequest ? 
    new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'dashboard',
      points: 5000, // Mucho más permisivo para dashboard
      duration: 900000, // 15 minutos
      blockDuration: 60, // Solo 1 minuto de bloqueo
    }) : rateLimiter;

  try {
    const key = req.ip || req.connection.remoteAddress;
    await rateLimiterToUse.consume(key);
    next();
  } catch (rejRes) {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      path: req.path,
      remainingPoints: rejRes.remainingPoints,
      isDashboard: isDashboardRequest 
    });
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

module.exports = rateLimiterMiddleware;




