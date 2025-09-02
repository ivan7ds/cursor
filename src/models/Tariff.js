const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Tariff = sequelize.define('Tariff', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the tariff'
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
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'EUR',
    comment: 'ISO 4217 code of the currency used for this tariff'
  },
  type: {
    type: DataTypes.ENUM('AD_HOC_PAYMENT', 'PROFILE_CHEAP', 'PROFILE_FAST', 'PROFILE_GREEN', 'REGULAR'),
    allowNull: false,
    defaultValue: 'REGULAR',
    comment: 'Type of tariff'
  },
  elements: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array of tariff elements'
  },
  start_date_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Start date and time of this tariff'
  },
  end_date_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'End date and time of this tariff'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp when this tariff was last updated'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when this tariff was soft deleted'
  }
}, {
  tableName: 'tariffs',
  timestamps: false,
  indexes: [
    {
      fields: ['country_code', 'party_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['currency']
    },
    {
      fields: ['start_date_time']
    },
    {
      fields: ['end_date_time']
    },
    {
      fields: ['last_updated']
    },
    {
      fields: ['deleted_at']
    }
  ]
});

module.exports = Tariff;

