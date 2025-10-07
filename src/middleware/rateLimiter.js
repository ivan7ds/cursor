const logger = require('../utils/logger');

const skipExternalDependencies = process.env.SKIP_EXTERNAL_DEPENDENCIES === 'true';

if (skipExternalDependencies) {
  logger.warn('Rate limiting disabled because SKIP_EXTERNAL_DEPENDENCIES is enabled');

  module.exports = (req, res, next) => next();
} else {
  const { RateLimiterRedis } = require('rate-limiter-flexible');
  const { redisClient } = require('../database/redis');

  // En desarrollo, permitir deshabilitar el rate limiting
  const isDevelopment = process.env.NODE_ENV === 'development';
  const disableRateLimit = process.env.DISABLE_RATE_LIMIT === 'true';

  const baseRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 10000,
    duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    blockDuration: 60 * 2,
  });

  module.exports = async (req, res, next) => {
    if (isDevelopment && disableRateLimit) {
      logger.info('Rate limiting disabled in development mode');
      return next();
    }

    const excludedPaths = ['/health', '/logs/stream', '/logs/recent', '/api-docs', '/api/charging-logs'];
    if (excludedPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const isDashboardRequest = req.path.startsWith('/ocpi/cpo/2.2/') ||
      req.path.startsWith('/api/') ||
      req.path === '/';

    const rateLimiterToUse = isDashboardRequest ?
      new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'dashboard',
        points: 20000,
        duration: 900000,
        blockDuration: 60,
      }) : baseRateLimiter;

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
}
