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
                url,
                token_base64_encoded
            FROM credentials
            WHERE valid = true
            AND party_id != :ourPartyId
            ORDER BY party_id, country_code
        `;
        
        const ourPartyId = process.env.OCPI_PARTY_ID || 'IPD';
        
        const [results] = await sequelize.query(query, {
            replacements: {
                ourPartyId
            },
            type: sequelize.QueryTypes.SELECT
        });
        
        // El token del operador se usa tal cual, y se codifica en Base64 si es necesario
        // cuando se construye el header Authorization usando buildAuthorizationHeader()
        // Según OCPI 2.2: cuando hacemos peticiones al operador, usamos el token que ellos nos dieron
        return Array.isArray(results) ? results : [];
    } catch (error) {
        logger.error('Error obteniendo organizaciones configuradas:', error);
        return [];
    }
}

module.exports = {
    getConfiguredOrganizations
};

