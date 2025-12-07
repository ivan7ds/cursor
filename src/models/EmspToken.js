const { DataTypes } = require('sequelize');

const { sequelize } = require('../database/connection');

const EmspToken = sequelize.define('EmspToken', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the external operator token'
  },
  external_operator_party_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'External operator party ID (CPO, EMSP or both)'
  },
  external_operator_country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'ISO 3166-1 alpha-2 country code for external operator'
  },
  token_uid: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Unique identifier for the token'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Type of token'
  },
  contract_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Contract identifier'
  },
  visual_number: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Visual number of the token'
  },
  issuer: {
    type: DataTypes.STRING(100),
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
    type: DataTypes.STRING(50),
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
  tableName: 'external_operator_tokens',
  timestamps: true,
  indexes: [
    {
      fields: ['external_operator_party_id', 'external_operator_country_code']
    },
    {
      fields: ['last_updated']
    }
  ]
});

module.exports = EmspToken;
