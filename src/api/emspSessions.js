const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const STATUS_PRIORITY = {
    PENDING: 1,
    PLANNED: 1,
    ACTIVE: 2,
    ON_HOLD: 2,
    SUSPENDED: 2,
    COMPLETED: 3,
    FINISHED: 3,
    CANCELED: 3,
    CANCELLED: 3,
    FORCED: 4
};

function getStatusPriority(status) {
    if (!status || typeof status !== 'string') {
        return 0;
    }
    return STATUS_PRIORITY[status.toUpperCase()] || 0;
}

// PUT /ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}
// Crear o actualizar una sesión completa
router.put('/:country_code/:party_id/:session_id', async (req, res) => {
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

        // Enviar log a la consola de recarga
        try {
            const axios = require('axios');
            await axios.post('http://localhost:3000/api/charging-logs', {
                message: `📥 Notificación PUT recibida del CPO`,
                type: 'response',
                sessionId: session_id
            });
            
            await axios.post('http://localhost:3000/api/charging-logs', {
                message: `   📝 Session ID: ${session_id}`,
                type: 'session',
                sessionId: session_id
            });
            
            await axios.post('http://localhost:3000/api/charging-logs', {
                message: `   📊 Estado: ${sessionData.status}`,
                type: 'info',
                sessionId: session_id
            });
            
            await axios.post('http://localhost:3000/api/charging-logs', {
                message: `   ⚡ Energía: ${sessionData.kwh || 0} kWh`,
                type: 'info',
                sessionId: session_id
            });
            
            await axios.post('http://localhost:3000/api/charging-logs', {
                message: `   🔌 EVSE: ${sessionData.evse_uid}`,
                type: 'evse',
                sessionId: session_id
            });
        } catch (logError) {
            logger.warn('⚠️ Could not send log to charging console:', logError.message);
        }

        // Usar Sequelize para insertar/actualizar de forma segura
        const { EmspSession } = require('../models');
        
        const existingSession = await EmspSession.findOne({
            where: {
                emsp_party_id: party_id,
                emsp_country_code: country_code,
                session_id: session_id
            }
        });

        const incomingStatus = sessionData.status ?? existingSession?.status;
        const incomingPriority = getStatusPriority(sessionData.status);
        const currentPriority = getStatusPriority(existingSession?.status);

        if (existingSession && sessionData.status && incomingPriority < currentPriority) {
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

        let resolvedTotalCost = existingSession?.total_cost ?? 0;
        if (sessionData.total_cost !== undefined) {
            if (typeof sessionData.total_cost === 'object') {
                resolvedTotalCost = sessionData.total_cost.excl_vat || resolvedTotalCost;
            } else {
                resolvedTotalCost = sessionData.total_cost;
            }
        }

        const payload = {
            emsp_party_id: party_id,
            emsp_country_code: country_code,
            session_id: session_id,
            evse_uid: sessionData.evse_uid || existingSession?.evse_uid || '',
            connector_id: sessionData.connector_id ?? existingSession?.connector_id ?? '',
            id_token: sessionData.cdr_token?.uid || existingSession?.id_token || '',
            start_datetime: sessionData.start_date_time || existingSession?.start_datetime,
            end_datetime: sessionData.end_date_time ?? existingSession?.end_datetime,
            total_cost: resolvedTotalCost,
            status: incomingStatus || 'ACTIVE',
            last_updated: sessionData.last_updated || existingSession?.last_updated || new Date().toISOString(),
            kwh: sessionData.kwh ?? existingSession?.kwh ?? 0.0
        };

        if (existingSession) {
            await existingSession.update(payload);
        } else {
            await EmspSession.create(payload);
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
router.patch('/:country_code/:party_id/:session_id', async (req, res) => {
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

        // Enviar log a la consola de recarga
        try {
            const axios = require('axios');
            await axios.post('http://localhost:3000/api/charging-logs', {
                message: `📥 Notificación PATCH recibida del CPO`,
                type: 'response',
                sessionId: session_id
            });
            
            await axios.post('http://localhost:3000/api/charging-logs', {
                message: `   📝 Session ID: ${session_id}`,
                type: 'session',
                sessionId: session_id
            });
            
            await axios.post('http://localhost:3000/api/charging-logs', {
                message: `   🔄 Campos actualizados: ${Object.keys(updateData).join(', ')}`,
                type: 'debug',
                sessionId: session_id
            });
            
            // Mostrar detalles específicos de la actualización
            if (updateData.kwh !== undefined) {
                await axios.post('http://localhost:3000/api/charging-logs', {
                    message: `   ⚡ Energía: ${updateData.kwh} kWh`,
                    type: 'info',
                    sessionId: session_id
                });
            }
            if (updateData.total_cost !== undefined) {
                const cost = typeof updateData.total_cost === 'object' ? updateData.total_cost.excl_vat : updateData.total_cost;
                await axios.post('http://localhost:3000/api/charging-logs', {
                    message: `   💰 Costo: ${cost} EUR`,
                    type: 'info',
                    sessionId: session_id
                });
            }
            if (updateData.status !== undefined) {
                await axios.post('http://localhost:3000/api/charging-logs', {
                    message: `   📊 Estado: ${updateData.status}`,
                    type: 'info',
                    sessionId: session_id
                });
            }
            if (updateData.charging_periods !== undefined) {
                await axios.post('http://localhost:3000/api/charging-logs', {
                    message: `   ⏱️ Períodos de carga: ${updateData.charging_periods.length} períodos`,
                    type: 'info',
                    sessionId: session_id
                });
            }
        } catch (logError) {
            logger.warn('⚠️ Could not send log to charging console:', logError.message);
        }

        // Construir objeto de actualización de forma segura
        const { EmspSession } = require('../models');
        const updateFields = {};

        if (updateData.start_date_time !== undefined) {
            updateFields.start_datetime = updateData.start_date_time;
        }
        if (updateData.end_date_time !== undefined) {
            updateFields.end_datetime = updateData.end_date_time;
        }
        if (updateData.kwh !== undefined) {
            updateFields.kwh = updateData.kwh;
        }
        if (updateData.total_cost !== undefined) {
            // Manejar total_cost como objeto o número
            let totalCost = 0;
            if (typeof updateData.total_cost === 'object') {
                totalCost = updateData.total_cost.excl_vat || 0;
            } else {
                totalCost = updateData.total_cost;
            }
            updateFields.total_cost = totalCost;
        }
        if (updateData.charging_periods !== undefined) {
            updateFields.charging_periods = JSON.stringify(updateData.charging_periods);
        }
        if (updateData.status !== undefined) {
            updateFields.status = updateData.status;
        }
        if (updateData.last_updated !== undefined) {
            updateFields.last_updated = updateData.last_updated;
        }

        // Verificar si hay campos para actualizar
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

        // Actualizar usando Sequelize de forma segura
        const [affectedRows] = await EmspSession.update(updateFields, {
            where: {
                emsp_country_code: country_code,
                emsp_party_id: party_id,
                session_id: session_id
            }
        });

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
