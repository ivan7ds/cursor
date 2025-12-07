# CPO OCPI 2.2 Application

Aplicación CPO (Charge Point Operator) que implementa el protocolo OCPI 2.2 para gestionar infraestructura de carga de vehículos eléctricos en España y Portugal. La aplicación incluye funcionalidades completas para actuar tanto como CPO como eMSP, con un dashboard frontend integrado para gestión y monitoreo.

**Versión Actual:** 1.2.2  
**Última Actualización:** 2025-01-16

## 🚀 Características

- **Protocolo OCPI 2.2**: Implementación completa del estándar
- **Configuración Dinámica**: Variables de entorno para party_id, country_code y versión OCPI
- **Distribución Geográfica**: 10,000+ EVSEs distribuidos por España y Portugal
- **Infraestructura de Carga**: Máximo 25 EVSEs por ubicación
- **Paginación OCPI 2.2**: Endpoints con paginación estándar (límite configurable)
- **Base de Datos Limpia**: Sin sincronización automática de Sequelize
- **Datos Persistentes**: Información mantenida entre reinicios
- **Autenticación por Tokens**: Sistema de tokens OCPI 2.2 con Real-time Authorization
- **Logging Optimizado**: Sistema de logging mejorado para mejor rendimiento
- **Dashboard Frontend**: Interfaz web integrada para gestión y monitoreo
- **Funcionalidad eMSP**: Capacidad para actuar como eMSP y conectar con CPOs externos
- **Gestión de Conectores**: Información detallada de conectores por EVSE con tarifas
- **Notificaciones Automáticas**: Sistema de notificaciones para cambios de estado de EVSEs
- **Configuración Flexible**: Adaptable a diferentes países y operadores mediante variables de entorno
- **Validación de Payloads**: Sistema de validación de datos de entrada
- **Gestión de Tarifas por Conector**: Asignación de tarifas específicas por conector
- **Corrección de Datos**: Sistema de corrección automática de country_code

## 🏗️ Arquitectura

- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Sequelize (configurado sin sincronización automática)
- **Cache**: Redis
- **Documentación**: Swagger/OpenAPI
- **Contenedores**: Docker + Docker Compose
- **Frontend**: HTML5 + Bootstrap 5.3 + JavaScript vanilla
- **Tiempo Real**: Server-Sent Events (SSE) para streaming de logs

## 📊 Distribución de Infraestructura

### España (90% de la infraestructura)
- **Madrid**: ~1,800 EVSEs
- **Barcelona**: ~1,350 EVSEs  
- **Valencia**: ~900 EVSEs
- **Sevilla**: ~720 EVSEs
- **Otras ciudades**: ~4,230 EVSEs

### Portugal (10% de la infraestructura)
- **Lisboa**: ~540 EVSEs
- **Porto**: ~450 EVSEs
- **Otras ciudades**: ~510 EVSEs

**Total**: 10,000+ EVSEs distribuidos en 400+ ubicaciones

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

#### Opción A: Con Docker (Recomendado)
```bash
# Ejecutar el script de configuración dentro del contenedor
docker exec -it cursor-app-1 ./scripts/setup_database.sh
```

#### Opción B: Sin Docker (Base de datos local)
```bash
# Asegúrate de que PostgreSQL esté ejecutándose localmente
# Ejecutar el script de configuración
./scripts/setup_database.sh
```

#### Opción C: Scripts individuales (Docker)
```bash
# Ejecutar scripts individualmente
docker exec -i cursorconcepto-postgres-1 psql -U cpo_user -d cpo_ocpi -f /app/scripts/init_database.sql
docker exec -i cursorconcepto-postgres-1 psql -U cpo_user -d cpo_ocpi -f /app/scripts/complete_database_setup.sql
```

#### Opción D: Restaurar desde backup
```bash
# Restaurar desde un backup existente
PGPASSWORD=cpo_password psql -h localhost -U cpo_user -d cpo_ocpi < backups/backup_YYYYMMDD_HHMMSS.sql
```

**⚠️ Importante**: La aplicación debe estar ejecutándose **antes** de configurar la base de datos.

### 5. Verificar la instalación
```bash
# Verificar que la aplicación esté funcionando
curl http://localhost:3000/ocpi/2.2/versions

# Verificar el dashboard
# Abrir navegador en: http://localhost:3000
```

