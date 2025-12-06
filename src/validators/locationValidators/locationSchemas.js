const Joi = require('joi');

const { ciString, dateTime, ocpiString } = require('../../utils/ocpiValidators');

const {
  geoLocationSchema,
  additionalGeoLocationSchema,
  publishTokenTypeSchema,
  displayTextSchema,
  imageSchema,
  businessDetailsSchema
} = require('./basicSchemas');
const { PARKING_TYPES, FACILITIES } = require('./enums');
const { evseSchema } = require('./evseSchemas');
const { hoursSchema } = require('./hoursSchemas');

/**
 * Esquemas relacionados con Location para validadores Location
 */

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

module.exports = {
  locationPutBodySchema,
  locationPatchBodySchema,
  locationPathSchema
};

