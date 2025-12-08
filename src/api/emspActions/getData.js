/* eslint-disable max-lines -- Archivo contiene múltiples funciones para obtener datos externos que requieren muchas líneas para mantener compatibilidad con código existente */
const { authMiddleware } = require('../../middleware/auth');
const logger = require('../../utils/logger');

const {
  fetchCDRsFromOrganization,
  processCDRsFromOrg,
  buildGetCDRsResponse
} = require('./getData/cdrHelpers');
const { getExternalOrganizations } = require('./getData/commonHelpers');
const {
  fetchLocationsFromOrganization,
  processLocationsFromOrg,
  buildGetLocationsResponse
} = require('./getData/locationHelpers');
const {
  buildNoOrganizationsResponse,
  processAllOrganizations
} = require('./getData/routeHelpers');
const {
  fetchSessionsFromOrganization,
  processSessionsFromOrg,
  buildGetSessionsResponse,
  logSessionStats
} = require('./getData/sessionHelpers');
const {
  fetchTariffsFromOrganization,
  processTariffsFromOrg,
  buildGetTariffsResponse
} = require('./getData/tariffHelpers');
const {
  fetchTokensFromOrganization,
  processTokensFromOrg,
  buildGetTokensResponse
} = require('./getData/tokenHelpers');

/**
 * Módulo para obtener datos externos de organizaciones conectadas
 */

/**
 * GET /get-external-sessions - Obtener y guardar sesiones de organizaciones externas conectadas
 */
function setupGetExternalSessions(router) {
  router.get('/get-external-sessions', authMiddleware, async (_req, res) => {
    try {
      logger.info('🌐 Obteniendo y guardando sesiones de organizaciones externas conectadas...');

      const organizations = await getExternalOrganizations();

      if (organizations.length === 0) {
        return res.status(200).json(buildNoOrganizationsResponse());
      }

      logger.info(`📤 Consultando sesiones a ${organizations.length} organización(es) externa(s)`);

      const allSessions = [];
      const errors = [];
      const { savedCount, duplicateCount } = await processAllOrganizations({
        organizations,
        fetchFunction: fetchSessionsFromOrganization,
        processFunction: processSessionsFromOrg,
        allData: allSessions,
        errors
      });

      logSessionStats(allSessions.length, savedCount, duplicateCount, errors.length);

      res.status(200).json(buildGetSessionsResponse({ 
        allSessions, 
        organizationsCount: organizations.length, 
        savedCount, 
        duplicateCount, 
        errors 
      }));
    } catch (error) {
      logger.error('❌ Error obteniendo sesiones de organizaciones externas:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting external sessions',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * GET /get-external-locations - Obtener y guardar locations de organizaciones externas conectadas
 */
function setupGetExternalLocations(router) {
  router.get('/get-external-locations', authMiddleware, async (_req, res) => {
    try {
      logger.info('🌐 Obteniendo y guardando locations de organizaciones externas conectadas...');

      const organizations = await getExternalOrganizations();

      if (organizations.length === 0) {
        return res.status(200).json(buildNoOrganizationsResponse());
      }

      logger.info(`📤 Consultando locations a ${organizations.length} organización(es) externa(s)`);

      const allLocations = [];
      const errors = [];
      const { savedCount, duplicateCount } = await processAllOrganizations({
        organizations,
        fetchFunction: fetchLocationsFromOrganization,
        processFunction: processLocationsFromOrg,
        allData: allLocations,
        errors
      });

      res.status(200).json(buildGetLocationsResponse({ 
        allLocations, 
        organizationsCount: organizations.length, 
        savedCount, 
        duplicateCount, 
        errors 
      }));
    } catch (error) {
      logger.error('❌ Error obteniendo locations de organizaciones externas:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting external locations',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * GET /get-external-tariffs - Obtener y guardar tariffs de organizaciones externas conectadas
 */
function setupGetExternalTariffs(router) {
  router.get('/get-external-tariffs', authMiddleware, async (_req, res) => {
    try {
      logger.info('🌐 Obteniendo y guardando tariffs de organizaciones externas conectadas...');

      const organizations = await getExternalOrganizations();

      if (organizations.length === 0) {
        return res.status(200).json(buildNoOrganizationsResponse());
      }

      const allTariffs = [];
      const errors = [];
      const { savedCount, duplicateCount } = await processAllOrganizations({
        organizations,
        fetchFunction: fetchTariffsFromOrganization,
        processFunction: processTariffsFromOrg,
        allData: allTariffs,
        errors
      });

      res.status(200).json(buildGetTariffsResponse({ 
        allTariffs, 
        organizationsCount: organizations.length, 
        savedCount, 
        duplicateCount, 
        errors 
      }));
    } catch (error) {
      logger.error('❌ Error obteniendo tariffs de organizaciones externas:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting external tariffs',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * GET /get-external-cdrs - Obtener y guardar CDRs de organizaciones externas conectadas
 */
function setupGetExternalCdrs(router) {
  router.get('/get-external-cdrs', authMiddleware, async (_req, res) => {
    try {
      logger.info('🌐 Obteniendo y guardando CDRs de organizaciones externas conectadas...');

      const organizations = await getExternalOrganizations();

      if (organizations.length === 0) {
        return res.status(200).json(buildNoOrganizationsResponse());
      }

      const allCDRs = [];
      const errors = [];
      const { savedCount, duplicateCount } = await processAllOrganizations({
        organizations,
        fetchFunction: fetchCDRsFromOrganization,
        processFunction: processCDRsFromOrg,
        allData: allCDRs,
        errors
      });

      res.status(200).json(buildGetCDRsResponse({ 
        allCDRs, 
        organizationsCount: organizations.length, 
        savedCount, 
        duplicateCount, 
        errors 
      }));
    } catch (error) {
      logger.error('❌ Error obteniendo CDRs de organizaciones externas:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting external cdrs',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * GET /get-external-tokens - Obtener y guardar tokens de organizaciones externas conectadas
 */

function setupGetExternalTokens(router) {
  router.get('/get-external-tokens', authMiddleware, async (_req, res) => {
    try {
      logger.info('🌐 Obteniendo y guardando tokens de organizaciones externas conectadas...');

      const organizations = await getExternalOrganizations();

      if (organizations.length === 0) {
        return res.status(200).json(buildNoOrganizationsResponse());
      }

      const allTokens = [];
      const errors = [];
      const { savedCount, duplicateCount } = await processAllOrganizations({
        organizations,
        fetchFunction: fetchTokensFromOrganization,
        processFunction: processTokensFromOrg,
        allData: allTokens,
        errors
      });

      res.status(200).json(buildGetTokensResponse({ 
        allTokens, 
        organizationsCount: organizations.length, 
        savedCount, 
        duplicateCount, 
        errors 
      }));
    } catch (error) {
      logger.error('❌ Error obteniendo tokens de organizaciones externas:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting external tokens',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupGetExternalSessions,
  setupGetExternalLocations,
  setupGetExternalTariffs,
  setupGetExternalCdrs,
  setupGetExternalTokens
};
/* eslint-enable max-lines -- Fin de deshabilitación de max-lines para archivo con múltiples funciones de obtención de datos externos */

