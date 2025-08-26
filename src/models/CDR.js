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
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'CPO ID of this Charging Station'
  },
  session_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Session ID that was started by this token'
  },
  evse_uid: {
    type: DataTypes.STRING(39),
    allowNull: false,
    comment: 'Uniquely identifies the EVSE within the CPOs platform'
  },
  connector_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Uniquely identifies the connector within the EVSE'
  },
  id_token: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Identification token used to start this charging session'
  },
  start_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Start date and time of the charging session'
  },
  end_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'End date and time of the charging session'
  },
  total_energy: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    comment: 'Total energy delivered in kWh'
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total cost of the charging session'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'EUR',
    comment: 'ISO 4217 code of the currency used for this CDR'
  },
  total_parking_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total parking time in seconds'
  },
  total_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total duration of the charging session in seconds'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp when this CDR was last updated'
  }
}, {
  tableName: 'cdrs',
  timestamps: false,
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
      fields: ['start_datetime']
    },
    {
      fields: ['end_datetime']
    },
    {
      fields: ['last_updated']
    }
  ]
});

module.exports = CDR;

