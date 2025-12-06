const Joi = require('joi');

const { ocpiNumber } = require('../../utils/ocpiValidators');

const { priceSchema } = require('./basicSchemas');
const { TARIFF_DIMENSION_TYPES, DAYS_OF_WEEK, RESERVATION_RESTRICTION_TYPES } = require('./enums');

/**
 * Esquemas relacionados con tarifas para validadores Tariff
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
  'object.base': 'price_component must be a valid object'
});

/**
 * TariffRestrictions schema validator (11.4.6)
 */
const tariffRestrictionsSchema = Joi.object({
  start_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'restrictions.start_time must be in HH:MM format (24h)'
    }),

  end_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'restrictions.end_time must be in HH:MM format (24h)'
    }),

  start_date: Joi.string()
    .pattern(/^([12][0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .optional()
    .messages({
      'string.pattern.base': 'restrictions.start_date must be in YYYY-MM-DD format'
    }),

  end_date: Joi.string()
    .pattern(/^([12][0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .optional()
    .messages({
      'string.pattern.base': 'restrictions.end_date must be in YYYY-MM-DD format'
    }),

  min_kwh: ocpiNumber().optional()
    .messages({
      'number.base': 'restrictions.min_kwh must be a number'
    }),

  max_kwh: ocpiNumber().optional()
    .messages({
      'number.base': 'restrictions.max_kwh must be a number'
    }),

  min_current: ocpiNumber().optional()
    .messages({
      'number.base': 'restrictions.min_current must be a number'
    }),

  max_current: ocpiNumber().optional()
    .messages({
      'number.base': 'restrictions.max_current must be a number'
    }),

  min_power: ocpiNumber().optional()
    .messages({
      'number.base': 'restrictions.min_power must be a number'
    }),

  max_power: ocpiNumber().optional()
    .messages({
      'number.base': 'restrictions.max_power must be a number'
    }),

  min_duration: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'restrictions.min_duration must be an integer',
      'number.min': 'restrictions.min_duration must be at least 0'
    }),

  max_duration: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'restrictions.max_duration must be an integer',
      'number.min': 'restrictions.max_duration must be at least 0'
    }),

  day_of_week: Joi.array()
    .items(Joi.string().valid(...DAYS_OF_WEEK))
    .optional()
    .messages({
      'array.base': 'restrictions.day_of_week must be an array'
    }),

  reservation: Joi.string()
    .valid(...RESERVATION_RESTRICTION_TYPES)
    .optional()
}).messages({
  'object.base': 'restrictions must be a valid object'
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
      'array.min': 'tariff_element.price_components must contain at least one component',
      'array.base': 'tariff_element.price_components must be an array'
    }),

  restrictions: tariffRestrictionsSchema.optional()
}).messages({
  'object.base': 'tariff_element must be a valid object'
});

module.exports = {
  priceComponentSchema,
  tariffRestrictionsSchema,
  tariffElementSchema
};

