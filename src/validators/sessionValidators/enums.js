/**
 * OCPI 2.2 Session Enums
 */

// TokenType enum (from OCPI 2.2)
const TOKEN_TYPES = ['AD_HOC_USER', 'APP_USER', 'OTHER', 'RFID'];

// AuthMethod enum (10.4.1)
const AUTH_METHODS = ['AUTH_REQUEST', 'COMMAND', 'WHITELIST'];

// SessionStatus enum (9.4.3)
const SESSION_STATUSES = ['ACTIVE', 'COMPLETED', 'INVALID', 'PENDING'];

module.exports = {
    TOKEN_TYPES,
    AUTH_METHODS,
    SESSION_STATUSES
};

