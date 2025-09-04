# CPO OCPI 2.2 Application

Aplicación CPO (Charge Point Operator) que implementa el protocolo OCPI 2.2 para gestionar infraestructura de carga de vehículos eléctricos en España y Portugal. La aplicación incluye funcionalidades completas para actuar tanto como CPO como eMSP, con un dashboard frontend integrado para gestión y monitoreo.

## 🚀 Características

- **Protocolo OCPI 2.2**: Implementación completa del estándar
- **Configuración Dinámica**: Variables de entorno para party_id, country_code y versión OCPI
- **Distribución Geográfica**: 75 ubicaciones distribuidas por España y Portugal
- **Infraestructura de Carga**: Máximo 50 EVSEs por ubicación
- **Paginación OCPI 2.2**: Endpoints con paginación estándar
- **Base de Datos Limpia**: Sin sincronización automática de Sequelize
- **Datos Persistentes**: Información mantenida entre reinicios
- **Autenticación por Tokens**: Sistema de tokens OCPI 2.2
- **Logging Detallado**: Monitoreo completo de peticiones y respuestas
- **Dashboard Frontend**: Interfaz web integrada para gestión y monitoreo
- **Funcionalidad eMSP**: Capacidad para actuar como eMSP y conectar con CPOs externos
- **Gestión de Conectores**: Información detallada de conectores por EVSE
- **Notificaciones Automáticas**: Sistema de notificaciones para cambios de estado de EVSEs
- **Configuración Flexible**: Adaptable a diferentes países y operadores mediante variables de entorno

## 🏗️ Arquitectura

- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Sequelize (configurado sin sincronización automática)
- **Cache**: Redis
- **Documentación**: Swagger/OpenAPI
- **Contenedores**: Docker + Docker Compose
- **Frontend**: HTML5 + Bootstrap 5.3 + JavaScript vanilla
- **Tiempo Real**: Server-Sent Events (SSE) para streaming de logs

## 📊 Distribución de Ubicaciones

### España
- **Madrid**: 20 ubicaciones
- **Barcelona**: 15 ubicaciones  
- **Valencia**: 10 ubicaciones
- **Sevilla**: 8 ubicaciones

### Portugal
- **Lisboa**: 12 ubicaciones
- **Porto**: 10 ubicaciones

**Total**: 75 ubicaciones con infraestructura de carga distribuida

## ⚙️ Configuración

### Variables de Entorno OCPI

La aplicación utiliza variables de entorno para configurar dinámicamente el comportamiento OCPI:

```bash
# Configuración OCPI
OCPI_PARTY_ID=IPD                    # Identificador del operador (ej: IPD, EDF, etc.)
OCPI_COUNTRY_CODE=ES                 # Código de país ISO (ej: ES, FR, DE, etc.)
OCPI_VERSION=2.2                     # Versión del protocolo OCPI
OCPI_BASE_URL=https://api.cpo.com    # URL base del CPO
```

### Configuración Dinámica

- **URLs de Notificaciones**: Se generan automáticamente usando las variables de entorno
- **Headers User-Agent**: Dinámicos basados en party_id y versión
- **Generación de evse_id**: Formato `{COUNTRY_CODE}*{PARTY_ID}*E{UID}`
- **Filtros de Base de Datos**: Dinámicos según party_id configurado
- **Frontend**: Carga automática de configuración al inicializar

### Adaptabilidad

La aplicación puede adaptarse a diferentes países y operadores simplemente cambiando las variables de entorno, sin necesidad de modificar el código.

## 🛠️ Instalación

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd cpo-ocpi-2.2
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Iniciar la aplicación
```bash
# Iniciar servicios
docker-compose up -d

# Esperar a que PostgreSQL esté listo
docker-compose logs postgres
```

