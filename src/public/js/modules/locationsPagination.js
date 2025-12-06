/**
 * Paginación de Locations y otras funciones relacionadas
 * Extraído de app.js (líneas 3090-4036)
 */

import { ApiUtils } from '../utils/api.js'

export class LocationsPaginationModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== PAGINACIÓN DE LOCATIONS =====

  // Renderizar página específica de Locations
  renderLocationsPage () {
    if (!this.app.allLocations || this.app.allLocations.length === 0) {
      if (this.app.dataLoadingModule && this.app.dataLoadingModule.renderLocations) {
        this.app.dataLoadingModule.renderLocations([])
      }
      this.updateLocationsPaginationInfo(0, 0, 0)
      return
    }

    const startIndex = (this.app.currentLocationsPage - 1) * this.app.locationsPerPage
    const endIndex = startIndex + this.app.locationsPerPage
    const pageLocations = this.app.allLocations.slice(startIndex, endIndex)

    if (this.app.dataLoadingModule && this.app.dataLoadingModule.renderLocations) {
      this.app.dataLoadingModule.renderLocations(pageLocations)
    }
    this.updateLocationsPaginationInfo(startIndex + 1, endIndex, this.app.allLocations.length)
    this.updateLocationsPaginationButtons()
  }

    // Actualizar información de paginado de Locations
    updateLocationsPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('locationsPageInfo');
        const totalCount = document.getElementById('locationsTotalCount');
        
        if (pageInfo) pageInfo.textContent = `${start}-${Math.min(end, total)}`;
        if (totalCount) totalCount.textContent = total;
    }

    // Actualizar botones de paginado de Locations
    updateLocationsPaginationButtons() {
        const prevButton = document.getElementById('locationsPrevPage');
        const nextButton = document.getElementById('locationsNextPage');
        
    if (prevButton) {
      prevButton.disabled = this.app.currentLocationsPage <= 1
      if (prevButton.parentElement) {
        prevButton.parentElement.classList.toggle('disabled', this.app.currentLocationsPage <= 1)
      }
    }

    if (nextButton) {
      const totalPages = Math.ceil(this.app.allLocations.length / this.app.locationsPerPage)
      nextButton.disabled = this.app.currentLocationsPage >= totalPages
      if (nextButton.parentElement) {
        nextButton.parentElement.classList.toggle('disabled', this.app.currentLocationsPage >= totalPages)
      }
    }
  }

  // Ir a página anterior de Locations
  goToLocationsPrevPage () {
    if (this.app.currentLocationsPage > 1) {
      this.app.currentLocationsPage--
      this.renderLocationsPage()
    }
  }

  // Ir a página siguiente de Locations
  goToLocationsNextPage () {
    const totalPages = Math.ceil(this.app.allLocations.length / this.app.locationsPerPage)
    if (this.app.currentLocationsPage < totalPages) {
      this.app.currentLocationsPage++
      this.renderLocationsPage()
    }
  }

    async loadConnections() {
        try {
            console.log('🔄 Cargando conexiones...');
            
            const response = await fetch(`${this.baseUrl}/api/connections`, {
                headers: { 
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Connections data:', data);
            
            this.renderConnections(data.data || []);
            this.app.ui.updateCount('connectionsCount', data.data?.length || 0);
            
            console.log('✅ Conexiones cargadas exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando conexiones:', error);
            this.app.ui.showTableError('connectionsTableBody', `Error al cargar conexiones: ${error.message}`);
        }
    }

    renderConnections(connections) {
        const tbody = document.getElementById('connectionsTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento connectionsTableBody no encontrado');
            return;
        }
        
        if (connections.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay conexiones disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = connections.map(conn => `
            <tr class="fade-in">
                <td>
                    <input type="checkbox" class="form-check-input connection-checkbox" 
                           data-party-id="${conn.party_id}" 
                           data-country-code="${conn.country_code}">
                </td>
                <td><code>${conn.party_id}</code></td>
                <td>${conn.country_code}</td>
                <td><a href="${conn.url}" target="_blank" class="text-decoration-none">${conn.url}</a></td>
                <td><code>${this.app.ui.truncateToken(conn.token)}</code></td>
                <td>${new Date(conn.last_updated).toLocaleString()}</td>
                <td><span class="badge bg-success">Activa</span></td>
            </tr>
        `).join('');
        
        // Agregar event listeners para los checkboxes
        this.setupConnectionCheckboxes();
        
        console.log(`✅ ${connections.length} conexiones renderizadas`);
    }

    setupConnectionCheckboxes() {
        // Event listener para "Seleccionar todo"
        const selectAllCheckbox = document.getElementById('selectAllConnections');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.connection-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
                this.updateDeleteButton();
            });
        }

        // Event listeners para checkboxes individuales
        const checkboxes = document.querySelectorAll('.connection-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateDeleteButton();
                this.updateSelectAllCheckbox();
            });
        });
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAllConnections');
        const checkboxes = document.querySelectorAll('.connection-checkbox');
        
        if (selectAllCheckbox && checkboxes.length > 0) {
            const checkedCount = document.querySelectorAll('.connection-checkbox:checked').length;
            selectAllCheckbox.checked = checkedCount === checkboxes.length;
            selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
        }
    }

    updateDeleteButton() {
        const deleteBtn = document.getElementById('deleteConnectionBtn');
        const checkedCount = document.querySelectorAll('.connection-checkbox:checked').length;
        
        if (deleteBtn) {
            deleteBtn.disabled = checkedCount === 0;
            // El botón mantiene solo el icono, el tooltip se actualiza
            deleteBtn.title = checkedCount > 0 ? 
                `Eliminar ${checkedCount} conexión(es) seleccionada(s)` : 
                'Eliminar conexiones seleccionadas';
        }
    }

    async deleteSelectedConnections() {
        const checkedBoxes = document.querySelectorAll('.connection-checkbox:checked');
        
        if (checkedBoxes.length === 0) {
            this.app.ui.showNotification('No hay conexiones seleccionadas', 'warning');
            return;
        }

        const confirmMessage = `¿Estás seguro de que quieres eliminar ${checkedBoxes.length} conexión(es)?`;
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            console.log(`🗑️ Eliminando ${checkedBoxes.length} conexiones...`);
            
            const deletePromises = Array.from(checkedBoxes).map(async (checkbox) => {
                const partyId = checkbox.dataset.partyId;
                const countryCode = checkbox.dataset.countryCode;
                
                const response = await fetch(`${this.baseUrl}/api/delete-connection/${partyId}/${countryCode}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${ApiUtils.getAuthToken()}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.status_message || 'Error eliminando conexión');
                }
                
                return { partyId, countryCode };
            });

            const results = await Promise.all(deletePromises);
            
            console.log(`✅ ${results.length} conexiones eliminadas exitosamente`);
            this.app.ui.showNotification(`${results.length} conexión(es) eliminada(s) exitosamente`, 'success');
            
            // Recargar la lista de conexiones
            this.loadConnections();
            
        } catch (error) {
            console.error('❌ Error eliminando conexiones:', error);
            this.app.ui.showNotification(`Error eliminando conexiones: ${error.message}`, 'error');
        }
    }

    async loadTokens() {
        try {
            console.log('🔄 Cargando tokens...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tokens`, {
                headers: { 
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const tokens = Array.isArray(data.data) ? data.data : [];
            console.log('📊 Tokens data:', tokens.length ? `Array[${tokens.length}]` : data);
            
            this.app.allTokens = tokens;
            this.app.filteredTokens = [...tokens];
            this.app.currentTokensPage = 1;
            this.renderTokensPage();
            this.app.ui.updateCount('tokensCount', tokens.length);
            
            console.log('✅ Tokens cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando tokens:', error);
            this.app.ui.showTableError('tokensTableBody', `Error al cargar tokens: ${error.message}`);
            this.app.allTokens = []
            this.app.filteredTokens = []
            this.app.currentTokensPage = 1
            this.updateTokensPaginationInfo(0, 0, 0);
            this.updateTokensPaginationButtons();
            this.app.ui.updateCount('tokensCount', 0);
        }
    }

    renderTokens(tokens) {
        const tbody = document.getElementById('tokensTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento tokensTableBody no encontrado');
            return;
        }
        
        const totalTokens = Array.isArray(this.app.allTokens) ? this.app.allTokens.length : 0;
        if (tokens.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="bi ${totalTokens > 0 ? 'bi-funnel' : 'bi-inbox'}"></i> ${totalTokens > 0 ? 'No se encontraron tokens para esta página' : 'No hay tokens disponibles'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tokens.map(token => `
            <tr class="fade-in">
                <td>
                    <input type="checkbox" class="token-checkbox" data-token-id="${token.id}" data-token-uid="${token.uid}">
                </td>
                <td><code>${this.app.ui.truncateToken(token.uid)}</code></td>
                <td><code>${token.party_id}</code></td>
                <td>${token.country_code}</td>
                <td>
                    <span class="badge ${token.valid ? 'bg-success' : 'bg-secondary'}">
                        ${token.valid ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${token.type}</td>
                <td>${token.whitelist || 'N/A'}</td>
                <td>${new Date(token.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
        
        // Configurar event listeners para los checkboxes
        this.setupTokenCheckboxes();
        
        console.log(`✅ ${tokens.length} tokens renderizados en la página actual`);
    }

    setupTokenCheckboxes() {
        try {
            // Checkbox principal para seleccionar todos
            const selectAllCheckbox = document.getElementById('selectAllTokensCheckbox');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    const isChecked = e.target.checked;
                    const checkboxes = document.querySelectorAll('.token-checkbox');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = isChecked;
                    });
                    this.updateDeleteButtonState();
                });
            }

            // Checkboxes individuales
            const checkboxes = document.querySelectorAll('.token-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.updateSelectAllCheckbox();
                    this.updateDeleteButtonState();
                });
            });

            // Actualizar estado inicial
            this.updateSelectAllCheckbox();
            this.updateDeleteButtonState();
        } catch (error) {
            console.error('❌ Error configurando checkboxes de tokens:', error);
        }
    }

    updateSelectAllCheckbox() {
        try {
            const selectAllCheckbox = document.getElementById('selectAllTokensCheckbox');
            const checkboxes = document.querySelectorAll('.token-checkbox');
            
            if (selectAllCheckbox && checkboxes.length > 0) {
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                const someChecked = Array.from(checkboxes).some(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = someChecked && !allChecked;
            }
        } catch (error) {
            console.error('❌ Error actualizando checkbox de seleccionar todos:', error);
        }
    }

    updateDeleteButtonState() {
        try {
            const deleteBtn = document.getElementById('deleteSelectedTokensBtn');
            const checkboxes = document.querySelectorAll('.token-checkbox:checked');
            
            if (deleteBtn) {
                deleteBtn.disabled = checkboxes.length === 0;
            }
        } catch (error) {
            console.error('❌ Error actualizando estado del botón eliminar:', error);
        }
    }

    toggleSelectAllTokens() {
        try {
            const selectAllCheckbox = document.getElementById('selectAllTokensCheckbox');
            if (selectAllCheckbox) {
                const isCurrentlyChecked = selectAllCheckbox.checked;
                selectAllCheckbox.checked = !isCurrentlyChecked;
                selectAllCheckbox.dispatchEvent(new Event('change'));
            }
        } catch (error) {
            console.error('❌ Error alternando selección de todos los tokens:', error);
        }
    }

    getSelectedTokenIds() {
        try {
            const checkboxes = document.querySelectorAll('.token-checkbox:checked');
            return Array.from(checkboxes).map(cb => cb.getAttribute('data-token-id'));
        } catch (error) {
            console.error('❌ Error obteniendo IDs de tokens seleccionados:', error);
            return [];
        }
    }

    async deleteSelectedTokens() {
        try {
            const selectedIds = this.getSelectedTokenIds();
            
            if (selectedIds.length === 0) {
                this.app.ui.showNotification('No hay tokens seleccionados para eliminar', 'warning');
                return;
            }

            // Confirmar eliminación
            const confirmMessage = selectedIds.length === 1 
                ? `¿Está seguro de que desea eliminar el token seleccionado?`
                : `¿Está seguro de que desea eliminar ${selectedIds.length} tokens seleccionados?`;
            
            if (!confirm(confirmMessage)) {
                return;
            }

            console.log(`🗑️ Eliminando ${selectedIds.length} tokens...`);
            
            // Eliminar tokens uno por uno
            const deletePromises = selectedIds.map(tokenId => 
                fetch(`${this.baseUrl}/ocpi/cpo/2.2/tokens/${tokenId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${ApiUtils.getAuthToken()}`
                    }
                })
            );

            const results = await Promise.allSettled(deletePromises);
            
            // Contar éxitos y errores
            let successCount = 0;
            let errorCount = 0;
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.ok) {
                    successCount++;
                } else {
                    errorCount++;
                    console.error(`❌ Error eliminando token ${selectedIds[index]}:`, result.reason || result.value);
                }
            });

            // Mostrar resultado
            if (errorCount === 0) {
                this.app.ui.showNotification(`${successCount} token(s) eliminado(s) exitosamente`, 'success');
            } else if (successCount > 0) {
                this.app.ui.showNotification(`${successCount} token(s) eliminado(s), ${errorCount} error(es)`, 'warning');
            } else {
                this.app.ui.showNotification(`Error al eliminar tokens`, 'error');
            }

            // Recargar lista de tokens
            this.loadTokens();
            
        } catch (error) {
            console.error('❌ Error eliminando tokens seleccionados:', error);
            this.app.ui.showNotification(`Error al eliminar tokens: ${error.message}`, 'error');
        }
    }

    renderTokensPage() {
        const tokens = Array.isArray(this.app.filteredTokens) ? this.app.filteredTokens : [];
        const totalTokens = tokens.length;

        if (totalTokens === 0) {
            this.renderTokens([]);
            this.updateTokensPaginationInfo(0, 0, 0);
            this.updateTokensPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalTokens / this.app.tokensPerPage));
        if (this.app.currentTokensPage > totalPages) {
            this.app.currentTokensPage = totalPages;
        }
        if (this.app.currentTokensPage < 1) {
            this.app.currentTokensPage = 1;
        }

        const startIndex = (this.app.currentTokensPage - 1) * this.app.tokensPerPage;
        const endIndex = Math.min(startIndex + this.app.tokensPerPage, totalTokens);
        const pageTokens = tokens.slice(startIndex, endIndex);

        this.renderTokens(pageTokens);
        this.updateTokensPaginationInfo(startIndex + 1, endIndex, totalTokens);
        this.updateTokensPaginationButtons();
    }

    updateTokensPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('tokensPageInfo');
        const totalCount = document.getElementById('tokensTotalCount');

        if (pageInfo) {
            pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

    updateTokensPaginationButtons() {
        const prevButton = document.getElementById('tokensPrevPage');
        const nextButton = document.getElementById('tokensNextPage');
        const totalTokens = Array.isArray(this.app.filteredTokens) ? this.app.filteredTokens.length : 0;
        const totalPages = totalTokens > 0 ? Math.ceil(totalTokens / this.app.tokensPerPage) : 1;

        const atFirstPage = this.app.currentTokensPage <= 1 || totalTokens === 0;
        const atLastPage = this.app.currentTokensPage >= totalPages || totalTokens === 0;

        if (prevButton) {
            prevButton.disabled = atFirstPage;
            if (prevButton.parentElement) {
                prevButton.parentElement.classList.toggle('disabled', atFirstPage);
            }
        }

        if (nextButton) {
            nextButton.disabled = atLastPage;
            if (nextButton.parentElement) {
                nextButton.parentElement.classList.toggle('disabled', atLastPage);
            }
        }
    }

    goToTokensPrevPage() {
        if (this.app.currentTokensPage > 1) {
            this.app.currentTokensPage--
            this.renderTokensPage();
        }
    }

    goToTokensNextPage() {
        const totalTokens = Array.isArray(this.app.filteredTokens) ? this.app.filteredTokens.length : 0;
        const totalPages = Math.ceil(totalTokens / this.app.tokensPerPage);

        if (this.app.currentTokensPage < totalPages) {
            this.app.currentTokensPage++
            this.renderTokensPage();
        }
    }

    truncateToken(token, length = 20) {
        if (!token) return 'N/A';
        return token.length > length ? token.substring(0, length) + '...' : token;
    }

    async loadSessions() {
        try {
            console.log('🔄 Cargando sesiones de carga...');
            console.log('🔗 URL:', `${this.baseUrl}/ocpi/cpo/2.2/sessions`);
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/sessions`, {
                headers: { 
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Sessions data:', data.data ? `Array[${data.data.length}]` : data);
            console.log('📊 Sessions count:', data.data ? data.data.length : 0);
            
            // Almacenar todas las sesiones para filtrado
            this.app.allSessions = Array.isArray(data.data) ? data.data : []
            console.log('💾 Stored sessions:', this.app.allSessions.length);
            
            // Aplicar filtro y renderizar
            this.filterSessions({ resetPage: true });

            // Actualizar banner de sesiones activas
            this.updateActiveSessionBanner();

            console.log('✅ Sesiones cargadas exitosamente');

        } catch (error) {
            console.error('❌ Error cargando sesiones:', error);
            this.app.ui.showTableError('sessionsTableBody', `Error al cargar sesiones: ${error.message}`);
            this.app.allSessions = []
            this.app.filteredSessions = [];
            this.app.currentSessionsPage = 1;
            this.updateSessionsPaginationInfo(0, 0, 0);
            this.updateSessionsPaginationButtons();
            this.app.ui.updateCount('sessionsCount', 0);
        }
    }

    renderSessions(sessions) {
        console.log('🎨 Renderizando sesiones:', sessions.length);
        console.log('🎨 Sessions data:', Array.isArray(sessions) ? `Array[${sessions.length}]` : sessions);
        
        const tbody = document.getElementById('sessionsTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento sessionsTableBody no encontrado');
            return;
        }
        
        console.log('✅ Elemento sessionsTableBody encontrado');
        
        if (sessions.length === 0) {
            console.log('📭 No hay sesiones para mostrar');
            const filterActiveCheckbox = document.getElementById('filterActiveSessions');
            const showOnlyActive = filterActiveCheckbox ? filterActiveCheckbox.checked : false;
            const message = showOnlyActive ? 
                'No hay sesiones activas disponibles' : 
                'No hay sesiones de carga disponibles';
            
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted py-4">
                        <i class="bi bi-lightning-charge fs-1 d-block mb-2"></i>
                        ${message}
                        ${showOnlyActive && this.app.allSessions.length > 0 ? 
                            `<br><small class="text-muted">Total de sesiones: ${this.app.allSessions.length}</small>` : 
                            ''
                        }
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = sessions.map(session => `
            <tr class="fade-in">
                <td><code>${this.app.ui.truncateToken(session.id)}</code></td>
                <td><code>${this.app.ui.truncateToken(session.auth_id)}</code></td>
                <td><code>${this.app.ui.truncateToken(session.location_id)}</code></td>
                <td>
                    <span class="badge ${this.getSessionStatusBadgeClass(session.status)}">
                        ${session.status}
                    </span>
                </td>
                <td>${session.start_date_time ? new Date(session.start_date_time).toLocaleString() : 'N/A'}</td>
                <td>${session.end_date_time ? new Date(session.end_date_time).toLocaleString() : 'En curso'}</td>
                <td>${session.kwh ? parseFloat(session.kwh).toFixed(2) : '0.00'}</td>
                <td>${session.total_cost ? `€${parseFloat(session.total_cost).toFixed(2)}` : 'N/A'}</td>
                <td><code>${session.country_code}*${session.party_id}</code></td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-info btn-sm" onclick="window.dashboardApp.viewSessionDetails('${session.id}')" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${session.status === 'ACTIVE' ? `
                            <button class="btn btn-outline-danger btn-sm" onclick="window.dashboardApp.endSession('${session.id}')" title="Finalizar sesión">
                                <i class="bi bi-stop-circle"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
        
        console.log(`✅ ${sessions.length} sesiones renderizadas`);
        console.log('🎨 HTML generado:', tbody.innerHTML.substring(0, 200) + '...');
    }

    getSessionStatusBadgeClass(status) {
        const statusClasses = {
            'ACTIVE': 'bg-success',
            'COMPLETED': 'bg-primary',
            'INVALID': 'bg-danger',
            'PENDING': 'bg-warning'
        };
        return statusClasses[status] || 'bg-secondary';
    }

    async viewSessionDetails(sessionId) {
        try {
            console.log('👁️ Ver detalles de sesión:', sessionId);

            // Buscar la sesión en el array de sesiones cargadas
            const session = this.app.allSessions.find(s => s.id === sessionId);

            if (!session) {
                this.app.ui.showNotification('No se encontró la sesión', 'error');
                return;
            }

            // Poblar el modal con los datos de la sesión
            document.getElementById('sessionDetailId').textContent = session.id || '-';

            // Estado con badge de color
            const statusBadge = document.getElementById('sessionDetailStatus');
            statusBadge.textContent = session.status || '-';
            statusBadge.className = 'badge ' + this.getSessionStatusBadgeClass(session.status);

            document.getElementById('sessionDetailParty').textContent =
                `${session.country_code || '-'}*${session.party_id || '-'}`;

            // Fechas
            document.getElementById('sessionDetailStartTime').textContent =
                session.start_date_time ? new Date(session.start_date_time).toLocaleString('es-ES') : '-';
            document.getElementById('sessionDetailEndTime').textContent =
                session.end_date_time ? new Date(session.end_date_time).toLocaleString('es-ES') : 'En progreso';
            document.getElementById('sessionDetailKwh').textContent =
                session.kwh !== undefined && session.kwh !== null ? parseFloat(session.kwh).toFixed(2) : '-';

            // Ubicación
            document.getElementById('sessionDetailLocationId').textContent = session.location_id || '-';
            document.getElementById('sessionDetailEvseUid').textContent = session.evse_uid || '-';
            document.getElementById('sessionDetailConnectorId').textContent = session.connector_id || '-';

            // Token
            if (session.cdr_token) {
                document.getElementById('sessionDetailTokenUid').textContent = session.cdr_token.uid || '-';
                document.getElementById('sessionDetailTokenType').textContent = session.cdr_token.type || '-';
                document.getElementById('sessionDetailTokenContract').textContent = session.cdr_token.contract_id || '-';
            } else {
                document.getElementById('sessionDetailTokenUid').textContent = '-';
                document.getElementById('sessionDetailTokenType').textContent = '-';
                document.getElementById('sessionDetailTokenContract').textContent = '-';
            }

            // Autenticación
            document.getElementById('sessionDetailAuthMethod').textContent = session.auth_method || '-';
            document.getElementById('sessionDetailAuthRef').textContent = session.authorization_reference || 'N/A';

            // Costo
            document.getElementById('sessionDetailCurrency').textContent = session.currency || '-';
            if (session.total_cost) {
                const cost = typeof session.total_cost === 'object'
                    ? session.total_cost.excl_vat
                    : session.total_cost;
                document.getElementById('sessionDetailTotalCost').textContent =
                    cost !== undefined && cost !== null ? `${parseFloat(cost).toFixed(2)} ${session.currency || ''}` : 'N/A';
            } else {
                document.getElementById('sessionDetailTotalCost').textContent = 'N/A';
            }

            // Períodos de carga
            const chargingPeriodsContainer = document.getElementById('sessionDetailChargingPeriods');
            if (session.charging_periods && Array.isArray(session.charging_periods) && session.charging_periods.length > 0) {
                chargingPeriodsContainer.innerHTML = session.charging_periods.map((period, index) => `
                    <div class="card mb-2">
                        <div class="card-body">
                            <h6 class="card-title">Período ${index + 1}</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <small><strong>Inicio:</strong></small>
                                    <p>${period.start_date_time ? new Date(period.start_date_time).toLocaleString('es-ES') : '-'}</p>
                                </div>
                                <div class="col-md-6">
                                    <small><strong>Tariff ID:</strong></small>
                                    <p class="font-monospace">${period.tariff_id || 'N/A'}</p>
                                </div>
                            </div>
                            ${period.dimensions && period.dimensions.length > 0 ? `
                                <small><strong>Dimensiones:</strong></small>
                                <ul class="list-unstyled">
                                    ${period.dimensions.map(dim => `
                                        <li><span class="badge bg-secondary">${dim.type}</span>: ${dim.volume}</li>
                                    `).join('')}
                                </ul>
                            ` : '<p class="text-muted">Sin dimensiones</p>'}
                        </div>
                    </div>
                `).join('');
            } else {
                chargingPeriodsContainer.innerHTML = '<p class="text-muted">No hay períodos de carga</p>';
            }

            // Información adicional
            document.getElementById('sessionDetailMeterId').textContent = session.meter_id || 'N/A';
            document.getElementById('sessionDetailLastUpdated').textContent =
                session.last_updated ? new Date(session.last_updated).toLocaleString('es-ES') : '-';

            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('sessionDetailModal'));
            modal.show();

        } catch (error) {
            console.error('❌ Error mostrando detalles de sesión:', error);
            this.app.ui.showNotification('Error cargando detalles de la sesión: ' + error.message, 'error');
        }
    }

    async endSession(sessionId) {
        try {
            console.log('🛑 Finalizando sesión:', sessionId);
            
            // Confirmar la acción
            if (!confirm('¿Estás seguro de que quieres finalizar esta sesión?')) {
                return;
            }

            // Mostrar indicador de carga
            this.app.ui.showNotification('Finalizando sesión...', 'info');

            // Llamar al endpoint para finalizar la sesión
            const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Sesión finalizada exitosamente:', result);

            this.app.ui.showNotification('Sesión finalizada exitosamente', 'success');

            // Recargar las sesiones para mostrar los cambios
            await this.loadSessions();

        } catch (error) {
            console.error('❌ Error finalizando sesión:', error);
            this.app.ui.showNotification(`Error finalizando sesión: ${error.message}`, 'error');
        }
    }

    renderSessionsPage() {
        const sessions = Array.isArray(this.app.filteredSessions) ? this.app.filteredSessions : [];
        const totalSessions = sessions.length;

        if (totalSessions === 0) {
            this.renderSessions([]);
            this.updateSessionsPaginationInfo(0, 0, 0);
            this.updateSessionsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalSessions / this.app.sessionsPerPage));
        if (this.app.currentSessionsPage > totalPages) {
            this.app.currentSessionsPage = totalPages;
        }
        if (this.app.currentSessionsPage < 1) {
            this.app.currentSessionsPage = 1;
        }

        const startIndex = (this.app.currentSessionsPage - 1) * this.app.sessionsPerPage;
        const endIndex = Math.min(startIndex + this.app.sessionsPerPage, totalSessions);
        const pageSessions = sessions.slice(startIndex, endIndex);

        this.renderSessions(pageSessions);
        this.updateSessionsPaginationInfo(startIndex + 1, endIndex, totalSessions);
        this.updateSessionsPaginationButtons();
    }

    updateSessionsPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('sessionsPageInfo');
        const totalCount = document.getElementById('sessionsTotalCount');

        if (pageInfo) {
            pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

    updateSessionsPaginationButtons() {
        const prevButton = document.getElementById('sessionsPrevPage');
        const nextButton = document.getElementById('sessionsNextPage');
        const totalSessions = Array.isArray(this.app.filteredSessions) ? this.app.filteredSessions.length : 0;
        const totalPages = totalSessions > 0 ? Math.ceil(totalSessions / this.app.sessionsPerPage) : 1;

        const atFirstPage = this.app.currentSessionsPage <= 1 || totalSessions === 0;
        const atLastPage = this.app.currentSessionsPage >= totalPages || totalSessions === 0;

        if (prevButton) {
            prevButton.disabled = atFirstPage;
            if (prevButton.parentElement) {
                prevButton.parentElement.classList.toggle('disabled', atFirstPage);
            }
        }

        if (nextButton) {
            nextButton.disabled = atLastPage;
            if (nextButton.parentElement) {
                nextButton.parentElement.classList.toggle('disabled', atLastPage);
            }
        }
    }

    goToSessionsPrevPage() {
        if (this.app.currentSessionsPage > 1) {
            this.app.currentSessionsPage--
            this.renderSessionsPage();
        }
    }

    goToSessionsNextPage() {
        const totalSessions = Array.isArray(this.app.filteredSessions) ? this.app.filteredSessions.length : 0;
        const totalPages = Math.ceil(totalSessions / this.app.sessionsPerPage);

        if (this.app.currentSessionsPage < totalPages) {
            this.app.currentSessionsPage++
            this.renderSessionsPage();
        }
    }

    filterSessions({ resetPage = false } = {}) {
        try {
            console.log('🔍 Iniciando filtro de sesiones');
            console.log('🔍 allSessions:', this.app.allSessions);
            console.log('🔍 allSessions length:', this.app.allSessions ? this.app.allSessions.length : 'undefined');
            
            const filterActiveCheckbox = document.getElementById('filterActiveSessions');
            const showOnlyActive = filterActiveCheckbox ? filterActiveCheckbox.checked : false;
            
            console.log('🔍 Aplicando filtro de sesiones:', showOnlyActive ? 'Solo activas' : 'Todas');
            console.log('🔍 Filter checkbox found:', !!filterActiveCheckbox);
            console.log('🔍 Filter checkbox checked:', showOnlyActive);
            
            let filteredSessions = this.app.allSessions ? [...this.app.allSessions] : [];
            
            if (showOnlyActive) {
                filteredSessions = filteredSessions.filter(session => 
                    session.status === 'ACTIVE'
                );
                console.log(`📊 Filtradas ${filteredSessions.length} sesiones activas de ${this.app.allSessions.length} totales`);
            } else {
                console.log(`📊 Mostrando todas las ${filteredSessions.length} sesiones`);
            }
            
            console.log('🔍 Filtered sessions:', filteredSessions);
            
            this.app.filteredSessions = filteredSessions;
            if (resetPage) {
                this.app.currentSessionsPage = 1;
            }
            this.renderSessionsPage();
            this.app.ui.updateCount('sessionsCount', filteredSessions.length);
            
        } catch (error) {
            console.error('❌ Error aplicando filtro de sesiones:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
