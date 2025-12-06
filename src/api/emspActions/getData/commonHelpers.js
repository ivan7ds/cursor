const { sequelize } = require('../../../database/connection');

/**
 * Obtiene todas las organizaciones externas conectadas
 * @returns {Promise<Array>} Array de organizaciones
 */
async function getExternalOrganizations() {
  return await sequelize.query(`
    SELECT id, token, url, party_id, country_code, business_details
    FROM credentials
    WHERE url IS NOT NULL
    AND token IS NOT NULL
    AND url != ''
    AND token != ''
    AND party_id != 'IPD'
  `, {
    type: sequelize.QueryTypes.SELECT
  });
}

module.exports = {
    getExternalOrganizations
};

