const Joi = require('joi');

const { ciString, dateTime, ocpiString } = require('../../utils/ocpiValidators');

const { geoLocationSchema, displayTextSchema, imageSchema } = require('./basicSchemas');
const {
  STATUSES,
  CAPABILITIES,
  CONNECTOR_TYPES,
  CONNECTOR_FORMATS,
  POWER_TYPES,
  PARKING_RESTRICTIONS
} = require('./enums');
const { statusScheduleSchema } = require('./hoursSchemas');

/**
 * Esquemas relacionados con EVSE y Connector para validadores Location
 */

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

module.exports = {
  connectorSchema,
  evseSchema
};

