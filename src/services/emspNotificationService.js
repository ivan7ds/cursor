const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

class EMSPNotificationService {
    /**
     * Notificar a todos los EMSPs sobre una nueva location
     * @param {Object} locationData - Datos de la location creada
     */
    async notifyLocationCreated(locationData) {
        try {
            logger.info('🔔 Notificando a organizaciones sobre nueva location:', locationData.id);
            
            // Obtener todas las organizaciones configuradas (excluyendo nuestro CPO)
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.info('📭 No hay organizaciones configuradas para notificar');
                return;
            }
            
            logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre location ${locationData.id}`);
            
            // Notificar a cada organización
            const notificationPromises = organizations.map(org => 
                this.notifyOrganizationAboutLocation(org, locationData, 'PUT')
            );
            
            await Promise.allSettled(notificationPromises);
            
            logger.info('✅ Notificaciones de location enviadas a todas las organizaciones');
            
        } catch (error) {
            logger.error('❌ Error notificando a organizaciones sobre location:', error);
        }
    }

    /**
     * Notificar a todas las organizaciones sobre una location actualizada
     * @param {Object} locationData - Datos de la location actualizada
     */
    async notifyLocationUpdated(locationData) {
        try {
            logger.info('🔔 Notificando a organizaciones sobre location actualizada:', locationData.id);
            
            // Obtener todas las organizaciones configuradas (excluyendo nuestro CPO)
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.info('📭 No hay organizaciones configuradas para notificar');
                return;
            }
            
            logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre location actualizada ${locationData.id}`);
            
            // Notificar a cada organización
            const notificationPromises = organizations.map(org => 
                this.notifyOrganizationAboutLocation(org, locationData, 'PUT')
            );
            
            await Promise.allSettled(notificationPromises);
            
