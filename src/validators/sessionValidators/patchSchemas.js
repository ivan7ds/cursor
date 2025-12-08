const Joi = require('joi');

const { ciString, dateTime, ocpiString, ocpiNumber } = require('../../utils/ocpiValidators');

const { cdrTokenSchema, priceSchema, chargingPeriodSchema } = require('./baseSchemas');
const { AUTH_METHODS, SESSION_STATUSES } = require('./enums');

/**
 * Session PATCH body validator (all fields optional except last_updated)
 * Allows partial updates according to OCPI 2.2 spec
 * Note: OCPI 2.2 requires last_updated in ALL PATCH requests
 */
const sessionPatchBodySchema = Joi.object({
  country_code: ciString(2).optional(),
  party_id: ciString(3).optional(),
  id: ciString(36).optional(),
  start_date_time: dateTime().optional(),
  end_date_time: dateTime().optional(),
  kwh: ocpiNumber().optional(),
  cdr_token: cdrTokenSchema.optional(),
  auth_method: Joi.string().valid(...AUTH_METHODS).optional(),
  authorization_reference: ciString(36).optional(),
  location_id: ciString(36).optional(),
  evse_uid: ciString(36).optional(),
  connector_id: ciString(36).optional(),
  meter_id: ocpiString(255).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  charging_periods: Joi.array().items(chargingPeriodSchema).optional(),
  total_cost: priceSchema.optional(),
  status: Joi.string().valid(...SESSION_STATUSES).optional(),
  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required in PATCH requests (OCPI 2.2 specification)',
      'string.isoDate': 'last_updated must be a valid ISO 8601 datetime'
    })
}).min(2)
  .messages({
    'object.min': 'PATCH request must include at least one field to update besides last_updated',
    'object.base': 'Request body must be a valid JSON object'
  });

module.exports = {
    sessionPatchBodySchema
};

