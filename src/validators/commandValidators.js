const Joi = require('joi');

const { ciString, dateTime } = require('../utils/ocpiValidators');

const { tokenPutBodySchema } = require('./tokenValidators');

/**
 * OCPI 2.2 Command Validators
 * According to OCPI 2.2 specification - Commands Module
 */

/**
 * URL validator for response_url
 * Must be a valid HTTP/HTTPS URL
 */
const urlSchema = Joi.string()
  .uri({ scheme: ['http', 'https'] })
  .required()
  .messages({
    'any.required': 'response_url is required',
    'string.uri': 'response_url must be a valid HTTP or HTTPS URL'
  });

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
    stripUnknown: true // Remove unknown fields
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

    const logger = require('../utils/logger');
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

  // Store validated data in request for use in route handler
  req.validatedCommand = validation.value;
  next();
}

/**
 * STOP_SESSION command body validator
 *
 * Required fields:
 * - response_url: URL for CommandResult POST
 * - session_id: Session.id of session to stop
 */
const stopSessionSchema = Joi.object({
  response_url: urlSchema,

  session_id: ciString(36).required()
    .messages({
      'any.required': 'session_id is required',
      'string.max': 'session_id must be at most 36 characters'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Validates STOP_SESSION command request
 * @param {Object} body - Request body
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateStopSession(body) {
  const validation = stopSessionSchema.validate(body, {
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
 * Express middleware for STOP_SESSION validation
 */
function validateStopSessionMiddleware(req, res, next) {
  const validation = validateStopSession(req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../utils/logger');
    logger.error('❌ STOP_SESSION validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid STOP_SESSION command: ${errorMessage}`,
      data: {
        result: 'REJECTED',
        timeout: 0
      },
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedCommand = validation.value;
  next();
}

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

    const logger = require('../utils/logger');
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

  // Store validated data in request for use in route handler
  req.validatedCommand = validation.value;
  next();
}

/**
 * CANCEL_RESERVATION command body validator
 *
 * Required fields:
 * - response_url: URL for CommandResult POST
 * - reservation_id: Unique reservation identifier to cancel
 *
 * Note: As there might be cost involved for a Reservation,
 * canceling might still result in a CDR being sent.
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

    const logger = require('../utils/logger');
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

  // Store validated data in request for use in route handler
  req.validatedCommand = validation.value;
  next();
}

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

    const logger = require('../utils/logger');
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

  // Store validated data in request for use in route handler
  req.validatedCommand = validation.value;
  next();
}

module.exports = {
  startSessionSchema,
  stopSessionSchema,
  reserveNowSchema,
  cancelReservationSchema,
  unlockConnectorSchema,
  validateStartSession,
  validateStartSessionMiddleware,
  validateStopSession,
  validateStopSessionMiddleware,
  validateReserveNow,
  validateReserveNowMiddleware,
  validateCancelReservation,
  validateCancelReservationMiddleware,
  validateUnlockConnector,
  validateUnlockConnectorMiddleware
};
