const express = require('express');
const router = express.Router();
const { sequelize } = require('../database/connection');
const { authMiddleware } = require('../middleware/auth');

// ===== ENDPOINTS PARA ACCIONES EMSP =====
// Estos endpoints permiten actuar como eMSP y guardar datos de CPOs externos

// POST /emsp/actions/save-cpo-locations - Guardar locations de un CPO externo
router.post('/save-cpo-locations', authMiddleware, async (req, res) => {
    try {
        const { cpoUrl, cpoToken, cpoVersion, locations } = req.body;
        
        if (!cpoUrl || !locations || !Array.isArray(locations)) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'Missing required fields: cpoUrl and locations array',
                timestamp: new Date().toISOString()
            });
        }

        console.log(`🌐 Guardando ${locations.length} locations del CPO: ${cpoUrl}`);
        
        let savedCount = 0;
        let errors = [];

        for (const location of locations) {
            try {
                // Validar campos obligatorios
                if (!location.party_id || !location.country_code || !location.id) {
                    console.warn(`⚠️ Location ${location.id} sin campos obligatorios, saltando...`);
                    continue;
                }

                // Preparar valores con validación y valores por defecto para campos obligatorios
                const values = [
                    location.id, // Usar solo el ID original de la location
                    location.party_id || null,
                    location.country_code || null,
                    location.id || null,
                    location.name || 'Sin nombre',
                    location.address || 'Sin dirección',
                    location.city || 'Sin ciudad',
                    location.postal_code || null,
                    location.country || 'Sin país',
                    JSON.stringify(location.coordinates || {}),
                    JSON.stringify(location.evses || []),
                    location.directions || null,
                    JSON.stringify(location.operator || {}),
                    JSON.stringify(location.suboperator || {}),
                    JSON.stringify(location.owner || {}),
                    JSON.stringify(location.facilities || []),
                    location.time_zone || 'UTC',
                    JSON.stringify(location.opening_times || {}),
                    location.charging_when_closed || null,
                    JSON.stringify(location.images || []),
                    JSON.stringify(location.energy_mix || {}),
                    location.last_updated || new Date().toISOString()
                ];

                console.log(`🔍 Procesando location: ${location.id} (${location.party_id}_${location.country_code})`);

                // Insertar o actualizar location
                const [result] = await sequelize.query(`
                    INSERT INTO emsp_locations (
                        id, emsp_party_id, emsp_country_code, location_id, name, address, city, 
                        postal_code, country, coordinates, evse_list, directions, operator, 
                        suboperator, owner, facilities, time_zone, opening_times, 
                        charging_when_closed, images, energy_mix, last_updated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (id) 
                    DO UPDATE SET
                        emsp_party_id = EXCLUDED.emsp_party_id,
                        emsp_country_code = EXCLUDED.emsp_country_code,
                        location_id = EXCLUDED.location_id,
                        name = EXCLUDED.name,
                        address = EXCLUDED.address,
                        city = EXCLUDED.city,
                        postal_code = EXCLUDED.postal_code,
                        country = EXCLUDED.country,
                        coordinates = EXCLUDED.coordinates,
                        evse_list = EXCLUDED.evse_list,
                        directions = EXCLUDED.directions,
                        operator = EXCLUDED.operator,
                        suboperator = EXCLUDED.suboperator,
                        owner = EXCLUDED.owner,
                        facilities = EXCLUDED.facilities,
                        time_zone = EXCLUDED.time_zone,
                        opening_times = EXCLUDED.opening_times,
                        charging_when_closed = EXCLUDED.charging_when_closed,
                        images = EXCLUDED.images,
                        energy_mix = EXCLUDED.energy_mix,
                        last_updated = EXCLUDED.last_updated,
                        updated_at = NOW()
                `, {
                    replacements: values
                });
                
                // Extraer y guardar EVSEs individuales
                if (location.evses && Array.isArray(location.evses) && location.evses.length > 0) {
                    console.log(`🔌 Procesando ${location.evses.length} EVSEs para location ${location.id}`);
                    
                    for (const evse of location.evses) {
                        try {
                            // Insertar o actualizar EVSE
                            await sequelize.query(`
                                INSERT INTO emsp_evses (
                                    id, emsp_party_id, emsp_country_code, location_id, evse_id, 
                                    status, capabilities, connectors, physical_reference, 
                                    last_updated, created_at, updated_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                                ON CONFLICT (id) 
                                DO UPDATE SET
                                    emsp_party_id = EXCLUDED.emsp_party_id,
                                    emsp_country_code = EXCLUDED.emsp_country_code,
                                    location_id = EXCLUDED.location_id,
                                    evse_id = EXCLUDED.evse_id,
                                    status = EXCLUDED.status,
                                    capabilities = EXCLUDED.capabilities,
                                    connectors = EXCLUDED.connectors,
                                    physical_reference = EXCLUDED.physical_reference,
                                    last_updated = EXCLUDED.last_updated,
                                    updated_at = NOW()
                            `, {
                                replacements: [
                                    evse.uid, // ID único del EVSE
                                    location.party_id,
                                    location.country_code,
                                    location.id,
                                    evse.evse_id,
                                    evse.status,
                                    JSON.stringify(evse.capabilities || []),
                                    JSON.stringify(evse.connectors || []),
                                    evse.physical_reference || null,
                                    evse.last_updated || new Date().toISOString()
                                ]
                            });
                            
                            console.log(`✅ EVSE ${evse.uid} guardado exitosamente`);
                            
                        } catch (evseError) {
                            console.error(`❌ Error guardando EVSE ${evse.uid}:`, evseError);
                            errors.push(`EVSE ${evse.uid}: ${evseError.message}`);
                        }
                    }
                }
                
                savedCount++;
                
            } catch (locationError) {
                console.error(`❌ Error guardando location ${location.id}:`, locationError);
                errors.push(`Location ${location.id}: ${locationError.message}`);
            }
        }

        console.log(`✅ ${savedCount} locations guardados exitosamente del CPO: ${cpoUrl}`);

        res.status(200).json({
            status_code: 1000,
            data: {
                message: `${savedCount} locations guardados exitosamente`,
                total_received: locations.length,
                saved_count: savedCount,
                errors: errors.length > 0 ? errors : null,
                cpo_url: cpoUrl
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error guardando locations del CPO:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error saving CPO locations',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /emsp/actions/save-cpo-evses - Guardar EVSEs de un CPO externo
router.post('/save-cpo-evses', authMiddleware, async (req, res) => {
    try {
        const { cpoUrl, cpoToken, cpoVersion, evses } = req.body;
        
        if (!cpoUrl || !evses || !Array.isArray(evses)) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'Missing required fields: cpoUrl and evses array',
                timestamp: new Date().toISOString()
            });
        }

        console.log(`🌐 Guardando ${evses.length} EVSEs del CPO: ${cpoUrl}`);
        
        let savedCount = 0;
        let errors = [];

        for (const evse of evses) {
            try {
                // Insertar o actualizar EVSE
                const [result] = await sequelize.query(`
                    INSERT INTO emsp_evses (
                        cpo_url, cpo_token, cpo_version, evse_id, location_id, party_id, country_code,
                        status, capabilities, connectors, floor_level, coordinates, physical_reference,
                        directions, restrictions, last_updated, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    ON CONFLICT (evse_id, location_id, party_id, country_code) 
                    DO UPDATE SET
                        cpo_url = EXCLUDED.cpo_url,
                        cpo_token = EXCLUDED.cpo_token,
                        cpo_version = EXCLUDED.cpo_version,
                        status = EXCLUDED.status,
                        capabilities = EXCLUDED.capabilities,
                        connectors = EXCLUDED.connectors,
                        floor_level = EXCLUDED.floor_level,
                        coordinates = EXCLUDED.coordinates,
                        physical_reference = EXCLUDED.physical_reference,
                        directions = EXCLUDED.directions,
                        restrictions = EXCLUDED.restrictions,
                        last_updated = EXCLUDED.last_updated,
                        updated_at = NOW()
                `, {
                    replacements: [
                        cpoUrl,
                        cpoToken || null,
                        cpoVersion || '2.2',
                        evse.uid,
                        evse.location_id,
                        evse.party_id,
                        evse.country_code,
                        evse.status,
                        JSON.stringify(evse.capabilities || []),
                        JSON.stringify(evse.connectors || []),
                        evse.floor_level,
                        JSON.stringify(evse.coordinates || {}),
                        evse.physical_reference,
                        evse.directions,
                        JSON.stringify(evse.restrictions || {}),
                        evse.last_updated || new Date().toISOString()
                    ]
                });
                
                savedCount++;
                
            } catch (evseError) {
                console.error(`❌ Error guardando EVSE ${evse.uid}:`, evseError);
                errors.push(`EVSE ${evse.uid}: ${evseError.message}`);
            }
        }

        console.log(`✅ ${savedCount} EVSEs guardados exitosamente del CPO: ${cpoUrl}`);

        res.status(200).json({
            status_code: 1000,
            data: {
                message: `${savedCount} EVSEs guardados exitosamente`,
                total_received: evses.length,
                saved_count: savedCount,
                errors: errors.length > 0 ? errors : null,
                cpo_url: cpoUrl
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error guardando EVSEs del CPO:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error saving CPO EVSEs',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /emsp/actions/save-emsp-tokens - Guardar tokens de nuestro eMSP
router.post('/save-emsp-tokens', authMiddleware, async (req, res) => {
    try {
        const { tokens } = req.body;
        
        if (!tokens || !Array.isArray(tokens)) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'Missing required fields: tokens array',
                timestamp: new Date().toISOString()
            });
        }

        console.log(`🔑 Guardando ${tokens.length} tokens de nuestro eMSP`);
        
        let savedCount = 0;
        let errors = [];

        for (const token of tokens) {
            try {
                // Validar campos obligatorios
                if (!token.party_id || !token.country_code || !token.uid || !token.type) {
                    console.warn(`⚠️ Token sin campos obligatorios party_id/country_code/uid/type, saltando...`);
                    continue;
                }

                // Generar id estable si no viene: <party_id>-<uid>
                const stableId = token.id || `${token.party_id}-${token.uid}`;

                // Preparar valores con validación y valores por defecto
                const values = [
                    stableId,
                    token.party_id,
                    token.country_code,
                    token.uid,
                    token.type,
                    token.contract_id || null,
                    token.visual_number || null,
                    token.issuer || 'Unknown',
                    token.group_id || null,
                    token.valid !== undefined ? token.valid : true,
                    token.whitelist || null,
                    token.language || null,
                    token.default_profile_type || null,
                    token.energy_contract ? JSON.stringify(token.energy_contract) : null,
                    token.last_updated || new Date().toISOString()
                ];

                console.log(`🔍 Procesando token: ${token.uid} (${token.party_id}_${token.country_code}) id=${stableId}`);

                // Insertar o actualizar token
                const [result] = await sequelize.query(`
                    INSERT INTO emsp_tokens (
                        id, emsp_party_id, emsp_country_code, token_uid, type, contract_id, 
                        visual_number, issuer, group_id, valid, whitelist, language, 
                        default_profile_type, energy_contract, last_updated, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    ON CONFLICT (id) 
                    DO UPDATE SET
                        emsp_party_id = EXCLUDED.emsp_party_id,
                        emsp_country_code = EXCLUDED.emsp_country_code,
                        token_uid = EXCLUDED.token_uid,
                        type = EXCLUDED.type,
                        contract_id = EXCLUDED.contract_id,
                        visual_number = EXCLUDED.visual_number,
                        issuer = EXCLUDED.issuer,
                        group_id = EXCLUDED.group_id,
                        valid = EXCLUDED.valid,
                        whitelist = EXCLUDED.whitelist,
                        language = EXCLUDED.language,
                        default_profile_type = EXCLUDED.default_profile_type,
                        energy_contract = EXCLUDED.energy_contract,
                        last_updated = EXCLUDED.last_updated,
                        updated_at = NOW()
                `, {
                    replacements: values
                });
                
                savedCount++;
                console.log(`✅ Token ${token.uid} guardado exitosamente`);
                
            } catch (tokenError) {
                console.error(`❌ Error guardando token ${token.id || token.uid}:`, tokenError);
                errors.push(`Token ${token.id || token.uid}: ${tokenError.message}`);
            }
        }

        console.log(`✅ ${savedCount} tokens guardados exitosamente en emsp_tokens`);

        res.status(200).json({
            status_code: 1000,
            data: {
                message: `${savedCount} tokens guardados exitosamente`,
                total_received: tokens.length,
                saved_count: savedCount,
                errors: errors.length > 0 ? errors : null
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error guardando tokens eMSP:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error saving EMSP tokens',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /emsp/actions/save-cpo-tariffs - Guardar tariffs de un CPO externo
router.post('/save-cpo-tariffs', authMiddleware, async (req, res) => {
    try {
        const { tariffs } = req.body;
        
        if (!tariffs || !Array.isArray(tariffs)) {
            return res.status(400).json({
                status_code: 2000,
                status_message: 'Missing required fields: tariffs array',
                timestamp: new Date().toISOString()
            });
        }

        console.log(`🌐 Guardando ${tariffs.length} tariffs del CPO externo`);
        
        let savedCount = 0;
        let errors = [];

        for (const tariff of tariffs) {
            try {
                // Validar campos obligatorios
                if (!tariff.party_id || !tariff.country_code || !tariff.id) {
                    console.warn(`⚠️ Tariff sin campos obligatorios party_id/country_code/id, saltando...`);
                    continue;
                }

                // Preparar valores con validación y valores por defecto
                const values = [
                    tariff.id,
                    tariff.party_id,
                    tariff.country_code,
                    tariff.id, // tariff_id es el mismo que id
                    tariff.currency || 'EUR',
                    tariff.type || 'REGULAR', // Campo obligatorio type
                    JSON.stringify(tariff.elements || []),
                    tariff.start_date_time || null,
                    tariff.end_date_time || null,
                    tariff.last_updated || new Date().toISOString()
                ];

                console.log(`🔍 Procesando tariff: ${tariff.id} (${tariff.party_id}_${tariff.country_code})`);

                // Insertar o actualizar tariff
                const [result] = await sequelize.query(`
                    INSERT INTO emsp_tariffs (
                        id, emsp_party_id, emsp_country_code, tariff_id, currency, type, 
                        elements, start_date_time, end_date_time, last_updated, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    ON CONFLICT (id) 
                    DO UPDATE SET
                        emsp_party_id = EXCLUDED.emsp_party_id,
                        emsp_country_code = EXCLUDED.emsp_country_code,
                        tariff_id = EXCLUDED.tariff_id,
                        currency = EXCLUDED.currency,
                        type = EXCLUDED.type,
                        elements = EXCLUDED.elements,
                        start_date_time = EXCLUDED.start_date_time,
                        end_date_time = EXCLUDED.end_date_time,
                        last_updated = EXCLUDED.last_updated,
                        updated_at = NOW()
                `, {
                    replacements: values
                });
                
                savedCount++;
                console.log(`✅ Tariff ${tariff.id} guardado exitosamente`);
                
            } catch (tariffError) {
                console.error(`❌ Error guardando tariff ${tariff.id}:`, tariffError);
                errors.push(`Tariff ${tariff.id}: ${tariffError.message}`);
            }
        }

        console.log(`✅ ${savedCount} tariffs guardados exitosamente en emsp_tariffs`);

        res.status(200).json({
            status_code: 1000,
            data: {
                message: `${savedCount} tariffs guardados exitosamente`,
                total_received: tariffs.length,
                saved_count: savedCount,
                errors: errors.length > 0 ? errors : null
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error guardando tariffs del CPO:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error saving CPO tariffs',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /emsp/actions/get-external-sessions - Obtener sesiones de organizaciones externas conectadas
router.get('/get-external-sessions', authMiddleware, async (req, res) => {
    try {
        console.log('🌐 Obteniendo sesiones de organizaciones externas conectadas...');
        
        // Obtener todas las organizaciones configuradas (excluyendo nuestro CPO)
        const organizations = await sequelize.query(`
            SELECT id, token, url, party_id, country_code, business_details
            FROM credentials 
            WHERE url IS NOT NULL 
            AND token IS NOT NULL
            AND url != ''
            AND token != ''
            AND party_id != 'IPD'
        `, {
            type: sequelize.QueryTypes.SELECT
        });
        
        if (organizations.length === 0) {
            return res.status(200).json({
                status_code: 1000,
                data: [],
                message: 'No hay organizaciones externas conectadas',
                timestamp: new Date().toISOString()
            });
        }
        
        console.log(`📤 Consultando sesiones a ${organizations.length} organización(es) externa(s)`);
        
        const allSessions = [];
        const errors = [];
        
        // Consultar sesiones de cada organización
        for (const org of organizations) {
            try {
                console.log(`🔍 Consultando sesiones de ${org.party_id} (${org.url})`);
                
                // Construir URL para obtener sesiones del CPO externo
                const sessionsUrl = `${org.url}/ocpi/cpo/2.2/sessions`;
                
                const response = await fetch(sessionsUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${org.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.data && Array.isArray(data.data)) {
                        // Agregar información de la organización a cada sesión
                        const sessionsWithOrg = data.data.map(session => ({
                            ...session,
                            source_organization: {
                                party_id: org.party_id,
                                country_code: org.country_code,
                                url: org.url,
                                business_details: org.business_details
                            }
                        }));
                        allSessions.push(...sessionsWithOrg);
                        console.log(`✅ ${sessionsWithOrg.length} sesiones obtenidas de ${org.party_id}`);
                    } else {
                        console.log(`⚠️ No se encontraron sesiones en ${org.party_id}`);
                    }
                } else {
                    const errorText = await response.text();
                    const error = `Error consultando ${org.party_id}: HTTP ${response.status} - ${errorText}`;
                    errors.push(error);
                    console.warn(`⚠️ ${error}`);
                }
                
            } catch (orgError) {
                const error = `Error consultando ${org.party_id}: ${orgError.message}`;
                errors.push(error);
                console.error(`❌ ${error}`);
            }
        }
        
        console.log(`✅ Total de sesiones obtenidas: ${allSessions.length}`);
        if (errors.length > 0) {
            console.log(`⚠️ Errores encontrados: ${errors.length}`);
        }
        
        res.status(200).json({
            status_code: 1000,
            data: allSessions,
            metadata: {
                total_sessions: allSessions.length,
                organizations_consulted: organizations.length,
                errors: errors,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo sesiones de organizaciones externas:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting external sessions',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = { router };
