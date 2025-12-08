const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');

/**
 * Obtiene las organizaciones conectadas
 * @returns {Promise<Array>} Lista de organizaciones conectadas
 */
async function getConnectedOrganizations() {
  try {
    const [results] = await sequelize.query(`
      SELECT DISTINCT 
        external_party_id as party_id,
        country_code,
        token,
        url
      FROM credentials 
      WHERE valid = true 
      AND external_party_id IS NOT NULL
      AND token IS NOT NULL
      AND url IS NOT NULL
      ORDER BY external_party_id, country_code
    `);
    return results;
  } catch (error) {
    logger.error('❌ Error getting connected organizations:', error);
    return [];
  }
}

module.exports = {
    getConnectedOrganizations
};

