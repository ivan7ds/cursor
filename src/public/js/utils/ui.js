/**
 * Utilidades para UI
 */
export class UIUtils {
  /**
   * Muestra una notificación
   */
  static showNotification (message, type = 'info') {
    console.log(`📢 Notificación [${type}]: ${message}`)

    const notification = document.createElement('div')
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show system-notification`
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `

    document.body.appendChild(notification)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 5000)
  }

  /**
   * Muestra un error en una tabla
   */
  static showTableError (tbodyId, message, colspan = 10) {
    const tbody = document.getElementById(tbodyId)
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="${colspan}" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle"></i> ${message}
                    </td>
                </tr>
            `
    }
  }

  /**
   * Actualiza el contador de un elemento
   */
  static updateCount (elementId, count) {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = count
    }
  }

  /**
   * Formatea una fecha
   */
  static formatDate (dateString) {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('es-ES')
    } catch (error) {
      return dateString
    }
  }

  /**
   * Formatea un número con separadores de miles
   */
  static formatNumber (number) {
    if (number === null || number === undefined) return '-'
    return new Intl.NumberFormat('es-ES').format(number)
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  static escapeHtml (text) {
    if (!text) return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Trunca un token a una longitud específica
   */
  static truncateToken (token, length = 20) {
    if (!token) return 'N/A'
    return token.length > length ? token.substring(0, length) + '...' : token
  }
}

