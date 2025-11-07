const { sequelize } = require('../database/connection');
const Location = require('./Location');
const EVSE = require('./EVSE');
const Session = require('./Session');
const CDR = require('./CDR');
const Tariff = require('./Tariff');
const Token = require('./Token');
const EmspToken = require('./EmspToken');
const EmspSession = require('./EmspSession')(sequelize);
const EmspEVSE = require('./EmspEVSE');
const Credentials = require('./Credentials');
const OCPIToken = require('./OCPIToken');
const ValidationError = require('./ValidationError');

// Define relationships
Location.hasMany(EVSE, { 
  foreignKey: 'location_id', 
  sourceKey: 'id',
  as: 'evseList' 
});
EVSE.belongsTo(Location, { 
  foreignKey: 'location_id', 
  targetKey: 'id',
  as: 'location' 
});

// EVSE has many Sessions (using evse_uid and id - the primary key)
EVSE.hasMany(Session, { 
  foreignKey: 'evse_uid', 
  sourceKey: 'id',
  as: 'sessionList' 
});
Session.belongsTo(EVSE, { 
  foreignKey: 'evse_uid', 
  targetKey: 'id',
  as: 'evse' 
});

// Session has one CDR
Session.hasOne(CDR, { 
  foreignKey: 'session_id', 
  sourceKey: 'id',
  as: 'cdr' 
});
CDR.belongsTo(Session, { 
  foreignKey: 'session_id', 
  targetKey: 'id',
  as: 'session' 
});

// Export all models
module.exports = {
  sequelize,
  Location,
  EVSE,
  Session,
  CDR,
  Tariff,
  Token,
  EmspToken,
  EmspSession,
  EmspEVSE,
  Credentials,
  OCPIToken,
  ValidationError
};
