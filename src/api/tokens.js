const express = require('express');

const router = express.Router();
const { validateTokenPutMiddleware, validateTokenPatchMiddleware } = require('../validators/tokenValidators');

const { deleteTokenById } = require('./tokens/deleteRoutes');
const { getTokens, getTokenById } = require('./tokens/getRoutes');
const { patchOcpiToken } = require('./tokens/patchRoutes');
const { createToken } = require('./tokens/postRoutes');
const { putOcpiToken, putTokenById } = require('./tokens/putRoutes');

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
router.get('/', getTokens);

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
router.get('/:id', getTokenById);

/**
 * @swagger
 * /ocpi/2.2/tokens:
 *   post:
 *     summary: Create new OCPI token
 *     tags: [Tokens]
 */
router.post('/', createToken);

/**
 * @swagger
 * /ocpi/2.2/tokens/{country_code}/{party_id}/{uid}:
 *   put:
 *     summary: Create or update OCPI token by country_code, party_id and uid
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: country_code
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: party_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:country_code/:party_id/:uid', validateTokenPutMiddleware, putOcpiToken);

/**
 * @swagger
 * /ocpi/2.2/tokens/{country_code}/{party_id}/{uid}:
 *   patch:
 *     summary: Partially update OCPI token by country_code, party_id and uid
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: country_code
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: party_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 */
router.patch('/:country_code/:party_id/:uid', validateTokenPatchMiddleware, patchOcpiToken);

/**
 * @swagger
 * /ocpi/2.2/tokens/{id}:
 *   put:
 *     summary: Update OCPI token by ID
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', putTokenById);

/**
 * @swagger
 * /ocpi/2.2/tokens/{id}:
 *   delete:
 *     summary: Delete OCPI token by ID
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', deleteTokenById);

module.exports = router;
