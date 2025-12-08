const express = require('express');
const router = express.Router();

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
const { handleCredentialsPost, handleCredentialsPut } = require('./credentials/helpers');

router.post('/', async (req, res) => {
  try {
    logger.ocpi('/credentials', 'POST', { body: req.body });
    await handleCredentialsPost(req, res);
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
    await handleCredentialsPut(req, res);
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





