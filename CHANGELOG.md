# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
