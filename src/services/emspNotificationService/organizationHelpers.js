const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');

/**
 * Obtiene todas las organizaciones configuradas (excluyendo nuestro CPO)
 * @returns {Promise<Array>} Array de organizaciones
 */
async function getConfiguredOrganizations() {
    try {
        const query = `
            SELECT DISTINCT
                party_id,
                country_code,
                token,
                url
            FROM credentials
            WHERE is_active = true
            AND party_id != :ourPartyId
            AND country_code != :ourCountryCode
            ORDER BY party_id, country_code
        `;
        
        const ourPartyId = process.env.OCPI_PARTY_ID || 'IPD';
        const ourCountryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
        
        const [results] = await sequelize.query(query, {
            replacements: {
                ourPartyId,
                ourCountryCode
            },
            type: sequelize.QueryTypes.SELECT
        });
        
        return Array.isArray(results) ? results : [];
    } catch (error) {
        logger.error('Error obteniendo organizaciones configuradas:', error);
        return [];
    }
}

module.exports = {
    getConfiguredOrganizations
};

