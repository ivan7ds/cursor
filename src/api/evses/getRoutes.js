const { EVSE, Location } = require('../../models');
const logger = require('../../utils/logger');

/**
 * GET / - Listar EVSEs con filtros opcionales
 */
async function getEVSEs(req, res) {
  try {
    logger.ocpi('/evses', 'GET', { query: req.query });

    const { country_code, party_id, location_id, status, offset = 0, limit = 100 } = req.query;

    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (location_id) where.location_id = location_id;
    if (status) where.status = status;
    where.deleted_at = null;

    const evses = await EVSE.findAndCountAll({
      where,
      include: [{
        model: Location,
        as: 'location',
        attributes: ['id', 'name', 'address', 'city', 'coordinates']
      }],
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['last_updated', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: evses.rows,
      timestamp: new Date().toISOString(),
      pagination: {
        total: evses.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting EVSEs:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * GET /:id - Obtener EVSE por ID
 */
async function getEVSEById(req, res) {
  try {
    logger.ocpi('/evses', 'GET_BY_ID', { id: req.params.id });

    const { id } = req.params;
    const evse = await EVSE.findByPk(id, {
      include: [{
        model: Location,
        as: 'location',
        attributes: ['id', 'name', 'address', 'city', 'coordinates']
      }]
    });

    if (!evse || evse.deleted_at) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: evse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting EVSE by ID:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    getEVSEs,
    getEVSEById
};

