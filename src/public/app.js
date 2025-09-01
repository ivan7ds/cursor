

class DashboardApp {
    constructor() {
        console.log('🚀 Constructor DashboardApp iniciado');
        this.baseUrl = window.location.origin;
        this.currentTab = 'logs';
        this.logsStreaming = false;
        this.logsEventSource = null;
        
        console.log('✅ Constructor completado');
    }

    init() {
        console.log('🚀 Inicializando Dashboard...');
        
        try {
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

    setupBasic() {
        console.log('🔧 Configurando funcionalidad básica...');
        
        try {
            // Solo configurar lo básico por ahora
            this.setupSimpleEventListeners();
            this.updateConnectionStatus();
            
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

            const getCpoEvses = document.getElementById('getCpoEvses');
            if (getCpoEvses) {
                getCpoEvses.addEventListener('click', () => {
                    console.log('🌐 Botón getCpoEvses clickeado');
                    this.getCpoEvses();
                });
                console.log('✅ Event listener para getCpoEvses agregado');
            } else {
                console.warn('⚠️ Elemento getCpoEvses no encontrado');
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
            
            // Crear botón de prueba
            this.createTestButton();
            
        } catch (error) {
            console.error('❌ Error configurando event listeners simples:', error);
        }
    }

    createTestButton() {
        try {
            console.log('🧪 Creando botón de prueba...');
            
            // Crear un botón de prueba
            const testButton = document.createElement('button');
            testButton.id = 'testButton';
            testButton.textContent = '🧪 BOTÓN DE PRUEBA';
            testButton.className = 'btn btn-danger btn-sm';
            testButton.style.position = 'fixed';
            testButton.style.top = '10px';
            testButton.style.right = '10px';
            testButton.style.zIndex = '9999';
            
            // Event listener simple
            testButton.addEventListener('click', () => {
                console.log('🧪 ¡BOTÓN DE PRUEBA FUNCIONA!');
                alert('¡El botón de prueba funciona!');
            });
            
            document.body.appendChild(testButton);
            console.log('✅ Botón de prueba creado y agregado al DOM');
            
        } catch (error) {
            console.error('❌ Error creando botón de prueba:', error);
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
                case 'emsp-sessions':
                    console.log('📝 Pestaña de EMSP sessions - no requiere carga de datos');
                    break;
                case 'emsp-cdrs':
                    console.log('📝 Pestaña de EMSP CDRs - no requiere carga de datos');
                    break;
                case 'emsp-tokens':
                    this.loadEmspTokens(); // Cargar tokens de EMSP específicamente
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

    addLogEntry(logData) {
        console.log('📝 Nuevo log recibido:', logData);
        
        const container = document.getElementById('logsContainer');
        if (!container) return;

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry fade-in';
        
        const timestamp = new Date(logData.timestamp || Date.now()).toLocaleTimeString();
        const level = logData.level || 'INFO';
        const message = logData.message || JSON.stringify(logData);
        
        logEntry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-level ${level.toLowerCase()}">${level}</span>
            <span class="log-message">${this.escapeHtml(message)}</span>
        `;
        
        container.insertBefore(logEntry, container.firstChild);
        
        // Limitar logs a 100 entradas
        const entries = container.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[entries.length - 1].remove();
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
        
        console.log('📊 Filtros activos:', { levelFilter, typeFilter, searchFilter });
        
        const logEntries = document.querySelectorAll('#logsContainer .log-entry');
        let visibleCount = 0;
        
        logEntries.forEach(entry => {
            const level = entry.querySelector('.log-level')?.textContent || '';
            const message = entry.querySelector('.log-message')?.textContent || '';
            
            // Aplicar filtro de nivel
            let levelMatch = true;
            if (levelFilter && level !== levelFilter) {
                levelMatch = false;
            }
            
            // Aplicar filtro de tipo (basado en el mensaje)
            let typeMatch = true;
            if (typeFilter) {
                const messageUpper = message.toUpperCase();
                if (typeFilter === 'API' && !messageUpper.includes('API')) typeMatch = false;
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
            if (levelMatch && typeMatch && searchMatch) {
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
            
            this.renderLocations(data.data || []);
            this.updateCount('locationsCount', data.data?.length || 0);
            
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
                    <td colspan="7" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay locations disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = locations.map(location => `
            <tr class="fade-in">
                <td><code>${location.id}</code></td>
                <td>${location.name || 'N/A'}</td>
                <td>${location.country_code}</td>
                <td>${location.city || 'N/A'}</td>
                <td>${location.address || 'N/A'}</td>
                <td><span class="badge bg-secondary">${location.evses?.length || 0}</span></td>
                <td>${new Date(location.last_updated).toLocaleString()}</td>
            </tr>
        `).join('');
        
        console.log(`✅ ${locations.length} locations renderizadas`);
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
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/evses?limit=200`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
            
            this.renderEvses(data.data || []);
            this.updateCount('evsesCount', data.data?.length || 0);
            
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
                    <td colspan="6" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay EVSEs disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = evses.map(evse => `
            <tr class="fade-in">
                <td><code>${evse.evse_id}</code></td>
                <td><code>${evse.id}</code></td>
                <td><code>${evse.location_id}</code></td>
                <td><span class="badge status-badge status-${evse.status}">${evse.status}</span></td>
                <td>${evse.connectors?.length || 0}</td>
                <td>${new Date(evse.last_updated).toLocaleString()}</td>
            </tr>
        `).join('');
        
        console.log(`✅ ${evses.length} EVSEs renderizados`);
    }

    async loadConnections() {
        try {
            console.log('🔄 Cargando conexiones...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/cpo/2.2/credentials`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
                    <td colspan="6" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay conexiones disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = connections.map(conn => `
            <tr class="fade-in">
                <td><code>${conn.party_id}</code></td>
                <td>${conn.country_code}</td>
                <td><a href="${conn.url}" target="_blank" class="text-decoration-none">${conn.url}</a></td>
                <td><code>${this.truncateToken(conn.token)}</code></td>
                <td>${new Date(conn.last_updated).toLocaleString()}</td>
                <td><span class="badge bg-success">Activa</span></td>
            </tr>
        `).join('');
        
        console.log(`✅ ${connections.length} conexiones renderizadas`);
    }

    async loadTokens() {
        try {
            console.log('🔄 Cargando tokens...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tokens`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
                    }
                }),
                fetch(`${this.baseUrl}/ocpi/emsp/2.2/evses`, {
                    headers: { 
                        'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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

    // Cargar tokens de eMSPs
    async loadEmspTokens() {
        try {
            console.log('🔄 Cargando EMSP tokens...');
            
            const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tokens/stored`, {
                headers: { 
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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

    // ===== FUNCIONES PARA CONSULTAR CPOs (ROL EMSP) =====
    
    // Obtener versión del CPO
    async getCpoVersions() {
        try {
            const cpoUrl = document.getElementById('cpoUrl').value;
            const cpoToken = document.getElementById('cpoToken').value;
            const cpoVersion = document.getElementById('cpoVersion').value;

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🌐 Consultando versiones del CPO:', cpoUrl);
            
            const response = await fetch(`${cpoUrl}/ocpi/versions`, {
                headers: { 
                    'Authorization': `Token ${cpoToken}`,
                    'Content-Type': 'application/json'
                }
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
            const cpoUrl = document.getElementById('cpoUrl').value;
            const cpoToken = document.getElementById('cpoToken').value;
            const cpoVersion = document.getElementById('cpoVersion').value;

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🌐 Consultando locations del CPO:', cpoUrl);
            
            const response = await fetch(`${cpoUrl}/ocpi/cpo/${cpoVersion}/locations`, {
                headers: { 
                    'Authorization': `Token ${cpoToken}`,
                    'Content-Type': 'application/json'
                }
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

    // Obtener EVSEs del CPO
    async getCpoEvses() {
        try {
            const cpoUrl = document.getElementById('cpoUrl').value;
            const cpoToken = document.getElementById('cpoToken').value;
            const cpoVersion = document.getElementById('cpoVersion').value;

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🌐 Consultando EVSEs del CPO:', cpoUrl);
            
            const response = await fetch(`${cpoUrl}/ocpi/cpo/${cpoVersion}/evses`, {
                headers: { 
                    'Authorization': `Token ${cpoToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            this.showCpoResponse(JSON.stringify(data, null, 2), 'success');
            
            console.log('✅ EVSEs del CPO obtenidos exitosamente');
            
        } catch (error) {
            console.error('❌ Error consultando CPO:', error);
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
            const cpoUrl = document.getElementById('cpoUrl').value;
            const cpoToken = document.getElementById('cpoToken').value;
            const cpoVersion = document.getElementById('cpoVersion').value || '2.2';

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🌐 Consultando tariffs del CPO:', cpoUrl);
            
            const response = await fetch(`${cpoUrl}/ocpi/cpo/${cpoVersion}/tariffs`, {
                headers: { 
                    'Authorization': `Token ${cpoToken}`,
                    'Content-Type': 'application/json'
                }
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
            const cpoUrl = document.getElementById('cpoUrl').value;
            const cpoToken = document.getElementById('cpoToken').value;
            const cpoVersion = document.getElementById('cpoVersion').value || '2.2';

            if (!cpoUrl || !cpoToken) {
                this.showCpoResponse('❌ Error: URL y Token del CPO son obligatorios', 'error');
                return;
            }

            console.log('🔑 Consultando tokens del CPO usando endpoint /emsp/2.2/tokens:', cpoUrl);

            const response = await fetch(`${cpoUrl}/ocpi/emsp/${cpoVersion}/tokens`, {
                headers: {
                    'Authorization': `Token ${cpoToken}`,
                    'Content-Type': 'application/json'
                }
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
                    'Authorization': `Token ${localStorage.getItem('ocpi_token') || 'OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb'}`
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
}

// Inicializar la aplicación cuando el DOM esté listo
console.log('📜 Script app.js cargado');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM Content Loaded event disparado');
    try {
        window.dashboardApp = new DashboardApp();
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
