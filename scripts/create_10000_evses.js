const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../src/database/connection');
const { Location, EVSE } = require('../src/models');
const logger = require('../src/utils/logger');

// Configuración
const TOTAL_EVSES = 10000;
const MAX_EVSES_PER_LOCATION = 25;
const SPAIN_PERCENTAGE = 0.9; // 90% España
const PORTUGAL_PERCENTAGE = 0.1; // 10% Portugal

// Coordenadas de España y Portugal (lat, lng)
const SPAIN_COORDINATES = [
  { lat: 40.4168, lng: -3.7038, city: 'Madrid' },
  { lat: 41.3851, lng: 2.1734, city: 'Barcelona' },
  { lat: 37.3891, lng: -5.9845, city: 'Sevilla' },
  { lat: 36.7213, lng: -4.4214, city: 'Málaga' },
  { lat: 39.4699, lng: -0.3763, city: 'Valencia' },
  { lat: 42.8782, lng: -8.5449, city: 'Santiago de Compostela' },
  { lat: 43.2627, lng: -2.9253, city: 'Bilbao' },
  { lat: 38.3452, lng: -0.4810, city: 'Alicante' },
  { lat: 36.8381, lng: -2.4597, city: 'Almería' },
  { lat: 39.5696, lng: 2.6502, city: 'Palma de Mallorca' },
  { lat: 28.1248, lng: -15.4300, city: 'Las Palmas' },
  { lat: 28.4636, lng: -16.2518, city: 'Santa Cruz de Tenerife' },
  { lat: 42.2406, lng: -8.7207, city: 'Vigo' },
  { lat: 41.6552, lng: -4.7237, city: 'Valladolid' },
  { lat: 40.9716, lng: -5.6635, city: 'Salamanca' },
  { lat: 38.9861, lng: -3.9291, city: 'Ciudad Real' },
  { lat: 37.1773, lng: -3.5986, city: 'Granada' },
  { lat: 42.3500, lng: -3.7000, city: 'Burgos' },
  { lat: 39.4623, lng: -6.3721, city: 'Cáceres' },
  { lat: 41.9028, lng: 1.8268, city: 'Lleida' }
];

const PORTUGAL_COORDINATES = [
  { lat: 38.7223, lng: -9.1393, city: 'Lisboa' },
  { lat: 41.1579, lng: -8.6291, city: 'Porto' },
  { lat: 40.6405, lng: -8.6538, city: 'Aveiro' },
  { lat: 40.2114, lng: -8.4292, city: 'Coimbra' },
  { lat: 37.0194, lng: -7.9322, city: 'Faro' },
  { lat: 38.5665, lng: -7.9092, city: 'Évora' },
  { lat: 39.7436, lng: -8.8071, city: 'Leiria' },
  { lat: 41.5518, lng: -8.4229, city: 'Braga' },
  { lat: 40.5364, lng: -7.2653, city: 'Guarda' },
  { lat: 39.3167, lng: -7.4167, city: 'Portalegre' }
];

// Estados posibles para EVSEs
const EVSE_STATUSES = ['AVAILABLE', 'CHARGING', 'INOPERATIVE', 'OUTOFORDER', 'BLOCKED', 'RESERVED'];

