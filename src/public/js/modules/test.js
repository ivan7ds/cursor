/**
 * Módulo para la Pestaña Test/Monitoring
 * Extraído de app.js (líneas 8120-8547)
 */

import { ApiUtils } from '../utils/api.js'

export class TestModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
    this.testRefreshInterval = null
  }

  // ===== MÉTODOS PARA LA PESTAÑA TEST =====

  /**
   * Configura los event listeners para la pestaña Test
   */
  setupTestEventListeners () {
    try {
      console.log('🔧 Configurando event listeners para pestaña Test...')

      // Botón de actualizar estado
      const refreshTestStatus = document.getElementById('refreshTestStatus')
      if (refreshTestStatus) {
        refreshTestStatus.addEventListener('click', () => {
          console.log('🔄 Botón refreshTestStatus clickeado')
          this.loadTestData()
        })
        console.log('✅ Event listener para refreshTestStatus agregado')
      } else {
        console.warn('⚠️ Elemento refreshTestStatus no encontrado')
      }

      // Botón de limpiar errores
      const clearTestErrors = document.getElementById('clearTestErrors')
      if (clearTestErrors) {
        clearTestErrors.addEventListener('click', () => {
          console.log('🗑️ Botón clearTestErrors clickeado')
          this.clearTestErrors()
        })
        console.log('✅ Event listener para clearTestErrors agregado')
      } else {
        console.warn('⚠️ Elemento clearTestErrors no encontrado')
      }

      // Botón de toggle del log de errores
      const toggleErrorLog = document.getElementById('toggleErrorLog')
      if (toggleErrorLog) {
        toggleErrorLog.addEventListener('click', () => {
          console.log('👁️ Botón toggleErrorLog clickeado')
          this.toggleErrorLog()
        })
        console.log('✅ Event listener para toggleErrorLog agregado')
      } else {
        console.warn('⚠️ Elemento toggleErrorLog no encontrado')
      }

      // Botón de limpiar log de errores
      const clearErrorLog = document.getElementById('clearErrorLog')
      if (clearErrorLog) {
        clearErrorLog.addEventListener('click', () => {
          console.log('🗑️ Botón clearErrorLog clickeado')
          this.clearErrorLog()
        })
        console.log('✅ Event listener para clearErrorLog agregado')
      } else {
        console.warn('⚠️ Elemento clearErrorLog no encontrado')
      }

      // Configurar actualización automática cada 30 segundos
      this.setupTestAutoRefresh()

      console.log('✅ Event listeners para pestaña Test configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners para pestaña Test:', error)
    }
  }

  /**
   * Configura la actualización automática de la pestaña Test
   */
  setupTestAutoRefresh () {
    try {
      // Limpiar intervalo anterior si existe
      if (this.testRefreshInterval) {
        clearInterval(this.testRefreshInterval)
      }

      // Configurar nuevo intervalo de 30 segundos
      this.testRefreshInterval = setInterval(() => {
        // Solo actualizar si la pestaña Test está activa
        const testTab = document.getElementById('test')
        if (testTab && testTab.classList.contains('active')) {
          console.log('🔄 Actualización automática de pestaña Test...')
          this.loadTestData()
        }
      }, 30000) // 30 segundos

      console.log('✅ Actualización automática de pestaña Test configurada (30s)')
    } catch (error) {
      console.error('❌ Error configurando actualización automática de pestaña Test:', error)
    }
  }

  /**
   * Carga los datos para la pestaña Test
   */
  async loadTestData () {
    try {
      console.log('📊 Cargando datos para pestaña Test...')

      // Actualizar estado de los servicios
      await this.updateServiceStatus()

      // Cargar estadísticas de pruebas
      this.loadTestStatistics()

      // Cargar log de errores
      await this.loadErrorLog()

      console.log('✅ Datos de pestaña Test cargados')
    } catch (error) {
      console.error('❌ Error cargando datos para pestaña Test:', error)
    }
  }

  /**
   * Actualiza el estado de los servicios
   */
  async updateServiceStatus () {
    try {
      console.log('📊 Obteniendo estado de servicios desde el backend...')

      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/api/test-monitoring/status`)

      if (result.success) {
        const { services, testStatistics } = result.data

        // Actualizar estado de EVSE Notification Service
        const evseStatus = document.getElementById('evse-service-status')
        const evseLastRun = document.getElementById('evse-last-run')
        const evseErrorCount = document.getElementById('evse-error-count')

        if (evseStatus) {
          evseStatus.textContent = services.evseNotificationService.status === 'active' ? 'Activo' : 'Inactivo'
          evseStatus.className = services.evseNotificationService.status === 'active' ? 'badge bg-success' : 'badge bg-danger'
        }

        if (evseLastRun) {
          evseLastRun.textContent = services.evseNotificationService.lastRun
            ? new Date(services.evseNotificationService.lastRun).toLocaleString()
            : '-'
        }

        if (evseErrorCount) {
          evseErrorCount.textContent = services.evseNotificationService.errorCount
        }

        // Actualizar estado de Charging Notification Service
        const chargingStatus = document.getElementById('charging-service-status')
        const chargingLastRun = document.getElementById('charging-last-run')
        const chargingErrorCount = document.getElementById('charging-error-count')

        if (chargingStatus) {
          chargingStatus.textContent = services.chargingNotificationService.status === 'active' ? 'Activo' : 'Inactivo'
          chargingStatus.className = services.chargingNotificationService.status === 'active' ? 'badge bg-success' : 'badge bg-danger'
        }

        if (chargingLastRun) {
          chargingLastRun.textContent = services.chargingNotificationService.lastRun
            ? new Date(services.chargingNotificationService.lastRun).toLocaleString()
            : '-'
        }

        if (chargingErrorCount) {
          chargingErrorCount.textContent = services.chargingNotificationService.errorCount
        }

        // Actualizar estadísticas de pruebas
        this.updateTestStatistics(testStatistics)

        console.log('✅ Estado de servicios actualizado desde el backend')
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('❌ Error obteniendo estado de servicios:', error)

      // Fallback a valores por defecto
      const evseStatus = document.getElementById('evse-service-status')
      const chargingStatus = document.getElementById('charging-service-status')

      if (evseStatus) {
        evseStatus.textContent = 'Error'
        evseStatus.className = 'badge bg-warning'
      }

      if (chargingStatus) {
        chargingStatus.textContent = 'Error'
        chargingStatus.className = 'badge bg-warning'
      }
    }
  }

  /**
   * Carga las estadísticas de pruebas
   */
  loadTestStatistics () {
    try {
      // Esta función ahora se llama desde updateServiceStatus
      // que obtiene las estadísticas del backend
      console.log('📊 Estadísticas de pruebas se cargan desde updateServiceStatus')
    } catch (error) {
      console.error('❌ Error cargando estadísticas de pruebas:', error)
    }
  }

  /**
   * Actualiza las estadísticas de pruebas en la UI
   */
  updateTestStatistics (testStatistics) {
    try {
      const totalTests = document.getElementById('total-tests')
      const passedTests = document.getElementById('passed-tests')
      const failedTests = document.getElementById('failed-tests')
      const runningTests = document.getElementById('running-tests')

      if (totalTests) totalTests.textContent = testStatistics.totalTests || 0
      if (passedTests) passedTests.textContent = testStatistics.passedTests || 0
      if (failedTests) failedTests.textContent = testStatistics.failedTests || 0
      if (runningTests) runningTests.textContent = testStatistics.runningTests || 0
    } catch (error) {
      console.error('❌ Error actualizando estadísticas de pruebas:', error)
    }
  }

  /**
   * Carga el log de errores
   */
  async loadErrorLog () {
    try {
      console.log('📋 Obteniendo errores desde el backend...')

      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/api/test-monitoring/errors`)

      if (result.success) {
        const errorLog = document.getElementById('errorLog')
        if (errorLog) {
          if (result.data.errors.length === 0) {
            errorLog.innerHTML = '<div class="text-muted">No hay errores registrados</div>'
          } else {
            errorLog.innerHTML = ''
            result.data.errors.forEach(error => {
              const errorEntry = document.createElement('div')
              errorEntry.className = 'mb-2 p-2 border-start border-danger border-3'
              errorEntry.innerHTML = `
                                <div class="text-danger fw-bold">[${new Date(error.timestamp).toLocaleString()}] ${error.service}</div>
                                <div class="text-light">${error.message}</div>
                            `
              errorLog.appendChild(errorEntry)
            })
          }
        }

        console.log(`✅ ${result.data.errors.length} errores cargados desde el backend`)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('❌ Error obteniendo log de errores:', error)

      // Fallback a mensaje de error
      const errorLog = document.getElementById('errorLog')
      if (errorLog) {
        errorLog.innerHTML = '<div class="text-warning">Error cargando errores del servidor</div>'
      }
    }
  }

  /**
   * Limpia los errores de la pestaña Test
   */
  async clearTestErrors () {
    try {
      console.log('🧹 Limpiando errores de la pestaña Test...')

      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/api/test-monitoring/errors`, {
        method: 'DELETE'
      })

      if (result.success) {
        // Limpiar contadores de errores en la UI
        const evseErrorCount = document.getElementById('evse-error-count')
        const chargingErrorCount = document.getElementById('charging-error-count')

        if (evseErrorCount) {
          evseErrorCount.textContent = '0'
        }

        if (chargingErrorCount) {
          chargingErrorCount.textContent = '0'
        }

        // Limpiar log de errores
        this.clearErrorLog()

        // Ocultar badge de error
        this.hideErrorBadge()

        this.app.ui.showNotification('Errores limpiados exitosamente', 'success')

        console.log('✅ Errores limpiados desde el backend')
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('❌ Error limpiando errores de la pestaña Test:', error)
      this.app.ui.showNotification('Error limpiando errores: ' + error.message, 'error')
    }
  }

  /**
   * Alterna la visibilidad del log de errores
   */
  toggleErrorLog () {
    try {
      const errorLogContainer = document.getElementById('errorLogContainer')
      const toggleErrorLogText = document.getElementById('toggleErrorLogText')

      if (errorLogContainer && toggleErrorLogText) {
        if (errorLogContainer.style.display === 'none') {
          errorLogContainer.style.display = 'block'
          toggleErrorLogText.textContent = 'Ocultar'
        } else {
          errorLogContainer.style.display = 'none'
          toggleErrorLogText.textContent = 'Mostrar'
        }
      }
    } catch (error) {
      console.error('❌ Error alternando visibilidad del log de errores:', error)
    }
  }

  /**
   * Limpia el log de errores
   */
  clearErrorLog () {
    try {
      const errorLog = document.getElementById('errorLog')
      if (errorLog) {
        errorLog.innerHTML = '<div class="text-muted">No hay errores registrados</div>'
      }
    } catch (error) {
      console.error('❌ Error limpiando log de errores:', error)
    }
  }

  /**
   * Muestra el badge de error en la pestaña Test
   */
  showErrorBadge () {
    try {
      const errorBadge = document.getElementById('test-error-badge')
      if (errorBadge) {
        errorBadge.style.display = 'inline'
      }
    } catch (error) {
      console.error('❌ Error mostrando badge de error:', error)
    }
  }

  /**
   * Oculta el badge de error en la pestaña Test
   */
  hideErrorBadge () {
    try {
      const errorBadge = document.getElementById('test-error-badge')
      if (errorBadge) {
        errorBadge.style.display = 'none'
      }
    } catch (error) {
      console.error('❌ Error ocultando badge de error:', error)
    }
  }

  /**
   * Agrega un error al log de errores
   */
  addErrorToLog (service, message, timestamp = null) {
    try {
      const errorLog = document.getElementById('errorLog')
      if (errorLog) {
        const time = timestamp || new Date().toLocaleString()
        const errorEntry = document.createElement('div')
        errorEntry.className = 'mb-2 p-2 border-start border-danger border-3'
        errorEntry.innerHTML = `
                    <div class="text-danger fw-bold">[${time}] ${service}</div>
                    <div class="text-light">${message}</div>
                `

        // Si es el primer error, limpiar el mensaje de "no hay errores"
        if (errorLog.querySelector('.text-muted')) {
          errorLog.innerHTML = ''
        }

        errorLog.insertBefore(errorEntry, errorLog.firstChild)

        // Limitar a 50 errores
        const errors = errorLog.querySelectorAll('.mb-2')
        if (errors.length > 50) {
          errors[errors.length - 1].remove()
        }
      }

      // Mostrar badge de error
      this.showErrorBadge()
    } catch (error) {
      console.error('❌ Error agregando error al log:', error)
    }
  }
}

