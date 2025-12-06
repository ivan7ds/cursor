const { sequelize } = require('../../database/connection');
const { authMiddleware } = require('../../middleware/auth');
const logger = require('../../utils/logger');

/**
 * Rutas relacionadas con tokens de EMSP
 */

/**
 * GET /ocpi/emsp/2.2/tokens - Obtener tokens de eMSPs
 */
// eslint-disable-next-line max-lines-per-function
function setupTokensRoute(router) {
  router.get('/tokens', authMiddleware, async (_req, res) => {
    try {
      logger.info('📍 GET /ocpi/emsp/2.2/tokens - Consultando tokens de eMSPs');

      // Consultar tokens de la tabla tokens donde party_id sea IPD
      const [results] = await sequelize.query(`
            SELECT
                id,
                country_code,
                party_id,
                uid,
                type,
                contract_id,
                visual_number,
                issuer,
                group_id,
                valid,
                whitelist,
                language,
                default_profile_type,
                energy_contract,
                last_updated,
                created_at
            FROM tokens
            WHERE party_id = '${process.env.OCPI_PARTY_ID}'
            ORDER BY last_updated DESC
        `);

      logger.info(`✅ ${results.length} tokens de IPD (eMSP) encontrados`);

      res.status(200).json({
        status_code: 1000,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error consultando tokens de eMSPs:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting EMSP tokens',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * GET /ocpi/emsp/2.2/contracts - Obtener contratos de eMSPs
 */
function setupContractsRoute(router) {
  router.get('/contracts', authMiddleware, async (_req, res) => {
    try {
      logger.info('📍 GET /ocpi/emsp/2.2/contracts - Consultando contratos de eMSPs');

      const [results] = await sequelize.query(`
            SELECT * FROM emsp_contracts 
            ORDER BY last_updated DESC
        `);

      logger.info(`✅ ${results.length} contratos de eMSPs encontrados`);

      res.status(200).json({
        status_code: 1000,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error consultando contratos de eMSPs:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting EMSP contracts',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * GET /ocpi/emsp/2.2/tokens/stored - Obtener tokens almacenados en emsp_tokens
 */
function setupStoredTokensRoute(router) {
  router.get('/tokens/stored', authMiddleware, async (_req, res) => {
    try {
      logger.info('📍 GET /ocpi/emsp/2.2/tokens/stored - Consultando tokens almacenados en emsp_tokens');

      // Consultar tokens de la tabla emsp_tokens
      const [results] = await sequelize.query(`
            SELECT 
                id,
                emsp_party_id as party_id,
                emsp_country_code as country_code,
                token_uid as uid,
                type,
                contract_id,
                visual_number,
                issuer,
                group_id,
                valid,
                whitelist,
                language,
                default_profile_type,
                energy_contract,
                last_updated,
                created_at
            FROM emsp_tokens 
            ORDER BY last_updated DESC
        `);

      logger.info(`✅ ${results.length} tokens almacenados encontrados en emsp_tokens`);

      res.status(200).json({
        status_code: 1000,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error consultando tokens almacenados:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting stored EMSP tokens',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupTokensRoute,
  setupContractsRoute,
  setupStoredTokensRoute
};

