const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const EmspEVSE = sequelize.define('EmspEVSE', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the EVSE'
  },
  emsp_party_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'EMSP party ID'
  },
  emsp_country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'EMSP country code'
  },
  location_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the location where this EVSE is located'
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
  tableName: 'emsp_evses',
  timestamps: true,
  indexes: [
    {
      fields: ['location_id']
    },
    {
      fields: ['emsp_country_code', 'emsp_party_id']
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

module.exports = EmspEVSE;

