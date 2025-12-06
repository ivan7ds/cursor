/**
 * Métodos para Sesiones Externas
 * Extraído de app.js (líneas 11102-13633)
 */

import { ApiUtils } from '../utils/api.js'

export class ExtSessionsModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== MÉTODOS PARA SESIONES EXTERNAS =====

  async loadExtSessions () {
    try {
      console.log('☁️ Cargando sesiones externas...')

      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/api/ext-sessions`)
      
      // Asignar los datos a this.app.allExtSessions
      this.app.allExtSessions = Array.isArray(data.data) ? data.data : []
            
      console.log(`✅ ${this.app.allExtSessions.length} sesiones externas cargadas`)
      console.log('🔍 Datos de sesiones externas:', this.app.allExtSessions)
      if (this.app.emspModule && this.app.emspModule.ensureEmspEvsesLoaded) {
        await this.app.emspModule.ensureEmspEvsesLoaded()
      }
      this.applyExtSessionsFilters({ resetPage: true })
      this.updateExtSessionsCount()
            
        } catch (error) {
            console.error('❌ Error cargando sesiones externas:', error);
            this.renderExtSessionsError();
        }
    }

    renderExtSessions(sessions) {
        const tbody = document.getElementById('extSessionsTableBody');
        if (!tbody) {
            console.error('❌ No se encontró extSessionsTableBody');
            return;
        }

        const hasData = Array.isArray(this.app.allExtSessions) && this.app.allExtSessions.length > 0;
        const hasSearch = Boolean((this.app.extSessionsSearchQuery || '').trim());

        if (!Array.isArray(sessions) || sessions.length === 0) {
            let emptyIcon = 'bi-cloud-download';
            let emptyMessage = 'No hay sesiones externas disponibles';

            if (hasSearch) {
                emptyIcon = 'bi-search';
                emptyMessage = `No se encontraron sesiones externas para "${this.app.ui.escapeHtml(this.app.extSessionsSearchQuery.trim())}"`;
            } else if (this.app.filterActiveExtSessions && hasData) {
                emptyIcon = 'bi-funnel';
                emptyMessage = 'No se encontraron sesiones externas activas o pendientes';
            }

            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-muted py-4">
                        <i class="bi ${emptyIcon} fs-1 d-block mb-2"></i>
                        ${emptyMessage}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = sessions.map(session => {
            const evseId = this.app.emspModule && this.app.emspModule.getEmspEvseId
              ? this.app.emspModule.getEmspEvseId(session.evse_uid)
              : null
            const evseDisplay = evseId || session.evse_uid || 'N/A'
            const evseTitleParts = [];
            if (evseId) {
                evseTitleParts.push(`EVSE ID: ${evseId}`);
            }
            if (session.evse_uid && (!evseId || evseId !== session.evse_uid)) {
                evseTitleParts.push(`EVSE UID: ${session.evse_uid}`);
            }
            const evseTitle = evseTitleParts.length > 0 ? evseTitleParts.join(' • ') : evseDisplay;
            const sessionIdJs = JSON.stringify(session.session_id || '');
            const evseUidJs = JSON.stringify(session.evse_uid || '');

            return `
                <tr>
                    <td>
                        <span class="text-truncate d-inline-block" style="max-width: 150px;" 
                              title="${this.app.ui.escapeHtml(session.session_id || 'N/A')}">
                            ${this.app.ui.escapeHtml(session.session_id || 'N/A')}
                        </span>
                    </td>
                    <td>
                        <span class="badge bg-info">${this.app.ui.escapeHtml(session.emsp_party_id || 'N/A')}</span>
                    </td>
                    <td>
                        <span class="text-truncate d-inline-block" style="max-width: 100px;" 
                              title="${this.app.ui.escapeHtml(session.id_token || 'N/A')}">
                            ${this.app.ui.escapeHtml(session.id_token || 'N/A')}
                        </span>
                    </td>
                    <td>
                        <span class="text-truncate d-inline-block" style="max-width: 140px;" 
                              title="${this.app.ui.escapeHtml(evseTitle)}">
                            ${this.app.ui.escapeHtml(evseDisplay)}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${this.getExtSessionStatusBadgeClass(session.status)}">
                            ${this.app.ui.escapeHtml(session.status || 'UNKNOWN')}
                        </span>
                    </td>
                    <td>
                        ${session.start_datetime ? new Date(session.start_datetime).toLocaleString('es-ES') : 'N/A'}
                    </td>
                    <td>
                        ${session.end_datetime ? new Date(session.end_datetime).toLocaleString('es-ES') : 'N/A'}
                    </td>
                    <td>
                        ${session.kwh ? parseFloat(session.kwh).toFixed(3) : '0.000'} kWh
                    </td>
                    <td>
                        ${session.total_cost ? `€${parseFloat(session.total_cost).toFixed(2)}` : 'N/A'}
                    </td>
                    <td>
                        <span class="badge bg-secondary">${this.app.ui.escapeHtml(session.currency || 'EUR')}</span>
                    </td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-info btn-sm" title="Ver detalles"
                                    onclick='window.dashboardApp.viewExtSessionDetails(${sessionIdJs})'>
                                <i class="bi bi-eye"></i>
                            </button>
                            ${session.status === 'ACTIVE' || session.status === 'IN_PROGRESS' ? `
                                <button class="btn btn-outline-danger btn-sm" title="Cerrar sesión"
                                        onclick='window.dashboardApp.closeExtSession(${sessionIdJs}, ${evseUidJs})'>
                                    <i class="bi bi-stop-circle"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        console.log(`✅ ${sessions.length} Ext Sessions renderizadas en la página actual`);
    }

    applyExtSessionsFilters({ resetPage = false } = {}) {
        const sessions = Array.isArray(this.app.allExtSessions) ? this.app.allExtSessions : [];

        let filtered = sessions;

        if (this.app.filterActiveExtSessions) {
            filtered = filtered.filter(session => {
                const status = (session.status || '').toUpperCase();
                return status === 'ACTIVE' || status === 'PENDING' || status === 'IN_PROGRESS';
            });
        }

        const searchQuery = (this.app.extSessionsSearchQuery || '').trim().toLowerCase();
        if (searchQuery) {
            const terms = searchQuery.split(/\s+/).filter(Boolean);
            if (terms.length > 0) {
                filtered = filtered.filter(session => {
                    const evseId = this.app.emspModule && this.app.emspModule.getEmspEvseId
                      ? this.app.emspModule.getEmspEvseId(session.evse_uid)
                      : null
                    const locationName = this.app.emspModule && this.app.emspModule.getEmspLocationName
                      ? this.app.emspModule.getEmspLocationName(session.location_id)
                      : null
                    const searchableParts = [
                        session.session_id,
                        session.emsp_party_id,
                        session.id_token,
                        session.evse_uid,
                        evseId,
                        session.status,
                        session.currency,
                        session.connector_id,
                        session.location_id,
                        locationName,
                        session.total_cost,
                        session.kwh
                    ].map(value => (value || '').toString().toLowerCase());
                    const searchable = searchableParts.join(' ');
                    return terms.every(term => searchable.includes(term));
                });
            }
        }

        this.app.filteredExtSessions = filtered;

        const totalPages = this.app.filteredExtSessions.length > 0
            ? Math.ceil(this.app.filteredExtSessions.length / this.app.extSessionsPerPage)
            : 1;

        if (resetPage) {
            this.app.currentExtSessionsPage = 1;
        } else if (this.app.currentExtSessionsPage > totalPages) {
            this.app.currentExtSessionsPage = totalPages;
        }

        this.renderExtSessionsPage();
    }

    renderExtSessionsPage() {
        const sessions = Array.isArray(this.app.filteredExtSessions) ? this.app.filteredExtSessions : [];
        const totalSessions = sessions.length;

        if (totalSessions === 0) {
            this.renderExtSessions([]);
            this.updateExtSessionsPaginationInfo(0, 0, 0);
            this.updateExtSessionsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalSessions / this.app.extSessionsPerPage));
        if (this.app.currentExtSessionsPage > totalPages) {
            this.app.currentExtSessionsPage = totalPages;
        }
        if (this.app.currentExtSessionsPage < 1) {
            this.app.currentExtSessionsPage = 1;
        }

        const startIndex = (this.app.currentExtSessionsPage - 1) * this.app.extSessionsPerPage;
        const endIndex = Math.min(startIndex + this.app.extSessionsPerPage, totalSessions);
        const pageSessions = sessions.slice(startIndex, endIndex);

        this.renderExtSessions(pageSessions);
        this.updateExtSessionsPaginationInfo(startIndex + 1, endIndex, totalSessions);
        this.updateExtSessionsPaginationButtons();
    }

    updateExtSessionsPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('extSessionsPageInfo');
        const totalCount = document.getElementById('extSessionsTotalCount');

        if (pageInfo) {
            pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

    updateExtSessionsPaginationButtons() {
        const prevButton = document.getElementById('extSessionsPrevPage');
        const nextButton = document.getElementById('extSessionsNextPage');
        const totalSessions = Array.isArray(this.app.filteredExtSessions) ? this.app.filteredExtSessions.length : 0;
        const totalPages = totalSessions > 0 ? Math.ceil(totalSessions / this.app.extSessionsPerPage) : 1;

        const atFirstPage = this.app.currentExtSessionsPage <= 1 || totalSessions === 0;
        const atLastPage = this.app.currentExtSessionsPage >= totalPages || totalSessions === 0;

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

    goToExtSessionsPrevPage() {
        if (this.app.currentExtSessionsPage > 1) {
            this.app.currentExtSessionsPage--;
            this.renderExtSessionsPage();
        }
    }

    goToExtSessionsNextPage() {
        const totalSessions = Array.isArray(this.app.filteredExtSessions) ? this.app.filteredExtSessions.length : 0;
        const totalPages = Math.ceil(totalSessions / this.app.extSessionsPerPage);

        if (this.app.currentExtSessionsPage < totalPages) {
            this.app.currentExtSessionsPage++;
            this.renderExtSessionsPage();
        }
    }

    renderExtSessionsError() {
        const tbody = document.getElementById('extSessionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
                    Error cargando sesiones externas
                </td>
            </tr>
        `;

        this.app.allExtSessions = [];
        this.app.filteredExtSessions = [];
        this.app.currentExtSessionsPage = 1;
        this.updateExtSessionsCount();
        this.updateExtSessionsPaginationInfo(0, 0, 0);
        this.updateExtSessionsPaginationButtons();
    }

    filterExtSessions() {
        try {
            console.log('🔍 Iniciando filtro de sesiones externas');
            const filterCheckbox = document.getElementById('filterActiveExtSessions');
            if (filterCheckbox) {
                this.filterActiveExtSessions = filterCheckbox.checked;
                console.log('🔍 Estado del filtro actualizado:', this.filterActiveExtSessions);
            }
            this.applyExtSessionsFilters({ resetPage: true });
            this.updateExtSessionsCount();
        } catch (error) {
            console.error('❌ Error filtrando sesiones externas:', error);
        }
    }

    updateExtSessionsCount() {
        const countElement = document.getElementById('extSessionsCount');
        if (!countElement) return;

        const totalSessions = this.allExtSessions ? this.allExtSessions.length : 0;
        const activeSessions = this.allExtSessions ? 
            this.allExtSessions.filter(session => session.status === 'ACTIVE').length : 0;

        if (this.filterActiveExtSessions) {
            countElement.textContent = `${activeSessions}/${totalSessions}`;
        } else {
            countElement.textContent = totalSessions.toString();
        }
    }

    getExtSessionStatusBadgeClass(status) {
        const statusClasses = {
            'ACTIVE': 'bg-success',
            'COMPLETED': 'bg-primary',
            'PENDING': 'bg-warning',
            'INVALID': 'bg-danger',
            'UNKNOWN': 'bg-secondary'
        };
        return statusClasses[status] || 'bg-secondary';
    }

    formatNumber(value, decimals = 2) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
            return null;
        }
        return numericValue.toFixed(decimals);
    }

    formatDuration(seconds) {
        if (seconds === null || seconds === undefined) {
            return 'N/A';
        }
        const numericValue = Number(seconds);
        if (!Number.isFinite(numericValue)) {
            return 'N/A';
        }
        const totalSeconds = Math.max(0, Math.floor(numericValue));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;
        const parts = [];
        if (hours > 0) {
            parts.push(`${hours}h`);
        }
        if (minutes > 0 || hours > 0) {
            parts.push(`${minutes}m`);
        }
        parts.push(`${remainingSeconds}s`);
        return parts.join(' ');
    }

    async fetchCdrForSession(sessionId) {
        try {
            if (!sessionId) {
                return null;
            }

            const params = new URLSearchParams({
                session_id: sessionId,
                limit: '1'
            });

            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/cdrs?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.warn('⚠️ No se pudo obtener CDR para la sesión:', sessionId, 'Status:', response.status);
                return null;
            }

            const data = await response.json();
            if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
                return data.data[0];
            }

            return null;
        } catch (error) {
            console.error('❌ Error obteniendo CDR para sesión externa:', sessionId, error);
            return null;
        }
    }

    buildCdrDetailsHtml(cdr) {
        if (!cdr) {
            return '<p class="text-muted mb-0">No hay CDR asociado a esta sesión.</p>';
        }

        const totalEnergy = this.formatNumber(cdr.total_energy, 2);
        const totalCost = this.formatNumber(cdr.total_cost, 2);
        const totalTime = this.formatDuration(cdr.total_time);
        const parkingTime = this.formatDuration(cdr.total_parking_time);
        const currency = cdr.currency ? this.escapeHtml(String(cdr.currency)) : 'N/A';
        const evseUid = cdr.evse_uid ? this.escapeHtml(String(cdr.evse_uid)) : 'N/A';
        const connectorId = cdr.connector_id ? this.escapeHtml(String(cdr.connector_id)) : 'N/A';
        const tokenId = cdr.id_token ? this.escapeHtml(String(cdr.id_token)) : 'N/A';
        const cdrId = cdr.id ? this.escapeHtml(String(cdr.id)) : 'N/A';
        const startDate = cdr.start_datetime ? new Date(cdr.start_datetime).toLocaleString('es-ES') : 'N/A';
        const endDate = cdr.end_datetime ? new Date(cdr.end_datetime).toLocaleString('es-ES') : 'N/A';
        const lastUpdated = cdr.last_updated ? new Date(cdr.last_updated).toLocaleString('es-ES') : 'N/A';

        return `
            <div class="card card-body bg-light border-0">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>CDR ID:</strong> <code>${cdrId}</code></p>
                        <p><strong>Inicio:</strong> ${startDate}</p>
                        <p><strong>Fin:</strong> ${endDate}</p>
                        <p><strong>Última actualización:</strong> ${lastUpdated}</p>
                        <p><strong>EVSE UID:</strong> ${evseUid}</p>
                        <p><strong>Connector ID:</strong> ${connectorId}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Token ID:</strong> ${tokenId}</p>
                        <p><strong>Energía total:</strong> ${totalEnergy !== null ? `${totalEnergy} kWh` : 'N/A'}</p>
                        <p><strong>Coste total:</strong> ${totalCost !== null ? `€${totalCost}` : 'N/A'} (${currency})</p>
                        <p><strong>Tiempo total:</strong> ${totalTime}</p>
                        <p><strong>Tiempo de aparcamiento:</strong> ${parkingTime}</p>
                    </div>
                </div>
                <div class="mt-3">
                    <h6 class="fw-semibold">JSON CDR</h6>
                    <pre class="bg-white border rounded small p-3 mb-0">${this.escapeHtml(JSON.stringify(cdr, null, 2))}</pre>
                </div>
            </div>
        `;
    }

    async viewExtSessionDetails(sessionId) {
        const session = this.allExtSessions.find(s => s.session_id === sessionId);
        if (!session) {
            this.showNotification('Sesión no encontrada', 'error');
            return;
        }

        if (this.app.emspModule && this.app.emspModule.ensureEmspEvsesLoaded) {
          await this.app.emspModule.ensureEmspEvsesLoaded()
        }
        if (this.app.emspModule && this.app.emspModule.ensureEmspTariffsLoaded) {
          await this.app.emspModule.ensureEmspTariffsLoaded()
        }

        const evse = Array.isArray(this.app.allEmspEvses)
            ? this.app.allEmspEvses.find(evseItem => {
                const rawUid = evseItem?.id || evseItem?.evse_uid || evseItem?.uid;
                if (!rawUid) return false;
                const normalized = rawUid.toString().trim();
                return normalized === session.evse_uid || normalized.toUpperCase() === (session.evse_uid || '').toUpperCase();
            })
            : null;

        const associatedTariffIds = new Set();
        if (evse) {
          if (this.app.emspModule && this.app.emspModule.normalizeTariffIds) {
            this.app.emspModule.normalizeTariffIds(evse.tariff_ids).forEach(id => associatedTariffIds.add(id.toString().trim().toUpperCase()))
            this.app.emspModule.normalizeTariffIds(evse.tariff_id).forEach(id => associatedTariffIds.add(id.toString().trim().toUpperCase()))
          }

          const connectors = this.app.emspModule && this.app.emspModule.parseEmspConnectors
            ? this.app.emspModule.parseEmspConnectors(evse.connectors)
            : []
          connectors.forEach(connector => {
            if (this.app.emspModule && this.app.emspModule.extractTariffIdsFromConnector) {
              this.app.emspModule.extractTariffIdsFromConnector(connector).forEach(id => associatedTariffIds.add(id.toString().trim().toUpperCase()))
            }
          })
        }

        const tariffEntries = Array.from(associatedTariffIds)
            .map(id => id && id.toString().trim())
            .filter(Boolean)
            .map(id => {
              const tariff = (this.app.emspModule && this.app.emspModule.findEmspTariff
                ? this.app.emspModule.findEmspTariff(session.emsp_country_code, session.emsp_party_id, id)
                : null) || (this.app.emspModule && this.app.emspModule.findEmspTariff
                ? this.app.emspModule.findEmspTariff(null, null, id)
                : null)
              return { id, tariff }
            })

        const cdrData = await this.fetchCdrForSession(session.session_id);
        const cdrHtml = this.buildCdrDetailsHtml(cdrData);

        const tariffsHtml = tariffEntries.length > 0
            ? `
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Tariff ID</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Moneda</th>
                                <th>Vigencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tariffEntries.map(({ id, tariff }) => {
                                if (!tariff) {
                                    return `
                                        <tr>
                                            <td><code>${this.escapeHtml(id)}</code></td>
                                            <td colspan="3"><span class="text-warning">Tarifa no encontrada en el catálogo actual</span></td>
                                            <td>-</td>
                                        </tr>
                                    `;
                                }

                                const name = tariff.name ? this.escapeHtml(tariff.name) : '<span class="text-muted">Sin nombre</span>';
                                const type = tariff.type ? this.escapeHtml(tariff.type) : 'N/A';
                                const currency = tariff.currency ? this.escapeHtml(tariff.currency) : 'N/A';
                                const validity = [
                                    tariff.start_date_time ? new Date(tariff.start_date_time).toLocaleString('es-ES') : null,
                                    tariff.end_date_time ? new Date(tariff.end_date_time).toLocaleString('es-ES') : null
                                ];
                                const validityText = validity[0] || validity[1]
                                    ? `${validity[0] || '—'} / ${validity[1] || '—'}`
                                    : 'No definido';

                                return `
                                    <tr>
                                        <td><code>${this.escapeHtml(id)}</code></td>
                                        <td>${name}</td>
                                        <td>${type}</td>
                                        <td>${currency}</td>
                                        <td>${validityText}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `
            : '<p class="text-muted mb-0">No hay tarifas asociadas registradas para el EVSE de esta sesión.</p>';

        const details = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Información de la Sesión</h6>
                    <p><strong>ID:</strong> ${session.session_id}</p>
                    <p><strong>Estado:</strong> <span class="badge ${this.getExtSessionStatusBadgeClass(session.status)}">${session.status}</span></p>
                    <p><strong>Inicio:</strong> ${session.start_datetime ? new Date(session.start_datetime).toLocaleString('es-ES') : 'N/A'}</p>
                    <p><strong>Fin:</strong> ${session.end_datetime ? new Date(session.end_datetime).toLocaleString('es-ES') : 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Información Técnica</h6>
                    <p><strong>Organización:</strong> ${session.emsp_party_id} (${session.emsp_country_code})</p>
                    <p><strong>EVSE ID:</strong> ${(this.app.emspModule && this.app.emspModule.getEmspEvseId ? this.app.emspModule.getEmspEvseId(session.evse_uid) : null) || 'N/A'}</p>
                    <p><strong>EVSE UID:</strong> ${session.evse_uid || 'N/A'}</p>
                    <p><strong>Token ID:</strong> ${session.id_token || 'N/A'}</p>
                    <p><strong>Método Auth:</strong> ${session.auth_method || 'N/A'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <h6>Consumo y Costo</h6>
                    <p><strong>Energía:</strong> ${session.kwh ? parseFloat(session.kwh).toFixed(3) : '0.000'} kWh</p>
                    <p><strong>Costo Total:</strong> ${session.total_cost ? `€${parseFloat(session.total_cost).toFixed(2)}` : 'N/A'}</p>
                    <p><strong>Moneda:</strong> ${session.currency || 'EUR'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Ubicación</h6>
                    <p><strong>Location ID:</strong> ${session.location_id || 'N/A'}</p>
                    <p><strong>Connector ID:</strong> ${session.connector_id || 'N/A'}</p>
                    <p><strong>Última Actualización:</strong> ${session.last_updated ? new Date(session.last_updated).toLocaleString('es-ES') : 'N/A'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6>Tarifas Asociadas</h6>
                    ${tariffsHtml}
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6>CDR Asociado</h6>
                    ${cdrHtml}
                </div>
            </div>
            <div class="mt-4">
                <h6>JSON Completo</h6>
                <pre class="bg-light p-3 rounded small">${this.escapeHtml(JSON.stringify(session, null, 2))}</pre>
            </div>
        `;

        // Crear modal dinámicamente
        const modalHtml = `
            <div class="modal fade" id="extSessionDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-cloud-download"></i> Detalles de Sesión Externa
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${details}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si existe
        const existingModal = document.getElementById('extSessionDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar nuevo modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('extSessionDetailsModal'));
        modal.show();
    }

    // Obtener información del CPO para una sesión específica
    async getCpoInfoForSession(session) {
        try {
            console.log('🔍 Obteniendo información del CPO para sesión:', session.session_id);
            
            // Para sesiones externas, necesitamos encontrar el CPO externo que tiene estas sesiones
            // Las sesiones tienen emsp_party_id que es nuestro CPO (EFI), pero necesitamos el CPO externo
            const targetPartyId = session.emsp_party_id;
            const targetCountryCode = session.emsp_country_code;
            
            console.log('🎯 Buscando CPO externo para sesión de party_id:', targetPartyId, 'country_code:', targetCountryCode);
            console.log('ℹ️ Nota: Las sesiones externas son de nuestro CPO, necesitamos encontrar el CPO externo que las originó');

            // Buscar directamente en la tabla de credenciales
            const credentialsResponse = await fetch(`${this.baseUrl}/api/connections`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (credentialsResponse.ok) {
                const credentialsData = await credentialsResponse.json();
                console.log('🔑 Credenciales obtenidas:', credentialsData);
                
                if (credentialsData.data && Array.isArray(credentialsData.data)) {
                    // Buscar credenciales que NO sean de nuestro CPO (EFI)
                    // Las sesiones externas vienen de CPOs externos, no de nuestro CPO
                    for (const cred of credentialsData.data) {
                        if (cred.party_id !== 'EFI' && cred.party_id !== 'IPD') {
                            console.log('✅ Credenciales de CPO externo encontradas:', cred);
                            return {
                                url: cred.url,
                                token: cred.token,
                                party_id: cred.party_id,
                                country_code: cred.country_code,
                                business_details: cred.business_details
                            };
                        }
                    }
                }
            }

            // Si no se encuentra en credenciales, intentar obtener desde la tabla de sesiones externas
            console.log('⚠️ CPO no encontrado en credenciales, buscando en sesiones externas...');
            
            // Buscar en la tabla de sesiones externas para obtener información del CPO
            const sessionsResponse = await fetch(`${this.baseUrl}/api/ext-sessions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (sessionsResponse.ok) {
                const sessionsData = await sessionsResponse.json();
                console.log('📊 Sesiones externas obtenidas:', sessionsData);
                
                if (sessionsData.data && Array.isArray(sessionsData.data)) {
                    // Buscar una sesión del mismo CPO
                    const matchingSession = sessionsData.data.find(s => 
                        s.emsp_party_id === targetPartyId && s.emsp_country_code === targetCountryCode
                    );
                    
                    if (matchingSession && matchingSession.source_organization) {
                        console.log('✅ Información del CPO encontrada en sesión:', matchingSession.source_organization);
                        return {
                            url: matchingSession.source_organization.url,
                            token: matchingSession.source_organization.token,
                            party_id: matchingSession.source_organization.party_id,
                            country_code: matchingSession.source_organization.country_code,
                            business_details: matchingSession.source_organization.business_details
                        };
                    }
                }
            }

            console.error('❌ No se encontró información del CPO para party_id:', targetPartyId, 'country_code:', targetCountryCode);
            return null;

        } catch (error) {
            console.error('❌ Error obteniendo información del CPO:', error);
            return null;
        }
    }

    // Cerrar sesión externa activa (marcar como completada en BD)
    async closeExtSession(sessionId, evseUid) {
        try {
            console.log('🛑 Cerrando sesión externa:', { sessionId, evseUid });
            
            const forcedMessage = `Esta acción realizará una finalización forzada de la sesión ${sessionId}. `
                + 'No se enviarán notificaciones OCPI al operador externo. ¿Deseas continuar?';
            if (!confirm(forcedMessage)) {
                return;
            }

            // Obtener información de la sesión
            const session = this.allExtSessions.find(s => s.session_id === sessionId);
            if (!session) {
                this.showNotification('Sesión no encontrada', 'error');
                return;
            }

            console.log('🔍 Sesión encontrada:', session);

            // Actualizar sesión en la base de datos
            const updateData = {
                status: 'FORCED',
                end_datetime: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };

            console.log('📝 Actualizando sesión en BD:', updateData);

            const response = await fetch(`${this.baseUrl}/api/ext-sessions/${sessionId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                console.log('✅ Sesión forzada actualizada exitosamente');
                this.showNotification(`Sesión ${sessionId} finalizada de forma forzada (sin notificar a operadores externos)`, 'warning');
                
                // Recargar las sesiones externas para actualizar el estado
                await this.loadExtSessions();
            } else {
                const errorData = await response.json();
                console.error('❌ Error actualizando sesión:', errorData);
                this.showNotification(`Error cerrando sesión: ${errorData.message || 'Error desconocido'}`, 'error');
            }

        } catch (error) {
            console.error('❌ Error cerrando sesión externa:', error);
            this.showNotification(`Error cerrando sesión: ${error.message}`, 'error');
        }
    }
    
    // ========================================
    // CONFIGURACIÓN DE EVENT LISTENERS
    // ========================================

    /**
     * Configura los event listeners para sesiones externas
     */
    setupExtSessionsEventListeners () {
      try {
        console.log('🔧 Configurando event listeners para sesiones externas...')

        // Botón de página anterior
        const prevButton = document.getElementById('extSessionsPrevPage')
        if (prevButton) {
          prevButton.addEventListener('click', () => {
            this.goToExtSessionsPrevPage()
          })
        }

        // Botón de página siguiente
        const nextButton = document.getElementById('extSessionsNextPage')
        if (nextButton) {
          nextButton.addEventListener('click', () => {
            this.goToExtSessionsNextPage()
          })
        }

        // Campo de búsqueda
        const searchInput = document.getElementById('extSessionsSearch')
        if (searchInput) {
          searchInput.addEventListener('input', () => {
            this.app.extSessionsSearchQuery = searchInput.value
            this.applyExtSessionsFilters({ resetPage: true })
          })
        }

        // Checkbox de filtro de sesiones activas
        const filterCheckbox = document.getElementById('filterActiveExtSessions')
        if (filterCheckbox) {
          filterCheckbox.addEventListener('change', () => {
            this.app.filterActiveExtSessions = filterCheckbox.checked
            this.applyExtSessionsFilters({ resetPage: true })
            this.updateExtSessionsCount()
          })
        }

        console.log('✅ Event listeners para sesiones externas configurados')
      } catch (error) {
        console.error('❌ Error configurando event listeners para sesiones externas:', error)
      }
    }

    // ========================================
    // FUNCIONES PARA LA PESTAÑA TEST
    // ========================================
    
    /**
     * Configura los event listeners para la pestaña Test
     */
    setupTestEventListeners() {
        try {
            console.log('🔧 Configurando event listeners para pestaña Test...');
            
            // Botón de actualizar estado
            const refreshTestStatus = document.getElementById('refreshTestStatus');
            if (refreshTestStatus) {
                refreshTestStatus.addEventListener('click', () => {
                    console.log('🔄 Botón refreshTestStatus clickeado');
                    this.loadTestData();
                });
                console.log('✅ Event listener para refreshTestStatus agregado');
            } else {
                console.warn('⚠️ Elemento refreshTestStatus no encontrado');
            }
            
            // Botón de activar/desactivar jobs
            const toggleJobsStatus = document.getElementById('toggleJobsStatus');
            if (toggleJobsStatus) {
                toggleJobsStatus.addEventListener('click', () => {
                    console.log('⏸️ Botón toggleJobsStatus clickeado');
                    this.toggleJobsStatus();
                });
                console.log('✅ Event listener para toggleJobsStatus agregado');
            } else {
                console.warn('⚠️ Elemento toggleJobsStatus no encontrado');
            }
            
            const serviceToggleButtons = [
                { id: 'toggleEvseService', service: 'evseNotificationService', iconId: 'toggleEvseIcon', textId: 'toggleEvseText' },
                { id: 'toggleChargingService', service: 'chargingNotificationService', iconId: 'toggleChargingIcon', textId: 'toggleChargingText' },
                { id: 'toggleEmspLocationsService', service: 'emspLocationsSyncService', iconId: 'toggleEmspLocationsIcon', textId: 'toggleEmspLocationsText' },
                { id: 'toggleEmspTariffsService', service: 'emspTariffsSyncService', iconId: 'toggleEmspTariffsIcon', textId: 'toggleEmspTariffsText' },
                { id: 'toggleEmspTokensService', service: 'emspTokensSyncService', iconId: 'toggleEmspTokensIcon', textId: 'toggleEmspTokensText' },
                { id: 'toggleTestLocationEvseService', service: 'testLocationEVSECreationService', iconId: 'toggleTestLocationEvseIcon', textId: 'toggleTestLocationEvseText' },
                { id: 'toggleTestSessionService', service: 'testSessionService', iconId: 'toggleTestSessionIcon', textId: 'toggleTestSessionText' }
            ];
            
            serviceToggleButtons.forEach(config => this.registerServiceToggleButton(config));
            
            const serviceRunButtons = [
                { id: 'runEvseServiceOnce', service: 'evseNotificationService' },
                { id: 'runChargingServiceOnce', service: 'chargingNotificationService' },
                { id: 'runEmspLocationsServiceOnce', service: 'emspLocationsSyncService' },
                { id: 'runEmspTariffsServiceOnce', service: 'emspTariffsSyncService' },
                { id: 'runEmspTokensServiceOnce', service: 'emspTokensSyncService' },
                { id: 'runTestLocationEvseServiceOnce', service: 'testLocationEVSECreationService' },
                { id: 'runTestSessionServiceOnce', service: 'testSessionService' }
            ];
            
            serviceRunButtons.forEach(({ id, service }) => this.registerTestJobRunButton(id, service));
            
            // Botón de ejecutar pruebas de ejemplo
            const runSampleTests = document.getElementById('runSampleTests');
            if (runSampleTests) {
                runSampleTests.addEventListener('click', () => {
                    console.log('🧪 Botón runSampleTests clickeado');
                    this.runSampleTests();
                });
                console.log('✅ Event listener para runSampleTests agregado');
            } else {
                console.warn('⚠️ Elemento runSampleTests no encontrado');
            }
            
            // Botón de ver historial de pruebas
            const viewTestHistory = document.getElementById('viewTestHistory');
            if (viewTestHistory) {
                viewTestHistory.addEventListener('click', () => {
                    console.log('📋 Botón viewTestHistory clickeado');
                    this.toggleTestHistory();
                });
                console.log('✅ Event listener para viewTestHistory agregado');
            } else {
                console.warn('⚠️ Elemento viewTestHistory no encontrado');
            }
            
            // Botón de limpiar errores
            const clearTestErrors = document.getElementById('clearTestErrors');
            if (clearTestErrors) {
                clearTestErrors.addEventListener('click', () => {
                    console.log('🗑️ Botón clearTestErrors clickeado');
                    this.clearTestErrors();
                });
                console.log('✅ Event listener para clearTestErrors agregado');
            } else {
                console.warn('⚠️ Elemento clearTestErrors no encontrado');
            }
            
            // Botón de toggle del log de errores
            const toggleErrorLog = document.getElementById('toggleErrorLog');
            if (toggleErrorLog) {
                toggleErrorLog.addEventListener('click', () => {
                    console.log('👁️ Botón toggleErrorLog clickeado');
                    this.toggleErrorLog();
                });
                console.log('✅ Event listener para toggleErrorLog agregado');
            } else {
                console.warn('⚠️ Elemento toggleErrorLog no encontrado');
            }
            
            // Botón de limpiar log de errores
            const clearErrorLog = document.getElementById('clearErrorLog');
            if (clearErrorLog) {
                clearErrorLog.addEventListener('click', () => {
                    console.log('🗑️ Botón clearErrorLog clickeado');
                    this.clearErrorLog();
                });
                console.log('✅ Event listener para clearErrorLog agregado');
            } else {
                console.warn('⚠️ Elemento clearErrorLog no encontrado');
            }
            
            // Event listeners para errores de validación
            const refreshValidationErrors = document.getElementById('refreshValidationErrors');
            if (refreshValidationErrors) {
                refreshValidationErrors.addEventListener('click', () => {
                    console.log('🔄 Botón refreshValidationErrors clickeado');
                    this.loadValidationErrors();
                });
                console.log('✅ Event listener para refreshValidationErrors agregado');
            }

            const clearValidationErrors = document.getElementById('clearValidationErrors');
            if (clearValidationErrors) {
                clearValidationErrors.addEventListener('click', () => {
                    console.log('🗑️ Botón clearValidationErrors clickeado');
                    this.clearValidationErrors();
                });
                console.log('✅ Event listener para clearValidationErrors agregado');
            }

            const prevValidationErrors = document.getElementById('prevValidationErrors');
            if (prevValidationErrors) {
                prevValidationErrors.addEventListener('click', () => {
                    if (this.validationErrorsPage > 0) {
                        this.validationErrorsPage--;
                        this.loadValidationErrors();
                    }
                });
            }

            const nextValidationErrors = document.getElementById('nextValidationErrors');
            if (nextValidationErrors) {
                nextValidationErrors.addEventListener('click', () => {
                    this.validationErrorsPage++;
                    this.loadValidationErrors();
                });
            }

            const deleteThisValidationError = document.getElementById('deleteThisValidationError');
            if (deleteThisValidationError) {
                deleteThisValidationError.addEventListener('click', () => {
                    this.deleteValidationError(this.currentValidationErrorId);
                });
            }

            // Event listeners para errores de aplicación
            const refreshApplicationErrors = document.getElementById('refreshApplicationErrors');
            if (refreshApplicationErrors) {
                refreshApplicationErrors.addEventListener('click', () => {
                    console.log('🔄 Botón refreshApplicationErrors clickeado');
                    this.loadApplicationErrors();
                });
                console.log('✅ Event listener para refreshApplicationErrors agregado');
            }

            const toggleApplicationErrorsView = document.getElementById('toggleApplicationErrorsView');
            if (toggleApplicationErrorsView) {
                toggleApplicationErrorsView.addEventListener('click', () => {
                    console.log('👁️ Botón toggleApplicationErrorsView clickeado');
                    this.toggleApplicationErrorsView();
                });
                console.log('✅ Event listener para toggleApplicationErrorsView agregado');
            }

            const clearApplicationErrors = document.getElementById('clearApplicationErrors');
            if (clearApplicationErrors) {
                clearApplicationErrors.addEventListener('click', () => {
                    console.log('🗑️ Botón clearApplicationErrors clickeado');
                    this.clearApplicationErrors();
                });
                console.log('✅ Event listener para clearApplicationErrors agregado');
            }

            const prevApplicationErrors = document.getElementById('prevApplicationErrors');
            if (prevApplicationErrors) {
                prevApplicationErrors.addEventListener('click', () => {
                    if (this.applicationErrorsPage > 0) {
                        this.applicationErrorsPage--;
                        this.loadApplicationErrors();
                    }
                });
            }

            const nextApplicationErrors = document.getElementById('nextApplicationErrors');
            if (nextApplicationErrors) {
                nextApplicationErrors.addEventListener('click', () => {
                    this.applicationErrorsPage++;
                    this.loadApplicationErrors();
                });
            }

            // Configurar actualización automática cada 30 segundos
            this.setupTestAutoRefresh();

            console.log('✅ Event listeners para pestaña Test configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners para pestaña Test:', error);
        }
    }
    
    /**
     * Registra un botón para ejecutar un job manualmente
     */
    registerTestJobRunButton(buttonId, serviceKey) {
        try {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', async () => {
                    console.log(`▶️ Botón ${buttonId} clickeado para servicio ${serviceKey}`);
                    await this.runServiceJob(serviceKey, button);
                });
                console.log(`✅ Event listener para ${buttonId} agregado`);
            } else {
                console.warn(`⚠️ Elemento ${buttonId} no encontrado`);
            }
        } catch (error) {
            console.error(`❌ Error registrando botón ${buttonId}:`, error);
        }
    }
    
    /**
     * Registra un botón para alternar la ejecución continua de un servicio
     */
    registerServiceToggleButton({ id, service }) {
        try {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', async () => {
                    console.log(`🔁 Botón ${id} clickeado para servicio ${service}`);
                    await this.toggleServiceLoop(service, button);
                });
                console.log(`✅ Event listener para ${id} agregado`);
            } else {
                console.warn(`⚠️ Elemento ${id} no encontrado`);
            }
        } catch (error) {
            console.error(`❌ Error registrando botón ${id}:`, error);
        }
    }
    
    /**
     * Devuelve un nombre amigable para mostrar del servicio
     */
    getServiceFriendlyName(serviceKey) {
        const serviceLabels = {
            evseNotificationService: 'EVSE Notification Service',
            chargingNotificationService: 'Charging Notification Service',
            emspLocationsSyncService: 'EMSP Locations Sync Service',
            emspTariffsSyncService: 'EMSP Tariffs Sync Service',
            emspTokensSyncService: 'EMSP Tokens Sync Service',
            testLocationEVSECreationService: 'Test Location EVSE Creation Service',
            testSessionService: 'Test Session Service'
        };
        
        return serviceLabels[serviceKey] || serviceKey;
    }
    
    /**
     * Ejecuta un servicio específico una sola vez desde la interfaz
     */
    async runServiceJob(serviceKey, buttonElement) {
        const friendlyName = this.getServiceFriendlyName(serviceKey);
        let originalHtml = null;
        
        try {
            if (buttonElement) {
                originalHtml = buttonElement.innerHTML;
                buttonElement.disabled = true;
                buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Ejecutando';
            }
            
            const response = await fetch('/api/test-monitoring/run-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify({ service: serviceKey })
            });
            
            const result = await response.json().catch(() => ({}));
            
            if (!response.ok || !result.success) {
                throw new Error(result?.message || `No se pudo ejecutar ${friendlyName}`);
            }
            
            this.showNotification(result.message || `${friendlyName} ejecutado correctamente`, 'success');
            
            // Refrescar datos para reflejar la ejecución
            await this.loadTestData();
            
            console.log(`✅ Ejecución manual completada para ${friendlyName}`);
        } catch (error) {
            console.error(`❌ Error ejecutando job ${serviceKey}:`, error);
            this.showNotification(`Error ejecutando ${friendlyName}: ${error.message}`, 'error');
        } finally {
            if (buttonElement) {
                buttonElement.disabled = false;
                if (originalHtml) {
                    buttonElement.innerHTML = originalHtml;
                }
                buttonElement.blur();
            }
        }
    }
    
    /**
     * Alterna la ejecución continua de un servicio específico
     */
    async toggleServiceLoop(serviceKey, buttonElement) {
        const friendlyName = this.getServiceFriendlyName(serviceKey);
        let originalHtml = null;
        
        try {
            if (buttonElement) {
                originalHtml = buttonElement.innerHTML;
                buttonElement.disabled = true;
                buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Procesando';
            }
            
            const response = await fetch('/api/test-monitoring/toggle-service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify({ service: serviceKey })
            });
            
            const result = await response.json().catch(() => ({}));
            
            if (!response.ok || !result.success) {
                throw new Error(result?.message || `No se pudo alternar ${friendlyName}`);
            }
            
            this.showNotification(result.message || `${friendlyName} actualizado`, 'success');
            
            await this.loadTestData();
            
            console.log(`✅ Estado de ejecución actualizado para ${friendlyName}`);
        } catch (error) {
            console.error(`❌ Error alternando servicio ${serviceKey}:`, error);
            this.showNotification(`Error alternando ${friendlyName}: ${error.message}`, 'error');
        } finally {
            if (buttonElement) {
                buttonElement.disabled = false;
                if (originalHtml) {
                    buttonElement.innerHTML = originalHtml;
                }
                buttonElement.blur();
            }
        }
    }
    
    /**
     * Actualiza el estado visual de los botones de toggle según el servicio
     */
    updateServiceToggleButtonState(serviceKey, isActive) {
        const config = this.testServiceToggleConfigs[serviceKey];
        if (!config) {
            return;
        }
        
        const button = document.getElementById(config.buttonId);
        const icon = config.iconId ? document.getElementById(config.iconId) : null;
        const text = config.textId ? document.getElementById(config.textId) : null;
        
        if (button) {
            button.className = isActive ? config.activeClass : config.inactiveClass;
        }
        
        if (icon) {
            icon.className = isActive ? config.activeIcon : config.inactiveIcon;
        }
        
        if (text) {
            text.textContent = isActive ? config.activeText : config.inactiveText;
        }
    }
    
    /**
     * Configura la actualización automática de la pestaña Test
     */
    setupTestAutoRefresh() {
        try {
            // Limpiar intervalo anterior si existe
            if (this.testRefreshInterval) {
                clearInterval(this.testRefreshInterval);
            }
            
            // Configurar nuevo intervalo de 30 segundos
            this.testRefreshInterval = setInterval(() => {
                // Solo actualizar si la pestaña Test está activa
                const testTab = document.getElementById('test');
                if (testTab && testTab.classList.contains('active')) {
                    console.log('🔄 Actualización automática de pestaña Test...');
                    this.loadTestData();
                }
            }, 30000); // 30 segundos
            
            console.log('✅ Actualización automática de pestaña Test configurada (30s)');
        } catch (error) {
            console.error('❌ Error configurando actualización automática de pestaña Test:', error);
        }
    }
    
    /**
     * Carga los datos para la pestaña Test
     */
    async loadTestData() {
        try {
            console.log('📊 Cargando datos para pestaña Test...');

            // Actualizar estado de los servicios
            await this.updateServiceStatus();

            // Cargar estadísticas de pruebas
            this.loadTestStatistics();

            // Cargar log de errores
            await this.loadErrorLog();

            // Cargar errores de validación
            await this.loadValidationErrors();

            // Cargar errores de aplicación (solo si están visibles)
            if (this.applicationErrorsVisible) {
                await this.loadApplicationErrors();
            }

            console.log('✅ Datos de pestaña Test cargados');
        } catch (error) {
            console.error('❌ Error cargando datos para pestaña Test:', error);
        }
    }
    
    /**
     * Actualiza el estado de los servicios
     */
    async updateServiceStatus() {
        try {
            console.log('📊 Obteniendo estado de servicios desde el backend...');
            
            const response = await fetch('/api/test-monitoring/status', {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                const { services, testStatistics } = result.data;
                
                // Actualizar estado de EVSE Notification Service
                const evseStatus = document.getElementById('evse-service-status');
                const evseLastRun = document.getElementById('evse-last-run');
                const evseErrorCount = document.getElementById('evse-error-count');
                
                if (evseStatus) {
                    evseStatus.textContent = services.evseNotificationService.status === 'active' ? 'Activo' : 'Pausado';
                    evseStatus.className = services.evseNotificationService.status === 'active' ? 'badge bg-success' : 'badge bg-warning';
                }
                
                if (evseLastRun) {
                    evseLastRun.textContent = services.evseNotificationService.lastRun ? 
                        new Date(services.evseNotificationService.lastRun).toLocaleString() : '-';
                }
                
                if (evseErrorCount) {
                    evseErrorCount.textContent = services.evseNotificationService.errorCount;
                }
                
                // Actualizar botón individual del EVSE Service
                this.updateServiceToggleButtonState('evseNotificationService', services.evseNotificationService.status === 'active');
                
                // Actualizar estado de Charging Notification Service
                const chargingStatus = document.getElementById('charging-service-status');
                const chargingLastRun = document.getElementById('charging-last-run');
                const chargingErrorCount = document.getElementById('charging-error-count');
                
                if (chargingStatus) {
                    chargingStatus.textContent = services.chargingNotificationService.status === 'active' ? 'Activo' : 'Inactivo';
                    chargingStatus.className = services.chargingNotificationService.status === 'active' ? 'badge bg-success' : 'badge bg-danger';
                }
                
                if (chargingLastRun) {
                    chargingLastRun.textContent = services.chargingNotificationService.lastRun ? 
                        new Date(services.chargingNotificationService.lastRun).toLocaleString() : '-';
                }
                
                if (chargingErrorCount) {
                    chargingErrorCount.textContent = services.chargingNotificationService.errorCount;
                }
                
                this.updateServiceToggleButtonState('chargingNotificationService', services.chargingNotificationService.status === 'active');
                
                // Actualizar estado de EMSP Locations Sync Service
                const emspLocationsStatus = document.getElementById('emsp-locations-service-status');
                const emspLocationsLastRun = document.getElementById('emsp-locations-last-run');
                const emspLocationsErrorCount = document.getElementById('emsp-locations-error-count');
                
                if (emspLocationsStatus) {
                    emspLocationsStatus.textContent = services.emspLocationsSyncService.status === 'active' ? 'Activo' : 'Inactivo';
                    emspLocationsStatus.className = services.emspLocationsSyncService.status === 'active' ? 'badge bg-success' : 'badge bg-danger';
                }
                
                if (emspLocationsLastRun) {
                    emspLocationsLastRun.textContent = services.emspLocationsSyncService.lastRun ? 
                        new Date(services.emspLocationsSyncService.lastRun).toLocaleString() : '-';
                }
                
                if (emspLocationsErrorCount) {
                    emspLocationsErrorCount.textContent = services.emspLocationsSyncService.errorCount;
                }
                
                this.updateServiceToggleButtonState('emspLocationsSyncService', services.emspLocationsSyncService.status === 'active');
                
                // Actualizar estado de EMSP Tariffs Sync Service
                const emspTariffsStatus = document.getElementById('emsp-tariffs-service-status');
                const emspTariffsLastRun = document.getElementById('emsp-tariffs-last-run');
                const emspTariffsErrorCount = document.getElementById('emsp-tariffs-error-count');
                
                if (emspTariffsStatus) {
                    emspTariffsStatus.textContent = services.emspTariffsSyncService.status === 'active' ? 'Activo' : 'Inactivo';
                    emspTariffsStatus.className = services.emspTariffsSyncService.status === 'active' ? 'badge bg-success' : 'badge bg-danger';
                }
                
                if (emspTariffsLastRun) {
                    emspTariffsLastRun.textContent = services.emspTariffsSyncService.lastRun ? 
                        new Date(services.emspTariffsSyncService.lastRun).toLocaleString() : '-';
                }
                
                if (emspTariffsErrorCount) {
                    emspTariffsErrorCount.textContent = services.emspTariffsSyncService.errorCount;
                }
                
                this.updateServiceToggleButtonState('emspTariffsSyncService', services.emspTariffsSyncService.status === 'active');
                
                // Actualizar estado de EMSP Tokens Sync Service
                const emspTokensStatus = document.getElementById('emsp-tokens-service-status');
                const emspTokensLastRun = document.getElementById('emsp-tokens-last-run');
                const emspTokensErrorCount = document.getElementById('emsp-tokens-error-count');
                
                if (emspTokensStatus) {
                    emspTokensStatus.textContent = services.emspTokensSyncService.status === 'active' ? 'Activo' : 'Inactivo';
                    emspTokensStatus.className = services.emspTokensSyncService.status === 'active' ? 'badge bg-success' : 'badge bg-danger';
                }
                
                if (emspTokensLastRun) {
                    emspTokensLastRun.textContent = services.emspTokensSyncService.lastRun ? 
                        new Date(services.emspTokensSyncService.lastRun).toLocaleString() : '-';
                }
                
                if (emspTokensErrorCount) {
                    emspTokensErrorCount.textContent = services.emspTokensSyncService.errorCount;
                }
                
                this.updateServiceToggleButtonState('emspTokensSyncService', services.emspTokensSyncService.status === 'active');
                
                // Actualizar estado de Test Location EVSE Creation Service
                const testLocationEvseStatus = document.getElementById('test-location-evse-service-status');
                const testLocationEvseLastRun = document.getElementById('test-location-evse-last-run');
                const testLocationEvseErrorCount = document.getElementById('test-location-evse-error-count');
                
                if (testLocationEvseStatus) {
                    testLocationEvseStatus.textContent = services.testLocationEVSECreationService.status === 'active' ? 'Activo' : 'Inactivo';
                    testLocationEvseStatus.className = services.testLocationEVSECreationService.status === 'active' ? 'badge bg-info' : 'badge bg-danger';
                }
                
                if (testLocationEvseLastRun) {
                    testLocationEvseLastRun.textContent = services.testLocationEVSECreationService.lastRun ? 
                        new Date(services.testLocationEVSECreationService.lastRun).toLocaleString() : '-';
                }
                
                if (testLocationEvseErrorCount) {
                    testLocationEvseErrorCount.textContent = services.testLocationEVSECreationService.errorCount;
                }
                
                this.updateServiceToggleButtonState('testLocationEVSECreationService', services.testLocationEVSECreationService.status === 'active');
                
                // Actualizar estado de Test Session Service
                const testSessionStatus = document.getElementById('test-session-service-status');
                const testSessionLastRun = document.getElementById('test-session-last-run');
                const testSessionErrorCount = document.getElementById('test-session-error-count');
                
                if (testSessionStatus) {
                    testSessionStatus.textContent = services.testSessionService.status === 'active' ? 'Activo' : 'Inactivo';
                    testSessionStatus.className = services.testSessionService.status === 'active' ? 'badge bg-warning' : 'badge bg-danger';
                }
                
                if (testSessionLastRun) {
                    testSessionLastRun.textContent = services.testSessionService.lastRun ? 
                        new Date(services.testSessionService.lastRun).toLocaleString() : '-';
                }
                
                if (testSessionErrorCount) {
                    testSessionErrorCount.textContent = services.testSessionService.errorCount;
                }
                
                this.updateServiceToggleButtonState('testSessionService', services.testSessionService.status === 'active');
                
                // Actualizar estadísticas de pruebas
                this.updateTestStatistics(testStatistics);
                
                console.log('✅ Estado de servicios actualizado desde el backend');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo estado de servicios:', error);
            
            // Fallback a valores por defecto
            const evseStatus = document.getElementById('evse-service-status');
            const chargingStatus = document.getElementById('charging-service-status');
            
            if (evseStatus) {
                evseStatus.textContent = 'Error';
                evseStatus.className = 'badge bg-warning';
            }
            
            if (chargingStatus) {
                chargingStatus.textContent = 'Error';
                chargingStatus.className = 'badge bg-warning';
            }
        }
    }
    
    /**
     * Carga las estadísticas de pruebas
     */
    loadTestStatistics() {
        try {
            // Esta función ahora se llama desde updateServiceStatus
            // que obtiene las estadísticas del backend
            console.log('📊 Estadísticas de pruebas se cargan desde updateServiceStatus');
        } catch (error) {
            console.error('❌ Error cargando estadísticas de pruebas:', error);
        }
    }
    
    /**
     * Actualiza las estadísticas de pruebas en la UI
     */
    updateTestStatistics(testStatistics) {
        try {
            const totalTests = document.getElementById('total-tests');
            const passedTests = document.getElementById('passed-tests');
            const failedTests = document.getElementById('failed-tests');
            const runningTests = document.getElementById('running-tests');
            
            if (totalTests) totalTests.textContent = testStatistics.totalTests || 0;
            if (passedTests) passedTests.textContent = testStatistics.passedTests || 0;
            if (failedTests) failedTests.textContent = testStatistics.failedTests || 0;
            if (runningTests) runningTests.textContent = testStatistics.runningTests || 0;
            
        } catch (error) {
            console.error('❌ Error actualizando estadísticas de pruebas:', error);
        }
    }
    
    /**
     * Carga el log de errores
     */
    async loadErrorLog() {
        try {
            console.log('📋 Obteniendo errores desde el backend...');
            
            const response = await fetch('/api/test-monitoring/errors', {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                const errorLog = document.getElementById('errorLog');
                if (errorLog) {
                    if (result.data.errors.length === 0) {
                        errorLog.innerHTML = '<div class="text-muted">No hay errores registrados</div>';
                    } else {
                        errorLog.innerHTML = '';
                        result.data.errors.forEach(error => {
                            const errorEntry = document.createElement('div');
                            errorEntry.className = 'mb-2 p-2 border-start border-danger border-3';
                            errorEntry.innerHTML = `
                                <div class="text-danger fw-bold">[${new Date(error.timestamp).toLocaleString()}] ${error.service}</div>
                                <div class="text-light">${error.message}</div>
                            `;
                            errorLog.appendChild(errorEntry);
                        });
                    }
                }
                
                console.log(`✅ ${result.data.errors.length} errores cargados desde el backend`);
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo log de errores:', error);
            
            // Fallback a mensaje de error
            const errorLog = document.getElementById('errorLog');
            if (errorLog) {
                errorLog.innerHTML = '<div class="text-warning">Error cargando errores del servidor</div>';
            }
        }
    }
    
    /**
     * Limpia los errores de la pestaña Test
     */
    async clearTestErrors() {
        try {
            console.log('🧹 Limpiando errores de la pestaña Test...');

            const response = await fetch('/api/test-monitoring/errors', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Limpiar contadores de errores en la UI
                const evseErrorCount = document.getElementById('evse-error-count');
                const chargingErrorCount = document.getElementById('charging-error-count');

                if (evseErrorCount) {
                    evseErrorCount.textContent = '0';
                }

                if (chargingErrorCount) {
                    chargingErrorCount.textContent = '0';
                }

                // Limpiar log de errores
                this.clearErrorLog();

                // Ocultar badge de error
                this.hideErrorBadge();

                this.showNotification('Errores limpiados exitosamente', 'success');

                console.log('✅ Errores limpiados desde el backend');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('❌ Error limpiando errores de la pestaña Test:', error);
            this.showNotification('Error limpiando errores: ' + error.message, 'error');
        }
    }

    /**
     * Carga los errores de validación desde la API
     */
    async loadValidationErrors() {
        try {
            const limit = 20;
            const offset = (this.validationErrorsPage || 0) * limit;

            const response = await fetch(`${this.baseUrl}/api/validation-errors?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Update total count
            const totalElement = document.getElementById('validationErrorsTotal');
            if (totalElement) {
                totalElement.textContent = data.pagination?.total || 0;
            }

            // Update navbar badge count
            this.updateValidationErrorsBadge(data.pagination?.total || 0);

            // Update pagination buttons
            const prevBtn = document.getElementById('prevValidationErrors');
            const nextBtn = document.getElementById('nextValidationErrors');

            if (prevBtn) {
                prevBtn.disabled = offset === 0;
            }

            if (nextBtn) {
                nextBtn.disabled = offset + limit >= (data.pagination?.total || 0);
            }

            // Update table
            const tableBody = document.getElementById('validationErrorsTable');
            if (!tableBody) return;

            if (!data.data || data.data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted">
                            <i class="bi bi-check-circle text-success"></i> No hay errores de validación registrados
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = data.data.map(error => {
                const timestamp = new Date(error.timestamp).toLocaleString('es-ES');
                const errorCount = Array.isArray(error.validation_errors) ? error.validation_errors.length : 0;
                const errorSummary = Array.isArray(error.validation_errors)
                    ? error.validation_errors.map(e => e.field).slice(0, 2).join(', ') + (errorCount > 2 ? '...' : '')
                    : 'N/A';

                return `
                    <tr>
                        <td><small class="font-monospace">${error.id}</small></td>
                        <td><small class="font-monospace">${error.endpoint || 'N/A'}</small></td>
                        <td><span class="badge bg-${this.getMethodBadgeColor(error.method)}">${error.method || 'N/A'}</span></td>
                        <td>
                            <small class="text-danger">
                                <i class="bi bi-exclamation-circle"></i> ${errorCount} error${errorCount !== 1 ? 'es' : ''}
                                ${errorCount > 0 ? `<br><span class="text-muted">${errorSummary}</span>` : ''}
                            </small>
                        </td>
                        <td><small>${timestamp}</small></td>
                        <td>
                            <button class="btn btn-outline-info btn-sm" onclick="window.dashboardApp.viewValidationErrorDetail(${error.id})" title="Ver detalles">
                                <i class="bi bi-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            console.error('❌ Error cargando errores de validación:', error);
            const tableBody = document.getElementById('validationErrorsTable');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-danger">
                            <i class="bi bi-exclamation-triangle"></i> Error cargando datos: ${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    }

    /**
     * Muestra los detalles de un error de validación en un modal
     */
    async viewValidationErrorDetail(errorId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/validation-errors/${errorId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const error = result.data;

            // Store current error ID for deletion
            this.currentValidationErrorId = errorId;

            // Populate modal
            document.getElementById('errorDetailEndpoint').textContent = error.endpoint || 'N/A';
            document.getElementById('errorDetailMethod').textContent = error.method || 'N/A';
            document.getElementById('errorDetailIp').textContent = error.ip_address || 'N/A';
            document.getElementById('errorDetailUserAgent').textContent = error.user_agent || 'N/A';
            document.getElementById('errorDetailTimestamp').textContent = new Date(error.timestamp).toLocaleString('es-ES');

            // Validation errors table
            const errorsTable = document.getElementById('errorDetailValidationErrors');
            if (error.validation_errors && error.validation_errors.length > 0) {
                errorsTable.innerHTML = error.validation_errors.map(err => `
                    <tr>
                        <td><code>${err.field || 'N/A'}</code></td>
                        <td>${err.message || 'N/A'}</td>
                        <td><small class="text-muted">${err.type || 'N/A'}</small></td>
                    </tr>
                `).join('');
            } else {
                errorsTable.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay errores</td></tr>';
            }

            // Request body
            const requestBody = document.getElementById('errorDetailRequestBody');
            try {
                const parsedBody = JSON.parse(error.request_body);
                requestBody.textContent = JSON.stringify(parsedBody, null, 2);
            } catch {
                requestBody.textContent = error.request_body || 'N/A';
            }

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('validationErrorDetailModal'));
            modal.show();

        } catch (error) {
            console.error('❌ Error cargando detalles del error:', error);
            this.showNotification('Error cargando detalles: ' + error.message, 'error');
        }
    }

    /**
     * Elimina un error de validación específico
     */
    async deleteValidationError(errorId) {
        try {
            if (!confirm('¿Estás seguro de que quieres eliminar este error de validación?')) {
                return;
            }

            const response = await fetch(`${this.baseUrl}/api/validation-errors/${errorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showNotification('Error eliminado exitosamente', 'success');

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('validationErrorDetailModal'));
            if (modal) {
                modal.hide();
            }

            // Reload errors list
            await this.loadValidationErrors();

        } catch (error) {
            console.error('❌ Error eliminando error de validación:', error);
            this.showNotification('Error eliminando: ' + error.message, 'error');
        }
    }

    /**
     * Limpia todos los errores de validación
     */
    async clearValidationErrors() {
        try {
            if (!confirm('¿Estás seguro de que quieres borrar TODOS los errores de validación?')) {
                return;
            }

            const response = await fetch(`${this.baseUrl}/api/validation-errors`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showNotification('Todos los errores han sido eliminados', 'success');
            this.validationErrorsPage = 0;
            await this.loadValidationErrors();

        } catch (error) {
            console.error('❌ Error limpiando errores de validación:', error);
            this.showNotification('Error limpiando errores: ' + error.message, 'error');
        }
    }

    /**
     * Carga los errores de aplicación desde la API
     */
    async loadApplicationErrors() {
        try {
            const limit = 20;
            const offset = (this.applicationErrorsPage || 0) * limit;

            const response = await fetch(`${this.baseUrl}/api/application-errors?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Update total count
            const totalElement = document.getElementById('applicationErrorsTotal');
            if (totalElement) {
                totalElement.textContent = data.total || 0;
            }

            // Update pagination buttons
            const prevBtn = document.getElementById('prevApplicationErrors');
            const nextBtn = document.getElementById('nextApplicationErrors');

            if (prevBtn) {
                prevBtn.disabled = offset === 0;
            }

            if (nextBtn) {
                nextBtn.disabled = offset + limit >= (data.total || 0);
            }

            // Update table
            const tableBody = document.getElementById('applicationErrorsTableBody');
            if (!tableBody) return;

            if (!data.data || data.data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-muted">
                            <i class="bi bi-check-circle text-success"></i> No hay errores de aplicación registrados
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = data.data.map(error => {
                const timestamp = new Date(error.timestamp).toLocaleString('es-ES');
                const statusBadge = error.status_code 
                    ? `<span class="badge bg-${error.status_code >= 500 ? 'danger' : error.status_code >= 400 ? 'warning' : 'secondary'}">${error.status_code}</span>`
                    : '<span class="badge bg-secondary">N/A</span>';
                const directionBadge = error.direction === 'INBOUND' 
                    ? '<span class="badge bg-info">Entrada</span>'
                    : '<span class="badge bg-primary">Salida</span>';

                return `
                    <tr>
                        <td><small class="font-monospace">${error.id}</small></td>
                        <td><small>${error.error_type || 'N/A'}</small></td>
                        <td>${directionBadge}</td>
                        <td><small class="font-monospace text-truncate d-inline-block" style="max-width: 300px;" title="${error.endpoint || 'N/A'}">${error.endpoint || 'N/A'}</small></td>
                        <td><span class="badge bg-${this.getMethodBadgeColor(error.method)}">${error.method || 'N/A'}</span></td>
                        <td>${statusBadge}</td>
                        <td><small class="text-danger">${this.truncateText(error.error_message || 'N/A', 50)}</small></td>
                        <td><small>${timestamp}</small></td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            console.error('❌ Error cargando errores de aplicación:', error);
            const tableBody = document.getElementById('applicationErrorsTableBody');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            <i class="bi bi-exclamation-triangle"></i> Error cargando datos: ${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    }

    /**
     * Alterna la visibilidad de la sección de errores de aplicación
     */
    toggleApplicationErrorsView() {
        try {
            const container = document.getElementById('applicationErrorsContainer');
            const button = document.getElementById('toggleApplicationErrorsView');
            const buttonText = document.getElementById('toggleApplicationErrorsViewText');
            const icon = button?.querySelector('i');

            if (!container || !button) return;

            this.applicationErrorsVisible = !this.applicationErrorsVisible;

            if (this.applicationErrorsVisible) {
                container.style.display = 'block';
                if (buttonText) buttonText.textContent = 'Ocultar';
                if (icon) {
                    icon.className = 'bi bi-eye-slash';
                }
                // Cargar errores si es la primera vez que se muestra
                this.loadApplicationErrors();
            } else {
                container.style.display = 'none';
                if (buttonText) buttonText.textContent = 'Mostrar';
                if (icon) {
                    icon.className = 'bi bi-eye';
                }
            }
        } catch (error) {
            console.error('❌ Error alternando vista de errores de aplicación:', error);
        }
    }

    /**
     * Limpia todos los errores de aplicación
     */
    async clearApplicationErrors() {
        try {
            if (!confirm('¿Estás seguro de que quieres borrar TODOS los errores de aplicación?')) {
                return;
            }

            const response = await fetch(`${this.baseUrl}/api/application-errors`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showNotification('Todos los errores de aplicación han sido eliminados', 'success');
            this.applicationErrorsPage = 0;
            await this.loadApplicationErrors();

        } catch (error) {
            console.error('❌ Error limpiando errores de aplicación:', error);
            this.showNotification('Error limpiando errores: ' + error.message, 'error');
        }
    }

    /**
     * Obtiene el color del badge según el método HTTP
     */
    getMethodBadgeColor(method) {
        const colors = {
            'GET': 'primary',
            'POST': 'success',
            'PUT': 'warning',
            'PATCH': 'info',
            'DELETE': 'danger'
        };
        return colors[method] || 'secondary';
    }

    /**
     * Trunca un texto a una longitud máxima
     */
    truncateText(text, maxLength) {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Actualiza el contador de errores de validación en el navbar
     */
    updateValidationErrorsBadge(count) {
        const badge = document.getElementById('validation-errors-count');
        const badgeContainer = document.getElementById('validation-errors-count-badge');

        if (badge && badgeContainer) {
            const previousCount = parseInt(badge.textContent) || 0;
            badge.textContent = count || 0;

            // Si hay errores, mostrar el badge, sino ocultarlo
            if (count > 0) {
                badgeContainer.style.display = 'inline';

                // Agregar animación si el contador aumentó
                if (count > previousCount) {
                    badge.classList.add('badge-pulse');
                    setTimeout(() => {
                        badge.classList.remove('badge-pulse');
                    }, 1000);
                }
            } else {
                // Ocultar si no hay errores
                badgeContainer.style.display = 'none';
            }
        }
    }

    /**
     * Actualiza periódicamente el contador de errores de validación
     */
    async updateValidationErrorsCount() {
        try {
            const response = await fetch(`${this.baseUrl}/api/validation-errors?limit=1&offset=0`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateValidationErrorsBadge(data.pagination?.total || 0);
            }
        } catch (error) {
            console.error('❌ Error actualizando contador de errores de validación:', error);
        }
    }

    /**
     * Inicia la actualización automática del contador de errores de validación
     */
    startValidationErrorsPolling() {
        // Actualizar inmediatamente
        this.updateValidationErrorsCount();

        // Actualizar cada 30 segundos
        if (this.validationErrorsPollingInterval) {
            clearInterval(this.validationErrorsPollingInterval);
        }
        this.validationErrorsPollingInterval = setInterval(() => {
            this.updateValidationErrorsCount();
        }, 30000); // 30 segundos
    }

    /**
     * Actualiza el banner de sesión activa en el navbar
     */
    async updateActiveSessionBanner() {
        try {
            const banner = document.getElementById('active-session-banner');
            const message = document.getElementById('active-session-message');

            if (!banner || !message) {
                console.log('⚠️ Banner o mensaje no encontrado');
                return;
            }

            // Verificar sesiones activas del CPO (nuestras sesiones)
            const cpoActiveSessions = this.allSessions.filter(s => s.status === 'ACTIVE');

            // Verificar sesiones externas activas (eMSP sobre nosotros)
            let emspActiveSessions = [];
            try {
                const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/sessions?status=ACTIVE`, {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    emspActiveSessions = (data.data || []).filter(s => s.status === 'ACTIVE');
                    console.log('📊 Sesiones eMSP activas encontradas:', emspActiveSessions.length);
                } else {
                    console.warn('⚠️ Error obteniendo sesiones eMSP:', response.status);
                }
            } catch (error) {
                console.error('Error obteniendo sesiones eMSP:', error);
            }

            // Construir mensaje
            const messages = [];

            if (cpoActiveSessions.length > 0) {
                cpoActiveSessions.forEach(session => {
                    messages.push(`⚡ CPO → EVSE ${session.evse_uid || 'N/A'} (Sesión iniciada por CPO: ${session.id.substring(0, 8)}...)`);
                });
            }

            if (emspActiveSessions.length > 0) {
                emspActiveSessions.forEach(session => {
                    messages.push(`⚡ eMSP → EVSE ${session.evse_uid || 'N/A'} (Sesión iniciada por eMSP ${session.emsp_party_id || 'N/A'}: ${session.id.substring(0, 8)}...)`);
                });
            }

            console.log(`📢 Total sesiones activas: CPO=${cpoActiveSessions.length}, eMSP=${emspActiveSessions.length}`);

            if (messages.length > 0) {
                message.textContent = messages.join('  •  ');
                banner.style.display = 'block';
                console.log('✅ Banner mostrado:', messages.join('  •  '));
            } else {
                banner.style.display = 'none';
                console.log('ℹ️ Banner oculto - no hay sesiones activas');
            }

        } catch (error) {
            console.error('❌ Error actualizando banner de sesión activa:', error);
        }
    }

    /**
     * Inicia la actualización automática del banner de sesiones activas
     */
    startActiveSessionBannerPolling() {
        // Actualizar inmediatamente
        this.updateActiveSessionBanner();

        // Actualizar cada 10 segundos
        if (this.activeSessionBannerPollingInterval) {
            clearInterval(this.activeSessionBannerPollingInterval);
        }
        this.activeSessionBannerPollingInterval = setInterval(() => {
            this.updateActiveSessionBanner();
        }, 10000); // 10 segundos
    }

    /**
     * Activa o desactiva todos los jobs
     */
    async toggleJobsStatus() {
        try {
            console.log('⏸️ Cambiando estado de los jobs...');
            
            const response = await fetch('/api/test-monitoring/toggle-jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Actualizar el botón según el nuevo estado
                this.updateJobsToggleButton(result.data.jobsActive);
                
                // Mostrar notificación
                const message = result.data.jobsActive ? 'Jobs activados' : 'Jobs pausados';
                this.showNotification(message, 'success');
                
                // Recargar datos de la pestaña Test
                await this.loadTestData();
                
                console.log('✅ Estado de jobs cambiado exitosamente');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error cambiando estado de jobs:', error);
            this.showNotification('Error cambiando estado de jobs: ' + error.message, 'error');
        }
    }
    
    /**
     * Actualiza el botón de toggle de jobs según el estado actual
     */
    updateJobsToggleButton(jobsActive) {
        const toggleButton = document.getElementById('toggleJobsStatus');
        const toggleIcon = document.getElementById('toggleJobsIcon');
        const toggleText = document.getElementById('toggleJobsText');
        
        if (toggleButton && toggleIcon && toggleText) {
            if (jobsActive) {
                // Jobs están activos, mostrar opción de pausar
                toggleButton.className = 'btn btn-outline-warning btn-sm';
                toggleIcon.className = 'bi bi-pause-circle';
                toggleText.textContent = 'Pausar Jobs';
            } else {
                // Jobs están pausados, mostrar opción de activar
                toggleButton.className = 'btn btn-outline-success btn-sm';
                toggleIcon.className = 'bi bi-play-circle';
                toggleText.textContent = 'Activar Jobs';
            }
        }
    }
    
    /**
     * Ejecuta pruebas de ejemplo
     */
    async runSampleTests() {
        try {
            console.log('🧪 Ejecutando pruebas de ejemplo...');
            
            const response = await fetch('/api/test-monitoring/run-sample-tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Pruebas ejecutadas: ${result.data.testsExecuted} pruebas`, 'success');
                
                // Actualizar las estadísticas en la UI
                this.updateTestStatistics(result.data.currentStatistics);
                
                // Recargar datos de la pestaña Test
                await this.loadTestData();
                
                console.log('✅ Pruebas de ejemplo ejecutadas exitosamente');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error ejecutando pruebas de ejemplo:', error);
            this.showNotification('Error ejecutando pruebas: ' + error.message, 'error');
        }
    }
    
    /**
     * Alterna la visibilidad del historial de pruebas
     */
    async toggleTestHistory() {
        try {
            const testHistorySection = document.getElementById('testHistorySection');
            const viewTestHistoryBtn = document.getElementById('viewTestHistory');
            
            if (testHistorySection && viewTestHistoryBtn) {
                if (testHistorySection.style.display === 'none') {
                    // Mostrar historial
                    await this.loadTestHistory();
                    testHistorySection.style.display = 'block';
                    viewTestHistoryBtn.innerHTML = '<i class="bi bi-eye-slash"></i> Ocultar Historial';
                } else {
                    // Ocultar historial
                    testHistorySection.style.display = 'none';
                    viewTestHistoryBtn.innerHTML = '<i class="bi bi-list-ul"></i> Ver Historial';
                }
            }
        } catch (error) {
            console.error('❌ Error alternando historial de pruebas:', error);
            this.showNotification('Error mostrando historial: ' + error.message, 'error');
        }
    }
    
    /**
     * Carga el historial de pruebas
     */
    async loadTestHistory() {
        try {
            console.log('📋 Cargando historial de pruebas...');
            
            const response = await fetch('/api/test-monitoring/test-history?limit=20', {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.displayTestHistory(result.data.tests);
                console.log('✅ Historial de pruebas cargado');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error cargando historial de pruebas:', error);
            this.showNotification('Error cargando historial: ' + error.message, 'error');
        }
    }
    
    /**
     * Carga las tarifas sincronizadas
     */
    async loadTariffs() {
        try {
            console.log('💰 Cargando tarifas del CPO...');

            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tariffs`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const tariffs = Array.isArray(result.data) ? result.data : [];

            if (result.status_code !== 1000) {
                throw new Error(result.status_message || 'Error desconocido');
            }

            this.allTariffs = tariffs;
            this.filteredTariffs = [...tariffs];
            this.currentTariffsPage = 1;
            this.renderTariffsPage();
            this.updateCount('tariffsCount', tariffs.length);
            console.log('✅ Tarifas del CPO cargadas');

        } catch (error) {
            console.error('❌ Error cargando tarifas:', error);
            this.showNotification('Error cargando tarifas: ' + error.message, 'error');
            this.showTableError('tariffsTableBody', `Error al cargar tariffs: ${error.message}`);
            this.allTariffs = [];
            this.filteredTariffs = [];
            this.currentTariffsPage = 1;
            this.updateTariffsPaginationInfo(0, 0, 0);
            this.updateTariffsPaginationButtons();
            this.updateCount('tariffsCount', 0);
        }
    }
    
    /**
     * Muestra el historial de pruebas en la tabla
     */
    displayTestHistory(tests) {
        try {
            const testHistoryTable = document.getElementById('testHistoryTable');
            
            if (!testHistoryTable) {
                console.warn('⚠️ Tabla de historial de pruebas no encontrada');
                return;
            }
            
            if (tests.length === 0) {
                testHistoryTable.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay pruebas registradas</td></tr>';
                return;
            }
            
            testHistoryTable.innerHTML = tests.map(test => {
                const statusClass = this.getTestStatusClass(test.status);
                const statusIcon = this.getTestStatusIcon(test.status);
                const duration = test.duration ? `${test.duration}ms` : '-';
                const timestamp = new Date(test.timestamp).toLocaleString();
                
                return `
                    <tr>
                        <td>${test.testName}</td>
                        <td><span class="badge ${statusClass}">${statusIcon} ${test.status}</span></td>
                        <td>${test.message || '-'}</td>
                        <td>${duration}</td>
                        <td>${timestamp}</td>
                    </tr>
                `;
            }).join('');
            
        } catch (error) {
            console.error('❌ Error mostrando historial de pruebas:', error);
        }
    }
    
    /**
     * Obtiene la clase CSS para el estado de la prueba
     */
    getTestStatusClass(status) {
        switch (status) {
            case 'passed': return 'bg-success';
            case 'failed': return 'bg-danger';
            case 'running': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }
    
    /**
     * Obtiene el icono para el estado de la prueba
     */
    getTestStatusIcon(status) {
        switch (status) {
            case 'passed': return '✓';
            case 'failed': return '✗';
            case 'running': return '⏳';
            default: return '?';
        }
    }
    
    /**
     * Alterna la visibilidad del log de errores
     */
    toggleErrorLog() {
        try {
            const errorLogContainer = document.getElementById('errorLogContainer');
            const toggleErrorLogText = document.getElementById('toggleErrorLogText');
            
            if (errorLogContainer && toggleErrorLogText) {
                if (errorLogContainer.style.display === 'none') {
                    errorLogContainer.style.display = 'block';
                    toggleErrorLogText.textContent = 'Ocultar';
                } else {
                    errorLogContainer.style.display = 'none';
                    toggleErrorLogText.textContent = 'Mostrar';
                }
            }
        } catch (error) {
            console.error('❌ Error alternando visibilidad del log de errores:', error);
        }
    }
    
    /**
     * Limpia el log de errores
     */
    clearErrorLog() {
        try {
            const errorLog = document.getElementById('errorLog');
            if (errorLog) {
                errorLog.innerHTML = '<div class="text-muted">No hay errores registrados</div>';
            }
        } catch (error) {
            console.error('❌ Error limpiando log de errores:', error);
        }
    }
    
    /**
     * Muestra el badge de error en la pestaña Test
     */
    showErrorBadge() {
        try {
            const errorBadge = document.getElementById('test-error-badge');
            if (errorBadge) {
                errorBadge.style.display = 'inline';
            }
        } catch (error) {
            console.error('❌ Error mostrando badge de error:', error);
        }
    }
    
    /**
     * Oculta el badge de error en la pestaña Test
     */
    hideErrorBadge() {
        try {
            const errorBadge = document.getElementById('test-error-badge');
            if (errorBadge) {
                errorBadge.style.display = 'none';
            }
        } catch (error) {
            console.error('❌ Error ocultando badge de error:', error);
        }
    }
    
    /**
     * Agrega un error al log de errores
     */
    addErrorToLog(service, message, timestamp = null) {
        try {
            const errorLog = document.getElementById('errorLog');
            if (errorLog) {
                const time = timestamp || new Date().toLocaleString();
                const errorEntry = document.createElement('div');
                errorEntry.className = 'mb-2 p-2 border-start border-danger border-3';
                errorEntry.innerHTML = `
                    <div class="text-danger fw-bold">[${time}] ${service}</div>
                    <div class="text-light">${message}</div>
                `;
                
                // Si es el primer error, limpiar el mensaje de "no hay errores"
                if (errorLog.querySelector('.text-muted')) {
                    errorLog.innerHTML = '';
                }
                
                errorLog.insertBefore(errorEntry, errorLog.firstChild);
                
                // Limitar a 50 errores
                const errors = errorLog.querySelectorAll('.mb-2');
                if (errors.length > 50) {
                    errors[errors.length - 1].remove();
                }
            }
            
            // Mostrar badge de error
            this.showErrorBadge();
            
        } catch (error) {
            console.error('❌ Error agregando error al log:', error);
        }
    }
}
