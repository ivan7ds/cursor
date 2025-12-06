const axios = require('axios');

const { logJobError, logJobExecution } = require('../api/testMonitoring');
const { Session, EVSE, Tariff } = require('../models');
const EMSPCredentialsHelper = require('../utils/emspCredentialsHelper');
const logger = require('../utils/logger');
const {
  buildEMSPNotificationUrl,
  buildChargingUpdatePayload,
  sendChargingUpdateNotification,
  handleChargingNotificationError
} = require('./chargingNotificationService/notificationHelpers');

class ChargingNotificationService {
  /**
   * Sanitiza una URL eliminando barras finales para evitar dobles barras al concatenar
   * @param {string} url - URL a sanitizar
   * @returns {string} URL sin barras finales
   */
  sanitizeUrl(url) {
    if (!url) return url;
    return url.replace(/\/$/, '');
  }

  constructor() {
    this.interval = null;
    this.isRunning = false;
    this.intervalMs = 20000; // 20 segundos
  }

  /**
   * Inicia el servicio de notificaciones de recarga
   */
  start() {
    if (this.isRunning) {
      logger.warn('⚠️ Charging notification service is already running');
      return;
    }

    logger.info(`🔄 Starting Charging Notification Service with interval: ${this.intervalMs}ms`);
    
    this.interval = setInterval(async () => {
      try {
        await this.processActiveSessions();
      } catch (error) {
        logger.error('❌ Error in charging notification service:', error);
        // Registrar error en el sistema de monitoreo
        logJobError('Charging Notification Service', `Error in charging notification service: ${error.message}`, 'error');
      }
    }, this.intervalMs);

    this.isRunning = true;
    logger.info('✅ Charging Notification Service started');
  }

