const { Op } = require('sequelize');

const { Credentials, EVSE, Session } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Obtiene los eMSPs conectados
 */
async function getConnectedEMSPs() {
  try {
    const credentials = await Credentials.findAll({
      where: {
        url: {
          [Op.notLike]: '%example.com%'
        },
        valid: true
      }
    });

    // El token del operador se usa tal cual, y se codifica en Base64 si es necesario
    // cuando se construye el header Authorization usando buildAuthorizationHeader()
    // Según OCPI 2.2: cuando hacemos peticiones al operador, usamos el token que ellos nos dieron
    return credentials.map(cred => ({
      party_id: cred.party_id,
      country_code: cred.country_code,
      url: cred.url,
      token: cred.token,
      token_base64_encoded: cred.token_base64_encoded || false
    }));
  } catch (error) {
    logger.error('Error getting connected eMSPs:', error);
    return [];
  }
}

/**
 * Obtiene los IDs de EVSEs que tienen sesiones activas
 */
async function getEVSEsWithActiveSessions() {
  try {
    const activeSessions = await Session.findAll({
      where: {
        status: 'ACTIVE'
      },
      attributes: ['evse_uid']
    });

    return activeSessions.map(session => session.evse_uid);
  } catch (error) {
    logger.error('Error getting EVSEs with active sessions:', error);
    return [];
  }
}

/**
 * Obtiene los cambios de estado de EVSEs
 */
async function getEVSEStatusChanges() {
  try {
    const evseUidsWithSessions = await getEVSEsWithActiveSessions();

    const availableEvses = await EVSE.findAll({
      where: {
        deleted_at: null,
        id: {
          [Op.notIn]: evseUidsWithSessions
        }
      }
    });

    if (availableEvses.length === 0) {
      logger.debug('No available EVSEs found for status changes');
      return [];
    }

    const randomIndex = Math.floor(Math.random() * availableEvses.length);
    const selectedEvse = availableEvses[randomIndex];

    const operationalStatuses = ['AVAILABLE', 'BLOCKED', 'CHARGING', 'INOPERATIVE', 'OUTOFORDER', 'PLANNED', 'RESERVED', 'UNKNOWN'];
    const currentStatus = selectedEvse.status;

    let newStatus;
    do {
      newStatus = operationalStatuses[Math.floor(Math.random() * operationalStatuses.length)];
    } while (newStatus === currentStatus);

    logger.info(`Selected EVSE ${selectedEvse.evse_id} (UID: ${selectedEvse.id}) for status change: ${currentStatus} -> ${newStatus}`);

    return [{
      evse_uid: selectedEvse.id,
      evse_id: selectedEvse.evse_id,
      location_id: selectedEvse.location_id,
      status: newStatus,
      last_updated: new Date()
    }];
  } catch (error) {
    logger.error('Error getting EVSE status changes:', error);
    return [];
  }
}

module.exports = {
    getConnectedEMSPs,
    getEVSEStatusChanges,
    getEVSEsWithActiveSessions
};

