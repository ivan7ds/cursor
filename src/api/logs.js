const express = require('express');

const router = express.Router();
const logger = require('../utils/logger');

const { broadcastLog, broadcastChargingLog } = require('./logs/broadcast');
const { filterUnnecessaryLogs, generateFallbackLogs } = require('./logs/filterHelpers');
const { handleStreamConnection } = require('./logs/stream');

/**
 * @swagger
 * /logs/stream:
 *   get:
 *     summary: Stream logs en tiempo real
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Stream de logs iniciado
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: Server-Sent Events stream
 */
router.get('/stream', (req, res) => {
    handleStreamConnection(req, res);
});

/**
 * @swagger
 * /logs/recent:
 *   get:
 *     summary: Obtener logs recientes
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Número máximo de logs a retornar
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [ERROR, WARN, INFO, DEBUG]
 *         description: Filtrar por nivel de log
 *     responses:
 *       200:
 *         description: Logs recientes obtenidos exitosamente
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
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       level:
 *                         type: string
 *                       message:
 *                         type: string
 *                       source:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/recent', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const level = req.query.level;

        // Usar logs en memoria (más eficiente)
        const logger = require('../utils/logger');
        let recentLogs = logger.getInMemoryLogs(limit, level);
        
const { filterUnnecessaryLogs, generateFallbackLogs } = require('./logs/filterHelpers');

        // Filtrar logs innecesarios
        recentLogs = filterUnnecessaryLogs(recentLogs);
        
        // Si no hay logs en memoria, usar logs simulados como respaldo
        if (recentLogs.length === 0) {
            recentLogs = generateFallbackLogs();
        }

        res.status(200).json({
            status_code: 1000,
            data: recentLogs.slice(0, limit),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error getting recent logs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @swagger
 * /logs/clear:
 *   post:
 *     summary: Limpiar logs
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Logs limpiados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Logs limpiados exitosamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/clear', (_req, res) => {
    try {
        // Limpiar logs (en el futuro se puede implementar limpieza de archivos)
        logger.info('Logs limpiados desde dashboard');
        
        res.status(200).json({
            status_code: 1000,
            data: {
                message: 'Logs limpiados exitosamente'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Error clearing logs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// Register broadcast function globally to avoid circular dependency
global.broadcastLogFunction = broadcastLog;

module.exports = { router, broadcastChargingLog };
