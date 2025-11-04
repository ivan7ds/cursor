

class DashboardApp {
    constructor() {
        console.log('🚀 Constructor DashboardApp iniciado');
        this.baseUrl = window.location.origin;
        this.currentTab = 'logs';
        this.logsStreaming = false;
        this.logsEventSource = null;
        this.allSessions = []; // Almacenar todas las sesiones para filtrado
        this.filteredSessions = [];
        this.currentSessionsPage = 1;
        this.sessionsPerPage = 20;
        this.allExtSessions = []; // Almacenar todas las sesiones externas para filtrado
        this.filteredExtSessions = []; // Sesiones externas filtradas
        this.currentExtSessionsPage = 1;
        this.extSessionsPerPage = 20;
        this.extSessionsSearchQuery = '';
        this.allTokens = []; // Tokens del CPO
        this.filteredTokens = [];
        this.currentTokensPage = 1;
        this.tokensPerPage = 20;
        this.allEmspLocations = []; // Locations externas
        this.filteredEmspLocations = [];
        this.currentEmspLocationsPage = 1;
        this.emspLocationsPerPage = 20;
        this.emspLocationsEvseCountMap = {};
        this.emspLocationNameMap = {};
        this.emspEvseIdMap = {};
        this.allEmspEvses = []; // EVSEs externos
        this.filteredEmspEvses = [];
        this.currentEmspEvsesPage = 1;
        this.emspEvsesPerPage = 20;
        this.emspEvsesFilters = {
            status: '',
            party: '',
            search: ''
        };
        this.allTariffs = []; // Tariffs del CPO
        this.filteredTariffs = [];
        this.currentTariffsPage = 1;
        this.tariffsPerPage = 20;
        this.allEmspTariffs = []; // Tariffs externos
        this.filteredEmspTariffs = [];
        this.currentEmspTariffsPage = 1;
        this.emspTariffsPerPage = 20;
        this.allEmspTokens = []; // Almacenar todos los Ext tokens para paginación
        this.filteredEmspTokens = []; // Tokens externos filtrados
        this.currentEmspTokensPage = 1;
        this.emspTokensPerPage = 20;
        this.emspTokensFilters = {
            search: '',
            issuer: '',
            type: '',
            valid: '',
            whitelist: ''
        };
        this.currentChargingSession = null; // Sesión de recarga activa
        this.cpoEvses = []; // EVSEs del CPO externo
        this.filterActiveExtSessions = true; // Filtro de sesiones externas activas
        this.logPollingInterval = null; // Intervalo para consultar logs
        this.testServiceToggleConfigs = {
            evseNotificationService: {
                buttonId: 'toggleEvseService',
                iconId: 'toggleEvseIcon',
                textId: 'toggleEvseText',
                activeClass: 'btn btn-outline-warning btn-sm',
                inactiveClass: 'btn btn-outline-success btn-sm',
                activeIcon: 'bi bi-pause-circle',
                inactiveIcon: 'bi bi-play-circle',
                activeText: 'Pausar',
                inactiveText: 'Activar'
            },
            chargingNotificationService: {
                buttonId: 'toggleChargingService',
                iconId: 'toggleChargingIcon',
                textId: 'toggleChargingText',
                activeClass: 'btn btn-outline-warning btn-sm',
                inactiveClass: 'btn btn-outline-success btn-sm',
                activeIcon: 'bi bi-pause-circle',
                inactiveIcon: 'bi bi-play-circle',
                activeText: 'Pausar',
                inactiveText: 'Activar'
            },
            emspLocationsSyncService: {
                buttonId: 'toggleEmspLocationsService',
                iconId: 'toggleEmspLocationsIcon',
                textId: 'toggleEmspLocationsText',
                activeClass: 'btn btn-outline-warning btn-sm',
                inactiveClass: 'btn btn-outline-success btn-sm',
                activeIcon: 'bi bi-pause-circle',
                inactiveIcon: 'bi bi-play-circle',
                activeText: 'Pausar',
                inactiveText: 'Activar'
            },
            emspTariffsSyncService: {
                buttonId: 'toggleEmspTariffsService',
                iconId: 'toggleEmspTariffsIcon',
                textId: 'toggleEmspTariffsText',
                activeClass: 'btn btn-outline-warning btn-sm',
                inactiveClass: 'btn btn-outline-success btn-sm',
                activeIcon: 'bi bi-pause-circle',
                inactiveIcon: 'bi bi-play-circle',
                activeText: 'Pausar',
                inactiveText: 'Activar'
            },
            emspTokensSyncService: {
                buttonId: 'toggleEmspTokensService',
                iconId: 'toggleEmspTokensIcon',
                textId: 'toggleEmspTokensText',
                activeClass: 'btn btn-outline-warning btn-sm',
                inactiveClass: 'btn btn-outline-success btn-sm',
                activeIcon: 'bi bi-pause-circle',
                inactiveIcon: 'bi bi-play-circle',
                activeText: 'Pausar',
                inactiveText: 'Activar'
            },
            testLocationEVSECreationService: {
                buttonId: 'toggleTestLocationEvseService',
                iconId: 'toggleTestLocationEvseIcon',
                textId: 'toggleTestLocationEvseText',
                activeClass: 'btn btn-outline-warning btn-sm',
                inactiveClass: 'btn btn-outline-success btn-sm',
                activeIcon: 'bi bi-pause-circle',
                inactiveIcon: 'bi bi-play-circle',
                activeText: 'Pausar',
                inactiveText: 'Activar'
            },
            testSessionService: {
                buttonId: 'toggleTestSessionService',
                iconId: 'toggleTestSessionIcon',
                textId: 'toggleTestSessionText',
                activeClass: 'btn btn-outline-warning btn-sm',
                inactiveClass: 'btn btn-outline-success btn-sm',
                activeIcon: 'bi bi-pause-circle',
                inactiveIcon: 'bi bi-play-circle',
                activeText: 'Pausar',
                inactiveText: 'Activar'
            }
        };
        
        console.log('✅ Constructor completado');
    }

    // Función auxiliar para detectar si una URL es de ngrok y agregar headers necesarios
    isNgrokUrl(url) {
        return url && (url.includes('ngrok.io') || url.includes('ngrok-free.app') || url.includes('ngrok.app'));
    }

    // Función auxiliar para crear headers con soporte para ngrok
    createCpoHeaders(authToken, contentType = 'application/json') {
        const headers = {
            'Authorization': `Token ${authToken}`,
            'Content-Type': contentType
        };
        
        // Agregar header para saltar advertencia de ngrok si es necesario
        // Este header se agregará dinámicamente en cada petición según la URL
        return headers;
    }

    async init() {
        console.log('🚀 Inicializando Dashboard...');
        
        try {
            // Cargar configuraciones OCPI
            await this.loadOCPISettings();
            
            // Verificar que el DOM esté listo
            if (document.readyState === 'loading') {
                console.log('⏳ DOM aún cargando, esperando...');
                document.addEventListener('DOMContentLoaded', () => this.setupBasic());
            } else {
                console.log('✅ DOM ya está listo');
                this.setupBasic();
            }
        } catch (error) {
            console.error('❌ Error en init:', error);
        }
    }

    async loadOCPISettings() {
        try {
            const response = await fetch(`${this.baseUrl}/api/config/ocpi-settings`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            if (response.ok) {
                const responseData = await response.json();
                const settings = responseData.data || responseData; // Soporte para ambas estructuras
                window.OCPI_PARTY_ID = settings.partyId;
                window.OCPI_COUNTRY_CODE = settings.countryCode;
                window.OCPI_VERSION = settings.version;
                console.log('🌐 OCPI Settings loaded:', settings);
            }
        } catch (error) {
            console.error('❌ Could not load OCPI settings:', error);
            // No establecer valores por defecto - forzar al usuario a configurar correctamente
            window.OCPI_PARTY_ID = null;
            window.OCPI_COUNTRY_CODE = null;
            window.OCPI_VERSION = null;
        }
    }

    setupBasic() {
        console.log('🔧 Configurando funcionalidad básica...');
        
        try {
            // Solo configurar lo básico por ahora
            this.setupSimpleEventListeners();
            this.updateConnectionStatus();
            
            // Cargar conexiones CPO para el selector
            this.loadCpoConnections();
            
            console.log('✅ Configuración básica completada');
        } catch (error) {
            console.error('❌ Error en setupBasic:', error);
        }
    }

    setupSimpleEventListeners() {
        console.log('🔧 Configurando event listeners simples...');
        
        try {
            // Botones básicos de logs
            const startLogs = document.getElementById('startLogs');
            if (startLogs) {
                startLogs.addEventListener('click', () => {
                    console.log('🟢 Botón startLogs clickeado');
                    this.startLogsStreaming();
                });
                console.log('✅ Event listener para startLogs agregado');
            } else {
                console.warn('⚠️ Elemento startLogs no encontrado');
            }

            const stopLogs = document.getElementById('stopLogs');
            if (stopLogs) {
                stopLogs.addEventListener('click', () => {
                    console.log('🔴 Botón stopLogs clickeado');
                    this.stopLogsStreaming();
                });
                console.log('✅ Event listener para stopLogs agregado');
            } else {
                console.warn('⚠️ Elemento stopLogs no encontrado');
            }

            const clearLogs = document.getElementById('clearLogs');
            if (clearLogs) {
                clearLogs.addEventListener('click', () => {
                    console.log('🗑️ Botón clearLogs clickeado');
                    this.clearLogs();
                });
                console.log('✅ Event listener para clearLogs agregado');
            } else {
                console.warn('⚠️ Elemento clearLogs no encontrado');
            }

            const removeDuplicates = document.getElementById('removeDuplicates');
            if (removeDuplicates) {
                removeDuplicates.addEventListener('click', () => {
                    console.log('🧹 Botón removeDuplicates clickeado');
                    this.removeDuplicateLogs();
                    this.showNotification('Duplicados eliminados', 'success');
                });
                console.log('✅ Event listener para removeDuplicates agregado');
            } else {
                console.warn('⚠️ Elemento removeDuplicates no encontrado');
            }
            
            // Event listeners para filtros de logs
            const logLevelFilter = document.getElementById('logLevelFilter');
            if (logLevelFilter) {
                logLevelFilter.addEventListener('change', () => {
                    console.log('🔍 Filtro de nivel cambiado:', logLevelFilter.value);
                    this.applyLogFilters();
                });
                console.log('✅ Event listener para logLevelFilter agregado');
            } else {
                console.warn('⚠️ Elemento logLevelFilter no encontrado');
            }
            
            const logTypeFilter = document.getElementById('logTypeFilter');
            if (logTypeFilter) {
                logTypeFilter.addEventListener('change', () => {
                    console.log('🔍 Filtro de tipo cambiado:', logTypeFilter.value);
                    this.applyLogFilters();
                });
                console.log('✅ Event listener para logTypeFilter agregado');
            } else {
                console.warn('⚠️ Elemento logTypeFilter no encontrado');
            }
            
            const logSearchFilter = document.getElementById('logSearchFilter');
            if (logSearchFilter) {
                logSearchFilter.addEventListener('input', () => {
                    console.log('🔍 Filtro de búsqueda cambiado:', logSearchFilter.value);
                    this.applyLogFilters();
                });
                console.log('✅ Event listener para logSearchFilter agregado');
            } else {
                console.warn('⚠️ Elemento logSearchFilter no encontrado');
            }
            
            // Event listener para auto-scroll
            const autoScroll = document.getElementById('autoScroll');
            if (autoScroll) {
                autoScroll.addEventListener('change', () => {
                    console.log('🔄 Auto-scroll cambiado:', autoScroll.checked);
                    // No necesitamos hacer nada especial aquí, se aplica en addLogEntry
                });
                console.log('✅ Event listener para autoScroll agregado');
            } else {
                console.warn('⚠️ Elemento autoScroll no encontrado');
            }

            const filterBrowserLogs = document.getElementById('filterBrowserLogs');
            if (filterBrowserLogs) {
                filterBrowserLogs.addEventListener('change', () => {
                    console.log('🔍 Filtro de logs del navegador cambiado:', filterBrowserLogs.checked);
                    // Aplicar filtros a los logs existentes
                    this.applyLogFilters();
                });
                console.log('✅ Event listener para filterBrowserLogs agregado');
            } else {
                console.warn('⚠️ Elemento filterBrowserLogs no encontrado');
            }

            // Botones de refresh
            const refreshLocations = document.getElementById('refreshLocations');
            console.log('🔍 Elemento refreshLocations encontrado:', refreshLocations);
            console.log('🔍 ID del elemento:', refreshLocations?.id);
            console.log('🔍 Clases del elemento:', refreshLocations?.className);
            console.log('🔍 Texto del elemento:', refreshLocations?.textContent);
            
            if (refreshLocations) {
                // Event listener principal
                refreshLocations.addEventListener('click', (event) => {
                    console.log('📍 Botón refreshLocations clickeado!');
                    console.log('📍 Evento:', event);
                    console.log('📍 Target:', event.target);
                    this.loadLocations();
                });
                
                            // Event listener adicional para debug
            refreshLocations.onclick = (event) => {
                console.log('📍 Botón refreshLocations onclick!');
                console.log('📍 Evento onclick:', event);
            };
            
            // ===== EVENT LISTENERS PARA FUNCIONALIDAD EMSP =====
            console.log('🔧 Configurando event listeners EMSP...');
            
            // Botones de refresh EMSP
            const refreshEmspLocations = document.getElementById('refreshEmspLocations');
            if (refreshEmspLocations) {
                refreshEmspLocations.addEventListener('click', () => {
                    console.log('📍 Botón refreshEmspLocations clickeado');
                    this.loadEmspLocations();
                });
                console.log('✅ Event listener para refreshEmspLocations agregado');
            } else {
                console.warn('⚠️ Elemento refreshEmspLocations no encontrado');
            }

            const refreshEmspEvses = document.getElementById('refreshEmspEvses');
            if (refreshEmspEvses) {
                refreshEmspEvses.addEventListener('click', () => {
                    console.log('📍 Botón refreshEmspEvses clickeado');
                    this.loadEmspEvses();
                });
                console.log('✅ Event listener para refreshEmspEvses agregado');
            } else {
                console.warn('⚠️ Elemento refreshEmspEvses no encontrado');
            }

            const refreshEmspTariffs = document.getElementById('refreshEmspTariffs');
            if (refreshEmspTariffs) {
                refreshEmspTariffs.addEventListener('click', () => {
                    console.log('📍 Botón refreshEmspTariffs clickeado');
                    this.loadEmspTariffs();
                });
                console.log('✅ Event listener para refreshEmspTariffs agregado');
            } else {
                console.warn('⚠️ Elemento refreshEmspTariffs no encontrado');
            }

            const emspLocationsPrevPage = document.getElementById('emspLocationsPrevPage');
            if (emspLocationsPrevPage) {
                emspLocationsPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Ext Locations clickeado');
                    this.goToEmspLocationsPrevPage();
                });
                console.log('✅ Event listener para emspLocationsPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento emspLocationsPrevPage no encontrado');
            }

            const emspLocationsNextPage = document.getElementById('emspLocationsNextPage');
            if (emspLocationsNextPage) {
                emspLocationsNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Ext Locations clickeado');
                    this.goToEmspLocationsNextPage();
                });
                console.log('✅ Event listener para emspLocationsNextPage agregado');
            } else {
                console.warn('⚠️ Elemento emspLocationsNextPage no encontrado');
            }

