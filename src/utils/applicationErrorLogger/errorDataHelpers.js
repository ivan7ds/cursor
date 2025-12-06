/**
 * Construye los valores básicos del error
 */
function buildBasicErrorData(params) {
  return {
    error_type: params.error_type || 'UNKNOWN',
    direction: params.direction || 'INBOUND',
    endpoint: params.endpoint || null,
    method: params.method || null,
    status_code: params.status_code || null,
    error_message: params.error_message || 'Unknown error',
    error_stack: params.error_stack || null
  };
}

/**
 * Construye los valores de body del error
 */
function buildErrorBodyData(request_body, response_body) {
  return {
    request_body: request_body ? (typeof request_body === 'string' ? request_body : JSON.stringify(request_body)) : null,
    response_body: response_body ? (typeof response_body === 'string' ? response_body : JSON.stringify(response_body)) : null
  };
}

/**
 * Construye los valores de headers del error
 */
function buildErrorHeadersData(request_headers, response_headers) {
  return {
    request_headers: request_headers || null,
    response_headers: response_headers || null
  };
}

/**
 * Construye los valores adicionales del error
 */
function buildAdditionalErrorData(ip_address, user_agent) {
  return {
    ip_address: ip_address || null,
    user_agent: user_agent || null,
    timestamp: new Date()
  };
}

module.exports = {
    buildBasicErrorData,
    buildErrorBodyData,
    buildErrorHeadersData,
    buildAdditionalErrorData
};

