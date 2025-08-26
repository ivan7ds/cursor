const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Credentials = sequelize.define('Credentials', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  url: {
    type: DataTypes.STRING(512),
    allowNull: false
  },
  business_details: {
    type: DataTypes.JSON,
    allowNull: false
  },
  party_id: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'credentials',
  timestamps: true
});

module.exports = Credentials;




