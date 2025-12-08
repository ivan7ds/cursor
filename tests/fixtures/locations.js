/**
 * Fixtures de datos para tests de Locations
 */

/**
 * Location básica válida según OCPI 2.2
 */
const basicLocation = {
  id: 'LOC_TEST_001',
  country_code: 'ES',
  party_id: 'TEST',
  publish: true,
  name: 'Test Location',
  address: 'Calle de Prueba 123',
  city: 'Madrid',
  postal_code: '28001',
  country: 'ESP', // ISO 3166-1 alpha-3 (3 caracteres)
  coordinates: {
    latitude: '40.4168',
    longitude: '-3.7038'
  },
  time_zone: 'Europe/Madrid',
  evses: [],
  last_updated: new Date().toISOString()
};

/**
 * Location completa con todos los campos opcionales
 */
const completeLocation = {
  ...basicLocation,
  id: 'LOC_TEST_002',
  country_code: 'ES',
  party_id: 'TEST',
  type: 'ON_STREET',
  name: 'Complete Test Location',
  address: 'Avenida Completa 456',
  city: 'Barcelona',
  postal_code: '08001',
  country: 'ES',
  coordinates: {
    latitude: '41.3851',
    longitude: '2.1734'
  },
  evses: [],
  directions: [
    {
      language: 'es',
      text: 'Ubicado en el centro de la ciudad'
    }
  ],
  operator: {
    name: 'Test Operator'
  },
  suboperator: {
    name: 'Test Suboperator'
  },
  owner: {
    name: 'Test Owner'
  },
  facilities: ['RESTAURANT', 'HOTEL'],
  time_zone: 'Europe/Madrid',
  opening_times: {
    twentyfourseven: true
  },
  charging_when_closed: false,
  images: [
    {
      url: 'https://example.com/image.jpg',
      thumbnail: 'https://example.com/thumb.jpg',
      category: 'NETWORK',
      type: 'jpeg',
      width: 800,
      height: 600
    }
  ],
  energy_mix: {
    is_green_energy: true,
    energy_sources: [
      {
        source: 'SOLAR',
        percentage: 100
      }
    ],
    environ_impact: {
      category: 'NUCLEAR',
      amount: 0
    },
    supplier_name: 'Green Energy Supplier',
    energy_product_name: '100% Solar'
  },
  last_updated: new Date().toISOString()
};

/**
 * Location con EVSEs
 */
const locationWithEVSEs = {
  ...basicLocation,
  id: 'LOC_TEST_003',
  country_code: 'ES',
  party_id: 'TEST',
  evses: [
    {
      uid: 'EVSE_TEST_001',
      evse_id: 'EVSE-001',
      status: 'AVAILABLE',
      capabilities: ['CHARGING_PROFILE_CAPABLE'],
      connectors: [
        {
          id: 'CONN_001',
          standard: 'IEC_62196_T2',
          format: 'SOCKET',
          power_type: 'AC_1_PHASE',
          voltage: 230,
          amperage: 16,
          tariff_ids: []
        }
      ],
      last_updated: new Date().toISOString()
    }
  ]
};

/**
 * Location inválida (faltan campos requeridos)
 */
const invalidLocation = {
  id: 'LOC_INVALID',
  name: 'Invalid Location'
  // Faltan campos requeridos: address, city, postal_code, country, coordinates
};

module.exports = {
  basicLocation,
  completeLocation,
  locationWithEVSEs,
  invalidLocation
};

