const { v4: uuidv4 } = require('uuid');

const { EVSE } = require('../../models');
const emspNotificationService = require('../../services/emspNotificationService');
const logger = require('../../utils/logger');

/**
 * POST / - Crear nuevo EVSE
 */
async function createEVSE(req, res) {
  try {
    logger.ocpi('/evses', 'POST', { body: req.body });

    const evseData = {
      id: uuidv4(),
      ...req.body,
      last_updated: new Date()
    };

    const evse = await EVSE.create(evseData);

    try {
      await emspNotificationService.notifyEVSECreated(evse);
      logger.info(`📤 Notificación POST de EVSE ${evse.id} enviada a operadores conectados`);
    } catch (notificationError) {
      logger.error('❌ Error notificando EVSE a operadores:', notificationError);
    }

    res.status(201).json({
      status_code: 1000,
      data: evse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    createEVSE
};

