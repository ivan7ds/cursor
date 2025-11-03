const Joi = require('joi');
const { ciString, dateTime, ocpiString, ocpiNumber } = require('../utils/ocpiValidators');

/**
 * OCPI 2.2 Session Validators
 * According to OCPI 2.2 specification - Sessions Module
 */

// TokenType enum (from OCPI 2.2)
const TOKEN_TYPES = ['AD_HOC_USER', 'APP_USER', 'OTHER', 'RFID'];

// AuthMethod enum (10.4.1)
const AUTH_METHODS = ['AUTH_REQUEST', 'COMMAND', 'WHITELIST'];

// SessionStatus enum (9.4.3)
const SESSION_STATUSES = ['ACTIVE', 'COMPLETED', 'INVALID', 'PENDING'];

/**
 * CdrToken schema validator (10.4.5)
 * Simplified Token object for CDRs and Sessions
 */
const cdrTokenSchema = Joi.object({
  uid: ciString(36).required()
    .messages({
      'any.required': 'cdr_token.uid is required',
      'string.max': 'cdr_token.uid must be at most 36 characters'
    }),

  type: Joi.string()
    .valid(...TOKEN_TYPES)
    .required()
    .messages({
      'any.required': 'cdr_token.type is required'
    }),

  contract_id: ciString(36).required()
    .messages({
      'any.required': 'cdr_token.contract_id is required',
      'string.max': 'cdr_token.contract_id must be at most 36 characters'
    })
}).messages({
  'object.base': 'cdr_token must be a valid object'
});

/**
 * Price schema validator (16.5)
 */
const priceSchema = Joi.object({
  excl_vat: ocpiNumber().required()
    .messages({
      'any.required': 'total_cost.excl_vat is required',
      'number.base': 'total_cost.excl_vat must be a number'
    }),

  incl_vat: ocpiNumber().optional()
    .messages({
      'number.base': 'total_cost.incl_vat must be a number'
    })
}).messages({
  'object.base': 'total_cost must be a valid Price object'
});

/**
 * CdrDimension schema validator (10.4.4)
 */
const cdrDimensionSchema = Joi.object({
  type: Joi.string()
    .valid('CURRENT', 'ENERGY', 'ENERGY_EXPORT', 'ENERGY_IMPORT', 'MAX_CURRENT',
           'MIN_CURRENT', 'MAX_POWER', 'MIN_POWER', 'PARKING_TIME', 'POWER',
           'RESERVATION_TIME', 'STATE_OF_CHARGE', 'TIME')
    .required()
    .messages({
      'any.required': 'charging_period.dimension.type is required'
    }),

  volume: ocpiNumber().required()
    .messages({
      'any.required': 'charging_period.dimension.volume is required',
      'number.base': 'charging_period.dimension.volume must be a number'
    })
}).messages({
  'object.base': 'charging_period.dimension must be a valid object'
});

/**
 * ChargingPeriod schema validator (10.4.6)
 */
const chargingPeriodSchema = Joi.object({
  start_date_time: dateTime().required()
    .messages({
      'any.required': 'charging_period.start_date_time is required'
    }),

  dimensions: Joi.array()
    .items(cdrDimensionSchema)
    .min(1)
    .required()
    .messages({
      'any.required': 'charging_period.dimensions is required',
      'array.min': 'charging_period.dimensions must contain at least one dimension'
    }),

  tariff_id: ciString(36).optional()
    .messages({
      'string.max': 'charging_period.tariff_id must be at most 36 characters'
    })
}).messages({
  'object.base': 'charging_period must be a valid object'
});

/**
 * Session PUT body validator
 * Complete Session object according to OCPI 2.2 spec
 */
