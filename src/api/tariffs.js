const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Tariff } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /ocpi/2.2/tariffs:
 *   get:
 *     summary: Get OCPI tariffs
 *     tags: [Tariffs]
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
 *         name: type
 *         schema:
 *           type: string
 */
router.get('/', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'GET', { query: req.query });
    
    const { country_code, party_id, type, offset = 0, limit = 100 } = req.query;
    
    const where = {
      deleted_at: null // Excluir tarifas soft-deleted
    };
    if (country_code) where.country_code = country_code;
    if (party_id) where.party_id = party_id;
    if (type) where.type = type;
    
    const tariffs = await Tariff.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: Math.min(parseInt(limit), 1000),
      order: [['last_updated', 'DESC']]
    });

    res.status(200).json({
      status_code: 1000,
      data: tariffs.rows,
      timestamp: new Date().toISOString(),
      pagination: {
        total: tariffs.count,
        offset: parseInt(offset),
        limit: Math.min(parseInt(limit), 1000)
      }
    });
  } catch (error) {
    logger.error('Error getting tariffs:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   get:
 *     summary: Get specific OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'GET_BY_ID', { id: req.params.id });
    
    const { id } = req.params;
    const tariff = await Tariff.findByPk(id);
    
    if (!tariff) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Tariff not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status_code: 1000,
      data: tariff,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tariffs:
 *   post:
 *     summary: Create new OCPI tariff
 *     tags: [Tariffs]
 */
router.post('/', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'POST', { body: req.body });
    
    const tariffData = {
      id: uuidv4(),
      ...req.body,
      party_id: process.env.OCPI_PARTY_ID,
      country_code: process.env.OCPI_COUNTRY_CODE,
      last_updated: new Date()
    };

    const tariff = await Tariff.create(tariffData);
    
    let updatedEvsesCount = 0;
    
    // Asociar la tarifa a los EVSEs de la location seleccionada
    if (req.body.location_id) {
      try {
        logger.info(`🔗 Asociando tarifa ${tariff.id} a location ${req.body.location_id}`);
        
        // Obtener todos los EVSEs de la location
        const { sequelize } = require('../database/connection');
        const [evses] = await sequelize.query(`
          SELECT id, connectors FROM evses 
          WHERE location_id = :locationId AND deleted_at IS NULL
        `, {
          replacements: { locationId: req.body.location_id }
        });
        
        logger.info(`📍 Encontrados ${evses.length} EVSEs en location ${req.body.location_id}`);
        
        let updatedEvsesCount = 0;
        const updatedEvses = [];
        
        // Actualizar cada EVSE para incluir la tarifa en sus conectores
        for (const evse of evses) {
          try {
            const connectors = evse.connectors || [];
            const updatedConnectors = connectors.map(connector => {
              // Agregar tariff_ids si no existe, o agregar a la lista existente
              const existingTariffIds = connector.tariff_ids || [];
              const newTariffIds = [...existingTariffIds, tariff.id];
              
              return {
                ...connector,
                tariff_ids: newTariffIds,
                last_updated: new Date().toISOString()
              };
            });
            
            // Actualizar el EVSE en la base de datos
            await sequelize.query(`
              UPDATE evses 
              SET connectors = :connectors, last_updated = NOW()
              WHERE id = :evseId
            `, {
              replacements: { 
                connectors: JSON.stringify(updatedConnectors),
                evseId: evse.id 
              }
            });
            
            updatedEvsesCount++;
            updatedEvses.push(evse.id);
            
            logger.info(`✅ EVSE ${evse.id} actualizado con tarifa ${tariff.id}`);
            
          } catch (evseError) {
            logger.error(`❌ Error actualizando EVSE ${evse.id}:`, evseError);
          }
        }
        
        logger.info(`✅ ${updatedEvsesCount} EVSEs actualizados con la tarifa ${tariff.id}`);
        
        // Enviar notificaciones PATCH a EMSPs para cada EVSE actualizado
        if (updatedEvsesCount > 0) {
          const emspNotificationService = require('../services/emspNotificationService');
          
          for (const evseId of updatedEvses) {
            try {
              // Obtener datos completos del EVSE para la notificación
              const [evseData] = await sequelize.query(`
                SELECT e.*, l.name as location_name
                FROM evses e
                LEFT JOIN locations l ON e.location_id = l.id
                WHERE e.id = :evseId
              `, {
                replacements: { evseId }
              });
              
              if (evseData && evseData.length > 0) {
                await emspNotificationService.notifyEVSEUpdated(evseData[0]);
                logger.info(`📤 Notificación PATCH enviada para EVSE ${evseId}`);
              }
            } catch (notificationError) {
              logger.error(`❌ Error enviando notificación para EVSE ${evseId}:`, notificationError);
            }
          }
        }
        
      } catch (associationError) {
        logger.error('❌ Error asociando tarifa a EVSEs:', associationError);
        // No fallar la creación de la tarifa si falla la asociación
      }
    }

    // Notificar a EMSPs sobre la nueva tarifa
    try {
      const emspNotificationService = require('../services/emspNotificationService');
      await emspNotificationService.notifyTariffCreated(tariff);
      logger.info(`📤 Notificación de tarifa ${tariff.id} enviada a EMSPs`);
    } catch (notificationError) {
      logger.error('❌ Error notificando tarifa a EMSPs:', notificationError);
      // No fallar la creación de la tarifa si falla la notificación
    }

    res.status(201).json({
      status_code: 1000,
      data: {
        ...tariff.toJSON(),
        associated_evses: req.body.location_id ? updatedEvsesCount || 0 : 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   put:
 *     summary: Update OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'PUT', { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const tariff = await Tariff.findByPk(id);
    
    if (!tariff) {
      return res.status(404).json({
        status_code: 2004,
        status_message: 'Tariff not found',
        timestamp: new Date().toISOString()
      });
    }

    await tariff.update({
      ...req.body,
      last_updated: new Date()
    });

    res.status(200).json({
      status_code: 1000,
      data: tariff,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   delete:
 *     summary: Delete OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
/**
 * @swagger
 * /ocpi/2.2/tariffs/{id}:
 *   delete:
 *     summary: Soft delete OCPI tariff
 *     tags: [Tariffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.ocpi('/tariffs', 'DELETE', { params: req.params });
    
    const { id } = req.params;
    
    // Verificar que la tarifa existe y no está ya soft-deleted
    const tariff = await Tariff.findOne({
      where: { 
        id,
        deleted_at: null
      }
    });
    
    if (!tariff) {
      return res.status(404).json({
        status_code: 2001,
        status_message: 'Tariff not found or already deleted',
        timestamp: new Date().toISOString()
      });
    }
    
    // Soft delete la tarifa
    await Tariff.update(
      { 
        deleted_at: new Date(),
        last_updated: new Date()
      },
      { 
        where: { id } 
      }
    );
    
    logger.info(`🗑️ Tarifa ${id} soft-deleted`);
    
    let updatedEvsesCount = 0;
    const updatedEvses = [];
    
    // Desasociar la tarifa de todos los EVSEs que la usaban
    try {
      const { sequelize } = require('../database/connection');
      
      // Obtener todos los EVSEs que tienen esta tarifa en sus conectores
      const [evses] = await sequelize.query(`
        SELECT id, connectors FROM evses 
        WHERE connectors::text LIKE :tariffId AND deleted_at IS NULL
      `, {
        replacements: { tariffId: `%"${id}"%` }
      });
      
      logger.info(`🔗 Desasociando tarifa ${id} de ${evses.length} EVSEs`);
      
      // Actualizar cada EVSE para remover la tarifa de sus conectores
      for (const evse of evses) {
        try {
          const connectors = evse.connectors || [];
          const updatedConnectors = connectors.map(connector => {
            // Remover la tarifa del array tariff_ids
            const existingTariffIds = connector.tariff_ids || [];
            const newTariffIds = existingTariffIds.filter(tariffId => tariffId !== id);
            
            return {
              ...connector,
              tariff_ids: newTariffIds,
              last_updated: new Date().toISOString()
            };
          });
          
          // Actualizar el EVSE en la base de datos
          await sequelize.query(`
            UPDATE evses 
            SET connectors = :connectors, last_updated = NOW()
            WHERE id = :evseId
          `, {
            replacements: { 
              connectors: JSON.stringify(updatedConnectors),
              evseId: evse.id 
            }
          });
          
          updatedEvsesCount++;
          updatedEvses.push(evse.id);
          
          logger.info(`✅ EVSE ${evse.id} desasociado de tarifa ${id}`);
          
        } catch (evseError) {
          logger.error(`❌ Error desasociando EVSE ${evse.id}:`, evseError);
        }
      }
      
      logger.info(`✅ ${updatedEvsesCount} EVSEs desasociados de la tarifa ${id}`);
      
      // Enviar notificaciones PATCH a EMSPs para cada EVSE actualizado
      if (updatedEvsesCount > 0) {
        const emspNotificationService = require('../services/emspNotificationService');
        
        for (const evseId of updatedEvses) {
          try {
            // Obtener datos completos del EVSE para la notificación
            const [evseData] = await sequelize.query(`
              SELECT e.*, l.name as location_name
              FROM evses e
              LEFT JOIN locations l ON e.location_id = l.id
              WHERE e.id = :evseId
            `, {
              replacements: { evseId }
            });
            
            if (evseData && evseData.length > 0) {
              await emspNotificationService.notifyEVSEUpdated(evseData[0]);
              logger.info(`📤 Notificación PATCH enviada para EVSE ${evseId}`);
            }
          } catch (notificationError) {
            logger.error(`❌ Error enviando notificación para EVSE ${evseId}:`, notificationError);
          }
        }
      }
      
    } catch (disassociationError) {
      logger.error('❌ Error desasociando tarifa de EVSEs:', disassociationError);
      // No fallar el soft delete si falla la desasociación
    }
    
    res.status(200).json({
      status_code: 1000,
      data: {
        message: `Tariff ${id} deleted successfully`,
        evses_disassociated: updatedEvsesCount || 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error deleting tariff:', error);
    res.status(500).json({
      status_code: 2000,
      status_message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;




