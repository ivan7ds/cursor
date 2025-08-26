const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the location'
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'ISO 3166-1 alpha-2 country code'
  },
  party_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'CPO ID of the party that owns this location'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Display name of the location'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Street/block name and house number'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'City or town'
  },
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Postal code of the location'
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'State or province'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Country name'
  },
  coordinates: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Geographic coordinates of the location'
  },
  related_locations: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of related locations'
  },
  parking_type: {
    type: DataTypes.ENUM('ALONG_MOTORWAY', 'PARKING_GARAGE', 'ON_DRIVEWAY', 'ON_STREET', 'UNDERGROUND_GARAGE'),
    allowNull: true,
    comment: 'Type of parking at the location'
  },
  evse_list: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of EVSEs at this location'
  },
  directions: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Human-readable directions to reach the location'
  },
  operator: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Operator information'
  },
  suboperator: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Sub-operator information'
  },
  owner: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Owner information'
  },
  facilities: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of facilities available at the location'
  },
  time_zone: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'IATA timezone code'
  },
  opening_times: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Opening times of the location'
  },
  charging_when_closed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    comment: 'Whether charging is possible when the location is closed'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of images related to the location'
  },
  energy_mix: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Energy mix information'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp when this location was last updated'
  }
}, {
  tableName: 'locations',
  timestamps: true,
  indexes: [
    {
      fields: ['country_code', 'party_id']
    },
    {
      fields: ['last_updated']
    }
  ]
});

module.exports = Location;


