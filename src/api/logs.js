const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Almacenar las conexiones activas
const activeConnections = new Set();

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
    // Configurar headers para Server-Sent Events
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Enviar heartbeat cada 30 segundos para mantener la conexión
    const heartbeat = setInterval(() => {
        res.write('data: {"type": "heartbeat", "timestamp": "' + new Date().toISOString() + '"}\n\n');
    }, 30000);

    // Función para enviar logs a este cliente
    const sendLog = (logData) => {
        if (res.writableEnded) return;
        
        try {
            const eventData = JSON.stringify(logData);
            res.write(`data: ${eventData}\n\n`);
        } catch (error) {
            logger.error('Error sending log to client:', error);
        }
    };

    // Agregar esta conexión a las activas
    activeConnections.add(sendLog);

    // Enviar mensaje de conexión establecida
    res.write(`data: {"type": "connection", "message": "Conexión establecida", "timestamp": "${new Date().toISOString()}"}\n\n`);

    // Manejar desconexión del cliente
    req.on('close', () => {
        clearInterval(heartbeat);
        activeConnections.delete(sendLog);
        logger.info('Cliente desconectado del stream de logs');
    });

    req.on('error', (error) => {
        clearInterval(heartbeat);
        activeConnections.delete(sendLog);
        logger.error('Error en conexión del cliente:', error);
    });

    logger.info('Nuevo cliente conectado al stream de logs');
});

/**
 * Función para enviar logs a todos los clientes conectados
 * Esta función será llamada desde el logger
 */
function broadcastLog(logData) {
    const logEvent = {
        type: 'log',
        timestamp: new Date().toISOString(),
        level: logData.level || 'INFO',
        message: logData.message || logData,
        source: logData.source || 'system'
    };

    // Enviar a todas las conexiones activas
    activeConnections.forEach(sendLog => {
        try {
            sendLog(logEvent);
        } catch (error) {
            // Si hay error, remover la conexión
            activeConnections.delete(sendLog);
        }
    });

    // Limpiar conexiones muertas
    activeConnections.forEach(sendLog => {
        if (activeConnections.has(sendLog)) {
            try {
                sendLog({ type: 'ping' });
            } catch (error) {
                activeConnections.delete(sendLog);
            }
        }
    });
}

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

        // Por ahora retornamos logs simulados
        // En el futuro se pueden leer desde archivo o base de datos
        const recentLogs = [
            {
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: 'Dashboard accedido',
                source: 'web'
            },
            {
                timestamp: new Date(Date.now() - 5000).toISOString(),
                level: 'INFO',
                message: 'Streaming de logs iniciado',
                source: 'system'
            }
        ];

        // Filtrar por nivel si se especifica
        const filteredLogs = level ? recentLogs.filter(log => log.level === level) : recentLogs;

        res.status(200).json({
            status_code: 1000,
            data: filteredLogs.slice(0, limit),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Error getting recent logs:', error);
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
router.post('/clear', (req, res) => {
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

module.exports = { router, broadcastLog };
