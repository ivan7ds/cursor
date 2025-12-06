/**
 * Genera un ID único para el CDR
 */
function generateCDRId(sessionData) {
  return sessionData.id || `cdr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Construye la información básica del CDR
 */
function buildCDRBasicInfo(sessionData, cdrId) {
  return {
    country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
    party_id: process.env.OCPI_PARTY_ID || 'IPD',
    id: cdrId,
    start_date_time: sessionData.start_date_time || sessionData.start_datetime,
    end_date_time: sessionData.end_date_time || sessionData.end_datetime,
    session_id: sessionData.id
  };
}

/**
 * Construye el token del CDR
 */
function buildCDRToken(sessionData) {
  return {
    uid: sessionData.auth_id?.uid || sessionData.id_token || 'unknown',
    type: sessionData.auth_id?.type || 'OTHER',
    contract_id: sessionData.auth_id?.contract_id || 'IPD-001'
  };
}

/**
 * Construye la información del conector
 */
function buildConnectorInfo(sessionData, evseData) {
  return {
    connector_id: sessionData.connector_id || '1',
    connector_standard: evseData?.connectors?.[0]?.standard || 'IEC_62196_T2',
    connector_format: evseData?.connectors?.[0]?.format || 'SOCKET',
    connector_power_type: evseData?.connectors?.[0]?.power_type || 'AC_1_PHASE'
  };
}

const {
  buildBasicLocationInfo,
  buildEVSEInfo,
  buildDefaultCoordinates
} = require('./cdrLocationHelpers');

/**
 * Construye la información de ubicación del CDR
 */
function buildCDRLocation(locationData, evseData, sessionData) {
  const connectorInfo = buildConnectorInfo(sessionData, evseData);
  const basicLocationInfo = buildBasicLocationInfo(locationData);
  const evseInfo = buildEVSEInfo(evseData);

  return {
    ...basicLocationInfo,
    ...evseInfo,
    ...connectorInfo
  };
}

/**
 * Construye la información de costos del CDR
 */
function buildCDRCostInfo(sessionData) {
  return {
    currency: sessionData.currency || 'EUR',
    total_cost: {
      excl_vat: sessionData.total_cost || 0.0
    },
    total_energy: sessionData.kwh || 0.0
  };
}

module.exports = {
    generateCDRId,
    buildCDRBasicInfo,
    buildCDRToken,
    buildCDRLocation,
    buildCDRCostInfo
};

