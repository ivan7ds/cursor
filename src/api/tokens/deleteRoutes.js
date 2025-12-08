const { Token } = require('../../models');
const logger = require('../../utils/logger');

/**
 * DELETE /:id - Eliminar token por ID
 */
async function deleteTokenById(req, res) {
  try {
    logger.ocpi('/tokens', 'DELETE', { id: req.params.id });

    const { id } = req.params;
    const token = await Token.findByPk(id);

    if (!token) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Token not found',
        timestamp: new Date().toISOString()
      });
    }

    await token.destroy();

    logger.info(`Token ${id} eliminado`);

    res.status(200).json({
      status_code: 1000,
      status_message: 'Token deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting token:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    deleteTokenById
};

