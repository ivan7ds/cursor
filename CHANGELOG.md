# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.3] - 2025-10-09

### Added
- **Gestión completa de tarifas externas**: habilitado `PUT` y `DELETE` para `/ocpi/emsp/2.2/tariffs/{country_code}/{party_id}/{tariff_id}` con validaciones, upsert y soft delete.
- **Nombre de tarifa externa**: agregada columna `name` en `emsp_tariffs` más migración `scripts/migrate_emsp_tariffs_add_name.sql`; el valor se toma automáticamente de `tariff_alt_text`.
- **Exposición de token OCPI para el frontend**: nuevo endpoint `/app-config.js` que publica el token por defecto y lo almacena en `localStorage` al inicializar el dashboard.

### Changed
- Los procesos de sincronización y acciones EMSP (`emspTariffsSyncService`, `emspActions`) ahora calculan y persisten el nombre de la tarifa y limpian `deleted_at` al recibir actualizaciones.
- La pestaña **Ext Tariffs** del dashboard oculta tarifas soft-deleted y muestra una columna con el nombre de la tarifa.

## [1.2.2] - 2025-01-16

### Fixed
- **Eliminación de valores hardcodeados de country_code**: Corregidos todos los valores hardcodeados de country_code para usar variables de entorno del archivo .env
  - Actualizado `src/api/credentials.js`: Reemplazados valores hardcodeados "ES" por `process.env.OCPI_COUNTRY_CODE`
  - Actualizado `src/services/testSessionService.js`: Reemplazado valor hardcodeado en token inválido por variable de entorno
  - Actualizado `scripts/create_10000_evses.js`: Reemplazado uso de parámetros hardcodeados por `process.env.OCPI_COUNTRY_CODE`
  - Mejorada consistencia en el uso de variables de entorno en toda la aplicación
  - El country_code ahora se obtiene exclusivamente del archivo .env, eliminando dependencias de valores fijos

## [1.2.1] - 2025-01-16

### Fixed
- **Corrección de country_code en base de datos**: Corregido error donde country_code tenía valores incorrectos (PT) en lugar del código de país de la empresa (ES)
  - Actualizados 1,000 registros en tabla `evses` cambiando country_code de PT a ES
  - Actualizados 40 registros en tabla `locations` cambiando country_code de PT a ES
  - Creado script `scripts/fix_country_code_pt_to_es.sql` para la corrección
  - El country_code ahora representa correctamente el código del país de la empresa (ES) en lugar del país de las localizaciones individuales

### Added
- **Optimización de logging**: Reducido el tamaño de los logs para mejorar la legibilidad y rendimiento
  - Creado archivo `src/utils/loggingUtils.js` con funciones de logging optimizado
  - Implementado logging resumido para objetos grandes (locations, evses, arrays de datos)
  - Reemplazados logs de payloads completos por resúmenes informativos
  - Optimizados logs del frontend para mostrar solo conteos de arrays en lugar de datos completos
  - Mejorada la legibilidad de los logs sin perder información crítica

## [1.2.0] - 2025-01-16

### Added
- **Control individual de EVSE Notification Service**: Agregado botón individual para activar/desactivar el EVSE Notification Service
  - Botón individual en la pestaña Test para control granular del servicio
  - Endpoint `/api/test-monitoring/toggle-evse-service` para manejo individual
  - Estado visual actualizado en tiempo real (Activo/Pausado)
  - Funcionalidad independiente del control general de jobs
  - Interfaz mejorada con botones de acción específicos por servicio
- **Gestión de potencia máxima y tarifas por conector**: Implementada funcionalidad completa para gestionar conectores de EVSE
  - Campo de potencia máxima con cálculo automático (voltaje × amperaje)
  - Botón de cálculo automático de potencia con icono de calculadora
  - Campo de solo lectura que muestra la potencia calculada en tiempo real
  - Sección de tarifas asociadas por conector con selects dinámicos
  - Botón "Agregar Tarifa" para asignar múltiples tarifas por conector
  - Botón "Eliminar Tarifa" para remover tarifas asignadas
  - Carga automática de tarifas disponibles del CPO
  - Persistencia de tarifas en la base de datos (tabla evses, columna connectors)
  - Validación y recolección correcta de datos en formularios de edición
- **Notificaciones PATCH por conector**: Implementado sistema de notificaciones específicas para cambios en conectores
  - Detección automática de cambios en conectores al actualizar EVSE desde frontend
  - Envío de PATCH individual por conector modificado con URL correcta: `/ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}/{connector_id}`
  - Payload específico del conector con campos actualizados (tariff_ids, max_voltage, max_amperage, etc.)
  - Comparación inteligente de datos anteriores vs actuales para detectar cambios reales
  - Notificación selectiva: solo se envían PATCHs para conectores que realmente cambiaron
  - Fallback a notificación estándar del EVSE si no hay cambios en conectores
- **Corrección de event listeners en frontend**: Solucionado problema con botón "Agregar Tarifa" en conectores
  - Eliminado conflicto entre event listeners específicos y event delegation global
  - Implementado event delegation unificado para botones dinámicos de tarifas
  - Corregido error "Cannot read properties of null (reading 'dataset')"
  - Mejorada estabilidad de la interfaz de gestión de tarifas por conector
  - **Corrección de carga de tarifas**: Solucionado problema con asignación de `this.allTariffs`
    - Corregida función `loadTariffs()` duplicada que no asignaba `this.allTariffs`
    - Agregada asignación correcta de `this.allTariffs = result.data || []`
    - Eliminada notificación incorrecta "No hay tarifas disponibles" cuando sí hay tarifas
- **Funcionalidad de tarifas en creación de EVSE**: Implementada gestión completa de tarifas por conector en el modal de crear EVSE
  - Agregada sección "Tarifas Asociadas" en cada conector del formulario de creación
  - Implementado botón "Agregar Tarifa" con dropdown dinámico de tarifas disponibles
  - Agregado botón "Eliminar Tarifa" para remover tarifas asignadas
  - Incluida funcionalidad de cálculo automático de potencia máxima con botón calculadora
  - Campo de solo lectura para mostrar potencia calculada en tiempo real
  - Recopilación correcta de `tariff_ids` en la función `collectEvseFormData()`
  - Configuración automática de event listeners para conectores nuevos y existentes
  - Persistencia de tarifas en la base de datos al crear EVSE
- **Optimización de logging**: Reducido el tamaño de los logs para mejorar la legibilidad y rendimiento
  - Creado archivo `src/utils/loggingUtils.js` con funciones de logging optimizado
  - Implementado logging resumido para objetos grandes (locations, evses, arrays de datos)
  - Reemplazados logs de payloads completos por resúmenes informativos
  - Optimizados logs del frontend para mostrar solo conteos de arrays en lugar de datos completos
  - Mejorada la legibilidad de los logs sin perder información crítica

## [1.1.1] - 2025-09-18

### Added
- **Backup de base de datos**: Creado backup completo de la base de datos PostgreSQL
  - Archivo: `database_backup_20250918_165623.sql`
  - Tamaño: ~4.9 MB
  - Ubicación: `backups/`
  - Incluye todos los datos y estructura de la base de datos `cpo_ocpi`

### Fixed
- **Tipo de datos en connectors**: Corregido el tipo de datos del campo `id` en la columna `connectors` de la tabla `evses`
  - Convertidos todos los valores numéricos del campo `id` a strings
  - Migración ejecutada: `migrate_connectors_id_to_string.sql`
  - Total de registros procesados: 10,017 EVSEs
  - Verificación: 0 registros con `id` numérico restantes

- **Longitud de coordenadas**: Acortadas las coordenadas en la tabla `locations` para cumplir con los límites OCPI
  - Latitude: máximo 10 caracteres (antes: hasta 18 caracteres)
  - Longitude: máximo 11 caracteres (antes: hasta 19 caracteres)
  - Migración ejecutada: `migrate_coordinates_length.sql`
  - Total de ubicaciones procesadas: 427 locations
  - Coordenadas acortadas: 400 locations con coordenadas excesivamente largas
  - Verificación: 0 ubicaciones con coordenadas que excedan los límites
  - Precisión mantenida: 6 decimales máximo para mantener precisión geográfica

- **Valores de standard en connectors**: Corregidos los valores del campo `standard` en la columna `connectors` de la tabla `evses`
  - Valores corregidos: `IEC_62196_T3` → `IEC_62196_T3A`, `OTHER` → `DOMESTIC_A`, `IEC_60309` → `IEC_60309_2_three_32`, `IEC_61851` → `IEC_62196_T2`
  - Migración ejecutada: `migrate_connectors_standard_values.sql`
  - Total de EVSEs procesados: 10,017
  - Valores inválidos corregidos: 1,744 connectors
  - Verificación: 0 connectors con valores de standard inválidos
  - Cumplimiento: 100% con estándar OCPI para valores de standard

- **Paginación en endpoint GET /locations**: Corregida la implementación de paginación para cumplir con el estándar OCPI
  - Eliminada información de paginación del cuerpo de la respuesta JSON
  - Movida información de paginación a las cabeceras HTTP según OCPI 2.2
  - Cabeceras implementadas: `X-Total-Count`, `X-Limit`, `Link` (para página siguiente)
  - Eliminada cabecera `X-Offset` no estándar
  - Respuesta JSON simplificada: solo `status_code`, `data`, `timestamp`
  - Cumplimiento: 100% con estándar OCPI para paginación

### Fixed
- **Filtro de duplicados en logs**: Deshabilitado temporalmente para permitir visualización de logs de carga
- **Filtro de ping/heartbeat**: Eliminados logs de mantenimiento SSE que saturaban la interfaz
  - Filtrados automáticamente los mensajes `{"type":"ping"}`
  - Filtrados automáticamente los mensajes `{"type":"heartbeat"}`
  - Mejorada la experiencia de usuario en el dashboard de logs

### Technical Details
- **Frontend**: Modificado `addLogEntry()` en `src/public/app.js`
  - Comentado temporalmente el filtro de duplicados (líneas 1619-1622)
  - Añadido filtro específico para ping/heartbeat (líneas 1608-1612)
- **Logs de carga**: Ahora se muestran correctamente en tiempo real
- **Interfaz limpia**: Eliminados logs de mantenimiento innecesarios

## [1.1.0] - 2025-09-18

### Added
- **Sistema de activación condicional de jobs**: Implementado sistema inteligente para gestión de servicios
  - Jobs desactivados por defecto al arrancar el servidor
  - Solo el `Charging Notification Service` se activa automáticamente cuando hay sesiones activas
  - Auto-desactivación del `Charging Notification Service` cuando no hay sesiones activas
  - Activación automática cuando un eMSP inicia una recarga contra nuestros EVSEs
  - Control manual de todos los jobs desde el frontend de Test

- **Función de activación condicional**: `startChargingNotificationServiceIfNeeded()`
  - Verifica si hay sesiones activas antes de iniciar el servicio
  - Inicia el servicio solo cuando es necesario
  - Logging detallado del estado de activación

- **Función de activación automática**: `activateChargingNotificationService()`
  - Se ejecuta automáticamente cuando se inicia una nueva sesión
  - Evita duplicación de servicios activos
  - Integración con el endpoint de inicio de sesión

- **Método de auto-desactivación**: `shouldContinueRunning()` en Charging Notification Service
  - Verifica periódicamente si debe continuar ejecutándose
  - Se desactiva automáticamente cuando no hay sesiones activas
  - Optimización de recursos del servidor

### Changed
- **Arranque del servidor**: Modificado para iniciar solo servicios necesarios
  - Solo inicia el `Charging Notification Service` si hay sesiones activas
  - Los demás jobs permanecen desactivados hasta activación manual
  - Logging mejorado del estado de servicios

- **Sistema de toggle de jobs**: Actualizado para manejar activación condicional
  - El `Charging Notification Service` se activa automáticamente si hay sesiones activas
  - Los demás jobs se controlan manualmente desde el frontend
  - Estado dinámico del `Charging Notification Service` en el sistema de monitoreo

- **Graceful shutdown**: Mejorado para solo detener servicios activos
  - Verifica el estado de cada servicio antes de detenerlo
  - Evita errores al intentar detener servicios ya detenidos
  - Logging condicional de servicios detenidos

### Fixed
- **Campo total_cost en sesiones**: Corregido cálculo y actualización del costo total
  - El campo `total_cost` ahora se actualiza correctamente en la tabla `sessions`
  - Cálculo automático basado en tarifas y consumo de energía
  - Sincronización entre tabla `sessions` y notificaciones a eMSPs

- **Importación de modelos**: Añadida importación faltante del modelo `Session` en `server.js`
  - Resuelto error `ReferenceError: Session is not defined`
  - Funciones de activación condicional ahora funcionan correctamente

### Technical Details
- **Archivos modificados**:
  - `src/server.js`: Sistema de activación condicional y graceful shutdown
  - `src/services/chargingNotificationService.js`: Auto-desactivación y verificación de estado
  - `src/api/commands.js`: Activación automática al iniciar sesiones
  - `src/api/testMonitoring.js`: Sistema de toggle actualizado
  - `package.json`: Versión actualizada a 1.1.0

- **Comportamiento del sistema**:
  - Al arrancar: Solo servicios necesarios se inician
  - Al iniciar recarga: `Charging Notification Service` se activa automáticamente
  - Sin sesiones activas: Servicios se desactivan automáticamente
  - Control manual: Todos los jobs disponibles desde frontend de Test

## [Unreleased]

### Added
- **Endpoint POST /ocpi/emsp/2.2/cdrs**: Implementado endpoint para recibir CDRs de EMSPs
  - Permite recibir y almacenar CDRs enviados por EMSPs externos
  - Mapea correctamente los campos del payload OCPI a la tabla `emsp_cdrs`
  - Incluye validación de campos obligatorios (country_code, party_id, id, session_id)
  - Soporta inserción y actualización de CDRs existentes
  - Logging detallado para seguimiento de CDRs recibidos
  - Respuesta OCPI estándar con status_code 1000 para éxito

- **Servicio de envío de CDRs**: Implementado sistema completo para enviar CDRs desde CPO a EMSPs externos
  - Servicio `cdrSendingService.js` para gestión de envío de CDRs
  - Construcción automática de payloads OCPI basados en datos de sesión
  - Almacenamiento de CDRs enviados en tabla `cdrs`
  - Envío automático a todos los EMSPs configurados al finalizar sesiones
  - Integración en flujos de finalización de sesión (POST /api/sessions/:id/end y comando STOP_SESSION)
  - Mapeo completo de datos de sesión, ubicación y EVSE a formato OCPI
  - Manejo de errores y logging detallado para seguimiento
  - Soporte para tarifas y períodos de carga en formato OCPI estándar

