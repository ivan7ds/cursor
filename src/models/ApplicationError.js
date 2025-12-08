const { DataTypes } = require('sequelize');

const { sequelize } = require('../database/connection');

const ApplicationError = sequelize.define('ApplicationError', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  error_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Type of error: API_REQUEST, API_RESPONSE, SERVER_ERROR, etc.'
  },
  direction: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Direction: INBOUND (request received) or OUTBOUND (request sent)'
  },
  endpoint: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'API endpoint URL'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'HTTP method (GET, POST, PUT, PATCH, DELETE)'
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'HTTP status code'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Error message or description'
  },
  error_stack: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error stack trace if available'
  },
  request_body: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Request body (for INBOUND) or request sent (for OUTBOUND)'
  },
  response_body: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Response body received'
  },
  request_headers: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Request headers'
  },
  response_headers: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Response headers'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'IP address of the client (for INBOUND) or target server (for OUTBOUND)'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent string'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the error occurred'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'application_errors',
  timestamps: false,
  indexes: [
    {
      fields: ['timestamp']
    },
    {
      fields: ['error_type']
    },
    {
      fields: ['direction']
    },
    {
      fields: ['status_code']
    }
  ]
});

module.exports = ApplicationError;

