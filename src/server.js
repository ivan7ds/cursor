const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { sequelize } = require('./database/connection');
const { redisClient } = require('./database/redis');
const { Session } = require('./models');
const rateLimiter = require('./middleware/rateLimiter');
const { authMiddleware, optionalAuthMiddleware } = require('./middleware/auth');
const tempTokenAuth = require('./middleware/tempTokenAuth');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');

// Import EVSE Notification Service
const evseNotificationService = require('./services/evseNotificationService');
const chargingNotificationService = require('./services/chargingNotificationService');
const emspLocationsSyncService = require('./services/emspLocationsSyncService');
const emspTariffsSyncService = require('./services/emspTariffsSyncService');
const emspTokensSyncService = require('./services/emspTokensSyncService');
const testLocationEVSECreationService = require('./services/testLocationEVSECreationService');
const testSessionService = require('./services/testSessionService');

// Import OCPI routes
const credentialsRoutes = require('./api/credentials');
const locationsRoutes = require('./api/locations');
const evsesRoutes = require('./api/evses');
const sessionsRoutes = require('./api/sessions');
const cdrsRoutes = require('./api/cdrs');
const tariffsRoutes = require('./api/tariffs');
const tokensRoutes = require('./api/tokens');
const commandsRoutes = require('./api/commands');
const configRoutes = require('./api/config');
const versionsRoutes = require('./api/versions');
const detailsRoutes = require('./api/details');
const notificationsRoutes = require('./api/notifications');
const { router: logsRoutes } = require('./api/logs');
const emspRoutes = require('./api/emsp');
const emspSessionsRoutes = require('./api/emspSessions');
const emspLocationsRoutes = require('./api/emspLocations');
const emspTariffsRoutes = require('./api/emspTariffs');
const { router: emspActionsRoutes } = require('./api/emspActions');
const { router: testMonitoringRoutes } = require('./api/testMonitoring');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CPO OCPI 2.2 API',
      version: '1.0.0',
      description: 'API para gestión de CPO siguiendo el protocolo OCPI 2.2',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/api/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (detallado)
app.use(requestLogger);

// Exponer configuración mínima para el frontend (solo se entrega en la app interna)
app.get('/app-config.js', (req, res) => {
  const defaultToken = process.env.OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key';
  res.set('Content-Type', 'application/javascript');
  res.set('Cache-Control', 'no-store');
  res.send([
    `window.DEFAULT_OCPI_TOKEN = ${JSON.stringify(defaultToken)};`,
    'try {',
    "  if (!window.localStorage.getItem('ocpi_token')) {",
    '    window.localStorage.setItem(\'ocpi_token\', window.DEFAULT_OCPI_TOKEN);',
    '  }',
    '} catch (error) {',
    "  console.warn('Could not persist default OCPI token in localStorage:', error);",
    '}'
  ].join('\n'));
});

