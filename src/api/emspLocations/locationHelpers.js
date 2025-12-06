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
  buildEVSEPatchSuccessResponse
} = require('./evsePatchHelpers');

module.exports = {
  prepareLocationValues,
  updateLocation,
  createLocation,
  locationExists,
  ensureLocationExists,
  processEVSEs,
  upsertEVSE,
  buildPatchUpdateFields,
  buildEVSEPatchFields,
  buildEVSEPatchSuccessResponse
};
