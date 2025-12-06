const { sequelize } = require('../../database/connection');
const { authMiddleware } = require('../../middleware/auth');
const logger = require('../../utils/logger');

/**
 * Módulo de utilidades para acciones EMSP
 */

/**
 * POST /clear-emsp-data - Eliminar datos almacenados de eMSP
 */
function setupClearEmspData(router) {
  router.post('/clear-emsp-data', authMiddleware, async (_req, res) => {
    const tables = [
      'emsp_cdrs',
      'emsp_sessions',
      'emsp_evses',
      'emsp_locations',
      'emsp_tariffs',
      'emsp_tokens'
    ];

    try {
      logger.info('🧨 Iniciando limpieza completa de tablas eMSP:', tables.join(', '));

      await sequelize.transaction(async (transaction) => {
        await sequelize.query(
          'TRUNCATE TABLE emsp_cdrs, emsp_sessions, emsp_evses, emsp_locations, emsp_tariffs, emsp_tokens RESTART IDENTITY CASCADE',
          { transaction }
        );
      });

      logger.info('✅ Limpieza de tablas eMSP completada');

      res.status(200).json({
        status_code: 1000,
        data: {
          message: 'Datos eMSP eliminados correctamente',
          // eslint-disable-next-line camelcase -- Campo en snake_case según convención de API
          tables_cleared: tables
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error al limpiar tablas eMSP:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error al limpiar datos eMSP',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupClearEmspData
};

