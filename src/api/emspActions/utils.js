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
      'external_operator_cdrs',
      'external_operator_sessions',
      'external_operator_evses',
      'external_operator_locations',
      'external_operator_tariffs',
      'external_operator_tokens'
    ];

    try {
      logger.info('🧨 Iniciando limpieza completa de tablas de operadores externos:', tables.join(', '));

      await sequelize.transaction(async (transaction) => {
        await sequelize.query(
          'TRUNCATE TABLE external_operator_cdrs, external_operator_sessions, external_operator_evses, external_operator_locations, external_operator_tariffs, external_operator_tokens RESTART IDENTITY CASCADE',
          { transaction }
        );
      });

      logger.info('✅ Limpieza de tablas de operadores externos completada');

      res.status(200).json({
        status_code: 1000,
        data: {
          message: 'Datos de operadores externos eliminados correctamente',
          // eslint-disable-next-line camelcase -- Campo en snake_case según convención de API
          tables_cleared: tables
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error al limpiar tablas de operadores externos:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error al limpiar datos de operadores externos',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupClearEmspData
};

