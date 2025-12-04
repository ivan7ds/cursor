const path = require('path');

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');

// Create winston logger with rotation
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
      return `[${timestamp}] [${level}] ${message}${metaStr}`;
    })
  ),
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Daily rotate file transport
    new DailyRotateFile({
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',        // Rotate when file reaches 10MB
      maxFiles: '7d',        // Keep logs for 7 days
      zippedArchive: true    // Compress old logs
    })
  ]
});

// Add specialized logging methods
logger.request = (req, res, responseTime) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    responseTime: `${responseTime}ms`,
    statusCode: res.statusCode
  });
};

logger.database = (operation, table, duration, meta = {}) => {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: `${duration}ms`,
    ...meta
  });
};

logger.ocpi = (endpoint, operation, meta = {}) => {
  logger.info('OCPI Operation', {
    endpoint,
    operation,
    ...meta
  });
};

// In-memory log storage for real-time viewing
const inMemoryLogs = [];
const MAX_MEMORY_LOGS = 1000; // Keep last 1000 logs in memory

// Override the winston logger methods to capture logs in memory
const originalInfo = logger.info;
const originalWarn = logger.warn;
const originalError = logger.error;
const originalDebug = logger.debug;

function addToMemory(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: typeof message === 'string' ? message : JSON.stringify(message),
    source: 'application',
    meta
  };
  
  
  inMemoryLogs.push(logEntry);
  
  // Keep only the last MAX_MEMORY_LOGS
  if (inMemoryLogs.length > MAX_MEMORY_LOGS) {
    inMemoryLogs.shift();
  }
  
  // Broadcast to connected clients
  if (global.broadcastLogFunction) {
    try {
      global.broadcastLogFunction(logEntry);
    } catch (error) {
      // Ignore if broadcast function not available
    }
  }
}

// Override logger methods
logger.info = (message, meta) => {
  addToMemory('INFO', message, meta);
  return originalInfo.call(logger, message, meta);
};

logger.warn = (message, meta) => {
  addToMemory('WARN', message, meta);
  return originalWarn.call(logger, message, meta);
};

logger.error = (message, meta) => {
  addToMemory('ERROR', message, meta);
  return originalError.call(logger, message, meta);
};

logger.debug = (message, meta) => {
  addToMemory('DEBUG', message, meta);
  return originalDebug.call(logger, message, meta);
};

// Sistema de logs en tiempo real iniciado correctamente

// Export function to get in-memory logs
logger.getInMemoryLogs = (limit = 100, level = null) => {
  let logs = [...inMemoryLogs];
  
  if (level) {
    logs = logs.filter(log => log.level === level);
  }
  
  return logs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

module.exports = logger;


