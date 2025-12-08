const Joi = require('joi');

const { ciString, dateTime } = require('../../utils/ocpiValidators');
const { tokenPutBodySchema } = require('../tokenValidators');

const { urlSchema } = require('./schemas');

/**
 * RESERVE_NOW command body validator
 *
 * Required fields:
 * - response_url: URL for CommandResult POST
 * - token: Token object for reservation
 * - expiry_date: DateTime when reservation ends (UTC)
 * - reservation_id: Unique reservation identifier
 * - location_id: Location.id where to reserve
 *
 * Optional fields:
 * - evse_uid: EVSE.uid of specific EVSE
 * - authorization_reference: Reference from eMSP authorization
 */
const reserveNowSchema = Joi.object({
  response_url: urlSchema,

  token: tokenPutBodySchema.required()
    .messages({
      'any.required': 'token is required',
      'object.base': 'token must be a valid Token object'
    }),

  expiry_date: dateTime().required()
    .messages({
      'any.required': 'expiry_date is required'
    }),

  reservation_id: ciString(36).required()
    .messages({
      'any.required': 'reservation_id is required',
      'string.max': 'reservation_id must be at most 36 characters'
    }),

  location_id: ciString(36).required()
    .messages({
      'any.required': 'location_id is required',
      'string.max': 'location_id must be at most 36 characters'
    }),

  evse_uid: ciString(36).optional()
    .messages({
      'string.max': 'evse_uid must be at most 36 characters'
    }),

  authorization_reference: ciString(36).optional()
    .messages({
      'string.max': 'authorization_reference must be at most 36 characters'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Validates RESERVE_NOW command request
 * @param {Object} body - Request body
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateReserveNow(body) {
  const validation = reserveNowSchema.validate(body, {
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
 * Express middleware for RESERVE_NOW validation
 */
function validateReserveNowMiddleware(req, res, next) {
  const validation = validateReserveNow(req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ RESERVE_NOW validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid RESERVE_NOW command: ${errorMessage}`,
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
    reserveNowSchema,
    validateReserveNow,
    validateReserveNowMiddleware
};

