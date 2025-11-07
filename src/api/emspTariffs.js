const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const {
  validateTariffPutMiddleware,
  validateTariffPatchMiddleware
} = require('../validators/tariffValidators');

// PUT /ocpi/emsp/2.2/tariffs/{country_code}/{party_id}/{tariff_id}
// Crear o actualizar una Tariff completa (OCPI 2.2)
router.put('/:country_code/:party_id/:tariff_id', validateTariffPutMiddleware, async (req, res) => {
    try {
        const { country_code, party_id, tariff_id } = req.params;
        const tariffData = req.validatedTariff;

        logger.info(`📥 PUT Tariff received`, {
            country_code,
            party_id,
            tariff_id,
            timestamp: new Date().toISOString()
        });

        const { sequelize } = require('../database/connection');

        // Verificar si la tarifa ya existe en emsp_tariffs
        const [existingTariff] = await sequelize.query(`
            SELECT id FROM emsp_tariffs WHERE id = ?
        `, {
            replacements: [tariff_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (existingTariff) {
            // Actualizar tarifa existente
            await sequelize.query(`
                UPDATE emsp_tariffs SET
                    emsp_party_id = ?,
                    emsp_country_code = ?,
                    currency = ?,
                    type = ?,
                    tariff_alt_text = ?,
                    tariff_alt_url = ?,
                    min_price = ?,
                    max_price = ?,
                    elements = ?,
                    start_date_time = ?,
                    end_date_time = ?,
                    energy_mix = ?,
                    last_updated = ?
                WHERE id = ?
            `, {
                replacements: [
                    party_id,
                    country_code,
                    tariffData.currency,
                    tariffData.type || null,
                    JSON.stringify(tariffData.tariff_alt_text || []),
                    tariffData.tariff_alt_url || null,
                    JSON.stringify(tariffData.min_price || null),
                    JSON.stringify(tariffData.max_price || null),
                    JSON.stringify(tariffData.elements),
                    tariffData.start_date_time || null,
                    tariffData.end_date_time || null,
                    JSON.stringify(tariffData.energy_mix || null),
                    tariffData.last_updated,
                    tariff_id
                ]
            });

            logger.info(`✅ Tariff updated in emsp_tariffs: ${tariff_id}`);
        } else {
            // Crear nueva tarifa
            await sequelize.query(`
                INSERT INTO emsp_tariffs (
                    id, emsp_party_id, emsp_country_code, currency, type,
                    tariff_alt_text, tariff_alt_url, min_price, max_price,
                    elements, start_date_time, end_date_time, energy_mix, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, {
                replacements: [
                    tariff_id,
                    party_id,
                    country_code,
                    tariffData.currency,
                    tariffData.type || null,
                    JSON.stringify(tariffData.tariff_alt_text || []),
                    tariffData.tariff_alt_url || null,
                    JSON.stringify(tariffData.min_price || null),
                    JSON.stringify(tariffData.max_price || null),
                    JSON.stringify(tariffData.elements),
                    tariffData.start_date_time || null,
                    tariffData.end_date_time || null,
                    JSON.stringify(tariffData.energy_mix || null),
                    tariffData.last_updated
                ]
            });

            logger.info(`✅ Tariff created in emsp_tariffs: ${tariff_id}`);
        }

        res.status(200).json({
            status_code: 1000,
            status_message: 'Success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`❌ Error processing Tariff PUT: ${error.message}`, {
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

// PATCH /ocpi/emsp/2.2/tariffs/{country_code}/{party_id}/{tariff_id}
// Actualizar parcialmente una Tariff (OCPI 2.2)
router.patch('/:country_code/:party_id/:tariff_id', validateTariffPatchMiddleware, async (req, res) => {
    try {
        const { country_code, party_id, tariff_id } = req.params;
        const updateData = req.validatedTariffPatch;

        logger.info(`📥 PATCH Tariff received`, {
            country_code,
            party_id,
            tariff_id,
            updateFields: Object.keys(updateData),
            timestamp: new Date().toISOString()
        });

        const { sequelize } = require('../database/connection');

        // Verificar que la tarifa existe
        const [existingTariff] = await sequelize.query(`
            SELECT id FROM emsp_tariffs WHERE id = ?
        `, {
            replacements: [tariff_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (!existingTariff) {
            logger.warn(`⚠️ Tariff not found: ${tariff_id}`, {
                country_code,
                party_id,
                tariff_id
            });
            return res.status(404).json({
                status_code: 2001,
                status_message: 'Tariff not found',
                timestamp: new Date().toISOString()
            });
        }

        // Construir actualización dinámica
        const updateFields = [];
        const replacements = [];

        const fieldMap = {
            currency: 'currency',
            type: 'type',
            tariff_alt_text: 'tariff_alt_text',
            tariff_alt_url: 'tariff_alt_url',
            min_price: 'min_price',
            max_price: 'max_price',
            elements: 'elements',
            start_date_time: 'start_date_time',
            end_date_time: 'end_date_time',
            energy_mix: 'energy_mix',
            last_updated: 'last_updated'
        };

        for (const [key, dbField] of Object.entries(fieldMap)) {
            if (updateData[key] !== undefined) {
                updateFields.push(`${dbField} = ?`);
                // JSON fields
                if (['tariff_alt_text', 'min_price', 'max_price', 'elements', 'energy_mix'].includes(key)) {
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
                tariff_id
            });
            return res.status(400).json({
                status_code: 2001,
                status_message: 'No fields to update',
                timestamp: new Date().toISOString()
            });
        }

        replacements.push(tariff_id);

        await sequelize.query(`
            UPDATE emsp_tariffs SET ${updateFields.join(', ')} WHERE id = ?
        `, { replacements });

        logger.info(`✅ Tariff patched: ${tariff_id}`, {
            updatedFields: Object.keys(updateData)
        });

        res.status(200).json({
            status_code: 1000,
            status_message: 'Success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`❌ Error patching Tariff: ${error.message}`, {
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
