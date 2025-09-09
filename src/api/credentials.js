const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Credentials } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/2.2/credentials:
 *   get:
 *     summary: Get OCPI credentials
 *     tags: [Credentials]
 *     responses:
 *       200:
 *         description: Credentials retrieved successfully
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/credentials', 'GET', { query: req.query });
    
    // Mostrar todas las conexiones (tanto CPO como EMSP)
    const credentials = await Credentials.findAll({
      order: [['last_updated', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: credentials,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting credentials:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/credentials:
 *   post:
 *     summary: Exchange OCPI credentials
 *     tags: [Credentials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               url:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     party_id:
 *                       type: string
 *                     country_code:
 *                       type: string
 *                     business_details:
 *                       type: object
 *     responses:
 *       200:
 *         description: Credentials exchanged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: New token for the connection
 *                     url:
 *                       type: string
 *                       description: URL to our versions endpoint
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: string
 *                             example: "CPO"
 *                           business_details:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "IPD"
 *                           party_id:
 *                             type: string
 *                             example: "IPD"
 *                           country_code:
 *                             type: string
 *                             example: "ES"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/credentials', 'POST', { body: req.body });
    
    const { token, url, roles } = req.body;
    
    // Validar campos requeridos según OCPI 2.2
    if (!token || !url || !roles) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Missing required fields: token, url, or roles',
        timestamp: new Date().toISOString()
      });
    }

    // Validar que roles sea un array y no esté vacío
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Roles must be a non-empty array',
        timestamp: new Date().toISOString()
      });
    }

    // Validar cada rol individual
    for (const role of roles) {
      if (!role.role || !role.party_id || !role.country_code) {
        return res.status(400).json({
          status_code: 2001,
          status_message: 'Each role must contain role, party_id, and country_code',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Obtener el token de autenticación del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Token ')) {
      return res.status(401).json({
        status_code: 2001,
        status_message: 'Authentication failed: Missing token in Authorization header',
        timestamp: new Date().toISOString()
      });
    }

    const authToken = authHeader.substring(6); // Remove 'Token ' prefix

    // Buscar el token temporal en nuestra base de datos
    const tempCredentials = await Credentials.findOne({
      where: {
        token: authToken,
        valid: true,
        temp: true
      }
    });

    if (!tempCredentials) {
      logger.warn('Handshake failed: Invalid or expired temporary token', {
        ip: req.ip,
        providedToken: authToken.substring(0, 10) + '...'
      });
      
      return res.status(401).json({
        status_code: 2001,
        status_message: 'Authentication failed: Invalid or expired temporary token',
        timestamp: new Date().toISOString()
      });
    }

    // Extraer información de la organización externa del primer rol
    const externalRole = roles[0];
    const businessDetails = externalRole.business_details || {};

    // Actualizar la entrada del token temporal con el token del operador externo
    await tempCredentials.update({
      token: token, // Reemplazar token temporal con el token del operador
      url: url,
      business_details: businessDetails,
      party_id: externalRole.party_id,
      country_code: externalRole.country_code,
      valid: true,
      temp: false, // Ya no es temporal, ahora es permanente
      last_updated: new Date()
    });

    logger.info('Temporary token converted to permanent external token', {
      partyId: externalRole.party_id,
      countryCode: externalRole.country_code,
      externalToken: token.substring(0, 10) + '...'
    });

    // Generar nuestro token para la organización externa
    const ourToken = `OCPI_${uuidv4().replace(/-/g, '')}`;
    
    // Guardar nuestro token para autenticar peticiones hacia la organización externa
    const ourCredentials = await Credentials.create({
      id: uuidv4(),
      token: ourToken,
      url: url, // URL de la organización externa
      business_details: {
        name: 'IPD',
        website: 'https://www.ipd.com'
      },
      party_id: process.env.OCPI_PARTY_ID || 'IPD',
      country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
      external_party_id: externalRole.party_id, // Identificar para qué operador es este token
      valid: true,
      temp: false,
      last_updated: new Date()
    });

    logger.info('Our credentials created for external organization', {
      externalPartyId: externalRole.party_id,
      ourToken: ourToken.substring(0, 10) + '...'
    });
    
    // Construir la URL base para nuestra respuesta
    const baseUrl = process.env.OCPI_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // Usar credenciales del sistema (mismo token que usa el frontend)
    const systemPartyId = process.env.OCPI_PARTY_ID || 'IPD';
    const systemCountryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
    const systemBusinessDetails = {
      name: 'IPD',
      website: 'https://www.ipd.com'
    };

    // Devolver nuestras credenciales según OCPI 2.2.1
    const response = {
      status_code: 1000,
      data: {
        token: ourToken,
        url: `${cleanBaseUrl}/ocpi/cpo/versions`,
        business_details: systemBusinessDetails,
        party_id: systemPartyId,
        country_code: systemCountryCode,
        last_updated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    logger.info('Handshake completed successfully', {
      externalPartyId: externalRole.party_id,
      externalCountryCode: externalRole.country_code,
      ourToken: ourToken.substring(0, 10) + '...'
    });

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error during handshake:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/credentials:
 *   put:
 *     summary: Update OCPI credentials
 *     tags: [Credentials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               url:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     party_id:
 *                       type: string
 *                     country_code:
 *                       type: string
 *                     business_details:
 *                       type: object
 *     responses:
 *       200:
 *         description: Credentials updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: New token for the connection
 *                     url:
 *                       type: string
 *                       description: URL to our versions endpoint
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: string
 *                             example: "CPO"
 *                           business_details:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "IPD"
 *                           party_id:
 *                             type: string
 *                             example: "IPD"
 *                           country_code:
 *                             type: string
 *                             example: "ES"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.put('/', async (req, res) => {
  try {
    logger.ocpi('/credentials', 'PUT', { body: req.body });
    
    const { token, url, roles } = req.body;
    
    // Validar campos requeridos según OCPI 2.2
    if (!token || !url || !roles) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Missing required fields: token, url, or roles',
        timestamp: new Date().toISOString()
      });
    }

    // Validar que roles sea un array y no esté vacío
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Roles must be a non-empty array',
        timestamp: new Date().toISOString()
      });
    }

    // Validar cada rol individual
    for (const role of roles) {
      if (!role.role || !role.party_id || !role.country_code) {
        return res.status(400).json({
          status_code: 2001,
          status_message: 'Each role must contain role, party_id, and country_code',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Extraer business_details del primer rol (asumiendo que todos tienen la misma información)
    const businessDetails = roles[0].business_details || {};

    // Buscar credenciales existentes para actualizar
    const existingCredentials = await Credentials.findOne({
      where: {
        party_id: process.env.OCPI_PARTY_ID,
        country_code: process.env.OCPI_COUNTRY_CODE
      }
    });

    if (existingCredentials) {
      // Actualizar credenciales existentes
      await existingCredentials.update({
        token,
        url,
        business_details: businessDetails,
        last_updated: new Date()
      });
    } else {
      // Crear nuevas credenciales si no existen
      await Credentials.create({
        id: uuidv4(),
        token,
        url,
        business_details: businessDetails,
        party_id: process.env.OCPI_PARTY_ID,
        country_code: process.env.OCPI_COUNTRY_CODE,
        last_updated: new Date()
      });
    }

    // Generar un nuevo token para la conexión con este eMSP
    const newToken = `OCPI_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Construir la URL base para nuestra respuesta
    const baseUrl = process.env.OCPI_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // Devolver nuestras credenciales con ambos roles según el patrón OCPI 2.2
    const response = {
      status_code: 1000,
      data: {
        token: newToken,
        url: `${cleanBaseUrl}/ocpi/cpo/versions`,
        roles: [
          {
            role: "CPO",
            business_details: {
              name: "IPD"
            },
            party_id: "IPD",
            country_code: "ES"
          },
          {
            role: "EMSP",
            business_details: {
              name: "IPD"
            },
            party_id: "IPD",
            country_code: "ES"
          }
        ]
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating credentials:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/credentials/{id}:
 *   delete:
 *     summary: Delete OCPI credentials
 *     tags: [Credentials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/credentials', 'DELETE', { id: req.params.id });
    
    const { id } = req.params;
    const credentials = await Credentials.findByPk(id);
    
    if (!credentials) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Credentials not found',
        timestamp: new Date().toISOString()
      });
    }

    await credentials.destroy();

    res.status(200).json({
      status_code: 1000,
      status_message: 'Credentials deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting credentials:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;





