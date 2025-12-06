const { Credentials } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware de autenticación para tokens temporales
 * Solo permite acceso a endpoints básicos: /versions, /credentials, /details
 */
const {
  buildMissingTokenResponse,
  buildInvalidTokenResponse,
  buildForbiddenEndpointResponse,
  setRequestCredentials
} = require('./tempTokenAuth/authFlowHelpers');
const {
  extractTempToken,
  findTempCredentials,
  isTempTokenPathAllowed
} = require('./tempTokenAuth/authHelpers');

const tempTokenAuth = async (req, res, next) => {
    try {
        const token = extractTempToken(req);
        
        if (!token) {
            const response = buildMissingTokenResponse(req);
            return res.status(response.status).json(response.json);
        }

        const credentials = await findTempCredentials(token);

        if (!credentials) {
            const response = buildInvalidTokenResponse(req, token);
            return res.status(response.status).json(response.json);
        }

        if (!isTempTokenPathAllowed(req.originalUrl)) {
            const response = buildForbiddenEndpointResponse(req, token);
            return res.status(response.status).json(response.json);
        }

        setRequestCredentials(req, credentials);
        next();
    } catch (error) {
        logger.error('Temp token auth error:', error);
        
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error during authentication',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = tempTokenAuth;
