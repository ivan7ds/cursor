const express = require('express');

const router = express.Router();

// Importar módulos de rutas
const {
  setupGetCdrsRoute,
  setupPostCdrsRoute
} = require('./emsp/cdrsRoutes');
const {
  setupLocationsRoute,
  setupEvsesRoute
} = require('./emsp/locationsRoutes');
const {
  setupSessionsRoute
} = require('./emsp/sessionsRoutes');
const {
  setupGetTariffsRoute,
  setupDeleteTariffRoute,
  setupPutTariffRoute
} = require('./emsp/tariffsRoutes');
const {
  setupTokensRoute,
  setupContractsRoute,
  setupStoredTokensRoute
} = require('./emsp/tokensRoutes');

// Configurar rutas
setupLocationsRoute(router);
setupEvsesRoute(router);
setupGetTariffsRoute(router);
setupDeleteTariffRoute(router);
setupPutTariffRoute(router);
setupSessionsRoute(router);
setupGetCdrsRoute(router);
setupPostCdrsRoute(router);
setupTokensRoute(router);
setupContractsRoute(router);
setupStoredTokensRoute(router);

module.exports = router;
