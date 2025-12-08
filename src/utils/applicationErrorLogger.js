const { ApplicationError } = require('../models');

const {
  buildBasicErrorData,
  buildErrorBodyData,
  buildErrorHeadersData,
  buildAdditionalErrorData
} = require('./applicationErrorLogger/errorDataHelpers');
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
async function logApplicationError(params) {
  try {
    const basicData = buildBasicErrorData(params);
    const bodyData = buildErrorBodyData(params.request_body, params.response_body);
    const headersData = buildErrorHeadersData(params.request_headers, params.response_headers);
    const additionalData = buildAdditionalErrorData(params.ip_address, params.user_agent);

    await ApplicationError.create({
      ...basicData,
      ...bodyData,
      ...headersData,
      ...additionalData
    });
  } catch (error) {
    logger.error('Failed to log application error to database:', error);
  }
}

module.exports = {
  logApplicationError
};

