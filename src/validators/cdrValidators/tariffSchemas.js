const Joi = require('joi');

const { ciString, dateTime, ocpiString, ocpiNumber } = require('../../utils/ocpiValidators');

const { priceSchema, displayTextSchema } = require('./basicSchemas');
const { energyMixSchema } = require('./energySchemas');
const {
  TARIFF_TYPES,
  TARIFF_DIMENSION_TYPES,
  DAYS_OF_WEEK,
  RESERVATION_RESTRICTION_TYPES
} = require('./enums');

/**
 * Esquemas relacionados con tarifas para validadores CDR
 */

/**
 * PriceComponent schema validator (11.4.2)
 */
const priceComponentSchema = Joi.object({
  type: Joi.string()
    .valid(...TARIFF_DIMENSION_TYPES)
    .required()
    .messages({
      'any.required': 'price_component.type is required'
    }),

  price: ocpiNumber().required()
    .messages({
      'any.required': 'price_component.price is required',
      'number.base': 'price_component.price must be a number'
    }),

  vat: ocpiNumber().optional()
    .messages({
      'number.base': 'price_component.vat must be a number'
    }),

  step_size: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'any.required': 'price_component.step_size is required',
      'number.base': 'price_component.step_size must be an integer',
      'number.min': 'price_component.step_size must be at least 1'
    })
}).messages({
  'object.base': 'price_component must be a valid PriceComponent object'
});

/**
 * TariffRestrictions schema validator (11.4.6)
 */
const tariffRestrictionsSchema = Joi.object({
  start_time: Joi.string()
    .length(5)
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'restrictions.start_time must match format HH:MM (24h)'
    }),

  end_time: Joi.string()
    .length(5)
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'restrictions.end_time must match format HH:MM (24h)'
    }),

  start_date: Joi.string()
    .length(10)
    .pattern(/^([12][0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .optional()
    .messages({
      'string.pattern.base': 'restrictions.start_date must match format YYYY-MM-DD'
    }),

  end_date: Joi.string()
    .length(10)
    .pattern(/^([12][0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .optional()
    .messages({
      'string.pattern.base': 'restrictions.end_date must match format YYYY-MM-DD'
    }),

  min_kwh: ocpiNumber().optional(),
  max_kwh: ocpiNumber().optional(),
  min_current: ocpiNumber().optional(),
  max_current: ocpiNumber().optional(),
  min_power: ocpiNumber().optional(),
  max_power: ocpiNumber().optional(),

  min_duration: Joi.number().integer().optional()
    .messages({
      'number.base': 'restrictions.min_duration must be an integer (seconds)'
    }),

  max_duration: Joi.number().integer().optional()
    .messages({
      'number.base': 'restrictions.max_duration must be an integer (seconds)'
    }),

  day_of_week: Joi.array()
    .items(Joi.string().valid(...DAYS_OF_WEEK))
    .optional(),

  reservation: Joi.string()
    .valid(...RESERVATION_RESTRICTION_TYPES)
    .optional()
}).messages({
  'object.base': 'restrictions must be a valid TariffRestrictions object'
});

/**
 * TariffElement schema validator (11.4.4)
 */
const tariffElementSchema = Joi.object({
  price_components: Joi.array()
    .items(priceComponentSchema)
    .min(1)
    .required()
    .messages({
      'any.required': 'tariff_element.price_components is required',
      'array.min': 'tariff_element.price_components must contain at least one component'
    }),

  restrictions: tariffRestrictionsSchema.optional()
}).messages({
  'object.base': 'tariff_element must be a valid TariffElement object'
});

/**
 * Tariff schema validator (11.4)
 */
const tariffSchema = Joi.object({
  country_code: ciString(2).required()
    .messages({
      'any.required': 'tariff.country_code is required',
      'string.max': 'tariff.country_code must be exactly 2 characters (ISO-3166 alpha-2)'
    }),

  party_id: ciString(3).required()
    .messages({
      'any.required': 'tariff.party_id is required',
      'string.max': 'tariff.party_id must be at most 3 characters (ISO-15118 standard)'
    }),

  id: ciString(36).required()
    .messages({
      'any.required': 'tariff.id is required',
      'string.max': 'tariff.id must be at most 36 characters'
    }),

  currency: Joi.string()
    .length(3)
    .uppercase()
    .required()
    .messages({
      'any.required': 'tariff.currency is required',
      'string.length': 'tariff.currency must be exactly 3 characters (ISO 4217 code)'
    }),

  type: Joi.string()
    .valid(...TARIFF_TYPES)
    .optional(),

  tariff_alt_text: Joi.array()
    .items(displayTextSchema)
    .optional(),

  tariff_alt_url: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'tariff.tariff_alt_url must be a valid URL'
    }),

  min_price: priceSchema.optional(),
  max_price: priceSchema.optional(),

  elements: Joi.array()
    .items(tariffElementSchema)
    .min(1)
    .required()
    .messages({
      'any.required': 'tariff.elements is required',
      'array.min': 'tariff.elements must contain at least one element'
    }),

  start_date_time: dateTime().optional(),
  end_date_time: dateTime().optional(),

  energy_mix: energyMixSchema.optional(),

  last_updated: dateTime().required()
    .messages({
      'any.required': 'tariff.last_updated is required'
    })
}).messages({
  'object.base': 'tariff must be a valid Tariff object'
});

module.exports = {
  priceComponentSchema,
  tariffRestrictionsSchema,
  tariffElementSchema,
  tariffSchema
};

