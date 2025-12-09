const logger = require('../../utils/logger');
const { buildAuthorizationHeader } = require('../../utils/tokenEncoding');

const { sanitizeUrl } = require('./locationNotificationHelpers');
const { getConfiguredOrganizations } = require('./organizationHelpers');

/**
 * Construir el payload de tarifa según especificación OCPI 2.2
 * @param {Object} tariffData - Datos de la tarifa
 * @returns {Object} Payload formateado
 */
function buildTariffPayload(tariffData) {
    const elements = tariffData.elements ? tariffData.elements.map(element => {
        if (element.price_components) {
            return {
                price_components: element.price_components
            };
        }
        
        if (element.component_type && element.price !== undefined) {
            return {
                price_components: [{
                    type: element.component_type,
                    price: element.price,
                    vat: element.vat || 0,
                    step_size: element.step || 1
                }]
            };
        }
        
        return {
            price_components: []
        };
    }) : [];

    return {
        country_code: tariffData.country_code,
        party_id: tariffData.party_id,
        id: tariffData.id,
        currency: tariffData.currency,
        type: tariffData.type,
        elements,
        start_date_time: tariffData.start_date_time || null,
        end_date_time: tariffData.end_date_time || null,
        last_updated: tariffData.last_updated || new Date().toISOString()
    };
}

/**
 * Notificar a una organización específica sobre una tarifa
 * @param {Object} organization - Datos de la organización
 * @param {Object} tariffData - Datos de la tarifa
 * @param {string} method - Método HTTP (PUT o DELETE)
 */
async function notifyOrganizationAboutTariff(organization, tariffData, method) {
    try {
        const partyId = process.env.OCPI_PARTY_ID || 'IPD';
        const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
        const sanitizedUrl = sanitizeUrl(organization.url);
        const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/tariffs/${countryCode}/${partyId}/${tariffData.id}`;
        
        logger.info(`📤 Notificando tarifa ${tariffData.id} a organización ${organization.party_id} en ${endpoint} (${method})`);
        
        const tariffPayload = buildTariffPayload(tariffData);
        
        // Construir el header Authorization con codificación Base64 si es necesario
        const requiresBase64 = organization.token_base64_encoded === true || organization.token_base64_encoded === 'true';
        const authHeader = buildAuthorizationHeader(organization.token, requiresBase64);
        
        logger.info(`🔐 Usando token ${requiresBase64 ? 'codificado en Base64' : 'sin codificar'} para organización ${organization.party_id}`);
        
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'X-Request-ID': `tariff-notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            },
            body: method === 'DELETE' ? undefined : JSON.stringify(tariffPayload)
        });
        
        if (response.ok) {
            logger.info(`✅ Tarifa ${tariffData.id} notificada exitosamente a organización ${organization.party_id}`);
        } else {
            const errorText = await response.text();
            logger.warn(`⚠️ Error notificando tarifa a organización ${organization.party_id}: HTTP ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        logger.error(`❌ Error notificando tarifa a organización ${organization.party_id}:`, error);
    }
}

/**
 * Notificar a todos los EMSPs sobre una tarifa creada
 * @param {Object} tariffData - Datos de la tarifa creada
 */
async function notifyTariffCreated(tariffData) {
    try {
        logger.info('🔔 Notificando a organizaciones sobre nueva tarifa:', tariffData.id);
        
        const organizations = await getConfiguredOrganizations();
        
        if (organizations.length === 0) {
            logger.info('📭 No hay organizaciones configuradas para notificar');
            return;
        }
        
        logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre tarifa ${tariffData.id}`);
        
        const notificationPromises = organizations.map(org => 
            notifyOrganizationAboutTariff(org, tariffData, 'PUT')
        );
        
        await Promise.allSettled(notificationPromises);
        
        logger.info('✅ Notificaciones de tarifa enviadas a todas las organizaciones');
        
    } catch (error) {
        logger.error('❌ Error notificando a organizaciones sobre tarifa:', error);
    }
}

/**
 * Notificar a todos los EMSPs sobre una tarifa eliminada
 * @param {Object} tariffData - Datos de la tarifa eliminada
 */
async function notifyTariffDeleted(tariffData) {
    try {
        const organizations = await getConfiguredOrganizations();
        
        if (organizations.length === 0) {
            logger.warn('⚠️ No hay organizaciones EMSP configuradas para notificar sobre la eliminación de la tarifa');
            return;
        }

        logger.info(`📤 Notificando eliminación de tarifa ${tariffData.id} a ${organizations.length} organizaciones EMSP`);

        const notificationPromises = organizations.map(organization => 
            notifyOrganizationAboutTariff(organization, tariffData, 'DELETE')
        );

        await Promise.allSettled(notificationPromises);
        logger.info(`✅ Notificaciones de eliminación de tarifa ${tariffData.id} enviadas a todas las organizaciones EMSP`);
    } catch (error) {
        logger.error('❌ Error notificando eliminación de tarifa a organizaciones EMSP:', error);
        throw error;
    }
}

module.exports = {
    notifyTariffCreated,
    notifyTariffDeleted
};

