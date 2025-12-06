const { Tariff } = require('../../models');
const logger = require('../../utils/logger');

const {
  notifyTariffDeleted,
  disassociateTariffFromEVSEs
} = require('./tariffHelpers');

/**
 * DELETE /:id - Eliminar tarifa (soft delete)
 */
async function deleteTariffById(req, res) {
  try {
    logger.ocpi('/tariffs', 'DELETE', { id: req.params.id });

    const { id } = req.params;
    const tariff = await Tariff.findByPk(id);

    if (!tariff || tariff.deleted_at) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Tariff not found',
        timestamp: new Date().toISOString()
      });
    }

    await disassociateTariffFromEVSEs(tariff.id);

    await tariff.update({
      deleted_at: new Date(),
      last_updated: new Date()
    });

    await notifyTariffDeleted(tariff);

    res.status(200).json({
      status_code: 1000,
      status_message: 'Tariff soft deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    deleteTariffById
};

