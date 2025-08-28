const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Session, EVSE } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/2.2/sessions:
 *   get:
 *     summary: Get OCPI sessions
 *     tags: [Sessions]
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
 *         name: evse_uid
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/sessions', 'GET', { query: req.query });
    
    const { country_code, party_id, evse_uid, status, offset = 0, limit = 100 } = req.query;
    
    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (evse_uid) where.evse_uid = evse_uid;
    if (status) where.status = status;
    
    const sessions = await Session.findAndCountAll({
      where,
      include: [
        {
          model: EVSE,
          as: 'evse',
          attributes: ['id', 'evse_id', 'status', 'connectors']
        }
      ],
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['start_datetime', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: sessions.rows,
      timestamp: new Date().toISOString(),
      pagination: {
        total: sessions.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting sessions:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/sessions/{id}:
 *   get:
 *     summary: Get specific OCPI session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  try {
    logger.ocpi('/sessions', 'GET_BY_ID', { id: req.params.id });
    
    const { id } = req.params;
    const session = await Session.findByPk(id, {
      include: [
        {
          model: EVSE,
          as: 'evse',
          attributes: ['id', 'evse_id', 'status', 'connectors']
        }
      ]
    });
    
    if (!session) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Session not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting session:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/sessions:
 *   post:
 *     summary: Create new OCPI session
 *     tags: [Sessions]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/sessions', 'POST', { body: req.body });
    
    const sessionData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      start_datetime: req.body.start_datetime || new Date(),
      last_updated: new Date()
    };

    const session = await Session.create(sessionData);

    res.status(201).json({
      status_code: 1000,
      data: session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating session:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/sessions/{id}:
 *   put:
 *     summary: Update OCPI session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/sessions', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Session not found',
        timestamp: new Date().toISOString()
      });
    }

    await session.update({
      ...req.body,
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      data: session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating session:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/sessions/{id}:
 *   delete:
 *     summary: Delete OCPI session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/sessions', 'DELETE', { id: req.params.id });
    
    const { id } = req.params;
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Session not found',
        timestamp: new Date().toISOString()
      });
    }

    await session.destroy();

    res.status(200).json({
      status_code: 1000,
      status_message: 'Session deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting session:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;




