/**
 * Exporta la aplicación Express configurada para uso en tests
 * Este archivo permite importar la app sin iniciar el servidor
 */

require('dotenv').config();
const express = require('express');

const errorHandler = require('./middleware/errorHandler');
const { setupMiddleware } = require('./server/middleware');
const { setupRoutes } = require('./server/routes');
const { setupSwagger } = require('./server/swagger');

const app = express();

// Configurar middleware y rutas (sin iniciar servidor)
setupSwagger(app, process.env.PORT || 3000);
setupMiddleware(app);
setupRoutes(app);
app.use(errorHandler);

module.exports = app;

