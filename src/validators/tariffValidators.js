const Joi = require('joi');

const { ciString, dateTime, ocpiString, ocpiNumber } = require('../utils/ocpiValidators');

/**
 * OCPI 2.2 Tariff Validators
 * According to OCPI 2.2 specification - Tariffs Module
 */

// TariffType enum (11.4.7)
const TARIFF_TYPES = ['AD_HOC_PAYMENT', 'PROFILE_CHEAP', 'PROFILE_FAST', 'PROFILE_GREEN', 'REGULAR'];

// TariffDimensionType enum (11.4.5)
const TARIFF_DIMENSION_TYPES = ['ENERGY', 'FLAT', 'PARKING_TIME', 'TIME'];

// DayOfWeek enum (11.4.1)
const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// ReservationRestrictionType enum (11.4.3)
const RESERVATION_RESTRICTION_TYPES = ['RESERVATION', 'RESERVATION_EXPIRES'];

// EnergySourceCategory enum (8.4.8)
const ENERGY_SOURCE_CATEGORIES = [
  'NUCLEAR',
  'GENERAL_FOSSIL',
  'COAL',
  'GAS',
  'GENERAL_GREEN',
  'SOLAR',
  'WIND',
  'WATER'
];

// EnvironmentalImpactCategory enum (8.4.10)
const ENVIRONMENTAL_IMPACT_CATEGORIES = ['NUCLEAR_WASTE', 'CARBON_DIOXIDE'];

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
 * Validates Tariff PUT request
 * @param {Object} params - Path parameters {country_code, party_id, tariff_id}
 * @param {Object} body - Request body (Tariff object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateTariffPut(params, body) {
  // Validate path parameters
  const pathValidation = tariffPutPathSchema.validate(params, {
    abortEarly: false,
    stripUnknown: false
  });

  if (pathValidation.error) {
    return {
      valid: false,
      errors: pathValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  // Validate body
  const bodyValidation = tariffPutBodySchema.validate(body, {
    abortEarly: false,
    stripUnknown: true // Remove unknown fields to comply with OCPI spec
  });

  if (bodyValidation.error) {
    return {
      valid: false,
      errors: bodyValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  // Validate that path params match body values
  const pathParams = pathValidation.value;
  const bodyData = bodyValidation.value;

  const matchErrors = [];

  if (pathParams.country_code.toUpperCase() !== bodyData.country_code.toUpperCase()) {
    matchErrors.push({
      field: 'country_code',
      message: `country_code in path (${pathParams.country_code}) does not match body (${bodyData.country_code})`,
      type: 'mismatch'
    });
  }

  if (pathParams.party_id.toUpperCase() !== bodyData.party_id.toUpperCase()) {
    matchErrors.push({
      field: 'party_id',
      message: `party_id in path (${pathParams.party_id}) does not match body (${bodyData.party_id})`,
      type: 'mismatch'
    });
  }

  if (pathParams.tariff_id.toUpperCase() !== bodyData.id.toUpperCase()) {
    matchErrors.push({
      field: 'id',
      message: `tariff_id in path (${pathParams.tariff_id}) does not match body id (${bodyData.id})`,
      type: 'mismatch'
    });
  }

  if (matchErrors.length > 0) {
    return {
      valid: false,
      errors: matchErrors,
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: bodyData
  };
}

/**
 * Express middleware for Tariff PUT validation
 */
function validateTariffPutMiddleware(req, res, next) {
  const validation = validateTariffPut(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../utils/logger');
    logger.error('❌ Tariff PUT validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Tariff data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedTariff = validation.value;
  next();
}

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

/**
 * Validates Tariff PATCH request
 * @param {Object} params - Path parameters {country_code, party_id, tariff_id}
 * @param {Object} body - Request body (partial Tariff object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateTariffPatch(params, body) {
  // Validate path parameters
  const pathValidation = tariffPutPathSchema.validate(params, {
    abortEarly: false,
    stripUnknown: false
  });

  if (pathValidation.error) {
    return {
      valid: false,
      errors: pathValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  // Validate body
  const bodyValidation = tariffPatchBodySchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (bodyValidation.error) {
    return {
      valid: false,
      errors: bodyValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  // Validate that path params match body values (if provided in body)
  const pathParams = pathValidation.value;
  const bodyData = bodyValidation.value;

  const matchErrors = [];

  if (bodyData.country_code && pathParams.country_code.toUpperCase() !== bodyData.country_code.toUpperCase()) {
    matchErrors.push({
      field: 'country_code',
      message: `country_code in path (${pathParams.country_code}) does not match body (${bodyData.country_code})`,
      type: 'mismatch'
    });
  }

  if (bodyData.party_id && pathParams.party_id.toUpperCase() !== bodyData.party_id.toUpperCase()) {
    matchErrors.push({
      field: 'party_id',
      message: `party_id in path (${pathParams.party_id}) does not match body (${bodyData.party_id})`,
      type: 'mismatch'
    });
  }

  if (bodyData.id && pathParams.tariff_id.toUpperCase() !== bodyData.id.toUpperCase()) {
    matchErrors.push({
      field: 'id',
      message: `tariff_id in path (${pathParams.tariff_id}) does not match body id (${bodyData.id})`,
      type: 'mismatch'
    });
  }

  if (matchErrors.length > 0) {
    return {
      valid: false,
      errors: matchErrors,
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: bodyData
  };
}

/**
 * Express middleware for Tariff PATCH validation
 */
function validateTariffPatchMiddleware(req, res, next) {
  const validation = validateTariffPatch(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../utils/logger');
    logger.error('❌ Tariff PATCH validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Tariff PATCH data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedTariffPatch = validation.value;
  next();
}

module.exports = {
  tariffPutBodySchema,
  tariffPatchBodySchema,
  tariffPutPathSchema,
  tariffElementSchema,
  priceComponentSchema,
  tariffRestrictionsSchema,
  energyMixSchema,
  energySourceSchema,
  environmentalImpactSchema,
  validateTariffPut,
  validateTariffPutMiddleware,
  validateTariffPatch,
  validateTariffPatchMiddleware,
  TARIFF_TYPES,
  TARIFF_DIMENSION_TYPES,
  DAYS_OF_WEEK,
  RESERVATION_RESTRICTION_TYPES,
  ENERGY_SOURCE_CATEGORIES,
  ENVIRONMENTAL_IMPACT_CATEGORIES
};
