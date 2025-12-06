const { EmspEVSE } = require('../../../models');
const logger = require('../../../utils/logger');

/**
 * Procesa los EVSEs de una location
 * @param {Array} evses - Array de EVSEs
 * @param {string} party_id - Party ID
 * @param {string} country_code - Country code
 * @param {string} location_id - ID de la location
 */
async function processEVSEs(evses, party_id, country_code, location_id) {
  if (!evses || !Array.isArray(evses)) {
    return;
  }

  // Filtrar EVSEs válidos y crear promesas
  const evsePromises = evses
    .map(evse => {
      const evse_uid = evse.uid || evse.id;
      if (!evse_uid) {
        logger.warn('⚠️ EVSE sin uid o id, saltando', { evse });
        return null;
      }
      return upsertEVSE({ evseData: evse, evse_uid, party_id, country_code, location_id });
    })
    .filter(promise => promise !== null);

  // Ejecutar todas las promesas en paralelo
  await Promise.allSettled(evsePromises);
}

/**
 * Obtiene un valor con fallback
 * @param {*} value - Valor a obtener
 * @param {*} defaultValue - Valor por defecto
 * @returns {*} Valor o valor por defecto
 */
function getValueOrDefault(value, defaultValue) {
  return value !== undefined ? value : defaultValue;
}

/**
 * Obtiene el timestamp de última actualización
 * @param {*} lastUpdated - Timestamp proporcionado
 * @returns {string} Timestamp ISO
 */
function getLastUpdated(lastUpdated) {
  return getValueOrDefault(lastUpdated, new Date().toISOString());
}

/**
 * Construye los datos para actualizar un EVSE
 * @param {Object} evseData - Datos del EVSE
 * @returns {Object} Datos para actualización
 */
function buildUpdateData(evseData) {
  return {
    status: evseData.status,
    capabilities: getValueOrDefault(evseData.capabilities, []),
    connectors: getValueOrDefault(evseData.connectors, []),
    physical_reference: getValueOrDefault(evseData.physical_reference, null),
    last_updated: getLastUpdated(evseData.last_updated)
  };
}

/**
 * Construye los datos para crear un EVSE
 * @param {Object} params - Parámetros de construcción
 * @param {Object} params.evseData - Datos del EVSE
 * @param {string} params.evse_uid - UID del EVSE
 * @param {string} params.party_id - Party ID
 * @param {string} params.country_code - Country code
 * @param {string} params.location_id - ID de la location
 * @returns {Object} Datos para creación
 */
function buildCreateData({ evseData, evse_uid, party_id, country_code, location_id }) {
  return {
    id: evse_uid,
    emsp_party_id: party_id,
    emsp_country_code: country_code,
    location_id,
    evse_id: getValueOrDefault(evseData.evse_id, ''),
    status: evseData.status,
    capabilities: getValueOrDefault(evseData.capabilities, []),
    connectors: getValueOrDefault(evseData.connectors, []),
    physical_reference: getValueOrDefault(evseData.physical_reference, null),
    last_updated: getLastUpdated(evseData.last_updated)
  };
}

/**
 * Construye los datos de log para un EVSE
 * @param {Object} params - Parámetros de log
 * @param {string} params.evse_uid - UID del EVSE
 * @param {string} params.location_id - ID de la location
 * @param {string} params.status - Estado del EVSE
 * @param {string} params.party_id - Party ID
 * @param {string} params.country_code - Country code
 * @returns {Object} Datos de log
 */
function buildLogData({ evse_uid, location_id, status, party_id, country_code }) {
  return {
    evse_uid,
    location_id,
    status,
    party_id,
    country_code
  };
}

/**
 * Actualiza un EVSE existente
 * @param {Object} params - Parámetros de actualización
 * @param {Object} params.existingEvse - EVSE existente
 * @param {Object} params.evseData - Datos del EVSE
 * @param {string} params.evse_uid - UID del EVSE
 * @param {string} params.location_id - ID de la location
 * @param {string} params.party_id - Party ID
 * @param {string} params.country_code - Country code
 */
async function updateExistingEVSE({ existingEvse, evseData, evse_uid, location_id, party_id, country_code }) {
  await existingEvse.update(buildUpdateData(evseData));
  logger.info('✅ EVSE externo actualizado en emsp_evses', 
    buildLogData({ evse_uid, location_id, status: evseData.status, party_id, country_code })
  );
}

/**
 * Crea un nuevo EVSE
 * @param {Object} params - Parámetros de creación
 * @param {Object} params.evseData - Datos del EVSE
 * @param {string} params.evse_uid - UID del EVSE
 * @param {string} params.party_id - Party ID
 * @param {string} params.country_code - Country code
 * @param {string} params.location_id - ID de la location
 */
async function createNewEVSE({ evseData, evse_uid, party_id, country_code, location_id }) {
  await EmspEVSE.create(buildCreateData({ evseData, evse_uid, party_id, country_code, location_id }));
  logger.info('✅ EVSE externo creado en emsp_evses', 
    buildLogData({ evse_uid, location_id, status: evseData.status, party_id, country_code })
  );
}

/**
 * Actualiza o crea un EVSE
 * @param {Object} params - Parámetros de upsert
 * @param {Object} params.evseData - Datos del EVSE
 * @param {string} params.evse_uid - UID del EVSE
 * @param {string} params.party_id - Party ID
 * @param {string} params.country_code - Country code
 * @param {string} params.location_id - ID de la location
 */
async function upsertEVSE({ evseData, evse_uid, party_id, country_code, location_id }) {
  const existingEvse = await EmspEVSE.findOne({
    where: { id: evse_uid }
  });

  if (existingEvse) {
    await updateExistingEVSE({ existingEvse, evseData, evse_uid, location_id, party_id, country_code });
  } else {
    await createNewEVSE({ evseData, evse_uid, party_id, country_code, location_id });
  }
}

module.exports = {
    processEVSEs,
    upsertEVSE
};

