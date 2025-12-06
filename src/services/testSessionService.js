const { getConnectedOperators, getAvailableEvsesFromDatabase, getValidToken } = require('./testSessionService/dataRetrieval');
const { start, stop, getStatus } = require('./testSessionService/serviceLifecycle');
const { startSession, stopSession } = require('./testSessionService/sessionManagement');
const { testSessionWithValidToken, testSessionWithInvalidToken } = require('./testSessionService/testMethods');
const { runSessionTest } = require('./testSessionService/testRunner');

class TestSessionService {
  constructor() {
    this.sessionInterval = null;
    this.isRunning = false;
    this.intervalMs = parseInt(process.env.TEST_SESSION_INTERVAL_MS) || 300000;
    this.sessionDurationMs = parseInt(process.env.TEST_SESSION_DURATION_MS) || 120000;
    this.activeSessions = new Map();
  }

  start() {
    start(this);
  }

  stop() {
    stop(this);
  }

  getStatus() {
    return getStatus(this);
  }

  async runSessionTest() {
    await runSessionTest(this);
  }

  async getConnectedOperators() {
    return getConnectedOperators();
  }

  async getAvailableEvsesFromDatabase() {
    return getAvailableEvsesFromDatabase();
  }

  async testSessionWithValidToken(operator, evse) {
    await testSessionWithValidToken(operator, evse, this);
  }

  async testSessionWithInvalidToken(operator, evse) {
    await testSessionWithInvalidToken(operator, evse);
  }

  async getValidToken() {
    return getValidToken();
  }

  async startSession(operator, evse, token) {
    return startSession(operator, evse, token);
  }

  async stopSession(operator, sessionId) {
    await stopSession(operator, sessionId, this);
  }
}

module.exports = new TestSessionService();
