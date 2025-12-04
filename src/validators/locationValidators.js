const Joi = require('joi');

const { ciString, dateTime, ocpiString, ocpiNumber } = require('../utils/ocpiValidators');

/**
 * OCPI 2.2 Location Validators
 * According to OCPI 2.2 specification - Locations Module
 */

// Reuse from other validators
const TOKEN_TYPES = ['AD_HOC_USER', 'APP_USER', 'OTHER', 'RFID'];

// ParkingType enum (8.4.18)
const PARKING_TYPES = [
  'ALONG_MOTORWAY', 'PARKING_GARAGE', 'PARKING_LOT', 'ON_DRIVEWAY',
  'ON_STREET', 'UNDERGROUND_GARAGE'
];

// Status enum (8.4.22)
const STATUSES = [
  'AVAILABLE', 'BLOCKED', 'CHARGING', 'INOPERATIVE', 'OUTOFORDER',
  'PLANNED', 'REMOVED', 'RESERVED', 'UNKNOWN'
];

// Capability enum (8.4.3)
const CAPABILITIES = [
  'CHARGING_PROFILE_CAPABLE', 'CHARGING_PREFERENCES_CAPABLE',
  'CHIP_CARD_SUPPORT', 'CONTACTLESS_CARD_SUPPORT',
  'CREDIT_CARD_PAYABLE', 'DEBIT_CARD_PAYABLE',
  'PED_TERMINAL', 'REMOTE_START_STOP_CAPABLE',
  'RESERVABLE', 'RFID_READER', 'TOKEN_GROUP_CAPABLE', 'UNLOCK_CAPABLE'
];

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

// ParkingRestriction enum (8.4.17)
const PARKING_RESTRICTIONS = ['EV_ONLY', 'PLUGGED', 'DISABLED', 'CUSTOMERS', 'MOTORCYCLES'];

// Facility enum (8.4.12)
const FACILITIES = [
  'HOTEL', 'RESTAURANT', 'CAFE', 'MALL', 'SUPERMARKET', 'SPORT',
  'RECREATION_AREA', 'NATURE', 'MUSEUM', 'BIKE_SHARING', 'BUS_STOP',
  'TAXI_STAND', 'TRAM_STOP', 'METRO_STATION', 'TRAIN_STATION',
  'AIRPORT', 'PARKING_LOT', 'CARPOOL_PARKING', 'FUEL_STATION', 'WIFI'
];

// ImageCategory enum (8.4.16)
const IMAGE_CATEGORIES = [
  'CHARGER', 'ENTRANCE', 'LOCATION', 'NETWORK', 'OPERATOR', 'OTHER', 'OWNER'
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
      'any.required': 'latitude is required',
      'string.pattern.base': 'latitude must be a valid coordinate'
    }),

  longitude: Joi.string()
    .max(11)
    .pattern(/^-?[0-9]{1,3}\.[0-9]{5,7}$/)
    .required()
    .messages({
      'any.required': 'longitude is required',
      'string.pattern.base': 'longitude must be a valid coordinate'
    })
}).messages({
  'object.base': 'coordinates must be a valid GeoLocation object'
});

/**
 * AdditionalGeoLocation schema validator (8.4.1)
 */
const additionalGeoLocationSchema = Joi.object({
  latitude: Joi.string()
    .max(10)
    .pattern(/^-?[0-9]{1,2}\.[0-9]{5,7}$/)
    .required()
    .messages({
      'any.required': 'related_location.latitude is required',
      'string.pattern.base': 'related_location.latitude must be a valid coordinate'
    }),

  longitude: Joi.string()
    .max(11)
    .pattern(/^-?[0-9]{1,3}\.[0-9]{5,7}$/)
    .required()
    .messages({
      'any.required': 'related_location.longitude is required',
      'string.pattern.base': 'related_location.longitude must be a valid coordinate'
    }),

  name: ocpiString(255).optional()
    .messages({
      'string.max': 'related_location.name must be at most 255 characters'
    })
}).messages({
  'object.base': 'related_location must be a valid AdditionalGeoLocation object'
});

