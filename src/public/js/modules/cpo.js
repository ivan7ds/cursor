/**
 * Funciones para Consultar CPOs (Rol EMSP)
 * Extraído de app.js (líneas 9638-11101)
 */

import { ApiUtils } from '../utils/api.js'

export class CPOModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES PARA CONSULTAR CPOs (ROL EMSP) =====

  // Cargar conexiones disponibles en el selector
  async loadCpoConnections () {
    try {
      console.log('🔄 Cargando conexiones CPO...')

      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/api/connections`)
            const connections = data.data || [];
            
            const select = document.getElementById('cpoConnection');
            if (select) {
                // Limpiar opciones existentes (excepto la primera)
                select.innerHTML = '<option value="">Seleccionar conexión...</option>';
                
                // Agregar opciones para cada conexión
                connections.forEach(conn => {
                    const option = document.createElement('option');
                    option.value = conn.id;
                    option.textContent = `${conn.party_id} - ${conn.business_details?.name || 'Sin nombre'}`;
                    option.dataset.url = conn.url;
                    option.dataset.token = conn.token;
                    select.appendChild(option);
                });
                
                console.log(`✅ ${connections.length} conexiones cargadas en el selector`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando conexiones CPO:', error);
            this.app.showNotification(`Error cargando conexiones: ${error.message}`, 'error');
        }
    }
    
    // Manejar cambio de selección de conexión
  onCpoConnectionChange() {
        const select = document.getElementById('cpoConnection');
        const selectedOption = select.options[select.selectedIndex];
        
        if (selectedOption.value) {
            // Rellenar campos con los datos de la conexión seleccionada
            document.getElementById('cpoUrlExtActions').value = selectedOption.dataset.url || '';
            document.getElementById('cpoTokenExtActions').value = selectedOption.dataset.token || '';
            
            console.log('✅ Campos URL y Token actualizados con la conexión seleccionada');
        } else {
            // Limpiar campos si no hay selección
            document.getElementById('cpoUrlExtActions').value = '';
            document.getElementById('cpoTokenExtActions').value = '';
            
            console.log('🧹 Campos URL y Token limpiados');
        }
    }
    
    // Obtener versión del CPO
  async getCpoVersions() {
        try {
            const cpoUrl = document.getElementById('cpoUrlExtActions').value;
            const cpoToken = document.getElementById('cpoTokenExtActions').value;
            const cpoVersion = document.getElementById('cpoVersion').value;

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🌐 Consultando versiones del CPO:', cpoUrl);
            
            // Crear headers con soporte para ngrok
            const headers = ApiUtils.createCpoHeaders(cpoToken);
            if (ApiUtils.isNgrokUrl(cpoUrl)) {
                headers['ngrok-skip-browser-warning'] = 'true';
            }

            const response = await fetch(`${cpoUrl}/ocpi/versions`, {
                headers: headers
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            this.showCpoResponse(JSON.stringify(data, null, 2), 'success');
            
            console.log('✅ Versiones del CPO obtenidas exitosamente');
            
        } catch (error) {
            console.error('❌ Error consultando CPO:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Obtener details del CPO
  async getCpoDetails() {
        try {
            const cpoUrl = document.getElementById('cpoUrlExtActions').value;
            const cpoToken = document.getElementById('cpoTokenExtActions').value;
            const cpoVersion = document.getElementById('cpoVersion').value;

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🌐 Consultando details del CPO:', cpoUrl);
            
            // Crear headers con soporte para ngrok
            const headers = ApiUtils.createCpoHeaders(cpoToken);
            if (ApiUtils.isNgrokUrl(cpoUrl)) {
                headers['ngrok-skip-browser-warning'] = 'true';
            }

            const response = await fetch(`${cpoUrl}/ocpi/2.2/details`, {
                headers: headers
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            this.showCpoResponse(JSON.stringify(data, null, 2), 'success');
            
            console.log('✅ Details del CPO obtenidos exitosamente');
            
        } catch (error) {
            console.error('❌ Error consultando CPO details:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Obtener locations del CPO
  async getCpoLocations() {
        try {
            console.log('🌐 Consultando Locations de organizaciones externas conectadas...');

            const response = await fetch(`${this.baseUrl}/emsp/actions/get-external-locations`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // Formatear la respuesta para mostrar información útil
            let responseText = `📊 RESULTADO DE CONSULTA Y GUARDADO DE LOCATIONS\n`;
            responseText += `===============================================\n\n`;
            responseText += `📈 Total de locations encontradas: ${data.metadata?.total_locations || 0}\n`;
            responseText += `🏢 Organizaciones consultadas: ${data.metadata?.organizations_consulted || 0}\n`;
            responseText += `💾 Locations guardadas en BD: ${data.metadata?.locations_saved || 0}\n`;
            responseText += `⚠️ Locations duplicadas (saltadas): ${data.metadata?.locations_duplicates || 0}\n`;
            responseText += `⏰ Fecha de consulta: ${data.metadata?.timestamp || 'N/A'}\n\n`;

            if (data.metadata?.errors && data.metadata.errors.length > 0) {
                responseText += `⚠️ ERRORES ENCONTRADOS:\n`;
                data.metadata.errors.forEach((error, index) => {
                    responseText += `   ${index + 1}. ${error}\n`;
                });
                responseText += `\n`;
            }

            responseText += `✅ Operación completada exitosamente`;

            this.showCpoResponse(responseText, 'success');
            console.log('✅ Locations obtenidas y guardadas exitosamente');

        } catch (error) {
            console.error('❌ Error consultando locations:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Obtener Sessions de organizaciones externas conectadas
  async getCpoSessions() {
        try {
            console.log('🌐 Consultando Sessions de organizaciones externas conectadas...');
            
            const response = await fetch(`${this.baseUrl}/emsp/actions/get-external-sessions`, {
                headers: { 
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            
            // Formatear la respuesta para mostrar información útil
            let responseText = `📊 RESULTADO DE CONSULTA Y GUARDADO DE SESSIONS\n`;
            responseText += `===============================================\n\n`;
            responseText += `📈 Total de sesiones encontradas: ${data.metadata?.total_sessions || 0}\n`;
            responseText += `🏢 Organizaciones consultadas: ${data.metadata?.organizations_consulted || 0}\n`;
            responseText += `💾 Sesiones guardadas en BD: ${data.metadata?.sessions_saved || 0}\n`;
            responseText += `⚠️ Sesiones duplicadas (saltadas): ${data.metadata?.sessions_duplicates || 0}\n`;
            responseText += `⏰ Fecha de consulta: ${data.metadata?.timestamp || 'N/A'}\n\n`;
            
            if (data.metadata?.errors && data.metadata.errors.length > 0) {
                responseText += `⚠️ ERRORES ENCONTRADOS:\n`;
                data.metadata.errors.forEach((error, index) => {
                    responseText += `${index + 1}. ${error}\n`;
                });
                responseText += `\n`;
            }
            
            if (data.data && data.data.length > 0) {
                responseText += `📋 DETALLES DE SESSIONS:\n`;
                responseText += `========================\n\n`;
                
                data.data.forEach((session, index) => {
                    responseText += `Sesión ${index + 1}:\n`;
                    responseText += `  ID: ${session.id || 'N/A'}\n`;
                    responseText += `  Estado: ${session.status || 'N/A'}\n`;
                    responseText += `  Inicio: ${session.start_date_time || 'N/A'}\n`;
                    responseText += `  Fin: ${session.end_date_time || 'N/A'}\n`;
                    responseText += `  kWh: ${session.kwh || 0}\n`;
                    responseText += `  Ubicación: ${session.location_id || 'N/A'}\n`;
                    responseText += `  EVSE: ${session.evse_uid || 'N/A'}\n`;
                    responseText += `  Organización: ${session.source_organization?.party_id || 'N/A'} (${session.source_organization?.country_code || 'N/A'})\n`;
                    responseText += `  URL: ${session.source_organization?.url || 'N/A'}\n`;
                    responseText += `  ---\n\n`;
                });
            } else {
                responseText += `ℹ️ No se encontraron sesiones en las organizaciones externas conectadas.\n`;
            }
            
            // Mostrar también el JSON completo para referencia técnica
            responseText += `\n📄 RESPUESTA JSON COMPLETA:\n`;
            responseText += `==========================\n`;
            responseText += JSON.stringify(data, null, 2);
            
            this.showCpoResponse(responseText, 'success');
            
            console.log('✅ Sessions de organizaciones externas obtenidas y guardadas exitosamente');
            
        } catch (error) {
            console.error('❌ Error consultando organizaciones externas:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Guardar locations del CPO en nuestra base de datos
  async saveCpoLocationsToDatabase(cpoUrl, cpoToken, cpoVersion, locations) {
        try {
            console.log('💾 Guardando locations del CPO en base de datos...');
            
            const response = await fetch(`${this.baseUrl}/emsp/actions/save-cpo-locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                },
                body: JSON.stringify({
                    cpoUrl,
                    cpoToken,
                    cpoVersion,
                    locations
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Locations guardadas exitosamente:', result);
            
            // Mostrar mensaje de éxito
            this.showCpoResponse(`✅ ${result.data.saved_count} locations guardados exitosamente`, 'success');
            
            // Recargar las pestañas de EMSP para mostrar los nuevos datos
            setTimeout(() => {
                this.loadEmspLocations();
                this.loadEmspEvses();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error guardando en BD:', error);
            this.showCpoResponse(`❌ Error guardando en BD: ${error.message}`, 'error');
        }
    }

    // Guardar tariffs del CPO en nuestra base de datos
  async saveCpoTariffsToDatabase(tariffs) {
        try {
            console.log('💾 Guardando tariffs del CPO en base de datos...');
            
            const response = await fetch(`${this.baseUrl}/emsp/actions/save-cpo-tariffs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                },
                body: JSON.stringify({
                    tariffs
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Tariffs guardados exitosamente:', result);
            
            // Mostrar mensaje de éxito
            this.showCpoResponse(`✅ ${result.data.saved_count} tariffs guardados exitosamente`, 'success');
            
            // Recargar la pestaña de EMSP Tariffs para mostrar los nuevos datos
            setTimeout(() => {
                this.loadEmspTariffs();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error guardando tariffs en BD:', error);
            this.showCpoResponse(`❌ Error guardando tariffs en BD: ${error.message}`, 'error');
        }
    }

    // Obtener tariffs del CPO y guardarlos en BD
  async getCpoTariffs() {
        try {
            console.log('🌐 Consultando Tariffs de organizaciones externas conectadas...');

            const response = await fetch(`${this.baseUrl}/emsp/actions/get-external-tariffs`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // Formatear la respuesta para mostrar información útil
            let responseText = `📊 RESULTADO DE CONSULTA Y GUARDADO DE TARIFFS\n`;
            responseText += `===============================================\n\n`;
            responseText += `📈 Total de tariffs encontradas: ${data.metadata?.total_tariffs || 0}\n`;
            responseText += `🏢 Organizaciones consultadas: ${data.metadata?.organizations_consulted || 0}\n`;
            responseText += `💾 Tariffs guardadas en BD: ${data.metadata?.tariffs_saved || 0}\n`;
            responseText += `⚠️ Tariffs duplicadas (saltadas): ${data.metadata?.tariffs_duplicates || 0}\n`;
            responseText += `⏰ Fecha de consulta: ${data.metadata?.timestamp || 'N/A'}\n\n`;

            if (data.metadata?.errors && data.metadata.errors.length > 0) {
                responseText += `⚠️ ERRORES ENCONTRADOS:\n`;
                data.metadata.errors.forEach((error, index) => {
                    responseText += `   ${index + 1}. ${error}\n`;
                });
                responseText += `\n`;
            }

            responseText += `✅ Operación completada exitosamente`;

            this.showCpoResponse(responseText, 'success');
            console.log('✅ Tariffs obtenidas y guardadas exitosamente');

        } catch (error) {
            console.error('❌ Error consultando tariffs:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Obtener tokens del CPO externo usando /emsp/2.2/tokens
  async getCpoTokens() {
        try {
            console.log('🌐 Consultando Tokens de organizaciones externas conectadas...');

            const response = await fetch(`${this.baseUrl}/emsp/actions/get-external-tokens`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // Formatear la respuesta para mostrar información útil
            let responseText = `📊 RESULTADO DE CONSULTA Y GUARDADO DE TOKENS\n`;
            responseText += `===============================================\n\n`;
            responseText += `📈 Total de tokens encontrados: ${data.metadata?.total_tokens || 0}\n`;
            responseText += `🏢 Organizaciones consultadas: ${data.metadata?.organizations_consulted || 0}\n`;
            responseText += `💾 Tokens guardados en BD: ${data.metadata?.tokens_saved || 0}\n`;
            responseText += `⚠️ Tokens duplicados (saltados): ${data.metadata?.tokens_duplicates || 0}\n`;
            responseText += `⏰ Fecha de consulta: ${data.metadata?.timestamp || 'N/A'}\n\n`;

            if (data.metadata?.errors && data.metadata.errors.length > 0) {
                responseText += `⚠️ ERRORES ENCONTRADOS:\n`;
                data.metadata.errors.forEach((error, index) => {
                    responseText += `   ${index + 1}. ${error}\n`;
                });
                responseText += `\n`;
            }

            responseText += `✅ Operación completada exitosamente`;

            this.showCpoResponse(responseText, 'success');
            console.log('✅ Tokens obtenidos y guardados exitosamente');

        } catch (error) {
            console.error('❌ Error consultando tokens:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Guardar tokens eMSP en la tabla emsp_tokens
  async saveEmspTokensToDatabase(tokens) {
        try {
            console.log('💾 Guardando tokens eMSP en tabla emsp_tokens...');
            
            const response = await fetch(`${this.baseUrl}/emsp/actions/save-emsp-tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                },
                body: JSON.stringify({
                    tokens
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Tokens eMSP guardados exitosamente:', result);
            
            // Mostrar mensaje de éxito
            this.showCpoResponse(`✅ ${result.data.saved_count} tokens guardados en tabla emsp_tokens`, 'success');
            
        } catch (error) {
            console.error('❌ Error guardando tokens eMSP en BD:', error);
            this.showCpoResponse(`❌ Error guardando tokens en BD: ${error.message}`, 'error');
        }
    }

  async clearEmspDataWithConfirmation() {
        const warningMessage = '⚠️ Esta acción eliminará todos los datos eMSP almacenados (locations, EVSEs, tarifas, sesiones, CDRs y tokens) y no tiene vuelta atrás. ¿Deseas continuar?';
        const userConfirmed = window.confirm(warningMessage);

        if (!userConfirmed) {
            console.log('ℹ️ Limpieza de datos eMSP cancelada por el usuario');
            this.app.showNotification('Operación cancelada por el usuario', 'info');
            return;
        }

        try {
            console.log('🧨 Confirmación recibida, iniciando limpieza de datos eMSP');
            const authToken = ApiUtils.getAuthToken()
            
            const response = await fetch(`${this.baseUrl}/emsp/actions/clear-emsp-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Error desconocido'}`);
            }

            const result = await response.json();
            this.resetEmspDataState();

            const successMessage = result?.data?.message || 'Datos eMSP eliminados correctamente';
            console.log('✅ Limpieza de datos eMSP completada:', successMessage);
            this.app.showNotification(successMessage, 'success');
            this.showCpoResponse(`✅ ${successMessage}`, 'success');
        } catch (error) {
            console.error('❌ Error eliminando datos eMSP:', error);
            const errorMessage = `Error eliminando datos eMSP: ${error.message}`;
            this.app.showNotification(errorMessage, 'error');
            this.showCpoResponse(`❌ ${errorMessage}`, 'error');
        }
    }

  resetEmspDataState() {
        console.log('🧹 Reiniciando estado local de datos eMSP');

        // Resetear estado en app (donde realmente está almacenado)
        this.app.allEmspLocations = [];
        this.app.filteredEmspLocations = [];
        this.app.emspLocationsEvseCountMap = {};
        this.app.emspLocationNameMap = {};
        this.app.emspEvseIdMap = {};
        this.app.currentEmspLocationsPage = 1;

        this.app.allEmspEvses = [];
        this.app.filteredEmspEvses = [];
        this.app.currentEmspEvsesPage = 1;
        this.app.emspEvsesFilters = { status: '', party: '', search: '' };

        this.app.allEmspTariffs = [];
        this.app.filteredEmspTariffs = [];
        this.app.currentEmspTariffsPage = 1;

        this.app.allEmspTokens = [];
        this.app.filteredEmspTokens = [];
        this.app.currentEmspTokensPage = 1;
        this.app.emspTokensFilters = { search: '', issuer: '', type: '', valid: '', whitelist: '' };

        // Llamar a métodos de renderizado del módulo EMSP
        if (this.app && this.app.emspModule) {
            try {
                if (typeof this.app.emspModule.renderEmspLocationsPage === 'function') {
                    this.app.emspModule.renderEmspLocationsPage();
                } else {
                    console.warn('⚠️ renderEmspLocationsPage no está disponible en emspModule');
                }
            } catch (error) {
                console.error('❌ Error renderizando EMSP locations:', error);
            }

            try {
                if (typeof this.app.emspModule.renderEmspEvsesPage === 'function') {
                    this.app.emspModule.renderEmspEvsesPage();
                } else {
                    console.warn('⚠️ renderEmspEvsesPage no está disponible en emspModule');
                }
            } catch (error) {
                console.error('❌ Error renderizando EMSP EVSEs:', error);
            }

            try {
                if (typeof this.app.emspModule.renderEmspTariffsPage === 'function') {
                    this.app.emspModule.renderEmspTariffsPage();
                } else {
                    console.warn('⚠️ renderEmspTariffsPage no está disponible en emspModule');
                }
            } catch (error) {
                console.error('❌ Error renderizando EMSP tariffs:', error);
            }

            try {
                // renderEmspTokensPage está en tokensModule, no en emspModule
                if (this.app.tokensModule && typeof this.app.tokensModule.renderEmspTokensPage === 'function') {
                    this.app.tokensModule.renderEmspTokensPage();
                } else {
                    console.warn('⚠️ renderEmspTokensPage no está disponible en tokensModule');
                }
            } catch (error) {
                console.error('❌ Error renderizando EMSP tokens:', error);
            }
        } else {
            console.warn('⚠️ emspModule no está disponible en app');
        }

        // Actualizar contadores
        this.app.updateCount('emspLocationsCount', 0);
        this.app.updateCount('emspEvsesCount', 0);
        this.app.updateCount('emspTariffsCount', 0);
        this.app.updateCount('emspTokensCount', 0);
    }

    // Funciones auxiliares para CPO
  showCpoResponse(response, type = 'info') {
        const responseElement = document.getElementById('cpoResponse');
        if (!responseElement) return;

        responseElement.textContent = response;
        responseElement.className = `bg-light p-3 rounded ${type === 'error' ? 'text-danger' : 'text-success'}`;
    }

  clearCpoResponse() {
        const responseElement = document.getElementById('cpoResponse');
        if (!responseElement) return;

        responseElement.textContent = 'Haz clic en una acción para consultar al CPO...';
        responseElement.className = 'bg-light p-3 rounded';
    }

    // Función auxiliar para obtener clase de badge de estado EVSE
  getEvseStatusBadgeClass(status) {
        const statusClasses = {
            'AVAILABLE': 'bg-success',
            'CHARGING': 'bg-warning',
            'INOPERATIVE': 'bg-danger',
            'OUTOFORDER': 'bg-danger',
            'PLANNED': 'bg-info',
            'RESERVED': 'bg-primary',
            'UNKNOWN': 'bg-secondary'
        };
        return statusClasses[status] || 'bg-secondary';
    }

    // Manejar acción de recarga (iniciar o finalizar)
  handleChargingAction() {
        if (this.currentChargingSession) {
            // Si hay una sesión activa, abrir el modal para mostrar información y permitir finalizar
            this.showSelectCpoEvseModal();
        } else {
            // Si no hay sesión activa, abrir el modal para seleccionar EVSE
            this.showSelectCpoEvseModal();
        }
    }

    // Mostrar modal para seleccionar EVSE de CPO
  showSelectCpoEvseModal() {
        const modal = new bootstrap.Modal(document.getElementById('selectCpoEvseModal'));
        
        if (this.currentChargingSession) {
            // Si hay una sesión activa, mostrar información de la sesión y botón de finalizar
            this.showActiveSessionInfo();
            this.showStopChargingButton();
        } else {
            // Si no hay sesión activa, restaurar contenido original y cargar EVSEs
            this.restoreOriginalModalContent();
            this.hideStopChargingButton();
            this.loadCpoEvsesForCharging();
        }
        
        this.startLogPolling(); // Iniciar polling de logs
        modal.show();
    }

    // Restaurar contenido original del modal
  restoreOriginalModalContent() {
        const modalBody = document.querySelector('#selectCpoEvseModal .modal-body');
        if (!modalBody) return;

        // Restaurar el contenido original del modal
        modalBody.innerHTML = `
            <!-- Sección de Token Personalizado -->
            <div class="row mb-3">
                <div class="col-12">
                    <div class="card bg-light">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="bi bi-key"></i> Token para Recarga
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <label for="customTokenInput" class="form-label">Token Personalizado (Opcional)</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="customTokenInput" 
                                               placeholder="Introduce un token personalizado para pruebas (ej: TEST123456789)">
                                        <button type="button" class="btn btn-outline-secondary" id="clearCustomTokenBtn">
                                            <i class="bi bi-x-circle"></i> Limpiar
                                        </button>
                                    </div>
                                    <small class="form-text text-muted">
                                        Si no introduces un token, se usará uno de la base de datos
                                    </small>
                                </div>
                                <div class="col-md-4">
                                    <label for="customTokenType" class="form-label">Tipo de Token</label>
                                    <select class="form-select" id="customTokenType">
                                        <option value="RFID">RFID</option>
                                        <option value="APP_USER">APP_USER</option>
                                        <option value="OTHER">OTHER</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <h6>EVSEs Disponibles del CPO</h6>
                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-sm table-hover">
                            <thead class="table-dark sticky-top">
                                <tr>
                                    <th>EVSE ID</th>
                                    <th>Estado</th>
                                    <th>Ubicación</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody id="cpoEvsesTableBody">
                                <tr>
                                    <td colspan="4" class="text-center text-muted py-3">
                                        <i class="bi bi-arrow-clockwise"></i> Cargando EVSEs...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="col-md-6">
                    <h6>Consola de Recarga</h6>
                    <div class="bg-dark text-light p-3 rounded" style="height: 400px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4;" id="chargingConsole">
                        <div class="text-success">[Sistema] Consola de recarga iniciada</div>
                        <div class="text-muted">[Info] Selecciona un EVSE para comenzar la recarga</div>
                    </div>
                    <div class="mt-2">
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="clearChargingConsole">
                            <i class="bi bi-trash"></i> Limpiar Consola
                        </button>
                        <button type="button" class="btn btn-outline-primary btn-sm" id="refreshCpoEvses">
                            <i class="bi bi-arrow-clockwise"></i> Actualizar EVSEs
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Reconfigurar event listeners
        this.setupChargingModalEventListeners();
    }

    // Configurar event listeners del modal de recarga
  setupChargingModalEventListeners() {
        // Event listener para limpiar token personalizado
        const clearCustomTokenBtn = document.getElementById('clearCustomTokenBtn');
        if (clearCustomTokenBtn) {
            clearCustomTokenBtn.addEventListener('click', () => {
                document.getElementById('customTokenInput').value = '';
            });
        }

        // Event listener para limpiar consola
        const clearChargingConsole = document.getElementById('clearChargingConsole');
        if (clearChargingConsole) {
            clearChargingConsole.addEventListener('click', () => {
                const console = document.getElementById('chargingConsole');
                if (console) {
                    console.innerHTML = '<div class="text-success">[Sistema] Consola de recarga iniciada</div><div class="text-muted">[Info] Selecciona un EVSE para comenzar la recarga</div>';
                }
            });
        }

        // Event listener para actualizar EVSEs
        const refreshCpoEvses = document.getElementById('refreshCpoEvses');
        if (refreshCpoEvses) {
            refreshCpoEvses.addEventListener('click', () => {
                this.loadCpoEvsesForCharging();
            });
        }
    }

    // Cargar EVSEs del CPO para recarga (desde base de datos local)
  async loadCpoEvsesForCharging() {
        try {
            this.logToChargingConsole('🔄 Cargando EVSEs del CPO desde base de datos local...', 'info');
            
            // Obtener Sessions del CPO desde nuestra base de datos
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/evses`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            this.cpoEvses = data.data || [];
            
            this.logToChargingConsole(`✅ Cargados ${this.cpoEvses.length} EVSEs del CPO desde base de datos local`, 'success');
            this.renderCpoEvsesForCharging();

        } catch (error) {
            console.error('❌ Error cargando EVSEs del CPO:', error);
            this.logToChargingConsole(`❌ Error: ${error.message}`, 'error');
            this.renderCpoEvsesError();
        }
    }

    // Renderizar EVSEs del CPO para selección
  renderCpoEvsesForCharging() {
        const tbody = document.getElementById('cpoEvsesTableBody');
        if (!tbody) return;

        if (this.cpoEvses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-3">
                        <i class="bi bi-exclamation-circle"></i> No hay EVSEs disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.cpoEvses.map(evse => `
            <tr>
                <td><code>${evse.evse_id || evse.id}</code></td>
                <td>
                    <span class="badge ${this.getEvseStatusBadgeClass(evse.status)}">
                        ${evse.status}
                    </span>
                </td>
                <td>${evse.location_id ? this.app.ui.truncateToken(evse.location_id) : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm ${evse.status === 'AVAILABLE' ? 'btn-success' : 'btn-secondary'}" 
                            onclick="window.dashboardApp.startChargingWithEvse('${evse.id}', '${evse.location_id}')"
                            ${evse.status !== 'AVAILABLE' ? 'disabled' : ''}>
                        <i class="bi bi-lightning-charge"></i> ${evse.status === 'AVAILABLE' ? 'Iniciar' : 'No disponible'}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Renderizar error al cargar EVSEs
  renderCpoEvsesError() {
        const tbody = document.getElementById('cpoEvsesTableBody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger py-3">
                    <i class="bi bi-exclamation-triangle"></i> Error cargando EVSEs
                </td>
            </tr>
        `;
    }

    // Obtener clase CSS para badge de estado de EVSE
  getEvseStatusBadgeClass(status) {
        const statusClasses = {
            'AVAILABLE': 'bg-success',
            'OCCUPIED': 'bg-warning',
            'RESERVED': 'bg-info',
            'UNAVAILABLE': 'bg-danger',
            'FAULTED': 'bg-danger'
        };
        return statusClasses[status] || 'bg-secondary';
    }

    // Iniciar recarga con EVSE seleccionado
  async startChargingWithEvse(evseUid, locationId) {
        try {
            // Obtener información del EVSE para mostrar EVSE_ID
            const evseInfo = this.cpoEvses.find(evse => evse.id === evseUid);
            const evseId = evseInfo ? evseInfo.evse_id : 'N/A';
            
            this.logToChargingConsole(`🚀 Iniciando recarga con EVSE: ${evseUid}`, 'system');
            this.logToChargingConsole(`🏷️ EVSE ID: ${evseId}`, 'evse');
            
            const cpoUrl = document.getElementById('cpoUrlExtActions').value;
            const cpoToken = document.getElementById('cpoTokenExtActions').value;
            const cpoVersion = document.getElementById('cpoVersion').value || '2.2';

            this.logToChargingConsole(`🔗 URL del CPO: ${cpoUrl}`, 'debug');
            this.logToChargingConsole(`🔑 Token del CPO: ${cpoToken ? cpoToken.substring(0, 10) + '...' : 'No definido'}`, 'debug');

            if (!cpoUrl || !cpoToken) {
                this.logToChargingConsole('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            // Obtener la URL base del servidor
            const baseUrl = await this.getServerBaseUrl();

            // Obtener un token real de la base de datos
            const realToken = await this.getRealToken();
            if (!realToken) {
                this.logToChargingConsole('❌ Error: No se pudo obtener un token válido de la base de datos', 'error');
                return;
            }

            // Generar UUID para el response_url
            const responseUid = crypto.randomUUID();
            this.logToChargingConsole(`🆔 UUID del response: ${responseUid}`, 'debug');
            
            // Preparar payload para START_SESSION
            const startSessionPayload = {
                response_url: `${baseUrl}/ocpi/cpo/2.2/commands/START_SESSION/${responseUid}`,
                token: realToken,
                location_id: locationId,
                evse_uid: evseUid
            };
            
            this.logToChargingConsole(`📤 Enviando START_SESSION al CPO...`, 'request');
            this.logToChargingConsole(`   URL: ${cpoUrl}/ocpi/cpo/${cpoVersion}/commands/START_SESSION`, 'request');
            this.logToChargingConsole(`   Payload: ${JSON.stringify(startSessionPayload, null, 2)}`, 'request');
            
            // Crear headers con soporte para ngrok
            const headers = ApiUtils.createCpoHeaders(cpoToken);
            if (ApiUtils.isNgrokUrl(cpoUrl)) {
                headers['ngrok-skip-browser-warning'] = 'true';
            }

            // Enviar comando START_SESSION al CPO externo
            const response = await fetch(`${cpoUrl}/ocpi/cpo/${cpoVersion}/commands/START_SESSION`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(startSessionPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logToChargingConsole(`❌ Error del CPO: HTTP ${response.status}`, 'error');
                this.logToChargingConsole(`   Error: ${errorText}`, 'error');
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            
            this.logToChargingConsole(`📥 Respuesta del CPO recibida:`, 'response');
            this.logToChargingConsole(`   Status: ${response.status} ${response.statusText}`, 'response');
            this.logToChargingConsole(`   Response: ${JSON.stringify(result, null, 2)}`, 'response');
            
            if (result.data && result.data.result === 'ACCEPTED') {
                // Obtener el session_id real de la respuesta del CPO
                const realSessionId = result.data.session_id || `session_${Date.now()}`;
                
                this.currentChargingSession = {
                    evseUid: evseUid,
                    evseId: evseId,
                    locationId: locationId,
                    token: realToken,
                    startTime: new Date(),
                    sessionId: realSessionId
                };

                this.logToChargingConsole(`✅ Recarga iniciada exitosamente`, 'success');
                this.logToChargingConsole(`📋 Detalles de la sesión:`, 'session');
                this.logToChargingConsole(`   🔌 EVSE UID: ${evseUid}`, 'evse');
                this.logToChargingConsole(`   🏷️ EVSE ID: ${evseId}`, 'evse');
                this.logToChargingConsole(`   🎫 Token: ${realToken.uid} (${realToken.type})`, 'token');
                this.logToChargingConsole(`   📝 Sesión: ${realSessionId}`, 'session');
                this.logToChargingConsole(`   📍 Ubicación: ${locationId}`, 'debug');

                this.updateChargingButton();
                this.showStopChargingButton();
            } else {
                this.logToChargingConsole(`❌ Recarga rechazada: ${result.data?.result || 'Unknown error'}`, 'error');
            }

        } catch (error) {
            console.error('❌ Error iniciando recarga:', error);
            this.logToChargingConsole(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Finalizar sesión de recarga
  async stopChargingSession() {
        try {
            if (!this.currentChargingSession) {
                this.logToChargingConsole('❌ No hay sesión de recarga activa', 'error');
                return;
            }

            this.logToChargingConsole(`🛑 Finalizando recarga...`, 'system');
            this.logToChargingConsole(`📋 Sesión actual: ${this.currentChargingSession.sessionId}`, 'session');
            this.logToChargingConsole(`   🔌 EVSE UID: ${this.currentChargingSession.evseUid}`, 'evse');
            this.logToChargingConsole(`   🏷️ EVSE ID: ${this.currentChargingSession.evseId}`, 'evse');
            this.logToChargingConsole(`   🎫 Token: ${this.currentChargingSession.token.uid}`, 'token');
            
            const cpoUrl = document.getElementById('cpoUrlExtActions').value;
            const cpoToken = document.getElementById('cpoTokenExtActions').value;
            const cpoVersion = document.getElementById('cpoVersion').value || '2.2';

            // Obtener la URL base del servidor
            const baseUrl = await this.getServerBaseUrl();

            // Obtener el session_id real del CPO desde la base de datos
            const realSessionId = await this.getRealSessionId();
            if (!realSessionId) {
                this.logToChargingConsole('❌ No se pudo obtener el session_id real del CPO', 'error');
                return;
            }

            this.logToChargingConsole(`🆔 Session ID real del CPO: ${realSessionId}`, 'debug');

            // Generar UUID para el response_url
            const responseUid = crypto.randomUUID();
            this.logToChargingConsole(`🆔 UUID del response: ${responseUid}`, 'debug');
            
            // Preparar payload para STOP_SESSION
            const stopSessionPayload = {
                response_url: `${baseUrl}/ocpi/cpo/2.2/commands/STOP_SESSION/${responseUid}`,
                session_id: realSessionId
            };
            
            this.logToChargingConsole(`📤 Enviando STOP_SESSION al CPO...`, 'request');
            this.logToChargingConsole(`   URL: ${cpoUrl}/ocpi/cpo/${cpoVersion}/commands/STOP_SESSION`, 'request');
            this.logToChargingConsole(`   Payload: ${JSON.stringify(stopSessionPayload, null, 2)}`, 'request');
            
            // Crear headers con soporte para ngrok
            const headers = ApiUtils.createCpoHeaders(cpoToken);
            if (ApiUtils.isNgrokUrl(cpoUrl)) {
                headers['ngrok-skip-browser-warning'] = 'true';
            }

            // Enviar comando STOP_SESSION al CPO externo
            const response = await fetch(`${cpoUrl}/ocpi/cpo/${cpoVersion}/commands/STOP_SESSION`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(stopSessionPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logToChargingConsole(`❌ Error del CPO: HTTP ${response.status}`, 'error');
                this.logToChargingConsole(`   Error: ${errorText}`, 'error');
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            
            this.logToChargingConsole(`📥 Respuesta del CPO recibida:`, 'response');
            this.logToChargingConsole(`   Status: ${response.status} ${response.statusText}`, 'response');
            this.logToChargingConsole(`   Response: ${JSON.stringify(result, null, 2)}`, 'response');
            
            if (result.data && result.data.result === 'ACCEPTED') {
                this.logToChargingConsole(`✅ Recarga finalizada exitosamente`, 'success');
                this.logToChargingConsole(`📋 Sesión finalizada: ${realSessionId}`, 'session');
                
                this.currentChargingSession = null;
                this.updateChargingButton();
                this.hideStopChargingButton();
            } else {
                this.logToChargingConsole(`❌ Error finalizando recarga: ${result.data?.result || 'Unknown error'}`, 'error');
            }

        } catch (error) {
            console.error('❌ Error finalizando recarga:', error);
            this.logToChargingConsole(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Actualizar botón de recarga
  updateChargingButton() {
        const button = document.getElementById('startCpoCharging');
        const buttonText = document.getElementById('chargingButtonText');
        
        if (this.currentChargingSession) {
            // Si hay una sesión activa, mostrar "Finalizar Recarga"
            button.className = 'btn btn-warning';
            buttonText.textContent = 'Finalizar Recarga';
            button.disabled = false; // Permitir hacer clic para finalizar
        } else {
            // Si no hay sesión activa, mostrar "Iniciar Recarga"
            button.className = 'btn btn-danger';
            buttonText.textContent = 'Iniciar Recarga';
            button.disabled = false;
        }
    }

    // Mostrar botón de finalizar recarga en el modal
  showStopChargingButton() {
        const stopButton = document.getElementById('stopCpoCharging');
        if (stopButton) {
            stopButton.style.display = 'inline-block';
            stopButton.disabled = false;
        }
    }

    // Ocultar botón de finalizar recarga en el modal
  hideStopChargingButton() {
        const stopButton = document.getElementById('stopCpoCharging');
        if (stopButton) {
            stopButton.style.display = 'none';
            stopButton.disabled = true;
        }
    }

    // Mostrar información de la sesión activa en el modal
  showActiveSessionInfo() {
        const modalBody = document.querySelector('#selectCpoEvseModal .modal-body');
        if (!modalBody || !this.currentChargingSession) return;

        // Crear contenido para sesión activa
        const activeSessionHTML = `
            <div class="alert alert-info">
                <h6><i class="bi bi-lightning-charge-fill"></i> Sesión de Recarga Activa</h6>
                <div class="row">
                    <div class="col-md-6">
                        <strong>ID de Sesión:</strong><br>
                        <code>${this.currentChargingSession.sessionId}</code>
                    </div>
                    <div class="col-md-6">
                        <strong>EVSE UID:</strong><br>
                        <code>${this.currentChargingSession.evseUid}</code>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-6">
                        <strong>EVSE ID:</strong><br>
                        <code>${this.currentChargingSession.evseId}</code>
                    </div>
                    <div class="col-md-6">
                        <strong>Token:</strong><br>
                        <code>${this.currentChargingSession.token.uid}</code>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-6">
                        <strong>Iniciada:</strong><br>
                        <small>${new Date(this.currentChargingSession.startTime).toLocaleString()}</small>
                    </div>
                    <div class="col-md-6">
                        <strong>Estado:</strong><br>
                        <span class="badge bg-success">ACTIVA</span>
                    </div>
                </div>
            </div>
            <div class="text-center">
                <button type="button" class="btn btn-warning btn-lg" id="stopCpoCharging">
                    <i class="bi bi-stop-circle"></i> Finalizar Recarga
                </button>
            </div>
        `;

        // Reemplazar el contenido del modal
        modalBody.innerHTML = activeSessionHTML;

        // Agregar event listener al botón de finalizar
        const stopButton = document.getElementById('stopCpoCharging');
        if (stopButton) {
            stopButton.addEventListener('click', () => {
                this.stopChargingSession();
                this.closeSelectCpoEvseModal();
            });
        }
    }

    // Cerrar modal de selección de EVSE
  closeSelectCpoEvseModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('selectCpoEvseModal'));
        if (modal) {
            modal.hide();
        }
        this.stopLogPolling(); // Detener polling de logs
    }

    // Log a la consola de recarga
  logToChargingConsole(message, type = 'info') {
        const console = document.getElementById('chargingConsole');
        if (!console) return;

        const now = new Date();
        const timestamp = now.toLocaleTimeString('es-ES', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 3
        });
        const typeClass = {
            'info': 'text-info',
            'success': 'text-success',
            'error': 'text-danger',
            'warning': 'text-warning',
            'request': 'text-cyan',
            'response': 'text-primary',
            'system': 'text-light',
            'debug': 'text-muted',
            'token': 'text-warning',
            'evse': 'text-info',
            'session': 'text-success',
            'time': 'text-secondary'
        }[type] || 'text-light';

        const logEntry = document.createElement('div');
        logEntry.className = typeClass;
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        console.appendChild(logEntry);
        console.scrollTop = console.scrollHeight;
    }

    // Limpiar consola de recarga
  clearChargingConsole() {
        const console = document.getElementById('chargingConsole');
        if (!console) return;

        console.innerHTML = `
            <div class="text-success">[Sistema] Consola de recarga iniciada</div>
            <div class="text-muted">[Info] Selecciona un EVSE para comenzar la recarga</div>
        `;
    }

    // Iniciar polling de logs del servidor
  startLogPolling() {
        if (this.logPollingInterval) {
            clearInterval(this.logPollingInterval);
        }
        
        this.logPollingInterval = setInterval(async () => {
            await this.fetchServerLogs();
        }, 2000); // Consultar cada 2 segundos
    }

    // Detener polling de logs
  stopLogPolling() {
        if (this.logPollingInterval) {
            clearInterval(this.logPollingInterval);
            this.logPollingInterval = null;
        }
    }

    // Obtener logs del servidor
  async fetchServerLogs() {
        try {
            if (!this.currentChargingSession) {
                return; // Solo consultar si hay una sesión activa
            }

            const response = await fetch(`${this.baseUrl}/api/charging-logs?sessionId=${this.currentChargingSession.sessionId}&limit=10`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });
            if (!response.ok) return;

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                // Procesar logs nuevos
                for (const log of data.data) {
                    this.addServerLogToConsole(log);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error fetching server logs:', error);
        }
    }

    // Agregar log del servidor a la consola
  addServerLogToConsole(log) {
        const console = document.getElementById('chargingConsole');
        if (!console) return;

        // Verificar si el log ya existe (por ID)
        const existingLog = console.querySelector(`[data-log-id="${log.id}"]`);
        if (existingLog) return;

        const typeClass = {
            'info': 'text-info',
            'success': 'text-success',
            'error': 'text-danger',
            'warning': 'text-warning',
            'request': 'text-info',
            'response': 'text-primary',
            'system': 'text-light',
            'debug': 'text-muted',
            'token': 'text-warning',
            'evse': 'text-info',
            'session': 'text-success',
            'time': 'text-secondary'
        }[log.type] || 'text-light';

        const logEntry = document.createElement('div');
        logEntry.className = typeClass;
        logEntry.setAttribute('data-log-id', log.id);
        logEntry.innerHTML = `[${log.timestamp}] ${log.message}`;
        
        console.appendChild(logEntry);
        console.scrollTop = console.scrollHeight;
    }

    // Obtener la URL base del servidor desde la configuración
  async getServerBaseUrl() {
        try {
            // Obtener la URL base desde la configuración del servidor
            const response = await fetch('/api/config/ocpi-settings', {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });
            
            if (response.ok) {
                const config = await response.json();
                const ocpiBaseUrl = config.data?.baseUrl || window.location.origin;
                this.logToChargingConsole(`🌐 URL base configurada: ${ocpiBaseUrl}`, 'debug');
                return ocpiBaseUrl;
            } else {
                // Fallback a la URL actual si no se puede obtener la configuración
                const ocpiBaseUrl = window.location.origin;
                this.logToChargingConsole(`🌐 URL base (fallback): ${ocpiBaseUrl}`, 'debug');
                return ocpiBaseUrl;
            }
        } catch (error) {
            console.error('❌ Error obteniendo URL base:', error);
            // Fallback a la URL actual
            const ocpiBaseUrl = window.location.origin;
            this.logToChargingConsole(`🌐 URL base (fallback): ${ocpiBaseUrl}`, 'debug');
            return ocpiBaseUrl;
        }
    }

    // Obtener un token real de la base de datos o usar token personalizado
  async getRealToken() {
        try {
            // Verificar si hay un token personalizado
            const customTokenInput = document.getElementById('customTokenInput');
            const customTokenType = document.getElementById('customTokenType');
            
            if (customTokenInput && customTokenInput.value.trim()) {
                const customToken = customTokenInput.value.trim();
                const tokenType = customTokenType ? customTokenType.value : 'RFID';
                
                this.logToChargingConsole(`🎫 Usando token personalizado: ${customToken} (${tokenType})`, 'token');
                
                // Crear un token personalizado con la estructura OCPI 2.2
                const localPartyId = window.OCPI_PARTY_ID;
                const localCountryCode = window.OCPI_COUNTRY_CODE;
                
                const customTokenData = {
                    country_code: localCountryCode,
                    party_id: localPartyId,
                    uid: customToken,
                    type: tokenType,
                    contract_id: `CONTRACT_${customToken}`,
                    issuer: 'TEST_SYSTEM',
                    valid: true,
                    whitelist: 'ALWAYS',
                    last_updated: new Date().toISOString()
                };
                
                this.logToChargingConsole(`✅ Token personalizado creado: ${customTokenData.uid} (${customTokenData.type}) - Party: ${customTokenData.party_id}`, 'token');
                return customTokenData;
            }
            
            // Si no hay token personalizado, obtener uno de la base de datos
            this.logToChargingConsole(`🔍 Obteniendo token de la base de datos...`, 'info');
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tokens`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    // Filtrar tokens con party_id de nuestro CPO local
                    const localPartyId = window.OCPI_PARTY_ID;
                    const ipdTokens = data.data.filter(token => token.party_id === localPartyId);
                    if (ipdTokens.length > 0) {
                        const token = ipdTokens[0];
                        this.logToChargingConsole(`🎫 Token obtenido de BD: ${token.uid} (${token.type}) - Party: ${token.party_id}`, 'token');
                        
                        // Filtrar solo los campos requeridos por OCPI 2.2 para START_SESSION
                        const cleanToken = {
                            country_code: token.country_code,
                            party_id: token.party_id,
                            uid: token.uid,
                            type: token.type,
                            contract_id: token.contract_id,
                            issuer: token.issuer,
                            valid: token.valid,
                            whitelist: token.whitelist,
                            last_updated: token.last_updated
                        };
                        
                        return cleanToken;
                    } else {
                        this.logToChargingConsole(`⚠️ No se encontraron tokens con party_id ${localPartyId}`, 'warning');
                        return null;
                    }
                }
            }
            
            this.logToChargingConsole('⚠️ No se encontraron tokens en la base de datos', 'warning');
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo token:', error);
            this.logToChargingConsole(`❌ Error obteniendo token: ${error.message}`, 'error');
            return null;
        }
    }

    // Obtener session_id real del CPO desde la base de datos
  async getRealSessionId() {
        try {
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/sessions`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    // Buscar la sesión más reciente del CPO EFI (usando external_operator_party_id)
                    const efiSessions = data.data.filter(session => 
                        session.external_operator_party_id === 'EFI'
                    );
                    
                    if (efiSessions.length > 0) {
                        // Ordenar por last_updated descendente y tomar la más reciente
                        efiSessions.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
                        const latestSession = efiSessions[0];
                        
                        this.logToChargingConsole(`🔍 Session ID encontrado: ${latestSession.session_id}`, 'info');
                        this.logToChargingConsole(`   📊 Estado: ${latestSession.status}`, 'info');
                        this.logToChargingConsole(`   🔌 EVSE: ${latestSession.evse_uid}`, 'evse');
                        return latestSession.session_id;
                    } else {
                        this.logToChargingConsole('⚠️ No se encontraron sesiones del CPO EFI', 'warning');
                        return null;
                    }
                }
            }

            this.logToChargingConsole('⚠️ No se encontraron sesiones en la base de datos', 'warning');
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo session_id:', error);
            this.logToChargingConsole(`❌ Error obteniendo session_id: ${error.message}`, 'error');
            return null;
        }
    }

    // Obtener CDRs del CPO
  async getCpoCdrs() {
        try {
            console.log('🌐 Consultando CDRs de organizaciones externas conectadas...');

            const response = await fetch(`${this.baseUrl}/emsp/actions/get-external-cdrs`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // Formatear la respuesta para mostrar información útil
            let responseText = `📊 RESULTADO DE CONSULTA Y GUARDADO DE CDRs\n`;
            responseText += `===============================================\n\n`;
            responseText += `📈 Total de CDRs encontrados: ${data.metadata?.total_cdrs || 0}\n`;
            responseText += `🏢 Organizaciones consultadas: ${data.metadata?.organizations_consulted || 0}\n`;
            responseText += `💾 CDRs guardados en BD: ${data.metadata?.cdrs_saved || 0}\n`;
            responseText += `⚠️ CDRs duplicados (saltados): ${data.metadata?.cdrs_duplicates || 0}\n`;
            responseText += `⏰ Fecha de consulta: ${data.metadata?.timestamp || 'N/A'}\n\n`;

            if (data.metadata?.errors && data.metadata.errors.length > 0) {
                responseText += `⚠️ ERRORES ENCONTRADOS:\n`;
                data.metadata.errors.forEach((error, index) => {
                    responseText += `   ${index + 1}. ${error}\n`;
                });
                responseText += `\n`;
            }

            responseText += `✅ Operación completada exitosamente`;

            this.showCpoResponse(responseText, 'success');
            console.log('✅ CDRs obtenidos y guardados exitosamente');

        } catch (error) {
            console.error('❌ Error consultando CDRs:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

  showCpoResponse (response, type = 'info') {
    const responseElement = document.getElementById('cpoResponse')
    if (!responseElement) return

    responseElement.textContent = response
    responseElement.className = `bg-light p-3 rounded ${type === 'error' ? 'text-danger' : 'text-success'}`
  }

  logToChargingConsole (message, type = 'info') {
    const console = document.getElementById('chargingConsole')
    if (!console) return

    const now = new Date()
    const timestamp = now.toLocaleTimeString('es-ES', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
    const typeClass = {
      'info': 'text-info',
      'success': 'text-success',
      'error': 'text-danger',
      'warning': 'text-warning',
      'request': 'text-cyan',
      'response': 'text-primary',
      'system': 'text-light',
      'debug': 'text-muted',
      'token': 'text-warning',
      'evse': 'text-info',
      'session': 'text-success',
      'time': 'text-secondary'
    }[type] || 'text-light'

    const logEntry = document.createElement('div')
    logEntry.className = typeClass
    logEntry.innerHTML = `[${timestamp}] ${message}`

    console.appendChild(logEntry)
    console.scrollTop = console.scrollHeight
  }

  clearChargingConsole () {
    const console = document.getElementById('chargingConsole')
    if (!console) return

    console.innerHTML = `
            <div class="text-success">[Sistema] Consola de recarga iniciada</div>
            <div class="text-muted">[Info] Selecciona un EVSE para comenzar la recarga</div>
        `
  }

  setupCpoEventListeners () {
    try {
      console.log('🔧 Configurando event listeners CPO...')

      // Botones de acciones CPO
      const getCpoVersions = document.getElementById('getCpoVersions')
      if (getCpoVersions) {
        getCpoVersions.addEventListener('click', () => {
          this.getCpoVersions()
        })
      }

      const getCpoDetails = document.getElementById('getCpoDetails')
      if (getCpoDetails) {
        getCpoDetails.addEventListener('click', () => {
          this.getCpoDetails()
        })
      }

      const getCpoLocations = document.getElementById('getCpoLocations')
      if (getCpoLocations) {
        getCpoLocations.addEventListener('click', () => {
          this.getCpoLocations()
        })
      }

      const getCpoSessions = document.getElementById('getCpoSessions')
      if (getCpoSessions) {
        getCpoSessions.addEventListener('click', () => {
          this.getCpoSessions()
        })
      }

      const getCpoTariffs = document.getElementById('getCpoTariffs')
      if (getCpoTariffs) {
        getCpoTariffs.addEventListener('click', () => {
          this.getCpoTariffs()
        })
      }

      const getCpoTokens = document.getElementById('getCpoTokens')
      if (getCpoTokens) {
        getCpoTokens.addEventListener('click', () => {
          this.getCpoTokens()
        })
      }

      const getCpoCdrs = document.getElementById('getCpoCdrs')
      if (getCpoCdrs) {
        getCpoCdrs.addEventListener('click', () => {
          this.getCpoCdrs()
        })
      }

      // Selector de conexión CPO
      const cpoConnection = document.getElementById('cpoConnection')
      if (cpoConnection) {
        cpoConnection.addEventListener('change', () => {
          this.onCpoConnectionChange()
        })
        // Cargar conexiones al inicializar
        this.loadCpoConnections()
      }

      // Botones de recarga
      const startCpoCharging = document.getElementById('startCpoCharging')
      if (startCpoCharging) {
        startCpoCharging.addEventListener('click', () => {
          this.showSelectCpoEvseModal()
        })
      }

      const stopCpoCharging = document.getElementById('stopCpoCharging')
      if (stopCpoCharging) {
        stopCpoCharging.addEventListener('click', () => {
          this.stopChargingSession()
        })
      }

      const refreshCpoEvses = document.getElementById('refreshCpoEvses')
      if (refreshCpoEvses) {
        refreshCpoEvses.addEventListener('click', () => {
          this.loadCpoEvsesForCharging()
        })
      }

      const clearChargingConsole = document.getElementById('clearChargingConsole')
      if (clearChargingConsole) {
        clearChargingConsole.addEventListener('click', () => {
          this.clearChargingConsole()
        })
      }

      const clearCustomTokenBtn = document.getElementById('clearCustomTokenBtn')
      if (clearCustomTokenBtn) {
        clearCustomTokenBtn.addEventListener('click', () => {
          const customTokenInput = document.getElementById('customTokenInput')
          if (customTokenInput) {
            customTokenInput.value = ''
            this.logToChargingConsole('🧹 Token personalizado limpiado, se usará token de la base de datos', 'token')
          }
        })
      }

      const clearEmspData = document.getElementById('clearEmspData')
      if (clearEmspData) {
        clearEmspData.addEventListener('click', () => {
          console.log('🧨 Botón clearEmspData clickeado')
          this.clearEmspDataWithConfirmation()
        })
        console.log('✅ Event listener para clearEmspData agregado')
      } else {
        console.warn('⚠️ Elemento clearEmspData no encontrado')
      }

      console.log('✅ Event listeners CPO configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners CPO:', error)
    }
  }
}
