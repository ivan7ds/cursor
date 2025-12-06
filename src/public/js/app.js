/**
 * Dashboard App - Archivo principal modularizado
 * Coordina todos los módulos de la aplicación
 */

import { ApiUtils } from './utils/api.js'
import { UIUtils } from './utils/ui.js'
import { PaginationUtils } from './utils/pagination.js'

// Importar módulos
import { LogsModule } from './modules/logs.js'
import { HandshakeModule } from './modules/handshake.js'
import { TariffsModule } from './modules/tariffs.js'
import { DataLoadingModule } from './modules/dataLoading.js'
import { EVSEDeleteModule } from './modules/evseDelete.js'
import { LocationEditModule } from './modules/locationEdit.js'
import { LocationsModule } from './modules/locations.js'
import { TokensModule } from './modules/tokens.js'
import { EVSEStatusModule } from './modules/evseStatus.js'
import { LocationsPaginationModule } from './modules/locationsPagination.js'
import { EVSEsModule } from './modules/evses.js'
import { EVSEEditModule } from './modules/evseEdit.js'
import { LocationDeleteModule } from './modules/locationDelete.js'
import { EMSPModule } from './modules/emsp.js'
import { CPOModule } from './modules/cpo.js'
import { ExtSessionsModule } from './modules/extSessions.js'
import { SessionsModule } from './modules/sessions.js'
import { TestModule } from './modules/test.js'

class DashboardApp {
  constructor () {
    console.log('🚀 Constructor DashboardApp iniciado')
    this.baseUrl = window.location.origin
    this.currentTab = 'logs'

    // Inicializar utilidades
    this.api = ApiUtils
    this.ui = UIUtils
    this.pagination = PaginationUtils

    // Estado de la aplicación
    this.initializeState()

    // Inicializar módulos
    this.logsModule = new LogsModule(this)
    this.handshakeModule = new HandshakeModule(this)
    this.tariffsModule = new TariffsModule(this)
    this.dataLoadingModule = new DataLoadingModule(this)
    this.evseDeleteModule = new EVSEDeleteModule(this)
    this.locationEditModule = new LocationEditModule(this)
    this.locationsModule = new LocationsModule(this)
    this.tokensModule = new TokensModule(this)
    this.evseStatusModule = new EVSEStatusModule(this)
    this.locationsPaginationModule = new LocationsPaginationModule(this)
    this.evsesModule = new EVSEsModule(this)
    this.evseEditModule = new EVSEEditModule(this)
    this.locationDeleteModule = new LocationDeleteModule(this)
    this.emspModule = new EMSPModule(this)
    this.cpoModule = new CPOModule(this)
    this.extSessionsModule = new ExtSessionsModule(this)
    this.sessionsModule = new SessionsModule(this)
    this.testModule = new TestModule(this)

    console.log('✅ Constructor completado')
  }

