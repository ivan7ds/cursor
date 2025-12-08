/**
 * Funciones de Borrado de EVSEs
 * Extraído de app.js (líneas 6452-6640)
 */

import { ApiUtils } from '../utils/api.js'

export class EVSEDeleteModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES DE BORRADO DE EVSEs =====

  async getEvsesCountForLocation (locationId) {
    try {
      console.log(`🔍 Contando EVSEs para location: ${locationId}`)

      const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?location_id=${locationId}&limit=1`, {
        headers: {
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const evsesCount = data.pagination?.total || 0

      console.log(`📊 Location ${locationId} tiene ${evsesCount} EVSE(s) asociado(s)`)
      return evsesCount
    } catch (error) {
      console.error(`❌ Error contando EVSEs para location ${locationId}:`, error)
      throw error
    }
  }

  async deleteEvsesForLocation (locationId) {
    try {
      console.log(`🗑️ Eliminando EVSEs para location: ${locationId}`)

      // Obtener todos los EVSEs de esta location
      const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?location_id=${locationId}&limit=1000`, {
        headers: {
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const evses = data.data || []

      if (evses.length === 0) {
        console.log(`📭 No hay EVSEs para eliminar en location ${locationId}`)
        return
      }

      console.log(`🗑️ Eliminando ${evses.length} EVSE(s) de location ${locationId}`)

      // Eliminar cada EVSE uno por uno
      const deletePromises = evses.map(async (evse) => {
        try {
          const deleteResponse = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evse.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Token ${ApiUtils.getAuthToken()}`
            }
          })

          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text()
            throw new Error(`HTTP ${deleteResponse.status}: ${errorText}`)
          }

          console.log(`✅ EVSE ${evse.id} eliminado exitosamente`)
          return true
        } catch (error) {
          console.error(`❌ Error eliminando EVSE ${evse.id}:`, error)
          throw error
        }
      })

      // Esperar a que se completen todas las eliminaciones
      await Promise.all(deletePromises)

      console.log(`✅ Todos los EVSEs de location ${locationId} eliminados exitosamente`)
    } catch (error) {
      console.error(`❌ Error eliminando EVSEs para location ${locationId}:`, error)
      throw error
    }
  }

  setupEvseDeleteEventListeners () {
    try {
      console.log('🗑️ Configurando event listeners para borrado de EVSEs...')

      document.addEventListener('click', (event) => {
        if (event.target.closest('.delete-evse-btn')) {
          const button = event.target.closest('.delete-evse-btn')
          const evseId = button.getAttribute('data-evse-id')
          const evseName = button.getAttribute('data-evse-name')
          this.confirmDeleteEvse(evseId, evseName)
        }
      })

      console.log('✅ Event listeners para borrado de EVSEs configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners para borrado de EVSEs:', error)
    }
  }

  setupEvseEditEventListeners () {
    try {
      console.log('✏️ Configurando event listeners para edición de EVSEs...')

      document.addEventListener('click', (event) => {
        if (event.target.closest('.edit-evse-btn')) {
          const button = event.target.closest('.edit-evse-btn')
          const evseId = button.getAttribute('data-evse-id')
          
          // Delegar al módulo de edición si existe
          if (this.app.evseEditModule && this.app.evseEditModule.openEditEvseModal) {
            this.app.evseEditModule.openEditEvseModal(evseId)
          } else if (this.app.openEditEvseModal) {
            // Fallback a método directo en app si existe
            this.app.openEditEvseModal(evseId)
          } else {
            console.error('❌ openEditEvseModal no está disponible en evseEditModule ni en app')
            this.app.showNotification('Error: Funcionalidad de edición no disponible', 'error')
          }
        }
      })

      console.log('✅ Event listeners para edición de EVSEs configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners para edición de EVSEs:', error)
    }
  }

  confirmDeleteEvse (evseId, evseName) {
    try {
      console.log(`🗑️ Confirmando borrado de EVSE: ${evseId} (${evseName})`)

      const confirmed = confirm(`¿Estás seguro de que quieres eliminar el EVSE "${evseName}"?\n\nEsta acción marcará el EVSE como eliminado (soft delete) y no se mostrará en la lista, pero los datos permanecerán en la base de datos.\n\nID: ${evseId}`)

      if (confirmed) {
        this.deleteEvse(evseId, evseName)
      } else {
        console.log('❌ Borrado de EVSE cancelado por el usuario')
      }
    } catch (error) {
      console.error('❌ Error confirmando borrado de EVSE:', error)
    }
  }

  async deleteEvse (evseId, evseName) {
    try {
      console.log(`🗑️ Eliminando EVSE: ${evseId} (${evseName})`)

      const button = document.querySelector(`[data-evse-id="${evseId}"] .delete-evse-btn`)
      if (button) {
        // Cambiar estado del botón
        const originalContent = button.innerHTML
        button.innerHTML = '<i class="bi bi-hourglass-split"></i>'
        button.disabled = true

        // Enviar petición DELETE
        const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${ApiUtils.getAuthToken()}`
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        // Mostrar notificación de éxito
        this.app.showNotification(`EVSE "${evseName}" eliminado exitosamente`, 'success')

        // Recargar lista de EVSEs (si existe el método)
        if (this.app.loadEvses) {
          this.app.loadEvses()
        }

        console.log(`✅ EVSE ${evseId} eliminado exitosamente`)
      } else {
        throw new Error('Botón de borrado no encontrado')
      }
    } catch (error) {
      console.error(`❌ Error eliminando EVSE ${evseId}:`, error)
      this.app.showNotification(`Error al eliminar EVSE: ${error.message}`, 'error')

      // Restaurar botón en caso de error
      const button = document.querySelector(`[data-evse-id="${evseId}"] .delete-evse-btn`)
      if (button) {
        button.innerHTML = '<i class="bi bi-trash"></i>'
        button.disabled = false
      }
    }
  }
}