  /**
   * Detiene el servicio de notificaciones de recarga
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    logger.info('🛑 Charging Notification Service stopped');
  }

  /**
   * Verifica si debe continuar ejecutándose
   */
  async shouldContinueRunning() {
    try {
      const activeSessions = await Session.count({
        where: { status: 'ACTIVE' }
      });
      
      if (activeSessions === 0) {
        logger.info('No active sessions found, stopping Charging Notification Service');
        this.stop();
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error checking active sessions:', error);
      return true; // Continuar en caso de error
    }
  }

  /**
   * Procesa todas las sesiones activas y envía notificaciones PATCH
   */
  async processActiveSessions() {
    try {
      // Verificar si debe continuar ejecutándose
      const shouldContinue = await this.shouldContinueRunning();
      if (!shouldContinue) {
        return;
      }

      // Obtener todas las sesiones activas
      const activeSessions = await Session.findAll({
        where: {
          status: 'ACTIVE'
        },
        include: [{
          model: EVSE,
          as: 'evse'
        }]
      });

      if (activeSessions.length === 0) {
        // Registrar ejecución exitosa aunque no haya sesiones activas
        logJobExecution('Charging Notification Service', 'No active sessions found, job completed');
        return;
      }

      logger.info(`🔄 Processing ${activeSessions.length} active charging sessions`);

      for (const session of activeSessions) {
        try {
          await this.updateChargingSession(session);
        } catch (error) {
          logger.error(`❌ Error updating session ${session.id}:`, error);
        }
      }

      // Registrar ejecución exitosa en el sistema de monitoreo
      logJobExecution('Charging Notification Service', `Processed ${activeSessions.length} active charging sessions`);

    } catch (error) {
      logger.error('❌ Error processing active sessions:', error);
      // Registrar error en el sistema de monitoreo
      logJobError('Charging Notification Service', `Error processing active sessions: ${error.message}`, 'error');
    }
  }

  /**
   * Actualiza una sesión de recarga específica
   */
  async updateChargingSession(session) {
    try {
      const evse = session.evse;
      if (!evse) {
        logger.warn(`⚠️ EVSE not found for session ${session.id}`);
        return;
      }

      // Calcular tiempo transcurrido en horas
      const startTime = new Date(session.start_datetime);
      const now = new Date();
      const elapsedHours = (now - startTime) / (1000 * 60 * 60); // Convertir a horas

      // Simular consumo de energía (en un caso real, esto vendría del hardware)
      const powerKw = 22; // Potencia del cargador en kW
      const kwh = Math.min(elapsedHours * powerKw, 50); // Máximo 50 kWh para la simulación

      // Obtener tarifa del EVSE desde los connectors
      let tariff = null;
      let tariffId = null;
      
      if (evse.connectors && evse.connectors.length > 0) {
        const connector = evse.connectors[0]; // Usar el primer conector
        if (connector.tariff_ids && connector.tariff_ids.length > 0) {
          tariffId = connector.tariff_ids[0]; // Usar la primera tarifa
          // Buscar la tarifa en la base de datos
          tariff = await Tariff.findByPk(tariffId);
        }
      }
      
      // Calcular costos basados en la tarifa
      let totalCost = { excl_vat: 0, incl_vat: 0 };

      if (tariff) {
        const pricePerKwh = this.calculatePricePerKwh(tariff);
        const costExclVat = kwh * pricePerKwh;
        const costInclVat = costExclVat * 1.1; // 10% IVA

        totalCost = {
          excl_vat: Math.round(costExclVat * 100) / 100,
          incl_vat: Math.round(costInclVat * 100) / 100
        };
      } else {
        // Usar precio por defecto si no hay tarifa
        const costExclVat = kwh * 0.20;
        const costInclVat = costExclVat * 1.1;

        totalCost = {
          excl_vat: Math.round(costExclVat * 100) / 100,
          incl_vat: Math.round(costInclVat * 100) / 100
        };
      }

      // Actualizar sesión en base de datos
      logger.info(`🔄 Updating session ${session.id} with kwh: ${kwh}. Total cost: ${totalCost.excl_vat}`);
      await session.update({
        kwh,
        total_cost: totalCost.excl_vat,
        last_updated: now
      });
      logger.info(`✅ Session ${session.id} updated successfully with kwh: ${kwh}. Total cost: ${totalCost.excl_vat}`);

      // Enviar notificación PATCH al EMSP
      await this.notifyEMSPAboutChargingUpdate(session, kwh, totalCost, tariffId);

      logger.info(`✅ Charging update sent for session ${session.id}`, {
        kwh,
        total_cost: totalCost,
        tariff_id: tariffId
      });

    } catch (error) {
      logger.error(`❌ Error updating charging session ${session.id}:`, error);
      // Registrar error en el sistema de monitoreo
      logJobError('Charging Notification Service', `Error updating charging session ${session.id}: ${error.message}`, 'error');
    }
  }

  /**
   * Calcula el precio por kWh basado en la tarifa
   */
  calculatePricePerKwh(tariff) {
    if (!tariff || !tariff.elements) {
      return 0.20; // Precio por defecto
    }

    // Buscar componente de tipo ENERGY en la tarifa
    for (const element of tariff.elements) {
      if (element.type === 'ENERGY') {
        return element.price || 0.20;
      }
    }

    return 0.20; // Precio por defecto
  }

  /**
   * Notifica al EMSP sobre la actualización de la recarga
   */
  async notifyEMSPAboutChargingUpdate(session, kwh, totalCost, tariffId) {
    try {
      // Obtener credenciales del EMSP basándose en la información de la sesión
      const emspCredentials = await EMSPCredentialsHelper.getCredentialsBySession(session);

      if (!emspCredentials) {
        logger.error('❌ EMSP credentials not found for charging update notification', {
          session_party_id: session.party_id,
          session_country_code: session.country_code
        });
        return;
      }

      const emspUrl = buildEMSPNotificationUrl(emspCredentials, session.id);
      const payload = buildChargingUpdatePayload(session, kwh, totalCost, tariffId);

      logger.info('📤 Sending PATCH to EMSP about charging update', {
        emsp_url: emspUrl,
        session_id: session.id,
        payload
      });

      const response = await sendChargingUpdateNotification(emspUrl, payload, emspCredentials.token);

      logger.info('✅ Charging update notification sent successfully', {
        emsp_url: emspUrl,
        session_id: session.id,
        status_code: response.status
      });

    } catch (error) {
      handleChargingNotificationError(error, session.id);
    }
  }
}

module.exports = new ChargingNotificationService();
