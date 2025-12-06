const { setupAPIRoutes } = require('./routes/apiRoutes');
const { setupOCPIRoutes } = require('./routes/ocpiRoutes');
const { setupSpecialRoutes } = require('./routes/specialRoutes');

/**
 * Configura todas las rutas de la aplicación
 */
function setupRoutes(app) {
  setupSpecialRoutes(app);
  setupOCPIRoutes(app);
  setupAPIRoutes(app);
}

module.exports = {
    setupRoutes
};
