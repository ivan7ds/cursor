const { sequelize } = require('../database/connection');
const Location = require('./Location');
const EVSE = require('./EVSE');
const Session = require('./Session');
const CDR = require('./CDR');
const Tariff = require('./Tariff');
const Token = require('./Token');
const Credentials = require('./Credentials');

// Define relationships
Location.hasMany(EVSE, { foreignKey: 'location_id', as: 'evses' });
EVSE.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

Location.hasMany(Session, { foreignKey: 'location_id', as: 'sessions' });
Session.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

EVSE.hasMany(Session, { foreignKey: 'evse_uid', as: 'sessions' });
Session.belongsTo(EVSE, { foreignKey: 'evse_uid', as: 'evse' });

Session.hasOne(CDR, { foreignKey: 'session_id', as: 'cdr' });
CDR.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

Location.hasMany(Tariff, { foreignKey: 'location_id', as: 'tariffs' });
Tariff.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

module.exports = {
  sequelize,
  Location,
  EVSE,
  Session,
  CDR,
  Tariff,
  Token,
  Credentials
};
