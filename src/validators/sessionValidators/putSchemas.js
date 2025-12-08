const Joi = require('joi');

const { ciString, dateTime, ocpiString, ocpiNumber } = require('../../utils/ocpiValidators');

const { cdrTokenSchema, priceSchema, chargingPeriodSchema } = require('./baseSchemas');
const { AUTH_METHODS, SESSION_STATUSES } = require('./enums');

/**
 * Session PUT body schema validator
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

module.exports = {
    sessionPutBodySchema,
    sessionPutPathSchema
};

