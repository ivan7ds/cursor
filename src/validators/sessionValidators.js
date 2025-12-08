const {
  cdrTokenSchema,
  priceSchema,
  chargingPeriodSchema
} = require('./sessionValidators/baseSchemas');
const { TOKEN_TYPES, AUTH_METHODS, SESSION_STATUSES } = require('./sessionValidators/enums');
const {
  sessionPatchBodySchema
} = require('./sessionValidators/patchSchemas');
const {
  validateSessionPatch,
  validateSessionPatchMiddleware
} = require('./sessionValidators/patchValidators');
const {
  sessionPutBodySchema,
  sessionPutPathSchema
} = require('./sessionValidators/putSchemas');
const {
  validateSessionPut,
  validateSessionPutMiddleware
} = require('./sessionValidators/putValidators');

module.exports = {
  sessionPutBodySchema,
  sessionPutPathSchema,
  sessionPatchBodySchema,
  cdrTokenSchema,
  priceSchema,
  chargingPeriodSchema,
  validateSessionPut,
  validateSessionPutMiddleware,
  validateSessionPatch,
  validateSessionPatchMiddleware,
  TOKEN_TYPES,
  AUTH_METHODS,
  SESSION_STATUSES
};
