const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../database/connection');
const { EVSE, Location, Token, Session, CDR } = require('../models');
const logger = require('../utils/logger');
const { logJobExecution, logJobError } = require('../api/testMonitoring');

class TestSessionService {
    constructor() {
        this.sessionInterval = null;
        this.isRunning = false;
        this.intervalMs = parseInt(process.env.TEST_SESSION_INTERVAL_MS) || 300000; // 5 minutos por defecto
        this.sessionDurationMs = parseInt(process.env.TEST_SESSION_DURATION_MS) || 120000; // 2 minutos por defecto
        this.activeSessions = new Map(); // Para rastrear sesiones activas
    }

    start() {
        if (this.isRunning) {
            logger.warn('⚠️ Test Session Service is already running');
            return;
        }

        logger.info(`🔄 Starting Test Session Service with interval: ${this.intervalMs}ms, duration: ${this.sessionDurationMs}ms`);

        this.sessionInterval = setInterval(async () => {
            try {
                await this.runSessionTest();
            } catch (error) {
                logger.error('❌ Error in test session service:', error);
                logJobError('Test Session Service', `Error in test session service: ${error.message}`, 'error');
            }
        }, this.intervalMs);

        this.isRunning = true;
        logger.info('✅ Test Session Service started');
    }

    stop() {
        if (!this.isRunning) {
            logger.warn('⚠️ Test Session Service is not running');
            return;
        }

        clearInterval(this.sessionInterval);
        this.sessionInterval = null;
        this.isRunning = false;
        logger.info('🛑 Test Session Service stopped');
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            intervalMs: this.intervalMs,
            sessionDurationMs: this.sessionDurationMs,
            nextTest: this.isRunning ? new Date(Date.now() + this.intervalMs).toISOString() : null,
            activeSessions: this.activeSessions.size
        };
    }

    async runSessionTest() {
        try {
            logger.info('🧪 Starting session test...');

            // Obtener operadores externos conectados
            const operators = await this.getConnectedOperators();
            
            logger.info(`🔍 Found ${operators.length} connected operators:`, operators.map(op => `${op.party_id} (${op.country_code})`));
            
            if (operators.length === 0) {
                logger.info('📭 No connected operators found for session test');
                logJobExecution('Test Session Service', 'No connected operators found');
                return;
            }

            // Seleccionar un operador aleatorio
            const operator = operators[Math.floor(Math.random() * operators.length)];
            
            if (!operator) {
                logger.error('❌ Selected operator is undefined');
                logJobError('Test Session Service', 'Selected operator is undefined', 'error');
                return;
            }
            
            logger.info(`🎯 Testing with operator: ${operator.party_id} (${operator.country_code})`);

            // Obtener EVSEs disponibles de la base de datos
            const availableEvses = await this.getAvailableEvsesFromDatabase();
            
            if (availableEvses.length === 0) {
                logger.info('📭 No available EVSEs found in database for session test');
                logJobExecution('Test Session Service', 'No available EVSEs found in database');
                return;
            }

            // Seleccionar un EVSE aleatorio
            const evse = availableEvses[Math.floor(Math.random() * availableEvses.length)];
            logger.info(`🔌 Selected EVSE: ${evse.uid} (${evse.status})`);

            // Probar con token válido
            await this.testSessionWithValidToken(operator, evse);

            // Probar con token inválido
            await this.testSessionWithInvalidToken(operator, evse);

            const message = `Session test completed with operator ${operator.party_id}`;
            logger.info(`✅ ${message}`);
            logJobExecution('Test Session Service', message);

        } catch (error) {
            logger.error('❌ Error in session test:', error);
            logJobError('Test Session Service', `Error in session test: ${error.message}`, 'error');
        }
    }

    async getConnectedOperators() {
        try {
            logger.info('🔍 Querying connected operators from database...');
            
            // Usar la misma consulta que Ext Actions para obtener operadores conectados
            const results = await sequelize.query(`
                SELECT id, token, url, party_id, country_code, business_details
                FROM credentials 
                WHERE url IS NOT NULL 
                AND token IS NOT NULL
                AND url != ''
                AND token != ''
                AND party_id != 'IPD'
                AND valid = true
                ORDER BY party_id, country_code
            `, {
                type: sequelize.QueryTypes.SELECT
            });
            
            logger.info(`🔍 Query returned ${results.length} operators:`, results.map(op => `${op.party_id} (${op.country_code})`));
            return results;
        } catch (error) {
            logger.error('❌ Error getting connected operators:', error);
            return [];
        }
    }

    async getAvailableEvsesFromDatabase() {
        try {
            // Obtener EVSEs disponibles de la tabla emsp_evses
            const results = await sequelize.query(`
                SELECT 
                    evse_id,
                    evse_id as uid,
                    status,
                    capabilities,
                    connectors,
                    floor_level,
                    physical_reference,
                    directions,
                    parking_restrictions,
                    last_updated,
                    emsp_party_id as party_id,
                    emsp_country_code as country_code,
                    location_id
                FROM emsp_evses 
                WHERE status = 'AVAILABLE'
                AND capabilities::text LIKE '%REMOTE_START_STOP_CAPABLE%'
                ORDER BY RANDOM()
                LIMIT 10
            `, {
                type: sequelize.QueryTypes.SELECT
            });
            
            logger.info(`🔌 Found ${results.length} available EVSEs from database`);
            return results;
        } catch (error) {
            logger.error('❌ Error getting EVSEs from database:', error.message);
            return [];
        }
    }

    async testSessionWithValidToken(operator, evse) {
        try {
            logger.info('🔑 Testing session with valid token...');

            // Obtener un token válido de nuestra base de datos
            const validToken = await this.getValidToken();
            if (!validToken) {
                logger.warn('⚠️ No valid token found for session test');
                return;
            }

            // Iniciar sesión
            const sessionResult = await this.startSession(operator, evse, validToken);
            
            if (sessionResult.success) {
                logger.info('✅ Session started successfully with valid token');
                
                // Programar finalización de la sesión
                const sessionId = sessionResult.sessionId;
                this.activeSessions.set(sessionId, {
                    operator,
                    evse,
                    token: validToken,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + this.sessionDurationMs)
                });

                // Programar finalización
                setTimeout(async () => {
                    await this.stopSession(operator, sessionId);
                }, this.sessionDurationMs);

            } else {
                logger.warn('⚠️ Session start failed with valid token');
            }

        } catch (error) {
            logger.error('❌ Error testing session with valid token:', error);
        }
    }

    async testSessionWithInvalidToken(operator, evse) {
        try {
            logger.info('🔑 Testing session with invalid token...');

            // Crear un token inválido
            const invalidToken = {
                country_code: process.env.OCPI_COUNTRY_CODE,
                party_id: process.env.OCPI_PARTY_ID,
                uid: 'INVALID_TOKEN_' + Date.now(),
                type: 'APP_USER',
                contract_id: 'INVALID_CONTRACT',
                issuer: process.env.OCPI_PARTY_ID,
                valid: false,
                whitelist: 'NEVER',
                last_updated: new Date().toISOString()
            };

            // Intentar iniciar sesión
            const sessionResult = await this.startSession(operator, evse, invalidToken);
            
            if (!sessionResult.success) {
                logger.info('✅ Session correctly rejected with invalid token');
            } else {
                logger.warn('⚠️ Session unexpectedly accepted with invalid token');
            }

        } catch (error) {
            logger.error('❌ Error testing session with invalid token:', error);
        }
    }

    async getValidToken() {
        try {
            const token = await Token.findOne({
                where: { valid: true },
                order: [['last_updated', 'DESC']]
            });
            return token;
        } catch (error) {
            logger.error('❌ Error getting valid token:', error);
            return null;
        }
    }

    async startSession(operator, evse, token) {
        try {
            const responseUrl = `${process.env.OCPI_BASE_URL || 'http://localhost:3000'}/ocpi/commands/START_SESSION`;
            
            const payload = {
                response_url: responseUrl,
                token: {
                    country_code: token.country_code || process.env.OCPI_COUNTRY_CODE,
                    party_id: token.party_id || process.env.OCPI_PARTY_ID,
                    uid: token.uid,
                    type: token.type,
                    contract_id: token.contract_id || 'DEFAULT_CONTRACT',
                    issuer: token.issuer || process.env.OCPI_PARTY_ID,
                    valid: token.valid || true,
                    whitelist: token.whitelist || 'ALWAYS',
                    last_updated: token.last_updated || new Date().toISOString()
                },
                location_id: evse.location_id || 'LOCATION_ID',
                evse_uid: evse.uid
            };

            logger.info(`📤 Sending START_SESSION to ${operator.party_id} for EVSE ${evse.uid}`);

            const response = await axios.post(`${operator.url}/ocpi/cpo/2.2/commands/START_SESSION`, payload, {
                headers: {
                    'Authorization': `Token ${operator.token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (response.status === 200 && response.data.status_code === 1000) {
                const result = response.data.data?.result;
                if (result === 'ACCEPTED') {
                    const sessionId = response.data.data?.session_id || `session_${Date.now()}`;
                    return {
                        success: true,
                        sessionId: sessionId,
                        message: 'Session accepted'
                    };
                } else {
                    return {
                        success: false,
                        message: `Session rejected: ${result}`
                    };
                }
            } else {
                return {
                    success: false,
                    message: `HTTP ${response.status}: ${response.data?.status_message || 'Unknown error'}`
                };
            }

        } catch (error) {
            logger.error('❌ Error starting session:', error.message);
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }

    async stopSession(operator, sessionId) {
        try {
            logger.info(`🛑 Stopping session ${sessionId}...`);

            const responseUrl = `${process.env.OCPI_BASE_URL || 'http://localhost:3000'}/ocpi/commands/STOP_SESSION`;
            
            const payload = {
                response_url: responseUrl,
                session_id: sessionId
            };

            const response = await axios.post(`${operator.url}/ocpi/cpo/2.2/commands/STOP_SESSION`, payload, {
                headers: {
                    'Authorization': `Token ${operator.token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (response.status === 200 && response.data.status_code === 1000) {
                const result = response.data.data?.result;
                if (result === 'ACCEPTED') {
                    logger.info(`✅ Session ${sessionId} stopped successfully`);
                } else {
                    logger.warn(`⚠️ Session ${sessionId} stop rejected: ${result}`);
                }
            } else {
                logger.warn(`⚠️ Session ${sessionId} stop failed: HTTP ${response.status}`);
            }

            // Remover de sesiones activas
            this.activeSessions.delete(sessionId);

        } catch (error) {
            logger.error(`❌ Error stopping session ${sessionId}:`, error.message);
        }
    }
}

module.exports = new TestSessionService();
