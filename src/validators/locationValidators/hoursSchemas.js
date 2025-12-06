const Joi = require('joi');

const { dateTime } = require('../../utils/ocpiValidators');

const { STATUSES } = require('./enums');

/**
 * Esquemas relacionados con horarios para validadores Location
 */

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

module.exports = {
  regularHoursSchema,
  exceptionalPeriodSchema,
  hoursSchema,
  statusScheduleSchema
};

