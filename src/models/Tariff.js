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
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'CPO ID of the party that owns this tariff'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'ISO 4217 currency code'
  },
  type: {
    type: DataTypes.ENUM('AD_HOC_PAYMENT', 'PROFILE_CHEAP', 'PROFILE_FAST', 'REGULAR'),
    allowNull: false,
    comment: 'Type of tariff'
  },
  tariff_alt_text: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Alternative text for the tariff'
  },
  tariff_alt_url: {
    type: DataTypes.STRING(512),
    allowNull: true,
    comment: 'Alternative URL for the tariff'
  },
  min_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Minimum price of the tariff'
  },
  max_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Maximum price of the tariff'
  },
  elements: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'List of tariff elements'
  },
  start_date_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Start date and time of the tariff'
  },
  end_date_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'End date and time of the tariff'
  },
  energy_mix: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Energy mix information'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp when this tariff was last updated'
  }
}, {
  tableName: 'tariffs',
  timestamps: true,
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
    }
  ]
});

module.exports = Tariff;
