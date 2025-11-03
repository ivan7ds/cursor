const Joi = require('joi');
const { ciString, dateTime, ocpiString, languageCode } = require('../utils/ocpiValidators');

/**
 * OCPI 2.2 Token Validators
 * According to OCPI 2.2 specification - Token Object
 */

// Token Type enum
const TOKEN_TYPES = ['AD_HOC_USER', 'APP_USER', 'OTHER', 'RFID'];

// Whitelist Type enum
const WHITELIST_TYPES = ['ALWAYS', 'ALLOWED', 'ALLOWED_OFFLINE', 'NEVER'];

// Profile Type enum
const PROFILE_TYPES = ['CHEAP', 'FAST', 'GREEN', 'REGULAR'];

/**
 * Energy Contract schema validator
 */
const energyContractSchema = Joi.object({
  supplier_name: ocpiString(64).required()
    .messages({
      'any.required': 'supplier_name is required in energy_contract'
    }),
  contract_id: ocpiString(64).optional()
}).messages({
  'object.base': 'energy_contract must be an object'
});

/**
 * Token PUT body validator
 * Validates the complete Token object according to OCPI 2.2 spec
 */
const tokenPutBodySchema = Joi.object({
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

  uid: ciString(36).required()
    .messages({
      'any.required': 'uid is required',
      'string.max': 'uid must be at most 36 characters'
    }),

  type: Joi.string()
    .valid(...TOKEN_TYPES)
    .required()
    .messages({
      'any.required': 'type is required'
    }),

  contract_id: ciString(36).required()
    .messages({
      'any.required': 'contract_id is required',
      'string.max': 'contract_id must be at most 36 characters'
    }),

  visual_number: ocpiString(64).optional(),

  issuer: ocpiString(64).required()
    .messages({
      'any.required': 'issuer is required',
      'string.max': 'issuer must be at most 64 characters'
    }),

  group_id: ciString(36).optional()
    .messages({
      'string.max': 'group_id must be at most 36 characters (OCPP 1.5/1.6 supports max 20)'
    }),

  valid: Joi.boolean().required()
    .messages({
      'any.required': 'valid is required',
      'boolean.base': 'valid must be a boolean'
    }),

  whitelist: Joi.string()
    .valid(...WHITELIST_TYPES)
    .required()
    .messages({
      'any.required': 'whitelist is required'
    }),

  language: languageCode().optional(),

  default_profile_type: Joi.string()
    .valid(...PROFILE_TYPES)
    .optional(),

  energy_contract: energyContractSchema.optional(),

  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Path parameters validator for Token PUT
 */
const tokenPutPathSchema = Joi.object({
  country_code: ciString(2).required()
    .messages({
      'any.required': 'country_code path parameter is required'
    }),

  party_id: ciString(3).required()
    .messages({
      'any.required': 'party_id path parameter is required'
    }),

  uid: ciString(36).required()
    .messages({
      'any.required': 'uid path parameter is required'
    })
});

/**
 * Validates Token PUT request
 * @param {Object} params - Path parameters {country_code, party_id, uid}
 * @param {Object} body - Request body (Token object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateTokenPut(params, body) {
  // Validate path parameters
  const pathValidation = tokenPutPathSchema.validate(params, {
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
  const bodyValidation = tokenPutBodySchema.validate(body, {
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

  if (pathParams.uid.toUpperCase() !== bodyData.uid.toUpperCase()) {
    matchErrors.push({
      field: 'uid',
      message: `uid in path (${pathParams.uid}) does not match body (${bodyData.uid})`,
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
 * Express middleware for Token PUT validation
 */
function validateTokenPutMiddleware(req, res, next) {
  const validation = validateTokenPut(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Token data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedToken = validation.value;
  next();
}

/**
 * Token PATCH body validator (all fields optional except last_updated)
 * Allows partial updates according to OCPI 2.2 spec
 */
const tokenPatchBodySchema = Joi.object({
  country_code: ciString(2).optional(),
  party_id: ciString(3).optional(),
  uid: ciString(36).optional(),
  type: Joi.string().valid(...TOKEN_TYPES).optional(),
  contract_id: ciString(36).optional(),
  visual_number: ocpiString(64).optional(),
  issuer: ocpiString(64).optional(),
  group_id: ciString(36).optional(),
  valid: Joi.boolean().optional(),
  whitelist: Joi.string().valid(...WHITELIST_TYPES).optional(),
  language: languageCode().optional(),
  default_profile_type: Joi.string().valid(...PROFILE_TYPES).optional(),
  energy_contract: energyContractSchema.optional(),
  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required even in PATCH requests'
    })
}).min(2) // At least last_updated + 1 other field
  .messages({
    'object.min': 'PATCH request must include at least one field to update besides last_updated'
  });

/**
 * Validates Token PATCH request
 * @param {Object} params - Path parameters {country_code, party_id, uid}
 * @param {Object} body - Request body (partial Token object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateTokenPatch(params, body) {
  // Validate path parameters
  const pathValidation = tokenPutPathSchema.validate(params, {
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
  const bodyValidation = tokenPatchBodySchema.validate(body, {
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

  if (bodyData.uid && pathParams.uid.toUpperCase() !== bodyData.uid.toUpperCase()) {
    matchErrors.push({
      field: 'uid',
      message: `uid in path (${pathParams.uid}) does not match body (${bodyData.uid})`,
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
 * Express middleware for Token PATCH validation
 */
function validateTokenPatchMiddleware(req, res, next) {
  const validation = validateTokenPatch(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Token PATCH data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedTokenPatch = validation.value;
  next();
}

module.exports = {
  tokenPutBodySchema,
  tokenPutPathSchema,
  tokenPatchBodySchema,
  validateTokenPut,
  validateTokenPutMiddleware,
  validateTokenPatch,
  validateTokenPatchMiddleware,
  TOKEN_TYPES,
  WHITELIST_TYPES,
  PROFILE_TYPES
};
