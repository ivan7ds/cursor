/**
 * Funciones de Edición de Locations
 * Extraído de app.js (líneas 7420-7772)
 */

import { ApiUtils } from '../utils/api.js'

export class LocationEditModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES DE EDICIÓN DE LOCATIONS =====

  setupLocationEditEventListeners () {
    try {
      console.log('✏️ Configurando event listeners para edición de locations...')

      document.addEventListener('click', (event) => {
        if (event.target.closest('.edit-location-btn')) {
          const button = event.target.closest('.edit-location-btn')
          const locationId = button.getAttribute('data-location-id')
          const locationName = button.getAttribute('data-location-name')
          this.showEditLocationModal(locationId, locationName)
        }
      })

      console.log('✅ Event listeners para edición de locations configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners para edición de locations:', error)
    }
  }

  async showEditLocationModal (locationId, locationName) {
    try {
      console.log(`✏️ Mostrando modal de edición para location: ${locationId} (${locationName})`)

      // Cargar datos de la location
      await this.loadLocationData(locationId)

      // Mostrar modal
      const modal = document.getElementById('editLocationModal')
      if (modal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const bootstrapModal = new bootstrap.Modal(modal)
          bootstrapModal.show()
        } else {
          // Fallback manual
          modal.classList.add('show')
          modal.style.display = 'block'
          modal.setAttribute('aria-hidden', 'false')
          document.body.classList.add('modal-open')

          // Agregar backdrop
          const backdrop = document.createElement('div')
          backdrop.className = 'modal-backdrop fade show'
          document.body.appendChild(backdrop)
        }
        console.log('✅ Modal de edición de location mostrado')
      } else {
        throw new Error('Modal de edición de location no encontrado')
      }
    } catch (error) {
      console.error('❌ Error mostrando modal de edición de location:', error)
      this.app.showNotification(`Error al mostrar modal de edición: ${error.message}`, 'error')
    }
  }

  async loadLocationData (locationId) {
    try {
      console.log(`📡 Cargando datos de location: ${locationId}`)

      const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations/${locationId}`, {
        headers: {
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const location = data.data

      console.log('📊 Datos de location cargados:', location)

      // Llenar formulario con datos existentes
      this.populateEditLocationForm(location)
    } catch (error) {
      console.error(`❌ Error cargando datos de location ${locationId}:`, error)
      throw error
    }
  }

  populateEditLocationForm (location) {
    try {
      console.log('📝 Llenando formulario de edición con datos de location')

      // Campos básicos
      document.getElementById('editLocationId').value = location.id || ''
      document.getElementById('editLocationName').value = location.name || ''
      document.getElementById('editLocationCountry').value = location.country || 'ESP'
      document.getElementById('editLocationCity').value = location.city || ''
      document.getElementById('editLocationAddress').value = location.address || ''
      document.getElementById('editLocationPostalCode').value = location.postal_code || ''

      // Coordenadas
      if (location.coordinates) {
        document.getElementById('editLocationLatitude').value = location.coordinates.latitude || ''
        document.getElementById('editLocationLongitude').value = location.coordinates.longitude || ''
      }

      // Campos adicionales
      document.getElementById('editLocationParkingType').value = location.parking_type || ''
      document.getElementById('editLocationTimeZone').value = location.time_zone || 'Europe/Madrid'
      document.getElementById('editLocationPhone').value = location.phone || ''
      document.getElementById('editLocationEmail').value = location.email || ''
      document.getElementById('editLocationWebsite').value = location.website || ''
      document.getElementById('editLocationOperator').value = location.operator || ''

      // Checkboxes
      document.getElementById('editLocationOpen24h').checked = location.open_24_7 === true
      document.getElementById('editLocationAccessPublic').checked = location.access_public !== false

      console.log('✅ Formulario de edición llenado correctamente')
    } catch (error) {
      console.error('❌ Error llenando formulario de edición:', error)
    }
  }

  setupEditLocationModalEventListeners () {
    try {
      console.log('🔧 Configurando event listeners del modal de edición de location...')

      // Botón de actualizar
      const updateLocationBtn = document.getElementById('updateLocationBtn')
      if (updateLocationBtn) {
        updateLocationBtn.addEventListener('click', () => {
          this.updateLocation()
        })
        console.log('✅ Event listener para updateLocationBtn agregado')
      }

      // Configurar event listeners de cierre
      this.setupEditLocationModalCloseEventListeners()

      console.log('✅ Event listeners del modal de edición de location configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners del modal de edición de location:', error)
    }
  }

  setupEditLocationModalCloseEventListeners () {
    try {
      // Botón de cerrar (X)
      const closeBtn = document.querySelector('#editLocationModal .btn-close')
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeEditLocationModal()
        })
      }

      // Botón Cancelar
      const cancelBtn = document.querySelector('#editLocationModal .btn-secondary')
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.closeEditLocationModal()
        })
      }

      // Cerrar al hacer clic en el backdrop
      const modalElement = document.getElementById('editLocationModal')
      if (modalElement) {
        modalElement.addEventListener('click', (event) => {
          if (event.target === modalElement) {
            this.closeEditLocationModal()
          }
        })
      }

      // Cerrar con tecla Escape
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalElement && modalElement.classList.contains('show')) {
          this.closeEditLocationModal()
        }
      })

      console.log('✅ Event listeners de cierre del modal de edición configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners de cierre del modal de edición:', error)
    }
  }

  closeEditLocationModal () {
    try {
      const modal = document.getElementById('editLocationModal')
      if (modal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const bootstrapModal = bootstrap.Modal.getInstance(modal)
          if (bootstrapModal) {
            bootstrapModal.hide()
          } else {
            modal.classList.remove('show')
            modal.style.display = 'none'
          }
        } else {
          // Fallback manual
          modal.classList.remove('show')
          modal.style.display = 'none'
          modal.setAttribute('aria-hidden', 'true')
          document.body.classList.remove('modal-open')

          // Remover backdrop
          const backdrop = document.querySelector('.modal-backdrop')
          if (backdrop) {
            backdrop.remove()
          }
        }
        console.log('✅ Modal de edición de location cerrado')
      }
    } catch (error) {
      console.error('❌ Error cerrando modal de edición de location:', error)
    }
  }

  async updateLocation () {
        try {
            console.log('🔄 Actualizando location...');
            
            // Validar formulario
            if (!this.validateEditLocationForm()) {
                return;
            }
            
            // Recopilar datos del formulario
            const locationData = this.collectEditLocationFormData();
            
            // Mostrar indicador de carga
            const updateBtn = document.getElementById('updateLocationBtn');
            if (updateBtn) {
                const originalContent = updateBtn.innerHTML;
                updateBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Actualizando...';
                updateBtn.disabled = true;
                
                try {
                    // Enviar petición PUT
                    const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations/${locationData.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${ApiUtils.getAuthToken()}`
                        },
                        body: JSON.stringify(locationData)
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }
                    
                    const result = await response.json();
                    console.log('✅ Location actualizada exitosamente:', result);
                    
                    // Mostrar notificación de éxito
                    this.app.showNotification('Location actualizada exitosamente', 'success')
                    
                    // Cerrar modal
                    this.closeEditLocationModal();
                    
                    // Recargar lista de locations (si existe el método)
                    if (this.app.dataLoadingModule) {
                      this.app.dataLoadingModule.loadLocations()
                    } else if (this.app.loadLocations) {
                      this.app.loadLocations()
                    }
                    
                } finally {
                    // Restaurar botón
                    updateBtn.innerHTML = originalContent;
                    updateBtn.disabled = false;
                }
            }
            
    } catch (error) {
      console.error('❌ Error actualizando location:', error)
      this.app.showNotification(`Error al actualizar location: ${error.message}`, 'error')
    }
  }

  validateEditLocationForm () {
    try {
      const requiredFields = [
        'editLocationName',
        'editLocationCountry',
        'editLocationCity',
        'editLocationAddress',
        'editLocationLatitude',
        'editLocationLongitude',
        'editLocationParkingType',
        'editLocationTimeZone'
      ]

      for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId)
        if (!field || !field.value.trim()) {
          this.app.showNotification(`El campo ${fieldId.replace('editLocation', '')} es obligatorio`, 'error')
          return false
        }
      }

      // Validar coordenadas
      const lat = parseFloat(document.getElementById('editLocationLatitude').value)
      const lng = parseFloat(document.getElementById('editLocationLongitude').value)

      if (isNaN(lat) || lat < -90 || lat > 90) {
        this.app.showNotification('La latitud debe estar entre -90 y 90', 'error')
        return false
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        this.app.showNotification('La longitud debe estar entre -180 y 180', 'error')
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Error validando formulario de edición:', error)
      return false
    }
  }

  collectEditLocationFormData () {
    try {
      const locationData = {
        id: document.getElementById('editLocationId').value,
        name: document.getElementById('editLocationName').value,
        country: document.getElementById('editLocationCountry').value,
        city: document.getElementById('editLocationCity').value,
        address: document.getElementById('editLocationAddress').value,
        postal_code: document.getElementById('editLocationPostalCode').value || null,
        coordinates: {
          latitude: parseFloat(document.getElementById('editLocationLatitude').value),
          longitude: parseFloat(document.getElementById('editLocationLongitude').value)
        },
        parking_type: document.getElementById('editLocationParkingType').value,
        time_zone: document.getElementById('editLocationTimeZone').value,
        phone: document.getElementById('editLocationPhone').value || null,
        email: document.getElementById('editLocationEmail').value || null,
        website: document.getElementById('editLocationWebsite').value || null,
        operator: document.getElementById('editLocationOperator').value || null,
        open_24_7: document.getElementById('editLocationOpen24h').checked,
        access_public: document.getElementById('editLocationAccessPublic').checked,
        last_updated: new Date().toISOString()
      }

      console.log('📝 Datos del formulario de edición recopilados:', locationData)
      return locationData
    } catch (error) {
      console.error('❌ Error recopilando datos del formulario de edición:', error)
      throw error
    }
  }
}
