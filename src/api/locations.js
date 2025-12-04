const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { Location, EVSE } = require('../models');
const emspNotificationService = require('../services/emspNotificationService');
const logger = require('../utils/logger');
const { logLocationData, logArrayData } = require('../utils/loggingUtils');

/**
 * @swagger
 * /ocpi/2.2/locations:
 *   get:
 *     summary: Get OCPI locations with pagination
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: country_code
 *         schema:
 *           type: string
 *         description: Filter by country code
 *       - in: query
 *         name: party_id
 *         schema:
 *           type: string
 *         description: Filter by party ID
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset (default 0)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Pagination limit (max 1000, default 25)
 *     responses:
 *       200:
 *         description: Successfully retrieved locations
 *         headers:
 *           X-Total-Count:
 *             description: Total number of locations
 *             schema:
 *               type: integer
 *           X-Limit:
 *             description: Maximum number of locations returned
 *             schema:
 *               type: integer
 *           X-Offset:
 *             description: Offset of the first location returned
 *             schema:
 *               type: integer
 *       400:
 *         description: Bad request - invalid pagination parameters
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/locations', 'GET', { query: req.query });
    
    const { country_code, party_id, offset = 0, limit = 25 } = req.query;
    
    // Validate pagination parameters
    const offsetInt = parseInt(offset);
    const limitInt = parseInt(limit);
    
    if (isNaN(offsetInt) || offsetInt < 0) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Invalid offset parameter. Must be a non-negative integer.',
        timestamp: new Date().toISOString()
      });
    }
    
    if (isNaN(limitInt) || limitInt < 1 || limitInt > 1000) {
      return res.status(400).json({
        status_code: 2001,
        status_message: 'Invalid limit parameter. Must be between 1 and 1000.',
        timestamp: new Date().toISOString()
      });
    }
    
    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    
    // Filtrar locations eliminadas (soft delete)
    where.deleted_at = null;
    
    // First get total count
    const totalCount = await Location.count({ where });
    
    // Then get locations with EVSEs
    logger.info('Querying locations with EVSEs...');
    
    // Always use include for consistent EVSE loading
    const locations = await Location.findAll({
      where,
      attributes: ['id', 'country_code', 'party_id', 'name', 'address', 'city', 'postal_code', 'state', 'country', 'coordinates', 'related_locations', 'parking_type', 'directions', 'operator', 'suboperator', 'owner', 'facilities', 'time_zone', 'opening_times', 'charging_when_closed', 'images', 'energy_mix', 'last_updated', 'publish'],
      include: [{
        model: EVSE,
        as: 'evseList',
        where: { deleted_at: null }, // Solo incluir EVSEs activos (no soft-deleted)
        required: false, // LEFT JOIN para incluir locations sin EVSEs
        attributes: ['id', 'country_code', 'party_id', 'evse_id', 'status', 'capabilities', 'connectors', 'physical_reference', 'last_updated']
      }],
      offset: offsetInt,
      limit: limitInt,
      order: [['last_updated', 'DESC']]
    });
    
    logger.info(`Found ${locations.length} locations`);
    locations.forEach((location, index) => {
      logger.info(`Location ${index + 1}: ${location.id} has ${location.evseList ? location.evseList.length : 0} EVSEs`);
    });

    // Calculate pagination info
    const hasNextPage = (offsetInt + limitInt) < totalCount;
    const hasPrevPage = offsetInt > 0;
    
    // Debug pagination calculations
    logger.info(`Pagination debug: total=${totalCount}, limit=${limitInt}, offset=${offsetInt}`);
    logger.info(`Calculated: hasNext=${hasNextPage}, hasPrev=${hasPrevPage}`);

    // Clean and map data for OCPI 2.2 compliance
    const cleanedLocations = locations.map(location => {
      const cleanLocation = location.toJSON();
      
      // Debug: log the evseList before processing
      logger.info(`Processing location ${cleanLocation.id}: evseList length=${cleanLocation.evseList ? cleanLocation.evseList.length : 'undefined'}`);
      logLocationData(logger.info, cleanLocation);
      
      // Map evseList to evses and transform EVSE fields for OCPI 2.2 compliance
      if (cleanLocation.evseList && Array.isArray(cleanLocation.evseList) && cleanLocation.evseList.length > 0) {
        logger.info(`Location ${cleanLocation.id}: Found ${cleanLocation.evseList.length} EVSEs to process`);
        
        cleanLocation.evses = cleanLocation.evseList.map(evse => {
          const cleanEvse = { ...evse };
          
          // Map id to uid for OCPI 2.2 compliance
          cleanEvse.uid = cleanEvse.id;
          delete cleanEvse.id;
          
          // Debug EVSE data
          logger.info(`EVSE ${cleanEvse.uid}: evse_id=${cleanEvse.evse_id}, country_code=${cleanEvse.country_code}, party_id=${cleanEvse.party_id}`);
          
          
          // Transform connectors to match OCPI 2.2 format
          if (cleanEvse.connectors) {
            cleanEvse.connectors = cleanEvse.connectors.map(connector => {
              const cleanConnector = { ...connector };
              
              // Map voltage/amperage to max_voltage/max_amperage
              if (cleanConnector.voltage) {
                cleanConnector.max_voltage = cleanConnector.voltage;
                delete cleanConnector.voltage;
              }
              if (cleanConnector.amperage) {
                cleanConnector.max_amperage = cleanConnector.amperage;
                delete cleanConnector.amperage;
              }
              
              // Add missing fields
              if (!cleanConnector.tariff_ids) {
                cleanConnector.tariff_ids = [];
              }
              if (!cleanConnector.last_updated) {
                cleanConnector.last_updated = cleanEvse.last_updated;
              }
              
              return cleanConnector;
            });
          }
          
          // Ensure capabilities is an array
          if (!cleanEvse.capabilities || !Array.isArray(cleanEvse.capabilities)) {
            cleanEvse.capabilities = ['REMOTE_START_STOP_CAPABLE'];
          }
          
          // Ensure physical_reference exists
          if (!cleanEvse.physical_reference) {
            cleanEvse.physical_reference = `${cleanLocation.id}_${cleanEvse.evse_id.split('*').pop()}`;
          }
          
          return cleanEvse;
        });
        
        logger.info(`Location ${cleanLocation.id}: Processed ${cleanLocation.evses.length} EVSEs`);
        delete cleanLocation.evseList;
      } else {
        logger.warn(`Location ${cleanLocation.id}: No EVSEs found or evseList is empty`);
        cleanLocation.evses = [];
      }
      
      // Remove non-OCPI 2.2 fields
      delete cleanLocation.createdAt;
      delete cleanLocation.updatedAt;
      
      // Ensure consistent empty values for optional fields
      if (!cleanLocation.related_locations || Object.keys(cleanLocation.related_locations).length === 0) {
        cleanLocation.related_locations = [];
      }
      if (!cleanLocation.directions || Object.keys(cleanLocation.directions).length === 0) {
        cleanLocation.directions = null;
      }
      if (!cleanLocation.operator || Object.keys(cleanLocation.operator).length === 0) {
        cleanLocation.operator = null;
      }
      if (!cleanLocation.owner || Object.keys(cleanLocation.owner).length === 0) {
        cleanLocation.owner = null;
      }
      if (!cleanLocation.opening_times || Object.keys(cleanLocation.opening_times).length === 0) {
        cleanLocation.opening_times = null;
      }
      if (!cleanLocation.images || cleanLocation.images.length === 0) {
        cleanLocation.images = null;
      }
      if (!cleanLocation.energy_mix || Object.keys(cleanLocation.energy_mix).length === 0) {
        cleanLocation.energy_mix = null;
      }
      
      // Ensure publish field exists
      if (cleanLocation.publish === undefined) {
        cleanLocation.publish = true;
      }
      
      // Validate and clean facilities according to OCPI 2.2 specification
      if (cleanLocation.facilities && Array.isArray(cleanLocation.facilities)) {
        const validFacilities = [
          'HOTEL', 'RESTAURANT', 'CAFE', 'MALL', 'SUPERMARKET', 'SPORT',
          'RECREATION_AREA', 'NATURE', 'MUSEUM', 'BIKE_SHARING', 'BUS_STOP',
          'TAXI_STAND', 'TRAM_STOP', 'METRO_STATION', 'TRAIN_STATION',
          'AIRPORT', 'PARKING_LOT', 'CARPOOL_PARKING', 'FUEL_STATION', 'WIFI'
        ];
        
        // Filter out invalid facilities and log warnings
        const originalFacilities = [...cleanLocation.facilities];
        cleanLocation.facilities = cleanLocation.facilities.filter(facility => {
          if (validFacilities.includes(facility)) {
            return true;
          } else {
            logger.warn(`Location ${cleanLocation.id}: Invalid facility "${facility}" removed. Valid facilities: ${validFacilities.join(', ')}`);
            return false;
          }
        });
        
        if (originalFacilities.length !== cleanLocation.facilities.length) {
          logger.info(`Location ${cleanLocation.id}: Facilities cleaned from ${originalFacilities.join(', ')} to ${cleanLocation.facilities.join(', ')}`);
        }
      }
      
      // Ensure coordinates are strings according to OCPI 2.2 specification
      if (cleanLocation.coordinates && typeof cleanLocation.coordinates === 'object') {
        if (cleanLocation.coordinates.latitude !== undefined) {
          cleanLocation.coordinates.latitude = cleanLocation.coordinates.latitude.toString();
        }
        if (cleanLocation.coordinates.longitude !== undefined) {
          cleanLocation.coordinates.longitude = cleanLocation.coordinates.longitude.toString();
        }
        logger.info(`Location ${cleanLocation.id}: Coordinates converted to strings - lat: ${cleanLocation.coordinates.latitude}, lon: ${cleanLocation.coordinates.longitude}`);
      }
      
      return cleanLocation;
    });
    
    // Debug: log the response structure
    logger.info(`Response structure: cleanedLocations type=${typeof cleanedLocations}, length=${cleanedLocations ? cleanedLocations.length : 'undefined'}`);
    logArrayData(logger.info, cleanedLocations, 'locations');
    
    // Set OCPI 2.2 pagination headers
    const headers = {
      'X-Total-Count': totalCount.toString(),
      'X-Limit': limitInt.toString()
    };
    
    // Add Link header for next page if there is one
    if (hasNextPage) {
      const nextOffset = offsetInt + limitInt;
      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
      const queryParams = new URLSearchParams(req.query);
      queryParams.set('offset', nextOffset.toString());
      queryParams.set('limit', limitInt.toString());
      
      const nextPageUrl = `${baseUrl}?${queryParams.toString()}`;
      headers.Link = `<${nextPageUrl}>; rel="next"`;
    }
    
    res.set(headers);
    
    res.status(200).json({
      status_code: 1000,
      data: cleanedLocations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting locations:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/locations/{id}:
 *   get:
 *     summary: Get specific OCPI location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  try {
    logger.ocpi('/locations', 'GET_BY_ID', { id: req.params.id });
    
    const { id } = req.params;
    const location = await Location.findByPk(id, {
      where: { deleted_at: null }, // Solo incluir location activa
      include: [{
        model: EVSE,
        as: 'evseList',
        where: { deleted_at: null }, // Solo incluir EVSEs activos (no soft-deleted)
        required: false, // LEFT JOIN para incluir location sin EVSEs
        attributes: ['id', 'evse_id', 'status', 'capabilities', 'connectors', 'physical_reference', 'last_updated']
      }]
    });
    
    if (!location) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Location not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/locations:
 *   post:
 *     summary: Create new OCPI location
 *     tags: [Locations]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/locations', 'POST', { body: req.body });
    
    const locationData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    const location = await Location.create(locationData);

    // Notificar a los EMSPs sobre la nueva location (en segundo plano)
    emspNotificationService.notifyLocationCreated(location)
      .catch(error => {
        logger.error('Error notificando a EMSPs sobre nueva location:', error);
      });

    res.status(201).json({
      status_code: 1000,
      data: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/locations/{id}:
 *   put:
 *     summary: Update OCPI location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/locations', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const location = await Location.findByPk(id);
    
    if (!location) {
      return res.status(400).json({
        status_code: 2004,
        status_message: 'Location not found',
        timestamp: new Date().toISOString()
      });
    }

    await location.update({
      ...req.body,
      last_updated: new Date()
    });

    // Notificar a los EMSPs sobre la location actualizada (en segundo plano)
    emspNotificationService.notifyLocationUpdated(location)
      .catch(error => {
        logger.error('Error notificando a EMSPs sobre location actualizada:', error);
      });

    res.status(200).json({
      status_code: 1000,
      data: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/locations/{id}:
 *   delete:
 *     summary: Delete OCPI location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/locations', 'DELETE', { id: req.params.id });
    
    const { id } = req.params;
    const location = await Location.findByPk(id);
    
    if (!location) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Location not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete: marcar como eliminada en lugar de destruir
    await location.update({
      deleted_at: new Date(),
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      status_message: 'Location soft deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error soft deleting location:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
