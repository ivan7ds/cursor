/**
 * Construye los datos básicos de la location de prueba
 * @param {string} testId - ID de prueba
 * @returns {Object} Datos básicos de la location
 */
function buildBasicLocationData(testId) {
  return {
    id: testId,
    party_id: process.env.OCPI_PARTY_ID,
    country_code: process.env.OCPI_COUNTRY_CODE,
    publish: true,
    name: `Test Location ${testId}`,
    address: 'Test Street 123',
    city: 'Test City',
    postal_code: '12345',
    country: 'ESP',
    coordinates: {
      latitude: '40.4168',
      longitude: '-3.7038'
    },
    time_zone: 'Europe/Madrid',
    related_locations: [],
    parking_type: 'ON_STREET',
    evses: [],
    directions: []
  };
}

/**
 * Construye los datos de operadores de la location
 * @returns {Object} Datos de operadores
 */
function buildLocationOperators() {
  return {
    operator: {
      name: 'Test Operator',
      website: 'https://test-operator.com'
    },
    suboperator: {
      name: 'Test Suboperator'
    },
    owner: {
      name: 'Test Owner'
    }
  };
}

/**
 * Construye los datos de energía de la location
 * @returns {Object} Datos de energía
 */
function buildLocationEnergyMix() {
  return {
    energy_mix: {
      is_green_energy: true,
      energy_sources: [
        {
          source: 'SOLAR',
          percentage: 100
        }
      ],
      environ_impact: {
        source: 'GREEN_ENERGY',
        amount: 0
      },
      supplier_name: 'Test Green Energy',
      energy_product_name: '100% Solar'
    }
  };
}

/**
 * Construye los datos completos de la location de prueba
 * @param {string} testId - ID de prueba
 * @returns {Object} Datos completos de la location
 */
function buildTestLocationData(testId) {
  return {
    ...buildBasicLocationData(testId),
    ...buildLocationOperators(),
    facilities: ['RESTAURANT', 'HOTEL'],
    opening_times: {
      twenty_four_seven: true,
      regular_hours: []
    },
    charging_when_closed: true,
    images: [],
    ...buildLocationEnergyMix(),
    last_updated: new Date().toISOString()
  };
}

module.exports = {
    buildBasicLocationData,
    buildLocationOperators,
    buildLocationEnergyMix,
    buildTestLocationData
};