// Servir archivos estáticos del frontend
app.use(express.static('src/public'));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Test endpoint para verificar EMSP locations
app.get('/test-emsp-locations', (req, res) => {
  res.status(200).json({
    status_code: 1000,
    data: [
      {
        id: 'test-001',
        name: 'Test Location',
        emsp_party_id: 'TEST',
        country: process.env.OCPI_COUNTRY_CODE || 'ES',
        city: 'Test City',
        address: 'Test Address',
        evses: '[]',
        last_updated: new Date().toISOString()
      }
    ],
    timestamp: new Date().toISOString()
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// OCPI 2.2 Routes
app.use('/ocpi/versions', authMiddleware, versionsRoutes);
app.use('/ocpi/cpo/2.2/details', authMiddleware, detailsRoutes);
app.use('/ocpi/cpo/2.2/credentials', authMiddleware, credentialsRoutes);
app.use('/ocpi/cpo/2.2/locations', authMiddleware, locationsRoutes);
app.use('/ocpi/cpo/2.2/evses', authMiddleware, evsesRoutes);
app.use('/ocpi/cpo/2.2/sessions', authMiddleware, sessionsRoutes);
app.use('/ocpi/cpo/2.2/cdrs', authMiddleware, cdrsRoutes);
app.use('/ocpi/cpo/2.2/tariffs', authMiddleware, tariffsRoutes);
app.use('/ocpi/cpo/2.2/tokens', authMiddleware, tokensRoutes);
app.use('/ocpi/cpo/2.2/tokens', authMiddleware, require('./api/authorization'));
app.use('/ocpi/cpo/2.2/commands', authMiddleware, commandsRoutes);
app.use('/ocpi/cpo/2.2/notifications', authMiddleware, notificationsRoutes);

// API Routes
app.use('/api/sessions', authMiddleware, sessionsRoutes);
app.use('/api/ext-sessions', authMiddleware, require('./api/extSessions'));
app.use('/api/charging-logs', require('./api/chargingLogs'));
app.use('/api/handshake', authMiddleware, require('./api/handshake'));
app.use('/api/config', configRoutes);

  // ===== RUTAS DE MONITOREO DE TESTS =====
  // Estas rutas permiten monitorear el estado de los jobs y pruebas (SIN AUTENTICACIÓN)
  app.use('/api/test-monitoring', testMonitoringRoutes);

// Middleware para rutas específicas de API
app.use('/api', authMiddleware, require('./api/deleteConnection'));
app.use('/api/connections', authMiddleware, require('./api/connections'));

  // ===== RUTAS EMSP =====
  // Estas rutas permiten consultar información de eMSPs cuando actuamos como CPO
  app.use('/ocpi/emsp/2.2', emspRoutes);
  app.use('/ocpi/emsp/2.2/sessions', emspSessionsRoutes);
  app.use('/ocpi/emsp/2.2/locations', emspLocationsRoutes);
  app.use('/ocpi/emsp/2.2/tariffs', emspTariffsRoutes);
  
  // ===== RUTAS DE ACCIONES EMSP =====
  // Estas rutas permiten actuar como eMSP y guardar datos de CPOs externos
  app.use('/emsp/actions', emspActionsRoutes);
  
  app.use('/logs', logsRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

/**
 * Inicia el Charging Notification Service solo si hay sesiones activas
 */
async function startChargingNotificationServiceIfNeeded() {
  try {
    // Verificar si hay sesiones activas
    const activeSessions = await Session.count({
      where: { status: 'ACTIVE' }
    });

    if (activeSessions > 0) {
      chargingNotificationService.start();
      logger.info(`Charging Notification Service started - ${activeSessions} active sessions found`);
    } else {
      logger.info('Charging Notification Service not started - no active sessions');
    }
  } catch (error) {
    logger.error('Error checking active sessions:', error);
    // Por seguridad, iniciar el servicio de todas formas
    chargingNotificationService.start();
  }
}

/**
 * Activa el Charging Notification Service cuando se inicia una nueva sesión
 */
async function activateChargingNotificationService() {
  if (!chargingNotificationService.isRunning) {
    chargingNotificationService.start();
    logger.info('Charging Notification Service activated due to new active session');
  }
}

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync database models (create tables if they don't exist)
    // await sequelize.sync({ force: false });
    logger.info('Database models synchronized (skipping sync)');
    
    // OCPI routes are already loaded
    
    // Test Redis connection
    await redisClient.ping();
    logger.info('Redis connection established successfully');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`CPO OCPI 2.2 Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
    });
    
    // Solo iniciar el Charging Notification Service por defecto
    // Los demás jobs se activarán manualmente desde el frontend
    
    // Start Charging Notification Service (solo si hay sesiones activas)
    await startChargingNotificationServiceIfNeeded();
    logger.info('Charging Notification Service started conditionally');
    
    // Los demás servicios NO se inician automáticamente
    logger.info('Other services available for manual activation via frontend');
    
  } catch (error) {
    logger.error('Failed to start server:', error.message || error);
    logger.error('Error stack:', error.stack);
    logger.error('Full error object:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Solo detener servicios que estén activos
  if (evseNotificationService.isRunning) {
    logger.info('Stopping EVSE Notification Service');
    evseNotificationService.stop();
  }
  if (chargingNotificationService.isRunning) {
    logger.info('Stopping Charging Notification Service');
    chargingNotificationService.stop();
  }
  if (emspLocationsSyncService.isRunning) {
    logger.info('Stopping EMSP Locations Sync Service');
    emspLocationsSyncService.stop();
  }
  if (emspTariffsSyncService.isRunning) {
    logger.info('Stopping EMSP Tariffs Sync Service');
    emspTariffsSyncService.stop();
  }
  if (emspTokensSyncService.isRunning) {
    logger.info('Stopping EMSP Tokens Sync Service');
    emspTokensSyncService.stop();
  }
  if (testLocationEVSECreationService.isRunning) {
    logger.info('Stopping Test Location EVSE Creation Service');
    testLocationEVSECreationService.stop();
  }
  if (testSessionService.isRunning) {
    logger.info('Stopping Test Session Service');
    testSessionService.stop();
  }
  
  await sequelize.close();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  // Solo detener servicios que estén activos
  if (evseNotificationService.isRunning) {
    logger.info('Stopping EVSE Notification Service');
    evseNotificationService.stop();
  }
  if (chargingNotificationService.isRunning) {
    logger.info('Stopping Charging Notification Service');
    chargingNotificationService.stop();
  }
  if (emspLocationsSyncService.isRunning) {
    logger.info('Stopping EMSP Locations Sync Service');
    emspLocationsSyncService.stop();
  }
  if (emspTariffsSyncService.isRunning) {
    logger.info('Stopping EMSP Tariffs Sync Service');
    emspTariffsSyncService.stop();
  }
  if (emspTokensSyncService.isRunning) {
    logger.info('Stopping EMSP Tokens Sync Service');
    emspTokensSyncService.stop();
  }
  if (testLocationEVSECreationService.isRunning) {
    logger.info('Stopping Test Location EVSE Creation Service');
    testLocationEVSECreationService.stop();
  }
  if (testSessionService.isRunning) {
    logger.info('Stopping Test Session Service');
    testSessionService.stop();
  }
  
  await sequelize.close();
  await redisClient.quit();
  process.exit(0);
});

startServer();

// Exportar funciones para uso en otros módulos
module.exports = {
  activateChargingNotificationService,
  startChargingNotificationServiceIfNeeded
};
