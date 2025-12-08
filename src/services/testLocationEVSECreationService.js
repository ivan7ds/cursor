const { startService, stopService, getServiceStatus } = require('./testLocationEVSECreationService/serviceLifecycle');
const { runTest } = require('./testLocationEVSECreationService/testExecutionHelpers');

class TestLocationEVSECreationService {
  constructor() {
    this.testInterval = null;
    this.isRunning = false;
    this.intervalMs = parseInt(process.env.TEST_LOCATION_EVSE_CREATION_INTERVAL_MS) || 300000;
    this.testCounter = 0;
  }

  /**
   * Inicia el servicio de prueba de creación de location y EVSE
   */
  start() {
    startService(this);
  }

  /**
   * Detiene el servicio de prueba
   */
  stop() {
    stopService(this);
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus() {
    return getServiceStatus(this);
  }

  /**
   * Ejecuta una prueba completa de creación de location y EVSE
   */
  async runTest() {
    return runTest(this);
  }
}

module.exports = new TestLocationEVSECreationService();