### 4. Configurar la base de datos
```bash
# Usar el script maestro (PowerShell)
.\scripts\setup_database.ps1

# O ejecutar scripts individualmente
Get-Content scripts/init_database.sql | docker exec -i cursorconcepto-postgres-1 psql -U cpo_user -d cpo_ocpi
Get-Content scripts/populate_database.sql | docker exec -i cursorconcepto-postgres-1 psql -U cpo_user -d cpo_ocpi
Get-Content scripts/populate_evses.sql | docker exec -i cursorconcepto-postgres-1 psql -U cpo_user -d cpo_ocpi
Get-Content scripts/populate_tariffs.sql | docker exec -i cursorconcepto-postgres-1 psql -U cpo_user -d cpo_ocpi
```

## 🌐 Endpoints Disponibles

### Core OCPI 2.2
- `GET /ocpi/2.2/versions` - Versiones disponibles del protocolo
- `GET /ocpi/2.2/details` - Detalles de implementación con endpoints disponibles

### Locations (Ubicaciones)
- `GET /ocpi/2.2/locations` - Lista de ubicaciones con paginación OCPI 2.2
- `GET /ocpi/2.2/locations/{id}` - Ubicación específica con EVSEs asociados

### EVSEs
- `GET /ocpi/2.2/evses` - Lista de puntos de carga

### Tariffs (Tarifas)
- `GET /ocpi/2.2/tariffs` - Lista de tarifas

### Credentials (Credenciales)
- `POST /ocpi/2.2/credentials` - Intercambio de credenciales OCPI 2.2
- `PUT /ocpi/2.2/credentials` - Actualización de credenciales OCPI 2.2

### Tokens
- `GET /ocpi/2.2/tokens` - Lista de tokens OCPI 2.2 con paginación
- `GET /ocpi/2.2/tokens/{id}` - Token específico por ID
- `POST /ocpi/2.2/tokens` - Crear nuevo token
- `PUT /ocpi/2.2/tokens/{id}` - Actualizar token existente
- `DELETE /ocpi/2.2/tokens/{id}` - Eliminar token

### Funcionalidad eMSP
- `GET /ocpi/emsp/2.2/locations` - Ubicaciones recibidas de CPOs externos
- `GET /ocpi/emsp/2.2/evses` - EVSEs recibidos de CPOs externos
- `GET /ocpi/emsp/2.2/tariffs` - Tarifas recibidas de CPOs externos
- `POST /emsp/actions/save-cpo-locations` - Guardar locations de CPO externo

### Dashboard y Monitoreo
- `GET /` - Dashboard frontend principal
- `GET /logs/stream` - Streaming de logs en tiempo real (SSE)
- `GET /logs/recent` - Logs recientes para el dashboard
- `GET /health` - Estado de la aplicación
- `GET /api-docs` - Documentación Swagger

## 📝 Scripts de Base de Datos

### `scripts/init_database.sql`
Crea todas las tablas necesarias sin usar Sequelize sync.

### `scripts/populate_database.sql`
Inserta 75 ubicaciones distribuidas por España y Portugal.

### `scripts/populate_evses.sql`
Genera EVSEs distribuidos uniformemente (máximo 50 por ubicación).

### `scripts/populate_tariffs.sql`
Inserta tarifas básicas para España y Portugal.

### `scripts/setup_database.ps1`
Script maestro que ejecuta todos los scripts en orden.

### `scripts/init_emsp_tables.sql`
Crea tablas específicas para funcionalidad eMSP (emsp_locations, emsp_evses, emsp_tariffs).

### `scripts/populate_emsp_tokens.sql`
Inserta 20 tokens eMSP con diferentes tipos según la especificación OCPI 2.2 (AD_HOC_USER, APP_USER, OTHER, RFID).

## 🔧 Desarrollo

