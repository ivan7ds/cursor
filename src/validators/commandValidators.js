const {
  cancelReservationSchema,
  validateCancelReservation,
  validateCancelReservationMiddleware
} = require('./commandValidators/cancelReservation');
const {
  reserveNowSchema,
  validateReserveNow,
  validateReserveNowMiddleware
} = require('./commandValidators/reserveNow');
const {
  startSessionSchema,
  validateStartSession,
  validateStartSessionMiddleware
} = require('./commandValidators/startSession');
const {
  stopSessionSchema,
  validateStopSession,
  validateStopSessionMiddleware
} = require('./commandValidators/stopSession');
const {
  unlockConnectorSchema,
  validateUnlockConnector,
  validateUnlockConnectorMiddleware
} = require('./commandValidators/unlockConnector');

module.exports = {
  startSessionSchema,
  stopSessionSchema,
  reserveNowSchema,
  cancelReservationSchema,
  unlockConnectorSchema,
  validateStartSession,
  validateStartSessionMiddleware,
  validateStopSession,
  validateStopSessionMiddleware,
  validateReserveNow,
  validateReserveNowMiddleware,
  validateCancelReservation,
  validateCancelReservationMiddleware,
  validateUnlockConnector,
  validateUnlockConnectorMiddleware
};
