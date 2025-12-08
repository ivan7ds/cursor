const logger = require('../../utils/logger');

const { testHistory, testStatistics, updateTestStatistics } = require('./state');

/**
 * Rutas relacionadas con pruebas
 */

/**
 * GET /api/test-monitoring/test-history
 * Obtiene el historial de pruebas
 */
function setupTestHistoryRoute(router) {
  router.get('/test-history', async (req, res) => {
    try {
      const { limit = 50, status } = req.query;

      let filteredTests = testHistory;

      // Filtrar por estado si se especifica
      if (status) {
        filteredTests = testHistory.filter(test => test.status === status);
      }

      // Limitar resultados
      const limitedTests = filteredTests.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: {
          tests: limitedTests,
          totalTests: testHistory.length,
          filteredTests: filteredTests.length
        }
      });
    } catch (error) {
      logger.error('❌ Error obteniendo historial de pruebas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
}

/**
 * POST /api/test-monitoring/run-sample-tests
 * Ejecuta pruebas de ejemplo para demostrar el sistema
 */
function setupRunSampleTestsRoute(router) {
  router.post('/run-sample-tests', async (_req, res) => {
    try {
      logger.info('🧪 Ejecutando pruebas de ejemplo');

      const sampleTests = [
        { testName: 'Test de conexión OCPI', status: 'passed', message: 'Conexión exitosa', duration: 1200 },
        { testName: 'Test de validación de tarifas', status: 'passed', message: 'Tarifas validadas correctamente', duration: 800 },
        { testName: 'Test de notificaciones EVSE', status: 'failed', message: 'Timeout en notificación', duration: 5000 },
        { testName: 'Test de base de datos', status: 'passed', message: 'Conexión a BD exitosa', duration: 300 },
        { testName: 'Test de API externa', status: 'running', message: 'Ejecutando...', duration: 0 }
      ];

      // Ejecutar pruebas de ejemplo
      for (const test of sampleTests) {
        const testEntry = {
          id: Date.now() + Math.random(),
          testName: test.testName,
          status: test.status,
          message: test.message,
          duration: test.duration,
          timestamp: new Date().toISOString()
        };

        testHistory.unshift(testEntry);
      }

      // Limitar historial
      if (testHistory.length > 1000) {
        testHistory.splice(1000);
      }

      // Actualizar estadísticas
      updateTestStatistics();

      res.json({
        success: true,
        message: 'Pruebas de ejemplo ejecutadas',
        data: {
          testsExecuted: sampleTests.length,
          currentStatistics: testStatistics
        }
      });
    } catch (error) {
      logger.error('❌ Error ejecutando pruebas de ejemplo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
}

/**
 * POST /api/test-monitoring/test-result
 * Registra el resultado de una prueba
 */
const {
  validateTestResultInput,
  createTestEntry,
  addToTestHistory,
  buildTestResultSuccessResponse,
  buildTestResultErrorResponse
} = require('./testRoutes/resultHelpers');

function setupTestResultRoute(router) {
  router.post('/test-result', async (req, res) => {
    try {
      const validationError = validateTestResultInput(req.body);
      if (validationError) {
        return res.status(validationError.status).json(validationError.json);
      }

      const testEntry = createTestEntry(req.body);
      addToTestHistory(testEntry);
      updateTestStatistics();

      logger.info(`🧪 Resultado de prueba registrado: ${req.body.testName} - ${req.body.status}`);

      res.json(buildTestResultSuccessResponse(testEntry));
    } catch (error) {
      const errorResponse = buildTestResultErrorResponse(error);
      res.status(errorResponse.status).json(errorResponse.json);
    }
  });
}

module.exports = {
  setupTestHistoryRoute,
  setupRunSampleTestsRoute,
  setupTestResultRoute
};

