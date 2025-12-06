/**
 * Construye la información básica de la sesión
 */
function buildSessionBasicInfo(session, org) {
  return {
    emsp_party_id: org.party_id,
    emsp_country_code: org.country_code,
    country_code: session.country_code || org.country_code,
    party_id: session.party_id || org.party_id,
    session_id: session.id
  };
}

/**
 * Construye las fechas de la sesión
 */
function buildSessionDates(session) {
  return {
    start_date_time: session.start_date_time ? new Date(session.start_date_time) : null,
    end_date_time: session.end_date_time ? new Date(session.end_date_time) : null,
    start_datetime: session.start_date_time ? new Date(session.start_date_time) : new Date(),
    end_datetime: session.end_date_time ? new Date(session.end_date_time) : null
  };
}

/**
 * Construye el token del CDR
 */
function buildSessionCDRToken(session) {
  if (!session.auth_id) {
    return null;
  }

  return {
    uid: session.auth_id.uid,
    type: session.auth_id.type,
    issuer: session.auth_id.issuer
  };
}

/**
 * Obtiene el ID del token
 */
function getSessionTokenId(session) {
  return session.auth_id?.uid || session.id || 'unknown';
}

/**
 * Construye la información de costos
 */
function buildSessionCostInfo(session) {
  return {
    kwh: session.kwh || 0.0,
    currency: session.currency || 'EUR',
    total_cost: typeof session.total_cost === 'number' ? session.total_cost : (session.total_cost?.excl_vat ?? null)
  };
}

/**
 * Construye la información de ubicación y conexión
 */
function buildSessionLocationInfo(session) {
  return {
    location_id: session.location_id || null,
    evse_uid: session.evse_uid || session.location_id || 'unknown',
    connector_id: session.connector_id || null
  };
}

module.exports = {
    buildSessionBasicInfo,
    buildSessionDates,
    buildSessionCDRToken,
    getSessionTokenId,
    buildSessionCostInfo,
    buildSessionLocationInfo
};

