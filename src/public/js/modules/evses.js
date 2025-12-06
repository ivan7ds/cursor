/**
 * Funciones del Modal de Creación de EVSEs
 * Extraído de app.js (líneas 5757-6451)
 */

import { ApiUtils } from '../utils/api.js'

export class EVSEsModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES DEL MODAL DE CREACIÓN DE EVSEs =====

  setupEvseModalEventListeners () {
    try {
      console.log('🔌 Configurando event listeners del modal de EVSEs...')

      // Botón para crear EVSE
      const createEvseBtn = document.getElementById('createEvseBtn')
      if (createEvseBtn) {
        createEvseBtn.addEventListener('click', () => {
          this.showCreateEvseModal()
        })
        console.log('✅ Event listener para createEvseBtn agregado')
      }

      // Botón para cambiar estado de EVSE (delegar a evseStatusModule)
      const changeEvseStatusBtn = document.getElementById('changeEvseStatusBtn')
      if (changeEvseStatusBtn && this.app.evseStatusModule) {
        changeEvseStatusBtn.addEventListener('click', () => {
          this.app.evseStatusModule.showChangeEvseStatusModal()
        })
        console.log('✅ Event listener para changeEvseStatusBtn agregado')
      }

            // Botón para generar UID de EVSE
            const generateEvseUidBtn = document.getElementById('generateEvseUidBtn');
            if (generateEvseUidBtn) {
                generateEvseUidBtn.addEventListener('click', () => {
                    this.generateEvseUid();
                });
                console.log('✅ Event listener para generateEvseUidBtn agregado');
            }

            // Botón para agregar conector
            const addEvseConnectorBtn = document.getElementById('addEvseConnector');
            if (addEvseConnectorBtn) {
                addEvseConnectorBtn.addEventListener('click', () => {
                    this.addEvseConnector();
                });
                console.log('✅ Event listener para addEvseConnector agregado');
            }

            // Botón para guardar EVSE
            const saveEvseBtn = document.getElementById('saveEvseBtn');
            if (saveEvseBtn) {
                saveEvseBtn.addEventListener('click', () => {
                    this.saveEvse();
                });
                console.log('✅ Event listener para saveEvseBtn agregado');
            }

      // Event listeners para cerrar el modal
      this.setupEvseModalCloseEventListeners()

      // Configurar event listeners para el conector inicial
      this.setupConnectorEventListeners(0)

      console.log('✅ Event listeners del modal de EVSEs configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners del modal de EVSEs:', error)
    }
  }

  // Nota: Las funciones de cambio de estado EVSE están en evseStatusModule

    setupEvseModalCloseEventListeners() {
        try {
            // Botón de cerrar (X)
            const closeBtn = document.querySelector('#createEvseModal .btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeEvseModal();
                });
            }

            // Botón Cancelar
            const cancelBtn = document.querySelector('#createEvseModal .btn-secondary');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeEvseModal();
                });
            }

            // Cerrar al hacer clic en el backdrop
            const modalElement = document.getElementById('createEvseModal');
            if (modalElement) {
                modalElement.addEventListener('click', (event) => {
                    if (event.target === modalElement) {
                        this.closeEvseModal();
                    }
                });
            }

            // Cerrar con tecla Escape
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modalElement && modalElement.classList.contains('show')) {
                    this.closeEvseModal();
                }
            });

            console.log('✅ Event listeners de cierre del modal de EVSEs configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners de cierre del modal de EVSEs:', error);
        }
    }

    closeEvseModal() {
        try {
            const modalElement = document.getElementById('createEvseModal');
            if (modalElement) {
                // Intentar usar Bootstrap API si está disponible
                try {
                    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) {
                            modal.hide();
                            console.log('✅ Modal de EVSE cerrado usando Bootstrap API');
                            return;
                        }
                    }
                } catch (bootstrapError) {
                    console.log('⚠️ Bootstrap API no disponible, usando fallback manual');
                }
                
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
                
                // Limpiar formulario
                this.resetEvseForm();
                
                console.log('✅ Modal de EVSE cerrado manualmente');
            }
        } catch (error) {
            console.error('❌ Error cerrando modal de EVSE:', error);
        }
    }

    resetEvseForm() {
        try {
            const form = document.getElementById('createEvseForm');
            if (form) {
                form.reset();
                
                // Restablecer valores por defecto
                document.getElementById('evseStatus').value = 'AVAILABLE';
                
                // Generar nuevos UIDs
                this.generateEvseUid();
                this.generateConnectorIds();
                
                // Limpiar contenedor de conectores (mantener solo uno)
                const container = document.getElementById('evseConnectorsContainer');
                if (container) {
                    container.innerHTML = '';
                    // No agregar conector adicional, ya hay uno en el HTML
                }
                
                console.log('✅ Formulario de EVSE reseteado');
            }
        } catch (error) {
            console.error('❌ Error reseteando formulario de EVSE:', error);
        }
    }

    showCreateEvseModal() {
        try {
            console.log('🔌 Mostrando modal de creación de EVSE...');
            
            const modalElement = document.getElementById('createEvseModal');
            if (!modalElement) {
                throw new Error('Elemento modal de EVSE no encontrado');
            }
            
            // Intentar usar Bootstrap API si está disponible
            try {
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                    console.log('✅ Modal mostrado usando Bootstrap API');
                } else {
                    throw new Error('Bootstrap API no disponible');
                }
            } catch (bootstrapError) {
                console.log('⚠️ Bootstrap API no disponible, usando fallback manual');
                
                // Fallback: mostrar el modal manualmente
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
            
            // Generar UIDs automáticamente al abrir el modal
            this.generateEvseUid();
            this.generateConnectorIds();
            
            // Cargar locations para el selector
            this.loadLocationsForEvse();
            
            // Configurar valores por defecto
            document.getElementById('evseStatus').value = 'AVAILABLE';
            
        } catch (error) {
            console.error('❌ Error mostrando modal de creación de EVSE:', error);
        }
    }

    generateEvseUid() {
        try {
            console.log('🆔 Generando UID único para EVSE...');
            
            // Generar UUID v4
            const uuid = this.generateUUID();
            
            // Asignar al campo
            const evseUidField = document.getElementById('evseUid');
            if (evseUidField) {
                evseUidField.value = uuid;
                console.log('✅ UID único generado:', uuid);
            } else {
                console.warn('⚠️ Campo evseUid no encontrado');
            }
        } catch (error) {
            console.error('❌ Error generando UID de EVSE:', error);
        }
    }

    generateConnectorIds() {
        try {
            console.log('🔌 Generando IDs únicos para conectores...');
            
            const connectorElements = document.querySelectorAll('.evse-connector');
            connectorElements.forEach((connectorElement, index) => {
                const idField = connectorElement.querySelector('.connector-id');
                if (idField && !idField.value) {
                    const connectorId = (index + 1).toString();
                    idField.value = connectorId;
                    console.log(`✅ ID de conector ${index + 1} generado:`, connectorId);
                }
            });
        } catch (error) {
            console.error('❌ Error generando IDs de conectores:', error);
        }
    }

    addEvseConnector() {
        try {
            console.log('🔌 Agregando nuevo conector...');
            
            const container = document.getElementById('evseConnectorsContainer');
            if (!container) {
                throw new Error('Contenedor de conectores no encontrado');
            }
            
            // Obtener el siguiente índice de conector
            const existingConnectors = container.querySelectorAll('.evse-connector');
            const nextConnectorIndex = existingConnectors.length;
            
            const connectorHtml = `
                <div class="evse-connector border rounded p-3 mb-2" data-connector-index="${nextConnectorIndex}">
                    <div class="row">
                        <div class="col-md-3">
                            <label class="form-label">ID del Conector</label>
                            <div class="input-group">
                                <input type="text" class="form-control connector-id" required readonly>
                                <button type="button" class="btn btn-outline-secondary btn-sm generate-connector-id">
                                    <i class="bi bi-arrow-clockwise"></i> Generar
                                </button>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Standard</label>
                            <select class="form-select connector-standard" required>
                                <option value="">Seleccionar...</option>
                                <option value="CHADEMO">CHADEMO (DC)</option>
                                <option value="CHAOJI">CHAOJI (DC)</option>
                                <option value="DOMESTIC_A">DOMESTIC_A (NEMA 1-15)</option>
                                <option value="DOMESTIC_B">DOMESTIC_B (NEMA 5-15)</option>
                                <option value="DOMESTIC_C">DOMESTIC_C (CEE 7/17)</option>
                                <option value="DOMESTIC_D">DOMESTIC_D (3 pin)</option>
                                <option value="DOMESTIC_E">DOMESTIC_E (CEE 7/5)</option>
                                <option value="DOMESTIC_F">DOMESTIC_F (Schuko)</option>
                                <option value="DOMESTIC_G">DOMESTIC_G (BS 1363)</option>
                                <option value="DOMESTIC_H">DOMESTIC_H (SI-32)</option>
                                <option value="DOMESTIC_I">DOMESTIC_I (AS 3112)</option>
                                <option value="DOMESTIC_J">DOMESTIC_J (SEV 1011)</option>
                                <option value="IEC_62196_T1">IEC_62196_T1 (Type 1)</option>
                                <option value="IEC_62196_T1_COMBO">IEC_62196_T1_COMBO</option>
                                <option value="IEC_62196_T2">IEC_62196_T2 (Type 2)</option>
                                <option value="IEC_62196_T2_COMBO">IEC_62196_T2_COMBO</option>
                                <option value="IEC_62196_T3A">IEC_62196_T3A</option>
                                <option value="IEC_62196_T3C">IEC_62196_T3C</option>
                                <option value="TESLA_R">TESLA_R</option>
                                <option value="TESLA_S">TESLA_S</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Format</label>
                            <select class="form-select connector-format" required>
                                <option value="">Seleccionar...</option>
                                <option value="SOCKET">SOCKET (Enchufe)</option>
                                <option value="CABLE">CABLE (Cable adjunto)</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Power Type</label>
                            <select class="form-select connector-power-type" required>
                                <option value="">Seleccionar...</option>
                                <option value="AC_1_PHASE">AC_1_PHASE (AC monofásico)</option>
                                <option value="AC_2_PHASE">AC_2_PHASE (AC bifásico)</option>
                                <option value="AC_2_PHASE_SPLIT">AC_2_PHASE_SPLIT (AC bifásico split)</option>
                                <option value="AC_3_PHASE">AC_3_PHASE (AC trifásico)</option>
                                <option value="DC">DC (Corriente continua)</option>
                            </select>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-3">
                            <label class="form-label">Voltaje (V)</label>
                            <input type="number" class="form-control connector-voltage" value="230" min="0" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Amperaje (A)</label>
                            <input type="number" class="form-control connector-amperage" value="32" min="0" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Potencia Máxima (W)</label>
                            <div class="input-group">
                                <input type="number" class="form-control connector-max-power" min="0" placeholder="Calculado automáticamente">
                                <button type="button" class="btn btn-outline-secondary btn-sm calculate-power" title="Calcular automáticamente">
                                    <i class="bi bi-calculator"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Potencia Calculada</label>
                            <input type="text" class="form-control connector-calculated-power" readonly placeholder="0 W">
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12">
                            <label class="form-label">Tarifas Asociadas</label>
                            <div class="connector-tariffs-container border rounded p-2 mb-2" style="min-height: 50px;">
                                <div class="text-muted">No hay tarifas asignadas</div>
                            </div>
                            <button type="button" class="btn btn-outline-primary btn-sm add-tariff-to-connector">
                                <i class="bi bi-plus"></i> Agregar Tarifa
                            </button>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-12">
                            <button type="button" class="btn btn-outline-danger btn-sm remove-connector">
                                <i class="bi bi-trash"></i> Eliminar Conector
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', connectorHtml);
            
            // Generar ID para el nuevo conector
            const newConnector = container.lastElementChild;
            const idField = newConnector.querySelector('.connector-id');
            if (idField) {
                idField.value = this.generateConnectorId();
            }
            
            // Configurar event listeners para el nuevo conector
            this.setupConnectorEventListeners(nextConnectorIndex);
            
            // Event listener para el botón de generar ID
            const generateBtn = newConnector.querySelector('.generate-connector-id');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => {
                    idField.value = this.generateConnectorId();
                });
            }
            
            // Event listener para el botón de eliminar
            const removeBtn = newConnector.querySelector('.remove-connector');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    if (container.children.length > 1) {
                        newConnector.remove();
                    } else {
                        this.app.showNotification('Debe mantener al menos un conector', 'warning');
                    }
                });
            }
            
            // Event listeners para calcular potencia máxima
            const voltageField = newConnector.querySelector('.connector-voltage');
            const amperageField = newConnector.querySelector('.connector-amperage');
            const maxPowerField = newConnector.querySelector('.connector-max-power');
            
            if (voltageField && amperageField && maxPowerField) {
                const calculatePower = () => {
                    const voltage = parseFloat(voltageField.value) || 0;
                    const amperage = parseFloat(amperageField.value) || 0;
                    const maxPower = voltage * amperage;
                    maxPowerField.value = maxPower;
                };
                
                voltageField.addEventListener('input', calculatePower);
                amperageField.addEventListener('input', calculatePower);
                
                // Calcular potencia inicial
                calculatePower();
            }
            
            console.log('✅ Nuevo conector agregado');
        } catch (error) {
            console.error('❌ Error agregando conector:', error);
        }
    }

    async loadLocationsForEvse() {
        try {
            console.log('📍 Cargando locations para selector de EVSE...');
            
      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/locations?limit=1000`)
            
      const locations = data.data || []
            
            // Llenar selector de locations (crear EVSE)
            const locationSelect = document.getElementById('evseLocation');
            if (locationSelect) {
                locationSelect.innerHTML = '<option value="">Seleccionar location...</option>';
                
      locations.forEach(location => {
        const option = document.createElement('option')
        option.value = location.id
        option.textContent = `${this.app.ui.escapeHtml(location.name || '')} - ${this.app.ui.escapeHtml(location.city || '')}`
        locationSelect.appendChild(option)
      })
                
                console.log(`✅ ${locations.length} locations cargadas en el selector de creación`);
            }
            
            // Llenar selector de locations (editar EVSE)
            const editLocationSelect = document.getElementById('editEvseLocation');
            if (editLocationSelect) {
                editLocationSelect.innerHTML = '<option value="">Seleccionar location...</option>';
                
                locations.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.id;
                    option.textContent = `${location.name} - ${location.city}`;
                    editLocationSelect.appendChild(option);
                });
                
                console.log(`✅ ${locations.length} locations cargadas en el selector de edición`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando locations para EVSE:', error);
            this.app.showNotification(`Error al cargar locations: ${error.message}`, 'error');
        }
    }

    async saveEvse() {
        try {
            console.log('💾 Guardando EVSE...');
            
            // Validar formulario
            if (!this.validateEvseForm()) {
                return;
            }
            
            // Recopilar datos del formulario
            const evseData = this.collectEvseFormData();
            
      // Enviar al backend
      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/evses`, {
        method: 'POST',
        body: JSON.stringify(evseData)
      })
            console.log('✅ EVSE creado exitosamente:', result);
            
            // Mostrar notificación de éxito
            this.app.showNotification('EVSE creado exitosamente', 'success');
            
            // Cerrar modal
            this.closeEvseModal();
            
      // Recargar lista de EVSEs (si existe el método)
      if (this.app.loadEvses) {
        this.app.loadEvses()
      }
            
        } catch (error) {
            console.error('❌ Error guardando EVSE:', error);
            this.app.showNotification(`Error al crear EVSE: ${error.message}`, 'error');
        }
    }

    validateEvseForm() {
        try {
            const form = document.getElementById('createEvseForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
            
            // Verificar que al menos un capability esté seleccionado
            const capabilities = document.querySelectorAll('input[type="checkbox"]:checked');
            if (capabilities.length === 0) {
                this.app.showNotification('Debe seleccionar al menos una capability', 'warning');
                return false;
            }
            
            // Verificar que al menos un conector esté configurado
            const connectors = document.querySelectorAll('.evse-connector');
            if (connectors.length === 0) {
                this.app.showNotification('Debe configurar al menos un conector', 'warning');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error validando formulario de EVSE:', error);
            return false;
        }
    }

    collectEvseFormData() {
        try {
            // Obtener location seleccionada
            const locationId = document.getElementById('evseLocation').value;
            const locationSelect = document.getElementById('evseLocation');
            const selectedOption = locationSelect.options[locationSelect.selectedIndex];
            const locationName = selectedOption.textContent.split(' - ')[0];
            
            // Obtener capabilities seleccionadas (solo las del formulario de creación de EVSE)
            const capabilities = Array.from(document.querySelectorAll('#createEvseForm input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            
            // Obtener conectores
            const connectors = Array.from(document.querySelectorAll('.evse-connector')).map(connector => {
                const voltage = parseFloat(connector.querySelector('.connector-voltage').value) || 0;
                const amperage = parseFloat(connector.querySelector('.connector-amperage').value) || 0;
                const maxPowerInput = connector.querySelector('.connector-max-power');
                const maxPower = maxPowerInput.value ? parseFloat(maxPowerInput.value) : (voltage * amperage);
                
                // Recopilar tarifas del conector
                const tariffIds = [];
                const tariffSelects = connector.querySelectorAll('.connector-tariff-select');
                tariffSelects.forEach(select => {
                    if (select.value && select.value.trim() !== '') {
                        tariffIds.push(select.value.trim());
                    }
                });
                
                return {
                    id: connector.querySelector('.connector-id').value,
                    standard: connector.querySelector('.connector-standard').value,
                    format: connector.querySelector('.connector-format').value,
                    power_type: connector.querySelector('.connector-power-type').value,
                    max_voltage: voltage,
                    max_amperage: amperage,
                    max_electric_power: maxPower,
                    tariff_ids: tariffIds,
                    last_updated: new Date().toISOString()
                };
            });
            
            // Validar que las variables de entorno estén configuradas
            if (!window.OCPI_COUNTRY_CODE || !window.OCPI_PARTY_ID) {
                throw new Error('❌ Variables de entorno OCPI no configuradas. Por favor, reinicia la aplicación y asegúrate de que OCPI_PARTY_ID y OCPI_COUNTRY_CODE estén definidas en tu archivo .env');
            }

            const formData = {
                uid: document.getElementById('evseUid').value,
                evse_id: `${window.OCPI_COUNTRY_CODE}*${window.OCPI_PARTY_ID}*E${document.getElementById('evseUid').value.substring(0, 8)}`,
                country_code: window.OCPI_COUNTRY_CODE,
                party_id: window.OCPI_PARTY_ID,
                location_id: locationId,
                status: document.getElementById('evseStatus').value,
                capabilities: capabilities,
                connectors: connectors,
                physical_reference: document.getElementById('evsePhysicalReference').value || null,
                last_updated: new Date().toISOString()
            };
            
      console.log('📊 Datos de EVSE recopilados:', formData)
      return formData
    } catch (error) {
      console.error('❌ Error recopilando datos de EVSE:', error)
      return null
    }
  }

  generateUUID () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
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

  setupConnectorEventListeners (connectorIndex) {
    // Esta función puede ser implementada más adelante si es necesaria
    // Por ahora, los event listeners se configuran directamente en addEvseConnector
  }
}
