const logger = require('../utils/logger');
const OCPITokenService = require('../services/ocpiTokenService');

// Token OCPI por defecto para desarrollo (se usará solo si no hay tokens en BD)
const DEFAULT_OCPI_TOKEN = process.env.OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key';

/**
 * Middleware de autenticación OCPI
 * Valida que la petición incluya el token correcto en las cabeceras
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token de las cabeceras
    const authHeader = req.headers.authorization;
    const token = req.headers['ocpi-token'] || req.headers['OCPI-Token'];
    
    // Verificar si se proporcionó algún token
    if (!authHeader && !token) {
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

    // Verificar el token en Authorization header (formato: "Token {token}")
    let providedToken = null;
    if (authHeader && authHeader.startsWith('Token ')) {
      providedToken = authHeader.substring(6); // Remover "Token " del inicio
    } else if (token) {
      providedToken = token;
    }

    // Validar el token usando el servicio OCPI
    const tokenInfo = await OCPITokenService.validateToken(providedToken);
    
    if (!tokenInfo) {
      // Si no se encuentra en BD, verificar el token por defecto (para compatibilidad)
      if (providedToken !== DEFAULT_OCPI_TOKEN) {
        logger.warn('Authentication failed: Invalid token', { 
          ip: req.ip, 
          path: req.path,
          providedToken: providedToken ? providedToken.substring(0, 10) + '...' : 'none'
        });
        
        return res.status(401).json({
          status_code: 2001,
          status_message: 'Authentication failed: Invalid token',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Token válido, agregar información del token a la request
    req.ocpiToken = tokenInfo || { 
      party_id: process.env.OCPI_PARTY_ID || 'IPD', 
      country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
      type: 'default' 
    };
    
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
