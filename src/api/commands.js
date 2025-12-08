const express = require('express');

const router = express.Router();

// Importar módulos de rutas
const {
  setupStartSessionResultRoute,
  setupStartSessionRoute
} = require('./commands/startSessionRoutes');
const {
  setupStopSessionRoute,
  setupStopSessionResultRoute
} = require('./commands/stopSessionRoutes');

// Configurar rutas
setupStartSessionResultRoute(router);
setupStartSessionRoute(router);
setupStopSessionRoute(router);
setupStopSessionResultRoute(router);

module.exports = router;
