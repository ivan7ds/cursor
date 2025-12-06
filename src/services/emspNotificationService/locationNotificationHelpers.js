const logger = require('../../utils/logger');

const {
  buildBasicLocationPayload,
  buildOptionalLocationPayload
} = require('./locationPayloadHelpers');
const { getConfiguredOrganizations } = require('./organizationHelpers');

/**
 * Sanitiza una URL eliminando barras finales
 * @param {string} url - URL a sanitizar
 * @returns {string} URL sin barras finales
 */
function sanitizeUrl(url) {
    if (!url) return url;
    return url.replace(/\/$/, '');
}

/**
 * Construye el payload de location según OCPI 2.2
 * @param {Object} locationData - Datos de la location
 * @returns {Object} Payload formateado
 */
function buildLocationPayload(locationData) {
    const basicPayload = buildBasicLocationPayload(locationData);
    const optionalPayload = buildOptionalLocationPayload(locationData);

    return {
        ...basicPayload,
        ...optionalPayload
    };
}

/**
 * Notificar a una organización específica sobre una location
 * @param {Object} organization - Datos de la organización
 * @param {Object} locationData - Datos de la location
 * @param {string} method - Método HTTP (PUT o DELETE)
 */
async function notifyOrganizationAboutLocation(organization, locationData, method) {
    try {
        const partyId = process.env.OCPI_PARTY_ID || 'IPD';
        const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
        const sanitizedUrl = sanitizeUrl(organization.url);
        const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${locationData.id}`;
        
        logger.info(`📤 Notificando location ${locationData.id} a organización ${organization.party_id} en ${endpoint} (${method})`);
        
        const locationPayload = buildLocationPayload(locationData);
        
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${organization.token}`,
                'X-Request-ID': `notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            },
            body: JSON.stringify(locationPayload)
        });
        
        if (response.ok) {
            logger.info(`✅ Location ${locationData.id} notificada exitosamente a organización ${organization.party_id}`);
        } else {
            const errorText = await response.text();
            logger.warn(`⚠️ Error notificando location a organización ${organization.party_id}: HTTP ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        logger.error(`❌ Error notificando location a organización ${organization.party_id}:`, error);
    }
}

/**
 * Notificar a todos los EMSPs sobre una location (creada o actualizada)
 * @param {Object} locationData - Datos de la location
 * @param {string} action - Acción realizada ('created' o 'updated')
 */
async function notifyLocationChange(locationData, action) {
    try {
        logger.info(`🔔 Notificando a organizaciones sobre location ${action}:`, locationData.id);
        
        const organizations = await getConfiguredOrganizations();
        
        if (organizations.length === 0) {
            logger.info('📭 No hay organizaciones configuradas para notificar');
            return;
        }
        
        logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre location ${action} ${locationData.id}`);
        
        const notificationPromises = organizations.map(org => 
            notifyOrganizationAboutLocation(org, locationData, 'PUT')
        );
        
        await Promise.allSettled(notificationPromises);
        
        logger.info(`✅ Notificaciones de location ${action} enviadas a todas las organizaciones`);
        
    } catch (error) {
        logger.error(`❌ Error notificando a organizaciones sobre location ${action}:`, error);
    }
}

module.exports = {
    sanitizeUrl,
    buildLocationPayload,
    notifyOrganizationAboutLocation,
    notifyLocationChange
};

