/**
 * Utilidades para llamadas API
 */
export class ApiUtils {
  /**
   * Detecta si una URL es de ngrok
   */
  static isNgrokUrl (url) {
    return url && (url.includes('ngrok.io') || url.includes('ngrok-free.app') || url.includes('ngrok.app'))
  }

  /**
   * Codifica un token en Base64 si es necesario
   * @param {string} token - Token a codificar
   * @param {boolean} requiresBase64 - Si el token debe codificarse en Base64
   * @returns {string} Token codificado o sin codificar
   */
  static encodeTokenForAuth (token, requiresBase64) {
    if (!token) return token
    if (requiresBase64) {
      // En el navegador, usar btoa para codificar en Base64
      try {
        return btoa(unescape(encodeURIComponent(token)))
      } catch (e) {
        console.warn('Error codificando token en Base64:', e)
        return token
      }
    }
    return token
  }

  /**
   * Construye el header Authorization con el token codificado si es necesario
   * @param {string} token - Token a usar
   * @param {boolean} requiresBase64 - Si el token debe codificarse en Base64
   * @returns {string} Header Authorization formateado
   */
  static buildAuthorizationHeader (token, requiresBase64) {
    const encodedToken = ApiUtils.encodeTokenForAuth(token, requiresBase64)
    return `Token ${encodedToken}`
  }

  /**
   * Crea headers para peticiones CPO
   * @param {string} authToken - Token de autenticación
   * @param {string} contentType - Tipo de contenido (default: 'application/json')
   * @param {boolean} tokenBase64Encoded - Si el token debe codificarse en Base64 (default: false)
   */
  static createCpoHeaders (authToken, contentType = 'application/json', tokenBase64Encoded = false) {
    const headers = {
      'Authorization': ApiUtils.buildAuthorizationHeader(authToken, tokenBase64Encoded),
      'Content-Type': contentType
    }
    return headers
  }

  /**
   * Obtiene el token de autenticación
   */
  static getAuthToken () {
    return localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'
  }

  /**
   * Realiza una petición fetch con autenticación
   */
  static async fetchWithAuth (url, options = {}) {
    const headers = {
      ...ApiUtils.createCpoHeaders(ApiUtils.getAuthToken()),
      ...(options.headers || {})
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  }
}

