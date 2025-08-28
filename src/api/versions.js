const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/versions:
 *   get:
 *     summary: Get OCPI versions information
 *     tags: [Versions]
 *     description: Returns basic information about available OCPI versions
 *     responses:
 *       200:
 *         description: Successfully retrieved versions information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       version:
 *                         type: string
 *                         example: "2.2"
 *                       url:
 *                         type: string
 *                         example: "https://example.com/ocpi/cpo/2.2/details"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/versions', 'GET', { query: req.query });
    
    // Get base URL from environment variable or fallback to request
    const baseUrl = process.env.OCPI_BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    // Remove trailing slash if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    // Define available OCPI versions (solo información básica)
    const versions = [
      {
        version: "2.2",
        url: `${cleanBaseUrl}/ocpi/cpo/2.2/details`
      }
    ];

    // Return response with status_code, data, and timestamp wrapper
    const response = {
      status_code: 1000,
      data: versions,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting versions:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
