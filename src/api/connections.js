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
router.get('/', async (_req, res) => {
  try {
    logger.info('Loading OCPI connections for frontend');
    
    // Verificar que el modelo Credentials esté disponible
    if (!Credentials) {
      logger.error('Credentials model is not available');
      return res.status(500).json({
        status_code: 2000,
        status_message: 'Credentials model not available',
        timestamp: new Date().toISOString()
      });
    }
    
    // Obtener todas las conexiones (tanto temporales como permanentes)
    const connections = await Credentials.findAll({
      order: [['created_at', 'DESC']],
      raw: false // Asegurar que retornamos instancias de Sequelize
    });

    logger.info(`Found ${connections.length} connections`);

    // Formatear las conexiones para el frontend
    const formattedConnections = connections.map(conn => {
      try {
        // Usar get() para obtener valores de Sequelize de forma segura
        const connData = conn.get ? conn.get({ plain: true }) : conn;
        
        return {
          id: connData.id || null,
          party_id: connData.party_id || null,
          country_code: connData.country_code || null,
          url: connData.url || null,
          token: connData.token || null, // Campo requerido por el frontend
          last_updated: connData.last_updated || connData.updated_at || null, // Usar updated_at como fallback
          valid: connData.valid !== undefined ? Boolean(connData.valid) : true,
          temp: connData.temp !== undefined ? Boolean(connData.temp) : false,
          created_at: connData.created_at || null,
          updated_at: connData.updated_at || null
        };
      } catch (mapError) {
        logger.error('Error formatting connection:', mapError);
        // Retornar objeto mínimo si hay error al formatear
        return {
          id: conn.id || null,
          party_id: null,
          country_code: null,
          url: null,
          token: null,
          last_updated: null,
          valid: false,
          temp: false,
          created_at: null,
          updated_at: null
        };
      }
    });

    res.status(200).json({
      status_code: 1000,
      data: formattedConnections,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error loading connections:', error);
    logger.error('Error name:', error.name);
    logger.error('Error message:', error.message);
    if (error.stack) {
      logger.error('Error stack:', error.stack);
    }
    
    // Proporcionar más información sobre el error si es un error de base de datos
    let errorMessage = 'Internal server error';
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeConnectionError') {
      errorMessage = `Database error: ${error.message}`;
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = `Validation error: ${error.message}`;
    }
    
    res.status(500).json({
      status_code: 2000,
      status_message: errorMessage,
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
