# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Versión 0.3.1 (Estado actual)
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