/**
 * PublishTokenType schema validator (8.4.20)
 */
const publishTokenTypeSchema = Joi.object({
  uid: ciString(36).optional()
    .messages({
      'string.max': 'publish_allowed_to.uid must be at most 36 characters'
    }),

  type: Joi.string()
    .valid(...TOKEN_TYPES)
    .optional(),

  visual_number: ocpiString(64).optional()
    .messages({
      'string.max': 'publish_allowed_to.visual_number must be at most 64 characters'
    }),

  issuer: ocpiString(64).optional()
    .messages({
      'string.max': 'publish_allowed_to.issuer must be at most 64 characters'
    }),

  group_id: ciString(36).optional()
    .messages({
      'string.max': 'publish_allowed_to.group_id must be at most 36 characters'
    })
})
  .or('uid', 'visual_number', 'group_id')
  .and('uid', 'type')
  .and('visual_number', 'issuer')
  .messages({
    'object.missing': 'publish_allowed_to must have at least one of: uid, visual_number, or group_id',
    'object.and': 'publish_allowed_to validation failed'
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
 * Image schema validator (8.4.15)
 */
const imageSchema = Joi.object({
  url: Joi.string()
    .uri()
    .required()
    .messages({
      'any.required': 'image.url is required',
      'string.uri': 'image.url must be a valid URL'
    }),

  thumbnail: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'image.thumbnail must be a valid URL'
    }),

  category: Joi.string()
    .valid(...IMAGE_CATEGORIES)
    .required()
    .messages({
      'any.required': 'image.category is required'
    }),

  type: ciString(4).required()
    .messages({
      'any.required': 'image.type is required',
      'string.max': 'image.type must be at most 4 characters'
    }),

  width: Joi.number()
    .integer()
    .max(99999)
    .optional()
    .messages({
      'number.base': 'image.width must be an integer',
      'number.max': 'image.width must be at most 5 digits'
    }),

  height: Joi.number()
    .integer()
    .max(99999)
    .optional()
    .messages({
      'number.base': 'image.height must be an integer',
      'number.max': 'image.height must be at most 5 digits'
    })
}).messages({
  'object.base': 'image must be a valid Image object'
});

/**
 * BusinessDetails schema validator (8.4.2)
 */
const businessDetailsSchema = Joi.object({
  name: ocpiString(100).required()
    .messages({
      'any.required': 'business_details.name is required',
      'string.max': 'business_details.name must be at most 100 characters'
    }),

  website: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'business_details.website must be a valid URL'
    }),

  logo: imageSchema.optional()
}).messages({
  'object.base': 'business_details must be a valid BusinessDetails object'
});

/**
 * RegularHours schema validator (8.4.21)
 */
const regularHoursSchema = Joi.object({
  weekday: Joi.number()
    .integer()
    .min(1)
    .max(7)
    .required()
    .messages({
      'any.required': 'regular_hours.weekday is required',
      'number.min': 'regular_hours.weekday must be between 1 (Monday) and 7 (Sunday)',
      'number.max': 'regular_hours.weekday must be between 1 (Monday) and 7 (Sunday)'
    }),

  period_begin: Joi.string()
    .length(5)
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'any.required': 'regular_hours.period_begin is required',
      'string.pattern.base': 'regular_hours.period_begin must match format HH:MM (24h)'
    }),

  period_end: Joi.string()
    .length(5)
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'any.required': 'regular_hours.period_end is required',
      'string.pattern.base': 'regular_hours.period_end must match format HH:MM (24h)'
    })
}).messages({
  'object.base': 'regular_hours must be a valid RegularHours object'
});

/**
 * ExceptionalPeriod schema validator (8.4.11)
 */
const exceptionalPeriodSchema = Joi.object({
  period_begin: dateTime().required()
    .messages({
      'any.required': 'exceptional_period.period_begin is required'
    }),

  period_end: dateTime().required()
    .messages({
      'any.required': 'exceptional_period.period_end is required'
    })
}).messages({
  'object.base': 'exceptional_period must be a valid ExceptionalPeriod object'
});

