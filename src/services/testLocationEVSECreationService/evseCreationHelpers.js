const { EVSE } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Crea un EVSE de prueba en la location especificada
 * @param {string} locationId - ID de la location
 * @returns {Promise<Object>} EVSE creado
 */
async function createTestEVSE(locationId) {
  const testEvseId = `TEST-EVSE-${Date.now()}`;
  
  const evseData = {
    id: testEvseId,
    party_id: process.env.OCPI_PARTY_ID,
    country_code: process.env.OCPI_COUNTRY_CODE,
    location_id: locationId,
    evse_id: `${process.env.OCPI_COUNTRY_CODE}*${process.env.OCPI_PARTY_ID}*E${testEvseId}`,
    status: 'AVAILABLE',
    status_schedule: [],
    capabilities: ['RESERVABLE', 'REMOTE_START_STOP_CAPABLE'],
    connectors: [
      {
        id: 1,
        standard: 'IEC_62196_T2',
        format: 'CABLE',
        power_type: 'AC_1_PHASE',
        max_voltage: 230,
        max_amperage: 16,
        max_electric_power: 3680,
        tariff_ids: [],
        terms_and_conditions: 'https://test-operator.com/terms',
        last_updated: new Date().toISOString()
      }
    ],
    floor_level: '0',
    physical_reference: 'Test EVSE',
    directions: [],
    parking_restrictions: [],
    images: [],
    last_updated: new Date().toISOString()
  };

  const evse = await EVSE.create(evseData);
  logger.info(`✅ Test EVSE created successfully: ${evse.id}`);
  
  return evse;
}

module.exports = {
    createTestEVSE
};

