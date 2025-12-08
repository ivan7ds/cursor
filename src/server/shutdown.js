/* eslint-disable no-process-exit -- Necesario para shutdown graceful */
const { sequelize } = require('../database/connection');
const { redisClient } = require('../database/redis');
const logger = require('../utils/logger');

const { stopAllServices } = require('./shutdown/stopServices');

/**
 * Maneja el cierre de conexiones de base de datos
 */
async function closeConnections() {
  await sequelize.close();
  await redisClient.quit();
}

/**
 * Maneja el shutdown graceful
 */
async function handleShutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);

  await stopAllServices();
  await closeConnections();

  process.exit(0);
}

/**
 * Configura el manejo de shutdown graceful
 */
function setupGracefulShutdown() {
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

module.exports = {
    setupGracefulShutdown
};
/* eslint-enable no-process-exit -- Necesario para shutdown graceful */
