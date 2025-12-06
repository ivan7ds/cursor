const express = require('express');

const router = express.Router();

// Importar módulos de rutas
const {
  setupRunJobRoute,
  setupToggleServiceRoute,
  setupToggleEvseServiceRoute,
  setupToggleJobsRoute
} = require('./testMonitoring/serviceRoutes');
const { logJobError, logJobExecution } = require('./testMonitoring/state');
const {
  setupStatusRoute,
  setupGetErrorsRoute,
  setupPostErrorsRoute,
  setupDeleteErrorsRoute
} = require('./testMonitoring/statusRoutes');
const {
  setupTestHistoryRoute,
  setupRunSampleTestsRoute,
  setupTestResultRoute
} = require('./testMonitoring/testRoutes');


// Importar funciones exportadas

// Configurar rutas
setupStatusRoute(router);
setupGetErrorsRoute(router);
setupPostErrorsRoute(router);
setupDeleteErrorsRoute(router);
setupTestHistoryRoute(router);
setupRunSampleTestsRoute(router);
setupTestResultRoute(router);
setupRunJobRoute(router);
setupToggleServiceRoute(router);
setupToggleEvseServiceRoute(router);
setupToggleJobsRoute(router);

module.exports = {
  router,
  logJobError,
  logJobExecution
};
