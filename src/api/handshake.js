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
        
        console.log('🔗 Iniciando conexión a organización externa:', { url, partyId, countryCode });
        
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
        
        // Obtener nuestras credenciales para enviar
        const ourCredentials = await Credentials.findOne({
            where: { party_id: process.env.OCPI_PARTY_ID || 'IPD' }
        });
        
        if (!ourCredentials) {
            return res.status(500).json({
                status_code: 2000,
                status_message: 'Our credentials not found',
                timestamp: new Date().toISOString()
            });
        }
        
        // Preparar payload para enviar a la organización externa
        const credentialsPayload = {
            token: ourCredentials.token,
            url: ourCredentials.url,
            business_details: ourCredentials.business_details,
            party_id: ourCredentials.party_id,
            country_code: ourCredentials.country_code,
            last_updated: new Date().toISOString()
        };
        
        console.log('📤 Enviando credenciales a organización externa:', credentialsPayload);
        
        // Enviar credenciales a la organización externa
        const response = await axios.post(`${sanitizedUrl}/ocpi/2.2/credentials`, credentialsPayload, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('📥 Respuesta de la organización externa:', response.data);
        
        // Guardar las credenciales de la organización externa en nuestra base de datos
        const externalCredentials = {
            id: uuidv4(),
            token: token,
            url: sanitizedUrl,
            business_details: response.data.data.business_details || {},
            party_id: partyId,
            country_code: countryCode,
            last_updated: new Date().toISOString()
        };
        
        await Credentials.create(externalCredentials);
        
        console.log('✅ Conexión establecida exitosamente');
        
        res.status(200).json({
            status_code: 1000,
            status_message: 'Connection established successfully',
            data: {
                external_organization: {
                    party_id: partyId,
                    country_code: countryCode,
                    url: sanitizedUrl
                },
                our_credentials: credentialsPayload
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error conectando a organización externa:', error);
        
        let errorMessage = 'Error connecting to external organization';
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
        
        // Obtener nuestras credenciales del sistema (usar cualquier credencial existente como base)
        const ourCredentials = await Credentials.findOne({
            where: { 
                party_id: { [require('sequelize').Op.ne]: null } // Cualquier credencial existente
            }
        });
        
        if (!ourCredentials) {
            return res.status(500).json({
                status_code: 2000,
                status_message: 'No system credentials found. Please ensure the system is properly configured.',
                timestamp: new Date().toISOString()
            });
        }
        
        // Crear credenciales temporales para el handshake inicial
        const handshakeCredentials = {
            id: uuidv4(),
            token: initialToken,
            url: url,
            business_details: ourCredentials.business_details,
            party_id: partyId,
            country_code: countryCode,
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
