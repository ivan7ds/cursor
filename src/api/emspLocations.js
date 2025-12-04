const express = require('express');

const router = express.Router();
const EmspEVSE = require('../models/EmspEVSE');
const EVSE = require('../models/EVSE');
const logger = require('../utils/logger');
const {
  validateLocationPutMiddleware,
  validateLocationPatchMiddleware
} = require('../validators/locationValidators');

// PUT /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}
// Crear o actualizar una Location completa (OCPI 2.2)
router.put('/:country_code/:party_id/:location_id', validateLocationPutMiddleware, async (req, res) => {
    try {
        const { country_code, party_id, location_id } = req.params;
        const locationData = req.validatedLocation;

        logger.info(`📥 PUT Location received`, {
            country_code,
            party_id,
            location_id,
            timestamp: new Date().toISOString()
        });

        const { sequelize } = require('../database/connection');

        // Verificar si la ubicación ya existe en emsp_locations
        const [existingLocation] = await sequelize.query(`
            SELECT id FROM emsp_locations WHERE id = ?
        `, {
            replacements: [location_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (existingLocation) {
            // Actualizar location existente
            await sequelize.query(`
                UPDATE emsp_locations SET
                    emsp_party_id = ?,
                    emsp_country_code = ?,
                    name = ?,
                    address = ?,
                    city = ?,
                    postal_code = ?,
                    state = ?,
                    country = ?,
                    coordinates = ?,
                    related_locations = ?,
                    parking_type = ?,
                    time_zone = ?,
                    opening_times = ?,
                    charging_when_closed = ?,
                    images = ?,
                    energy_mix = ?,
                    directions = ?,
                    operator = ?,
                    suboperator = ?,
                    owner = ?,
                    facilities = ?,
                    publish = ?,
                    publish_allowed_to = ?,
                    last_updated = ?
                WHERE id = ?
            `, {
                replacements: [
                    party_id,
                    country_code,
                    locationData.name || null,
                    locationData.address,
                    locationData.city,
                    locationData.postal_code || null,
                    locationData.state || null,
                    locationData.country,
                    JSON.stringify(locationData.coordinates),
                    JSON.stringify(locationData.related_locations || []),
                    locationData.parking_type || null,
                    locationData.time_zone,
                    JSON.stringify(locationData.opening_times || null),
                    locationData.charging_when_closed || false,
                    JSON.stringify(locationData.images || []),
                    JSON.stringify(locationData.energy_mix || null),
                    JSON.stringify(locationData.directions || []),
                    JSON.stringify(locationData.operator || null),
                    JSON.stringify(locationData.suboperator || null),
                    JSON.stringify(locationData.owner || null),
                    JSON.stringify(locationData.facilities || []),
                    locationData.publish,
                    JSON.stringify(locationData.publish_allowed_to || []),
                    locationData.last_updated,
                    location_id
                ]
            });

            logger.info(`✅ Location updated in emsp_locations: ${location_id}`);
        } else {
            // Crear nueva location
            await sequelize.query(`
                INSERT INTO emsp_locations (
                    id, emsp_party_id, emsp_country_code, location_id, name, address, city,
                    postal_code, state, country, coordinates, related_locations, parking_type,
                    time_zone, opening_times, charging_when_closed, images, energy_mix,
                    directions, operator, suboperator, owner, facilities, publish,
                    publish_allowed_to, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, {
                replacements: [
                    location_id,
                    party_id,
                    country_code,
                    location_id,
                    locationData.name || null,
                    locationData.address,
                    locationData.city,
                    locationData.postal_code || null,
                    locationData.state || null,
                    locationData.country,
                    JSON.stringify(locationData.coordinates),
                    JSON.stringify(locationData.related_locations || []),
                    locationData.parking_type || null,
                    locationData.time_zone,
                    JSON.stringify(locationData.opening_times || null),
                    locationData.charging_when_closed || false,
                    JSON.stringify(locationData.images || []),
                    JSON.stringify(locationData.energy_mix || null),
                    JSON.stringify(locationData.directions || []),
                    JSON.stringify(locationData.operator || null),
                    JSON.stringify(locationData.suboperator || null),
                    JSON.stringify(locationData.owner || null),
                    JSON.stringify(locationData.facilities || []),
                    locationData.publish,
                    JSON.stringify(locationData.publish_allowed_to || []),
                    locationData.last_updated
                ]
            });

            logger.info(`✅ Location created in emsp_locations: ${location_id}`);
        }

        // Si la location incluye EVSEs, procesarlos
        if (locationData.evses && Array.isArray(locationData.evses)) {
            for (const evseData of locationData.evses) {
                const existingEvse = await EmspEVSE.findOne({
                    where: { id: evseData.uid }
                });

                if (existingEvse) {
                    await existingEvse.update({
                        status: evseData.status,
                        capabilities: evseData.capabilities || [],
                        connectors: evseData.connectors || [],
                        physical_reference: evseData.physical_reference || null,
                        last_updated: evseData.last_updated
                    });
                    logger.info(`✅ EVSE updated: ${evseData.uid}`);
                } else {
                    await EmspEVSE.create({
                        id: evseData.uid,
                        emsp_party_id: party_id,
                        emsp_country_code: country_code,
                        location_id,
                        evse_id: evseData.evse_id || '',
                        status: evseData.status,
                        capabilities: evseData.capabilities || [],
                        connectors: evseData.connectors || [],
                        physical_reference: evseData.physical_reference || null,
                        last_updated: evseData.last_updated
                    });
                    logger.info(`✅ EVSE created: ${evseData.uid}`);
                }
            }
        }

        res.status(200).json({
            status_code: 1000,
            status_message: 'Success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`❌ Error processing Location PUT: ${error.message}`, {
            error: error.message,
            stack: error.stack,
            params: req.params,
            body: req.body
        });

        res.status(500).json({
            status_code: 2000,
            status_message: `Internal server error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

// PATCH /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}
// Actualizar parcialmente una Location (OCPI 2.2)
router.patch('/:country_code/:party_id/:location_id', validateLocationPatchMiddleware, async (req, res) => {
    try {
        const { country_code, party_id, location_id } = req.params;
        const updateData = req.validatedLocationPatch;

        logger.info(`📥 PATCH Location received`, {
            country_code,
            party_id,
            location_id,
            updateFields: Object.keys(updateData),
            timestamp: new Date().toISOString()
        });

        const { sequelize } = require('../database/connection');

        // Verificar que la location existe
        const [existingLocation] = await sequelize.query(`
            SELECT id FROM emsp_locations WHERE id = ?
        `, {
            replacements: [location_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (!existingLocation) {
            logger.warn(`⚠️ Location not found: ${location_id}`, {
                country_code,
                party_id,
                location_id
            });
            return res.status(404).json({
                status_code: 2001,
                status_message: 'Location not found',
                timestamp: new Date().toISOString()
            });
        }

        // Construir actualización dinámica
        const updateFields = [];
        const replacements = [];

        const fieldMap = {
            name: 'name',
            address: 'address',
            city: 'city',
            postal_code: 'postal_code',
            state: 'state',
            country: 'country',
            coordinates: 'coordinates',
            related_locations: 'related_locations',
            parking_type: 'parking_type',
            time_zone: 'time_zone',
            opening_times: 'opening_times',
            charging_when_closed: 'charging_when_closed',
            images: 'images',
            energy_mix: 'energy_mix',
            directions: 'directions',
            operator: 'operator',
            suboperator: 'suboperator',
            owner: 'owner',
            facilities: 'facilities',
            publish: 'publish',
            publish_allowed_to: 'publish_allowed_to',
            last_updated: 'last_updated'
        };

        for (const [key, dbField] of Object.entries(fieldMap)) {
            if (updateData[key] !== undefined) {
                updateFields.push(`${dbField} = ?`);
                // JSON fields
                if (['coordinates', 'related_locations', 'opening_times', 'images', 'energy_mix',
                     'directions', 'operator', 'suboperator', 'owner', 'facilities', 'publish_allowed_to'].includes(key)) {
                    replacements.push(JSON.stringify(updateData[key]));
                } else {
                    replacements.push(updateData[key]);
                }
            }
        }

        if (updateFields.length === 0) {
            logger.warn(`⚠️ No fields to update for PATCH`, {
                country_code,
                party_id,
                location_id
            });
            return res.status(400).json({
                status_code: 2001,
                status_message: 'No fields to update',
                timestamp: new Date().toISOString()
            });
        }

        replacements.push(location_id);

        await sequelize.query(`
            UPDATE emsp_locations SET ${updateFields.join(', ')} WHERE id = ?
        `, { replacements });

        logger.info(`✅ Location patched: ${location_id}`, {
            updatedFields: Object.keys(updateData)
        });

        res.status(200).json({
            status_code: 1000,
            status_message: 'Success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`❌ Error patching Location: ${error.message}`, {
            error: error.message,
            stack: error.stack,
            params: req.params,
            body: req.body
        });

        res.status(500).json({
            status_code: 2000,
            status_message: `Internal server error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

// PUT /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}
// Crear o actualizar un EVSE en una location específica
router.put('/:country_code/:party_id/:location_id/:evse_uid', async (req, res) => {
    try {
        const { country_code, party_id, location_id, evse_uid } = req.params;
        const evseData = req.body;

        logger.info(`📥 PUT EVSE in Location received`, {
            country_code,
            party_id,
            location_id,
            evse_uid,
            status: evseData.status,
            evse_id: evseData.evse_id,
            timestamp: new Date().toISOString()
        });

        // Verificar si el EVSE ya existe en emsp_evses
        const evseResult = await EmspEVSE.findOne({
            where: { id: evse_uid },
            attributes: ['id', 'location_id']
        });

        // Usar el location_id de los parámetros (el operador externo nos lo envía)
        const actualLocationId = location_id;

        // Verificar si la ubicación existe en emsp_locations, si no, crear una
        const { sequelize } = require('../database/connection');
        
        // Verificar si existe en emsp_locations
        const [existingLocation] = await sequelize.query(`
            SELECT id FROM emsp_locations WHERE id = ?
        `, {
            replacements: [actualLocationId],
            type: sequelize.QueryTypes.SELECT
        });
        
        if (!existingLocation) {
            logger.info(`📍 Creating new location in emsp_locations: ${actualLocationId}`, {
                country_code,
                party_id,
                location_id: actualLocationId
            });
            
            // Crear ubicación en emsp_locations
            await sequelize.query(`
                INSERT INTO emsp_locations (
                    id, emsp_party_id, emsp_country_code, location_id, name, address, city, 
                    postal_code, country, coordinates, time_zone, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, {
                replacements: [
                    actualLocationId,
                    party_id,
                    country_code,
                    actualLocationId,
                    `Location for ${evse_uid}`,
                    'Address not provided',
                    'Unknown',
                    '00000',
                    country_code,
                    JSON.stringify({ latitude: '0.0', longitude: '0.0' }),
                    'Europe/Madrid',
                    new Date().toISOString()
                ]
            });
            
            logger.info(`✅ Created location in emsp_locations: ${actualLocationId}`);
        }

        // Verificar si el EVSE ya existe en la tabla emsp_evses (EVSEs de organizaciones externas)
        const existingEvse = await EmspEVSE.findOne({
            where: { id: evse_uid }
        });

        if (existingEvse) {
            // Actualizar EVSE existente en emsp_evses
            await existingEvse.update({
                status: evseData.status,
                capabilities: evseData.capabilities || [],
                connectors: evseData.connectors || [],
                physical_reference: evseData.physical_reference || null,
                last_updated: evseData.last_updated || new Date().toISOString()
            });

            logger.info(`✅ EVSE externo actualizado en emsp_evses`, {
                evse_uid,
                location_id: actualLocationId,
                status: evseData.status,
                party_id,
                country_code
            });
        } else {
            // Crear nuevo EVSE en emsp_evses (solo para organizaciones externas)
            await EmspEVSE.create({
                id: evse_uid,
                emsp_party_id: party_id,
                emsp_country_code: country_code,
                location_id: actualLocationId,
                evse_id: evseData.evse_id || '',
                status: evseData.status,
                capabilities: evseData.capabilities || [],
                connectors: evseData.connectors || [],
                physical_reference: evseData.physical_reference || null,
                last_updated: evseData.last_updated || new Date().toISOString()
            });

            logger.info(`✅ EVSE externo creado en emsp_evses`, {
                evse_uid,
                location_id: actualLocationId,
                status: evseData.status,
                party_id,
                country_code
            });
        }

        res.status(200).json({
            status_code: 1000,
            status_message: 'Success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`❌ Error processing EVSE in location: ${error.message}`, {
            error: error.message,
            stack: error.stack,
            params: req.params,
            body: req.body
        });

        res.status(500).json({
            status_code: 2000,
            status_message: `Internal server error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

// PATCH /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}
// Actualizar parcialmente un EVSE en una location específica
router.patch('/:country_code/:party_id/:location_id/:evse_uid', async (req, res) => {
    try {
        const { country_code, party_id, location_id, evse_uid } = req.params;
        const updateData = req.body;

        logger.info(`📥 PATCH EVSE in Location received`, {
            country_code,
            party_id,
            location_id,
            evse_uid,
            updateFields: Object.keys(updateData),
            timestamp: new Date().toISOString()
        });

        // Verificar que el EVSE existe en emsp_evses
        const evseResult = await EmspEVSE.findByPk(evse_uid);

        if (!evseResult) {
            logger.warn(`⚠️ EVSE not found in emsp_evses: ${evse_uid}`, {
                country_code,
                party_id,
                location_id,
                evse_uid
            });
            return res.status(404).json({
                status_code: 2001,
                status_message: 'EVSE not found',
                timestamp: new Date().toISOString()
            });
        }

        // Construir el objeto de actualización dinámicamente
        const updateFields = {};

        if (updateData.status !== undefined) {
            updateFields.status = updateData.status;
        }
        if (updateData.capabilities !== undefined) {
            updateFields.capabilities = updateData.capabilities;
        }
        if (updateData.connectors !== undefined) {
            updateFields.connectors = updateData.connectors;
        }
        if (updateData.physical_reference !== undefined) {
            updateFields.physical_reference = updateData.physical_reference;
        }
        if (updateData.last_updated !== undefined) {
            updateFields.last_updated = updateData.last_updated;
        }

        if (Object.keys(updateFields).length === 0) {
            logger.warn(`⚠️ No fields to update for PATCH`, {
                country_code,
                party_id,
                location_id,
                evse_uid
            });
            return res.status(400).json({
                status_code: 2001,
                status_message: 'No fields to update',
                timestamp: new Date().toISOString()
            });
        }

        await evseResult.update(updateFields);

        logger.info(`✅ EVSE patched in location`, {
            evse_uid,
            location_id,
            updatedFields: Object.keys(updateData)
        });

        res.status(200).json({
            status_code: 1000,
            status_message: 'Success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`❌ Error patching EVSE in location: ${error.message}`, {
            error: error.message,
            stack: error.stack,
            params: req.params,
            body: req.body
        });

        res.status(500).json({
            status_code: 2000,
            status_message: `Internal server error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
