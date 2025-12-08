const express = require('express');

const router = express.Router();
const { deleteTariffById } = require('./tariffs/deleteRoutes');
const { getTariffs, getTariffById } = require('./tariffs/getRoutes');
const { createTariff } = require('./tariffs/postRoutes');
const { putTariffById } = require('./tariffs/putRoutes');

/**
 * @swagger
 * /ocpi/2.2/tariffs:
 *   get:
 *     summary: Get OCPI tariffs
 *     tags: [Tariffs]
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
 */
router.get('/', getTariffs);

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   get:
 *     summary: Get specific OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', getTariffById);

/**
 * @swagger
 * /ocpi/2.2/tariffs:
 *   post:
 *     summary: Create new OCPI tariff
 *     tags: [Tariffs]
 */
router.post('/', createTariff);

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   put:
 *     summary: Update OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', putTariffById);

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   delete:
 *     summary: Soft delete OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', deleteTariffById);

module.exports = router;
