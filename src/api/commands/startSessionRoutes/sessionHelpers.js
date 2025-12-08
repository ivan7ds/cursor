const { v4: uuidv4 } = require('uuid');

const { EVSE, Session, CDR } = require('../../../models');

/**
 * Busca un EVSE por ID y location_id
 */
async function findEVSEForSession(evse_uid, location_id) {
  return EVSE.findOne({
    where: {
      id: evse_uid,
      location_id,
      deleted_at: null
    }
  });
}

/**
 * Crea una nueva sesión en la base de datos
 */
async function createSession(token, evse_uid, connector_id) {
  const sessionId = uuidv4();
  await Session.create({
    id: sessionId,
    country_code: token.country_code || process.env.OCPI_COUNTRY_CODE || 'ES',
    party_id: token.party_id || process.env.OCPI_PARTY_ID || 'IPD',
    evse_uid,
    connector_id: connector_id || (evse_uid.connectors && evse_uid.connectors[0] ? evse_uid.connectors[0].id : null),
    id_token: token.uid,
    start_datetime: new Date(),
    status: 'ACTIVE',
    last_updated: new Date()
  });
  return sessionId;
}

/**
 * Crea un CDR para la sesión
 */
async function createCDRForSession(token, sessionId, evse_uid, evse) {
  const cdrId = uuidv4();
  const connector_id = evse.connectors && evse.connectors[0] ? evse.connectors[0].id : null;
  await CDR.create({
    id: cdrId,
    country_code: token.country_code,
    party_id: token.party_id,
    session_id: sessionId,
    evse_uid,
    connector_id,
    id_token: token.uid,
    start_datetime: new Date(),
    end_datetime: new Date(),
    total_energy: 0.0,
    total_cost: 0.0,
    currency: 'EUR',
    total_parking_time: 0,
    total_time: 0,
    last_updated: new Date()
  });
  return cdrId;
}

/**
 * Actualiza el estado del EVSE a CHARGING
 */
async function updateEVSEToCharging(evse_uid) {
  await EVSE.update(
    {
      status: 'CHARGING',
      last_updated: new Date()
    },
    {
      where: { id: evse_uid }
    }
  );
}

module.exports = {
    findEVSEForSession,
    createSession,
    createCDRForSession,
    updateEVSEToCharging
};

