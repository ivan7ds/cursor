const logger = require('../utils/logger');
const { Credentials } = require('../models');

/**
 * Middleware de autenticación para tokens temporales
 * Solo permite acceso a endpoints básicos: /versions, /credentials, /details
 */
const tempTokenAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Token ')) {
            logger.warn('Temp token auth failed: No authorization header', {
                ip: req.ip,
                path: req.path,
                method: req.method
            });
            
            return res.status(401).json({
                status_code: 2001,
                status_message: 'Authentication failed: Missing token',
                timestamp: new Date().toISOString()
            });
        }

        const token = authHeader.substring(6); // Remove 'Token ' prefix
        
        // Buscar el token en la base de datos
        const credentials = await Credentials.findOne({
            where: {
                token: token,
                valid: true,
                temp: true
            }
        });

        if (!credentials) {
            logger.warn('Temp token auth failed: Invalid or expired token', {
                ip: req.ip,
                path: req.path,
                method: req.method,
                providedToken: token.substring(0, 10) + '...'
            });
            
            return res.status(401).json({
                status_code: 2001,
                status_message: 'Authentication failed: Invalid or expired token',
                timestamp: new Date().toISOString()
            });
        }

        // Verificar que el endpoint esté permitido para tokens temporales
        // Para /ocpi/versions, el path interno es '/' pero la URL original es '/ocpi/versions'
        const originalPath = req.originalUrl.split('?')[0];
        const isVersionsEndpoint = originalPath === '/ocpi/versions' || originalPath === '/ocpi/versions/';
        const isCredentialsEndpoint = originalPath.startsWith('/ocpi/cpo/2.2/credentials');
        const isDetailsEndpoint = originalPath.startsWith('/ocpi/cpo/2.2/details');
        
        const isAllowedPath = isVersionsEndpoint || isCredentialsEndpoint || isDetailsEndpoint;
        
        // Debug logging (comentado para producción)
        // console.log('🔍 Temp token auth - Original URL:', req.originalUrl);
        // console.log('🔍 Temp token auth - Path:', req.path);
        // console.log('🔍 Temp token auth - Original path:', originalPath);
        // console.log('🔍 Temp token auth - Is versions:', isVersionsEndpoint);
        // console.log('🔍 Temp token auth - Is credentials:', isCredentialsEndpoint);
        // console.log('🔍 Temp token auth - Is details:', isDetailsEndpoint);
        // console.log('🔍 Temp token auth - Is allowed:', isAllowedPath);
        
        if (!isAllowedPath) {
            logger.warn('Temp token auth failed: Endpoint not allowed for temporary tokens', {
                ip: req.ip,
                path: req.path,
                method: req.method,
                providedToken: token.substring(0, 10) + '...'
            });
            
            return res.status(403).json({
                status_code: 2002,
                status_message: 'Forbidden: This endpoint requires a permanent token',
                timestamp: new Date().toISOString()
            });
        }

        // Agregar información del token a la request
        req.credentials = credentials;
        req.tokenType = 'temp';
        
        logger.info('Temp token auth successful', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            partyId: credentials.party_id,
            countryCode: credentials.country_code
        });

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
