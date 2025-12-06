const Joi = require('joi');

const { ocpiString, ocpiNumber } = require('../../utils/ocpiValidators');

/**
 * Esquemas básicos para validadores Tariff
 */

/**
 * DisplayText schema validator
 * For multi-language text fields
 */
const displayTextSchema = Joi.object({
  language: Joi.string()
    .length(2)
    .lowercase()
    .required()
    .messages({
      'any.required': 'display_text.language is required',
      'string.length': 'display_text.language must be exactly 2 characters (ISO-639-1)'
    }),

  text: ocpiString(512).required()
    .messages({
      'any.required': 'display_text.text is required',
      'string.max': 'display_text.text must be at most 512 characters'
    })
}).messages({
  'object.base': 'display_text must be a valid object'
});

/**
 * Price schema validator (16.5)
 * Used for min_price and max_price
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

module.exports = {
  displayTextSchema,
  priceSchema
};

