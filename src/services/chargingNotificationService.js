const { Session, EVSE, Tariff, Credentials } = require('../models');
const axios = require('axios');
const logger = require('../utils/logger');

class ChargingNotificationService {
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
   * Procesa todas las sesiones activas y envía notificaciones PATCH
   */
  async processActiveSessions() {
    try {
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

    } catch (error) {
      logger.error('❌ Error processing active sessions:', error);
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
      logger.info(`🔄 Updating session ${session.id} with kwh: ${kwh}`);
      await session.update({
        kwh: kwh,
        last_updated: now
      });
      logger.info(`✅ Session ${session.id} updated successfully with kwh: ${kwh}`);

      // Enviar notificación PATCH al EMSP
      await this.notifyEMSPAboutChargingUpdate(session, kwh, totalCost, tariffId);

      logger.info(`✅ Charging update sent for session ${session.id}`, {
        kwh: kwh,
        total_cost: totalCost,
        tariff_id: tariffId
      });

    } catch (error) {
      logger.error(`❌ Error updating charging session ${session.id}:`, error);
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
      // Obtener credenciales del EMSP
      const emspCredentials = await Credentials.findOne({
        where: { party_id: 'EPK' }
      });

      if (!emspCredentials) {
        logger.error('❌ EMSP credentials not found for charging update notification');
        return;
      }

      // Construir URL del endpoint del EMSP
      const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
      const partyId = process.env.OCPI_PARTY_ID || 'IPD';
      const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
      const emspUrl = `${baseUrl}/ocpi/emsp/2.2/sessions/${countryCode}/${partyId}/${session.id}`;

      // Preparar payload PATCH
      const now = new Date().toISOString();
      const payload = {
        kwh: kwh,
        total_cost: totalCost,
        charging_periods: [
          {
            start_date_time: session.start_datetime.toISOString(),
            dimensions: [
              { type: "ENERGY", volume: kwh }
            ],
            tariff_id: tariffId
          }
        ],
        last_updated: now
      };

      logger.info('📤 Sending PATCH to EMSP about charging update', {
        emsp_url: emspUrl,
        session_id: session.id,
        payload
      });

      // Enviar notificación PATCH
      const response = await axios.patch(emspUrl, payload, {
        headers: {
          'Authorization': `Token ${emspCredentials.token}`,
          'Content-Type': 'application/json',
          'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
        },
        timeout: 10000
      });

      logger.info('✅ Charging update notification sent successfully', {
        emsp_url: emspUrl,
        session_id: session.id,
        status_code: response.status
      });

    } catch (error) {
      logger.error('❌ Failed to notify EMSP about charging update', {
        session_id: session.id,
        error: error.message,
        status_code: error.response?.status
      });
    }
  }
}

module.exports = new ChargingNotificationService();
