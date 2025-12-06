/**
 * Configura la ruta de configuración de la aplicación
 */
function setupAppConfigRoute(app) {
  app.get('/app-config.js', (_req, res) => {
    const defaultToken = process.env.OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key';
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'no-store');
    res.send([
      `window.DEFAULT_OCPI_TOKEN = ${JSON.stringify(defaultToken)};`,
      'try {',
      "  if (!window.localStorage.getItem('ocpi_token')) {",
      '    window.localStorage.setItem(\'ocpi_token\', window.DEFAULT_OCPI_TOKEN);',
      '  }',
      '} catch (error) {',
      "  console.warn('Could not persist default OCPI token in localStorage:', error);",
      '}'
    ].join('\n'));
  });
}

/**
 * Configura la ruta de health check
 */
function setupHealthRoute(app) {
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    });
  });
}

/**
 * Configura la ruta de test EMSP locations
 */
function setupTestEMSPLocationsRoute(app) {
  app.get('/test-emsp-locations', (_req, res) => {
    res.status(200).json({
      status_code: 1000,
      data: [
        {
          id: 'test-001',
          name: 'Test Location',
          emsp_party_id: 'TEST',
          country: process.env.OCPI_COUNTRY_CODE || 'ES',
          city: 'Test City',
          address: 'Test Address',
          evses: '[]',
          last_updated: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    });
  });
}

/**
 * Configura el handler 404
 */
function setup404Handler(app) {
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      message: `The requested endpoint ${req.originalUrl} does not exist`,
      timestamp: new Date().toISOString()
    });
  });
}

/**
 * Configura rutas especiales (health check, config, etc.)
 */
function setupSpecialRoutes(app) {
  setupAppConfigRoute(app);
  setupHealthRoute(app);
  setupTestEMSPLocationsRoute(app);
  setup404Handler(app);
}

module.exports = {
    setupSpecialRoutes
};
