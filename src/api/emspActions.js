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

module.exports = { router };
