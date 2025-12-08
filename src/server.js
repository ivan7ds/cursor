require('dotenv').config();
const express = require('express');

const errorHandler = require('./middleware/errorHandler');
const { setupMiddleware } = require('./server/middleware');
const { setupRoutes } = require('./server/routes');
const { activateChargingNotificationService, startChargingNotificationServiceIfNeeded } = require('./server/services');
const { setupGracefulShutdown } = require('./server/shutdown');
const { startServer } = require('./server/startup');
const { setupSwagger } = require('./server/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

setupSwagger(app, PORT);
setupMiddleware(app);
setupRoutes(app);
app.use(errorHandler);
setupGracefulShutdown();

startServer(app, PORT);

module.exports = {
  app,
  activateChargingNotificationService,
  startChargingNotificationServiceIfNeeded
};
