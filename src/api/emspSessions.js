const express = require('express');

const router = express.Router();
const logger = require('../utils/logger');
const {
  validateSessionPutMiddleware,
  validateSessionPatchMiddleware
} = require('../validators/sessionValidators');

const {
  sendChargingLogs,
  buildPatchUpdateFields,
  upsertSession,
  updateSession
} = require('./emspSessions/sessionHelpers');

// PUT /ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}
// Crear o actualizar una sesión completa
router.put('/:country_code/:party_id/:session_id', validateSessionPutMiddleware, async (req, res) => {
    try {
        const { country_code, party_id, session_id } = req.params;
        const sessionData = req.body;

        logger.info(`📥 PUT Session received`, {
            country_code,
            party_id,
            session_id,
            status: sessionData.status,
            kwh: sessionData.kwh,
            timestamp: new Date().toISOString()
        });

        await sendChargingLogs(session_id, sessionData, 'PUT');

        const { EmspSession } = require('../models');
        
        const existingSession = await EmspSession.findOne({
            where: {
                emsp_party_id: party_id,
                emsp_country_code: country_code,
                session_id
            }
        });

        const result = await upsertSession(party_id, country_code, session_id, sessionData, existingSession);
        
        if (result === null) {
            logger.warn('⚠️ Ignoring stale PUT session payload (would downgrade status)', {
                session_id,
                current_status: existingSession.status,
                incoming_status: sessionData.status
            });

            return res.status(200).json({
                status_code: 1000,
                status_message: 'Stale session snapshot ignored',
                timestamp: new Date().toISOString()
            });
        }

        logger.info(`✅ Session upserted`, {
            session_id,
            status: sessionData.status,
            kwh: sessionData.kwh
        });

        res.status(200).json({
            status_code: 1000,
            status_message: 'Success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('❌ Error processing PUT session:', error);
        logger.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            status_code: 2000,
            status_message: `Internal server error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

// PATCH /ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}
// Actualizar parcialmente una sesión
router.patch('/:country_code/:party_id/:session_id', validateSessionPatchMiddleware, async (req, res) => {
    try {
        const { country_code, party_id, session_id } = req.params;
        const updateData = req.body;

        logger.info(`📥 PATCH Session received`, {
            country_code,
            party_id,
            session_id,
            updateFields: Object.keys(updateData),
            timestamp: new Date().toISOString()
        });

        await sendChargingLogs(session_id, updateData, 'PATCH');

        const updateFields = buildPatchUpdateFields(updateData);

        if (Object.keys(updateFields).length === 0) {
            logger.warn(`⚠️ No fields to update for PATCH`, {
                country_code,
                party_id,
                session_id
            });
            return res.status(400).json({
                status_code: 2001,
                status_message: 'No fields to update',
                timestamp: new Date().toISOString()
            });
        }

        const affectedRows = await updateSession(party_id, country_code, session_id, updateFields);

        if (affectedRows === 0) {
            logger.warn(`⚠️ Session not found for PATCH`, {
                country_code,
                party_id,
                session_id
            });
            return res.status(404).json({
                status_code: 2001,
                status_message: 'Session not found',
                timestamp: new Date().toISOString()
            });
        }

        logger.info(`✅ Session patched`, {
            session_id,
            updatedFields: Object.keys(updateData),
            status: updateData.status
        });

        res.status(200).json({
            status_code: 1000,
            status_message: 'Success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('❌ Error processing PATCH session:', error);
        logger.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            status_code: 2000,
            status_message: `Internal server error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}
// Obtener una sesión específica
router.get('/:country_code/:party_id/:session_id', async (req, res) => {
    try {
        const { EmspSession } = require('../models');
        const { country_code, party_id, session_id } = req.params;

        const session = await EmspSession.findOne({
            where: {
                country_code,
                party_id,
                session_id
            }
        });

        if (!session) {
            return res.status(404).json({
                status_code: 2001,
                status_message: 'Session not found',
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json({
            status_code: 1000,
            data: session,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('❌ Error getting session:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/sessions
// Obtener todas las sesiones (con paginación)
router.get('/', async (req, res) => {
    try {
        const { EmspSession } = require('../models');
        const { limit = 100, offset = 0, status } = req.query;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const sessions = await EmspSession.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            status_code: 1000,
            data: sessions.rows,
            timestamp: new Date().toISOString(),
            pagination: {
                total: sessions.count,
                offset: parseInt(offset),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        logger.error('❌ Error getting sessions:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