  initializeState () {
    // Estado de logs
    this.logsStreaming = false
    this.logsEventSource = null
    this.logPollingInterval = null

    // Estado de sesiones
    this.allSessions = []
    this.filteredSessions = []
    this.currentSessionsPage = 1
    this.sessionsPerPage = 20

    // Estado de sesiones externas
    this.allExtSessions = []
    this.filteredExtSessions = []
    this.currentExtSessionsPage = 1
    this.extSessionsPerPage = 20
    this.extSessionsSearchQuery = ''
    this.filterActiveExtSessions = true

    // Estado de tokens
    this.allTokens = []
    this.filteredTokens = []
    this.currentTokensPage = 1
    this.tokensPerPage = 20

    // Estado de EVSEs
    this.allEvses = []
    this.filteredEvses = []
    this.currentEvsesPage = 1
    this.evsesPerPage = 20

    // Estado de locations
    this.allEmspLocations = []
    this.filteredEmspLocations = []
    this.currentEmspLocationsPage = 1
    this.emspLocationsPerPage = 20
    this.emspLocationsEvseCountMap = {}
    this.emspLocationNameMap = {}
    this.emspEvseIdMap = {}

    // Estado de EVSEs
    this.allEmspEvses = []
    this.filteredEmspEvses = []
    this.currentEmspEvsesPage = 1
    this.emspEvsesPerPage = 20
    this.emspEvsesFilters = {
      status: '',
      party: '',
      search: ''
    }

    // Estado de tarifas
    this.allTariffs = []
    this.filteredTariffs = []
    this.currentTariffsPage = 1
    this.tariffsPerPage = 20
    this.allEmspTariffs = []
    this.filteredEmspTariffs = []
    this.currentEmspTariffsPage = 1
    this.emspTariffsPerPage = 20

    // Estado de tokens externos
    this.allEmspTokens = []
    this.filteredEmspTokens = []
    this.currentEmspTokensPage = 1
    this.emspTokensPerPage = 20
    this.emspTokensFilters = {
      search: '',
      issuer: '',
      type: '',
      valid: '',
      whitelist: ''
    }

    // Estado de sesión de carga
    this.currentChargingSession = null
    this.cpoEvses = []

    // Estado de errores
    this.validationErrorsPage = 0
    this.currentValidationErrorId = null
    this.validationErrorsPollingInterval = null
    this.applicationErrorsPage = 0
    this.applicationErrorsVisible = false

    // Estado de polling
    this.activeSessionBannerPollingInterval = null

    // Configuración de servicios de test
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
    }
  }

  async init () {
    console.log('🚀 Inicializando Dashboard...')

    try {
      // Cargar configuraciones OCPI
      await this.loadOCPISettings()

      // Verificar que el DOM esté listo
      if (document.readyState === 'loading') {
        console.log('⏳ DOM aún cargando, esperando...')
        document.addEventListener('DOMContentLoaded', () => this.setupBasic())
      } else {
        console.log('✅ DOM ya está listo')
        this.setupBasic()
      }
    } catch (error) {
      console.error('❌ Error en init:', error)
    }
  }

  async loadOCPISettings () {
    try {
      const response = await fetch(`${this.baseUrl}/api/config/ocpi-settings`, {
        headers: {
          'Authorization': `Token ${this.api.getAuthToken()}`
        }
      })
      if (response.ok) {
        const responseData = await response.json()
        const settings = responseData.data || responseData
        window.OCPI_PARTY_ID = settings.partyId
        window.OCPI_COUNTRY_CODE = settings.countryCode
        window.OCPI_VERSION = settings.version
        console.log('🌐 OCPI Settings loaded:', settings)
      }
    } catch (error) {
      console.error('❌ Could not load OCPI settings:', error)
      window.OCPI_PARTY_ID = null
      window.OCPI_COUNTRY_CODE = null
      window.OCPI_VERSION = null
    }
  }

  setupBasic () {
    console.log('🔧 Configurando funcionalidad básica...')

    try {
      // Configurar event listeners básicos de logs
      this.setupLogsEventListeners()

      // Configurar event listeners de handshake
      this.setupHandshakeEventListeners()

      // Configurar event listeners de tariffs
      this.setupTariffsEventListeners()

      // Configurar event listeners de EVSE delete
      this.setupEvseDeleteEventListeners()

      // Configurar event listeners de location edit
      this.setupLocationEditEventListeners()

      // Configurar event listeners de locations (creación)
      this.setupLocationsEventListeners()

      // Configurar event listeners de tokens
      this.setupTokensEventListeners()

      // Configurar event listeners de cambio de estado EVSE
      this.setupEvseStatusEventListeners()

      // Configurar event listeners de paginación de locations
      this.setupLocationsPaginationEventListeners()

      // Configurar event listeners del modal de EVSEs
      this.setupEvseModalEventListeners()

      // Configurar event listeners de borrado de locations
      this.setupLocationDeleteEventListeners()

      // Configurar event listeners EMSP
      this.setupEmspEventListeners()

      // Configurar event listeners CPO
      this.setupCpoEventListeners()

      // Configurar event listeners para sesiones externas
      this.setupExtSessionsEventListeners()

      // Configurar event listeners para sesiones
      this.setupSessionsEventListeners()

      // Configurar event listeners para pestaña Test
      this.setupTestEventListeners()

      // Actualizar estado de conexión
      this.handshakeModule.updateConnectionStatus()

      // TODO: Configurar otros event listeners
      // this.loadCpoConnections()
      // this.startValidationErrorsPolling()
      // this.startActiveSessionBannerPolling()

      console.log('✅ Configuración básica completada')
    } catch (error) {
      console.error('❌ Error en setupBasic:', error)
    }
  }

  setupLogsEventListeners () {
    const startLogs = document.getElementById('startLogs')
    if (startLogs) {
      startLogs.addEventListener('click', () => {
        this.logsModule.startLogsStreaming()
      })
    }

    const stopLogs = document.getElementById('stopLogs')
    if (stopLogs) {
      stopLogs.addEventListener('click', () => {
        this.logsModule.stopLogsStreaming()
      })
    }

    const clearLogs = document.getElementById('clearLogs')
    if (clearLogs) {
      clearLogs.addEventListener('click', () => {
        this.logsModule.clearLogs()
      })
    }

    const removeDuplicates = document.getElementById('removeDuplicates')
    if (removeDuplicates) {
      removeDuplicates.addEventListener('click', () => {
        this.logsModule.removeDuplicateLogs()
        this.showNotification('Duplicados eliminados', 'success')
      })
    }

    // Event listeners para filtros de logs
    const logLevelFilter = document.getElementById('logLevelFilter')
    if (logLevelFilter) {
      logLevelFilter.addEventListener('change', () => {
        this.logsModule.applyLogFilters()
      })
    }

    const logTypeFilter = document.getElementById('logTypeFilter')
    if (logTypeFilter) {
      logTypeFilter.addEventListener('change', () => {
        this.logsModule.applyLogFilters()
      })
    }

    const logSearchFilter = document.getElementById('logSearchFilter')
    if (logSearchFilter) {
      logSearchFilter.addEventListener('input', () => {
        this.logsModule.applyLogFilters()
      })
    }

    const filterBrowserLogs = document.getElementById('filterBrowserLogs')
    if (filterBrowserLogs) {
      filterBrowserLogs.addEventListener('change', () => {
        this.logsModule.applyLogFilters()
      })
    }
  }

  setupHandshakeEventListeners () {
    const initiateHandshakeBtn = document.getElementById('initiateHandshakeBtn')
    if (initiateHandshakeBtn) {
      initiateHandshakeBtn.addEventListener('click', () => {
        this.handshakeModule.showHandshakeModal()
      })
    }

    const connectToCpoForm = document.getElementById('connectToCpoForm')
    if (connectToCpoForm) {
      connectToCpoForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handshakeModule.handleConnectToExternalOrganization()
      })
    }

    const generateCredentialsForm = document.getElementById('generateCredentialsForm')
    if (generateCredentialsForm) {
      generateCredentialsForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handshakeModule.handleGenerateCredentials()
      })
    }

    // Event listeners para cambio de pestañas
    const tabs = document.querySelectorAll('#dashboardTabs button[data-bs-toggle="tab"]')
    tabs.forEach(tab => {
      tab.addEventListener('shown.bs.tab', (e) => {
        const targetId = e.target.getAttribute('data-bs-target').replace('#', '')
        this.handshakeModule.loadTabData(targetId)
      })
    })
  }

  setupTariffsEventListeners () {
    // Configurar event listeners del modal de tarifas
    this.tariffsModule.setupTariffModalEventListeners()

    // Botón para crear tarifa
    const createTariffBtn = document.getElementById('createTariffBtn')
    if (createTariffBtn) {
      createTariffBtn.addEventListener('click', () => {
        this.tariffsModule.showCreateTariffModal()
      })
    }
  }

  setupEvseDeleteEventListeners () {
    // Configurar event listeners para borrado de EVSEs
    this.evseDeleteModule.setupEvseDeleteEventListeners()
    // Configurar event listeners para edición de EVSEs
    this.evseDeleteModule.setupEvseEditEventListeners()
  }

  setupLocationEditEventListeners () {
    // Configurar event listeners para edición de locations
    this.locationEditModule.setupLocationEditEventListeners()
    // Configurar event listeners del modal de edición
    this.locationEditModule.setupEditLocationModalEventListeners()
  }

  setupLocationsEventListeners () {
    // Configurar event listeners del modal de creación de locations
    this.locationsModule.setupLocationModalEventListeners()

    // Botón para crear location
    const createLocationBtn = document.getElementById('createLocationBtn')
    if (createLocationBtn) {
      createLocationBtn.addEventListener('click', () => {
        this.locationsModule.showCreateLocationModal()
      })
    }
  }

  setupTokensEventListeners () {
    // Configurar event listeners del modal de creación de tokens
    this.tokensModule.setupTokenModalEventListeners()

    // Botón para crear token
    const createTokenBtn = document.getElementById('createTokenBtn')
    if (createTokenBtn) {
      createTokenBtn.addEventListener('click', () => {
        this.tokensModule.showCreateTokenModal()
      })
    }

    // Botón para seleccionar todos los tokens
    const selectAllTokensBtn = document.getElementById('selectAllTokensBtn')
    if (selectAllTokensBtn) {
      selectAllTokensBtn.addEventListener('click', () => {
        this.tokensModule.toggleSelectAllTokens()
      })
    }

    // Botón para eliminar tokens seleccionados
    const deleteSelectedTokensBtn = document.getElementById('deleteSelectedTokensBtn')
    if (deleteSelectedTokensBtn) {
      deleteSelectedTokensBtn.addEventListener('click', () => {
        this.tokensModule.deleteSelectedTokens()
      })
    }
  }

  setupEvseStatusEventListeners () {
    // Botón para abrir modal de cambio de estado EVSE
    const changeEvseStatusBtn = document.getElementById('changeEvseStatusBtn')
    if (changeEvseStatusBtn) {
      changeEvseStatusBtn.addEventListener('click', () => {
        this.evseStatusModule.showChangeEvseStatusModal()
      })
    }

    // Selector de location para cambio de estado
    const changeEvseLocation = document.getElementById('changeEvseLocation')
    if (changeEvseLocation) {
      changeEvseLocation.addEventListener('change', () => {
        this.evseStatusModule.loadEvsesForStatusChange()
      })
    }

    // Selector de EVSE para cambio de estado
    const changeEvseSelector = document.getElementById('changeEvseSelector')
    if (changeEvseSelector) {
      changeEvseSelector.addEventListener('change', () => {
        this.evseStatusModule.showSelectedEvseInfo()
      })
    }

    // Botón de confirmar cambio de estado
    const confirmChangeEvseStatusBtn = document.getElementById('confirmChangeEvseStatusBtn')
    if (confirmChangeEvseStatusBtn) {
      confirmChangeEvseStatusBtn.addEventListener('click', () => {
        this.evseStatusModule.changeEvseStatus()
      })
    }
  }

  setupLocationsPaginationEventListeners () {
    // Botones de paginación de locations
    const locationsPrevPage = document.getElementById('locationsPrevPage')
    if (locationsPrevPage) {
      locationsPrevPage.addEventListener('click', () => {
        this.locationsPaginationModule.goToLocationsPrevPage()
      })
    }

    const locationsNextPage = document.getElementById('locationsNextPage')
    if (locationsNextPage) {
      locationsNextPage.addEventListener('click', () => {
        this.locationsPaginationModule.goToLocationsNextPage()
      })
    }
  }

  setupEvseModalEventListeners () {
    // Delegar a evsesModule
    if (this.evsesModule) {
      this.evsesModule.setupEvseModalEventListeners()
    }
  }

  setupLocationDeleteEventListeners () {
    // Delegar a locationDeleteModule
    if (this.locationDeleteModule) {
      this.locationDeleteModule.setupLocationDeleteEventListeners()
    }
  }

  setupEmspEventListeners () {
    // Delegar a emspModule
    if (this.emspModule) {
      this.emspModule.setupEmspEventListeners()
    }
  }

  setupCpoEventListeners () {
    // Delegar a cpoModule
    if (this.cpoModule) {
      this.cpoModule.setupCpoEventListeners()
    }
  }

  setupExtSessionsEventListeners () {
    // Delegar a extSessionsModule
    if (this.extSessionsModule) {
      this.extSessionsModule.setupExtSessionsEventListeners()
    }
  }

  setupSessionsEventListeners () {
    // Delegar a sessionsModule
    if (this.sessionsModule) {
      this.sessionsModule.setupSessionsEventListeners()
    }
  }

  setupTestEventListeners () {
    // Delegar a testModule
    if (this.testModule) {
      this.testModule.setupTestEventListeners()
    }
  }

  // Métodos delegados para carga de datos
  loadLocations () {
    if (this.dataLoadingModule && this.dataLoadingModule.loadLocations) {
      return this.dataLoadingModule.loadLocations()
    }
  }

  loadEvses () {
    if (this.evseStatusModule && this.evseStatusModule.loadEvses) {
      return this.evseStatusModule.loadEvses()
    } else if (this.locationsPaginationModule && this.locationsPaginationModule.loadEvses) {
      return this.locationsPaginationModule.loadEvses()
    }
  }

  loadConnections () {
    if (this.locationsPaginationModule && this.locationsPaginationModule.loadConnections) {
      return this.locationsPaginationModule.loadConnections()
    }
  }

  loadTokens () {
    if (this.locationsPaginationModule && this.locationsPaginationModule.loadTokens) {
      return this.locationsPaginationModule.loadTokens()
    } else if (this.tokensModule && this.tokensModule.loadTokens) {
      return this.tokensModule.loadTokens()
    }
  }

  loadSessions () {
    if (this.sessionsModule && this.sessionsModule.loadSessions) {
      return this.sessionsModule.loadSessions()
    } else if (this.locationsPaginationModule && this.locationsPaginationModule.loadSessions) {
      return this.locationsPaginationModule.loadSessions()
    }
  }

  async loadTariffs () {
    try {
      console.log('💰 Cargando tarifas del CPO...')

      const data = await ApiUtils.fetchWithAuth(`${this.baseUrl}/ocpi/cpo/2.2/tariffs`)

      // Almacenar tarifas para uso en tooltips
      this.allTariffs = Array.isArray(data.data) ? data.data : []
      this.filteredTariffs = [...this.allTariffs]
      this.currentTariffsPage = 1

      // Renderizar tarifas
      this.renderTariffs(this.allTariffs)
      this.ui.updateCount('tariffsCount', this.allTariffs.length)

      console.log('✅ Tarifas del CPO cargadas exitosamente')
    } catch (error) {
      console.error('❌ Error cargando tarifas del CPO:', error)
      this.ui.showTableError('tariffsTableBody', `Error al cargar tariffs: ${error.message}`)
      this.allTariffs = []
      this.filteredTariffs = []
      this.currentTariffsPage = 1
    }
  }

  renderTariffs (tariffs) {
    const tbody = document.getElementById('tariffsTableBody')
    if (!tbody) {
      console.warn('⚠️ Elemento tariffsTableBody no encontrado')
      return
    }

    if (tariffs.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> No hay tarifas disponibles
                    </td>
                </tr>
            `
      return
    }

    tbody.innerHTML = tariffs.map(tariff => `
            <tr class="fade-in">
                <td><code>${this.ui.escapeHtml(tariff.id || 'N/A')}</code></td>
                <td><span class="badge bg-secondary">${this.ui.escapeHtml(tariff.type || 'N/A')}</span></td>
                <td><span class="badge bg-info">${this.ui.escapeHtml(tariff.currency || 'N/A')}</span></td>
                <td>${tariff.elements ? tariff.elements.length : 0} elementos</td>
                <td>${tariff.min_price ? `${tariff.min_price} ${tariff.currency || ''}` : 'N/A'}</td>
                <td>${tariff.max_price ? `${tariff.max_price} ${tariff.currency || ''}` : 'N/A'}</td>
                <td>${tariff.start_date_time ? new Date(tariff.start_date_time).toLocaleString() : 'N/A'}</td>
                <td>${tariff.end_date_time ? new Date(tariff.end_date_time).toLocaleString() : 'N/A'}</td>
                <td>${tariff.last_updated ? new Date(tariff.last_updated).toLocaleString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="window.dashboardApp.deleteTariff('${tariff.id}')"
                            title="Eliminar tarifa">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('')
  }

  deleteTariff (tariffId) {
    if (this.locationDeleteModule && this.locationDeleteModule.deleteTariff) {
      return this.locationDeleteModule.deleteTariff(tariffId)
    }
  }

  loadExtSessions () {
    if (this.extSessionsModule && this.extSessionsModule.loadExtSessions) {
      return this.extSessionsModule.loadExtSessions()
    }
  }

  loadTestData () {
    if (this.testModule && this.testModule.loadTestData) {
      return this.testModule.loadTestData()
    }
  }

  // Métodos delegados para EMSP
  loadEmspLocations () {
    if (this.emspModule && this.emspModule.loadEmspLocations) {
      return this.emspModule.loadEmspLocations()
    }
  }

  loadEmspEvses () {
    if (this.emspModule && this.emspModule.loadEmspEvses) {
      return this.emspModule.loadEmspEvses()
    }
  }

  loadEmspTariffs () {
    if (this.emspModule && this.emspModule.loadEmspTariffs) {
      return this.emspModule.loadEmspTariffs()
    }
  }

  loadEmspTokens () {
    if (this.tokensModule && this.tokensModule.loadEmspTokens) {
      return this.tokensModule.loadEmspTokens()
    } else if (this.emspModule && this.emspModule.loadEmspTokens) {
      return this.emspModule.loadEmspTokens()
    }
  }

  // Métodos de utilidad delegados
  showNotification (message, type = 'info') {
    this.ui.showNotification(message, type)
  }

  showTableError (tbodyId, message, colspan = 10) {
    this.ui.showTableError(tbodyId, message, colspan)
  }

  updateCount (elementId, count) {
    this.ui.updateCount(elementId, count)
  }
}

// Inicializar la aplicación cuando el DOM esté listo
console.log('📜 Script app.js cargado')

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOM Content Loaded event disparado')
  try {
    window.dashboardApp = new DashboardApp()
    if (typeof global !== 'undefined') {
      global.dashboardApp = window.dashboardApp
    }
    window.dashboardApp.init()
    console.log('✅ Dashboard inicializado correctamente')
  } catch (error) {
    console.error('❌ Error inicializando dashboard:', error)
  }
})

// Manejar errores globales
window.addEventListener('error', (event) => {
  console.error('🚨 Error global:', event.error)
  if (window.dashboardApp) {
    window.dashboardApp.showNotification('Error inesperado en la aplicación', 'error')
  }
})

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Promesa rechazada no capturada:', event.reason)
  event.preventDefault()

  if (window.dashboardApp && event.reason && event.reason.message && !event.reason.message.includes('fetch')) {
    window.dashboardApp.showNotification('Error en operación asíncrona', 'error')
  }
})

