/**
 * Funciones de Edición de EVSEs
 * Extraído de app.js (líneas 6641-7419)
 */

import { ApiUtils } from '../utils/api.js'

export class EVSEEditModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }


    // ===== FUNCIONES DE EDICIÓN DE EVSEs =====

  async openEditEvseModal(evseId) {
        try {
            console.log(`✏️ Abriendo modal de edición para EVSE: ${evseId}`);
            
            // Obtener los datos del EVSE
            const evseData = await this.getEvseById(evseId);
            if (!evseData) {
                this.app.showNotification('Error: No se pudo cargar la información del EVSE', 'error');
                return;
            }
            
      // Cargar las locations disponibles para el selector (delegar a evsesModule si existe)
      if (this.app.evsesModule && this.app.evsesModule.loadLocationsForEvse) {
        await this.app.evsesModule.loadLocationsForEvse()
      }
            
            // Llenar el formulario con los datos del EVSE
            await this.fillEditEvseForm(evseData);
            
            // Configurar event listeners del modal (después de que el modal esté en el DOM)
            this.setupEditEvseModalEventListeners();
            
            // Mostrar el modal
            this.showEditEvseModal();
            
        } catch (error) {
            console.error('❌ Error abriendo modal de edición de EVSE:', error);
            this.app.showNotification(`Error al abrir modal de edición: ${error.message}`, 'error');
        }
    }

  async getEvseById(evseId) {
        try {
            console.log(`📊 Obteniendo datos del EVSE: ${evseId}`);
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evseId}`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Datos del EVSE obtenidos:', data);
            
            return data.data;
            
        } catch (error) {
            console.error(`❌ Error obteniendo datos del EVSE ${evseId}:`, error);
            throw error;
        }
    }

  async fillEditEvseForm(evseData) {
        try {
            console.log('📝 Llenando formulario de edición de EVSE:', evseData);
            
            // Datos básicos
            document.getElementById('editEvseUid').value = evseData.id || '';
            document.getElementById('editEvseLocation').value = evseData.location_id || '';
            document.getElementById('editEvseStatus').value = evseData.status || '';
            document.getElementById('editEvsePhysicalReference').value = evseData.physical_reference || '';
            
            // Capabilities
            const capabilities = evseData.capabilities || [];
            const capabilityCheckboxes = document.querySelectorAll('#editEvseModal [id^="editCapability_"]');
            capabilityCheckboxes.forEach(checkbox => {
                checkbox.checked = capabilities.includes(checkbox.value);
            });
            
            // Conectores
            await this.fillEditEvseConnectors(evseData.connectors || []);
            
            console.log('✅ Formulario de edición de EVSE llenado exitosamente');
            
        } catch (error) {
            console.error('❌ Error llenando formulario de edición de EVSE:', error);
            throw error;
        }
    }

  async fillEditEvseConnectors(connectors) {
        try {
            const container = document.getElementById('editEvseConnectorsContainer');
            if (!container) {
                console.warn('⚠️ Container de conectores de edición no encontrado');
                return;
            }
            
            // Limpiar conectores existentes
            container.innerHTML = '';
            
            // Agregar cada conector
            for (let index = 0; index < connectors.length; index++) {
                const connector = connectors[index];
                this.addEditEvseConnectorHtml(connector, index);
                
                // Esperar un poco para que se renderice el HTML antes de cargar las tarifas
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Si no hay conectores, agregar uno vacío
            if (connectors.length === 0) {
                this.addEditEvseConnectorHtml({}, 0);
            }
            
            console.log(`✅ ${connectors.length} conectores cargados en el formulario de edición`);
            
        } catch (error) {
            console.error('❌ Error llenando conectores de edición:', error);
            throw error;
        }
    }

  addEditEvseConnectorHtml(connector = {}, index = 0) {
        const container = document.getElementById('editEvseConnectorsContainer');
        if (!container) return;
        
        const connectorHtml = `
            <div class="evse-connector border rounded p-3 mb-2" data-connector-index="${index}">
                <div class="row">
                    <div class="col-md-3">
                        <label class="form-label">ID del Conector</label>
                        <div class="input-group">
                            <input type="text" class="form-control connector-id" value="${connector.id || ''}" required readonly>
                            <button type="button" class="btn btn-outline-secondary btn-sm generate-edit-connector-id">
                                <i class="bi bi-arrow-clockwise"></i> Generar
                            </button>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Standard</label>
                        <select class="form-select connector-standard" required>
                            <option value="">Seleccionar...</option>
                            <option value="CHADEMO" ${connector.standard === 'CHADEMO' ? 'selected' : ''}>CHADEMO (DC)</option>
                            <option value="CHAOJI" ${connector.standard === 'CHAOJI' ? 'selected' : ''}>CHAOJI (DC)</option>
                            <option value="DOMESTIC_A" ${connector.standard === 'DOMESTIC_A' ? 'selected' : ''}>DOMESTIC_A (NEMA 1-15)</option>
                            <option value="DOMESTIC_B" ${connector.standard === 'DOMESTIC_B' ? 'selected' : ''}>DOMESTIC_B (NEMA 5-15)</option>
                            <option value="DOMESTIC_C" ${connector.standard === 'DOMESTIC_C' ? 'selected' : ''}>DOMESTIC_C (CEE 7/17)</option>
                            <option value="DOMESTIC_D" ${connector.standard === 'DOMESTIC_D' ? 'selected' : ''}>DOMESTIC_D (3 pin)</option>
                            <option value="DOMESTIC_E" ${connector.standard === 'DOMESTIC_E' ? 'selected' : ''}>DOMESTIC_E (CEE 7/5)</option>
                            <option value="DOMESTIC_F" ${connector.standard === 'DOMESTIC_F' ? 'selected' : ''}>DOMESTIC_F (Schuko)</option>
                            <option value="DOMESTIC_G" ${connector.standard === 'DOMESTIC_G' ? 'selected' : ''}>DOMESTIC_G (BS 1363)</option>
                            <option value="DOMESTIC_H" ${connector.standard === 'DOMESTIC_H' ? 'selected' : ''}>DOMESTIC_H (SI-32)</option>
                            <option value="DOMESTIC_I" ${connector.standard === 'DOMESTIC_I' ? 'selected' : ''}>DOMESTIC_I (AS 3112)</option>
                            <option value="DOMESTIC_J" ${connector.standard === 'DOMESTIC_J' ? 'selected' : ''}>DOMESTIC_J (SEV 1011)</option>
                            <option value="IEC_62196_T1" ${connector.standard === 'IEC_62196_T1' ? 'selected' : ''}>IEC_62196_T1 (Type 1)</option>
                            <option value="IEC_62196_T1_COMBO" ${connector.standard === 'IEC_62196_T1_COMBO' ? 'selected' : ''}>IEC_62196_T1_COMBO</option>
                            <option value="IEC_62196_T2" ${connector.standard === 'IEC_62196_T2' ? 'selected' : ''}>IEC_62196_T2 (Type 2)</option>
                            <option value="IEC_62196_T2_COMBO" ${connector.standard === 'IEC_62196_T2_COMBO' ? 'selected' : ''}>IEC_62196_T2_COMBO</option>
                            <option value="IEC_62196_T3A" ${connector.standard === 'IEC_62196_T3A' ? 'selected' : ''}>IEC_62196_T3A</option>
                            <option value="IEC_62196_T3C" ${connector.standard === 'IEC_62196_T3C' ? 'selected' : ''}>IEC_62196_T3C</option>
                            <option value="TESLA_R" ${connector.standard === 'TESLA_R' ? 'selected' : ''}>TESLA_R</option>
                            <option value="TESLA_S" ${connector.standard === 'TESLA_S' ? 'selected' : ''}>TESLA_S</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Format</label>
                        <select class="form-select connector-format" required>
                            <option value="">Seleccionar...</option>
                            <option value="SOCKET" ${connector.format === 'SOCKET' ? 'selected' : ''}>SOCKET (Enchufe)</option>
                            <option value="CABLE" ${connector.format === 'CABLE' ? 'selected' : ''}>CABLE (Cable adjunto)</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Power Type</label>
                        <select class="form-select connector-power-type" required>
                            <option value="">Seleccionar...</option>
                            <option value="AC_1_PHASE" ${connector.power_type === 'AC_1_PHASE' ? 'selected' : ''}>AC_1_PHASE (AC monofásico)</option>
                            <option value="AC_2_PHASE" ${connector.power_type === 'AC_2_PHASE' ? 'selected' : ''}>AC_2_PHASE (AC bifásico)</option>
                            <option value="AC_2_PHASE_SPLIT" ${connector.power_type === 'AC_2_PHASE_SPLIT' ? 'selected' : ''}>AC_2_PHASE_SPLIT (AC bifásico split)</option>
                            <option value="AC_3_PHASE" ${connector.power_type === 'AC_3_PHASE' ? 'selected' : ''}>AC_3_PHASE (AC trifásico)</option>
                            <option value="DC" ${connector.power_type === 'DC' ? 'selected' : ''}>DC (Corriente continua)</option>
                        </select>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-3">
                        <label class="form-label">Voltaje (V)</label>
                        <input type="number" class="form-control connector-voltage" value="${connector.max_voltage || 230}" min="0" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Amperaje (A)</label>
                        <input type="number" class="form-control connector-amperage" value="${connector.max_amperage || 32}" min="0" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Potencia Máxima (W)</label>
                        <div class="input-group">
                            <input type="number" class="form-control connector-max-power" value="${connector.max_electric_power || ''}" min="0" placeholder="Calculado automáticamente">
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
                            <!-- Las tarifas se cargarán dinámicamente aquí -->
                        </div>
                        <button type="button" class="btn btn-outline-primary btn-sm add-tariff-to-connector">
                            <i class="bi bi-plus"></i> Agregar Tarifa
                        </button>
                    </div>
                </div>
                ${index > 0 ? `
                    <div class="row mt-2">
                        <div class="col-12">
                            <button type="button" class="btn btn-outline-danger btn-sm remove-edit-connector">
                                <i class="bi bi-trash"></i> Eliminar Conector
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', connectorHtml);
        
        // Cargar tarifas para este conector
        this.loadConnectorTariffs(connector, index);
        
        // Configurar event listeners para este conector
        this.setupConnectorEventListeners(index);
    }

    /**
     * Carga las tarifas disponibles para un conector específico
     */
  async loadConnectorTariffs(connector, index) {
        try {
            console.log(`🔄 Cargando tarifas para conector ${index}...`);
            
      // Cargar todas las tarifas si no están cargadas (delegar a tariffsModule si existe)
      if (!this.app.allTariffs || this.app.allTariffs.length === 0) {
        if (this.app.tariffsModule && this.app.tariffsModule.loadTariffs) {
          await this.app.tariffsModule.loadTariffs()
        } else if (this.app.dataLoadingModule && this.app.dataLoadingModule.loadTariffs) {
          await this.app.dataLoadingModule.loadTariffs()
        }
      }

      // Construir selects de tarifas para este conector
      await this.buildConnectorTariffSelects(connector, index)
            
        } catch (error) {
            console.error(`❌ Error cargando tarifas para conector ${index}:`, error);
        }
    }

    /**
     * Construye los selects de tarifas para un conector específico
     */
  async buildConnectorTariffSelects(connector, index) {
        try {
            const container = document.querySelector(`[data-connector-index="${index}"] .connector-tariffs-container`);
            if (!container) return;
            
      // Si no hay tarifas disponibles
      if (!this.app.allTariffs || this.app.allTariffs.length === 0) {
        container.innerHTML = '<div class="text-muted">No hay tarifas disponibles</div>'
        return
      }

      // Obtener tarifas del conector
      const connectorTariffIds = connector.tariff_ids || []

      // Generar HTML de selects de tarifas
      let tariffSelectsHtml = ''

      connectorTariffIds.forEach((tariffId, tariffIndex) => {
        const tariff = this.app.allTariffs.find(t => t.id === tariffId)
                const tariffName = tariff ? `${tariff.name || tariff.id} (${tariff.currency} ${tariff.price})` : tariffId;
                
                tariffSelectsHtml += `
                    <div class="tariff-select-item d-flex align-items-center mb-2" data-tariff-index="${tariffIndex}">
                        <select class="form-select me-2 connector-tariff-select" data-tariff-index="${tariffIndex}">
                            <option value="">Seleccionar tarifa...</option>
                            ${this.app.allTariffs.map(tariff => 
                                `<option value="${tariff.id}" ${tariff.id === tariffId ? 'selected' : ''}>
                                    ${tariff.name || tariff.id} (${tariff.currency} ${tariff.price})
                                </option>`
                            ).join('')}
                        </select>
                        <button type="button" class="btn btn-outline-danger btn-sm remove-tariff-from-connector" title="Eliminar tarifa">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
            });
            
            // Si no hay tarifas, mostrar mensaje
            if (tariffSelectsHtml === '') {
                tariffSelectsHtml = '<div class="text-muted">No hay tarifas asignadas</div>';
            }
            
            container.innerHTML = tariffSelectsHtml;
            
        } catch (error) {
            console.error(`❌ Error construyendo selects de tarifas para conector ${index}:`, error);
        }
    }

    /**
     * Agrega una nueva tarifa a un conector
     */
  async addTariffToConnector(connectorIndex) {
        try {
            const container = document.querySelector(`[data-connector-index="${connectorIndex}"] .connector-tariffs-container`);
            if (!container) return;
            
      // Cargar tarifas si no están cargadas (delegar a tariffsModule si existe)
      if (!this.app.allTariffs || this.app.allTariffs.length === 0) {
        if (this.app.tariffsModule && this.app.tariffsModule.loadTariffs) {
          await this.app.tariffsModule.loadTariffs()
        } else if (this.app.dataLoadingModule && this.app.dataLoadingModule.loadTariffs) {
          await this.app.dataLoadingModule.loadTariffs()
        }
      }

      if (!this.app.allTariffs || this.app.allTariffs.length === 0) {
        this.app.showNotification('No hay tarifas disponibles', 'warning')
        return
      }
            
            // Obtener el siguiente índice de tarifa
            const existingTariffs = container.querySelectorAll('.tariff-select-item');
            const nextTariffIndex = existingTariffs.length;
            
            // Crear nuevo select de tarifa
            const tariffSelectHtml = `
                <div class="tariff-select-item d-flex align-items-center mb-2" data-tariff-index="${nextTariffIndex}">
                    <select class="form-select me-2 connector-tariff-select" data-tariff-index="${nextTariffIndex}">
                        <option value="">Seleccionar tarifa...</option>
                        ${this.app.allTariffs.map(tariff => 
                            `<option value="${tariff.id}">
                                ${tariff.name || tariff.id} (${tariff.currency} ${tariff.price})
                            </option>`
                        ).join('')}
                    </select>
                    <button type="button" class="btn btn-outline-danger btn-sm remove-tariff-from-connector" title="Eliminar tarifa">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            
            // Si es el primer select, limpiar el mensaje de "no hay tarifas"
            if (container.innerHTML.includes('No hay tarifas asignadas')) {
                container.innerHTML = '';
            }
            
            container.insertAdjacentHTML('beforeend', tariffSelectHtml);
            
        } catch (error) {
            console.error(`❌ Error agregando tarifa a conector ${connectorIndex}:`, error);
        }
    }

    /**
     * Configura los event listeners para un conector específico
     */
  setupConnectorEventListeners(connectorIndex) {
        try {
            const connectorElement = document.querySelector(`[data-connector-index="${connectorIndex}"]`);
            if (!connectorElement) return;
            
            // Event listener para calcular potencia automáticamente
            const calculateBtn = connectorElement.querySelector('.calculate-power');
            if (calculateBtn) {
                calculateBtn.addEventListener('click', () => {
                    this.calculateConnectorPower(connectorIndex);
                });
            }
            
            // Event listeners para actualizar potencia calculada cuando cambian voltaje o amperaje
            const voltageInput = connectorElement.querySelector('.connector-voltage');
            const amperageInput = connectorElement.querySelector('.connector-amperage');
            
            if (voltageInput) {
                voltageInput.addEventListener('input', () => {
                    this.calculateConnectorPower(connectorIndex);
                });
            }
            
            if (amperageInput) {
                amperageInput.addEventListener('input', () => {
                    this.calculateConnectorPower(connectorIndex);
                });
            }
            
            // Event listener para agregar tarifa - manejado por event delegation global
            // No necesitamos agregar event listeners específicos aquí
            
        } catch (error) {
            console.error(`❌ Error configurando event listeners para conector ${connectorIndex}:`, error);
        }
    }

    /**
     * Calcula la potencia del conector basada en voltaje y amperaje
     */
  calculateConnectorPower(connectorIndex) {
        try {
            const connectorElement = document.querySelector(`[data-connector-index="${connectorIndex}"]`);
            if (!connectorElement) return;
            
            const voltageInput = connectorElement.querySelector('.connector-voltage');
            const amperageInput = connectorElement.querySelector('.connector-amperage');
            const calculatedPowerInput = connectorElement.querySelector('.connector-calculated-power');
            
            if (!voltageInput || !amperageInput || !calculatedPowerInput) return;
            
            const voltage = parseFloat(voltageInput.value) || 0;
            const amperage = parseFloat(amperageInput.value) || 0;
            
            if (voltage > 0 && amperage > 0) {
                const calculatedPower = voltage * amperage;
                calculatedPowerInput.value = `${calculatedPower} W`;
                
                // Si el campo de potencia máxima está vacío, llenarlo automáticamente
                const maxPowerInput = connectorElement.querySelector('.connector-max-power');
                if (maxPowerInput && !maxPowerInput.value) {
                    maxPowerInput.value = calculatedPower;
                }
            } else {
                calculatedPowerInput.value = '0 W';
            }
            
        } catch (error) {
            console.error(`❌ Error calculando potencia del conector ${connectorIndex}:`, error);
        }
    }

  showEditEvseModal() {
        try {
            console.log('🔧 Mostrando modal de edición de EVSE...');
            
            const modalElement = document.getElementById('editEvseModal');
            if (!modalElement) {
                console.error('❌ Modal de edición de EVSE no encontrado');
                this.app.showNotification('Error: Modal de edición no encontrado', 'error');
                return;
            }
            
            // Intentar usar Bootstrap 5 API
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                console.log('✅ Usando Bootstrap 5 API para mostrar modal');
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } else {
                console.warn('⚠️ Bootstrap no disponible, usando fallback manual');
                this.showEditEvseModalFallback(modalElement);
            }
            
        } catch (error) {
            console.error('❌ Error mostrando modal de edición de EVSE:', error);
            // Fallback manual
            const modalElement = document.getElementById('editEvseModal');
            if (modalElement) {
                this.showEditEvseModalFallback(modalElement);
            } else {
                this.app.showNotification('Error al mostrar modal de edición', 'error');
            }
        }
    }

  showEditEvseModalFallback(modalElement) {
        try {
            console.log('🔧 Usando fallback manual para modal de edición de EVSE');
            
            // Mostrar el modal manualmente
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            modalElement.setAttribute('aria-hidden', 'false');
            modalElement.setAttribute('aria-modal', 'true');
            
            // Agregar backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.id = 'editEvseModalBackdrop';
            document.body.appendChild(backdrop);
            
            // Agregar clase al body
            document.body.classList.add('modal-open');
            
            console.log('✅ Modal de edición de EVSE mostrado con fallback manual');
            
        } catch (fallbackError) {
            console.error('❌ Error en fallback del modal de edición de EVSE:', fallbackError);
        }
    }

  closeEditEvseModal() {
        try {
            console.log('🔧 Cerrando modal de edición de EVSE...');
            
            const modalElement = document.getElementById('editEvseModal');
            if (!modalElement) {
                console.warn('⚠️ Modal de edición de EVSE no encontrado');
                return;
            }
            
            // Intentar usar Bootstrap 5 API
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                console.log('✅ Usando Bootstrap 5 API para cerrar modal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    this.closeEditEvseModalFallback(modalElement);
                }
            } else {
                console.warn('⚠️ Bootstrap no disponible, usando fallback manual');
                this.closeEditEvseModalFallback(modalElement);
            }
            
        } catch (error) {
            console.error('❌ Error cerrando modal de edición de EVSE:', error);
            // Fallback manual
            const modalElement = document.getElementById('editEvseModal');
            if (modalElement) {
                this.closeEditEvseModalFallback(modalElement);
            }
        }
    }

  closeEditEvseModalFallback(modalElement) {
        try {
            console.log('🔧 Usando fallback manual para cerrar modal de edición de EVSE');
            
            // Ocultar el modal
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.setAttribute('aria-modal', 'false');
            
            // Remover backdrop
            const backdrop = document.getElementById('editEvseModalBackdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Remover clase del body
            document.body.classList.remove('modal-open');
            
            console.log('✅ Modal de edición de EVSE cerrado con fallback manual');
            
        } catch (fallbackError) {
            console.error('❌ Error en fallback de cierre del modal de edición de EVSE:', fallbackError);
        }
    }

  setupEditEvseModalEventListeners() {
        try {
            console.log('🔧 Configurando event listeners del modal de edición de EVSE...');
            
            // Botón de actualizar EVSE - usar event delegation para evitar problemas de timing
            // Primero, remover listeners anteriores si existen
            const updateEvseBtn = document.getElementById('updateEvseBtn');
            if (updateEvseBtn) {
                // Clonar el botón para remover todos los listeners
                const newUpdateEvseBtn = updateEvseBtn.cloneNode(true);
                updateEvseBtn.parentNode.replaceChild(newUpdateEvseBtn, updateEvseBtn);
                
                // Agregar el nuevo listener
                newUpdateEvseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔄 Botón Actualizar EVSE clickeado');
                    this.updateEvse();
                });
                console.log('✅ Event listener para updateEvseBtn agregado');
            } else {
                console.warn('⚠️ Botón updateEvseBtn no encontrado en el DOM');
            }
            
            // Botón de agregar conector
            const addEditEvseConnectorBtn = document.getElementById('addEditEvseConnector');
            if (addEditEvseConnectorBtn) {
                addEditEvseConnectorBtn.addEventListener('click', () => {
                    const container = document.getElementById('editEvseConnectorsContainer');
                    const currentConnectors = container.querySelectorAll('.evse-connector').length;
                    this.addEditEvseConnectorHtml({}, currentConnectors);
                });
                console.log('✅ Event listener para addEditEvseConnector agregado');
            }
            
            // Event delegation para botones dinámicos
            document.addEventListener('click', (event) => {
                // Botón de actualizar EVSE (usando event delegation)
                if (event.target.closest('#updateEvseBtn') || event.target.id === 'updateEvseBtn') {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log('🔄 Botón Actualizar EVSE clickeado (event delegation)');
                    this.updateEvse();
                    return;
                }
                
                // Generar ID de conector
                if (event.target.closest('.generate-edit-connector-id')) {
                    const button = event.target.closest('.generate-edit-connector-id');
                    const input = button.parentElement.querySelector('.connector-id');
                    if (input) {
                        input.value = this.generateConnectorId();
                    }
                }
                
                // Eliminar conector
                if (event.target.closest('.remove-edit-connector')) {
                    const button = event.target.closest('.remove-edit-connector');
                    const connectorDiv = button.closest('.evse-connector');
                    if (connectorDiv) {
                        connectorDiv.remove();
                    }
                }
                
                // Agregar tarifa a conector
                if (event.target.closest('.add-tariff-to-connector')) {
                    const button = event.target.closest('.add-tariff-to-connector');
                    const connectorElement = button.closest('.evse-connector');
                    if (connectorElement) {
                        const connectorIndex = parseInt(connectorElement.dataset.connectorIndex);
                        this.addTariffToConnector(connectorIndex);
                    }
                }
                
                // Eliminar tarifa de conector
                if (event.target.closest('.remove-tariff-from-connector')) {
                    const button = event.target.closest('.remove-tariff-from-connector');
                    const tariffItem = button.closest('.tariff-select-item');
                    if (tariffItem) {
                        tariffItem.remove();
                        
                        // Si no quedan tarifas, mostrar mensaje
                        const container = tariffItem.closest('.connector-tariffs-container');
                        const remainingTariffs = container.querySelectorAll('.tariff-select-item');
                        if (remainingTariffs.length === 0) {
                            container.innerHTML = '<div class="text-muted">No hay tarifas asignadas</div>';
                        }
                    }
                }
                
                // Cerrar modal con botón Cancelar
                if (event.target.closest('#editEvseModal .btn-secondary')) {
                    this.closeEditEvseModal();
                }
                
                // Cerrar modal con botón X
                if (event.target.closest('#editEvseModal .btn-close')) {
                    this.closeEditEvseModal();
                }
            });
            
            console.log('✅ Event listeners del modal de edición de EVSE configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners del modal de edición de EVSE:', error);
        }
    }

  async updateEvse() {
        try {
            console.log('🔄 Actualizando EVSE...');
            
            // Obtener datos del formulario
            const evseData = this.collectEditEvseFormData();
            if (!evseData) {
                return;
            }
            
            console.log('📊 Datos del EVSE a actualizar:', evseData);
            
      // Enviar petición PUT al backend
      const result = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evseData.id}`, {
        method: 'PUT',
        body: JSON.stringify(evseData)
      })
            console.log('✅ EVSE actualizado exitosamente:', result);
            
            // Mostrar notificación de éxito
            this.app.showNotification('EVSE actualizado exitosamente', 'success');
            
            // Cerrar modal
            this.closeEditEvseModal();
            
      // Recargar la lista de EVSEs (si existe el método)
      if (this.app.loadEvses) {
        await this.app.loadEvses()
      }
            
        } catch (error) {
            console.error('❌ Error actualizando EVSE:', error);
            this.app.showNotification(`Error al actualizar EVSE: ${error.message}`, 'error');
        }
    }

  collectEditEvseFormData() {
        try {
            console.log('📝 Recolectando datos del formulario de edición de EVSE...');
            
            // Datos básicos
            const id = document.getElementById('editEvseUid').value.trim();
            const location_id = document.getElementById('editEvseLocation').value.trim();
            const status = document.getElementById('editEvseStatus').value.trim();
            const physical_reference = document.getElementById('editEvsePhysicalReference').value.trim();
            
            // Validaciones básicas
            if (!id) {
                this.app.showNotification('Error: El UID del EVSE es requerido', 'error');
                return null;
            }
            
            if (!location_id) {
                this.app.showNotification('Error: La location es requerida', 'error');
                return null;
            }
            
            if (!status) {
                this.app.showNotification('Error: El estado del EVSE es requerido', 'error');
                return null;
            }
            
            // Capabilities
            const capabilities = [];
            const capabilityCheckboxes = document.querySelectorAll('#editEvseModal [id^="editCapability_"]:checked');
            capabilityCheckboxes.forEach(checkbox => {
                capabilities.push(checkbox.value);
            });
            
            if (capabilities.length === 0) {
                this.app.showNotification('Error: Debes seleccionar al menos una capability', 'error');
                return null;
            }
            
            // Conectores
            const connectors = [];
            const connectorElements = document.querySelectorAll('#editEvseConnectorsContainer .evse-connector');
            
            for (const connectorElement of connectorElements) {
                // Recopilar tarifas del conector
                const tariffIds = [];
                const tariffSelects = connectorElement.querySelectorAll('.connector-tariff-select');
                tariffSelects.forEach(select => {
                    if (select.value && select.value.trim() !== '') {
                        tariffIds.push(select.value.trim());
                    }
                });
                
                const connector = {
                    id: connectorElement.querySelector('.connector-id').value.trim(),
                    standard: connectorElement.querySelector('.connector-standard').value.trim(),
                    format: connectorElement.querySelector('.connector-format').value.trim(),
                    power_type: connectorElement.querySelector('.connector-power-type').value.trim(),
                    max_voltage: parseInt(connectorElement.querySelector('.connector-voltage').value) || 230,
                    max_amperage: parseInt(connectorElement.querySelector('.connector-amperage').value) || 32,
                    max_electric_power: parseInt(connectorElement.querySelector('.connector-max-power').value) || null,
                    tariff_ids: tariffIds,
                    last_updated: new Date().toISOString()
                };
                
                // Validar conector
                if (!connector.id || !connector.standard || !connector.format || !connector.power_type) {
                    this.app.showNotification('Error: Todos los campos de los conectores son requeridos', 'error');
                    return null;
                }
                
                connectors.push(connector);
            }
            
            if (connectors.length === 0) {
                this.app.showNotification('Error: Debes agregar al menos un conector', 'error');
                return null;
            }
            
            const evseData = {
                id,
                location_id,
                status,
                capabilities,
                connectors,
                physical_reference: physical_reference || null
            };
            
            console.log('✅ Datos del formulario recolectados exitosamente:', evseData);
            return evseData;
            
        } catch (error) {
            console.error('❌ Error recolectando datos del formulario de edición de EVSE:', error);
            this.app.showNotification(`Error recolectando datos: ${error.message}`, 'error');
            return null;
        }
    }
}
