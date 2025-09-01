const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { EVSE, Location } = require('../models');
const logger = require('../utils/logger');
const emspNotificationService = require('../services/emspNotificationService');

/**
 * @swagger
 * /ocpi/2.2/evses:
 *   get:
 *     summary: Get OCPI EVSEs
 *     tags: [EVSEs]
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
 *         name: location_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/evses', 'GET', { query: req.query });
    
    const { country_code, party_id, location_id, status, offset = 0, limit = 100 } = req.query;
    
    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (location_id) where.location_id = location_id;
    if (status) where.status = status;
    // Filtrar EVSEs eliminados (soft delete)
    where.deleted_at = null;
    
    const evses = await EVSE.findAndCountAll({
      where,
      include: [{
        model: Location,
        as: 'location',
        attributes: ['id', 'name', 'address', 'city', 'coordinates']
      }],
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['last_updated', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: evses.rows,
      timestamp: new Date().toISOString(),
      pagination: {
        total: evses.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting EVSEs:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   get:
 *     summary: Get specific OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  try {
    logger.ocpi('/evses', 'GET_BY_ID', { id: req.params.id });
    
    const { id } = req.params;
    const evse = await EVSE.findByPk(id, {
      include: [{
        model: Location,
        as: 'location',
        attributes: ['id', 'name', 'address', 'city', 'coordinates']
      }]
    });
    
    if (!evse) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: evse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/evses:
 *   post:
 *     summary: Create new OCPI EVSE
 *     tags: [EVSEs]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/evses', 'POST', { body: req.body });
    
    const evseData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    const evse = await EVSE.create(evseData);

    // Notificar a los EMSPs sobre el nuevo EVSE (en segundo plano)
    emspNotificationService.notifyEVSECreated(evse)
      .catch(error => {
        logger.error('Error notificando a EMSPs sobre nuevo EVSE:', error);
      });

    res.status(201).json({
      status_code: 1000,
      data: evse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   put:
 *     summary: Update OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/evses', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const evse = await EVSE.findByPk(id);
    
    if (!evse) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      });
    }

    await evse.update({
      ...req.body,
      last_updated: new Date()
    });

    // Notificar a los EMSPs sobre la actualización del EVSE (en segundo plano)
    emspNotificationService.notifyEVSEUpdated(evse)
      .catch(error => {
        logger.error('Error notificando a EMSPs sobre actualización de EVSE:', error);
      });

    res.status(200).json({
      status_code: 1000,
      data: evse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   delete:
 *     summary: Delete OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/evses', 'DELETE', { id: req.params.id });
    
    const { id } = req.params;
    const evse = await EVSE.findByPk(id);
    
    if (!evse) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete: marcar como eliminado en lugar de destruir
    await evse.update({
      deleted_at: new Date(),
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      status_message: 'EVSE soft deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;




