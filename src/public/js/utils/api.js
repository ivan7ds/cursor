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
   * Crea headers para peticiones CPO
   */
  static createCpoHeaders (authToken, contentType = 'application/json') {
    const headers = {
      'Authorization': `Token ${authToken}`,
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

