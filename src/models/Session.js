const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the session'
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'ISO 3166-1 alpha-2 country code'
  },
  party_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'CPO ID of the party that owns this session'
  },
  evse_uid: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the EVSE where this session took place'
  },
  connector_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the connector used for this session'
  },
  id_token: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Token used to authorize this charging session'
  },
  session_token: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Token used to identify this session'
  },
  meter_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Identifier of the meter inside the charge point'
  },
  authorization_reference: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Reference to the authorization given by the eMSP'
  },
  location_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the location where this session took place'
  },
  start_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Start timestamp of the session'
  },
  end_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'End timestamp of the session'
  },
  kwh: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    comment: 'Total energy consumption in kWh'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'ISO 4217 currency code'
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Total cost of the session'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'INVALID', 'PENDING', 'RESERVATION'),
    allowNull: false,
    comment: 'Status of the session'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp when this session was last updated'
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['country_code', 'party_id']
    },
    {
      fields: ['evse_uid']
    },
    {
      fields: ['location_id']
    },
    {
      fields: ['start_datetime']
    },
    {
      fields: ['status']
    },
    {
      fields: ['last_updated']
    }
  ]
});

module.exports = Session;


