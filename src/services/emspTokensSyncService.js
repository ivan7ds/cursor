const axios = require('axios');

const { logJobExecution, logJobError } = require('../api/testMonitoring');
const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

const {
  buildTokensUrl,
  buildTokensHeaders,
  validateTokensResponse,
  processAllTokens
} = require('./emspTokensSyncService/syncHelpers');
const {
  validateTokenRequiredFields,
  generateStableTokenId,
  prepareTokenValues,
  upsertToken
} = require('./emspTokensSyncService/tokenHelpers');

class EMSPTokensSyncService {
  constructor() {
    this.syncInterval = null;
    this.isRunning = false;
    this.intervalMs = parseInt(process.env.EMSP_TOKENS_SYNC_INTERVAL_MS) || 60000; // 1 minuto por defecto
    this.connectedEMSPs = [];
  }

  /**
   * Inicia el servicio de sincronización de tokens
   */
  start() {
    if (this.isRunning) {
      logger.warn('⚠️ EMSP Tokens Sync Service is already running');
      return;
    }

    logger.info(`🔄 Starting EMSP Tokens Sync Service with interval: ${this.intervalMs}ms`);

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncEMSPTokens();
      } catch (error) {
        logger.error('❌ Error in EMSP tokens sync service:', error);
        logJobError('EMSP Tokens Sync Service', `Error in EMSP tokens sync service: ${error.message}`, 'error');
      }
    }, this.intervalMs);

    this.isRunning = true;
    logger.info('✅ EMSP Tokens Sync Service started');
  }

  /**
   * Detiene el servicio de sincronización de tokens
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('⚠️ EMSP Tokens Sync Service is not running');
      return;
    }

    clearInterval(this.syncInterval);
    this.syncInterval = null;
    this.isRunning = false;
    logger.info('🛑 EMSP Tokens Sync Service stopped');
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
   * Sincroniza los tokens de todos los EMSPs conectados
   */
  async syncEMSPTokens() {
    try {
      logger.info('🔄 Starting EMSP tokens synchronization...');

      const emsps = await this.getConnectedEMSPs();

      if (emsps.length === 0) {
        logger.info('📭 No connected EMSPs found, skipping sync');
        logJobExecution('EMSP Tokens Sync Service', 'No connected EMSPs found');
        return;
      }

      logger.info(`📡 Found ${emsps.length} connected EMSPs, starting sync...`);

      // Crear promesas para procesar todos los EMSPs en paralelo
      const emspPromises = emsps.map(async (emsp) => {
        try {
          await this.syncSingleEMSPTokens(emsp);
          logger.info(`✅ Successfully synced tokens for EMSP ${emsp.party_id} (${emsp.country_code})`);
          return { success: true, emsp };
        } catch (error) {
          logger.error(`❌ Error syncing tokens for EMSP ${emsp.party_id} (${emsp.country_code}):`, error.message);
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
      logger.info(`📊 EMSP Tokens Sync completed: ${message}`);
      logJobExecution('EMSP Tokens Sync Service', message);

    } catch (error) {
      logger.error('❌ Error in EMSP tokens sync service:', error);
      logJobError('EMSP Tokens Sync Service', `Error in EMSP tokens sync service: ${error.message}`, 'error');
    }
  }

  /**
   * Sincroniza los tokens de un EMSP específico
   */
  async syncSingleEMSPTokens(emsp) {
    const { party_id, country_code, token, url } = emsp || {};
    
    try {
      logger.info(`🔄 Syncing tokens for EMSP ${party_id} (${country_code})...`);

      const tokensUrl = buildTokensUrl(url);
      const headers = buildTokensHeaders(token);
      
      const response = await axios.get(tokensUrl, {
        headers,
        timeout: 10000
      });

      if (response.status === 200 && response.data.status_code === 1000) {
        const tokens = response.data.data || [];
        logger.info(`🔑 Found ${tokens.length} tokens for EMSP ${party_id} (${country_code})`);

        validateTokensResponse(tokens, party_id, country_code);
        await processAllTokens(tokens, party_id, country_code, this.processEMSPToken.bind(this));

        logger.info(`✅ Successfully processed ${tokens.length} tokens for EMSP ${party_id} (${country_code})`);
      } else {
        throw new Error(`Invalid response from EMSP ${party_id}: ${response.status} - ${response.data?.status_message || 'Unknown error'}`);
      }

    } catch (error) {
      logger.error(`❌ Error syncing tokens for EMSP ${party_id || 'unknown'} (${country_code || 'unknown'}):`, error.message);
      logger.error(`❌ Full error:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Procesa un token recibido de un EMSP
   */
  async processEMSPToken(tokenData, emspPartyId, emspCountryCode) {
    const { uid } = tokenData;
    const now = new Date().toISOString();

    try {
      if (!validateTokenRequiredFields(tokenData, emspPartyId, emspCountryCode)) {
        logger.warn(`⚠️ Token sin campos obligatorios, saltando...`);
        return;
      }

      const stableId = generateStableTokenId(emspPartyId, uid);
      const values = prepareTokenValues({ tokenData, emspPartyId, emspCountryCode, stableId, now });
      await upsertToken(values);

      logger.info(`✅ Token ${uid} processed in emsp_tokens for EMSP ${emspPartyId} (${emspCountryCode})`);

    } catch (error) {
      logger.error(`❌ Error processing EMSP token ${uid}: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        tokenData
      });
      throw error;
    }
  }
}

module.exports = new EMSPTokensSyncService();
