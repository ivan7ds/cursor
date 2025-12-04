const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const { logJobExecution, logJobError } = require('../api/testMonitoring');
const { sequelize } = require('../database/connection');
const { Location, EVSE } = require('../models');
const logger = require('../utils/logger');

const emspNotificationService = require('./emspNotificationService');

class TestLocationEVSECreationService {
  constructor() {
    this.testInterval = null;
    this.isRunning = false;
    this.intervalMs = parseInt(process.env.TEST_LOCATION_EVSE_CREATION_INTERVAL_MS) || 300000; // 5 minutos por defecto
    this.testCounter = 0;
  }

  /**
   * Inicia el servicio de prueba de creación de location y EVSE
   */
  start() {
    if (this.isRunning) {
      logger.warn('⚠️ Test Location EVSE Creation Service is already running');
      return;
    }

    logger.info(`🔄 Starting Test Location EVSE Creation Service with interval: ${this.intervalMs}ms`);

    this.testInterval = setInterval(async () => {
      try {
        await this.runTest();
      } catch (error) {
        logger.error('❌ Error in Test Location EVSE Creation Service:', error);
        logJobError('Test Location EVSE Creation Service', `Error in test service: ${error.message}`, 'error');
      }
    }, this.intervalMs);

    this.isRunning = true;
    logger.info('✅ Test Location EVSE Creation Service started');
  }

  /**
   * Detiene el servicio de prueba
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('⚠️ Test Location EVSE Creation Service is not running');
      return;
    }

    clearInterval(this.testInterval);
    this.testInterval = null;
    this.isRunning = false;
    logger.info('🛑 Test Location EVSE Creation Service stopped');
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      nextTest: this.isRunning ? new Date(Date.now() + this.intervalMs).toISOString() : null,
      testCounter: this.testCounter
    };
  }

  /**
   * Ejecuta una prueba completa de creación de location y EVSE
   */
  async runTest() {
    try {
      this.testCounter++;
      logger.info(`🧪 Starting test #${this.testCounter}: Location and EVSE creation`);

      // Paso 1: Crear una nueva location de prueba
      const locationData = await this.createTestLocation();
      logger.info(`📍 Test location created: ${locationData.id}`);

      // Paso 2: Crear un nuevo EVSE en esa location
      const evseData = await this.createTestEVSE(locationData.id);
      logger.info(`🔌 Test EVSE created: ${evseData.id}`);

      // Paso 3: Notificar a las organizaciones conectadas
      const notificationResults = await this.notifyOrganizations(locationData, evseData);
      
      // Paso 4: Validar las respuestas
      const validationResult = this.validateResponses(notificationResults);

      // Paso 5: Limpiar datos de prueba (opcional)
      await this.cleanupTestData(locationData.id, evseData.id);

      const message = `Test #${this.testCounter} completed: ${validationResult.success ? 'SUCCESS' : 'FAILED'} - ${validationResult.message}`;
      logger.info(`📊 ${message}`);
      
      if (validationResult.success) {
        logJobExecution('Test Location EVSE Creation Service', message);
      } else {
        logJobError('Test Location EVSE Creation Service', message, 'error');
      }

    } catch (error) {
      logger.error('❌ Error in test execution:', error);
      logJobError('Test Location EVSE Creation Service', `Test execution failed: ${error.message}`, 'error');
    }
  }

  /**
   * Crea una location de prueba
   */
  async createTestLocation() {
    const testId = `TEST-${Date.now()}`;
    
    const locationData = {
      id: testId,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      publish: true,
      name: `Test Location ${testId}`,
      address: 'Test Street 123',
      city: 'Test City',
      postal_code: '12345',
      country: 'ESP',
      coordinates: {
        latitude: '40.4168',
        longitude: '-3.7038'
      },
      time_zone: 'Europe/Madrid',
      related_locations: [],
      parking_type: 'ON_STREET',
      evses: [],
      directions: [],
      operator: {
        name: 'Test Operator',
        website: 'https://test-operator.com'
      },
      suboperator: {
        name: 'Test Suboperator'
      },
      owner: {
        name: 'Test Owner'
      },
      facilities: ['RESTAURANT', 'HOTEL'],
      time_zone: 'Europe/Madrid',
      opening_times: {
        twenty_four_seven: true,
        regular_hours: []
      },
      charging_when_closed: true,
      images: [],
      energy_mix: {
        is_green_energy: true,
        energy_sources: [
          {
            source: 'SOLAR',
            percentage: 100
          }
        ],
        environ_impact: {
          source: 'GREEN_ENERGY',
          amount: 0
        },
        supplier_name: 'Test Green Energy',
        energy_product_name: '100% Solar'
      },
      last_updated: new Date().toISOString()
    };

    const location = await Location.create(locationData);
    logger.info(`✅ Test location created successfully: ${location.id}`);
    
    return location;
  }

