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
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import OCPI routes
const credentialsRoutes = require('./api/credentials');
const locationsRoutes = require('./api/locations');
const evsesRoutes = require('./api/evses');
const sessionsRoutes = require('./api/sessions');
const cdrsRoutes = require('./api/cdrs');
const tariffsRoutes = require('./api/tariffs');
const tokensRoutes = require('./api/tokens');

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
app.use('/ocpi/2.2/credentials', credentialsRoutes);
app.use('/ocpi/2.2/locations', locationsRoutes);
app.use('/ocpi/2.2/evses', evsesRoutes);
app.use('/ocpi/2.2/sessions', sessionsRoutes);
app.use('/ocpi/2.2/cdrs', cdrsRoutes);
app.use('/ocpi/2.2/tariffs', tariffsRoutes);
app.use('/ocpi/2.2/tokens', tokensRoutes);

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
    
    // Sync database models
    await sequelize.sync({ alter: true });
    logger.info('Database models synchronized');
    
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
    logger.error('Failed to start server:', error);
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
