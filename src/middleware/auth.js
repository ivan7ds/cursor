const OCPITokenService = require('../services/ocpiTokenService');
const logger = require('../utils/logger');

/**
 * Middleware de autenticación OCPI
 * Valida que la petición incluya el token correcto en las cabeceras
 */
const {
  extractToken,
  validateToken,
  checkTempTokenPermission,
  buildTokenObject,
  DEFAULT_OCPI_TOKEN
} = require('./auth/authHelpers');

const authMiddleware = async (req, res, next) => {
  try {
    const providedToken = extractToken(req);
    
    if (!providedToken) {
      logger.warn('Authentication failed: No token provided', { 
        ip: req.ip, 
        path: req.path,
        headers: req.headers 
      });
      
      return res.status(401).json({
        status_code: 2001,
        status_message: 'Authentication failed: No token provided',
        timestamp: new Date().toISOString()
      });
    }

    const tokenInfo = await validateToken(providedToken);
    
    if (!tokenInfo && providedToken !== DEFAULT_OCPI_TOKEN) {
      logger.warn('Authentication failed: Invalid token', { 
        ip: req.ip, 
        path: req.path,
        providedToken: `${providedToken.substring(0, 10)}...`
      });
      
      return res.status(401).json({
        status_code: 2001,
        status_message: 'Authentication failed: Invalid token',
        timestamp: new Date().toISOString()
      });
    }

    const permissionError = checkTempTokenPermission(tokenInfo, req.originalUrl);
    if (permissionError) {
      logger.warn('Authentication failed: Temporary token not allowed for this endpoint', { 
        ip: req.ip, 
        path: req.path,
        providedToken: `${providedToken.substring(0, 10)}...`
      });
      
      return res.status(permissionError.status).json(permissionError.json);
    }

    req.ocpiToken = buildTokenObject(tokenInfo);
    
    logger.info('Authentication successful', { 
      ip: req.ip, 
      path: req.path,
      partyId: req.ocpiToken.party_id,
      countryCode: req.ocpiToken.country_code
    });
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error during authentication',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware opcional para endpoints que no requieren autenticación
 * (como health check, documentación, etc.)
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.headers['ocpi-token'] || req.headers['OCPI-Token'];
    
    let providedToken = null;
    if (authHeader && authHeader.startsWith('Token ')) {
      providedToken = authHeader.substring(6);
    } else if (token) {
      providedToken = token;
    }

    // Si se proporciona un token, validarlo
    if (providedToken) {
      const tokenInfo = await OCPITokenService.validateToken(providedToken);
      
      if (!tokenInfo && providedToken !== DEFAULT_OCPI_TOKEN) {
        logger.warn('Optional authentication failed: Invalid token', { 
          ip: req.ip, 
          path: req.path 
        });
        
        return res.status(401).json({
          status_code: 2001,
          status_message: 'Authentication failed: Invalid token',
          timestamp: new Date().toISOString()
        });
      }
      
      // Si el token es válido, agregar información a la request
      if (tokenInfo) {
        req.ocpiToken = tokenInfo;
      }
    }

    // Continuar (con o sin token válido)
    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next(); // Continuar en caso de error
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  DEFAULT_OCPI_TOKEN
};
