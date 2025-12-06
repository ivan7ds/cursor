const axios = require('axios');

const { logJobExecution, logJobError } = require('../api/testMonitoring');
const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

const {
  buildTariffsUrl,
  buildTariffsHeaders,
  validateTariffsResponse,
  processAllTariffs
} = require('./emspTariffsSyncService/syncHelpers');
const {
  validateTariffRequiredFields,
  prepareTariffValues,
  upsertTariff
} = require('./emspTariffsSyncService/tariffHelpers');

class EMSPTariffsSyncService {
  constructor() {
    this.syncInterval = null;
    this.isRunning = false;
    this.intervalMs = parseInt(process.env.EMSP_TARIFFS_SYNC_INTERVAL_MS) || 60000; // 1 minuto por defecto
    this.connectedEMSPs = [];
  }

  /**
   * Inicia el servicio de sincronización de tarifas
   */
  start() {
    if (this.isRunning) {
      logger.warn('⚠️ EMSP Tariffs Sync Service is already running');
      return;
    }

    logger.info(`🔄 Starting EMSP Tariffs Sync Service with interval: ${this.intervalMs}ms`);

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncEMSPTariffs();
      } catch (error) {
        logger.error('❌ Error in EMSP tariffs sync service:', error);
        logJobError('EMSP Tariffs Sync Service', `Error in EMSP tariffs sync service: ${error.message}`, 'error');
      }
    }, this.intervalMs);

    this.isRunning = true;
    logger.info('✅ EMSP Tariffs Sync Service started');
  }

  /**
   * Detiene el servicio de sincronización de tarifas
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('⚠️ EMSP Tariffs Sync Service is not running');
      return;
    }

    clearInterval(this.syncInterval);
    this.syncInterval = null;
    this.isRunning = false;
    logger.info('🛑 EMSP Tariffs Sync Service stopped');
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      nextSync: this.isRunning ? new Date(Date.now() + this.intervalMs).toISOString() : null,
      connectedEMSPs: this.connectedEMSPs ? this.connectedEMSPs.length : 0
    };
  }

  /**
   * Obtiene la lista de EMSPs conectados
   */
  async getConnectedEMSPs() {
    try {
      const { sequelize } = require('../database/connection');
      
      // Buscar EMSPs que tienen tokens válidos en credentials
      const [results] = await sequelize.query(`
        SELECT DISTINCT 
          external_party_id as party_id,
          country_code,
          token,
          url
        FROM credentials 
        WHERE valid = true 
        AND external_party_id IS NOT NULL
        AND token IS NOT NULL
        AND url IS NOT NULL
        ORDER BY external_party_id, country_code
      `);

      this.connectedEMSPs = results;
      return results;
    } catch (error) {
      logger.error('❌ Error getting connected EMSPs:', error);
      return [];
    }
  }

  /**
   * Sincroniza las tarifas de todos los EMSPs conectados
   */
  async syncEMSPTariffs() {
    try {
      logger.info('🔄 Starting EMSP tariffs synchronization...');

      const emsps = await this.getConnectedEMSPs();

      if (emsps.length === 0) {
        logger.info('📭 No connected EMSPs found, skipping sync');
        logJobExecution('EMSP Tariffs Sync Service', 'No connected EMSPs found');
        return;
      }

      logger.info(`📡 Found ${emsps.length} connected EMSPs, starting sync...`);

      // Crear promesas para procesar todos los EMSPs en paralelo
      const emspPromises = emsps.map(async (emsp) => {
        try {
          await this.syncSingleEMSPTariffs(emsp);
          logger.info(`✅ Successfully synced tariffs for EMSP ${emsp.party_id} (${emsp.country_code})`);
          return { success: true, emsp };
        } catch (error) {
          logger.error(`❌ Error syncing tariffs for EMSP ${emsp.party_id} (${emsp.country_code}):`, error.message);
          return { success: false, emsp, error };
        }
      });

      // Ejecutar todas las promesas y contar resultados
      const results = await Promise.allSettled(emspPromises);
      
      let successCount = 0;
      let errorCount = 0;
      
      results.forEach((settledResult) => {
        if (settledResult.status === 'fulfilled') {
          if (settledResult.value.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      });

      const message = `Synced ${successCount} EMSPs successfully, ${errorCount} errors`;
      logger.info(`📊 EMSP Tariffs Sync completed: ${message}`);
      logJobExecution('EMSP Tariffs Sync Service', message);

    } catch (error) {
      logger.error('❌ Error in EMSP tariffs sync service:', error);
      logJobError('EMSP Tariffs Sync Service', `Error in EMSP tariffs sync service: ${error.message}`, 'error');
    }
  }

  /**
   * Sincroniza las tarifas de un EMSP específico
   */
  async syncSingleEMSPTariffs(emsp) {
    const { party_id, country_code, token, url } = emsp || {};
    
    try {
      logger.info(`🔄 Syncing tariffs for EMSP ${party_id} (${country_code})...`);

      const tariffsUrl = buildTariffsUrl(url);
      const headers = buildTariffsHeaders(token);
      
      const response = await axios.get(tariffsUrl, {
        headers,
        timeout: 10000
      });

      if (response.status === 200 && response.data.status_code === 1000) {
        const tariffs = response.data.data || [];
        logger.info(`💰 Found ${tariffs.length} tariffs for EMSP ${party_id} (${country_code})`);

        validateTariffsResponse(tariffs, party_id, country_code);
        await processAllTariffs(tariffs, party_id, country_code, this.processEMSPTariff.bind(this));

        logger.info(`✅ Successfully processed ${tariffs.length} tariffs for EMSP ${party_id} (${country_code})`);
      } else {
        throw new Error(`Invalid response from EMSP ${party_id}: ${response.status} - ${response.data?.status_message || 'Unknown error'}`);
      }

    } catch (error) {
      logger.error(`❌ Error syncing tariffs for EMSP ${party_id || 'unknown'} (${country_code || 'unknown'}):`, error.message);
      logger.error(`❌ Full error:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Procesa una tariff recibida de un EMSP
   */
  async processEMSPTariff(tariffData, emspPartyId, emspCountryCode) {
    const { id } = tariffData;
    const now = new Date().toISOString();

    try {
      if (!validateTariffRequiredFields(tariffData, emspPartyId, emspCountryCode)) {
        logger.warn(`⚠️ Tariff sin campos obligatorios, saltando...`);
        return;
      }

      const values = prepareTariffValues(tariffData, emspPartyId, emspCountryCode, now);
      await upsertTariff(values);

      logger.info(`✅ Tariff ${id} processed in emsp_tariffs for EMSP ${emspPartyId} (${emspCountryCode})`);

    } catch (error) {
      logger.error(`❌ Error processing EMSP tariff ${id}: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        tariffData
      });
      throw error;
    }
  }
}

module.exports = new EMSPTariffsSyncService();
