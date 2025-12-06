const logger = require('../../utils/logger');

const { serviceStatus } = require('./state');
const { executeServiceJobOnce, toggleServiceExecution } = require('./utils');

/**
 * Rutas relacionadas con control de servicios
 */

/**
 * POST /api/test-monitoring/run-job
 * Ejecuta manualmente un servicio específico
 */
function setupRunJobRoute(router) {
  router.post('/run-job', async (req, res) => {
    try {
      const { service } = req.body || {};

      if (!service) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro "service" requerido'
        });
      }

      const result = await executeServiceJobOnce(service);

      res.json({
        success: true,
        data: {
          service,
          jobName: result.jobName,
          services: result.services,
          lastUpdated: new Date().toISOString()
        },
        message: `${result.jobName} ejecutado manualmente`
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error('❌ Error ejecutando job manual:', error);
      res.status(statusCode).json({
        success: false,
        error: 'Error ejecutando job manual',
        message: error.message
      });
    }
  });
}

/**
 * POST /api/test-monitoring/toggle-service
 * Activa o desactiva un servicio específico
 */
function setupToggleServiceRoute(router) {
  router.post('/toggle-service', async (req, res) => {
    try {
      const { service } = req.body || {};

      if (!service) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro "service" requerido'
        });
      }

      const result = await toggleServiceExecution(service);

      res.json({
        success: true,
        data: {
          service,
          isActive: result.isActive,
          status: result.status,
          services: result.services,
          lastUpdated: new Date().toISOString()
        },
        message: result.message
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error('❌ Error toggling service:', error);
      res.status(statusCode).json({
        success: false,
        error: 'Error alternando servicio',
        message: error.message
      });
    }
  });
}

/**
 * POST /api/test-monitoring/toggle-evse-service
 * Activa o desactiva el EVSE Notification Service individualmente
 */
function setupToggleEvseServiceRoute(router) {
  router.post('/toggle-evse-service', async (_req, res) => {
    try {
      const result = await toggleServiceExecution('evseNotificationService');

      res.json({
        success: true,
        data: {
          evseServiceActive: result.isActive,
          status: result.status,
          services: result.services,
          lastUpdated: new Date().toISOString()
        },
        message: result.message
      });
    } catch (error) {
      logger.error('❌ Error toggling EVSE service:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
}

/**
 * POST /api/test-monitoring/toggle-jobs
 * Activa o desactiva todos los jobs
 */
const {
  importAllServices,
  checkJobsStatus,
  pauseAllServices,
  startAllServices,
  buildPauseResponse,
  buildStartResponse
} = require('./serviceRoutes/toggleHelpers');

function setupToggleJobsRoute(router) {
  router.post('/toggle-jobs', async (_req, res) => {
    try {
      logger.info('🔄 Toggle jobs request received');

      const services = importAllServices();
      const jobsActive = checkJobsStatus(services.evseNotificationService);

      if (jobsActive) {
        pauseAllServices(services);
        res.json(buildPauseResponse());
      } else {
        await startAllServices(services);
        res.json(buildStartResponse());
      }
    } catch (error) {
      logger.error('❌ Error toggling jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
}

module.exports = {
  setupRunJobRoute,
  setupToggleServiceRoute,
  setupToggleEvseServiceRoute,
  setupToggleJobsRoute
};

