const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { CDR, Session, EVSE, Location } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/2.2/cdrs:
 *   get:
 *     summary: Get OCPI CDRs
 *     tags: [CDRs]
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
 *         name: session_id
 *         schema:
 *           type: string
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/cdrs', 'GET', { query: req.query });
    
    const { country_code, party_id, session_id, offset = 0, limit = 100 } = req.query;
    
    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (session_id) where.session_id = session_id;
    
    const cdrs = await CDR.findAndCountAll({
      where,
      include: [
        {
          model: Session,
          as: 'session',
          attributes: ['id', 'start_datetime', 'end_datetime']
        },
        {
          model: EVSE,
          as: 'evse',
          attributes: ['id', 'evse_id', 'status']
        },
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name', 'address', 'city']
        }
      ],
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['start_datetime', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: cdrs.rows,
      timestamp: new Date().toISOString(),
      pagination: {
        total: cdrs.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting CDRs:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/cdrs/{id}:
 *   get:
 *     summary: Get specific OCPI CDR
 *     tags: [CDRs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  try {
    logger.ocpi('/cdrs', 'GET_BY_ID', { id: req.params.id });
    
    const { id } = req.params;
    const cdr = await CDR.findByPk(id, {
      include: [
        {
          model: Session,
          as: 'session',
          attributes: ['id', 'start_datetime', 'end_datetime']
        },
        {
          model: EVSE,
          as: 'evse',
          attributes: ['id', 'evse_id', 'status']
        },
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name', 'address', 'city']
        }
      ]
    });
    
    if (!cdr) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'CDR not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: cdr,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting CDR:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/cdrs:
 *   post:
 *     summary: Create new OCPI CDR
 *     tags: [CDRs]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/cdrs', 'POST', { body: req.body });
    
    const cdrData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    const cdr = await CDR.create(cdrData);

    res.status(201).json({
      status_code: 1000,
      data: cdr,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating CDR:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/cdrs/{id}:
 *   put:
 *     summary: Update OCPI CDR
 *     tags: [CDRs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/cdrs', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const cdr = await CDR.findByPk(id);
    
    if (!cdr) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'CDR not found',
        timestamp: new Date().toISOString()
      });
    }

    await cdr.update({
      ...req.body,
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      data: cdr,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating CDR:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/cdrs/{id}:
 *   delete:
 *     summary: Delete OCPI CDR
 *     tags: [CDRs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/cdrs', 'DELETE', { id: req.params.id });
    
    const { id } = req.params;
    const cdr = await CDR.findByPk(id);
    
    if (!cdr) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'CDR not found',
        timestamp: new Date().toISOString()
      });
    }

    await cdr.destroy();

    res.status(200).json({
      status_code: 1000,
      status_message: 'CDR deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting CDR:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
