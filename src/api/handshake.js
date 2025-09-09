const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Credentials } = require('../models');
const logger = require('../utils/logger');
const axios = require('axios');
const { URL } = require('url');

/**
 * Valida y sanitiza una URL para prevenir ataques SSRF
 * @param {string} url - URL a validar
 * @returns {string|null} - URL sanitizada o null si es inválida
 */
function validateAndSanitizeUrl(url) {
    try {
        const parsedUrl = new URL(url);
        
        // Solo permitir HTTPS y HTTP
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
            return null;
        }
        
        // Bloquear URLs internas y locales
        const hostname = parsedUrl.hostname.toLowerCase();
        const blockedHosts = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '::1',
            '0:0:0:0:0:0:0:1',
            '169.254.169.254', // AWS metadata
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16'
        ];
        
        // Verificar hosts bloqueados
        for (const blockedHost of blockedHosts) {
            if (hostname === blockedHost || hostname.startsWith(blockedHost)) {
                return null;
            }
        }
        
        // Verificar rangos de IP privadas
        if (isPrivateIP(hostname)) {
            return null;
        }
        
        // Retornar URL sanitizada
        return parsedUrl.toString();
        
    } catch (error) {
        return null;
    }
}

/**
 * Verifica si una IP es privada
 * @param {string} hostname - Hostname a verificar
 * @returns {boolean} - true si es IP privada
 */
function isPrivateIP(hostname) {
    // Patrón para IPs privadas
    const privateIPPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
    return privateIPPattern.test(hostname);
}

