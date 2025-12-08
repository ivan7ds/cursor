/**
 * Funciones del Modal de Creación de Tokens
 * Extraído de app.js (líneas 8996-9637)
 */

import { ApiUtils } from '../utils/api.js'

export class TokensModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  // ===== FUNCIONES DEL MODAL DE CREACIÓN DE TOKENS =====

  showCreateTokenModal () {
    try {
      console.log('🔑 Mostrando modal de creación de token...')

      // Mostrar el modal
      const modal = new bootstrap.Modal(document.getElementById('createTokenModal'))
      modal.show()

      // Generar UID único para el token
      this.generateTokenUid()

      // Limpiar formulario
      this.resetTokenForm()
    } catch (error) {
      console.error('❌ Error mostrando modal de token:', error)
      this.app.showNotification('Error al mostrar el formulario de token', 'error')
    }
  }

  generateTokenUid () {
    try {
      console.log('🆔 Generando UID único para token...')

      // Generar UUID v4
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })

      const tokenUidField = document.getElementById('tokenUid')
      if (tokenUidField) {
        tokenUidField.value = uuid
        console.log('✅ UID generado:', uuid)
      }
    } catch (error) {
      console.error('❌ Error generando UID de token:', error)
    }
  }

  handleTokenTypeChange () {
    try {
      const tokenType = document.getElementById('tokenType')?.value || ''
      console.log('🔄 Cambio de tipo de token detectado:', tokenType)

      if (tokenType === 'AD_HOC_USER') {
        // Autocompletar campos para AD_HOC_USER
        const issuerField = document.getElementById('tokenIssuer')
        const contractIdField = document.getElementById('tokenContractId')
        const visualNumberField = document.getElementById('tokenVisualNumber')
        if (issuerField) issuerField.value = 'EMSP_System'
        if (contractIdField) contractIdField.value = 'contract-001'
        if (visualNumberField) visualNumberField.value = 'AH001'

        console.log('✅ Campos autocompletados para AD_HOC_USER')
      } else {
        // Limpiar campos si no es AD_HOC_USER
        const issuerField = document.getElementById('tokenIssuer')
        const contractIdField = document.getElementById('tokenContractId')
        const visualNumberField = document.getElementById('tokenVisualNumber')
        if (issuerField) issuerField.value = ''
        if (contractIdField) contractIdField.value = ''
        if (visualNumberField) visualNumberField.value = ''

        console.log('✅ Campos limpiados para tipo:', tokenType)
      }
    } catch (error) {
      console.error('❌ Error manejando cambio de tipo de token:', error)
    }
  }

  resetTokenForm () {
    try {
      console.log('🔄 Reseteando formulario de token...')

      // Limpiar todos los campos
      const form = document.getElementById('createTokenForm')
      if (form) {
        form.reset()
      }

      // Limpiar campos del contrato de energía (por si acaso)
      const supplierNameField = document.getElementById('tokenEnergySupplierName')
      const contractIdField = document.getElementById('tokenEnergyContractId')
      if (supplierNameField) supplierNameField.value = ''
      if (contractIdField) contractIdField.value = ''

      // Generar nuevo UID
      this.generateTokenUid()

      console.log('✅ Formulario de token reseteado')
    } catch (error) {
      console.error('❌ Error reseteando formulario de token:', error)
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
                    'Authorization': `Token ${ApiUtils.getAuthToken()}`
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
      this.app.showNotification('Token creado exitosamente y notificado a operadores conectados', 'success')

      // Cerrar modal usando la API correcta de Bootstrap 5
      const modalElement = document.getElementById('createTokenModal')
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        } else {
          // Fallback: cerrar manualmente
          modalElement.classList.remove('show')
          modalElement.style.display = 'none'
          modalElement.setAttribute('aria-hidden', 'true')
          document.body.classList.remove('modal-open')

          // Remover backdrop
          const backdrop = document.querySelector('.modal-backdrop')
          if (backdrop) {
            backdrop.remove()
          }
        }
      }

      // Recargar lista de tokens (si existe el método)
      if (this.app.loadTokens) {
        this.app.loadTokens()
      }
    } catch (error) {
      console.error('❌ Error guardando token:', error)
      this.app.showNotification(`Error al crear token: ${error.message}`, 'error')
    }
  }

  validateTokenForm () {
    try {
      const form = document.getElementById('createTokenForm')
      if (!form || !form.checkValidity()) {
        if (form) form.reportValidity()
        return false
      }

      // Validación adicional: si se completa el contrato de energía, supplier_name es obligatorio
      const supplierNameField = document.getElementById('tokenEnergySupplierName')
      const energyContractIdField = document.getElementById('tokenEnergyContractId')
      const supplierName = supplierNameField?.value.trim() || ''
      const energyContractId = energyContractIdField?.value.trim() || ''

      if (supplierName || energyContractId) {
        if (!supplierName) {
          this.app.showNotification('El nombre del proveedor es obligatorio cuando se completa el contrato de energía', 'error')
          if (supplierNameField) {
            supplierNameField.focus()
          }
          return false
        }
      }

      return true
    } catch (error) {
      console.error('❌ Error validando formulario de token:', error)
      return false
    }
  }

  collectTokenFormData () {
    try {
      // Construir objeto energy_contract si se proporciona información
      let energy_contract = null
      const supplierNameField = document.getElementById('tokenEnergySupplierName')
      const energyContractIdField = document.getElementById('tokenEnergyContractId')
      const supplierName = supplierNameField?.value.trim() || ''
      const energyContractId = energyContractIdField?.value.trim() || ''

      if (supplierName || energyContractId) {
        // Si se completa algún campo del contrato de energía, supplier_name es obligatorio
        if (!supplierName) {
          throw new Error('El nombre del proveedor es obligatorio cuando se completa el contrato de energía')
        }

        energy_contract = {
          supplier_name: supplierName
        }

        if (energyContractId) {
          energy_contract.contract_id = energyContractId
        }
      }

      const formData = {
        uid: document.getElementById('tokenUid')?.value || '',
        type: document.getElementById('tokenType')?.value || '',
        auth_method: document.getElementById('tokenAuthMethod')?.value || '',
        issuer: document.getElementById('tokenIssuer')?.value || '',
        contract_id: document.getElementById('tokenContractId')?.value || '',
        valid: document.getElementById('tokenValid')?.value === 'true',
        whitelist: document.getElementById('tokenWhitelist')?.value || '',
        visual_number: document.getElementById('tokenVisualNumber')?.value || null,
        group_id: document.getElementById('tokenGroupId')?.value || null,
        language: document.getElementById('tokenLanguage')?.value || null,
        default_profile_type: document.getElementById('tokenDefaultProfileType')?.value || null,
        energy_contract: energy_contract
      }

      console.log('📊 Datos de token recopilados:', formData)
      return formData
    } catch (error) {
      console.error('❌ Error recopilando datos de token:', error)
      throw error // Re-lanzar para que se muestre en la validación
    }
  }

  // Cargar tokens de eMSPs
  async loadEmspTokens () {
    try {
      console.log('🔄 Cargando EMSP tokens...')

      const response = await fetch(`${this.baseUrl}/ocpi/emsp/2.2/tokens/stored`, {
        headers: {
          'Authorization': `Token ${ApiUtils.getAuthToken()}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const tokens = data.data || []
      console.log('📊 EMSP Tokens data:', tokens.length ? `Array[${tokens.length}]` : data)

      this.app.allEmspTokens = tokens
      this.populateEmspTokensFilterOptions(tokens)
      this.applyEmspTokensFilters({ resetPage: true })
      this.app.updateCount('emspTokensCount', tokens.length)

      console.log('✅ EMSP Tokens cargados exitosamente')
    } catch (error) {
      console.error('❌ Error cargando EMSP tokens:', error)
      this.app.showTableError('emspTokensTableBody', `Error al cargar EMSP tokens: ${error.message}`)
    }
  }

  hasActiveEmspTokensFilters () {
    if (!this.app.emspTokensFilters) return false
    const { search, issuer, type, valid, whitelist } = this.app.emspTokensFilters
    return Boolean(
      (search && search.trim()) ||
            issuer ||
            type ||
            valid ||
            whitelist
    )
  }

  applyEmspTokensFilters ({ resetPage = false } = {}) {
    try {
      const tokens = Array.isArray(this.app.allEmspTokens) ? this.app.allEmspTokens : []
      const filters = this.app.emspTokensFilters || {}
      const searchTerm = (filters.search || '').trim().toLowerCase()
      const issuerFilter = filters.issuer || ''
      const typeFilter = filters.type || ''
      const validFilter = filters.valid || ''
      const whitelistFilter = filters.whitelist || ''

      this.app.filteredEmspTokens = tokens.filter(token => {
        if (issuerFilter && token.issuer !== issuerFilter) return false
        if (typeFilter && token.type !== typeFilter) return false

        if (validFilter) {
          const normalizedValid = typeof token.valid === 'boolean'
            ? token.valid
            : String(token.valid).toLowerCase() === 'true'

          if (validFilter === 'true' && !normalizedValid) return false
          if (validFilter === 'false' && normalizedValid) return false
        }

        if (whitelistFilter && token.whitelist !== whitelistFilter) return false

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
            .map(value => (value ?? '').toString().toLowerCase())

          const hasMatch = haystack.some(value => value.includes(searchTerm))
          if (!hasMatch) return false
        }

        return true
      })

      const totalPages = this.app.filteredEmspTokens.length > 0
        ? Math.ceil(this.app.filteredEmspTokens.length / this.app.emspTokensPerPage)
        : 1

      if (resetPage) {
        this.app.currentEmspTokensPage = 1
      } else if (this.app.currentEmspTokensPage > totalPages) {
        this.app.currentEmspTokensPage = totalPages
      }

      this.renderEmspTokensPage()
    } catch (error) {
      console.warn('⚠️ Error aplicando filtros de Ext Tokens:', error)
    }
  }

  populateEmspTokensFilterOptions (tokens) {
    try {
      const safeTokens = Array.isArray(tokens) ? tokens : []
      const collatorOptions = { sensitivity: 'base', numeric: false }
      const compare = (a, b) => a.localeCompare(b, undefined, collatorOptions)

      const issuers = Array.from(new Set(
        safeTokens
          .map(token => token.issuer)
          .filter(value => value && value.trim() !== '')
      )).sort(compare)

      const types = Array.from(new Set(
        safeTokens
          .map(token => token.type)
          .filter(value => value && value.trim() !== '')
      )).sort(compare)

      const whitelists = Array.from(new Set(
        safeTokens
          .map(token => token.whitelist)
          .filter(value => value && value.trim() !== '')
      )).sort(compare)

      const setSelectOptions = (elementId, values, defaultLabel, filterKey) => {
        const select = document.getElementById(elementId)
        if (!select) return

        const previousValue = this.app.emspTokensFilters?.[filterKey] || ''
        const optionsHtml = [
          `<option value="">${defaultLabel}</option>`,
          ...values.map(value => `<option value="${this.app.ui.escapeHtml(value)}">${this.app.ui.escapeHtml(value)}</option>`)
        ].join('')

        select.innerHTML = optionsHtml

        if (previousValue && values.includes(previousValue)) {
          select.value = previousValue
        } else {
          select.value = ''
          if (previousValue && this.app.emspTokensFilters) {
            this.app.emspTokensFilters[filterKey] = ''
          }
        }
      }

      setSelectOptions('emspTokensIssuerFilter', issuers, 'Todos los emisores', 'issuer')
      setSelectOptions('emspTokensTypeFilter', types, 'Todos los tipos', 'type')
      setSelectOptions('emspTokensWhitelistFilter', whitelists, 'Todas las whitelist', 'whitelist')

      const searchInput = document.getElementById('emspTokensSearch')
      if (searchInput) {
        searchInput.value = this.app.emspTokensFilters?.search || ''
      }

      const validSelect = document.getElementById('emspTokensValidFilter')
      if (validSelect) {
        validSelect.value = this.app.emspTokensFilters?.valid || ''
      }
    } catch (error) {
      console.warn('⚠️ Error actualizando filtros de Ext Tokens:', error)
    }
  }

  renderEmspTokens (tokens) {
    const tbody = document.getElementById('emspTokensTableBody')
    if (!tbody) {
      console.warn('⚠️ Elemento emspTokensTableBody no encontrado')
      return
    }

    if (tokens.length === 0) {
      const hasFilters = this.hasActiveEmspTokensFilters()
      const emptyIcon = hasFilters ? 'bi-funnel' : 'bi-inbox'
      const emptyMessage = hasFilters
        ? 'No se encontraron Ext tokens con los filtros aplicados'
        : 'No hay Ext tokens disponibles'

      tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted">
                        <i class="bi ${emptyIcon}"></i> ${this.app.ui.escapeHtml(emptyMessage)}
                    </td>
                </tr>
            `
      return
    }

    tbody.innerHTML = tokens.map(token => `
            <tr class="fade-in">
                <td><code>${this.app.ui.escapeHtml(token.id || '')}</code></td>
                <td><span class="badge bg-info">${this.app.ui.escapeHtml(token.party_id || '')}</span></td>
                <td><code>${this.app.ui.escapeHtml(token.uid || '')}</code></td>
                <td><span class="badge bg-secondary">${this.app.ui.escapeHtml(token.type || '')}</span></td>
                <td><span class="badge bg-warning">${this.app.ui.escapeHtml(token.auth_method || 'N/A')}</span></td>
                <td>${this.app.ui.escapeHtml(token.issuer || 'N/A')}</td>
                <td>
                    <span class="badge ${token.valid ? 'bg-success' : 'bg-danger'}">
                        ${token.valid ? 'Sí' : 'No'}
                    </span>
                </td>
                <td>
                    <span class="badge bg-info">${this.app.ui.escapeHtml(token.whitelist || 'N/A')}</span>
                </td>
                <td>${token.last_updated ? new Date(token.last_updated).toLocaleString() : 'N/A'}</td>
            </tr>
        `).join('')

    console.log(`✅ ${tokens.length} Ext tokens renderizados en la página actual`)
  }

  renderEmspTokensPage () {
    const tokens = Array.isArray(this.app.filteredEmspTokens) ? this.app.filteredEmspTokens : []
    const totalTokens = tokens.length

    if (totalTokens === 0) {
      this.renderEmspTokens([])
      this.updateEmspTokensPaginationInfo(0, 0, 0)
      this.updateEmspTokensPaginationButtons()
      return
    }

    const totalPages = Math.max(1, Math.ceil(totalTokens / this.app.emspTokensPerPage))
    if (this.app.currentEmspTokensPage > totalPages) {
      this.app.currentEmspTokensPage = totalPages
    }
    if (this.app.currentEmspTokensPage < 1) {
      this.app.currentEmspTokensPage = 1
    }

    const startIndex = (this.app.currentEmspTokensPage - 1) * this.app.emspTokensPerPage
    const endIndex = Math.min(startIndex + this.app.emspTokensPerPage, totalTokens)
    const pageTokens = tokens.slice(startIndex, endIndex)

    this.renderEmspTokens(pageTokens)
    this.updateEmspTokensPaginationInfo(startIndex + 1, endIndex, totalTokens)
    this.updateEmspTokensPaginationButtons()
  }

  updateEmspTokensPaginationInfo (start, end, total) {
    const pageInfo = document.getElementById('emspTokensPageInfo')
    const totalCount = document.getElementById('emspTokensTotalCount')

    if (pageInfo) {
      pageInfo.textContent = total === 0 ? '0-0' : `${start}-${end}`
    }

    if (totalCount) {
      totalCount.textContent = total
    }
  }

  updateEmspTokensPaginationButtons () {
    const prevButton = document.getElementById('emspTokensPrevPage')
    const nextButton = document.getElementById('emspTokensNextPage')
    const totalTokens = Array.isArray(this.app.filteredEmspTokens) ? this.app.filteredEmspTokens.length : 0
    const totalPages = totalTokens > 0 ? Math.ceil(totalTokens / this.app.emspTokensPerPage) : 1

    const atFirstPage = this.app.currentEmspTokensPage <= 1 || totalTokens === 0
    const atLastPage = this.app.currentEmspTokensPage >= totalPages || totalTokens === 0

    if (prevButton) {
      prevButton.disabled = atFirstPage
      if (prevButton.parentElement) {
        prevButton.parentElement.classList.toggle('disabled', atFirstPage)
      }
    }

    if (nextButton) {
      nextButton.disabled = atLastPage
      if (nextButton.parentElement) {
        nextButton.parentElement.classList.toggle('disabled', atLastPage)
      }
    }
  }

  goToEmspTokensPrevPage () {
    if (this.app.currentEmspTokensPage > 1) {
      this.app.currentEmspTokensPage--
      this.renderEmspTokensPage()
    }
  }

  goToEmspTokensNextPage () {
    const totalTokens = Array.isArray(this.app.filteredEmspTokens) ? this.app.filteredEmspTokens.length : 0
    const totalPages = Math.ceil(totalTokens / this.app.emspTokensPerPage)

    if (this.app.currentEmspTokensPage < totalPages) {
      this.app.currentEmspTokensPage++
      this.renderEmspTokensPage()
    }
  }

  setupTokenModalEventListeners () {
    try {
      console.log('🔧 Configurando event listeners del modal de tokens...')

      // Botón para generar UID de token
      const generateTokenUidBtn = document.getElementById('generateTokenUidBtn')
      if (generateTokenUidBtn) {
        generateTokenUidBtn.addEventListener('click', () => {
          this.generateTokenUid()
        })
        console.log('✅ Event listener para generateTokenUidBtn agregado')
      }

      // Botón para guardar token
      const saveTokenBtn = document.getElementById('saveTokenBtn')
      if (saveTokenBtn) {
        saveTokenBtn.addEventListener('click', () => {
          this.saveToken()
        })
        console.log('✅ Event listener para saveTokenBtn agregado')
      }

      // Event listener para cambio de tipo de token
      const tokenTypeSelect = document.getElementById('tokenType')
      if (tokenTypeSelect) {
        tokenTypeSelect.addEventListener('change', () => {
          this.handleTokenTypeChange()
        })
        console.log('✅ Event listener para tokenType agregado')
      }

      console.log('✅ Event listeners del modal de tokens configurados')
    } catch (error) {
      console.error('❌ Error configurando event listeners del modal de tokens:', error)
    }
  }

  updateDeleteButtonState () {
    try {
      const deleteBtn = document.getElementById('deleteSelectedTokensBtn')
      const checkboxes = document.querySelectorAll('.token-checkbox:checked')

      if (deleteBtn) {
        deleteBtn.disabled = checkboxes.length === 0
      }
    } catch (error) {
      console.error('❌ Error actualizando estado del botón eliminar:', error)
    }
  }

  toggleSelectAllTokens () {
    try {
      const selectAllCheckbox = document.getElementById('selectAllTokensCheckbox')
      if (selectAllCheckbox) {
        const isCurrentlyChecked = selectAllCheckbox.checked
        selectAllCheckbox.checked = !isCurrentlyChecked
        selectAllCheckbox.dispatchEvent(new Event('change'))
      }
    } catch (error) {
      console.error('❌ Error alternando selección de todos los tokens:', error)
    }
  }

  getSelectedTokenIds () {
    try {
      const checkboxes = document.querySelectorAll('.token-checkbox:checked')
      return Array.from(checkboxes).map(cb => cb.getAttribute('data-token-id'))
    } catch (error) {
      console.error('❌ Error obteniendo IDs de tokens seleccionados:', error)
      return []
    }
  }

  async deleteSelectedTokens () {
    try {
      const selectedIds = this.getSelectedTokenIds()

      if (selectedIds.length === 0) {
        this.app.showNotification('No hay tokens seleccionados para eliminar', 'warning')
        return
      }

      // Confirmar eliminación
      const confirmMessage = selectedIds.length === 1
        ? '¿Está seguro de que desea eliminar el token seleccionado?'
        : `¿Está seguro de que desea eliminar ${selectedIds.length} tokens seleccionados?`

      if (!confirm(confirmMessage)) {
        return
      }

      console.log(`🗑️ Eliminando ${selectedIds.length} tokens...`)

      // Eliminar tokens uno por uno
      const deletePromises = selectedIds.map(tokenId =>
        fetch(`${this.baseUrl}/ocpi/cpo/2.2/tokens/${tokenId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${ApiUtils.getAuthToken()}`
          }
        })
      )

      const results = await Promise.allSettled(deletePromises)

      // Contar éxitos y errores
      let successCount = 0
      let errorCount = 0

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.ok) {
          successCount++
        } else {
          errorCount++
          console.error(`❌ Error eliminando token ${selectedIds[index]}:`, result.reason || result.value)
        }
      })

      // Mostrar resultado
      if (errorCount === 0) {
        this.app.showNotification(`${successCount} token(s) eliminado(s) exitosamente`, 'success')
      } else if (successCount > 0) {
        this.app.showNotification(`${successCount} token(s) eliminado(s), ${errorCount} error(es)`, 'warning')
      } else {
        this.app.showNotification('Error al eliminar tokens', 'error')
      }

      // Recargar lista de tokens (si existe el método)
      if (this.app.loadTokens) {
        this.app.loadTokens()
      }
    } catch (error) {
      console.error('❌ Error eliminando tokens seleccionados:', error)
      this.app.showNotification(`Error al eliminar tokens: ${error.message}`, 'error')
    }
  }
}
