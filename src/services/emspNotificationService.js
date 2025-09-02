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
                this.notifyOrganizationAboutEVSE(org, evseData, 'PUT')
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
    async notifyOrganizationAboutEVSE(organization, evseData, method = 'PUT') {
        try {
            // Construir la URL correcta según OCPI 2.2: /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}
            const endpoint = `${organization.url}/ocpi/emsp/2.2/locations/ES/IPD/${evseData.location_id}/${evseData.id}`;
            
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
     * @returns {Object} Payload formateado según OCPI 2.2
     */
    prepareEVSEPayload(evseData) {
        // Filtrar capabilities válidas según OCPI 2.2
        const validCapabilities = [
            'CHARGING_PROFILE_CAPABLE',
            'CREDIT_CARD_PAYABLE', 
            'REMOTE_START_STOP_CAPABLE',
            'RESERVABLE',
            'RFID_READER',
            'UNLOCK_CAPABLE',
            'CHARGING_PREFERENCES_CAPABLE',
            'CHIP_CARD_SUPPORT',
            'CONTACTLESS_CARD_SUPPORT',
            'PED_TERMINAL',
            'DEBIT_CARD_PAYABLE',
            'TOKEN_GROUP_CAPABLE'
        ];
        
        const filteredCapabilities = (evseData.capabilities || [])
            .filter(cap => validCapabilities.includes(cap))
            .filter((cap, index, arr) => arr.indexOf(cap) === index); // Eliminar duplicados
        
        // Procesar connectors para asegurar tipos correctos y omitir campos nulos
        const processedConnectors = (evseData.connectors || []).map(connector => {
            const processedConnector = { ...connector };
            
            // Solo incluir campos numéricos si tienen valor válido
            if (connector.max_voltage && !isNaN(parseInt(connector.max_voltage, 10))) {
                processedConnector.max_voltage = parseInt(connector.max_voltage, 10);
            } else {
                delete processedConnector.max_voltage;
            }
            
            if (connector.max_amperage && !isNaN(parseInt(connector.max_amperage, 10))) {
                processedConnector.max_amperage = parseInt(connector.max_amperage, 10);
            } else {
                delete processedConnector.max_amperage;
            }
            
            if (connector.max_electric_power && !isNaN(parseInt(connector.max_electric_power, 10))) {
                processedConnector.max_electric_power = parseInt(connector.max_electric_power, 10);
            } else {
                delete processedConnector.max_electric_power;
            }
            
            return processedConnector;
        });

        return {
            uid: evseData.id, // El UID es el ID del EVSE
            evse_id: evseData.evse_id || evseData.id, // Usar evse_id si existe, sino el ID
            status: evseData.status,
            capabilities: filteredCapabilities,
            connectors: processedConnectors,
            floor_level: evseData.floor_level || null,
            physical_reference: evseData.physical_reference || null,
            coordinates: evseData.coordinates || null,
            directions: evseData.directions || null,
            parking_restrictions: evseData.parking_restrictions || null,
            group_id: evseData.group_id || null,
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Notificar a todas las organizaciones sobre una nueva tarifa
     * @param {Object} tariffData - Datos de la tarifa creada
     */
    async notifyTariffCreated(tariffData) {
        try {
            logger.info('🔔 Notificando a organizaciones sobre nueva tarifa:', tariffData.id);
            
            // Obtener todas las organizaciones configuradas (excluyendo nuestro CPO)
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.info('📭 No hay organizaciones configuradas para notificar');
                return;
            }
            
            logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre tarifa ${tariffData.id}`);
            
            // Notificar a cada organización
            const notificationPromises = organizations.map(org => 
                this.notifyOrganizationAboutTariff(org, tariffData, 'PUT')
            );
            
            await Promise.allSettled(notificationPromises);
            
            logger.info('✅ Notificaciones de tarifa enviadas a todas las organizaciones');
            
        } catch (error) {
            logger.error('❌ Error notificando a organizaciones sobre tarifa:', error);
        }
    }

    /**
     * Notificar a una organización específica sobre una tarifa
     * @param {Object} organization - Datos de la organización
     * @param {Object} tariffData - Datos de la tarifa
     * @param {string} method - Método HTTP (PUT o PATCH)
     */
    async notifyOrganizationAboutTariff(organization, tariffData, method = 'PUT') {
        try {
            const url = `${organization.url}/ocpi/emsp/2.2/tariffs/${tariffData.country_code}/${tariffData.party_id}/${tariffData.id}`;
            
            logger.info(`📤 Enviando ${method} de tarifa a ${organization.party_id} (${organization.url})`);
            
            const payload = this.buildTariffPayload(tariffData);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Token ${organization.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                logger.warn(`⚠️ Error notificando tarifa a organización ${organization.party_id}: HTTP ${response.status} - ${errorText}`);
                return;
            }
            
            logger.info(`✅ Notificación ${method} de tarifa enviada exitosamente a ${organization.party_id}`);
            
        } catch (error) {
            logger.error(`❌ Error notificando tarifa a organización ${organization.party_id}:`, error);
        }
    }

    /**
     * Construir el payload de tarifa según especificación OCPI 2.2
     * @param {Object} tariffData - Datos de la tarifa
     * @returns {Object} Payload formateado
     */
    buildTariffPayload(tariffData) {
        // Transformar elements para cumplir con OCPI 2.2
        const elements = tariffData.elements ? tariffData.elements.map(element => {
            // Si ya tiene price_components, usarlo directamente
            if (element.price_components) {
                return {
                    price_components: element.price_components
                };
            }
            
            // Si tiene la estructura antigua, transformarla
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
            
            // Si no tiene estructura válida, devolver vacío
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
            elements: elements,
            start_date_time: tariffData.start_date_time || null,
            end_date_time: tariffData.end_date_time || null,
            last_updated: tariffData.last_updated || new Date().toISOString()
        };
    }
}

module.exports = new EMSPNotificationService();
