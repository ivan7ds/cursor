/**
 * Funciones EMSP
 * Extraído de app.js (líneas 4037-5311)
 */

import { ApiUtils } from '../utils/api.js'

export class EMSPModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES EMSP =====

  // Cargar locations de eMSPs
  async loadEmspLocations () {
    try {
      console.log('🔄 Cargando EMSP locations...')

      // Cargar locations y EVSEs en paralelo
      const [locationsData, evsesData] = await Promise.all([
        ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/emsp/2.2/locations`),
        ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/emsp/2.2/evses`)
      ])
            
            console.log('📊 EMSP Locations data:', locationsData.data ? `Array[${locationsData.data.length}]` : locationsData);
            console.log('📊 EMSP EVSEs data:', evsesData.data ? `Array[${evsesData.data.length}]` : evsesData);
            
            // Crear un mapa de conteo de EVSEs por location
            const evseCountMap = {};
            if (evsesData.data && Array.isArray(evsesData.data)) {
                evsesData.data.forEach(evse => {
                    const locationId = evse.location_id;
                    evseCountMap[locationId] = (evseCountMap[locationId] || 0) + 1;
                });
            }
            
            this.app.emspLocationsEvseCountMap = evseCountMap;
            this.app.allEmspLocations = Array.isArray(locationsData.data) ? locationsData.data : [];
            this.buildEmspLocationNameMap();
            this.app.filteredEmspLocations = [...this.app.allEmspLocations];
            this.app.currentEmspLocationsPage = 1;
            this.renderEmspLocationsPage();
            this.app.updateCount('emspLocationsCount', this.app.allEmspLocations.length);
            
            console.log('✅ EMSP Locations cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP locations:', error);
            this.app.showTableError('emspLocationsTableBody', `Error al cargar EMSP locations: ${error.message}`);
            this.app.allEmspLocations = [];
            this.app.filteredEmspLocations = [];
            this.app.emspLocationsEvseCountMap = {};
            this.app.emspLocationNameMap = {};
            this.app.currentEmspLocationsPage = 1;
            this.updateEmspLocationsPaginationInfo(0, 0, 0);
            this.updateEmspLocationsPaginationButtons();
        }
    }

  renderEmspLocations(locations) {
        const tbody = document.getElementById('emspLocationsTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento emspLocationsTableBody no encontrado');
            return;
        }
        
        if (locations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay Ext locations disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = locations.map(location => {
            // Obtener el conteo de EVSEs del mapa
            const evseCount = this.app.emspLocationsEvseCountMap?.[location.id] || 0;

            return `
                <tr class="fade-in">
                    <td><code>${location.id || 'N/A'}</code></td>
                    <td><span class="badge bg-info">${location.emsp_party_id || 'N/A'}</span></td>
                    <td>${location.name || 'Sin nombre'}</td>
                    <td>${location.country || 'N/A'}</td>
                    <td>${location.city || 'N/A'}</td>
                    <td>${location.address || 'N/A'}</td>
                    <td><span class="badge bg-success">${evseCount}</span></td>
                    <td>${location.last_updated ? new Date(location.last_updated).toLocaleString() : 'N/A'}</td>
                </tr>
            `;
        }).join('');
        
        console.log(`✅ ${locations.length} EMSP locations renderizados con conteo de EVSEs`);
    }

  buildEmspLocationNameMap() {
        const map = {};
        if (Array.isArray(this.app.allEmspLocations)) {
            this.app.allEmspLocations.forEach(location => {
                if (!location || !location.id) {
                    return;
                }
                const name = location.name
                    || (location.address ? `${location.address}${location.city ? `, ${location.city}` : ''}` : '')
                    || (location.city ? `${location.city}${location.country ? `, ${location.country}` : ''}` : '')
                    || '';
                if (name) {
                    map[location.id] = name;
                }
            });
        }
        this.app.emspLocationNameMap = map;
    }

  getEmspLocationName(locationId) {
        if (!locationId) {
            return '';
        }
        if (!this.app.emspLocationNameMap || Object.keys(this.app.emspLocationNameMap).length === 0) {
            this.buildEmspLocationNameMap();
        }
        return this.app.emspLocationNameMap?.[locationId] || '';
    }

  buildEmspEvseIdMap() {
        const map = {};
        if (Array.isArray(this.app.allEmspEvses)) {
            this.app.allEmspEvses.forEach(evse => {
                if (!evse) {
                    return;
                }
                const uidRaw = evse.id || evse.evse_uid || evse.uid;
                if (!uidRaw) {
                    return;
                }
                const evseIdRaw = evse.evse_id || '';
                if (!evseIdRaw) {
                    return;
                }
                const uid = uidRaw.toString().trim();
                const uidUpper = uid.toUpperCase();
                const evseId = evseIdRaw.toString().trim();
                if (uid) {
                    map[uid] = evseId;
                }
                if (uidUpper) {
                    map[uidUpper] = evseId;
                }
            });
        }
        this.app.emspEvseIdMap = map;
    }

  getEmspEvseId(evseUid) {
        if (!evseUid) {
            return '';
        }
        if (!this.app.emspEvseIdMap || Object.keys(this.app.emspEvseIdMap).length === 0) {
            this.buildEmspEvseIdMap();
        }
        const uid = evseUid.toString().trim();
        const uidUpper = uid.toUpperCase();
        const cached = this.app.emspEvseIdMap?.[uid] || this.app.emspEvseIdMap?.[uidUpper];
        if (cached) {
            return cached;
        }

        if (Array.isArray(this.app.allEmspEvses)) {
            const found = this.app.allEmspEvses.find(evse => {
                const rawUid = evse?.id || evse?.evse_uid || evse?.uid;
                if (!rawUid) {
                    return false;
                }
                const normalized = rawUid.toString().trim();
                return normalized === uid || normalized.toUpperCase() === uidUpper;
            });
            if (found && found.evse_id) {
                const evseId = found.evse_id.toString().trim();
                if (evseId) {
                    this.app.emspEvseIdMap[uidUpper] = evseId;
                    this.app.emspEvseIdMap[uid] = evseId;
                    return evseId;
                }
            }
        }

        return '';
    }

  renderEmspLocationsPage() {
        const locations = Array.isArray(this.app.filteredEmspLocations) ? this.app.filteredEmspLocations : [];
        const totalLocations = locations.length;

        if (totalLocations === 0) {
            this.renderEmspLocations([]);
            this.updateEmspLocationsPaginationInfo(0, 0, 0);
            this.updateEmspLocationsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalLocations / this.app.emspLocationsPerPage));
        if (this.app.currentEmspLocationsPage > totalPages) {
            this.app.currentEmspLocationsPage = totalPages;
        }
        if (this.app.currentEmspLocationsPage < 1) {
            this.app.currentEmspLocationsPage = 1;
        }

        const startIndex = (this.app.currentEmspLocationsPage - 1) * this.app.emspLocationsPerPage;
        const endIndex = Math.min(startIndex + this.app.emspLocationsPerPage, totalLocations);
        const pageLocations = locations.slice(startIndex, endIndex);

        this.renderEmspLocations(pageLocations);
        this.updateEmspLocationsPaginationInfo(startIndex + 1, endIndex, totalLocations);
        this.updateEmspLocationsPaginationButtons();
    }

  updateEmspLocationsPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('emspLocationsPageInfo');
        const totalCount = document.getElementById('emspLocationsTotalCount');

        if (pageInfo) {
            pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

  updateEmspLocationsPaginationButtons() {
        const prevButton = document.getElementById('emspLocationsPrevPage');
        const nextButton = document.getElementById('emspLocationsNextPage');
        const totalLocations = Array.isArray(this.app.filteredEmspLocations) ? this.app.filteredEmspLocations.length : 0;
        const totalPages = totalLocations > 0 ? Math.ceil(totalLocations / this.app.emspLocationsPerPage) : 1;

        const atFirstPage = this.app.currentEmspLocationsPage <= 1 || totalLocations === 0;
        const atLastPage = this.app.currentEmspLocationsPage >= totalPages || totalLocations === 0;

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

  goToEmspLocationsPrevPage() {
        if (this.app.currentEmspLocationsPage > 1) {
            this.app.currentEmspLocationsPage--;
            this.renderEmspLocationsPage();
        }
    }

  goToEmspLocationsNextPage() {
        const totalLocations = Array.isArray(this.app.filteredEmspLocations) ? this.app.filteredEmspLocations.length : 0;
        const totalPages = Math.ceil(totalLocations / this.app.emspLocationsPerPage);

        if (this.app.currentEmspLocationsPage < totalPages) {
            this.app.currentEmspLocationsPage++;
            this.renderEmspLocationsPage();
        }
    }

    // Cargar EVSEs de eMSPs
  async loadEmspEvses() {
        try {
            console.log('🔄 Cargando EMSP EVSEs...');
            
      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/emsp/2.2/evses`)
            const evses = Array.isArray(data.data) ? data.data : [];
            console.log('📊 EMSP EVSEs data:', evses.length ? `Array[${evses.length}]` : data);
            
            this.app.allEmspEvses = evses;
            this.buildEmspEvseIdMap();
            this.populateEmspPartyFilter(evses);
            this.applyEmspEvseFilters({ resetPage: true });
            if (this.app.ui && this.app.ui.updateCount) {
              this.app.ui.updateCount('emspEvsesCount', evses.length)
            } else if (this.app.updateCount) {
              this.app.updateCount('emspEvsesCount', evses.length)
            }
            
            console.log('✅ EMSP EVSEs cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP EVSEs:', error);
            this.app.showTableError('emspEvsesTableBody', `Error al cargar EMSP EVSEs: ${error.message}`);
            this.app.allEmspEvses = [];
            this.app.filteredEmspEvses = [];
            this.app.currentEmspEvsesPage = 1;
            this.app.emspEvseIdMap = {};
            this.updateEmspEvsesPaginationInfo(0, 0, 0);
            this.updateEmspEvsesPaginationButtons();
        }
    }

  renderEmspEvses(evses) {
        const tbody = document.getElementById('emspEvsesTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento emspEvsesTableBody no encontrado');
            return;
        }
        
        if (evses.length === 0) {
            const hasData = Array.isArray(this.app.allEmspEvses) && this.app.allEmspEvses.length > 0;
            const filters = this.app.emspEvsesFilters || {};
            const hasFilters = Boolean(
                (filters.status && filters.status.trim()) ||
                (filters.party && filters.party.trim()) ||
                (filters.search && filters.search.trim())
            );
            const emptyIcon = hasFilters && hasData ? 'bi-funnel' : 'bi-inbox';
            const emptyMessage = hasFilters && hasData
                ? 'No se encontraron Ext EVSEs con los filtros aplicados'
                : 'No hay Ext EVSEs disponibles';

            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="bi ${emptyIcon}"></i> ${emptyMessage}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = evses.map(evse => {
            // Función segura para parsear connectors
            const getConnectorCount = (connectors) => {
                try {
                    if (!connectors || connectors === '' || connectors === 'null') {
                        return 0;
                    }
                    
                    // Si ya es un array, usarlo directamente
                    if (Array.isArray(connectors)) {
                        return connectors.length;
                    }
                    
                    // Si es un string, intentar parsearlo
                    if (typeof connectors === 'string') {
                        const parsed = JSON.parse(connectors);
                        return Array.isArray(parsed) ? parsed.length : 0;
                    }
                    
                    // Si es un objeto pero no array, verificar si tiene propiedades
                    if (typeof connectors === 'object' && connectors !== null) {
                        return Object.keys(connectors).length;
                    }
                    
                    return 0;
                } catch (error) {
                    console.warn(`⚠️ Error parseando connectors para EVSE ${evse.id}:`, error);
                    return 0;
                }
            };

            return `
                <tr class="fade-in">
                    <td><code>${evse.evse_id || 'N/A'}</code></td>
                    <td><code>${evse.id || 'N/A'}</code></td>
                    <td><span class="badge bg-info">${evse.emsp_party_id || 'N/A'}</span></td>
                    <td>${evse.location_id || 'N/A'}</td>
                    <td>
                        <span class="badge ${this.getEvseStatusBadgeClass(evse.status)}">
                            ${evse.status || 'UNKNOWN'}
                        </span>
                    </td>
                    <td>${getConnectorCount(evse.connectors)}</td>
                    <td>${evse.last_updated ? new Date(evse.last_updated).toLocaleString() : 'N/A'}</td>
                </tr>
            `;
        }).join('');
        
        console.log(`✅ ${evses.length} Ext EVSEs renderizados en la página actual`);
    }

  getEvseStatusBadgeClass (status) {
    if (!status) {
      return 'bg-secondary'
    }

    const statusUpper = status.toUpperCase()
    const statusClasses = {
      'AVAILABLE': 'bg-success',
      'CHARGING': 'bg-warning',
      'INOPERATIVE': 'bg-danger',
      'OUTOFORDER': 'bg-danger',
      'PLANNED': 'bg-info',
      'REMOVED': 'bg-dark',
      'RESERVED': 'bg-info',
      'UNKNOWN': 'bg-secondary',
      'OCCUPIED': 'bg-warning',
      'UNAVAILABLE': 'bg-danger'
    }

    return statusClasses[statusUpper] || 'bg-secondary'
  }

  renderEmspEvsesPage() {
        const evses = Array.isArray(this.app.filteredEmspEvses) ? this.app.filteredEmspEvses : [];
        const totalEvses = evses.length;

        if (totalEvses === 0) {
            this.renderEmspEvses([]);
            this.updateEmspEvsesPaginationInfo(0, 0, 0);
            this.updateEmspEvsesPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalEvses / this.app.emspEvsesPerPage));
        if (this.app.currentEmspEvsesPage > totalPages) {
            this.app.currentEmspEvsesPage = totalPages;
        }
        if (this.app.currentEmspEvsesPage < 1) {
            this.app.currentEmspEvsesPage = 1;
        }

        const startIndex = (this.app.currentEmspEvsesPage - 1) * this.app.emspEvsesPerPage;
        const endIndex = Math.min(startIndex + this.app.emspEvsesPerPage, totalEvses);
        const pageEvses = evses.slice(startIndex, endIndex);

        this.renderEmspEvses(pageEvses);
        this.updateEmspEvsesPaginationInfo(startIndex + 1, endIndex, totalEvses);
        this.updateEmspEvsesPaginationButtons();
    }

  updateEmspEvsesPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('emspEvsesPageInfo');
        const totalCount = document.getElementById('emspEvsesTotalCount');

        if (pageInfo) {
            pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

  updateEmspEvsesPaginationButtons() {
        const prevButton = document.getElementById('emspEvsesPrevPage');
        const nextButton = document.getElementById('emspEvsesNextPage');
        const totalEvses = Array.isArray(this.app.filteredEmspEvses) ? this.app.filteredEmspEvses.length : 0;
        const totalPages = totalEvses > 0 ? Math.ceil(totalEvses / this.app.emspEvsesPerPage) : 1;

        const atFirstPage = this.app.currentEmspEvsesPage <= 1 || totalEvses === 0;
        const atLastPage = this.app.currentEmspEvsesPage >= totalPages || totalEvses === 0;

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

  goToEmspEvsesPrevPage() {
        if (this.app.currentEmspEvsesPage > 1) {
            this.app.currentEmspEvsesPage--;
            this.renderEmspEvsesPage();
        }
    }

  goToEmspEvsesNextPage() {
        const totalEvses = Array.isArray(this.app.filteredEmspEvses) ? this.app.filteredEmspEvses.length : 0;
        const totalPages = Math.ceil(totalEvses / this.app.emspEvsesPerPage);

        if (this.app.currentEmspEvsesPage < totalPages) {
            this.app.currentEmspEvsesPage++;
            this.renderEmspEvsesPage();
        }
    }

  populateEmspPartyFilter (evses) {
    try {
      const partyFilter = document.getElementById('emspEvsePartyFilter')
      if (!partyFilter) {
        console.warn('⚠️ Elemento emspEvsePartyFilter no encontrado')
        return
      }

      const parties = [...new Set(evses.map(evse => evse.emsp_party_id).filter(Boolean))].sort()
      const currentValue = this.app.emspEvsesFilters?.party || ''

      partyFilter.innerHTML = '<option value="">Todos los eMSPs</option>' +
        parties.map(party => `<option value="${party}">${party}</option>`).join('')

      if (currentValue && parties.includes(currentValue)) {
        partyFilter.value = currentValue
      } else {
        partyFilter.value = ''
        if (currentValue) {
          this.app.emspEvsesFilters = this.app.emspEvsesFilters || {}
          this.app.emspEvsesFilters.party = ''
        }
      }
    } catch (error) {
      console.error('❌ Error poblando filtro de party:', error)
    }
  }

  applyEmspEvseFilters ({ resetPage = false } = {}) {
    try {
      const statusFilter = document.getElementById('emspEvseStatusFilter')?.value || ''
      const partyFilter = document.getElementById('emspEvsePartyFilter')?.value || ''
      const searchFilterRaw = document.getElementById('emspEvseSearchFilter')?.value || ''
      const searchFilter = searchFilterRaw.trim().toLowerCase()

      this.app.emspEvsesFilters = {
        status: statusFilter,
        party: partyFilter,
        search: searchFilter
      }

      let filtered = Array.isArray(this.app.allEmspEvses) ? [...this.app.allEmspEvses] : []

      // Aplicar filtro de estado
      if (statusFilter) {
        filtered = filtered.filter(evse => {
          const evseStatus = (evse.status || '').toUpperCase()
          return evseStatus === statusFilter.toUpperCase()
        })
      }

      // Aplicar filtro de party
      if (partyFilter) {
        filtered = filtered.filter(evse => {
          const evseParty = (evse.emsp_party_id || '').trim()
          return evseParty === partyFilter
        })
      }

      // Aplicar filtro de búsqueda
      if (searchFilter) {
        const searchTerms = searchFilter.split(/\s+/).filter(Boolean)
        filtered = filtered.filter(evse => {
          const searchableText = [
            evse.evse_id,
            evse.id,
            evse.location_id,
            evse.emsp_party_id,
            evse.status,
            evse.physical_reference
          ].filter(Boolean).join(' ').toLowerCase()

          return searchTerms.every(term => searchableText.includes(term))
        })
      }

      this.app.filteredEmspEvses = filtered

      // Actualizar página si es necesario
      if (resetPage) {
        this.app.currentEmspEvsesPage = 1
      }

      const totalPages = filtered.length > 0 ? Math.ceil(filtered.length / this.app.emspEvsesPerPage) : 1
      if (this.app.currentEmspEvsesPage > totalPages) {
        this.app.currentEmspEvsesPage = totalPages
      }
      if (this.app.currentEmspEvsesPage < 1) {
        this.app.currentEmspEvsesPage = 1
      }

      this.renderEmspEvsesPage()
    } catch (error) {
      console.error('❌ Error aplicando filtros de EMSP EVSEs:', error)
    }
  }

    // Cargar tariffs de eMSPs
  async loadEmspTariffs() {
        try {
            console.log('🔄 Cargando EMSP tariffs...');
            
      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/emsp/2.2/tariffs`)
            const allTariffs = data.data || [];
            const activeTariffs = allTariffs.filter(tariff => !tariff.deleted_at);
            
            console.log('📊 EMSP Tariffs data:', {
                total: allTariffs.length,
                active: activeTariffs.length
            });
            
            this.app.allEmspTariffs = activeTariffs;
            this.app.filteredEmspTariffs = [...activeTariffs];
            this.app.currentEmspTariffsPage = 1;
            this.renderEmspTariffsPage();
            this.app.updateCount('emspTariffsCount', activeTariffs.length);
            
            console.log('✅ EMSP Tariffs cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP tariffs:', error);
            this.app.showTableError('emspTariffsTableBody', `Error al cargar EMSP tariffs: ${error.message}`);
            this.app.allEmspTariffs = [];
            this.app.filteredEmspTariffs = [];
            this.app.currentEmspTariffsPage = 1;
            this.updateEmspTariffsPaginationInfo(0, 0, 0);
            this.updateEmspTariffsPaginationButtons();
        }
    }

  renderEmspTariffs(tariffs) {
        const tbody = document.getElementById('emspTariffsTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento emspTariffsTableBody no encontrado');
            return;
        }
        
        if (tariffs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay Ext tariffs disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tariffs.map(tariff => `
            <tr class="fade-in">
                <td><code>${tariff.id}</code></td>
                <td><span class="badge bg-info">${tariff.emsp_party_id}</span></td>
                <td>${tariff.name ? this.app.ui.escapeHtml(tariff.name) : '<span class="text-muted">Sin nombre</span>'}</td>
                <td>${tariff.type}</td>
                <td>${tariff.currency}</td>
                <td>${this.getElementsCount(tariff.elements)} elementos</td>
                <td>${tariff.start_date_time ? new Date(tariff.start_date_time).toLocaleDateString() : 'N/A'}</td>
                <td>${tariff.end_date_time ? new Date(tariff.end_date_time).toLocaleDateString() : 'N/A'}</td>
                <td>${new Date(tariff.last_updated).toLocaleString()}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-info"
                                onclick="window.dashboardApp.viewEmspTariff('${encodeURIComponent(tariff.emsp_country_code || '')}', '${encodeURIComponent(tariff.emsp_party_id || '')}', '${encodeURIComponent(tariff.tariff_id || tariff.id || '')}')"
                                title="Ver detalles de la tarifa">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary"
                                onclick="window.dashboardApp.viewEmspTariffEvses('${encodeURIComponent(tariff.emsp_country_code || '')}', '${encodeURIComponent(tariff.emsp_party_id || '')}', '${encodeURIComponent(tariff.tariff_id || tariff.id || '')}')"
                                title="Ver EVSEs asociados">
                            <i class="bi bi-diagram-3"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        console.log(`✅ ${tariffs.length} Ext tariffs renderizados en la página actual`);
    }

  renderEmspTariffsPage() {
        const tariffs = Array.isArray(this.app.filteredEmspTariffs) ? this.app.filteredEmspTariffs : [];
        const totalTariffs = tariffs.length;

        if (totalTariffs === 0) {
            this.renderEmspTariffs([]);
            this.updateEmspTariffsPaginationInfo(0, 0, 0);
            this.updateEmspTariffsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalTariffs / this.app.emspTariffsPerPage));
        if (this.app.currentEmspTariffsPage > totalPages) {
            this.app.currentEmspTariffsPage = totalPages;
        }
        if (this.app.currentEmspTariffsPage < 1) {
            this.app.currentEmspTariffsPage = 1;
        }

        const startIndex = (this.app.currentEmspTariffsPage - 1) * this.app.emspTariffsPerPage;
        const endIndex = Math.min(startIndex + this.app.emspTariffsPerPage, totalTariffs);
        const pageTariffs = tariffs.slice(startIndex, endIndex);

        this.renderEmspTariffs(pageTariffs);
        this.updateEmspTariffsPaginationInfo(startIndex + 1, endIndex, totalTariffs);
        this.updateEmspTariffsPaginationButtons();
    }

  updateEmspTariffsPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('emspTariffsPageInfo');
        const totalCount = document.getElementById('emspTariffsTotalCount');

        if (pageInfo) {
            pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

  updateEmspTariffsPaginationButtons() {
        const prevButton = document.getElementById('emspTariffsPrevPage');
        const nextButton = document.getElementById('emspTariffsNextPage');
        const totalTariffs = Array.isArray(this.app.filteredEmspTariffs) ? this.app.filteredEmspTariffs.length : 0;
        const totalPages = totalTariffs > 0 ? Math.ceil(totalTariffs / this.app.emspTariffsPerPage) : 1;

        const atFirstPage = this.app.currentEmspTariffsPage <= 1 || totalTariffs === 0;
        const atLastPage = this.app.currentEmspTariffsPage >= totalPages || totalTariffs === 0;

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

  goToEmspTariffsPrevPage() {
        if (this.app.currentEmspTariffsPage > 1) {
            this.app.currentEmspTariffsPage--;
            this.renderEmspTariffsPage();
        }
    }

  goToEmspTariffsNextPage() {
        const totalTariffs = Array.isArray(this.app.filteredEmspTariffs) ? this.app.filteredEmspTariffs.length : 0;
        const totalPages = Math.ceil(totalTariffs / this.app.emspTariffsPerPage);

        if (this.app.currentEmspTariffsPage < totalPages) {
            this.app.currentEmspTariffsPage++;
            this.renderEmspTariffsPage();
        }
    }

    // Función auxiliar para obtener el conteo de elementos de manera segura
  getElementsCount(elements) {
        try {
            if (!elements) return 0;
            
            // Si ya es un array, devolver su longitud
            if (Array.isArray(elements)) {
                return elements.length;
            }
            
            // Si es un string, intentar parsearlo
            if (typeof elements === 'string') {
                const parsed = JSON.parse(elements);
                return Array.isArray(parsed) ? parsed.length : 0;
            }
            
            // Si es un objeto, devolver 1
            if (typeof elements === 'object') {
                return 1;
            }
            
            return 0;
        } catch (error) {
            console.warn('⚠️ Error parseando elements:', error);
            return 0;
        }
    }

  parseTariffElements(elements) {
        try {
            if (!elements) {
                return [];
            }

            if (Array.isArray(elements)) {
                return elements;
            }

            if (typeof elements === 'string') {
                const parsed = JSON.parse(elements);
                return Array.isArray(parsed) ? parsed : [];
            }

            if (typeof elements === 'object') {
                return [elements];
            }

            return [];
        } catch (error) {
            console.warn('⚠️ Error parseando elementos de tarifa:', error);
            return [];
        }
    }

  formatTariffRestrictions(restrictions) {
        if (!restrictions || typeof restrictions !== 'object') {
            return '<span class="text-muted">N/A</span>';
        }

        const entries = Object.entries(restrictions).filter(([_, value]) => value !== null && value !== undefined);
        if (entries.length === 0) {
            return '<span class="text-muted">N/A</span>';
        }

        const itemsHtml = entries.map(([key, value]) => `
            <li class="mb-1">
                <strong>${this.app.ui.escapeHtml(this.formatRestrictionLabel(key))}:</strong>
                <span class="ms-1">${this.formatRestrictionValue(value)}</span>
            </li>
        `).join('');

        return `<ul class="list-unstyled mb-0 small">${itemsHtml}</ul>`;
    }

  formatRestrictionLabel(key) {
        if (!key) {
            return '';
        }

        return key
            .toString()
            .replace(/[_-]+/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .split(' ')
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

  formatRestrictionValue(value) {
        if (value === null || value === undefined) {
            return '<span class="text-muted">N/A</span>';
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '<span class="text-muted">N/A</span>';
            }

            return value.map(item => {
                if (item === null || item === undefined) {
                    return '';
                }

                if (typeof item === 'object') {
                    return `<span class="d-inline-block me-2">${this.formatRestrictionValue(item)}</span>`;
                }

                return `<span class="badge bg-light text-dark border">${this.app.ui.escapeHtml(String(item))}</span>`;
            }).join(' ');
        }

        if (typeof value === 'object') {
            const nestedEntries = Object.entries(value).filter(([_, nestedValue]) => nestedValue !== null && nestedValue !== undefined);
            if (nestedEntries.length === 0) {
                return '<span class="text-muted">N/A</span>';
            }

            const nestedItems = nestedEntries.map(([nestedKey, nestedValue]) => `
                <li>
                    <strong>${this.app.ui.escapeHtml(this.formatRestrictionLabel(nestedKey))}:</strong>
                    <span class="ms-1">${this.formatRestrictionValue(nestedValue)}</span>
                </li>
            `).join('');

            return `<ul class="list-unstyled mb-1">${nestedItems}</ul>`;
        }

        if (typeof value === 'boolean') {
            return value
                ? '<span class="badge bg-success">Sí</span>'
                : '<span class="badge bg-secondary">No</span>';
        }

        return this.app.ui.escapeHtml(String(value));
    }

  parseEmspConnectors(connectors) {
        try {
            if (!connectors) {
                return [];
            }

            if (Array.isArray(connectors)) {
                return connectors;
            }

            if (typeof connectors === 'string') {
                const trimmed = connectors.trim();
                if (!trimmed) {
                    return [];
                }
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed;
                    }
                    if (parsed && typeof parsed === 'object') {
                        if (Array.isArray(parsed.connectors)) {
                            return parsed.connectors;
                        }
                        return Object.values(parsed);
                    }
                } catch (parseError) {
                    console.warn('⚠️ JSON.parse falló para connectors de eMSP, intentando parseo alternativo:', parseError);
                    const normalized = trimmed
                        .replace(/=>/g, ':')
                        .replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":')
                        .replace(/:\s*'([^']*?)'/g, ':"$1"')
                        .replace(/'/g, '"');
                    try {
                        const parsedFallback = JSON.parse(normalized);
                        if (Array.isArray(parsedFallback)) {
                            return parsedFallback;
                        }
                        if (parsedFallback && typeof parsedFallback === 'object') {
                            if (Array.isArray(parsedFallback.connectors)) {
                                return parsedFallback.connectors;
                            }
                            return Object.values(parsedFallback);
                        }
                    } catch (fallbackError) {
                        console.warn('⚠️ Parseo alternativo falló para connectors de eMSP:', fallbackError);
                        // Intento final: dividir por llaves o puntos y coma
                        const withoutBrackets = trimmed
                            .replace(/^\[|\]$/g, '')
                            .split(/}\s*,\s*{/)
                            .map(chunk => chunk.replace(/^{|}$/g, '').trim())
                            .filter(Boolean);
                        if (withoutBrackets.length > 0) {
                            return withoutBrackets.map((chunk, index) => ({
                                index,
                                raw: chunk
                            }));
                        }
                    }
                }
                return [];
            }

            if (typeof connectors === 'object') {
                if (Array.isArray(connectors.connectors)) {
                    return connectors.connectors;
                }
                if (Array.isArray(connectors.data)) {
                    return connectors.data;
                }
                return Object.values(connectors);
            }

            return [];
        } catch (error) {
            console.warn('⚠️ Error parseando conectores de eMSP:', error);
            return [];
        }
    }

  normalizeTariffIds(value) {
        const result = [];

        const append = (item) => {
            if (item === null || item === undefined) {
                return;
            }

            if (Array.isArray(item)) {
                item.forEach(append);
                return;
            }

            if (typeof item === 'string') {
                const trimmed = item.trim();
                if (!trimmed) {
                    return;
                }

                if (
                    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
                    (trimmed.startsWith('{') && trimmed.endsWith('}'))
                ) {
                    const inner = trimmed.slice(1, -1).trim();
                    if (!inner) {
                        return;
                    }
                    if (trimmed.startsWith('[')) {
                        try {
                            const parsed = JSON.parse(trimmed);
                            append(parsed);
                            return;
                        } catch (error) {
                            console.warn('⚠️ Error parseando arreglo JSON de tarifas:', error);
                            inner.split(',').forEach(part => append(part));
                            return;
                        }
                    }
                    if (trimmed.startsWith('{') && trimmed.includes(':')) {
                        try {
                            const parsed = JSON.parse(trimmed);
                            append(parsed);
                            return;
                        } catch (error) {
                            console.warn('⚠️ Error parseando objeto JSON de tarifas:', error);
                        }
                    }
                    inner.split(',').forEach(part => append(part));
                    return;
                }

                if (trimmed.includes(',')) {
                    trimmed.split(',').forEach(part => append(part));
                    return;
                }

                result.push(trimmed);
                return;
            }

            if (typeof item === 'object') {
                if (Object.prototype.hasOwnProperty.call(item, 'tariff_id')) {
                    append(item.tariff_id);
                }
                if (Object.prototype.hasOwnProperty.call(item, 'tariff_ids')) {
                    append(item.tariff_ids);
                }
                Object.values(item).forEach(append);
                return;
            }

            result.push(String(item));
        };

        append(value);

        return [...new Set(result.map(id => id.trim()).filter(Boolean))];
    }

  extractTariffIdsFromConnector(connector) {
        if (!connector) {
            return [];
        }

        const collected = [];
        const collectValue = (value) => {
            if (value === undefined || value === null) {
                return;
            }
            this.normalizeTariffIds(value).forEach(id => collected.push(id));
        };

        collectValue(connector.tariff_ids);
        collectValue(connector.tariff_id);
        collectValue(connector.tariffs);
        collectValue(connector.tariff);

        if (Array.isArray(connector.tariffs)) {
            connector.tariffs.forEach(tariffObj => {
                collectValue(tariffObj);
                if (tariffObj && typeof tariffObj === 'object') {
                    collectValue(tariffObj.id);
                    collectValue(tariffObj.tariff_id);
                    collectValue(tariffObj.tariff_ids);
                    Object.values(tariffObj).forEach(value => collectValue(value));
                }
            });
        }

        if (typeof connector === 'object') {
            Object.entries(connector).forEach(([key, value]) => {
                if (/tariff/i.test(key)) {
                    collectValue(value);
                }
            });
        }

        return [...new Set(collected.map(id => id.trim()).filter(Boolean))];
    }

  findEmspTariff(countryCode, partyId, tariffId) {
        const tariffs = Array.isArray(this.app.allEmspTariffs) ? this.app.allEmspTariffs : [];
        const targetTariffId = (tariffId || '').trim();
        if (!targetTariffId) {
            return null;
        }

        const targetTariffUpper = targetTariffId.toUpperCase();
        const targetPartyUpper = (partyId || '').trim().toUpperCase();
        const targetCountryUpper = (countryCode || '').trim().toUpperCase();

        const matchExact = tariffs.find(tariff => {
            const currentTariffUpper = String(tariff.tariff_id || tariff.id || '').trim().toUpperCase();
            const currentPartyUpper = String(tariff.emsp_party_id || '').trim().toUpperCase();
            const currentCountryUpper = String(tariff.emsp_country_code || '').trim().toUpperCase();

            return currentTariffUpper === targetTariffUpper &&
                (!targetPartyUpper || currentPartyUpper === targetPartyUpper) &&
                (!targetCountryUpper || currentCountryUpper === targetCountryUpper);
        });

        if (matchExact) {
            return matchExact;
        }

        const matchParty = tariffs.find(tariff => {
            const currentTariffUpper = String(tariff.tariff_id || tariff.id || '').trim().toUpperCase();
            const currentPartyUpper = String(tariff.emsp_party_id || '').trim().toUpperCase();

            return currentTariffUpper === targetTariffUpper &&
                (!targetPartyUpper || currentPartyUpper === targetPartyUpper);
        });

        if (matchParty) {
            return matchParty;
        }

        return tariffs.find(tariff =>
            String(tariff.tariff_id || tariff.id || '').trim().toUpperCase() === targetTariffUpper
        ) || null;
    }

  async ensureEmspEvsesLoaded() {
        const alreadyLoaded = Array.isArray(this.app.allEmspEvses) && this.app.allEmspEvses.length > 0;
        if (!alreadyLoaded) {
            try {
                console.log('🔄 Cargando EVSEs externos para consulta rápida de tarifas...');
                const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/evses`, {
                    headers: {
                        'Authorization': `Token ${ApiUtils.getAuthToken()}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                const evses = Array.isArray(data.data) ? data.data : [];
                this.app.allEmspEvses = evses;
                this.buildEmspEvseIdMap();
                console.log(`✅ EVSEs externos cargados (${evses.length}) para consulta de tarifas.`);
            } catch (error) {
                console.error('❌ Error cargando EVSEs externos para consulta de tarifas:', error);
                return false;
            }
        }

        await this.ensureEmspLocationsLoaded();

        return Array.isArray(this.app.allEmspEvses) && this.app.allEmspEvses.length > 0;
    }

  async ensureEmspTariffsLoaded() {
        const alreadyLoaded = Array.isArray(this.app.allEmspTariffs) && this.app.allEmspTariffs.length > 0;
        if (alreadyLoaded) {
            return true;
        }

        try {
            console.log('🔄 Cargando tarifas externas para consulta...');
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tariffs`, {
                headers: {
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const allTariffs = Array.isArray(data.data) ? data.data : [];
            const activeTariffs = allTariffs.filter(tariff => !tariff.deleted_at);

            this.app.allEmspTariffs = activeTariffs;
            this.app.filteredEmspTariffs = [...activeTariffs];
            console.log(`✅ Tarifas externas cargadas (${activeTariffs.length}) para consulta.`);
            return activeTariffs.length > 0;
        } catch (error) {
            console.error('❌ Error cargando tarifas externas para consulta:', error);
            return false;
        }
    }

  async ensureEmspLocationsLoaded() {
        const alreadyLoaded = Array.isArray(this.app.allEmspLocations) && this.app.allEmspLocations.length > 0;
        if (alreadyLoaded) {
            if (!this.app.emspLocationNameMap || Object.keys(this.app.emspLocationNameMap).length === 0) {
                this.buildEmspLocationNameMap();
            }
            return true;
        }

        try {
            console.log('🔄 Cargando locations externos para consulta rápida de EVSEs...');
      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/emsp/2.2/locations`)
            this.app.allEmspLocations = Array.isArray(data.data) ? data.data : [];
            this.buildEmspLocationNameMap();
            console.log(`✅ Locations externos cargados (${this.app.allEmspLocations.length}) para consulta de EVSEs.`);
            return this.app.allEmspLocations.length > 0;
        } catch (error) {
            console.error('❌ Error cargando locations externos para consulta rápida:', error);
            return false;
        }
    }

  renderTariffs(tariffs) {
        const tbody = document.getElementById('tariffsTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento tariffsTableBody no encontrado');
            return;
        }
        
        const totalTariffs = Array.isArray(this.allTariffs) ? this.allTariffs.length : 0;
        if (tariffs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-muted">
                        <i class="bi ${totalTariffs > 0 ? 'bi-funnel' : 'bi-inbox'}"></i> ${totalTariffs > 0 ? 'No se encontraron tariffs para esta página' : 'No hay tariffs disponibles'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tariffs.map(tariff => `
            <tr class="fade-in">
                <td>
                    <code class="tariff-id-tooltip" 
                          data-bs-toggle="tooltip" 
                          data-bs-placement="top" 
                          data-bs-html="true"
                          data-tariff-id="${tariff.id}"
                          data-tooltip-type="tariff">${tariff.id || 'N/A'}</code>
                </td>
                <td><span class="badge bg-primary">${tariff.party_id || 'N/A'}</span></td>
                <td><span class="badge bg-secondary">${tariff.type || 'N/A'}</span></td>
                <td><span class="badge bg-info">${tariff.currency || 'N/A'}</span></td>
                <td>${this.getElementsCount(tariff.elements)} elementos</td>
                <td>${tariff.min_price ? `${tariff.min_price} ${tariff.currency}` : 'N/A'}</td>
                <td>${tariff.max_price ? `${tariff.max_price} ${tariff.currency}` : 'N/A'}</td>
                <td>${tariff.start_date_time ? new Date(tariff.start_date_time).toLocaleDateString() : 'N/A'}</td>
                <td>${tariff.end_date_time ? new Date(tariff.end_date_time).toLocaleDateString() : 'N/A'}</td>
                <td>${new Date(tariff.last_updated).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="window.dashboardApp.deleteTariff('${tariff.id}')"
                            title="Eliminar tarifa">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Inicializar tooltips para las tarifas
        this.initializeTariffTooltips();
        
        console.log(`✅ ${tariffs.length} tariffs renderizados en la página actual`);
    }

  renderTariffsPage() {
        const tariffs = Array.isArray(this.filteredTariffs) ? this.filteredTariffs : [];
        const totalTariffs = tariffs.length;

        if (totalTariffs === 0) {
            this.renderTariffs([]);
            this.updateTariffsPaginationInfo(0, 0, 0);
            this.updateTariffsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalTariffs / this.tariffsPerPage));
        if (this.currentTariffsPage > totalPages) {
            this.currentTariffsPage = totalPages;
        }
        if (this.currentTariffsPage < 1) {
            this.currentTariffsPage = 1;
        }

        const startIndex = (this.currentTariffsPage - 1) * this.tariffsPerPage;
        const endIndex = Math.min(startIndex + this.tariffsPerPage, totalTariffs);
        const pageTariffs = tariffs.slice(startIndex, endIndex);

        this.renderTariffs(pageTariffs);
        this.updateTariffsPaginationInfo(startIndex + 1, endIndex, totalTariffs);
        this.updateTariffsPaginationButtons();
    }

  updateTariffsPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('tariffsPageInfo');
        const totalCount = document.getElementById('tariffsTotalCount');

        if (pageInfo) {
            pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

  updateTariffsPaginationButtons() {
        const prevButton = document.getElementById('tariffsPrevPage');
        const nextButton = document.getElementById('tariffsNextPage');
        const totalTariffs = Array.isArray(this.filteredTariffs) ? this.filteredTariffs.length : 0;
        const totalPages = totalTariffs > 0 ? Math.ceil(totalTariffs / this.tariffsPerPage) : 1;

        const atFirstPage = this.currentTariffsPage <= 1 || totalTariffs === 0;
        const atLastPage = this.currentTariffsPage >= totalPages || totalTariffs === 0;

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

  goToTariffsPrevPage() {
        if (this.currentTariffsPage > 1) {
            this.currentTariffsPage--;
            this.renderTariffsPage();
        }
    }

  goToTariffsNextPage () {
    const totalTariffs = Array.isArray(this.app.filteredEmspTariffs) ? this.app.filteredEmspTariffs.length : 0
    const totalPages = Math.ceil(totalTariffs / this.app.emspTariffsPerPage)

    if (this.app.currentEmspTariffsPage < totalPages) {
      this.app.currentEmspTariffsPage++
      this.renderTariffsPage()
    }
  }

  setupEmspEventListeners () {
    try {
      console.log('🔧 Configurando event listeners EMSP...')

      // Botones de refresh EMSP
      const refreshEmspLocations = document.getElementById('refreshEmspLocations')
      if (refreshEmspLocations) {
        refreshEmspLocations.addEventListener('click', () => {
          console.log('📍 Botón refreshEmspLocations clickeado')
          this.loadEmspLocations()
        })
        console.log('✅ Event listener para refreshEmspLocations agregado')
      }

      const refreshEmspEvses = document.getElementById('refreshEmspEvses')
      if (refreshEmspEvses) {
        refreshEmspEvses.addEventListener('click', () => {
          console.log('📍 Botón refreshEmspEvses clickeado')
          this.loadEmspEvses()
        })
        console.log('✅ Event listener para refreshEmspEvses agregado')
      }

      const refreshEmspTariffs = document.getElementById('refreshEmspTariffs')
      if (refreshEmspTariffs) {
        refreshEmspTariffs.addEventListener('click', () => {
          console.log('📍 Botón refreshEmspTariffs clickeado')
          this.loadEmspTariffs()
        })
        console.log('✅ Event listener para refreshEmspTariffs agregado')
      }

      // Paginación EMSP Locations
      const emspLocationsPrevPage = document.getElementById('emspLocationsPrevPage')
      if (emspLocationsPrevPage) {
        emspLocationsPrevPage.addEventListener('click', () => {
          this.goToEmspLocationsPrevPage()
        })
      }

      const emspLocationsNextPage = document.getElementById('emspLocationsNextPage')
      if (emspLocationsNextPage) {
        emspLocationsNextPage.addEventListener('click', () => {
          this.goToEmspLocationsNextPage()
        })
      }

      // Paginación EMSP EVSEs
      const emspEvsesPrevPage = document.getElementById('emspEvsesPrevPage')
      if (emspEvsesPrevPage) {
        emspEvsesPrevPage.addEventListener('click', () => {
          this.goToEmspEvsesPrevPage()
        })
      }

      const emspEvsesNextPage = document.getElementById('emspEvsesNextPage')
      if (emspEvsesNextPage) {
        emspEvsesNextPage.addEventListener('click', () => {
          this.goToEmspEvsesNextPage()
        })
      }

      // Paginación EMSP Tariffs
      const emspTariffsPrevPage = document.getElementById('emspTariffsPrevPage')
      if (emspTariffsPrevPage) {
        emspTariffsPrevPage.addEventListener('click', () => {
          this.goToEmspTariffsPrevPage()
        })
      }

      const emspTariffsNextPage = document.getElementById('emspTariffsNextPage')
      if (emspTariffsNextPage) {
        emspTariffsNextPage.addEventListener('click', () => {
          this.goToEmspTariffsNextPage()
        })
      }

      console.log('✅ Event listeners EMSP configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners EMSP:', error)
    }
  }
}
