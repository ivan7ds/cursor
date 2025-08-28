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
const rateLimiter = require('./middleware/rateLimiter');
const { authMiddleware, optionalAuthMiddleware } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');

// Import OCPI routes
const credentialsRoutes = require('./api/credentials');
const locationsRoutes = require('./api/locations');
const evsesRoutes = require('./api/evses');
const sessionsRoutes = require('./api/sessions');
const cdrsRoutes = require('./api/cdrs');
const tariffsRoutes = require('./api/tariffs');
const tokensRoutes = require('./api/tokens');
const versionsRoutes = require('./api/versions');
const detailsRoutes = require('./api/details');

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
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (detallado)
app.use(requestLogger);

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

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// OCPI 2.2 Routes
app.use('/ocpi/versions', versionsRoutes);
app.use('/ocpi/cpo/2.2/details', authMiddleware, detailsRoutes);
app.use('/ocpi/cpo/2.2/credentials', authMiddleware, credentialsRoutes);
app.use('/ocpi/cpo/2.2/locations', authMiddleware, locationsRoutes);
app.use('/ocpi/cpo/2.2/evses', authMiddleware, evsesRoutes);
app.use('/ocpi/cpo/2.2/sessions', authMiddleware, sessionsRoutes);
app.use('/ocpi/cpo/2.2/cdrs', authMiddleware, cdrsRoutes);
app.use('/ocpi/cpo/2.2/tariffs', authMiddleware, tariffsRoutes);
app.use('/ocpi/cpo/2.2/tokens', authMiddleware, tokensRoutes);

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
  await sequelize.close();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  await redisClient.quit();
  process.exit(0);
});

startServer();


