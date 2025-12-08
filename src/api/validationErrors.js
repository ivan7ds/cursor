const express = require('express');

const router = express.Router();
const { Op } = require('sequelize');

const { ValidationError } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/validation-errors:
 *   get:
 *     summary: Get validation errors
 *     tags: [Validation Errors]
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
 *         name: endpoint
 *         schema:
 *           type: string
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, endpoint, method } = req.query;

    const where = {};
    if (endpoint) where.endpoint = { [Op.like]: `%${endpoint}%` };
    if (method) where.method = method;

    const { count, rows } = await ValidationError.findAndCountAll({
      where,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: rows,
      pagination: {
        total: count,
        limit: Math.min(parseInt(limit), 500),
        offset: parseInt(offset)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting validation errors:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/validation-errors/{id}:
 *   get:
 *     summary: Get specific validation error
 *     tags: [Validation Errors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const validationError = await ValidationError.findByPk(id);

    if (!validationError) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Validation error not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: validationError,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting validation error:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/validation-errors:
 *   delete:
 *     summary: Delete all validation errors
 *     tags: [Validation Errors]
 */
router.delete('/', async (_req, res) => {
  try {
    const deletedCount = await ValidationError.destroy({
      where: {},
      truncate: true
    });

    logger.info(`Deleted ${deletedCount} validation errors`);

    res.status(200).json({
      status_code: 1000,
      status_message: `Successfully deleted all validation errors`,
      // eslint-disable-next-line camelcase -- Campo en snake_case según convención de API
      deleted_count: deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting validation errors:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/validation-errors/{id}:
 *   delete:
 *     summary: Delete specific validation error
 *     tags: [Validation Errors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const validationError = await ValidationError.findByPk(id);

    if (!validationError) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Validation error not found',
        timestamp: new Date().toISOString()
      });
    }

    await validationError.destroy();

    res.status(200).json({
      status_code: 1000,
      status_message: 'Validation error deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting validation error:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