// Capacidades válidas según OCPI 2.2
const EVSE_CAPABILITIES = [
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

// Estándares de conectores
const CONNECTOR_STANDARDS = ['IEC_62196_T2', 'IEC_62196_T3', 'IEC_61851', 'IEC_60309', 'DOMESTIC_A', 'DOMESTIC_B', 'DOMESTIC_C', 'DOMESTIC_D', 'DOMESTIC_E', 'DOMESTIC_F', 'DOMESTIC_G', 'DOMESTIC_H', 'DOMESTIC_I', 'DOMESTIC_J', 'DOMESTIC_K', 'DOMESTIC_L', 'OTHER'];
const CONNECTOR_FORMATS = ['SOCKET', 'CABLE'];
const POWER_TYPES = ['AC_1_PHASE', 'AC_3_PHASE', 'DC'];

async function createLocationsAndEVSEs() {
  try {
    logger.info('🚀 Iniciando creación de 10,000 EVSEs...');
    
    const spainEVSEs = Math.floor(TOTAL_EVSES * SPAIN_PERCENTAGE);
    const portugalEVSEs = TOTAL_EVSES - spainEVSEs;
    
    logger.info(`📊 Distribución: ${spainEVSEs} EVSEs en España (90%), ${portugalEVSEs} EVSEs en Portugal (10%)`);
    
    // Crear locations y EVSEs para España
    await createCountryEVSEs('ES', 'ESP', SPAIN_COORDINATES, spainEVSEs);
    
    // Crear locations y EVSEs para Portugal  
    await createCountryEVSEs('PT', 'PRT', PORTUGAL_COORDINATES, portugalEVSEs);
    
    logger.info('✅ Creación de 10,000 EVSEs completada exitosamente');
    
  } catch (error) {
    logger.error('❌ Error creando EVSEs:', error);
    throw error;
  }
}

async function createCountryEVSEs(countryCode, countryName, coordinates, totalEVSEs) {
  logger.info(`🏗️ Creando ${totalEVSEs} EVSEs para ${countryName}...`);
  
  let evseCount = 0;
  let locationCount = 0;
  
  while (evseCount < totalEVSEs) {
    const remainingEVSEs = totalEVSEs - evseCount;
    const evsesInThisLocation = Math.min(MAX_EVSES_PER_LOCATION, remainingEVSEs);
    
    // Seleccionar coordenadas aleatorias
    const coord = coordinates[Math.floor(Math.random() * coordinates.length)];
    
    // Crear location
    const location = await createLocation(countryCode, countryName, coord, locationCount + 1);
    locationCount++;
    
    // Crear EVSEs para esta location
    for (let i = 0; i < evsesInThisLocation; i++) {
      await createEVSE(location.id, countryCode, evseCount + 1);
      evseCount++;
      
      if (evseCount % 100 === 0) {
        logger.info(`📈 Progreso ${countryName}: ${evseCount}/${totalEVSEs} EVSEs creados`);
      }
    }
  }
  
  logger.info(`✅ ${countryName}: ${evseCount} EVSEs creados en ${locationCount} locations`);
}

async function createLocation(countryCode, countryName, coord, locationNumber) {
  const locationId = uuidv4();
  const cityName = coord.city;
  
  const locationData = {
    id: locationId,
    party_id: process.env.OCPI_PARTY_ID || 'IPD',
    country_code: countryCode,
    name: `Estación de Carga ${cityName} ${locationNumber}`,
    address: `Calle Principal ${Math.floor(Math.random() * 999) + 1}, ${cityName}`,
    city: cityName,
    postal_code: Math.floor(Math.random() * 90000) + 10000,
    country: countryName,
    coordinates: {
      latitude: (coord.lat + (Math.random() - 0.5) * 0.1).toString(),
      longitude: (coord.lng + (Math.random() - 0.5) * 0.1).toString()
    },
    time_zone: countryCode === 'ES' ? 'Europe/Madrid' : 'Europe/Lisbon',
    publish: true,
    last_updated: new Date().toISOString()
  };
  
  return await Location.create(locationData);
}

async function createEVSE(locationId, countryCode, evseNumber) {
  const evseId = uuidv4();
  const evseUid = `${countryCode}*${process.env.OCPI_PARTY_ID || 'IPD'}*E${evseId.substring(0, 8)}`;
  
  // Seleccionar capacidades aleatorias (1-3 capacidades)
  const numCapabilities = Math.floor(Math.random() * 3) + 1;
  const capabilities = [];
  for (let i = 0; i < numCapabilities; i++) {
    const cap = EVSE_CAPABILITIES[Math.floor(Math.random() * EVSE_CAPABILITIES.length)];
    if (!capabilities.includes(cap)) {
      capabilities.push(cap);
    }
  }
  
  // Crear conector
  const connector = {
    id: 1,
    standard: CONNECTOR_STANDARDS[Math.floor(Math.random() * CONNECTOR_STANDARDS.length)],
    format: CONNECTOR_FORMATS[Math.floor(Math.random() * CONNECTOR_FORMATS.length)],
    power_type: POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)],
    max_voltage: [230, 400, 500, 750, 1000][Math.floor(Math.random() * 5)],
    max_amperage: [16, 32, 63, 125, 250][Math.floor(Math.random() * 5)],
    max_electric_power: 0, // Se calculará
    tariff_ids: [],
    last_updated: new Date().toISOString()
  };
  
  // Calcular potencia máxima
  connector.max_electric_power = connector.max_voltage * connector.max_amperage;
  
  const evseData = {
    id: evseId,
    party_id: process.env.OCPI_PARTY_ID || 'IPD',
    country_code: countryCode,
    location_id: locationId,
    evse_id: evseUid,
    status: EVSE_STATUSES[Math.floor(Math.random() * EVSE_STATUSES.length)],
    capabilities: capabilities,
    connectors: [connector],
    floor_level: Math.floor(Math.random() * 5).toString(),
    physical_reference: `EVSE-${evseNumber.toString().padStart(6, '0')}`,
    directions: [],
    parking_restrictions: [],
    images: [],
    last_updated: new Date().toISOString()
  };
  
  return await EVSE.create(evseData);
}

// Ejecutar el script
if (require.main === module) {
  createLocationsAndEVSEs()
    .then(() => {
      logger.info('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { createLocationsAndEVSEs };
