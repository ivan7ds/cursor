const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const OCPIToken = sequelize.define('OCPIToken', {
  id: { 
    type: DataTypes.STRING(36), 
    primaryKey: true, 
    allowNull: false, 
    comment: 'Unique identifier for the token record' 
  },
  token: { 
    type: DataTypes.STRING(64), 
    allowNull: false, 
    unique: true,
    comment: 'OCPI authentication token' 
  },
  party_id: { 
    type: DataTypes.STRING(10), 
    allowNull: false, 
    comment: 'Party ID this token is associated with' 
  },
  country_code: { 
    type: DataTypes.STRING(2), 
    allowNull: false, 
    comment: 'ISO 3166-1 alpha-2 country code' 
  },
  is_active: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: true,
    comment: 'Whether this token is currently active' 
  },
  expires_at: { 
    type: DataTypes.DATE, 
    allowNull: true, 
    comment: 'Token expiration date (optional)' 
  },
  created_at: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW,
    comment: 'When this token was created' 
  },
  last_used_at: { 
    type: DataTypes.DATE, 
    allowNull: true, 
    comment: 'When this token was last used' 
  },
  metadata: { 
    type: DataTypes.JSON, 
    allowNull: true, 
    comment: 'Additional metadata about the token' 
  }
}, {
  tableName: 'ocpi_tokens',
  timestamps: false, // Desactivar timestamps automáticos de Sequelize
  indexes: [
    { fields: ['party_id', 'country_code'] },
    { fields: ['token'] },
    { fields: ['is_active'] },
    { fields: ['expires_at'] }
  ]
});

module.exports = OCPIToken;
