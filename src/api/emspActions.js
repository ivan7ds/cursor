const express = require('express');

const router = express.Router();

// Importar módulos de acciones EMSP
const {
  setupGetExternalSessions,
  setupGetExternalLocations,
  setupGetExternalTariffs,
  setupGetExternalCdrs,
  setupGetExternalTokens
} = require('./emspActions/getData');
const {
  setupSaveCpoLocations,
  setupSaveCpoEvses,
  setupSaveEmspTokens,
  setupSaveCpoTariffs
} = require('./emspActions/saveData');
const {
  setupClearEmspData
} = require('./emspActions/utils');

// Configurar endpoints de guardado
setupSaveCpoLocations(router);
setupSaveCpoEvses(router);
setupSaveEmspTokens(router);
setupSaveCpoTariffs(router);

// Configurar endpoints de utilidades
setupClearEmspData(router);

// Configurar endpoints GET
setupGetExternalSessions(router);
setupGetExternalLocations(router);
setupGetExternalTariffs(router);
setupGetExternalCdrs(router);
setupGetExternalTokens(router);

module.exports = { router };
