const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Almacenar logs de recarga en memoria
let chargingLogs = [];

// POST /api/charging-logs - Enviar log a la consola de recarga
router.post('/', async (req, res) => {
    try {
        const { message, type = 'info', sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'Message is required',
                timestamp: new Date().toISOString()
            });
        }

        // Agregar timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString('es-ES', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 3
        });

        const logEntry = {
            id: Date.now() + Math.random(),
            timestamp,
            message,
            type,
            sessionId,
            createdAt: now
        };

        // Agregar a la lista de logs
        chargingLogs.push(logEntry);

        // Mantener solo los últimos 100 logs para evitar memoria excesiva
        if (chargingLogs.length > 100) {
            chargingLogs = chargingLogs.slice(-100);
        }

        logger.info(`📝 Charging log added: ${message}`, { type, sessionId });

        res.status(200).json({
            status_code: 1000,
            status_message: 'Log added successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('❌ Error adding charging log:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/charging-logs - Obtener logs de recarga
router.get('/', async (req, res) => {
    try {
        const { sessionId, limit = 50 } = req.query;
        
        let filteredLogs = chargingLogs;
        
        if (sessionId) {
            filteredLogs = chargingLogs.filter(log => 
                log.sessionId === sessionId || 
                (log.sessionId && log.sessionId.includes(sessionId))
            );
        }

        // Limitar resultados
        const limitedLogs = filteredLogs.slice(-parseInt(limit));

        res.status(200).json({
            status_code: 1000,
            data: limitedLogs,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('❌ Error fetching charging logs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE /api/charging-logs - Limpiar logs
router.delete('/', async (req, res) => {
    try {
        chargingLogs = [];
        
        res.status(200).json({
            status_code: 1000,
            status_message: 'Logs cleared successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('❌ Error clearing charging logs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;

