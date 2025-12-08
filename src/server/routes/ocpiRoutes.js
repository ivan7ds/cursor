const cdrsRoutes = require('../../api/cdrs');
const commandsRoutes = require('../../api/commands');
const credentialsRoutes = require('../../api/credentials');
const detailsRoutes = require('../../api/details');
const evsesRoutes = require('../../api/evses');
const locationsRoutes = require('../../api/locations');
const notificationsRoutes = require('../../api/notifications');
const sessionsRoutes = require('../../api/sessions');
const tariffsRoutes = require('../../api/tariffs');
const tokensRoutes = require('../../api/tokens');
const versionsRoutes = require('../../api/versions');
const { authMiddleware } = require('../../middleware/auth');

/**
 * Configura las rutas OCPI 2.2
 */
function setupOCPIRoutes(app) {
  app.use('/ocpi/versions', authMiddleware, versionsRoutes);
  app.use('/ocpi/cpo/2.2/details', authMiddleware, detailsRoutes);
  app.use('/ocpi/cpo/2.2/credentials', authMiddleware, credentialsRoutes);
  app.use('/ocpi/cpo/2.2/locations', authMiddleware, locationsRoutes);
  app.use('/ocpi/cpo/2.2/evses', authMiddleware, evsesRoutes);
  app.use('/ocpi/cpo/2.2/sessions', authMiddleware, sessionsRoutes);
  app.use('/ocpi/cpo/2.2/cdrs', authMiddleware, cdrsRoutes);
  app.use('/ocpi/cpo/2.2/tariffs', authMiddleware, tariffsRoutes);
  app.use('/ocpi/cpo/2.2/tokens', authMiddleware, tokensRoutes);
  app.use('/ocpi/cpo/2.2/tokens', authMiddleware, require('../../api/authorization'));
  app.use('/ocpi/cpo/2.2/commands', authMiddleware, commandsRoutes);
  app.use('/ocpi/cpo/2.2/notifications', authMiddleware, notificationsRoutes);
}

module.exports = {
    setupOCPIRoutes
};