### 6. Acceder al dashboard
- **URL**: http://localhost:3000
- **Funcionalidades disponibles**:
  - Gestión de ubicaciones y EVSEs
  - Monitoreo de sesiones de carga
  - Gestión de tarifas
  - Tokens eMSP
  - Sesiones externas
  - Logs en tiempo real
  - Conexiones OCPI

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
- `POST /ocpi/cpo/2.2/tokens/{token_uid}/authorize` - Real-time authorization de tokens

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

### `scripts/complete_database_setup.sql`
Script consolidado que pobla la base de datos con un dataset completo incluyendo:
- Ubicaciones distribuidas por España y Portugal
- EVSEs con especificaciones realistas (máximo 50 por ubicación)
- Tarifas básicas para España y Portugal
- Tokens eMSP con diferentes tipos según OCPI 2.2

### `scripts/setup_database.ps1`
Script maestro que ejecuta todos los scripts en orden.

### `scripts/init_database.sql`
Crea tablas específicas para funcionalidad de operadores externos (external_operator_locations, external_operator_evses, external_operator_tariffs).

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
│   ├── authorization.js # Real-time authorization de tokens
│   ├── commands.js      # Comandos OCPI (START_SESSION, STOP_SESSION)
│   ├── emsp.js          # Endpoints eMSP para datos recibidos
│   ├── emspActions.js   # Acciones eMSP (guardar datos de CPO)
│   ├── logs.js          # Streaming y consulta de logs
│   └── notifications.js # Notificaciones automáticas de EVSEs
├── database/      # Configuración de base de datos
├── middleware/    # Middleware de Express
├── models/        # Modelos de Sequelize
├── services/      # Servicios
│   ├── ocpiTokenService.js    # Gestión de tokens OCPI
│   ├── authorizationService.js # Real-time authorization de tokens
│   └── evseNotificationService.js # Notificaciones automáticas
├── utils/         # Utilidades (logger, etc.)
└── public/        # Frontend dashboard
    ├── index.html # Dashboard principal
    ├── app.js     # Lógica del frontend
    └── styles.css # Estilos personalizados

scripts/           # Scripts de base de datos y utilidades
├── init_database.sql
├── init_emsp_tables.sql
├── complete_database_setup.sql
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

## 💾 Gestión de Backups

### Crear Backup de Base de Datos
```bash
# Crear backup completo de la base de datos
PGPASSWORD=cpo_password pg_dump -h localhost -U cpo_user -d cpo_ocpi > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Verificar que el backup se creó correctamente
ls -la backups/backup_*.sql | tail -1
```

### Restaurar desde Backup
```bash
# Restaurar desde un backup específico
PGPASSWORD=cpo_password psql -h localhost -U cpo_user -d cpo_ocpi < backups/backup_YYYYMMDD_HHMMSS.sql

# Verificar la restauración
PGPASSWORD=cpo_password psql -h localhost -U cpo_user -d cpo_ocpi -c "SELECT COUNT(*) FROM locations;"
```

### Gestión de Backups
```bash
# Listar todos los backups disponibles
ls -la backups/backup_*.sql

# Ver el tamaño de los backups
du -h backups/backup_*.sql

# Limpiar backups antiguos (mantener solo los últimos 10)
ls -t backups/backup_*.sql | tail -n +11 | xargs rm -f
```

### Scripts de Corrección de Datos
```bash
# Aplicar corrección de country_code
PGPASSWORD=cpo_password psql -h localhost -U cpo_user -d cpo_ocpi -f scripts/fix_country_code_pt_to_es.sql

# Verificar corrección aplicada
PGPASSWORD=cpo_password psql -h localhost -U cpo_user -d cpo_ocpi -c "SELECT country_code, COUNT(*) FROM evses GROUP BY country_code;"
```

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

#### **Tablas de Operadores Externos**
- **`external_operator_locations`**: Ubicaciones recibidas de operadores externos (CPO, EMSP o ambos)
- **`external_operator_evses`**: EVSEs con información de conectores
- **`external_operator_tariffs`**: Tarifas de operadores externos
- **`external_operator_sessions`**: Sesiones de operadores externos
- **`external_operator_cdrs`**: CDRs de operadores externos
- **`external_operator_tokens`**: Tokens de operadores externos
- **`external_operator_contracts`**: Contratos de operadores externos

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
# Ejecutar script completo de configuración
docker exec -i cursor-postgres-1 psql -U cpo_user -d cpo_ocpi < scripts/complete_database_setup.sql

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

