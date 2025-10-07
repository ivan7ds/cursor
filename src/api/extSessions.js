const express = require('express');
const router = express.Router();
const { sequelize } = require('../database/connection');
const { authMiddleware } = require('../middleware/auth');
const EmspSession = require('../models/EmspSession')(sequelize);

// GET /api/ext-sessions - Obtener sesiones externas
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('📊 Obteniendo sesiones externas...');
        
        const sessions = await EmspSession.findAll({
            order: [['created_at', 'DESC']]
        });
        
        console.log(`✅ ${sessions.length} sesiones externas encontradas`);
        
        res.status(200).json({
            status_code: 1000,
            data: sessions,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo sesiones externas:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting external sessions',
            timestamp: new Date().toISOString()
        });
    }
});

// PATCH /api/ext-sessions/:sessionId - Actualizar sesión externa
router.patch('/:sessionId', authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const updateData = req.body;
        
        console.log('📝 Actualizando sesión externa:', { sessionId, updateData });
        
        // Buscar la sesión por session_id
        const session = await EmspSession.findOne({
            where: { session_id: sessionId }
        });
        
        if (!session) {
            return res.status(404).json({
                status_code: 2001,
                status_message: 'Session not found',
                timestamp: new Date().toISOString()
            });
        }
        
        // Actualizar la sesión
        await session.update(updateData);
        
        console.log('✅ Sesión externa actualizada exitosamente');
        
        res.status(200).json({
            status_code: 1000,
            status_message: 'Session updated successfully',
            data: session,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error actualizando sesión externa:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error updating external session',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
