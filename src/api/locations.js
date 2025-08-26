const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Location, EVSE } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/2.2/locations:
 *   get:
 *     summary: Get OCPI locations with pagination
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: country_code
 *         schema:
 *           type: string
 *         description: Filter by country code
 *       - in: query
 *         name: party_id
 *         schema:
 *           type: string
 *         description: Filter by party ID
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset (default 0)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Pagination limit (max 1000, default 100)
 *     responses:
 *       200:
 *         description: Successfully retrieved locations
 *         headers:
 *           X-Total-Count:
 *             description: Total number of locations
 *             schema:
 *               type: integer
 *           X-Limit:
 *             description: Maximum number of locations returned
 *             schema:
 *               type: integer
 *           X-Offset:
 *             description: Offset of the first location returned
 *             schema:
 *               type: integer
 *       400:
 *         description: Bad request - invalid pagination parameters
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/locations', 'GET', { query: req.query });
    
    const { country_code, party_id, offset = 0, limit = 100 } = req.query;
    
    // Validate pagination parameters
    const offsetInt = parseInt(offset);
    const limitInt = parseInt(limit);
    
    if (isNaN(offsetInt) || offsetInt < 0) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Invalid offset parameter. Must be a non-negative integer.',
        timestamp: new Date().toISOString()
      });
    }
    
    if (isNaN(limitInt) || limitInt < 1 || limitInt > 1000) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Invalid limit parameter. Must be between 1 and 1000.',
        timestamp: new Date().toISOString()
      });
    }
    
    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    
    // First get total count
    const totalCount = await Location.count({ where });
    
    // Then get locations with EVSEs
    logger.info('Querying locations with EVSEs...');
    
    // First try a simple query without include to see if that works
    let locations;
    if (offsetInt === 0 && limitInt <= 5) {
      // For small queries, try with include
      locations = await Location.findAll({
        where,
        include: [{
          model: EVSE,
          as: 'evseList',
          attributes: ['id', 'evse_id', 'status', 'connectors']
        }],
        offset: offsetInt,
        limit: limitInt,
        order: [['last_updated', 'DESC']]
      });
    } else {
      // For larger queries, get locations first, then EVSEs separately
      locations = await Location.findAll({
        where,
        offset: offsetInt,
        limit: limitInt,
        order: [['last_updated', 'DESC']]
      });
      
      // Load EVSEs for each location
      for (const location of locations) {
        const evses = await EVSE.findAll({
          where: { location_id: location.id },
          attributes: ['id', 'evse_id', 'status', 'connectors']
        });
        location.evseList = evses;
      }
    }
    
    logger.info(`Found ${locations.length} locations`);
    locations.forEach((location, index) => {
      logger.info(`Location ${index + 1}: ${location.id} has ${location.evseList ? location.evseList.length : 0} EVSEs`);
    });

    // Set OCPI 2.2 pagination headers
    res.set({
      'X-Total-Count': totalCount.toString(),
      'X-Limit': limitInt.toString(),
      'X-Offset': offsetInt.toString()
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitInt);
    const currentPage = Math.floor(offsetInt / limitInt) + 1;
    const hasNextPage = offsetInt + limitInt < totalCount;
    const hasPrevPage = offsetInt > 0;

    // Debug: log the response structure
    logger.info(`Response structure: locations type=${typeof locations}, length=${locations ? locations.length : 'undefined'}`);
    logger.info(`First location sample:`, JSON.stringify(locations[0], null, 2));
    
    res.status(200).json({
      status_code: 1000,
      data: locations,
      timestamp: new Date().toISOString(),
      pagination: {
        total: totalCount,
        offset: offsetInt,
        limit: limitInt,
        total_pages: totalPages,
        current_page: currentPage,
        has_next: hasNextPage,
        has_previous: hasPrevPage,
        next_offset: hasNextPage ? offsetInt + limitInt : null,
        previous_offset: hasPrevPage ? Math.max(0, offsetInt - limitInt) : null
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
        as: 'evseList',
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
      return res.status(400).json({
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
