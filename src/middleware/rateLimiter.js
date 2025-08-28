const { RateLimiterRedis } = require('rate-limiter-flexible');
const { redisClient } = require('../database/redis');
const logger = require('../utils/logger');

// En desarrollo, permitir deshabilitar el rate limiting
const isDevelopment = process.env.NODE_ENV === 'development';
const disableRateLimit = process.env.DISABLE_RATE_LIMIT === 'true';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Aumentado de 100 a 1000
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  blockDuration: 60 * 5, // Reducido de 15 a 5 minutos
});

const rateLimiterMiddleware = async (req, res, next) => {
  // En desarrollo, permitir deshabilitar el rate limiting
  if (isDevelopment && disableRateLimit) {
    logger.info('Rate limiting disabled in development mode');
    return next();
  }

  try {
    const key = req.ip || req.connection.remoteAddress;
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    logger.warn('Rate limit exceeded', { ip: req.ip, remainingPoints: rejRes.remainingPoints });
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

module.exports = rateLimiterMiddleware;




