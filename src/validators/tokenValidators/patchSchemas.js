const Joi = require('joi');

const { ciString, dateTime, ocpiString, languageCode } = require('../../utils/ocpiValidators');

const { energyContractSchema } = require('./baseSchemas');
const { TOKEN_TYPES, WHITELIST_TYPES, PROFILE_TYPES } = require('./enums');

/**
 * Token PATCH body validator (all fields optional except last_updated)
 * Allows partial updates according to OCPI 2.2 spec
 */
const tokenPatchBodySchema = Joi.object({
  country_code: ciString(2).optional(),
  party_id: ciString(3).optional(),
  uid: ciString(36).optional(),
  type: Joi.string().valid(...TOKEN_TYPES).optional(),
  contract_id: ciString(36).optional(),
  visual_number: ocpiString(64).optional(),
  issuer: ocpiString(64).optional(),
  group_id: ciString(36).optional(),
  valid: Joi.boolean().optional(),
  whitelist: Joi.string().valid(...WHITELIST_TYPES).optional(),
  language: languageCode().optional(),
  default_profile_type: Joi.string().valid(...PROFILE_TYPES).optional(),
  energy_contract: energyContractSchema.optional(),
  last_updated: dateTime().required()
    .messages({
      'any.required': 'last_updated is required even in PATCH requests'
    })
}).min(2)
  .messages({
    'object.min': 'PATCH request must include at least one field to update besides last_updated'
  });

module.exports = {
    tokenPatchBodySchema
};

