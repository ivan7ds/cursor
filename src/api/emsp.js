const express = require('express');
const router = express.Router();
const { sequelize } = require('../database/connection');
const { authMiddleware } = require('../middleware/auth');

// ===== ENDPOINTS EMSP =====
// Estos endpoints permiten consultar la información almacenada de eMSPs
// cuando actuamos como CPO

// GET /ocpi/emsp/2.2/locations - Obtener locations de eMSPs
router.get('/locations', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/locations - Consultando locations de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_locations 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} locations de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando locations de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP locations',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/evses - Obtener EVSEs de eMSPs
router.get('/evses', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/evses - Consultando EVSEs de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_evses 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} EVSEs de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando EVSEs de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP EVSEs',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/tariffs - Obtener tariffs de eMSPs
router.get('/tariffs', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/tariffs - Consultando tariffs de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_tariffs 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} tariffs de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando tariffs de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP tariffs',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/sessions - Obtener sesiones de eMSPs
router.get('/sessions', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/sessions - Consultando sesiones de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_sessions 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} sesiones de eMSPs encontradas`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando sesiones de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP sessions',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/cdrs - Obtener CDRs de eMSPs
router.get('/cdrs', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/cdrs - Consultando CDRs de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_cdrs 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} CDRs de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando CDRs de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP CDRs',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/tokens - Obtener tokens de eMSPs
router.get('/tokens', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/tokens - Consultando tokens de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_tokens 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} tokens de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando tokens de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP tokens',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /ocpi/emsp/2.2/contracts - Obtener contratos de eMSPs
router.get('/contracts', authMiddleware, async (req, res) => {
    try {
        console.log('📍 GET /ocpi/emsp/2.2/contracts - Consultando contratos de eMSPs');
        
        const [results] = await sequelize.query(`
            SELECT * FROM emsp_contracts 
            ORDER BY last_updated DESC
        `);
        
        console.log(`✅ ${results.length} contratos de eMSPs encontrados`);
        
        res.status(200).json({
            status_code: 1000,
            data: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error consultando contratos de eMSPs:', error);
        res.status(500).json({
            status_code: 2000,
            status_message: 'Error getting EMSP contracts',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