            const emspEvsesPrevPage = document.getElementById('emspEvsesPrevPage');
            if (emspEvsesPrevPage) {
                emspEvsesPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Ext EVSEs clickeado');
                    this.goToEmspEvsesPrevPage();
                });
                console.log('✅ Event listener para emspEvsesPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento emspEvsesPrevPage no encontrado');
            }

            const emspEvsesNextPage = document.getElementById('emspEvsesNextPage');
            if (emspEvsesNextPage) {
                emspEvsesNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Ext EVSEs clickeado');
                    this.goToEmspEvsesNextPage();
                });
                console.log('✅ Event listener para emspEvsesNextPage agregado');
            } else {
                console.warn('⚠️ Elemento emspEvsesNextPage no encontrado');
            }

            const emspTariffsPrevPage = document.getElementById('emspTariffsPrevPage');
            if (emspTariffsPrevPage) {
                emspTariffsPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Ext Tariffs clickeado');
                    this.goToEmspTariffsPrevPage();
                });
                console.log('✅ Event listener para emspTariffsPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento emspTariffsPrevPage no encontrado');
            }

            const emspTariffsNextPage = document.getElementById('emspTariffsNextPage');
            if (emspTariffsNextPage) {
                emspTariffsNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Ext Tariffs clickeado');
                    this.goToEmspTariffsNextPage();
                });
                console.log('✅ Event listener para emspTariffsNextPage agregado');
            } else {
                console.warn('⚠️ Elemento emspTariffsNextPage no encontrado');
            }

            const refreshTariffs = document.getElementById('refreshTariffs');
            if (refreshTariffs) {
                refreshTariffs.addEventListener('click', () => {
                    console.log('💰 Botón refreshTariffs clickeado');
                    this.loadTariffs();
                });
                console.log('✅ Event listener para refreshTariffs agregado');
            } else {
                console.warn('⚠️ Elemento refreshTariffs no encontrado');
            }

            const createTariffBtn = document.getElementById('createTariffBtn');
            if (createTariffBtn) {
                createTariffBtn.addEventListener('click', () => {
                    console.log('💰 Botón createTariffBtn clickeado');
                    this.showCreateTariffModal();
                });
                console.log('✅ Event listener para createTariffBtn agregado');
            } else {
                console.warn('⚠️ Elemento createTariffBtn no encontrado');
            }

            const createLocationBtn = document.getElementById('createLocationBtn');
            if (createLocationBtn) {
                createLocationBtn.addEventListener('click', () => {
                    console.log('📍 Botón createLocationBtn clickeado');
                    this.showCreateLocationModal();
                });
                console.log('✅ Event listener para createLocationBtn agregado');
            } else {
                console.warn('⚠️ Elemento createLocationBtn no encontrado');
            }

            // Event listener para filtro de búsqueda de Locations
            const locationSearchFilter = document.getElementById('locationSearchFilter');
            if (locationSearchFilter) {
                locationSearchFilter.addEventListener('input', () => {
                    console.log('🔍 Filtro de búsqueda Location cambiado:', locationSearchFilter.value);
                    this.applyLocationFilters();
                });
                console.log('✅ Event listener para locationSearchFilter agregado');
            } else {
                console.warn('⚠️ Elemento locationSearchFilter no encontrado');
            }

            const refreshEmspTokens = document.getElementById('refreshEmspTokens');
            if (refreshEmspTokens) {
                refreshEmspTokens.addEventListener('click', () => {
                    console.log('🔑 Botón refreshEmspTokens clickeado');
                    this.loadEmspTokens();
                });
                console.log('✅ Event listener para refreshEmspTokens agregado');
            } else {
                console.warn('⚠️ Elemento refreshEmspTokens no encontrado');
            }

            const emspTokensSearch = document.getElementById('emspTokensSearch');
            if (emspTokensSearch) {
                emspTokensSearch.addEventListener('input', () => {
                    this.emspTokensFilters.search = emspTokensSearch.value;
                    console.log('🔍 Búsqueda Ext Tokens actualizada:', this.emspTokensFilters.search);
                    this.applyEmspTokensFilters({ resetPage: true });
                });
                console.log('✅ Event listener para emspTokensSearch agregado');
            } else {
                console.warn('⚠️ Elemento emspTokensSearch no encontrado');
            }

            const emspTokensIssuerFilter = document.getElementById('emspTokensIssuerFilter');
            if (emspTokensIssuerFilter) {
                emspTokensIssuerFilter.addEventListener('change', () => {
                    this.emspTokensFilters.issuer = emspTokensIssuerFilter.value;
                    console.log('🏢 Filtro de emisor Ext Tokens cambiado:', this.emspTokensFilters.issuer || 'Todos');
                    this.applyEmspTokensFilters({ resetPage: true });
                });
                console.log('✅ Event listener para emspTokensIssuerFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspTokensIssuerFilter no encontrado');
            }

            const emspTokensTypeFilter = document.getElementById('emspTokensTypeFilter');
            if (emspTokensTypeFilter) {
                emspTokensTypeFilter.addEventListener('change', () => {
                    this.emspTokensFilters.type = emspTokensTypeFilter.value;
                    console.log('🏷️ Filtro de tipo Ext Tokens cambiado:', this.emspTokensFilters.type || 'Todos');
                    this.applyEmspTokensFilters({ resetPage: true });
                });
                console.log('✅ Event listener para emspTokensTypeFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspTokensTypeFilter no encontrado');
            }

            const emspTokensValidFilter = document.getElementById('emspTokensValidFilter');
            if (emspTokensValidFilter) {
                emspTokensValidFilter.addEventListener('change', () => {
                    this.emspTokensFilters.valid = emspTokensValidFilter.value;
                    console.log('✅ Filtro de válido Ext Tokens cambiado:', this.emspTokensFilters.valid || 'Todos');
                    this.applyEmspTokensFilters({ resetPage: true });
                });
                console.log('✅ Event listener para emspTokensValidFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspTokensValidFilter no encontrado');
            }

            const emspTokensWhitelistFilter = document.getElementById('emspTokensWhitelistFilter');
            if (emspTokensWhitelistFilter) {
                emspTokensWhitelistFilter.addEventListener('change', () => {
                    this.emspTokensFilters.whitelist = emspTokensWhitelistFilter.value;
                    console.log('📋 Filtro de whitelist Ext Tokens cambiado:', this.emspTokensFilters.whitelist || 'Todos');
                    this.applyEmspTokensFilters({ resetPage: true });
                });
                console.log('✅ Event listener para emspTokensWhitelistFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspTokensWhitelistFilter no encontrado');
            }

            const emspTokensPrevPage = document.getElementById('emspTokensPrevPage');
            if (emspTokensPrevPage) {
                emspTokensPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Ext Tokens clickeado');
                    this.goToEmspTokensPrevPage();
                });
                console.log('✅ Event listener para emspTokensPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento emspTokensPrevPage no encontrado');
            }

            const emspTokensNextPage = document.getElementById('emspTokensNextPage');
            if (emspTokensNextPage) {
                emspTokensNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Ext Tokens clickeado');
                    this.goToEmspTokensNextPage();
                });
                console.log('✅ Event listener para emspTokensNextPage agregado');
            } else {
                console.warn('⚠️ Elemento emspTokensNextPage no encontrado');
            }

            // Event listeners para Ext Sessions
            const refreshExtSessions = document.getElementById('refreshExtSessions');
            if (refreshExtSessions) {
                refreshExtSessions.addEventListener('click', () => {
                    console.log('☁️ Botón refreshExtSessions clickeado');
                    this.loadExtSessions();
                });
                console.log('✅ Event listener para refreshExtSessions agregado');
            } else {
                console.warn('⚠️ Elemento refreshExtSessions no encontrado');
            }

            const filterActiveExtSessions = document.getElementById('filterActiveExtSessions');
            if (filterActiveExtSessions) {
                filterActiveExtSessions.addEventListener('change', () => {
                    console.log('🔍 Filtro de sesiones externas activas cambiado:', filterActiveExtSessions.checked);
                    this.filterExtSessions();
                });
                console.log('✅ Event listener para filterActiveExtSessions agregado');
            } else {
                console.warn('⚠️ Elemento filterActiveExtSessions no encontrado');
            }

            const extSessionsSearch = document.getElementById('extSessionsSearch');
            if (extSessionsSearch) {
                if (this.extSessionsSearchQuery) {
                    extSessionsSearch.value = this.extSessionsSearchQuery;
                }
                extSessionsSearch.addEventListener('input', () => {
                    this.extSessionsSearchQuery = extSessionsSearch.value || '';
                    console.log('🔍 Búsqueda Ext Sessions actualizada:', this.extSessionsSearchQuery);
                    this.applyExtSessionsFilters({ resetPage: true });
                    this.updateExtSessionsCount();
                });
                console.log('✅ Event listener para extSessionsSearch agregado');
            } else {
                console.warn('⚠️ Elemento extSessionsSearch no encontrado');
            }

            const extSessionsPrevPage = document.getElementById('extSessionsPrevPage');
            if (extSessionsPrevPage) {
                extSessionsPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Ext Sessions clickeado');
                    this.goToExtSessionsPrevPage();
                });
                console.log('✅ Event listener para extSessionsPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento extSessionsPrevPage no encontrado');
            }

            const extSessionsNextPage = document.getElementById('extSessionsNextPage');
            if (extSessionsNextPage) {
                extSessionsNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Ext Sessions clickeado');
                    this.goToExtSessionsNextPage();
                });
                console.log('✅ Event listener para extSessionsNextPage agregado');
            } else {
                console.warn('⚠️ Elemento extSessionsNextPage no encontrado');
            }

            // Botones de acciones EMSP
            const getCpoVersions = document.getElementById('getCpoVersions');
            if (getCpoVersions) {
                getCpoVersions.addEventListener('click', () => {
                    console.log('🌐 Botón getCpoVersions clickeado');
                    this.getCpoVersions();
                });
                console.log('✅ Event listener para getCpoVersions agregado');
            } else {
                console.warn('⚠️ Elemento getCpoVersions no encontrado');
            }

            const getCpoDetails = document.getElementById('getCpoDetails');
            if (getCpoDetails) {
                getCpoDetails.addEventListener('click', () => {
                    console.log('🌐 Botón getCpoDetails clickeado');
                    this.getCpoDetails();
                });
                console.log('✅ Event listener para getCpoDetails agregado');
            } else {
                console.warn('⚠️ Elemento getCpoDetails no encontrado');
            }

            const getCpoLocations = document.getElementById('getCpoLocations');
            if (getCpoLocations) {
                getCpoLocations.addEventListener('click', () => {
                    console.log('🌐 Botón getCpoLocations clickeado');
                    this.getCpoLocations();
                });
                console.log('✅ Event listener para getCpoLocations agregado');
            } else {
                console.warn('⚠️ Elemento getCpoLocations no encontrado');
            }

            const getCpoSessions = document.getElementById('getCpoSessions');
            if (getCpoSessions) {
                getCpoSessions.addEventListener('click', () => {
                    console.log('🌐 Botón getCpoSessions clickeado');
                    this.getCpoSessions();
                });
                console.log('✅ Event listener para getCpoSessions agregado');
            } else {
                console.warn('⚠️ Elemento getCpoSessions no encontrado');
            }

            const getCpoTariffs = document.getElementById('getCpoTariffs');
            if (getCpoTariffs) {
                getCpoTariffs.addEventListener('click', () => {
                    console.log('🌐 Botón getCpoTariffs clickeado');
                    this.getCpoTariffs();
                });
                console.log('✅ Event listener para getCpoTariffs agregado');
            } else {
                console.warn('⚠️ Elemento getCpoTariffs no encontrado');
            }

            const getCpoTokens = document.getElementById('getCpoTokens');
            if (getCpoTokens) {
                getCpoTokens.addEventListener('click', () => {
                    console.log('🌐 Botón getCpoTokens clickeado');
                    this.getCpoTokens();
                });
                console.log('✅ Event listener para getCpoTokens agregado');
            } else {
                console.warn('⚠️ Elemento getCpoTokens no encontrado');
            }

            const startCpoCharging = document.getElementById('startCpoCharging');
            if (startCpoCharging) {
                startCpoCharging.addEventListener('click', () => {
                    console.log('⚡ Botón startCpoCharging clickeado');
                    this.handleChargingAction();
                });
                console.log('✅ Event listener para startCpoCharging agregado');
            } else {
                console.warn('⚠️ Elemento startCpoCharging no encontrado');
            }

            const stopCpoCharging = document.getElementById('stopCpoCharging');
            if (stopCpoCharging) {
                stopCpoCharging.addEventListener('click', () => {
                    console.log('🛑 Botón stopCpoCharging clickeado');
                    this.stopChargingSession();
                });
                console.log('✅ Event listener para stopCpoCharging agregado');
            } else {
                console.warn('⚠️ Elemento stopCpoCharging no encontrado');
            }

            const getCpoCdrs = document.getElementById('getCpoCdrs');
            if (getCpoCdrs) {
                getCpoCdrs.addEventListener('click', () => {
                    console.log('🧾 Botón getCpoCdrs clickeado');
                    this.getCpoCdrs();
                });
                console.log('✅ Event listener para getCpoCdrs agregado');
            } else {
                console.warn('⚠️ Elemento getCpoCdrs no encontrado');
            }

            const clearEmspData = document.getElementById('clearEmspData');
            if (clearEmspData) {
                clearEmspData.addEventListener('click', () => {
                    console.log('🧨 Botón clearEmspData clickeado');
                    this.clearEmspDataWithConfirmation();
                });
                console.log('✅ Event listener para clearEmspData agregado');
            } else {
                console.warn('⚠️ Elemento clearEmspData no encontrado');
            }

            // Event listeners para modal de recarga
            const clearChargingConsole = document.getElementById('clearChargingConsole');
            if (clearChargingConsole) {
                clearChargingConsole.addEventListener('click', () => {
                    console.log('🗑️ Botón clearChargingConsole clickeado');
                    this.clearChargingConsole();
                });
                console.log('✅ Event listener para clearChargingConsole agregado');
            } else {
                console.warn('⚠️ Elemento clearChargingConsole no encontrado');
            }

                    const refreshCpoEvses = document.getElementById('refreshCpoEvses');
        if (refreshCpoEvses) {
            refreshCpoEvses.addEventListener('click', () => {
                console.log('🔄 Botón refreshCpoEvses clickeado');
                this.loadCpoEvsesForCharging();
            });
            console.log('✅ Event listener para refreshCpoEvses agregado');
        } else {
            console.warn('⚠️ Elemento refreshCpoEvses no encontrado');
        }

        const clearCustomTokenBtn = document.getElementById('clearCustomTokenBtn');
        if (clearCustomTokenBtn) {
            clearCustomTokenBtn.addEventListener('click', () => {
                console.log('🧹 Botón clearCustomTokenBtn clickeado');
                const customTokenInput = document.getElementById('customTokenInput');
                if (customTokenInput) {
                    customTokenInput.value = '';
                    this.logToChargingConsole('🧹 Token personalizado limpiado, se usará token de la base de datos', 'token');
                }
            });
            console.log('✅ Event listener para clearCustomTokenBtn agregado');
        } else {
            console.warn('⚠️ Elemento clearCustomTokenBtn no encontrado');
        }

            const clearCpoResponse = document.getElementById('clearCpoResponse');
            if (clearCpoResponse) {
                clearCpoResponse.addEventListener('click', () => {
                    console.log('🗑️ Botón clearCpoResponse clickeado');
                    this.clearCpoResponse();
                });
                console.log('✅ Event listener para clearCpoResponse agregado');
            } else {
                console.warn('⚠️ Elemento clearCpoResponse no encontrado');
            }

            // Selector de conexión CPO
            const cpoConnection = document.getElementById('cpoConnection');
            if (cpoConnection) {
                cpoConnection.addEventListener('change', () => {
                    console.log('🔗 Selector de conexión CPO cambiado');
                    this.onCpoConnectionChange();
                });
                console.log('✅ Event listener para cpoConnection agregado');
            } else {
                console.warn('⚠️ Elemento cpoConnection no encontrado');
            }

            // Filtros EMSP
            const emspEvseStatusFilter = document.getElementById('emspEvseStatusFilter');
            if (emspEvseStatusFilter) {
                emspEvseStatusFilter.addEventListener('change', () => {
                    console.log('🔍 Filtro de estado EMSP EVSE cambiado:', emspEvseStatusFilter.value);
                    this.applyEmspEvseFilters({ resetPage: true });
                });
                console.log('✅ Event listener para emspEvseStatusFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspEvseStatusFilter no encontrado');
            }

            const emspEvsePartyFilter = document.getElementById('emspEvsePartyFilter');
            if (emspEvsePartyFilter) {
                emspEvsePartyFilter.addEventListener('change', () => {
                    console.log('🔍 Filtro de party EMSP EVSE cambiado:', emspEvsePartyFilter.value);
                    this.applyEmspEvseFilters({ resetPage: true });
                });
                console.log('✅ Event listener para emspEvsePartyFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspEvsePartyFilter no encontrado');
            }

            const emspEvseSearchFilter = document.getElementById('emspEvseSearchFilter');
            if (emspEvseSearchFilter) {
                emspEvseSearchFilter.addEventListener('input', () => {
                    console.log('🔍 Filtro de búsqueda EMSP EVSE cambiado:', emspEvseSearchFilter.value);
                    this.applyEmspEvseFilters({ resetPage: true });
                });
                console.log('✅ Event listener para emspEvseSearchFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspEvseSearchFilter no encontrado');
            }

            // Event listeners para filtros de EVSEs locales
            const evseStatusFilter = document.getElementById('evseStatusFilter');
            if (evseStatusFilter) {
                evseStatusFilter.addEventListener('change', () => {
                    console.log('🔍 Filtro de estado EVSE cambiado:', evseStatusFilter.value);
                    this.applyEvseFilters();
                });
                console.log('✅ Event listener para evseStatusFilter agregado');
            } else {
                console.warn('⚠️ Elemento evseStatusFilter no encontrado');
            }

            const evseSearchFilter = document.getElementById('evseSearchFilter');
            if (evseSearchFilter) {
                evseSearchFilter.addEventListener('input', () => {
                    console.log('🔍 Filtro de búsqueda EVSE cambiado:', evseSearchFilter.value);
                    this.applyEvseFilters();
                });
                console.log('✅ Event listener para evseSearchFilter agregado');
            } else {
                console.warn('⚠️ Elemento evseSearchFilter no encontrado');
            }
            

            console.log('✅ Event listeners EMSP configurados');
            
            // Event listeners para la pestaña Test
            this.setupTestEventListeners();
                            
                // Event listener directo en el DOM
                refreshLocations.addEventListener('mousedown', (event) => {
                    console.log('📍 Botón refreshLocations mousedown!');
                });
                
                refreshLocations.addEventListener('mouseup', (event) => {
                    console.log('📍 Botón refreshLocations mouseup!');
                });
                
                // Verificar que el botón no esté deshabilitado
                console.log('🔍 Botón deshabilitado:', refreshLocations.disabled);
                console.log('🔍 Botón visible:', refreshLocations.offsetParent !== null);
                console.log('🔍 Botón pointer-events:', window.getComputedStyle(refreshLocations).pointerEvents);
                console.log('🔍 Botón z-index:', window.getComputedStyle(refreshLocations).zIndex);
                console.log('🔍 Botón position:', window.getComputedStyle(refreshLocations).position);
                console.log('🔍 Botón display:', window.getComputedStyle(refreshLocations).display);
                
                // Verificar si hay elementos superpuestos
                const rect = refreshLocations.getBoundingClientRect();
                console.log('🔍 Posición del botón:', rect);
                
                // Verificar elementos en la misma posición
                const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
                console.log('🔍 Elementos en la posición del botón:', elementsAtPoint);
                
                            console.log('✅ Event listener para refreshLocations agregado');
            
            // Verificar si hay elementos superpuestos después de un delay
            setTimeout(() => {
                this.checkOverlappingElements(refreshLocations);
            }, 1000);
            
            // Verificar el estado del botón después de que se cargue todo
            setTimeout(() => {
                this.checkButtonState(refreshLocations);
            }, 2000);
            
        } else {
            console.warn('⚠️ Elemento refreshLocations no encontrado');
        }

            const refreshEvses = document.getElementById('refreshEvses');
            if (refreshEvses) {
                refreshEvses.addEventListener('click', () => {
                    console.log('🔌 Botón refreshEvses clickeado');
                    this.loadEvses();
                });
                console.log('✅ Event listener para refreshEvses agregado');
            } else {
                console.warn('⚠️ Elemento refreshEvses no encontrado');
            }

            const refreshConnections = document.getElementById('refreshConnections');
            if (refreshConnections) {
                refreshConnections.addEventListener('click', () => {
                    console.log('🔗 Botón refreshConnections clickeado');
                    this.loadConnections();
                });
                console.log('✅ Event listener para refreshConnections agregado');
            } else {
                console.warn('⚠️ Elemento refreshConnections no encontrado');
            }

            const refreshTokens = document.getElementById('refreshTokens');
            if (refreshTokens) {
                refreshTokens.addEventListener('click', () => {
                    console.log('🔑 Botón refreshTokens clickeado');
                    this.loadTokens();
                });
                console.log('✅ Event listener para refreshTokens agregado');
            } else {
                console.warn('⚠️ Elemento refreshTokens no encontrado');
            }

            const refreshSessions = document.getElementById('refreshSessions');
            if (refreshSessions) {
                refreshSessions.addEventListener('click', () => {
                    console.log('⚡ Botón refreshSessions clickeado');
                    this.loadSessions();
                });
                console.log('✅ Event listener para refreshSessions agregado');
            } else {
                console.warn('⚠️ Elemento refreshSessions no encontrado');
            }

            const filterActiveSessions = document.getElementById('filterActiveSessions');
            if (filterActiveSessions) {
                filterActiveSessions.addEventListener('change', () => {
                    console.log('🔍 Filtro de sesiones activas cambiado:', filterActiveSessions.checked);
                    this.filterSessions({ resetPage: true });
                });
                console.log('✅ Event listener para filterActiveSessions agregado');
            } else {
                console.warn('⚠️ Elemento filterActiveSessions no encontrado');
            }

            // Botón para crear token
            const createTokenBtn = document.getElementById('createTokenBtn');
            if (createTokenBtn) {
                createTokenBtn.addEventListener('click', () => {
                    console.log('🔑 Botón createTokenBtn clickeado');
                    this.showCreateTokenModal();
                });
                console.log('✅ Event listener para createTokenBtn agregado');
            } else {
                console.warn('⚠️ Elemento createTokenBtn no encontrado');
            }

            const tokensPrevPage = document.getElementById('tokensPrevPage');
            if (tokensPrevPage) {
                tokensPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Tokens clickeado');
                    this.goToTokensPrevPage();
                });
                console.log('✅ Event listener para tokensPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento tokensPrevPage no encontrado');
            }

            const tokensNextPage = document.getElementById('tokensNextPage');
            if (tokensNextPage) {
                tokensNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Tokens clickeado');
                    this.goToTokensNextPage();
                });
                console.log('✅ Event listener para tokensNextPage agregado');
            } else {
                console.warn('⚠️ Elemento tokensNextPage no encontrado');
            }

            // Event listeners para paginado de EVSEs
            const evsesPrevPage = document.getElementById('evsesPrevPage');
            if (evsesPrevPage) {
                evsesPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior EVSEs clickeado');
                    this.goToEvsesPrevPage();
                });
                console.log('✅ Event listener para evsesPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento evsesPrevPage no encontrado');
            }

            const evsesNextPage = document.getElementById('evsesNextPage');
            if (evsesNextPage) {
                evsesNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente EVSEs clickeado');
                    this.goToEvsesNextPage();
                });
                console.log('✅ Event listener para evsesNextPage agregado');
            } else {
                console.warn('⚠️ Elemento evsesNextPage no encontrado');
            }

            // Event listeners para paginado de Locations
            const locationsPrevPage = document.getElementById('locationsPrevPage');
            if (locationsPrevPage) {
                locationsPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Locations clickeado');
                    this.goToLocationsPrevPage();
                });
                console.log('✅ Event listener para locationsPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento locationsPrevPage no encontrado');
            }

            const locationsNextPage = document.getElementById('locationsNextPage');
            if (locationsNextPage) {
                locationsNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Locations clickeado');
                    this.goToLocationsNextPage();
                });
                console.log('✅ Event listener para locationsNextPage agregado');
            } else {
                console.warn('⚠️ Elemento locationsNextPage no encontrado');
            }

            const tariffsPrevPage = document.getElementById('tariffsPrevPage');
            if (tariffsPrevPage) {
                tariffsPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Tariffs clickeado');
                    this.goToTariffsPrevPage();
                });
                console.log('✅ Event listener para tariffsPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento tariffsPrevPage no encontrado');
            }

            const tariffsNextPage = document.getElementById('tariffsNextPage');
            if (tariffsNextPage) {
                tariffsNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Tariffs clickeado');
                    this.goToTariffsNextPage();
                });
                console.log('✅ Event listener para tariffsNextPage agregado');
            } else {
                console.warn('⚠️ Elemento tariffsNextPage no encontrado');
            }

            const sessionsPrevPage = document.getElementById('sessionsPrevPage');
            if (sessionsPrevPage) {
                sessionsPrevPage.addEventListener('click', () => {
                    console.log('⬅️ Botón página anterior Sessions clickeado');
                    this.goToSessionsPrevPage();
                });
                console.log('✅ Event listener para sessionsPrevPage agregado');
            } else {
                console.warn('⚠️ Elemento sessionsPrevPage no encontrado');
            }

            const sessionsNextPage = document.getElementById('sessionsNextPage');
            if (sessionsNextPage) {
                sessionsNextPage.addEventListener('click', () => {
                    console.log('➡️ Botón página siguiente Sessions clickeado');
                    this.goToSessionsNextPage();
                });
                console.log('✅ Event listener para sessionsNextPage agregado');
            } else {
                console.warn('⚠️ Elemento sessionsNextPage no encontrado');
            }

            // Tabs - Navegación manual (Bootstrap no funciona por CSP)
            const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
            console.log('📑 Tabs encontrados:', tabs.length);
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetTab = e.target.id.replace('-tab', '');
                    console.log('🔄 Tab clickeado:', targetTab);
                    this.switchToTab(targetTab);
                });
            });
            
            // Activar la pestaña Locations por defecto para que sea visible
            setTimeout(() => {
                this.activateLocationsTab();
            }, 500);

            console.log('✅ Todos los event listeners simples configurados');
            
            // Event listeners para el modal de creación de tarifas
            this.setupTariffModalEventListeners();
            
            // Event listeners para el modal de creación de tokens
            this.setupTokenModalEventListeners();
            
            // Event listeners para el modal de creación de locations
            this.setupLocationModalEventListeners();
            
            // Event listeners para botones de borrado de locations
            this.setupLocationDeleteEventListeners();
            
            // Event listeners para botones de edición de locations
            this.setupLocationEditEventListeners();
            
            // Event listeners del modal de edición de locations
            this.setupEditLocationModalEventListeners();
            
            // Event listeners para botones de creación de EVSEs
            this.setupEvseModalEventListeners();
            
            // Event listeners para botones de borrado de EVSEs
            this.setupEvseDeleteEventListeners();
            
            // Event listeners para botones de edición de EVSEs
            this.setupEvseEditEventListeners();
            
            // Event listeners para modal de edición de EVSEs
            this.setupEditEvseModalEventListeners();
            
            // ===== EVENT LISTENERS PARA HANDSHAKE OCPI =====
            console.log('🔧 Configurando event listeners para handshake OCPI...');
            
            // Botón para abrir modal de nueva conexión
            const initiateHandshakeBtn = document.getElementById('initiateHandshakeBtn');
            if (initiateHandshakeBtn) {
                initiateHandshakeBtn.addEventListener('click', () => {
                    console.log('🔗 Botón initiateHandshakeBtn clickeado');
                    this.showHandshakeModal();
                });
                console.log('✅ Event listener para initiateHandshakeBtn agregado');
            } else {
                console.warn('⚠️ Elemento initiateHandshakeBtn no encontrado');
            }
            
            // Formulario para conectar a organización externa (como EMSP)
            const connectToCpoForm = document.getElementById('connectToCpoForm');
            if (connectToCpoForm) {
                connectToCpoForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log('🔗 Formulario connectToCpoForm enviado');
                    this.handleConnectToExternalOrganization();
                });
                console.log('✅ Event listener para connectToCpoForm agregado');
            } else {
                console.warn('⚠️ Elemento connectToCpoForm no encontrado');
            }
            
            // Formulario para generar credenciales (como CPO)
            const generateCredentialsForm = document.getElementById('generateCredentialsForm');
            if (generateCredentialsForm) {
                generateCredentialsForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log('🔑 Formulario generateCredentialsForm enviado');
                    this.handleGenerateCredentials();
                });
                console.log('✅ Event listener para generateCredentialsForm agregado');
            } else {
                console.warn('⚠️ Elemento generateCredentialsForm no encontrado');
            }

            // Botón para eliminar conexiones seleccionadas
            const deleteConnectionBtn = document.getElementById('deleteConnectionBtn');
            if (deleteConnectionBtn) {
                deleteConnectionBtn.addEventListener('click', () => {
                    console.log('🗑️ Botón deleteConnectionBtn clickeado');
                    this.deleteSelectedConnections();
                });
                console.log('✅ Event listener para deleteConnectionBtn agregado');
            } else {
                console.warn('⚠️ Elemento deleteConnectionBtn no encontrado');
            }
        } catch (error) {
            console.error('❌ Error configurando event listeners simples:', error);
        }
    }

    // ===== FUNCIONES DE HANDSHAKE OCPI =====
    
    showHandshakeModal() {
        try {
            console.log('🔗 Mostrando modal de handshake...');
            const modal = new bootstrap.Modal(document.getElementById('handshakeModal'));
            modal.show();
            console.log('✅ Modal de handshake mostrado');
        } catch (error) {
            console.error('❌ Error mostrando modal de handshake:', error);
            this.showNotification('Error abriendo modal de conexión', 'error');
        }
    }

    async handleConnectToExternalOrganization() {
        try {
            console.log('🔗 Iniciando conexión a organización externa...');
            
            // Obtener datos del formulario
            const formData = {
                url: document.getElementById('cpoUrl').value,
                token: document.getElementById('cpoToken').value,
                partyId: document.getElementById('cpoPartyId').value,
                countryCode: document.getElementById('cpoCountryCode').value
            };
            
            console.log('📋 Datos del formulario:', formData);
            
            // Validar datos
            if (!formData.url || !formData.token || !formData.partyId || !formData.countryCode) {
                this.showNotification('Por favor, completa todos los campos', 'warning');
                return;
            }
            
            // Mostrar loading
            this.showNotification('Conectando a organización externa...', 'info');
            
            // Llamar a la API
            const response = await fetch('/api/handshake/connect-to-organization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Conexión exitosa:', result);
                this.showNotification('Conexión establecida exitosamente', 'success');
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('handshakeModal'));
                if (modal) modal.hide();
                
                // Limpiar formulario
                document.getElementById('connectToCpoForm').reset();
                
                // Recargar conexiones
                this.loadConnections();
            } else {
                console.error('❌ Error en conexión:', result);
                this.showNotification(`Error: ${result.status_message || 'Error desconocido'}`, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error conectando a organización externa:', error);
            this.showNotification('Error de conexión: ' + error.message, 'error');
        }
    }

    async handleGenerateCredentials() {
        try {
            console.log('🔑 Generando credenciales para organización externa...');
            
            // Obtener datos del formulario
            const formData = {
                partyId: document.getElementById('emspPartyId').value,
                countryCode: document.getElementById('emspCountryCode').value,
                url: document.getElementById('emspUrl').value
            };
            
            console.log('📋 Datos del formulario:', formData);
            
            // Validar datos
            if (!formData.partyId || !formData.countryCode || !formData.url) {
                this.showNotification('Por favor, completa todos los campos', 'warning');
                return;
            }
            
            // Mostrar loading
            this.showNotification('Generando credenciales...', 'info');
            
            // Llamar a la API
            const response = await fetch('/api/handshake/generate-credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Credenciales generadas:', result);
                this.showNotification('Credenciales generadas exitosamente', 'success');
                
                // Mostrar credenciales generadas
                this.showGeneratedCredentials(result.data);
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('handshakeModal'));
                if (modal) modal.hide();
                
                // Limpiar formulario
                document.getElementById('generateCredentialsForm').reset();
                
                // Recargar conexiones
                this.loadConnections();
            } else {
                console.error('❌ Error generando credenciales:', result);
                this.showNotification(`Error: ${result.status_message || 'Error desconocido'}`, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error generando credenciales:', error);
            this.showNotification('Error generando credenciales: ' + error.message, 'error');
        }
    }

    showGeneratedCredentials(credentials) {
        try {
            console.log('🔑 Mostrando credenciales generadas:', credentials);
            
            // Extraer datos de la respuesta
            const ourCredentials = credentials.our_credentials || {};
            const externalOrg = credentials.external_organization || {};
            const instructions = credentials.instructions || {};
            
            // Formatear instrucciones
            let instructionsText = '';
            if (typeof instructions === 'string') {
                instructionsText = instructions;
            } else if (instructions.message) {
                instructionsText = instructions.message;
                if (instructions.next_step) {
                    instructionsText += ` ${instructions.next_step}`;
                }
            } else {
                instructionsText = 'Use the provided token to initiate handshake with the external organization';
            }
            
            // Crear modal para mostrar credenciales
            const credentialsModal = document.createElement('div');
            credentialsModal.className = 'modal fade';
            credentialsModal.id = 'credentialsModal';
            credentialsModal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-key"></i> Credenciales Generadas
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle"></i>
                                <strong>Instrucciones:</strong> ${instructionsText}
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Credenciales para la Organización Externa:</h6>
                                    <div class="mb-3">
                                        <label class="form-label"><strong>URL:</strong></label>
                                        <input type="text" class="form-control" value="${ourCredentials.url || 'N/A'}" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label"><strong>Token:</strong></label>
                                        <input type="text" class="form-control" value="${ourCredentials.token || 'N/A'}" readonly>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>Información de la Organización:</h6>
                                    <div class="mb-3">
                                        <label class="form-label"><strong>Party ID:</strong></label>
                                        <input type="text" class="form-control" value="${externalOrg.party_id || 'N/A'}" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label"><strong>País:</strong></label>
                                        <input type="text" class="form-control" value="${externalOrg.country_code || 'N/A'}" readonly>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary" onclick="navigator.clipboard.writeText('${ourCredentials.token || ''}')">
                                <i class="bi bi-clipboard"></i> Copiar Token
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(credentialsModal);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(credentialsModal);
            modal.show();
            
            // Limpiar modal cuando se cierre
            credentialsModal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(credentialsModal);
            });
            
            console.log('✅ Modal de credenciales mostrado');
            
        } catch (error) {
            console.error('❌ Error mostrando credenciales:', error);
            this.showNotification('Error mostrando credenciales: ' + error.message, 'error');
        }
    }

    switchToTab(targetTabName) {
        try {
            console.log(`🔄 Cambiando a pestaña: ${targetTabName}`);
            
            // Remover clases activas de todas las pestañas
            document.querySelectorAll('.nav-link').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-pane').forEach(content => {
                content.classList.remove('show', 'active');
                content.style.display = 'none';
            });
            
            // Activar la pestaña seleccionada
            const targetTab = document.getElementById(`${targetTabName}-tab`);
            const targetContent = document.getElementById(targetTabName);
            
            if (targetTab && targetContent) {
                targetTab.classList.add('active');
                targetContent.classList.add('show', 'active');
                targetContent.style.display = 'block';
                
                this.currentTab = targetTabName;
                console.log(`✅ Pestaña ${targetTabName} activada`);
                
                // Cargar datos de la pestaña activada
                this.loadTabData(targetTabName);
                
            } else {
                console.warn(`⚠️ No se encontraron elementos de la pestaña ${targetTabName}`);
            }
            
        } catch (error) {
            console.error(`❌ Error cambiando a pestaña ${targetTabName}:`, error);
        }
    }

    activateLocationsTab() {
        try {
            console.log('🔄 Activando pestaña Locations...');
            
            // Obtener la pestaña y el contenido
            const locationsTab = document.getElementById('locations-tab');
            const locationsContent = document.getElementById('locations');
            
            if (locationsTab && locationsContent) {
                // Remover clases activas de todas las pestañas
                document.querySelectorAll('.nav-link').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelectorAll('.tab-pane').forEach(content => {
                    content.classList.remove('show', 'active');
                    content.style.display = 'none';
                });
                
                // Activar la pestaña Locations
                locationsTab.classList.add('active');
                locationsContent.classList.add('show', 'active');
                locationsContent.style.display = 'block';
                
                console.log('✅ Pestaña Locations activada');
                
                // Verificar que el botón ahora sea visible
                setTimeout(() => {
                    const refreshButton = document.getElementById('refreshLocations');
                    if (refreshButton) {
                        const rect = refreshButton.getBoundingClientRect();
                        console.log('🔍 Botón después de activar tab:', {
                            width: rect.width,
                            height: rect.height,
                            visible: rect.width > 0 && rect.height > 0
                        });
                    }
                }, 100);
                
            } else {
                console.warn('⚠️ No se encontraron elementos de la pestaña Locations');
            }
            
        } catch (error) {
            console.error('❌ Error activando pestaña Locations:', error);
        }
    }

    checkOverlappingElements(button) {
        try {
            console.log('🔍 Verificando elementos superpuestos...');
            
            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Verificar elementos en el centro del botón
            const elementsAtCenter = document.elementsFromPoint(centerX, centerY);
            console.log('🔍 Elementos en el centro del botón:', elementsAtCenter);
            
            // Verificar si el botón está en la primera posición
            if (elementsAtCenter[0] === button) {
                console.log('✅ El botón está en la primera posición (no hay elementos superpuestos)');
            } else {
                console.log('⚠️ Elementos superpuestos detectados:');
                elementsAtCenter.forEach((element, index) => {
                    console.log(`  ${index}: ${element.tagName} - ${element.id || element.className}`);
                });
            }
            
            // Verificar si hay algún elemento invisible bloqueando
            const blockingElements = elementsAtCenter.filter(el => {
                const style = window.getComputedStyle(el);
                return style.pointerEvents === 'none' || 
                       style.display === 'none' || 
                       style.visibility === 'hidden' ||
                       el.offsetParent === null;
            });
            
            if (blockingElements.length > 0) {
                console.log('⚠️ Elementos bloqueantes detectados:', blockingElements);
            }
            
        } catch (error) {
            console.error('❌ Error verificando elementos superpuestos:', error);
        }
    }

    checkButtonState(button) {
        try {
            console.log('🔍 Verificando estado completo del botón...');
            
            // Verificar dimensiones
            const rect = button.getBoundingClientRect();
            console.log('🔍 Dimensiones del botón:', {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                bottom: rect.bottom,
                right: rect.right
            });
            
            // Verificar estilos computados
            const style = window.getComputedStyle(button);
            console.log('🔍 Estilos del botón:', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                position: style.position,
                zIndex: style.zIndex,
                pointerEvents: style.pointerEvents,
                overflow: style.overflow
            });
            
            // Verificar si está en el viewport
            const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                                rect.bottom <= window.innerHeight && 
                                rect.right <= window.innerWidth;
            console.log('🔍 Botón en viewport:', isInViewport);
            
            // Verificar parent containers
            let parent = button.parentElement;
            let level = 0;
            while (parent && level < 5) {
                const parentStyle = window.getComputedStyle(parent);
                console.log(`🔍 Parent ${level}:`, {
                    tag: parent.tagName,
                    id: parent.id,
                    class: parent.className,
                    display: parentStyle.display,
                    visibility: parentStyle.visibility,
                    overflow: parentStyle.overflow
                });
                parent = parent.parentElement;
                level++;
            }
            
        } catch (error) {
            console.error('❌ Error verificando estado del botón:', error);
        }
    }

    loadTabData(tabName) {
        try {
            console.log(`📊 Cargando datos para pestaña: ${tabName}`);
            
            switch (tabName) {
                case 'locations':
                    this.loadLocations();
                    break;
                case 'evses':
                    this.loadEvses();
                    break;
                case 'connections':
                    this.loadConnections();
                    break;
                case 'tokens':
                    this.loadTokens();
                    break;
                case 'sessions':
                    this.loadSessions();
                    break;
                case 'logs':
                    console.log('📝 Pestaña de logs - no requiere carga de datos');
                    break;
                case 'emsp-locations':
                    this.loadEmspLocations();
                    break;
                case 'emsp-evses':
                    this.loadEmspEvses();
                    break;
                case 'emsp-tariffs':
                    this.loadEmspTariffs();
                    break;
                case 'tariffs':
                    this.loadTariffs();
                    break;
                case 'emsp-sessions':
                    console.log('📝 Pestaña de EMSP sessions - no requiere carga de datos');
                    break;
                case 'emsp-cdrs':
                    console.log('📝 Pestaña de EMSP CDRs - no requiere carga de datos');
                    break;
                case 'emsp-tokens':
                    this.loadEmspTokens(); // Cargar tokens de EMSP específicamente
                    break;
                case 'ext-sessions':
                    this.loadExtSessions(); // Cargar sesiones externas
                    break;
                case 'emsp-contracts':
                    console.log('📝 Pestaña de EMSP contracts - no requiere carga de datos');
                    break;
                case 'emsp-actions':
                    console.log('📝 Pestaña de EMSP actions - no requiere carga de datos');
                    break;
                case 'test':
                    this.loadTestData();
                    break;
                default:
                    console.log(`⚠️ Pestaña desconocida: ${tabName}`);
            }
            
        } catch (error) {
            console.error(`❌ Error cargando datos para pestaña ${tabName}:`, error);
        }
    }

    async updateConnectionStatus() {
        try {
            console.log('🔍 Verificando estado de conexión...');
            const response = await fetch(`${this.baseUrl}/health`);
            const isConnected = response.ok;
            
            const statusElement = document.getElementById('connection-status');
            if (statusElement) {
                if (isConnected) {
                    statusElement.textContent = 'Conectado';
                    console.log('✅ Estado: Conectado');
                } else {
                    statusElement.textContent = 'Desconectado';
                    console.log('❌ Estado: Desconectado');
                }
            } else {
                console.warn('⚠️ Elemento connection-status no encontrado');
            }
        } catch (error) {
            console.error('❌ Error verificando conexión:', error);
            const statusElement = document.getElementById('connection-status');
            if (statusElement) {
                statusElement.textContent = 'Error de conexión';
            }
        }
    }

    // ===== GESTIÓN DE LOGS =====
    startLogsStreaming() {
        if (this.logsStreaming) return;

        try {
            console.log('🟢 Iniciando streaming de logs...');
            this.logsEventSource = new EventSource(`${this.baseUrl}/logs/stream`);
            
            this.logsEventSource.onopen = (event) => {
                console.log('✅ EventSource conectado correctamente');
                console.log('✅ Estado del EventSource:', this.logsEventSource.readyState);
            };

            this.logsEventSource.onmessage = (event) => {
                console.log('📨 Mensaje SSE recibido:', event.data);
                try {
                    const logData = JSON.parse(event.data);
                    console.log('📨 Datos parseados:', logData);
                    this.addLogEntry(logData);
                } catch (error) {
                    console.error('❌ Error parseando mensaje SSE:', error, 'Data:', event.data);
                }
            };

            this.logsEventSource.onerror = (error) => {
                console.error('❌ Error en EventSource:', error);
                console.error('❌ Estado del EventSource:', this.logsEventSource.readyState);
                console.error('❌ URL del EventSource:', this.logsEventSource.url);
                this.showNotification('Error en la conexión de logs', 'error');
                this.stopLogsStreaming();
            };

            this.logsEventSource.onopen = () => {
                console.log('✅ Conexión de logs establecida');
                this.logsStreaming = true;
                document.getElementById('startLogs').disabled = true;
                document.getElementById('stopLogs').disabled = false;
                this.showNotification('Streaming de logs iniciado', 'success');
            };
            
            // Verificar el estado después de 5 segundos
            setTimeout(() => {
                if (this.logsEventSource && this.logsEventSource.readyState === 2) {
                    console.log('⚠️ EventSource se cerró inesperadamente - iniciando polling seguro...');
                    this.startSafePolling();
                } else if (this.logsEventSource && this.logsEventSource.readyState === 0) {
                    console.log('⚠️ EventSource aún conectando después de 5 segundos - iniciando polling seguro...');
                    this.logsEventSource.close();
                    this.startSafePolling();
                }
            }, 5000);

        } catch (error) {
            console.error('❌ Error al iniciar streaming:', error);
            this.showNotification('Error al iniciar streaming', 'error');
        }
    }

    stopLogsStreaming() {
        if (this.logsEventSource) {
            this.logsEventSource.close();
            this.logsEventSource = null;
        }
        
        // Detener polling seguro si está activo
        this.stopSafePolling();
        
        this.logsStreaming = false;
        document.getElementById('startLogs').disabled = false;
        document.getElementById('stopLogs').disabled = true;
        
        this.showNotification('Streaming de logs detenido', 'info');
        console.log('🔴 Streaming de logs detenido');
    }
    
    // Función para iniciar polling seguro (cada 10 segundos)
    startSafePolling() {
        console.log('🔄 Iniciando polling seguro cada 10 segundos...');
        
        // Limpiar logs existentes
        this.clearLogs();
        
        // Función para hacer polling
        const pollLogs = async () => {
            try {
                console.log('📡 Haciendo polling seguro a /logs/recent...');
                const response = await fetch('/logs/recent');
                
                if (response.ok) {
                    const logs = await response.json();
                    console.log('✅ Logs recibidos del backend:', logs.data?.length || 0);
                    
                    if (logs.data && Array.isArray(logs.data)) {
                        logs.data.forEach(log => {
                            this.addLogEntry(log);
                        });
                    }
                } else {
                    console.log('⚠️ Error en polling seguro:', response.status);
                }
            } catch (error) {
                console.log('❌ Error en polling seguro:', error.message);
            }
        };
        
        // Hacer polling inmediatamente
        pollLogs();
        
        // Hacer polling cada 10 segundos (más seguro que 3 segundos)
        const pollInterval = setInterval(pollLogs, 10000);
        
        // Guardar el intervalo para poder detenerlo
        this.safePollInterval = pollInterval;
        
        console.log('✅ Polling seguro iniciado cada 10 segundos');
    }
    
    // Función para detener polling seguro
    stopSafePolling() {
        if (this.safePollInterval) {
            clearInterval(this.safePollInterval);
            this.safePollInterval = null;
            console.log('🛑 Polling seguro detenido');
        }
    }

    shouldFilterLog(logData) {
        // Verificar si el filtro de logs del navegador está activo
        const filterBrowserLogs = document.getElementById('filterBrowserLogs');
        if (!filterBrowserLogs || !filterBrowserLogs.checked) {
            return false; // No filtrar si el checkbox está desmarcado
        }
        
        // Filtrar logs de peticiones HTTP del navegador
        const message = logData.message || '';
        
        // Patrones a filtrar (solo logs del navegador, no logs de API importantes)
        const filterPatterns = [
            /Mozilla\/5\.0/,
            /Chrome\/\d+/,
            /Safari\/\d+/,
            /AppleWebKit/,
            /DELETE \/api\/delete-connection/,
            /GET \/api\/connections/,
            /GET \/api\/config/,
            /GET \/health/,
            /GET \/styles\.css/,
            /GET \/bootstrap\.bundle\.min\.js/,
            /GET \/app\.js/,
            /GET \/sparkle\.png/,
            /GET \/easter-egg\.js/,
            /::ffff:172\.18\.0\.1.*HTTP\/1\.1.*200.*Mozilla/,
            /::ffff:172\.18\.0\.1.*HTTP\/1\.1.*304.*Mozilla/
        ];
        
        // Verificar si el mensaje coincide con algún patrón de filtro
        return filterPatterns.some(pattern => pattern.test(message));
    }

    sortLogsByTimestamp() {
        const container = document.getElementById('logsContainer');
        if (!container) return;
        
        const entries = Array.from(container.querySelectorAll('.log-entry'));
        
        // Ordenar por timestamp (más reciente primero)
        entries.sort((a, b) => {
            const timestampA = a.querySelector('.log-timestamp')?.textContent || '';
            const timestampB = b.querySelector('.log-timestamp')?.textContent || '';
            
            // Si los timestamps son iguales, mantener el orden original
            if (timestampA === timestampB) {
                return 0;
            }
            
            // Convertir timestamps a Date para comparar
            const dateA = new Date(timestampA);
            const dateB = new Date(timestampB);
            
            // Si alguno de los timestamps es inválido, mantener el orden original
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return 0;
            }
            
            return dateB - dateA; // Orden descendente (más reciente primero)
        });
        
        // Reordenar en el DOM
        entries.forEach(entry => {
            container.appendChild(entry);
        });
    }

    isDuplicateLog(logData) {
        const container = document.getElementById('logsContainer');
        if (!container) return false;
        
        const message = logData.message || JSON.stringify(logData);
        const timestamp = logData.timestamp || new Date().toISOString();
        
        // Buscar logs existentes con el mismo mensaje
        const existingEntries = container.querySelectorAll('.log-entry');
        for (let entry of existingEntries) {
            const existingMessage = entry.querySelector('.log-message')?.textContent || '';
            
            // Comparar mensajes más estrictamente
            if (this.areMessagesSimilar(message, existingMessage)) {
                return true;
            }
        }
        
        return false;
    }

    areMessagesSimilar(msg1, msg2) {
        // Normalizar mensajes para comparación
        const normalize = (msg) => msg.toLowerCase().replace(/\s+/g, ' ').trim();
        const norm1 = normalize(msg1);
        const norm2 = normalize(msg2);
        
        // Si son exactamente iguales
        if (norm1 === norm2) return true;
        
        // Si uno contiene al otro (para mensajes truncados)
        if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
        
        // Si comparten más del 80% de caracteres
        const longer = norm1.length > norm2.length ? norm1 : norm2;
        const shorter = norm1.length > norm2.length ? norm2 : norm1;
        
        if (shorter.length === 0) return false;
        
        let matches = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (longer.includes(shorter[i])) matches++;
        }
        
        return (matches / shorter.length) > 0.8;
    }

    formatApiLog(logData) {
        // Los datos están en logData.meta (segundo parámetro del logger.info)
        const meta = logData.meta || {};
        const method = meta.method || 'UNKNOWN';
        const path = meta.path || meta.url || 'unknown';
        const statusCode = meta.statusCode || 'unknown';
        const responseTime = meta.responseTime || 'unknown';
        
        
        // Usar la URL completa si está disponible, sino usar el path
        const displayUrl = meta.url || path;
        
        let formatted = `<strong>${method} ${displayUrl}</strong> - ${statusCode} (${responseTime})`;
        
        // Añadir detalles del request body si existe
        if (meta.requestBody) {
            const requestBodyStr = typeof meta.requestBody === 'string' 
                ? meta.requestBody 
                : JSON.stringify(meta.requestBody, null, 2);
            formatted += `<br><details><summary>📥 Request Body</summary><pre>${this.escapeHtml(requestBodyStr)}</pre></details>`;
        }
        
        // Añadir detalles del response body si existe
        if (meta.responseBody) {
            const responseBodyStr = typeof meta.responseBody === 'string' 
                ? meta.responseBody 
                : JSON.stringify(meta.responseBody, null, 2);
            formatted += `<br><details><summary>📤 Response Body</summary><pre>${this.escapeHtml(responseBodyStr)}</pre></details>`;
        }
        
        // Añadir headers si existen
        if (meta.requestHeaders && Object.keys(meta.requestHeaders).length > 0) {
            formatted += `<br><details><summary>📋 Request Headers</summary><pre>${this.escapeHtml(JSON.stringify(meta.requestHeaders, null, 2))}</pre></details>`;
        }
        
        return formatted;
    }

    addLogEntry(logData) {
        console.log('📝 Nuevo log recibido:', logData);
        
        // Filtrar logs de ping y heartbeat
        if (logData.type === 'ping' || logData.type === 'heartbeat') {
            console.log('🚫 Log filtrado (ping/heartbeat)');
            return;
        }
        
        // Filtrar logs de peticiones HTTP del navegador
        if (this.shouldFilterLog(logData)) {
            console.log('🚫 Log filtrado (petición del navegador)');
            return;
        }
        
        const container = document.getElementById('logsContainer');
        if (!container) return;

        // Verificar si ya existe un log similar para evitar duplicados
        // TEMPORALMENTE DESHABILITADO para permitir logs de carga
        // if (this.isDuplicateLog(logData)) {
        //     console.log('🚫 Log duplicado, omitiendo');
        //     return;
        // }

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry fade-in';
        
        // Manejar diferentes tipos de logs
        let timestamp, level, message, source;
        
        if (logData.type === 'charging_log') {
            // Log de recarga - usar timestamp del log
            timestamp = logData.timestamp || new Date().toLocaleTimeString();
            level = logData.level || 'INFO';
            message = logData.message || JSON.stringify(logData);
            source = 'charging';
        } else {
            // Log normal del sistema
            timestamp = new Date(logData.timestamp || Date.now()).toLocaleTimeString();
            level = logData.level || 'INFO';
            
            // Formatear mensaje según el tipo de log
            if (logData.message && logData.message.includes('🌐')) {
                // Log de API detallado - usar los metadatos del log
                message = this.formatApiLog(logData);
                source = 'api';
            } else {
                message = logData.message || JSON.stringify(logData);
                source = logData.source || 'system';
            }
        }
        
        // Aplicar clase CSS según el tipo de log
        const logClass = source === 'charging' ? 'charging-log' : 
                        source === 'api' ? 'api-log' : 'system-log';
        
        logEntry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-level ${level.toLowerCase()}">${level}</span>
            <span class="log-source ${logClass}">[${source.toUpperCase()}]</span>
            <span class="log-message">${source === 'api' ? message : this.escapeHtml(message)}</span>
        `;
        
        container.insertBefore(logEntry, container.firstChild);
        
        // Limitar logs a 100 entradas
        const entries = container.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[entries.length - 1].remove();
        }
        
        // Solo ordenar ocasionalmente para mantener el orden
        if (entries.length % 10 === 0) {
            this.sortLogsByTimestamp();
        }
        
        // Auto-scroll si está habilitado
        const autoScroll = document.getElementById('autoScroll');
        if (autoScroll && autoScroll.checked) {
            container.scrollTop = 0;
        }
        
        // Aplicar filtros si hay alguno activo
        const levelFilter = document.getElementById('logLevelFilter')?.value || '';
        const typeFilter = document.getElementById('logTypeFilter')?.value || '';
        const searchFilter = document.getElementById('logSearchFilter')?.value || '';
        
        if (levelFilter || typeFilter || searchFilter) {
            // Aplicar filtros solo al nuevo log
            setTimeout(() => this.applyLogFilters(), 100);
        }
    }

    removeDuplicateLogs() {
        const container = document.getElementById('logsContainer');
        if (!container) return;
        
        const entries = Array.from(container.querySelectorAll('.log-entry'));
        const seenMessages = new Set();
        let removedCount = 0;
        
        entries.forEach(entry => {
            const message = entry.querySelector('.log-message')?.textContent || '';
            const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ').trim();
            
            if (seenMessages.has(normalizedMessage)) {
                entry.remove();
                removedCount++;
            } else {
                seenMessages.add(normalizedMessage);
            }
        });
        
        if (removedCount > 0) {
            console.log(`🧹 Eliminados ${removedCount} logs duplicados`);
        }
    }

    clearLogs() {
        const container = document.getElementById('logsContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-terminal display-4"></i>
                    <p class="mt-2">Los logs aparecerán aquí cuando se inicie el streaming</p>
                </div>
            `;
        }
        this.showNotification('Logs limpiados', 'info');
        console.log('🗑️ Logs limpiados');
    }
    
    // Función para aplicar filtros a los logs
    applyLogFilters() {
        console.log('🔍 Aplicando filtros de logs...');
        
        const levelFilter = document.getElementById('logLevelFilter')?.value || '';
        const typeFilter = document.getElementById('logTypeFilter')?.value || '';
        const searchFilter = document.getElementById('logSearchFilter')?.value || '';
        const filterBrowserLogs = document.getElementById('filterBrowserLogs')?.checked || false;
        
        console.log('📊 Filtros activos:', { levelFilter, typeFilter, searchFilter, filterBrowserLogs });
        
        const logEntries = document.querySelectorAll('#logsContainer .log-entry');
        let visibleCount = 0;
        
        logEntries.forEach(entry => {
            const level = entry.querySelector('.log-level')?.textContent || '';
            const message = entry.querySelector('.log-message')?.textContent || '';
            const source = entry.querySelector('.log-source')?.textContent || '';
            
            // Aplicar filtro de logs del navegador
            let browserMatch = true;
            if (filterBrowserLogs) {
                const logData = { message: message };
                if (this.shouldFilterLog(logData)) {
                    browserMatch = false;
                }
            }
            
            // Aplicar filtro de nivel
            let levelMatch = true;
            if (levelFilter && level !== levelFilter) {
                levelMatch = false;
            }
            
            // Aplicar filtro de tipo (basado en el mensaje y fuente)
            let typeMatch = true;
            if (typeFilter) {
                const messageUpper = message.toUpperCase();
                const sourceUpper = source.toUpperCase();
                
                if (typeFilter === 'Charging' && !sourceUpper.includes('CHARGING')) typeMatch = false;
                else if (typeFilter === 'System' && !sourceUpper.includes('SYSTEM')) typeMatch = false;
                else if (typeFilter === 'API' && !messageUpper.includes('API')) typeMatch = false;
                else if (typeFilter === 'OCPI' && !messageUpper.includes('OCPI')) typeMatch = false;
                else if (typeFilter === 'Database' && !messageUpper.includes('DATABASE') && !messageUpper.includes('DB')) typeMatch = false;
                else if (typeFilter === 'Notification' && !messageUpper.includes('NOTIFICATION') && !messageUpper.includes('NOTIFY')) typeMatch = false;
            }
            
            // Aplicar filtro de búsqueda
            let searchMatch = true;
            if (searchFilter) {
                const searchUpper = searchFilter.toUpperCase();
                const messageUpper = message.toUpperCase();
                const levelUpper = level.toUpperCase();
                if (!messageUpper.includes(searchUpper) && !levelUpper.includes(searchUpper)) {
                    searchMatch = false;
                }
            }
            
            // Mostrar/ocultar entrada según filtros
            if (browserMatch && levelMatch && typeMatch && searchMatch) {
                entry.style.display = 'block';
                visibleCount++;
            } else {
                entry.style.display = 'none';
            }
        });
        
        console.log(`✅ Filtros aplicados: ${visibleCount}/${logEntries.length} logs visibles`);
        
        // Mostrar contador de logs filtrados
        this.updateFilteredLogsCount(visibleCount, logEntries.length);
    }
    
    // Función para actualizar contador de logs filtrados
    updateFilteredLogsCount(visible, total) {
        const container = document.getElementById('logsContainer');
        if (!container) return;
        
        // Buscar o crear contador de logs filtrados
        let counter = container.querySelector('.filtered-logs-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'filtered-logs-counter text-muted small mb-2';
            container.insertBefore(counter, container.firstChild);
        }
        
        if (visible === total) {
            counter.textContent = `Mostrando todos los logs (${total})`;
        } else {
            counter.textContent = `Mostrando ${visible} de ${total} logs`;
        }
    }

    // ===== CARGA DE DATOS =====
    async loadLocations() {
        try {
            console.log('🔄 Cargando locations...');
            
            // Cargar todas las locations haciendo múltiples peticiones
            this.allLocations = [];
            let offset = 0;
            const limit = 1000;
            let hasMore = true;
            
            while (hasMore) {
                const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations?offset=${offset}&limit=${limit}`, {
                    headers: { 
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                    }
                });
                
                console.log(`📡 Response status (offset ${offset}):`, response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Response error:', errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                const locations = data.data || [];
                
                this.allLocations = this.allLocations.concat(locations);
                
                console.log(`📊 Cargadas ${locations.length} locations (total: ${this.allLocations.length})`);
                
                // Verificar si hay más datos
                hasMore = locations.length === limit;
                offset += limit;
            }
            
            // Configurar paginado
            this.currentLocationsPage = 1;
            this.locationsPerPage = 50;
            
            this.renderLocationsPage();
            this.updateCount('locationsCount', this.allLocations.length);
            
            console.log(`✅ ${this.allLocations.length} locations cargadas exitosamente`);
            
        } catch (error) {
            console.error('❌ Error cargando locations:', error);
            this.showTableError('locationsTableBody', `Error al cargar locations: ${error.message}`);
        }
    }

    renderLocations(locations) {
        const tbody = document.getElementById('locationsTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento locationsTableBody no encontrado');
            return;
        }
        
        if (locations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay locations disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = locations.map(location => `
            <tr class="fade-in" data-location-id="${location.id}">
                <td><code>${location.id}</code></td>
                <td>
                    <span class="location-name-tooltip" 
                          data-location-id="${location.id}"
                          data-tooltip-type="location">
                        ${location.name || 'N/A'}
                    </span>
                </td>
                <td>${location.country || 'N/A'}</td>
                <td>${location.city || 'N/A'}</td>
                <td>${location.address || 'N/A'}</td>
                <td>
                    <span class="badge bg-secondary cursor-pointer location-evses-tooltip" 
                          data-location-id="${location.id}"
                          data-tooltip-type="location-evses">
                        ${location.evses?.length || 0}
                    </span>
                </td>
                <td>${new Date(location.last_updated).toLocaleString()}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary btn-sm edit-location-btn me-1" 
                                data-location-id="${location.id}" 
                                data-location-name="${location.name || 'N/A'}"
                                title="Editar location">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm delete-location-btn" 
                                data-location-id="${location.id}" 
                                data-location-name="${location.name || 'N/A'}"
                                title="Eliminar location">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        console.log(`✅ ${locations.length} locations renderizadas`);
        
        // Inicializar tooltips de Bootstrap para locations
        this.initializeLocationTooltips();
    }



    // ===== FUNCIONALIDAD DE CAMBIO DE ESTADO EVSE =====
    
    // Mostrar modal de cambio de estado
    showChangeEvseStatusModal() {
        try {
            console.log('🔄 Abriendo modal de cambio de estado EVSE...');
            
            // Cargar locations para el selector
            this.loadLocationsForStatusChange();
            
            // Mostrar modal
            const modal = document.getElementById('changeEvseStatusModal');
            if (modal) {
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    const bsModal = new bootstrap.Modal(modal);
                    bsModal.show();
                } else {
                    // Fallback manual
                    modal.style.display = 'block';
                    modal.classList.add('show');
                    document.body.classList.add('modal-open');
                }
            }
            
        } catch (error) {
            console.error('❌ Error abriendo modal de cambio de estado:', error);
            this.showNotification('Error abriendo modal: ' + error.message, 'error');
        }
    }
    
    // Cargar locations para el selector de cambio de estado
    async loadLocationsForStatusChange() {
        try {
            console.log('🔄 Cargando locations para cambio de estado...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
            const locations = data.data || [];
            
            const selector = document.getElementById('changeEvseLocation');
            if (!selector) {
                console.warn('⚠️ Selector changeEvseLocation no encontrado');
                return;
            }
            
            // Limpiar opciones existentes (excepto la primera)
            selector.innerHTML = '<option value="">Seleccionar location...</option>';
            
            // Agregar locations al selector
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.id;
                option.textContent = `${location.name || 'Sin nombre'} (${location.evses?.length || 0} EVSEs)`;
                option.dataset.locationData = JSON.stringify(location);
                selector.appendChild(option);
            });
            
            console.log(`✅ ${locations.length} locations cargadas para cambio de estado`);
            
        } catch (error) {
            console.error('❌ Error cargando locations para cambio de estado:', error);
            this.showNotification('Error cargando locations: ' + error.message, 'error');
        }
    }
    
    // Cargar EVSEs cuando se selecciona una location
    async loadEvsesForStatusChange() {
        try {
            const locationId = document.getElementById('changeEvseLocation').value;
            const evseSelector = document.getElementById('changeEvseSelector');
            
            if (!locationId) {
                evseSelector.innerHTML = '<option value="">Primero selecciona una location</option>';
                evseSelector.disabled = true;
                return;
            }
            
            console.log('🔄 Cargando EVSEs para location:', locationId);
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?location_id=${locationId}`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
            const evses = data.data || [];
            
            // Limpiar opciones existentes
            evseSelector.innerHTML = '<option value="">Seleccionar EVSE...</option>';
            
            // Agregar EVSEs al selector
            evses.forEach(evse => {
                const option = document.createElement('option');
                option.value = evse.id;
                option.textContent = `${evse.evse_id || evse.id} - ${evse.status}`;
                option.dataset.evseData = JSON.stringify(evse);
                evseSelector.appendChild(option);
            });
            
            evseSelector.disabled = false;
            console.log(`✅ ${evses.length} EVSEs cargados para location ${locationId}`);
            
        } catch (error) {
            console.error('❌ Error cargando EVSEs para cambio de estado:', error);
            this.showNotification('Error cargando EVSEs: ' + error.message, 'error');
        }
    }
    
    // Mostrar información del EVSE seleccionado
    showSelectedEvseInfo() {
        try {
            const evseId = document.getElementById('changeEvseSelector').value;
            const infoElement = document.getElementById('selectedEvseInfo');
            
            if (!evseId) {
                infoElement.innerHTML = '<span class="text-muted">Selecciona un EVSE para ver su información</span>';
                return;
            }
            
            const selector = document.getElementById('changeEvseSelector');
            const selectedOption = selector.options[selector.selectedIndex];
            const evseData = JSON.parse(selectedOption.dataset.evseData);
            
            infoElement.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <strong>EVSE ID:</strong> ${evseData.evse_id || evseData.id}<br>
                        <strong>UID:</strong> ${evseData.id}<br>
                        <strong>Estado Actual:</strong> <span class="badge status-badge status-${evseData.status}">${evseData.status}</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Conectores:</strong> ${evseData.connectors?.length || 0}<br>
                        <strong>Capabilities:</strong> ${evseData.capabilities?.join(', ') || 'Ninguna'}<br>
                        <strong>Última Actualización:</strong> ${new Date(evseData.last_updated).toLocaleString()}
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Error mostrando información del EVSE:', error);
        }
    }
    
    // Cambiar estado del EVSE
    async changeEvseStatus() {
        try {
            const evseId = document.getElementById('changeEvseSelector').value;
            const newStatus = document.getElementById('newEvseStatus').value;
            const reason = document.getElementById('evseStatusReason').value;
            
            if (!evseId || !newStatus) {
                this.showNotification('Por favor selecciona un EVSE y un nuevo estado', 'warning');
                return;
            }
            
            console.log('🔄 Cambiando estado del EVSE:', evseId, 'a:', newStatus);
            
            // Obtener datos del EVSE seleccionado
            const selector = document.getElementById('changeEvseSelector');
            const selectedOption = selector.options[selector.selectedIndex];
            const evseData = JSON.parse(selectedOption.dataset.evseData);
            
            // Preparar payload para actualización
            const updatePayload = {
                status: newStatus,
                last_updated: new Date().toISOString()
            };
            
            if (reason) {
                updatePayload.status_message = reason;
            }
            
            // Actualizar EVSE en base de datos
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify(updatePayload)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const updatedEvse = await response.json();
            console.log('✅ EVSE actualizado exitosamente:', updatedEvse);
            
            // Mostrar notificación de éxito
            this.showNotification(`Estado del EVSE ${evseData.evse_id || evseData.id} cambiado a ${newStatus}`, 'success');
            
            // Cerrar modal
            this.closeChangeEvseStatusModal();
            
            // Recargar lista de EVSEs
            this.loadEvses();
            
        } catch (error) {
            console.error('❌ Error cambiando estado del EVSE:', error);
            this.showNotification('Error cambiando estado: ' + error.message, 'error');
        }
    }
    
    // Cerrar modal de cambio de estado
    closeChangeEvseStatusModal() {
        try {
            const modal = document.getElementById('changeEvseStatusModal');
            if (modal) {
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                } else {
                    // Fallback manual
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    document.body.classList.remove('modal-open');
                }
            }
            
            // Limpiar formulario
            document.getElementById('changeEvseStatusForm').reset();
            document.getElementById('changeEvseSelector').disabled = true;
            document.getElementById('selectedEvseInfo').innerHTML = '<span class="text-muted">Selecciona un EVSE para ver su información</span>';
            
        } catch (error) {
            console.error('❌ Error cerrando modal de cambio de estado:', error);
        }
    }

    // Inicializar tooltips de Bootstrap para locations
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

    showTableError(tbodyId, message) {
        const tbody = document.getElementById(tbodyId);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle"></i> ${message}
                    </td>
                </tr>
            `;
        }
    }

    updateCount(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count;
        }
    }

    async loadEvses() {
        try {
            console.log('🔄 Cargando EVSEs...');
            
            // Cargar todos los EVSEs haciendo múltiples peticiones
            this.allEvses = [];
            let offset = 0;
            const limit = 1000;
            let hasMore = true;
            
            while (hasMore) {
                const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?offset=${offset}&limit=${limit}`, {
                    headers: { 
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                    }
                });
                
                console.log(`📡 EVSEs response status (offset ${offset}):`, response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ EVSEs response error:', errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                const evses = data.data || [];
                
                this.allEvses = this.allEvses.concat(evses);
                
                console.log(`📊 Cargados ${evses.length} EVSEs (total: ${this.allEvses.length})`);
                
                // Verificar si hay más datos
                hasMore = evses.length === limit;
                offset += limit;
            }
            
            // Configurar paginado
            this.currentEvsesPage = 1;
            this.evsesPerPage = 20;
            
            this.renderEvsesPage();
            this.updateCount('evsesCount', this.allEvses.length);
            
            console.log(`✅ ${this.allEvses.length} EVSEs cargados exitosamente`);
            
        } catch (error) {
            console.error('❌ Error cargando EVSEs:', error);
            this.showTableError('evsesTableBody', `Error al cargar EVSEs: ${error.message}`);
        }
    }

    renderEvses(evses) {
        const tbody = document.getElementById('evsesTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento evsesTableBody no encontrado');
            return;
        }
        
        if (evses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay EVSEs disponibles
                    </td>
                </tr>
            `;
            return;
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
            `).join('');
        
        console.log(`✅ ${evses.length} EVSEs renderizados`);
        
        // Inicializar tooltips de Bootstrap
        this.initializeTooltips();
    }

    // Inicializar tooltips de Bootstrap
    initializeTooltips() {
        try {
            // Destruir tooltips existentes para evitar duplicados
            const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            existingTooltips.forEach(element => {
                const tooltip = bootstrap.Tooltip.getInstance(element);
                if (tooltip) {
                    tooltip.dispose();
                }
            });
            
            // Configurar tooltips para EVSE ID
            const evseIdTooltips = document.querySelectorAll('.evse-id-tooltip');
            evseIdTooltips.forEach(element => {
                const evseId = element.dataset.evseId;
                const evse = this.allEvses?.find(e => e.id === evseId);
                if (evse) {
                    const tooltipContent = `
                        <strong>EVSE ID:</strong> ${evse.evse_id || 'N/A'}<br>
                        <strong>UID:</strong> ${evse.id}<br>
                        <strong>Estado:</strong> ${evse.status}<br>
                        <strong>Location:</strong> ${evse.location?.name || evse.location_id || 'N/A'}<br>
                        <strong>Conectores:</strong> ${evse.connectors?.length || 0}<br>
                        <strong>Capabilities:</strong> ${evse.capabilities?.join(', ') || 'Ninguna'}<br>
                        <strong>Última actualización:</strong> ${new Date(evse.last_updated).toLocaleString()}
                    `;
                    
                    new bootstrap.Tooltip(element, {
                        html: true,
                        placement: 'top',
                        delay: { show: 500, hide: 100 },
                        title: tooltipContent
                    });
                }
            });
            
            // Configurar tooltips para conectores
            const connectorsTooltips = document.querySelectorAll('.connectors-tooltip');
            connectorsTooltips.forEach(element => {
                const evseId = element.dataset.evseId;
                const evse = this.allEvses?.find(e => e.id === evseId);
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
                        : 'No hay conectores configurados';
                    
                    new bootstrap.Tooltip(element, {
                        html: true,
                        placement: 'top',
                        delay: { show: 500, hide: 100 },
                        title: connectorsContent
                    });
                }
            });
            
            console.log(`✅ ${evseIdTooltips.length + connectorsTooltips.length} tooltips inicializados`);
        } catch (error) {
            console.error('❌ Error inicializando tooltips:', error);
        }
    }

    // Construir contenido del tooltip para tarifas
    buildTariffTooltip(tariff) {
        try {
            console.log('🔍 Construyendo tooltip para tarifa:', tariff);
            const elements = tariff.elements || [];
            console.log('📋 Elementos de la tarifa:', elements);
            
            const elementsInfo = elements.map((element, index) => {
                console.log(`🔍 Elemento ${index + 1}:`, element);
                
                let componentsInfo = '';
                
                // Verificar si tiene la estructura nueva (price_components)
                if (element.price_components && Array.isArray(element.price_components)) {
                    console.log(`💰 Price components (nueva estructura):`, element.price_components);
                    componentsInfo = element.price_components.map(comp => 
                        `<strong>${comp.type}</strong>: ${comp.price} ${tariff.currency}${comp.vat ? ` (IVA: ${comp.vat}%)` : ''}${comp.step_size ? ` (Paso: ${comp.step_size})` : ''}`
                    ).join('<br>');
                }
                // Verificar si tiene la estructura antigua (component_type, price, step)
                else if (element.component_type && element.price !== undefined) {
                    console.log(`💰 Componente (estructura antigua):`, element);
                    componentsInfo = `<strong>${element.component_type}</strong>: ${element.price} ${tariff.currency}${element.vat ? ` (IVA: ${element.vat}%)` : ''}${element.step ? ` (Paso: ${element.step})` : ''}`;
                }
                // Si no tiene estructura válida
                else {
                    console.log(`⚠️ Elemento sin estructura válida:`, element);
                    componentsInfo = 'Sin información de componentes';
                }
                
                return `Elemento ${index + 1}:<br>${componentsInfo}`;
            }).join('<br><br>');

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
            `;
        } catch (error) {
            console.error('❌ Error construyendo tooltip de tarifa:', error);
            return `<strong>Error:</strong> No se pudo cargar la información de la tarifa`;
        }
    }

    // Inicializar tooltips de Bootstrap para tarifas
    initializeTariffTooltips() {
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
                    const tariff = this.allTariffs ? this.allTariffs.find(t => t.id === tariffId) : null;
                    
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
    renderEvsesPage() {
        if (!this.allEvses || this.allEvses.length === 0) {
            this.renderEvses([]);
            this.updatePaginationInfo(0, 0, 0);
            return;
        }

        const startIndex = (this.currentEvsesPage - 1) * this.evsesPerPage;
        const endIndex = startIndex + this.evsesPerPage;
        const pageEvses = this.allEvses.slice(startIndex, endIndex);

        this.renderEvses(pageEvses);
        this.updatePaginationInfo(startIndex + 1, endIndex, this.allEvses.length);
        this.updatePaginationButtons();
    }

    // Actualizar información de paginado
    updatePaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('evsesPageInfo');
        const totalCount = document.getElementById('evsesTotalCount');
        
        if (pageInfo) pageInfo.textContent = `${start}-${Math.min(end, total)}`;
        if (totalCount) totalCount.textContent = total;
    }

    // Actualizar botones de paginado
    updatePaginationButtons() {
        const prevButton = document.getElementById('evsesPrevPage');
        const nextButton = document.getElementById('evsesNextPage');
        
        if (prevButton) {
            prevButton.disabled = this.currentEvsesPage <= 1;
            prevButton.parentElement.classList.toggle('disabled', this.currentEvsesPage <= 1);
        }
        
        if (nextButton) {
            const totalPages = Math.ceil(this.allEvses.length / this.evsesPerPage);
            nextButton.disabled = this.currentEvsesPage >= totalPages;
            nextButton.parentElement.classList.toggle('disabled', this.currentEvsesPage >= totalPages);
        }
    }

    // Ir a página anterior
    goToEvsesPrevPage() {
        if (this.currentEvsesPage > 1) {
            this.currentEvsesPage--;
            this.renderEvsesPage();
        }
    }

    // Ir a página siguiente
    goToEvsesNextPage() {
        const totalPages = Math.ceil(this.allEvses.length / this.evsesPerPage);
        if (this.currentEvsesPage < totalPages) {
            this.currentEvsesPage++;
            this.renderEvsesPage();
        }
    }

    // ===== PAGINACIÓN DE LOCATIONS =====
    
    // Renderizar página específica de Locations
    renderLocationsPage() {
        if (!this.allLocations || this.allLocations.length === 0) {
            this.renderLocations([]);
            this.updateLocationsPaginationInfo(0, 0, 0);
            return;
        }

        const startIndex = (this.currentLocationsPage - 1) * this.locationsPerPage;
        const endIndex = startIndex + this.locationsPerPage;
        const pageLocations = this.allLocations.slice(startIndex, endIndex);

        this.renderLocations(pageLocations);
        this.updateLocationsPaginationInfo(startIndex + 1, endIndex, this.allLocations.length);
        this.updateLocationsPaginationButtons();
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
            prevButton.disabled = this.currentLocationsPage <= 1;
            prevButton.parentElement.classList.toggle('disabled', this.currentLocationsPage <= 1);
        }
        
        if (nextButton) {
            const totalPages = Math.ceil(this.allLocations.length / this.locationsPerPage);
            nextButton.disabled = this.currentLocationsPage >= totalPages;
            nextButton.parentElement.classList.toggle('disabled', this.currentLocationsPage >= totalPages);
        }
    }

    // Ir a página anterior de Locations
    goToLocationsPrevPage() {
        if (this.currentLocationsPage > 1) {
            this.currentLocationsPage--;
            this.renderLocationsPage();
        }
    }

    // Ir a página siguiente de Locations
    goToLocationsNextPage() {
        const totalPages = Math.ceil(this.allLocations.length / this.locationsPerPage);
        if (this.currentLocationsPage < totalPages) {
            this.currentLocationsPage++;
            this.renderLocationsPage();
        }
    }

    async loadConnections() {
        try {
            console.log('🔄 Cargando conexiones...');
            
            const response = await fetch(`${this.baseUrl}/api/connections`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Connections data:', data);
            
            this.renderConnections(data.data || []);
            this.updateCount('connectionsCount', data.data?.length || 0);
            
            console.log('✅ Conexiones cargadas exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando conexiones:', error);
            this.showTableError('connectionsTableBody', `Error al cargar conexiones: ${error.message}`);
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
                <td><code>${this.truncateToken(conn.token)}</code></td>
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
            this.showNotification('No hay conexiones seleccionadas', 'warning');
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
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
            this.showNotification(`${results.length} conexión(es) eliminada(s) exitosamente`, 'success');
            
            // Recargar la lista de conexiones
            this.loadConnections();
            
        } catch (error) {
            console.error('❌ Error eliminando conexiones:', error);
            this.showNotification(`Error eliminando conexiones: ${error.message}`, 'error');
        }
    }

    async loadTokens() {
        try {
            console.log('🔄 Cargando tokens...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tokens`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const tokens = Array.isArray(data.data) ? data.data : [];
            console.log('📊 Tokens data:', tokens.length ? `Array[${tokens.length}]` : data);
            
            this.allTokens = tokens;
            this.filteredTokens = [...tokens];
            this.currentTokensPage = 1;
            this.renderTokensPage();
            this.updateCount('tokensCount', tokens.length);
            
            console.log('✅ Tokens cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando tokens:', error);
            this.showTableError('tokensTableBody', `Error al cargar tokens: ${error.message}`);
            this.allTokens = [];
            this.filteredTokens = [];
            this.currentTokensPage = 1;
            this.updateTokensPaginationInfo(0, 0, 0);
            this.updateTokensPaginationButtons();
            this.updateCount('tokensCount', 0);
        }
    }

    renderTokens(tokens) {
        const tbody = document.getElementById('tokensTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento tokensTableBody no encontrado');
            return;
        }
        
        const totalTokens = Array.isArray(this.allTokens) ? this.allTokens.length : 0;
        if (tokens.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="bi ${totalTokens > 0 ? 'bi-funnel' : 'bi-inbox'}"></i> ${totalTokens > 0 ? 'No se encontraron tokens para esta página' : 'No hay tokens disponibles'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tokens.map(token => `
            <tr class="fade-in">
                <td><code>${this.truncateToken(token.uid)}</code></td>
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
        
        console.log(`✅ ${tokens.length} tokens renderizados en la página actual`);
    }

    renderTokensPage() {
        const tokens = Array.isArray(this.filteredTokens) ? this.filteredTokens : [];
        const totalTokens = tokens.length;

        if (totalTokens === 0) {
            this.renderTokens([]);
            this.updateTokensPaginationInfo(0, 0, 0);
            this.updateTokensPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalTokens / this.tokensPerPage));
        if (this.currentTokensPage > totalPages) {
            this.currentTokensPage = totalPages;
        }
        if (this.currentTokensPage < 1) {
            this.currentTokensPage = 1;
        }

        const startIndex = (this.currentTokensPage - 1) * this.tokensPerPage;
        const endIndex = Math.min(startIndex + this.tokensPerPage, totalTokens);
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
        const totalTokens = Array.isArray(this.filteredTokens) ? this.filteredTokens.length : 0;
        const totalPages = totalTokens > 0 ? Math.ceil(totalTokens / this.tokensPerPage) : 1;

        const atFirstPage = this.currentTokensPage <= 1 || totalTokens === 0;
        const atLastPage = this.currentTokensPage >= totalPages || totalTokens === 0;

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
        if (this.currentTokensPage > 1) {
            this.currentTokensPage--;
            this.renderTokensPage();
        }
    }

    goToTokensNextPage() {
        const totalTokens = Array.isArray(this.filteredTokens) ? this.filteredTokens.length : 0;
        const totalPages = Math.ceil(totalTokens / this.tokensPerPage);

        if (this.currentTokensPage < totalPages) {
            this.currentTokensPage++;
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
            this.allSessions = data.data || [];
            console.log('💾 Stored sessions:', this.allSessions.length);
            
            // Aplicar filtro y renderizar
            this.filterSessions({ resetPage: true });
            
            console.log('✅ Sesiones cargadas exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando sesiones:', error);
            this.showTableError('sessionsTableBody', `Error al cargar sesiones: ${error.message}`);
            this.allSessions = [];
            this.filteredSessions = [];
            this.currentSessionsPage = 1;
            this.updateSessionsPaginationInfo(0, 0, 0);
            this.updateSessionsPaginationButtons();
            this.updateCount('sessionsCount', 0);
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
                        ${showOnlyActive && this.allSessions.length > 0 ? 
                            `<br><small class="text-muted">Total de sesiones: ${this.allSessions.length}</small>` : 
                            ''
                        }
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = sessions.map(session => `
            <tr class="fade-in">
                <td><code>${this.truncateToken(session.id)}</code></td>
                <td><code>${this.truncateToken(session.auth_id)}</code></td>
                <td><code>${this.truncateToken(session.location_id)}</code></td>
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

    viewSessionDetails(sessionId) {
        console.log('👁️ Ver detalles de sesión:', sessionId);
        this.showNotification(`Ver detalles de sesión: ${sessionId}`, 'info');
    }

    async endSession(sessionId) {
        try {
            console.log('🛑 Finalizando sesión:', sessionId);
            
            // Confirmar la acción
            if (!confirm('¿Estás seguro de que quieres finalizar esta sesión?')) {
                return;
            }

            // Mostrar indicador de carga
            this.showNotification('Finalizando sesión...', 'info');

            // Llamar al endpoint para finalizar la sesión
            const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Sesión finalizada exitosamente:', result);

            this.showNotification('Sesión finalizada exitosamente', 'success');

            // Recargar las sesiones para mostrar los cambios
            await this.loadSessions();

        } catch (error) {
            console.error('❌ Error finalizando sesión:', error);
            this.showNotification(`Error finalizando sesión: ${error.message}`, 'error');
        }
    }

    renderSessionsPage() {
        const sessions = Array.isArray(this.filteredSessions) ? this.filteredSessions : [];
        const totalSessions = sessions.length;

        if (totalSessions === 0) {
            this.renderSessions([]);
            this.updateSessionsPaginationInfo(0, 0, 0);
            this.updateSessionsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalSessions / this.sessionsPerPage));
        if (this.currentSessionsPage > totalPages) {
            this.currentSessionsPage = totalPages;
        }
        if (this.currentSessionsPage < 1) {
            this.currentSessionsPage = 1;
        }

        const startIndex = (this.currentSessionsPage - 1) * this.sessionsPerPage;
        const endIndex = Math.min(startIndex + this.sessionsPerPage, totalSessions);
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
        const totalSessions = Array.isArray(this.filteredSessions) ? this.filteredSessions.length : 0;
        const totalPages = totalSessions > 0 ? Math.ceil(totalSessions / this.sessionsPerPage) : 1;

        const atFirstPage = this.currentSessionsPage <= 1 || totalSessions === 0;
        const atLastPage = this.currentSessionsPage >= totalPages || totalSessions === 0;

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
        if (this.currentSessionsPage > 1) {
            this.currentSessionsPage--;
            this.renderSessionsPage();
        }
    }

    goToSessionsNextPage() {
        const totalSessions = Array.isArray(this.filteredSessions) ? this.filteredSessions.length : 0;
        const totalPages = Math.ceil(totalSessions / this.sessionsPerPage);

        if (this.currentSessionsPage < totalPages) {
            this.currentSessionsPage++;
            this.renderSessionsPage();
        }
    }

    filterSessions({ resetPage = false } = {}) {
        try {
            console.log('🔍 Iniciando filtro de sesiones');
            console.log('🔍 allSessions:', this.allSessions);
            console.log('🔍 allSessions length:', this.allSessions ? this.allSessions.length : 'undefined');
            
            const filterActiveCheckbox = document.getElementById('filterActiveSessions');
            const showOnlyActive = filterActiveCheckbox ? filterActiveCheckbox.checked : false;
            
            console.log('🔍 Aplicando filtro de sesiones:', showOnlyActive ? 'Solo activas' : 'Todas');
            console.log('🔍 Filter checkbox found:', !!filterActiveCheckbox);
            console.log('🔍 Filter checkbox checked:', showOnlyActive);
            
            let filteredSessions = this.allSessions ? [...this.allSessions] : [];
            
            if (showOnlyActive) {
                filteredSessions = filteredSessions.filter(session => 
                    session.status === 'ACTIVE'
                );
                console.log(`📊 Filtradas ${filteredSessions.length} sesiones activas de ${this.allSessions.length} totales`);
            } else {
                console.log(`📊 Mostrando todas las ${filteredSessions.length} sesiones`);
            }
            
            console.log('🔍 Filtered sessions:', filteredSessions);
            
            this.filteredSessions = filteredSessions;
            if (resetPage) {
                this.currentSessionsPage = 1;
            }
            this.renderSessionsPage();
            this.updateCount('sessionsCount', filteredSessions.length);
            
        } catch (error) {
            console.error('❌ Error aplicando filtro de sesiones:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== FUNCIONES EMSP =====
    
    // Cargar locations de eMSPs
    async loadEmspLocations() {
        try {
            console.log('🔄 Cargando EMSP locations...');
            
            // Cargar locations y EVSEs en paralelo
            const [locationsResponse, evsesResponse] = await Promise.all([
                fetch(`${this.baseUrl}/ocpi/emsp/2.2/locations`, {
                    headers: { 
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                    }
                }),
                fetch(`${this.baseUrl}/ocpi/emsp/2.2/evses`, {
                    headers: { 
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                    }
                })
            ]);
            
            if (!locationsResponse.ok) {
                const errorText = await locationsResponse.text();
                throw new Error(`HTTP ${locationsResponse.status}: ${errorText}`);
            }
            
            if (!evsesResponse.ok) {
                const errorText = await evsesResponse.text();
                throw new Error(`HTTP ${evsesResponse.status}: ${errorText}`);
            }
            
            const locationsData = await locationsResponse.json();
            const evsesData = await evsesResponse.json();
            
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
            
            this.emspLocationsEvseCountMap = evseCountMap;
            this.allEmspLocations = Array.isArray(locationsData.data) ? locationsData.data : [];
            this.buildEmspLocationNameMap();
            this.filteredEmspLocations = [...this.allEmspLocations];
            this.currentEmspLocationsPage = 1;
            this.renderEmspLocationsPage();
            this.updateCount('emspLocationsCount', this.allEmspLocations.length);
            
            console.log('✅ EMSP Locations cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP locations:', error);
            this.showTableError('emspLocationsTableBody', `Error al cargar EMSP locations: ${error.message}`);
            this.allEmspLocations = [];
            this.filteredEmspLocations = [];
            this.emspLocationsEvseCountMap = {};
            this.emspLocationNameMap = {};
            this.currentEmspLocationsPage = 1;
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
            const evseCount = this.emspLocationsEvseCountMap?.[location.id] || 0;

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
        if (Array.isArray(this.allEmspLocations)) {
            this.allEmspLocations.forEach(location => {
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
        this.emspLocationNameMap = map;
    }

    getEmspLocationName(locationId) {
        if (!locationId) {
            return '';
        }
        if (!this.emspLocationNameMap || Object.keys(this.emspLocationNameMap).length === 0) {
            this.buildEmspLocationNameMap();
        }
        return this.emspLocationNameMap?.[locationId] || '';
    }

    buildEmspEvseIdMap() {
        const map = {};
        if (Array.isArray(this.allEmspEvses)) {
            this.allEmspEvses.forEach(evse => {
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
        this.emspEvseIdMap = map;
    }

    getEmspEvseId(evseUid) {
        if (!evseUid) {
            return '';
        }
        if (!this.emspEvseIdMap || Object.keys(this.emspEvseIdMap).length === 0) {
            this.buildEmspEvseIdMap();
        }
        const uid = evseUid.toString().trim();
        const uidUpper = uid.toUpperCase();
        const cached = this.emspEvseIdMap?.[uid] || this.emspEvseIdMap?.[uidUpper];
        if (cached) {
            return cached;
        }

        if (Array.isArray(this.allEmspEvses)) {
            const found = this.allEmspEvses.find(evse => {
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
                    this.emspEvseIdMap[uidUpper] = evseId;
                    this.emspEvseIdMap[uid] = evseId;
                    return evseId;
                }
            }
        }

        return '';
    }

    renderEmspLocationsPage() {
        const locations = Array.isArray(this.filteredEmspLocations) ? this.filteredEmspLocations : [];
        const totalLocations = locations.length;

        if (totalLocations === 0) {
            this.renderEmspLocations([]);
            this.updateEmspLocationsPaginationInfo(0, 0, 0);
            this.updateEmspLocationsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalLocations / this.emspLocationsPerPage));
        if (this.currentEmspLocationsPage > totalPages) {
            this.currentEmspLocationsPage = totalPages;
        }
        if (this.currentEmspLocationsPage < 1) {
            this.currentEmspLocationsPage = 1;
        }

        const startIndex = (this.currentEmspLocationsPage - 1) * this.emspLocationsPerPage;
        const endIndex = Math.min(startIndex + this.emspLocationsPerPage, totalLocations);
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
        const totalLocations = Array.isArray(this.filteredEmspLocations) ? this.filteredEmspLocations.length : 0;
        const totalPages = totalLocations > 0 ? Math.ceil(totalLocations / this.emspLocationsPerPage) : 1;

        const atFirstPage = this.currentEmspLocationsPage <= 1 || totalLocations === 0;
        const atLastPage = this.currentEmspLocationsPage >= totalPages || totalLocations === 0;

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
        if (this.currentEmspLocationsPage > 1) {
            this.currentEmspLocationsPage--;
            this.renderEmspLocationsPage();
        }
    }

    goToEmspLocationsNextPage() {
        const totalLocations = Array.isArray(this.filteredEmspLocations) ? this.filteredEmspLocations.length : 0;
        const totalPages = Math.ceil(totalLocations / this.emspLocationsPerPage);

        if (this.currentEmspLocationsPage < totalPages) {
            this.currentEmspLocationsPage++;
            this.renderEmspLocationsPage();
        }
    }

    // Cargar EVSEs de eMSPs
    async loadEmspEvses() {
        try {
            console.log('🔄 Cargando EMSP EVSEs...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/evses`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const evses = Array.isArray(data.data) ? data.data : [];
            console.log('📊 EMSP EVSEs data:', evses.length ? `Array[${evses.length}]` : data);
            
            this.allEmspEvses = evses;
            this.buildEmspEvseIdMap();
            this.populateEmspPartyFilter(evses);
            this.applyEmspEvseFilters({ resetPage: true });
            this.updateCount('emspEvsesCount', evses.length);
            
            console.log('✅ EMSP EVSEs cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP EVSEs:', error);
            this.showTableError('emspEvsesTableBody', `Error al cargar EMSP EVSEs: ${error.message}`);
            this.allEmspEvses = [];
            this.filteredEmspEvses = [];
            this.currentEmspEvsesPage = 1;
            this.emspEvseIdMap = {};
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
            const hasData = Array.isArray(this.allEmspEvses) && this.allEmspEvses.length > 0;
            const filters = this.emspEvsesFilters || {};
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

    renderEmspEvsesPage() {
        const evses = Array.isArray(this.filteredEmspEvses) ? this.filteredEmspEvses : [];
        const totalEvses = evses.length;

        if (totalEvses === 0) {
            this.renderEmspEvses([]);
            this.updateEmspEvsesPaginationInfo(0, 0, 0);
            this.updateEmspEvsesPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalEvses / this.emspEvsesPerPage));
        if (this.currentEmspEvsesPage > totalPages) {
            this.currentEmspEvsesPage = totalPages;
        }
        if (this.currentEmspEvsesPage < 1) {
            this.currentEmspEvsesPage = 1;
        }

        const startIndex = (this.currentEmspEvsesPage - 1) * this.emspEvsesPerPage;
        const endIndex = Math.min(startIndex + this.emspEvsesPerPage, totalEvses);
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
        const totalEvses = Array.isArray(this.filteredEmspEvses) ? this.filteredEmspEvses.length : 0;
        const totalPages = totalEvses > 0 ? Math.ceil(totalEvses / this.emspEvsesPerPage) : 1;

        const atFirstPage = this.currentEmspEvsesPage <= 1 || totalEvses === 0;
        const atLastPage = this.currentEmspEvsesPage >= totalPages || totalEvses === 0;

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
        if (this.currentEmspEvsesPage > 1) {
            this.currentEmspEvsesPage--;
            this.renderEmspEvsesPage();
        }
    }

    goToEmspEvsesNextPage() {
        const totalEvses = Array.isArray(this.filteredEmspEvses) ? this.filteredEmspEvses.length : 0;
        const totalPages = Math.ceil(totalEvses / this.emspEvsesPerPage);

        if (this.currentEmspEvsesPage < totalPages) {
            this.currentEmspEvsesPage++;
            this.renderEmspEvsesPage();
        }
    }

    // Cargar tariffs de eMSPs
    async loadEmspTariffs() {
        try {
            console.log('🔄 Cargando EMSP tariffs...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tariffs`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const allTariffs = data.data || [];
            const activeTariffs = allTariffs.filter(tariff => !tariff.deleted_at);
            
            console.log('📊 EMSP Tariffs data:', {
                total: allTariffs.length,
                active: activeTariffs.length
            });
            
            this.allEmspTariffs = activeTariffs;
            this.filteredEmspTariffs = [...activeTariffs];
            this.currentEmspTariffsPage = 1;
            this.renderEmspTariffsPage();
            this.updateCount('emspTariffsCount', activeTariffs.length);
            
            console.log('✅ EMSP Tariffs cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP tariffs:', error);
            this.showTableError('emspTariffsTableBody', `Error al cargar EMSP tariffs: ${error.message}`);
            this.allEmspTariffs = [];
            this.filteredEmspTariffs = [];
            this.currentEmspTariffsPage = 1;
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
                <td>${tariff.name ? this.escapeHtml(tariff.name) : '<span class="text-muted">Sin nombre</span>'}</td>
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
        const tariffs = Array.isArray(this.filteredEmspTariffs) ? this.filteredEmspTariffs : [];
        const totalTariffs = tariffs.length;

        if (totalTariffs === 0) {
            this.renderEmspTariffs([]);
            this.updateEmspTariffsPaginationInfo(0, 0, 0);
            this.updateEmspTariffsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalTariffs / this.emspTariffsPerPage));
        if (this.currentEmspTariffsPage > totalPages) {
            this.currentEmspTariffsPage = totalPages;
        }
        if (this.currentEmspTariffsPage < 1) {
            this.currentEmspTariffsPage = 1;
        }

        const startIndex = (this.currentEmspTariffsPage - 1) * this.emspTariffsPerPage;
        const endIndex = Math.min(startIndex + this.emspTariffsPerPage, totalTariffs);
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
        const totalTariffs = Array.isArray(this.filteredEmspTariffs) ? this.filteredEmspTariffs.length : 0;
        const totalPages = totalTariffs > 0 ? Math.ceil(totalTariffs / this.emspTariffsPerPage) : 1;

        const atFirstPage = this.currentEmspTariffsPage <= 1 || totalTariffs === 0;
        const atLastPage = this.currentEmspTariffsPage >= totalPages || totalTariffs === 0;

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
        if (this.currentEmspTariffsPage > 1) {
            this.currentEmspTariffsPage--;
            this.renderEmspTariffsPage();
        }
    }

    goToEmspTariffsNextPage() {
        const totalTariffs = Array.isArray(this.filteredEmspTariffs) ? this.filteredEmspTariffs.length : 0;
        const totalPages = Math.ceil(totalTariffs / this.emspTariffsPerPage);

        if (this.currentEmspTariffsPage < totalPages) {
            this.currentEmspTariffsPage++;
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
                <strong>${this.escapeHtml(this.formatRestrictionLabel(key))}:</strong>
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

                return `<span class="badge bg-light text-dark border">${this.escapeHtml(String(item))}</span>`;
            }).join(' ');
        }

        if (typeof value === 'object') {
            const nestedEntries = Object.entries(value).filter(([_, nestedValue]) => nestedValue !== null && nestedValue !== undefined);
            if (nestedEntries.length === 0) {
                return '<span class="text-muted">N/A</span>';
            }

            const nestedItems = nestedEntries.map(([nestedKey, nestedValue]) => `
                <li>
                    <strong>${this.escapeHtml(this.formatRestrictionLabel(nestedKey))}:</strong>
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

        return this.escapeHtml(String(value));
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
        const tariffs = Array.isArray(this.allEmspTariffs) ? this.allEmspTariffs : [];
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
        const alreadyLoaded = Array.isArray(this.allEmspEvses) && this.allEmspEvses.length > 0;
        if (!alreadyLoaded) {
            try {
                console.log('🔄 Cargando EVSEs externos para consulta rápida de tarifas...');
                const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/evses`, {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                const evses = Array.isArray(data.data) ? data.data : [];
                this.allEmspEvses = evses;
                this.buildEmspEvseIdMap();
                console.log(`✅ EVSEs externos cargados (${evses.length}) para consulta de tarifas.`);
            } catch (error) {
                console.error('❌ Error cargando EVSEs externos para consulta de tarifas:', error);
                return false;
            }
        }

        await this.ensureEmspLocationsLoaded();

        return Array.isArray(this.allEmspEvses) && this.allEmspEvses.length > 0;
    }

    async ensureEmspTariffsLoaded() {
        const alreadyLoaded = Array.isArray(this.allEmspTariffs) && this.allEmspTariffs.length > 0;
        if (alreadyLoaded) {
            return true;
        }

        try {
            console.log('🔄 Cargando tarifas externas para consulta...');
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tariffs`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const allTariffs = Array.isArray(data.data) ? data.data : [];
            const activeTariffs = allTariffs.filter(tariff => !tariff.deleted_at);

            this.allEmspTariffs = activeTariffs;
            this.filteredEmspTariffs = [...activeTariffs];
            console.log(`✅ Tarifas externas cargadas (${activeTariffs.length}) para consulta.`);
            return activeTariffs.length > 0;
        } catch (error) {
            console.error('❌ Error cargando tarifas externas para consulta:', error);
            return false;
        }
    }

    async ensureEmspLocationsLoaded() {
        const alreadyLoaded = Array.isArray(this.allEmspLocations) && this.allEmspLocations.length > 0;
        if (alreadyLoaded) {
            if (!this.emspLocationNameMap || Object.keys(this.emspLocationNameMap).length === 0) {
                this.buildEmspLocationNameMap();
            }
            return true;
        }

        try {
            console.log('🔄 Cargando locations externos para consulta rápida de EVSEs...');
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/locations`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            this.allEmspLocations = Array.isArray(data.data) ? data.data : [];
            this.buildEmspLocationNameMap();
            console.log(`✅ Locations externos cargados (${this.allEmspLocations.length}) para consulta de EVSEs.`);
            return this.allEmspLocations.length > 0;
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

    goToTariffsNextPage() {
        const totalTariffs = Array.isArray(this.filteredTariffs) ? this.filteredTariffs.length : 0;
        const totalPages = Math.ceil(totalTariffs / this.tariffsPerPage);

        if (this.currentTariffsPage < totalPages) {
            this.currentTariffsPage++;
            this.renderTariffsPage();
        }
    }

    // ===== FUNCIONES DEL MODAL DE CREACIÓN DE TARIFAS =====

    setupTariffModalEventListeners() {
        try {
            console.log('🔧 Configurando event listeners del modal de tarifas...');
            
            // Botón para generar ID de tarifa
            const generateTariffIdBtn = document.getElementById('generateTariffIdBtn');
            if (generateTariffIdBtn) {
                generateTariffIdBtn.addEventListener('click', () => {
                    this.generateTariffId();
                });
                console.log('✅ Event listener para generateTariffIdBtn agregado');
            }
            
            // Botón para agregar elemento de tarifa
            const addTariffElement = document.getElementById('addTariffElement');
            if (addTariffElement) {
                addTariffElement.addEventListener('click', () => {
                    this.addTariffElement();
                });
                console.log('✅ Event listener para addTariffElement agregado');
            }

            // Botón para guardar tarifa
            const saveTariffBtn = document.getElementById('saveTariffBtn');
            if (saveTariffBtn) {
                saveTariffBtn.addEventListener('click', () => {
                    this.saveTariff();
                });
                console.log('✅ Event listener para saveTariffBtn agregado');
            }

            // Cambio de moneda para actualizar los sufijos de precio
            const tariffCurrency = document.getElementById('tariffCurrency');
            if (tariffCurrency) {
                tariffCurrency.addEventListener('change', () => {
                    this.updateCurrencySuffixes();
                });
                console.log('✅ Event listener para cambio de moneda agregado');
            }

            // Event listeners para cerrar el modal
            this.setupModalCloseEventListeners();

            console.log('✅ Event listeners del modal de tarifas configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners del modal de tarifas:', error);
        }
    }

    setupTokenModalEventListeners() {
        try {
            console.log('🔧 Configurando event listeners del modal de tokens...');
            
            // Botón para generar UID de token
            const generateTokenUidBtn = document.getElementById('generateTokenUidBtn');
            if (generateTokenUidBtn) {
                generateTokenUidBtn.addEventListener('click', () => {
                    this.generateTokenUid();
                });
                console.log('✅ Event listener para generateTokenUidBtn agregado');
            }
            
            // Botón para guardar token
            const saveTokenBtn = document.getElementById('saveTokenBtn');
            if (saveTokenBtn) {
                saveTokenBtn.addEventListener('click', () => {
                    this.saveToken();
                });
                console.log('✅ Event listener para saveTokenBtn agregado');
            }

            // Event listener para cambio de tipo de token
            const tokenTypeSelect = document.getElementById('tokenType');
            if (tokenTypeSelect) {
                tokenTypeSelect.addEventListener('change', () => {
                    this.handleTokenTypeChange();
                });
                console.log('✅ Event listener para tokenType agregado');
            }

            console.log('✅ Event listeners del modal de tokens configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners del modal de tokens:', error);
        }
    }

    // ===== FUNCIONES DEL MODAL DE CREACIÓN DE LOCATIONS =====

    setupLocationModalEventListeners() {
        try {
            console.log('🔧 Configurando event listeners del modal de locations...');
            
            // Botón para guardar location
            const saveLocationBtn = document.getElementById('saveLocationBtn');
            if (saveLocationBtn) {
                saveLocationBtn.addEventListener('click', () => {
                    this.saveLocation();
                });
                console.log('✅ Event listener para saveLocationBtn agregado');
            }

            // Botón para generar ID automáticamente
            const generateLocationIdBtn = document.getElementById('generateLocationIdBtn');
            if (generateLocationIdBtn) {
                generateLocationIdBtn.addEventListener('click', () => {
                    this.generateLocationId();
                });
                console.log('✅ Event listener para generateLocationIdBtn agregado');
            }

            // Event listeners para cerrar el modal
            this.setupLocationModalCloseEventListeners();

            console.log('✅ Event listeners del modal de locations configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners del modal de locations:', error);
        }
    }

    setupLocationModalCloseEventListeners() {
        try {
            // Botón de cerrar (X)
            const closeBtn = document.querySelector('#createLocationModal .btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeLocationModal();
                });
            }

            // Botón Cancelar
            const cancelBtn = document.querySelector('#createLocationModal .btn-secondary');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeLocationModal();
                });
            }

            // Cerrar al hacer clic en el backdrop
            const modalElement = document.getElementById('createLocationModal');
            if (modalElement) {
                modalElement.addEventListener('click', (event) => {
                    if (event.target === modalElement) {
                        this.closeLocationModal();
                    }
                });
            }

            // Cerrar con tecla Escape
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modalElement && modalElement.classList.contains('show')) {
                    this.closeLocationModal();
                }
            });

            console.log('✅ Event listeners de cierre del modal de locations configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners de cierre del modal de locations:', error);
        }
    }

    closeLocationModal() {
        try {
            const modalElement = document.getElementById('createLocationModal');
            if (modalElement) {
                // Intentar usar Bootstrap API si está disponible
                try {
                    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) {
                            modal.hide();
                            console.log('✅ Modal cerrado usando Bootstrap API');
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
                this.resetLocationForm();
                
                console.log('✅ Modal de location cerrado manualmente');
            }
        } catch (error) {
            console.error('❌ Error cerrando modal de location:', error);
        }
    }

    resetLocationForm() {
        try {
            const form = document.getElementById('createLocationForm');
            if (form) {
                form.reset();
                
                // Restablecer valores por defecto
                document.getElementById('locationAccessPublic').checked = true;
                
                // Generar nuevo ID único
                this.generateLocationId();
                
                console.log('✅ Formulario de location reseteado');
            }
        } catch (error) {
            console.error('❌ Error reseteando formulario de location:', error);
        }
    }

    showCreateLocationModal() {
        try {
            console.log('📍 Mostrando modal de creación de location...');
            
            const modalElement = document.getElementById('createLocationModal');
            if (!modalElement) {
                throw new Error('Elemento modal de location no encontrado');
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
            
            // Generar ID automáticamente al abrir el modal
            this.generateLocationId();
            
        } catch (error) {
            console.error('❌ Error mostrando modal de creación de location:', error);
        }
    }

    generateLocationId() {
        try {
            console.log('🆔 Generando ID único para location...');
            
            // Generar UUID v4
            const uuid = this.generateUUID();
            
            // Asignar al campo
            const locationIdField = document.getElementById('locationId');
            if (locationIdField) {
                locationIdField.value = uuid;
                console.log('✅ ID único generado:', uuid);
            } else {
                console.warn('⚠️ Campo locationId no encontrado');
            }
        } catch (error) {
            console.error('❌ Error generando ID de location:', error);
        }
    }
    
    generateTariffId() {
        try {
            console.log('🆔 Generando ID único para tarifa...');
            
            // Generar UUID v4
            const uuid = this.generateUUID();
            
            // Asignar al campo
            const tariffIdField = document.getElementById('tariffId');
            if (tariffIdField) {
                tariffIdField.value = uuid;
                console.log('✅ ID único generado para tarifa:', uuid);
            } else {
                console.warn('⚠️ Campo tariffId no encontrado');
            }
            
        } catch (error) {
            console.error('❌ Error generando ID de tarifa:', error);
        }
    }

    generateUUID() {
        try {
            // Implementación de UUID v4
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        } catch (error) {
            console.error('❌ Error generando UUID:', error);
            // Fallback: timestamp + random
            return 'loc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
    }

    generateConnectorId() {
        try {
            // Obtener todos los conectores existentes en el formulario actual
            const existingConnectors = document.querySelectorAll('.evse-connector .connector-id');
            const existingIds = Array.from(existingConnectors)
                .map(input => parseInt(input.value))
                .filter(id => !isNaN(id))
                .sort((a, b) => a - b);
            
            // Encontrar el siguiente número disponible (1, 2, 3...)
            let nextId = 1;
            for (const id of existingIds) {
                if (id === nextId) {
                    nextId++;
                } else {
                    break;
                }
            }
            
            return nextId.toString();
        } catch (error) {
            console.error('❌ Error generando ID de conector:', error);
            return '1';
        }
    }

    async saveLocation() {
        try {
            console.log('💾 Guardando location...');
            
            // Validar formulario
            if (!this.validateLocationForm()) {
                return;
            }
            
            // Recopilar datos del formulario
            const locationData = this.collectLocationFormData();
            
            // Enviar al backend usando POST para crear la location
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify(locationData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Location creada exitosamente:', result);
            
            // Mostrar notificación de éxito
            this.showNotification('Location creada exitosamente', 'success');
            
            // Cerrar modal
            this.closeLocationModal();
            
            // Recargar lista de locations
            this.loadLocations();
            
        } catch (error) {
            console.error('❌ Error guardando location:', error);
            this.showNotification(`Error al crear location: ${error.message}`, 'error');
        }
    }

    validateLocationForm() {
        try {
            const form = document.getElementById('createLocationForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error validando formulario de location:', error);
            return false;
        }
    }

    collectLocationFormData() {
        try {
            // Validar que las variables de entorno estén configuradas
            if (!window.OCPI_COUNTRY_CODE || !window.OCPI_PARTY_ID) {
                throw new Error('❌ Variables de entorno OCPI no configuradas. Por favor, reinicia la aplicación y asegúrate de que OCPI_PARTY_ID y OCPI_COUNTRY_CODE estén definidas en tu archivo .env');
            }

            const formData = {
                id: document.getElementById('locationId').value,
                name: document.getElementById('locationName').value,
                country: document.getElementById('locationCountry').value,
                city: document.getElementById('locationCity').value,
                address: document.getElementById('locationAddress').value,
                postal_code: document.getElementById('locationPostalCode').value || null,
                coordinates: {
                    latitude: parseFloat(document.getElementById('locationLatitude').value),
                    longitude: parseFloat(document.getElementById('locationLongitude').value)
                },
                parking_type: document.getElementById('locationParkingType').value,
                time_zone: document.getElementById('locationTimeZone').value,
                phone: document.getElementById('locationPhone').value || null,
                email: document.getElementById('locationEmail').value || null,
                website: document.getElementById('locationWebsite').value || null,
                operator: document.getElementById('locationOperator').value || null,
                open_24h: document.getElementById('locationOpen24h').checked,
                access_public: document.getElementById('locationAccessPublic').checked,
                country_code: window.OCPI_COUNTRY_CODE,
                party_id: window.OCPI_PARTY_ID,
                last_updated: new Date().toISOString()
            };
            
            console.log('📊 Datos de location recopilados:', formData);
            return formData;
        } catch (error) {
            console.error('❌ Error recopilando datos de location:', error);
            return null;
        }
    }

    // ===== FUNCIONES DEL MODAL DE CREACIÓN DE EVSEs =====

    setupEvseModalEventListeners() {
        try {
            console.log('🔌 Configurando event listeners del modal de EVSEs...');
            
            // Botón para crear EVSE
            const createEvseBtn = document.getElementById('createEvseBtn');
            if (createEvseBtn) {
                createEvseBtn.addEventListener('click', () => {
                    this.showCreateEvseModal();
                });
                console.log('✅ Event listener para createEvseBtn agregado');
            }
            
            // Botón para cambiar estado de EVSE
            const changeEvseStatusBtn = document.getElementById('changeEvseStatusBtn');
            if (changeEvseStatusBtn) {
                changeEvseStatusBtn.addEventListener('click', () => {
                    this.showChangeEvseStatusModal();
                });
                console.log('✅ Event listener para changeEvseStatusBtn agregado');
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
            this.setupEvseModalCloseEventListeners();
            
            // Event listeners para el modal de cambio de estado
            this.setupChangeEvseStatusModalEventListeners();
            
            // Configurar event listeners para el conector inicial
            this.setupConnectorEventListeners(0);

            console.log('✅ Event listeners del modal de EVSEs configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners del modal de EVSEs:', error);
        }
    }
    
    // Configurar event listeners para el modal de cambio de estado
    setupChangeEvseStatusModalEventListeners() {
        try {
            console.log('🔌 Configurando event listeners del modal de cambio de estado...');
            
            // Selector de location
            const changeEvseLocation = document.getElementById('changeEvseLocation');
            if (changeEvseLocation) {
                changeEvseLocation.addEventListener('change', () => {
                    this.loadEvsesForStatusChange();
                });
                console.log('✅ Event listener para changeEvseLocation agregado');
            }
            
            // Selector de EVSE
            const changeEvseSelector = document.getElementById('changeEvseSelector');
            if (changeEvseSelector) {
                changeEvseSelector.addEventListener('change', () => {
                    this.showSelectedEvseInfo();
                });
                console.log('✅ Event listener para changeEvseSelector agregado');
            }
            
            // Botón de confirmar cambio
            const confirmChangeEvseStatusBtn = document.getElementById('confirmChangeEvseStatusBtn');
            if (confirmChangeEvseStatusBtn) {
                confirmChangeEvseStatusBtn.addEventListener('click', () => {
                    this.changeEvseStatus();
                });
                console.log('✅ Event listener para confirmChangeEvseStatusBtn agregado');
            }
            
            // Event listeners para cerrar el modal
            this.setupChangeEvseStatusModalCloseEventListeners();
            
            console.log('✅ Event listeners del modal de cambio de estado configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners del modal de cambio de estado:', error);
        }
    }
    
    // Configurar event listeners para cerrar el modal de cambio de estado
    setupChangeEvseStatusModalCloseEventListeners() {
        try {
            // Botón de cerrar (X)
            const closeBtn = document.querySelector('#changeEvseStatusModal .btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeChangeEvseStatusModal();
                });
            }

            // Botón Cancelar
            const cancelBtn = document.querySelector('#changeEvseStatusModal .btn-secondary');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeChangeEvseStatusModal();
                });
            }
            
            console.log('✅ Event listeners de cierre del modal de cambio de estado configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners de cierre del modal de cambio de estado:', error);
        }
    }

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
                        this.showNotification('Debe mantener al menos un conector', 'warning');
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
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations?limit=1000`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
            const locations = data.data || [];
            
            // Llenar selector de locations (crear EVSE)
            const locationSelect = document.getElementById('evseLocation');
            if (locationSelect) {
                locationSelect.innerHTML = '<option value="">Seleccionar location...</option>';
                
                locations.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.id;
                    option.textContent = `${location.name} - ${location.city}`;
                    locationSelect.appendChild(option);
                });
                
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
            this.showNotification(`Error al cargar locations: ${error.message}`, 'error');
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
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify(evseData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ EVSE creado exitosamente:', result);
            
            // Mostrar notificación de éxito
            this.showNotification('EVSE creado exitosamente', 'success');
            
            // Cerrar modal
            this.closeEvseModal();
            
            // Recargar lista de EVSEs
            this.loadEvses();
            
        } catch (error) {
            console.error('❌ Error guardando EVSE:', error);
            this.showNotification(`Error al crear EVSE: ${error.message}`, 'error');
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
                this.showNotification('Debe seleccionar al menos una capability', 'warning');
                return false;
            }
            
            // Verificar que al menos un conector esté configurado
            const connectors = document.querySelectorAll('.evse-connector');
            if (connectors.length === 0) {
                this.showNotification('Debe configurar al menos un conector', 'warning');
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
            
            console.log('📊 Datos de EVSE recopilados:', formData);
            return formData;
        } catch (error) {
            console.error('❌ Error recopilando datos de EVSE:', error);
            return null;
        }
    }

    // ===== FUNCIONES DE BORRADO DE EVSEs =====

    async getEvsesCountForLocation(locationId) {
        try {
            console.log(`🔍 Contando EVSEs para location: ${locationId}`);
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?location_id=${locationId}&limit=1`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const evsesCount = data.pagination?.total || 0;
            
            console.log(`📊 Location ${locationId} tiene ${evsesCount} EVSE(s) asociado(s)`);
            return evsesCount;
            
        } catch (error) {
            console.error(`❌ Error contando EVSEs para location ${locationId}:`, error);
            throw error;
        }
    }

    async deleteEvsesForLocation(locationId) {
        try {
            console.log(`🗑️ Eliminando EVSEs para location: ${locationId}`);
            
            // Obtener todos los EVSEs de esta location
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?location_id=${locationId}&limit=1000`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const evses = data.data || [];
            
            if (evses.length === 0) {
                console.log(`📭 No hay EVSEs para eliminar en location ${locationId}`);
                return;
            }
            
            console.log(`🗑️ Eliminando ${evses.length} EVSE(s) de location ${locationId}`);
            
            // Eliminar cada EVSE uno por uno
            const deletePromises = evses.map(async (evse) => {
                try {
                    const deleteResponse = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evse.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                        }
                    });
                    
                    if (!deleteResponse.ok) {
                        const errorText = await deleteResponse.text();
                        throw new Error(`HTTP ${deleteResponse.status}: ${errorText}`);
                    }
                    
                    console.log(`✅ EVSE ${evse.id} eliminado exitosamente`);
                    return true;
                } catch (error) {
                    console.error(`❌ Error eliminando EVSE ${evse.id}:`, error);
                    throw error;
                }
            });
            
            // Esperar a que se completen todas las eliminaciones
            await Promise.all(deletePromises);
            
            console.log(`✅ Todos los EVSEs de location ${locationId} eliminados exitosamente`);
            
        } catch (error) {
            console.error(`❌ Error eliminando EVSEs para location ${locationId}:`, error);
            throw error;
        }
    }

    setupEvseDeleteEventListeners() {
        try {
            console.log('🗑️ Configurando event listeners para borrado de EVSEs...');
            
            document.addEventListener('click', (event) => {
                if (event.target.closest('.delete-evse-btn')) {
                    const button = event.target.closest('.delete-evse-btn');
                    const evseId = button.getAttribute('data-evse-id');
                    const evseName = button.getAttribute('data-evse-name');
                    this.confirmDeleteEvse(evseId, evseName);
                }
            });
            
            console.log('✅ Event listeners para borrado de EVSEs configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners para borrado de EVSEs:', error);
        }
    }

    setupEvseEditEventListeners() {
        try {
            console.log('✏️ Configurando event listeners para edición de EVSEs...');
            
            document.addEventListener('click', (event) => {
                if (event.target.closest('.edit-evse-btn')) {
                    const button = event.target.closest('.edit-evse-btn');
                    const evseId = button.getAttribute('data-evse-id');
                    this.openEditEvseModal(evseId);
                }
            });
            
            console.log('✅ Event listeners para edición de EVSEs configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners para edición de EVSEs:', error);
        }
    }

    confirmDeleteEvse(evseId, evseName) {
        try {
            console.log(`🗑️ Confirmando borrado de EVSE: ${evseId} (${evseName})`);
            
            const confirmed = confirm(`¿Estás seguro de que quieres eliminar el EVSE "${evseName}"?\n\nEsta acción marcará el EVSE como eliminado (soft delete) y no se mostrará en la lista, pero los datos permanecerán en la base de datos.\n\nID: ${evseId}`);
            
            if (confirmed) {
                this.deleteEvse(evseId, evseName);
            } else {
                console.log('❌ Borrado de EVSE cancelado por el usuario');
            }
        } catch (error) {
            console.error('❌ Error confirmando borrado de EVSE:', error);
        }
    }

    async deleteEvse(evseId, evseName) {
        try {
            console.log(`🗑️ Eliminando EVSE: ${evseId} (${evseName})`);
            
            const button = document.querySelector(`[data-evse-id="${evseId}"] .delete-evse-btn`);
            if (button) {
                // Cambiar estado del botón
                const originalContent = button.innerHTML;
                button.innerHTML = '<i class="bi bi-hourglass-split"></i>';
                button.disabled = true;
                
                // Enviar petición DELETE
                const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evseId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                    }
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                // Mostrar notificación de éxito
                this.showNotification(`EVSE "${evseName}" eliminado exitosamente`, 'success');
                
                // Recargar lista de EVSEs
                this.loadEvses();
                
                console.log(`✅ EVSE ${evseId} eliminado exitosamente`);
            } else {
                throw new Error('Botón de borrado no encontrado');
            }
        } catch (error) {
            console.error(`❌ Error eliminando EVSE ${evseId}:`, error);
            this.showNotification(`Error al eliminar EVSE: ${error.message}`, 'error');
            
            // Restaurar botón en caso de error
            const button = document.querySelector(`[data-evse-id="${evseId}"] .delete-evse-btn`);
            if (button) {
                button.innerHTML = '<i class="bi bi-trash"></i>';
                button.disabled = false;
            }
        }
    }

    // ===== FUNCIONES DE EDICIÓN DE EVSEs =====

    async openEditEvseModal(evseId) {
        try {
            console.log(`✏️ Abriendo modal de edición para EVSE: ${evseId}`);
            
            // Obtener los datos del EVSE
            const evseData = await this.getEvseById(evseId);
            if (!evseData) {
                this.showNotification('Error: No se pudo cargar la información del EVSE', 'error');
                return;
            }
            
            // Cargar las locations disponibles para el selector
            await this.loadLocationsForEvse();
            
            // Llenar el formulario con los datos del EVSE
            await this.fillEditEvseForm(evseData);
            
            // Mostrar el modal
            this.showEditEvseModal();
            
        } catch (error) {
            console.error('❌ Error abriendo modal de edición de EVSE:', error);
            this.showNotification(`Error al abrir modal de edición: ${error.message}`, 'error');
        }
    }

    async getEvseById(evseId) {
        try {
            console.log(`📊 Obteniendo datos del EVSE: ${evseId}`);
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evseId}`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
            
            // Cargar todas las tarifas si no están cargadas
            if (!this.allTariffs || this.allTariffs.length === 0) {
                await this.loadTariffs();
            }
            
            // Construir selects de tarifas para este conector
            await this.buildConnectorTariffSelects(connector, index);
            
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
            if (!this.allTariffs || this.allTariffs.length === 0) {
                container.innerHTML = '<div class="text-muted">No hay tarifas disponibles</div>';
                return;
            }
            
            // Obtener tarifas del conector
            const connectorTariffIds = connector.tariff_ids || [];
            
            // Generar HTML de selects de tarifas
            let tariffSelectsHtml = '';
            
            connectorTariffIds.forEach((tariffId, tariffIndex) => {
                const tariff = this.allTariffs.find(t => t.id === tariffId);
                const tariffName = tariff ? `${tariff.name || tariff.id} (${tariff.currency} ${tariff.price})` : tariffId;
                
                tariffSelectsHtml += `
                    <div class="tariff-select-item d-flex align-items-center mb-2" data-tariff-index="${tariffIndex}">
                        <select class="form-select me-2 connector-tariff-select" data-tariff-index="${tariffIndex}">
                            <option value="">Seleccionar tarifa...</option>
                            ${this.allTariffs.map(tariff => 
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
            
            // Cargar tarifas si no están cargadas
            if (!this.allTariffs || this.allTariffs.length === 0) {
                await this.loadTariffs();
            }
            
            if (!this.allTariffs || this.allTariffs.length === 0) {
                this.showNotification('No hay tarifas disponibles', 'warning');
                return;
            }
            
            // Obtener el siguiente índice de tarifa
            const existingTariffs = container.querySelectorAll('.tariff-select-item');
            const nextTariffIndex = existingTariffs.length;
            
            // Crear nuevo select de tarifa
            const tariffSelectHtml = `
                <div class="tariff-select-item d-flex align-items-center mb-2" data-tariff-index="${nextTariffIndex}">
                    <select class="form-select me-2 connector-tariff-select" data-tariff-index="${nextTariffIndex}">
                        <option value="">Seleccionar tarifa...</option>
                        ${this.allTariffs.map(tariff => 
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
                this.showNotification('Error: Modal de edición no encontrado', 'error');
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
                this.showNotification('Error al mostrar modal de edición', 'error');
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
            
            // Botón de actualizar EVSE
            const updateEvseBtn = document.getElementById('updateEvseBtn');
            if (updateEvseBtn) {
                updateEvseBtn.addEventListener('click', () => {
                    this.updateEvse();
                });
                console.log('✅ Event listener para updateEvseBtn agregado');
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
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses/${evseData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify(evseData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ EVSE actualizado exitosamente:', result);
            
            // Mostrar notificación de éxito
            this.showNotification('EVSE actualizado exitosamente', 'success');
            
            // Cerrar modal
            this.closeEditEvseModal();
            
            // Recargar la lista de EVSEs
            await this.loadEvses();
            
        } catch (error) {
            console.error('❌ Error actualizando EVSE:', error);
            this.showNotification(`Error al actualizar EVSE: ${error.message}`, 'error');
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
                this.showNotification('Error: El UID del EVSE es requerido', 'error');
                return null;
            }
            
            if (!location_id) {
                this.showNotification('Error: La location es requerida', 'error');
                return null;
            }
            
            if (!status) {
                this.showNotification('Error: El estado del EVSE es requerido', 'error');
                return null;
            }
            
            // Capabilities
            const capabilities = [];
            const capabilityCheckboxes = document.querySelectorAll('#editEvseModal [id^="editCapability_"]:checked');
            capabilityCheckboxes.forEach(checkbox => {
                capabilities.push(checkbox.value);
            });
            
            if (capabilities.length === 0) {
                this.showNotification('Error: Debes seleccionar al menos una capability', 'error');
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
                    this.showNotification('Error: Todos los campos de los conectores son requeridos', 'error');
                    return null;
                }
                
                connectors.push(connector);
            }
            
            if (connectors.length === 0) {
                this.showNotification('Error: Debes agregar al menos un conector', 'error');
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
            this.showNotification(`Error recolectando datos: ${error.message}`, 'error');
            return null;
        }
    }

    // ===== FUNCIONES DE EDICIÓN DE LOCATIONS =====

    setupLocationEditEventListeners() {
        try {
            console.log('✏️ Configurando event listeners para edición de locations...');
            
            document.addEventListener('click', (event) => {
                if (event.target.closest('.edit-location-btn')) {
                    const button = event.target.closest('.edit-location-btn');
                    const locationId = button.getAttribute('data-location-id');
                    const locationName = button.getAttribute('data-location-name');
                    this.showEditLocationModal(locationId, locationName);
                }
            });
            
            console.log('✅ Event listeners para edición de locations configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners para edición de locations:', error);
        }
    }

    async showEditLocationModal(locationId, locationName) {
        try {
            console.log(`✏️ Mostrando modal de edición para location: ${locationId} (${locationName})`);
            
            // Cargar datos de la location
            await this.loadLocationData(locationId);
            
            // Mostrar modal
            const modal = document.getElementById('editLocationModal');
            if (modal) {
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                } else {
                    // Fallback manual
                    modal.classList.add('show');
                    modal.style.display = 'block';
                    modal.setAttribute('aria-hidden', 'false');
                    document.body.classList.add('modal-open');
                    
                    // Agregar backdrop
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop fade show';
                    document.body.appendChild(backdrop);
                }
                console.log('✅ Modal de edición de location mostrado');
            } else {
                throw new Error('Modal de edición de location no encontrado');
            }
        } catch (error) {
            console.error('❌ Error mostrando modal de edición de location:', error);
            this.showNotification(`Error al mostrar modal de edición: ${error.message}`, 'error');
        }
    }

    async loadLocationData(locationId) {
        try {
            console.log(`📡 Cargando datos de location: ${locationId}`);
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations/${locationId}`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const location = data.data;
            
            console.log('📊 Datos de location cargados:', location);
            
            // Llenar formulario con datos existentes
            this.populateEditLocationForm(location);
            
        } catch (error) {
            console.error(`❌ Error cargando datos de location ${locationId}:`, error);
            throw error;
        }
    }

    populateEditLocationForm(location) {
        try {
            console.log('📝 Llenando formulario de edición con datos de location');
            
            // Campos básicos
            document.getElementById('editLocationId').value = location.id || '';
            document.getElementById('editLocationName').value = location.name || '';
            document.getElementById('editLocationCountry').value = location.country || 'ESP';
            document.getElementById('editLocationCity').value = location.city || '';
            document.getElementById('editLocationAddress').value = location.address || '';
            document.getElementById('editLocationPostalCode').value = location.postal_code || '';
            
            // Coordenadas
            if (location.coordinates) {
                document.getElementById('editLocationLatitude').value = location.coordinates.latitude || '';
                document.getElementById('editLocationLongitude').value = location.coordinates.longitude || '';
            }
            
            // Campos adicionales
            document.getElementById('editLocationParkingType').value = location.parking_type || '';
            document.getElementById('editLocationTimeZone').value = location.time_zone || 'Europe/Madrid';
            document.getElementById('editLocationPhone').value = location.phone || '';
            document.getElementById('editLocationEmail').value = location.email || '';
            document.getElementById('editLocationWebsite').value = location.website || '';
            document.getElementById('editLocationOperator').value = location.operator || '';
            
            // Checkboxes
            document.getElementById('editLocationOpen24h').checked = location.open_24_7 === true;
            document.getElementById('editLocationAccessPublic').checked = location.access_public !== false;
            
            console.log('✅ Formulario de edición llenado correctamente');
            
        } catch (error) {
            console.error('❌ Error llenando formulario de edición:', error);
        }
    }

    setupEditLocationModalEventListeners() {
        try {
            console.log('🔧 Configurando event listeners del modal de edición de location...');
            
            // Botón de actualizar
            const updateLocationBtn = document.getElementById('updateLocationBtn');
            if (updateLocationBtn) {
                updateLocationBtn.addEventListener('click', () => {
                    this.updateLocation();
                });
                console.log('✅ Event listener para updateLocationBtn agregado');
            }
            
            // Configurar event listeners de cierre
            this.setupEditLocationModalCloseEventListeners();
            
            console.log('✅ Event listeners del modal de edición de location configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners del modal de edición de location:', error);
        }
    }

    setupEditLocationModalCloseEventListeners() {
        try {
            // Botón de cerrar (X)
            const closeBtn = document.querySelector('#editLocationModal .btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeEditLocationModal();
                });
            }

            // Botón Cancelar
            const cancelBtn = document.querySelector('#editLocationModal .btn-secondary');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeEditLocationModal();
                });
            }

            // Cerrar al hacer clic en el backdrop
            const modalElement = document.getElementById('editLocationModal');
            if (modalElement) {
                modalElement.addEventListener('click', (event) => {
                    if (event.target === modalElement) {
                        this.closeEditLocationModal();
                    }
                });
            }

            // Cerrar con tecla Escape
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modalElement && modalElement.classList.contains('show')) {
                    this.closeEditLocationModal();
                }
            });
            
            console.log('✅ Event listeners de cierre del modal de edición configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners de cierre del modal de edición:', error);
        }
    }

    closeEditLocationModal() {
        try {
            const modal = document.getElementById('editLocationModal');
            if (modal) {
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    const bootstrapModal = bootstrap.Modal.getInstance(modal);
                    if (bootstrapModal) {
                        bootstrapModal.hide();
                    } else {
                        modal.classList.remove('show');
                        modal.style.display = 'none';
                    }
                } else {
                    // Fallback manual
                    modal.classList.remove('show');
                    modal.style.display = 'none';
                    modal.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('modal-open');
                    
                    // Remover backdrop
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                }
                console.log('✅ Modal de edición de location cerrado');
            }
        } catch (error) {
            console.error('❌ Error cerrando modal de edición de location:', error);
        }
    }

    async updateLocation() {
        try {
            console.log('🔄 Actualizando location...');
            
            // Validar formulario
            if (!this.validateEditLocationForm()) {
                return;
            }
            
            // Recopilar datos del formulario
            const locationData = this.collectEditLocationFormData();
            
            // Mostrar indicador de carga
            const updateBtn = document.getElementById('updateLocationBtn');
            if (updateBtn) {
                const originalContent = updateBtn.innerHTML;
                updateBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Actualizando...';
                updateBtn.disabled = true;
                
                try {
                    // Enviar petición PUT
                    const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations/${locationData.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                        },
                        body: JSON.stringify(locationData)
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }
                    
                    const result = await response.json();
                    console.log('✅ Location actualizada exitosamente:', result);
                    
                    // Mostrar notificación de éxito
                    this.showNotification('Location actualizada exitosamente', 'success');
                    
                    // Cerrar modal
                    this.closeEditLocationModal();
                    
                    // Recargar lista de locations
                    this.loadLocations();
                    
                } finally {
                    // Restaurar botón
                    updateBtn.innerHTML = originalContent;
                    updateBtn.disabled = false;
                }
            }
            
        } catch (error) {
            console.error('❌ Error actualizando location:', error);
            this.showNotification(`Error al actualizar location: ${error.message}`, 'error');
        }
    }

    validateEditLocationForm() {
        try {
            const requiredFields = [
                'editLocationName',
                'editLocationCountry',
                'editLocationCity',
                'editLocationAddress',
                'editLocationLatitude',
                'editLocationLongitude',
                'editLocationParkingType',
                'editLocationTimeZone'
            ];
            
            for (const fieldId of requiredFields) {
                const field = document.getElementById(fieldId);
                if (!field || !field.value.trim()) {
                    this.showNotification(`El campo ${fieldId.replace('editLocation', '')} es obligatorio`, 'error');
                    return false;
                }
            }
            
            // Validar coordenadas
            const lat = parseFloat(document.getElementById('editLocationLatitude').value);
            const lng = parseFloat(document.getElementById('editLocationLongitude').value);
            
            if (isNaN(lat) || lat < -90 || lat > 90) {
                this.showNotification('La latitud debe estar entre -90 y 90', 'error');
                return false;
            }
            
            if (isNaN(lng) || lng < -180 || lng > 180) {
                this.showNotification('La longitud debe estar entre -180 y 180', 'error');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error validando formulario de edición:', error);
            return false;
        }
    }

    collectEditLocationFormData() {
        try {
            const locationData = {
                id: document.getElementById('editLocationId').value,
                name: document.getElementById('editLocationName').value,
                country: document.getElementById('editLocationCountry').value,
                city: document.getElementById('editLocationCity').value,
                address: document.getElementById('editLocationAddress').value,
                postal_code: document.getElementById('editLocationPostalCode').value || null,
                coordinates: {
                    latitude: parseFloat(document.getElementById('editLocationLatitude').value),
                    longitude: parseFloat(document.getElementById('editLocationLongitude').value)
                },
                parking_type: document.getElementById('editLocationParkingType').value,
                time_zone: document.getElementById('editLocationTimeZone').value,
                phone: document.getElementById('editLocationPhone').value || null,
                email: document.getElementById('editLocationEmail').value || null,
                website: document.getElementById('editLocationWebsite').value || null,
                operator: document.getElementById('editLocationOperator').value || null,
                open_24_7: document.getElementById('editLocationOpen24h').checked,
                access_public: document.getElementById('editLocationAccessPublic').checked,
                last_updated: new Date().toISOString()
            };
            
            console.log('📝 Datos del formulario de edición recopilados:', locationData);
            return locationData;
            
        } catch (error) {
            console.error('❌ Error recopilando datos del formulario de edición:', error);
            throw error;
        }
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
            
            // Verificar si la location tiene EVSEs asociados
            const evsesCount = await this.getEvsesCountForLocation(locationId);
            
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
            this.showNotification(`Error al verificar EVSEs asociados: ${error.message}`, 'error');
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
                
                // Primero eliminar todos los EVSEs asociados a esta location
                await this.deleteEvsesForLocation(locationId);
                
                // Luego eliminar la location
                const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations/${locationId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                    }
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                // Mostrar notificación de éxito
                this.showNotification(`Location "${locationName}" y sus EVSEs asociados eliminados exitosamente`, 'success');
                
                // Recargar listas de locations y EVSEs
                this.loadLocations();
                this.loadEvses();
                
                console.log(`✅ Location ${locationId} y sus EVSEs asociados eliminados exitosamente`);
                
            } else {
                throw new Error('Botón de borrado no encontrado');
            }
            
        } catch (error) {
            console.error(`❌ Error eliminando location ${locationId}:`, error);
            this.showNotification(`Error al eliminar location: ${error.message}`, 'error');
            
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
            
            // Generar ID único para la tarifa
            this.generateTariffId();
            
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
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
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
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tariffs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify(tariffData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Tarifa creada exitosamente:', result);
            
            // Mostrar notificación de éxito con información de EVSEs asociados
            const associatedEvses = result.data?.associated_evses || 0;
            let message = 'Tarifa creada exitosamente';
            
            if (associatedEvses > 0) {
                message += ` y asociada a ${associatedEvses} EVSE(s)`;
            }
            
            this.showNotification(message, 'success');
            
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
            
            // Recargar lista de tarifas
            this.loadTariffs();
            
            // Recargar lista de EVSEs para mostrar los cambios en tariff_ids
            this.loadEvses();
            
        } catch (error) {
            console.error('❌ Error guardando tarifa:', error);
            this.showNotification(`Error al crear tarifa: ${error.message}`, 'error');
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
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tariffs/${tariffId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Tarifa eliminada exitosamente:', result);
            
            // Mostrar notificación de éxito con información de EVSEs desasociados
            const evsesDisassociated = result.data?.evses_disassociated || 0;
            let message = 'Tarifa eliminada exitosamente';
            
            if (evsesDisassociated > 0) {
                message += ` y desasociada de ${evsesDisassociated} EVSE(s)`;
            }
            
            this.showNotification(message, 'success');
            
            // Recargar lista de tarifas
            this.loadTariffs();
            
            // Recargar lista de EVSEs para mostrar los cambios en tariff_ids
            this.loadEvses();
            
        } catch (error) {
            console.error('❌ Error eliminando tarifa:', error);
            this.showNotification(`Error al eliminar tarifa: ${error.message}`, 'error');
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

            const tariff = this.findEmspTariff(countryCode, partyId, tariffId);

            if (!tariff) {
                console.warn('⚠️ Tarifa externa no encontrada en la lista actual');
                this.showNotification('No se encontró la tarifa externa seleccionada en la lista actual.', 'warning');
                return;
            }

            const safeText = (value, fallback = 'N/A') => this.escapeHtml(
                value !== undefined && value !== null && value !== '' ? String(value) : fallback
            );

            const parsedElements = this.parseTariffElements(tariff.elements);
            const currencyText = safeText(tariff.currency, '');
            const currencyLabel = currencyText ? ` ${currencyText}` : '';
            const elementsRows = parsedElements.reduce((rows, element, elementIndex) => {
                const priceComponents = Array.isArray(element.price_components) ? element.price_components : [];
                const restrictionsText = this.formatTariffRestrictions(element.restrictions);

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
                            <td><span class="badge bg-warning text-dark">${this.escapeHtml(component?.type || 'N/A')}</span></td>
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
                                            <tr><td><strong>eMSP:</strong></td><td><span class="badge bg-primary">${safeText(tariff.emsp_party_id)}</span> <span class="badge bg-secondary">${safeText(tariff.emsp_country_code)}</span></td></tr>
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
                                    <pre class="bg-light p-3 rounded small">${this.escapeHtml(JSON.stringify(tariff, null, 2))}</pre>
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
            this.showNotification(`Error al ver tarifa externa: ${error.message}`, 'error');
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

            const tariff = this.findEmspTariff(countryCode, partyId, tariffId);
            if (!tariff) {
                console.warn('⚠️ Tarifa externa no encontrada para listar EVSEs');
                this.showNotification('No se encontró la tarifa externa en la lista actual. Actualiza la pestaña Ext Tariffs e inténtalo nuevamente.', 'warning');
                return;
            }

            const safeText = (value, fallback = 'N/A') => this.escapeHtml(
                value !== undefined && value !== null && value !== '' ? String(value) : fallback
            );

            const evsesEnsureResult = await this.ensureEmspEvsesLoaded();
            const evses = Array.isArray(this.allEmspEvses) ? this.allEmspEvses : [];
            const hasEvseDataset = evses.length > 0;

            const effectiveTariffId = (tariff.tariff_id || tariff.id || tariffId || '').trim();
            if (!effectiveTariffId) {
                console.warn('⚠️ Tarifa externa sin identificador válido. No es posible buscar EVSEs asociados.');
                this.showNotification('La tarifa seleccionada no tiene un identificador válido. Verifica los datos recibidos.', 'warning');
                return;
            }

            const targetTariffUpper = effectiveTariffId.toUpperCase();
            const targetPartyUpper = (partyId || tariff.emsp_party_id || '').trim().toUpperCase();
            const targetCountryUpper = (countryCode || tariff.emsp_country_code || '').trim().toUpperCase();

            const matchingEvses = evses.reduce((acc, evse) => {
                const evsePartyUpper = String(evse.emsp_party_id || '').trim().toUpperCase();
                const evseCountryUpper = String(evse.emsp_country_code || '').trim().toUpperCase();

                if (targetPartyUpper && evsePartyUpper !== targetPartyUpper) {
                    return acc;
                }
                if (targetCountryUpper && evseCountryUpper !== targetCountryUpper) {
                    return acc;
                }

                const connectors = this.parseEmspConnectors(evse.connectors);
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
                addToken(tariff.emsp_party_id || partyId);
                addToken(tariff.emsp_country_code || countryCode);

                const evseLocationName = this.getEmspLocationName(evse.location_id)
                    || evse.location_name
                    || evse.emsp_location_name
                    || evse.location?.name;

                addToken(evse.evse_id);
                addToken(evse.id);
                addToken(evse.location_id);
                addToken(evseLocationName);
                addToken(evse.status);

                connectors.forEach(connector => {
                    const connectorTariffs = this.extractTariffIdsFromConnector(connector);
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
                    ...this.normalizeTariffIds(evse.tariff_ids),
                    ...this.normalizeTariffIds(evse.tariffs),
                    ...this.normalizeTariffIds(evse.tariff)
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
                        ? this.escapeHtml(String(connectorIdRaw))
                        : `Conector ${index + 1}`;

                    const metaParts = [];
                    if (connector && connector.standard) {
                        metaParts.push(this.escapeHtml(String(connector.standard)));
                    }
                    if (connector && connector.format) {
                        metaParts.push(this.escapeHtml(String(connector.format)));
                    }
                    if (connector && connector.power_type) {
                        metaParts.push(this.escapeHtml(String(connector.power_type)));
                    }
                    const metaHtml = metaParts.length ? `<span class="text-muted small">${metaParts.join(' · ')}</span>` : '';

                    const tariffsBadges = (tariffs || []).map(id =>
                        `<span class="badge bg-light text-dark border me-1">${this.escapeHtml(id)}</span>`
                    ).join('');
                    const tariffsHtml = tariffsBadges
                        ? `<div class="small mt-1">Tariffs: ${tariffsBadges}</div>`
                        : '';

                    const rawHtml = connector && connector.raw
                        ? `<div class="small text-muted">${this.escapeHtml(String(connector.raw))}</div>`
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
                        <div>${this.escapeHtml(locationName)}</div>
                        <div class="small text-muted">${this.escapeHtml(evse.location_id || 'Sin ID')}</div>
                    `.trim()
                    : `
                        <div>${this.escapeHtml(evse.location_id || 'N/A')}</div>
                    `.trim();

                return `
                    <tr>
                        <td>
                            <code>${this.escapeHtml(evse.evse_id || evse.id || 'N/A')}</code>
                            <div class="small text-muted">UID: ${this.escapeHtml(evse.id || 'N/A')}</div>
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
                    <span class="badge bg-info">${safeText(tariff.emsp_party_id || partyId)}</span>
                    <span class="badge bg-secondary">${safeText(tariff.emsp_country_code || countryCode)}</span>
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
                        const safeQuery = this.escapeHtml(query.trim());
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
            this.showNotification(`Error al consultar EVSEs asociados a la tarifa: ${error.message}`, 'error');
        }
    }

    async viewTariff(tariffId) {
        try {
            console.log(`👁️ Viendo detalles de tarifa ${tariffId}...`);
            
            // Obtener detalles de la tarifa
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tariffs/${tariffId}`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
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
            this.showNotification(`Error al ver tarifa: ${error.message}`, 'error');
        }
    }

    async editTariff(tariffId) {
        try {
            console.log(`✏️ Editando tarifa ${tariffId}...`);
            
            // Obtener detalles de la tarifa
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tariffs/${tariffId}`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            const tariff = result.data;
            
            // Mostrar notificación de que la edición no está implementada
            this.showNotification('La funcionalidad de edición de tarifas no está implementada aún', 'info');
            
            // TODO: Implementar modal de edición de tarifas
            console.log('Tarifa a editar:', tariff);
            
        } catch (error) {
            console.error('❌ Error editando tarifa:', error);
            this.showNotification(`Error al editar tarifa: ${error.message}`, 'error');
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
                this.showNotification('Debe configurar al menos un elemento de tarifa', 'error');
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

    // ===== FUNCIONES DEL MODAL DE CREACIÓN DE TOKENS =====

    showCreateTokenModal() {
        try {
            console.log('🔑 Mostrando modal de creación de token...');
            
            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('createTokenModal'));
            modal.show();
            
            // Generar UID único para el token
            this.generateTokenUid();
            
            // Limpiar formulario
            this.resetTokenForm();
            
        } catch (error) {
            console.error('❌ Error mostrando modal de token:', error);
            this.showNotification('Error al mostrar el formulario de token', 'error');
        }
    }

    generateTokenUid() {
        try {
            console.log('🆔 Generando UID único para token...');
            
            // Generar UUID v4
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            
            document.getElementById('tokenUid').value = uuid;
            console.log('✅ UID generado:', uuid);
            
        } catch (error) {
            console.error('❌ Error generando UID de token:', error);
        }
    }

    handleTokenTypeChange() {
        try {
            const tokenType = document.getElementById('tokenType').value;
            console.log('🔄 Cambio de tipo de token detectado:', tokenType);
            
            if (tokenType === 'AD_HOC_USER') {
                // Autocompletar campos para AD_HOC_USER
                document.getElementById('tokenIssuer').value = 'EMSP_System';
                document.getElementById('tokenContractId').value = 'contract-001';
                document.getElementById('tokenVisualNumber').value = 'AH001';
                
                console.log('✅ Campos autocompletados para AD_HOC_USER');
            } else {
                // Limpiar campos si no es AD_HOC_USER
                document.getElementById('tokenIssuer').value = '';
                document.getElementById('tokenContractId').value = '';
                document.getElementById('tokenVisualNumber').value = '';
                
                console.log('✅ Campos limpiados para tipo:', tokenType);
            }
            
        } catch (error) {
            console.error('❌ Error manejando cambio de tipo de token:', error);
        }
    }

    resetTokenForm() {
        try {
            console.log('🔄 Reseteando formulario de token...');
            
            // Limpiar todos los campos
            document.getElementById('createTokenForm').reset();
            
            // Generar nuevo UID
            this.generateTokenUid();
            
            console.log('✅ Formulario de token reseteado');
            
        } catch (error) {
            console.error('❌ Error reseteando formulario de token:', error);
        }
    }

    async saveToken() {
        try {
            console.log('💾 Guardando token...');
            
            // Validar formulario
            if (!this.validateTokenForm()) {
                return;
            }
            
            // Recopilar datos del formulario
            const tokenData = this.collectTokenFormData();
            
            // Enviar al backend
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                },
                body: JSON.stringify(tokenData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Token creado exitosamente:', result);
            
            // Mostrar notificación de éxito
            this.showNotification('Token creado exitosamente y notificado a operadores conectados', 'success');
            
            // Cerrar modal usando la API correcta de Bootstrap 5
            const modalElement = document.getElementById('createTokenModal');
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
            
            // Recargar lista de tokens
            this.loadTokens();
            
        } catch (error) {
            console.error('❌ Error guardando token:', error);
            this.showNotification(`Error al crear token: ${error.message}`, 'error');
        }
    }

    validateTokenForm() {
        try {
            const form = document.getElementById('createTokenForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error validando formulario de token:', error);
            return false;
        }
    }

    collectTokenFormData() {
        try {
            const formData = {
                uid: document.getElementById('tokenUid').value,
                type: document.getElementById('tokenType').value,
                auth_method: document.getElementById('tokenAuthMethod').value,
                issuer: document.getElementById('tokenIssuer').value,
                contract_id: document.getElementById('tokenContractId').value || null,
                valid: document.getElementById('tokenValid').value === 'true',
                whitelist: document.getElementById('tokenWhitelist').value,
                visual_number: document.getElementById('tokenVisualNumber').value || null,
                group_id: document.getElementById('tokenGroupId').value || null,
                language: document.getElementById('tokenLanguage').value || null,
                default_profile_type: document.getElementById('tokenDefaultProfileType').value || null,
                energy_contract: document.getElementById('tokenEnergyContract').value || null
            };
            
            console.log('📊 Datos de token recopilados:', formData);
            return formData;
        } catch (error) {
            console.error('❌ Error recopilando datos de token:', error);
            return null;
        }
    }

    // Cargar tokens de eMSPs
    async loadEmspTokens() {
        try {
            console.log('🔄 Cargando EMSP tokens...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tokens/stored`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const tokens = data.data || [];
            console.log('📊 EMSP Tokens data:', tokens.length ? `Array[${tokens.length}]` : data);
            
            this.allEmspTokens = tokens;
            this.populateEmspTokensFilterOptions(tokens);
            this.applyEmspTokensFilters({ resetPage: true });
            this.updateCount('emspTokensCount', tokens.length);
            
            console.log('✅ EMSP Tokens cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP tokens:', error);
            this.showTableError('emspTokensTableBody', `Error al cargar EMSP tokens: ${error.message}`);
        }
    }

    hasActiveEmspTokensFilters() {
        if (!this.emspTokensFilters) return false;
        const { search, issuer, type, valid, whitelist } = this.emspTokensFilters;
        return Boolean(
            (search && search.trim()) ||
            issuer ||
            type ||
            valid ||
            whitelist
        );
    }

    applyEmspTokensFilters({ resetPage = false } = {}) {
        try {
            const tokens = Array.isArray(this.allEmspTokens) ? this.allEmspTokens : [];
            const filters = this.emspTokensFilters || {};
            const searchTerm = (filters.search || '').trim().toLowerCase();
            const issuerFilter = filters.issuer || '';
            const typeFilter = filters.type || '';
            const validFilter = filters.valid || '';
            const whitelistFilter = filters.whitelist || '';

            this.filteredEmspTokens = tokens.filter(token => {
                if (issuerFilter && token.issuer !== issuerFilter) return false;
                if (typeFilter && token.type !== typeFilter) return false;

                if (validFilter) {
                    const normalizedValid = typeof token.valid === 'boolean'
                        ? token.valid
                        : String(token.valid).toLowerCase() === 'true';

                    if (validFilter === 'true' && !normalizedValid) return false;
                    if (validFilter === 'false' && normalizedValid) return false;
                }

                if (whitelistFilter && token.whitelist !== whitelistFilter) return false;

                if (searchTerm) {
                    const haystack = [
                        token.id,
                        token.uid,
                        token.party_id,
                        token.type,
                        token.issuer,
                        token.auth_method,
                        token.contract_id,
                        token.whitelist
                    ]
                        .map(value => (value ?? '').toString().toLowerCase());

                    const hasMatch = haystack.some(value => value.includes(searchTerm));
                    if (!hasMatch) return false;
                }

                return true;
            });

            const totalPages = this.filteredEmspTokens.length > 0
                ? Math.ceil(this.filteredEmspTokens.length / this.emspTokensPerPage)
                : 1;

            if (resetPage) {
                this.currentEmspTokensPage = 1;
            } else if (this.currentEmspTokensPage > totalPages) {
                this.currentEmspTokensPage = totalPages;
            }

            this.renderEmspTokensPage();
        } catch (error) {
            console.warn('⚠️ Error aplicando filtros de Ext Tokens:', error);
        }
    }

    populateEmspTokensFilterOptions(tokens) {
        try {
            const safeTokens = Array.isArray(tokens) ? tokens : [];
            const collatorOptions = { sensitivity: 'base', numeric: false };
            const compare = (a, b) => a.localeCompare(b, undefined, collatorOptions);

            const issuers = Array.from(new Set(
                safeTokens
                    .map(token => token.issuer)
                    .filter(value => value && value.trim() !== '')
            )).sort(compare);

            const types = Array.from(new Set(
                safeTokens
                    .map(token => token.type)
                    .filter(value => value && value.trim() !== '')
            )).sort(compare);

            const whitelists = Array.from(new Set(
                safeTokens
                    .map(token => token.whitelist)
                    .filter(value => value && value.trim() !== '')
            )).sort(compare);

            const setSelectOptions = (elementId, values, defaultLabel, filterKey) => {
                const select = document.getElementById(elementId);
                if (!select) return;

                const previousValue = this.emspTokensFilters?.[filterKey] || '';
                const optionsHtml = [
                    `<option value="">${defaultLabel}</option>`,
                    ...values.map(value => `<option value="${value}">${value}</option>`)
                ].join('');

                select.innerHTML = optionsHtml;

                if (previousValue && values.includes(previousValue)) {
                    select.value = previousValue;
                } else {
                    select.value = '';
                    if (previousValue) {
                        this.emspTokensFilters[filterKey] = '';
                    }
                }
            };

            setSelectOptions('emspTokensIssuerFilter', issuers, 'Todos los emisores', 'issuer');
            setSelectOptions('emspTokensTypeFilter', types, 'Todos los tipos', 'type');
            setSelectOptions('emspTokensWhitelistFilter', whitelists, 'Todas las whitelist', 'whitelist');

            const searchInput = document.getElementById('emspTokensSearch');
            if (searchInput) {
                searchInput.value = this.emspTokensFilters?.search || '';
            }

            const validSelect = document.getElementById('emspTokensValidFilter');
            if (validSelect) {
                validSelect.value = this.emspTokensFilters?.valid || '';
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando filtros de Ext Tokens:', error);
        }
    }

    renderEmspTokens(tokens) {
        const tbody = document.getElementById('emspTokensTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento emspTokensTableBody no encontrado');
            return;
        }
        
        if (tokens.length === 0) {
            const hasFilters = this.hasActiveEmspTokensFilters();
            const emptyIcon = hasFilters ? 'bi-funnel' : 'bi-inbox';
            const emptyMessage = hasFilters
                ? 'No se encontraron Ext tokens con los filtros aplicados'
                : 'No hay Ext tokens disponibles';

            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted">
                        <i class="bi ${emptyIcon}"></i> ${emptyMessage}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tokens.map(token => `
            <tr class="fade-in">
                <td><code>${token.id}</code></td>
                <td><span class="badge bg-info">${token.party_id}</span></td>
                <td><code>${token.uid}</code></td>
                <td><span class="badge bg-secondary">${token.type}</span></td>
                <td><span class="badge bg-warning">${token.auth_method || 'N/A'}</span></td>
                <td>${token.issuer || 'N/A'}</td>
                <td>
                    <span class="badge ${token.valid ? 'bg-success' : 'bg-danger'}">
                        ${token.valid ? 'Sí' : 'No'}
                    </span>
                </td>
                <td>
                    <span class="badge bg-info">${token.whitelist || 'N/A'}</span>
                </td>
                <td>${token.last_updated ? new Date(token.last_updated).toLocaleString() : 'N/A'}</td>
            </tr>
        `).join('');
        
        console.log(`✅ ${tokens.length} Ext tokens renderizados en la página actual`);
    }

    renderEmspTokensPage() {
        const tokens = Array.isArray(this.filteredEmspTokens) ? this.filteredEmspTokens : [];
        const totalTokens = tokens.length;

        if (totalTokens === 0) {
            this.renderEmspTokens([]);
            this.updateEmspTokensPaginationInfo(0, 0, 0);
            this.updateEmspTokensPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalTokens / this.emspTokensPerPage));
        if (this.currentEmspTokensPage > totalPages) {
            this.currentEmspTokensPage = totalPages;
        }
        if (this.currentEmspTokensPage < 1) {
            this.currentEmspTokensPage = 1;
        }

        const startIndex = (this.currentEmspTokensPage - 1) * this.emspTokensPerPage;
        const endIndex = Math.min(startIndex + this.emspTokensPerPage, totalTokens);
        const pageTokens = tokens.slice(startIndex, endIndex);

        this.renderEmspTokens(pageTokens);
        this.updateEmspTokensPaginationInfo(startIndex + 1, endIndex, totalTokens);
        this.updateEmspTokensPaginationButtons();
    }

    updateEmspTokensPaginationInfo(start, end, total) {
        const pageInfo = document.getElementById('emspTokensPageInfo');
        const totalCount = document.getElementById('emspTokensTotalCount');

        if (pageInfo) {
            pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

    updateEmspTokensPaginationButtons() {
        const prevButton = document.getElementById('emspTokensPrevPage');
        const nextButton = document.getElementById('emspTokensNextPage');
        const totalTokens = Array.isArray(this.filteredEmspTokens) ? this.filteredEmspTokens.length : 0;
        const totalPages = totalTokens > 0 ? Math.ceil(totalTokens / this.emspTokensPerPage) : 1;

        const atFirstPage = this.currentEmspTokensPage <= 1 || totalTokens === 0;
        const atLastPage = this.currentEmspTokensPage >= totalPages || totalTokens === 0;

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

    goToEmspTokensPrevPage() {
        if (this.currentEmspTokensPage > 1) {
            this.currentEmspTokensPage--;
            this.renderEmspTokensPage();
        }
    }

    goToEmspTokensNextPage() {
        const totalTokens = Array.isArray(this.filteredEmspTokens) ? this.filteredEmspTokens.length : 0;
        const totalPages = Math.ceil(totalTokens / this.emspTokensPerPage);

        if (this.currentEmspTokensPage < totalPages) {
            this.currentEmspTokensPage++;
            this.renderEmspTokensPage();
        }
    }

    // Funciones de filtrado EMSP
    populateEmspPartyFilter(evses) {
        const partyFilter = document.getElementById('emspEvsePartyFilter');
        if (!partyFilter) return;

        const parties = [...new Set(evses.map(evse => evse.emsp_party_id).filter(Boolean))].sort();
        const currentValue = this.emspEvsesFilters?.party || '';

        partyFilter.innerHTML = '<option value="">Todos los eMSPs</option>' + 
            parties.map(party => `<option value="${party}">${party}</option>`).join('');

        if (currentValue && parties.includes(currentValue)) {
            partyFilter.value = currentValue;
        } else {
            partyFilter.value = '';
            if (currentValue) {
                this.emspEvsesFilters.party = '';
            }
        }
    }

    applyEmspEvseFilters({ resetPage = false } = {}) {
        const statusFilter = document.getElementById('emspEvseStatusFilter')?.value || '';
        const partyFilter = document.getElementById('emspEvsePartyFilter')?.value || '';
        const searchFilterRaw = document.getElementById('emspEvseSearchFilter')?.value || '';
        const searchFilter = searchFilterRaw.trim().toLowerCase();

        this.emspEvsesFilters = {
            status: statusFilter,
            party: partyFilter,
            search: searchFilter
        };

        const source = Array.isArray(this.allEmspEvses) ? this.allEmspEvses : [];

        this.filteredEmspEvses = source.filter(evse => {
            const status = (evse.status || '').toUpperCase();
            const party = (evse.emsp_party_id || '').toUpperCase();
            const locationId = (evse.location_id || '').toUpperCase();
            const evseId = (evse.evse_id || '').toUpperCase();
            const uid = (evse.id || '').toUpperCase();

            const statusMatch = !statusFilter || status === statusFilter.toUpperCase();
            const partyMatch = !partyFilter || party === partyFilter.toUpperCase();

            const searchMatch = !searchFilter || [
                evse.evse_id,
                evse.id,
                evse.location_id,
                evse.status,
                evse.emsp_party_id
            ].some(value => (value || '').toString().toLowerCase().includes(searchFilter));

            return statusMatch && partyMatch && searchMatch;
        });

        const totalPages = this.filteredEmspEvses.length > 0
            ? Math.ceil(this.filteredEmspEvses.length / this.emspEvsesPerPage)
            : 1;

        if (resetPage) {
            this.currentEmspEvsesPage = 1;
        } else if (this.currentEmspEvsesPage > totalPages) {
            this.currentEmspEvsesPage = totalPages;
        }

        this.renderEmspEvsesPage();
        console.log(`🔍 Filtros EMSP EVSE aplicados: ${this.filteredEmspEvses.length} registros filtrados`);
    }

    applyEvseFilters() {
        const statusFilter = document.getElementById('evseStatusFilter')?.value || '';
        const searchFilter = document.getElementById('evseSearchFilter')?.value || '';

        const rows = document.querySelectorAll('#evsesTable tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            if (row.cells.length < 8) return; // Skip header rows (ahora son 8 columnas)

            const status = row.cells[4]?.textContent || ''; // Estado está en la columna 4
            const searchText = row.textContent.toLowerCase();

            const statusMatch = !statusFilter || status.includes(statusFilter);
            const searchMatch = !searchFilter || searchText.includes(searchFilter.toLowerCase());

            if (statusMatch && searchMatch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        console.log(`🔍 Filtros EVSE aplicados: ${visibleCount} filas visibles`);
    }

    applyLocationFilters() {
        const searchFilter = document.getElementById('locationSearchFilter')?.value || '';

        const rows = document.querySelectorAll('#locationsTable tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            if (row.cells.length < 8) return; // Skip header rows

            const searchText = row.textContent.toLowerCase();
            const searchMatch = !searchFilter || searchText.includes(searchFilter.toLowerCase());

            if (searchMatch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        console.log(`🔍 Filtros Location aplicados: ${visibleCount} filas visibles`);
    }

    // ===== FUNCIONES PARA CONSULTAR CPOs (ROL EMSP) =====
    
    // Cargar conexiones disponibles en el selector
    async loadCpoConnections() {
        try {
            console.log('🔄 Cargando conexiones CPO...');
            
            const response = await fetch(`${this.baseUrl}/api/connections`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
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
            this.showNotification(`Error cargando conexiones: ${error.message}`, 'error');
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
            const headers = this.createCpoHeaders(cpoToken);
            if (this.isNgrokUrl(cpoUrl)) {
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
            const headers = this.createCpoHeaders(cpoToken);
            if (this.isNgrokUrl(cpoUrl)) {
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`,
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`,
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`,
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`,
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
            this.showNotification('Operación cancelada por el usuario', 'info');
            return;
        }

        try {
            console.log('🧨 Confirmación recibida, iniciando limpieza de datos eMSP');
            const authToken = localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key';
            
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
            this.showNotification(successMessage, 'success');
            this.showCpoResponse(`✅ ${successMessage}`, 'success');
        } catch (error) {
            console.error('❌ Error eliminando datos eMSP:', error);
            const errorMessage = `Error eliminando datos eMSP: ${error.message}`;
            this.showNotification(errorMessage, 'error');
            this.showCpoResponse(`❌ ${errorMessage}`, 'error');
        }
    }

    resetEmspDataState() {
        console.log('🧹 Reiniciando estado local de datos eMSP');

        this.allEmspLocations = [];
        this.filteredEmspLocations = [];
        this.emspLocationsEvseCountMap = {};
        this.emspLocationNameMap = {};
        this.emspEvseIdMap = {};
        this.currentEmspLocationsPage = 1;
        this.renderEmspLocationsPage();
        this.updateCount('emspLocationsCount', 0);

        this.allEmspEvses = [];
        this.filteredEmspEvses = [];
        this.currentEmspEvsesPage = 1;
        this.emspEvsesFilters = { status: '', party: '', search: '' };
        this.renderEmspEvsesPage();
        this.updateCount('emspEvsesCount', 0);

        this.allEmspTariffs = [];
        this.filteredEmspTariffs = [];
        this.currentEmspTariffsPage = 1;
        this.renderEmspTariffsPage();
        this.updateCount('emspTariffsCount', 0);

        this.allEmspTokens = [];
        this.filteredEmspTokens = [];
        this.currentEmspTokensPage = 1;
        this.emspTokensFilters = { search: '', issuer: '', type: '', valid: '', whitelist: '' };
        this.renderEmspTokensPage();
        this.updateCount('emspTokensCount', 0);
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`,
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
                <td>${evse.location_id ? this.truncateToken(evse.location_id) : 'N/A'}</td>
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
            const headers = this.createCpoHeaders(cpoToken);
            if (this.isNgrokUrl(cpoUrl)) {
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
            const headers = this.createCpoHeaders(cpoToken);
            if (this.isNgrokUrl(cpoUrl)) {
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    // Buscar la sesión más reciente del CPO EFI (usando emsp_party_id)
                    const efiSessions = data.data.filter(session => 
                        session.emsp_party_id === 'EFI'
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`,
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

    showNotification(message, type = 'info') {
        console.log(`📢 Notificación [${type}]: ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show system-notification`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // ===== MÉTODOS PARA SESIONES EXTERNAS =====

    async loadExtSessions() {
        try {
            console.log('☁️ Cargando sesiones externas...');
            
            const response = await fetch(`${this.baseUrl}/api/ext-sessions`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || window.DEFAULT_OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            this.allExtSessions = Array.isArray(data.data) ? data.data : [];
            
            console.log(`✅ ${this.allExtSessions.length} sesiones externas cargadas`);
            console.log('🔍 Datos de sesiones externas:', this.allExtSessions);
            await this.ensureEmspEvsesLoaded();
            this.applyExtSessionsFilters({ resetPage: true });
            this.updateExtSessionsCount();
            
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

        const hasData = Array.isArray(this.allExtSessions) && this.allExtSessions.length > 0;
        const hasSearch = Boolean((this.extSessionsSearchQuery || '').trim());

        if (!Array.isArray(sessions) || sessions.length === 0) {
            let emptyIcon = 'bi-cloud-download';
            let emptyMessage = 'No hay sesiones externas disponibles';

            if (hasSearch) {
                emptyIcon = 'bi-search';
                emptyMessage = `No se encontraron sesiones externas para “${this.escapeHtml(this.extSessionsSearchQuery.trim())}”`;
            } else if (this.filterActiveExtSessions && hasData) {
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
            const evseId = this.getEmspEvseId(session.evse_uid);
            const evseDisplay = evseId || session.evse_uid || 'N/A';
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
                              title="${this.escapeHtml(session.session_id || 'N/A')}">
                            ${this.escapeHtml(session.session_id || 'N/A')}
                        </span>
                    </td>
                    <td>
                        <span class="badge bg-info">${this.escapeHtml(session.emsp_party_id || 'N/A')}</span>
                    </td>
                    <td>
                        <span class="text-truncate d-inline-block" style="max-width: 100px;" 
                              title="${this.escapeHtml(session.id_token || 'N/A')}">
                            ${this.escapeHtml(session.id_token || 'N/A')}
                        </span>
                    </td>
                    <td>
                        <span class="text-truncate d-inline-block" style="max-width: 140px;" 
                              title="${this.escapeHtml(evseTitle)}">
                            ${this.escapeHtml(evseDisplay)}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${this.getExtSessionStatusBadgeClass(session.status)}">
                            ${this.escapeHtml(session.status || 'UNKNOWN')}
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
                        <span class="badge bg-secondary">${this.escapeHtml(session.currency || 'EUR')}</span>
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
        const sessions = Array.isArray(this.allExtSessions) ? this.allExtSessions : [];

        let filtered = sessions;

        if (this.filterActiveExtSessions) {
            filtered = filtered.filter(session => {
                const status = (session.status || '').toUpperCase();
                return status === 'ACTIVE' || status === 'PENDING' || status === 'IN_PROGRESS';
            });
        }

        const searchQuery = (this.extSessionsSearchQuery || '').trim().toLowerCase();
        if (searchQuery) {
            const terms = searchQuery.split(/\s+/).filter(Boolean);
            if (terms.length > 0) {
                filtered = filtered.filter(session => {
                    const evseId = this.getEmspEvseId(session.evse_uid);
                    const locationName = this.getEmspLocationName(session.location_id);
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

        this.filteredExtSessions = filtered;

        const totalPages = this.filteredExtSessions.length > 0
            ? Math.ceil(this.filteredExtSessions.length / this.extSessionsPerPage)
            : 1;

        if (resetPage) {
            this.currentExtSessionsPage = 1;
        } else if (this.currentExtSessionsPage > totalPages) {
            this.currentExtSessionsPage = totalPages;
        }

        this.renderExtSessionsPage();
    }

    renderExtSessionsPage() {
        const sessions = Array.isArray(this.filteredExtSessions) ? this.filteredExtSessions : [];
        const totalSessions = sessions.length;

        if (totalSessions === 0) {
            this.renderExtSessions([]);
            this.updateExtSessionsPaginationInfo(0, 0, 0);
            this.updateExtSessionsPaginationButtons();
            return;
        }

        const totalPages = Math.max(1, Math.ceil(totalSessions / this.extSessionsPerPage));
        if (this.currentExtSessionsPage > totalPages) {
            this.currentExtSessionsPage = totalPages;
        }
        if (this.currentExtSessionsPage < 1) {
            this.currentExtSessionsPage = 1;
        }

        const startIndex = (this.currentExtSessionsPage - 1) * this.extSessionsPerPage;
        const endIndex = Math.min(startIndex + this.extSessionsPerPage, totalSessions);
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
        const totalSessions = Array.isArray(this.filteredExtSessions) ? this.filteredExtSessions.length : 0;
        const totalPages = totalSessions > 0 ? Math.ceil(totalSessions / this.extSessionsPerPage) : 1;

        const atFirstPage = this.currentExtSessionsPage <= 1 || totalSessions === 0;
        const atLastPage = this.currentExtSessionsPage >= totalPages || totalSessions === 0;

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
        if (this.currentExtSessionsPage > 1) {
            this.currentExtSessionsPage--;
            this.renderExtSessionsPage();
        }
    }

    goToExtSessionsNextPage() {
        const totalSessions = Array.isArray(this.filteredExtSessions) ? this.filteredExtSessions.length : 0;
        const totalPages = Math.ceil(totalSessions / this.extSessionsPerPage);

        if (this.currentExtSessionsPage < totalPages) {
            this.currentExtSessionsPage++;
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

        this.allExtSessions = [];
        this.filteredExtSessions = [];
        this.currentExtSessionsPage = 1;
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

        await this.ensureEmspEvsesLoaded();
        await this.ensureEmspTariffsLoaded();

        const evse = Array.isArray(this.allEmspEvses)
            ? this.allEmspEvses.find(evseItem => {
                const rawUid = evseItem?.id || evseItem?.evse_uid || evseItem?.uid;
                if (!rawUid) return false;
                const normalized = rawUid.toString().trim();
                return normalized === session.evse_uid || normalized.toUpperCase() === (session.evse_uid || '').toUpperCase();
            })
            : null;

        const associatedTariffIds = new Set();
        if (evse) {
            this.normalizeTariffIds(evse.tariff_ids).forEach(id => associatedTariffIds.add(id.toString().trim().toUpperCase()));
            this.normalizeTariffIds(evse.tariff_id).forEach(id => associatedTariffIds.add(id.toString().trim().toUpperCase()));

            const connectors = this.parseEmspConnectors(evse.connectors);
            connectors.forEach(connector => {
                this.extractTariffIdsFromConnector(connector).forEach(id => associatedTariffIds.add(id.toString().trim().toUpperCase()));
            });
        }

        const tariffEntries = Array.from(associatedTariffIds)
            .map(id => id && id.toString().trim())
            .filter(Boolean)
            .map(id => {
                const tariff = this.findEmspTariff(session.emsp_country_code, session.emsp_party_id, id)
                    || this.findEmspTariff(null, null, id);
                return { id, tariff };
            });

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
                    <p><strong>EVSE ID:</strong> ${this.getEmspEvseId(session.evse_uid) || 'N/A'}</p>
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
            
            // Botón de actualizar tarifas
            const refreshTariffs = document.getElementById('refreshTariffs');
            if (refreshTariffs) {
                refreshTariffs.addEventListener('click', () => {
                    console.log('💰 Botón refreshTariffs clickeado');
                    this.loadTariffs();
                });
                console.log('✅ Event listener para refreshTariffs agregado');
            } else {
                console.warn('⚠️ Elemento refreshTariffs no encontrado');
            }
            
            // Botón de mostrar/ocultar tarifas
            const toggleTariffsView = document.getElementById('toggleTariffsView');
            if (toggleTariffsView) {
                toggleTariffsView.addEventListener('click', () => {
                    console.log('👁️ Botón toggleTariffsView clickeado');
                    this.toggleTariffsView();
                });
                console.log('✅ Event listener para toggleTariffsView agregado');
            } else {
                console.warn('⚠️ Elemento toggleTariffsView no encontrado');
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
     * Alterna la vista de tarifas sincronizadas
     */
    async toggleTariffsView() {
        try {
            const tariffsContainer = document.getElementById('tariffsContainer');
            const toggleTariffsViewBtn = document.getElementById('toggleTariffsView');
            const toggleTariffsViewText = document.getElementById('toggleTariffsViewText');
            
            if (tariffsContainer && toggleTariffsViewBtn) {
                if (tariffsContainer.style.display === 'none') {
                    // Mostrar tarifas
                    await this.loadTariffs();
                    tariffsContainer.style.display = 'block';
                    toggleTariffsViewText.textContent = 'Ocultar';
                } else {
                    // Ocultar tarifas
                    tariffsContainer.style.display = 'none';
                    toggleTariffsViewText.textContent = 'Mostrar';
                }
            }
        } catch (error) {
            console.error('❌ Error alternando vista de tarifas:', error);
            this.showNotification('Error mostrando tarifas: ' + error.message, 'error');
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

// Inicializar la aplicación cuando el DOM esté listo
console.log('📜 Script app.js cargado');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM Content Loaded event disparado');
    try {
        window.dashboardApp = new DashboardApp();
        // Hacer disponible globalmente para el backend (solo en Node.js)
        if (typeof global !== 'undefined') {
            global.dashboardApp = window.dashboardApp;
        }
        window.dashboardApp.init();
        console.log('✅ Dashboard inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando dashboard:', error);
    }
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('🚨 Error global:', event.error);
    if (window.dashboardApp) {
        window.dashboardApp.showNotification('Error inesperado en la aplicación', 'error');
    }
});

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Promesa rechazada no capturada:', event.reason);
    event.preventDefault();
    
    if (window.dashboardApp && event.reason && event.reason.message && !event.reason.message.includes('fetch')) {
        window.dashboardApp.showNotification('Error en operación asíncrona', 'error');
    }
});
