const logger = require('../utils/logger');
const { logApplicationError } = require('../utils/applicationErrorLogger');

const errorHandler = async (err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Log application error to database
  await logApplicationError({
    error_type: err.name || 'SERVER_ERROR',
    direction: 'INBOUND',
    endpoint: req.originalUrl || req.url,
    method: req.method,
    status_code: err.statusCode || 500,
    error_message: err.message || 'Internal Server Error',
    error_stack: err.stack || null,
    request_body: req.body || null,
    request_headers: req.headers || null,
    ip_address: req.ip || req.connection?.remoteAddress || null,
    user_agent: req.get('user-agent') || null
  });

  // OCPI 2.2 specific error responses
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status_code: 2001,
      status_message: 'Invalid or missing parameters',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      status_code: 2001,
      status_message: 'Invalid data format',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status_code: 2002,
      status_message: 'Resource already exists',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      status_code: 2003,
      status_message: 'Referenced resource does not exist',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status_code: statusCode,
    status_message: message,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;




