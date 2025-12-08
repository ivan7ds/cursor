# Estructura Modular del Dashboard

Este directorio contiene la versión modularizada del dashboard, dividiendo el archivo `app.js` original (13,633 líneas) en módulos más manejables.

## Estructura de Directorios

```
js/
├── app.js                 # Archivo principal que coordina todos los módulos
├── utils/                 # Utilidades compartidas
│   ├── api.js            # Funciones de API comunes
│   ├── ui.js             # Funciones de UI comunes
│   └── pagination.js     # Utilidades de paginación
└── modules/              # Módulos funcionales
    ├── logs.js           # Gestión de logs (504 líneas)
    ├── handshake.js      # Handshake OCPI (498 líneas)
    ├── locations.js      # Locations (creación, edición, borrado)
    ├── evses.js          # EVSEs (creación, edición, borrado, cambio de estado)
    ├── tariffs.js        # Tarifas
    ├── tokens.js         # Tokens
    ├── sessions.js       # Sesiones
    ├── emsp.js           # Funciones EMSP (locations, evses, tariffs, tokens)
    ├── cpo.js            # Funciones para consultar CPOs
    ├── extSessions.js    # Sesiones externas (2531 líneas)
    └── test.js           # Test y monitoreo
```

## Plan de Migración

### Fase 1: Estructura Base ✅
- [x] Crear estructura de directorios
- [x] Crear utilidades comunes (api.js, ui.js, pagination.js)
- [x] Crear app.js principal modularizado

### Fase 2: Migración de Módulos (En progreso)
- [ ] Extraer módulo de Logs
- [ ] Extraer módulo de Handshake
- [ ] Extraer módulo de Locations
- [ ] Extraer módulo de EVSEs
- [ ] Extraer módulo de Tariffs
- [ ] Extraer módulo de Tokens
- [ ] Extraer módulo de Sessions
- [ ] Extraer módulo EMSP
- [ ] Extraer módulo CPO
- [ ] Extraer módulo ExtSessions
- [ ] Extraer módulo Test

### Fase 3: Pruebas y Validación
- [ ] Probar cada módulo individualmente
- [ ] Validar integración entre módulos
- [ ] Probar funcionalidad completa del dashboard

### Fase 4: Limpieza
- [ ] Eliminar código duplicado
- [ ] Optimizar imports
- [ ] Actualizar documentación

## Uso

El archivo `app.js` principal importa y coordina todos los módulos. Cada módulo recibe una referencia a la instancia principal de `DashboardApp` para acceder a utilidades compartidas y estado.

```javascript
// Ejemplo de módulo
export class LogsModule {
  constructor(app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

  async loadLogs() {
    // Usar this.app.api para llamadas API
    // Usar this.app.ui para notificaciones
    // Acceder a estado con this.app.logsStreaming, etc.
  }
}
```

## Beneficios

1. **Mantenibilidad**: Código dividido en módulos lógicos y manejables
2. **Testabilidad**: Cada módulo puede probarse independientemente
3. **Reutilización**: Utilidades comunes compartidas entre módulos
4. **Legibilidad**: Archivos más pequeños y fáciles de entender
5. **Colaboración**: Múltiples desarrolladores pueden trabajar en módulos diferentes

## Notas

- El archivo original `app.js` se mantiene como respaldo durante la migración
- La migración se realiza de forma gradual para mantener la funcionalidad
- Cada módulo mantiene la misma interfaz que el código original

