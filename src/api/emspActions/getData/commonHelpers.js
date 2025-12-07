const { sequelize } = require('../../../database/connection');
const { getOurCredentials } = require('../../handshake/utils');

/**
 * Obtiene todas las organizaciones externas conectadas
 * @returns {Promise<Array>} Array de organizaciones
 */
async function getExternalOrganizations() {
  const organizations = await sequelize.query(`
    SELECT id, token, url, party_id, country_code, business_details, token_base64_encoded
    FROM credentials
    WHERE url IS NOT NULL
    AND token IS NOT NULL
    AND url != ''
    AND token != ''
    AND party_id != 'IPD'
  `, {
    type: sequelize.QueryTypes.SELECT
  });

  // Si una organización requiere Base64, usar nuestro token en lugar del token del operador
  // El token del operador es para cuando ellos hacen peticiones a nosotros
  // Nuestro token es para cuando nosotros hacemos peticiones a ellos
  const ourCredentials = getOurCredentials();
  return organizations.map(org => {
    if (org.token_base64_encoded) {
      return {
        ...org,
        // Usar nuestro token para peticiones salientes cuando Base64 está activado
        token: ourCredentials.token
      };
    }
    return org;
  });
}

module.exports = {
    getExternalOrganizations
};

