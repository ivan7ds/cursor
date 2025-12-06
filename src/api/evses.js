const express = require('express');

const router = express.Router();
const { deleteEVSEById } = require('./evses/deleteRoutes');
const { getEVSEs, getEVSEById } = require('./evses/getRoutes');
const { createEVSE } = require('./evses/postRoutes');
const { putEVSEById } = require('./evses/putRoutes');

/**
 * @swagger
 * /ocpi/2.2/evses:
 *   get:
 *     summary: Get OCPI EVSEs
 *     tags: [EVSEs]
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
 *         name: location_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 */
router.get('/', getEVSEs);

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   get:
 *     summary: Get specific OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', getEVSEById);

/**
 * @swagger
 * /ocpi/2.2/evses:
 *   post:
 *     summary: Create new OCPI EVSE
 *     tags: [EVSEs]
 */
router.post('/', createEVSE);

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   put:
 *     summary: Update OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', putEVSEById);

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   delete:
 *     summary: Delete OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', deleteEVSEById);

module.exports = router;