  /**
   * Crea un EVSE de prueba en la location especificada
   */
  async createTestEVSE(locationId) {
    const testEvseId = `TEST-EVSE-${Date.now()}`;
    
    const evseData = {
      id: testEvseId,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      location_id: locationId,
      evse_id: `${process.env.OCPI_COUNTRY_CODE}*${process.env.OCPI_PARTY_ID}*E${testEvseId}`,
      status: 'AVAILABLE',
      status_schedule: [],
      capabilities: ['RESERVABLE', 'REMOTE_START_STOP_CAPABLE'],
      connectors: [
        {
          id: 1,
          standard: 'IEC_62196_T2',
          format: 'CABLE',
          power_type: 'AC_1_PHASE',
          max_voltage: 230,
          max_amperage: 16,
          max_electric_power: 3680,
          tariff_ids: [],
          terms_and_conditions: 'https://test-operator.com/terms',
          last_updated: new Date().toISOString()
        }
      ],
      floor_level: '0',
      physical_reference: 'Test EVSE',
      directions: [],
      parking_restrictions: [],
      images: [],
      last_updated: new Date().toISOString()
    };

    const evse = await EVSE.create(evseData);
    logger.info(`✅ Test EVSE created successfully: ${evse.id}`);
    
    return evse;
  }

  /**
   * Notifica a las organizaciones conectadas sobre la nueva location y EVSE
   */
  async notifyOrganizations(locationData, evseData) {
    try {
      logger.info('📤 Notifying connected organizations about test location and EVSE...');
      
      // Obtener organizaciones conectadas
      const organizations = await this.getConnectedOrganizations();
      
      if (organizations.length === 0) {
        logger.warn('⚠️ No connected organizations found for notification');
        return {
          success: false,
          message: 'No connected organizations found',
          responses: []
        };
      }

      logger.info(`📡 Found ${organizations.length} connected organizations`);

      // Notificar sobre la location
      const locationNotificationResults = await this.notifyLocationToOrganizations(organizations, locationData);
      
      // Notificar sobre el EVSE
      const evseNotificationResults = await this.notifyEVSEToOrganizations(organizations, evseData);

      const allResults = [...locationNotificationResults, ...evseNotificationResults];
      
      logger.info(`📊 Notification results: ${allResults.filter(r => r.success).length}/${allResults.length} successful`);
      
      return {
        success: allResults.length > 0,
        message: `Notified ${organizations.length} organizations`,
        responses: allResults
      };

    } catch (error) {
      logger.error('❌ Error notifying organizations:', error);
      return {
        success: false,
        message: `Notification error: ${error.message}`,
        responses: []
      };
    }
  }

  /**
   * Obtiene las organizaciones conectadas
   */
  async getConnectedOrganizations() {
    try {
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
      return results;
    } catch (error) {
      logger.error('❌ Error getting connected organizations:', error);
      return [];
    }
  }