/**
 * @swagger
 * /api/handshake/connect-to-organization:
 *   post:
 *     summary: Conectar a una organización externa (como EMSP)
 *     tags: [Handshake]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - token
 *               - partyId
 *               - countryCode
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL de la organización externa
 *               token:
 *                 type: string
 *                 description: Token proporcionado por la organización externa
 *               partyId:
 *                 type: string
 *                 description: Party ID de la organización externa
 *               countryCode:
 *                 type: string
 *                 description: Código de país de la organización externa
 *     responses:
 *       200:
 *         description: Conexión establecida exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/connect-to-organization', async (req, res) => {
    try {
        const { url, token, partyId, countryCode } = req.body;
        
        console.log('🔗 Iniciando handshake OCPI 2.2.1 con organización externa:', { url, partyId, countryCode });
        
        // Validar datos de entrada
        if (!url || !token || !partyId || !countryCode) {
            return res.status(400).json({
                status_code: 2001,
                status_message: 'Missing required fields: url, token, partyId, countryCode',
                timestamp: new Date().toISOString()
            });
        }
        
        // Validar y sanitizar URL para prevenir SSRF
        const sanitizedUrl = validateAndSanitizeUrl(url);
        if (!sanitizedUrl) {
            return res.status(400).json({
                status_code: 2001,
                status_message: 'Invalid or unsafe URL provided',
                timestamp: new Date().toISOString()
            });
        }
        
        // Obtener nuestras credenciales del sistema desde variables de entorno
        const ourCredentials = {
            party_id: process.env.OCPI_PARTY_ID || 'IPD',
            country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
            token: process.env.OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key',
            url: process.env.OCPI_BASE_URL || 'https://localhost:3000',
            business_details: {
                name: process.env.OCPI_BUSINESS_NAME || 'Test CPO',
                website: process.env.OCPI_BUSINESS_WEBSITE || 'https://test.com'
            }
        };
        
        // PASO 1: GET /ocpi/versions - Obtener endpoint de details
        console.log('📡 Paso 1: Obteniendo versión OCPI...');
        const versionsUrl = `${sanitizedUrl.replace(/\/$/, '')}/ocpi/versions`;
        const versionsResponse = await axios.get(versionsUrl, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Versión OCPI obtenida:', versionsResponse.data);
        
        // Extraer endpoint de details de la respuesta
        const versionData = versionsResponse.data.data || versionsResponse.data;
        const detailsEndpoint = versionData.find(v => v.version === '2.2')?.url;
        
        if (!detailsEndpoint) {
            return res.status(400).json({
                status_code: 2001,
                status_message: 'OCPI 2.2 not supported by external organization',
                timestamp: new Date().toISOString()
            });
        }
        
        // PASO 2: GET /ocpi/cpo/2.2/details - Obtener endpoints del operador
        console.log('📡 Paso 2: Obteniendo detalles del operador...');
        const detailsUrl = `${detailsEndpoint.replace(/\/$/, '')}/ocpi/cpo/2.2/details`;
        const detailsResponse = await axios.get(detailsUrl, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Detalles del operador obtenidos:', detailsResponse.data);
        
        // Extraer endpoints del operador
        const operatorEndpoints = detailsResponse.data.endpoints || [];
        
        // PASO 3: POST /ocpi/cpo/2.2/credentials - Enviar nuestro token y recibir el suyo
        console.log('📡 Paso 3: Enviando credenciales...');
        
        const credentialsPayload = {
            token: ourCredentials.token,
            url: ourCredentials.url,
            roles: [{
                role: 'CPO',
                party_id: ourCredentials.party_id,
                country_code: ourCredentials.country_code,
                business_details: ourCredentials.business_details
            }]
        };
        
        console.log('📤 Enviando credenciales a organización externa:', credentialsPayload);
        
        const credentialsUrl = `${detailsEndpoint.replace(/\/$/, '')}/ocpi/cpo/2.2/credentials`;
        const credentialsResponse = await axios.post(credentialsUrl, credentialsPayload, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Respuesta de credenciales:', credentialsResponse.data);
        
        // Almacenar credenciales de la organización externa con endpoints
        const externalCredentials = {
            id: uuidv4(),
            token: credentialsResponse.data.token,
            url: credentialsResponse.data.url,
            business_details: credentialsResponse.data.business_details,
            party_id: partyId,
            country_code: countryCode,
            valid: true,
            temp: false,
            external_party_id: partyId,
            last_updated: new Date().toISOString()
        };
        
        // Almacenar endpoints del operador externo
        if (operatorEndpoints.length > 0) {
            externalCredentials.endpoints = operatorEndpoints;
        }
        
        await Credentials.create(externalCredentials);
        
        // Invalidar token temporal si existe
        if (token !== credentialsResponse.data.token) {
            await Credentials.update(
                { valid: false },
                { where: { token: token } }
            );
        }
        
        console.log('✅ Handshake OCPI 2.2.1 completado exitosamente');
        
        res.status(200).json({
            status_code: 1000,
            status_message: 'OCPI 2.2.1 handshake completed successfully',
            data: {
                party_id: partyId,
                country_code: countryCode,
                token: credentialsResponse.data.token,
                endpoints: operatorEndpoints
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error en handshake OCPI:', error);
        
        let errorMessage = 'Internal server error';
        let statusCode = 2000;
        
        if (error.response) {
            // Error de la organización externa
            errorMessage = `External organization error: ${error.response.data?.status_message || error.message}`;
            statusCode = error.response.status;
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Cannot connect to external organization URL';
            statusCode = 2001;
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Connection timeout to external organization';
            statusCode = 2001;
        }
        
        res.status(500).json({
            status_code: statusCode,
            status_message: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @swagger
 * /api/handshake/generate-credentials:
 *   post:
 *     summary: Generar credenciales para que una organización externa se conecte (como CPO)
 *     tags: [Handshake]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partyId
 *               - countryCode
 *               - url
 *             properties:
 *               partyId:
 *                 type: string
 *                 description: Party ID de la organización externa
 *               countryCode:
 *                 type: string
 *                 description: Código de país de la organización externa
 *               url:
 *                 type: string
 *                 description: URL de la organización externa
 *     responses:
 *       200:
 *         description: Credenciales generadas exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/generate-credentials', async (req, res) => {
    try {
        const { partyId, countryCode, url } = req.body;
        
        console.log('🔑 Generando token inicial para handshake OCPI:', { partyId, countryCode, url });
        
        // Validar datos de entrada
        if (!partyId || !countryCode || !url) {
            return res.status(400).json({
                status_code: 2001,
                status_message: 'Missing required fields: partyId, countryCode, url',
                timestamp: new Date().toISOString()
            });
        }
        
        // Generar token inicial único para el handshake
        const initialToken = `OCPI_${uuidv4().replace(/-/g, '')}`;
        
        // Usar configuración del sistema desde variables de entorno
        const ourCredentials = {
            party_id: process.env.OCPI_PARTY_ID || 'IPD',
            country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
            business_details: {
                name: process.env.OCPI_BUSINESS_NAME || 'Test CPO',
                website: process.env.OCPI_BUSINESS_WEBSITE || 'https://test.com'
            }
        };
        
        // Crear credenciales temporales para el handshake inicial
        const handshakeCredentials = {
            id: uuidv4(),
            token: initialToken,
            url: url,
            business_details: ourCredentials.business_details,
            party_id: partyId,
            country_code: countryCode,
            valid: true,
            temp: true,
            last_updated: new Date().toISOString()
        };
        
        // Guardar credenciales temporales en base de datos
        await Credentials.create(handshakeCredentials);
        
        console.log('✅ Token inicial generado exitosamente para handshake');
        
        // Devolver las credenciales que el operador externo debe usar para iniciar el handshake
        res.status(200).json({
            status_code: 1000,
            status_message: 'Initial token generated successfully for handshake',
            data: {
                // Credenciales que el operador externo debe usar para conectarse a nosotros
                our_credentials: {
                    url: ourCredentials.url,
                    token: initialToken,
                    party_id: ourCredentials.party_id,
                    country_code: ourCredentials.country_code,
                    business_details: ourCredentials.business_details,
                    last_updated: new Date().toISOString()
                },
                // Información de la organización externa
                external_organization: {
                    party_id: partyId,
                    country_code: countryCode,
                    url: url
                },
                // Instrucciones para el operador externo
                instructions: {
                    message: 'Use the provided token to initiate handshake with the external organization',
                    next_step: 'Use the "Connect to External Organization" button to complete the handshake'
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error generando token inicial:', error);
        
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error generating initial token',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
