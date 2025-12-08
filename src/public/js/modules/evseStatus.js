/**
 * Funcionalidad de Cambio de Estado EVSE
 * Extraído de app.js (líneas 2374-3089)
 */

import { ApiUtils } from '../utils/api.js'

export class EVSEStatusModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONALIDAD DE CAMBIO DE ESTADO EVSE =====

  // Mostrar modal de cambio de estado
  showChangeEvseStatusModal () {
    try {
      console.log('🔄 Abriendo modal de cambio de estado EVSE...')

      // Cargar locations para el selector
      this.loadLocationsForStatusChange()

      // Mostrar modal
      const modal = document.getElementById('changeEvseStatusModal')
      if (modal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const bsModal = new bootstrap.Modal(modal)
          bsModal.show()
        } else {
          // Fallback manual
          modal.style.display = 'block'
          modal.classList.add('show')
          document.body.classList.add('modal-open')
        }
      }
    } catch (error) {
      console.error('❌ Error abriendo modal de cambio de estado:', error)
      this.app.showNotification('Error abriendo modal: ' + error.message, 'error')
    }
  }
    
  // Cargar locations para el selector de cambio de estado
  async loadLocationsForStatusChange () {
    try {
      console.log('🔄 Cargando locations para cambio de estado...')

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

      const selector = document.getElementById('changeEvseLocation')
      if (!selector) {
        console.warn('⚠️ Selector changeEvseLocation no encontrado')
        return
      }

      // Limpiar opciones existentes (excepto la primera)
      selector.innerHTML = '<option value="">Seleccionar location...</option>'

      // Agregar locations al selector
      locations.forEach(location => {
        const option = document.createElement('option')
        option.value = location.id
        option.textContent = `${this.app.ui.escapeHtml(location.name || 'Sin nombre')} (${location.evses?.length || 0} EVSEs)`
        option.dataset.locationData = JSON.stringify(location)
        selector.appendChild(option)
      })

      console.log(`✅ ${locations.length} locations cargadas para cambio de estado`)
    } catch (error) {
      console.error('❌ Error cargando locations para cambio de estado:', error)
      this.app.showNotification('Error cargando locations: ' + error.message, 'error')
    }
  }
    
  // Cargar EVSEs cuando se selecciona una location
  async loadEvsesForStatusChange () {
    try {
      const locationIdField = document.getElementById('changeEvseLocation')
      const evseSelector = document.getElementById('changeEvseSelector')
      const locationId = locationIdField?.value || ''

      if (!locationId || !evseSelector) {
        if (evseSelector) {
          evseSelector.innerHTML = '<option value="">Primero selecciona una location</option>'
          evseSelector.disabled = true
        }
        return
      }

      console.log('🔄 Cargando EVSEs para location:', locationId)

      const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?location_id=${locationId}`, {
        headers: {
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      const evses = data.data || []

      // Limpiar opciones existentes
      evseSelector.innerHTML = '<option value="">Seleccionar EVSE...</option>'

      // Agregar EVSEs al selector
      evses.forEach(evse => {
        const option = document.createElement('option')
        option.value = evse.id
        option.textContent = `${this.app.ui.escapeHtml(evse.evse_id || evse.id)} - ${this.app.ui.escapeHtml(evse.status)}`
        option.dataset.evseData = JSON.stringify(evse)
        evseSelector.appendChild(option)
      })

      evseSelector.disabled = false
      console.log(`✅ ${evses.length} EVSEs cargados para location ${locationId}`)
    } catch (error) {
      console.error('❌ Error cargando EVSEs para cambio de estado:', error)
      this.app.showNotification('Error cargando EVSEs: ' + error.message, 'error')
    }
  }

  // Mostrar información del EVSE seleccionado
  showSelectedEvseInfo () {
    try {
      const evseSelector = document.getElementById('changeEvseSelector')
      const infoElement = document.getElementById('selectedEvseInfo')
      const evseId = evseSelector?.value || ''

      if (!evseId || !infoElement) {
        if (infoElement) {
          infoElement.innerHTML = '<span class="text-muted">Selecciona un EVSE para ver su información</span>'
        }
        return
      }

      const selectedOption = evseSelector.options[evseSelector.selectedIndex]
      if (!selectedOption || !selectedOption.dataset.evseData) {
        return
      }

      const evseData = JSON.parse(selectedOption.dataset.evseData)

      infoElement.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <strong>EVSE ID:</strong> ${this.app.ui.escapeHtml(evseData.evse_id || evseData.id)}<br>
                        <strong>UID:</strong> ${this.app.ui.escapeHtml(evseData.id)}<br>
                        <strong>Estado Actual:</strong> <span class="badge status-badge status-${this.app.ui.escapeHtml(evseData.status)}">${this.app.ui.escapeHtml(evseData.status)}</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Conectores:</strong> ${evseData.connectors?.length || 0}<br>
                        <strong>Capabilities:</strong> ${this.app.ui.escapeHtml(evseData.capabilities?.join(', ') || 'Ninguna')}<br>
                        <strong>Última Actualización:</strong> ${new Date(evseData.last_updated).toLocaleString()}
                    </div>
                </div>
            `
    } catch (error) {
      console.error('❌ Error mostrando información del EVSE:', error)
    }
  }

  // Cambiar estado del EVSE
  async changeEvseStatus () {
    try {
      const evseSelector = document.getElementById('changeEvseSelector')
      const newStatusField = document.getElementById('newEvseStatus')
      const reasonField = document.getElementById('evseStatusReason')
      const evseId = evseSelector?.value || ''
      const newStatus = newStatusField?.value || ''
      const reason = reasonField?.value || ''

      if (!evseId || !newStatus) {
        this.app.showNotification('Por favor selecciona un EVSE y un nuevo estado', 'warning')
        return
      }

      console.log('🔄 Cambiando estado del EVSE:', evseId, 'a:', newStatus)

      // Obtener datos del EVSE seleccionado
      const selectedOption = evseSelector.options[evseSelector.selectedIndex]
      if (!selectedOption || !selectedOption.dataset.evseData) {
        throw new Error('No se pudo obtener la información del EVSE seleccionado')
      }

      const evseData = JSON.parse(selectedOption.dataset.evseData)

      // Preparar payload para actualización
      const updatePayload = {
        status: newStatus,
        last_updated: new Date().toISOString()
      }

      if (reason) {
        updatePayload.status_message = reason
      }

      // Actualizar EVSE en base de datos
      const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        },
        body: JSON.stringify(updatePayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const updatedEvse = await response.json()
      console.log('✅ EVSE actualizado exitosamente:', updatedEvse)

      // Mostrar notificación de éxito
      this.app.showNotification(`Estado del EVSE ${evseData.evse_id || evseData.id} cambiado a ${newStatus}`, 'success')

      // Cerrar modal
      this.closeChangeEvseStatusModal()

      // Recargar lista de EVSEs (si existe el método)
      if (this.app.loadEvses) {
        this.app.loadEvses()
      }
    } catch (error) {
      console.error('❌ Error cambiando estado del EVSE:', error)
      this.app.showNotification('Error cambiando estado: ' + error.message, 'error')
    }
  }
    
  // Cerrar modal de cambio de estado
  closeChangeEvseStatusModal () {
    try {
      const modal = document.getElementById('changeEvseStatusModal')
      if (modal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const bsModal = bootstrap.Modal.getInstance(modal)
          if (bsModal) bsModal.hide()
        } else {
          // Fallback manual
          modal.style.display = 'none'
          modal.classList.remove('show')
          document.body.classList.remove('modal-open')
        }
      }

      // Limpiar formulario
      const form = document.getElementById('changeEvseStatusForm')
      const selector = document.getElementById('changeEvseSelector')
      const infoElement = document.getElementById('selectedEvseInfo')
      if (form) form.reset()
      if (selector) selector.disabled = true
      if (infoElement) {
        infoElement.innerHTML = '<span class="text-muted">Selecciona un EVSE para ver su información</span>'
      }
    } catch (error) {
      console.error('❌ Error cerrando modal de cambio de estado:', error)
    }
  }

  // Funciones que deberían estar en otros módulos (comentadas temporalmente):
