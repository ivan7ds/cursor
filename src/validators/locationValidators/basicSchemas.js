const Joi = require('joi');

const { ciString, ocpiString } = require('../../utils/ocpiValidators');

const { TOKEN_TYPES, IMAGE_CATEGORIES } = require('./enums');

/**
 * Esquemas básicos para validadores Location
 */

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

module.exports = {
  geoLocationSchema,
  additionalGeoLocationSchema,
  publishTokenTypeSchema,
  displayTextSchema,
  imageSchema,
  businessDetailsSchema
};

