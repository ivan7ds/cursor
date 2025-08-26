const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Tariff } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/2.2/tariffs:
 *   get:
 *     summary: Get OCPI tariffs
 *     tags: [Tariffs]
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
 *         name: type
 *         schema:
 *           type: string
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'GET', { query: req.query });
    
    const { country_code, party_id, type, offset = 0, limit = 100 } = req.query;
    
    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (type) where.type = type;
    
    const tariffs = await Tariff.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['last_updated', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: tariffs.rows,
      timestamp: new Date().toISOString(),
      pagination: {
        total: tariffs.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting tariffs:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   get:
 *     summary: Get specific OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'GET_BY_ID', { id: req.params.id });
    
    const { id } = req.params;
    const tariff = await Tariff.findByPk(id);
    
    if (!tariff) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Tariff not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: tariff,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tariffs:
 *   post:
 *     summary: Create new OCPI tariff
 *     tags: [Tariffs]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'POST', { body: req.body });
    
    const tariffData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    const tariff = await Tariff.create(tariffData);

    res.status(201).json({
      status_code: 1000,
      data: tariff,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   put:
 *     summary: Update OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const tariff = await Tariff.findByPk(id);
    
    if (!tariff) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Tariff not found',
        timestamp: new Date().toISOString()
      });
    }

    await tariff.update({
      ...req.body,
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      data: tariff,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   delete:
 *     summary: Delete OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'DELETE', { id: req.params.id });
    
    const { id } = req.params;
    const tariff = await Tariff.findByPk(id);
    
    if (!tariff) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Tariff not found',
        timestamp: new Date().toISOString()
      });
    }

    await tariff.destroy();

    res.status(200).json({
      status_code: 1000,
      status_message: 'Tariff deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;