### Estructura del Proyecto
```
src/
├── api/           # Endpoints de la API
│   ├── versions.js      # Endpoint de versiones OCPI 2.2
│   ├── details.js       # Endpoint de detalles de implementación
│   ├── locations.js     # Gestión de ubicaciones
│   ├── evses.js         # Gestión de EVSEs
│   ├── tariffs.js       # Gestión de tarifas
│   ├── credentials.js   # Gestión de credenciales OCPI 2.2
│   ├── emsp.js          # Endpoints eMSP para datos recibidos
│   ├── emspActions.js   # Acciones eMSP (guardar datos de CPO)
│   ├── logs.js          # Streaming y consulta de logs
│   └── notifications.js # Notificaciones automáticas de EVSEs
├── database/      # Configuración de base de datos
├── middleware/    # Middleware de Express
├── models/        # Modelos de Sequelize
├── services/      # Servicios
│   ├── ocpiTokenService.js    # Gestión de tokens OCPI
│   └── evseNotificationService.js # Notificaciones automáticas
├── utils/         # Utilidades (logger, etc.)
└── public/        # Frontend dashboard
    ├── index.html # Dashboard principal
    ├── app.js     # Lógica del frontend
    └── styles.css # Estilos personalizados

scripts/           # Scripts de base de datos y utilidades
├── init_database.sql
├── init_emsp_tables.sql
├── populate_database.sql
├── populate_evses.sql
├── populate_tariffs.sql
├── populate_emsp_tokens.sql
├── setup_database.ps1
├── generate-ocpi-token.js
├── view-logs.js
└── logs
```

### Reiniciar la Aplicación
```bash
docker-compose restart app
```

### Ver Logs
```bash
docker-compose logs -f app
```

### Acceder a la Base de Datos
```bash
docker exec -it cursorconcepto-postgres-1 psql -U cpo_user -d cpo_ocpi
```

## 🖥️ Dashboard Frontend

### Características del Dashboard

La aplicación incluye un dashboard web integrado que proporciona:

- **📊 Vista General**: Estadísticas en tiempo real de la aplicación
- **📍 Gestión de Locations**: Visualización y gestión de ubicaciones
- **🔌 Gestión de EVSEs**: Control de puntos de carga con información de conectores
- **💰 Gestión de Tarifas**: Administración de tarifas de carga
- **🔗 Conexiones eMSP**: Monitoreo de conexiones con CPOs externos
- **📝 Logs en Tiempo Real**: Streaming de logs con filtros avanzados
- **🔄 Funcionalidad eMSP**: Capacidad para actuar como eMSP y conectar con CPOs externos

### Acceso al Dashboard

```bash
# El dashboard está disponible en:
http://localhost:3000/
```

### Funcionalidades Principales

#### **1. Gestión de Locations**
- Visualización de todas las ubicaciones
- Información detallada de cada location
- Conteo de EVSEs por ubicación
- Filtros y búsqueda avanzada

#### **2. Gestión de EVSEs**
- Lista completa de puntos de carga
- Información de conectores por EVSE
- Estados de EVSEs en tiempo real
- Gestión de capacidades y características

#### **3. Funcionalidad eMSP**
- **"Get CPO Locations"**: Conectar con CPOs externos y obtener locations
- **"EMSP Locations"**: Visualizar locations recibidas de CPOs externos
- **"EMSP EVSEs"**: Ver EVSEs con información de conectores
- **"EMSP Tariffs"**: Gestionar tarifas recibidas

#### **4. Sistema de Logs**
- **Streaming en Tiempo Real**: Logs actualizados automáticamente
- **Filtros Avanzados**: Por tipo, período, y contenido
- **Búsqueda Rápida**: Encuentra información específica
- **Historial Completo**: Acceso a todos los logs de la aplicación

### Tecnologías del Frontend

- **HTML5**: Estructura semántica moderna
- **Bootstrap 5.3**: Framework CSS responsive
- **Bootstrap Icons**: Iconografía consistente
- **JavaScript Vanilla**: Sin dependencias externas
- **Server-Sent Events (SSE)**: Streaming de datos en tiempo real
- **Fetch API**: Comunicación con el backend
- **localStorage**: Persistencia de tokens y configuraciones

### Navegación del Dashboard

El dashboard está organizado en pestañas para facilitar la navegación:

1. **📊 Dashboard**: Vista general y estadísticas
2. **📍 Locations**: Gestión de ubicaciones
3. **🔌 EVSEs**: Gestión de puntos de carga
4. **💰 Tariffs**: Gestión de tarifas
5. **🔗 Connections**: Conexiones eMSP activas
6. **📝 Logs**: Sistema de logs en tiempo real
7. **🔄 EMSP Actions**: Funcionalidades eMSP

## 🔍 Monitoreo y Logs

