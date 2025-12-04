const express = require('express');

const router = express.Router();
const { Op } = require('sequelize');

const { ApplicationError } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/application-errors:
 *   get:
 *     summary: Get application errors
 *     tags: [Application Errors]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: error_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [INBOUND, OUTBOUND]
 *       - in: query
 *         name: status_code
 *         schema:
 *           type: integer
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, error_type, direction, status_code } = req.query;

    const where = {};
    if (error_type) where.error_type = { [Op.like]: `%${error_type}%` };
    if (direction) where.direction = direction;
    if (status_code) where.status_code = parseInt(status_code);

    const { count, rows } = await ApplicationError.findAndCountAll({
      where,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: rows,
      total: count,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting application errors:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/application-errors/{id}:
 *   get:
 *     summary: Get specific application error
 *     tags: [Application Errors]
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const error = await ApplicationError.findByPk(id);

    if (!error) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Application error not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting application error:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/application-errors:
 *   post:
 *     summary: Create new application error
 *     tags: [Application Errors]
 */
router.post('/', async (req, res) => {
  try {
    const errorData = {
      ...req.body,
      timestamp: new Date()
    };

    const error = await ApplicationError.create(errorData);

    res.status(201).json({
      status_code: 1000,
      data: error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating application error:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/application-errors/{id}:
 *   delete:
 *     summary: Delete application error
 *     tags: [Application Errors]
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const error = await ApplicationError.findByPk(id);

    if (!error) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Application error not found',
        timestamp: new Date().toISOString()
      });
    }

    await error.destroy();

    res.status(200).json({
      status_code: 1000,
      status_message: 'Application error deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting application error:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/application-errors:
 *   delete:
 *     summary: Delete all application errors
 *     tags: [Application Errors]
 */
router.delete('/', async (req, res) => {
  try {
    await ApplicationError.destroy({ where: {} });

    res.status(200).json({
      status_code: 1000,
      status_message: 'All application errors deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting all application errors:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

