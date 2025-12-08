const { processNotifications } = require('./evseNotificationService/notificationProcessing');
const { start, stop, getStatus } = require('./evseNotificationService/serviceLifecycle');
const { sanitizeUrl: sanitizeUrlHelper } = require('./evseNotificationService/urlBuilder');

class EVSENotificationService {
  constructor() {
    this.notificationInterval = null;
    this.isRunning = false;
    this.intervalMs = parseInt(process.env.EVSE_NOTIFICATION_INTERVAL_MS) || 30000;
  }

  sanitizeUrl(url) {
    return sanitizeUrlHelper(url);
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

  async processNotifications() {
    await processNotifications(this);
  }
}

module.exports = new EVSENotificationService();
