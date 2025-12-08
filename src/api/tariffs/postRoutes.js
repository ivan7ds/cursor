const { v4: uuidv4 } = require('uuid');

const { Tariff } = require('../../models');
const logger = require('../../utils/logger');

const {
  notifyTariffCreated,
  associateTariffToEVSEs,
  notifyEVSEUpdated
} = require('./tariffHelpers');

/**
 * POST / - Crear nueva tarifa
 */
async function createTariff(req, res) {
  try {
    logger.ocpi('/tariffs', 'POST', { body: req.body });

    // Obtener country_code y party_id del token de autenticación si no se proporcionan en el body
    // Según OCPI 2.2, estos campos son obligatorios y deben venir del token
    const country_code = req.body.country_code || req.ocpiToken?.country_code || process.env.OCPI_COUNTRY_CODE || 'ES';
    const party_id = req.body.party_id || req.ocpiToken?.party_id || process.env.OCPI_PARTY_ID || 'IPD';

    const tariffData = {
      id: uuidv4(),
      ...req.body,
      country_code,
      party_id,
      last_updated: new Date()
    };

    const tariff = await Tariff.create(tariffData);

    await notifyTariffCreated(tariff);

    let updatedEvsesCount = 0;
    if (req.body.location_id) {
      const updatedEvses = await associateTariffToEVSEs(tariff.id, req.body.location_id);
      updatedEvsesCount = updatedEvses.length;

      // Enviar todas las notificaciones en paralelo
      const notificationPromises = updatedEvses.map(evseId => notifyEVSEUpdated(evseId));
      await Promise.allSettled(notificationPromises);
    }

    res.status(201).json({
      status_code: 1000,
      data: {
        ...tariff.toJSON(),
        // eslint-disable-next-line camelcase -- Campo en snake_case según convención de API
        associated_evses: updatedEvsesCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    createTariff
};

