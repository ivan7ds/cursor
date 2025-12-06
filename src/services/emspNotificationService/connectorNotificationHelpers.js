const logger = require('../../utils/logger');

const { sanitizeUrl } = require('./locationNotificationHelpers');
const { getConfiguredOrganizations } = require('./organizationHelpers');

/**
 * Preparar payload de PATCH para conector específico según OCPI 2.2
 * @param {Object} connectorData - Datos del conector
 * @returns {Object} Payload de PATCH con solo campos actualizados
 */
function prepareConnectorPatchPayload(connectorData) {
    const payload = {
        last_updated: new Date().toISOString()
    };

    if (connectorData.status !== undefined) {
        payload.status = connectorData.status;
    }

    if (connectorData.power_type !== undefined) {
        payload.power_type = connectorData.power_type;
    }

    if (connectorData.voltage !== undefined) {
        payload.voltage = connectorData.voltage;
    }

    if (connectorData.amperage !== undefined) {
        payload.amperage = connectorData.amperage;
    }

    if (connectorData.tariff_id !== undefined) {
        payload.tariff_id = connectorData.tariff_id;
    }

    logger.info(`📋 Preparando payload PATCH para conector ${connectorData.id}:`, payload);
    return payload;
}

/**
 * Notificar a una organización específica sobre un conector
 * @param {Object} organization - Datos de la organización
 * @param {Object} evseData - Datos del EVSE
 * @param {Object} connectorData - Datos del conector
 */
async function notifyOrganizationAboutConnector(organization, evseData, connectorData) {
    try {
        const partyId = process.env.OCPI_PARTY_ID || 'IPD';
        const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
        const sanitizedUrl = sanitizeUrl(organization.url);
        const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evseData.location_id}/${evseData.id}/${connectorData.id}`;
        
        logger.info(`📤 Notificando conector ${connectorData.id} del EVSE ${evseData.id} a organización ${organization.party_id} en ${endpoint}`);
        
        const payload = prepareConnectorPatchPayload(connectorData);
        
        const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${organization.token}`,
                'X-Request-ID': `connector-notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            logger.info(`✅ Conector ${connectorData.id} del EVSE ${evseData.id} notificado exitosamente a organización ${organization.party_id}`);
        } else {
            const errorText = await response.text();
            logger.warn(`⚠️ Error notificando conector a organización ${organization.party_id}: HTTP ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        logger.error(`❌ Error notificando conector a organización ${organization.party_id}:`, error);
    }
}

/**
 * Notificar a todas las organizaciones sobre un conector actualizado
 * @param {Object} evseData - Datos del EVSE
 * @param {Object} connectorData - Datos del conector actualizado
 */
async function notifyConnectorUpdated(evseData, connectorData) {
    try {
        logger.info('🔌 Notificando a organizaciones sobre conector actualizado:', {
            evseId: evseData.id,
            connectorId: connectorData.id,
            changeType: connectorData.changeType
        });
        
        const organizations = await getConfiguredOrganizations();
        
        if (organizations.length === 0) {
            logger.info('📭 No hay organizaciones configuradas para notificar');
            return;
        }
        
        logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre conector actualizado ${connectorData.id}`);
        
        const notificationPromises = organizations.map(org => 
            notifyOrganizationAboutConnector(org, evseData, connectorData)
        );
        
        await Promise.allSettled(notificationPromises);
        
        logger.info('✅ Notificaciones de conector actualizado enviadas a todas las organizaciones');
        
    } catch (error) {
        logger.error('❌ Error notificando a organizaciones sobre conector actualizado:', error);
    }
}

module.exports = {
    prepareConnectorPatchPayload,
    notifyOrganizationAboutConnector,
    notifyConnectorUpdated
};

