/**
 * Valida las respuestas de las organizaciones
 * @param {Object} notificationResults - Resultados de las notificaciones
 * @returns {Object} Resultado de la validación
 */
function validateResponses(notificationResults) {
  if (!notificationResults.success) {
    return {
      success: false,
      message: notificationResults.message
    };
  }

  const responses = notificationResults.responses || [];
  const successfulResponses = responses.filter(r => r.success);
  const totalResponses = responses.length;

  if (totalResponses === 0) {
    return {
      success: false,
      message: 'No organizations to notify'
    };
  }

  const successRate = (successfulResponses.length / totalResponses) * 100;
  
  if (successRate >= 80) {
    return {
      success: true,
      message: `${successfulResponses.length}/${totalResponses} organizations accepted (${successRate.toFixed(1)}%)`
    };
  } else {
    return {
      success: false,
      message: `Only ${successfulResponses.length}/${totalResponses} organizations accepted (${successRate.toFixed(1)}%)`
    };
  }
}

module.exports = {
    validateResponses
};

