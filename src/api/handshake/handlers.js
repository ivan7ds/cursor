/**
 * Maneja errores del handshake
 * @param {Error} error - Error ocurrido
 * @param {Object} res - Response object
 */
function handleHandshakeError(error, res) {
  console.error('❌ Error en handshake OCPI:', error);

  let errorMessage = 'Internal server error';
  let statusCode = 2000;

  if (error.response) {
    errorMessage = `External organization error: ${error.response.data?.status_message || error.message}`;
    statusCode = error.response.status;
  } else if (error.code === 'ECONNREFUSED') {
    errorMessage = 'Cannot connect to external organization URL';
    statusCode = 2001;
  } else if (error.code === 'ETIMEDOUT') {
    errorMessage = 'Connection timeout to external organization';
    statusCode = 2001;
  } else if (error.message === 'OCPI 2.2 not supported by external organization') {
    errorMessage = error.message;
    statusCode = 2001;
  }

  res.status(500).json({
    status_code: statusCode,
    status_message: errorMessage,
    timestamp: new Date().toISOString()
  });
}

/**
 * Maneja errores al generar credenciales
 * @param {Error} error - Error ocurrido
 * @param {Object} res - Response object
 */
function handleGenerateCredentialsError(error, res) {
  console.error('❌ Error generando token inicial:', error);
  
  res.status(500).json({
    status_code: 2000,
    status_message: 'Error generating initial token',
    timestamp: new Date().toISOString()
  });
}

module.exports = {
    handleHandshakeError,
    handleGenerateCredentialsError
};

