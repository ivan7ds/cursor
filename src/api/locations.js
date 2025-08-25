const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Location, EVSE } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/2.2/locations:
 *   get:
 *     summary: Get OCPI locations
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: country_code
 *         schema:
 *           type: string
 *       - in: query
 *         name: party_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/locations', 'GET', { query: req.query });
    
    const { country_code, party_id, offset = 0, limit = 100 } = req.query;
    
    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    
    const locations = await Location.findAndCountAll({
      where,
      include: [{
        model: EVSE,
        as: 'evses',
        attributes: ['id', 'evse_id', 'status', 'connectors']
      }],
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['last_updated', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: locations.rows,
      timestamp: new Date().toISOString(),
      pagination: {
        total: locations.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting locations:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/locations/{id}:
 *   get:
 *     summary: Get specific OCPI location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  try {
    logger.ocpi('/locations', 'GET_BY_ID', { id: req.params.id });
    
    const { id } = req.params;
    const location = await Location.findByPk(id, {
      include: [{
        model: EVSE,
        as: 'evses',
        attributes: ['id', 'evse_id', 'status', 'connectors']
      }]
    });
    
    if (!location) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Location not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/locations:
 *   post:
 *     summary: Create new OCPI location
 *     tags: [Locations]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/locations', 'POST', { body: req.body });
    
    const locationData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    const location = await Location.create(locationData);

    res.status(201).json({
      status_code: 1000,
      data: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/locations/{id}:
 *   put:
 *     summary: Update OCPI location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/locations', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const location = await Location.findByPk(id);
    
    if (!location) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Location not found',
        timestamp: new Date().toISOString()
      });
    }

    await location.update({
      ...req.body,
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      data: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/locations/{id}:
 *   delete:
 *     summary: Delete OCPI location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/locations', 'DELETE', { id: req.params.id });
    
    const { id } = req.params;
    const location = await Location.findByPk(id);
    
    if (!location) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Location not found',
        timestamp: new Date().toISOString()
      });
    }

    await location.destroy();

    res.status(200).json({
      status_code: 1000,
      status_message: 'Location deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
