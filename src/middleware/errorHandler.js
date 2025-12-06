const { logApplicationError } = require('../utils/applicationErrorLogger');
const logger = require('../utils/logger');

const { buildErrorLogData } = require('./errorHandler/errorLogDataHelpers');
const {
  buildValidationErrorResponse,
  buildSequelizeValidationErrorResponse,
  buildUniqueConstraintErrorResponse,
  buildForeignKeyConstraintErrorResponse,
  buildGenericErrorResponse
} = require('./errorHandler/errorResponseHelpers');

/**
 * Maneja diferentes tipos de errores y retorna la respuesta apropiada
 * @param {Error} err - Error ocurrido
 * @returns {Object|null} Respuesta de error o null si no es un error conocido
 */
function handleKnownErrors(err) {
  if (err.name === 'ValidationError') {
    return buildValidationErrorResponse();
  }

  if (err.name === 'SequelizeValidationError') {
    return buildSequelizeValidationErrorResponse();
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return buildUniqueConstraintErrorResponse();
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return buildForeignKeyConstraintErrorResponse();
  }

  return null;
}

const errorHandler = async (err, req, res, _next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  await logApplicationError(buildErrorLogData(err, req));

  const knownErrorResponse = handleKnownErrors(err);
  if (knownErrorResponse) {
    return res.status(knownErrorResponse.status).json(knownErrorResponse.json);
  }

  const genericResponse = buildGenericErrorResponse(err);
  return res.status(genericResponse.status).json(genericResponse.json);
};

module.exports = errorHandler;




