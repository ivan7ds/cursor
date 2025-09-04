const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// PUT /ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}
// Crear o actualizar una sesión completa
router.put('/:country_code/:party_id/:session_id', async (req, res) => {
    try {
        const { sequelize } = require('../models');
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

        // Usar SQL directo para insertar/actualizar
        const query = `
            INSERT INTO emsp_sessions (
                id, emsp_party_id, emsp_country_code, session_id, evse_uid, 
                connector_id, id_token, start_datetime, end_datetime, 
                total_cost, status, last_updated, country_code, party_id, 
                start_date_time, kwh, cdr_token, auth_method, location_id, 
                currency, charging_periods
            ) VALUES (
                gen_random_uuid(), '${party_id}', '${country_code}', '${session_id}', '${sessionData.evse_uid || ''}', 
                '${sessionData.connector_id || ''}', '${sessionData.cdr_token?.uid || ''}', '${sessionData.start_date_time}', ${sessionData.end_date_time ? `'${sessionData.end_date_time}'` : 'NULL'}, 
                ${sessionData.total_cost ? (typeof sessionData.total_cost === 'object' ? sessionData.total_cost.excl_vat || 0 : sessionData.total_cost) : 0}, 
                '${sessionData.status}', '${sessionData.last_updated || new Date().toISOString()}', 
                '${country_code}', '${party_id}', '${sessionData.start_date_time}', 
                ${sessionData.kwh || 0.0}, 
                ${sessionData.cdr_token ? `'${JSON.stringify(sessionData.cdr_token).replace(/'/g, "''")}'::jsonb` : 'NULL'},
                ${sessionData.auth_method ? `'${sessionData.auth_method}'` : 'NULL'},
                ${sessionData.location_id ? `'${sessionData.location_id}'` : 'NULL'},
                '${sessionData.currency || 'EUR'}',
                ${sessionData.charging_periods ? `'${JSON.stringify(sessionData.charging_periods).replace(/'/g, "''")}'::jsonb` : 'NULL'}
            )
            ON CONFLICT (country_code, party_id, session_id) 
            DO UPDATE SET
                start_date_time = EXCLUDED.start_date_time,
                kwh = EXCLUDED.kwh,
                status = EXCLUDED.status,
                last_updated = EXCLUDED.last_updated,
                cdr_token = EXCLUDED.cdr_token,
                auth_method = EXCLUDED.auth_method,
                location_id = EXCLUDED.location_id,
                evse_uid = EXCLUDED.evse_uid,
                connector_id = EXCLUDED.connector_id,
                currency = EXCLUDED.currency,
                total_cost = EXCLUDED.total_cost,
                charging_periods = EXCLUDED.charging_periods,
                updated_at = CURRENT_TIMESTAMP
        `;

        await sequelize.query(query, {
            type: sequelize.QueryTypes.INSERT
        });

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
        const { sequelize } = require('../models');
        const { country_code, party_id, session_id } = req.params;
        const updateData = req.body;

        logger.info(`📥 PATCH Session received`, {
            country_code,
            party_id,
            session_id,
            updateFields: Object.keys(updateData),
            timestamp: new Date().toISOString()
        });

        // Construir la consulta UPDATE dinámicamente con valores directos
        const updateFields = [];

        if (updateData.start_date_time !== undefined) {
            updateFields.push(`start_date_time = '${updateData.start_date_time}'`);
        }
        if (updateData.end_date_time !== undefined) {
            updateFields.push(`end_date_time = '${updateData.end_date_time}'`);
        }
        if (updateData.kwh !== undefined) {
            updateFields.push(`kwh = ${updateData.kwh}`);
        }
        if (updateData.total_cost !== undefined) {
            // Manejar total_cost como objeto o número
            const totalCostValue = typeof updateData.total_cost === 'object' 
                ? (updateData.total_cost.excl_vat || 0) 
                : updateData.total_cost;
            updateFields.push(`total_cost = ${totalCostValue}`);
        }
        if (updateData.charging_periods !== undefined) {
            updateFields.push(`charging_periods = '${JSON.stringify(updateData.charging_periods).replace(/'/g, "''")}'::jsonb`);
        }
        if (updateData.status !== undefined) {
            updateFields.push(`status = '${updateData.status}'`);
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
                session_id
            });
            return res.status(400).json({
                status_code: 2001,
                status_message: 'No fields to update',
                timestamp: new Date().toISOString()
            });
        }

        const query = `
            UPDATE emsp_sessions 
            SET ${updateFields.join(', ')}
            WHERE country_code = '${country_code}' 
            AND party_id = '${party_id}' 
            AND session_id = '${session_id}'
        `;

        const result = await sequelize.query(query, {
            type: sequelize.QueryTypes.UPDATE
        });

        if (result[1] === 0) {
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
