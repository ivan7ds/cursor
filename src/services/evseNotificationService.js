const axios = require('axios');
const { Credentials, EVSE, Session } = require('../models');
const logger = require('../utils/logger');

class EVSENotificationService {
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
    this.notificationInterval = null;
    this.isRunning = false;
    this.intervalMs = parseInt(process.env.EVSE_NOTIFICATION_INTERVAL_MS) || 30000; // 30 segundos por defecto
  }

  /**
   * Inicia el servicio de notificaciones automáticas
   */
  start() {
    if (this.isRunning) {
      logger.warn('EVSE Notification Service already running');
      return;
    }

    logger.info(`Starting EVSE Notification Service with interval: ${this.intervalMs}ms`);
    this.isRunning = true;

    this.notificationInterval = setInterval(async () => {
      try {
        await this.processNotifications();
      } catch (error) {
        logger.error('Error in EVSE notification loop:', error);
      }
    }, this.intervalMs);
  }

  /**
   * Detiene el servicio de notificaciones
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('EVSE Notification Service not running');
      return;
    }

    logger.info('Stopping EVSE Notification Service');
    this.isRunning = false;

    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }

  /**
   * Procesa las notificaciones pendientes
   */
  async processNotifications() {
    try {
      // Obtener todos los eMSPs conectados
      const emsps = await this.getConnectedEMSPs();
      
      if (emsps.length === 0) {
        logger.debug('No connected eMSPs found, skipping notifications');
        return;
      }

      // Obtener cambios de estado de EVSEs
      const evseChanges = await this.getEVSEStatusChanges();
      
      if (evseChanges.length === 0) {
        logger.debug('No EVSE status changes found, skipping notifications');
        return;
      }

      logger.info(`Processing ${evseChanges.length} EVSE status changes for ${emsps.length} eMSPs`);

      // Enviar notificaciones a cada eMSP
      for (const emsp of emsps) {
        await this.notifyEMSP(emsp, evseChanges);
      }

    } catch (error) {
      logger.error('Error processing EVSE notifications:', error);
    }
  }

  /**
   * Obtiene los eMSPs conectados
   */
  async getConnectedEMSPs() {
    try {
      const credentials = await Credentials.findAll({
        where: {
          url: {
            [require('sequelize').Op.notLike]: '%example.com%' // Excluir URLs de ejemplo
          }
        }
      });

      return credentials.map(cred => ({
        party_id: cred.party_id,
        country_code: cred.country_code,
        url: cred.url,
        token: cred.token
      }));
    } catch (error) {
      logger.error('Error getting connected eMSPs:', error);
      return [];
    }
  }

  /**
   * Obtiene los cambios de estado de EVSEs
   */
  async getEVSEStatusChanges() {
    try {
      // Buscar EVSEs que han cambiado de estado recientemente
      // Excluir EVSEs con sesiones activas para evitar conflictos
      const evses = await EVSE.findAll({
        limit: 1, // Solo 1 EVSE por iteración
        order: [['last_updated', 'DESC']],
        where: {
          // Excluir EVSEs que tienen sesiones activas
          id: {
            [require('sequelize').Op.notIn]: await this.getEVSEsWithActiveSessions()
          }
        }
      });

      return evses.map(evse => ({
        evse_uid: evse.id, // Usar el UID único del EVSE
        evse_id: evse.evse_id, // Mantener para logging
        location_id: evse.location_id,
        status: evse.status,
        last_updated: evse.last_updated
      }));
    } catch (error) {
      logger.error('Error getting EVSE status changes:', error);
      return [];
    }
  }

  /**
   * Obtiene los IDs de EVSEs que tienen sesiones activas
   */
  async getEVSEsWithActiveSessions() {
    try {
      const activeSessions = await Session.findAll({
        where: {
          status: 'ACTIVE'
        },
        attributes: ['evse_uid']
      });

      return activeSessions.map(session => session.evse_uid);
    } catch (error) {
      logger.error('Error getting EVSEs with active sessions:', error);
      return [];
    }
  }

  /**
   * Notifica a un eMSP específico sobre cambios de estado
   */
  async notifyEMSP(emsp, evseChanges) {
    try {
      logger.info(`Notifying eMSP ${emsp.party_id} (${emsp.country_code}) about ${evseChanges.length} EVSE changes`);

      for (const change of evseChanges) {
        await this.sendEVSEStatusUpdate(emsp, change);
      }

    } catch (error) {
      logger.error(`Error notifying eMSP ${emsp.party_id}:`, error);
    }
  }

  /**
   * Envía una actualización de estado de EVSE a un eMSP
   */
  async sendEVSEStatusUpdate(emsp, evseChange) {
    try {
      // Construir la URL del endpoint del eMSP
      const emspUrl = this.buildEMSPEndpointURL(emsp, evseChange);
      
      // Preparar el payload según OCPI 2.2
      const payload = {
        status: evseChange.status,
        last_updated: evseChange.last_updated.toISOString()
      };

      logger.info(`Sending PATCH to ${emspUrl} with payload:`, payload);

      // Enviar la notificación PATCH
      const response = await axios.patch(emspUrl, payload, {
        headers: {
          'Authorization': `Token ${emsp.token}`,
          'Content-Type': 'application/json',
          'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
        },
        timeout: 10000 // 10 segundos timeout
      });

      logger.info(`Successfully notified eMSP ${emsp.party_id} about EVSE ${evseChange.evse_id} (UID: ${evseChange.evse_uid}): ${response.status}`);

      // Actualizar el estado en nuestra base de datos
      await this.updateEVSEStatusInDatabase(evseChange.evse_uid, evseChange.status);

    } catch (error) {
      logger.error(`Failed to notify eMSP ${emsp.party_id} about EVSE ${evseChange.evse_id} (UID: ${evseChange.evse_uid}):`, error.message);
      
      // En caso de error, podríamos implementar reintentos o cola de notificaciones
      await this.handleNotificationError(emsp, evseChange, error);
    }
  }

  /**
   * Construye la URL del endpoint del eMSP
   */
  buildEMSPEndpointURL(emsp, evseChange) {
    // Extraer la URL base del eMSP
    const baseUrl = this.sanitizeUrl(emsp.url.replace('/ocpi/versions', ''));
    
    // Construir la URL del endpoint de locations según OCPI 2.2
    // Formato: {base_url}/ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}
    // Usamos nuestro party_id y country_code para identificar nuestro CPO
    const partyId = process.env.OCPI_PARTY_ID || 'IPD';
    const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
    return `${baseUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evseChange.location_id}/${evseChange.evse_uid}`;
  }

  /**
   * Actualiza el estado del EVSE en nuestra base de datos
   */
  async updateEVSEStatusInDatabase(evseUid, status) {
    try {
      await EVSE.update(
        { 
          status: status,
          last_updated: new Date()
        },
        { 
          where: { id: evseUid } // Usar el UID único del EVSE
        }
      );

      logger.info(`Updated EVSE UID ${evseUid} status to ${status} in database`);
    } catch (error) {
      logger.error(`Error updating EVSE UID ${evseUid} status in database:`, error);
    }
  }

  /**
   * Maneja errores de notificación
   */
  async handleNotificationError(emsp, evseChange, error) {
    // Por ahora solo logueamos el error
    // En el futuro podríamos implementar:
    // - Reintentos automáticos
    // - Cola de notificaciones fallidas
    // - Alertas para el administrador
    
    logger.warn(`Notification failed for eMSP ${emsp.party_id}, EVSE ${evseChange.evse_id} (UID: ${evseChange.evse_uid}): ${error.message}`);
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      nextNotification: this.isRunning ? new Date(Date.now() + this.intervalMs) : null
    };
  }
}

module.exports = new EVSENotificationService();
