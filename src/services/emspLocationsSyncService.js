const axios = require('axios');

const { logJobExecution } = require('../api/testMonitoring');
const logger = require('../utils/logger');

const {
  locationExists,
  updateLocation,
  createLocation
} = require('./emspLocationsSyncService/locationHelpers');
const {
  buildLocationsUrl,
  buildLocationsHeaders,
  validateLocationsResponse,
  processAllLocations
} = require('./emspLocationsSyncService/syncHelpers');

class EMSPLocationsSyncService {
  constructor() {
    this.syncInterval = null;
    this.isRunning = false;
    this.intervalMs = parseInt(process.env.EMSP_LOCATIONS_SYNC_INTERVAL_MS) || 60000; // 1 minuto por defecto
    this.connectedEMSPs = [];
  }

  /**
   * Inicia el servicio de sincronización de locations de EMSPs
   */
  start() {
    if (this.isRunning) {
      logger.warn('⚠️ EMSP Locations Sync Service is already running');
      return;
    }

    logger.info(`🔄 Starting EMSP Locations Sync Service with interval: ${this.intervalMs}ms`);
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncEMSPLocations();
      } catch (error) {
        logger.error('❌ Error in EMSP locations sync service:', error);
        // Registrar error en el sistema de monitoreo
        logJobExecution('EMSP Locations Sync Service', `Error: ${error.message}`, 'error');
      }
    }, this.intervalMs);

    this.isRunning = true;
    logger.info('✅ EMSP Locations Sync Service started');
  }

  /**
   * Detiene el servicio de sincronización de locations de EMSPs
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('⚠️ EMSP Locations Sync Service is not running');
      return;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isRunning = false;
    logger.info('🛑 EMSP Locations Sync Service stopped');
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      nextSync: this.isRunning ? new Date(Date.now() + this.intervalMs).toISOString() : null,
      connectedEMSPs: this.connectedEMSPs.length
    };
  }

  /**
   * Sincroniza las locations de todos los EMSPs conectados
   */
  async syncEMSPLocations() {
    try {
      logger.info('🔄 Starting EMSP locations synchronization...');
      
      // Obtener lista de EMSPs conectados
      const emsps = await this.getConnectedEMSPs();
      
      if (emsps.length === 0) {
        logger.info('📭 No connected EMSPs found, skipping sync');
        logJobExecution('EMSP Locations Sync Service', 'No connected EMSPs found, job completed');
        return;
      }

      logger.info(`📡 Found ${emsps.length} connected EMSPs, starting sync...`);
      
      // Crear promesas para procesar todos los EMSPs en paralelo
      const emspPromises = emsps.map(async (emsp) => {
        try {
          await this.syncSingleEMSPLocations(emsp);
          logger.info(`✅ Successfully synced locations for EMSP ${emsp.party_id} (${emsp.country_code})`);
          return { success: true, emsp };
        } catch (error) {
          logger.error(`❌ Error syncing locations for EMSP ${emsp.party_id} (${emsp.country_code}):`, error.message);
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
      logger.info(`📊 EMSP Locations Sync completed: ${message}`);
      logJobExecution('EMSP Locations Sync Service', message);

    } catch (error) {
      logger.error('❌ Error in EMSP locations sync process:', error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de EMSPs conectados desde la base de datos
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
   * Sincroniza las locations de un EMSP específico
   */
  async syncSingleEMSPLocations(emsp) {
    const { party_id, country_code, token, url } = emsp || {};
    
    try {
      logger.info(`🔄 Syncing locations for EMSP ${party_id} (${country_code})...`);

      const locationsUrl = buildLocationsUrl(url);
      const headers = buildLocationsHeaders(token);
      
      const response = await axios.get(locationsUrl, {
        headers,
        timeout: 10000
      });

      if (response.status === 200 && response.data.status_code === 1000) {
        const locations = response.data.data || [];
        logger.info(`📍 Found ${locations.length} locations for EMSP ${party_id} (${country_code})`);

        validateLocationsResponse(locations, party_id, country_code);
        await processAllLocations(locations, party_id, country_code, this.processEMSPLocation.bind(this));

        logger.info(`✅ Successfully processed ${locations.length} locations for EMSP ${party_id} (${country_code})`);
      } else {
        throw new Error(`Invalid response from EMSP ${party_id}: ${response.status} - ${response.data?.status_message || 'Unknown error'}`);
      }

    } catch (error) {
      logger.error(`❌ Error syncing locations for EMSP ${party_id || 'unknown'} (${country_code || 'unknown'}):`, error.message);
      logger.error(`❌ Full error:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Procesa una location recibida de un EMSP
   */
  async processEMSPLocation(location, party_id, country_code) {
    try {
      const exists = await locationExists(location.id);
      
      if (exists) {
        await updateLocation(location, party_id, country_code);
      } else {
        await createLocation(location, party_id, country_code);
      }

    } catch (error) {
      logger.error(`❌ Error processing location ${location.id} for EMSP ${party_id}:`, error);
      throw error;
    }
  }
}

module.exports = new EMSPLocationsSyncService();
