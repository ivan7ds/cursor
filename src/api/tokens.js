const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Token } = require('../models');
const logger = require('../utils/logger');

/**
 * Mapea un token de la base de datos al formato OCPI 2.2
 * @param {Object} token - Token de la base de datos
 * @returns {Object} Token mapeado según especificación OCPI 2.2
 */
function mapTokenToOCPI(token) {
  const mappedToken = {
    country_code: token.country_code,
    party_id: token.party_id,
    uid: token.uid,
    type: token.type,
    contract_id: token.contract_id,
    issuer: token.issuer,
    valid: token.valid,
    whitelist: token.whitelist,
    last_updated: token.last_updated.toISOString()
  };

  // Agregar campos opcionales si existen
  if (token.visual_number) {
    mappedToken.visual_number = token.visual_number;
  }
  
  if (token.group_id) {
    mappedToken.group_id = token.group_id;
  }
  
  if (token.language) {
    mappedToken.language = token.language;
  }
  
  if (token.default_profile_type) {
    mappedToken.default_profile_type = token.default_profile_type;
  }
  
  if (token.energy_contract) {
    mappedToken.energy_contract = token.energy_contract;
  }

  return mappedToken;
}

/**
 * @swagger
 * /ocpi/2.2/tokens:
 *   get:
 *     summary: Get OCPI tokens
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: country_code
 *         schema:
 *           type: string
 *       - in: query
 *         name: party_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: valid
 *         schema:
 *           type: boolean
 */
router.get('/', async (req, res) => {
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

    // Mapear tokens según especificación OCPI 2.2
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
});

/**
 * @swagger
 * /ocpi/2.2/tokens/{id}:
 *   get:
 *     summary: Get specific OCPI token
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
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

    // Mapear token según especificación OCPI 2.2
    const mappedToken = mapTokenToOCPI(token);

    res.status(200).json({
      status_code: 1000,
      data: mappedToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting token:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tokens:
 *   post:
 *     summary: Create new OCPI token
 *     tags: [Tokens]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/tokens', 'POST', { body: req.body });
    
    const tokenData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    const token = await Token.create(tokenData);

    res.status(201).json({
      status_code: 1000,
      data: token,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating token:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tokens/{id}:
 *   put:
 *     summary: Update OCPI token
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/tokens', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const token = await Token.findByPk(id);
    
    if (!token) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Token not found',
        timestamp: new Date().toISOString()
      });
    }

    await token.update({
      ...req.body,
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      data: token,
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
});

/**
 * @swagger
 * /ocpi/2.2/tokens/{id}:
 *   delete:
 *     summary: Delete OCPI token
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
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
});

module.exports = router;




