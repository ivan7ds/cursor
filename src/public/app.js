

class DashboardApp {
    constructor() {
        console.log('🚀 Constructor DashboardApp iniciado');
        this.baseUrl = window.location.origin;
        this.currentTab = 'logs';
        this.logsStreaming = false;
        this.logsEventSource = null;
        this.allSessions = []; // Almacenar todas las sesiones para filtrado
        this.allExtSessions = []; // Almacenar todas las sesiones externas para filtrado
        this.currentChargingSession = null; // Sesión de recarga activa
        this.cpoEvses = []; // EVSEs del CPO externo
        this.filterActiveExtSessions = true; // Filtro de sesiones externas activas
        this.logPollingInterval = null; // Intervalo para consultar logs
        
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            if (response.ok) {
                const settings = await response.json();
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
                    this.applyEmspEvseFilters();
                });
                console.log('✅ Event listener para emspEvseStatusFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspEvseStatusFilter no encontrado');
            }

            const emspEvsePartyFilter = document.getElementById('emspEvsePartyFilter');
            if (emspEvsePartyFilter) {
                emspEvsePartyFilter.addEventListener('change', () => {
                    console.log('🔍 Filtro de party EMSP EVSE cambiado:', emspEvsePartyFilter.value);
                    this.applyEmspEvseFilters();
                });
                console.log('✅ Event listener para emspEvsePartyFilter agregado');
            } else {
                console.warn('⚠️ Elemento emspEvsePartyFilter no encontrado');
            }

            const emspEvseSearchFilter = document.getElementById('emspEvseSearchFilter');
            if (emspEvseSearchFilter) {
                emspEvseSearchFilter.addEventListener('input', () => {
                    console.log('🔍 Filtro de búsqueda EMSP EVSE cambiado:', emspEvseSearchFilter.value);
                    this.applyEmspEvseFilters();
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
                    this.filterSessions();
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
            
            this.logsEventSource.onmessage = (event) => {
                const logData = JSON.parse(event.data);
                this.addLogEntry(logData);
            };

            this.logsEventSource.onerror = (error) => {
                console.error('❌ Error en EventSource:', error);
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
            
            // Verificar el estado después de 3 segundos
            setTimeout(() => {
                if (this.logsEventSource && this.logsEventSource.readyState === 0) {
                    console.log('⚠️ EventSource no se conecta - iniciando polling seguro...');
                    this.logsEventSource.close();
                    this.startSafePolling();
                }
            }, 3000);

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
        
        // Patrones a filtrar
        const filterPatterns = [
            /API Request Incoming/,
            /API Response Outgoing/,
            /API Request Summary/,
            /Mozilla\/5\.0/,
            /Chrome\/\d+/,
            /Safari\/\d+/,
            /AppleWebKit/,
            /DELETE \/api\/delete-connection/,
            /GET \/api\//,
            /POST \/api\//,
            /PUT \/api\//,
            /PATCH \/api\//,
            /::ffff:172\.18\.0\.1.*HTTP\/1\.1.*200/,
            /::ffff:172\.18\.0\.1.*HTTP\/1\.1.*404/,
            /::ffff:172\.18\.0\.1.*HTTP\/1\.1.*500/
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

    addLogEntry(logData) {
        console.log('📝 Nuevo log recibido:', logData);
        
        // Filtrar logs de peticiones HTTP del navegador
        if (this.shouldFilterLog(logData)) {
            console.log('🚫 Log filtrado (petición del navegador)');
            return;
        }
        
        const container = document.getElementById('logsContainer');
        if (!container) return;

        // Verificar si ya existe un log similar para evitar duplicados
        if (this.isDuplicateLog(logData)) {
            console.log('🚫 Log duplicado, omitiendo');
            return;
        }

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
            message = logData.message || JSON.stringify(logData);
            source = logData.source || 'system';
        }
        
        // Aplicar clase CSS según el tipo de log
        const logClass = source === 'charging' ? 'charging-log' : 'system-log';
        
        logEntry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-level ${level.toLowerCase()}">${level}</span>
            <span class="log-source ${logClass}">[${source.toUpperCase()}]</span>
            <span class="log-message">${this.escapeHtml(message)}</span>
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
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/locations`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Locations data:', data);
            
            // Almacenar locations para uso en tooltips
            this.allLocations = data.data || [];
            
            this.renderLocations(this.allLocations);
            this.updateCount('locationsCount', this.allLocations.length);
            
            console.log('✅ Locations cargadas exitosamente');
            
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
                <td>${location.country_code}</td>
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                        <strong>País:</strong> ${location.country_code}<br>
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
            
            // Cargar todos los EVSEs para paginado
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?limit=1000`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            console.log('📡 EVSEs response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ EVSEs response error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 EVSEs data:', data);
            
            // Almacenar todos los EVSEs y configurar paginado
            this.allEvses = data.data || [];
            this.currentEvsesPage = 1;
            this.evsesPerPage = 20;
            
            this.renderEvsesPage();
            this.updateCount('evsesCount', this.allEvses.length);
            
            console.log('✅ EVSEs cargados exitosamente');
            
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
                    <td><code>${evse.location_id}</code></td>
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
                        <strong>Location:</strong> ${evse.location_id}<br>
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

    async loadConnections() {
        try {
            console.log('🔄 Cargando conexiones...');
            
            const response = await fetch(`${this.baseUrl}/api/connections`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Tokens data:', data);
            
            this.renderTokens(data.data || []);
            this.updateCount('tokensCount', data.data?.length || 0);
            
            console.log('✅ Tokens cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando tokens:', error);
            this.showTableError('tokensTableBody', `Error al cargar tokens: ${error.message}`);
        }
    }

    renderTokens(tokens) {
        const tbody = document.getElementById('tokensTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento tokensTableBody no encontrado');
            return;
        }
        
        if (tokens.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay tokens disponibles
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
        
        console.log(`✅ ${tokens.length} tokens renderizados`);
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
            console.log('📊 Sessions data:', data);
            console.log('📊 Sessions count:', data.data ? data.data.length : 0);
            
            // Almacenar todas las sesiones para filtrado
            this.allSessions = data.data || [];
            console.log('💾 Stored sessions:', this.allSessions.length);
            
            // Aplicar filtro y renderizar
            this.filterSessions();
            
            console.log('✅ Sesiones cargadas exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando sesiones:', error);
            this.showTableError('sessionsTableBody', `Error al cargar sesiones: ${error.message}`);
        }
    }

    renderSessions(sessions) {
        console.log('🎨 Renderizando sesiones:', sessions.length);
        console.log('🎨 Sessions data:', sessions);
        
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
                    <td colspan="9" class="text-center text-muted py-4">
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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

    filterSessions() {
        try {
            console.log('🔍 Iniciando filtro de sesiones');
            console.log('🔍 allSessions:', this.allSessions);
            console.log('🔍 allSessions length:', this.allSessions ? this.allSessions.length : 'undefined');
            
            const filterActiveCheckbox = document.getElementById('filterActiveSessions');
            const showOnlyActive = filterActiveCheckbox ? filterActiveCheckbox.checked : false;
            
            console.log('🔍 Aplicando filtro de sesiones:', showOnlyActive ? 'Solo activas' : 'Todas');
            console.log('🔍 Filter checkbox found:', !!filterActiveCheckbox);
            console.log('🔍 Filter checkbox checked:', showOnlyActive);
            
            let filteredSessions = this.allSessions || [];
            
            if (showOnlyActive) {
                filteredSessions = this.allSessions.filter(session => 
                    session.status === 'ACTIVE'
                );
                console.log(`📊 Filtradas ${filteredSessions.length} sesiones activas de ${this.allSessions.length} totales`);
            } else {
                console.log(`📊 Mostrando todas las ${filteredSessions.length} sesiones`);
            }
            
            console.log('🔍 Filtered sessions:', filteredSessions);
            
            this.renderSessions(filteredSessions);
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
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                    }
                }),
                fetch(`${this.baseUrl}/ocpi/emsp/2.2/evses`, {
                    headers: { 
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
            
            console.log('📊 EMSP Locations data:', locationsData);
            console.log('📊 EMSP EVSEs data:', evsesData);
            
            // Crear un mapa de conteo de EVSEs por location
            const evseCountMap = {};
            if (evsesData.data && Array.isArray(evsesData.data)) {
                evsesData.data.forEach(evse => {
                    const locationId = evse.location_id;
                    evseCountMap[locationId] = (evseCountMap[locationId] || 0) + 1;
                });
            }
            
            this.renderEmspLocations(locationsData.data || [], evseCountMap);
            this.updateCount('emspLocationsCount', locationsData.data?.length || 0);
            
            console.log('✅ EMSP Locations cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP locations:', error);
            this.showTableError('emspLocationsTableBody', `Error al cargar EMSP locations: ${error.message}`);
        }
    }

    renderEmspLocations(locations, evseCountMap = {}) {
        const tbody = document.getElementById('emspLocationsTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento emspLocationsTableBody no encontrado');
            return;
        }
        
        if (locations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay EMSP locations disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = locations.map(location => {
            // Obtener el conteo de EVSEs del mapa
            const evseCount = evseCountMap[location.id] || 0;

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

    // Cargar EVSEs de eMSPs
    async loadEmspEvses() {
        try {
            console.log('🔄 Cargando EMSP EVSEs...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/evses`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 EMSP EVSEs data:', data);
            
            this.renderEmspEvses(data.data || []);
            this.updateCount('emspEvsesCount', data.data?.length || 0);
            this.populateEmspPartyFilter(data.data || []);
            
            console.log('✅ EMSP EVSEs cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP EVSEs:', error);
            this.showTableError('emspEvsesTableBody', `Error al cargar EMSP EVSEs: ${error.message}`);
        }
    }

    renderEmspEvses(evses) {
        const tbody = document.getElementById('emspEvsesTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento emspEvsesTableBody no encontrado');
            return;
        }
        
        if (evses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay EMSP EVSEs disponibles
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
        
        console.log(`✅ ${evses.length} EMSP EVSEs renderizados`);
    }

    // Cargar tariffs de eMSPs
    async loadEmspTariffs() {
        try {
            console.log('🔄 Cargando EMSP tariffs...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tariffs`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 EMSP Tariffs data:', data);
            
            this.renderEmspTariffs(data.data || []);
            this.updateCount('emspTariffsCount', data.data?.length || 0);
            
            console.log('✅ EMSP Tariffs cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP tariffs:', error);
            this.showTableError('emspTariffsTableBody', `Error al cargar EMSP tariffs: ${error.message}`);
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
                    <td colspan="8" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay EMSP tariffs disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tariffs.map(tariff => `
            <tr class="fade-in">
                <td><code>${tariff.id}</code></td>
                <td><span class="badge bg-info">${tariff.emsp_party_id}</span></td>
                <td>${tariff.type}</td>
                <td>${tariff.currency}</td>
                <td>${this.getElementsCount(tariff.elements)} elementos</td>
                <td>${tariff.start_date_time ? new Date(tariff.start_date_time).toLocaleDateString() : 'N/A'}</td>
                <td>${tariff.end_date_time ? new Date(tariff.end_date_time).toLocaleDateString() : 'N/A'}</td>
                <td>${new Date(tariff.last_updated).toLocaleString()}</td>
            </tr>
        `).join('');
        
        console.log(`✅ ${tariffs.length} EMSP tariffs renderizados`);
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

    // Cargar tariffs del CPO
    async loadTariffs() {
        try {
            console.log('🔄 Cargando tariffs del CPO...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/tariffs`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Tariffs data:', data);
            
            // Almacenar tarifas para uso en tooltips
            this.allTariffs = data.data || [];
            
            this.renderTariffs(this.allTariffs);
            this.updateCount('tariffsCount', this.allTariffs.length);
            
            console.log('✅ Tariffs del CPO cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando tariffs del CPO:', error);
            this.showTableError('tariffsTableBody', `Error al cargar tariffs: ${error.message}`);
        }
    }

    renderTariffs(tariffs) {
        const tbody = document.getElementById('tariffsTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento tariffsTableBody no encontrado');
            return;
        }
        
        if (tariffs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay tariffs disponibles
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
        
        console.log(`✅ ${tariffs.length} tariffs renderizados`);
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    const uuid = this.generateUUID();
                    idField.value = uuid;
                    console.log(`✅ ID de conector ${index + 1} generado:`, uuid);
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
            
            const connectorHtml = `
                <div class="evse-connector border rounded p-3 mb-2">
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
                        <div class="col-md-4">
                            <label class="form-label">Voltaje (V)</label>
                            <input type="number" class="form-control connector-voltage" value="230" min="0" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Amperaje (A)</label>
                            <input type="number" class="form-control connector-amperage" value="32" min="0" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Potencia Máxima (W)</label>
                            <input type="number" class="form-control connector-max-power" min="0" placeholder="Calculado automáticamente">
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
                idField.value = this.generateUUID();
            }
            
            // Event listener para el botón de generar ID
            const generateBtn = newConnector.querySelector('.generate-connector-id');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => {
                    idField.value = this.generateUUID();
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                const maxPower = voltage * amperage;
                
                return {
                    id: connector.querySelector('.connector-id').value,
                    standard: connector.querySelector('.connector-standard').value,
                    format: connector.querySelector('.connector-format').value,
                    power_type: connector.querySelector('.connector-power-type').value,
                    max_voltage: voltage,
                    max_amperage: amperage,
                    max_electric_power: maxPower,
                    tariff_ids: [],
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                            'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
            this.fillEditEvseForm(evseData);
            
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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

    fillEditEvseForm(evseData) {
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
            this.fillEditEvseConnectors(evseData.connectors || []);
            
            console.log('✅ Formulario de edición de EVSE llenado exitosamente');
            
        } catch (error) {
            console.error('❌ Error llenando formulario de edición de EVSE:', error);
            throw error;
        }
    }

    fillEditEvseConnectors(connectors) {
        try {
            const container = document.getElementById('editEvseConnectorsContainer');
            if (!container) {
                console.warn('⚠️ Container de conectores de edición no encontrado');
                return;
            }
            
            // Limpiar conectores existentes
            container.innerHTML = '';
            
            // Agregar cada conector
            connectors.forEach((connector, index) => {
                this.addEditEvseConnectorHtml(connector, index);
            });
            
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
                    <div class="col-md-4">
                        <label class="form-label">Voltaje (V)</label>
                        <input type="number" class="form-control connector-voltage" value="${connector.voltage || 230}" min="0" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Amperaje (A)</label>
                        <input type="number" class="form-control connector-amperage" value="${connector.amperage || 32}" min="0" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Potencia Máxima (W)</label>
                        <input type="number" class="form-control connector-max-power" value="${connector.max_power || ''}" min="0" placeholder="Calculado automáticamente">
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
                        input.value = this.generateUUID();
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                const connector = {
                    id: connectorElement.querySelector('.connector-id').value.trim(),
                    standard: connectorElement.querySelector('.connector-standard').value.trim(),
                    format: connectorElement.querySelector('.connector-format').value.trim(),
                    power_type: connectorElement.querySelector('.connector-power-type').value.trim(),
                    max_voltage: parseInt(connectorElement.querySelector('.connector-voltage').value) || 230,
                    max_amperage: parseInt(connectorElement.querySelector('.connector-amperage').value) || 32,
                    max_electric_power: parseInt(connectorElement.querySelector('.connector-max-power').value) || null,
                    tariff_ids: [],
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                            'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 EMSP Tokens data:', data);
            
            this.renderEmspTokens(data.data || []);
            this.updateCount('emspTokensCount', data.data?.length || 0);
            
            console.log('✅ EMSP Tokens cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando EMSP tokens:', error);
            this.showTableError('emspTokensTableBody', `Error al cargar EMSP tokens: ${error.message}`);
        }
    }

    renderEmspTokens(tokens) {
        const tbody = document.getElementById('emspTokensTableBody');
        if (!tbody) {
            console.warn('⚠️ Elemento emspTokensTableBody no encontrado');
            return;
        }
        
        if (tokens.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay EMSP tokens disponibles
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
                <td>${new Date(token.last_updated).toLocaleString()}</td>
            </tr>
        `).join('');
        
        console.log(`✅ ${tokens.length} EMSP tokens renderizados`);
    }

    // Funciones de filtrado EMSP
    populateEmspPartyFilter(evses) {
        const partyFilter = document.getElementById('emspEvsePartyFilter');
        if (!partyFilter) return;

        const parties = [...new Set(evses.map(evse => evse.emsp_party_id))];
        partyFilter.innerHTML = '<option value="">Todos los eMSPs</option>' + 
            parties.map(party => `<option value="${party}">${party}</option>`).join('');
    }

    applyEmspEvseFilters() {
        const statusFilter = document.getElementById('emspEvseStatusFilter')?.value || '';
        const partyFilter = document.getElementById('emspEvsePartyFilter')?.value || '';
        const searchFilter = document.getElementById('emspEvseSearchFilter')?.value || '';

        const rows = document.querySelectorAll('#emspEvsesTable tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            if (row.cells.length < 7) return; // Skip header rows

            const status = row.cells[4]?.textContent || '';
            const party = row.cells[2]?.textContent || '';
            const searchText = row.textContent.toLowerCase();

            const statusMatch = !statusFilter || status.includes(statusFilter);
            const partyMatch = !partyFilter || party.includes(partyFilter);
            const searchMatch = !searchFilter || searchText.includes(searchFilter.toLowerCase());

            if (statusMatch && partyMatch && searchMatch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        console.log(`🔍 Filtros EMSP EVSE aplicados: ${visibleCount} filas visibles`);
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

    // ===== FUNCIONES PARA CONSULTAR CPOs (ROL EMSP) =====
    
    // Cargar conexiones disponibles en el selector
    async loadCpoConnections() {
        try {
            console.log('🔄 Cargando conexiones CPO...');
            
            const response = await fetch(`${this.baseUrl}/api/connections`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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

    // Obtener locations del CPO
    async getCpoLocations() {
        try {
            const cpoUrl = document.getElementById('cpoUrlExtActions').value;
            const cpoToken = document.getElementById('cpoTokenExtActions').value;
            const cpoVersion = document.getElementById('cpoVersion').value;

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🌐 Consultando locations del CPO:', cpoUrl);
            
            // Crear headers con soporte para ngrok
            const headers = this.createCpoHeaders(cpoToken);
            if (this.isNgrokUrl(cpoUrl)) {
                headers['ngrok-skip-browser-warning'] = 'true';
            }

            const response = await fetch(`${cpoUrl}/ocpi/cpo/${cpoVersion}/locations`, {
                headers: headers
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            this.showCpoResponse(JSON.stringify(data, null, 2), 'success');
            
            console.log('✅ Locations del CPO obtenidas exitosamente');
            
            // Guardar las locations en nuestra base de datos
            if (data.data && Array.isArray(data.data)) {
                console.log(`💾 Guardando ${data.data.length} locations en base de datos...`);
                await this.saveCpoLocationsToDatabase(cpoUrl, cpoToken, cpoVersion, data.data);
            }
            
        } catch (error) {
            console.error('❌ Error consultando CPO:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Obtener Sessions de organizaciones externas conectadas
    async getCpoSessions() {
        try {
            console.log('🌐 Consultando Sessions de organizaciones externas conectadas...');
            
            const response = await fetch(`${this.baseUrl}/emsp/actions/get-external-sessions`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`,
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
            const cpoUrl = document.getElementById('cpoUrlExtActions').value;
            const cpoToken = document.getElementById('cpoTokenExtActions').value;
            const cpoVersion = document.getElementById('cpoVersion').value || '2.2';

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🌐 Consultando tariffs del CPO:', cpoUrl);
            
            // Crear headers con soporte para ngrok
            const headers = this.createCpoHeaders(cpoToken);
            if (this.isNgrokUrl(cpoUrl)) {
                headers['ngrok-skip-browser-warning'] = 'true';
            }

            const response = await fetch(`${cpoUrl}/ocpi/cpo/${cpoVersion}/tariffs`, {
                headers: headers
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            this.showCpoResponse(JSON.stringify(data, null, 2), 'success');
            
            console.log('✅ Tariffs del CPO obtenidos exitosamente');

            // Guardar los tariffs en la tabla emsp_tariffs
            if (data.data && Array.isArray(data.data)) {
                console.log(`💾 Guardando ${data.data.length} tariffs en tabla emsp_tariffs...`);
                await this.saveCpoTariffsToDatabase(data.data);
            }
            
        } catch (error) {
            console.error('❌ Error consultando CPO:', error);
            this.showCpoResponse(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Obtener tokens del CPO externo usando /ocpi/emsp/2.2/tokens
    async getCpoTokens() {
        try {
            const cpoUrl = document.getElementById('cpoUrlExtActions').value;
            const cpoToken = document.getElementById('cpoTokenExtActions').value;
            const cpoVersion = document.getElementById('cpoVersion').value || '2.2';

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🔑 Consultando tokens del CPO usando endpoint /emsp/2.2/tokens:', cpoUrl);

            // Crear headers con soporte para ngrok
            const headers = this.createCpoHeaders(cpoToken);
            if (this.isNgrokUrl(cpoUrl)) {
                headers['ngrok-skip-browser-warning'] = 'true';
            }

            const response = await fetch(`${cpoUrl}/ocpi/emsp/${cpoVersion}/tokens`, {
                headers: headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            this.showCpoResponse(JSON.stringify(data, null, 2), 'success');

            console.log('✅ Tokens del CPO externo obtenidos exitosamente');

            // Guardar los tokens en la tabla emsp_tokens
            if (data.data && Array.isArray(data.data)) {
                console.log(`💾 Guardando ${data.data.length} tokens en tabla emsp_tokens...`);
                await this.saveEmspTokensToDatabase(data.data);
            }

        } catch (error) {
            console.error('❌ Error consultando tokens del CPO:', error);
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`,
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

            const response = await fetch(`${this.baseUrl}/api/charging-logs?sessionId=${this.currentChargingSession.sessionId}&limit=10`);
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    // Buscar la sesión más reciente con status ACTIVE del CPO EFI
                    const activeSessions = data.data.filter(session => 
                        session.party_id === 'EFI' && 
                        session.status === 'ACTIVE'
                    );
                    
                    if (activeSessions.length > 0) {
                        // Ordenar por last_updated descendente y tomar la más reciente
                        activeSessions.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
                        const latestSession = activeSessions[0];
                        
                        this.logToChargingConsole(`🔍 Session ID encontrado: ${latestSession.session_id}`, 'info');
                        return latestSession.session_id;
                    } else {
                        this.logToChargingConsole('⚠️ No se encontraron sesiones activas del CPO EFI', 'warning');
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
            const cpoUrl = document.getElementById('cpoUrlExtActions').value;
            const cpoToken = document.getElementById('cpoTokenExtActions').value;
            const cpoVersion = document.getElementById('cpoVersion').value || '2.2';

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🧾 Obteniendo CDRs del CPO:', cpoUrl);
            
            // Construir URL para obtener CDRs
            const cdrsUrl = `${cpoUrl}/ocpi/cpo/${cpoVersion}/cdrs`;
            
            console.log('📡 Enviando petición GET a:', cdrsUrl);
            
            const response = await fetch(cdrsUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${cpoToken}`,
                    'Content-Type': 'application/json',
                    'User-Agent': `${window.OCPI_PARTY_ID}-EMSP-OCPI-${window.OCPI_VERSION}`
                }
            });

            console.log('📊 Respuesta recibida:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ CDRs obtenidos exitosamente:', data);

            // Formatear la respuesta para mostrar
            const formattedResponse = `🧾 CDRs obtenidos del CPO:
📋 URL: ${cdrsUrl}
📊 Total de CDRs: ${data.data ? data.data.length : 0}
📅 Timestamp: ${data.timestamp || new Date().toISOString()}

📄 Datos recibidos:
${JSON.stringify(data, null, 2)}`;

            this.showCpoResponse(formattedResponse, 'success');

        } catch (error) {
            console.error('❌ Error obteniendo CDRs del CPO:', error);
            this.showCpoResponse(`❌ Error obteniendo CDRs: ${error.message}`, 'error');
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            this.allExtSessions = data.data || [];
            
            console.log(`✅ ${this.allExtSessions.length} sesiones externas cargadas`);
            console.log('🔍 Datos de sesiones externas:', this.allExtSessions);
            this.renderExtSessions();
            this.updateExtSessionsCount();
            
        } catch (error) {
            console.error('❌ Error cargando sesiones externas:', error);
            this.renderExtSessionsError();
        }
    }

    renderExtSessions() {
        console.log('🎨 Iniciando renderExtSessions...');
        console.log('📊 allExtSessions:', this.allExtSessions);
        console.log('🔍 filterActiveExtSessions:', this.filterActiveExtSessions);
        
        const tbody = document.getElementById('extSessionsTableBody');
        if (!tbody) {
            console.error('❌ No se encontró extSessionsTableBody');
            return;
        }

        if (this.allExtSessions.length === 0) {
            console.log('⚠️ No hay sesiones externas para mostrar');
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-muted py-4">
                        <i class="bi bi-cloud-download fs-1 d-block mb-2"></i>
                        No hay sesiones externas disponibles
                    </td>
                </tr>
            `;
            return;
        }

        const sessionsToShow = this.filterActiveExtSessions ? 
            this.allExtSessions.filter(session => 
                session.status === 'ACTIVE' || 
                session.status === 'PENDING' || 
                session.status === 'IN_PROGRESS'
            ) : 
            this.allExtSessions;
            
        console.log('🔍 Sesiones a mostrar:', sessionsToShow.length);
        console.log('📋 Datos de sesiones a mostrar:', sessionsToShow);
        
        // Debug: mostrar los status únicos de las sesiones
        const uniqueStatuses = [...new Set(this.allExtSessions.map(s => s.status))];
        console.log('🏷️ Status únicos encontrados:', uniqueStatuses);

        tbody.innerHTML = sessionsToShow.map(session => `
            <tr>
                <td>
                    <span class="text-truncate d-inline-block" style="max-width: 150px;" 
                          title="${session.session_id}">
                        ${session.session_id}
                    </span>
                </td>
                <td>
                    <span class="badge bg-info">${session.emsp_party_id}</span>
                </td>
                <td>
                    <span class="text-truncate d-inline-block" style="max-width: 100px;" 
                          title="${session.id_token || 'N/A'}">
                        ${session.id_token || 'N/A'}
                    </span>
                </td>
                <td>
                    <span class="text-truncate d-inline-block" style="max-width: 100px;" 
                          title="${session.evse_uid || 'N/A'}">
                        ${session.evse_uid || 'N/A'}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getExtSessionStatusBadgeClass(session.status)}">
                        ${session.status || 'UNKNOWN'}
                    </span>
                </td>
                <td>
                    ${session.start_date_time ? new Date(session.start_date_time).toLocaleString('es-ES') : 'N/A'}
                </td>
                <td>
                    ${session.end_date_time ? new Date(session.end_date_time).toLocaleString('es-ES') : 'N/A'}
                </td>
                <td>
                    ${session.kwh ? parseFloat(session.kwh).toFixed(3) : '0.000'} kWh
                </td>
                <td>
                    ${session.total_cost ? `€${parseFloat(session.total_cost).toFixed(2)}` : 'N/A'}
                </td>
                <td>
                    <span class="badge bg-secondary">${session.currency || 'EUR'}</span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-info btn-sm" 
                                onclick="window.dashboardApp.viewExtSessionDetails('${session.session_id}')"
                                title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${session.status === 'ACTIVE' || session.status === 'IN_PROGRESS' ? `
                            <button class="btn btn-outline-danger btn-sm" 
                                    onclick="window.dashboardApp.closeExtSession('${session.session_id}', '${session.evse_uid || ''}')"
                                    title="Cerrar sesión">
                                <i class="bi bi-stop-circle"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
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
    }

    filterExtSessions() {
        try {
            console.log('🔍 Iniciando filtro de sesiones externas');
            // Actualizar el estado del filtro desde el checkbox
            const filterCheckbox = document.getElementById('filterActiveExtSessions');
            if (filterCheckbox) {
                this.filterActiveExtSessions = filterCheckbox.checked;
                console.log('🔍 Estado del filtro actualizado:', this.filterActiveExtSessions);
            }
            this.renderExtSessions();
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

    viewExtSessionDetails(sessionId) {
        const session = this.allExtSessions.find(s => s.session_id === sessionId);
        if (!session) {
            this.showNotification('Sesión no encontrada', 'error');
            return;
        }

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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`
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
            
            // Confirmar acción
            if (!confirm(`¿Estás seguro de que quieres cerrar la sesión ${sessionId}?`)) {
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
                status: 'COMPLETED',
                end_datetime: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };

            console.log('📝 Actualizando sesión en BD:', updateData);

            const response = await fetch(`${this.baseUrl}/api/ext-sessions/${sessionId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                console.log('✅ Sesión actualizada exitosamente');
                this.showNotification(`Sesión ${sessionId} cerrada exitosamente`, 'success');
                
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