/*
    initializeLocationTooltips() {
        try {
            console.log('🔧 Inicializando tooltips de locations...');
            console.log('📊 allLocations disponibles:', this.allLocations?.length || 0);
            
            // Destruir tooltips existentes para evitar duplicados
            const existingTooltips = document.querySelectorAll('.location-name-tooltip, .location-evses-tooltip');
            existingTooltips.forEach(element => {
                const tooltip = bootstrap.Tooltip.getInstance(element);
                if (tooltip) {
                    tooltip.dispose();
                }
            });
            
            // Configurar tooltips para nombre de location
            const locationNameTooltips = document.querySelectorAll('.location-name-tooltip');
            console.log(`🔍 Encontrados ${locationNameTooltips.length} elementos para tooltip de nombre`);
            
            locationNameTooltips.forEach(element => {
                const locationId = element.dataset.locationId;
                console.log(`🔍 Buscando location con ID: ${locationId}`);
                
                const location = this.allLocations?.find(l => l.id === locationId);
                console.log(`📍 Location encontrada:`, location);
                
                if (location) {
                    const tooltipContent = `
                        <strong>Location ID:</strong> ${location.id}<br>
                        <strong>Nombre:</strong> ${location.name || 'N/A'}<br>
                        <strong>País:</strong> ${location.country || 'N/A'}<br>
                        <strong>Ciudad:</strong> ${location.city || 'N/A'}<br>
                        <strong>Dirección:</strong> ${location.address || 'N/A'}<br>
                        <strong>Coordenadas:</strong> ${location.coordinates ? `${location.coordinates.latitude}, ${location.coordinates.longitude}` : 'N/A'}<br>
                        <strong>Tipo de parking:</strong> ${location.parking_type || 'N/A'}<br>
                        <strong>EVSEs:</strong> ${location.evses?.length || 0}<br>
                        <strong>Última actualización:</strong> ${new Date(location.last_updated).toLocaleString()}
                    `;
                    
                    console.log(`📝 Tooltip content para ${locationId}:`, tooltipContent);
                    
                    new bootstrap.Tooltip(element, {
                        html: true,
                        placement: 'top',
                        delay: { show: 500, hide: 100 },
                        title: tooltipContent
                    });
                } else {
                    console.warn(`⚠️ No se encontró location con ID: ${locationId}`);
                }
            });
            
            // Configurar tooltips para EVSEs de location
            const locationEvsesTooltips = document.querySelectorAll('.location-evses-tooltip');
            console.log(`🔍 Encontrados ${locationEvsesTooltips.length} elementos para tooltip de EVSEs`);
            
            locationEvsesTooltips.forEach(element => {
                const locationId = element.dataset.locationId;
                console.log(`🔍 Buscando EVSEs para location ID: ${locationId}`);
                
                const location = this.allLocations?.find(l => l.id === locationId);
                console.log(`📍 Location para EVSEs:`, location);
                console.log(`🔌 EVSEs en location:`, location?.evses);
                
                if (location && location.evses && location.evses.length > 0) {
                    const evsesContent = location.evses.map((evse, index) => `
                        <strong>EVSE ${index + 1}:</strong><br>
                        • ID: ${evse.evse_id || evse.uid || evse.id}<br>
                        • UID: ${evse.uid || evse.id}<br>
                        • Estado: ${evse.status}<br>
                        • Conectores: ${evse.connectors?.length || 0}<br>
                        • Capabilities: ${evse.capabilities?.join(', ') || 'Ninguna'}<br>
                        ${index < location.evses.length - 1 ? '<br>' : ''}
                    `).join('');
                    
                    console.log(`📝 EVSEs content para ${locationId}:`, evsesContent);
                    
                    new bootstrap.Tooltip(element, {
                        html: true,
                        placement: 'top',
                        delay: { show: 500, hide: 100 },
                        title: evsesContent
                    });
                } else {
                    console.log(`📝 No hay EVSEs para ${locationId}, usando mensaje por defecto`);
                    new bootstrap.Tooltip(element, {
                        html: true,
                        placement: 'top',
                        delay: { show: 500, hide: 100 },
                        title: 'No hay EVSEs configurados en esta location'
                    });
                }
            });
            
            console.log(`✅ ${locationNameTooltips.length + locationEvsesTooltips.length} tooltips de locations inicializados`);
        } catch (error) {
            console.error('❌ Error inicializando tooltips de locations:', error);
        }
    }
*/

  showTableError (tbodyId, message) {
    const tbody = document.getElementById(tbodyId)
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle"></i> ${message}
                    </td>
                </tr>
            `
    }
  }

  updateCount (elementId, count) {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = count
    }
  }

  async loadEvses () {
    try {
      console.log('🔄 Cargando EVSEs...')

      // Cargar todos los EVSEs haciendo múltiples peticiones
      this.app.allEvses = []
      let offset = 0
      const limit = 1000
      let hasMore = true

      while (hasMore) {
        const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?offset=${offset}&limit=${limit}`, {
          headers: {
            'Authorization': `Token ${ApiUtils.getAuthToken()}`
          }
        })

        console.log(`📡 EVSEs response status (offset ${offset}):`, response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ EVSEs response error:', errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        const evses = data.data || []

        this.app.allEvses = this.app.allEvses.concat(evses)

        console.log(`📊 Cargados ${evses.length} EVSEs (total: ${this.app.allEvses.length})`)

        // Verificar si hay más datos
        hasMore = evses.length === limit
        offset += limit
      }

      // Configurar paginado
      this.app.currentEvsesPage = 1
      this.app.evsesPerPage = 20

      this.renderEvsesPage()
      this.app.ui.updateCount('evsesCount', this.app.allEvses.length)

      console.log(`✅ ${this.app.allEvses.length} EVSEs cargados exitosamente`)
    } catch (error) {
      console.error('❌ Error cargando EVSEs:', error)
      this.app.ui.showTableError('evsesTableBody', `Error al cargar EVSEs: ${error.message}`)
    }
  }

  renderEvses (evses) {
    const tbody = document.getElementById('evsesTableBody')
    if (!tbody) {
      console.warn('⚠️ Elemento evsesTableBody no encontrado')
      return
    }

    if (evses.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay EVSEs disponibles
                    </td>
                </tr>
            `
      return
    }

    tbody.innerHTML = evses.map(evse => `
                <tr class="fade-in" data-evse-id="${evse.id}">
                    <td>
                        <code class="evse-id-tooltip" 
                              data-evse-id="${evse.id}"
                              data-tooltip-type="evse">
                            ${evse.evse_id}
                        </code>
                    </td>
                    <td><code>${evse.id}</code></td>
                    <td>${evse.location?.name || evse.location_id || 'N/A'}</td>
                    <td>
                        <span class="text-muted">
                            ${evse.physical_reference || '<i class="bi bi-dash"></i>'}
                        </span>
                    </td>
                    <td><span class="badge status-badge status-${evse.status}">${evse.status}</span></td>
                    <td>
                        <span class="badge bg-info cursor-pointer connectors-tooltip" 
                              data-evse-id="${evse.id}"
                              data-tooltip-type="connectors">
                            ${evse.connectors?.length || 0}
                        </span>
                    </td>
                    <td>${new Date(evse.last_updated).toLocaleString()}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-primary btn-sm edit-evse-btn"
                                    data-evse-id="${evse.id}"
                                    title="Editar EVSE">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm delete-evse-btn"
                                    data-evse-id="${evse.id}"
                                    data-evse-name="${evse.evse_id || 'N/A'}"
                                    title="Eliminar EVSE">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')

    console.log(`✅ ${evses.length} EVSEs renderizados`)

    // Inicializar tooltips de Bootstrap
    this.initializeTooltips()
  }

  // Inicializar tooltips de Bootstrap
  initializeTooltips () {
    try {
      // Destruir tooltips existentes para evitar duplicados
      const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]')
      existingTooltips.forEach(element => {
        const tooltip = bootstrap.Tooltip.getInstance(element)
        if (tooltip) {
          tooltip.dispose()
        }
      })

      // Configurar tooltips para EVSE ID
      const evseIdTooltips = document.querySelectorAll('.evse-id-tooltip')
      evseIdTooltips.forEach(element => {
        const evseId = element.dataset.evseId
        const evse = this.app.allEvses?.find(e => e.id === evseId)
        if (evse) {
          const tooltipContent = `
                        <strong>EVSE ID:</strong> ${evse.evse_id || 'N/A'}<br>
                        <strong>UID:</strong> ${evse.id}<br>
                        <strong>Estado:</strong> ${evse.status}<br>
                        <strong>Location:</strong> ${evse.location?.name || evse.location_id || 'N/A'}<br>
                        <strong>Conectores:</strong> ${evse.connectors?.length || 0}<br>
                        <strong>Capabilities:</strong> ${evse.capabilities?.join(', ') || 'Ninguna'}<br>
                        <strong>Última actualización:</strong> ${new Date(evse.last_updated).toLocaleString()}
                    `

          new bootstrap.Tooltip(element, {
            html: true,
            placement: 'top',
            delay: { show: 500, hide: 100 },
            title: tooltipContent
          })
        }
      })

      // Configurar tooltips para conectores
      const connectorsTooltips = document.querySelectorAll('.connectors-tooltip')
      connectorsTooltips.forEach(element => {
        const evseId = element.dataset.evseId
        const evse = this.app.allEvses?.find(e => e.id === evseId)
        if (evse) {
          const connectorsContent = evse.connectors && evse.connectors.length > 0
            ? evse.connectors.map((conn, index) => `
                            <strong>Conector ${index + 1}:</strong><br>
                            • ID: ${conn.id}<br>
                            • Estándar: ${conn.standard || 'N/A'}<br>
                            • Formato: ${conn.format || 'N/A'}<br>
                            • Tipo: ${conn.power_type || 'N/A'}<br>
                            • Voltaje: ${conn.max_voltage || 'N/A'}V<br>
                            • Amperaje: ${conn.max_amperage || 'N/A'}A<br>
                            • Potencia: ${conn.max_electric_power || 'N/A'}W<br>
                            ${index < evse.connectors.length - 1 ? '<br>' : ''}
                        `).join('')
            : 'No hay conectores configurados'

          new bootstrap.Tooltip(element, {
            html: true,
            placement: 'top',
            delay: { show: 500, hide: 100 },
            title: connectorsContent
          })
        }
      })

      console.log(`✅ ${evseIdTooltips.length + connectorsTooltips.length} tooltips inicializados`)
    } catch (error) {
      console.error('❌ Error inicializando tooltips:', error)
    }
  }

  // Construir contenido del tooltip para tarifas
  buildTariffTooltip (tariff) {
    try {
      console.log('🔍 Construyendo tooltip para tarifa:', tariff)
      const elements = tariff.elements || []
      console.log('📋 Elementos de la tarifa:', elements)

      const elementsInfo = elements.map((element, index) => {
        console.log(`🔍 Elemento ${index + 1}:`, element)

        let componentsInfo = ''

        // Verificar si tiene la estructura nueva (price_components)
        if (element.price_components && Array.isArray(element.price_components)) {
          console.log(`💰 Price components (nueva estructura):`, element.price_components)
          componentsInfo = element.price_components.map(comp =>
            `<strong>${comp.type}</strong>: ${comp.price} ${tariff.currency}${comp.vat ? ` (IVA: ${comp.vat}%)` : ''}${comp.step_size ? ` (Paso: ${comp.step_size})` : ''}`
          ).join('<br>')
        }
        // Verificar si tiene la estructura antigua (component_type, price, step)
        else if (element.component_type && element.price !== undefined) {
          console.log(`💰 Componente (estructura antigua):`, element)
          componentsInfo = `<strong>${element.component_type}</strong>: ${element.price} ${tariff.currency}${element.vat ? ` (IVA: ${element.vat}%)` : ''}${element.step ? ` (Paso: ${element.step})` : ''}`
        }
        // Si no tiene estructura válida
        else {
          console.log(`⚠️ Elemento sin estructura válida:`, element)
          componentsInfo = 'Sin información de componentes'
        }

        return `Elemento ${index + 1}:<br>${componentsInfo}`
      }).join('<br><br>')

      return `
                <div class="text-start">
                    <strong>ID:</strong> ${tariff.id}<br>
                    <strong>País:</strong> ${tariff.country_code}<br>
                    <strong>Organización:</strong> ${tariff.party_id}<br>
                    <strong>Tipo:</strong> ${tariff.type}<br>
                    <strong>Moneda:</strong> ${tariff.currency}<br>
                    <strong>Precio Mín:</strong> ${tariff.min_price ? `${tariff.min_price} ${tariff.currency}` : 'N/A'}<br>
                    <strong>Precio Máx:</strong> ${tariff.max_price ? `${tariff.max_price} ${tariff.currency}` : 'N/A'}<br>
                    <strong>Válido Desde:</strong> ${tariff.start_date_time ? new Date(tariff.start_date_time).toLocaleString() : 'N/A'}<br>
                    <strong>Válido Hasta:</strong> ${tariff.end_date_time ? new Date(tariff.end_date_time).toLocaleString() : 'N/A'}<br>
                    <strong>Elementos:</strong><br>${elementsInfo || 'N/A'}
                </div>
            `
    } catch (error) {
      console.error('❌ Error construyendo tooltip de tarifa:', error)
      return `<strong>Error:</strong> No se pudo cargar la información de la tarifa`
    }
  }

  // Inicializar tooltips de Bootstrap para tarifas
  initializeTariffTooltips () {
        try {
            console.log('🔧 Inicializando tooltips de tarifas...');
            
            // Destruir tooltips existentes para evitar duplicados
            const existingTooltips = document.querySelectorAll('.tariff-id-tooltip');
            existingTooltips.forEach(element => {
                const tooltip = bootstrap.Tooltip.getInstance(element);
                if (tooltip) {
                    tooltip.dispose();
                }
            });

            // Configurar tooltips para IDs de tarifas
            const tariffIdTooltips = document.querySelectorAll('.tariff-id-tooltip');
            console.log(`🔍 Encontrados ${tariffIdTooltips.length} elementos para tooltip de tarifas`);

            tariffIdTooltips.forEach(element => {
                try {
                    const tariffId = element.getAttribute('data-tariff-id');
                    const tariff = this.app.allTariffs ? this.app.allTariffs.find(t => t.id === tariffId) : null;
                    
                    if (tariff) {
                        const tooltipContent = this.buildTariffTooltip(tariff);
                        console.log(`📝 Tooltip content para ${tariffId}:`, tooltipContent);
                        
                        new bootstrap.Tooltip(element, {
                            placement: 'top',
                            html: true,
                            trigger: 'hover focus',
                            title: tooltipContent
                        });
                    } else {
                        console.warn(`⚠️ No se encontró tarifa con ID: ${tariffId}`);
                    }
                } catch (tooltipError) {
                    console.warn('⚠️ Error creando tooltip individual:', tooltipError);
                }
            });
            
            console.log(`✅ ${tariffIdTooltips.length} tooltips de tarifas inicializados`);
        } catch (error) {
            console.error('❌ Error inicializando tooltips de tarifas:', error);
        }
    }

  // Renderizar página específica de EVSEs
  renderEvsesPage () {
        if (!this.app.allEvses || this.app.allEvses.length === 0) {
            this.renderEvses([]);
            this.updatePaginationInfo(0, 0, 0);
            return;
        }

        const startIndex = (this.app.currentEvsesPage - 1) * this.app.evsesPerPage;
        const endIndex = startIndex + this.app.evsesPerPage;
        const pageEvses = this.app.allEvses.slice(startIndex, endIndex);

        this.renderEvses(pageEvses);
        this.updatePaginationInfo(startIndex + 1, endIndex, this.app.allEvses.length);
        this.updatePaginationButtons();
    }

  // Actualizar información de paginado
  updatePaginationInfo (start, end, total) {
        const pageInfo = document.getElementById('evsesPageInfo');
        const totalCount = document.getElementById('evsesTotalCount');
        
        if (pageInfo) pageInfo.textContent = `${start}-${Math.min(end, total)}`;
        if (totalCount) totalCount.textContent = total;
    }

  // Actualizar botones de paginado
  updatePaginationButtons () {
        const prevButton = document.getElementById('evsesPrevPage');
        const nextButton = document.getElementById('evsesNextPage');
        
        if (prevButton) {
            prevButton.disabled = this.app.currentEvsesPage <= 1;
            prevButton.parentElement.classList.toggle('disabled', this.app.currentEvsesPage <= 1);
        }
        
        if (nextButton) {
            const totalPages = Math.ceil(this.app.allEvses.length / this.app.evsesPerPage);
            nextButton.disabled = this.app.currentEvsesPage >= totalPages;
            nextButton.parentElement.classList.toggle('disabled', this.app.currentEvsesPage >= totalPages);
        }
    }

  // Ir a página anterior
  goToEvsesPrevPage () {
        if (this.app.currentEvsesPage > 1) {
            this.app.currentEvsesPage--
            this.renderEvsesPage()
        }
    }

  // Ir a página siguiente
  goToEvsesNextPage () {
        const totalPages = Math.ceil(this.app.allEvses.length / this.app.evsesPerPage)
        if (this.app.currentEvsesPage < totalPages) {
            this.app.currentEvsesPage++
            this.renderEvsesPage()
        }
    }
}