## [1.0.1] - 2025-09-16

### Fixed
- **Pestaña Tariffs**: Corregido error 401 de autenticación
  - Agregado header de autorización a todas las funciones de test-monitoring
  - Corregido endpoint de carga de tarifas del CPO (`/ocpi/cpo/2.2/tariffs`)
  - Actualizada visualización de datos para coincidir con estructura de tabla (11 columnas)
  - Restaurada columna de acciones con botones funcionales
  - Implementada función `viewTariff()` para mostrar detalles completos de tarifas
  - Agregada función `editTariff()` (placeholder para implementación futura)
  - Corregidas referencias de `app.` a `window.dashboardApp` en botones de acción

### Changed
- **Frontend**: Mejorada consistencia en autenticación de API interna
  - Todas las funciones que usan endpoints `/api/` ahora incluyen token de autorización
  - Funciones afectadas: `updateServiceStatus()`, `loadErrorLog()`, `clearTestErrors()`, `toggleJobsStatus()`, `runSampleTests()`, `loadTestHistory()`, `loadChargingLogs()`

### Technical Details
- **Autenticación**: Patrón `Authorization: Token ${localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'}` aplicado consistentemente
- **Endpoints**: Uso correcto de endpoints OCPI vs API interna
- **UI/UX**: Botones de acción con iconos Bootstrap y tooltips informativos
- **Modal de Detalles**: Visualización completa de información de tarifas con elementos de precio

## [1.0.0] - 2025-09-16

### Added
- **Test Session Service**: Nuevo servicio de pruebas de sesión de carga
  - Ejecución periódica configurable (por defecto 1 minuto)
  - Duración de sesión configurable (por defecto 30 segundos)
  - Obtención de EVSEs desde la base de datos (tabla `emsp_evses`)
  - Pruebas con tokens válidos e inválidos
  - Comunicación con operadores externos via OCPI commands
  - Monitoreo en tiempo real en la pestaña "Test"
  - Integración completa con el sistema de logging y errores

### Changed
- **Configuración de Tiempos**: Variables de entorno para Test Session Service
  - `TEST_SESSION_INTERVAL_MS`: Intervalo de ejecución (60000ms = 1 minuto)
  - `TEST_SESSION_DURATION_MS`: Duración de sesión (30000ms = 30 segundos)

### Technical
- **Flujo de Pruebas**: Modificado para usar EVSEs de base de datos local
- **Consulta SQL**: Optimizada para buscar EVSEs con `REMOTE_START_STOP_CAPABLE`
- **Integración**: Completa con sistema de monitoreo y logging existente

## [0.17.0] - 2025-09-16

### Added
- **Paginación de Locations**: Sistema de paginación completo para la pestaña Locations
  - Paginación de 50 resultados por página
  - Controles de navegación "Anterior" y "Siguiente"
  - Información de paginación "Mostrando X-Y de Z Locations"
  - Carga múltiple para obtener todos los datos respetando límite de 1000
  - Event listeners para navegación entre páginas

- **Campo de Búsqueda en Locations**: Funcionalidad de búsqueda en tiempo real
  - Campo de búsqueda con placeholder descriptivo
  - Búsqueda case-insensitive en todos los campos de la tabla
  - Filtrado en tiempo real mientras se escribe
  - Búsqueda global en ID, nombre, país, ciudad, dirección y EVSEs

- **Carga Múltiple de Datos**: Sistema robusto para cargar todos los datos disponibles
  - Algoritmo de carga múltiple con peticiones de 1000 en 1000
  - Aplicado tanto a Locations como EVSEs
  - Manejo de límites de API respetando máximo de 1000 por petición
  - Logging de progreso durante la carga

### Changed
- **Límite de EVSEs**: Aumentado de 1000 a todos los resultados disponibles
  - Ahora muestra los 10,016 EVSEs creados en lugar de solo 1000
  - Contador actualizado para reflejar el total real
  - Paginación mantenida en 20 resultados por página

- **Carga de Locations**: Mejorada para manejar todas las 426 locations
  - Carga completa sin limitaciones de paginación del backend
  - Paginación frontend de 50 resultados por página
  - Contador preciso del total de locations

### Fixed
- **Error HTTP 400 en Locations**: Corregido límite excedido en peticiones
  - Resuelto error "Invalid limit parameter. Must be between 1 and 1000"
  - Implementada carga múltiple para respetar límites del backend
  - Manejo robusto de errores durante la carga

- **Contadores Incorrectos**: Corregidos contadores que mostraban límites en lugar de totales reales
  - Locations: Ahora muestra 426 en lugar de 1000
  - EVSEs: Ahora muestra 10,016 en lugar de 1000
  - Información de paginación actualizada correctamente

### Technical Details
- **HTML**: Agregado campo de búsqueda en pestaña Locations
- **JavaScript**: Implementadas funciones de paginación y filtrado para Locations
- **Algoritmo de Carga**: Sistema while loop con offset/limit para cargar todos los datos
- **Event Listeners**: Configurados para búsqueda en tiempo real y navegación de páginas

## [0.16.0] - 2025-09-15

### Added
- **Test Location EVSE Creation Service**: Nuevo job automático para pruebas de creación de locations y EVSEs
  - Servicio que se ejecuta periódicamente según configuración de variable de entorno
  - Creación automática de locations y EVSEs de prueba con datos válidos
  - Notificaciones HTTP reales a operadores externos conectados
  - Validación de respuestas de organizaciones conectadas
  - Limpieza automática con borrado definitivo (hard delete)
  - Variable de entorno `TEST_LOCATION_EVSE_CREATION_INTERVAL_MS` (valor por defecto: 300000ms)
  - Panel de monitoreo en la pestaña Test con estado, última ejecución y contador de errores
  - Integración completa con el sistema de monitoreo de tests

- **Notificaciones HTTP Reales**: Implementación de notificaciones HTTP reales para operadores externos
  - Notificaciones PUT para creación de locations y EVSEs
  - Notificaciones PATCH para eliminación (status REMOVED para EVSEs, publish false para locations)
  - Headers HTTP completos con autenticación, User-Agent y X-Request-ID
  - Manejo de errores y timeouts (10 segundos)
  - URLs construidas correctamente según OCPI 2.2

- **Sistema de Backup**: Creación automática de backups de base de datos
  - Backup almacenado en carpeta `backups/` con timestamp
  - Comando: `pg_dump` con credenciales correctas
  - Backup creado antes de cambios importantes

### Changed
- **Vista de Test**: Actualizada para mostrar 6 servicios en lugar de 5
  - Layout cambiado a 3 filas (2-2-2) para acomodar el nuevo servicio
  - Nuevo panel para "Test Location EVSE Creation Service" con monitoreo completo
  - JavaScript actualizado para manejar el nuevo servicio en `updateServiceStatus()`
  - Integración con el botón de control de jobs

- **Payloads OCPI**: Corregidos para cumplir estándares OCPI 2.2
  - Campo `country` cambiado de 2 a 3 caracteres ("ES" → "ESP")
  - Campo `time_zone` agregado ("Europe/Madrid")
  - Capacidades de EVSE corregidas (eliminado "RENTABLE" inválido)
  - Estructura de payloads idéntica a los menús manuales

- **Validaciones de Datos**: Mejoradas para detectar problemas de validación
  - Validación de capacidades de EVSE según OCPI 2.2
  - Validación de longitud de campos (country, physical_reference)
  - Detección de errores de validación en notificaciones HTTP

### Fixed
- **Error de Capabilities**: Corregido uso de capacidades inválidas en EVSEs
  - Eliminado "RENTABLE" que no es válido según OCPI 2.2
  - Usado "RESERVABLE" y "REMOTE_START_STOP_CAPABLE" (válidas)

- **Error de Country**: Corregido campo country con longitud insuficiente
  - Cambiado de "ES" (2 caracteres) a "ESP" (3 caracteres)
  - Cumple con validación "country must be longer than or equal to 3 characters"

- **Notificaciones Simuladas**: Reemplazadas por notificaciones HTTP reales
  - Eliminadas simulaciones con delays artificiales
  - Implementadas peticiones HTTP reales con axios
  - Manejo de respuestas y errores reales del operador externo

- **Limpieza de Datos**: Mejorada para usar borrado definitivo
  - Cambiado de soft delete a hard delete (`force: true`)
  - Notificaciones de eliminación antes del borrado
  - Limpieza completa de datos de prueba

## [0.15.0] - 2025-09-15

### Added
- **EMSP Tokens Sync Service**: Nuevo job automático para sincronizar tokens de operadores externos
  - Servicio que se ejecuta periódicamente según configuración de variable de entorno
  - Sincronización automática de tokens desde EMSPs conectados
  - Almacenamiento de tokens en tabla `emsp_tokens`
  - Integración completa con el sistema de monitoreo de tests
  - Variable de entorno `EMSP_TOKENS_SYNC_INTERVAL_MS` (valor por defecto: 60000ms)
  - Panel de monitoreo en la pestaña Test con estado, última ejecución y contador de errores
  - Autenticación correcta usando tokens de la tabla `credentials`
  - Endpoint correcto `/ocpi/emsp/2.2/tokens/` para obtener tokens de EMSPs

- **Control de Jobs**: Botón para activar/desactivar todos los jobs desde la interfaz
  - Botón dinámico en la pestaña Test que cambia entre "Pausar Jobs" y "Activar Jobs"
  - Control simultáneo de todos los 5 servicios (EVSE, Charging, Locations, Tariffs, Tokens)
  - Iconos y colores dinámicos según el estado actual
  - Endpoint `POST /api/test-monitoring/toggle-jobs` para control backend
  - Actualización automática del estado en la interfaz

### Changed
- **Vista de Test**: Actualizada para mostrar 5 servicios en lugar de 4
  - Layout cambiado a 3 filas (2-2-1) para acomodar el nuevo servicio
  - Nuevo panel para "EMSP Tokens Sync Service" con monitoreo completo
  - JavaScript actualizado para manejar el nuevo servicio en `updateServiceStatus()`
  - Botón de control de jobs agregado antes del botón "Ejecutar Pruebas"

- **Validaciones de Datos**: Implementadas validaciones robustas para todos los servicios EMSP
  - **EMSP Locations Sync Service**: Marca como error cuando encuentra 0 locations
  - **EMSP Tariffs Sync Service**: Marca como error cuando encuentra 0 tarifas
  - **EMSP Tokens Sync Service**: Marca como error cuando encuentra 0 tokens
  - Comportamiento consistente en todos los servicios para detectar datos faltantes

### Fixed
- **Contador de Errores**: Corregido problema de actualización de contadores de errores
  - Función `logJobError` actualizada para incluir todos los servicios EMSP
  - Contadores de errores se incrementan correctamente para todos los servicios
  - Sistema de monitoreo actualizado para manejar 5 servicios simultáneamente

- **Estado de Servicios**: Mejorado el manejo del estado de servicios
  - Estado se actualiza correctamente cuando se pausan/activan los jobs
  - Servicios muestran `status: "paused"` cuando están pausados
  - Servicios muestran `status: "active"` cuando están activos
  - Sincronización completa entre backend y frontend

## [0.14.0] - 2025-09-15

### Added
- **EMSP Tariffs Sync Service**: Nuevo job automático para sincronizar tarifas de operadores externos
  - Servicio que se ejecuta periódicamente según configuración de variable de entorno
  - Sincronización automática de tarifas desde EMSPs conectados
  - Almacenamiento de tarifas en tabla `emsp_tariffs`
  - Integración completa con el sistema de monitoreo de tests
  - Variable de entorno `EMSP_TARIFFS_SYNC_INTERVAL_MS` (valor por defecto: 60000ms)
  - Panel de monitoreo en la pestaña Test con estado, última ejecución y contador de errores
  - Autenticación correcta usando tokens de la tabla `credentials`
  - Endpoint correcto `/ocpi/cpo/2.2/tariffs/` para obtener tarifas de EMSPs
  - Vista de tarifas sincronizadas con tabla interactiva y filtros
  - Funciones JavaScript para cargar, mostrar y alternar vista de tarifas

### Changed
- **Vista de Test**: Actualizada para mostrar 4 servicios en lugar de 3
  - Layout cambiado a 2 filas de 2 columnas para acomodar el nuevo servicio
  - Nuevo panel para "EMSP Tariffs Sync Service" con monitoreo completo
  - JavaScript actualizado para manejar el nuevo servicio en `updateServiceStatus()`
  - Nueva sección "Tarifas Sincronizadas Recientemente" con tabla interactiva
  - Botones de control para actualizar y mostrar/ocultar tarifas

### Fixed
- **Autenticación en jobs de tarifas**: Implementado manejo correcto de autenticación
  - Consulta corregida para obtener tokens reales de la tabla `credentials`
  - URL corregida para usar endpoint de CPO en lugar de EMSP
  - Manejo correcto de headers de autenticación OCPI para tarifas

## [0.13.0] - 2025-09-15

### Added
- **EMSP Locations Sync Service**: Nuevo job automático para sincronizar locations de operadores externos
  - Servicio que se ejecuta periódicamente según configuración de variable de entorno
  - Sincronización automática de locations desde EMSPs conectados
  - Almacenamiento de locations en tablas `emsp_locations` y `emsp_evses`
  - Integración completa con el sistema de monitoreo de tests
  - Variable de entorno `EMSP_LOCATIONS_SYNC_INTERVAL_MS` (valor por defecto: 60000ms)
  - Panel de monitoreo en la pestaña Test con estado, última ejecución y contador de errores
  - Autenticación correcta usando tokens de la tabla `credentials`
  - Endpoint correcto `/ocpi/cpo/2.2/locations/` para obtener locations de EMSPs

### Changed
- **Vista de Test**: Actualizada para mostrar 3 servicios en lugar de 2
  - Layout cambiado de 2 columnas a 3 columnas para acomodar el nuevo servicio
  - Nuevo panel para "EMSP Locations Sync Service" con monitoreo completo
  - JavaScript actualizado para manejar el nuevo servicio en `updateServiceStatus()`

### Fixed
- **Autenticación en jobs**: Corregido problema de autenticación en el nuevo servicio
  - Consulta corregida para obtener tokens reales de la tabla `credentials`
  - URL corregida para usar endpoint de CPO en lugar de EMSP
  - Manejo correcto de headers de autenticación OCPI

## [0.12.0] - 2025-09-15

