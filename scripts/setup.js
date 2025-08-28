const { sequelize } = require('../src/database/connection');
const { redisClient } = require('../src/database/redis');
const logger = require('../src/utils/logger');
const { v4: uuidv4 } = require('uuid');

async function setupDatabase() {
  try {
    logger.info('Starting database setup...');
    
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Create tables manually
    await createTablesManually();
    logger.info('Database tables created manually');
    
    // Test Redis connection
    await redisClient.ping();
    logger.info('Redis connection established');
    
    // Create sample data using SQL
    await createSampleDataWithSQL();
    
    logger.info('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
}

async function createTablesManually() {
  // Drop existing tables if they exist
  await sequelize.query('DROP TABLE IF EXISTS sessions CASCADE');
  await sequelize.query('DROP TABLE IF EXISTS cdrs CASCADE');
  await sequelize.query('DROP TABLE IF EXISTS evses CASCADE');
  await sequelize.query('DROP TABLE IF EXISTS locations CASCADE');
  await sequelize.query('DROP TABLE IF EXISTS tariffs CASCADE');
  await sequelize.query('DROP TABLE IF EXISTS tokens CASCADE');
  await sequelize.query('DROP TABLE IF EXISTS credentials CASCADE');
  
  // Create locations table
  await sequelize.query(`
    CREATE TABLE locations (
      id VARCHAR(36) PRIMARY KEY,
      country_code VARCHAR(2) NOT NULL,
      party_id VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      postal_code VARCHAR(10),
      state VARCHAR(100),
      country VARCHAR(3) NOT NULL,
      coordinates JSONB NOT NULL,
      related_locations JSON,
      parking_type VARCHAR(50),
      evses JSON,
      directions JSON,
      operator JSON,
      suboperator JSON,
      owner JSON,
      facilities JSON,
      time_zone VARCHAR(255) NOT NULL,
      opening_times JSON,
      charging_when_closed BOOLEAN,
      images JSON,
      energy_mix JSON,
      last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
      publish BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  
  // Create evses table
  await sequelize.query(`
    CREATE TABLE evses (
      id VARCHAR(36) PRIMARY KEY,
      location_id VARCHAR(36) NOT NULL,
      country_code VARCHAR(2) NOT NULL,
      party_id VARCHAR(10) NOT NULL,
      evse_id VARCHAR(48) NOT NULL,
      status VARCHAR(50) NOT NULL,
      capabilities JSON,
      connectors JSON NOT NULL,
      floor_level VARCHAR(4),
      coordinates JSON,
      physical_reference VARCHAR(50),
      directions JSON,
      parking_restrictions JSON,
      group_id VARCHAR(36),
      last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE ON DELETE CASCADE
    )
  `);
  
  // Create tariffs table
  await sequelize.query(`
    CREATE TABLE tariffs (
      id VARCHAR(36) PRIMARY KEY,
      country_code VARCHAR(2) NOT NULL,
      party_id VARCHAR(10) NOT NULL,
      currency VARCHAR(3) NOT NULL,
      type VARCHAR(50) NOT NULL,
      elements JSON NOT NULL,
      last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  
  // Create tokens table
  await sequelize.query(`
    CREATE TABLE tokens (
      id VARCHAR(36) PRIMARY KEY,
      country_code VARCHAR(2) NOT NULL,
      party_id VARCHAR(10) NOT NULL,
      uid VARCHAR(36) NOT NULL,
      type VARCHAR(50) NOT NULL,
      auth_method VARCHAR(50) NOT NULL,
      issuer VARCHAR(255),
      valid BOOLEAN NOT NULL DEFAULT true,
      whitelist VARCHAR(50),
      last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  
  logger.info('Tables created successfully');
}

async function createSampleDataWithSQL() {
  logger.info('Creating sample data using SQL...');
  
  const partyId = 'IPD';
  const now = new Date().toISOString();
  
  // Insert locations using SQL
  const locations = [
    {
      id: uuidv4(),
      name: 'Centro Comercial Madrid',
      address: 'Calle Gran Vía 28',
      city: 'Madrid',
      postal_code: '28013',
      state: 'Madrid',
      country: 'Spain',
      coordinates: JSON.stringify({ latitude: 40.4168, longitude: -3.7038 }),
      parking_type: 'PARKING_GARAGE',
      facilities: JSON.stringify(['RESTAURANT', 'SHOPPING', 'PARKING']),
      time_zone: 'Europe/Madrid',
      charging_when_closed: true
    },
    {
      id: uuidv4(),
      name: 'Estación de Servicio Barcelona',
      address: 'Avinguda Diagonal 123',
      city: 'Barcelona',
      postal_code: '08013',
      state: 'Barcelona',
      country: 'Spain',
      coordinates: JSON.stringify({ latitude: 41.3851, longitude: 2.1734 }),
      parking_type: 'ALONG_MOTORWAY',
      facilities: JSON.stringify(['RESTAURANT', 'SHOP', 'RESTROOM']),
      time_zone: 'Europe/Madrid',
      charging_when_closed: true
    },
    {
      id: uuidv4(),
      name: 'Centro Comercial Porto',
      address: 'Rua de Santa Catarina 123',
      city: 'Porto',
      postal_code: '4000-000',
      state: 'Porto',
      country: 'Portugal',
      coordinates: JSON.stringify({ latitude: 41.1579, longitude: -8.6291 }),
      parking_type: 'PARKING_GARAGE',
      facilities: JSON.stringify(['RESTAURANT', 'SHOPPING', 'PARKING']),
      time_zone: 'Europe/Lisbon',
      charging_when_closed: true
    },
    {
      id: uuidv4(),
      name: 'Estación de Servicio Lisboa',
      address: 'Avenida da República 45',
      city: 'Lisboa',
      postal_code: '1050-000',
      state: 'Lisboa',
      country: 'Portugal',
      coordinates: JSON.stringify({ latitude: 38.7223, longitude: -9.1393 }),
      parking_type: 'ALONG_MOTORWAY',
      facilities: JSON.stringify(['RESTAURANT', 'SHOP', 'RESTROOM']),
      time_zone: 'Europe/Lisbon',
      charging_when_closed: true
    }
  ];
  
  for (const location of locations) {
    const countryCode = location.country === 'Spain' ? 'ES' : 'PT';
    const countryCode3 = location.country === 'Spain' ? 'ESP' : 'PRT';
    
    await sequelize.query(`
      INSERT INTO locations (
        id, country_code, party_id, name, address, city, postal_code, state, country,
        coordinates, parking_type, facilities, time_zone, charging_when_closed,
        related_locations, evses, directions, operator, suboperator, owner,
        opening_times, images, energy_mix, last_updated, publish, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      )
    `, {
      bind: [
        location.id, countryCode, partyId, location.name, location.address,
        location.city, location.postal_code, location.state, countryCode3,
        location.coordinates, location.parking_type, location.facilities,
        location.time_zone, location.charging_when_closed,
        '[]', '[]', '{}', '{}', null, '{}',
        '{}', '[]', '{}', now, true, now, now
      ]
    });
  }
  
  logger.info(`Created ${locations.length} sample locations`);
  
  // Create sample tariffs
  const tariffs = [
    {
      id: uuidv4(),
      currency: 'EUR',
      type: 'REGULAR',
      elements: JSON.stringify([{
        price_components: [{
          type: 'ENERGY',
          price: 0.25,
          step_size: 1
        }]
      }])
    },
    {
      id: uuidv4(),
      currency: 'EUR',
      type: 'PROFILE_FAST',
      elements: JSON.stringify([{
        price_components: [{
          type: 'ENERGY',
          price: 0.35,
          step_size: 1
        }]
      }])
    }
  ];
  
  for (const tariff of tariffs) {
    await sequelize.query(`
      INSERT INTO tariffs (
        id, country_code, party_id, currency, type, elements,
        last_updated, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, {
      bind: [
        tariff.id, 'ES', partyId, tariff.currency, tariff.type, tariff.elements,
        now, now, now
      ]
    });
  }
  
  logger.info(`Created ${tariffs.length} sample tariffs`);
  
  // Create sample tokens
  const tokens = [
    {
      id: uuidv4(),
      uid: 'TOKEN-001',
      type: 'RFID',
      auth_method: 'AUTH_REQUEST'
    },
    {
      id: uuidv4(),
      uid: 'TOKEN-002',
      type: 'QR_CODE',
      auth_method: 'AUTH_REQUEST'
    }
  ];
  
  for (const token of tokens) {
    await sequelize.query(`
      INSERT INTO tokens (
        id, country_code, party_id, uid, type, auth_method,
        last_updated, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, {
      bind: [
        token.id, 'ES', partyId, token.uid, token.type, token.auth_method,
        now, now, now
      ]
    });
  }
  
  logger.info(`Created ${tokens.length} sample tokens`);
  
  // Create sample EVSEs (simplified - just 100 for now)
  for (let i = 0; i < 100; i++) {
    const locationIndex = i % locations.length;
    const location = locations[locationIndex];
    const countryCode = location.country === 'Spain' ? 'ES' : 'PT';
    
    const evse = {
      id: uuidv4(),
      location_id: location.id,
      evse_id: `EVSE-${String(i + 1).padStart(5, '0')}`,
      status: ['AVAILABLE', 'CHARGING', 'INOPERATIVE', 'OUTOFORDER'][Math.floor(Math.random() * 4)],
      capabilities: JSON.stringify(['REMOTE_START_STOP_CAPABLE']),
      connectors: JSON.stringify([{
        id: uuidv4(),
        standard: 'IEC_62196_T2',
        format: 'SOCKET',
        power_type: 'AC_3_PHASE',
        voltage: 230,
        amperage: 32
      }]),
      physical_reference: `LOC${i + 1}`,
      coordinates: location.coordinates
    };
    
    await sequelize.query(`
      INSERT INTO evses (
        id, location_id, country_code, party_id, evse_id, status, capabilities,
        connectors, physical_reference, coordinates, last_updated, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, {
      bind: [
        evse.id, evse.location_id, countryCode, partyId, evse.evse_id,
        evse.status, evse.capabilities, evse.connectors, evse.physical_reference, evse.coordinates,
        now, now, now
      ]
    });
  }
  
  logger.info('Created 100 sample EVSEs');
}

setupDatabase();




