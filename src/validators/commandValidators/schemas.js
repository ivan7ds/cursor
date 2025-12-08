const Joi = require('joi');

/**
 * URL validator for response_url
 * Must be a valid HTTP/HTTPS URL
 */
const urlSchema = Joi.string()
  .uri({ scheme: ['http', 'https'] })
  .required()
  .messages({
    'any.required': 'response_url is required',
    'string.uri': 'response_url must be a valid HTTP or HTTPS URL'
  });

module.exports = {
    urlSchema
};

