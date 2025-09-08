const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Credentials } = require('../models');
const logger = require('../utils/logger');
const axios = require('axios');

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
        const response = await axios.post(`${url}/ocpi/2.2/credentials`, credentialsPayload, {
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
            url: url,
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
                    url: url
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
        
        console.log('🔑 Generando credenciales para organización externa:', { partyId, countryCode, url });
        
        // Validar datos de entrada
        if (!partyId || !countryCode || !url) {
            return res.status(400).json({
                status_code: 2001,
                status_message: 'Missing required fields: partyId, countryCode, url',
                timestamp: new Date().toISOString()
            });
        }
        
        // Generar token único para la organización externa
        const token = uuidv4();
        
        // Obtener nuestras credenciales
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
        
        // Crear credenciales para la organización externa
        const externalCredentials = {
            id: uuidv4(),
            token: token,
            url: url,
            business_details: ourCredentials.business_details,
            party_id: partyId,
            country_code: countryCode,
            last_updated: new Date().toISOString()
        };
        
        // Guardar en base de datos
        await Credentials.create(externalCredentials);
        
        console.log('✅ Credenciales generadas exitosamente');
        
        res.status(200).json({
            status_code: 1000,
            status_message: 'Credentials generated successfully',
            data: {
                url: ourCredentials.url,
                token: token,
                party_id: ourCredentials.party_id,
                country_code: ourCredentials.country_code,
                business_details: ourCredentials.business_details,
                last_updated: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error generando credenciales:', error);
        
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error generating credentials',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
