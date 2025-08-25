const { RateLimiterRedis } = require('rate-limiter-flexible');
const { redisClient } = require('../database/redis');
const logger = require('../utils/logger');

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  blockDuration: 60 * 15, // 15 minutes
});

const rateLimiterMiddleware = async (req, res, next) => {
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
