const { sequelize } = require('../../database/connection');
const { authMiddleware } = require('../../middleware/auth');
const logger = require('../../utils/logger');

/**
 * Rutas relacionadas con locations y EVSEs de EMSP
 */

/**
 * GET /ocpi/emsp/2.2/locations - Obtener locations de eMSPs
 */
function setupLocationsRoute(router) {
  router.get('/locations', authMiddleware, async (_req, res) => {
    try {
      logger.info('📍 GET /ocpi/emsp/2.2/locations - Consultando locations de eMSPs');

      const [results] = await sequelize.query(`
            SELECT * FROM emsp_locations 
            ORDER BY last_updated DESC
        `);

      logger.info(`✅ ${results.length} locations de eMSPs encontrados`);

      res.status(200).json({
        status_code: 1000,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error consultando locations de eMSPs:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting EMSP locations',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * GET /ocpi/emsp/2.2/evses - Obtener EVSEs de eMSPs
 */
function setupEvsesRoute(router) {
  router.get('/evses', authMiddleware, async (_req, res) => {
    try {
      logger.info('📍 GET /ocpi/emsp/2.2/evses - Consultando EVSEs de eMSPs');

      const [results] = await sequelize.query(`
            SELECT * FROM emsp_evses 
            ORDER BY last_updated DESC
        `);

      logger.info(`✅ ${results.length} EVSEs de eMSPs encontrados`);

      res.status(200).json({
        status_code: 1000,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error consultando EVSEs de eMSPs:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting EMSP EVSEs',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupLocationsRoute,
  setupEvsesRoute
};

