const {
  processEVSEs,
  upsertEVSE
} = require('./locationHelpers/evseHelpers');
const {
  prepareLocationValues,
  updateLocation,
  createLocation,
  locationExists,
  ensureLocationExists
} = require('./locationHelpers/locationQueries');
const {
  buildPatchUpdateFields,
  buildEVSEPatchFields
} = require('./locationHelpers/patchHelpers');
const {
  validateEVSEExists,
  buildEVSEPatchSuccessResponse
} = require('./evsePatchHelpers');

module.exports = {
  updateLocation,
  createLocation,
  locationExists,
  ensureLocationExists,
  processEVSEs,
  upsertEVSE,
  buildPatchUpdateFields,
  validateEVSEExists,
  buildEVSEPatchSuccessResponse
};
