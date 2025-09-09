const express = require('express');
const router = express.Router();
const { Credentials } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/connections:
 *   get:
 *     summary: Get all OCPI connections
 *     tags: [Connections]
 *     description: Returns all OCPI connections for the frontend
 *     responses:
 *       200:
 *         description: Successfully retrieved connections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       party_id:
 *                         type: string
 *                       country_code:
 *                         type: string
 *                       url:
 *                         type: string
 *                       valid:
 *                         type: boolean
 *                       temp:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', async (req, res) => {
  try {
    logger.info('Loading OCPI connections for frontend');
    
    // Obtener todas las conexiones (tanto temporales como permanentes)
    const connections = await Credentials.findAll({
      order: [['created_at', 'DESC']]
    });

    // Formatear las conexiones para el frontend
    const formattedConnections = connections.map(conn => ({
      id: conn.id,
      party_id: conn.party_id,
      country_code: conn.country_code,
      url: conn.url,
      token: conn.token, // Campo requerido por el frontend
      last_updated: conn.last_updated, // Campo requerido por el frontend
      valid: conn.valid,
      temp: conn.temp,
      created_at: conn.created_at,
      updated_at: conn.updated_at
    }));

    res.status(200).json({
      status_code: 1000,
      data: formattedConnections,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error loading connections:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/connections/{id}:
 *   delete:
 *     summary: Delete an OCPI connection
 *     tags: [Connections]
 *     description: Deletes an OCPI connection by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Connection deleted successfully
 *       404:
 *         description: Connection not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`Deleting connection: ${id}`);
    
    const connection = await Credentials.findByPk(id);
    
    if (!connection) {
      return res.status(404).json({
        status_code: 2001,
        status_message: 'Connection not found',
        timestamp: new Date().toISOString()
      });
    }

    await connection.destroy();
    
    logger.info(`Connection ${id} deleted successfully`);
    
    res.status(200).json({
      status_code: 1000,
      status_message: 'Connection deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error deleting connection:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
