const logger = require('../../utils/logger');

const { findEVSEById, updateEVSE } = require('./evseHelpers');
const {
  validateEVSEExists,
  prepareUpdateData,
  processConnectorChangesAndNotify,
  buildUpdateSuccessResponse
} = require('./putRouteHelpers');

/**
 * PUT /:id - Actualizar EVSE
 */
async function putEVSEById(req, res) {
  try {
    logger.ocpi('/evses', 'PUT', { id: req.params.id, body: req.body });

    const { id } = req.params;
    const evse = await findEVSEById(id);

    const validation = await validateEVSEExists(evse);
    if (!validation.valid) {
      return res.status(validation.status).json(validation.response);
    }

    const previousConnectors = evse.connectors || [];
    const updateData = prepareUpdateData(req.body);

    await updateEVSE(evse, updateData);
    await evse.reload();

    await processConnectorChangesAndNotify(evse, previousConnectors);

    res.status(200).json(buildUpdateSuccessResponse(evse));
  } catch (error) {
    logger.error('Error updating EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    putEVSEById
};

