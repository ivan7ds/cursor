const Joi = require('joi');

const { ciString, dateTime, ocpiNumber } = require('../../utils/ocpiValidators');

const { TOKEN_TYPES } = require('./enums');

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

module.exports = {
    cdrTokenSchema,
    priceSchema,
    cdrDimensionSchema,
    chargingPeriodSchema
};