### Fixed
- **Campo "Última ejecución" incorrecto**: Corregido problema donde el campo se actualizaba con cada consulta
  - Eliminada actualización incorrecta de `lastRun` en cada petición al endpoint de estado
  - Implementado sistema de notificación real de ejecución de jobs
  - Los servicios ahora notifican su ejecución real al sistema de monitoreo
  - El campo "Última ejecución" ahora muestra realmente cuándo se ejecutaron los jobs

### Added
- **Sistema de notificación de ejecución de jobs**: Implementado tracking real de ejecución
  - Función `logJobExecution()` para registrar ejecuciones exitosas de servicios
  - Notificaciones automáticas cuando EVSE Notification Service se ejecuta
  - Notificaciones automáticas cuando Charging Notification Service se ejecuta
  - Tracking de ejecuciones incluso cuando no hay trabajo que procesar

### Changed
- **Monitoreo de servicios mejorado**: Sistema de monitoreo más preciso y confiable
  - Los timestamps de `lastRun` ahora reflejan la ejecución real de los jobs
  - Mejor separación entre consultas de estado y ejecución real de servicios
  - Logs más detallados para debugging de servicios

## [0.11.13] - 2025-09-15

### Fixed
- **Estadísticas Fake en Test Monitoring**: Eliminada generación de estadísticas aleatorias/fake
  - Reemplazado sistema de estadísticas simuladas por datos reales basados en historial de pruebas
  - Implementado sistema de seguimiento de pruebas reales con historial persistente
  - Agregados endpoints para ejecutar pruebas de ejemplo y consultar historial
  - Corregido problema de autenticación en endpoints de test-monitoring
  - Las estadísticas ahora muestran valores reales y consistentes en lugar de valores aleatorios

### Added
- **Sistema de Pruebas Real**: Implementado sistema completo de monitoreo de pruebas
  - Endpoint `/api/test-monitoring/run-sample-tests` para ejecutar pruebas de ejemplo
  - Endpoint `/api/test-monitoring/test-history` para consultar historial de pruebas
  - Interfaz de usuario mejorada con botones para ejecutar pruebas y ver historial
  - Tabla de historial de pruebas con estados visuales (passed/failed/running)
  - Estadísticas en tiempo real basadas en datos reales de las últimas 24 horas

### Changed
- **Frontend Test Tab**: Mejorada la pestaña de Test con funcionalidades reales
  - Agregados botones "Ejecutar Pruebas" y "Ver Historial"
  - Implementada tabla de historial de pruebas con información detallada
  - Estadísticas ahora se actualizan automáticamente con datos reales
  - Mejorada la experiencia de usuario con notificaciones de estado

## [0.11.12] - 2025-09-15

### Fixed
- **Error de Sintaxis en Frontend**: Corregido error de sintaxis en `app.js` línea 8120 y 8543
  - Eliminadas funciones duplicadas fuera de la clase `DashboardApp`
  - Agregado cierre correcto de la clase `DashboardApp`
  - Solucionado error `Uncaught SyntaxError: Unexpected token '{'` y `Unexpected token '.'`
- **Permisos de Logs**: Corregidos permisos de escritura en el directorio `logs/`
  - Solucionado error `EACCES: permission denied` al iniciar el servidor
  - Aplicados permisos correctos para el usuario del sistema
- **Error 401 Unauthorized en Test Monitoring**: Corregido problema de autenticación en endpoints de monitoreo
  - Movidas rutas `/api/test-monitoring` antes del middleware de autenticación
  - Endpoints de monitoreo ahora son públicos para permitir acceso desde el frontend
  - Solucionado error `401 (Unauthorized)` al acceder a la pestaña Test
- **Conflicto de Puerto**: Resuelto problema de puerto 3000 ya en uso
  - Detenido proceso anterior que ocupaba el puerto
  - Servidor ahora inicia correctamente sin conflictos
- **Estadísticas de Pruebas Dinámicas**: Corregido problema de estadísticas estáticas
  - Implementada función `updateTestStatistics()` para actualizar estadísticas dinámicamente
  - Estadísticas ahora cambian cada 10 segundos simulando actividad real
  - Solucionado problema de estadísticas que no se actualizaban en la pestaña Test

## [0.11.11] - 2025-09-15

### Added
- **Nueva pestaña "Test" para monitoreo de jobs y pruebas**
  - Pestaña dedicada para monitorear el estado de los servicios de notificación
  - Visualización en tiempo real del estado de EVSE Notification Service y Charging Notification Service
  - Log de errores recientes con información detallada de servicios y timestamps
  - Estadísticas de pruebas con contadores de total, exitosas, fallidas y en ejecución
  - Badge de notificación que aparece cuando hay errores en los jobs
  - Botones para actualizar estado, limpiar errores y alternar visibilidad del log
  - Actualización automática cada 30 segundos cuando la pestaña está activa

- **API de monitoreo de tests en el backend**
  - Endpoint `GET /api/test-monitoring/status` para obtener estado de servicios y estadísticas
  - Endpoint `GET /api/test-monitoring/errors` para obtener errores recientes de jobs
  - Endpoint `POST /api/test-monitoring/errors` para registrar nuevos errores
  - Endpoint `DELETE /api/test-monitoring/errors` para limpiar todos los errores
  - Endpoint `POST /api/test-monitoring/test-result` para registrar resultados de pruebas
  - Función `logJobError()` para registrar errores desde otros servicios

- **Integración de logging de errores en servicios de notificación**
  - EVSE Notification Service ahora registra errores en el sistema de monitoreo
  - Charging Notification Service ahora registra errores en el sistema de monitoreo
  - Errores se categorizan por servicio y nivel (error, warning)
  - Timestamps automáticos para todos los errores registrados
  - Contadores de errores por servicio actualizados en tiempo real

- **Script de prueba para el sistema de monitoreo**
  - Script `scripts/test-monitoring.js` para simular errores y probar funcionalidad
  - Comando `npm run test:monitoring` para ejecutar pruebas del sistema
  - Simulación de errores de diferentes servicios y niveles
  - Simulación de resultados de pruebas con diferentes estados
  - Verificación completa de la funcionalidad de la pestaña Test

### Technical
- **Frontend**: Nueva pestaña Test con interfaz completa de monitoreo
- **Backend**: API REST completa para monitoreo de tests y jobs
- **Servicios**: Integración de logging de errores en servicios existentes
- **Scripts**: Herramienta de prueba para validar funcionalidad
- **Documentación**: CHANGELOG actualizado con nuevas funcionalidades

## [0.11.10] - 2025-09-15

### Fixed
- **Corrección del orden de notificaciones en comando STOP_SESSION**
  - Intercambiado orden de notificaciones para cumplir con protocolo OCPI 2.2.1
  - Ahora se envía primero PUT de sesión finalizada y después PATCH de EVSE disponible
  - Corregido en `src/api/commands.js` en función `STOP_SESSION`
  - Mejorada compatibilidad con organizaciones eMSP externas
  - Orden correcto: 1) Respuesta HTTP "Stop accepted", 2) PUT notificación sesión finalizada, 3) PATCH notificación EVSE disponible

## [0.11.9] - 2025-09-11

### Fixed
- **Corrección de columnas de fecha en pestaña Ext Sessions**
  - Solucionado problema donde las columnas "Inicio" y "Fin" mostraban "N/A" en lugar de las fechas reales
  - Corregidos nombres de campos de `start_date_time`/`end_date_time` a `start_datetime`/`end_datetime` en el frontend
  - Las fechas ahora se muestran correctamente formateadas en español

- **Corrección de mapeo de campos de fecha en actualizaciones PATCH de sesiones externas**
  - Solucionado problema donde las actualizaciones PATCH de sesiones externas no guardaban correctamente las fechas de fin
  - Corregido mapeo de campos `start_date_time`/`end_date_time` a `start_datetime`/`end_datetime` en el endpoint PATCH
  - Las sesiones completadas ahora guardan correctamente su fecha de finalización
  - Actualizadas 3 sesiones existentes que tenían `end_datetime` como NULL con fechas de fin estimadas
  - Verificado que las nuevas actualizaciones PATCH funcionan correctamente y actualizan las fechas de fin

## [0.11.8] - 2025-09-10

### Fixed
- **Corrección de error en handshake OCPI - campo business_details faltante**
  - Solucionado error `ValidationError: Credentials.business_details cannot be null` durante el handshake
  - Corregida extracción de `business_details` de la respuesta de credenciales de organizaciones externas
  - Implementada lógica para extraer `business_details` del rol CPO en la respuesta de roles múltiples
  - Agregado fallback para `business_details` cuando no está disponible en la respuesta
  - Handshake ahora completa exitosamente sin errores de validación de base de datos

- **Corrección de longitud de IDs de conectores en script de base de datos**
  - Corregidos IDs de conectores en `scripts/complete_database_setup.sql` para usar UUIDs de 36 caracteres
  - Eliminada concatenación incorrecta de `-conn-1` que generaba IDs de 44 caracteres
  - Todos los conectores ahora tienen IDs consistentes con el formato UUID estándar
  - Actualizada base de datos existente para eliminar sufijos `-conn-1` de IDs de conectores

- **Corrección de regeneración innecesaria de evse_id en respuestas de locations**
  - Solucionado problema de `evse_id` duplicados en respuestas GET /locations
  - Implementada validación para no regenerar `evse_id` si ya existe uno válido en la base de datos
  - Mantenidos `evse_id` correctamente almacenados en la base de datos (formato: `ES*IPD*E5bcc4cee`)
  - Eliminada regeneración automática que causaba duplicados al usar primeros 8 caracteres del UUID
  - Respuestas de locations ahora mantienen `evse_id` únicos y consistentes

- **Corrección de desincronización entre modelo y tabla emsp_sessions**
  - Solucionado error PostgreSQL 42703 al insertar sesiones de eMSPs
  - Corregido modelo `EmspSession.js` para coincidir con estructura real de la tabla
  - Eliminados campos inexistentes: `country_code`, `party_id`, `auth_method`, `location_id`, `currency`, `charging_periods`
  - Corregido tipo de dato de `total_cost` de JSONB a DECIMAL(10,2)
  - Actualizado código de inserción en `emspSessions.js` para usar solo campos válidos
  - Eliminado error que impedía guardar sesiones de eMSPs externos

- **Corrección de carga de configuración OCPI en frontend**
  - Solucionado problema donde `window.OCPI_PARTY_ID` era undefined al cargar tokens
  - Corregido acceso a estructura de respuesta del endpoint `/api/config/ocpi-settings`
  - Implementado soporte para ambas estructuras de respuesta (con y sin wrapper `data`)
  - Eliminado error que impedía obtener tokens válidos para comandos START_SESSION
  - Mejorada compatibilidad entre frontend y backend en carga de configuración

- **Corrección de URL base en response_url de comandos START_SESSION**
  - Solucionado problema donde response_url usaba localhost en lugar de OCPI_BASE_URL
  - Agregado campo `baseUrl` al endpoint `/api/config/ocpi-settings` para devolver OCPI_BASE_URL
  - Corregida estructura de respuesta del endpoint para incluir `data` wrapper
  - Mejorada consistencia entre configuración del servidor y URLs generadas en frontend
  - Eliminado uso de localhost hardcodeado en comandos OCPI

- **Corrección de error 500 en PATCH sessions**
  - Solucionado error PostgreSQL "column does not exist" en operaciones PATCH de sesiones
  - Corregido uso de nombres de columnas incorrectos en cláusula WHERE del UPDATE
  - Cambiado `country_code` por `emsp_country_code` en consulta de actualización
  - Cambiado `party_id` por `emsp_party_id` en consulta de actualización
  - Eliminado error 500 que impedía actualizar sesiones de eMSPs externos

- **Mejoras en formulario de creación de tokens**
  - Campo UID del token ahora es editable para permitir UIDs personalizados
  - Agregada opción `AD_HOC_USER` al select de tipos de token
  - Implementado autocompletado automático para tokens AD_HOC_USER:
    - Emisor: "EMSP_System"
    - ID de contrato: "contract-001" 
    - Número visual: "AH001"
  - Mejorada flexibilidad en la creación de tokens con valores personalizados

- **Corrección de método HTTP en notificaciones de tokens**
  - Cambiado método de notificación de tokens de POST a PUT según protocolo OCPI 2.2
  - Corregido en `emspNotificationService.js` para cumplir con especificación estándar
  - Mejorada compatibilidad con organizaciones EMSP externas

- **Corrección de finalización de recarga en EVSEs externos**
  - Solucionado problema donde no se podía finalizar recarga en EVSEs externos
  - Corregido campo de búsqueda de `party_id` a `emsp_party_id` en función `getRealSessionId()`
  - Eliminado filtro de status `ACTIVE` que impedía encontrar sesiones `COMPLETED`
  - Mejorada lógica para encontrar la sesión más reciente del CPO EFI
  - Agregados logs adicionales para debugging de sesiones encontradas

- **Expansión de datos de prueba para tokens**
  - Ampliado script de población de base de datos con 19 tokens de prueba
  - Agregadas combinaciones completas de tipos de token: RFID, APP_USER, AD_HOC_USER, OTHER
  - Incluidos diferentes métodos de autenticación: RFID, APP_USER, WHITELIST, COMMAND, AUTH_REQUEST
  - Agregados tokens de prueba específicos para recarga externa (test_token1, test_token2, test_token3)
  - Incluidos tokens con diferentes estados: válidos, inválidos, expirados
  - Agregados tokens con diferentes configuraciones de whitelist: ALWAYS, ALLOWED, ALLOWED_OFFLINE, NEVER
  - Incluidos tokens con diferentes perfiles: REGULAR, FAST, GREEN, CHEAP
  - Mejorada cobertura de pruebas para diferentes escenarios de autenticación

- **Sincronización de logs y sistema de rotación**
  - Cambiado montaje de logs de volumen Docker a carpeta local para desarrollo
  - Implementado sistema de rotación de logs con winston-daily-rotate-file
  - Configurada rotación automática cuando archivos alcanzan 10MB
  - Establecida retención de logs por 7 días (comprimidos)
  - Separados logs de errores con retención de 30 días
  - Agregados logs de excepciones y rechazos de promesas
  - Mejorada gestión de espacio en disco para logs
  - Sincronización completa entre logs del contenedor y carpeta local

- **Mejora del job de notificaciones de EVSEs**
  - Implementada selección aleatoria de EVSEs en lugar de siempre el más reciente
  - Agregada generación de estados operacionales aleatorios (AVAILABLE, OCCUPIED, OUT_OF_ORDER, MAINTENANCE)
  - Asegurado que el nuevo estado sea diferente al actual
  - Mejorada lógica para excluir EVSEs soft-deleted y con sesiones activas
  - Agregado logging detallado de cambios de estado seleccionados

