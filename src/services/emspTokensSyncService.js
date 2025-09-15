const axios = require('axios');
const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');
const { logJobExecution, logJobError } = require('../api/testMonitoring');

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

      let successCount = 0;
      let errorCount = 0;

      for (const emsp of emsps) {
        try {
          await this.syncSingleEMSPTokens(emsp);
          successCount++;
          logger.info(`✅ Successfully synced tokens for EMSP ${emsp.party_id} (${emsp.country_code})`);
        } catch (error) {
          errorCount++;
          logger.error(`❌ Error syncing tokens for EMSP ${emsp.party_id} (${emsp.country_code}):`, error.message);
        }
      }

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
    try {
      const { party_id, country_code, token, url } = emsp;
      
      logger.info(`🔄 Syncing tokens for EMSP ${party_id} (${country_code})...`);

      // Construir URL del endpoint de tokens del EMSP
      const tokensUrl = `${url}/ocpi/emsp/2.2/tokens/`;
      
      // Hacer petición GET a los tokens del EMSP
      const response = await axios.get(tokensUrl, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });

      if (response.status === 200 && response.data.status_code === 1000) {
        const tokens = response.data.data || [];
        
        logger.info(`🔑 Found ${tokens.length} tokens for EMSP ${party_id} (${country_code})`);

        // Verificar si devuelve 0 tokens - esto se considera un error
        if (tokens.length === 0) {
          const errorMessage = `No tokens found for EMSP ${party_id} (${country_code}) - this is considered an error`;
          logger.error(`❌ ${errorMessage}`);
          logJobError('EMSP Tokens Sync Service', errorMessage, 'error');
          throw new Error(errorMessage);
        }

        // Procesar cada token
        for (const tokenData of tokens) {
          await this.processEMSPToken(tokenData, party_id, country_code);
        }

        logger.info(`✅ Successfully processed ${tokens.length} tokens for EMSP ${party_id} (${country_code})`);
      } else {
        throw new Error(`Invalid response from EMSP ${party_id}: ${response.status} - ${response.data?.status_message || 'Unknown error'}`);
      }

    } catch (error) {
      logger.error(`❌ Error syncing tokens for EMSP ${party_id} (${country_code}):`, error.message);
      logger.error(`❌ Full error:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Procesa un token recibido de un EMSP
   */
  async processEMSPToken(tokenData, emspPartyId, emspCountryCode) {
    const { uid, ...restOfTokenData } = tokenData;
    const now = new Date().toISOString();

    try {
      // Validar campos obligatorios
      if (!uid || !emspPartyId || !emspCountryCode || !tokenData.type) {
        logger.warn(`⚠️ Token sin campos obligatorios, saltando...`);
        return;
      }

      // Generar id estable: <party_id>-<uid>
      const stableId = `${emspPartyId}-${uid}`;

      // Preparar valores con validación y valores por defecto
      const values = [
        stableId,
        emspPartyId,
        emspCountryCode,
        uid,
        tokenData.type,
        tokenData.contract_id || null,
        tokenData.visual_number || null,
        tokenData.issuer || 'Unknown',
        tokenData.group_id || null,
        tokenData.valid !== undefined ? tokenData.valid : true,
        tokenData.whitelist || null,
        tokenData.language || null,
        tokenData.default_profile_type || null,
        tokenData.energy_contract ? JSON.stringify(tokenData.energy_contract) : null,
        tokenData.last_updated || now
      ];

      // Insertar o actualizar token en emsp_tokens
      await sequelize.query(`
        INSERT INTO emsp_tokens (
          id, emsp_party_id, emsp_country_code, token_uid, type, contract_id, 
          visual_number, issuer, group_id, valid, whitelist, language, 
          default_profile_type, energy_contract, last_updated, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON CONFLICT (id) 
        DO UPDATE SET
          emsp_party_id = EXCLUDED.emsp_party_id,
          emsp_country_code = EXCLUDED.emsp_country_code,
          token_uid = EXCLUDED.token_uid,
          type = EXCLUDED.type,
          contract_id = EXCLUDED.contract_id,
          visual_number = EXCLUDED.visual_number,
          issuer = EXCLUDED.issuer,
          group_id = EXCLUDED.group_id,
          valid = EXCLUDED.valid,
          whitelist = EXCLUDED.whitelist,
          language = EXCLUDED.language,
          default_profile_type = EXCLUDED.default_profile_type,
          energy_contract = EXCLUDED.energy_contract,
          last_updated = EXCLUDED.last_updated,
          updated_at = NOW()
      `, {
        replacements: values
      });

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
