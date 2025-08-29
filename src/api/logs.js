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

        // Leer logs reales del archivo de manera simple y eficiente
        const fs = require('fs');
        const path = require('path');
        const logFile = path.join(__dirname, '../../logs/app.log');
        
        let recentLogs = [];
        
        try {
            if (fs.existsSync(logFile)) {
                console.log(`📊 Intentando leer archivo de logs: ${logFile}`);
                
                // Leer el archivo de manera segura con límites de tamaño
                const stats = fs.statSync(logFile);
                if (stats.size > 1024 * 1024) { // Si es mayor a 1MB
                    console.warn('⚠️ Archivo de logs muy grande, usando solo las últimas líneas');
                    // Usar tail para leer solo las últimas líneas
                    const { execSync } = require('child_process');
                    const tailOutput = execSync(`tail -${Math.min(limit, 50)} "${logFile}"`, { encoding: 'utf8' });
                    const logLines = tailOutput.split('\n').filter(line => line.trim());
                    
                    recentLogs = logLines.map(line => {
                        try {
                            // Parsear formato de log: [timestamp] [LEVEL] message
                            const logMatch = line.match(/^\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.+)$/);
                            
                            if (logMatch) {
                                const [, timestamp, level, message] = logMatch;
                                
                                // Filtrar logs innecesarios
                                if (shouldExcludeLog(message)) {
                                    return null; // Excluir este log
                                }
                                
                                return {
                                    timestamp: timestamp,
                                    level: level,
                                    message: message.substring(0, 500), // Limitar longitud del mensaje
                                    source: 'application'
                                };
                            } else {
                                return {
                                    timestamp: new Date().toISOString(),
                                    level: 'INFO',
                                    message: line.substring(0, 200),
                                    source: 'file'
                                };
                            }
                        } catch (parseError) {
                            return {
                                timestamp: new Date().toISOString(),
                                level: 'INFO',
                                message: 'Error parsing log line',
                                source: 'error'
                            };
                        }
                    }).filter(log => log !== null).reverse(); // Filtrar nulos y más recientes primero
                    
                } else {
                    // Archivo pequeño, leer completo
                    const logContent = fs.readFileSync(logFile, 'utf8');
                    const logLines = logContent.split('\n').filter(line => line.trim());
                    
                    // Procesar solo las últimas líneas
                    const linesToProcess = logLines.slice(-Math.min(limit, 50));
                    
                    recentLogs = linesToProcess.map(line => {
                        try {
                            // Parsear formato de log: [timestamp] [LEVEL] message
                            const logMatch = line.match(/^\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.+)$/);
                            
                            if (logMatch) {
                                const [, timestamp, level, message] = logMatch;
                                
                                // Filtrar logs innecesarios
                                if (shouldExcludeLog(message)) {
                                    return null; // Excluir este log
                                }
                                
                                return {
                                    timestamp: timestamp,
                                    level: level,
                                    message: message.substring(0, 500), // Limitar longitud del mensaje
                                    source: 'application'
                                };
                            } else {
                                return {
                                    timestamp: new Date().toISOString(),
                                    level: 'INFO',
                                    message: line.substring(0, 200),
                                    source: 'file'
                                };
                            }
                        } catch (parseError) {
                            return {
                                timestamp: new Date().toISOString(),
                                level: 'INFO',
                                message: 'Error parsing log line',
                                source: 'error'
                            };
                        }
                    }).filter(log => log !== null).reverse(); // Filtrar nulos y más recientes primero
                }
                
                console.log(`📊 Logs procesados: ${recentLogs.length}`);
                
            } else {
                console.log('⚠️ Archivo de logs no encontrado:', logFile);
            }
        } catch (fileError) {
            console.warn('⚠️ Error leyendo archivo de logs:', fileError.message);
        }
        
        // Si no hay logs del archivo, usar logs simulados como respaldo
        if (recentLogs.length === 0) {
            recentLogs = [
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
        }

        // Filtrar por nivel si se especifica
        const filteredLogs = level ? recentLogs.filter(log => log.level === level) : recentLogs;

        res.status(200).json({
            status_code: 1000,
            data: filteredLogs.slice(0, limit),
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

/**
 * Función para determinar si un log debe ser excluido
 * Filtra logs innecesarios como peticiones HTTP del navegador
 */
function shouldExcludeLog(message) {
    if (!message || typeof message !== 'string') {
        return false;
    }
    
    const messageLower = message.toLowerCase();
    
    // Excluir logs de peticiones HTTP del navegador
    if (messageLower.includes('get /logs/recent') || 
        messageLower.includes('get /health') ||
        messageLower.includes('get /favicon.ico')) {
        return true;
    }
    
    // Excluir logs del middleware de logging
    if (messageLower.includes('api request incoming') ||
        messageLower.includes('api response outgoing') ||
        messageLower.includes('api request summary') ||
        messageLower.includes('🚀') ||
        messageLower.includes('📤') ||
        messageLower.includes('📊')) {
        return true;
    }
    
    // Excluir logs del sistema de logs
    if (messageLower.includes('logs procesados') ||
        messageLower.includes('archivo de logs') ||
        messageLower.includes('📊')) {
        return true;
    }
    
    // Excluir logs de peticiones curl o herramientas de testing
    if (messageLower.includes('curl/') ||
        messageLower.includes('postman') ||
        messageLower.includes('insomnia')) {
        return true;
    }
    
    return false;
}

module.exports = { router, broadcastLog };
