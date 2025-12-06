const { sequelize } = require('../../database/connection');
const { authMiddleware } = require('../../middleware/auth');
const logger = require('../../utils/logger');

/**
 * Rutas relacionadas con tariffs de EMSP
 */

/**
 * GET /ocpi/emsp/2.2/tariffs - Obtener tariffs de eMSPs
 */
function setupGetTariffsRoute(router) {
  router.get('/tariffs', authMiddleware, async (_req, res) => {
    try {
      logger.info('📍 GET /ocpi/emsp/2.2/tariffs - Consultando tariffs de eMSPs');

      const [results] = await sequelize.query(`
            SELECT * FROM emsp_tariffs 
            ORDER BY last_updated DESC
        `);

      logger.info(`✅ ${results.length} tariffs de eMSPs encontrados`);

      res.status(200).json({
        status_code: 1000,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error consultando tariffs de eMSPs:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting EMSP tariffs',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * DELETE /ocpi/emsp/2.2/tariffs/:country_code/:party_id/:tariff_id - Soft delete tarifa de eMSP
 */
// eslint-disable-next-line max-lines-per-function
function setupDeleteTariffRoute(router) {
  // eslint-disable-next-line max-lines-per-function
  router.delete('/tariffs/:country_code/:party_id/:tariff_id', authMiddleware, async (req, res) => {
    try {
      const { country_code, party_id, tariff_id } = req.params;

      logger.info('🗑️ DELETE /ocpi/emsp/2.2/tariffs - Soft delete de tarifa de eMSP', {
        country_code,
        party_id,
        tariff_id
      });

      const [results] = await sequelize.query(`
            UPDATE emsp_tariffs
            SET deleted_at = NOW(),
                updated_at = NOW(),
                last_updated = NOW()
            WHERE id = ?
              AND emsp_country_code = ?
              AND emsp_party_id = ?
              AND deleted_at IS NULL
            RETURNING id, emsp_party_id AS party_id, emsp_country_code AS country_code, deleted_at
        `, {
        replacements: [tariff_id, country_code, party_id]
      });

      if (!results || results.length === 0) {
        return res.status(404).json({
          status_code: 2001,
          status_message: 'Tariff not found or already deleted',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('✅ Tarifa de eMSP marcada como eliminada', results[0]);

      res.status(200).json({
        status_code: 1000,
        status_message: 'Tariff soft-deleted successfully',
        data: results[0],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error realizando soft delete de tarifa de eMSP:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error deleting EMSP tariff',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * PUT /ocpi/emsp/2.2/tariffs/:country_code/:party_id/:tariff_id - Crear o actualizar tarifa de eMSP
 */
// eslint-disable-next-line max-lines-per-function
function setupPutTariffRoute(router) {
  // eslint-disable-next-line max-lines-per-function, max-statements, complexity
  router.put('/tariffs/:country_code/:party_id/:tariff_id', authMiddleware, async (req, res) => {
    try {
      const { country_code, party_id, tariff_id } = req.params;
      const tariffData = req.body || {};

      logger.info('📝 PUT /ocpi/emsp/2.2/tariffs - Guardando tarifa de eMSP', {
        country_code,
        party_id,
        tariff_id,
        payload: tariffData
      });

      if (tariffData.country_code && tariffData.country_code !== country_code) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'country_code in URL does not match payload',
          timestamp: new Date().toISOString()
        });
      }

      if (tariffData.party_id && tariffData.party_id !== party_id) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'party_id in URL does not match payload',
          timestamp: new Date().toISOString()
        });
      }

      if (tariffData.id && tariffData.id !== tariff_id) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'tariff id in URL does not match payload',
          timestamp: new Date().toISOString()
        });
      }

      if (tariffData.elements && !Array.isArray(tariffData.elements)) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'elements must be an array',
          timestamp: new Date().toISOString()
        });
      }

      const nowIso = new Date().toISOString();
      const extractName = (altText, fallbackName) => {
        if (fallbackName && typeof fallbackName === 'string' && fallbackName.trim().length > 0) {
          return fallbackName;
        }

        if (!altText) {
          return null;
        }

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

      const tariffName = extractName(tariffData.tariff_alt_text, tariffData.name);

      const replacements = [
        tariff_id,
        party_id,
        country_code,
        tariff_id,
        tariffData.currency || 'EUR',
        tariffData.type || 'REGULAR',
        tariffName,
        JSON.stringify(tariffData.elements || []),
        tariffData.start_date_time || null,
        tariffData.end_date_time || null,
        tariffData.last_updated || nowIso
      ];

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
                deleted_at = NULL,
                updated_at = NOW()
        `, {
        replacements
      });

      logger.info('✅ Tarifa de eMSP guardada correctamente', {
        tariff_id,
        party_id,
        country_code,
        name: tariffName
      });

      res.status(200).json({
        status_code: 1000,
        status_message: 'Tariff stored successfully',
        data: {
          id: tariff_id,
          party_id,
          country_code,
          name: tariffName,
          last_updated: tariffData.last_updated || nowIso
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error guardando tarifa de eMSP:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error storing EMSP tariff',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupGetTariffsRoute,
  setupDeleteTariffRoute,
  setupPutTariffRoute
};