/**
 * Hours schema validator (8.4.14)
 */
const hoursSchema = Joi.object({
  twentyfourseven: Joi.boolean().required()
    .messages({
      'any.required': 'opening_times.twentyfourseven is required',
      'boolean.base': 'opening_times.twentyfourseven must be a boolean'
    }),

  regular_hours: Joi.array()
    .items(regularHoursSchema)
    .when('twentyfourseven', {
      is: false,
      then: Joi.array().items(regularHoursSchema).required().min(1),
      otherwise: Joi.array().items(regularHoursSchema).optional()
    })
    .messages({
      'any.required': 'opening_times.regular_hours is required when twentyfourseven is false',
      'array.min': 'opening_times.regular_hours must contain at least one period'
    }),

  exceptional_openings: Joi.array()
    .items(exceptionalPeriodSchema)
    .optional(),

  exceptional_closings: Joi.array()
    .items(exceptionalPeriodSchema)
    .optional()
}).messages({
  'object.base': 'opening_times must be a valid Hours object'
});

/**
 * StatusSchedule schema validator (8.4.23)
 */
const statusScheduleSchema = Joi.object({
  period_begin: dateTime().required()
    .messages({
      'any.required': 'status_schedule.period_begin is required'
    }),

  period_end: dateTime().optional(),

  status: Joi.string()
    .valid(...STATUSES)
    .required()
    .messages({
      'any.required': 'status_schedule.status is required'
    })
}).messages({
  'object.base': 'status_schedule must be a valid StatusSchedule object'
});

/**
 * Connector schema validator (8.3.3)
 */
const connectorSchema = Joi.object({
  id: ciString(36).required()
    .messages({
      'any.required': 'connector.id is required',
      'string.max': 'connector.id must be at most 36 characters'
    }),

  standard: Joi.string()
    .valid(...CONNECTOR_TYPES)
    .required()
    .messages({
      'any.required': 'connector.standard is required'
    }),

  format: Joi.string()
    .valid(...CONNECTOR_FORMATS)
    .required()
    .messages({
      'any.required': 'connector.format is required'
    }),

  power_type: Joi.string()
    .valid(...POWER_TYPES)
    .required()
    .messages({
      'any.required': 'connector.power_type is required'
    }),

  max_voltage: Joi.number()
    .integer()
    .required()
    .messages({
      'any.required': 'connector.max_voltage is required',
      'number.base': 'connector.max_voltage must be an integer (volts)'
    }),

  max_amperage: Joi.number()
    .integer()
    .required()
    .messages({
      'any.required': 'connector.max_amperage is required',
      'number.base': 'connector.max_amperage must be an integer (amperes)'
    }),

  max_electric_power: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.base': 'connector.max_electric_power must be an integer (watts)'
    }),

  tariff_ids: Joi.array()
    .items(ciString(36))
    .optional(),

  terms_and_conditions: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'connector.terms_and_conditions must be a valid URL'
    }),

  last_updated: dateTime().required()
    .messages({
      'any.required': 'connector.last_updated is required'
    })
}).messages({
  'object.base': 'connector must be a valid Connector object'
});

/**
 * EVSE schema validator (8.3.2)
 */
