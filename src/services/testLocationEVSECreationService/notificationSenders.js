const axios = require('axios');

const logger = require('../../utils/logger');

/**
 * Sanitiza una URL eliminando barras finales
 * @param {string} url - URL a sanitizar
 * @returns {string} URL sin barras finales
 */
function sanitizeUrl(url) {
  return url.replace(/\/+$/, '');
}

/**
 * Prepara el payload de location según OCPI 2.2
 * @param {Object} locationData - Datos de la location
 * @returns {Object} Payload formateado
 */
function prepareLocationPayload(locationData) {
  return {
    country_code: locationData.country_code,
    party_id: locationData.party_id,
    id: locationData.id,
    publish: true,
    name: locationData.name,
    address: locationData.address,
    city: locationData.city,
    postal_code: locationData.postal_code,
    country: locationData.country,
    coordinates: locationData.coordinates,
    time_zone: locationData.time_zone || 'Europe/Madrid',
    last_updated: locationData.last_updated
  };
}

/**
 * Prepara el payload de EVSE según OCPI 2.2
 * @param {Object} evseData - Datos del EVSE
 * @returns {Object} Payload formateado
 */
function prepareEVSEPayload(evseData) {
  return {
    uid: evseData.id,
    status: evseData.status,
    capabilities: evseData.capabilities,
    connectors: evseData.connectors,
    floor_level: evseData.floor_level,
    physical_reference: evseData.physical_reference,
    directions: evseData.directions,
    parking_restrictions: evseData.parking_restrictions,
    images: evseData.images || [],
    last_updated: evseData.last_updated
  };
}

/**
 * Envía notificación de location a una organización
 * @param {Object} organization - Datos de la organización
 * @param {Object} locationData - Datos de la location
 * @returns {Promise<Object>} Resultado de la notificación
 */
async function sendLocationNotification(organization, locationData) {
  try {
    const partyId = process.env.OCPI_PARTY_ID || 'IPD';
    const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
    const sanitizedUrl = sanitizeUrl(organization.url);
    const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${locationData.id}`;
    
    logger.info(`📤 Sending location notification to ${organization.party_id} at ${endpoint}`);
    
    const payload = prepareLocationPayload(locationData);
    
    const response = await axios.put(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${organization.token}`,
        'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`,
        'X-Request-ID': `location-create-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      timeout: 10000
    });
    
    logger.info(`✅ Location notification sent successfully to ${organization.party_id}: ${response.status}`);
    
    return {
      success: true,
      statusCode: response.status,
      message: 'Location notification accepted'
    };
    
  } catch (error) {
    logger.error(`❌ Failed to send location notification to ${organization.party_id}:`, error.message);
    return {
      success: false,
      statusCode: error.response?.status || 500,
      message: `Location notification failed: ${error.message}`
    };
  }
}

/**
 * Envía notificación de EVSE a una organización
 * @param {Object} organization - Datos de la organización
 * @param {Object} evseData - Datos del EVSE
 * @returns {Promise<Object>} Resultado de la notificación
 */
async function sendEVSENotification(organization, evseData) {
  try {
    const partyId = process.env.OCPI_PARTY_ID || 'IPD';
    const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
    const sanitizedUrl = sanitizeUrl(organization.url);
    const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evseData.location_id}/${evseData.id}`;
    
    logger.info(`📤 Sending EVSE notification to ${organization.party_id} at ${endpoint}`);
    
    const payload = prepareEVSEPayload(evseData);
    
    const response = await axios.put(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${organization.token}`,
        'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`,
        'X-Request-ID': `evse-create-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      timeout: 10000
    });
    
    logger.info(`✅ EVSE notification sent successfully to ${organization.party_id}: ${response.status}`);
    
    return {
      success: true,
      statusCode: response.status,
      message: 'EVSE notification accepted'
    };
    
  } catch (error) {
    logger.error(`❌ Failed to send EVSE notification to ${organization.party_id}:`, error.message);
    return {
      success: false,
      statusCode: error.response?.status || 500,
      message: `EVSE notification failed: ${error.message}`
    };
  }
}

module.exports = {
    sendLocationNotification,
    sendEVSENotification
};

