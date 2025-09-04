const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the session'
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'ISO 3166-1 alpha-2 country code'
  },
  party_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'CPO ID of the party that owns this session'
  },
  evse_uid: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the EVSE where the session is taking place'
  },
  connector_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Reference to the connector used for the session'
  },
  id_token: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to the token used for the session'
  },
  start_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the session started'
  },
  end_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the session ended'
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Total cost of the session'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'INVALID', 'PENDING'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    comment: 'Current status of the session'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Last time this session was updated'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When this session was created'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When this session was last updated'
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Session;