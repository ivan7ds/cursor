const Joi = require('joi');
const { ciString, dateTime, ocpiString, ocpiNumber } = require('../utils/ocpiValidators');

/**
 * OCPI 2.2 CDR Validators
 * According to OCPI 2.2 specification - CDRs Module
 */

// Reuse from sessionValidators
const TOKEN_TYPES = ['AD_HOC_USER', 'APP_USER', 'OTHER', 'RFID'];
const AUTH_METHODS = ['AUTH_REQUEST', 'COMMAND', 'WHITELIST'];

// ConnectorType enum (8.4.5)
const CONNECTOR_TYPES = [
  'CHADEMO',
  'DOMESTIC_A', 'DOMESTIC_B', 'DOMESTIC_C', 'DOMESTIC_D', 'DOMESTIC_E',
  'DOMESTIC_F', 'DOMESTIC_G', 'DOMESTIC_H', 'DOMESTIC_I', 'DOMESTIC_J',
  'DOMESTIC_K', 'DOMESTIC_L',
  'IEC_60309_2_single_16', 'IEC_60309_2_three_16', 'IEC_60309_2_three_32', 'IEC_60309_2_three_64',
  'IEC_62196_T1', 'IEC_62196_T1_COMBO', 'IEC_62196_T2', 'IEC_62196_T2_COMBO',
  'IEC_62196_T3A', 'IEC_62196_T3C',
  'PANTOGRAPH_BOTTOM_UP', 'PANTOGRAPH_TOP_DOWN',
  'TESLA_R', 'TESLA_S'
];

// ConnectorFormat enum (8.4.4)
const CONNECTOR_FORMATS = ['SOCKET', 'CABLE'];

// PowerType enum (8.4.19)
const POWER_TYPES = ['AC_1_PHASE', 'AC_3_PHASE', 'DC'];

// TariffType enum (11.4.7)
const TARIFF_TYPES = ['AD_HOC_PAYMENT', 'PROFILE_CHEAP', 'PROFILE_FAST', 'PROFILE_GREEN', 'REGULAR'];

// TariffDimensionType enum (11.4.5)
const TARIFF_DIMENSION_TYPES = ['ENERGY', 'FLAT', 'PARKING_TIME', 'TIME'];

// DayOfWeek enum (11.4.1)
const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// ReservationRestrictionType enum (11.4.3)
const RESERVATION_RESTRICTION_TYPES = ['RESERVATION', 'RESERVATION_EXPIRES'];

// EnergySourceCategory enum (8.4.8)
const ENERGY_SOURCE_CATEGORIES = ['NUCLEAR', 'GENERAL_FOSSIL', 'COAL', 'GAS', 'GENERAL_GREEN', 'SOLAR', 'WIND', 'WATER'];

// EnvironmentalImpactCategory enum (8.4.10)
const ENVIRONMENTAL_IMPACT_CATEGORIES = ['NUCLEAR_WASTE', 'CARBON_DIOXIDE'];

