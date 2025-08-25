const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

// Format timestamp
function formatTimestamp() {
  return new Date().toISOString();
}

// Format log message
function formatMessage(level, message, meta = {}) {
  const timestamp = formatTimestamp();
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

// Write to log file
function writeToFile(level, message, meta = {}) {
  const logFile = path.join(logsDir, 'app.log');
  const formattedMessage = formatMessage(level, message, meta) + '\n';
  
  fs.appendFileSync(logFile, formattedMessage);
}

// Console output with colors
function consoleOutput(level, message, meta = {}) {
  const colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[35m', // Magenta
    RESET: '\x1b[0m'   // Reset
  };
  
  const formattedMessage = formatMessage(level, message, meta);
  console.log(`${colors[level]}${formattedMessage}${colors.RESET}`);
}

// Main logging function
function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] <= currentLogLevel) {
    // Console output
    consoleOutput(level, message, meta);
    
    // File output
    writeToFile(level, message, meta);
  }
}

// Logger object
const logger = {
  error: (message, meta = {}) => log('ERROR', message, meta),
  warn: (message, meta = {}) => log('WARN', message, meta),
  info: (message, meta = {}) => log('INFO', message, meta),
  debug: (message, meta = {}) => log('DEBUG', message, meta),
  
  // Specialized logging methods
  request: (req, res, responseTime) => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      responseTime: `${responseTime}ms`,
      statusCode: res.statusCode
    });
  },
  
  database: (operation, table, duration, meta = {}) => {
    logger.debug('Database Operation', {
      operation,
      table,
      duration: `${duration}ms`,
      ...meta
    });
  },
  
  ocpi: (endpoint, operation, meta = {}) => {
    logger.info('OCPI Operation', {
      endpoint,
      operation,
      ...meta
    });
  }
};

module.exports = logger;
