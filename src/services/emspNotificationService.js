const { notifyConnectorUpdated } = require('./emspNotificationService/connectorNotificationHelpers');
const { notifyEVSEChange } = require('./emspNotificationService/evseNotificationHelpers');
const { notifyLocationChange } = require('./emspNotificationService/locationNotificationHelpers');
const { notifyTariffCreated, notifyTariffDeleted } = require('./emspNotificationService/tariffNotificationHelpers');
const { notifyTokenCreated } = require('./emspNotificationService/tokenNotificationHelpers');

class EMSPNotificationService {
    /**
     * Notificar a todos los EMSPs sobre una nueva location
     * @param {Object} locationData - Datos de la location creada
     */
    async notifyLocationCreated(locationData) {
        return notifyLocationChange(locationData, 'created');
    }

    /**
     * Notificar a todas las organizaciones sobre una location actualizada
     * @param {Object} locationData - Datos de la location actualizada
     */
    async notifyLocationUpdated(locationData) {
        return notifyLocationChange(locationData, 'updated');
    }

    /**
     * Notificar a todas las organizaciones sobre un nuevo EVSE
     * @param {Object} evseData - Datos del EVSE creado
     */
    async notifyEVSECreated(evseData) {
        return notifyEVSEChange(evseData, 'created');
    }

    /**
     * Notificar a todas las organizaciones sobre un EVSE actualizado
     * @param {Object} evseData - Datos del EVSE actualizado
     */
    async notifyEVSEUpdated(evseData) {
        return notifyEVSEChange(evseData, 'updated');
    }

    /**
     * Notificar a todas las organizaciones sobre un conector actualizado
     * @param {Object} evseData - Datos del EVSE
     * @param {Object} connectorData - Datos del conector actualizado
     */
    async notifyConnectorUpdated(evseData, connectorData) {
        return notifyConnectorUpdated(evseData, connectorData);
    }

    /**
     * Notificar a todas las organizaciones sobre una nueva tarifa
     * @param {Object} tariffData - Datos de la tarifa creada
     */
    async notifyTariffCreated(tariffData) {
        return notifyTariffCreated(tariffData);
    }

    /**
     * Notifica a todas las organizaciones EMSP configuradas sobre la eliminación de una tarifa
     * @param {Object} tariffData - Datos de la tarifa eliminada
     */
    async notifyTariffDeleted(tariffData) {
        return notifyTariffDeleted(tariffData);
    }

    /**
     * Notifica a todas las organizaciones EMSP configuradas sobre un nuevo token
     * @param {Object} tokenData - Datos del token
     */
    async notifyTokenCreated(tokenData) {
        return notifyTokenCreated(tokenData);
    }
}

module.exports = new EMSPNotificationService();
