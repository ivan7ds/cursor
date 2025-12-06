const { Tariff } = require('../../models');
const logger = require('../../utils/logger');

/**
 * PUT /:id - Actualizar tarifa
 */
async function putTariffById(req, res) {
  try {
    logger.ocpi('/tariffs', 'PUT', { id: req.params.id, body: req.body });

    const { id } = req.params;
    const tariff = await Tariff.findByPk(id);

    if (!tariff) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Tariff not found',
        timestamp: new Date().toISOString()
      });
    }

    await tariff.update({
      ...req.body,
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      data: tariff,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    putTariffById
};

