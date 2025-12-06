const { sequelize } = require('../../database/connection');
const { Token } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Obtiene los operadores conectados
 */
async function getConnectedOperators() {
  try {
    logger.info('🔍 Querying connected operators from database...');

    const results = await sequelize.query(`
      SELECT id, token, url, party_id, country_code, business_details
      FROM credentials 
      WHERE url IS NOT NULL 
      AND token IS NOT NULL
      AND url != ''
      AND token != ''
      AND party_id != 'IPD'
      AND valid = true
      ORDER BY party_id, country_code
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    logger.info(`🔍 Query returned ${results.length} operators:`, results.map(op => `${op.party_id} (${op.country_code})`));
    return results;
  } catch (error) {
    logger.error('❌ Error getting connected operators:', error);
    return [];
  }
}

/**
 * Obtiene EVSEs disponibles de la base de datos
 */
async function getAvailableEvsesFromDatabase() {
  try {
    const results = await sequelize.query(`
      SELECT 
        evse_id,
        evse_id as uid,
        status,
        capabilities,
        connectors,
        floor_level,
        physical_reference,
        directions,
        parking_restrictions,
        last_updated,
        emsp_party_id as party_id,
        emsp_country_code as country_code,
        location_id
      FROM emsp_evses 
      WHERE status = 'AVAILABLE'
      AND capabilities::text LIKE '%REMOTE_START_STOP_CAPABLE%'
      ORDER BY RANDOM()
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    logger.info(`🔌 Found ${results.length} available EVSEs from database`);
    return results;
  } catch (error) {
    logger.error('❌ Error getting EVSEs from database:', error.message);
    return [];
  }
}

/**
 * Obtiene un token válido de la base de datos
 */
async function getValidToken() {
  try {
    const token = await Token.findOne({
      where: { valid: true },
      order: [['last_updated', 'DESC']]
    });
    return token;
  } catch (error) {
    logger.error('❌ Error getting valid token:', error);
    return null;
  }
}

module.exports = {
    getConnectedOperators,
    getAvailableEvsesFromDatabase,
    getValidToken
};