## 🔐 Real-time Authorization OCPI 2.2.1

### Funcionalidad de Autorización en Tiempo Real

La aplicación implementa el sistema de Real-time Authorization según la especificación OCPI 2.2.1:

#### **Endpoint de Autorización**
- **`POST /ocpi/cpo/2.2/tokens/{token_uid}/authorize`**: Autorización en tiempo real de tokens
- **Validación Completa**: Existencia, validez, expiración, whitelist, restricciones de ubicación/EVSE
- **Respuestas Estructuradas**: Códigos de estado OCPI apropiados
- **Integración Automática**: Con comandos `START_SESSION`

#### **Lógica de Whitelist**
- **`ALWAYS`**: Token siempre autorizado
- **`ALLOWED`**: Token autorizado normalmente
- **`ALLOWED_OFFLINE`**: Token autorizado sin conexión
- **`NEVER`**: Token requiere autorización en tiempo real (aceptado si viene del eMSP)

#### **Casos de Uso**
```bash
# Autorizar token específico
curl -X POST "http://localhost:3000/ocpi/cpo/2.2/tokens/MOCK_TEST_KEY/authorize" \
     -H "Authorization: Token OCPI_XXXXX" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "OTHER",
       "issuer": "empark",
       "location_id": "location-123",
       "evse_uid": "evse-456"
     }'
```

#### **Respuesta de Autorización**
```json
{
  "status_code": 1000,
  "status_message": "Token authorized by eMSP",
  "data": {
    "allowed": "ALLOWED",
    "location_id": "location-123",
    "evse_uid": "evse-456",
    "validity": "VALID"
  },
  "timestamp": "2025-09-08T11:00:00.000Z"
}
```

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
# Verificar tablas de operadores externos
docker exec -it cursor-postgres-1 psql -U cpo_user -d cpo_ocpi -c "SELECT COUNT(*) FROM external_operator_locations;"
docker exec -it cursor-postgres-1 psql -U cpo_user -d cpo_ocpi -c "SELECT COUNT(*) FROM external_operator_evses;"

# Verificar conectores de EVSEs
docker exec -it cursor-postgres-1 psql -U cpo_user -d cpo_ocpi -c "SELECT id, evse_id, json_array_length(connectors) as connector_count FROM external_operator_evses LIMIT 5;"
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

## 🆕 Mejoras Recientes (v1.2.2)

### Correcciones de Datos
- **Corrección de country_code**: Eliminados valores hardcodeados, ahora usa variables de entorno
- **Consistencia de datos**: 1,000+ registros de EVSEs y 40+ locations corregidos
- **Scripts de corrección**: Herramientas automáticas para mantener integridad de datos

### Optimizaciones de Rendimiento
- **Logging optimizado**: Reducido tamaño de logs para mejor rendimiento
- **Validación mejorada**: Sistema de validación de payloads más robusto
- **Gestión de tarifas**: Asignación de tarifas específicas por conector

### Mejoras de Configuración
- **Variables de entorno**: Uso consistente de configuración desde .env
- **Flexibilidad**: Fácil adaptación a diferentes países y operadores
- **Mantenibilidad**: Código más limpio y mantenible

## 📊 Estadísticas

- **Ubicaciones**: 400+
- **EVSEs**: 10,000+ (distribuidos geográficamente)
- **Tarifas**: 6+ (3 por país)
- **Cobertura**: España (90%) y Portugal (10%)
- **Protocolo**: OCPI 2.2 completo con Real-time Authorization 2.2.1
- **Conectores por EVSE**: 1-2 (IEC_62196_T2, DOMESTIC_F)
- **Tipos de Conectores**: SOCKET, CABLE
- **Potencia**: 16A-250A (AC_1_PHASE, AC_3_PHASE, DC)
- **Voltaje**: 230V-1000V
- **Autorización**: Real-time Authorization implementada
- **Tokens eMSP**: 20 tokens predefinidos para funcionalidad eMSP
- **Validación**: Sistema de validación de payloads implementado
- **Logging**: Sistema optimizado para mejor rendimiento

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