const evseSchema = Joi.object({
  uid: ciString(36).required()
    .messages({
      'any.required': 'evse.uid is required',
      'string.max': 'evse.uid must be at most 36 characters'
    }),

  evse_id: ciString(48).optional()
    .messages({
      'string.max': 'evse.evse_id must be at most 48 characters'
    }),

  status: Joi.string()
    .valid(...STATUSES)
    .required()
    .messages({
      'any.required': 'evse.status is required'
    }),

  status_schedule: Joi.array()
    .items(statusScheduleSchema)
    .optional(),

  capabilities: Joi.array()
    .items(Joi.string().valid(...CAPABILITIES))
    .optional(),

  connectors: Joi.array()
    .items(connectorSchema)
    .min(1)
    .required()
    .messages({
      'any.required': 'evse.connectors is required',
      'array.min': 'evse.connectors must contain at least one connector'
    }),

  floor_level: ocpiString(4).optional()
    .messages({
      'string.max': 'evse.floor_level must be at most 4 characters'
    }),

  coordinates: geoLocationSchema.optional(),

  physical_reference: ocpiString(16).optional()
    .messages({
      'string.max': 'evse.physical_reference must be at most 16 characters'
    }),

  directions: Joi.array()
    .items(displayTextSchema)
    .optional(),

  parking_restrictions: Joi.array()
    .items(Joi.string().valid(...PARKING_RESTRICTIONS))
    .optional(),

  images: Joi.array()
    .items(imageSchema)
    .optional(),

  last_updated: dateTime().required()
    .messages({
      'any.required': 'evse.last_updated is required'
    })
}).messages({
  'object.base': 'evse must be a valid EVSE object'
});

/**
 * Location PUT body validator (8.3.1)
 */
const locationPutBodySchema = Joi.object({
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

  publish: Joi.boolean().required()
    .messages({
      'any.required': 'publish is required',
      'boolean.base': 'publish must be a boolean'
    }),

  publish_allowed_to: Joi.array()
    .items(publishTokenTypeSchema)
    .when('publish', {
      is: false,
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'any.unknown': 'publish_allowed_to may only be used when publish is false'
    }),

  name: ocpiString(255).optional()
    .messages({
      'string.max': 'name must be at most 255 characters'
    }),

  address: ocpiString(45).required()
    .messages({
      'any.required': 'address is required',
      'string.max': 'address must be at most 45 characters'
    }),

  city: ocpiString(45).required()
    .messages({
      'any.required': 'city is required',
      'string.max': 'city must be at most 45 characters'
    }),

  postal_code: ocpiString(10).optional()
    .messages({
      'string.max': 'postal_code must be at most 10 characters'
    }),

  state: ocpiString(20).optional()
    .messages({
      'string.max': 'state must be at most 20 characters'
    }),

  country: Joi.string()
    .length(3)
    .uppercase()
    .required()
    .messages({
      'any.required': 'country is required',
      'string.length': 'country must be exactly 3 characters (ISO 3166-1 alpha-3)'
    }),

  coordinates: geoLocationSchema.required()
    .messages({
      'any.required': 'coordinates is required'
    }),

  related_locations: Joi.array()
    .items(additionalGeoLocationSchema)
    .optional(),

  parking_type: Joi.string()
    .valid(...PARKING_TYPES)
    .optional(),

  evses: Joi.array()
    .items(evseSchema)
    .optional(),

  directions: Joi.array()
    .items(displayTextSchema)
    .optional(),

  operator: businessDetailsSchema.optional(),

  suboperator: businessDetailsSchema.optional(),

  owner: businessDetailsSchema.optional(),

  facilities: Joi.array()
    .items(Joi.string().valid(...FACILITIES))
    .optional(),

  time_zone: ocpiString(255).required()
    .messages({
      'any.required': 'time_zone is required',
      'string.max': 'time_zone must be at most 255 characters (IANA tzdata TZ-value)'
    }),

  opening_times: hoursSchema.optional(),

  charging_when_closed: Joi.boolean().optional()
    .messages({
      'boolean.base': 'charging_when_closed must be a boolean'
    }),

  images: Joi.array()
    .items(imageSchema)
    .optional(),

  energy_mix: Joi.any().optional(), // EnergyMix from cdrValidators if needed

  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Location PATCH body validator (all fields optional except last_updated)
 */
const locationPatchBodySchema = Joi.object({
  country_code: ciString(2).optional(),
  party_id: ciString(3).optional(),
  id: ciString(36).optional(),
  publish: Joi.boolean().optional(),
  publish_allowed_to: Joi.array().items(publishTokenTypeSchema).optional(),
  name: ocpiString(255).optional(),
  address: ocpiString(45).optional(),
  city: ocpiString(45).optional(),
  postal_code: ocpiString(10).optional(),
  state: ocpiString(20).optional(),
  country: Joi.string().length(3).uppercase().optional(),
  coordinates: geoLocationSchema.optional(),
  related_locations: Joi.array().items(additionalGeoLocationSchema).optional(),
  parking_type: Joi.string().valid(...PARKING_TYPES).optional(),
  evses: Joi.array().items(evseSchema).optional(),
  directions: Joi.array().items(displayTextSchema).optional(),
  operator: businessDetailsSchema.optional(),
  suboperator: businessDetailsSchema.optional(),
  owner: businessDetailsSchema.optional(),
  facilities: Joi.array().items(Joi.string().valid(...FACILITIES)).optional(),
  time_zone: ocpiString(255).optional(),
  opening_times: hoursSchema.optional(),
  charging_when_closed: Joi.boolean().optional(),
  images: Joi.array().items(imageSchema).optional(),
  energy_mix: Joi.any().optional(),
  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required even in PATCH requests'
    })
}).min(2)
  .messages({
    'object.min': 'PATCH request must include at least one field to update besides last_updated'
  });

