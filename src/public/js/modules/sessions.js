/**
 * Módulo para Sesiones de Carga
 * Extraído de app.js (líneas 2756-2950)
 */

import { ApiUtils } from '../utils/api.js'

export class SessionsModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== MÉTODOS PARA SESIONES DE CARGA =====

  async loadSessions () {
    try {
      console.log('🔄 Cargando sesiones de carga...')
      console.log('🔗 URL:', `${this.baseUrl}/ocpi/cpo/2.2/sessions`)

      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/sessions`)

      // Almacenar todas las sesiones para filtrado
      this.app.allSessions = Array.isArray(data.data) ? data.data : []
      console.log('💾 Stored sessions:', this.app.allSessions.length)

      // Aplicar filtro y renderizar
      this.filterSessions()

      console.log('✅ Sesiones cargadas exitosamente')
    } catch (error) {
      console.error('❌ Error cargando sesiones:', error)
      this.app.ui.showTableError('sessionsTableBody', `Error al cargar sesiones: ${error.message}`)
    }
  }

  renderSessions (sessions) {
    console.log('🎨 Renderizando sesiones:', sessions.length)
    console.log('🎨 Sessions data:', sessions)

    const tbody = document.getElementById('sessionsTableBody')
    if (!tbody) {
      console.warn('⚠️ Elemento sessionsTableBody no encontrado')
      return
    }

    console.log('✅ Elemento sessionsTableBody encontrado')

    if (sessions.length === 0) {
      console.log('📭 No hay sesiones para mostrar')
      const filterActiveCheckbox = document.getElementById('filterActiveSessions')
      const showOnlyActive = filterActiveCheckbox ? filterActiveCheckbox.checked : false
      const message = showOnlyActive
        ? 'No hay sesiones activas disponibles'
        : 'No hay sesiones de carga disponibles'

      tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted py-4">
                        <i class="bi bi-lightning-charge fs-1 d-block mb-2"></i>
                        ${message}
                        ${showOnlyActive && this.app.allSessions.length > 0
                            ? `<br><small class="text-muted">Total de sesiones: ${this.app.allSessions.length}</small>`
                            : ''
                        }
                    </td>
                </tr>
            `
      return
    }

    tbody.innerHTML = sessions.map(session => `
            <tr class="fade-in">
                <td><code>${this.app.ui.truncateToken(session.id)}</code></td>
                <td><code>${this.app.ui.truncateToken(session.auth_id)}</code></td>
                <td><code>${this.app.ui.truncateToken(session.location_id)}</code></td>
                <td>
                    <span class="badge ${this.getSessionStatusBadgeClass(session.status)}">
                        ${session.status}
                    </span>
                </td>
                <td>${session.start_date_time ? new Date(session.start_date_time).toLocaleString() : 'N/A'}</td>
                <td>${session.end_date_time ? new Date(session.end_date_time).toLocaleString() : 'En curso'}</td>
                <td>${session.kwh ? parseFloat(session.kwh).toFixed(2) : '0.00'}</td>
                <td><code>${session.country_code}*${session.party_id}</code></td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-info btn-sm" onclick="window.dashboardApp.sessionsModule.viewSessionDetails('${session.id}')" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${session.status === 'ACTIVE' ? `
                            <button class="btn btn-outline-danger btn-sm" onclick="window.dashboardApp.sessionsModule.endSession('${session.id}')" title="Finalizar sesión">
                                <i class="bi bi-stop-circle"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('')

    console.log(`✅ ${sessions.length} sesiones renderizadas`)
    console.log('🎨 HTML generado:', tbody.innerHTML.substring(0, 200) + '...')
  }

  getSessionStatusBadgeClass (status) {
    const statusClasses = {
      ACTIVE: 'bg-success',
      COMPLETED: 'bg-primary',
      INVALID: 'bg-danger',
      PENDING: 'bg-warning'
    }
    return statusClasses[status] || 'bg-secondary'
  }

  viewSessionDetails (sessionId) {
    console.log('👁️ Ver detalles de sesión:', sessionId)
    this.app.ui.showNotification(`Ver detalles de sesión: ${sessionId}`, 'info')
  }

  async endSession (sessionId) {
    try {
      console.log('🛑 Finalizando sesión:', sessionId)

      // Confirmar la acción
      if (!confirm('¿Estás seguro de que quieres finalizar esta sesión?')) {
        return
      }

      // Mostrar indicador de carga
      this.app.ui.showNotification('Finalizando sesión...', 'info')

      // Llamar al endpoint para finalizar la sesión
      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/api/sessions/${sessionId}/end`, {
        method: 'POST'
      })

      console.log('✅ Sesión finalizada exitosamente:', result)

      this.app.ui.showNotification('Sesión finalizada exitosamente', 'success')

      // Recargar las sesiones para mostrar los cambios
      await this.loadSessions()
    } catch (error) {
      console.error('❌ Error finalizando sesión:', error)
      this.app.ui.showNotification(`Error finalizando sesión: ${error.message}`, 'error')
    }
  }

  filterSessions () {
    try {
      console.log('🔍 Iniciando filtro de sesiones')
      console.log('🔍 allSessions:', this.app.allSessions)
      console.log('🔍 allSessions length:', this.app.allSessions ? this.app.allSessions.length : 'undefined')

      const filterActiveCheckbox = document.getElementById('filterActiveSessions')
      const showOnlyActive = filterActiveCheckbox ? filterActiveCheckbox.checked : false

      console.log('🔍 Aplicando filtro de sesiones:', showOnlyActive ? 'Solo activas' : 'Todas')
      console.log('🔍 Filter checkbox found:', !!filterActiveCheckbox)
      console.log('🔍 Filter checkbox checked:', showOnlyActive)

      let filteredSessions = this.app.allSessions || []

      if (showOnlyActive) {
        filteredSessions = this.app.allSessions.filter(session =>
          session.status === 'ACTIVE'
        )
        console.log(`📊 Filtradas ${filteredSessions.length} sesiones activas de ${this.app.allSessions.length} totales`)
      } else {
        console.log(`📊 Mostrando todas las ${filteredSessions.length} sesiones`)
      }

      console.log('🔍 Filtered sessions:', filteredSessions)

      this.renderSessions(filteredSessions)
      this.app.ui.updateCount('sessionsCount', filteredSessions.length)
    } catch (error) {
      console.error('❌ Error aplicando filtro de sesiones:', error)
    }
  }

  setupSessionsEventListeners () {
    try {
      console.log('🔧 Configurando event listeners para sesiones...')

      const refreshSessions = document.getElementById('refreshSessions')
      if (refreshSessions) {
        refreshSessions.addEventListener('click', () => {
          console.log('⚡ Botón refreshSessions clickeado')
          this.loadSessions()
        })
        console.log('✅ Event listener para refreshSessions agregado')
      } else {
        console.warn('⚠️ Elemento refreshSessions no encontrado')
      }

      const filterActiveSessions = document.getElementById('filterActiveSessions')
      if (filterActiveSessions) {
        filterActiveSessions.addEventListener('change', () => {
          console.log('🔍 Filtro de sesiones activas cambiado:', filterActiveSessions.checked)
          this.filterSessions()
        })
        console.log('✅ Event listener para filterActiveSessions agregado')
      } else {
        console.warn('⚠️ Elemento filterActiveSessions no encontrado')
      }

      console.log('✅ Event listeners para sesiones configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners para sesiones:', error)
    }
  }
}

