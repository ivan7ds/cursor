const Joi = require('joi');

const { ciString, dateTime, ocpiString, languageCode } = require('../../utils/ocpiValidators');

const { energyContractSchema } = require('./baseSchemas');
const { TOKEN_TYPES, WHITELIST_TYPES, PROFILE_TYPES } = require('./enums');

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

module.exports = {
    tokenPutBodySchema,
    tokenPutPathSchema
};

