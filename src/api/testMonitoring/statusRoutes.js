const logger = require('../../utils/logger');

const { jobErrors, serviceStatus, testStatistics, updateTestStatistics } = require('./state');
const { buildServicesStatusSnapshot } = require('./utils');

/**
 * Rutas relacionadas con estado y errores
 */

/**
 * GET /api/test-monitoring/status
 * Obtiene el estado de los servicios y jobs
 */
function setupStatusRoute(router) {
  router.get('/status', async (_req, res) => {
    try {
      logger.info('📊 Obteniendo estado de servicios de monitoreo');

      // Actualizar estadísticas dinámicamente
      updateTestStatistics();
      const servicesSnapshot = buildServicesStatusSnapshot();

      res.json({
        success: true,
        data: {
          services: servicesSnapshot,
          testStatistics,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('❌ Error obteniendo estado de servicios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
}

/**
 * GET /api/test-monitoring/errors
 * Obtiene los errores recientes de los jobs
 */
function setupGetErrorsRoute(router) {
  router.get('/errors', async (_req, res) => {
    try {
      logger.info('📋 Obteniendo errores de jobs');

      // Limitar a los últimos 50 errores
      const recentErrors = jobErrors.slice(0, 50);

      res.json({
        success: true,
        data: {
          errors: recentErrors,
          totalErrors: jobErrors.length
        }
      });
    } catch (error) {
      logger.error('❌ Error obteniendo errores de jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
}

/**
 * POST /api/test-monitoring/errors
 * Agrega un nuevo error al log
 */
const {
  validateErrorInput,
  createErrorEntry,
  addErrorToHistory,
  buildErrorSuccessResponse,
  buildErrorErrorResponse
} = require('./statusRoutes/errorHelpers');

function setupPostErrorsRoute(router) {
  router.post('/errors', async (req, res) => {
    try {
      const validationError = validateErrorInput(req.body);
      if (validationError) {
        return res.status(validationError.status).json(validationError.json);
      }

      const errorEntry = createErrorEntry(req.body);
      addErrorToHistory(errorEntry);

      res.json(buildErrorSuccessResponse(errorEntry));
    } catch (error) {
      const errorResponse = buildErrorErrorResponse(error);
      res.status(errorResponse.status).json(errorResponse.json);
    }
  });
}

/**
 * DELETE /api/test-monitoring/errors
 * Limpia todos los errores
 */
function setupDeleteErrorsRoute(router) {
  router.delete('/errors', async (_req, res) => {
    try {
      logger.info('🧹 Limpiando errores de jobs');

      jobErrors.length = 0; // Limpiar array

      // Resetear contadores de errores
      serviceStatus.evseNotificationService.errorCount = 0;
      serviceStatus.chargingNotificationService.errorCount = 0;
      serviceStatus.emspLocationsSyncService.errorCount = 0;
      serviceStatus.emspTariffsSyncService.errorCount = 0;
      serviceStatus.emspTokensSyncService.errorCount = 0;
      serviceStatus.testLocationEVSECreationService.errorCount = 0;
      serviceStatus.testSessionService.errorCount = 0;

      res.json({
        success: true,
        message: 'Errores limpiados exitosamente'
      });
    } catch (error) {
      logger.error('❌ Error limpiando errores de jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
}

module.exports = {
  setupStatusRoute,
  setupGetErrorsRoute,
  setupPostErrorsRoute,
  setupDeleteErrorsRoute
};

