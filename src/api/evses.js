const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { EVSE, Location } = require('../models');
const emspNotificationService = require('../services/emspNotificationService');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/2.2/evses:
 *   get:
 *     summary: Get OCPI EVSEs
 *     tags: [EVSEs]
 *     parameters:
 *       - in: query
 *         name: country_code
 *         schema:
 *           type: string
 *       - in: query
 *         name: party_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/evses', 'GET', { query: req.query });
    
    const { country_code, party_id, location_id, status, offset = 0, limit = 100 } = req.query;
    
    const where = {};
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (location_id) where.location_id = location_id;
    if (status) where.status = status;
    // Filtrar EVSEs eliminados (soft delete)
    where.deleted_at = null;
    
    const evses = await EVSE.findAndCountAll({
      where,
      include: [{
        model: Location,
        as: 'location',
        attributes: ['id', 'name', 'address', 'city', 'coordinates']
      }],
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['last_updated', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: evses.rows,
      timestamp: new Date().toISOString(),
      pagination: {
        total: evses.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting EVSEs:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   get:
 *     summary: Get specific OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  try {
    logger.ocpi('/evses', 'GET_BY_ID', { id: req.params.id });
    
    const { id } = req.params;
    const evse = await EVSE.findByPk(id, {
      include: [{
        model: Location,
        as: 'location',
        attributes: ['id', 'name', 'address', 'city', 'coordinates']
      }]
    });
    
    if (!evse) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: evse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/evses:
 *   post:
 *     summary: Create new OCPI EVSE
 *     tags: [EVSEs]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/evses', 'POST', { body: req.body });
    
    const evseData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    // Ensure evse_id follows the correct eMI3 format: country_code*party_id*E...
    if (evseData.evse_id && !evseData.evse_id.match(/^[A-Z]{2}\*[A-Z0-9]{3}\*E[A-Z0-9]+$/)) {
      logger.warn(`Invalid evse_id format: ${evseData.evse_id}. Regenerating with correct format.`);
      evseData.evse_id = `${evseData.country_code}*${evseData.party_id}*E${evseData.id.substring(0, 8)}`;
      logger.info(`Generated correct evse_id: ${evseData.evse_id}`);
    }

    const evse = await EVSE.create(evseData);

    // Notificar a los EMSPs sobre el nuevo EVSE (en segundo plano)
    emspNotificationService.notifyEVSECreated(evse)
      .catch(error => {
        logger.error('Error notificando a EMSPs sobre nuevo EVSE:', error);
      });

    res.status(201).json({
      status_code: 1000,
      data: evse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Detecta cambios en conectores comparando datos anteriores y actuales
 * @param {Array} previousConnectors - Conectores anteriores
 * @param {Array} currentConnectors - Conectores actuales
 * @returns {Array} Array de conectores que han cambiado
 */
function detectConnectorChanges(previousConnectors, currentConnectors) {
  const changes = [];
  
  // Crear mapas para facilitar la comparación
  const previousMap = new Map();
  const currentMap = new Map();
  
  previousConnectors.forEach(connector => {
    if (connector.id) {
      previousMap.set(connector.id, connector);
    }
  });
  
  currentConnectors.forEach(connector => {
    if (connector.id) {
      currentMap.set(connector.id, connector);
    }
  });
  
  // Verificar conectores modificados o nuevos
  for (const [connectorId, currentConnector] of currentMap) {
    const previousConnector = previousMap.get(connectorId);
    
    if (!previousConnector) {
      // Conector nuevo
      changes.push({
        ...currentConnector,
        changeType: 'created'
      });
    } else {
      // Verificar si el conector ha cambiado
      const hasChanged = hasConnectorChanged(previousConnector, currentConnector);
      if (hasChanged) {
        changes.push({
          ...currentConnector,
          changeType: 'updated'
        });
      }
    }
  }
  
  return changes;
}

/**
 * Verifica si un conector ha cambiado comparando campos relevantes
 * @param {Object} previous - Conector anterior
 * @param {Object} current - Conector actual
 * @returns {boolean} True si ha cambiado
 */
function hasConnectorChanged(previous, current) {
  // Campos a comparar para detectar cambios
  const fieldsToCompare = [
    'standard',
    'format', 
    'power_type',
    'max_voltage',
    'max_amperage',
    'max_electric_power',
    'tariff_ids'
  ];
  
  for (const field of fieldsToCompare) {
    const prevValue = previous[field];
    const currValue = current[field];
    
    // Comparación especial para arrays (tariff_ids)
    if (field === 'tariff_ids') {
      const prevArray = Array.isArray(prevValue) ? prevValue.sort() : [];
      const currArray = Array.isArray(currValue) ? currValue.sort() : [];
      
      if (JSON.stringify(prevArray) !== JSON.stringify(currArray)) {
        return true;
      }
    } else if (prevValue !== currValue) {
      return true;
    }
  }
  
  return false;
}

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   put:
 *     summary: Update OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/evses', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const evse = await EVSE.findOne({
      where: { 
        id,
        deleted_at: null 
      }
    });
    
    if (!evse) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      });
    }

    // Guardar datos anteriores para comparar cambios en conectores
    const previousConnectors = evse.connectors ? JSON.parse(JSON.stringify(evse.connectors)) : [];

    await evse.update({
      ...req.body,
      last_updated: new Date()
    });

    // Obtener datos actualizados del EVSE
    const updatedEvse = await EVSE.findByPk(id);
    const currentConnectors = updatedEvse.connectors || [];

    // Detectar cambios en conectores y enviar notificaciones específicas
    logger.info(`🔍 Analizando cambios en conectores del EVSE ${evse.id}`);
    
    // Comparar conectores anteriores con los actuales
    const connectorChanges = detectConnectorChanges(previousConnectors, currentConnectors);
    
    if (connectorChanges.length > 0) {
      logger.info(`📤 Enviando notificaciones para ${connectorChanges.length} conector(es) modificado(s)`);
      
      // Enviar notificaciones para cada conector modificado
      for (const connectorChange of connectorChanges) {
        try {
          await emspNotificationService.notifyConnectorUpdated(updatedEvse, connectorChange);
          logger.info(`✅ Notificación enviada para conector ${connectorChange.id}`);
        } catch (error) {
          logger.error(`❌ Error notificando cambios del conector ${connectorChange.id}:`, error);
        }
      }
    } else {
      // Si no hay cambios en conectores, enviar notificación estándar del EVSE
      logger.info(`📡 No hay cambios en conectores, enviando notificación estándar del EVSE`);
      emspNotificationService.notifyEVSEUpdated(updatedEvse)
        .then(() => {
          logger.info(`✅ Notificación de EVSE actualizado completada: ${evse.id}`);
        })
        .catch(error => {
          logger.error(`❌ Error notificando a EMSPs sobre actualización de EVSE ${evse.id}:`, error);
        });
    }

    res.status(200).json({
      status_code: 1000,
      data: evse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/evses/{id}:
 *   delete:
 *     summary: Delete OCPI EVSE
 *     tags: [EVSEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/evses', 'DELETE', { id: req.params.id });
    
    const { id } = req.params;
    const evse = await EVSE.findOne({
      where: { 
        id,
        deleted_at: null 
      }
    });
    
    if (!evse) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete: marcar como eliminado en lugar de destruir
    await evse.update({
      deleted_at: new Date(),
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      status_message: 'EVSE soft deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting EVSE:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;




