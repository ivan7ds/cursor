const { ApplicationError } = require('../models');
const logger = require('./logger');

/**
 * Logs an application error to the database
 * @param {Object} params - Parameters for logging
 * @param {string} params.error_type - Type of error (API_REQUEST, API_RESPONSE, SERVER_ERROR, etc.)
 * @param {string} params.direction - Direction: INBOUND (request received) or OUTBOUND (request sent)
 * @param {string} params.endpoint - API endpoint URL
 * @param {string} params.method - HTTP method
 * @param {number} params.status_code - HTTP status code
 * @param {string} params.error_message - Error message
 * @param {string} params.error_stack - Error stack trace (optional)
 * @param {Object} params.request_body - Request body (optional)
 * @param {Object} params.response_body - Response body (optional)
 * @param {Object} params.request_headers - Request headers (optional)
 * @param {Object} params.response_headers - Response headers (optional)
 * @param {string} params.ip_address - IP address (optional)
 * @param {string} params.user_agent - User agent string (optional)
 */
async function logApplicationError({
  error_type,
  direction,
  endpoint,
  method,
  status_code,
  error_message,
  error_stack,
  request_body,
  response_body,
  request_headers,
  response_headers,
  ip_address,
  user_agent
}) {
  try {
    await ApplicationError.create({
      error_type: error_type || 'UNKNOWN',
      direction: direction || 'INBOUND',
      endpoint: endpoint || null,
      method: method || null,
      status_code: status_code || null,
      error_message: error_message || 'Unknown error',
      error_stack: error_stack || null,
      request_body: request_body ? (typeof request_body === 'string' ? request_body : JSON.stringify(request_body)) : null,
      response_body: response_body ? (typeof response_body === 'string' ? response_body : JSON.stringify(response_body)) : null,
      request_headers: request_headers || null,
      response_headers: response_headers || null,
      ip_address: ip_address || null,
      user_agent: user_agent || null,
      timestamp: new Date()
    });
  } catch (error) {
    // Don't throw error if logging fails, just log it
    logger.error('Failed to log application error to database:', error);
  }
}

module.exports = {
  logApplicationError
};

