const logger = require('../../../utils/logger');
const { sequelize } = require('../../../database/connection');
const EmspSession = require('../../../models/EmspSession')(sequelize);
const { buildAuthorizationHeader } = require('../../../utils/tokenEncoding');
const { buildUrl } = require('../../../utils/urlSanitizer');

const {
  buildSessionBasicInfo,
  buildSessionDates,
  buildSessionCDRToken,
  getSessionTokenId,
  buildSessionCostInfo,
  buildSessionLocationInfo
} = require('./sessionDataHelpers');

/**
 * Obtiene sesiones de una organización externa
 * @param {Object} org - Organización externa
 * @returns {Promise<Array|null>} Array de sesiones o null si hay error
 */
async function fetchSessionsFromOrganization(org) {
  try {
    logger.info(`🔍 Consultando sesiones de ${org.party_id} (${org.url})`);

    const sessionsUrl = buildUrl(org.url, '/ocpi/cpo/2.2/sessions');

    const response = await fetch(sessionsUrl, {
      method: 'GET',
      headers: {
        'Authorization': buildAuthorizationHeader(org.token, org.token_base64_encoded || false),
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        logger.info(`📥 Procesando ${data.data.length} sesiones de ${org.party_id}`);
        return data.data;
      }
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} - ${errorText}`);
    }
  } catch (error) {
    logger.error(`❌ Error consultando ${org.party_id}:`, error);
    throw error;
  }
  
  return null;
}

/**
 * Prepara los datos de una sesión para guardar en la base de datos
 * @param {Object} session - Datos de la sesión del API externo
 * @param {Object} org - Organización externa
 * @returns {Object} Datos preparados para la base de datos
 */
function prepareSessionData(session, org) {
  const basicInfo = buildSessionBasicInfo(session, org);
  const dates = buildSessionDates(session);
  const costInfo = buildSessionCostInfo(session);
  const locationInfo = buildSessionLocationInfo(session);

  return {
    ...basicInfo,
    ...dates,
    ...costInfo,
    ...locationInfo,
    cdr_token: buildSessionCDRToken(session),
    id_token: getSessionTokenId(session),
    auth_method: session.auth_method || 'RFID',
    status: session.status || 'PENDING',
    last_updated: session.last_updated ? new Date(session.last_updated) : new Date(),
    charging_periods: session.charging_periods || null
  };
}

/**
 * Guarda una sesión individual en la base de datos
 * @param {Object} sessionData - Datos de la sesión preparados
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object>} Objeto con saved y duplicate
 */
async function saveSession(sessionData, sessionId) {
  try {
    await EmspSession.create(sessionData);
    logger.info(`✅ Sesión ${sessionId} guardada exitosamente`);
    return { saved: true, duplicate: false };
  } catch (dbError) {
    if (dbError.name === 'SequelizeUniqueConstraintError') {
      logger.info(`⚠️ Sesión ${sessionId} ya existe, saltando...`);
      return { saved: false, duplicate: true };
    } else {
      logger.error(`❌ Error guardando sesión ${sessionId}:`, dbError.message);
      throw dbError;
    }
  }
}

/**
 * Procesa y guarda sesiones de una organización
 * @param {Array} sessions - Array de sesiones
 * @param {Object} org - Organización externa
 * @param {Array} allSessions - Array acumulativo de todas las sesiones
 * @param {Array} errors - Array de errores
 * @returns {Promise<Object>} Objeto con savedCount y duplicateCount
 */
/**
 * Procesa una sesión individual
 * @param {Object} session - Datos de la sesión
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con la sesión procesada y el resultado
 */
async function processSingleSession(session, org) {
  const sessionWithOrg = {
    ...session,
    // eslint-disable-next-line camelcase -- Campo requerido por la estructura de datos
    source_organization: {
      party_id: org.party_id,
      country_code: org.country_code,
      url: org.url,
      business_details: org.business_details
    }
  };

  const sessionData = prepareSessionData(session, org);
  const result = await saveSession(sessionData, session.id);
  
  return { sessionWithOrg, result };
}

async function processSessionsFromOrg(sessions, org, allSessions, errors) {
  let savedCount = 0;
  let duplicateCount = 0;

  // Crear promesas para procesar todas las sesiones en paralelo
  const sessionPromises = sessions.map(session => processSingleSession(session, org));

  // Ejecutar todas las promesas y procesar resultados
  const results = await Promise.allSettled(sessionPromises);

  results.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      const { sessionWithOrg, result } = settledResult.value;
      allSessions.push(sessionWithOrg);
      
      if (result.saved) {
        savedCount++;
      } else if (result.duplicate) {
        duplicateCount++;
      }
    } else {
      logger.error(`❌ Error procesando sesión:`, settledResult.reason);
      errors.push(`Error procesando sesión: ${settledResult.reason.message}`);
    }
  });

  return { savedCount, duplicateCount };
}

/**
 * Registra estadísticas de sesiones procesadas
 * @param {number} totalSessions - Total de sesiones obtenidas
 * @param {number} savedCount - Sesiones guardadas
 * @param {number} duplicateCount - Sesiones duplicadas
 * @param {number} errorCount - Número de errores
 */
function logSessionStats(totalSessions, savedCount, duplicateCount, errorCount) {
  logger.info(`✅ Total de sesiones obtenidas: ${totalSessions}`);
  logger.info(`💾 Sesiones guardadas en BD: ${savedCount}`);
  logger.info(`⚠️ Sesiones duplicadas (saltadas): ${duplicateCount}`);
  if (errorCount > 0) {
    logger.info(`❌ Errores encontrados: ${errorCount}`);
  }
}

/**
 * Construye la respuesta exitosa para obtener sesiones externas
 * @param {Object} params - Parámetros de la respuesta
 * @param {Array} params.allSessions - Todas las sesiones obtenidas
 * @param {number} params.organizationsCount - Número de organizaciones consultadas
 * @param {number} params.savedCount - Número de sesiones guardadas
 * @param {number} params.duplicateCount - Número de sesiones duplicadas
 * @param {Array} params.errors - Array de errores
 * @returns {Object} Respuesta JSON
 */
function buildGetSessionsResponse({ allSessions, organizationsCount, savedCount, duplicateCount, errors }) {
  return {
    status_code: 1000,
    data: allSessions,
    metadata: {
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      total_sessions: allSessions.length,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      organizations_consulted: organizationsCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      sessions_saved: savedCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      sessions_duplicates: duplicateCount,
      errors,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    fetchSessionsFromOrganization,
    processSessionsFromOrg,
    buildGetSessionsResponse,
    logSessionStats
};

