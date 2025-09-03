# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed
- Estructura de payload de tarifas corregida según especificación OCPI 2.2
- URLs de notificación corregidas para usar `/ocpi/emsp/` en lugar de `/ocpi/cpo/`
- Métodos HTTP corregidos: POST → PUT para notificaciones externas
- Campos de conectores corregidos: `voltage` → `max_voltage`, `amperage` → `max_amperage`
- Tipos de datos en conectores: strings → números enteros
- Filtrado de capabilities inválidas en notificaciones
- Manejo de campos nulos en conectores

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

### Versión 0.1.0 (Estado actual)
- Lanzamiento inicial de la aplicación CPO OCPI 2.2
- Funcionalidad básica de gestión de locations, EVSEs y tarifas
- Sistema de autenticación y API REST completa
- **Implementación completa de funcionalidad EMSP**
- **Sistema de notificaciones automáticas**
- **Soft delete y gestión avanzada de datos**
- **Mejoras en UX/UI con tooltips y paginación**
- **Correcciones de compatibilidad OCPI 2.2**
- **Tooltips informativos completos en todas las pestañas**
- **Soporte para estructuras de datos de tarifas antigua y nueva**
- **Limpieza y documentación de scripts de base de datos**

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