### Herramientas de Logs Disponibles

El proyecto incluye herramientas especializadas para monitorear y analizar logs de la API OCPI:

#### **1. Script Simple (Uso Rápido)**
```bash
# Ver logs de diferentes períodos
./scripts/logs 5        # Últimos 5 minutos
./scripts/logs 10       # Últimos 10 minutos
./scripts/logs 30       # Últimos 30 minutos

# Filtrar por tipo de log
./scripts/logs api      # Solo peticiones API entrantes
./scripts/logs responses # Solo respuestas API salientes
./scripts/logs auth     # Solo logs de autenticación
./scripts/logs errors   # Solo errores (4xx, 5xx)
./scripts/logs success  # Solo respuestas exitosas (2xx)

# Seguimiento en tiempo real
./scripts/logs follow   # Seguir logs en tiempo real (Ctrl+C para salir)

# Ayuda
./scripts/logs help     # Mostrar todas las opciones disponibles
```

#### **2. Menú Interactivo (Uso Completo)**
```bash
# Iniciar menú interactivo con todas las opciones
node scripts/view-logs.js
```

**Características del menú interactivo:**
- 📊 Opciones numeradas para fácil navegación
- 🔍 Búsqueda por texto específico en logs
- 📋 Seguimiento en tiempo real con navegación
- 🔄 Menú recursivo para análisis continuo

### Casos de Uso Comunes

```bash
# Monitoreo rápido de actividad reciente
./scripts/logs 5

# Detectar problemas de autenticación
./scripts/logs auth

# Identificar errores de API
./scripts/logs errors

# Verificar peticiones entrantes
./scripts/logs api

# Monitoreo continuo durante pruebas
./scripts/logs follow
```

### Ventajas de las Herramientas

✅ **Monitoreo Independiente**: No más preguntas sobre qué está pasando en la API  
✅ **Detección Rápida**: Identificación inmediata de problemas y errores  
✅ **Filtros Especializados**: Logs organizados por tipo y período  
✅ **Tiempo Real**: Seguimiento continuo de actividad de la aplicación  
✅ **Uso Sencillo**: Comandos simples y menú intuitivo  

## 🔄 Funcionalidad eMSP

### Capacidades eMSP

La aplicación puede actuar como un eMSP (Electric Mobility Service Provider) para:

- **Conectar con CPOs Externos**: Establecer conexiones con otros operadores de carga
- **Recibir Locations**: Obtener información de ubicaciones de CPOs externos
- **Gestionar EVSEs**: Administrar puntos de carga de terceros
- **Procesar Tarifas**: Manejar tarifas de diferentes operadores

### Proceso de Conexión eMSP

#### **1. Configuración Inicial**
```bash
# Generar token para el CPO externo
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js generate --party-id EXTERNAL_CPO --country-code ES
```

#### **2. Intercambio de Credenciales**
```bash
# El CPO externo debe hacer POST a /ocpi/2.2/credentials
# La aplicación responderá con nuestras credenciales eMSP
```

#### **3. Obtención de Datos**
- **Desde el Dashboard**: Usar el botón "Get CPO Locations"
- **Desde la API**: Hacer GET requests a los endpoints del CPO externo
- **Almacenamiento**: Los datos se guardan automáticamente en las tablas `emsp_*`

### Estructura de Datos eMSP

#### **Tablas eMSP**
- **`emsp_locations`**: Ubicaciones recibidas de CPOs externos
- **`emsp_evses`**: EVSEs con información de conectores
- **`emsp_tariffs`**: Tarifas de operadores externos
- **`emsp_connections`**: Registro de conexiones activas

#### **Tokens eMSP**
La aplicación incluye 20 tokens predefinidos para cuando actúa como eMSP:

**Distribución por Tipo:**
- **5 tokens AD_HOC_USER**: Usuarios ocasionales con diferentes perfiles
- **5 tokens APP_USER**: Usuarios de aplicación móvil
- **5 tokens RFID**: Tokens físicos para vehículos
- **5 tokens OTHER**: Tokens especiales para casos específicos

