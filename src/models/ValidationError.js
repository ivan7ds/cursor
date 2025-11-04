const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ValidationError = sequelize.define('ValidationError', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  endpoint: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'API endpoint that received the invalid request'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'HTTP method (GET, POST, PUT, PATCH, DELETE)'
  },
  request_body: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string of the request body that failed validation'
  },
  validation_errors: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array of validation error details from Joi'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'IP address of the client that sent the request'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent string from the request'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the validation error occurred'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'validation_errors',
  timestamps: false,
  indexes: [
    {
      fields: ['timestamp']
    },
    {
      fields: ['endpoint']
    }
  ]
});

module.exports = ValidationError;
