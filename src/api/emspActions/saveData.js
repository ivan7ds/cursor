const { authMiddleware } = require('../../middleware/auth');
const logger = require('../../utils/logger');

const { processEVSEs, buildSaveEVSEsResponse } = require('./saveData/evseHelpers');
const { processLocation, buildSaveLocationsResponse } = require('./saveData/locationHelpers');
const { processTariffs, buildSaveTariffsResponse } = require('./saveData/tariffHelpers');
const { processTokens, buildSaveTokensResponse } = require('./saveData/tokenHelpers');

/**
 * Módulo para guardar datos de CPOs externos y eMSP
 */

/**
 * POST /save-cpo-locations - Guardar locations de un CPO externo
 */
function setupSaveCpoLocations(router) {
  router.post('/save-cpo-locations', authMiddleware, async (req, res) => {
    try {
      const { cpoUrl, locations } = req.body;

      if (!cpoUrl || !locations || !Array.isArray(locations)) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'Missing required fields: cpoUrl and locations array',
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`🌐 Guardando ${locations.length} locations del CPO: ${cpoUrl}`);

      const errors = [];
      
      // Crear promesas para procesar todas las locations en paralelo
      const locationPromises = locations.map(location => processLocation(location, errors));
      
      // Ejecutar todas las promesas y contar éxitos
      const results = await Promise.allSettled(locationPromises);
      const savedCount = results.filter(result => result.status === 'fulfilled' && result.value).length;

      logger.info(`✅ ${savedCount} locations guardados exitosamente del CPO: ${cpoUrl}`);
      res.status(200).json(buildSaveLocationsResponse(savedCount, locations.length, errors, cpoUrl));
    } catch (error) {
      logger.error('❌ Error guardando locations del CPO:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error saving CPO locations',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * POST /save-cpo-evses - Guardar EVSEs de un CPO externo
 */
function setupSaveCpoEvses(router) {
  router.post('/save-cpo-evses', authMiddleware, async (req, res) => {
    try {
      const { cpoUrl, cpoToken, cpoVersion, evses } = req.body;

      if (!cpoUrl || !evses || !Array.isArray(evses)) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'Missing required fields: cpoUrl and evses array',
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`🌐 Guardando ${evses.length} EVSEs del CPO: ${cpoUrl}`);

      const errors = [];
      const savedCount = await processEVSEs({ evses, cpoUrl, cpoToken, cpoVersion, errors });

      logger.info(`✅ ${savedCount} EVSEs guardados exitosamente del CPO: ${cpoUrl}`);
      res.status(200).json(buildSaveEVSEsResponse(savedCount, evses.length, errors, cpoUrl));
    } catch (error) {
      logger.error('❌ Error guardando EVSEs del CPO:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error saving CPO EVSEs',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * POST /save-emsp-tokens - Guardar tokens de nuestro eMSP
 */
function setupSaveEmspTokens(router) {
  router.post('/save-emsp-tokens', authMiddleware, async (req, res) => {
    try {
      const { tokens } = req.body;

      if (!tokens || !Array.isArray(tokens)) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'Missing required fields: tokens array',
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`🔑 Guardando ${tokens.length} tokens de nuestro eMSP`);

      const errors = [];
      const savedCount = await processTokens(tokens, errors);

      logger.info(`✅ ${savedCount} tokens guardados exitosamente en emsp_tokens`);
      res.status(200).json(buildSaveTokensResponse(savedCount, tokens.length, errors));
    } catch (error) {
      logger.error('❌ Error guardando tokens eMSP:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error saving EMSP tokens',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * POST /save-cpo-tariffs - Guardar tariffs de un CPO externo
 */
function setupSaveCpoTariffs(router) {
  router.post('/save-cpo-tariffs', authMiddleware, async (req, res) => {
    try {
      const { tariffs } = req.body;

      if (!tariffs || !Array.isArray(tariffs)) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'Missing required fields: tariffs array',
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`🌐 Guardando ${tariffs.length} tariffs del CPO externo`);

      const errors = [];
      const savedCount = await processTariffs(tariffs, errors);

      logger.info(`✅ ${savedCount} tariffs guardados exitosamente en emsp_tariffs`);
      res.status(200).json(buildSaveTariffsResponse(savedCount, tariffs.length, errors, null));
    } catch (error) {
      logger.error('❌ Error guardando tariffs del CPO:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error saving CPO tariffs',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupSaveCpoLocations,
  setupSaveCpoEvses,
  setupSaveEmspTokens,
  setupSaveCpoTariffs
};

