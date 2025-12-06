const { sequelize } = require('../../database/connection');
const { authMiddleware } = require('../../middleware/auth');
const logger = require('../../utils/logger');

/**
 * Rutas relacionadas con sessions de EMSP
 */

/**
 * GET /ocpi/emsp/2.2/sessions - Obtener sesiones de eMSPs
 */
function setupSessionsRoute(router) {
  router.get('/sessions', authMiddleware, async (_req, res) => {
    try {
      logger.info('📍 GET /ocpi/emsp/2.2/sessions - Consultando sesiones de eMSPs');

      const [results] = await sequelize.query(`
            SELECT * FROM emsp_sessions 
            ORDER BY last_updated DESC
        `);

      logger.info(`✅ ${results.length} sesiones de eMSPs encontradas`);

      res.status(200).json({
        status_code: 1000,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error consultando sesiones de eMSPs:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting EMSP sessions',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupSessionsRoute
};

