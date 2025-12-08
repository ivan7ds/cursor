const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const rateLimiter = require('../middleware/rateLimiter');
const requestLogger = require('../middleware/requestLogger');
const logger = require('../utils/logger');

/**
 * Configura todos los middlewares de Express
 */
function setupMiddleware(app) {
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
  app.use(requestLogger);
  app.use(express.static('src/public'));
  app.use(rateLimiter);
}

module.exports = {
    setupMiddleware
};

