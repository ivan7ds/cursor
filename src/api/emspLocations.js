const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const EVSE = require('../models/EVSE');
const EmspEVSE = require('../models/EmspEVSE');

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

        // Verificar que el EVSE existe en emsp_evses (contiene tanto id como location_id)
        const evseResult = await EmspEVSE.findOne({
            where: { id: evse_uid },
            attributes: ['id', 'location_id']
        });

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

        // Usar el location_id obtenido de emsp_evses
        const actualLocationId = evseResult.location_id;

        // Verificar si el EVSE ya existe en la tabla evses
        const existingEvse = await EVSE.findByPk(evse_uid);

        if (existingEvse) {
            // Actualizar EVSE existente
            await existingEvse.update({
                status: evseData.status,
                capabilities: evseData.capabilities || [],
                connectors: evseData.connectors || [],
                physical_reference: evseData.physical_reference || null,
                last_updated: evseData.last_updated || new Date().toISOString()
            });

            logger.info(`✅ EVSE updated in location`, {
                evse_uid,
                location_id: actualLocationId,
                status: evseData.status
            });
        } else {
            // Crear nuevo EVSE
            await EVSE.create({
                id: evse_uid,
                location_id: actualLocationId,
                country_code: country_code,
                party_id: party_id,
                evse_id: evseData.evse_id || '',
                status: evseData.status,
                capabilities: evseData.capabilities || [],
                connectors: evseData.connectors || [],
                physical_reference: evseData.physical_reference || null,
                last_updated: evseData.last_updated || new Date().toISOString()
            });

            logger.info(`✅ EVSE created in location`, {
                evse_uid,
                location_id: actualLocationId,
                status: evseData.status
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

        // Verificar que el EVSE existe
        const evseResult = await EVSE.findByPk(evse_uid);

        if (!evseResult) {
            logger.warn(`⚠️ EVSE not found: ${evse_uid}`, {
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
