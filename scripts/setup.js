const { sequelize } = require('../src/database/connection');
const { redisClient } = require('../src/database/redis');
const logger = require('../src/utils/logger');
const { Location, EVSE, Tariff, Token } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

async function setupDatabase() {
  try {
    logger.info('Starting database setup...');
    
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Sync all models
    await sequelize.sync({ force: true });
    logger.info('Database models synchronized');
    
    // Test Redis connection
    await redisClient.ping();
    logger.info('Redis connection established');
    
    // Create sample data
    await createSampleData();
    
    logger.info('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
}

async function createSampleData() {
  logger.info('Creating sample data...');
  
  // Create sample locations across Spain and Portugal
  const locations = [
    {
      id: uuidv4(),
      name: 'Centro Comercial Madrid',
      address: 'Calle Gran Vía 28',
      city: 'Madrid',
      postal_code: '28013',
      state: 'Madrid',
      country: 'Spain',
      coordinates: { latitude: 40.4168, longitude: -3.7038 },
      related_locations: [],
      parking_type: 'PARKING_GARAGE',
      evse_list: [],
      directions: 'Centro de Madrid, cerca de la Puerta del Sol',
      operator: { name: 'Madrid Parking Services' },
      suboperator: null,
      owner: { name: 'Madrid City Council' },
      time_zone: 'Europe/Madrid',
      opening_times: {
        regular_hours: {
          weekday: [
            {
              period: [
                { begin: '08:00', end: '22:00' }
              ]
            }
          ]
        }
      },
      charging_when_closed: true,
      images: [],
      energy_mix: {
        is_green_energy: true,
        energy_sources: [
          { source: 'SOLAR', percentage: 100 }
        ]
      },
      facilities: { categories: ['RESTAURANT', 'SHOPPING', 'PARKING'] },
      last_updated: new Date()
    },
    {
      id: uuidv4(),
      name: 'Estación de Servicio Barcelona',
      address: 'Avinguda Diagonal 123',
      city: 'Barcelona',
      postal_code: '08013',
      state: 'Barcelona',
      country: 'Spain',
      coordinates: { latitude: 41.3851, longitude: 2.1734 },
      related_locations: [],
      parking_type: 'ALONG_MOTORWAY',
      evse_list: [],
      directions: 'Avenida Diagonal, zona comercial',
      operator: { name: 'Barcelona EV Services' },
      suboperator: null,
      owner: { name: 'Barcelona City Council' },
      time_zone: 'Europe/Madrid',
      opening_times: {
        regular_hours: {
          weekday: [
            {
              period: [
                { begin: '06:00', end: '24:00' }
              ]
            }
          ]
        }
      },
      charging_when_closed: true,
      images: [],
      energy_mix: {
        is_green_energy: true,
        energy_sources: [
          { source: 'WIND', percentage: 80 },
          { source: 'SOLAR', percentage: 20 }
        ]
      },
      facilities: { categories: ['RESTAURANT', 'SHOP', 'RESTROOM'] },
      last_updated: new Date()
    },
    {
      id: uuidv4(),
      name: 'Centro Comercial Porto',
      address: 'Rua de Santa Catarina 123',
      city: 'Porto',
      postal_code: '4000-000',
      state: 'Porto',
      country: 'Portugal',
      coordinates: { latitude: 41.1579, longitude: -8.6291 },
      related_locations: [],
      parking_type: 'PARKING_GARAGE',
      evse_list: [],
      directions: 'Centro histórico de Porto',
      operator: { name: 'Porto EV Solutions' },
      suboperator: null,
      owner: { name: 'Porto Municipality' },
      time_zone: 'Europe/Lisbon',
      opening_times: {
        regular_hours: {
          weekday: [
            {
              period: [
                { begin: '09:00', end: '21:00' }
              ]
            }
          ]
        }
      },
      charging_when_closed: true,
      images: [],
      energy_mix: {
        is_green_energy: true,
        energy_sources: [
          { source: 'HYDRO', percentage: 100 }
        ]
      },
      facilities: { categories: ['RESTAURANT', 'SHOPPING', 'PARKING'] },
      last_updated: new Date()
    },
    {
      id: uuidv4(),
      name: 'Estación de Servicio Lisboa',
      address: 'Avenida da República 45',
      city: 'Lisboa',
      postal_code: '1050-000',
      state: 'Lisboa',
      country: 'Portugal',
      coordinates: { latitude: 38.7223, longitude: -9.1393 },
      related_locations: [],
      parking_type: 'ALONG_MOTORWAY',
      evse_list: [],
      directions: 'Avenida da República, zona de servicios',
      operator: { name: 'Lisboa EV Network' },
      suboperator: null,
      owner: { name: 'Lisboa Municipality' },
      time_zone: 'Europe/Lisbon',
      opening_times: {
        regular_hours: {
          weekday: [
            {
              period: [
                { begin: '07:00', end: '23:00' }
              ]
            }
          ]
        }
      },
      charging_when_closed: true,
      images: [],
      energy_mix: {
        is_green_energy: true,
        energy_sources: [
          { source: 'WIND', percentage: 60 },
          { source: 'SOLAR', percentage: 40 }
        ]
      },
      facilities: { categories: ['RESTAURANT', 'SHOP', 'RESTROOM'] },
      last_updated: new Date()
    }
  ];
  
  for (const locationData of locations) {
    locationData.party_id = process.env.OCPI_PARTY_ID || 'ES-CPO';
    locationData.country_code = locationData.country === 'Spain' ? 'ES' : 'PT';
    await Location.create(locationData);
  }
  
  logger.info(`Created ${locations.length} sample locations`);
  
  // Create sample EVSEs (10,000 chargers distributed across locations)
  const evseTypes = ['Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'];
  const evseStatuses = ['AVAILABLE', 'CHARGING', 'INOPERATIVE', 'OUTOFORDER'];
  
  for (let i = 0; i < 10000; i++) {
    const locationIndex = i % locations.length;
    const location = locations[locationIndex];
    
    const evse = {
      id: uuidv4(),
      location_id: location.id,
      evse_id: `EVSE-${String(i + 1).padStart(5, '0')}`,
      status: evseStatuses[Math.floor(Math.random() * evseStatuses.length)],
      capabilities: ['RESERVABLE', 'RENTABLE'],
      connectors: [
        {
          id: uuidv4(),
          standard: evseTypes[Math.floor(Math.random() * evseTypes.length)],
          format: 'SOCKET',
          power_type: 'AC_3_PHASE',
          voltage: 400,
          amperage: 32,
          tariff_id: null
        }
      ],
      coordinates: location.coordinates,
      last_updated: new Date()
    };
    
    evse.party_id = location.party_id;
    evse.country_code = location.country_code;
    
    await EVSE.create(evse);
    
    if ((i + 1) % 1000 === 0) {
      logger.info(`Created ${i + 1} EVSEs`);
    }
  }
  
  logger.info('Created 10,000 sample EVSEs');
  
  // Create sample tariffs
  const tariffs = [
    {
      id: uuidv4(),
      currency: 'EUR',
      type: 'REGULAR',
      elements: [
        {
          price_components: [
            {
              type: 'ENERGY',
              price: 0.25,
              step_size: 1
            }
          ]
        }
      ],
      last_updated: new Date()
    },
    {
      id: uuidv4(),
      currency: 'EUR',
      type: 'PROFILE_FAST',
      elements: [
        {
          price_components: [
            {
              type: 'ENERGY',
              price: 0.35,
              step_size: 1
            }
          ]
        }
      ],
      last_updated: new Date()
    }
  ];
  
  for (const tariffData of tariffs) {
    tariffData.party_id = process.env.OCPI_PARTY_ID || 'ES-CPO';
    tariffData.country_code = 'ES';
    await Tariff.create(tariffData);
  }
  
  logger.info(`Created ${tariffs.length} sample tariffs`);
  
  // Create sample tokens
  const tokens = [
    {
      id: uuidv4(),
      uid: 'TOKEN-001',
      type: 'RFID',
      contract_id: 'CONTRACT-001',
      issuer: 'ES-CPO',
      valid: true,
      whitelist: 'ALWAYS',
      language: 'es',
      default_profile_type: 'REGULAR',
      last_updated: new Date()
    },
    {
      id: uuidv4(),
      uid: 'TOKEN-002',
      type: 'APP_USER',
      contract_id: 'CONTRACT-002',
      issuer: 'ES-CPO',
      valid: true,
      whitelist: 'ALLOWED',
      language: 'en',
      default_profile_type: 'FAST',
      last_updated: new Date()
    }
  ];
  
  for (const tokenData of tokens) {
    tokenData.party_id = process.env.OCPI_PARTY_ID || 'ES-CPO';
    tokenData.country_code = 'ES';
    await Token.create(tokenData);
  }
  
  logger.info(`Created ${tokens.length} sample tokens`);
  
  logger.info('Sample data creation completed');
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };




