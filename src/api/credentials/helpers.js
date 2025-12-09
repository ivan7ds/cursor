const { v4: uuidv4 } = require('uuid');
const { URL } = require('url');

const { Credentials } = require('../../models');
const logger = require('../../utils/logger');
const { sanitizeUrl } = require('../../utils/urlSanitizer');

const {
  extractAuthToken,
  buildInvalidTokenResponse,
  generateOurToken,
  buildCleanBaseUrl,
  logHandshakeSuccess
} = require('./postHelpers');

/**
 * Valida los campos requeridos del request
 * @param {Object} body - Request body
 * @returns {Object|null} Objeto con error o null si es válido
 */
function validateCredentialsRequest(body) {
  const { token, url, roles } = body;
  
  if (!token || !url || !roles) {
    return {
      status: 400,
      json: {
        status_code: 2001,
        status_message: 'Missing required fields: token, url, or roles',
        timestamp: new Date().toISOString()
      }
    };
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    return {
      status: 400,
      json: {
        status_code: 2001,
        status_message: 'Roles must be a non-empty array',
        timestamp: new Date().toISOString()
      }
    };
  }

  for (const role of roles) {
    if (!role.role || !role.party_id || !role.country_code) {
      return {
        status: 400,
        json: {
          status_code: 2001,
          status_message: 'Each role must contain role, party_id, and country_code',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  return null;
}

/**
 * Valida el token de autenticación del header
 * @param {Object} req - Request object
 * @returns {Object|null} Objeto con error o null si es válido
 */
function validateAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Token ')) {
    return {
      status: 401,
      json: {
        status_code: 2001,
        status_message: 'Authentication failed: Missing token in Authorization header',
        timestamp: new Date().toISOString()
      }
    };
  }
  return null;
}

/**
 * Busca credenciales temporales por token
 * @param {string} authToken - Token de autenticación
 * @returns {Promise<Object|null>} Credenciales encontradas o null
 */
async function findTempCredentials(authToken) {
  return Credentials.findOne({
    where: {
      token: authToken,
      valid: true,
      temp: true
    }
  });
}

/**
 * Extrae la URL base (protocolo + host + puerto) de una URL completa
 * Elimina rutas como /ocpi/versions para evitar URLs malformadas
 * @param {string} url - URL completa que puede incluir rutas
 * @returns {string} URL base limpia (solo protocolo + host + puerto)
 */
function extractBaseUrl(url) {
  try {
    const urlObj = new URL(url);
    // Construir URL base sin barra final para evitar dobles barras al concatenar
    let baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    if (urlObj.port) {
      baseUrl = `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port}`;
    }
    // Asegurar que no termine en barra usando la función helper
    return sanitizeUrl(baseUrl);
  } catch (error) {
    // Si la URL no es válida, intentar limpiarla manualmente
    logger.warn('Error parsing URL, attempting manual cleanup:', { url, error: error.message });
    // Eliminar rutas comunes como /ocpi/versions
    const cleaned = url.replace(/\/ocpi\/versions.*$/, '').replace(/\/ocpi\/.*$/, '');
    return sanitizeUrl(cleaned);
  }
}

/**
 * Actualiza credenciales temporales a permanentes
 * @param {Object} tempCredentials - Credenciales temporales
 * @param {string} token - Nuevo token
 * @param {string} url - URL (puede incluir rutas como /ocpi/versions)
 * @param {Object} businessDetails - Detalles del negocio
 * @param {Object} externalRole - Rol externo
 */
async function updateTempToPermanent(tempCredentials, token, url, businessDetails, externalRole) {
  // Extraer solo la URL base (protocolo + host + puerto) para evitar URLs malformadas
  const baseUrl = extractBaseUrl(url);
  
  // Preservar el flag token_base64_encoded de las credenciales temporales
  // Si las credenciales temporales tienen el flag, debe preservarse
  const tokenBase64Encoded = tempCredentials.token_base64_encoded !== undefined 
    ? tempCredentials.token_base64_encoded 
    : false;
  
  logger.info('Cleaning URL for credentials update', {
    originalUrl: url,
    cleanedBaseUrl: baseUrl,
    partyId: externalRole.party_id,
    tokenBase64Encoded: tokenBase64Encoded
  });
  
  await tempCredentials.update({
    token,
    url: baseUrl,
    business_details: businessDetails,
    party_id: externalRole.party_id,
    country_code: externalRole.country_code,
    valid: true,
    temp: false,
    token_base64_encoded: tokenBase64Encoded,
    last_updated: new Date()
  });
}

/**
 * Construye la respuesta de credenciales según OCPI 2.2.1
 * @param {string} ourToken - Nuestro token
 * @param {string} baseUrl - URL base
 * @returns {Object} Respuesta JSON
 */
function buildCredentialsResponse(ourToken, baseUrl) {
  const systemPartyId = process.env.OCPI_PARTY_ID || 'IPD';
  const systemCountryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  const systemBusinessDetails = {
    name: systemPartyId,
    website: `https://www.${systemPartyId}.com`
  };

  return {
    status_code: 1000,
    data: {
      token: ourToken,
      url: `${baseUrl}/ocpi/cpo/versions`,
      last_updated: new Date().toISOString(),
      roles: [
        {
          role: "CPO",
          party_id: systemPartyId,
          country_code: systemCountryCode,
          business_details: systemBusinessDetails
        }, 
        {
          role: "EMSP",
          party_id: systemPartyId,
          country_code: systemCountryCode,
          business_details: systemBusinessDetails
        }]
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Maneja el proceso completo de handshake de credenciales
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<void>}
 */
async function handleCredentialsPost(req, res) {
  const validationError = validateCredentialsRequest(req.body);
  if (validationError) {
    return res.status(validationError.status).json(validationError.json);
  }

  const authError = validateAuthToken(req);
  if (authError) {
    return res.status(authError.status).json(authError.json);
  }

  const authToken = extractAuthToken(req);
  const tempCredentials = await findTempCredentials(authToken);

  if (!tempCredentials) {
    const invalidTokenResponse = buildInvalidTokenResponse(req, authToken);
    return res.status(invalidTokenResponse.status).json(invalidTokenResponse.json);
  }

  const { token, url, roles } = req.body;
  const externalRole = roles[0];
  const businessDetails = externalRole.business_details || {};

  await updateTempToPermanent(tempCredentials, token, url, businessDetails, externalRole);

  logger.info('Temporary token converted to permanent external token', {
    partyId: externalRole.party_id,
    countryCode: externalRole.country_code,
    externalToken: `${token.substring(0, 10)}...`
  });

  // Cuando el operador externo inicia el handshake, NO creamos credenciales "nuestras"
  // Las credenciales "nuestras" solo se crean cuando nosotros iniciamos el handshake
  // (en src/api/handshake/process.js -> saveExternalCredentials)
  // Esto evita duplicación de conexiones en el frontend
  
  const ourToken = generateOurToken();
  const cleanBaseUrl = buildCleanBaseUrl(req);
  logHandshakeSuccess(externalRole, ourToken);

  res.status(200).json(buildCredentialsResponse(ourToken, cleanBaseUrl));
}

/**
 * Maneja el proceso completo de actualización de credenciales (PUT)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<void>}
 */
const putHelpers = require('./putHelpers');

async function handleCredentialsPut(req, res) {
  const { token, url, roles } = req.body;
  
  const validationError = validateCredentialsRequest(req.body);
  if (validationError) {
    return res.status(validationError.status).json(validationError.json);
  }

  const businessDetails = roles[0].business_details || {};
  const systemPartyId = process.env.OCPI_PARTY_ID;
  const systemCountryCode = process.env.OCPI_COUNTRY_CODE;

  const existingCredentials = await Credentials.findOne({
    where: {
      party_id: systemPartyId,
      country_code: systemCountryCode
    }
  });

  if (existingCredentials) {
    await putHelpers.updateExistingCredentials(existingCredentials, token, url, businessDetails);
  } else {
    await putHelpers.createNewCredentials({ token, url, businessDetails, systemPartyId, systemCountryCode });
  }

  const newToken = putHelpers.generateNewToken();
  const cleanBaseUrl = putHelpers.buildCleanBaseUrl(req);
  const response = putHelpers.buildPutCredentialsResponse(newToken, cleanBaseUrl, systemPartyId, systemCountryCode);

  res.status(200).json(response);
}

module.exports = {
    handleCredentialsPost,
    handleCredentialsPut
};

