const configRoutes = require('../../api/config');
const emspRoutes = require('../../api/emsp');
const { router: emspActionsRoutes } = require('../../api/emspActions');
const emspLocationsRoutes = require('../../api/emspLocations');
const emspSessionsRoutes = require('../../api/emspSessions');
const emspTariffsRoutes = require('../../api/emspTariffs');
const { router: logsRoutes } = require('../../api/logs');
const sessionsRoutes = require('../../api/sessions');
const { router: testMonitoringRoutes } = require('../../api/testMonitoring');
const { authMiddleware } = require('../../middleware/auth');

/**
 * Configura las rutas de API internas
 */
function setupAPIRoutes(app) {
  app.use('/api/sessions', authMiddleware, sessionsRoutes);
  app.use('/api/ext-sessions', authMiddleware, require('../../api/extSessions'));
  app.use('/api/charging-logs', require('../../api/chargingLogs'));
  app.use('/api/handshake', authMiddleware, require('../../api/handshake'));
  app.use('/api/config', configRoutes);
  app.use('/api/application-errors', require('../../api/applicationErrors'));

  app.use('/api/test-monitoring', testMonitoringRoutes);

  app.use('/api', authMiddleware, require('../../api/deleteConnection'));
  app.use('/api/connections', authMiddleware, require('../../api/connections'));

  app.use('/ocpi/emsp/2.2', emspRoutes);
  app.use('/ocpi/emsp/2.2/sessions', emspSessionsRoutes);
  app.use('/ocpi/emsp/2.2/locations', emspLocationsRoutes);
  app.use('/ocpi/emsp/2.2/tariffs', emspTariffsRoutes);

  app.use('/emsp/actions', emspActionsRoutes);

  app.use('/logs', logsRoutes);
  app.use('/api/validation-errors', authMiddleware, require('../../api/validationErrors'));
  app.use('/api/application-errors', authMiddleware, require('../../api/applicationErrors'));
}

module.exports = {
    setupAPIRoutes
};

