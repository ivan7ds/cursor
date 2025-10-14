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
    },
    testLocationEVSECreationService: {
        status: 'active',
        lastRun: null,
        errorCount: 0
    },
    testSessionService: {
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

/**
 * Obtiene el estado en tiempo real de un servicio dado
 * @param {*} serviceInstance Instancia del servicio requerida dinámicamente
 * @param {string} inactiveStatus Etiqueta a usar cuando el servicio no está activo
 * @returns {{status: string, metadata?: object}}
 */
const getRuntimeServiceStatus = (serviceInstance, inactiveStatus = 'inactive') => {
    if (!serviceInstance) {
        return { status: inactiveStatus };
    }

    try {
        let isRunning;

        if (typeof serviceInstance.getStatus === 'function') {
            const runtimeStatus = serviceInstance.getStatus() || {};
            if (Object.prototype.hasOwnProperty.call(runtimeStatus, 'isRunning')) {
                isRunning = runtimeStatus.isRunning;
                return {
                    status: isRunning ? 'active' : inactiveStatus,
                    metadata: runtimeStatus
                };
            }
        }

        if (Object.prototype.hasOwnProperty.call(serviceInstance, 'isRunning')) {
            isRunning = serviceInstance.isRunning;
            return { status: isRunning ? 'active' : inactiveStatus };
        }

        return { status: inactiveStatus };
    } catch (error) {
        logger.warn(`⚠️ No se pudo determinar el estado del servicio dinámicamente: ${error.message}`);
        return { status: inactiveStatus };
    }
};

const SERVICE_RESOLVERS = {
    evseNotificationService: () => require('../services/evseNotificationService'),
    chargingNotificationService: () => require('../services/chargingNotificationService'),
    emspLocationsSyncService: () => require('../services/emspLocationsSyncService'),
    emspTariffsSyncService: () => require('../services/emspTariffsSyncService'),
    emspTokensSyncService: () => require('../services/emspTokensSyncService'),
    testLocationEVSECreationService: () => require('../services/testLocationEVSECreationService'),
    testSessionService: () => require('../services/testSessionService')
};

/**
 * Map que describe cómo ejecutar y controlar cada servicio individualmente
 */
const SERVICE_EXECUTOR_CONFIG = {
    evseNotificationService: {
        label: 'EVSE Notification Service',
        inactiveStatus: 'paused',
        run: async () => {
            const service = SERVICE_RESOLVERS.evseNotificationService();
            await service.processNotifications();
        },
        start: async () => {
            const service = SERVICE_RESOLVERS.evseNotificationService();
            await Promise.resolve(service.start());
        },
        stop: async () => {
            const service = SERVICE_RESOLVERS.evseNotificationService();
            await Promise.resolve(service.stop());
        }
    },
    chargingNotificationService: {
        label: 'Charging Notification Service',
        inactiveStatus: 'inactive',
        run: async () => {
            const service = SERVICE_RESOLVERS.chargingNotificationService();
            await service.processActiveSessions();
        },
        start: async () => {
            const service = SERVICE_RESOLVERS.chargingNotificationService();
            await Promise.resolve(service.start());
        },
        stop: async () => {
            const service = SERVICE_RESOLVERS.chargingNotificationService();
            await Promise.resolve(service.stop());
        }
    },
    emspLocationsSyncService: {
        label: 'EMSP Locations Sync Service',
        inactiveStatus: 'inactive',
        run: async () => {
            const service = SERVICE_RESOLVERS.emspLocationsSyncService();
            await service.syncEMSPLocations();
        },
        start: async () => {
            const service = SERVICE_RESOLVERS.emspLocationsSyncService();
            await Promise.resolve(service.start());
        },
        stop: async () => {
            const service = SERVICE_RESOLVERS.emspLocationsSyncService();
            await Promise.resolve(service.stop());
        }
    },
    emspTariffsSyncService: {
        label: 'EMSP Tariffs Sync Service',
        inactiveStatus: 'inactive',
        run: async () => {
            const service = SERVICE_RESOLVERS.emspTariffsSyncService();
            await service.syncEMSPTariffs();
        },
        start: async () => {
            const service = SERVICE_RESOLVERS.emspTariffsSyncService();
            await Promise.resolve(service.start());
        },
        stop: async () => {
            const service = SERVICE_RESOLVERS.emspTariffsSyncService();
            await Promise.resolve(service.stop());
        }
    },
    emspTokensSyncService: {
        label: 'EMSP Tokens Sync Service',
        inactiveStatus: 'inactive',
        run: async () => {
            const service = SERVICE_RESOLVERS.emspTokensSyncService();
            await service.syncEMSPTokens();
        },
        start: async () => {
            const service = SERVICE_RESOLVERS.emspTokensSyncService();
            await Promise.resolve(service.start());
        },
        stop: async () => {
            const service = SERVICE_RESOLVERS.emspTokensSyncService();
            await Promise.resolve(service.stop());
        }
    },
    testLocationEVSECreationService: {
        label: 'Test Location EVSE Creation Service',
        inactiveStatus: 'paused',
        run: async () => {
            const service = SERVICE_RESOLVERS.testLocationEVSECreationService();
            await service.runTest();
        },
        start: async () => {
            const service = SERVICE_RESOLVERS.testLocationEVSECreationService();
            await Promise.resolve(service.start());
        },
        stop: async () => {
            const service = SERVICE_RESOLVERS.testLocationEVSECreationService();
            await Promise.resolve(service.stop());
        }
    },
    testSessionService: {
        label: 'Test Session Service',
        inactiveStatus: 'paused',
        run: async () => {
            const service = SERVICE_RESOLVERS.testSessionService();
            await service.runSessionTest();
        },
        start: async () => {
            const service = SERVICE_RESOLVERS.testSessionService();
            await Promise.resolve(service.start());
        },
        stop: async () => {
            const service = SERVICE_RESOLVERS.testSessionService();
            await Promise.resolve(service.stop());
        }
    }
};

/**
 * Construye un snapshot del estado de los servicios combinando los datos almacenados con el estado runtime real
 */
const buildServicesStatusSnapshot = () => {
    const servicesSnapshot = {};

    // Copiar estado almacenado
    Object.entries(serviceStatus).forEach(([serviceKey, statusValue]) => {
        servicesSnapshot[serviceKey] = { ...statusValue };
    });

    // Mezclar con estado runtime real
    Object.entries(SERVICE_EXECUTOR_CONFIG).forEach(([serviceKey, config]) => {
        const resolver = SERVICE_RESOLVERS[serviceKey];
        if (!resolver) {
            return;
        }

        const serviceInstance = resolver();
        const runtimeStatus = getRuntimeServiceStatus(serviceInstance, config.inactiveStatus);

        servicesSnapshot[serviceKey] = {
            ...(servicesSnapshot[serviceKey] || {}),
            status: runtimeStatus.status
        };
    });

    return servicesSnapshot;
};

/**
 * Ejecuta una tarea de servicio individual y devuelve la información de resultado
 * @param {string} serviceKey
 */
const executeServiceJobOnce = async (serviceKey) => {
    const config = SERVICE_EXECUTOR_CONFIG[serviceKey];
    if (!config) {
        const error = new Error(`Servicio no soportado: ${serviceKey}`);
        error.statusCode = 400;
        throw error;
    }

    logger.info(`▶️ Ejecutando job manual: ${config.label}`);
    await config.run();
    logger.info(`✅ Job manual completado: ${config.label}`);

    const servicesSnapshot = buildServicesStatusSnapshot();
    return {
        jobName: config.label,
        services: servicesSnapshot
    };
};

/**
 * Alterna la ejecución continua de un servicio (start/stop)
 * @param {string} serviceKey
 */
const toggleServiceExecution = async (serviceKey) => {
    const config = SERVICE_EXECUTOR_CONFIG[serviceKey];
    if (!config) {
        const error = new Error(`Servicio no soportado: ${serviceKey}`);
        error.statusCode = 400;
        throw error;
    }

    const resolver = SERVICE_RESOLVERS[serviceKey];
    if (!resolver) {
        const error = new Error(`Resolver no definido para el servicio: ${serviceKey}`);
        error.statusCode = 500;
        throw error;
    }

    const serviceInstance = resolver();
    const runtimeStatus = getRuntimeServiceStatus(serviceInstance, config.inactiveStatus);
    const isCurrentlyActive = runtimeStatus.status === 'active';

    if (!serviceStatus[serviceKey]) {
        serviceStatus[serviceKey] = {
            status: config.inactiveStatus,
            lastRun: null,
            errorCount: 0
        };
    }

    let isActiveAfterToggle;
    let message;

    if (isCurrentlyActive) {
        await config.stop();
        serviceStatus[serviceKey].status = config.inactiveStatus;
        message = `${config.label} desactivado`;
        isActiveAfterToggle = false;
    } else {
        await config.start();
        serviceStatus[serviceKey].status = 'active';
        message = `${config.label} activado`;
        isActiveAfterToggle = true;
    }

    const servicesSnapshot = buildServicesStatusSnapshot();

    return {
        isActive: isActiveAfterToggle,
        status: servicesSnapshot[serviceKey]?.status || serviceStatus[serviceKey].status,
        message,
        services: servicesSnapshot
    };
};

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
        const servicesSnapshot = buildServicesStatusSnapshot();
        
        res.json({
            success: true,
            data: {
                services: servicesSnapshot,
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
        serviceStatus.testLocationEVSECreationService.errorCount = 0;
        serviceStatus.testSessionService.errorCount = 0;
        
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
 * POST /api/test-monitoring/run-job
 * Ejecuta manualmente un servicio específico
 */
router.post('/run-job', async (req, res) => {
    try {
        const { service } = req.body || {};

        if (!service) {
            return res.status(400).json({
                success: false,
                error: 'Parámetro "service" requerido'
            });
        }

        const result = await executeServiceJobOnce(service);

        res.json({
            success: true,
            data: {
                service,
                jobName: result.jobName,
                services: result.services,
                lastUpdated: new Date().toISOString()
            },
            message: `${result.jobName} ejecutado manualmente`
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        logger.error('❌ Error ejecutando job manual:', error);
        res.status(statusCode).json({
            success: false,
            error: 'Error ejecutando job manual',
            message: error.message
        });
    }
});

/**
 * POST /api/test-monitoring/toggle-service
 * Activa o desactiva un servicio específico
 */
router.post('/toggle-service', async (req, res) => {
    try {
        const { service } = req.body || {};

        if (!service) {
            return res.status(400).json({
                success: false,
                error: 'Parámetro "service" requerido'
            });
        }

        const result = await toggleServiceExecution(service);

        res.json({
            success: true,
            data: {
                service,
                isActive: result.isActive,
                status: result.status,
                services: result.services,
                lastUpdated: new Date().toISOString()
            },
            message: result.message
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        logger.error('❌ Error toggling service:', error);
        res.status(statusCode).json({
            success: false,
            error: 'Error alternando servicio',
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
            } else if (service === 'Test Location EVSE Creation Service') {
                serviceStatus.testLocationEVSECreationService.errorCount++;
            } else if (service === 'Test Session Service') {
                serviceStatus.testSessionService.errorCount++;
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
            } else if (service === 'Test Location EVSE Creation Service') {
                serviceStatus.testLocationEVSECreationService.lastRun = now;
                logger.info(`✅ Test Location EVSE Creation Service ejecutado: ${message}`);
            } else if (service === 'Test Session Service') {
                serviceStatus.testSessionService.lastRun = now;
                logger.info(`✅ Test Session Service ejecutado: ${message}`);
            }
}

/**
 * POST /api/test-monitoring/toggle-evse-service
 * Activa o desactiva el EVSE Notification Service individualmente
 */
router.post('/toggle-evse-service', async (req, res) => {
    try {
        const result = await toggleServiceExecution('evseNotificationService');

        res.json({
            success: true,
            data: {
                evseServiceActive: result.isActive,
                status: result.status,
                services: result.services,
                lastUpdated: new Date().toISOString()
            },
            message: result.message
        });
    } catch (error) {
        logger.error('❌ Error toggling EVSE service:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

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
                const testLocationEVSECreationService = require('../services/testLocationEVSECreationService');
                const testSessionService = require('../services/testSessionService');
        
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
                testLocationEVSECreationService.stop();
                testSessionService.stop();
            
            // Actualizar estado en serviceStatus
            serviceStatus.evseNotificationService.status = 'paused';
            serviceStatus.chargingNotificationService.status = 'paused';
            serviceStatus.emspLocationsSyncService.status = 'paused';
            serviceStatus.emspTariffsSyncService.status = 'paused';
            serviceStatus.emspTokensSyncService.status = 'paused';
                serviceStatus.testLocationEVSECreationService.status = 'paused';
                serviceStatus.testSessionService.status = 'paused';
            
            logger.info('✅ Todos los jobs pausados');
            
            res.json({
                success: true,
                data: {
                    jobsActive: false,
                    message: 'Todos los jobs han sido pausados'
                }
            });
        } else {
            // Activar todos los jobs EXCEPTO el Charging Notification Service
            // (que se activa automáticamente cuando hay sesiones activas)
            logger.info('▶️ Activando todos los jobs...');
            evseNotificationService.start();
            emspLocationsSyncService.start();
            emspTariffsSyncService.start();
            emspTokensSyncService.start();
            testLocationEVSECreationService.start();
            testSessionService.start();
            
            // El Charging Notification Service se activa automáticamente
            // si hay sesiones activas
            const { startChargingNotificationServiceIfNeeded } = require('../server');
            await startChargingNotificationServiceIfNeeded();
            
            // Actualizar estado en serviceStatus
            serviceStatus.evseNotificationService.status = 'active';
            serviceStatus.chargingNotificationService.status = chargingNotificationService.isRunning ? 'active' : 'inactive';
            serviceStatus.emspLocationsSyncService.status = 'active';
            serviceStatus.emspTariffsSyncService.status = 'active';
            serviceStatus.emspTokensSyncService.status = 'active';
            serviceStatus.testLocationEVSECreationService.status = 'active';
            serviceStatus.testSessionService.status = 'active';
            
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
