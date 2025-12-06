const express = require('express');

const router = express.Router();
const evseNotificationService = require('../services/evseNotificationService');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/cpo/2.2/notifications/status:
 *   get:
 *     summary: Get EVSE notification service status
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Service status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: object
 *                   properties:
 *                     isRunning:
 *                       type: boolean
 *                       description: Whether the service is running
 *                     intervalMs:
 *                       type: integer
 *                       description: Notification interval in milliseconds
 *                     nextNotification:
 *                       type: string
 *                       format: date-time
 *                       description: Next scheduled notification time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/status', async (_req, res) => {
  try {
    logger.ocpi('/notifications/status', 'GET', {});
    
    const status = evseNotificationService.getStatus();
    
    res.status(200).json({
      status_code: 1000,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting notification service status:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/cpo/2.2/notifications/start:
 *   post:
 *     summary: Start EVSE notification service
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Service started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "EVSE Notification Service started successfully"
 *                     status:
 *                       type: object
 *                       description: Current service status
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/start', async (_req, res) => {
  try {
    logger.ocpi('/notifications/start', 'POST', {});
    
    evseNotificationService.start();
    const status = evseNotificationService.getStatus();
    
    res.status(200).json({
      status_code: 1000,
      data: {
        message: 'EVSE Notification Service started successfully',
        status
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error starting notification service:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/cpo/2.2/notifications/stop:
 *   post:
 *     summary: Stop EVSE notification service
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Service stopped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "EVSE Notification Service stopped successfully"
 *                     status:
 *                       type: object
 *                       description: Current service status
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/stop', async (_req, res) => {
  try {
    logger.ocpi('/notifications/stop', 'POST', {});
    
    evseNotificationService.stop();
    const status = evseNotificationService.getStatus();
    
    res.status(200).json({
      status_code: 1000,
      data: {
        message: 'EVSE Notification Service stopped successfully',
        status
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error stopping notification service:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/cpo/2.2/notifications/test:
 *   post:
 *     summary: Send test notification to connected eMSPs
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_code:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Test notification sent to 1 eMSP(s)"
 *                     emsps_notified:
 *                       type: integer
 *                       description: Number of eMSPs notified
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/test', async (_req, res) => {
  try {
    logger.ocpi('/notifications/test', 'POST', {});
    
    // Procesar notificaciones una vez para testing
    await evseNotificationService.processNotifications();
    
    res.status(200).json({
      status_code: 1000,
      data: {
        message: 'Test notification processed successfully',
        note: 'Check logs for detailed notification results'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error sending test notification:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
