const {
  validateEVSEExists,
  buildEVSEPatchSuccessResponse
} = require('./evsePatchHelpers');
const {
  processEVSEs,
  upsertEVSE
} = require('./locationHelpers/evseHelpers');
const {
  updateLocation,
  createLocation,
  locationExists,
  ensureLocationExists
} = require('./locationHelpers/locationQueries');
const {
  buildPatchUpdateFields
} = require('./locationHelpers/patchHelpers');

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
