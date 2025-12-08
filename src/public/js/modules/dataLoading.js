/**
 * Carga de Datos
 * Extraído de app.js (líneas 2255-2373)
 */

import { ApiUtils } from '../utils/api.js'

export class DataLoadingModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== CARGA DE DATOS =====
  async loadLocations () {
    try {
      console.log('🔄 Cargando locations...')

      // Cargar todas las locations haciendo múltiples peticiones
      this.app.allLocations = []
      let offset = 0
      const limit = 1000
      let hasMore = true

      while (hasMore) {
        const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations?offset=${offset}&limit=${limit}`, {
          headers: {
            'Authorization': `Token ${ApiUtils.getAuthToken()}`
          }
        })

        console.log(`📡 Response status (offset ${offset}):`, response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Response error:', errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        const locations = data.data || []

        this.app.allLocations = this.app.allLocations.concat(locations)

        console.log(`📊 Cargadas ${locations.length} locations (total: ${this.app.allLocations.length})`)

        // Verificar si hay más datos
        hasMore = locations.length === limit
        offset += limit
      }

      // Configurar paginado
      this.app.currentLocationsPage = 1
      this.app.locationsPerPage = 50

      // Renderizar página (si existe el método)
      if (this.app.locationsPaginationModule && this.app.locationsPaginationModule.renderLocationsPage) {
        this.app.locationsPaginationModule.renderLocationsPage()
      } else if (this.app.renderLocationsPage) {
        this.app.renderLocationsPage()
      }
      if (this.app.ui && this.app.ui.updateCount) {
        this.app.ui.updateCount('locationsCount', this.app.allLocations.length)
      } else if (this.app.updateCount) {
        this.app.updateCount('locationsCount', this.app.allLocations.length)
      }

      console.log(`✅ ${this.app.allLocations.length} locations cargadas exitosamente`)
    } catch (error) {
      console.error('❌ Error cargando locations:', error)
      if (this.app.ui && this.app.ui.showTableError) {
        this.app.ui.showTableError('locationsTableBody', `Error al cargar locations: ${error.message}`)
      } else if (this.app.showTableError) {
        this.app.showTableError('locationsTableBody', `Error al cargar locations: ${error.message}`)
      }
    }
  }

  renderLocations (locations) {
    const tbody = document.getElementById('locationsTableBody')
    if (!tbody) {
      console.warn('⚠️ Elemento locationsTableBody no encontrado')
      return
    }

    if (locations.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay locations disponibles
                    </td>
                </tr>
            `
      return
    }

    tbody.innerHTML = locations.map(location => `
            <tr class="fade-in" data-location-id="${location.id}">
                <td><code>${location.id}</code></td>
                <td>
                    <span class="location-name-tooltip" 
                          data-location-id="${location.id}"
                          data-tooltip-type="location">
                        ${location.name || 'N/A'}
                    </span>
                </td>
                <td>${location.country || 'N/A'}</td>
                <td>${location.city || 'N/A'}</td>
                <td>${location.address || 'N/A'}</td>
                <td>
                    <span class="badge bg-secondary cursor-pointer location-evses-tooltip" 
                          data-location-id="${location.id}"
                          data-tooltip-type="location-evses">
                        ${location.evses?.length || 0}
                    </span>
                </td>
                <td>${new Date(location.last_updated).toLocaleString()}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary btn-sm edit-location-btn me-1" 
                                data-location-id="${location.id}" 
                                data-location-name="${location.name || 'N/A'}"
                                title="Editar location">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm delete-location-btn" 
                                data-location-id="${location.id}" 
                                data-location-name="${location.name || 'N/A'}"
                                title="Eliminar location">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('')

    console.log(`✅ ${locations.length} locations renderizadas`)

    // Inicializar tooltips de Bootstrap para locations (si existe el método)
    if (this.app.initializeLocationTooltips) {
      this.app.initializeLocationTooltips()
    }
  }
}
