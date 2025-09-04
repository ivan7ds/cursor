const express = require('express');
const router = express.Router();

// Endpoint para obtener la configuración OCPI
router.get('/ocpi-base-url', (req, res) => {
    try {
        const ocpiBaseUrl = process.env.OCPI_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
        
        res.json({
            status_code: 1000,
            status_message: 'Success',
            data: {
                ocpiBaseUrl: ocpiBaseUrl
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error obteniendo configuración OCPI:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
