const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// PUT /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}
// Crear o actualizar un EVSE en una location específica
router.put('/:country_code/:party_id/:location_id/:evse_uid', async (req, res) => {
    try {
        const { sequelize } = require('../models');
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
        const evseQuery = `
            SELECT id, location_id FROM emsp_evses 
            WHERE id = '${evse_uid}' AND deleted_at IS NULL
        `;
        
        const evseResult = await sequelize.query(evseQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        if (evseResult.length === 0) {
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
        const actualLocationId = evseResult[0].location_id;

        // Verificar si el EVSE ya existe en la tabla evses
        const existingEvseQuery = `
            SELECT id FROM evses 
            WHERE id = '${evse_uid}' AND deleted_at IS NULL
        `;
        
        const existingEvse = await sequelize.query(existingEvseQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        if (existingEvse.length > 0) {
            // Actualizar EVSE existente
            const updateQuery = `
                UPDATE evses SET
                    status = '${evseData.status}',
                    capabilities = '${JSON.stringify(evseData.capabilities || []).replace(/'/g, "''")}'::jsonb,
                    connectors = '${JSON.stringify(evseData.connectors || []).replace(/'/g, "''")}'::jsonb,
                    physical_reference = ${evseData.physical_reference ? `'${evseData.physical_reference}'` : 'NULL'},
                    last_updated = '${evseData.last_updated || new Date().toISOString()}',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = '${evse_uid}'
            `;

            await sequelize.query(updateQuery, {
                type: sequelize.QueryTypes.UPDATE
            });

            logger.info(`✅ EVSE updated in location`, {
                evse_uid,
                location_id: actualLocationId,
                status: evseData.status
            });
        } else {
            // Crear nuevo EVSE
            const insertQuery = `
                INSERT INTO evses (
                    id, location_id, country_code, party_id, evse_id,
                    status, capabilities, connectors, physical_reference, last_updated,
                    created_at, updated_at
                ) VALUES (
                    '${evse_uid}', '${actualLocationId}', '${country_code}', '${party_id}', 
                    '${evseData.evse_id || ''}', '${evseData.status}', 
                    '${JSON.stringify(evseData.capabilities || []).replace(/'/g, "''")}'::jsonb,
                    '${JSON.stringify(evseData.connectors || []).replace(/'/g, "''")}'::jsonb,
                    ${evseData.physical_reference ? `'${evseData.physical_reference}'` : 'NULL'},
                    '${evseData.last_updated || new Date().toISOString()}',
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            `;

            await sequelize.query(insertQuery, {
                type: sequelize.QueryTypes.INSERT
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
        const { sequelize } = require('../models');
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
        const evseQuery = `
            SELECT id FROM evses 
            WHERE id = '${evse_uid}' AND deleted_at IS NULL
        `;
        
        const evseResult = await sequelize.query(evseQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        if (evseResult.length === 0) {
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

        // Construir la consulta UPDATE dinámicamente
        const updateFields = [];

        if (updateData.status !== undefined) {
            updateFields.push(`status = '${updateData.status}'`);
        }
        if (updateData.capabilities !== undefined) {
            updateFields.push(`capabilities = '${JSON.stringify(updateData.capabilities).replace(/'/g, "''")}'::jsonb`);
        }
        if (updateData.connectors !== undefined) {
            updateFields.push(`connectors = '${JSON.stringify(updateData.connectors).replace(/'/g, "''")}'::jsonb`);
        }
        if (updateData.physical_reference !== undefined) {
            updateFields.push(`physical_reference = ${updateData.physical_reference ? `'${updateData.physical_reference}'` : 'NULL'}`);
        }
        if (updateData.last_updated !== undefined) {
            updateFields.push(`last_updated = '${updateData.last_updated}'`);
        }

        // Siempre actualizar updated_at
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        if (updateFields.length === 1) { // Solo updated_at
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

        const query = `
            UPDATE evses 
            SET ${updateFields.join(', ')}
            WHERE id = '${evse_uid}'
        `;

        await sequelize.query(query, {
            type: sequelize.QueryTypes.UPDATE
        });

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
