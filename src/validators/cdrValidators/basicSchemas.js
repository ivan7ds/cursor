const Joi = require('joi');

const { ciString, ocpiString, ocpiNumber } = require('../../utils/ocpiValidators');

const {
  TOKEN_TYPES,
  CONNECTOR_TYPES,
  CONNECTOR_FORMATS,
  POWER_TYPES
} = require('./enums');

/**
 * Esquemas básicos para validadores CDR
 */

/**
 * GeoLocation schema validator (8.4.13)
 */
const geoLocationSchema = Joi.object({
  latitude: Joi.string()
    .max(10)
    .pattern(/^-?[0-9]{1,2}\.[0-9]{5,7}$/)
    .required()
    .messages({
      'any.required': 'cdr_location.coordinates.latitude is required',
      'string.pattern.base': 'cdr_location.coordinates.latitude must be a valid latitude coordinate'
    }),

  longitude: Joi.string()
    .max(11)
    .pattern(/^-?[0-9]{1,3}\.[0-9]{5,7}$/)
    .required()
    .messages({
      'any.required': 'cdr_location.coordinates.longitude is required',
      'string.pattern.base': 'cdr_location.coordinates.longitude must be a valid longitude coordinate'
    })
}).messages({
  'object.base': 'cdr_location.coordinates must be a valid GeoLocation object'
});

/**
 * CdrToken schema validator (10.4.5)
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
  'object.base': 'cdr_token must be a valid CdrToken object'
});

/**
 * CdrLocation schema validator (10.4.4)
 */
const cdrLocationSchema = Joi.object({
  id: ciString(36).required()
    .messages({
      'any.required': 'cdr_location.id is required',
      'string.max': 'cdr_location.id must be at most 36 characters'
    }),

  name: ocpiString(255).optional(),

  address: ocpiString(45).required()
    .messages({
      'any.required': 'cdr_location.address is required',
      'string.max': 'cdr_location.address must be at most 45 characters'
    }),

  city: ocpiString(45).required()
    .messages({
      'any.required': 'cdr_location.city is required',
      'string.max': 'cdr_location.city must be at most 45 characters'
    }),

  postal_code: ocpiString(10).required()
    .messages({
      'any.required': 'cdr_location.postal_code is required',
      'string.max': 'cdr_location.postal_code must be at most 10 characters'
    }),

  country: Joi.string()
    .length(3)
    .uppercase()
    .required()
    .messages({
      'any.required': 'cdr_location.country is required',
      'string.length': 'cdr_location.country must be exactly 3 characters (ISO 3166-1 alpha-3)'
    }),

  coordinates: geoLocationSchema.required()
    .messages({
      'any.required': 'cdr_location.coordinates is required'
    }),

  evse_uid: ciString(36).required()
    .messages({
      'any.required': 'cdr_location.evse_uid is required',
      'string.max': 'cdr_location.evse_uid must be at most 36 characters'
    }),

  evse_id: ciString(48).required()
    .messages({
      'any.required': 'cdr_location.evse_id is required',
      'string.max': 'cdr_location.evse_id must be at most 48 characters'
    }),

  connector_id: ciString(36).required()
    .messages({
      'any.required': 'cdr_location.connector_id is required',
      'string.max': 'cdr_location.connector_id must be at most 36 characters'
    }),

  connector_standard: Joi.string()
    .valid(...CONNECTOR_TYPES)
    .required()
    .messages({
      'any.required': 'cdr_location.connector_standard is required'
    }),

  connector_format: Joi.string()
    .valid(...CONNECTOR_FORMATS)
    .required()
    .messages({
      'any.required': 'cdr_location.connector_format is required'
    }),

  connector_power_type: Joi.string()
    .valid(...POWER_TYPES)
    .required()
    .messages({
      'any.required': 'cdr_location.connector_power_type is required'
    })
}).messages({
  'object.base': 'cdr_location must be a valid CdrLocation object'
});

/**
 * Price schema validator (16.5)
 */
const priceSchema = Joi.object({
  excl_vat: ocpiNumber().required()
    .messages({
      'any.required': 'price.excl_vat is required',
      'number.base': 'price.excl_vat must be a number'
    }),

  incl_vat: ocpiNumber().optional()
    .messages({
      'number.base': 'price.incl_vat must be a number'
    })
}).messages({
  'object.base': 'price must be a valid Price object'
});

/**
 * DisplayText schema validator (16.3)
 */
const displayTextSchema = Joi.object({
  language: Joi.string()
    .length(2)
    .required()
    .messages({
      'any.required': 'display_text.language is required',
      'string.length': 'display_text.language must be exactly 2 characters (ISO 639-1)'
    }),

  text: ocpiString(512).required()
    .messages({
      'any.required': 'display_text.text is required',
      'string.max': 'display_text.text must be at most 512 characters'
    })
}).messages({
  'object.base': 'display_text must be a valid DisplayText object'
});

module.exports = {
  geoLocationSchema,
  cdrTokenSchema,
  cdrLocationSchema,
  priceSchema,
  displayTextSchema
};

