const logger = require('../../utils/logger');
const { buildAuthorizationHeader } = require('../../utils/tokenEncoding');

const {
    filterCapabilities,
    processConnectors,
    buildEVSEBasePayload
} = require('./evsePayloadHelpers');
const { sanitizeUrl } = require('./locationNotificationHelpers');
const { getConfiguredOrganizations } = require('./organizationHelpers');

/**
 * Preparar payload de PATCH para EVSE según OCPI 2.2
 * @param {Object} evseData - Datos del EVSE
 * @returns {Object} Payload de PATCH con solo campos actualizados
 */
function prepareEVSEPatchPayload(evseData) {
    const payload = {
        status: evseData.status,
        last_updated: new Date().toISOString()
    };

    logger.info(`📋 Preparando payload PATCH para EVSE ${evseData.id}:`, payload);
    return payload;
}

/**
 * Preparar payload de EVSE para enviar a la organización
 * @param {Object} evseData - Datos del EVSE
 * @returns {Object} Payload formateado según OCPI 2.2
 */
function prepareEVSEPayload(evseData) {
    const filteredCapabilities = filterCapabilities(evseData.capabilities);
    const processedConnectors = processConnectors(evseData.connectors);
    return buildEVSEBasePayload(evseData, filteredCapabilities, processedConnectors);
}

/**
 * Notificar a una organización específica sobre un EVSE
 * @param {Object} organization - Datos de la organización
 * @param {Object} evseData - Datos del EVSE
 * @param {string} method - Método HTTP (PUT o DELETE)
 */
async function notifyOrganizationAboutEVSE(organization, evseData, method) {
    try {
        const partyId = process.env.OCPI_PARTY_ID || 'IPD';
        const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
        const sanitizedUrl = sanitizeUrl(organization.url);
        const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evseData.location_id}/${evseData.id}`;
        
        logger.info(`📤 Notificando EVSE ${evseData.id} a organización ${organization.party_id} en ${endpoint} (${method})`);
        
        let payload;
        if (method === 'PATCH') {
            payload = prepareEVSEPatchPayload(evseData);
        } else {
            payload = prepareEVSEPayload(evseData);
        }
        
        // Construir el header Authorization con codificación Base64 si es necesario
        const requiresBase64 = organization.token_base64_encoded === true || organization.token_base64_encoded === 'true';
        const authHeader = buildAuthorizationHeader(organization.token, requiresBase64);
        
        logger.info(`🔐 Usando token ${requiresBase64 ? 'codificado en Base64' : 'sin codificar'} para organización ${organization.party_id}`);
        
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'X-Request-ID': `evse-notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            logger.info(`✅ EVSE ${evseData.id} notificado exitosamente a organización ${organization.party_id}`);
        } else {
            const errorText = await response.text();
            logger.warn(`⚠️ Error notificando EVSE a organización ${organization.party_id}: HTTP ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        logger.error(`❌ Error notificando EVSE a organización ${organization.party_id}:`, error);
    }
}

/**
 * Notificar a todos los EMSPs sobre un EVSE (creado o actualizado)
 * @param {Object} evseData - Datos del EVSE
 * @param {string} action - Acción realizada ('created' o 'updated')
 */
async function notifyEVSEChange(evseData, action) {
    try {
        logger.info(`🔔 Notificando a organizaciones sobre EVSE ${action}:`, evseData.id);
        
        const organizations = await getConfiguredOrganizations();
        
        if (organizations.length === 0) {
            logger.info('📭 No hay organizaciones configuradas para notificar');
            return;
        }
        
        logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre EVSE ${action} ${evseData.id}`);
        
        const method = action === 'updated' ? 'PATCH' : 'PUT';
        const notificationPromises = organizations.map(org => 
            notifyOrganizationAboutEVSE(org, evseData, method)
        );
        
        await Promise.allSettled(notificationPromises);
        
        logger.info(`✅ Notificaciones de EVSE ${action} enviadas a todas las organizaciones`);
        
    } catch (error) {
        logger.error(`❌ Error notificando a organizaciones sobre EVSE ${action}:`, error);
    }
}

module.exports = {
    notifyEVSEChange
};

