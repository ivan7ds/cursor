const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the token'
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'ISO 3166-1 alpha-2 country code'
  },
  party_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'CPO ID of the party that owns this token'
  },
  uid: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Unique identifier for the token'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Type of token'
  },
  auth_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Authentication method for the token'
  },
  contract_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Contract identifier'
  },
  visual_number: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'Visual number of the token'
  },
  issuer: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: 'Issuer of the token'
  },
  group_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Group identifier for this token'
  },
  valid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    comment: 'Whether the token is valid'
  },
  whitelist: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Whitelist type for this token'
  },
  language: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Language code for this token'
  },
  default_profile_type: {
    type: DataTypes.ENUM('CHEAP', 'FAST', 'GREEN', 'REGULAR'),
    allowNull: true,
    comment: 'Default profile type for this token'
  },
  energy_contract: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Energy contract information'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp when this token was last updated'
  }
}, {
  tableName: 'tokens',
  timestamps: true,
  indexes: [
    {
      fields: ['country_code', 'party_id']
    },
    {
      fields: ['uid']
    },
    {
      fields: ['contract_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['valid']
    },
    {
      fields: ['last_updated']
    }
  ]
});

module.exports = Token;




