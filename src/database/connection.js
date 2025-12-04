const { Sequelize } = require('sequelize');

const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cpo_ocpi',
  process.env.DB_USER || 'cpo_user',
  process.env.DB_PASSWORD || 'your_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

module.exports = { sequelize };