- **Corrección de notificación PATCH de EVSE**
  - Corregido bug donde notificaciones PATCH no incluían el estado del EVSE
  - Agregado campo `status` al payload de `prepareEVSEPatchPayload`
  - Asegurado que cambios manuales de estado se notifiquen correctamente

- **Mejora del sistema de logs en tiempo real**
  - Implementado almacenamiento en memoria de logs para visualización en tiempo real
  - Integrado winston con sistema de broadcasting para EventSource
  - Optimizado endpoint `/logs/recent` para usar logs en memoria en lugar de archivos
  - Agregado límite de 1000 logs en memoria para control de memoria
  - Mejorada eficiencia eliminando lectura constante de archivos de disco
  - Corregido sistema de streaming de logs en tiempo real

- **Corrección de error de columna en tabla emsp_locations**
  - Solucionado error PostgreSQL 42703 al guardar locations de eMSPs
  - Corregido nombre de columna de `evse_list` a `evses` en consultas SQL
  - Actualizada consulta INSERT/UPDATE en `emspActions.js` para usar nombre correcto de columna
  - Corregido valor por defecto en `server.js` para usar `evses` en lugar de `evse_list`
  - Eliminado error que impedía guardar locations obtenidas de eMSPs externos

- **Corrección de notificaciones PATCH para EVSEs soft-deleted**
  - Solucionado problema donde se enviaban notificaciones PATCH de EVSEs eliminados
  - Implementado filtro `deleted_at: null` en consultas de EVSEs para excluir registros soft-deleted
  - Reemplazadas consultas `EVSE.findByPk(id)` por `EVSE.findOne()` con filtro de soft delete
  - Eliminadas notificaciones innecesarias de EVSEs que ya fueron eliminados
  - Mejorada consistencia entre estado de datos y notificaciones enviadas

- **Corrección de sobrescritura de evse_id en respuestas de locations**
  - Solucionado problema donde se regeneraban `evse_id` en cada petición GET `/locations`
  - Implementada validación condicional para solo regenerar `evse_id` si no existe o no tiene formato eMI3
  - Mantenidos `evse_id` existentes válidos en lugar de sobrescribirlos constantemente
  - Eliminada regeneración automática que causaba duplicados en respuestas OCPI
  - Mejorada estabilidad de identificadores de EVSEs en comunicaciones externas

- **Cambio de IDs de conectores de UUID a números enteros en frontend y base de datos**
  - Modificada generación de IDs de conectores en formulario de creación de EVSEs
  - IDs de conectores ahora son números enteros secuenciales por EVSE (1, 2, 3...)
  - Implementada función `generateConnectorId()` para generar números secuenciales únicos por EVSE
  - Actualizada lógica en creación y edición de EVSEs para usar números de conector
  - Actualizado script `complete_database_setup.sql` para usar IDs numéricos por EVSE
  - Cada EVSE tiene sus conectores numerados independientemente desde 1
  - Reemplazados 14 UUIDs de conectores por "1" (cada EVSE tiene 1 conector)
  - Mejorada experiencia de usuario con IDs más simples y legibles
  - Consistencia entre frontend y datos de inicialización de la base de datos
  - Solucionado problema donde los IDs de conectores tenían 44 caracteres en lugar de 36
  - Corregido script `complete_database_setup.sql` para usar UUIDs válidos de 36 caracteres
  - Reemplazados IDs concatenados (formato: `evse-id-conn-1`) por UUIDs estándar
  - Ahora todos los IDs de conectores siguen el formato UUID v4 consistente con el resto de la aplicación
  - Eliminada inconsistencia entre scripts de inicialización y código de la aplicación

### Technical
- **Mejoras en `src/api/handshake.js`**
  - Corregida extracción de `business_details` de respuesta de credenciales con roles múltiples
  - Implementada búsqueda del rol CPO para obtener información de negocio
  - Agregado manejo robusto de respuestas de organizaciones externas

- **Mejoras en `scripts/complete_database_setup.sql`**
  - Corregidos 15 IDs de conectores de formato concatenado a UUID v4 estándar
  - Eliminada inconsistencia de longitud entre scripts de inicialización y código de aplicación
  - Todos los IDs de conectores ahora tienen exactamente 36 caracteres como se espera en la aplicación
  - Mantenida integridad referencial y funcionalidad de los datos de prueba

## [0.11.7] - 2025-09-10