            logger.info('✅ Notificaciones de location actualizada enviadas a todas las organizaciones');
            
        } catch (error) {
            logger.error('❌ Error notificando a organizaciones sobre location actualizada:', error);
        }
    }

    /**
     * Notificar a todas las organizaciones sobre un nuevo EVSE
     * @param {Object} evseData - Datos del EVSE creado
     */
    async notifyEVSECreated(evseData) {
        try {
            logger.info('🔔 Notificando a organizaciones sobre nuevo EVSE:', evseData.id);
            
            // Obtener todas las organizaciones configuradas (excluyendo nuestro CPO)
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.info('📭 No hay organizaciones configuradas para notificar');
                return;
            }
            
            logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre EVSE ${evseData.id}`);
            
            // Notificar a cada organización
            const notificationPromises = organizations.map(org => 
                this.notifyOrganizationAboutEVSE(org, evseData, 'POST')
            );
            
            await Promise.allSettled(notificationPromises);
            
            logger.info('✅ Notificaciones de EVSE enviadas a todas las organizaciones');
            
        } catch (error) {
            logger.error('❌ Error notificando a organizaciones sobre EVSE:', error);
        }
    }

    /**
     * Notificar a todas las organizaciones sobre un EVSE actualizado
     * @param {Object} evseData - Datos del EVSE actualizado
     */
    async notifyEVSEUpdated(evseData) {
        try {
            logger.info('🔔 Notificando a organizaciones sobre EVSE actualizado:', evseData.id);
            
            // Obtener todas las organizaciones configuradas (excluyendo nuestro CPO)
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.info('📭 No hay organizaciones configuradas para notificar');
                return;
            }
            
            logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre EVSE actualizado ${evseData.id}`);
            
            // Notificar a cada organización
            const notificationPromises = organizations.map(org => 
                this.notifyOrganizationAboutEVSE(org, evseData, 'PUT')
            );
            
            await Promise.allSettled(notificationPromises);
            
            logger.info('✅ Notificaciones de EVSE actualizado enviadas a todas las organizaciones');
            
        } catch (error) {
            logger.error('❌ Error notificando a organizaciones sobre EVSE actualizado:', error);
        }
    }

    /**
     * Obtener todas las organizaciones configuradas para notificaciones
     * @returns {Array} Lista de organizaciones configuradas
     */
    async getConfiguredOrganizations() {
        try {
            const query = `
                SELECT id, token, url, party_id, country_code, business_details
                FROM credentials 
                WHERE url IS NOT NULL 
                AND token IS NOT NULL
                AND url != ''
                AND token != ''
                AND party_id != 'IPD'
            `;
            
            const result = await sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            });
            
            logger.info(`📋 Encontradas ${result.length} organizaciones configuradas para notificaciones (excluyendo nuestro CPO)`);
            return result;
            
        } catch (error) {
            logger.error('❌ Error obteniendo organizaciones configuradas:', error);
            return [];
        }
    }

    /**
     * Notificar a una organización específica sobre una location
     * @param {Object} organization - Datos de la organización
     * @param {Object} locationData - Datos de la location
     * @param {string} method - Método HTTP (POST para crear, PUT para actualizar)
     */
    async notifyOrganizationAboutLocation(organization, locationData, method = 'PUT') {
        try {
            // Construir la URL correcta usando nuestro party_id (IPD) y country_code (ES)
            // Usamos /ocpi/emsp/ para consistencia con los PATCH requests
            const endpoint = `${organization.url}/ocpi/emsp/2.2/locations/ES/IPD/${locationData.id}`;
            
            logger.info(`📤 Notificando location ${locationData.id} a organización ${organization.party_id} en ${endpoint}`);
            
            // Preparar datos de la location para la organización
            const locationPayload = this.prepareLocationPayload(locationData);
            
            const response = await fetch(endpoint, {
                method: method,
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
     * Notificar a una organización específica sobre un EVSE
     * @param {Object} organization - Datos de la organización
     * @param {Object} evseData - Datos del EVSE
     * @param {string} method - Método HTTP (POST para crear, PUT para actualizar)
     */
    async notifyOrganizationAboutEVSE(organization, evseData, method = 'POST') {
        try {
            // Construir la URL correcta usando nuestro party_id (IPD) y country_code (ES)
            const endpoint = `${organization.url}/ocpi/cpo/2.2/evses/ES/IPD/${evseData.id}`;
            
            logger.info(`📤 Notificando EVSE ${evseData.id} a organización ${organization.party_id} en ${endpoint}`);
            
            // Preparar datos del EVSE para la organización
            const evsePayload = this.prepareEVSEPayload(evseData);
            
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${organization.token}`,
                    'X-Request-ID': `notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                },
                body: JSON.stringify(evsePayload)
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
     * Preparar payload de location para enviar a la organización
     * @param {Object} locationData - Datos de la location
     * @returns {Object} Payload formateado
     */
    prepareLocationPayload(locationData) {
        return {
            id: locationData.id,
            name: locationData.name,
            country_code: locationData.country_code,
            party_id: locationData.party_id,
            address: locationData.address,
            city: locationData.city,
            country: locationData.country,
            coordinates: locationData.coordinates,
            time_zone: locationData.time_zone,
            publish: locationData.publish || true, // Asegurar que publish sea un booleano
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Preparar payload de EVSE para enviar a la organización
     * @param {Object} evseData - Datos del EVSE
     * @returns {Object} Payload formateado
     */
    prepareEVSEPayload(evseData) {
        return {
            uid: evseData.uid,
            evse_id: evseData.evse_id,
            country_code: evseData.country_code,
            party_id: evseData.party_id,
            location_id: evseData.location_id,
            status: evseData.status,
            capabilities: evseData.capabilities,
            connectors: evseData.connectors,
            floor_level: evseData.floor_level,
            coordinates: evseData.coordinates,
            physical_reference: evseData.physical_reference,
            directions: evseData.directions,
            parking_restrictions: evseData.parking_restrictions,
            group_id: evseData.group_id,
            last_updated: new Date().toISOString()
        };
    }
}

module.exports = new EMSPNotificationService();
