const { v4: uuidv4 } = require('uuid');

const { Token } = require('../../models');
const logger = require('../../utils/logger');

/**
 * POST / - Crear nuevo token
 */
async function createToken(req, res) {
  try {
    logger.ocpi('/tokens', 'POST', { body: req.body });

    const tokenData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    const token = await Token.create(tokenData);

    try {
      const emspNotificationService = require('../../services/emspNotificationService');
      await emspNotificationService.notifyTokenCreated(token);
      logger.info(`📤 Notificación POST de token ${token.uid} enviada a operadores conectados`);
    } catch (notificationError) {
      logger.error('❌ Error notificando token a operadores:', notificationError);
    }

    res.status(201).json({
      status_code: 1000,
      data: token,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating token:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    createToken
};

