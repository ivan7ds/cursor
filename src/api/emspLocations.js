const express = require('express');

const router = express.Router();
const logger = require('../utils/logger');
const {
  validateLocationPutMiddleware,
  validateLocationPatchMiddleware
} = require('../validators/locationValidators');

const {
  buildEVSEPatchErrorResponse
} = require('./emspLocations/evsePatchHelpers');
const { processEVSEPatchRequest } = require('./emspLocations/evsePatchRouteHelpers');
const { 
    updateLocation, 
    createLocation, 
    processEVSEs, 
    locationExists,
    buildPatchUpdateFields,
    ensureLocationExists,
    upsertEVSE
} = require('./emspLocations/locationHelpers');
const {
  validateLocationExists,
  buildLocationNotFoundResponse,
  validatePatchFields,
  executeLocationUpdate,
  buildLocationPatchSuccessResponse,
  buildLocationPatchErrorResponse
} = require('./emspLocations/locationPatchHelpers');

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

        const exists = await locationExists(sequelize, location_id);
        
        if (exists) {
            await updateLocation({ sequelize, location_id, locationData, party_id, country_code });
        } else {
            await createLocation({ sequelize, location_id, locationData, party_id, country_code });
        }

        // Procesar EVSEs si están presentes (puede ser undefined o null)
        if (locationData.evses) {
            await processEVSEs(locationData.evses, party_id, country_code, location_id);
        } else {
            logger.info(`ℹ️ No EVSEs to process for location ${location_id}`);
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

        const exists = await validateLocationExists(sequelize, location_id, country_code, party_id);
        if (!exists) {
            const notFoundResponse = buildLocationNotFoundResponse();
            return res.status(notFoundResponse.status).json(notFoundResponse.json);
        }

        const { updateFields, replacements } = buildPatchUpdateFields(updateData);
        const validationError = validatePatchFields({ updateFields, countryCode: country_code, partyId: party_id, locationId: location_id });
        
        if (validationError) {
            return res.status(validationError.status).json(validationError.json);
        }

        await executeLocationUpdate(sequelize, updateFields, replacements, location_id);

        logger.info(`✅ Location patched: ${location_id}`, {
            updatedFields: Object.keys(updateData)
        });

        res.status(200).json(buildLocationPatchSuccessResponse(location_id));

    } catch (error) {
        const errorResponse = buildLocationPatchErrorResponse(error, req.params, req.body);
        res.status(errorResponse.status).json(errorResponse.json);
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

        const { sequelize } = require('../database/connection');
        
        await ensureLocationExists(sequelize, location_id, party_id, country_code, evse_uid);
        await upsertEVSE(evseData, evse_uid, party_id, country_code, location_id);

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
        const result = await processEVSEPatchRequest(req.params, req.body);
        
        if (result.error) {
            return res.status(result.error.status).json(result.error.json);
        }

        res.status(200).json(result.success);

    } catch (error) {
        const errorResponse = buildEVSEPatchErrorResponse(error, req.params, req.body);
        res.status(errorResponse.status).json(errorResponse.json);
    }
});

module.exports = router;
