const Joi = require('joi');

const { ciString, dateTime, ocpiString, ocpiNumber } = require('../../utils/ocpiValidators');

const { cdrTokenSchema, cdrLocationSchema, priceSchema } = require('./basicSchemas');
const { CDR_DIMENSION_TYPES, AUTH_METHODS } = require('./enums');
const { tariffSchema } = require('./tariffSchemas');

/**
 * Esquemas relacionados con CDR para validadores CDR
 */

/**
 * CdrDimension schema validator (10.4.4)
 */
const cdrDimensionSchema = Joi.object({
  type: Joi.string()
    .valid(...CDR_DIMENSION_TYPES)
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
  'object.base': 'charging_period.dimension must be a valid CdrDimension object'
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
  'object.base': 'charging_period must be a valid ChargingPeriod object'
});

/**
 * SignedValue schema validator (10.4.8)
 */
const signedValueSchema = Joi.object({
  nature: ciString(32).required()
    .messages({
      'any.required': 'signed_value.nature is required',
      'string.max': 'signed_value.nature must be at most 32 characters'
    }),

  plain_data: ciString(512).required()
    .messages({
      'any.required': 'signed_value.plain_data is required',
      'string.max': 'signed_value.plain_data must be at most 512 characters'
    }),

  signed_data: ciString(512).required()
    .messages({
      'any.required': 'signed_value.signed_data is required',
      'string.max': 'signed_value.signed_data must be at most 512 characters'
    })
}).messages({
  'object.base': 'signed_value must be a valid SignedValue object'
});

/**
 * SignedData schema validator (10.4.7)
 */
const signedDataSchema = Joi.object({
  encoding_method: ciString(36).required()
    .messages({
      'any.required': 'signed_data.encoding_method is required',
      'string.max': 'signed_data.encoding_method must be at most 36 characters'
    }),

  encoding_method_version: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.base': 'signed_data.encoding_method_version must be an integer'
    }),

  public_key: ciString(512).optional()
    .messages({
      'string.max': 'signed_data.public_key must be at most 512 characters'
    }),

  signed_values: Joi.array()
    .items(signedValueSchema)
    .min(1)
    .required()
    .messages({
      'any.required': 'signed_data.signed_values is required',
      'array.min': 'signed_data.signed_values must contain at least one value'
    }),

  url: ciString(512).optional()
    .messages({
      'string.max': 'signed_data.url must be at most 512 characters'
    })
}).messages({
  'object.base': 'signed_data must be a valid SignedData object'
});

/**
 * CDR POST body validator
 * Complete CDR object according to OCPI 2.2 spec
 */
const cdrPostBodySchema = Joi.object({
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

  id: ciString(39).required()
    .messages({
      'any.required': 'id is required',
      'string.max': 'id must be at most 39 characters (36 for normal CDRs, 39 for credit CDRs)'
    }),

  start_date_time: dateTime().required()
    .messages({
      'any.required': 'start_date_time is required'
    }),

  end_date_time: dateTime().required()
    .messages({
      'any.required': 'end_date_time is required'
    }),

  session_id: ciString(36).optional()
    .messages({
      'string.max': 'session_id must be at most 36 characters'
    }),

  cdr_token: cdrTokenSchema.required()
    .messages({
      'any.required': 'cdr_token is required'
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

  cdr_location: cdrLocationSchema.required()
    .messages({
      'any.required': 'cdr_location is required'
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

  tariffs: Joi.array()
    .items(tariffSchema)
    .optional(),

  charging_periods: Joi.array()
    .items(chargingPeriodSchema)
    .min(1)
    .required()
    .messages({
      'any.required': 'charging_periods is required',
      'array.min': 'charging_periods must contain at least one period'
    }),

  signed_data: signedDataSchema.optional(),

  total_cost: priceSchema.required()
    .messages({
      'any.required': 'total_cost is required'
    }),

  total_fixed_cost: priceSchema.optional(),

  total_energy: ocpiNumber().required()
    .messages({
      'any.required': 'total_energy is required',
      'number.base': 'total_energy must be a number (kWh)'
    }),

  total_energy_cost: priceSchema.optional(),

  total_time: ocpiNumber().required()
    .messages({
      'any.required': 'total_time is required',
      'number.base': 'total_time must be a number (hours)'
    }),

  total_time_cost: priceSchema.optional(),

  total_parking_time: ocpiNumber().optional()
    .messages({
      'number.base': 'total_parking_time must be a number (hours)'
    }),

  total_parking_cost: priceSchema.optional(),

  total_reservation_cost: priceSchema.optional(),

  remark: ocpiString(255).optional()
    .messages({
      'string.max': 'remark must be at most 255 characters'
    }),

  invoice_reference_id: ciString(39).optional()
    .messages({
      'string.max': 'invoice_reference_id must be at most 39 characters'
    }),

  credit: Joi.boolean().optional()
    .messages({
      'boolean.base': 'credit must be a boolean'
    }),

  credit_reference_id: ciString(39)
    .when('credit', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'credit_reference_id is required when credit is true',
      'string.max': 'credit_reference_id must be at most 39 characters'
    }),

  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

module.exports = {
  cdrDimensionSchema,
  chargingPeriodSchema,
  signedValueSchema,
  signedDataSchema,
  cdrPostBodySchema
};

