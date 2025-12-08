const Joi = require('joi');

const { ocpiString, ocpiNumber } = require('../../utils/ocpiValidators');

const {
  ENERGY_SOURCE_CATEGORIES,
  ENVIRONMENTAL_IMPACT_CATEGORIES
} = require('./enums');

/**
 * Esquemas relacionados con energía para validadores Tariff
 */

/**
 * EnergySource schema validator (8.4.7)
 */
const energySourceSchema = Joi.object({
  source: Joi.string()
    .valid(...ENERGY_SOURCE_CATEGORIES)
    .required()
    .messages({
      'any.required': 'energy_source.source is required'
    }),

  percentage: ocpiNumber()
    .min(0)
    .max(100)
    .required()
    .messages({
      'any.required': 'energy_source.percentage is required',
      'number.base': 'energy_source.percentage must be a number',
      'number.min': 'energy_source.percentage must be at least 0',
      'number.max': 'energy_source.percentage must be at most 100'
    })
}).messages({
  'object.base': 'energy_source must be a valid object'
});

/**
 * EnvironmentalImpact schema validator (8.4.9)
 */
const environmentalImpactSchema = Joi.object({
  category: Joi.string()
    .valid(...ENVIRONMENTAL_IMPACT_CATEGORIES)
    .required()
    .messages({
      'any.required': 'environmental_impact.category is required'
    }),

  amount: ocpiNumber().required()
    .messages({
      'any.required': 'environmental_impact.amount is required',
      'number.base': 'environmental_impact.amount must be a number'
    })
}).messages({
  'object.base': 'environmental_impact must be a valid object'
});

/**
 * EnergyMix schema validator (8.4.6)
 */
const energyMixSchema = Joi.object({
  is_green_energy: Joi.boolean().required()
    .messages({
      'any.required': 'energy_mix.is_green_energy is required',
      'boolean.base': 'energy_mix.is_green_energy must be a boolean'
    }),

  energy_sources: Joi.array()
    .items(energySourceSchema)
    .optional()
    .messages({
      'array.base': 'energy_mix.energy_sources must be an array'
    }),

  environ_impact: Joi.array()
    .items(environmentalImpactSchema)
    .optional()
    .messages({
      'array.base': 'energy_mix.environ_impact must be an array'
    }),

  supplier_name: ocpiString(64).optional()
    .messages({
      'string.max': 'energy_mix.supplier_name must be at most 64 characters'
    }),

  energy_product_name: ocpiString(64).optional()
    .messages({
      'string.max': 'energy_mix.energy_product_name must be at most 64 characters'
    })
}).messages({
  'object.base': 'energy_mix must be a valid object'
});

module.exports = {
  energySourceSchema,
  environmentalImpactSchema,
  energyMixSchema
};

