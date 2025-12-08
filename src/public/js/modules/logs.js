/**
 * Gestión de Logs
 * Extraído de app.js (líneas 1750-2254)
 */

import { UIUtils } from '../utils/ui.js'

export class LogsModule {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
    this.logsStreaming = false
    this.logsEventSource = null
    this.safePollInterval = null
  }

  // ===== GESTIÓN DE LOGS =====
  startLogsStreaming () {
    if (this.app.logsStreaming) return

    try {
      console.log('🟢 Iniciando streaming de logs...')
      this.logsEventSource = new EventSource(`${this.baseUrl}/logs/stream`)

      this.logsEventSource.onopen = (event) => {
        console.log('✅ EventSource conectado correctamente')
        console.log('✅ Estado del EventSource:', this.logsEventSource.readyState)
        this.app.logsStreaming = true
        const startBtn = document.getElementById('startLogs')
        const stopBtn = document.getElementById('stopLogs')
        if (startBtn) startBtn.disabled = true
        if (stopBtn) stopBtn.disabled = false
        this.app.showNotification('Streaming de logs iniciado', 'success')
      }

      this.logsEventSource.onmessage = (event) => {
        console.log('📨 Mensaje SSE recibido:', event.data)
        try {
          const logData = JSON.parse(event.data)
          console.log('📨 Datos parseados:', logData)
          this.addLogEntry(logData)
        } catch (error) {
          console.error('❌ Error parseando mensaje SSE:', error, 'Data:', event.data)
        }
      }

      this.logsEventSource.onerror = (error) => {
        console.error('❌ Error en EventSource:', error)
        console.error('❌ Estado del EventSource:', this.logsEventSource.readyState)
        console.error('❌ URL del EventSource:', this.logsEventSource.url)
        this.app.showNotification('Error en la conexión de logs', 'error')
        this.stopLogsStreaming()
      }

      // Verificar el estado después de 5 segundos
      setTimeout(() => {
        if (this.logsEventSource && this.logsEventSource.readyState === 2) {
          console.log('⚠️ EventSource se cerró inesperadamente - iniciando polling seguro...')
          this.startSafePolling()
        } else if (this.logsEventSource && this.logsEventSource.readyState === 0) {
          console.log('⚠️ EventSource aún conectando después de 5 segundos - iniciando polling seguro...')
          this.logsEventSource.close()
          this.startSafePolling()
        }
      }, 5000)
    } catch (error) {
      console.error('❌ Error al iniciar streaming:', error)
      this.app.showNotification('Error al iniciar streaming', 'error')
    }
  }

  stopLogsStreaming () {
    if (this.logsEventSource) {
      this.logsEventSource.close()
      this.logsEventSource = null
    }

    // Detener polling seguro si está activo
    this.stopSafePolling()

    this.app.logsStreaming = false
    const startBtn = document.getElementById('startLogs')
    const stopBtn = document.getElementById('stopLogs')
    if (startBtn) startBtn.disabled = false
    if (stopBtn) stopBtn.disabled = true

    this.app.showNotification('Streaming de logs detenido', 'info')
    console.log('🔴 Streaming de logs detenido')
  }
    
  // Función para iniciar polling seguro (cada 10 segundos)
  startSafePolling () {
    console.log('🔄 Iniciando polling seguro cada 10 segundos...')

    // Limpiar logs existentes
    this.clearLogs()

    // Función para hacer polling
    const pollLogs = async () => {
      try {
        console.log('📡 Haciendo polling seguro a /logs/recent...')
        const response = await fetch('/logs/recent')

        if (response.ok) {
          const logs = await response.json()
          console.log('✅ Logs recibidos del backend:', logs.data?.length || 0)

          if (logs.data && Array.isArray(logs.data)) {
            logs.data.forEach(log => {
              this.addLogEntry(log)
            })
          }
        } else {
          console.log('⚠️ Error en polling seguro:', response.status)
        }
      } catch (error) {
        console.log('❌ Error en polling seguro:', error.message)
      }
    }

    // Hacer polling inmediatamente
    pollLogs()

    // Hacer polling cada 10 segundos (más seguro que 3 segundos)
    const pollInterval = setInterval(pollLogs, 10000)

    // Guardar el intervalo para poder detenerlo
    this.safePollInterval = pollInterval

    console.log('✅ Polling seguro iniciado cada 10 segundos')
  }

  // Función para detener polling seguro
  stopSafePolling () {
    if (this.safePollInterval) {
      clearInterval(this.safePollInterval)
      this.safePollInterval = null
      console.log('🛑 Polling seguro detenido')
    }
  }

  shouldFilterLog (logData) {
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
      formatted += `<br><details><summary>📥 Request Body</summary><pre>${UIUtils.escapeHtml(requestBodyStr)}</pre></details>`
    }

    // Añadir detalles del response body si existe
    if (meta.responseBody) {
      const responseBodyStr = typeof meta.responseBody === 'string'
        ? meta.responseBody
        : JSON.stringify(meta.responseBody, null, 2)
      formatted += `<br><details><summary>📤 Response Body</summary><pre>${UIUtils.escapeHtml(responseBodyStr)}</pre></details>`
    }

    // Añadir headers si existen
    if (meta.requestHeaders && Object.keys(meta.requestHeaders).length > 0) {
      formatted += `<br><details><summary>📋 Request Headers</summary><pre>${UIUtils.escapeHtml(JSON.stringify(meta.requestHeaders, null, 2))}</pre></details>`
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
            <span class="log-message">${source === 'api' ? message : UIUtils.escapeHtml(message)}</span>
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
    this.app.showNotification('Logs limpiados', 'info')
    console.log('🗑️ Logs limpiados')
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
}
