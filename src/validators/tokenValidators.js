const { TOKEN_TYPES, WHITELIST_TYPES, PROFILE_TYPES } = require('./tokenValidators/enums');
const {
  tokenPatchBodySchema
} = require('./tokenValidators/patchSchemas');
const {
  validateTokenPatch,
  validateTokenPatchMiddleware
} = require('./tokenValidators/patchValidators');
const {
  tokenPutBodySchema,
  tokenPutPathSchema
} = require('./tokenValidators/putSchemas');
const {
  validateTokenPut,
  validateTokenPutMiddleware
} = require('./tokenValidators/putValidators');

module.exports = {
  tokenPutBodySchema,
  tokenPutPathSchema,
  tokenPatchBodySchema,
  validateTokenPut,
  validateTokenPutMiddleware,
  validateTokenPatch,
  validateTokenPatchMiddleware,
  TOKEN_TYPES,
  WHITELIST_TYPES,
  PROFILE_TYPES
};
