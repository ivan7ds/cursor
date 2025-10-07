function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}

const baseLocation = {
  id: 'LOC-ES-IPD-0001',
  country_code: 'ES',
  party_id: 'IPD',
  name: 'IPD Demo Charging Hub Madrid',
  address: 'Calle Mayor 1',
  city: 'Madrid',
  postal_code: '28013',
  state: 'Madrid',
  country: 'ES',
  coordinates: {
    latitude: 40.4168,
    longitude: -3.7038,
  },
  related_locations: [],
  parking_type: 'PARKING_GARAGE',
  directions: [],
  operator: {
    name: 'IPD Charging',
  },
  suboperator: null,
  owner: null,
  facilities: ['RESTAURANT', 'PARKING'],
  time_zone: 'Europe/Madrid',
  opening_times: null,
  charging_when_closed: true,
  images: [],
  energy_mix: null,
  publish: true,
  evses: [
    {
      uid: 'ES*IPD*E*0001',
      id: 'ES*IPD*E*0001',
      location_id: 'LOC-ES-IPD-0001',
      country_code: 'ES',
      party_id: 'IPD',
      evse_id: 'ES*IPD*E*0001',
      status: 'AVAILABLE',
      capabilities: ['REMOTE_START_STOP_CAPABLE'],
      connectors: [
        {
          id: '1',
          standard: 'IEC_62196_T2',
          format: 'SOCKET',
          power_type: 'AC_3_PHASE',
          max_voltage: 400,
          max_amperage: 32,
          max_electric_power: 22,
          tariff_ids: [],
        },
      ],
      physical_reference: 'A1',
      floor_level: '1',
      directions: [],
      parking_restrictions: [],
    },
  ],
};

const baseEvse = baseLocation.evses[0];

function timestampNow() {
  return new Date().toISOString();
}

function decorateEvse(evse, timestamp) {
  const cloned = deepClone(evse);
  cloned.last_updated = timestamp;
  cloned.connectors = cloned.connectors.map((connector, index) => ({
    ...connector,
    id: connector.id || String(index + 1),
    last_updated: timestamp,
    tariff_ids: connector.tariff_ids || [],
  }));
  return cloned;
}

function decorateLocation(location, timestamp) {
  const cloned = deepClone(location);
  cloned.last_updated = timestamp;
  cloned.evses = cloned.evses.map(evse => decorateEvse(evse, timestamp));
  return cloned;
}

function getFallbackLocations() {
  const timestamp = timestampNow();
  return [decorateLocation(baseLocation, timestamp)];
}

function getFallbackEvses() {
  const timestamp = timestampNow();
  return [decorateEvse(baseEvse, timestamp)];
}

module.exports = {
  getFallbackLocations,
  getFallbackEvses,
};
