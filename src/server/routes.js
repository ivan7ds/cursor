const { setupAPIRoutes } = require('./routes/apiRoutes');
const { setupOCPIRoutes } = require('./routes/ocpiRoutes');
const { setupSpecialRoutes, setup404Handler } = require('./routes/specialRoutes');

/**
 * Configura todas las rutas de la aplicación
 */
function setupRoutes(app) {
  setupSpecialRoutes(app);
  setupOCPIRoutes(app);
  setupAPIRoutes(app);
  // El handler 404 debe ir al final para capturar solo rutas no encontradas
  setup404Handler(app);
}

module.exports = {
    setupRoutes
};
