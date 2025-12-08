/**
 * Limpia campos no OCPI de la ubicación
 */
function removeNonOCPIFields(cleanLocation) {
  delete cleanLocation.createdAt;
  delete cleanLocation.updatedAt;
}

/**
 * Normaliza campos de array vacíos
 */
function normalizeEmptyArrays(cleanLocation) {
  if (!cleanLocation.related_locations || Object.keys(cleanLocation.related_locations).length === 0) {
    cleanLocation.related_locations = [];
  }
  if (!cleanLocation.images || cleanLocation.images.length === 0) {
    cleanLocation.images = null;
  }
}

/**
 * Verifica si un objeto está vacío
 * @param {*} obj - Objeto a verificar
 * @returns {boolean} True si está vacío o es falsy
 */
function isEmptyObject(obj) {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * Normaliza un campo de objeto vacío a null
 * @param {Object} cleanLocation - Objeto location a normalizar
 * @param {string} fieldName - Nombre del campo a normalizar
 */
function normalizeEmptyObjectField(cleanLocation, fieldName) {
  if (isEmptyObject(cleanLocation[fieldName])) {
    cleanLocation[fieldName] = null;
  }
}

/**
 * Normaliza campos de objeto vacíos
 */
function normalizeEmptyObjects(cleanLocation) {
  normalizeEmptyObjectField(cleanLocation, 'directions');
  normalizeEmptyObjectField(cleanLocation, 'operator');
  normalizeEmptyObjectField(cleanLocation, 'owner');
  normalizeEmptyObjectField(cleanLocation, 'opening_times');
  normalizeEmptyObjectField(cleanLocation, 'energy_mix');
}

/**
 * Asegura que el campo publish existe
 */
function ensurePublishField(cleanLocation) {
  if (cleanLocation.publish === undefined) {
    cleanLocation.publish = true;
  }
}

module.exports = {
    removeNonOCPIFields,
    normalizeEmptyArrays,
    normalizeEmptyObjects,
    ensurePublishField
};