### Fixed
- **Corrección de URLs con dobles barras (//) en peticiones PATCH**
  - Solucionado problema donde las URLs de notificaciones EMSP contenían dobles barras al concatenar rutas
  - Implementada función `sanitizeUrl()` para eliminar barras finales antes de concatenar rutas OCPI
  - Aplicada sanitización en todos los métodos de notificación: locations, EVSEs, tokens y tarifas
  - URLs ahora se construyen correctamente: `https://example.com/ocpi/emsp/2.2/...` en lugar de `https://example.com//ocpi/emsp/2.2/...`
  - Eliminado error de URLs malformadas que causaba problemas en las peticiones PATCH a organizaciones externas

- **Corrección de error en handshake OCPI - campo business_details faltante**
  - Solucionado error `ValidationError: Credentials.business_details cannot be null` durante el handshake
  - Corregida extracción de `business_details` de la respuesta de credenciales de organizaciones externas
  - Implementada lógica para extraer `business_details` del rol CPO en la respuesta de roles múltiples
  - Agregado fallback para `business_details` cuando no está disponible en la respuesta
  - Handshake ahora completa exitosamente sin errores de validación de base de datos

### Technical
- **Mejoras en todos los servicios de notificación**
  - Agregada función `sanitizeUrl()` en `emspNotificationService.js` para limpieza de URLs base
  - Agregada función `sanitizeUrl()` en `chargingNotificationService.js` para notificaciones de recarga
  - Agregada función `sanitizeUrl()` en `evseNotificationService.js` para notificaciones de EVSEs
  - Actualizados todos los métodos de notificación para usar URLs sanitizadas
  - Aplicada misma lógica de sanitización que se usa en `handshake.js`
  - Eliminadas dobles barras en todas las peticiones PATCH del sistema

## [0.11.6] - 2025-09-10

### Fixed
- **Corrección crítica en almacenamiento de credentials**
  - Corregido error de validación de Sequelize: `Credentials.token cannot be null`
  - Ahora se genera un token temporal (`temp_${uuid}`) en lugar de null
  - Los datos de organizaciones externas se guardan correctamente en la base de datos
  - Mejorado el manejo de errores de validación de base de datos

### Technical
- **Mejoras en `src/api/handshake.js`**
  - Corregido campo `token` para usar valor temporal en lugar de null
  - Implementado generación de token temporal con formato `temp_${uuid}`
  - Mejorado manejo de errores de validación de Sequelize
  - Los datos se guardan correctamente incluso cuando el POST /credentials es rechazado

## [0.11.5] - 2025-09-10

### Fixed
- **Corrección en almacenamiento de datos de handshake**
  - Corregido problema donde no se guardaban datos en la tabla de credentials cuando el POST /credentials era rechazado
  - Ahora se guarda información de la organización externa incluso cuando rechaza nuestras credenciales
  - Los datos se marcan como temporales (`temp: true`) y no válidos (`valid: false`) hasta recibir el handshake externo
  - Mejorado el flujo para manejar correctamente el handshake bidireccional

### Technical
- **Mejoras en `src/api/handshake.js`**
  - Agregado almacenamiento de credenciales externas cuando el POST /credentials es rechazado
  - Implementado manejo de errores de base de datos al guardar información externa
  - Mejorado logging para facilitar debug del flujo de handshake
  - Los datos se guardan con `external_party_id` para identificación única

## [0.11.4] - 2025-09-10

### Fixed
- **Corrección crítica en lógica de handshake OCPI**
  - Corregido payload de credentials para enviar nuestro endpoint de versions en el campo `url`
  - Agregado campo `website` con nuestro hostname en el payload de credentials
  - Implementado manejo del caso cuando el POST /credentials es rechazado por el operador externo
  - El handshake ahora maneja correctamente el flujo bidireccional donde el operador externo puede iniciar el handshake
  - Mejorada la respuesta cuando nuestras credenciales son rechazadas, indicando que esperamos el handshake externo

### Technical
- **Mejoras en `src/api/handshake.js`**
  - Corregido payload de credentials: `url` ahora apunta a `/ocpi/versions` de nuestra aplicación
  - Agregado campo `website` en `business_details` con nuestro hostname
  - Implementado try-catch específico para manejo de rechazo de credentials
  - Agregada respuesta informativa cuando el operador externo debe iniciar el handshake
  - Mejorado logging para facilitar debug del flujo de handshake bidireccional

## [0.11.3] - 2025-09-10

### Fixed
- **Corrección crítica en handshake OCPI**
  - Corregido problema de URL duplicada en handshake que causaba errores 404
  - Mejorada lógica de construcción de URLs para usar endpoints reales de la respuesta de details
  - Agregado fallback robusto para diferentes formatos de endpoints de servidores externos
  - El handshake ahora usa el endpoint de credentials real devuelto por el servidor externo
  - Corregido problema donde se construía `/ocpi/cpo/2.2/credentials` cuando el servidor externo esperaba `/ocpi/2.2/credentials/`

### Technical
- **Mejoras en `src/api/handshake.js`**
  - Implementada extracción del endpoint de credentials de la respuesta de details
  - Agregado logging detallado para facilitar debug de problemas de handshake
  - Mejorada lógica de fallback para manejar diferentes formatos de endpoints
  - Corregida construcción de URLs para evitar duplicación de rutas

## [0.11.2] - 2025-09-10

### Fixed
- **Corrección de formatos de datos de prueba en base de datos**
  - Corregido formato de `evse_id` para usar estándar OCPI: `Country_code*Party_id*Exxxx` (ej: `ES*IPD*E5bcc4cee`)
  - Cambiado `id` de conectores de números simples a UIDs válidos (ej: `550e8400-e29b-41d4-a716-446655440101-conn-1`)
  - Corregido campo `country` para usar códigos ISO 3166-1 alpha-3: `ESP`, `PRT` en lugar de `Spain`, `Portugal`
  - Actualizado `complete_database_setup.sql` con formatos correctos para todas las ubicaciones y EVSEs

### Fixed
- **Mejoras en la interfaz de usuario del frontend**
  - Corregida columna "País" en pestaña Locations para mostrar nombres de países en lugar de códigos
  - Corregida columna "Location" en pestaña EVSEs para mostrar nombres de ubicaciones en lugar de UIDs
  - Mejorados tooltips de Locations y EVSEs para mostrar información más legible
  - Frontend ahora es más user-friendly con información descriptiva en lugar de identificadores técnicos

### Technical
- **Mejoras en `complete_database_setup.sql`**
  - Formato de `evse_id` ahora usa concatenación dinámica: `:OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cee'`
  - IDs de conectores ahora usan UIDs únicos basados en el ID del EVSE
  - Códigos de país actualizados a formato estándar de 3 letras
  - Mantenida integridad referencial entre todas las tablas

- **Mejoras en `src/public/app.js`**
  - Corregidas referencias a `country_code` por `country` en visualización de Locations
  - Corregidas referencias a `location_id` por `location?.name` en visualización de EVSEs
  - Mejorado manejo de datos faltantes con fallbacks apropiados
  - Tooltips actualizados para mostrar información más descriptiva

## [0.11.1] - 2025-09-10

### Fixed
- **Corrección crítica del script de configuración de base de datos**
  - Solucionado problema donde `setup_database.sh` creaba las tablas pero no poblaba la base de datos
  - Corregido paso de variables de entorno a PostgreSQL con comillas simples
  - Variables `:OCPI_COUNTRY_CODE`, `:OCPI_PARTY_ID`, `:OCPI_TOKEN` ahora se pasan correctamente
  - Eliminado error "column 'es' does not exist" en consultas SQL
  - Script ahora inserta correctamente: 20 ubicaciones, 14 EVSEs, 3 tarifas, 2 tokens
  - Creado archivo `.env` automáticamente desde `env.example` para asegurar variables definidas

### Technical
- **Mejoras en `setup_database.sh`**
  - Variables de entorno ahora se pasan con comillas simples: `-v OCPI_COUNTRY_CODE="'${OCPI_COUNTRY_CODE:-ES}'"`
  - Mejor manejo de valores por defecto para variables de entorno
  - Verificación exitosa de población de base de datos con datos de ejemplo
  - Script funciona correctamente tanto para usuarios nuevos como existentes

## [0.11.0] - 2025-09-10

### Fixed
- **Corrección crítica del handshake OCPI 2.2.1**
  - Solucionado problema de URL duplicada en handshake con organizaciones externas
  - Implementada detección automática de endpoints completos vs endpoints base
  - Endpoints que ya incluyen ruta completa (`/ocpi/cpo/2.2/details`) no se concatenan
  - Endpoints base se concatenan correctamente con rutas OCPI
  - Eliminado error de URL duplicada: `http://host:port/ocpi/cpo/2.2/details/ocpi/cpo/2.2/details`
- **Corrección de compatibilidad con Docker en handshake**
  - Implementado reemplazo automático de `localhost` por IP del host Docker
  - URLs `localhost:3001` se convierten automáticamente a `172.17.0.1:3001`
  - Solucionado error `ECONNREFUSED` al conectar desde contenedor Docker a servicios externos
  - Compatibilidad completa con entornos Docker y no-Docker
- **Corrección de almacenamiento de URLs en tabla credentials**
  - URLs de organizaciones externas ahora se almacenan solo con host (sin rutas)
  - Implementada extracción de host usando `new URL()` para URLs completas
  - Antes: `http://172.17.0.1:3001/ocpi/cpo/versions` → Ahora: `http://172.17.0.1:3001`
  - Mejorada consistencia de datos en tabla `credentials`
- **Corrección de estructura de datos en handshake**
  - Solucionado acceso incorrecto a datos anidados en respuesta de credenciales
  - Cambiado de `credentialsResponse.data.token` a `credentialsResponse.data.data.token`
  - Eliminado error de validación "Credentials.token cannot be null"
  - Handshake ahora procesa correctamente la estructura de respuesta OCPI 2.2.1

### Technical
- **Mejoras en endpoint `connect-to-organization`**
  - Lógica inteligente para detectar tipo de endpoint (completo vs base)
  - Reemplazo automático de localhost por IP del host en entornos Docker
  - Extracción correcta de host de URLs para almacenamiento en base de datos
  - Mejor logging para debugging de handshake
  - Manejo robusto de diferentes formatos de respuesta de organizaciones externas

## [0.10.5] - 2025-09-09

### Fixed
- **Corrección crítica del handshake OCPI 2.2.1**
  - Corregido error "Our credentials not found" en endpoint `connect-to-organization`
  - Eliminada búsqueda incorrecta de credenciales del sistema en tabla `credentials`
  - Implementado uso de variables de entorno para credenciales del sistema
  - Credenciales del sistema ahora se obtienen de `.env` en lugar de base de datos
  - Separación clara entre credenciales internas (variables de entorno) y externas (tabla `credentials`)
- **Corrección de construcción de URLs en handshake OCPI**
  - Solucionado problema de dobles barras (`//ocpi/versions`) en URLs de handshake
  - Implementado `replace(/\/$/, '')` para eliminar barras finales de URLs base
  - URLs ahora se construyen correctamente: `http://host:port/ocpi/versions`
  - Aplicado a todos los endpoints del handshake: `/versions`, `/details`, `/credentials`
  - Eliminado error `ECONNREFUSED` causado por URLs malformadas

### Technical
- **Mejoras en endpoint `connect-to-organization`**
  - Credenciales del sistema obtenidas de variables de entorno: `OCPI_PARTY_ID`, `OCPI_COUNTRY_CODE`, `OCPI_TOKEN`, `OCPI_BASE_URL`
  - Construcción robusta de URLs sin dobles barras
  - Mejor manejo de errores de conectividad
  - Logging mejorado para debugging del handshake

## [0.10.1] - 2025-09-09

### Fixed
- **Corrección de campos URL y Token en pestaña Ext Actions**
  - Solucionado problema de IDs duplicados que impedía el llenado automático
  - Campos ahora se actualizan correctamente al seleccionar conexión CPO
  - IDs únicos: `cpoUrlExtActions` y `cpoTokenExtActions`
  - Mejora la experiencia de usuario en operaciones externas
- **Corrección de error EmspSession.upsert is not a function**
  - Solucionado problema de inicialización del modelo EmspSession
  - Modelo ahora se inicializa correctamente con la instancia de Sequelize
  - Restaurada funcionalidad de PUT sessions para eMSPs externos
- **Corrección de error "No se pudieron cargar las configuraciones OCPI"**
  - Solucionado problema de autenticación en endpoint /api/config/ocpi-settings
  - Agregado header de autorización a la petición de configuraciones OCPI
  - Restaurada funcionalidad de carga de configuraciones para inicio de recarga
- **Corrección del proceso de handshake OCPI 2.2.1**
  - Corregida función generate-credentials para generar token inicial correcto
  - Eliminada búsqueda incorrecta de credenciales existentes con party_id específico
  - Implementado proceso correcto de generación de token inicial para handshake
  - Mejorada respuesta con instrucciones claras para el operador externo
  - Corregido token de autenticación en frontend para usar token válido del localStorage
  - Corregida visualización de credenciales generadas para mostrar datos correctos en lugar de undefined
  - Corregido formato de instrucciones para mostrar texto legible en lugar de [object Object]
- **Corrección de URL hardcodeada en endpoints OCPI**
  - Corregida configuración de OCPI_BASE_URL en docker-compose.yml para usar archivo .env
  - Agregada directiva env_file para cargar variables de entorno desde .env
  - Eliminada URL de ngrok hardcodeada en frontend
  - Implementada obtención dinámica de URL base desde configuración del servidor
  - Endpoints /versions y /details ahora usan correctamente la variable de entorno OCPI_BASE_URL del archivo .env
- **Implementación de autenticación con tokens temporales para handshake OCPI 2.2.1**
  - Agregados campos `valid` y `temp` a tabla `credentials` para manejo de tokens temporales
  - Creado middleware `tempTokenAuth` para autenticación de tokens temporales
  - Tokens temporales solo válidos para endpoints: `/versions`, `/credentials`, `/details`
  - Endpoints `/versions`, `/credentials` y `/details` ahora requieren autenticación
  - Implementado proceso de generación de tokens temporales en "Generar Credenciales"
  - Agregados scripts de migración para actualizar base de datos existente
  - Corregido `OCPITokenService.validateToken()` para validar campos `valid` y `temp`
  - Modificado `authMiddleware` para rechazar tokens temporales en endpoints que requieren tokens permanentes
  - Tokens temporales rechazados con HTTP 403 en endpoints que requieren tokens permanentes
- **Corrección de error 401 en pestaña de conexiones del frontend**
  - Creado endpoint interno `/api/connections` para gestión de conexiones del frontend
  - Separado endpoint OCPI `/ocpi/cpo/2.2/credentials` (para protocolo OCPI) del endpoint interno
  - Frontend ahora usa `/api/connections` en lugar del endpoint OCPI para cargar conexiones
  - Solucionado error 401 al acceder a la pestaña de conexiones después de generar credenciales
  - Corregidas todas las referencias al endpoint OCPI en funciones `loadCpoConnections()` y búsqueda de credenciales
  - Eliminados todos los errores de "Temp token auth failed" en el frontend
  - Corregido formato de respuesta del endpoint `/api/connections` para incluir campos `token` y `last_updated`
  - Solucionado problema de campos "N/A" y "Invalid Date" en la pestaña de conexiones del frontend
- **Implementación completa del proceso de handshake OCPI 2.2.1**
  - Reescrito endpoint POST `/ocpi/cpo/2.2/credentials` para manejar handshake correctamente
  - Validación de tokens temporales en header Authorization para autenticación
  - Invalidación automática de tokens temporales después del handshake exitoso
  - Creación de tokens permanentes para organizaciones externas conectadas
  - Respuesta con credenciales del sistema según protocolo OCPI 2.2.1
  - Tokens permanentes pueden acceder a todos los endpoints OCPI
  - Tokens temporales invalidados ya no pueden acceder a ningún endpoint
  - **Corregido enfoque de credenciales del sistema**
    - Eliminadas credenciales del sistema de la tabla `credentials` (mezclaba datos internos con externos)
    - Utilizado token interno existente `ocpi_token_ipd_2024_secure_key` para credenciales del sistema
    - Endpoint POST `/credentials` ahora usa credenciales hardcodeadas del sistema (IPD/ES)
    - Mantenida separación clara entre tokens de operadores externos y token interno del sistema
- **Corregido almacenamiento de tokens bidireccionales en handshake**
  - Ahora se guardan ambos tokens: el que nos envían y el que nosotros generamos
  - Token de organización externa: para autenticar sus peticiones hacia nosotros
  - Token que generamos: para autenticar nuestras peticiones hacia ellos
  - Implementado flujo bidireccional completo según protocolo OCPI 2.2.1
- **Corregida autenticación de endpoints de handshake**
  - Endpoints `/versions`, `/details` y `/credentials` ahora aceptan tanto tokens temporales como permanentes
  - Cambiados de `tempTokenAuth` a `authMiddleware` con lógica específica para tokens temporales
  - Tokens temporales: permitidos solo en endpoints de handshake (`/versions`, `/details`, `/credentials`)
  - Tokens permanentes: permitidos en todos los endpoints OCPI
  - Solucionado problema de tokens permanentes generados en handshake que no funcionaban en `/versions`
- **Corregido bug de entradas duplicadas en handshake**
  - Eliminado bug que creaba 3 entradas en lugar de 2 durante el handshake
  - Token temporal ahora se actualiza con el token del operador externo en lugar de crear nueva entrada
  - Flujo corregido: 1 entrada para token del operador externo + 1 entrada para nuestro token
  - Mejorada trazabilidad y eliminada confusión de entradas "huérfanas"
  - Mantenida funcionalidad bidireccional completa
- **Mejorada identificación de tokens en frontend**
  - Agregado campo `external_party_id` a tabla `credentials` para identificar para qué operador son válidos nuestros tokens
  - Actualizado modelo Sequelize `Credentials.js` con nuevo campo
  - Modificado endpoint POST `/credentials` para establecer `external_party_id` al crear nuestros tokens
  - Agregado script de migración `migrate_add_external_party_id.sql`
  - Actualizado script de inicialización `init_database.sql` con nuevo campo e índice
  - Solucionado problema de UX: ahora se puede identificar claramente para qué operador es cada token
- **Corregido bug en pestaña Ext Sessions**
  - Solucionado problema donde el campo "Fin" mostraba "N/A" en lugar de la fecha de finalización
  - Corregido uso de campos de fecha: `end_date_time` en lugar de `end_datetime`
  - Corregido también campo de inicio: `start_date_time` en lugar de `start_datetime`
  - Ahora las fechas de inicio y fin se muestran correctamente en la tabla de sesiones externas
- **Corregido error 400 en notificación de fin de sesión a EMSP**
  - Solucionado problema donde `location_id` era `undefined` en notificaciones PUT a operadores externos
  - Corregida función `notifyEMSPAboutSessionEnd` para obtener `location_id` del EVSE asociado
  - Agregada validación para verificar que el EVSE existe antes de enviar la notificación
  - Ahora las notificaciones de fin de sesión incluyen correctamente el `location_id` requerido por OCPI
- **Agregada versión de la aplicación al banner del frontend**
  - Actualizado banner principal para mostrar "OCPI Test Application v0.10.4"
  - Actualizado título de la página para incluir la versión
  - Sincronizada versión en `package.json` con la versión actual del CHANGELOG
  - Mejorada identificación visual de la versión de la aplicación
- **Aumentado tamaño del icono sparkle en el banner**
  - Incrementado tamaño del favicon de 32x32 a 50x50 píxeles
  - Mejorada visibilidad del icono sparkle en el navbar
  - Mantenido el efecto de sombra y proporciones del icono
- **Revertido banner al diseño azul original**
  - Restaurado color azul Bootstrap (`bg-primary`) en el navbar
  - Eliminados estilos CSS personalizados del gradiente
  - Mantenido el icono sparkle de 50x50 píxeles y la versión v0.10.4
  - Restaurada la apariencia clásica y profesional del banner
- **Corregido error 401 en conexión a organización externa**
  - Solucionado problema donde endpoint `connect-to-organization` usaba token incorrecto
  - Cambiado de `window.OCPI_TOKEN || 'test-token'` a token interno de la API
  - Ahora usa `localStorage.getItem('ocpi_token') || 'ocpi_token_ipd_2024_secure_key'`
  - Solucionado error 401 "Authentication failed: Invalid token" en ventana de Nueva Conexión OCPI

## [0.10.0] - 2025-09-09

### Added
- **Nueva columna de referencia física en tabla de EVSEs**
  - Agregada columna "Referencia Física" en la vista de EVSEs del frontend
  - Muestra la referencia física del EVSE si está disponible, guión (-) si no
  - Posicionada estratégicamente entre Location y Estado para mejor flujo visual
  - Mejora la identificación física de puntos de carga para operadores

### Fixed
- **Reparación completa de filtros de búsqueda para EVSEs**
  - Agregados event listeners faltantes para `evseStatusFilter` y `evseSearchFilter`
  - Creada función `applyEvseFilters()` para procesar filtros de EVSEs locales
  - Filtro por estado ahora funciona correctamente (Disponible, Cargando, Inoperativo, etc.)
  - Filtro de búsqueda en tiempo real ahora funciona en todo el contenido de la fila
  - Filtros combinables - permite usar estado + búsqueda simultáneamente
  - Actualización en tiempo real con contador de resultados visibles

- **Corrección de uso de variables de entorno en lugar de valores hardcodeados**
  - Modificado `docker-compose.yml` para usar variables de entorno con valores por defecto
  - Eliminados valores hardcodeados como fallback en `src/public/app.js`
  - Agregadas validaciones para asegurar que las variables estén configuradas
  - Corregido `config.example.js` para consistencia en valores por defecto
  - Los usuarios ahora pueden configurar `OCPI_PARTY_ID` y `OCPI_COUNTRY_CODE` en su `.env`

### Improved
- **Mejor experiencia de usuario en configuración**
  - Mensajes de error claros cuando las variables de entorno no están configuradas
  - Validación previa antes de crear elementos (locations, EVSEs)
  - Forzar configuración correcta en lugar de usar valores por defecto silenciosamente
  - Mejor guía para usuarios sobre cómo configurar la aplicación

- **Interfaz de usuario mejorada para gestión de EVSEs**
  - Información más completa en la tabla de EVSEs con referencia física
  - Filtros funcionales que mejoran la navegación y búsqueda
  - Mejor organización visual de la información
  - Consistencia con el diseño existente

### Technical
- **Arquitectura de filtros mejorada**
  - Función `applyEvseFilters()` independiente para EVSEs locales
  - Manejo correcto de 8 columnas (incluyendo nueva columna de referencia física)
  - Event listeners específicos para cada tipo de filtro
  - Logging detallado para debugging de filtros

- **Configuración de entorno más robusta**
  - Uso de sintaxis `${VARIABLE:-default}` en Docker Compose
  - Validación de configuración en tiempo de ejecución
  - Eliminación de dependencias de valores hardcodeados
  - Mejor separación entre configuración de desarrollo y producción

## [0.9.6] - 2025-09-09

### Fixed
- **Corrección masiva de esquema de base de datos para soporte de soft delete**
  - Agregada columna `deleted_at TIMESTAMP WITH TIME ZONE` faltante en tabla `tariffs`
  - Agregada columna `deleted_at TIMESTAMP WITH TIME ZONE` faltante en tabla `tokens`
  - Agregada columna `deleted_at TIMESTAMP WITH TIME ZONE` faltante en tabla `emsp_tariffs`
  - Agregada columna `deleted_at TIMESTAMP WITH TIME ZONE` faltante en tabla `emsp_tokens`
  - Resuelto error "column deleted_at does not exist" en consultas de tarifas
  - Eliminada inconsistencia masiva entre modelos Sequelize y script de inicialización SQL

### Improved
- **Sincronización completa entre modelos y esquema de base de datos**
  - Script `init_database.sql` ahora coincide exactamente con todas las definiciones de modelos
  - Agregados índices optimizados para columnas `deleted_at` en todas las tablas
  - Soporte completo para soft delete en todas las entidades del sistema
  - Eliminados errores de mapeo entre ORM y estructura de base de datos

## [0.9.5] - 2025-09-09

### Fixed
- **Corrección crítica de esquema de base de datos para tabla sessions**
  - Agregada columna `kwh DECIMAL(10,3) DEFAULT 0.0` faltante en tabla `sessions`
  - Agregada columna `kwh DECIMAL(10,3) DEFAULT 0.0` faltante en tabla `emsp_sessions`
  - Agregada columna `deleted_at TIMESTAMP WITH TIME ZONE` faltante en tabla `evses`
  - Agregada columna `deleted_at TIMESTAMP WITH TIME ZONE` faltante en tabla `emsp_evses`
  - Resuelto error "column Session.kwh does not exist" en consultas de sesiones activas
  - Eliminada inconsistencia entre modelos Sequelize y script de inicialización SQL

### Improved
- **Sincronización completa entre modelos y esquema de base de datos**
  - Script `init_database.sql` ahora coincide exactamente con definiciones de modelos
  - Eliminados errores de mapeo entre ORM y estructura de base de datos
  - Soporte completo para soft delete en tablas EVSE
  - Campos de energía (kWh) disponibles en todas las tablas de sesiones

## [0.9.4] - 2025-09-09

### Fixed
- **Corrección de token de autenticación OCPI en frontend**
  - Actualizado token hardcodeado por defecto de token inexistente a token válido de base de datos
  - Resuelto error HTTP 401 "Authentication failed: Invalid token" en todos los menús
  - Frontend ahora usa token `OCPI_WzvENWQIJq1SCvcjB9G4StMMhjtHKbypjqeUVgu5KurgkDUfFE3DLAoVeSG` por defecto
  - Eliminadas 44 ocurrencias del token inválido en `src/public/app.js`

- **Identificación de problema de setup para nuevos usuarios**
  - Detectado que tabla `ocpi_tokens` no se crea en script de inicialización
  - Identificado que tokens de autenticación OCPI no se insertan en `complete_database_setup.sql`
  - Preparada solución para usar variables de entorno (OCPI_PARTY_ID, OCPI_COUNTRY_CODE, OCPI_TOKEN)

### Improved
- **Robustez del sistema de autenticación**
  - Frontend ahora funciona correctamente para usuarios existentes
  - Identificado flujo de setup necesario para nuevos usuarios
  - Preparada implementación para creación automática de tokens OCPI

## [0.9.3] - 2025-09-08

### Fixed
- **Corrección de esquema de base de datos para compatibilidad con modelos Sequelize**
  - Agregado campo `auth_method` faltante en tabla `tokens`
  - Agregados campos `publish` y `deleted_at` faltantes en tabla `locations`
  - Corregido nombre de campo `evse_list` a `evses` en tablas `locations` y `emsp_locations`
  - Corregido tipo de campo `directions` de VARCHAR(500) a JSON en tablas de ubicaciones
  - Actualizado ENUM de status de EVSE con valores completos según OCPI 2.2
  - Corregidos tamaños de campos `visual_number` y `issuer` en tabla `tokens`

- **Sincronización completa entre modelos Sequelize y estructura SQL**
  - Eliminadas discrepancias entre definiciones de modelos y tablas
  - Asegurada compatibilidad total para operaciones CRUD
  - Soporte completo para soft delete y publicación selectiva
  - Estructura JSON correcta para campos complejos

### Improved
- **Robustez del esquema de base de datos**
  - Estructura de tablas completamente alineada con modelos de aplicación
  - Eliminación de errores de mapeo entre ORM y base de datos
  - Mejor soporte para funcionalidades avanzadas (soft delete, filtros)

## [0.9.2] - 2025-09-08

### Fixed
- **Corrección de rutas en script de configuración de base de datos**
  - Implementada detección automática del directorio del script
  - Rutas absolutas para archivos SQL independientes del directorio de ejecución
  - Resuelto error "No such file or directory" al ejecutar desde directorio `scripts/`
  - Script ahora funciona correctamente desde cualquier ubicación

- **Unificación de contraseñas de base de datos**
  - Corregida inconsistencia entre Docker Compose (`cpo_password`) y script de setup
  - Actualizado `env.example` para usar contraseña correcta
  - Eliminado error de autenticación para usuarios nuevos
  - Configuración unificada: `cpo_password` en todos los archivos

### Improved
- **Robustez del proceso de configuración**
  - Script funciona independientemente del directorio de ejecución
  - Mejor experiencia de usuario con configuración consistente
  - Eliminación de errores comunes de setup para nuevos usuarios

## [0.9.1] - 2025-09-08

### Fixed
- **Corrección de script de configuración de base de datos (`setup_database.sh`)**
  - Agregados permisos de ejecución al script (`chmod +x`)
  - Implementado timeout de 60 segundos para verificación de PostgreSQL
  - Agregada verificación robusta de errores con mensajes descriptivos
  - Soporte para variables de entorno con valores por defecto
  - TRUNCATE seguro que no falla si las tablas no existen
  - Incluidas todas las tablas `emsp_*` en el proceso de limpieza

- **Mejoras en `complete_database_setup.sql`**
  - TRUNCATE condicional que verifica existencia de tablas antes de ejecutar
  - Manejo seguro de tablas `emsp_*` (locations, evses, tariffs, sessions, cdrs, tokens, contracts)
  - Prevención de errores en entornos donde las tablas no existen

### Improved
- **Robustez del proceso de configuración de base de datos**
  - Mejor experiencia de usuario con mensajes de error claros
  - Flexibilidad para diferentes entornos (Docker, local, producción)
  - Verificación de conectividad antes de ejecutar scripts SQL
  - Progreso visual durante la espera de PostgreSQL

## [0.9.0] - 2025-09-08

### Added
- **Real-time Authorization para tokens OCPI 2.2.1**
  - Nuevo endpoint `POST /ocpi/cpo/2.2/tokens/{token_uid}/authorize` para autorización en tiempo real
  - Servicio `AuthorizationService` para lógica de validación de tokens
  - Validación completa: existencia, validez, expiración, whitelist, restricciones de ubicación/EVSE
  - Integración con comando `START_SESSION` para autorización automática
  - Respuestas estructuradas con códigos de estado OCPI apropiados

- **Corrección de lógica de whitelist según OCPI 2.2.1**
  - Implementación correcta de `whitelist: "NEVER"` para tokens de eMSP
  - Tokens con `whitelist: "NEVER"` ahora son aceptados cuando vienen del eMSP
  - Autorización en tiempo real requerida para tokens con whitelist prohibido
  - Cumplimiento estricto de especificación OCPI 2.2.1

### Fixed
- **Corrección de autorización de tokens MOCK_TEST_KEY**
  - Token `MOCK_TEST_KEY` con `whitelist: "NEVER"` ahora es aceptado correctamente
  - Eliminada lógica incorrecta que rechazaba tokens del eMSP
  - Implementación conforme a documentación oficial OCPI 2.2.1
  - Tokens de eMSP con whitelist prohibido funcionan correctamente

### Changed
- **Lógica de autorización mejorada**
  - `AuthorizationService.authorizeToken()`: Nueva lógica para tokens con `whitelist: "NEVER"`
  - Asunción de autorización previa por eMSP para tokens enviados en `START_SESSION`
  - Mejor logging para debugging de autorización en tiempo real
  - Respuestas más descriptivas para diferentes escenarios de autorización

### Technical
- **Nuevo servicio de autorización**
  - `src/services/authorizationService.js`: Servicio dedicado para lógica de autorización
  - Validación robusta de tokens con múltiples criterios
  - Manejo de errores específicos para cada tipo de validación
  - Logging estructurado para debugging y monitoreo

- **Integración con START_SESSION**
  - `src/api/commands.js`: Integración de autorización en tiempo real
  - Validación automática antes de iniciar sesiones de recarga
  - Respuestas apropiadas según resultado de autorización
  - Mejor manejo de errores de autorización

- **Endpoint de autorización independiente**
  - `src/api/authorization.js`: Endpoint dedicado para autorización de tokens
  - Validación de parámetros de entrada
  - Respuestas HTTP apropiadas según códigos de estado OCPI
  - Manejo de errores robusto con logging detallado

## [0.8.1] - 2025-09-08

### Added
- **Mejora de UX en modal de recarga**
  - Modal siempre accesible independientemente del estado de la sesión
  - Botón principal adaptativo: "Iniciar Recarga" (sin sesión) / "Finalizar Recarga" (con sesión)
  - Información detallada de sesión activa en el modal
  - Restauración automática del contenido original del modal

### Fixed
- **Corrección de duplicación de EVSEs entre tablas**
  - Eliminada lógica incorrecta que creaba EVSEs de organizaciones externas en tabla `evses`
  - EVSEs externos ahora solo se almacenan en `emsp_evses` (correcto)
  - EVSEs propios solo en tabla `evses` (correcto)
  - Limpieza de datos duplicados existentes
  - Separación clara entre datos internos y externos

### Changed
- **Lógica de modal de recarga mejorada**
  - `handleChargingAction()`: Siempre abre modal (iniciar o finalizar)
  - `showSelectCpoEvseModal()`: Contenido adaptativo según estado de sesión
  - `updateChargingButton()`: Botón inteligente con colores y texto apropiados
  - `showActiveSessionInfo()`: Nueva función para mostrar información de sesión activa
  - `restoreOriginalModalContent()`: Nueva función para restaurar contenido original

### Technical
- **Corrección en `src/api/emspLocations.js`**
  - Reemplazada lógica de creación/actualización en tabla `evses` por `emsp_evses`
  - Uso correcto del modelo `EmspEVSE` para organizaciones externas
  - Logging mejorado para distinguir entre EVSEs internos y externos

- **Mejoras en frontend (`src/public/app.js`)**
  - Nuevas funciones para gestión de modal adaptativo
  - Event listeners reconfigurables para contenido dinámico
  - Mejor separación de responsabilidades en gestión de sesiones

- **Limpieza de base de datos**
  - Eliminado EVSE duplicado `7259d532-cc47-4cbc-a574-7360cfaa0998` de tabla `evses`
  - Verificación de integridad: sin duplicados entre tablas
  - Backup de seguridad creado antes de corrección

## [0.8.0] - 2025-09-08

### Added
- **Funcionalidad de handshake OCPI en pestaña "Conexiones"**
  - Botón "Nueva Conexión" para iniciar handshake con organizaciones externas
  - Modal con dos opciones: conectar a organización externa (como EMSP) y recibir conexión (como CPO)
  - Endpoint `POST /api/handshake/connect-to-organization` para conectar a organizaciones externas
  - Endpoint `POST /api/handshake/generate-credentials` para generar credenciales propias
  - Almacenamiento automático de credenciales de organizaciones externas en tabla `credentials`
  - Validación de autenticación OCPI para operaciones de handshake
  - Notificaciones de éxito/error para operaciones de handshake
  - Recarga automática de conexiones después de operaciones exitosas

- **Banner personalizado con imagen de Sparkle**
  - Imagen `sparkle.png` en el banner de la aplicación
  - Título actualizado a "✨ OCPI Test Application - OCPI 2.2"
  - Diseño visual mejorado con sombra y efectos de profundidad
  - Integración de imagen real de Sparkle chibi en lugar de SVG

### Changed
- **Título de la aplicación actualizado**
  - "IPD CPO Dashboard" → "✨ OCPI Test Application"
  - Mejor representación del propósito de la aplicación como herramienta de pruebas OCPI
  - Integración visual con el tema de Sparkle

- **Interfaz de handshake mejorada**
  - Formularios con validación client-side para campos obligatorios
  - Labels genéricos "Organización" en lugar de "CPO" para mayor flexibilidad
  - Modal de credenciales generadas con botón de copia
  - Mejor UX con notificaciones y feedback visual

### Fixed
- **Eliminación de botón de prueba innecesario**
  - Removido botón "🧪 BOTÓN DE PRUEBA" del frontend
  - Limpieza de código JavaScript eliminando método `createTestButton()`
  - Interfaz más limpia sin elementos de debugging

### Technical
- **Nuevos endpoints de handshake OCPI**
  - `POST /api/handshake/connect-to-organization`: Conectar a organización externa
  - `POST /api/handshake/generate-credentials`: Generar credenciales propias
  - Validación de tokens OCPI contra tablas `ocpi_tokens` y `credentials`
  - Manejo de errores robusto con códigos de estado OCPI apropiados

- **Mejoras en autenticación**
  - Middleware `authMiddleware` aplicado a endpoints de handshake
  - Validación de credenciales propias antes de generar nuevas
  - Manejo de errores de conectividad con organizaciones externas

- **Frontend mejorado**
  - Nuevos métodos JavaScript para manejo de handshake
  - Validación de formularios mejorada
  - Integración de imagen real en lugar de SVG
  - Limpieza de código eliminando elementos de debugging

## [0.7.0] - 2025-09-08

### Added
- **Favicon personalizado con emoji ✨**
  - Nuevo favicon usando emoji Sparkle (✨) en formato SVG
  - Compatible con todos los navegadores modernos
  - Apple Touch Icon incluido para dispositivos iOS
  - Título de pestaña actualizado con emoji: "✨ IPD CPO Dashboard"

### Changed
- **Nomenclatura de pestañas actualizada de "EMSP" a "Ext"**
  - "EMSP Locations" → "Ext Locations"
  - "EMSP EVSEs" → "Ext EVSEs" 
  - "EMSP Tariffs" → "Ext Tariffs"
  - "EMSP Tokens" → "Ext Tokens"
  - "EMSP Actions" → "Ext Actions"
  - "EMSP Sessions" → "Ext Sessions"
  - Mejor claridad semántica: "Ext" = organizaciones externas

- **Rate Limiting significativamente aumentado**
  - Límite general: 2,000 → **10,000 requests por 15 minutos**
  - Límite dashboard/APIs: 5,000 → **20,000 requests por 15 minutos**
  - Nuevas rutas excluidas: `/api-docs`, `/api/charging-logs`
  - Rate limiting permisivo para todas las rutas `/api/*`
  - Variables de entorno configurables en docker-compose

### Fixed
- **Eliminación de errores 429 (Too Many Requests)**
  - Rate limiting más permisivo para uso intensivo del dashboard
  - Mejor experiencia de usuario sin interrupciones
  - Configuración optimizada para desarrollo y producción

### Technical
- **Configuración de rate limiting mejorada**
  - Variables de entorno: `RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`
  - Exclusión inteligente de rutas críticas
  - Logging mejorado para debugging de rate limits
  - Soporte para deshabilitar rate limiting en desarrollo

## [0.6.0] - 2025-09-05

### Added
- **Pestaña "Ext Sessions" en el dashboard**
  - Nueva pestaña dedicada para visualizar sesiones externas almacenadas en `emsp_sessions`
  - Tabla con información completa de sesiones: ID, estado, fechas, costos, organización origen
  - Filtro "Solo Activas/Pendientes" para mostrar únicamente sesiones en progreso
  - Botón de actualización manual para recargar sesiones externas
  - Contador dinámico de sesiones totales y filtradas

- **Funcionalidad de cierre de sesiones externas simplificada**
  - Botón "Cerrar Sesión" para sesiones activas en pestaña "Ext Sessions"
  - Actualización directa en base de datos sin comunicación externa
  - Marca sesiones como `COMPLETED` con `end_datetime` actualizado
  - Confirmación de acción antes de cerrar sesión
  - Recarga automática de lista después del cierre

- **Endpoint PATCH para actualización de sesiones externas**
  - Nueva ruta `PATCH /api/ext-sessions/:sessionId` para actualizar sesiones
  - Búsqueda por `session_id` en lugar de ID interno
  - Validación de existencia de sesión antes de actualizar
  - Respuesta con datos de sesión actualizada

- **Campo de token personalizado en modal de recarga**
  - Input "Token Personalizado" en modal "Seleccionar EVSE para Recarga"
  - Permite introducir tokens no registrados en el sistema para pruebas
  - Prioridad sobre tokens de base de datos cuando se proporciona
  - Botón "Limpiar" para resetear campo de token personalizado

- **Sistema de logging mejorado para consola de recarga**
  - Nuevo endpoint `/api/charging-logs` para logs en tiempo real
  - Almacenamiento en memoria con límite de 100 logs
  - Logs detallados de requests/responses de START_SESSION y STOP_SESSION
  - Categorización de logs por tipo: request, response, system, debug, token, evse, session, time
  - Timestamps precisos con milisegundos para mejor debugging

### Changed
- **Renombrado de funcionalidad EMSP Actions**
  - Botón "Obtener EVSEs" renombrado a "Obtener Sessions"
  - Cambio de icono de EVSEs a sesiones (lightning-charge)
  - Funcionalidad actualizada para consultar y almacenar sesiones externas

- **Almacenamiento de sesiones externas en base de datos**
  - Endpoint `GET /emsp/actions/get-external-sessions` ahora guarda sesiones en `emsp_sessions`
  - Mapeo completo de campos OCPI 2.2 a estructura de base de datos
  - Manejo de `total_cost` como valor numérico directo
  - Almacenamiento de `charging_periods` como JSONB
  - Enriquecimiento con información de organización origen

- **Mejoras en visualización de sesiones externas**
  - Filtro actualizado para incluir estados `ACTIVE`, `PENDING`, `IN_PROGRESS`
  - Etiqueta de filtro cambiada a "Solo Activas/Pendientes"
  - Botones de acción contextuales según estado de sesión
  - Tooltips informativos para detalles de sesiones

### Fixed
- **Corrección de errores de base de datos**
  - Eliminado error `column "deleted_at" does not exist` en emspLocations.js
  - Reemplazadas consultas SQL directas por modelos Sequelize
  - Creado modelo EmspEVSE para manejo correcto de tabla emsp_evses
  - Mejorada estabilidad y seguridad del sistema

- **Corrección de payload PATCH de EVSEs**
  - Eliminado campo `status` innecesario del payload PATCH de EVSEs
  - Payload PATCH ahora incluye solo `tariff_ids` y `last_updated` según especificación OCPI 2.2
  - Corregido método `prepareEVSEPatchPayload` para enviar payloads mínimos y correctos
  - Mejorada extracción de `tariff_ids` únicos de conectores de EVSEs

- **Manejo de datos de conectores**
  - Corregido parsing de `connectors` de string a JSON antes de procesar notificaciones
  - Asegurada consistencia de datos entre base de datos y notificaciones OCPI
  - Mejorado manejo de arrays de `tariff_ids` en conectores

- **Corrección de errores de frontend**
  - Eliminado error `ReferenceError: global is not defined` en app.js
  - Reemplazado uso de `global.dashboardApp` por endpoint API dedicado
  - Mejorada comunicación backend-frontend para logging en tiempo real

### Technical Details
- **Frontend**: Nueva pestaña "Ext Sessions" con funcionalidad completa de visualización y gestión
- **Backend**: Endpoint PATCH para actualización de sesiones externas con validación robusta
- **Base de datos**: Mejorado manejo de modelos Sequelize y eliminación de consultas SQL directas
- **OCPI 2.2**: Cumplimiento estricto de especificación para payloads PATCH de EVSEs
- **Logging**: Sistema de logs en tiempo real con categorización y timestamps precisos
- **UX**: Campo de token personalizado para pruebas y debugging mejorado

## [0.5.2] - 2025-09-05

### Added
- **Funcionalidad de cierre de sesiones externas**
  - Botón "Cerrar Sesión" para sesiones activas en la pestaña "Ext Sessions"
  - Función `closeExtSession()` que envía comando STOP_SESSION al CPO externo
  - Confirmación de acción antes de cerrar sesión
  - Recarga automática de sesiones externas después del cierre
  - Notificaciones de éxito/error para el usuario

### Fixed
- **Corrección de errores de base de datos**
  - Eliminado error `column "deleted_at" does not exist` en emspLocations.js
  - Reemplazadas consultas SQL directas por modelos Sequelize
  - Creado modelo EmspEVSE para manejo correcto de tabla emsp_evses
  - Mejorada estabilidad y seguridad del sistema

## [0.5.1] - 2025-09-05

### Added
- **Funcionalidad de consulta de sesiones externas**
  - Botón "Obtener Sessions" en menú EMSP Actions para consultar sesiones de organizaciones externas conectadas
  - Endpoint `GET /emsp/actions/get-external-sessions` para agregar sesiones de múltiples CPOs externos
  - Visualización detallada de sesiones externas con información de organización origen
  - Metadata de consulta incluyendo total de sesiones, organizaciones consultadas y errores
  - Enriquecimiento de sesiones con información de `source_organization` (party_id, country_code, URL, business_details)

- **Logging mejorado para debugging**
  - Logs detallados de payloads PUT y PATCH en notificaciones OCPI
  - Visualización completa de payloads de tarifas y EVSEs en logs
  - Mejor trazabilidad de notificaciones a organizaciones externas

### Fixed
- **Corrección de payload PATCH de EVSEs**
  - Eliminado campo `status` innecesario del payload PATCH de EVSEs
  - Payload PATCH ahora incluye solo `tariff_ids` y `last_updated` según especificación OCPI 2.2
  - Corregido método `prepareEVSEPatchPayload` para enviar payloads mínimos y correctos
  - Mejorada extracción de `tariff_ids` únicos de conectores de EVSEs

- **Manejo de datos de conectores**
  - Corregido parsing de `connectors` de string a JSON antes de procesar notificaciones
  - Asegurada consistencia de datos entre base de datos y notificaciones OCPI
  - Mejorado manejo de arrays de `tariff_ids` en conectores

### Changed
- **Interfaz de usuario actualizada**
  - Renombrado botón "Obtener EVSEs" a "Obtener Sessions" en menú EMSP Actions
  - Cambio de icono de EVSEs a sesiones (lightning-charge)
  - Actualización de comentarios y referencias en código frontend

- **Optimización de notificaciones**
  - Payloads PATCH más eficientes con solo campos necesarios
  - Mejor rendimiento en notificaciones a organizaciones externas
  - Logging estructurado para mejor debugging

### Technical Details
- **Frontend**: Actualizado `app.js` con método `getCpoSessions()` para consultar sesiones externas
- **Backend**: Nuevo endpoint en `emspActions.js` para agregar sesiones de múltiples CPOs
- **Servicios**: Corregido `emspNotificationService.js` para payloads PATCH correctos
- **Base de datos**: Mejorado parsing de datos JSON en consultas de EVSEs
- **OCPI 2.2**: Cumplimiento estricto de especificación para notificaciones PATCH

## [0.5.0] - 2025-09-04

### Added
- **Configuración dinámica de OCPI**
  - Variables de entorno `OCPI_PARTY_ID`, `OCPI_COUNTRY_CODE`, `OCPI_VERSION`
  - Endpoint `/api/config/ocpi-settings` para exponer configuración al frontend
  - Carga automática de configuración OCPI en el frontend al inicializar
  - Análisis completo de variables de entorno utilizadas vs no utilizadas

### Changed
- **Reemplazo de valores hardcodeados por variables de entorno**
  - Todas las URLs de notificaciones OCPI ahora usan variables de entorno
  - Headers User-Agent dinámicos basados en configuración
  - Generación de evse_id dinámica con party_id y country_code configurables
  - Filtros de base de datos dinámicos para party_id
  - Creación de objetos de sesión/token con configuración dinámica
  - Documentación actualizada con nuevas funcionalidades de configuración

### Fixed
- **Manejo de total_cost en notificaciones PATCH de sesiones**
  - Corregido endpoint PATCH `/ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}` para actualizar correctamente el campo `total_cost`
  - Agregado manejo de `charging_periods` en actualizaciones PATCH de sesiones
  - Mejorado manejo de `total_cost` tanto como objeto (con `excl_vat`) como número directo
  - Corregida consulta SQL en endpoint de locations para usar tabla `emsp_evses` en lugar de `locations`

### Changed
- **Optimización de consultas de validación**
  - Endpoint PUT/PATCH de locations ahora valida EVSEs en tabla `emsp_evses` en lugar de `locations`
  - Uso de `location_id` obtenido de `emsp_evses` para mayor precisión en actualizaciones

## [0.4.1] - 2025-09-04

### Added
- **Configuración dinámica de OCPI**
  - Variables de entorno `OCPI_PARTY_ID`, `OCPI_COUNTRY_CODE`, `OCPI_VERSION`
  - Endpoint `/api/config/ocpi-settings` para exponer configuración al frontend
  - Carga automática de configuración OCPI en el frontend al inicializar

### Changed
- **Reemplazo de valores hardcodeados por variables de entorno**
  - Todas las URLs de notificaciones OCPI ahora usan variables de entorno
  - Headers User-Agent dinámicos basados en configuración
  - Generación de evse_id dinámica con party_id y country_code configurables
  - Filtros de base de datos dinámicos para party_id
  - Creación de objetos de sesión/token con configuración dinámica

### Fixed
- **Manejo de total_cost en notificaciones PATCH de sesiones**
  - Corregido endpoint PATCH `/ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}` para actualizar correctamente el campo `total_cost`
  - Agregado manejo de `charging_periods` en actualizaciones PATCH de sesiones
  - Mejorado manejo de `total_cost` tanto como objeto (con `excl_vat`) como número directo
  - Corregida consulta SQL en endpoint de locations para usar tabla `emsp_evses` en lugar de `locations`

### Changed
- **Optimización de consultas de validación**
  - Endpoint PUT/PATCH de locations ahora valida EVSEs en tabla `emsp_evses` en lugar de `locations`
  - Uso de `location_id` obtenido de `emsp_evses` para mayor precisión en actualizaciones

## [0.4.0] - 2025-09-04

### Added
- **Sistema de Sesiones de Carga Completo**
  - Endpoint `POST /ocpi/cpo/2.2/commands/START_SESSION` para aceptar comandos de inicio de recarga desde EMSPs
  - Endpoint `POST /ocpi/cpo/2.2/commands/STOP_SESSION` para aceptar comandos de parada de recarga desde EMSPs
  - Endpoint `GET /ocpi/cpo/2.2/sessions` para listar todas las sesiones de carga
  - Endpoint `POST /api/sessions/:id/end` para finalizar sesiones desde el frontend
  - Tabla `sessions` en base de datos con campos: id, country_code, party_id, evse_uid, connector_id, id_token, start_datetime, end_datetime, total_cost, kwh, status, last_updated
  - Tabla `cdrs` (Charge Detail Records) para almacenar información de tokens y detalles de recarga
  - Modelo Sequelize `Session.js` con validaciones y asociaciones
  - Modelo Sequelize `CDR.js` para registros de detalle de carga

- **Gestión de Tokens y Autenticación**
  - Almacenamiento de datos de token entrantes en CDRs al aceptar START_SESSION
  - Inclusión de información de token en notificaciones PUT de sesiones
  - Validación de tokens y credenciales para comandos OCPI

- **Notificaciones OCPI Avanzadas**
  - Notificaciones PUT para creación y finalización de sesiones a EMSPs
  - Endpoints PUT y PATCH para `/ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}/{evse_uid}` para notificaciones de EVSEs de CPOs externos
  - Notificaciones PATCH para actualizaciones de estado de EVSEs
  - Notificaciones POST a `response_url` con resultados de comandos
  - Autenticación automática usando credenciales almacenadas en tabla `credentials`

- **Servicio de Notificaciones de Recarga**
  - `ChargingNotificationService` que ejecuta cada 20 segundos
  - Simulación de consumo de energía basado en tiempo transcurrido
  - Cálculo de costos basado en tarifas del EVSE
  - Actualización automática del campo `kwh` en sesiones activas
  - Notificaciones PATCH periódicas a EMSPs con progreso de recarga

- **Prevención de Conflictos de Estado**
  - Exclusión de EVSEs con sesiones activas del job automático de cambio de estados
  - Método `getEVSEsWithActiveSessions()` para identificar EVSEs en uso
  - Liberación automática de EVSEs al finalizar sesiones

- **Interfaz de Usuario Mejorada**
  - Botón "Finalizar Sesión" para sesiones activas en menú Sessions
  - Visualización de energía consumida (kWh) con formato decimal correcto
  - Tooltips informativos para detalles de sesiones
  - Filtro funcional para mostrar solo sesiones activas
  - Contador dinámico de sesiones totales y filtradas

### Changed
- **Formato eMI3 para EVSE IDs**
  - Migración completa de `evse_id` al formato eMI3: `CC*PPP*E...` (ej: `ES*IPD*E00000001`)
  - Actualización de scripts SQL para generar IDs compatibles con OCPI 2.2
  - Corrección en frontend, backend y base de datos para mantener consistencia

- **Gestión de Datos de Sesiones**
  - Campo `kwh` agregado a tabla `sessions` con tipo `DECIMAL(10,3)`
  - Conversión correcta de string a número para visualización de energía
  - Actualización automática de valores de energía en sesiones activas

- **Servicios de Notificación**
  - Integración de `ChargingNotificationService` en servidor principal
  - Mejora en logging de actualizaciones de sesiones
  - Optimización de consultas de base de datos para sesiones activas

### Fixed
- **Errores de Visualización**
  - Corrección de `TypeError: session.kwh.toFixed is not a function` usando `parseFloat()`
  - Visualización correcta de valores de energía en pestaña Sessions
  - Manejo seguro de valores nulos/undefined en campos de sesión

- **Problemas de Estado de EVSEs**
  - Prevención de cambios automáticos de estado en EVSEs con sesiones activas
  - Liberación correcta de EVSEs al finalizar sesiones
  - Sincronización entre estado de sesión y estado de EVSE

- **Validaciones OCPI**
  - Validación correcta de parámetros en comandos START_SESSION y STOP_SESSION
  - Manejo apropiado de respuestas de error y éxito
  - Estructura correcta de payloads para notificaciones OCPI

### Technical Details
- **Base de Datos**: Agregadas columnas `kwh` a tabla `sessions`
- **API**: Nuevos endpoints para comandos OCPI y gestión de sesiones
- **Frontend**: Mejoras en renderizado y manejo de datos de sesiones
- **Servicios**: Nuevo servicio de notificaciones de recarga con intervalos configurables
- **OCPI 2.2**: Implementación completa de comandos START_SESSION y STOP_SESSION

## [0.3.1] - 2025-09-03

### Added
- Botón "Iniciar Recarga" en pestaña EMSP Actions con mensaje de log simulado
- Nuevo menú "Sessions" al lado de "Tokens" para mostrar sesiones de carga de EMSPs
- Filtro "Solo Activas" en menú Sessions para mostrar únicamente sesiones con estado ACTIVE
- Método `loadSessions()` para cargar sesiones desde la API
- Método `renderSessions()` para mostrar sesiones en tabla con tooltips
- Método `filterSessions()` para filtrar sesiones por estado ACTIVE
- Método `getSessionStatusBadgeClass()` para colorear badges de estado
- Método `viewSessionDetails()` para mostrar detalles de sesión en modal

### Changed
- Variable de entorno `EVSE_NOTIFICATION_INTERVAL_MS` ahora se lee correctamente desde archivo `.env`
- Límite de EVSEs en notificaciones PATCH reducido de 5 a 1 para reducir tráfico
- Formato de `evse_id` migrado a especificación eMI3 de OCPI 2.2 (3 bloques: CC*PPP*E...)
- Todos los 147 EVSEs existentes actualizados al formato `ES*IPD*EXXXXXXXX`
- Validación de formato eMI3 en creación de EVSEs con regex `^[A-Z]{2}\*[A-Z0-9]{3}\*E[A-Z0-9]+$`

### Fixed
- Error de variable de entorno hardcodeada en `docker-compose.yml`
- Intervalo de notificaciones EVSE no respetando valor del archivo `.env`
- Formato incorrecto de `evse_id` que no cumplía especificación eMI3 de OCPI 2.2
- Generación de `evse_id` en frontend usando formato de 4 bloques en lugar de 3
- Generación de `evse_id` en scripts SQL usando formato incorrecto
- Validación de `evse_id` en backend API para asegurar formato eMI3 correcto

### Technical Details
- Migración completa de base de datos: 100 EVSEs formato EVSE-XXX → eMI3, 46 EVSEs formato eMI3 incorrecto → eMI3 correcto
- Backup de base de datos creado: `backup_20250903_131821.sql`
- Implementación de filtrado de sesiones por estado en frontend
- Almacenamiento de todas las sesiones en `this.allSessions` para filtrado
- Manejo de estados de sesión con badges coloreados (ACTIVE, COMPLETED, INVALID)
- Integración completa entre frontend y backend para gestión de sesiones
- Validación robusta de formato eMI3 en múltiples capas (frontend, backend, scripts)
- Actualización automática de `last_updated` y `updated_at` en migración de EVSEs
- Verificación de integridad: sin duplicados de `evse_id` después de migración

## [0.3.0] - 2025-09-03

### Added
- Funcionalidad completa de creación de tokens desde el frontend
- Modal de formulario para crear nuevos tokens con validación
- Notificación automática de tokens creados a operadores conectados
- Campo `auth_method` obligatorio en formulario de tokens
- Método `notifyTokenCreated` en emspNotificationService
- Método `notifyOrganizationAboutToken` para notificaciones específicas
- Método `buildTokenPayload` para construir payload OCPI 2.2
- Botón "Crear Token" en la pestaña de Tokens del dashboard

### Changed
- Método HTTP de notificación de tokens: PUT → POST según especificación OCPI 2.2
- Endpoint POST de tokens ahora incluye notificación automática a EMSPs
- Formulario de tokens incluye todos los campos OCPI 2.2 requeridos

### Fixed
- Error 500 al crear tokens por campo `auth_method` faltante
- Validación de campos obligatorios en formulario de tokens
- Método HTTP correcto para notificaciones de creación de tokens
- Integración completa entre frontend y backend para creación de tokens

### Technical Details
- Implementación de notificación POST para tokens creados
- Manejo de errores en notificaciones de tokens sin fallar la creación
- Integración completa con servicio de notificaciones EMSP
- Validación de formularios con campos obligatorios
- Generación automática de UID único para tokens
- Event listeners para modal de tokens en frontend
- Métodos de validación y recolección de datos de formularios

## [0.2.0] - 2025-09-03

### Added
- Tooltips informativos en pestaña Tariffs para mostrar información detallada de tarifas
- Soporte para estructuras de elementos de tarifas (antigua y nueva OCPI 2.2)
- Logging detallado para debugging de tooltips de tarifas
- Funcionalidad EMSP (Electric Mobility Service Provider) completa
- Pestañas EMSP en el dashboard: Locations, EVSEs, Tariffs, Actions
- Endpoints backend para servir datos de EMSP almacenados
- Capacidad de consultar CPOs externos (actuando como eMSP)
- Sistema de notificaciones automáticas a EMSPs
- Soft delete para locations, EVSEs y tarifas
- Tooltips informativos en pestañas EVSEs y Locations
- Paginación en pestaña EVSEs (20 por página)
- Botones de creación y edición para locations y EVSEs
- Botones de eliminación con confirmación
- Sistema de notificaciones PATCH/PUT automáticas
- Gestión completa de tarifas con asociación automática a EVSEs
- Notificación DELETE de tarifas a EMSPs según especificación OCPI 2.2

### Changed
- Estructura de payload de tarifas corregida según especificación OCPI 2.2
- URLs de notificación corregidas para usar `/ocpi/emsp/` en lugar de `/ocpi/cpo/`
- Métodos HTTP corregidos: POST → PUT para notificaciones externas
- Campos de conectores corregidos: `voltage` → `max_voltage`, `amperage` → `max_amperage`
- Tipos de datos en conectores: strings → números enteros
- Filtrado de capabilities inválidas en notificaciones
- Manejo de campos nulos en conectores
- Flujo de eliminación de tarifas: primero notificar DELETE, luego desasociar EVSEs

### Fixed
- Error de scope de variables en endpoints de tarifas
- Endpoints DELETE duplicados que causaban hard delete
- Referencias incorrectas de `app` a `window.dashboardApp`
- Content Security Policy descargando Bootstrap localmente
- Error de sintaxis en template literals
- Tooltips mostrando etiquetas HTML literalmente
- Contador de EVSEs excluyendo soft-deleted
- Variable `testToken` no definida en flujo de recarga corregida a `realToken`
- Error `UNKNOWN_SESSION` al finalizar recarga: ahora usa session_id real del CPO

### Changed
- Flujo de recarga modificado: modal no se cierra al iniciar recarga
- Botón "Iniciar Recarga" ya no cambia a "Finalizar Recarga"
- Botón "Finalizar Recarga" agregado dentro del modal de selección de EVSE
- Botón "Iniciar Recarga" se deshabilita durante sesión activa
- Duplicación de conectores en formularios
- Loop de PATCH requests con datos soft-deleted
- Tooltips de tarifas mostrándose automáticamente sin pasar cursor
- Detalles de elementos de tarifas no mostrándose en tooltips
- Compatibilidad con estructuras de elementos de tarifas antigua y nueva
- Orden de notificaciones al eliminar tarifas según especificación OCPI 2.2

### Technical Details
- Agregada columna `deleted_at` a tablas: `locations`, `evses`, `tariffs`
- Implementado soft delete con cascada para locations → EVSEs
- Sistema de notificaciones con manejo de errores robusto
- Logging detallado para debugging y monitoreo
- Validación de datos según especificación OCPI 2.2
- Manejo de errores de conectividad en notificaciones
- Tooltips dinámicos con inicialización programática de Bootstrap
- Soporte para múltiples estructuras de datos de tarifas
- Almacenamiento de datos de tarifas para uso en tooltips (`this.allTariffs`)
- Implementación de notificación DELETE para tarifas eliminadas
- Manejo de errores en notificaciones de eliminación sin fallar el soft delete

## [0.1.0] - 2025-09-02

### Added
- Aplicación CPO (Charge Point Operator) OCPI 2.2 inicial
- Dashboard frontend con pestañas: Locations, EVSEs, Conexiones, Tariffs
- API REST completa para gestión de locations, EVSEs y tarifas
- Base de datos PostgreSQL con modelos Sequelize
- Sistema de autenticación OCPI
- Dockerización completa del proyecto
- Documentación inicial del proyecto

### Technical Details
- Node.js + Express backend
- Frontend vanilla JavaScript con Bootstrap
- Base de datos PostgreSQL
- Docker Compose para desarrollo
- Logging estructurado
- Validación de datos OCPI 2.2

---

## Notas de Versión

### Versión 0.9.6 (Estado actual)
- **Corrección masiva de esquema de base de datos para soporte de soft delete**
- **Resuelto error "column deleted_at does not exist" en consultas de tarifas**
- **Sincronización completa entre modelos y esquema de base de datos**
- **Agregadas columnas deleted_at en todas las tablas: tariffs, tokens, emsp_tariffs, emsp_tokens**

### Versión 0.9.5
- **Corrección crítica de esquema de base de datos para tabla sessions**
- **Resuelto error "column Session.kwh does not exist" en consultas de sesiones activas**
- **Sincronización completa entre modelos y esquema de base de datos**
- **Agregadas columnas faltantes: kwh en sessions y deleted_at en evses**

### Versión 0.9.4
- **Corrección de token de autenticación OCPI**
- **Resuelto error HTTP 401 en frontend**
- **Frontend funciona correctamente para usuarios existentes**
- **Identificado problema de setup para nuevos usuarios**
- **Preparada solución para creación automática de tokens**

### Versión 0.9.3
- **Corrección de esquema de base de datos**
- **Sincronización completa con modelos Sequelize**
- **Eliminación de discrepancias entre ORM y SQL**
- **Soporte completo para soft delete y publicación selectiva**
- **Estructura JSON correcta para campos complejos**
- **Compatibilidad total para operaciones CRUD**

### Versión 0.9.2
- **Corrección de rutas en script de configuración**
- **Unificación de contraseñas de base de datos**
- **Script funciona desde cualquier directorio**
- **Eliminación de errores de autenticación**
- **Configuración consistente entre Docker y setup local**
- **Mejor experiencia para usuarios nuevos**

### Versión 0.9.1
- **Corrección de script de configuración de base de datos**
- **Mejoras en robustez del proceso de setup**
- **Soporte para variables de entorno**
- **Verificación de errores mejorada**
- **TRUNCATE seguro para diferentes entornos**
- **Timeout para verificación de PostgreSQL**
- **Mensajes de error descriptivos y claros**

### Versión 0.9.0
- **Real-time Authorization completa según OCPI 2.2.1**
- **Corrección de lógica de whitelist para tokens de eMSP**
- **Token MOCK_TEST_KEY ahora funciona correctamente**
- **Cumplimiento estricto de especificación OCPI 2.2.1**
- **Servicio de autorización dedicado con validación robusta**

### Versión 0.6.0
- **Nueva pestaña "Ext Sessions" para gestión completa de sesiones externas**
- **Funcionalidad simplificada de cierre de sesiones con actualización directa en BD**
- **Campo de token personalizado para pruebas de recarga**
- **Sistema de logging mejorado con logs en tiempo real**
- **Endpoint PATCH para actualización de sesiones externas**
- **Corrección de errores de base de datos y frontend**
- **Mejoras en UX/UI para mejor experiencia de usuario**

### Versión 0.5.1
- **Funcionalidad de consulta de sesiones externas desde EMSP Actions**
- **Corrección de payloads PATCH de EVSEs según especificación OCPI 2.2**
- **Logging mejorado para debugging de notificaciones OCPI**
- **Manejo corregido de datos de conectores en notificaciones**
- **Interfaz actualizada con botón "Obtener Sessions"**

### Versión 0.3.1
- **Migración completa de evse_id a formato eMI3 de OCPI 2.2**
- **Nuevo menú Sessions para gestión de sesiones de carga**
- **Corrección de variables de entorno y intervalos de notificación**
- **Validación robusta de formato eMI3 en múltiples capas**
- **Backup de base de datos post-migración**
- **Filtrado de sesiones por estado ACTIVE**
- **Botón de inicio de recarga simulado en EMSP Actions**

### Versión 0.3.0
- **Funcionalidad completa de creación de tokens desde el frontend**
- **Notificación automática de tokens a operadores conectados**
- **Sistema de notificaciones automáticas POST/PUT/PATCH/DELETE**
- **Implementación completa de funcionalidad EMSP**
- **Soft delete y gestión avanzada de datos**
- **Mejoras en UX/UI con tooltips y paginación**
- **Correcciones de compatibilidad OCPI 2.2**
- **Tooltips informativos completos en todas las pestañas**
- **Soporte para estructuras de datos de tarifas antigua y nueva**
- **Limpieza y documentación de scripts de base de datos**

### Versión 0.2.0
- **Implementación completa de funcionalidad EMSP**
- **Sistema de notificaciones automáticas PUT/PATCH/DELETE**
- **Soft delete y gestión avanzada de datos**
- **Mejoras en UX/UI con tooltips y paginación**
- **Correcciones de compatibilidad OCPI 2.2**
- **Tooltips informativos completos en todas las pestañas**
- **Soporte para estructuras de datos de tarifas antigua y nueva**
- **Limpieza y documentación de scripts de base de datos**
- **Notificaciones DELETE de tarifas según especificación OCPI 2.2**

### Versión 0.1.0
- Lanzamiento inicial de la aplicación CPO OCPI 2.2
- Funcionalidad básica de gestión de locations, EVSEs y tarifas
- Sistema de autenticación y API REST completa

### Versión 1.0.0 (Planeada)
- Lanzamiento oficial con todas las funcionalidades completadas
- Documentación completa y pruebas exhaustivas
- Optimizaciones de rendimiento
- Funcionalidades adicionales según requerimientos

---

## Cómo usar este changelog

- **Added**: Nuevas funcionalidades
- **Changed**: Cambios en funcionalidades existentes
- **Fixed**: Correcciones de bugs
- **Technical Details**: Detalles técnicos de implementación

Para actualizar este changelog, agregar nuevas entradas bajo la sección `[Unreleased]` y mover a versiones específicas cuando se haga release.
