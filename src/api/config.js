const express = require('express');

const router = express.Router();
const logger = require('../utils/logger');

// GET /api/config/ocpi-base-url
router.get('/ocpi-base-url', (_req, res) => {
    try {
        const ocpiBaseUrl = process.env.OCPI_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        logger.info(`🌐 Serving OCPI_BASE_URL: ${ocpiBaseUrl}`);
        res.status(200).json({ ocpiBaseUrl });
    } catch (error) {
        logger.error(`❌ Error getting OCPI_BASE_URL: ${error.message}`);
        res.status(500).json({ status_code: 2000, status_message: error.message });
    }
});

// GET /api/config/ocpi-settings
router.get('/ocpi-settings', (_req, res) => {
    try {
        const settings = {
            partyId: process.env.OCPI_PARTY_ID || 'IPD',
            countryCode: process.env.OCPI_COUNTRY_CODE || 'ES',
            version: process.env.OCPI_VERSION || '2.2',
            baseUrl: process.env.OCPI_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
        };
        logger.info(`🌐 Serving OCPI settings:`, settings);
        res.status(200).json({ data: settings });
    } catch (error) {
        logger.error(`❌ Error getting OCPI settings: ${error.message}`);
        res.status(500).json({ status_code: 2000, status_message: error.message });
    }
});

module.exports = router;