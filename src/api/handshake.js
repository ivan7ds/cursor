const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { Credentials } = require('../models');

const { buildSuccessResponse, buildGenerateCredentialsResponse } = require('./handshake/builders');
const { handleRejectedCredentials, createHandshakeCredentials } = require('./handshake/credentials');
const { handleHandshakeError, handleGenerateCredentialsError } = require('./handshake/handlers');
const { executeHandshakeProcess } = require('./handshake/process');
const { validateAndSanitizeUrl, getOurCredentials } = require('./handshake/utils');
const { validateHandshakeInput, validateGenerateCredentialsInput } = require('./handshake/validators');

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
        const { url, token, partyId, countryCode, tokenBase64Encoded } = req.body;
        
        console.log('🔗 Iniciando handshake OCPI 2.2.1 con organización externa:', { 
            url, 
            partyId, 
            countryCode, 
            tokenBase64Encoded,
            tokenPreview: token ? `${token.substring(0, 10)}...${token.substring(token.length - 5)}` : 'missing'
        });
        
        const validationError = validateHandshakeInput(req.body);
        if (validationError) {
            return res.status(validationError.status).json(validationError.json);
        }
        
        const sanitizedUrl = validateAndSanitizeUrl(url);
        const ourCredentials = getOurCredentials();
        
        let credentialsResponse;
        let operatorEndpoints;
        
        try {
            const result = await executeHandshakeProcess({ sanitizedUrl, token, partyId, countryCode, ourCredentials, tokenBase64Encoded: !!tokenBase64Encoded });
            credentialsResponse = result.credentialsResponse;
            operatorEndpoints = result.operatorEndpoints;
        } catch (credentialsError) {
            console.log('⚠️ POST /credentials rechazado, el operador externo iniciará el handshake');
            console.log('📋 Error details:', credentialsError.response?.data || credentialsError.message);
            return handleRejectedCredentials({ partyId, countryCode, sanitizedUrl, ourCredentials, res });
        }
        
        console.log('✅ Handshake OCPI 2.2.1 completado exitosamente');
        return res.status(200).json(buildSuccessResponse(partyId, countryCode, credentialsResponse, operatorEndpoints));
        
    } catch (error) {
        handleHandshakeError(error, res);
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
        
        const validationError = validateGenerateCredentialsInput(req.body);
        if (validationError) {
            return res.status(validationError.status).json(validationError.json);
        }
        
        const initialToken = `OCPI_${uuidv4().replace(/-/g, '')}`;
        const ourCredentials = getOurCredentials();
        
        const handshakeCredentials = createHandshakeCredentials({ partyId, countryCode, url, initialToken, ourCredentials });
        await Credentials.create(handshakeCredentials);
        
        console.log('✅ Token inicial generado exitosamente para handshake');
        
        return res.status(200).json(buildGenerateCredentialsResponse({ partyId, countryCode, url, initialToken, ourCredentials }));
        
    } catch (error) {
        handleGenerateCredentialsError(error, res);
    }
});

module.exports = router;
