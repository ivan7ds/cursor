const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

const {
  storeCDRInDatabase,
  processCDRSendResults,
  buildNoOrganizationsResponse,
  buildCDRProcessResponse,
  buildCDRSendSuccessResponse,
  buildCDRSendErrorResponse
} = require('./cdrSendingService/cdrHelpers');
const {
  generateCDRId,
  buildCDRBasicInfo,
  buildCDRToken,
  buildCDRLocation,
  buildCDRCostInfo
} = require('./cdrSendingService/cdrPayloadHelpers');
const { sanitizeUrl: sanitizeUrlHelper, buildUrl } = require('../utils/urlSanitizer');
const { getOurCredentials } = require('../api/handshake/utils');

class CDRSendingService {
    /**
     * Sanitiza una URL eliminando barras finales para evitar dobles barras al concatenar
     * @param {string} url - URL a sanitizar
     * @returns {string} URL sin barras finales
     */
    sanitizeUrl(url) {
        return sanitizeUrlHelper(url);
    }

    /**
     * Obtiene todas las organizaciones configuradas (EMSPs) para enviar CDRs
     * @returns {Array} Lista de organizaciones configuradas
     */
    async getConfiguredOrganizations() {
        try {
            const organizations = await sequelize.query(`
                SELECT id, token, url, party_id, country_code, business_details, token_base64_encoded
                FROM credentials 
                WHERE url IS NOT NULL 
                AND token IS NOT NULL
                AND url != ''
                AND token != ''
                AND party_id != '${process.env.OCPI_PARTY_ID}'
            `, {
                type: sequelize.QueryTypes.SELECT
            });

            // Si una organización requiere Base64, usar nuestro token en lugar del token del operador
            // El token del operador es para cuando ellos hacen peticiones a nosotros
            // Nuestro token es para cuando nosotros hacemos peticiones a ellos
            const ourCredentials = getOurCredentials();
            return (organizations || []).map(org => {
                if (org.token_base64_encoded) {
                    return {
                        ...org,
                        // Usar nuestro token para peticiones salientes cuando Base64 está activado
                        token: ourCredentials.token
                    };
                }
                return org;
            });
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
        const cdrId = generateCDRId(sessionData);
        const basicInfo = buildCDRBasicInfo(sessionData, cdrId);
        const cdrToken = buildCDRToken(sessionData);
        const cdrLocation = buildCDRLocation(locationData, evseData, sessionData);
        const costInfo = buildCDRCostInfo(sessionData);

        return {
            ...basicInfo,
            cdr_token: cdrToken,
            auth_method: sessionData.auth_method || 'AUTH_REQUEST',
            cdr_location: cdrLocation,
            ...costInfo,
            tariffs: this.buildTariffsPayload(sessionData),
            charging_periods: this.buildChargingPeriodsPayload(sessionData),
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
            const cdrEndpoint = buildUrl(cleanUrl, '/ocpi/emsp/2.2/cdrs');
            
            logger.info(`📤 Enviando CDR ${cdrPayload.id} a ${organization.party_id} (${cdrEndpoint})`);

            const { buildAuthorizationHeader } = require('../utils/tokenEncoding');
            const response = await fetch(cdrEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': buildAuthorizationHeader(organization.token, organization.token_base64_encoded || false),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cdrPayload)
            });

            const responseData = await response.json();

            if (response.ok) {
                logger.info(`✅ CDR ${cdrPayload.id} enviado exitosamente a ${organization.party_id}`);
                return buildCDRSendSuccessResponse(cdrPayload.id, organization.party_id, responseData);
            } else {
                logger.warn(`⚠️ Error enviando CDR ${cdrPayload.id} a ${organization.party_id}:`, responseData);
                return buildCDRSendErrorResponse(cdrPayload.id, organization.party_id, responseData, response.status);
            }

        } catch (error) {
            logger.error(`❌ Error enviando CDR ${cdrPayload.id} a ${organization.party_id}:`, error);
            return buildCDRSendErrorResponse(cdrPayload.id, organization.party_id, error.message);
        }
    }

    /**
     * Almacena el CDR en la tabla cdrs
     * @param {Object} cdrPayload - Payload del CDR
     * @returns {Promise<Object>} CDR almacenado
     */
    async storeCDR(cdrPayload) {
        try {
            return await storeCDRInDatabase(cdrPayload);
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
                return buildNoOrganizationsResponse(cdrPayload.id);
            }

            logger.info(`📤 Enviando CDR ${cdrPayload.id} a ${organizations.length} organización(es)`);

            // Enviar CDR a cada organización
            const sendPromises = organizations.map(org => 
                this.sendCDRToOrganization(org, cdrPayload)
            );

            const results = await Promise.allSettled(sendPromises);
            const { successful, failed } = processCDRSendResults(results);

            logger.info(`✅ CDR ${cdrPayload.id} procesado: ${successful} exitosos, ${failed} fallidos`);

            return buildCDRProcessResponse({ cdrId: cdrPayload.id, organizationsCount: organizations.length, successful, failed, results });

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
