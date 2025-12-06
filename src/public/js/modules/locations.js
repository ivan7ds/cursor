/**
 * Funciones del Modal de Creación de Locations
 * Extraído de app.js (líneas 5400-5756)
 */

import { ApiUtils } from '../utils/api.js'

export class LocationsModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES DEL MODAL DE CREACIÓN DE LOCATIONS =====

  setupLocationModalEventListeners () {
    try {
      console.log('🔧 Configurando event listeners del modal de locations...')

      // Botón para guardar location
      const saveLocationBtn = document.getElementById('saveLocationBtn')
      if (saveLocationBtn) {
        saveLocationBtn.addEventListener('click', () => {
          this.saveLocation()
        })
        console.log('✅ Event listener para saveLocationBtn agregado')
      }

      // Botón para generar ID automáticamente
      const generateLocationIdBtn = document.getElementById('generateLocationIdBtn')
      if (generateLocationIdBtn) {
        generateLocationIdBtn.addEventListener('click', () => {
          this.generateLocationId()
        })
        console.log('✅ Event listener para generateLocationIdBtn agregado')
      }

      // Event listeners para cerrar el modal
      this.setupLocationModalCloseEventListeners()

      console.log('✅ Event listeners del modal de locations configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners del modal de locations:', error)
    }
  }

  setupLocationModalCloseEventListeners () {
    try {
      // Botón de cerrar (X)
      const closeBtn = document.querySelector('#createLocationModal .btn-close')
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeLocationModal()
        })
      }

      // Botón Cancelar
      const cancelBtn = document.querySelector('#createLocationModal .btn-secondary')
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.closeLocationModal()
        })
      }

      // Cerrar al hacer clic en el backdrop
      const modalElement = document.getElementById('createLocationModal')
      if (modalElement) {
        modalElement.addEventListener('click', (event) => {
          if (event.target === modalElement) {
            this.closeLocationModal()
          }
        })
      }

      // Cerrar con tecla Escape
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalElement && modalElement.classList.contains('show')) {
          this.closeLocationModal()
        }
      })

      console.log('✅ Event listeners de cierre del modal de locations configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners de cierre del modal de locations:', error)
    }
  }

  closeLocationModal () {
    try {
      const modalElement = document.getElementById('createLocationModal')
      if (modalElement) {
        // Intentar usar Bootstrap API si está disponible
        try {
          if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = bootstrap.Modal.getInstance(modalElement)
            if (modal) {
              modal.hide()
              console.log('✅ Modal cerrado usando Bootstrap API')
              return
            }
          }
        } catch (bootstrapError) {
          console.log('⚠️ Bootstrap API no disponible, usando fallback manual')
        }

        // Fallback: cerrar manualmente
        modalElement.classList.remove('show')
        modalElement.style.display = 'none'
        modalElement.setAttribute('aria-hidden', 'true')
        document.body.classList.remove('modal-open')

        // Remover backdrop
        const backdrop = document.querySelector('.modal-backdrop')
        if (backdrop) {
          backdrop.remove()
        }

        // Limpiar formulario
        this.resetLocationForm()

        console.log('✅ Modal de location cerrado manualmente')
      }
    } catch (error) {
      console.error('❌ Error cerrando modal de location:', error)
    }
  }

  resetLocationForm () {
    try {
      const form = document.getElementById('createLocationForm')
      if (form) {
        form.reset()

        // Restablecer valores por defecto
        const accessPublicField = document.getElementById('locationAccessPublic')
        if (accessPublicField) {
          accessPublicField.checked = true
        }

        // Generar nuevo ID único
        this.generateLocationId()

        console.log('✅ Formulario de location reseteado')
      }
    } catch (error) {
      console.error('❌ Error reseteando formulario de location:', error)
    }
  }

  showCreateLocationModal () {
    try {
      console.log('📍 Mostrando modal de creación de location...')

      const modalElement = document.getElementById('createLocationModal')
      if (!modalElement) {
        throw new Error('Elemento modal de location no encontrado')
      }

      // Intentar usar Bootstrap API si está disponible
      try {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const modal = new bootstrap.Modal(modalElement)
          modal.show()
          console.log('✅ Modal mostrado usando Bootstrap API')
        } else {
          throw new Error('Bootstrap API no disponible')
        }
      } catch (bootstrapError) {
        console.log('⚠️ Bootstrap API no disponible, usando fallback manual')

        // Fallback: mostrar el modal manualmente
        modalElement.classList.add('show')
        modalElement.style.display = 'block'
        modalElement.setAttribute('aria-hidden', 'false')
        document.body.classList.add('modal-open')

        // Agregar backdrop
        const backdrop = document.createElement('div')
        backdrop.className = 'modal-backdrop fade show'
        document.body.appendChild(backdrop)

        console.log('✅ Modal mostrado manualmente')
      }

      // Generar ID automáticamente al abrir el modal
      this.generateLocationId()
    } catch (error) {
      console.error('❌ Error mostrando modal de creación de location:', error)
      this.app.showNotification('Error abriendo modal de location: ' + error.message, 'error')
    }
  }

  generateLocationId () {
    try {
      console.log('🆔 Generando ID único para location...')

      // Generar UUID v4 (usar el método del módulo de tariffs si está disponible)
      const uuid = this.generateUUID()

      // Asignar al campo
      const locationIdField = document.getElementById('locationId')
      if (locationIdField) {
        locationIdField.value = uuid
        console.log('✅ ID único generado:', uuid)
      } else {
        console.warn('⚠️ Campo locationId no encontrado')
      }
    } catch (error) {
      console.error('❌ Error generando ID de location:', error)
    }
  }

  generateUUID () {
    try {
      // Implementación de UUID v4
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    } catch (error) {
      console.error('❌ Error generando UUID:', error)
      // Fallback: timestamp + random
      return 'loc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    }
  }

  generateConnectorId () {
    try {
      // Obtener todos los conectores existentes en el formulario actual
      const existingConnectors = document.querySelectorAll('.evse-connector .connector-id')
      const existingIds = Array.from(existingConnectors)
        .map(input => parseInt(input.value))
        .filter(id => !isNaN(id))
        .sort((a, b) => a - b)

      // Encontrar el siguiente número disponible (1, 2, 3...)
      let nextId = 1
      for (const id of existingIds) {
        if (id === nextId) {
          nextId++
        } else {
          break
        }
      }

      return nextId.toString()
    } catch (error) {
      console.error('❌ Error generando ID de conector:', error)
      return '1'
    }
  }

  async saveLocation () {
    try {
      console.log('💾 Guardando location...')

      // Validar formulario
      if (!this.validateLocationForm()) {
        return
      }

      // Recopilar datos del formulario
      const locationData = this.collectLocationFormData()
      if (!locationData) {
        return
      }

      // Enviar al backend usando POST para crear la location
      const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        },
        body: JSON.stringify(locationData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Location creada exitosamente:', result)

      // Mostrar notificación de éxito
      this.app.showNotification('Location creada exitosamente', 'success')

      // Cerrar modal
      this.closeLocationModal()

      // Recargar lista de locations (si existe el método)
      if (this.app.dataLoadingModule) {
        this.app.dataLoadingModule.loadLocations()
      } else if (this.app.loadLocations) {
        this.app.loadLocations()
      }
    } catch (error) {
      console.error('❌ Error guardando location:', error)
      this.app.showNotification(`Error al crear location: ${error.message}`, 'error')
    }
  }

  validateLocationForm () {
    try {
      const form = document.getElementById('createLocationForm')
      if (!form || !form.checkValidity()) {
        if (form) form.reportValidity()
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Error validando formulario de location:', error)
      return false
    }
  }

  collectLocationFormData () {
    try {
      // Validar que las variables de entorno estén configuradas
      if (!window.OCPI_COUNTRY_CODE || !window.OCPI_PARTY_ID) {
        throw new Error('❌ Variables de entorno OCPI no configuradas. Por favor, reinicia la aplicación y asegúrate de que OCPI_PARTY_ID y OCPI_COUNTRY_CODE estén definidas en tu archivo .env')
      }

      const formData = {
        id: document.getElementById('locationId')?.value || '',
        name: document.getElementById('locationName')?.value || '',
        country: document.getElementById('locationCountry')?.value || '',
        city: document.getElementById('locationCity')?.value || '',
        address: document.getElementById('locationAddress')?.value || '',
        postal_code: document.getElementById('locationPostalCode')?.value || null,
        coordinates: {
          latitude: parseFloat(document.getElementById('locationLatitude')?.value || '0'),
          longitude: parseFloat(document.getElementById('locationLongitude')?.value || '0')
        },
        parking_type: document.getElementById('locationParkingType')?.value || '',
        time_zone: document.getElementById('locationTimeZone')?.value || '',
        phone: document.getElementById('locationPhone')?.value || null,
        email: document.getElementById('locationEmail')?.value || null,
        website: document.getElementById('locationWebsite')?.value || null,
        operator: document.getElementById('locationOperator')?.value || null,
        open_24h: document.getElementById('locationOpen24h')?.checked || false,
        access_public: document.getElementById('locationAccessPublic')?.checked !== false,
        country_code: window.OCPI_COUNTRY_CODE,
        party_id: window.OCPI_PARTY_ID,
        last_updated: new Date().toISOString()
      }

      console.log('📊 Datos de location recopilados:', formData)
      return formData
    } catch (error) {
      console.error('❌ Error recopilando datos de location:', error)
      this.app.showNotification(error.message, 'error')
      return null
    }
  }
}