**Características de los Tokens:**
- **Party ID**: EMSP001 (identificador del eMSP)
- **Country Code**: ES (España)
- **Whitelist**: ALWAYS, ALLOWED, ALLOWED_OFFLINE
- **Perfiles**: REGULAR, FAST, CHEAP, GREEN
- **Métodos de Autenticación**: APP_USER, RFID, OTHER

**Estructura de Respuesta OCPI 2.2:**
Los tokens se devuelven siguiendo la especificación OCPI 2.2 con campos obligatorios y opcionales:

**Campos Obligatorios:**
- `country_code`, `party_id`, `uid`, `type`, `contract_id`, `issuer`, `valid`, `whitelist`, `last_updated`

**Campos Opcionales:**
- `visual_number`, `group_id`, `language`, `default_profile_type`, `energy_contract`

**Ejemplo de Respuesta:**
```json
{
  "status_code": 1000,
  "data": [
    {
      "country_code": "ES",
      "party_id": "EMSP001",
      "uid": "rfid-user-001",
      "type": "RFID",
      "contract_id": "contract-011",
      "issuer": "EMSP_System",
      "valid": true,
      "whitelist": "ALWAYS",
      "last_updated": "2025-08-31T14:39:40.205Z",
      "visual_number": "RF001",
      "group_id": "group-006",
      "language": "es",
      "default_profile_type": "REGULAR",
      "energy_contract": {
        "provider": "EMSP_System",
        "type": "rfid",
        "card_type": "ISO14443"
      }
    }
  ],
  "timestamp": "2025-08-31T14:46:50.860Z",
  "pagination": {
    "total": 6,
    "offset": 0,
    "limit": 2
  }
}
```

#### **Información de Conectores**
Cada EVSE incluye información detallada de conectores:
```json
{
  "id": "1",
  "standard": "IEC_62196_T2",
  "format": "SOCKET",
  "power_type": "AC_1_PHASE",
  "max_voltage": 230,
  "max_amperage": 32,
  "tariff_ids": ["tariff-uuid"],
  "last_updated": "2025-02-21T12:46:23.395Z"
}
```

### Endpoints eMSP Disponibles

- **`GET /ocpi/emsp/2.2/locations`**: Obtener locations almacenadas
- **`GET /ocpi/emsp/2.2/evses`**: Obtener EVSEs con conectores
- **`GET /ocpi/emsp/2.2/tariffs`**: Obtener tarifas recibidas
- **`POST /emsp/actions/save-cpo-locations`**: Guardar datos de CPO externo

### Casos de Uso Comunes

#### **Conectar con CPO Externo**
1. Acceder al dashboard en `http://localhost:3000/`
2. Ir a la pestaña "🔄 EMSP Actions"
3. Usar "Get CPO Locations" con URL y token del CPO externo
4. Los datos se guardan automáticamente en las tablas eMSP

#### **Configurar Tokens eMSP**
```bash
# Ejecutar script para poblar tokens eMSP
docker exec -i cursor-postgres-1 psql -U cpo_user -d cpo_ocpi < scripts/populate_emsp_tokens.sql

# Verificar tokens creados
docker exec -i cursor-postgres-1 psql -U cpo_user -d cpo_ocpi -c "SELECT type, COUNT(*) FROM tokens WHERE party_id LIKE 'EMSP%' GROUP BY type;"
```

#### **Consultar Tokens eMSP via API**
```bash
# Obtener todos los tokens (con autenticación)
curl -H "Authorization: Token OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb" \
     "http://localhost:3000/ocpi/cpo/2.2/tokens"

# Filtrar por tipo de token
curl -H "Authorization: Token OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb" \
     "http://localhost:3000/ocpi/cpo/2.2/tokens?type=RFID&limit=5"

# Obtener token específico
curl -H "Authorization: Token OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb" \
     "http://localhost:3000/ocpi/cpo/2.2/tokens/emsp-token-001"
```

#### **Visualizar Datos Recibidos**
- **EMSP Locations**: Ver ubicaciones del CPO externo
- **EMSP EVSEs**: Ver EVSEs con conteo de conectores
- **EMSP Tariffs**: Ver tarifas del operador externo

