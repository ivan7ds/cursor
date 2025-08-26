const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const EVSE = sequelize.define('EVSE', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the EVSE'
  },
  location_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the location where this EVSE is located'
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'ISO 3166-1 alpha-2 country code'
  },
  party_id: {
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'CPO ID of the party that owns this EVSE'
  },
  evse_id: {
    type: DataTypes.STRING(48),
    allowNull: false,
    comment: 'EVSE ID'
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'BLOCKED', 'CHARGING', 'INOPERATIVE', 'OUTOFORDER', 'PLANNED', 'REMOVED', 'RESERVED', 'UNKNOWN'),
    allowNull: false,
    comment: 'Status of the EVSE'
  },
  capabilities: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of capabilities of this EVSE'
  },
  connectors: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'List of connectors available on this EVSE'
  },
  floor_level: {
    type: DataTypes.STRING(4),
    allowNull: true,
    comment: 'Floor level of the EVSE'
  },
  coordinates: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Geographic coordinates of the EVSE'
  },
  physical_reference: {
    type: DataTypes.STRING(16),
    allowNull: true,
    comment: 'Physical reference of the EVSE'
  },
  directions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Human-readable directions to reach the EVSE'
  },
  parking_restrictions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of parking restrictions'
  },
  group_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Group identifier for this EVSE'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp when this EVSE was last updated'
  }
}, {
  tableName: 'evses',
  timestamps: true,
  indexes: [
    {
      fields: ['location_id']
    },
    {
      fields: ['country_code', 'party_id']
    },
    {
      fields: ['evse_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['last_updated']
    }
  ]
});

module.exports = EVSE;


