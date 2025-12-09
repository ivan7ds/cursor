const logger = require('../../utils/logger');
const { buildAuthorizationHeader } = require('../../utils/tokenEncoding');

const { sanitizeUrl } = require('./locationNotificationHelpers');
const { getConfiguredOrganizations } = require('./organizationHelpers');

/**
 * Construir el payload de token según especificación OCPI 2.2
 * @param {Object} tokenData - Datos del token
 * @returns {Object} Payload formateado
 */
function buildTokenPayload(tokenData) {
    const payload = {
        country_code: tokenData.country_code,
        party_id: tokenData.party_id,
        uid: tokenData.uid,
        type: tokenData.type,
        contract_id: tokenData.contract_id,
        issuer: tokenData.issuer,
        valid: tokenData.valid,
        whitelist: tokenData.whitelist,
        last_updated: tokenData.last_updated || new Date().toISOString()
    };

    if (tokenData.visual_number) {
        payload.visual_number = tokenData.visual_number;
    }
    
    if (tokenData.group_id) {
        payload.group_id = tokenData.group_id;
    }
    
    if (tokenData.language) {
        payload.language = tokenData.language;
    }
    
    if (tokenData.default_profile_type) {
        payload.default_profile_type = tokenData.default_profile_type;
    }
    
    if (tokenData.energy_contract) {
        payload.energy_contract = tokenData.energy_contract;
    }

    return payload;
}

/**
 * Notificar a una organización específica sobre un token
 * @param {Object} organization - Datos de la organización
 * @param {Object} tokenData - Datos del token
 * @param {string} method - Método HTTP (PUT o DELETE)
 */
async function notifyOrganizationAboutToken(organization, tokenData, method) {
    try {
        const partyId = process.env.OCPI_PARTY_ID || 'IPD';
        const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
        const sanitizedUrl = sanitizeUrl(organization.url);
        // Cuando nosotros (CPO) notificamos a un operador externo (EMSP), usamos el endpoint del CPO
        const endpoint = `${sanitizedUrl}/ocpi/cpo/2.2/tokens/${countryCode}/${partyId}/${tokenData.uid}`;
        
        logger.info(`📤 Notificando token ${tokenData.uid} a organización ${organization.party_id} en ${endpoint} (${method})`);
        
        const tokenPayload = buildTokenPayload(tokenData);
        
        // Construir el header Authorization con codificación Base64 si es necesario
        const requiresBase64 = organization.token_base64_encoded === true || organization.token_base64_encoded === 'true';
        const authHeader = buildAuthorizationHeader(organization.token, requiresBase64);
        
        logger.info(`🔐 Usando token ${requiresBase64 ? 'codificado en Base64' : 'sin codificar'} para organización ${organization.party_id}`);
        
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'X-Request-ID': `token-notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            },
            body: method === 'DELETE' ? undefined : JSON.stringify(tokenPayload)
        });
        
        if (response.ok) {
            logger.info(`✅ Token ${tokenData.uid} notificado exitosamente a organización ${organization.party_id}`);
        } else {
            const errorText = await response.text();
            logger.warn(`⚠️ Error notificando token a organización ${organization.party_id}: HTTP ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        logger.error(`❌ Error notificando token a organización ${organization.party_id}:`, error);
    }
}

/**
 * Notificar a todos los EMSPs sobre un token creado
 * @param {Object} tokenData - Datos del token
 */
async function notifyTokenCreated(tokenData) {
    try {
        const organizations = await getConfiguredOrganizations();
        
        if (organizations.length === 0) {
            logger.warn('⚠️ No hay organizaciones EMSP configuradas para notificar sobre el nuevo token');
            return;
        }

        logger.info(`📤 Notificando nuevo token ${tokenData.uid} a ${organizations.length} organizaciones EMSP`);

        const notificationPromises = organizations.map(organization => 
            notifyOrganizationAboutToken(organization, tokenData, 'PUT')
        );

        await Promise.allSettled(notificationPromises);
        logger.info(`✅ Notificaciones de nuevo token ${tokenData.uid} enviadas a todas las organizaciones EMSP`);
    } catch (error) {
        logger.error('❌ Error notificando nuevo token a organizaciones EMSP:', error);
        throw error;
    }
}

/**
 * Notificar a todos los EMSPs sobre un token eliminado
 * @param {Object} tokenData - Datos del token
 */
async function _notifyTokenDeleted(tokenData) {
    try {
        const organizations = await getConfiguredOrganizations();
        
        if (organizations.length === 0) {
            logger.warn('⚠️ No hay organizaciones EMSP configuradas para notificar sobre la eliminación del token');
            return;
        }

        logger.info(`📤 Notificando eliminación de token ${tokenData.uid} a ${organizations.length} organizaciones EMSP`);

        const notificationPromises = organizations.map(organization => 
            notifyOrganizationAboutToken(organization, tokenData, 'DELETE')
        );

        await Promise.allSettled(notificationPromises);
        logger.info(`✅ Notificaciones de eliminación de token ${tokenData.uid} enviadas a todas las organizaciones EMSP`);
    } catch (error) {
        logger.error('❌ Error notificando eliminación de token a organizaciones EMSP:', error);
        throw error;
    }
}

module.exports = {
    notifyTokenCreated
};

