/**
 * Helper functions for preparing EVSE payloads
 */

/**
 * Lista de capabilities válidas según OCPI 2.2
 * @returns {Array<string>} Array de capabilities válidas
 */
function getValidCapabilities() {
  return [
    'CHARGING_PROFILE_CAPABLE',
    'CREDIT_CARD_PAYABLE', 
    'REMOTE_START_STOP_CAPABLE',
    'RESERVABLE',
    'RFID_READER',
    'UNLOCK_CAPABLE',
    'CHARGING_PREFERENCES_CAPABLE',
    'CHIP_CARD_SUPPORT',
    'CONTACTLESS_CARD_SUPPORT',
    'PED_TERMINAL',
    'DEBIT_CARD_PAYABLE',
    'TOKEN_GROUP_CAPABLE'
  ];
}

/**
 * Filtra y valida las capabilities del EVSE
 * @param {Array} capabilities - Capabilities del EVSE
 * @returns {Array} Capabilities filtradas y sin duplicados
 */
function filterCapabilities(capabilities) {
  const validCapabilities = getValidCapabilities();
  
  return (capabilities || [])
    .filter(cap => validCapabilities.includes(cap))
    .filter((cap, index, arr) => arr.indexOf(cap) === index); // Eliminar duplicados
}

/**
 * Procesa un conector individual para asegurar tipos correctos
 * @param {Object} connector - Conector a procesar
 * @returns {Object} Conector procesado
 */
function processConnector(connector) {
  const processedConnector = { ...connector };
  
  // Solo incluir campos numéricos si tienen valor válido
  if (connector.max_voltage && !isNaN(parseInt(connector.max_voltage, 10))) {
    processedConnector.max_voltage = parseInt(connector.max_voltage, 10);
  } else {
    delete processedConnector.max_voltage;
  }
  
  if (connector.max_amperage && !isNaN(parseInt(connector.max_amperage, 10))) {
    processedConnector.max_amperage = parseInt(connector.max_amperage, 10);
  } else {
    delete processedConnector.max_amperage;
  }
  
  if (connector.max_electric_power && !isNaN(parseInt(connector.max_electric_power, 10))) {
    processedConnector.max_electric_power = parseInt(connector.max_electric_power, 10);
  } else {
    delete processedConnector.max_electric_power;
  }
  
  return processedConnector;
}

/**
 * Procesa todos los conectores del EVSE
 * @param {Array} connectors - Array de conectores
 * @returns {Array} Array de conectores procesados
 */
function processConnectors(connectors) {
  return (connectors || []).map(connector => processConnector(connector));
}

/**
 * Construye el payload base del EVSE
 * @param {Object} evseData - Datos del EVSE
 * @param {Array} filteredCapabilities - Capabilities filtradas
 * @param {Array} processedConnectors - Conectores procesados
 * @returns {Object} Payload del EVSE
 */
function buildEVSEBasePayload(evseData, filteredCapabilities, processedConnectors) {
  return {
    uid: evseData.id, // El UID es el ID del EVSE
    evse_id: evseData.evse_id || evseData.id, // Usar evse_id si existe, sino el ID
    status: evseData.status,
    capabilities: filteredCapabilities,
    connectors: processedConnectors,
    floor_level: evseData.floor_level || null,
    physical_reference: evseData.physical_reference || null,
    coordinates: evseData.coordinates || null,
    directions: evseData.directions || null,
    parking_restrictions: evseData.parking_restrictions || null,
    group_id: evseData.group_id || null,
    last_updated: new Date().toISOString()
  };
}

module.exports = {
    filterCapabilities,
    processConnectors,
    buildEVSEBasePayload
};

