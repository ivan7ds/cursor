const logger = require('../../utils/logger');

const { mapTokenToOCPI, findToken } = require('./helpers');

/**
 * PATCH /:country_code/:party_id/:uid - Actualizar parcialmente token OCPI
 */
async function patchOcpiToken(req, res) {
  try {
    const { country_code, party_id, uid } = req.params;
    const patchData = req.validatedTokenPatch;

    logger.ocpi('/tokens', 'PATCH', {
      country_code,
      party_id,
      uid,
      body: patchData
    });

    const token = await findToken(country_code, party_id, uid);

    if (!token) {
      return res.status(404).json({
        status_code: 2003,
        status_message: `Token not found: ${country_code}/${party_id}/${uid}`,
        timestamp: new Date().toISOString()
      });
    }

    const updateData = { ...patchData };
    updateData.last_updated = new Date();

    await token.update(updateData);

    logger.info(`EMSP Token ${uid} parcialmente actualizado para ${party_id}_${country_code}`);

    const mappedToken = mapTokenToOCPI(token);

    res.status(200).json({
      status_code: 1000,
      data: mappedToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error patching token:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    patchOcpiToken
};