#### **Monitoreo de Conexiones**
- **Dashboard**: Estadísticas de conexiones activas
- **Logs**: Seguimiento de todas las operaciones eMSP
- **Health Check**: Estado de las conexiones externas

## 🔑 Gestión de Tokens OCPI

### Comandos de Gestión de Tokens

El proyecto incluye herramientas CLI para gestionar tokens de autenticación OCPI:

#### **Generar Nuevo Token**
```bash
# Generar token para un party_id específico
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js generate --party-id EFI --country-code ES

# Generar token con fecha de expiración
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js generate --party-id EPK --country-code ES --expires 2025-12-31
```

#### **Listar Tokens Existentes**
```bash
# Ver todos los tokens
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js list

# Ver tokens activos
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js list --active
```

#### **Gestionar Tokens**
```bash
# Desactivar token específico
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js deactivate --token OCPI_XXXXX

# Limpiar tokens expirados
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js cleanup
```

### Casos de Uso Comunes

```bash
# Generar token inicial para nuevo eMSP
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js generate --party-id TELPARK --country-code ES

# Verificar estado de tokens existentes
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js list

# Renovar token expirado
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js generate --party-id EFI --country-code ES
```

### Estructura de Tokens

- **Formato**: `OCPI_[random_string]`
- **Longitud**: Variable (seguro y único)
- **Expiración**: Configurable o indefinida
- **Asociación**: Party ID + Country Code
- **Estado**: Activo/Inactivo

## 🚨 Solución de Problemas

### Base de Datos Vacía
Si la aplicación no muestra datos:
1. Verificar que PostgreSQL esté ejecutándose
2. Ejecutar el script de configuración: `.\scripts\setup_database.ps1`
3. Verificar que las tablas tengan datos

### Problemas de Conexión
```bash
# Verificar estado de contenedores
docker-compose ps

# Reiniciar servicios
docker-compose down && docker-compose up -d
```

### Problemas de Autenticación
```bash
# Verificar tokens activos
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js list

# Generar nuevo token si es necesario
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js generate --party-id EFI --country-code ES
```

### Problemas del Dashboard Frontend
```bash
# Si el dashboard no carga correctamente
docker-compose restart app

# Verificar logs del frontend
docker-compose logs -f app | grep -E "(frontend|dashboard|error)"

# Limpiar caché del navegador o usar modo incógnito
```

### Problemas de Funcionalidad eMSP
```bash
# Verificar tablas eMSP
docker exec -it cursor-postgres-1 psql -U cpo_user -d cpo_ocpi -c "SELECT COUNT(*) FROM emsp_locations;"
docker exec -it cursor-postgres-1 psql -U cpo_user -d cpo_ocpi -c "SELECT COUNT(*) FROM emsp_evses;"

# Verificar conectores de EVSEs
docker exec -it cursor-postgres-1 psql -U cpo_user -d cpo_ocpi -c "SELECT id, evse_id, json_array_length(connectors) as connector_count FROM emsp_evses LIMIT 5;"
```

### Problemas de Streaming de Logs
```bash
# Si los logs no se actualizan en tiempo real
docker-compose restart app

# Verificar endpoint de logs
curl -s http://localhost:3000/logs/recent | head -5

# Verificar logs del servidor
docker-compose logs -f app | grep -E "(SSE|EventSource|streaming)"
```

### Monitoreo de Problemas
```bash
# Ver logs de errores
./scripts/logs errors

# Ver logs de autenticación
./scripts/logs auth

# Seguir logs en tiempo real
./scripts/logs follow
```

## 📊 Estadísticas

- **Ubicaciones**: 75
- **EVSEs**: ~2,500 (distribuidos uniformemente)
- **Tarifas**: 6 (3 por país)
- **Cobertura**: España y Portugal
- **Protocolo**: OCPI 2.2 completo
- **Conectores por EVSE**: 1-2 (IEC_62196_T2, DOMESTIC_F)
- **Tipos de Conectores**: SOCKET, CABLE
- **Potencia**: 16A-32A (AC_1_PHASE, AC_3_PHASE)
- **Voltaje**: 40V-230V

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas, abrir un issue en el repositorio.


