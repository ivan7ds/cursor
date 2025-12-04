const express = require('express');

const router = express.Router();
const { Credentials } = require('../models');
const logger = require('../utils/logger');

// DELETE /api/delete-connection/:partyId/:countryCode - Eliminar una conexión
router.delete('/delete-connection/:partyId/:countryCode', async (req, res) => {
    try {
        const { partyId, countryCode } = req.params;
        
        console.log(`🗑️ Eliminando conexión: ${partyId} (${countryCode})`);
        
        // Buscar la conexión
        const connection = await Credentials.findOne({
            where: {
                party_id: partyId,
                country_code: countryCode
            }
        });
        
        if (!connection) {
            return res.status(404).json({
                status_code: 2001,
                status_message: 'Connection not found',
                timestamp: new Date().toISOString()
            });
        }
        
        // Eliminar la conexión
        await connection.destroy();
        
        console.log(`✅ Conexión eliminada: ${partyId} (${countryCode})`);
        
        res.status(200).json({
            status_code: 1000,
            status_message: 'Connection deleted successfully',
            data: {
                party_id: partyId,
                country_code: countryCode
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error eliminando conexión:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error deleting connection',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
