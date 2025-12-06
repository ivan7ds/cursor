/**
 * Construye los campos de actualización para PATCH de location
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object} Objeto con updateFields y replacements
 */
function buildPatchUpdateFields(updateData) {
  const updateFields = [];
  const replacements = [];

  const fieldMappings = {
    name: 'name',
    address: 'address',
    city: 'city',
    postal_code: 'postal_code',
    state: 'state',
    country: 'country',
    coordinates: 'coordinates',
    related_locations: 'related_locations',
    parking_type: 'parking_type',
    time_zone: 'time_zone',
    opening_times: 'opening_times',
    charging_when_closed: 'charging_when_closed',
    images: 'images',
    energy_mix: 'energy_mix',
    directions: 'directions',
    operator: 'operator',
    suboperator: 'suboperator',
    owner: 'owner',
    facilities: 'facilities',
    publish: 'publish',
    publish_allowed_to: 'publish_allowed_to'
  };

  for (const [key, dbField] of Object.entries(fieldMappings)) {
    if (updateData[key] !== undefined) {
      if (typeof updateData[key] === 'object' && updateData[key] !== null) {
        updateFields.push(`${dbField} = ?`);
        replacements.push(JSON.stringify(updateData[key]));
      } else {
        updateFields.push(`${dbField} = ?`);
        replacements.push(updateData[key]);
      }
    }
  }

  return { updateFields, replacements };
}

/**
 * Construye los campos de actualización para PATCH de EVSE
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object} Objeto con updateFields y replacements
 */
function buildEVSEPatchFields(updateData) {
  const updateFields = [];
  const replacements = [];

  if (updateData.status !== undefined) {
    updateFields.push('status = ?');
    replacements.push(updateData.status);
  }

  if (updateData.capabilities !== undefined) {
    updateFields.push('capabilities = ?');
    replacements.push(JSON.stringify(updateData.capabilities));
  }

  if (updateData.connectors !== undefined) {
    updateFields.push('connectors = ?');
    replacements.push(JSON.stringify(updateData.connectors));
  }

  if (updateData.physical_reference !== undefined) {
    updateFields.push('physical_reference = ?');
    replacements.push(updateData.physical_reference);
  }

  return { updateFields, replacements };
}

module.exports = {
    buildPatchUpdateFields,
    buildEVSEPatchFields
};

