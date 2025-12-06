const { Token } = require('../../models');
const logger = require('../../utils/logger');

const { mapTokenToOCPI } = require('./helpers');

/**
 * GET / - Listar tokens con filtros opcionales
 */
async function getTokens(req, res) {
  try {
    logger.ocpi('/tokens', 'GET', { query: req.query });

    const { country_code, party_id, type, valid, offset = 0, limit = 100 } = req.query;

    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (type) where.type = type;
    if (valid !== undefined) where.valid = valid === 'true';

    const tokens = await Token.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['last_updated', 'DESC']]
    });

    const mappedTokens = tokens.rows.map(mapTokenToOCPI);

    res.status(200).json({
      status_code: 1000,
      data: mappedTokens,
      timestamp: new Date().toISOString(),
      pagination: {
        total: tokens.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting tokens:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * GET /:id - Obtener token por ID
 */
async function getTokenById(req, res) {
  try {
    logger.ocpi('/tokens', 'GET_BY_ID', { id: req.params.id });

    const { id } = req.params;
    const token = await Token.findByPk(id);

    if (!token) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Token not found',
        timestamp: new Date().toISOString()
      });
    }

    const mappedToken = mapTokenToOCPI(token);

    res.status(200).json({
      status_code: 1000,
      data: mappedToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting token by ID:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    getTokens,
    getTokenById
};

