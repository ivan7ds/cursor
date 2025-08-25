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
    
    const credentials = await Credentials.findAll({
      where: {
        country_code: req.query.country_code || process.env.OCPI_COUNTRY_CODE,
        party_id: req.query.party_id || process.env.OCPI_PARTY_ID
      }
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
 *     summary: Create new OCPI credentials
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
 *               business_details:
 *                 type: object
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/credentials', 'POST', { body: req.body });
    
    const { token, url, business_details } = req.body;
    
    if (!token || !url || !business_details) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Missing required fields',
        timestamp: new Date().toISOString()
      });
    }

    const credentials = await Credentials.create({
      id: uuidv4(),
      token,
      url,
      business_details,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    });

    res.status(201).json({
      status_code: 1000,
      data: credentials,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating credentials:', error);
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
 *   put:
 *     summary: Update OCPI credentials
 *     tags: [Credentials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/credentials', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const credentials = await Credentials.findByPk(id);
    
    if (!credentials) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Credentials not found',
        timestamp: new Date().toISOString()
      });
    }

    await credentials.update({
      ...req.body,
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      data: credentials,
      timestamp: new Date().toISOString()
    });
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
