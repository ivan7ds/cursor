const { EVSE } = require('../../models');
const emspNotificationService = require('../../services/emspNotificationService');
const logger = require('../../utils/logger');

/**
 * DELETE /:id - Eliminar EVSE (soft delete)
 */
async function deleteEVSEById(req, res) {
  try {
    logger.ocpi('/evses', 'DELETE', { id: req.params.id });

    const { id } = req.params;
    const evse = await EVSE.findByPk(id);

    if (!evse || evse.deleted_at) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      });
    }

    await evse.update({
      deleted_at: new Date(),
      last_updated: new Date()
    });

    try {
      await emspNotificationService.notifyEVSEUpdated(evse);
      logger.info(`📤 Notificación DELETE de EVSE ${evse.id} enviada a operadores conectados`);
    } catch (notificationError) {
      logger.error('❌ Error notificando eliminación de EVSE a operadores:', notificationError);
    }

    res.status(200).json({
      status_code: 1000,
      status_message: 'EVSE deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    deleteEVSEById
};

