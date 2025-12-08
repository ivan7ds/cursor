const { sequelize } = require('../../../database/connection');

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

  // El token del operador se usa tal cual, y se codifica en Base64 si es necesario
  // cuando se construye el header Authorization usando buildAuthorizationHeader()
  // Según OCPI 2.2: cuando hacemos peticiones al operador, usamos el token que ellos nos dieron
  
  // Normalizar token_base64_encoded a booleano (PostgreSQL puede devolver 't'/'f' o true/false)
  const logger = require('../../../utils/logger');
  const normalizedOrgs = organizations.map(org => {
    const tokenBase64Encoded = org.token_base64_encoded === true || 
                                org.token_base64_encoded === 't' || 
                                org.token_base64_encoded === 1 ||
                                org.token_base64_encoded === 'true';
    
    logger.info(`📋 Organización ${org.party_id}: token=${org.token ? `${org.token.substring(0, 20)  }...` : 'MISSING'}, token_base64_encoded=${tokenBase64Encoded} (raw: ${org.token_base64_encoded})`);
    
    return {
      ...org,
      token_base64_encoded: tokenBase64Encoded
    };
  });
  
  return normalizedOrgs;
}

module.exports = {
    getExternalOrganizations
};