const sessionPutBodySchema = Joi.object({
  country_code: ciString(2).required()
    .messages({
      'any.required': 'country_code is required',
      'string.max': 'country_code must be exactly 2 characters (ISO-3166 alpha-2)'
    }),

  party_id: ciString(3).required()
    .messages({
      'any.required': 'party_id is required',
      'string.max': 'party_id must be at most 3 characters (ISO-15118 standard)'
    }),

  id: ciString(36).required()
    .messages({
      'any.required': 'id is required',
      'string.max': 'id must be at most 36 characters'
    }),

  start_date_time: dateTime().required()
    .messages({
      'any.required': 'start_date_time is required'
    }),

  end_date_time: dateTime().optional(),

  kwh: ocpiNumber().required()
    .messages({
      'any.required': 'kwh is required',
      'number.base': 'kwh must be a number'
    }),

  cdr_token: cdrTokenSchema.required()
    .messages({
      'any.required': 'cdr_token is required',
      'object.base': 'cdr_token must be a valid CdrToken object'
    }),

  auth_method: Joi.string()
    .valid(...AUTH_METHODS)
    .required()
    .messages({
      'any.required': 'auth_method is required'
    }),

  authorization_reference: ciString(36).optional()
    .messages({
      'string.max': 'authorization_reference must be at most 36 characters'
    }),

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
    }),

  meter_id: ocpiString(255).optional()
    .messages({
      'string.max': 'meter_id must be at most 255 characters'
    }),

  currency: Joi.string()
    .length(3)
    .uppercase()
    .required()
    .messages({
      'any.required': 'currency is required',
      'string.length': 'currency must be exactly 3 characters (ISO 4217 code)'
    }),

  charging_periods: Joi.array()
    .items(chargingPeriodSchema)
    .optional()
    .messages({
      'array.base': 'charging_periods must be an array'
    }),

  total_cost: priceSchema.optional(),

  status: Joi.string()
    .valid(...SESSION_STATUSES)
    .required()
    .messages({
      'any.required': 'status is required'
    }),

  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Path parameters validator for Session PUT
 */
const sessionPutPathSchema = Joi.object({
  country_code: ciString(2).required()
    .messages({
      'any.required': 'country_code path parameter is required'
    }),

  party_id: ciString(3).required()
    .messages({
      'any.required': 'party_id path parameter is required'
    }),

  session_id: ciString(36).required()
    .messages({
      'any.required': 'session_id path parameter is required'
    })
});

/**
 * Validates Session PUT request
 * @param {Object} params - Path parameters {country_code, party_id, session_id}
 * @param {Object} body - Request body (Session object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateSessionPut(params, body) {
  // Validate path parameters
  const pathValidation = sessionPutPathSchema.validate(params, {
    abortEarly: false,
    stripUnknown: false
  });

  if (pathValidation.error) {
    return {
      valid: false,
      errors: pathValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  // Validate body
  const bodyValidation = sessionPutBodySchema.validate(body, {
    abortEarly: false,
    stripUnknown: true // Remove unknown fields to comply with OCPI spec
  });

  if (bodyValidation.error) {
    return {
      valid: false,
      errors: bodyValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  // Validate that path params match body values
  const pathParams = pathValidation.value;
  const bodyData = bodyValidation.value;

  const matchErrors = [];

  if (pathParams.country_code.toUpperCase() !== bodyData.country_code.toUpperCase()) {
    matchErrors.push({
      field: 'country_code',
      message: `country_code in path (${pathParams.country_code}) does not match body (${bodyData.country_code})`,
      type: 'mismatch'
    });
  }

  if (pathParams.party_id.toUpperCase() !== bodyData.party_id.toUpperCase()) {
    matchErrors.push({
      field: 'party_id',
      message: `party_id in path (${pathParams.party_id}) does not match body (${bodyData.party_id})`,
      type: 'mismatch'
    });
  }

  if (pathParams.session_id.toUpperCase() !== bodyData.id.toUpperCase()) {
    matchErrors.push({
      field: 'id',
      message: `session_id in path (${pathParams.session_id}) does not match body id (${bodyData.id})`,
      type: 'mismatch'
    });
  }

  if (matchErrors.length > 0) {
    return {
      valid: false,
      errors: matchErrors,
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: bodyData
  };
}

/**
 * Express middleware for Session PUT validation
 */
