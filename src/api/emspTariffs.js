const express = require('express');

const router = express.Router();
const logger = require('../utils/logger');
const {
  validateTariffPutMiddleware,
  validateTariffPatchMiddleware
} = require('../validators/tariffValidators');

const {
  tariffExists,
  updateTariff,
  createTariff
} = require('./emspTariffs/tariffHelpers');
const {
  buildTariffPatchErrorResponse
} = require('./emspTariffs/tariffPatchHelpers');
const {
  processTariffPatchRequest
} = require('./emspTariffs/tariffPatchRouteHelpers');

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

        const exists = await tariffExists(tariff_id);
        
        if (exists) {
            await updateTariff(tariff_id, tariffData, party_id, country_code);
        } else {
            await createTariff(tariff_id, tariffData, party_id, country_code);
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
        const { sequelize } = require('../database/connection');
        const result = await processTariffPatchRequest(req.params, req.validatedTariffPatch, sequelize);
        
        if (result.error) {
            return res.status(result.error.status).json(result.error.json);
        }

        res.status(200).json(result.success);

    } catch (error) {
        const errorResponse = buildTariffPatchErrorResponse(error, req.params, req.body);
        res.status(errorResponse.status).json(errorResponse.json);
    }
});

module.exports = router;
