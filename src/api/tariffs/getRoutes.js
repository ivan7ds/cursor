const { Tariff } = require('../../models');
const logger = require('../../utils/logger');

const { transformTariffElements } = require('./transformers');

/**
 * GET / - Listar tarifas con filtros opcionales
 */
async function getTariffs(req, res) {
  try {
    logger.ocpi('/tariffs', 'GET', { query: req.query });

    const { country_code, party_id, type, offset = 0, limit = 100 } = req.query;

    const where = {
      deleted_at: null
    };
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (type) where.type = type;

    const tariffs = await Tariff.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['last_updated', 'DESC']]
    });

    const transformedTariffs = tariffs.rows.map(tariff =>
      transformTariffElements(tariff.toJSON())
    );

    res.status(200).json({
      status_code: 1000,
      data: transformedTariffs,
      timestamp: new Date().toISOString(),
      pagination: {
        total: tariffs.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting tariffs:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * GET /:id - Obtener tarifa por ID
 */
async function getTariffById(req, res) {
  try {
    logger.ocpi('/tariffs', 'GET_BY_ID', { id: req.params.id });

    const { id } = req.params;
    const tariff = await Tariff.findByPk(id);

    if (!tariff) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Tariff not found',
        timestamp: new Date().toISOString()
      });
    }

    const transformedTariff = transformTariffElements(tariff.toJSON());

    res.status(200).json({
      status_code: 1000,
      data: transformedTariff,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting tariff by ID:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    getTariffs,
    getTariffById
};

