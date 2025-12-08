const Joi = require('joi');

const { ciString } = require('../../utils/ocpiValidators');

const { urlSchema } = require('./schemas');

/**
 * UNLOCK_CONNECTOR command body validator
 *
 * Required fields:
 * - response_url: URL for CommandResult POST
 * - location_id: Location.id where connector is located
 * - evse_uid: EVSE.uid of the EVSE to unlock
 * - connector_id: Connector.id to unlock
 */
const unlockConnectorSchema = Joi.object({
  response_url: urlSchema,

  location_id: ciString(36).required()
    .messages({
      'any.required': 'location_id is required',
      'string.max': 'location_id must be at most 36 characters'
    }),

  evse_uid: ciString(36).required()
    .messages({
      'any.required': 'evse_uid is required',
      'string.max': 'evse_uid must be at most 36 characters'
    }),

  connector_id: ciString(36).required()
    .messages({
      'any.required': 'connector_id is required',
      'string.max': 'connector_id must be at most 36 characters'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Validates UNLOCK_CONNECTOR command request
 * @param {Object} body - Request body
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateUnlockConnector(body) {
  const validation = unlockConnectorSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (validation.error) {
    return {
      valid: false,
      errors: validation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: validation.value
  };
}

/**
 * Express middleware for UNLOCK_CONNECTOR validation
 */
function validateUnlockConnectorMiddleware(req, res, next) {
  const validation = validateUnlockConnector(req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ UNLOCK_CONNECTOR validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid UNLOCK_CONNECTOR command: ${errorMessage}`,
      data: {
        result: 'REJECTED',
        timeout: 0
      },
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedCommand = validation.value;
  next();
}

module.exports = {
    unlockConnectorSchema,
    validateUnlockConnector,
    validateUnlockConnectorMiddleware
};

