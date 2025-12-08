const Joi = require('joi');

const { ciString } = require('../../utils/ocpiValidators');

const { urlSchema } = require('./schemas');

/**
 * CANCEL_RESERVATION command body validator
 *
 * Required fields:
 * - response_url: URL for CommandResult POST
 * - reservation_id: Reservation.id to cancel
 */
const cancelReservationSchema = Joi.object({
  response_url: urlSchema,

  reservation_id: ciString(36).required()
    .messages({
      'any.required': 'reservation_id is required',
      'string.max': 'reservation_id must be at most 36 characters'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Validates CANCEL_RESERVATION command request
 * @param {Object} body - Request body
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateCancelReservation(body) {
  const validation = cancelReservationSchema.validate(body, {
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
 * Express middleware for CANCEL_RESERVATION validation
 */
function validateCancelReservationMiddleware(req, res, next) {
  const validation = validateCancelReservation(req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ CANCEL_RESERVATION validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid CANCEL_RESERVATION command: ${errorMessage}`,
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
    cancelReservationSchema,
    validateCancelReservation,
    validateCancelReservationMiddleware
};

