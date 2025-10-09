const express = require('express');
const router = express.Router();
const { sequelize } = require('../database/connection');
const { authMiddleware } = require('../middleware/auth');

// ===== ENDPOINTS EMSP =====
// Estos endpoints permiten consultar la información almacenada de eMSPs
// cuando actuamos como CPO

// GET /ocpi/emsp/2.2/locations - Obtener locations de eMSPs
router.get('/locations', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/locations - Consultando locations de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_locations 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} locations de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando locations de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP locations',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/evses - Obtener EVSEs de eMSPs
router.get('/evses', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/evses - Consultando EVSEs de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_evses 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} EVSEs de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando EVSEs de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP EVSEs',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/tariffs - Obtener tariffs de eMSPs
router.get('/tariffs', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/tariffs - Consultando tariffs de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_tariffs 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} tariffs de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando tariffs de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP tariffs',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE /ocpi/emsp/2.2/tariffs/:country_code/:party_id/:tariff_id - Soft delete tarifa de eMSP
router.delete('/tariffs/:country_code/:party_id/:tariff_id', authMiddleware, async (req, res) => {
    try {
        const { country_code, party_id, tariff_id } = req.params;

        console.log('🗑️ DELETE /ocpi/emsp/2.2/tariffs - Soft delete de tarifa de eMSP', {
            country_code,
            party_id,
            tariff_id
        });

        const [results] = await sequelize.query(`
            UPDATE emsp_tariffs
            SET deleted_at = NOW(),
                updated_at = NOW(),
                last_updated = NOW()
            WHERE id = ?
              AND emsp_country_code = ?
              AND emsp_party_id = ?
              AND deleted_at IS NULL
            RETURNING id, emsp_party_id AS party_id, emsp_country_code AS country_code, deleted_at
        `, {
            replacements: [tariff_id, country_code, party_id]
        });

        if (!results || results.length === 0) {
            return res.status(404).json({
                status_code: 2001,
                status_message: 'Tariff not found or already deleted',
                timestamp: new Date().toISOString()
            });
        }

        console.log('✅ Tarifa de eMSP marcada como eliminada', results[0]);

        res.status(200).json({
            status_code: 1000,
            status_message: 'Tariff soft-deleted successfully',
            data: results[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error realizando soft delete de tarifa de eMSP:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error deleting EMSP tariff',
            timestamp: new Date().toISOString()
        });
    }
});

// PUT /ocpi/emsp/2.2/tariffs/:country_code/:party_id/:tariff_id - Crear o actualizar tarifa de eMSP
router.put('/tariffs/:country_code/:party_id/:tariff_id', authMiddleware, async (req, res) => {
    try {
        const { country_code, party_id, tariff_id } = req.params;
        const tariffData = req.body || {};

        console.log('📝 PUT /ocpi/emsp/2.2/tariffs - Guardando tarifa de eMSP', {
            country_code,
            party_id,
            tariff_id,
            payload: tariffData
        });

        if (tariffData.country_code && tariffData.country_code !== country_code) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'country_code in URL does not match payload',
                timestamp: new Date().toISOString()
            });
        }

        if (tariffData.party_id && tariffData.party_id !== party_id) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'party_id in URL does not match payload',
                timestamp: new Date().toISOString()
            });
        }

        if (tariffData.id && tariffData.id !== tariff_id) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'tariff id in URL does not match payload',
                timestamp: new Date().toISOString()
            });
        }

        if (tariffData.elements && !Array.isArray(tariffData.elements)) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'elements must be an array',
                timestamp: new Date().toISOString()
            });
        }

        const nowIso = new Date().toISOString();
        const extractName = (altText, fallbackName) => {
            if (fallbackName && typeof fallbackName === 'string' && fallbackName.trim().length > 0) {
                return fallbackName;
            }

            if (!altText) {
                return null;
            }

            if (typeof altText === 'string') {
                return altText;
            }

            if (Array.isArray(altText)) {
                const entry = altText.find(item => item && typeof item.text === 'string' && item.text.trim().length > 0);
                return entry ? entry.text : null;
            }

            if (typeof altText === 'object' && typeof altText.text === 'string') {
                return altText.text;
            }

            return null;
        };

        const tariffName = extractName(tariffData.tariff_alt_text, tariffData.name);

        const replacements = [
            tariff_id,
            party_id,
            country_code,
            tariff_id,
            tariffData.currency || 'EUR',
            tariffData.type || 'REGULAR',
            tariffName,
            JSON.stringify(tariffData.elements || []),
            tariffData.start_date_time || null,
            tariffData.end_date_time || null,
            tariffData.last_updated || nowIso
        ];

        await sequelize.query(`
            INSERT INTO emsp_tariffs (
                id, emsp_party_id, emsp_country_code, tariff_id, currency, type,
                name, elements, start_date_time, end_date_time, last_updated, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON CONFLICT (id)
            DO UPDATE SET
                emsp_party_id = EXCLUDED.emsp_party_id,
                emsp_country_code = EXCLUDED.emsp_country_code,
                tariff_id = EXCLUDED.tariff_id,
                currency = EXCLUDED.currency,
                type = EXCLUDED.type,
                name = EXCLUDED.name,
                elements = EXCLUDED.elements,
                start_date_time = EXCLUDED.start_date_time,
                end_date_time = EXCLUDED.end_date_time,
                last_updated = EXCLUDED.last_updated,
                deleted_at = NULL,
                updated_at = NOW()
        `, {
            replacements
        });

        console.log('✅ Tarifa de eMSP guardada correctamente', {
            tariff_id,
            party_id,
            country_code,
            name: tariffName
        });

        res.status(200).json({
            status_code: 1000,
            status_message: 'Tariff stored successfully',
            data: {
                id: tariff_id,
                party_id,
                country_code,
                name: tariffName,
                last_updated: tariffData.last_updated || nowIso
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error guardando tarifa de eMSP:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error storing EMSP tariff',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/sessions - Obtener sesiones de eMSPs
router.get('/sessions', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/sessions - Consultando sesiones de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_sessions 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} sesiones de eMSPs encontradas`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando sesiones de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP sessions',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/cdrs - Obtener CDRs de eMSPs
router.get('/cdrs', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/cdrs - Consultando CDRs de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_cdrs 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} CDRs de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando CDRs de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP CDRs',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /ocpi/emsp/2.2/cdrs - Recibir CDRs de eMSPs
router.post('/cdrs', authMiddleware, async (req, res) => {
    try {
        console.log('📍 POST /ocpi/emsp/2.2/cdrs - Recibiendo CDR de eMSP');
        console.log('📝 CDR recibido:', JSON.stringify(req.body, null, 2));
        
        const cdrData = req.body;
        
        // Validar campos obligatorios
        if (!cdrData.country_code || !cdrData.party_id || !cdrData.id || !cdrData.session_id) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'Missing required fields: country_code, party_id, id, session_id',
                timestamp: new Date().toISOString()
            });
        }
        
        // Mapear datos del CDR a la estructura de la tabla emsp_cdrs
        const cdrValues = [
            cdrData.id, // id (primary key)
            cdrData.party_id, // emsp_party_id
            cdrData.country_code, // emsp_country_code
            cdrData.id, // cdr_id (mismo que id)
            cdrData.session_id, // session_id
            cdrData.cdr_location?.evse_uid || 'unknown', // evse_uid
            cdrData.cdr_location?.connector_id || null, // connector_id
            cdrData.cdr_token?.uid || cdrData.id, // id_token
            cdrData.start_date_time ? new Date(cdrData.start_date_time) : new Date(), // start_datetime
            cdrData.end_date_time ? new Date(cdrData.end_date_time) : new Date(), // end_datetime
            cdrData.total_energy || 0.0, // total_energy
            cdrData.total_cost?.excl_vat || null, // total_cost
            cdrData.currency || 'EUR', // currency
            null, // total_parking_time (no viene en el payload)
            cdrData.total_time || 0, // total_time
            cdrData.last_updated ? new Date(cdrData.last_updated) : new Date() // last_updated
        ];
        
        console.log('🔍 Procesando CDR:', {
            id: cdrData.id,
            party_id: cdrData.party_id,
            country_code: cdrData.country_code,
            session_id: cdrData.session_id,
            total_energy: cdrData.total_energy,
            total_cost: cdrData.total_cost?.excl_vat
        });
        
        // Insertar o actualizar CDR en la tabla emsp_cdrs
        const [result] = await sequelize.query(`
            INSERT INTO emsp_cdrs (
                id, emsp_party_id, emsp_country_code, cdr_id, session_id, evse_uid, 
                connector_id, id_token, start_datetime, end_datetime, total_energy, 
                total_cost, currency, total_parking_time, total_time, last_updated, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON CONFLICT (id) 
            DO UPDATE SET
                emsp_party_id = EXCLUDED.emsp_party_id,
                emsp_country_code = EXCLUDED.emsp_country_code,
                cdr_id = EXCLUDED.cdr_id,
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
            replacements: cdrValues
        });
        
        console.log('✅ CDR guardado exitosamente:', cdrData.id);
        
        res.status(200).json({
            status_code: 1000,
            data: {
                message: 'CDR received and saved successfully',
                cdr_id: cdrData.id,
                session_id: cdrData.session_id,
                party_id: cdrData.party_id,
                country_code: cdrData.country_code
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error procesando CDR de eMSP:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error processing EMSP CDR',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/tokens - Obtener tokens de eMSPs
router.get('/tokens', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/tokens - Consultando tokens de eMSPs');
        
        // Consultar tokens de la tabla tokens donde party_id sea IPD
        const [results] = await sequelize.query(`
            SELECT 
                id,
                country_code,
                party_id,
                uid,
                type,
                contract_id,
                visual_number,
                issuer,
                group_id,
                valid,
                whitelist,
                language,
                default_profile_type,
                energy_contract,
                last_updated
            FROM tokens 
            WHERE party_id = '${process.env.OCPI_PARTY_ID}'
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} tokens de IPD (eMSP) encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando tokens de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP tokens',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/contracts - Obtener contratos de eMSPs
router.get('/contracts', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/contracts - Consultando contratos de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_contracts 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} contratos de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando contratos de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP contracts',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/tokens/stored - Obtener tokens almacenados en emsp_tokens
router.get('/tokens/stored', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/tokens/stored - Consultando tokens almacenados en emsp_tokens');
        
        // Consultar tokens de la tabla emsp_tokens
        const [results] = await sequelize.query(`
            SELECT 
                id,
                emsp_party_id as party_id,
                emsp_country_code as country_code,
                token_uid as uid,
                type,
                contract_id,
                visual_number,
                issuer,
                group_id,
                valid,
                whitelist,
                language,
                default_profile_type,
                energy_contract,
                last_updated,
                created_at
            FROM emsp_tokens 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} tokens almacenados encontrados en emsp_tokens`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando tokens almacenados:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting stored EMSP tokens',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
