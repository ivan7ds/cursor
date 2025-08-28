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
    comment: 'Reference to the EVSE where this session took place'
  },
  connector_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Reference to the connector used for this session'
  },
  id_token: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Token used to authorize this charging session'
  },
  start_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Start timestamp of the session'
  },
  end_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'End timestamp of the session'
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Total cost of the session'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'INVALID', 'PENDING', 'RESERVATION'),
    allowNull: false,
    comment: 'Status of the session'
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp when this session was last updated'
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['country_code', 'party_id']
    },
    {
      fields: ['evse_uid']
    },
    {
      fields: ['start_datetime']
    },
    {
      fields: ['last_updated']
    }
  ]
});

// Define associations
Session.associate = (models) => {
  Session.belongsTo(models.EVSE, {
    foreignKey: 'evse_uid',
    as: 'evse'
  });
};

module.exports = Session;


