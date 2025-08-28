# CPO OCPI 2.2 Application

Aplicación CPO (Charge Point Operator) que implementa el protocolo OCPI 2.2 para gestionar infraestructura de carga de vehículos eléctricos en España y Portugal.

## 🚀 Características

- **Protocolo OCPI 2.2**: Implementación completa del estándar
- **Distribución Geográfica**: 75 ubicaciones distribuidas por España y Portugal
- **Infraestructura de Carga**: Máximo 50 EVSEs por ubicación
- **Paginación OCPI 2.2**: Endpoints con paginación estándar
- **Base de Datos Limpia**: Sin sincronización automática de Sequelize
- **Datos Persistentes**: Información mantenida entre reinicios
- **Autenticación por Tokens**: Sistema de tokens OCPI 2.2
- **Logging Detallado**: Monitoreo completo de peticiones y respuestas

## 🏗️ Arquitectura

- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Sequelize (configurado sin sincronización automática)
- **Cache**: Redis
- **Documentación**: Swagger/OpenAPI
- **Contenedores**: Docker + Docker Compose

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

### Otros
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

## 🔧 Desarrollo

### Estructura del Proyecto
```
src/
├── api/           # Endpoints de la API
├── database/      # Configuración de base de datos
├── middleware/    # Middleware de Express
├── models/        # Modelos de Sequelize
├── services/      # Servicios (OCPI Token Service)
└── utils/         # Utilidades (logger, etc.)

scripts/           # Scripts de base de datos y utilidades
├── init_database.sql
├── populate_database.sql
├── populate_evses.sql
├── populate_tariffs.sql
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


