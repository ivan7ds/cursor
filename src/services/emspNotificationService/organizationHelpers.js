const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');
const { getOurCredentials } = require('../../api/handshake/utils');

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
        
        // Si una organización requiere Base64, usar nuestro token en lugar del token del operador
        // El token del operador es para cuando ellos hacen peticiones a nosotros
        // Nuestro token es para cuando nosotros hacemos peticiones a ellos
        const ourCredentials = getOurCredentials();
        return (Array.isArray(results) ? results : []).map(org => {
            if (org.token_base64_encoded) {
                return {
                    ...org,
                    // Usar nuestro token para peticiones salientes cuando Base64 está activado
                    token: ourCredentials.token
                };
            }
            return org;
        });
    } catch (error) {
        logger.error('Error obteniendo organizaciones configuradas:', error);
        return [];
    }
}

module.exports = {
    getConfiguredOrganizations
};

