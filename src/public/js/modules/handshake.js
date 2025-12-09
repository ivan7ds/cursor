/**
 * Funciones de Handshake OCPI
 * Extraído de app.js (líneas 1251-1749)
 */

import { ApiUtils } from '../utils/api.js'

export class HandshakeModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES DE HANDSHAKE OCPI =====

  showHandshakeModal () {
    try {
      console.log('🔗 Mostrando modal de handshake...')
      const modal = new bootstrap.Modal(document.getElementById('handshakeModal'))
      modal.show()
      console.log('✅ Modal de handshake mostrado')
    } catch (error) {
      console.error('❌ Error mostrando modal de handshake:', error)
      this.app.showNotification('Error abriendo modal de conexión', 'error')
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
                countryCode: document.getElementById('cpoCountryCode').value,
                tokenBase64Encoded: document.getElementById('cpoTokenBase64').checked
            };
            
            console.log('📋 Datos del formulario:', formData);
            
      // Validar datos
      if (!formData.url || !formData.token || !formData.partyId || !formData.countryCode) {
        this.app.showNotification('Por favor, completa todos los campos', 'warning')
        return
      }

      // Mostrar loading
      this.app.showNotification('Conectando a organización externa...', 'info')

      // Llamar a la API
      const response = await fetch('/api/handshake/connect-to-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        console.log('✅ Conexión exitosa:', result)
        this.app.showNotification('Conexión establecida exitosamente', 'success')

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('handshakeModal'))
        if (modal) modal.hide()

        // Limpiar formulario
        document.getElementById('connectToCpoForm').reset()

        // Recargar conexiones (si existe el método)
        if (this.app.loadConnections) {
          this.app.loadConnections()
        }
      } else {
        console.error('❌ Error en conexión:', result)
        this.app.showNotification(`Error: ${result.status_message || 'Error desconocido'}`, 'error')
      }
    } catch (error) {
      console.error('❌ Error conectando a organización externa:', error)
      this.app.showNotification('Error de conexión: ' + error.message, 'error')
    }
  }

  async handleGenerateCredentials () {
    try {
      console.log('🔑 Generando credenciales para organización externa...')

      // Obtener datos del formulario
      const formData = {
        partyId: document.getElementById('emspPartyId').value,
        countryCode: document.getElementById('emspCountryCode').value,
        url: document.getElementById('emspUrl').value,
        tokenBase64Encoded: document.getElementById('emspTokenBase64').checked
      }

      console.log('📋 Datos del formulario:', formData)

      // Validar datos
      if (!formData.partyId || !formData.countryCode || !formData.url) {
        this.app.showNotification('Por favor, completa todos los campos', 'warning')
        return
      }

      // Mostrar loading
      this.app.showNotification('Generando credenciales...', 'info')

      // Llamar a la API
      const response = await fetch('/api/handshake/generate-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        console.log('✅ Credenciales generadas:', result)
        this.app.showNotification('Credenciales generadas exitosamente', 'success')

        // Mostrar credenciales generadas
        this.showGeneratedCredentials(result.data)

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('handshakeModal'))
        if (modal) modal.hide()

        // Limpiar formulario
        document.getElementById('generateCredentialsForm').reset()

        // Recargar conexiones (si existe el método)
        if (this.app.loadConnections) {
          this.app.loadConnections()
        }
      } else {
        console.error('❌ Error generando credenciales:', result)
        this.app.showNotification(`Error: ${result.status_message || 'Error desconocido'}`, 'error')
      }
    } catch (error) {
      console.error('❌ Error generando credenciales:', error)
      this.app.showNotification('Error generando credenciales: ' + error.message, 'error')
    }
  }

  showGeneratedCredentials (credentials) {
    try {
      console.log('🔑 Mostrando credenciales generadas:', credentials)

      // Extraer datos de la respuesta
      const ourCredentials = credentials.our_credentials || {}
      const externalOrg = credentials.external_organization || {}
      const instructions = credentials.instructions || {}

      // Formatear instrucciones
      let instructionsText = ''
      if (typeof instructions === 'string') {
        instructionsText = instructions
      } else if (instructions.message) {
        instructionsText = instructions.message
        if (instructions.next_step) {
          instructionsText += ` ${instructions.next_step}`
        }
      } else {
        instructionsText = 'Use the provided token to initiate handshake with the external organization'
      }

      // Crear modal para mostrar credenciales
      const credentialsModal = document.createElement('div')
      credentialsModal.className = 'modal fade'
      credentialsModal.id = 'credentialsModal'
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
            `

      document.body.appendChild(credentialsModal)

      // Mostrar modal
      const modal = new bootstrap.Modal(credentialsModal)
      modal.show()

      // Limpiar modal cuando se cierre
      credentialsModal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(credentialsModal)
      })

      console.log('✅ Modal de credenciales mostrado')
    } catch (error) {
      console.error('❌ Error mostrando credenciales:', error)
      this.app.showNotification('Error mostrando credenciales: ' + error.message, 'error')
    }
  }

  switchToTab (targetTabName) {
    try {
      console.log(`🔄 Cambiando a pestaña: ${targetTabName}`)

      // Remover clases activas de todas las pestañas
      document.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active')
      })
      document.querySelectorAll('.tab-pane').forEach(content => {
        content.classList.remove('show', 'active')
        content.style.display = 'none'
      })

      // Activar la pestaña seleccionada
      const targetTab = document.getElementById(`${targetTabName}-tab`)
      const targetContent = document.getElementById(targetTabName)

      if (targetTab && targetContent) {
        targetTab.classList.add('active')
        targetContent.classList.add('show', 'active')
        targetContent.style.display = 'block'

        this.app.currentTab = targetTabName
        console.log(`✅ Pestaña ${targetTabName} activada`)

        // Cargar datos de la pestaña activada
        this.loadTabData(targetTabName)
      } else {
        console.warn(`⚠️ No se encontraron elementos de la pestaña ${targetTabName}`)
      }
    } catch (error) {
      console.error(`❌ Error cambiando a pestaña ${targetTabName}:`, error)
    }
  }

  activateLocationsTab () {
    try {
      console.log('🔄 Activando pestaña Locations...')

      // Obtener la pestaña y el contenido
      const locationsTab = document.getElementById('locations-tab')
      const locationsContent = document.getElementById('locations')

      if (locationsTab && locationsContent) {
        // Remover clases activas de todas las pestañas
        document.querySelectorAll('.nav-link').forEach(tab => {
          tab.classList.remove('active')
        })
        document.querySelectorAll('.tab-pane').forEach(content => {
          content.classList.remove('show', 'active')
          content.style.display = 'none'
        })

        // Activar la pestaña Locations
        locationsTab.classList.add('active')
        locationsContent.classList.add('show', 'active')
        locationsContent.style.display = 'block'

        console.log('✅ Pestaña Locations activada')

        // Verificar que el botón ahora sea visible
        setTimeout(() => {
          const refreshButton = document.getElementById('refreshLocations')
          if (refreshButton) {
            const rect = refreshButton.getBoundingClientRect()
            console.log('🔍 Botón después de activar tab:', {
              width: rect.width,
              height: rect.height,
              visible: rect.width > 0 && rect.height > 0
            })
          }
        }, 100)
      } else {
        console.warn('⚠️ No se encontraron elementos de la pestaña Locations')
      }
    } catch (error) {
      console.error('❌ Error activando pestaña Locations:', error)
    }
  }

  checkOverlappingElements (button) {
    try {
      console.log('🔍 Verificando elementos superpuestos...')

      const rect = button.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Verificar elementos en el centro del botón
      const elementsAtCenter = document.elementsFromPoint(centerX, centerY)
      console.log('🔍 Elementos en el centro del botón:', elementsAtCenter)

      // Verificar si el botón está en la primera posición
      if (elementsAtCenter[0] === button) {
        console.log('✅ El botón está en la primera posición (no hay elementos superpuestos)')
      } else {
        console.log('⚠️ Elementos superpuestos detectados:')
        elementsAtCenter.forEach((element, index) => {
          console.log(`  ${index}: ${element.tagName} - ${element.id || element.className}`)
        })
      }

      // Verificar si hay algún elemento invisible bloqueando
      const blockingElements = elementsAtCenter.filter(el => {
        const style = window.getComputedStyle(el)
        return style.pointerEvents === 'none' ||
               style.display === 'none' ||
               style.visibility === 'hidden' ||
               el.offsetParent === null
      })

      if (blockingElements.length > 0) {
        console.log('⚠️ Elementos bloqueantes detectados:', blockingElements)
      }
    } catch (error) {
      console.error('❌ Error verificando elementos superpuestos:', error)
    }
  }

  checkButtonState (button) {
    try {
      console.log('🔍 Verificando estado completo del botón...')

      // Verificar dimensiones
      const rect = button.getBoundingClientRect()
      console.log('🔍 Dimensiones del botón:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right
      })

      // Verificar estilos computados
      const style = window.getComputedStyle(button)
      console.log('🔍 Estilos del botón:', {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        position: style.position,
        zIndex: style.zIndex,
        pointerEvents: style.pointerEvents,
        overflow: style.overflow
      })

      // Verificar si está en el viewport
      const isInViewport = rect.top >= 0 && rect.left >= 0 &&
                                rect.bottom <= window.innerHeight &&
                                rect.right <= window.innerWidth
      console.log('🔍 Botón en viewport:', isInViewport)

      // Verificar parent containers
      let parent = button.parentElement
      let level = 0
      while (parent && level < 5) {
        const parentStyle = window.getComputedStyle(parent)
        console.log(`🔍 Parent ${level}:`, {
          tag: parent.tagName,
          id: parent.id,
          class: parent.className,
          display: parentStyle.display,
          visibility: parentStyle.visibility,
          overflow: parentStyle.overflow
        })
        parent = parent.parentElement
        level++
      }
    } catch (error) {
      console.error('❌ Error verificando estado del botón:', error)
    }
  }

  loadTabData (tabName) {
    try {
      console.log(`📊 Cargando datos para pestaña: ${tabName}`)

      switch (tabName) {
        case 'locations':
          if (this.app.dataLoadingModule) {
            this.app.dataLoadingModule.loadLocations()
          } else if (this.app.loadLocations) {
            this.app.loadLocations()
          }
          break
        case 'evses':
          if (this.app.loadEvses) this.app.loadEvses()
          break
        case 'connections':
          if (this.app.loadConnections) this.app.loadConnections()
          break
        case 'tokens':
          if (this.app.loadTokens) this.app.loadTokens()
          break
        case 'sessions':
          if (this.app.loadSessions) this.app.loadSessions()
          break
        case 'logs':
          console.log('📝 Pestaña de logs - no requiere carga de datos')
          break
        case 'emsp-locations':
          if (this.app.loadEmspLocations) this.app.loadEmspLocations()
          break
        case 'emsp-evses':
          if (this.app.loadEmspEvses) this.app.loadEmspEvses()
          break
        case 'emsp-tariffs':
          if (this.app.loadEmspTariffs) this.app.loadEmspTariffs()
          break
        case 'tariffs':
          if (this.app.loadTariffs) this.app.loadTariffs()
          break
        case 'emsp-sessions':
          console.log('📝 Pestaña de EMSP sessions - no requiere carga de datos')
          break
        case 'emsp-cdrs':
          console.log('📝 Pestaña de EMSP CDRs - no requiere carga de datos')
          break
        case 'emsp-tokens':
          if (this.app.tokensModule) {
            this.app.tokensModule.loadEmspTokens()
          } else if (this.app.loadEmspTokens) {
            this.app.loadEmspTokens()
          }
          break
        case 'ext-sessions':
          if (this.app.loadExtSessions) this.app.loadExtSessions()
          break
        case 'emsp-contracts':
          console.log('📝 Pestaña de EMSP contracts - no requiere carga de datos')
          break
        case 'emsp-actions':
          console.log('📝 Pestaña de EMSP actions - no requiere carga de datos')
          break
        case 'test':
          if (this.app.loadTestData) this.app.loadTestData()
          break
        default:
          console.log(`⚠️ Pestaña desconocida: ${tabName}`)
      }
    } catch (error) {
      console.error(`❌ Error cargando datos para pestaña ${tabName}:`, error)
    }
  }

  async updateConnectionStatus () {
    try {
      console.log('🔍 Verificando estado de conexión...')
      const response = await fetch(`${this.baseUrl}/health`)
      const isConnected = response.ok

      const statusElement = document.getElementById('connection-status')
      if (statusElement) {
        if (isConnected) {
          statusElement.textContent = 'Conectado'
          console.log('✅ Estado: Conectado')
        } else {
          statusElement.textContent = 'Desconectado'
          console.log('❌ Estado: Desconectado')
        }
      } else {
        console.warn('⚠️ Elemento connection-status no encontrado')
      }
    } catch (error) {
      console.error('❌ Error verificando conexión:', error)
      const statusElement = document.getElementById('connection-status')
      if (statusElement) {
        statusElement.textContent = 'Error de conexión'
      }
    }
  }
}
