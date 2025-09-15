const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Almacenamiento temporal de errores de jobs (en producción esto debería ser en base de datos)
let jobErrors = [];
let serviceStatus = {
    evseNotificationService: {
        status: 'active',
        lastRun: null,
        errorCount: 0
    },
    chargingNotificationService: {
        status: 'active',
        lastRun: null,
        errorCount: 0
    },
    emspLocationsSyncService: {
        status: 'active',
        lastRun: null,
        errorCount: 0
    },
    emspTariffsSyncService: {
        status: 'active',
        lastRun: null,
        errorCount: 0
    },
    emspTokensSyncService: {
        status: 'active',
        lastRun: null,
        errorCount: 0
    }
};

// Estadísticas de pruebas (datos reales)
let testStatistics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    runningTests: 0
};

// Historial de pruebas para estadísticas reales
let testHistory = [];

// Función para actualizar estadísticas basadas en datos reales
const updateTestStatistics = () => {
    // Calcular estadísticas reales basadas en el historial de pruebas
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Filtrar pruebas de las últimas 24 horas
    const recentTests = testHistory.filter(test => 
        new Date(test.timestamp) >= last24Hours
    );
    
    // Calcular estadísticas reales
    testStatistics.totalTests = recentTests.length;
    testStatistics.passedTests = recentTests.filter(test => test.status === 'passed').length;
    testStatistics.failedTests = recentTests.filter(test => test.status === 'failed').length;
    testStatistics.runningTests = recentTests.filter(test => test.status === 'running').length;
    
    logger.info(`📊 Estadísticas reales actualizadas: ${testStatistics.totalTests} total, ${testStatistics.passedTests} exitosas, ${testStatistics.failedTests} fallidas, ${testStatistics.runningTests} en ejecución`);
};

/**
 * GET /api/test-monitoring/status
 * Obtiene el estado de los servicios y jobs
 */
