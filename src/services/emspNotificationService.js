const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

class EMSPNotificationService {
    /**
     * Sanitiza una URL eliminando barras finales para evitar dobles barras al concatenar
     * @param {string} url - URL a sanitizar
     * @returns {string} URL sin barras finales
     */
    sanitizeUrl(url) {
        if (!url) return url;
        return url.replace(/\/$/, '');
    }

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
            
            // Notificar a cada organización con PATCH para actualizaciones de tarifa
            const notificationPromises = organizations.map(org => 
                this.notifyOrganizationAboutEVSE(org, evseData, 'PATCH')
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
            // Construir la URL correcta usando nuestro party_id y country_code
            // Usamos /ocpi/emsp/ para consistencia con los PATCH requests
            const partyId = process.env.OCPI_PARTY_ID || 'IPD';
            const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
            const sanitizedUrl = this.sanitizeUrl(organization.url);
            const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${locationData.id}`;
            
            logger.info(`📤 Notificando location ${locationData.id} a organización ${organization.party_id} en ${endpoint}`);
            
            // Preparar datos de la location para la organización
            const locationPayload = this.prepareLocationPayload(locationData);
            
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
     * Notificar a todas las organizaciones sobre un conector actualizado
     * @param {Object} evseData - Datos del EVSE
     * @param {Object} connectorData - Datos del conector actualizado
     */
    async notifyConnectorUpdated(evseData, connectorData) {
        try {
            logger.info('🔌 Notificando a organizaciones sobre conector actualizado:', {
                evseId: evseData.id,
                connectorId: connectorData.id,
                changeType: connectorData.changeType
            });
            
            // Obtener todas las organizaciones configuradas (excluyendo nuestro CPO)
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.info('📭 No hay organizaciones configuradas para notificar');
                return;
            }
            
            logger.info(`📤 Notificando a ${organizations.length} organización(es) sobre conector actualizado ${connectorData.id}`);
            
            // Notificar cada conector individualmente
            const notificationPromises = organizations.map(org => 
                this.notifyOrganizationAboutConnector(org, evseData, connectorData)
            );
            
            await Promise.allSettled(notificationPromises);
            
            logger.info('✅ Notificaciones de conector actualizado enviadas a todas las organizaciones');
            
        } catch (error) {
            logger.error('❌ Error notificando a organizaciones sobre conector actualizado:', error);
        }
    }

    /**
     * Notificar a una organización específica sobre un conector
     * @param {Object} organization - Datos de la organización
     * @param {Object} evseData - Datos del EVSE
     * @param {Object} connectorData - Datos del conector
     */
    async notifyOrganizationAboutConnector(organization, evseData, connectorData) {
        try {
            // Construir la URL correcta según OCPI 2.2: /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}/{connector_id}
            const partyId = process.env.OCPI_PARTY_ID || 'IPD';
            const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
            const sanitizedUrl = this.sanitizeUrl(organization.url);
            const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evseData.location_id}/${evseData.id}/${connectorData.id}`;
            
            logger.info(`📤 Notificando conector ${connectorData.id} del EVSE ${evseData.id} a organización ${organization.party_id} en ${endpoint}`);
            
            // Preparar payload específico del conector
            const payload = this.prepareConnectorPatchPayload(connectorData);
            
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
     * Preparar payload de PATCH para conector específico según OCPI 2.2
     * @param {Object} connectorData - Datos del conector
     * @returns {Object} Payload de PATCH para el conector
     */
    prepareConnectorPatchPayload(connectorData) {
        const payload = {
            tariff_ids: connectorData.tariff_ids || [],
            last_updated: new Date().toISOString()
        };

        // Agregar otros campos si han cambiado
        if (connectorData.max_voltage !== undefined) {
            payload.max_voltage = connectorData.max_voltage;
        }
        if (connectorData.max_amperage !== undefined) {
            payload.max_amperage = connectorData.max_amperage;
        }
        if (connectorData.max_electric_power !== undefined) {
            payload.max_electric_power = connectorData.max_electric_power;
        }
        if (connectorData.standard !== undefined) {
            payload.standard = connectorData.standard;
        }
        if (connectorData.format !== undefined) {
            payload.format = connectorData.format;
        }
        if (connectorData.power_type !== undefined) {
            payload.power_type = connectorData.power_type;
        }

        logger.info(`📋 Preparando payload PATCH para conector ${connectorData.id}:`, payload);
        return payload;
    }

    /**
     * Notificar a una organización específica sobre un EVSE
     * @param {Object} organization - Datos de la organización
     * @param {Object} evseData - Datos del EVSE
     * @param {string} method - Método HTTP (POST para crear, PUT para actualizar, PATCH para actualización parcial)
     */
    async notifyOrganizationAboutEVSE(organization, evseData, method = 'PUT') {
        try {
            // Construir la URL correcta según OCPI 2.2: /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}
            const partyId = process.env.OCPI_PARTY_ID || 'IPD';
            const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
            const sanitizedUrl = this.sanitizeUrl(organization.url);
            const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evseData.location_id}/${evseData.id}`;
            
            logger.info(`📤 Notificando EVSE ${evseData.id} a organización ${organization.party_id} en ${endpoint} con método ${method}`);
            
            let payload;
            
            if (method === 'PATCH') {
                // Para PATCH, enviar solo los campos actualizados según OCPI 2.2
                payload = this.prepareEVSEPatchPayload(evseData);
            } else {
                // Para PUT/POST, enviar el payload completo
                payload = this.prepareEVSEPayload(evseData);
            }
            
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${organization.token}`,
                    'X-Request-ID': `notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                logger.info(`✅ EVSE ${evseData.id} notificado exitosamente a organización ${organization.party_id} con método ${method}`);
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
     * Preparar payload de PATCH para EVSE según OCPI 2.2
     * @param {Object} evseData - Datos del EVSE
     * @returns {Object} Payload de PATCH con solo campos actualizados
     */
    prepareEVSEPatchPayload(evseData) {
        const payload = {
            status: evseData.status,
            last_updated: new Date().toISOString()
        };
        // No incluimos status u otros campos que no han cambiado

        logger.info(`📋 Preparando payload PATCH para EVSE ${evseData.id}:`, payload);
        return payload;
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
     * Notifica a todas las organizaciones EMSP configuradas sobre la eliminación de una tarifa
     * @param {Object} tariffData - Datos de la tarifa eliminada
     */
    async notifyTariffDeleted(tariffData) {
        try {
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.warn('⚠️ No hay organizaciones EMSP configuradas para notificar sobre la eliminación de la tarifa');
                return;
            }

            logger.info(`📤 Notificando eliminación de tarifa ${tariffData.id} a ${organizations.length} organizaciones EMSP`);

            const notificationPromises = organizations.map(organization => 
                this.notifyOrganizationAboutTariff(organization, tariffData, 'DELETE')
            );

            await Promise.allSettled(notificationPromises);
            logger.info(`✅ Notificaciones de eliminación de tarifa ${tariffData.id} enviadas a todas las organizaciones EMSP`);
        } catch (error) {
            logger.error('❌ Error notificando eliminación de tarifa a organizaciones EMSP:', error);
            throw error;
        }
    }

    /**
     * Notifica a todas las organizaciones EMSP configuradas sobre un nuevo token
     * @param {Object} tokenData - Datos del token
     */
    async notifyTokenCreated(tokenData) {
        try {
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.warn('⚠️ No hay organizaciones EMSP configuradas para notificar sobre el nuevo token');
                return;
            }

            logger.info(`📤 Notificando creación de token ${tokenData.uid} a ${organizations.length} organizaciones EMSP`);

            const notificationPromises = organizations.map(organization => 
                this.notifyOrganizationAboutToken(organization, tokenData, 'PUT')
            );

            await Promise.allSettled(notificationPromises);
            logger.info(`✅ Notificaciones de token ${tokenData.uid} enviadas a todas las organizaciones EMSP`);
        } catch (error) {
            logger.error('❌ Error notificando token a organizaciones EMSP:', error);
            throw error;
        }
    }

    /**
     * Notificar a una organización específica sobre un token
     * @param {Object} organization - Datos de la organización
     * @param {Object} tokenData - Datos del token
     * @param {string} method - Método HTTP (PUT o PATCH)
     */
    async notifyOrganizationAboutToken(organization, tokenData, method = 'PUT') {
        try {
            const sanitizedUrl = this.sanitizeUrl(organization.url);
            const url = `${sanitizedUrl}/ocpi/cpo/2.2/tokens/${tokenData.country_code}/${tokenData.party_id}/${tokenData.uid}`;
            
            logger.info(`📤 Enviando ${method} de token a ${organization.party_id} (${organization.url})`);
            
            const payload = this.buildTokenPayload(tokenData);
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Token ${organization.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                logger.warn(`⚠️ Error notificando token a organización ${organization.party_id}: HTTP ${response.status} - ${errorText}`);
                return;
            }
            
            logger.info(`✅ Notificación ${method} de token enviada exitosamente a ${organization.party_id}`);
            
        } catch (error) {
            logger.error(`❌ Error notificando token a organización ${organization.party_id}:`, error);
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
            const sanitizedUrl = this.sanitizeUrl(organization.url);
            const url = `${sanitizedUrl}/ocpi/emsp/2.2/tariffs/${tariffData.country_code}/${tariffData.party_id}/${tariffData.id}`;
            
            logger.info(`📤 Enviando ${method} de tarifa a ${organization.party_id} (${organization.url})`);
            
            const payload = this.buildTariffPayload(tariffData);
            
            logger.info(`📋 Preparando payload ${method} para tarifa ${tariffData.id}:`, payload);
            
            const response = await fetch(url, {
                method,
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
            elements,
            start_date_time: tariffData.start_date_time || null,
            end_date_time: tariffData.end_date_time || null,
            last_updated: tariffData.last_updated || new Date().toISOString()
        };
    }

    /**
     * Construir el payload de token según especificación OCPI 2.2
     * @param {Object} tokenData - Datos del token
     * @returns {Object} Payload formateado
     */
    buildTokenPayload(tokenData) {
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

        // Agregar campos opcionales si existen
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
}

module.exports = new EMSPNotificationService();
