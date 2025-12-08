/**
 * OCPI 2.2 Token Enums
 */

// Token Type enum
const TOKEN_TYPES = ['AD_HOC_USER', 'APP_USER', 'OTHER', 'RFID'];

// Whitelist Type enum
const WHITELIST_TYPES = ['ALWAYS', 'ALLOWED', 'ALLOWED_OFFLINE', 'NEVER'];

// Profile Type enum
const PROFILE_TYPES = ['CHEAP', 'FAST', 'GREEN', 'REGULAR'];

module.exports = {
    TOKEN_TYPES,
    WHITELIST_TYPES,
    PROFILE_TYPES
};

