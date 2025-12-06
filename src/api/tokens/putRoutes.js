const { Token, EmspToken } = require('../../models');
const logger = require('../../utils/logger');

const { mapTokenToOCPI, findToken, prepareTokenUpdateData, prepareTokenCreateData } = require('./helpers');

/**
 * PUT /:country_code/:party_id/:uid - Crear o actualizar token OCPI
 */
async function putOcpiToken(req, res) {
  try {
    const { country_code, party_id, uid } = req.params;
    const tokenData = req.validatedToken;

    logger.ocpi('/tokens', 'PUT', {
      country_code,
      party_id,
      uid,
      body: tokenData
    });

    let token = await findToken(country_code, party_id, uid);

    if (token) {
      const updateData = prepareTokenUpdateData(tokenData, country_code, party_id, uid);
      await token.update(updateData);
      logger.info(`EMSP Token ${uid} actualizado para ${party_id}_${country_code}`);
    } else {
      const createData = prepareTokenCreateData(tokenData, country_code, party_id, uid);
      token = await EmspToken.create(createData);
      logger.info(`Nuevo EMSP Token ${uid} creado para ${party_id}_${country_code} con ID ${createData.id}`);
    }

    const mappedToken = mapTokenToOCPI(token);

    res.status(200).json({
      status_code: 1000,
      data: mappedToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating/updating token:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * PUT /:id - Actualizar token por ID
 */
async function putTokenById(req, res) {
  try {
    logger.ocpi('/tokens', 'PUT_BY_ID', { id: req.params.id, body: req.body });

    const { id } = req.params;
    const token = await Token.findByPk(id);

    if (!token) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Token not found',
        timestamp: new Date().toISOString()
      });
    }

    const updateData = {
      ...req.body,
      last_updated: new Date()
    };

    await token.update(updateData);

    logger.info(`Token ${id} actualizado`);

    const mappedToken = mapTokenToOCPI(token);

    res.status(200).json({
      status_code: 1000,
      data: mappedToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating token:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
    putOcpiToken,
    putTokenById
};

