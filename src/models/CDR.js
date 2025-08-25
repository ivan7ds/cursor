const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const CDR = sequelize.define('CDR', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the CDR'
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'ISO 3166-1 alpha-2 country code'
  },
  party_id: {
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'CPO ID of the party that owns this CDR'
  },
  session_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the session this CDR belongs to'
  },
  evse_uid: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the EVSE where this CDR was created'
  },
  connector_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the connector used for this CDR'
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
    comment: 'Reference to the location where this CDR was created'
  },
  start_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Start timestamp of the session'
  },
  end_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'End timestamp of the session'
  },
  total_energy: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    comment: 'Total energy consumption in kWh'
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total cost of the session'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'ISO 4217 currency code'
  },
  total_parking_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total parking time in seconds'
  },
  total_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total time in seconds'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Remark related to the charging session'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp when this CDR was last updated'
  }
}, {
  tableName: 'cdrs',
  timestamps: true,
  indexes: [
    {
      fields: ['country_code', 'party_id']
    },
    {
      fields: ['session_id']
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
      fields: ['last_updated']
    }
  ]
});

module.exports = CDR;
