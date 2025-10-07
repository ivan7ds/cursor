const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

class CDRSendingService {
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
     * Obtiene todas las organizaciones configuradas (EMSPs) para enviar CDRs
     * @returns {Array} Lista de organizaciones configuradas
     */
    async getConfiguredOrganizations() {
        try {
            const organizations = await sequelize.query(`
                SELECT id, token, url, party_id, country_code, business_details
                FROM credentials 
                WHERE url IS NOT NULL 
                AND token IS NOT NULL
                AND url != ''
                AND token != ''
                AND party_id != '${process.env.OCPI_PARTY_ID}'
            `, {
                type: sequelize.QueryTypes.SELECT
            });

            return organizations || [];
        } catch (error) {
            logger.error('❌ Error obteniendo organizaciones configuradas:', error);
            return [];
        }
    }

    /**
     * Construye el payload del CDR basado en los datos de la sesión
     * @param {Object} sessionData - Datos de la sesión
     * @param {Object} locationData - Datos de la ubicación
     * @param {Object} evseData - Datos del EVSE
     * @returns {Object} Payload del CDR
     */
    buildCDRPayload(sessionData, locationData, evseData) {
        const cdrId = sessionData.id || `cdr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
            country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
            party_id: process.env.OCPI_PARTY_ID || 'IPD',
            id: cdrId,
            start_date_time: sessionData.start_date_time || sessionData.start_datetime,
            end_date_time: sessionData.end_date_time || sessionData.end_datetime,
            session_id: sessionData.id,
            cdr_token: {
                uid: sessionData.auth_id?.uid || sessionData.id_token || 'unknown',
                type: sessionData.auth_id?.type || 'OTHER',
                contract_id: sessionData.auth_id?.contract_id || 'IPD-001'
            },
            auth_method: sessionData.auth_method || 'AUTH_REQUEST',
            cdr_location: {
                id: locationData?.id || 'unknown',
                name: locationData?.name || 'Unknown Location',
                address: locationData?.address || 'Unknown Address',
                city: locationData?.city || 'Unknown City',
                postal_code: locationData?.postal_code || null,
                country: locationData?.country || process.env.OCPI_COUNTRY_CODE || 'ES',
                coordinates: locationData?.coordinates || {
                    latitude: "0.0000000",
                    longitude: "0.0000000"
                },
                evse_uid: evseData?.uid || evseData?.id || 'unknown',
                evse_id: evseData?.evse_id || 'unknown',
                connector_id: sessionData.connector_id || '1',
                connector_standard: evseData?.connectors?.[0]?.standard || 'IEC_62196_T2',
                connector_format: evseData?.connectors?.[0]?.format || 'SOCKET',
                connector_power_type: evseData?.connectors?.[0]?.power_type || 'AC_1_PHASE'
            },
            currency: sessionData.currency || 'EUR',
            tariffs: this.buildTariffsPayload(sessionData),
            charging_periods: this.buildChargingPeriodsPayload(sessionData),
            total_cost: {
                excl_vat: sessionData.total_cost || 0.0
            },
            total_energy: sessionData.kwh || 0.0,
            total_time: this.calculateTotalTime(sessionData),
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Construye el payload de tarifas para el CDR
     * @param {Object} sessionData - Datos de la sesión
     * @returns {Array} Array de tarifas
     */
    buildTariffsPayload(sessionData) {
        // Por ahora retornamos una tarifa genérica
        // En el futuro se puede obtener de la tabla tariffs
        return [{
            country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
            party_id: process.env.OCPI_PARTY_ID || 'IPD',
            id: 'default-tariff',
            currency: sessionData.currency || 'EUR',
            tariff_alt_text: [{
                text: 'Tarifa CPO Genérica',
                language: 'ES'
            }],
            elements: [{
                price_components: [{
                    vat: 21,
                    type: 'FLAT',
                    price: 4.2,
                    step_size: 1
                }]
            }],
            last_updated: new Date().toISOString()
        }];
    }

    /**
     * Construye el payload de períodos de carga para el CDR
     * @param {Object} sessionData - Datos de la sesión
     * @returns {Array} Array de períodos de carga
     */
    buildChargingPeriodsPayload(sessionData) {
        if (sessionData.charging_periods && Array.isArray(sessionData.charging_periods)) {
            return sessionData.charging_periods;
        }

        // Si no hay períodos específicos, crear uno genérico
        return [{
            start_date_time: sessionData.start_date_time || sessionData.start_datetime,
            dimensions: [{
                type: 'TIME',
                volume: this.calculateTotalTime(sessionData)
            }]
        }];
    }

    /**
     * Calcula el tiempo total de la sesión en horas
     * @param {Object} sessionData - Datos de la sesión
     * @returns {number} Tiempo total en horas
     */
    calculateTotalTime(sessionData) {
        if (sessionData.start_date_time && sessionData.end_date_time) {
            const start = new Date(sessionData.start_date_time);
            const end = new Date(sessionData.end_date_time);
            return (end - start) / (1000 * 60 * 60); // Convertir a horas
        }
        return 0.0;
    }

    /**
     * Envía un CDR a una organización específica
     * @param {Object} organization - Datos de la organización
     * @param {Object} cdrPayload - Payload del CDR
     * @returns {Promise<Object>} Resultado del envío
     */
    async sendCDRToOrganization(organization, cdrPayload) {
        try {
            const cleanUrl = this.sanitizeUrl(organization.url);
            const cdrEndpoint = `${cleanUrl}/ocpi/emsp/2.2/cdrs`;
            
            logger.info(`📤 Enviando CDR ${cdrPayload.id} a ${organization.party_id} (${cdrEndpoint})`);

            const response = await fetch(cdrEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${organization.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cdrPayload)
            });

            const responseData = await response.json();

            if (response.ok) {
                logger.info(`✅ CDR ${cdrPayload.id} enviado exitosamente a ${organization.party_id}`);
                return {
                    success: true,
                    organization: organization.party_id,
                    cdr_id: cdrPayload.id,
                    response: responseData
                };
            } else {
                logger.warn(`⚠️ Error enviando CDR ${cdrPayload.id} a ${organization.party_id}:`, responseData);
                return {
                    success: false,
                    organization: organization.party_id,
                    cdr_id: cdrPayload.id,
                    error: responseData,
                    status: response.status
                };
            }

        } catch (error) {
            logger.error(`❌ Error enviando CDR ${cdrPayload.id} a ${organization.party_id}:`, error);
            return {
                success: false,
                organization: organization.party_id,
                cdr_id: cdrPayload.id,
                error: error.message
            };
        }
    }

    /**
     * Almacena el CDR en la tabla cdrs
     * @param {Object} cdrPayload - Payload del CDR
     * @returns {Promise<Object>} CDR almacenado
     */
    async storeCDR(cdrPayload) {
        try {
            logger.info(`💾 Almacenando CDR ${cdrPayload.id} en base de datos`);

            const cdrData = {
                id: cdrPayload.id,
                country_code: cdrPayload.country_code,
                party_id: cdrPayload.party_id,
                session_id: cdrPayload.session_id,
                evse_uid: cdrPayload.cdr_location.evse_uid,
                connector_id: cdrPayload.cdr_location.connector_id,
                id_token: cdrPayload.cdr_token.uid,
                start_datetime: new Date(cdrPayload.start_date_time),
                end_datetime: new Date(cdrPayload.end_date_time),
                total_energy: cdrPayload.total_energy,
                total_cost: cdrPayload.total_cost.excl_vat,
                currency: cdrPayload.currency,
                total_parking_time: null, // No disponible en el payload actual
                total_time: cdrPayload.total_time,
                last_updated: new Date(cdrPayload.last_updated)
            };

            const [result] = await sequelize.query(`
                INSERT INTO cdrs (
                    id, country_code, party_id, session_id, evse_uid, 
                    connector_id, id_token, start_datetime, end_datetime, 
                    total_energy, total_cost, currency, total_parking_time, 
                    total_time, last_updated, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ON CONFLICT (id) 
                DO UPDATE SET
                    country_code = EXCLUDED.country_code,
                    party_id = EXCLUDED.party_id,
                    session_id = EXCLUDED.session_id,
                    evse_uid = EXCLUDED.evse_uid,
                    connector_id = EXCLUDED.connector_id,
                    id_token = EXCLUDED.id_token,
                    start_datetime = EXCLUDED.start_datetime,
                    end_datetime = EXCLUDED.end_datetime,
                    total_energy = EXCLUDED.total_energy,
                    total_cost = EXCLUDED.total_cost,
                    currency = EXCLUDED.currency,
                    total_parking_time = EXCLUDED.total_parking_time,
                    total_time = EXCLUDED.total_time,
                    last_updated = EXCLUDED.last_updated,
                    updated_at = NOW()
            `, {
                replacements: [
                    cdrData.id,
                    cdrData.country_code,
                    cdrData.party_id,
                    cdrData.session_id,
                    cdrData.evse_uid,
                    cdrData.connector_id,
                    cdrData.id_token,
                    cdrData.start_datetime,
                    cdrData.end_datetime,
                    cdrData.total_energy,
                    cdrData.total_cost,
                    cdrData.currency,
                    cdrData.total_parking_time,
                    cdrData.total_time,
                    cdrData.last_updated
                ]
            });

            logger.info(`✅ CDR ${cdrPayload.id} almacenado exitosamente`);
            return cdrData;

        } catch (error) {
            logger.error(`❌ Error almacenando CDR ${cdrPayload.id}:`, error);
            throw error;
        }
    }

    /**
     * Procesa y envía un CDR a todos los EMSPs configurados
     * @param {Object} sessionData - Datos de la sesión completada
     * @param {Object} locationData - Datos de la ubicación
     * @param {Object} evseData - Datos del EVSE
     * @returns {Promise<Object>} Resultado del procesamiento
     */
    async processAndSendCDR(sessionData, locationData, evseData) {
        try {
            logger.info(`🔄 Procesando CDR para sesión ${sessionData.id}`);

            // Construir payload del CDR
            const cdrPayload = this.buildCDRPayload(sessionData, locationData, evseData);
            
            // Almacenar CDR en base de datos
            await this.storeCDR(cdrPayload);

            // Obtener organizaciones configuradas
            const organizations = await this.getConfiguredOrganizations();
            
            if (organizations.length === 0) {
                logger.info('📭 No hay organizaciones configuradas para enviar CDR');
                return {
                    success: true,
                    cdr_id: cdrPayload.id,
                    sent_to: 0,
                    message: 'CDR almacenado localmente, no hay EMSPs configurados'
                };
            }

            logger.info(`📤 Enviando CDR ${cdrPayload.id} a ${organizations.length} organización(es)`);

            // Enviar CDR a cada organización
            const sendPromises = organizations.map(org => 
                this.sendCDRToOrganization(org, cdrPayload)
            );

            const results = await Promise.allSettled(sendPromises);
            
            // Procesar resultados
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            const failed = results.length - successful;

            logger.info(`✅ CDR ${cdrPayload.id} procesado: ${successful} exitosos, ${failed} fallidos`);

            return {
                success: true,
                cdr_id: cdrPayload.id,
                sent_to: organizations.length,
                successful: successful,
                failed: failed,
                results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
            };

        } catch (error) {
            logger.error('❌ Error procesando CDR:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new CDRSendingService();
