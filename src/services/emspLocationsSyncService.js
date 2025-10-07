const axios = require('axios');
const logger = require('../utils/logger');
const { logJobExecution } = require('../api/testMonitoring');

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
      
      let successCount = 0;
      let errorCount = 0;

      // Procesar cada EMSP
      for (const emsp of emsps) {
        try {
          await this.syncSingleEMSPLocations(emsp);
          successCount++;
          logger.info(`✅ Successfully synced locations for EMSP ${emsp.party_id} (${emsp.country_code})`);
        } catch (error) {
          errorCount++;
          logger.error(`❌ Error syncing locations for EMSP ${emsp.party_id} (${emsp.country_code}):`, error.message);
        }
      }

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
    try {
      const { party_id, country_code, token, url } = emsp;
      
      logger.info(`🔄 Syncing locations for EMSP ${party_id} (${country_code})...`);

      // Construir URL del endpoint de locations del CPO (para obtener locations del EMSP)
      const locationsUrl = `${url}/ocpi/cpo/2.2/locations/`;
      
      // Hacer petición GET a las locations del EMSP
      const response = await axios.get(locationsUrl, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });

      if (response.status === 200 && response.data.status_code === 1000) {
        const locations = response.data.data || [];
        
        logger.info(`📍 Found ${locations.length} locations for EMSP ${party_id} (${country_code})`);

        // Verificar si devuelve 0 locations - esto se considera un error
        if (locations.length === 0) {
          const errorMessage = `No locations found for EMSP ${party_id} (${country_code}) - this is considered an error`;
          logger.error(`❌ ${errorMessage}`);
          logJobError('EMSP Locations Sync Service', errorMessage, 'error');
          throw new Error(errorMessage);
        }
        
        // Procesar cada location recibida
        for (const location of locations) {
          await this.processEMSPLocation(location, party_id, country_code);
        }

        logger.info(`✅ Successfully processed ${locations.length} locations for EMSP ${party_id} (${country_code})`);
      } else {
        throw new Error(`Invalid response from EMSP ${party_id}: ${response.status} - ${response.data?.status_message || 'Unknown error'}`);
      }

    } catch (error) {
      logger.error(`❌ Error syncing locations for EMSP ${party_id} (${country_code}):`, error.message);
      logger.error(`❌ Full error:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Procesa una location recibida de un EMSP
   */
  async processEMSPLocation(location, party_id, country_code) {
    try {
      const { sequelize } = require('../database/connection');
      
      // Verificar si la location ya existe
      const [existingLocation] = await sequelize.query(`
        SELECT id FROM emsp_locations WHERE id = ?
      `, {
        replacements: [location.id],
        type: sequelize.QueryTypes.SELECT
      });

      if (existingLocation) {
        // Actualizar location existente
        await sequelize.query(`
          UPDATE emsp_locations SET
            emsp_party_id = ?,
            emsp_country_code = ?,
            location_id = ?,
            name = ?,
            address = ?,
            city = ?,
            postal_code = ?,
            country = ?,
            coordinates = ?,
            evses = ?,
            directions = ?,
            operator = ?,
            suboperator = ?,
            owner = ?,
            facilities = ?,
            time_zone = ?,
            opening_times = ?,
            charging_when_closed = ?,
            images = ?,
            energy_mix = ?,
            last_updated = ?
          WHERE id = ?
        `, {
          replacements: [
            party_id,
            country_code,
            location.id,
            location.name || 'Unknown',
            location.address || 'Address not provided',
            location.city || 'Unknown',
            location.postal_code || '00000',
            location.country || country_code,
            JSON.stringify(location.coordinates || {}),
            JSON.stringify(location.evses || []),
            JSON.stringify(location.directions || []),
            JSON.stringify(location.operator || {}),
            JSON.stringify(location.suboperator || {}),
            JSON.stringify(location.owner || {}),
            JSON.stringify(location.facilities || []),
            location.time_zone || 'Europe/Madrid',
            JSON.stringify(location.opening_times || {}),
            location.charging_when_closed || false,
            JSON.stringify(location.images || []),
            JSON.stringify(location.energy_mix || {}),
            location.last_updated || new Date().toISOString(),
            location.id
          ]
        });

        logger.debug(`🔄 Updated location ${location.id} for EMSP ${party_id}`);
      } else {
        // Crear nueva location
        await sequelize.query(`
          INSERT INTO emsp_locations (
            id, emsp_party_id, emsp_country_code, location_id, name, address, city, 
            postal_code, country, coordinates, evses, directions, operator, 
            suboperator, owner, facilities, time_zone, opening_times, 
            charging_when_closed, images, energy_mix, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
          replacements: [
            location.id,
            party_id,
            country_code,
            location.id,
            location.name || 'Unknown',
            location.address || 'Address not provided',
            location.city || 'Unknown',
            location.postal_code || '00000',
            location.country || country_code,
            JSON.stringify(location.coordinates || {}),
            JSON.stringify(location.evses || []),
            JSON.stringify(location.directions || []),
            JSON.stringify(location.operator || {}),
            JSON.stringify(location.suboperator || {}),
            JSON.stringify(location.owner || {}),
            JSON.stringify(location.facilities || []),
            location.time_zone || 'Europe/Madrid',
            JSON.stringify(location.opening_times || {}),
            location.charging_when_closed || false,
            JSON.stringify(location.images || []),
            JSON.stringify(location.energy_mix || {}),
            location.last_updated || new Date().toISOString()
          ]
        });

        logger.debug(`➕ Created location ${location.id} for EMSP ${party_id}`);
      }

    } catch (error) {
      logger.error(`❌ Error processing location ${location.id} for EMSP ${party_id}:`, error);
      throw error;
    }
  }
}

module.exports = new EMSPLocationsSyncService();