  /**
   * Notifica a las organizaciones sobre la nueva location
   */
  async notifyLocationToOrganizations(organizations, locationData) {
    const results = [];
    
    for (const org of organizations) {
      try {
        logger.info(`📤 Notifying organization ${org.party_id} about location ${locationData.id}`);
        
        // Simular notificación (en un caso real, usaríamos el servicio de notificaciones)
        const response = await this.sendLocationNotification(org, locationData);
        
        results.push({
          organization: `${org.party_id}_${org.country_code}`,
          type: 'location',
          success: response.success,
          statusCode: response.statusCode,
          message: response.message
        });
        
      } catch (error) {
        logger.error(`❌ Error notifying organization ${org.party_id} about location:`, error);
        results.push({
          organization: `${org.party_id}_${org.country_code}`,
          type: 'location',
          success: false,
          statusCode: 0,
          message: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Notifica a las organizaciones sobre el nuevo EVSE
   */
  async notifyEVSEToOrganizations(organizations, evseData) {
    const results = [];
    
    for (const org of organizations) {
      try {
        logger.info(`📤 Notifying organization ${org.party_id} about EVSE ${evseData.id}`);
        
        // Simular notificación (en un caso real, usaríamos el servicio de notificaciones)
        const response = await this.sendEVSENotification(org, evseData);
        
        results.push({
          organization: `${org.party_id}_${org.country_code}`,
          type: 'evse',
          success: response.success,
          statusCode: response.statusCode,
          message: response.message
        });
        
      } catch (error) {
        logger.error(`❌ Error notifying organization ${org.party_id} about EVSE:`, error);
        results.push({
          organization: `${org.party_id}_${org.country_code}`,
          type: 'evse',
          success: false,
          statusCode: 0,
          message: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Sanitiza una URL eliminando barras finales para evitar dobles barras al concatenar
   * @param {string} url - URL a sanitizar
   * @returns {string} URL sin barras finales
   */
  sanitizeUrl(url) {
    return url.replace(/\/+$/, '');
  }

  /**
   * Prepara el payload de location según OCPI 2.2
   */
  prepareLocationPayload(locationData) {
    return {
      country_code: locationData.country_code,
      party_id: locationData.party_id,
      id: locationData.id,
      publish: true,
      name: locationData.name,
      address: locationData.address,
      city: locationData.city,
      postal_code: locationData.postal_code,
      country: locationData.country,
      coordinates: locationData.coordinates,
      time_zone: locationData.time_zone || 'Europe/Madrid',
      last_updated: locationData.last_updated
    };
  }

  /**
   * Prepara el payload de EVSE según OCPI 2.2
   */
  prepareEVSEPayload(evseData) {
    return {
      uid: evseData.id,
      status: evseData.status,
      capabilities: evseData.capabilities,
      connectors: evseData.connectors,
      floor_level: evseData.floor_level,
      physical_reference: evseData.physical_reference,
      directions: evseData.directions,
      parking_restrictions: evseData.parking_restrictions,
      images: evseData.images || [],
      last_updated: evseData.last_updated
    };
  }

  /**
   * Envía notificación de location a una organización
   */
  async sendLocationNotification(organization, locationData) {
    try {
      // Construir la URL correcta según OCPI 2.2: /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}
      const partyId = process.env.OCPI_PARTY_ID || 'IPD';
      const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
      const sanitizedUrl = this.sanitizeUrl(organization.url);
      const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${locationData.id}`;
      
      logger.info(`📤 Sending location notification to ${organization.party_id} at ${endpoint}`);
      
      // Preparar payload completo para PUT
      const payload = this.prepareLocationPayload(locationData);
      
      const response = await axios.put(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${organization.token}`,
          'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`,
          'X-Request-ID': `location-create-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        timeout: 10000
      });
      
      logger.info(`✅ Location notification sent successfully to ${organization.party_id}: ${response.status}`);
      
      return {
        success: true,
        statusCode: response.status,
        message: 'Location notification accepted'
      };
      
    } catch (error) {
      logger.error(`❌ Failed to send location notification to ${organization.party_id}:`, error.message);
      return {
        success: false,
        statusCode: error.response?.status || 500,
        message: `Location notification failed: ${error.message}`
      };
    }
  }

  /**
   * Envía notificación de EVSE a una organización
   */
  async sendEVSENotification(organization, evseData) {
    try {
      // Construir la URL correcta según OCPI 2.2: /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}
      const partyId = process.env.OCPI_PARTY_ID || 'IPD';
      const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
      const sanitizedUrl = this.sanitizeUrl(organization.url);
      const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evseData.location_id}/${evseData.id}`;
      
      logger.info(`📤 Sending EVSE notification to ${organization.party_id} at ${endpoint}`);
      
      // Preparar payload completo para PUT
      const payload = this.prepareEVSEPayload(evseData);
      
      const response = await axios.put(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${organization.token}`,
          'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`,
          'X-Request-ID': `evse-create-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        timeout: 10000
      });
      
      logger.info(`✅ EVSE notification sent successfully to ${organization.party_id}: ${response.status}`);
      
      return {
        success: true,
        statusCode: response.status,
        message: 'EVSE notification accepted'
      };
      
    } catch (error) {
      logger.error(`❌ Failed to send EVSE notification to ${organization.party_id}:`, error.message);
      return {
        success: false,
        statusCode: error.response?.status || 500,
        message: `EVSE notification failed: ${error.message}`
      };
    }
  }

  /**
   * Valida las respuestas de las organizaciones
   */
  validateResponses(notificationResults) {
    if (!notificationResults.success) {
      return {
        success: false,
        message: notificationResults.message
      };
    }

    const responses = notificationResults.responses || [];
    const successfulResponses = responses.filter(r => r.success);
    const totalResponses = responses.length;

    if (totalResponses === 0) {
      return {
        success: false,
        message: 'No organizations to notify'
      };
    }

    const successRate = (successfulResponses.length / totalResponses) * 100;
    
    if (successRate >= 80) { // Consideramos éxito si al menos 80% de las organizaciones responden
      return {
        success: true,
        message: `${successfulResponses.length}/${totalResponses} organizations accepted (${successRate.toFixed(1)}%)`
      };
    } else {
      return {
        success: false,
        message: `Only ${successfulResponses.length}/${totalResponses} organizations accepted (${successRate.toFixed(1)}%)`
      };
    }
  }

  /**
   * Limpia los datos de prueba creados (hard delete)
   */
  async cleanupTestData(locationId, evseId) {
    try {
      logger.info(`🧹 Cleaning up test data: location ${locationId}, EVSE ${evseId}`);
      
      // Notificar a las organizaciones sobre la eliminación del EVSE
      await this.notifyEVSEDeletion(evseId);
      
      // Notificar a las organizaciones sobre la eliminación de la location
      await this.notifyLocationDeletion(locationId);
      
      // Eliminar EVSE de prueba (hard delete)
      await EVSE.destroy({
        where: { id: evseId },
        force: true // Hard delete, no soft delete
      });
      
      // Eliminar location de prueba (hard delete)
      await Location.destroy({
        where: { id: locationId },
        force: true // Hard delete, no soft delete
      });
      
      logger.info('✅ Test data cleaned up successfully (hard delete)');
      
    } catch (error) {
      logger.error('❌ Error cleaning up test data:', error);
    }
  }

  /**
   * Notifica a las organizaciones sobre la eliminación del EVSE
   */
  async notifyEVSEDeletion(evseId) {
    try {
      logger.info(`📤 Notifying organizations about EVSE deletion: ${evseId}`);
      
      const organizations = await this.getConnectedOrganizations();
      
      if (organizations.length === 0) {
        logger.info('📭 No connected organizations found for EVSE deletion notification');
        return;
      }

      for (const org of organizations) {
        try {
          logger.info(`📤 Notifying organization ${org.party_id} about EVSE deletion ${evseId}`);
          
          // Simular notificación de eliminación de EVSE
          const response = await this.sendEVSEDeletionNotification(org, evseId);
          
          if (response.success) {
            logger.info(`✅ Organization ${org.party_id} notified about EVSE deletion`);
          } else {
            logger.warn(`⚠️ Failed to notify organization ${org.party_id} about EVSE deletion`);
          }
          
        } catch (error) {
          logger.error(`❌ Error notifying organization ${org.party_id} about EVSE deletion:`, error);
        }
      }
      
    } catch (error) {
      logger.error('❌ Error notifying organizations about EVSE deletion:', error);
    }
  }

  /**
   * Notifica a las organizaciones sobre la eliminación de la location
   */
  async notifyLocationDeletion(locationId) {
    try {
      logger.info(`📤 Notifying organizations about location deletion: ${locationId}`);
      
      const organizations = await this.getConnectedOrganizations();
      
      if (organizations.length === 0) {
        logger.info('📭 No connected organizations found for location deletion notification');
        return;
      }

      for (const org of organizations) {
        try {
          logger.info(`📤 Notifying organization ${org.party_id} about location deletion ${locationId}`);
          
          // Simular notificación de eliminación de location
          const response = await this.sendLocationDeletionNotification(org, locationId);
          
          if (response.success) {
            logger.info(`✅ Organization ${org.party_id} notified about location deletion`);
          } else {
            logger.warn(`⚠️ Failed to notify organization ${org.party_id} about location deletion`);
          }
          
        } catch (error) {
          logger.error(`❌ Error notifying organization ${org.party_id} about location deletion:`, error);
        }
      }
      
    } catch (error) {
      logger.error('❌ Error notifying organizations about location deletion:', error);
    }
  }

  /**
   * Envía notificación de eliminación de EVSE a una organización
   */
  async sendEVSEDeletionNotification(organization, evseId) {
    try {
      // Obtener datos del EVSE para construir la URL correcta
      const evse = await EVSE.findByPk(evseId);
      if (!evse) {
        logger.warn(`EVSE ${evseId} not found for deletion notification`);
        return {
          success: false,
          statusCode: 404,
          message: 'EVSE not found for deletion notification'
        };
      }

      // Construir la URL correcta según OCPI 2.2: /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}
      const partyId = process.env.OCPI_PARTY_ID || 'IPD';
      const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
      const sanitizedUrl = this.sanitizeUrl(organization.url);
      const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evse.location_id}/${evseId}`;
      
      logger.info(`📤 Sending EVSE deletion notification to ${organization.party_id} at ${endpoint}`);
      
      // Para eliminación, enviar PATCH con status REMOVED
      const payload = {
        status: 'REMOVED',
        last_updated: new Date().toISOString()
      };
      
      const response = await axios.patch(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${organization.token}`,
          'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`,
          'X-Request-ID': `evse-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        timeout: 10000
      });
      
      logger.info(`✅ EVSE deletion notification sent successfully to ${organization.party_id}: ${response.status}`);
      
      return {
        success: true,
        statusCode: response.status,
        message: 'EVSE deletion notification accepted'
      };
      
    } catch (error) {
      logger.error(`❌ Failed to send EVSE deletion notification to ${organization.party_id}:`, error.message);
      return {
        success: false,
        statusCode: error.response?.status || 500,
        message: `EVSE deletion notification failed: ${error.message}`
      };
    }
  }

  /**
   * Envía notificación de eliminación de location a una organización
   */
  async sendLocationDeletionNotification(organization, locationId) {
    try {
      // Obtener datos de la location para construir la URL correcta
      const location = await Location.findByPk(locationId);
      if (!location) {
        logger.warn(`Location ${locationId} not found for deletion notification`);
        return {
          success: false,
          statusCode: 404,
          message: 'Location not found for deletion notification'
        };
      }

      // Construir la URL correcta según OCPI 2.2: /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}
      const partyId = process.env.OCPI_PARTY_ID || 'IPD';
      const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
      const sanitizedUrl = this.sanitizeUrl(organization.url);
      const endpoint = `${sanitizedUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${locationId}`;
      
      logger.info(`📤 Sending location deletion notification to ${organization.party_id} at ${endpoint}`);
      
      // Para eliminación, enviar PATCH con publish: false
      const payload = {
        publish: false,
        last_updated: new Date().toISOString()
      };
      
      const response = await axios.patch(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${organization.token}`,
          'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`,
          'X-Request-ID': `location-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        timeout: 10000
      });
      
      logger.info(`✅ Location deletion notification sent successfully to ${organization.party_id}: ${response.status}`);
      
      return {
        success: true,
        statusCode: response.status,
        message: 'Location deletion notification accepted'
      };
      
    } catch (error) {
      logger.error(`❌ Failed to send location deletion notification to ${organization.party_id}:`, error.message);
      return {
        success: false,
        statusCode: error.response?.status || 500,
        message: `Location deletion notification failed: ${error.message}`
      };
    }
  }
}

module.exports = new TestLocationEVSECreationService();
