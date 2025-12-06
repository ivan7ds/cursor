/**
 * Construye la información básica de la sesión
 */
function buildSessionBasicInfo(partyId, countryCode, sessionId) {
  return {
    emsp_party_id: partyId,
    emsp_country_code: countryCode,
    session_id: sessionId
  };
}

/**
 * Construye la información de conexión de la sesión
 */
function buildSessionConnectionInfo(sessionData, existingSession) {
  return {
    evse_uid: sessionData.evse_uid || existingSession?.evse_uid || '',
    connector_id: sessionData.connector_id ?? existingSession?.connector_id ?? ''
  };
}

/**
 * Construye la información de token de la sesión
 */
function buildSessionTokenInfo(sessionData, existingSession) {
  return {
    id_token: sessionData.cdr_token?.uid || existingSession?.id_token || ''
  };
}

/**
 * Construye las fechas de la sesión
 */
function buildSessionDates(sessionData, existingSession) {
  return {
    start_datetime: sessionData.start_date_time || existingSession?.start_datetime,
    end_datetime: sessionData.end_date_time ?? existingSession?.end_datetime
  };
}

/**
 * Construye la información de estado y costos de la sesión
 */
function buildSessionStatusAndCost(sessionData, existingSession, resolvedTotalCost) {
  const incomingStatus = sessionData.status ?? existingSession?.status;

  return {
    total_cost: resolvedTotalCost,
    status: incomingStatus || 'ACTIVE',
    kwh: sessionData.kwh ?? existingSession?.kwh ?? 0.0,
    last_updated: sessionData.last_updated || existingSession?.last_updated || new Date().toISOString()
  };
}

module.exports = {
    buildSessionBasicInfo,
    buildSessionConnectionInfo,
    buildSessionTokenInfo,
    buildSessionDates,
    buildSessionStatusAndCost
};

