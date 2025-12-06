const { URL } = require('url');

/**
 * Verifica si un hostname está en la lista de hosts bloqueados
 * @param {string} hostname - Hostname a verificar
 * @returns {boolean} - true si está bloqueado
 */
function isBlockedHost(hostname) {
    const blockedHosts = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        '0:0:0:0:0:0:0:1',
        '169.254.169.254', // AWS metadata
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16'
    ];

    for (const blockedHost of blockedHosts) {
        if (hostname === blockedHost || hostname.startsWith(blockedHost)) {
            return true;
        }
    }
    return false;
}

/**
 * Verifica si una IP es privada
 * @param {string} hostname - Hostname a verificar
 * @returns {boolean} - true si es IP privada
 */
function isPrivateIP(hostname) {
    // Patrón para IPs privadas
    const privateIPPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
    return privateIPPattern.test(hostname);
}

/**
 * Valida y sanitiza una URL para prevenir ataques SSRF
 * @param {string} url - URL a validar
 * @returns {string|null} - URL sanitizada o null si es inválida
 */
function validateAndSanitizeUrl(url) {
    try {
        const parsedUrl = new URL(url);

        // Solo permitir HTTPS y HTTP
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
            return null;
        }

        // Verificar si la protección SSRF está habilitada (por defecto: true)
        const ssrfProtectionEnabled = process.env.ENABLE_SSRF_PROTECTION !== 'false';

        if (ssrfProtectionEnabled) {
            const hostname = parsedUrl.hostname.toLowerCase();

            // Verificar hosts bloqueados
            if (isBlockedHost(hostname)) {
                return null;
            }

            // Verificar rangos de IP privadas
            if (isPrivateIP(hostname)) {
                return null;
            }
        }

        // Retornar URL sanitizada
        return parsedUrl.toString();

    } catch (_error) {
        return null;
    }
}

/**
 * Obtiene nuestras credenciales desde variables de entorno
 * @returns {Object} Credenciales del sistema
 */
function getOurCredentials() {
  return {
    party_id: process.env.OCPI_PARTY_ID || 'IPD',
    country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
    token: process.env.OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key',
    url: process.env.OCPI_BASE_URL || 'https://localhost:3000',
    business_details: {
      name: process.env.OCPI_BUSINESS_NAME || 'Test CPO',
      website: process.env.OCPI_BUSINESS_WEBSITE || 'https://test.com'
    }
  };
}

module.exports = {
    validateAndSanitizeUrl,
    getOurCredentials
};

