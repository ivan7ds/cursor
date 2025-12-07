/**
 * Funciones de Borrado de Locations
 * Extraído de app.js (líneas 7773-8995)
 */

import { ApiUtils } from '../utils/api.js'

export class LocationDeleteModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES DE BORRADO DE LOCATIONS =====

  setupLocationDeleteEventListeners() {
        try {
            console.log('🗑️ Configurando event listeners para borrado de locations...');
            
            // Usar event delegation para los botones de borrado
            document.addEventListener('click', (event) => {
                if (event.target.closest('.delete-location-btn')) {
                    const button = event.target.closest('.delete-location-btn');
                    const locationId = button.getAttribute('data-location-id');
                    const locationName = button.getAttribute('data-location-name');
                    
                    this.confirmDeleteLocation(locationId, locationName);
                }
            });
            
            console.log('✅ Event listeners para borrado de locations configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners para borrado de locations:', error);
        }
    }

  async confirmDeleteLocation(locationId, locationName) {
        try {
            console.log(`🗑️ Confirmando borrado de location: ${locationId} (${locationName})`);
            
      // Verificar si la location tiene EVSEs asociados (delegar a evseDeleteModule)
      let evsesCount = 0
      if (this.app.evseDeleteModule && this.app.evseDeleteModule.getEvsesCountForLocation) {
        evsesCount = await this.app.evseDeleteModule.getEvsesCountForLocation(locationId)
      }
            
            let message = `¿Estás seguro de que quieres eliminar la location "${locationName}"?\n\n`;
            
            if (evsesCount > 0) {
                message += `⚠️ ATENCIÓN: Esta location tiene ${evsesCount} EVSE(s) asociado(s).\n\n`;
                message += `Al eliminar la location, todos los EVSEs asociados también serán marcados como eliminados (soft delete).\n\n`;
            }
            
            message += `Esta acción marcará la location como eliminada (soft delete) y no se mostrará en la lista, pero los datos permanecerán en la base de datos.\n\nID: ${locationId}`;
            
            const confirmed = confirm(message);
            
            if (confirmed) {
                this.deleteLocation(locationId, locationName);
            } else {
                console.log('❌ Borrado de location cancelado por el usuario');
            }
        } catch (error) {
            console.error('❌ Error confirmando borrado de location:', error);
            this.app.showNotification(`Error al verificar EVSEs asociados: ${error.message}`, 'error');
        }
    }

  async deleteLocation(locationId, locationName) {
        try {
            console.log(`🗑️ Eliminando location: ${locationId} (${locationName})`);
            
            // Mostrar indicador de carga en el botón
            const button = document.querySelector(`[data-location-id="${locationId}"] .delete-location-btn`);
            if (button) {
                const originalContent = button.innerHTML;
                button.innerHTML = '<i class="bi bi-hourglass-split"></i>';
                button.disabled = true;
                
      // Primero eliminar todos los EVSEs asociados a esta location (delegar a evseDeleteModule)
      if (this.app.evseDeleteModule && this.app.evseDeleteModule.deleteEvsesForLocation) {
        await this.app.evseDeleteModule.deleteEvsesForLocation(locationId)
      }
                
      // Luego eliminar la location
      await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/locations/${locationId}`, {
        method: 'DELETE'
      })
                
                // Mostrar notificación de éxito
                this.app.showNotification(`Location "${locationName}" y sus EVSEs asociados eliminados exitosamente`, 'success');
                
      // Recargar listas de locations y EVSEs (si existen los métodos)
      if (this.app.dataLoadingModule && this.app.dataLoadingModule.loadLocations) {
        this.app.dataLoadingModule.loadLocations()
      }
      if (this.app.loadEvses) {
        this.app.loadEvses()
      }
                
                console.log(`✅ Location ${locationId} y sus EVSEs asociados eliminados exitosamente`);
                
            } else {
                throw new Error('Botón de borrado no encontrado');
            }
            
        } catch (error) {
            console.error(`❌ Error eliminando location ${locationId}:`, error);
            this.app.showNotification(`Error al eliminar location: ${error.message}`, 'error');
            
            // Restaurar botón en caso de error
            const button = document.querySelector(`[data-location-id="${locationId}"] .delete-location-btn`);
            if (button) {
                button.innerHTML = '<i class="bi bi-trash"></i>';
                button.disabled = false;
            }
        }
    }

  setupModalCloseEventListeners() {
        try {
            // Botón de cerrar (X)
            const closeBtn = document.querySelector('#createTariffModal .btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeTariffModal();
                });
            }

            // Botón Cancelar
            const cancelBtn = document.querySelector('#createTariffModal .btn-secondary');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeTariffModal();
                });
            }

            // Cerrar al hacer clic en el backdrop
            const modalElement = document.getElementById('createTariffModal');
            if (modalElement) {
                modalElement.addEventListener('click', (event) => {
                    if (event.target === modalElement) {
                        this.closeTariffModal();
                    }
                });
            }

            // Cerrar con tecla Escape
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modalElement && modalElement.classList.contains('show')) {
                    this.closeTariffModal();
                }
            });

            console.log('✅ Event listeners de cierre del modal configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners de cierre del modal:', error);
        }
    }

  closeTariffModal() {
        try {
            const modalElement = document.getElementById('createTariffModal');
            if (modalElement) {
                // Intentar usar Bootstrap API
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // Fallback: cerrar manualmente
                    modalElement.classList.remove('show');
                    modalElement.style.display = 'none';
                    modalElement.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('modal-open');
                    
                    // Remover backdrop
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                }
                
                // Limpiar formulario
                this.resetTariffForm();
                
                console.log('✅ Modal cerrado correctamente');
            }
        } catch (error) {
            console.error('❌ Error cerrando modal:', error);
        }
    }

  resetTariffForm() {
        try {
            const form = document.getElementById('createTariffForm');
            if (form) {
                form.reset();
                
                // Limpiar elementos de tarifa adicionales
                const container = document.getElementById('tariffElementsContainer');
                if (container) {
                    const elements = container.querySelectorAll('.tariff-element');
                    // Mantener solo el primer elemento
                    for (let i = 1; i < elements.length; i++) {
                        elements[i].remove();
                    }
                }
                
                // Limpiar sufijos de moneda
                this.updateCurrencySuffixes();
                
                console.log('✅ Formulario de tarifa reseteado');
            }
        } catch (error) {
            console.error('❌ Error reseteando formulario:', error);
        }
    }

  showCreateTariffModal() {
        try {
            console.log('💰 Mostrando modal de creación de tarifa...');
            
            // Cargar ubicaciones disponibles
            this.loadLocationsForTariff();
            
      // Generar ID único para la tarifa (delegar a tariffsModule si existe)
      if (this.app.tariffsModule && this.app.tariffsModule.generateTariffId) {
        this.app.tariffsModule.generateTariffId()
      }
            
            // Configurar fecha actual como valor por defecto
            const now = new Date();
            const nowString = now.toISOString().slice(0, 16);
            document.getElementById('tariffStartDate').value = nowString;
            
            // Mostrar el modal usando la API correcta de Bootstrap 5
            const modalElement = document.getElementById('createTariffModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                console.log('✅ Modal de creación de tarifa mostrado');
            } else {
                throw new Error('Elemento modal no encontrado');
            }
        } catch (error) {
            console.error('❌ Error mostrando modal de creación de tarifa:', error);
            // Fallback: intentar mostrar el modal usando jQuery si está disponible
            try {
                if (typeof $ !== 'undefined' && $.fn.modal) {
                    $('#createTariffModal').modal('show');
                    console.log('✅ Modal mostrado usando jQuery fallback');
                } else {
                    // Fallback final: mostrar el modal manualmente
                    const modalElement = document.getElementById('createTariffModal');
                    if (modalElement) {
                        modalElement.classList.add('show');
                        modalElement.style.display = 'block';
                        modalElement.setAttribute('aria-hidden', 'false');
                        document.body.classList.add('modal-open');
                        
                        // Agregar backdrop
                        const backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(backdrop);
                        
                        console.log('✅ Modal mostrado manualmente');
                    }
                }
            } catch (fallbackError) {
                console.error('❌ Error en fallback del modal:', fallbackError);
            }
        }
    }

  async loadLocationsForTariff() {
        try {
            console.log('📍 Cargando ubicaciones para tarifa...');
            
      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/locations`)
            const locations = data.data || [];
            
            const locationSelect = document.getElementById('tariffLocation');
            if (locationSelect) {
                locationSelect.innerHTML = '<option value="">Seleccionar ubicación...</option>';
                
                locations.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.id;
                    option.textContent = `${location.name} - ${location.city} (${location.country})`;
                    locationSelect.appendChild(option);
                });
                
                console.log(`✅ ${locations.length} ubicaciones cargadas para tarifa`);
            }
        } catch (error) {
            console.error('❌ Error cargando ubicaciones para tarifa:', error);
        }
    }

  addTariffElement() {
        try {
            console.log('➕ Agregando elemento de tarifa...');
            
            const container = document.getElementById('tariffElementsContainer');
            if (!container) return;
            
            const elementDiv = document.createElement('div');
            elementDiv.className = 'tariff-element border rounded p-3 mb-2';
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
            `;
            
            // Event listener para eliminar elemento
            const removeBtn = elementDiv.querySelector('.remove-tariff-element');
            removeBtn.addEventListener('click', () => {
                elementDiv.remove();
            });
            
            container.appendChild(elementDiv);
            console.log('✅ Elemento de tarifa agregado');
        } catch (error) {
            console.error('❌ Error agregando elemento de tarifa:', error);
        }
    }

  updateCurrencySuffixes() {
        try {
            const currency = document.getElementById('tariffCurrency').value;
            const minPriceCurrency = document.getElementById('tariffMinPriceCurrency');
            const maxPriceCurrency = document.getElementById('tariffMaxPriceCurrency');
            
            if (minPriceCurrency && maxPriceCurrency) {
                minPriceCurrency.textContent = currency;
                maxPriceCurrency.textContent = currency;
            }
        } catch (error) {
            console.error('❌ Error actualizando sufijos de moneda:', error);
        }
    }

  async saveTariff() {
        try {
            console.log('💾 Guardando tarifa...');
            
            // Validar formulario
            if (!this.validateTariffForm()) {
                return;
            }
            
            // Recopilar datos del formulario
            const tariffData = this.collectTariffFormData();
            
      // Enviar al backend
      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/tariffs`, {
        method: 'POST',
        body: JSON.stringify(tariffData)
      })
            console.log('✅ Tarifa creada exitosamente:', result);
            
            // Mostrar notificación de éxito con información de EVSEs asociados
            const associatedEvses = result.data?.associated_evses || 0;
            let message = 'Tarifa creada exitosamente';
            
            if (associatedEvses > 0) {
                message += ` y asociada a ${associatedEvses} EVSE(s)`;
            }
            
            this.app.showNotification(message, 'success');
            
            // Cerrar modal usando la API correcta de Bootstrap 5
            const modalElement = document.getElementById('createTariffModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // Fallback: cerrar manualmente
                    modalElement.classList.remove('show');
                    modalElement.style.display = 'none';
                    modalElement.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('modal-open');
                    
                    // Remover backdrop
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                }
            }
            
      // Recargar lista de tarifas (si existe el método)
      if (this.app.dataLoadingModule && this.app.dataLoadingModule.loadTariffs) {
        this.app.dataLoadingModule.loadTariffs()
      } else if (this.app.tariffsModule && this.app.tariffsModule.loadTariffs) {
        this.app.tariffsModule.loadTariffs()
      }
            
            // Recargar lista de EVSEs para mostrar los cambios en tariff_ids
      if (this.app.loadEvses) {
        this.app.loadEvses()
      }
            
        } catch (error) {
            console.error('❌ Error guardando tarifa:', error);
            this.app.showNotification(`Error al crear tarifa: ${error.message}`, 'error');
        }
    }

  async deleteTariff(tariffId) {
        try {
            console.log(`🗑️ Eliminando tarifa ${tariffId}...`);
            
            // Confirmar eliminación
            const confirmed = confirm(`¿Estás seguro de que quieres eliminar la tarifa ${tariffId}?\n\nEsta acción también desasociará la tarifa de todos los EVSEs que la usen.`);
            if (!confirmed) {
                return;
            }
            
      // Enviar petición DELETE al backend
      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/tariffs/${tariffId}`, {
        method: 'DELETE'
      })
            console.log('✅ Tarifa eliminada exitosamente:', result);
            
            // Mostrar notificación de éxito con información de EVSEs desasociados
            const evsesDisassociated = result.data?.evses_disassociated || 0;
            let message = 'Tarifa eliminada exitosamente';
            
            if (evsesDisassociated > 0) {
                message += ` y desasociada de ${evsesDisassociated} EVSE(s)`;
            }
            
            this.app.showNotification(message, 'success');
            
      // Recargar lista de tarifas (si existe el método)
      if (this.app.dataLoadingModule && this.app.dataLoadingModule.loadTariffs) {
        this.app.dataLoadingModule.loadTariffs()
      } else if (this.app.tariffsModule && this.app.tariffsModule.loadTariffs) {
        this.app.tariffsModule.loadTariffs()
      }
            
            // Recargar lista de EVSEs para mostrar los cambios en tariff_ids
      if (this.app.loadEvses) {
        this.app.loadEvses()
      }
            
        } catch (error) {
            console.error('❌ Error eliminando tarifa:', error);
            this.app.showNotification(`Error al eliminar tarifa: ${error.message}`, 'error');
        }
    }

  viewEmspTariff(encodedCountryCode, encodedPartyId, encodedTariffId) {
        try {
            const countryCode = decodeURIComponent(encodedCountryCode || '');
            const partyId = decodeURIComponent(encodedPartyId || '');
            const tariffId = decodeURIComponent(encodedTariffId || '');

            console.log('👁️ Viendo detalles de tarifa externa...', {
                countryCode,
                partyId,
                tariffId
            });

      const tariff = this.app.emspModule && this.app.emspModule.findEmspTariff
        ? this.app.emspModule.findEmspTariff(countryCode, partyId, tariffId)
        : null

            if (!tariff) {
                console.warn('⚠️ Tarifa externa no encontrada en la lista actual');
                this.app.showNotification('No se encontró la tarifa externa seleccionada en la lista actual.', 'warning');
                return;
            }

      const safeText = (value, fallback = 'N/A') => this.app.ui.escapeHtml(
                value !== undefined && value !== null && value !== '' ? String(value) : fallback
            );

      const parsedElements = this.app.emspModule && this.app.emspModule.parseTariffElements
        ? this.app.emspModule.parseTariffElements(tariff.elements)
        : []
            const currencyText = safeText(tariff.currency, '');
            const currencyLabel = currencyText ? ` ${currencyText}` : '';
            const elementsRows = parsedElements.reduce((rows, element, elementIndex) => {
                const priceComponents = Array.isArray(element.price_components) ? element.price_components : [];
                const restrictionsText = this.app.emspModule && this.app.emspModule.formatTariffRestrictions
                  ? this.app.emspModule.formatTariffRestrictions(element.restrictions)
                  : ''

                if (priceComponents.length === 0) {
                    rows.push(`
                        <tr>
                            <td>${elementIndex + 1}</td>
                            <td><span class="badge bg-warning text-dark">N/A</span></td>
                            <td colspan="3"><span class="text-muted">Sin price components</span></td>
                            <td class="text-wrap text-break">${restrictionsText}</td>
                        </tr>
                    `);
                    return rows;
                }

                priceComponents.forEach((component, componentIndex) => {
                    rows.push(`
                        <tr>
                            <td>${elementIndex + 1}.${componentIndex + 1}</td>
                            <td><span class="badge bg-warning text-dark">${this.app.ui.escapeHtml(component?.type || 'N/A')}</span></td>
                            <td>${component?.price ?? 'N/A'}${currencyLabel}</td>
                            <td>${component?.vat ?? 0}%</td>
                            <td>${component?.step_size ?? 1}</td>
                            <td class="text-wrap text-break">${restrictionsText}</td>
                        </tr>
                    `);
                });

                return rows;
            }, []).join('');

            const elementsTable = parsedElements.length > 0
                ? `
                    <div class="table-responsive">
                        <table class="table table-sm align-middle">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tipo</th>
                                    <th>Precio</th>
                                    <th>IVA</th>
                                    <th>Paso</th>
                                    <th>Restricciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${elementsRows}
                            </tbody>
                        </table>
                    </div>
                `
                : '<p class="text-muted mb-0">No hay elementos de precio disponibles</p>';

            const modalHtml = `
                <div class="modal fade" id="viewEmspTariffModal" tabindex="-1">
                    <div class="modal-dialog modal-xl modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-eye"></i> Detalles de la Tarifa Externa
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row g-4">
                                    <div class="col-lg-5">
                                        <h6>Información Básica</h6>
                                        <table class="table table-sm">
                                            <tr><td><strong>Tariff ID (OCPI):</strong></td><td><code>${safeText(tariff.tariff_id || tariff.id)}</code></td></tr>
                                            <tr><td><strong>ID Interno:</strong></td><td><code>${safeText(tariff.id)}</code></td></tr>
                                            <tr><td><strong>eMSP:</strong></td><td><span class="badge bg-primary">${safeText(tariff.external_operator_party_id)}</span> <span class="badge bg-secondary">${safeText(tariff.external_operator_country_code)}</span></td></tr>
                                            <tr><td><strong>Nombre:</strong></td><td>${tariff.name ? safeText(tariff.name) : '<span class="text-muted">Sin nombre</span>'}</td></tr>
                                            <tr><td><strong>Tipo:</strong></td><td><span class="badge bg-info">${safeText(tariff.type)}</span></td></tr>
                                            <tr><td><strong>Moneda:</strong></td><td><span class="badge bg-success">${safeText(tariff.currency)}</span></td></tr>
                                            <tr><td><strong>Válido Desde:</strong></td><td>${tariff.start_date_time ? new Date(tariff.start_date_time).toLocaleString() : 'N/A'}</td></tr>
                                            <tr><td><strong>Válido Hasta:</strong></td><td>${tariff.end_date_time ? new Date(tariff.end_date_time).toLocaleString() : 'N/A'}</td></tr>
                                            <tr><td><strong>Última Actualización:</strong></td><td>${tariff.last_updated ? new Date(tariff.last_updated).toLocaleString() : 'N/A'}</td></tr>
                                        </table>
                                    </div>
                                    <div class="col-lg-7">
                                        <h6>Elementos de Precio</h6>
                                        ${elementsTable}
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <h6>JSON Completo</h6>
                                    <pre class="bg-light p-3 rounded small">${this.app.ui.escapeHtml(JSON.stringify(tariff, null, 2))}</pre>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const existingModal = document.getElementById('viewEmspTariffModal');
            if (existingModal) {
                existingModal.remove();
            }

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const modalElement = document.getElementById('viewEmspTariffModal');
            if (!modalElement) {
                throw new Error('No se pudo crear el modal de detalles de tarifa externa');
            }

            const modal = new bootstrap.Modal(modalElement);
            modal.show();

        } catch (error) {
            console.error('❌ Error mostrando detalles de tarifa externa:', error);
            this.app.showNotification(`Error al ver tarifa externa: ${error.message}`, 'error');
        }
    }

  async viewEmspTariffEvses(encodedCountryCode, encodedPartyId, encodedTariffId) {
        try {
            const countryCode = decodeURIComponent(encodedCountryCode || '');
            const partyId = decodeURIComponent(encodedPartyId || '');
            const tariffId = decodeURIComponent(encodedTariffId || '');

            console.log('🔗 Buscando EVSEs asociados a tarifa externa...', {
                countryCode,
                partyId,
                tariffId
            });

      const tariff = this.app.emspModule && this.app.emspModule.findEmspTariff
        ? this.app.emspModule.findEmspTariff(countryCode, partyId, tariffId)
        : null
            if (!tariff) {
                console.warn('⚠️ Tarifa externa no encontrada para listar EVSEs');
                this.app.showNotification('No se encontró la tarifa externa en la lista actual. Actualiza la pestaña Ext Tariffs e inténtalo nuevamente.', 'warning');
                return;
            }

      const safeText = (value, fallback = 'N/A') => this.app.ui.escapeHtml(
                value !== undefined && value !== null && value !== '' ? String(value) : fallback
            );

      const evsesEnsureResult = this.app.emspModule && this.app.emspModule.ensureEmspEvsesLoaded
        ? await this.app.emspModule.ensureEmspEvsesLoaded()
        : false
      const evses = Array.isArray(this.app.allEmspEvses) ? this.app.allEmspEvses : []
            const hasEvseDataset = evses.length > 0;

            const effectiveTariffId = (tariff.tariff_id || tariff.id || tariffId || '').trim();
            if (!effectiveTariffId) {
                console.warn('⚠️ Tarifa externa sin identificador válido. No es posible buscar EVSEs asociados.');
                this.app.showNotification('La tarifa seleccionada no tiene un identificador válido. Verifica los datos recibidos.', 'warning');
                return;
            }

            const targetTariffUpper = effectiveTariffId.toUpperCase();
            const targetPartyUpper = (partyId || tariff.external_operator_party_id || '').trim().toUpperCase();
            const targetCountryUpper = (countryCode || tariff.external_operator_country_code || '').trim().toUpperCase();

            const matchingEvses = evses.reduce((acc, evse) => {
                const evsePartyUpper = String(evse.external_operator_party_id || '').trim().toUpperCase();
                const evseCountryUpper = String(evse.external_operator_country_code || '').trim().toUpperCase();

                if (targetPartyUpper && evsePartyUpper !== targetPartyUpper) {
                    return acc;
                }
                if (targetCountryUpper && evseCountryUpper !== targetCountryUpper) {
                    return acc;
                }

                const connectors = this.app.emspModule && this.app.emspModule.parseEmspConnectors
                  ? this.app.emspModule.parseEmspConnectors(evse.connectors)
                  : []
                const connectorMatches = [];
                const searchTokens = new Set();
                const addToken = (value) => {
                    if (value === null || value === undefined) {
                        return;
                    }
                    const stringValue = String(value).trim();
                    if (!stringValue) {
                        return;
                    }
                    searchTokens.add(stringValue.toLowerCase());
                };

                addToken(effectiveTariffId);
                addToken(tariff.name);
                addToken(tariff.type);
                addToken(tariff.currency);
                addToken(tariff.external_operator_party_id || partyId);
                addToken(tariff.external_operator_country_code || countryCode);

                const evseLocationName = this.app.emspModule && this.app.emspModule.getEmspLocationName
                  ? this.app.emspModule.getEmspLocationName(evse.location_id)
                  : null
                    || evse.location_name
                    || evse.emsp_location_name
                    || evse.location?.name;

                addToken(evse.evse_id);
                addToken(evse.id);
                addToken(evse.location_id);
                addToken(evseLocationName);
                addToken(evse.status);

                connectors.forEach(connector => {
                    const connectorTariffs = this.app.emspModule && this.app.emspModule.extractTariffIdsFromConnector
                      ? this.app.emspModule.extractTariffIdsFromConnector(connector)
                      : []
                    const hasTariff = connectorTariffs.some(id => id.toUpperCase() === targetTariffUpper);
                    if (hasTariff) {
                        const normalizedTariffs = [...new Set(connectorTariffs)];
                        normalizedTariffs.forEach(addToken);
                        [
                            connector?.id,
                            connector?.connector_id,
                            connector?.uid,
                            connector?.identifier,
                            connector?.standard,
                            connector?.format,
                            connector?.power_type,
                            connector?.voltage,
                            connector?.amperage,
                            connector?.max_voltage,
                            connector?.max_amperage,
                            connector?.max_electric_power,
                            connector?.raw
                        ].forEach(addToken);

                        connectorMatches.push({
                            connector,
                            tariffs: normalizedTariffs
                        });
                    }
                });

                const evseTariffIds = [
                    ...(this.app.emspModule && this.app.emspModule.normalizeTariffIds
                      ? this.app.emspModule.normalizeTariffIds(evse.tariff_ids)
                      : []),
                    ...(this.app.emspModule && this.app.emspModule.normalizeTariffIds
                      ? this.app.emspModule.normalizeTariffIds(evse.tariffs)
                      : []),
                    ...(this.app.emspModule && this.app.emspModule.normalizeTariffIds
                      ? this.app.emspModule.normalizeTariffIds(evse.tariff)
                      : [])
                ];
                const hasEvseLevelTariff = evseTariffIds.some(id => id.toUpperCase() === targetTariffUpper);

                if (hasEvseLevelTariff) {
                    evseTariffIds.forEach(addToken);
                    addToken('evse');
                    addToken('direct');
                }

                if (connectorMatches.length === 0 && !hasEvseLevelTariff) {
                    return acc;
                }

                acc.push({
                    evse,
                    connectorMatches,
                    hasEvseLevelTariff,
                    searchText: Array.from(searchTokens).join(' ')
                });

                return acc;
            }, []).sort((a, b) => {
                const evseIdA = (a.evse.evse_id || a.evse.id || '').toString().toUpperCase();
                const evseIdB = (b.evse.evse_id || b.evse.id || '').toString().toUpperCase();
                if (evseIdA < evseIdB) return -1;
                if (evseIdA > evseIdB) return 1;
                return 0;
            });
            const totalMatches = matchingEvses.length;

            const connectorDetailsToHtml = (match) => {
                if (!match || !Array.isArray(match.connectorMatches) || match.connectorMatches.length === 0) {
                    return '<span class="text-muted">Sin coincidencias a nivel conector</span>';
                }

                return match.connectorMatches.map(({ connector, tariffs }, index) => {
                    const connectorIdRaw = connector && (connector.id || connector.connector_id || connector.uid || connector.identifier);
                    const connectorLabel = connectorIdRaw
                        ? this.app.ui.escapeHtml(String(connectorIdRaw))
                        : `Conector ${index + 1}`;

                    const metaParts = [];
                    if (connector && connector.standard) {
                        metaParts.push(this.app.ui.escapeHtml(String(connector.standard)))
                    }
                    if (connector && connector.format) {
                        metaParts.push(this.app.ui.escapeHtml(String(connector.format)))
                    }
                    if (connector && connector.power_type) {
                        metaParts.push(this.app.ui.escapeHtml(String(connector.power_type)))
                    }
                    const metaHtml = metaParts.length ? `<span class="text-muted small">${metaParts.join(' · ')}</span>` : '';

                    const tariffsBadges = (tariffs || []).map(id =>
                        `<span class="badge bg-light text-dark border me-1">${this.app.ui.escapeHtml(id)}</span>`
                    ).join('');
                    const tariffsHtml = tariffsBadges
                        ? `<div class="small mt-1">Tariffs: ${tariffsBadges}</div>`
                        : '';

                    const rawHtml = connector && connector.raw
                        ? `<div class="small text-muted">${this.app.ui.escapeHtml(String(connector.raw))}</div>`
                        : '';

                    return `
                        <div class="mb-2">
                            <span class="badge bg-primary me-2">${connectorLabel}</span>
                            ${metaHtml}
                            ${tariffsHtml}
                            ${rawHtml}
                        </div>
                    `;
                }).join('');
            };

            const buildRowsHtml = (matchesArray) => matchesArray.map(match => {
                const evse = match.evse || {};
                const evseLevelHtml = match.hasEvseLevelTariff
                    ? '<div class="mb-2"><span class="badge bg-success">Asignada directamente al EVSE</span></div>'
                    : '';
                const locationName = this.getEmspLocationName(evse.location_id)
                    || evse.location_name
                    || evse.emsp_location_name
                    || (evse.location && evse.location.name);
                const locationHtml = locationName
                    ? `
                        <div>${this.app.ui.escapeHtml(locationName)}</div>
                        <div class="small text-muted">${this.app.ui.escapeHtml(evse.location_id || 'Sin ID')}</div>
                    `.trim()
                    : `
                        <div>${this.app.ui.escapeHtml(evse.location_id || 'N/A')}</div>
                    `.trim();

                return `
                    <tr>
                        <td>
                            <code>${this.app.ui.escapeHtml(evse.evse_id || evse.id || 'N/A')}</code>
                            <div class="small text-muted">UID: ${this.app.ui.escapeHtml(evse.id || 'N/A')}</div>
                        </td>
                        <td>${locationHtml}</td>
                        <td class="text-wrap text-break">
                            ${evseLevelHtml}
                            ${connectorDetailsToHtml(match)}
                        </td>
                        <td>${evse.last_updated ? new Date(evse.last_updated).toLocaleString() : 'N/A'}</td>
                    </tr>
                `;
            }).join('');

            const evseTable = totalMatches > 0
                ? `
                    <div class="table-responsive">
                        <table class="table table-sm align-middle">
                            <thead>
                                <tr>
                                    <th>EVSE ID</th>
                                    <th>Location</th>
                                    <th>Coincidencias</th>
                                    <th>Última Actualización</th>
                                </tr>
                            </thead>
                            <tbody id="emspTariffEvsesTableBody">
                                ${buildRowsHtml(matchingEvses)}
                            </tbody>
                        </table>
                    </div>
                `
                : (() => {
                    let message = 'No se encontraron EVSEs que usen esta tarifa externa.';
                    if (!hasEvseDataset) {
                        message = evsesEnsureResult
                            ? 'No hay EVSEs externos almacenados para este eMSP en la base local.'
                            : 'No fue posible cargar los EVSEs externos automáticamente. Abre la pestaña Ext EVSEs y presiona "Actualizar" para sincronizar los datos.';
                    }
                    return `
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle"></i>
                        ${message}
                    </div>
                `;
                })();

            const summaryHtml = `
                <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <span class="badge bg-primary" id="emspTariffEvsesCountBadge">
                        ${totalMatches} EVSE${totalMatches === 1 ? '' : 's'} asociados
                    </span>
                    <span class="badge bg-info">${safeText(tariff.external_operator_party_id || partyId)}</span>
                    <span class="badge bg-secondary">${safeText(tariff.external_operator_country_code || countryCode)}</span>
                    <span class="badge bg-light text-dark border">${safeText(tariff.currency)}</span>
                </div>
            `;

            const searchHtml = `
                <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <div class="flex-grow-1">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text"
                                   class="form-control"
                                   id="emspTariffEvsesSearch"
                                   placeholder="Buscar por EVSE, location o conector..."
                                   ${totalMatches === 0 ? 'disabled' : ''}>
                        </div>
                    </div>
                    <small class="text-muted" id="emspTariffEvsesCountText">
                        ${totalMatches > 0
                            ? `Mostrando ${totalMatches} de ${totalMatches} EVSE${totalMatches === 1 ? '' : 's'}`
                            : 'Sin EVSEs asociados'}
                    </small>
                </div>
            `;

            const headerHtml = `
                <div class="mb-3">
                    <h6 class="mb-1">Tarifa <code>${safeText(tariff.tariff_id || tariff.id)}</code></h6>
                    <div class="small text-muted">
                        ${tariff.name ? safeText(tariff.name) : 'Sin nombre'} · ${safeText(tariff.type)}
                    </div>
                </div>
            `;

            const modalHtml = `
                <div class="modal fade" id="viewEmspTariffEvsesModal" tabindex="-1">
                    <div class="modal-dialog modal-lg modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-plug"></i> EVSEs asociados a la tarifa externa
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${headerHtml}
                                ${summaryHtml}
                                ${searchHtml}
                                ${evseTable}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const existingModal = document.getElementById('viewEmspTariffEvsesModal');
            if (existingModal) {
                existingModal.remove();
            }

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const modalElement = document.getElementById('viewEmspTariffEvsesModal');
            if (!modalElement) {
                throw new Error('No se pudo crear el modal de EVSEs asociados.');
            }

            const tableBody = document.getElementById('emspTariffEvsesTableBody');
            const searchInput = document.getElementById('emspTariffEvsesSearch');
            const countBadge = document.getElementById('emspTariffEvsesCountBadge');
            const countText = document.getElementById('emspTariffEvsesCountText');

            const filterMatches = (query = '') => {
                const normalized = (query || '').toString().trim().toLowerCase();
                if (!normalized) {
                    return matchingEvses;
                }
                const terms = normalized.split(/\s+/).filter(Boolean);
                if (terms.length === 0) {
                    return matchingEvses;
                }

                return matchingEvses.filter(match => {
                    const searchPool = match.searchText || '';
                    return terms.every(term => searchPool.includes(term));
                });
            };

            const updateCountDisplay = (filteredLength) => {
                if (countBadge) {
                    countBadge.textContent = `${filteredLength} de ${totalMatches} EVSE${totalMatches === 1 ? '' : 's'} asociados`;
                }
                if (countText) {
                    if (totalMatches === 0) {
                        countText.textContent = 'Sin EVSEs asociados';
                    } else {
                        countText.textContent = `Mostrando ${filteredLength} de ${totalMatches} EVSE${totalMatches === 1 ? '' : 's'}`;
                    }
                }
            };

            const renderTableBody = (query = '') => {
                const filtered = filterMatches(query);
                if (tableBody) {
                    if (filtered.length === 0) {
                        const safeQuery = this.app.ui.escapeHtml(query.trim())
                        tableBody.innerHTML = `
                            <tr>
                                <td colspan="4" class="text-center text-muted">
                                    <i class="bi bi-search"></i> No se encontraron EVSEs${safeQuery ? ` para <span class="fw-semibold">${safeQuery}</span>` : ''}
                                </td>
                            </tr>
                        `;
                    } else {
                        tableBody.innerHTML = buildRowsHtml(filtered);
                    }
                }
                updateCountDisplay(filtered.length);
            };

            if (tableBody) {
                renderTableBody('');
                if (searchInput) {
                    searchInput.addEventListener('input', () => renderTableBody(searchInput.value));
                }
            } else {
                updateCountDisplay(totalMatches);
            }

            const modal = new bootstrap.Modal(modalElement);
            modal.show();

        } catch (error) {
            console.error('❌ Error listando EVSEs asociados a tarifa externa:', error);
            this.app.showNotification(`Error al consultar EVSEs asociados a la tarifa: ${error.message}`, 'error');
        }
    }

  async viewTariff(tariffId) {
        try {
            console.log(`👁️ Viendo detalles de tarifa ${tariffId}...`);
            
      // Obtener detalles de la tarifa
      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/tariffs/${tariffId}`)
            const tariff = result.data;
            
            // Crear modal para mostrar detalles
            const modalHtml = `
                <div class="modal fade" id="viewTariffModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-eye"></i> Detalles de la Tarifa
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6>Información Básica</h6>
                                        <table class="table table-sm">
                                            <tr><td><strong>ID:</strong></td><td><code>${tariff.id}</code></td></tr>
                                            <tr><td><strong>CPO:</strong></td><td><span class="badge bg-primary">${tariff.party_id}</span> <span class="badge bg-secondary">${tariff.country_code}</span></td></tr>
                                            <tr><td><strong>Tipo:</strong></td><td><span class="badge bg-info">${tariff.type || 'N/A'}</span></td></tr>
                                            <tr><td><strong>Moneda:</strong></td><td><span class="badge bg-success">${tariff.currency || 'N/A'}</span></td></tr>
                                            <tr><td><strong>Válido Desde:</strong></td><td>${tariff.start_date_time ? new Date(tariff.start_date_time).toLocaleString() : 'N/A'}</td></tr>
                                            <tr><td><strong>Válido Hasta:</strong></td><td>${tariff.end_date_time ? new Date(tariff.end_date_time).toLocaleString() : 'N/A'}</td></tr>
                                            <tr><td><strong>Última Actualización:</strong></td><td>${new Date(tariff.last_updated).toLocaleString()}</td></tr>
                                        </table>
                                    </div>
                                    <div class="col-md-6">
                                        <h6>Elementos de Precio</h6>
                                        ${tariff.elements && tariff.elements.length > 0 ? 
                                            `<div class="table-responsive">
                                                <table class="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Tipo</th>
                                                            <th>Precio</th>
                                                            <th>IVA</th>
                                                            <th>Paso</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${tariff.elements.map(el => 
                                                            el.price_components ? el.price_components.map(pc => `
                                                                <tr>
                                                                    <td><span class="badge bg-warning">${pc.type}</span></td>
                                                                    <td>${pc.price}</td>
                                                                    <td>${pc.vat || 0}%</td>
                                                                    <td>${pc.step_size || 1}</td>
                                                                </tr>
                                                            `).join('') : ''
                                                        ).join('')}
                                                    </tbody>
                                                </table>
                                            </div>` : 
                                            '<p class="text-muted">No hay elementos de precio</p>'
                                        }
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remover modal existente si hay uno
            const existingModal = document.getElementById('viewTariffModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Agregar modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('viewTariffModal'));
            modal.show();
            
        } catch (error) {
            console.error('❌ Error viendo tarifa:', error);
            this.app.showNotification(`Error al ver tarifa: ${error.message}`, 'error');
        }
    }

  async editTariff(tariffId) {
        try {
            console.log(`✏️ Editando tarifa ${tariffId}...`);
            
      // Obtener detalles de la tarifa
      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/tariffs/${tariffId}`)
            const tariff = result.data;
            
            // Mostrar notificación de que la edición no está implementada
            this.app.showNotification('La funcionalidad de edición de tarifas no está implementada aún', 'info');
            
            // TODO: Implementar modal de edición de tarifas
            console.log('Tarifa a editar:', tariff);
            
        } catch (error) {
            console.error('❌ Error editando tarifa:', error);
            this.app.showNotification(`Error al editar tarifa: ${error.message}`, 'error');
        }
    }

  validateTariffForm() {
        try {
            const form = document.getElementById('createTariffForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
            
            // Validar que al menos un elemento de tarifa esté configurado
            const elements = document.querySelectorAll('.tariff-element');
            if (elements.length === 0) {
                this.app.showNotification('Debe configurar al menos un elemento de tarifa', 'error');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error validando formulario de tarifa:', error);
            return false;
        }
    }

  collectTariffFormData() {
        try {
            const formData = {
                id: document.getElementById('tariffId').value,
                type: document.getElementById('tariffType').value,
                currency: document.getElementById('tariffCurrency').value,
                location_id: document.getElementById('tariffLocation').value,
                start_date_time: document.getElementById('tariffStartDate').value || null,
                end_date_time: document.getElementById('tariffEndDate').value || null,
                min_price: parseFloat(document.getElementById('tariffMinPrice').value) || null,
                max_price: parseFloat(document.getElementById('tariffMaxPrice').value) || null,
                tariff_alt_text: document.getElementById('tariffAltText').value || null,
                tariff_alt_url: document.getElementById('tariffAltUrl').value || null,
                elements: []
            };
            
            // Recopilar elementos de tarifa
            const elements = document.querySelectorAll('.tariff-element');
            elements.forEach(element => {
                const type = element.querySelector('.tariff-component-type').value;
                const price = parseFloat(element.querySelector('.tariff-component-price').value);
                const step = parseFloat(element.querySelector('.tariff-component-step').value) || null;
                
                if (type && !isNaN(price)) {
                    formData.elements.push({
                        component_type: type,
                        price: price,
                        step: step
                    });
                }
            });
            
            console.log('📊 Datos de tarifa recopilados:', formData);
            return formData;
        } catch (error) {
            console.error('❌ Error recopilando datos de tarifa:', error);
            return null;
        }
    }
}
