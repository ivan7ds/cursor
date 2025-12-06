const axios = require('axios');

const { EVSE, Location } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Construye la URL del endpoint para notificación de eliminación de EVSE
 * @param {Object} organization - Organización destino
 * @param {string} evseId - ID del EVSE
 * @param {string} locationId - ID de la location
 * @returns {string} URL del endpoint
 */
function buildEVSEDeletionEndpoint(organization, evseId, locationId) {
  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  const sanitizedUrl = organization.url.replace(/\/$/, '');
  return `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${locationId}/${evseId}`;
}

/**
 * Construye la URL del endpoint para notificación de eliminación de location
 * @param {Object} organization - Organización destino
 * @param {string} locationId - ID de la location
 * @returns {string} URL del endpoint
 */
function buildLocationDeletionEndpoint(organization, locationId) {
  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  const sanitizedUrl = organization.url.replace(/\/$/, '');
  return `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${locationId}`;
}

/**
 * Construye los headers para la petición de notificación
 * @param {Object} organization - Organización destino
 * @param {string} requestType - Tipo de petición (evse-delete o location-delete)
 * @returns {Object} Headers de la petición
 */
function buildNotificationHeaders(organization, requestType) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${organization.token}`,
    'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`,
    'X-Request-ID': `${requestType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
}

/**
 * Construye el payload para eliminación de EVSE
 * @returns {Object} Payload de eliminación
 */
function buildEVSEDeletionPayload() {
  return {
    status: 'REMOVED',
    last_updated: new Date().toISOString()
  };
}

/**
 * Construye el payload para eliminación de location
 * @returns {Object} Payload de eliminación
 */
function buildLocationDeletionPayload() {
  return {
    publish: false,
    last_updated: new Date().toISOString()
  };
}

/**
 * Envía la petición PATCH de eliminación
 * @param {string} endpoint - URL del endpoint
 * @param {Object} payload - Payload de la petición
 * @param {Object} headers - Headers de la petición
 * @returns {Promise<Object>} Respuesta de la petición
 */
async function sendDeletionRequest(endpoint, payload, headers) {
  return await axios.patch(endpoint, payload, {
    headers,
    timeout: 10000
  });
}

/**
 * Construye la respuesta de éxito para notificación de eliminación
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de éxito
 * @returns {Object} Respuesta de éxito
 */
function buildSuccessResponse(statusCode, message) {
  return {
    success: true,
    statusCode,
    message
  };
}

/**
 * Construye la respuesta de error para notificación de eliminación
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de error
 * @returns {Object} Respuesta de error
 */
function buildErrorResponse(statusCode, message) {
  return {
    success: false,
    statusCode: statusCode || 500,
    message
  };
}

/**
 * Busca un EVSE por ID
 * @param {string} evseId - ID del EVSE
 * @returns {Promise<Object|null>} EVSE encontrado o null
 */
async function findEVSEForDeletion(evseId) {
  return await EVSE.findByPk(evseId);
}

/**
 * Busca una location por ID
 * @param {string} locationId - ID de la location
 * @returns {Promise<Object|null>} Location encontrada o null
 */
async function findLocationForDeletion(locationId) {
  return await Location.findByPk(locationId);
}

module.exports = {
    buildEVSEDeletionEndpoint,
    buildLocationDeletionEndpoint,
    buildNotificationHeaders,
    buildEVSEDeletionPayload,
    buildLocationDeletionPayload,
    sendDeletionRequest,
    buildSuccessResponse,
    buildErrorResponse,
    findEVSEForDeletion,
    findLocationForDeletion
};