/**
 * Path parameters validator for Location PUT/PATCH
 */
const locationPathSchema = Joi.object({
  country_code: ciString(2).required()
    .messages({
      'any.required': 'country_code path parameter is required'
    }),

  party_id: ciString(3).required()
    .messages({
      'any.required': 'party_id path parameter is required'
    }),

  location_id: ciString(36).required()
    .messages({
      'any.required': 'location_id path parameter is required'
    })
});

/**
 * Validates Location PUT request
 */
function validateLocationPut(params, body) {
  const pathValidation = locationPathSchema.validate(params, {
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

  const bodyValidation = locationPutBodySchema.validate(body, {
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

  if (pathParams.location_id.toUpperCase() !== bodyData.id.toUpperCase()) {
    matchErrors.push({
      field: 'id',
      message: `location_id in path (${pathParams.location_id}) does not match body id (${bodyData.id})`,
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
 * Express middleware for Location PUT validation
 */
async function validateLocationPutMiddleware(req, res, next) {
  const validation = validateLocationPut(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../utils/logger');
    logger.error('❌ Location PUT validation failed', {
      errors: validation.errors,
      body: req.body
    });

    // Log validation error to database
    const { logValidationError } = require('../utils/validationErrorLogger');
    await logValidationError({
      endpoint: req.originalUrl || req.url,
      method: req.method,
      requestBody: req.body,
      validationErrors: validation.errors,
      req
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Location data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedLocation = validation.value;
  next();
}

/**
 * Validates Location PATCH request
 */
function validateLocationPatch(params, body) {
  const pathValidation = locationPathSchema.validate(params, {
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

  const bodyValidation = locationPatchBodySchema.validate(body, {
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

  if (bodyData.id && pathParams.location_id.toUpperCase() !== bodyData.id.toUpperCase()) {
    matchErrors.push({
      field: 'id',
      message: `location_id in path (${pathParams.location_id}) does not match body id (${bodyData.id})`,
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
 * Express middleware for Location PATCH validation
 */
function validateLocationPatchMiddleware(req, res, next) {
  const validation = validateLocationPatch(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../utils/logger');
    logger.error('❌ Location PATCH validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Location PATCH data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedLocationPatch = validation.value;
  next();
}

module.exports = {
  locationPutBodySchema,
  locationPatchBodySchema,
  locationPathSchema,
  evseSchema,
  connectorSchema,
  validateLocationPut,
  validateLocationPutMiddleware,
  validateLocationPatch,
  validateLocationPatchMiddleware,
  STATUSES,
  CAPABILITIES,
  CONNECTOR_TYPES,
  CONNECTOR_FORMATS,
  POWER_TYPES,
  PARKING_TYPES,
  PARKING_RESTRICTIONS,
  FACILITIES,
  IMAGE_CATEGORIES
};
