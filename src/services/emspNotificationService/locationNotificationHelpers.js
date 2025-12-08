const logger = require('../../utils/logger');
const { buildAuthorizationHeader } = require('../../utils/tokenEncoding');

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
        
        // Convertir locationData a objeto plano si es una instancia de Sequelize
        const locationPlain = locationData.get ? locationData.get({ plain: true }) : locationData;
        const locationPayload = buildLocationPayload(locationPlain);
        
        // Construir el header Authorization con codificación Base64 si es necesario
        const requiresBase64 = organization.token_base64_encoded === true || organization.token_base64_encoded === 'true';
        const authHeader = buildAuthorizationHeader(organization.token, requiresBase64);
        
        logger.info(`🔐 Usando token ${requiresBase64 ? 'codificado en Base64' : 'sin codificar'} para organización ${organization.party_id}`);
        
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
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
        logger.info(`🔔 Notificando a organizaciones sobre location ${action}: ${locationData.id}`);
        
        // Convertir locationData a objeto plano si es una instancia de Sequelize
        const locationPlain = locationData.get ? locationData.get({ plain: true }) : locationData;
        logger.info(`📋 Datos de location a notificar:`, JSON.stringify(locationPlain, null, 2));
        
        const organizations = await getConfiguredOrganizations();
        
        logger.info(`🔍 Organizaciones encontradas: ${organizations.length}`);
        if (organizations.length > 0) {
            logger.info(`📋 Lista de organizaciones:`, organizations.map(org => `${org.party_id}_${org.country_code}`).join(', '));
        }
        
        if (organizations.length === 0) {
            logger.warn('⚠️ No hay organizaciones configuradas para notificar. Verifica que existan credenciales válidas en la tabla credentials con valid=true y party_id diferente al nuestro.');
            return;
        }
        
        logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre location ${action} ${locationData.id}`);
        
        const notificationPromises = organizations.map(org => 
            notifyOrganizationAboutLocation(org, locationData, 'PUT')
        );
        
        const results = await Promise.allSettled(notificationPromises);
        
        // Log detallado de resultados
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                // La función notifyOrganizationAboutLocation siempre resuelve (no lanza errores)
                // pero puede haber errores HTTP que se registran dentro de la función
                logger.info(`✅ Proceso de notificación completado para organización ${organizations[index].party_id}_${organizations[index].country_code}`);
            } else {
                logger.error(`❌ Error enviando notificación a organización ${organizations[index].party_id}_${organizations[index].country_code}:`, result.reason);
            }
        });
        
        logger.info(`✅ Proceso de notificación de location ${action} completado para ${locationData.id}`);
        
    } catch (error) {
        logger.error(`❌ Error notificando a organizaciones sobre location ${action}:`, error);
        logger.error(`❌ Stack trace:`, error.stack);
    }
}

module.exports = {
    sanitizeUrl,
    notifyLocationChange
};

