const Joi = require('joi');

const { ciString } = require('../../utils/ocpiValidators');
const { tokenPutBodySchema } = require('../tokenValidators');

const { urlSchema } = require('./schemas');

/**
 * START_SESSION command body validator
 *
 * Required fields:
 * - response_url: URL for CommandResult POST
 * - token: Token object (authorized by eMSP)
 * - location_id: Location.id where session starts
 *
 * Optional fields:
 * - evse_uid: EVSE.uid of specific EVSE
 * - authorization_reference: Reference from eMSP authorization
 */
const startSessionSchema = Joi.object({
  response_url: urlSchema,

  token: tokenPutBodySchema.required()
    .messages({
      'any.required': 'token is required',
      'object.base': 'token must be a valid Token object'
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
 * Validates START_SESSION command request
 * @param {Object} body - Request body
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateStartSession(body) {
  const validation = startSessionSchema.validate(body, {
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
 * Express middleware for START_SESSION validation
 */
function validateStartSessionMiddleware(req, res, next) {
  const validation = validateStartSession(req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ START_SESSION validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid START_SESSION command: ${errorMessage}`,
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
    startSessionSchema,
    validateStartSession,
    validateStartSessionMiddleware
};