function validateSessionPutMiddleware(req, res, next) {
  const validation = validateSessionPut(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../utils/logger');
    logger.error('❌ Session PUT validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Session data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedSession = validation.value;
  next();
}

/**
 * Session PATCH body validator (all fields optional except last_updated)
 * Allows partial updates according to OCPI 2.2 spec
 */
const sessionPatchBodySchema = Joi.object({
  country_code: ciString(2).optional(),
  party_id: ciString(3).optional(),
  id: ciString(36).optional(),
  start_date_time: dateTime().optional(),
  end_date_time: dateTime().optional(),
  kwh: ocpiNumber().optional(),
  cdr_token: cdrTokenSchema.optional(),
  auth_method: Joi.string().valid(...AUTH_METHODS).optional(),
  authorization_reference: ciString(36).optional(),
  location_id: ciString(36).optional(),
  evse_uid: ciString(36).optional(),
  connector_id: ciString(36).optional(),
  meter_id: ocpiString(255).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  charging_periods: Joi.array().items(chargingPeriodSchema).optional(),
  total_cost: priceSchema.optional(),
  status: Joi.string().valid(...SESSION_STATUSES).optional(),
  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required even in PATCH requests'
    })
}).min(2) // At least last_updated + 1 other field
  .messages({
    'object.min': 'PATCH request must include at least one field to update besides last_updated'
  });

/**
 * Validates Session PATCH request
 * @param {Object} params - Path parameters {country_code, party_id, session_id}
 * @param {Object} body - Request body (partial Session object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateSessionPatch(params, body) {
  // Validate path parameters
  const pathValidation = sessionPutPathSchema.validate(params, {
    abortEarly: false,
    stripUnknown: false
  });

  if (pathValidation.error) {
    return {
      valid: false,
      errors: pathValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  // Validate body
  const bodyValidation = sessionPatchBodySchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (bodyValidation.error) {
    return {
      valid: false,
      errors: bodyValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  // Validate that path params match body values (if provided in body)
  const pathParams = pathValidation.value;
  const bodyData = bodyValidation.value;

  const matchErrors = [];

  if (bodyData.country_code && pathParams.country_code.toUpperCase() !== bodyData.country_code.toUpperCase()) {
    matchErrors.push({
      field: 'country_code',
      message: `country_code in path (${pathParams.country_code}) does not match body (${bodyData.country_code})`,
      type: 'mismatch'
    });
  }

  if (bodyData.party_id && pathParams.party_id.toUpperCase() !== bodyData.party_id.toUpperCase()) {
    matchErrors.push({
      field: 'party_id',
      message: `party_id in path (${pathParams.party_id}) does not match body (${bodyData.party_id})`,
      type: 'mismatch'
    });
  }

  if (bodyData.id && pathParams.session_id.toUpperCase() !== bodyData.id.toUpperCase()) {
    matchErrors.push({
      field: 'id',
      message: `session_id in path (${pathParams.session_id}) does not match body id (${bodyData.id})`,
      type: 'mismatch'
    });
  }

  if (matchErrors.length > 0) {
    return {
      valid: false,
      errors: matchErrors,
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: bodyData
  };
}

/**
 * Express middleware for Session PATCH validation
 */
function validateSessionPatchMiddleware(req, res, next) {
  const validation = validateSessionPatch(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../utils/logger');
    logger.error('❌ Session PATCH validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Session PATCH data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedSessionPatch = validation.value;
  next();
}

module.exports = {
  sessionPutBodySchema,
  sessionPutPathSchema,
  sessionPatchBodySchema,
  cdrTokenSchema,
  priceSchema,
  chargingPeriodSchema,
  validateSessionPut,
  validateSessionPutMiddleware,
  validateSessionPatch,
  validateSessionPatchMiddleware,
  TOKEN_TYPES,
  AUTH_METHODS,
  SESSION_STATUSES
};
