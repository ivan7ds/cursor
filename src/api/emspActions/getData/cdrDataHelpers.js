/**
 * Construye los valores básicos del CDR para guardar
 */
function buildCDRBasicValues(cdr, org) {
  return [
    cdr.id,
    org.party_id,
    org.country_code,
    cdr.id,
    cdr.session_id || cdr.id
  ];
}

/**
 * Construye los valores de ubicación del CDR
 */
function buildCDRLocationValues(cdr) {
  return [
    cdr.cdr_location?.evse_uid || cdr.evse_uid || 'unknown',
    cdr.cdr_location?.connector_id || cdr.connector_id || null
  ];
}

/**
 * Construye los valores de autenticación del CDR
 */
function buildCDRAuthValues(cdr) {
  return [
    cdr.auth_id || cdr.authorization_reference || 'unknown'
  ];
}

/**
 * Construye las fechas del CDR
 */
function buildCDRDates(cdr) {
  return [
    cdr.start_date_time || new Date().toISOString(),
    cdr.end_date_time || new Date().toISOString()
  ];
}

/**
 * Construye los valores de costos del CDR
 */
function buildCDRCostValues(cdr) {
  return [
    cdr.total_energy || 0,
    cdr.currency || 'EUR',
    typeof cdr.total_cost === 'number' ? cdr.total_cost : (cdr.total_cost?.excl_vat ?? 0),
    cdr.total_time || 0,
    cdr.last_updated || new Date().toISOString()
  ];
}

module.exports = {
    buildCDRBasicValues,
    buildCDRLocationValues,
    buildCDRAuthValues,
    buildCDRDates,
    buildCDRCostValues
};

