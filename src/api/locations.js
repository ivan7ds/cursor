const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { Location, EVSE } = require('../models');
const emspNotificationService = require('../services/emspNotificationService');
const logger = require('../utils/logger');
const { logLocationData, logArrayData } = require('../utils/loggingUtils');

const {
  validatePaginationParams,
  buildWhereClause,
  calculatePaginationInfo,
  buildPaginationHeaders
} = require('./locations/paginationHelpers');
const {
  queryLocationsWithEVSEs,
  processLocationsForResponse
} = require('./locations/queryHelpers');
const { cleanLocation } = require('./locations/transformers');

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
 *         description: Pagination limit (max 1000, default 25)
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
    
    const { country_code, party_id, offset = 0, limit = 25 } = req.query;
    
    const paginationError = validatePaginationParams(offset, limit);
    if (paginationError) {
      return res.status(paginationError.status).json(paginationError.json);
    }
    
    const offsetInt = parseInt(offset);
    const limitInt = parseInt(limit);
    const where = buildWhereClause(country_code, party_id);
    
    const totalCount = await Location.count({ where });
    const locations = await queryLocationsWithEVSEs(where, offsetInt, limitInt);
    const { hasNextPage } = calculatePaginationInfo(totalCount, offsetInt, limitInt);
    const cleanedLocations = processLocationsForResponse(locations, logLocationData, logArrayData);
    
    const headers = buildPaginationHeaders(totalCount, limitInt, hasNextPage, req);
    res.set(headers);
    
    res.status(200).json({
      status_code: 1000,
      data: cleanedLocations,
      timestamp: new Date().toISOString()
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
      where: { deleted_at: null }, // Solo incluir location activa
      include: [{
        model: EVSE,
        as: 'evseList',
        where: { deleted_at: null }, // Solo incluir EVSEs activos (no soft-deleted)
        required: false, // LEFT JOIN para incluir location sin EVSEs
        attributes: ['id', 'evse_id', 'status', 'capabilities', 'connectors', 'physical_reference', 'last_updated']
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

    // Notificar a los EMSPs sobre la nueva location (en segundo plano)
    emspNotificationService.notifyLocationCreated(location)
      .catch(error => {
        logger.error('Error notificando a EMSPs sobre nueva location:', error);
      });

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

    // Notificar a los EMSPs sobre la location actualizada (en segundo plano)
    emspNotificationService.notifyLocationUpdated(location)
      .catch(error => {
        logger.error('Error notificando a EMSPs sobre location actualizada:', error);
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

    // Soft delete: marcar como eliminada en lugar de destruir
    await location.update({
      deleted_at: new Date(),
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      status_message: 'Location soft deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error soft deleting location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
