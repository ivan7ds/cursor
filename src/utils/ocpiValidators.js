const Joi = require('joi');

/**
 * OCPI 2.2 Base Type Validators
 * According to OCPI 2.2 specification
 */

// Lista completa de códigos de idioma ISO 639-1
const ISO_639_1_CODES = [
  'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az',
  'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs',
  'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy',
  'da', 'de', 'dv', 'dz',
  'ee', 'el', 'en', 'eo', 'es', 'et', 'eu',
  'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy',
  'ga', 'gd', 'gl', 'gn', 'gu', 'gv',
  'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz',
  'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu',
  'ja', 'jv',
  'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky',
  'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv',
  'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my',
  'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny',
  'oc', 'oj', 'om', 'or', 'os',
  'pa', 'pi', 'pl', 'ps', 'pt',
  'qu',
  'rm', 'rn', 'ro', 'ru', 'rw',
  'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw',
  'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty',
  'ug', 'uk', 'ur', 'uz',
  've', 'vi', 'vo',
  'wa', 'wo',
  'xh',
  'yi', 'yo',
  'za', 'zh', 'zu'
];

/**
 * CiString type validator
 * Case Insensitive String. Only printable ASCII allowed.
 * @param {number} maxLength - Maximum length
 */
const ciString = (maxLength) => {
  return Joi.string()
    .max(maxLength)
    .pattern(/^[\x20-\x7E]*$/, 'printable ASCII only')
    .messages({
      'string.max': `must be at most ${maxLength} characters`,
      'string.pattern.name': 'must contain only printable ASCII characters (no carriage returns, tabs, line breaks)'
    });
};

/**
 * DateTime type validator
 * RFC 3339 format in UTC, string(25)
 * Formats allowed:
 * - 2015-06-29T20:39:09Z
 * - 2015-06-29T20:39:09
 * - 2016-12-29T17:45:09.2Z
 * - 2016-12-29T17:45:09.2
 * - 2018-01-01T01:08:01.123Z
 * - 2018-01-01T01:08:01.123
 *
 * Note: +00:00 is not the same as UTC and is NOT allowed
 */
const dateTime = () => {
  return Joi.string()
    .max(25)
    .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z)?$/, 'RFC 3339 UTC format')
    .custom((value, helpers) => {
      // Validate that it's a valid date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return helpers.error('any.invalid');
      }

      // Ensure no timezone offset like +00:00 is used
      if (value.includes('+') || value.match(/-\d{2}:\d{2}$/)) {
        return helpers.error('dateTime.noTimezone');
      }

      return value;
    })
    .messages({
      'string.max': 'must be at most 25 characters',
      'string.pattern.name': 'must be in RFC 3339 UTC format (e.g., 2015-06-29T20:39:09Z or 2015-06-29T20:39:09)',
      'dateTime.noTimezone': 'timezone offset (+00:00) is not allowed, use Z or omit timezone designator for UTC',
      'any.invalid': 'must be a valid date'
    });
};

/**
 * String type validator
 * Case Sensitive String. Only printable UTF-8 allowed.
 * @param {number} maxLength - Maximum length
 */
const ocpiString = (maxLength) => {
  return Joi.string()
    .max(maxLength)
    .pattern(/^[^\x00-\x1F\x7F]*$/, 'printable UTF-8 only')
    .messages({
      'string.max': `must be at most ${maxLength} characters`,
      'string.pattern.name': 'must contain only printable UTF-8 characters (no carriage returns, tabs, line breaks)'
    });
};

/**
 * Number type validator
 * JSON number with 4 decimals by default
 */
const ocpiNumber = () => {
  return Joi.number()
    .precision(4)
    .messages({
      'number.base': 'must be a number'
    });
};

/**
 * Language code validator (ISO 639-1)
 */
const languageCode = () => {
  return Joi.string()
    .length(2)
    .valid(...ISO_639_1_CODES)
    .messages({
      'string.length': 'must be exactly 2 characters (ISO 639-1)',
      'any.only': 'must be a valid ISO 639-1 language code'
    });
};

module.exports = {
  ciString,
  dateTime,
  ocpiString,
  ocpiNumber,
  languageCode,
  ISO_639_1_CODES
};
