const axios = require('axios');
const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');
const { logJobExecution, logJobError } = require('../api/testMonitoring');

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

      let successCount = 0;
      let errorCount = 0;

      for (const emsp of emsps) {
        try {
          await this.syncSingleEMSPTariffs(emsp);
          successCount++;
          logger.info(`✅ Successfully synced tariffs for EMSP ${emsp.party_id} (${emsp.country_code})`);
        } catch (error) {
          errorCount++;
          logger.error(`❌ Error syncing tariffs for EMSP ${emsp.party_id} (${emsp.country_code}):`, error.message);
        }
      }

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
    try {
      const { party_id, country_code, token, url } = emsp;
      
      logger.info(`🔄 Syncing tariffs for EMSP ${party_id} (${country_code})...`);

      // Construir URL del endpoint de tariffs del CPO (para obtener tariffs del EMSP)
      const tariffsUrl = `${url}/ocpi/cpo/2.2/tariffs/`;
      
      // Hacer petición GET a las tariffs del EMSP
      const response = await axios.get(tariffsUrl, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });

      if (response.status === 200 && response.data.status_code === 1000) {
        const tariffs = response.data.data || [];
        
        logger.info(`💰 Found ${tariffs.length} tariffs for EMSP ${party_id} (${country_code})`);

        // Verificar si devuelve 0 tarifas - esto se considera un error
        if (tariffs.length === 0) {
          const errorMessage = `No tariffs found for EMSP ${party_id} (${country_code}) - this is considered an error`;
          logger.error(`❌ ${errorMessage}`);
          logJobError('EMSP Tariffs Sync Service', errorMessage, 'error');
          throw new Error(errorMessage);
        }

        // Procesar cada tariff
        for (const tariff of tariffs) {
          await this.processEMSPTariff(tariff, party_id, country_code);
        }

        logger.info(`✅ Successfully processed ${tariffs.length} tariffs for EMSP ${party_id} (${country_code})`);
      } else {
        throw new Error(`Invalid response from EMSP ${party_id}: ${response.status} - ${response.data?.status_message || 'Unknown error'}`);
      }

    } catch (error) {
      logger.error(`❌ Error syncing tariffs for EMSP ${party_id} (${country_code}):`, error.message);
      logger.error(`❌ Full error:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Procesa una tariff recibida de un EMSP
   */
  async processEMSPTariff(tariffData, emspPartyId, emspCountryCode) {
    const { id, ...restOfTariffData } = tariffData;
    const now = new Date().toISOString();

    try {
      // Validar campos obligatorios
      if (!id || !emspPartyId || !emspCountryCode) {
        logger.warn(`⚠️ Tariff sin campos obligatorios, saltando...`);
        return;
      }

      // Preparar valores con validación y valores por defecto
      const extractName = (altText) => {
        if (!altText) return null;

        if (typeof altText === 'string') {
          return altText;
        }

        if (Array.isArray(altText)) {
          const entry = altText.find(item => item && typeof item.text === 'string' && item.text.trim().length > 0);
          return entry ? entry.text : null;
        }

        if (typeof altText === 'object' && typeof altText.text === 'string') {
          return altText.text;
        }

        return null;
      };

      const tariffName = extractName(tariffData.tariff_alt_text);

      const values = [
        id,
        emspPartyId,
        emspCountryCode,
        id, // tariff_id es el mismo que id
        tariffData.currency || 'EUR',
        tariffData.type || 'REGULAR',
        tariffName,
        JSON.stringify(tariffData.elements || []),
        tariffData.start_date_time || null,
        tariffData.end_date_time || null,
        tariffData.last_updated || now
      ];

      // Insertar o actualizar tariff en emsp_tariffs
      await sequelize.query(`
        INSERT INTO emsp_tariffs (
          id, emsp_party_id, emsp_country_code, tariff_id, currency, type, 
          name, elements, start_date_time, end_date_time, last_updated, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON CONFLICT (id) 
        DO UPDATE SET
          emsp_party_id = EXCLUDED.emsp_party_id,
          emsp_country_code = EXCLUDED.emsp_country_code,
          tariff_id = EXCLUDED.tariff_id,
          currency = EXCLUDED.currency,
          type = EXCLUDED.type,
          name = EXCLUDED.name,
          elements = EXCLUDED.elements,
          start_date_time = EXCLUDED.start_date_time,
          end_date_time = EXCLUDED.end_date_time,
          last_updated = EXCLUDED.last_updated,
          updated_at = NOW()
      `, {
        replacements: values
      });

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