router.get('/status', async (req, res) => {
    try {
        logger.info('📊 Obteniendo estado de servicios de monitoreo');
        
        // Actualizar estadísticas dinámicamente
        updateTestStatistics();
        
        res.json({
            success: true,
            data: {
                services: serviceStatus,
                testStatistics: testStatistics,
                lastUpdated: new Date().toISOString()
            }
        });
        
    } catch (error) {
        logger.error('❌ Error obteniendo estado de servicios:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

/**
 * GET /api/test-monitoring/errors
 * Obtiene los errores recientes de los jobs
 */
router.get('/errors', async (req, res) => {
    try {
        logger.info('📋 Obteniendo errores de jobs');
        
        // Limitar a los últimos 50 errores
        const recentErrors = jobErrors.slice(0, 50);
        
        res.json({
            success: true,
            data: {
                errors: recentErrors,
                totalErrors: jobErrors.length
            }
        });
        
    } catch (error) {
        logger.error('❌ Error obteniendo errores de jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

/**
 * POST /api/test-monitoring/errors
 * Agrega un nuevo error al log
 */
router.post('/errors', async (req, res) => {
    try {
        const { service, message, level = 'error' } = req.body;
        
        if (!service || !message) {
            return res.status(400).json({
                success: false,
                error: 'Servicio y mensaje son requeridos'
            });
        }
        
        const errorEntry = {
            id: Date.now(),
            service,
            message,
            level,
            timestamp: new Date().toISOString()
        };
        
        // Agregar error al inicio del array
        jobErrors.unshift(errorEntry);
        
        // Actualizar contador de errores del servicio
        if (service === 'EVSE Notification Service') {
            serviceStatus.evseNotificationService.errorCount++;
        } else if (service === 'Charging Notification Service') {
            serviceStatus.chargingNotificationService.errorCount++;
        }
        
        logger.warn(`🚨 Error de job registrado: [${service}] ${message}`);
        
        res.json({
            success: true,
            data: errorEntry
        });
        
    } catch (error) {
        logger.error('❌ Error agregando error de job:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

/**
 * DELETE /api/test-monitoring/errors
 * Limpia todos los errores
 */
router.delete('/errors', async (req, res) => {
    try {
        logger.info('🧹 Limpiando errores de jobs');
        
        jobErrors = [];
        
        // Resetear contadores de errores
        serviceStatus.evseNotificationService.errorCount = 0;
        serviceStatus.chargingNotificationService.errorCount = 0;
        serviceStatus.emspLocationsSyncService.errorCount = 0;
        serviceStatus.emspTariffsSyncService.errorCount = 0;
        serviceStatus.emspTokensSyncService.errorCount = 0;
        
        res.json({
            success: true,
            message: 'Errores limpiados exitosamente'
        });
        
    } catch (error) {
        logger.error('❌ Error limpiando errores de jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

/**
 * GET /api/test-monitoring/test-history
 * Obtiene el historial de pruebas
 */
router.get('/test-history', async (req, res) => {
    try {
        const { limit = 50, status } = req.query;
        
        let filteredTests = testHistory;
        
        // Filtrar por estado si se especifica
        if (status) {
            filteredTests = testHistory.filter(test => test.status === status);
        }
        
        // Limitar resultados
        const limitedTests = filteredTests.slice(0, parseInt(limit));
        
        res.json({
            success: true,
            data: {
                tests: limitedTests,
                totalTests: testHistory.length,
                filteredTests: filteredTests.length
            }
        });
        
    } catch (error) {
        logger.error('❌ Error obteniendo historial de pruebas:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

/**
 * POST /api/test-monitoring/run-sample-tests
 * Ejecuta pruebas de ejemplo para demostrar el sistema
 */
router.post('/run-sample-tests', async (req, res) => {
    try {
        logger.info('🧪 Ejecutando pruebas de ejemplo');
        
        const sampleTests = [
            { testName: 'Test de conexión OCPI', status: 'passed', message: 'Conexión exitosa', duration: 1200 },
            { testName: 'Test de validación de tarifas', status: 'passed', message: 'Tarifas validadas correctamente', duration: 800 },
            { testName: 'Test de notificaciones EVSE', status: 'failed', message: 'Timeout en notificación', duration: 5000 },
            { testName: 'Test de base de datos', status: 'passed', message: 'Conexión a BD exitosa', duration: 300 },
            { testName: 'Test de API externa', status: 'running', message: 'Ejecutando...', duration: 0 }
        ];
        
        // Ejecutar pruebas de ejemplo
        for (const test of sampleTests) {
            const testEntry = {
                id: Date.now() + Math.random(),
                testName: test.testName,
                status: test.status,
                message: test.message,
                duration: test.duration,
                timestamp: new Date().toISOString()
            };
            
            testHistory.unshift(testEntry);
        }
        
        // Limitar historial
        if (testHistory.length > 1000) {
            testHistory = testHistory.slice(0, 1000);
        }
        
        // Actualizar estadísticas
        updateTestStatistics();
        
        res.json({
            success: true,
            message: 'Pruebas de ejemplo ejecutadas',
            data: {
                testsExecuted: sampleTests.length,
                currentStatistics: testStatistics
            }
        });
        
    } catch (error) {
        logger.error('❌ Error ejecutando pruebas de ejemplo:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

/**
 * POST /api/test-monitoring/test-result
 * Registra el resultado de una prueba
 */
router.post('/test-result', async (req, res) => {
    try {
        const { testName, status, message, duration } = req.body;
        
        if (!testName || !status) {
            return res.status(400).json({
                success: false,
                error: 'Nombre de prueba y estado son requeridos'
            });
        }
        
        // Crear entrada de prueba
        const testEntry = {
            id: Date.now(),
            testName,
            status,
            message,
            duration,
            timestamp: new Date().toISOString()
        };
        
        // Agregar al historial de pruebas
        testHistory.unshift(testEntry);
        
        // Limitar el historial a los últimos 1000 registros para evitar uso excesivo de memoria
        if (testHistory.length > 1000) {
            testHistory = testHistory.slice(0, 1000);
        }
        
        // Actualizar estadísticas reales
        updateTestStatistics();
        
        logger.info(`🧪 Resultado de prueba registrado: ${testName} - ${status}`);
        
        res.json({
            success: true,
            data: testEntry
        });
        
    } catch (error) {
        logger.error('❌ Error registrando resultado de prueba:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

/**
 * Función para registrar errores de jobs (llamada desde otros servicios)
 */
function logJobError(service, message, level = 'error') {
    const errorEntry = {
        id: Date.now(),
        service,
        message,
        level,
        timestamp: new Date().toISOString()
    };
    
    jobErrors.unshift(errorEntry);
    
    // Actualizar contador de errores del servicio
    if (service === 'EVSE Notification Service') {
        serviceStatus.evseNotificationService.errorCount++;
    } else if (service === 'Charging Notification Service') {
        serviceStatus.chargingNotificationService.errorCount++;
    } else if (service === 'EMSP Locations Sync Service') {
        serviceStatus.emspLocationsSyncService.errorCount++;
    } else if (service === 'EMSP Tariffs Sync Service') {
        serviceStatus.emspTariffsSyncService.errorCount++;
    } else if (service === 'EMSP Tokens Sync Service') {
        serviceStatus.emspTokensSyncService.errorCount++;
    }
    
    logger.warn(`🚨 Error de job registrado: [${service}] ${message}`);
}

/**
 * Función para registrar ejecución exitosa de jobs (llamada desde otros servicios)
 */
function logJobExecution(service, message = 'Job executed successfully') {
    const now = new Date().toISOString();
    
    // Actualizar timestamp de última ejecución del servicio
    if (service === 'EVSE Notification Service') {
        serviceStatus.evseNotificationService.lastRun = now;
        logger.info(`✅ EVSE Notification Service ejecutado: ${message}`);
    } else if (service === 'Charging Notification Service') {
        serviceStatus.chargingNotificationService.lastRun = now;
        logger.info(`✅ Charging Notification Service ejecutado: ${message}`);
    } else if (service === 'EMSP Locations Sync Service') {
        serviceStatus.emspLocationsSyncService.lastRun = now;
        logger.info(`✅ EMSP Locations Sync Service ejecutado: ${message}`);
    } else if (service === 'EMSP Tariffs Sync Service') {
        serviceStatus.emspTariffsSyncService.lastRun = now;
        logger.info(`✅ EMSP Tariffs Sync Service ejecutado: ${message}`);
    } else if (service === 'EMSP Tokens Sync Service') {
        serviceStatus.emspTokensSyncService.lastRun = now;
        logger.info(`✅ EMSP Tokens Sync Service ejecutado: ${message}`);
    }
}

/**
 * POST /api/test-monitoring/toggle-jobs
 * Activa o desactiva todos los jobs
 */
router.post('/toggle-jobs', async (req, res) => {
    try {
        logger.info('🔄 Toggle jobs request received');
        
        // Importar los servicios
        const evseNotificationService = require('../services/evseNotificationService');
        const chargingNotificationService = require('../services/chargingNotificationService');
        const emspLocationsSyncService = require('../services/emspLocationsSyncService');
        const emspTariffsSyncService = require('../services/emspTariffsSyncService');
        const emspTokensSyncService = require('../services/emspTokensSyncService');
        
        // Verificar el estado actual (usando el primer servicio como referencia)
        const currentStatus = evseNotificationService.getStatus();
        const jobsActive = currentStatus.isRunning;
        
        if (jobsActive) {
            // Pausar todos los jobs
            logger.info('⏸️ Pausando todos los jobs...');
            evseNotificationService.stop();
            chargingNotificationService.stop();
            emspLocationsSyncService.stop();
            emspTariffsSyncService.stop();
            emspTokensSyncService.stop();
            
            // Actualizar estado en serviceStatus
            serviceStatus.evseNotificationService.status = 'paused';
            serviceStatus.chargingNotificationService.status = 'paused';
            serviceStatus.emspLocationsSyncService.status = 'paused';
            serviceStatus.emspTariffsSyncService.status = 'paused';
            serviceStatus.emspTokensSyncService.status = 'paused';
            
            logger.info('✅ Todos los jobs pausados');
            
            res.json({
                success: true,
                data: {
                    jobsActive: false,
                    message: 'Todos los jobs han sido pausados'
                }
            });
        } else {
            // Activar todos los jobs
            logger.info('▶️ Activando todos los jobs...');
            evseNotificationService.start();
            chargingNotificationService.start();
            emspLocationsSyncService.start();
            emspTariffsSyncService.start();
            emspTokensSyncService.start();
            
            // Actualizar estado en serviceStatus
            serviceStatus.evseNotificationService.status = 'active';
            serviceStatus.chargingNotificationService.status = 'active';
            serviceStatus.emspLocationsSyncService.status = 'active';
            serviceStatus.emspTariffsSyncService.status = 'active';
            serviceStatus.emspTokensSyncService.status = 'active';
            
            logger.info('✅ Todos los jobs activados');
            
            res.json({
                success: true,
                data: {
                    jobsActive: true,
                    message: 'Todos los jobs han sido activados'
                }
            });
        }
        
    } catch (error) {
        logger.error('❌ Error toggling jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

module.exports = {
    router,
    logJobError,
    logJobExecution
};
