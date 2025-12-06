const { sequelize } = require('../database/connection');
const { redisClient } = require('../database/redis');
const logger = require('../utils/logger');

const { startChargingNotificationServiceIfNeeded } = require('./services');

/**
 * Inicia el servidor Express
 */
async function startServer(app, port) {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    logger.info('Database models synchronized (skipping sync)');

    await redisClient.ping();
    logger.info('Redis connection established successfully');

    app.listen(port, () => {
      logger.info(`CPO OCPI 2.2 Server running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${port}/api-docs`);
      logger.info(`Health Check: http://localhost:${port}/health`);
    });

    await startChargingNotificationServiceIfNeeded();
    logger.info('Charging Notification Service started conditionally');

    logger.info('Other services available for manual activation via frontend');
  } catch (error) {
    logger.error('Failed to start server:', error.message || error);
    logger.error('Error stack:', error.stack);
    logger.error('Full error object:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

module.exports = {
    startServer
};

