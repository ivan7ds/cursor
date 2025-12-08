const { sequelize } = require('../../database/connection');
const { authMiddleware } = require('../../middleware/auth');
const logger = require('../../utils/logger');

/**
 * Rutas relacionadas con CDRs de EMSP
 */

/**
 * GET /ocpi/emsp/2.2/cdrs - Obtener CDRs de eMSPs
 */
// eslint-disable-next-line max-lines-per-function
function setupGetCdrsRoute(router) {
  // eslint-disable-next-line max-lines-per-function, max-statements
  router.get('/cdrs', authMiddleware, async (req, res) => {
    try {
      logger.info('📍 GET /ocpi/emsp/2.2/cdrs - Consultando CDRs de eMSPs', {
        query: req.query
      });

      const {
        session_id: sessionId,
        external_operator_party_id: externalOperatorPartyId,
        external_operator_country_code: externalOperatorCountryCode,
        limit
      } = req.query;

      const conditions = [];
      const replacements = [];

      if (sessionId) {
        conditions.push('session_id = ?');
        replacements.push(sessionId);
      }

      if (externalOperatorPartyId) {
        conditions.push('external_operator_party_id = ?');
        replacements.push(externalOperatorPartyId);
      }

      if (externalOperatorCountryCode) {
        conditions.push('external_operator_country_code = ?');
        replacements.push(externalOperatorCountryCode);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const numericLimit = Math.min(
        Math.max(parseInt(limit, 10) || 100, 1),
        1000
      );

      const query = `
            SELECT * FROM external_operator_cdrs
            ${whereClause}
            ORDER BY last_updated DESC
            LIMIT ?
        `;

      replacements.push(numericLimit);

      const [results] = await sequelize.query(query, { replacements });

      logger.info(`✅ ${results.length} CDRs de eMSPs encontrados`);

      res.status(200).json({
        status_code: 1000,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error consultando CDRs de eMSPs:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error getting EMSP CDRs',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * POST /ocpi/emsp/2.2/cdrs - Recibir CDRs de eMSPs
 */
// eslint-disable-next-line max-lines-per-function
function setupPostCdrsRoute(router) {
  // eslint-disable-next-line max-lines-per-function, complexity
  router.post('/cdrs', authMiddleware, async (req, res) => {
    try {
      logger.info('📍 POST /ocpi/emsp/2.2/cdrs - Recibiendo CDR de eMSP');
      logger.info('📝 CDR recibido:', JSON.stringify(req.body, null, 2));

      const cdrData = req.body;

      // Validar campos obligatorios
      if (!cdrData.country_code || !cdrData.party_id || !cdrData.id || !cdrData.session_id) {
        return res.status(400).json({
          status_code: 2000,
          status_message: 'Missing required fields: country_code, party_id, id, session_id',
          timestamp: new Date().toISOString()
        });
      }

      // Mapear datos del CDR a la estructura de la tabla external_operator_cdrs
      const cdrValues = [
        cdrData.id, // id (primary key)
        cdrData.party_id, // external_operator_party_id
        cdrData.country_code, // external_operator_country_code
        cdrData.id, // cdr_id (mismo que id)
        cdrData.session_id, // session_id
        cdrData.cdr_location?.evse_uid || 'unknown', // evse_uid
        cdrData.cdr_location?.connector_id || null, // connector_id
        cdrData.cdr_token?.uid || cdrData.id, // id_token
        cdrData.start_date_time ? new Date(cdrData.start_date_time) : new Date(), // start_datetime
        cdrData.end_date_time ? new Date(cdrData.end_date_time) : new Date(), // end_datetime
        cdrData.total_energy || 0.0, // total_energy
        cdrData.total_cost?.excl_vat || null, // total_cost
        cdrData.currency || 'EUR', // currency
        null, // total_parking_time (no viene en el payload)
        cdrData.total_time || 0, // total_time
        cdrData.last_updated ? new Date(cdrData.last_updated) : new Date() // last_updated
      ];

      logger.info('🔍 Procesando CDR:', {
        id: cdrData.id,
        party_id: cdrData.party_id,
        country_code: cdrData.country_code,
        session_id: cdrData.session_id,
        total_energy: cdrData.total_energy,
        total_cost: cdrData.total_cost?.excl_vat
      });

      // Insertar o actualizar CDR en la tabla external_operator_cdrs
      await sequelize.query(`
            INSERT INTO external_operator_cdrs (
                id, external_operator_party_id, external_operator_country_code, cdr_id, session_id, evse_uid, 
                connector_id, id_token, start_datetime, end_datetime, total_energy, 
                total_cost, currency, total_parking_time, total_time, last_updated, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON CONFLICT (id) 
            DO UPDATE SET
                external_operator_party_id = EXCLUDED.external_operator_party_id,
                external_operator_country_code = EXCLUDED.external_operator_country_code,
                cdr_id = EXCLUDED.cdr_id,
                session_id = EXCLUDED.session_id,
                evse_uid = EXCLUDED.evse_uid,
                connector_id = EXCLUDED.connector_id,
                id_token = EXCLUDED.id_token,
                start_datetime = EXCLUDED.start_datetime,
                end_datetime = EXCLUDED.end_datetime,
                total_energy = EXCLUDED.total_energy,
                total_cost = EXCLUDED.total_cost,
                currency = EXCLUDED.currency,
                total_parking_time = EXCLUDED.total_parking_time,
                total_time = EXCLUDED.total_time,
                last_updated = EXCLUDED.last_updated,
                updated_at = NOW()
        `, {
        replacements: cdrValues
      });

      logger.info('✅ CDR guardado exitosamente:', cdrData.id);

      res.status(200).json({
        status_code: 1000,
        data: {
          message: 'CDR received and saved successfully',
          cdr_id: cdrData.id,
          session_id: cdrData.session_id,
          party_id: cdrData.party_id,
          country_code: cdrData.country_code
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error procesando CDR de eMSP:', error);
      res.status(500).json({
        status_code: 2000,
        status_message: 'Error processing EMSP CDR',
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  setupGetCdrsRoute,
  setupPostCdrsRoute
};