// CdrDimension types (same as in sessionValidators)
const CDR_DIMENSION_TYPES = [
  'CURRENT', 'ENERGY', 'ENERGY_EXPORT', 'ENERGY_IMPORT', 'MAX_CURRENT',
  'MIN_CURRENT', 'MAX_POWER', 'MIN_POWER', 'PARKING_TIME', 'POWER',
  'RESERVATION_TIME', 'STATE_OF_CHARGE', 'TIME'
];

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
      'number.min': 'energy_source.percentage must be between 0 and 100',
      'number.max': 'energy_source.percentage must be between 0 and 100'
    })
}).messages({
  'object.base': 'energy_source must be a valid EnergySource object'
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
  'object.base': 'environmental_impact must be a valid EnvironmentalImpact object'
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
    .optional(),

  environ_impact: Joi.array()
    .items(environmentalImpactSchema)
    .optional(),

  supplier_name: ocpiString(64).optional(),

  energy_product_name: ocpiString(64).optional()
}).messages({
  'object.base': 'energy_mix must be a valid EnergyMix object'
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

/**
 * Validates CDR POST request
 * @param {Object} body - Request body (CDR object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateCdrPost(body) {
  const validation = cdrPostBodySchema.validate(body, {
    abortEarly: false,
    stripUnknown: true // Remove unknown fields to comply with OCPI spec
  });

  if (validation.error) {
    return {
      valid: false,
      errors: validation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: validation.value
  };
}

/**
 * Express middleware for CDR POST validation
 */
function validateCdrPostMiddleware(req, res, next) {
  const validation = validateCdrPost(req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../utils/logger');
    logger.error('❌ CDR POST validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid CDR data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedCdr = validation.value;
  next();
}

/**
 * Validates a single CDR object for GET response
 * @param {Object} cdr - CDR object from database
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateCdrResponse(cdr) {
  const validation = cdrPostBodySchema.validate(cdr, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (validation.error) {
    return {
      valid: false,
      errors: validation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: validation.value
  };
}

/**
 * Validates an array of CDR objects for GET response
 * @param {Array} cdrs - Array of CDR objects from database
 * @returns {Object} { valid: boolean, errors: Array, validCdrs: Array, invalidCdrs: Array }
 */
function validateCdrsResponse(cdrs) {
  const validCdrs = [];
  const invalidCdrs = [];
  const allErrors = [];

  cdrs.forEach((cdr, index) => {
    const validation = validateCdrResponse(cdr);

    if (validation.valid) {
      validCdrs.push(validation.value);
    } else {
      invalidCdrs.push({
        index,
        id: cdr.id,
        errors: validation.errors
      });
      allErrors.push({
        cdr_index: index,
        cdr_id: cdr.id,
        errors: validation.errors
      });
    }
  });

  return {
    valid: invalidCdrs.length === 0,
    errors: allErrors,
    validCdrs,
    invalidCdrs
  };
}

/**
 * Express middleware for validating CDR GET responses
 * Wraps the route handler to validate response data before sending
 */
function validateCdrGetResponseMiddleware(req, res, next) {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to validate before sending
  res.json = function(body) {
    const logger = require('../utils/logger');

    // Only validate successful responses with data
    if (body.status_code === 1000 && body.data) {
      const isArray = Array.isArray(body.data);

      if (isArray) {
        // Validate array of CDRs
        const validation = validateCdrsResponse(body.data);

        if (!validation.valid) {
          logger.warn('⚠️ CDR GET response validation found invalid CDRs', {
            total: body.data.length,
            valid: validation.validCdrs.length,
            invalid: validation.invalidCdrs.length,
            errors: validation.errors
          });
        }

        // Return only valid CDRs
        body.data = validation.validCdrs;

        // Update pagination if present
        if (body.pagination) {
          body.pagination.total = validation.validCdrs.length;
        }
      } else {
        // Validate single CDR
        const validation = validateCdrResponse(body.data);

        if (!validation.valid) {
          logger.error('❌ CDR GET response validation failed', {
            cdr_id: body.data.id,
            errors: validation.errors
          });

          return originalJson({
            status_code: 2001,
            status_message: 'CDR data does not conform to OCPI 2.2 specification',
            timestamp: new Date().toISOString(),
            errors: validation.errors
          });
        }

        body.data = validation.value;
      }
    }

    return originalJson(body);
  };

  next();
}

module.exports = {
  cdrPostBodySchema,
  cdrTokenSchema,
  cdrLocationSchema,
  priceSchema,
  tariffSchema,
  chargingPeriodSchema,
  signedDataSchema,
  validateCdrPost,
  validateCdrPostMiddleware,
  validateCdrResponse,
  validateCdrsResponse,
  validateCdrGetResponseMiddleware,
  TOKEN_TYPES,
  AUTH_METHODS,
  CONNECTOR_TYPES,
  CONNECTOR_FORMATS,
  POWER_TYPES,
  TARIFF_TYPES,
  TARIFF_DIMENSION_TYPES
};
