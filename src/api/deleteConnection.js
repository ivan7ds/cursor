const express = require('express');

const router = express.Router();
const { Credentials } = require('../models');
const logger = require('../utils/logger');

/**
 * Busca una conexión por partyId y countryCode
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Country code
 * @returns {Promise<Object|null>} - Conexión encontrada o null
 */
async function findConnection(partyId, countryCode) {
  return Credentials.findOne({
    where: {
      party_id: partyId,
      country_code: countryCode
    }
  });
}

/**
 * Maneja errores al eliminar conexión
 * @param {Error} error - Error ocurrido
 * @param {Object} res - Response object
 */
function handleDeleteError(error, res) {
  logger.error('❌ Error eliminando conexión:', error);
  res.status(500).json({
    status_code: 2000,
    status_message: 'Error deleting connection',
    timestamp: new Date().toISOString()
  });
}

// DELETE /api/delete-connection/:partyId/:countryCode - Eliminar una conexión
router.delete('/delete-connection/:partyId/:countryCode', async (req, res) => {
    try {
        const { partyId, countryCode } = req.params;
        
        logger.info(`🗑️ Eliminando conexión: ${partyId} (${countryCode})`);
        
        const connection = await findConnection(partyId, countryCode);
        
        if (!connection) {
            return res.status(404).json({
                status_code: 2001,
                status_message: 'Connection not found',
                timestamp: new Date().toISOString()
            });
        }
        
        await connection.destroy();
        logger.info(`✅ Conexión eliminada: ${partyId} (${countryCode})`);
        
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
        handleDeleteError(error, res);
    }
});

module.exports = router;
