const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/details:
 *   get:
 *     summary: Get OCPI details information for all roles
 *     tags: [Details]
 *     description: Returns detailed information about available OCPI endpoints with roles for both CPO and eMSP
 *     responses:
 *       200:
 *         description: Successfully retrieved details information
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
 *                     version:
 *                       type: string
 *                       example: "2.2"
 *                     endpoints:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           identifier:
 *                             type: string
 *                             example: "cdrs"
 *                           role:
 *                             type: string
 *                             example: "SENDER"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/ocpi/cpo/2.2/cdrs/"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/details', 'GET', { query: req.query });
    
    // Get base URL from environment variable or fallback to request
    const baseUrl = process.env.OCPI_BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    // Remove trailing slash if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    // Define available OCPI version with all endpoints for both CPO and eMSP roles
    const endpoints = [
      // CPO endpoints (SENDER role)
      {
        identifier: "cdrs",
        role: "SENDER",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/cdrs/`
      },
      {
        identifier: "commands",
        role: "RECEIVER",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/commands/`
      },
      {
        identifier: "credentials",
        role: "SENDER",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/credentials/`
      },
      {
        identifier: "credentials",
        role: "RECEIVER",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/credentials/`
      },
      {
        identifier: "locations",
        role: "SENDER",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/locations/`
      },
      {
        identifier: "sessions",
        role: "SENDER",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/sessions/`
      },
      {
        identifier: "tariffs",
        role: "SENDER",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/tariffs/`
      },
      {
        identifier: "tokens",
        role: "RECEIVER",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/tokens/`
      },
      // eMSP endpoints
      {
        identifier: "locations",
        role: "RECEIVER",
        url: `${cleanBaseUrl}/ocpi/emsp/2.2/locations/`
      },
      {
        identifier: "sessions",
        role: "RECEIVER",
        url: `${cleanBaseUrl}/ocpi/emsp/2.2/sessions/`
      },
      {
        identifier: "cdrs",
        role: "RECEIVER",
        url: `${cleanBaseUrl}/ocpi/emsp/2.2/cdrs/`
      },
      {
        identifier: "tokens",
        role: "SENDER",
        url: `${cleanBaseUrl}/ocpi/emsp/2.2/tokens/`
      },
      {
        identifier: "tariffs",
        role: "RECEIVER",
        url: `${cleanBaseUrl}/ocpi/emsp/2.2/tariffs/`
      }
    ];

    // Return response with status_code, data (containing version and endpoints), and timestamp wrapper
    const response = {
      status_code: 1000,
      data: {
        version: "2.2",
        endpoints: endpoints
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting details:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
