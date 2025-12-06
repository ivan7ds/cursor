/**
 * Funciones del Modal de Creación de Tarifas
 * Extraído de app.js (líneas 5312-5399)
 */

import { ApiUtils } from '../utils/api.js'

export class TariffsModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES DEL MODAL DE CREACIÓN DE TARIFAS =====

  setupTariffModalEventListeners () {
    try {
      console.log('🔧 Configurando event listeners del modal de tarifas...')

      // Botón para generar ID de tarifa
      const generateTariffIdBtn = document.getElementById('generateTariffIdBtn')
      if (generateTariffIdBtn) {
        generateTariffIdBtn.addEventListener('click', () => {
          this.generateTariffId()
        })
        console.log('✅ Event listener para generateTariffIdBtn agregado')
      }

      // Botón para agregar elemento de tarifa
      const addTariffElement = document.getElementById('addTariffElement')
      if (addTariffElement) {
        addTariffElement.addEventListener('click', () => {
          this.addTariffElement()
        })
        console.log('✅ Event listener para addTariffElement agregado')
      }

      // Botón para guardar tarifa
      const saveTariffBtn = document.getElementById('saveTariffBtn')
      if (saveTariffBtn) {
        saveTariffBtn.addEventListener('click', () => {
          this.saveTariff()
        })
        console.log('✅ Event listener para saveTariffBtn agregado')
      }

      // Cambio de moneda para actualizar los sufijos de precio
      const tariffCurrency = document.getElementById('tariffCurrency')
      if (tariffCurrency) {
        tariffCurrency.addEventListener('change', () => {
          this.updateCurrencySuffixes()
        })
        console.log('✅ Event listener para cambio de moneda agregado')
      }

      console.log('✅ Event listeners del modal de tarifas configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners del modal de tarifas:', error)
    }
  }

  generateTariffId () {
    try {
      console.log('🆔 Generando ID único para tarifa...')

      // Generar UUID v4
      const uuid = this.generateUUID()

      // Asignar al campo
      const tariffIdField = document.getElementById('tariffId')
      if (tariffIdField) {
        tariffIdField.value = uuid
        console.log('✅ ID único generado para tarifa:', uuid)
      } else {
        console.warn('⚠️ Campo tariffId no encontrado')
      }
    } catch (error) {
      console.error('❌ Error generando ID de tarifa:', error)
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

  addTariffElement () {
    try {
      console.log('➕ Agregando elemento de tarifa...')

      const container = document.getElementById('tariffElementsContainer')
      if (!container) return

      const elementDiv = document.createElement('div')
      elementDiv.className = 'tariff-element border rounded p-3 mb-2'
      elementDiv.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">Tipo de Componente</label>
                        <select class="form-select tariff-component-type" required>
                            <option value="">Seleccionar...</option>
                            <option value="ENERGY">ENERGY</option>
                            <option value="FLAT">FLAT</option>
                            <option value="PARKING_TIME">PARKING_TIME</option>
                            <option value="TIME">TIME</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Precio</label>
                        <input type="number" class="form-control tariff-component-price" step="0.001" min="0" required placeholder="0.000">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Paso</label>
                        <input type="number" class="form-control tariff-component-step" step="0.1" min="0" placeholder="0.0">
                    </div>
                </div>
                <div class="text-end mt-2">
                    <button type="button" class="btn btn-outline-danger btn-sm remove-tariff-element">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            `

      // Event listener para eliminar elemento
      const removeBtn = elementDiv.querySelector('.remove-tariff-element')
      removeBtn.addEventListener('click', () => {
        elementDiv.remove()
      })

      container.appendChild(elementDiv)
      console.log('✅ Elemento de tarifa agregado')
    } catch (error) {
      console.error('❌ Error agregando elemento de tarifa:', error)
    }
  }

  updateCurrencySuffixes () {
    try {
      const currency = document.getElementById('tariffCurrency').value
      const minPriceCurrency = document.getElementById('tariffMinPriceCurrency')
      const maxPriceCurrency = document.getElementById('tariffMaxPriceCurrency')

      if (minPriceCurrency && maxPriceCurrency) {
        minPriceCurrency.textContent = currency
        maxPriceCurrency.textContent = currency
      }
    } catch (error) {
      console.error('❌ Error actualizando sufijos de moneda:', error)
    }
  }

  async loadLocationsForTariff () {
    try {
      console.log('📍 Cargando ubicaciones para tarifa...')

      const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations`, {
        headers: {
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      const locations = data.data || []

      const locationSelect = document.getElementById('tariffLocation')
      if (locationSelect) {
        locationSelect.innerHTML = '<option value="">Seleccionar ubicación...</option>'

        locations.forEach(location => {
          const option = document.createElement('option')
          option.value = location.id
          option.textContent = `${location.name} - ${location.city} (${location.country})`
          locationSelect.appendChild(option)
        })

        console.log(`✅ ${locations.length} ubicaciones cargadas para tarifa`)
      }
    } catch (error) {
      console.error('❌ Error cargando ubicaciones para tarifa:', error)
    }
  }

  showCreateTariffModal () {
    try {
      console.log('💰 Mostrando modal de creación de tarifa...')

      // Cargar ubicaciones disponibles
      this.loadLocationsForTariff()

      // Generar ID único para la tarifa
      this.generateTariffId()

      // Configurar fecha actual como valor por defecto
      const now = new Date()
      const nowString = now.toISOString().slice(0, 16)
      const startDateField = document.getElementById('tariffStartDate')
      if (startDateField) {
        startDateField.value = nowString
      }

      // Mostrar el modal usando la API correcta de Bootstrap 5
      const modalElement = document.getElementById('createTariffModal')
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement)
        modal.show()
        console.log('✅ Modal de creación de tarifa mostrado')
      } else {
        throw new Error('Elemento modal no encontrado')
      }
    } catch (error) {
      console.error('❌ Error mostrando modal de creación de tarifa:', error)
      this.app.showNotification('Error abriendo modal de tarifa: ' + error.message, 'error')
    }
  }

  async saveTariff () {
    try {
      console.log('💾 Guardando tarifa...')

      // Validar formulario
      if (!this.validateTariffForm()) {
        return
      }

      // Recopilar datos del formulario
      const tariffData = this.collectTariffFormData()

      // Enviar al backend
      const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tariffs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        },
        body: JSON.stringify(tariffData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Tarifa creada exitosamente:', result)

      // Mostrar notificación de éxito
      const associatedEvses = result.data?.associated_evses || 0
      let message = 'Tarifa creada exitosamente'
      if (associatedEvses > 0) {
        message += ` y asociada a ${associatedEvses} EVSE(s)`
      }
      this.app.showNotification(message, 'success')

      // Cerrar modal
      const modalElement = document.getElementById('createTariffModal')
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        }
      }

      // Recargar listas (si existen los métodos)
      if (this.app.loadTariffs) this.app.loadTariffs()
      if (this.app.loadEvses) this.app.loadEvses()
    } catch (error) {
      console.error('❌ Error guardando tarifa:', error)
      this.app.showNotification(`Error al crear tarifa: ${error.message}`, 'error')
    }
  }

  validateTariffForm () {
    try {
      const form = document.getElementById('createTariffForm')
      if (!form || !form.checkValidity()) {
        if (form) form.reportValidity()
        return false
      }

      // Validar que al menos un elemento de tarifa esté configurado
      const elements = document.querySelectorAll('.tariff-element')
      if (elements.length === 0) {
        this.app.showNotification('Debe configurar al menos un elemento de tarifa', 'error')
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Error validando formulario de tarifa:', error)
      return false
    }
  }

  collectTariffFormData () {
    try {
      const formData = {
        id: document.getElementById('tariffId')?.value || '',
        type: document.getElementById('tariffType')?.value || 'REGULAR',
        currency: document.getElementById('tariffCurrency')?.value || 'EUR',
        location_id: document.getElementById('tariffLocation')?.value || null,
        start_date_time: document.getElementById('tariffStartDate')?.value || null,
        end_date_time: document.getElementById('tariffEndDate')?.value || null,
        min_price: parseFloat(document.getElementById('tariffMinPrice')?.value) || null,
        max_price: parseFloat(document.getElementById('tariffMaxPrice')?.value) || null,
        tariff_alt_text: document.getElementById('tariffAltText')?.value || null,
        tariff_alt_url: document.getElementById('tariffAltUrl')?.value || null,
        elements: []
      }

      // Recopilar elementos de tarifa
      const elements = document.querySelectorAll('.tariff-element')
      elements.forEach(element => {
        const type = element.querySelector('.tariff-component-type')?.value
        const price = parseFloat(element.querySelector('.tariff-component-price')?.value)
        const step = parseFloat(element.querySelector('.tariff-component-step')?.value) || null

        if (type && !isNaN(price)) {
          formData.elements.push({
            component_type: type,
            price: price,
            step: step
          })
        }
      })

      console.log('📊 Datos de tarifa recopilados:', formData)
      return formData
    } catch (error) {
      console.error('❌ Error recopilando datos de tarifa:', error)
      return null
    }
  }
}
