const Joi = require('joi');

const { ocpiString } = require('../../utils/ocpiValidators');

/**
 * Energy Contract schema validator
 */
const energyContractSchema = Joi.object({
  supplier_name: ocpiString(64).required()
    .messages({
      'any.required': 'supplier_name is required in energy_contract'
    }),
  contract_id: ocpiString(64).optional()
}).messages({
  'object.base': 'energy_contract must be an object'
});

module.exports = {
    energyContractSchema
};

