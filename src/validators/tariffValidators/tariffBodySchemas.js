const Joi = require('joi');

const { ciString, dateTime } = require('../../utils/ocpiValidators');

const { displayTextSchema, priceSchema } = require('./basicSchemas');
const { energyMixSchema } = require('./energySchemas');
const { TARIFF_TYPES } = require('./enums');
const { tariffElementSchema } = require('./tariffSchemas');

/**
 * Esquemas relacionados con Tariff body y path para validadores Tariff
 */

/**
 * Tariff PUT body validator
 * Complete Tariff object according to OCPI 2.2 spec (11.3.1)
 */
const tariffPutBodySchema = Joi.object({
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

  currency: Joi.string()
    .length(3)
    .uppercase()
    .required()
    .messages({
      'any.required': 'currency is required',
      'string.length': 'currency must be exactly 3 characters (ISO 4217 code)'
    }),

  type: Joi.string()
    .valid(...TARIFF_TYPES)
    .optional(),

  tariff_alt_text: Joi.array()
    .items(displayTextSchema)
    .optional()
    .messages({
      'array.base': 'tariff_alt_text must be an array'
    }),

  tariff_alt_url: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'tariff_alt_url must be a valid URL'
    }),

  min_price: priceSchema.optional(),

  max_price: priceSchema.optional(),

  elements: Joi.array()
    .items(tariffElementSchema)
    .min(1)
    .required()
    .messages({
      'any.required': 'elements is required',
      'array.min': 'elements must contain at least one TariffElement',
      'array.base': 'elements must be an array'
    }),

  start_date_time: dateTime().optional(),

  end_date_time: dateTime().optional(),

  energy_mix: energyMixSchema.optional(),

  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Path parameters validator for Tariff PUT
 */
const tariffPutPathSchema = Joi.object({
  country_code: ciString(2).required()
    .messages({
      'any.required': 'country_code path parameter is required'
    }),

  party_id: ciString(3).required()
    .messages({
      'any.required': 'party_id path parameter is required'
    }),

  tariff_id: ciString(36).required()
    .messages({
      'any.required': 'tariff_id path parameter is required'
    })
});

/**
 * Tariff PATCH body validator (all fields optional except last_updated)
 * Allows partial updates according to OCPI 2.2 spec
 */
const tariffPatchBodySchema = Joi.object({
  country_code: ciString(2).optional(),
  party_id: ciString(3).optional(),
  id: ciString(36).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  type: Joi.string().valid(...TARIFF_TYPES).optional(),
  tariff_alt_text: Joi.array().items(displayTextSchema).optional(),
  tariff_alt_url: Joi.string().uri().optional(),
  min_price: priceSchema.optional(),
  max_price: priceSchema.optional(),
  elements: Joi.array().items(tariffElementSchema).min(1).optional(),
  start_date_time: dateTime().optional(),
  end_date_time: dateTime().optional(),
  energy_mix: energyMixSchema.optional(),
  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required even in PATCH requests'
    })
}).min(2) // At least last_updated + 1 other field
  .messages({
    'object.min': 'PATCH request must include at least one field to update besides last_updated'
  });

module.exports = {
  tariffPutBodySchema,
  tariffPatchBodySchema,
  tariffPutPathSchema
};

