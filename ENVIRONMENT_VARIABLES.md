# 🌍 Variables de Entorno - CPO OCPI 2.2

## 📋 Resumen

Este documento describe todas las variables de entorno utilizadas en la aplicación CPO OCPI 2.2, incluyendo su propósito, valores por defecto y estado de implementación.

## ✅ Variables Utilizadas

### 🗄️ **Configuración de Base de Datos**
| Variable | Descripción | Valor por Defecto | Archivo de Uso |
|----------|-------------|-------------------|----------------|
| `DB_HOST` | Host de PostgreSQL | `localhost` | `src/database/connection.js` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` | `src/database/connection.js` |
| `DB_NAME` | Nombre de la base de datos | `cpo_ocpi` | `src/database/connection.js` |
| `DB_USER` | Usuario de la base de datos | `cpo_user` | `src/database/connection.js` |
| `DB_PASSWORD` | Contraseña de la base de datos | `your_password` | `src/database/connection.js` |
| `DB_DIALECT` | Dialecto de la base de datos | `postgres` | `src/database/connection.js` |

### 🔴 **Configuración de Redis**
| Variable | Descripción | Valor por Defecto | Archivo de Uso |
|----------|-------------|-------------------|----------------|
| `REDIS_HOST` | Host de Redis | `localhost` | `src/database/redis.js` |
| `REDIS_PORT` | Puerto de Redis | `6379` | `src/database/redis.js` |
| `REDIS_PASSWORD` | Contraseña de Redis | `undefined` | `src/database/redis.js` |

### 🖥️ **Configuración del Servidor**
| Variable | Descripción | Valor por Defecto | Archivo de Uso |
|----------|-------------|-------------------|----------------|
| `PORT` | Puerto del servidor | `3000` | `src/server.js` |
| `NODE_ENV` | Entorno de ejecución | `development` | Múltiples archivos |

### 🌐 **Configuración OCPI**
| Variable | Descripción | Valor por Defecto | Archivo de Uso |
|----------|-------------|-------------------|----------------|
| `OCPI_VERSION` | Versión del protocolo OCPI | `2.2` | Múltiples archivos |
| `OCPI_BASE_URL` | URL base del CPO | `http://localhost:3000` | Múltiples archivos |
| `OCPI_PARTY_ID` | Identificador del operador | `IPD` | Múltiples archivos |
| `OCPI_COUNTRY_CODE` | Código de país ISO | `ES` | Múltiples archivos |
| `OCPI_TOKEN` | Token por defecto | `ocpi_token_ipd_2024_secure_key` | `src/middleware/auth.js` |

### 🚦 **Rate Limiting**
| Variable | Descripción | Valor por Defecto | Archivo de Uso |
|----------|-------------|-------------------|----------------|
| `RATE_LIMIT_WINDOW_MS` | Ventana de tiempo para rate limiting | `900000` | `src/middleware/rateLimiter.js` |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests por ventana | `100` | `src/middleware/rateLimiter.js` |
| `DISABLE_RATE_LIMIT` | Deshabilitar rate limiting | `false` | `src/middleware/rateLimiter.js` |

### 📝 **Logging**
| Variable | Descripción | Valor por Defecto | Archivo de Uso |
|----------|-------------|-------------------|----------------|
| `LOG_LEVEL` | Nivel de logging | `info` | `src/utils/logger.js` |

### ⚡ **Servicios de Notificación**
| Variable | Descripción | Valor por Defecto | Archivo de Uso |
|----------|-------------|-------------------|----------------|
| `EVSE_NOTIFICATION_INTERVAL_MS` | Intervalo de notificaciones EVSE | `30000` | `src/services/evseNotificationService.js` |

## ❌ Variables No Utilizadas

### 🔐 **Autenticación JWT (No Implementada)**
| Variable | Descripción | Estado |
|----------|-------------|--------|
| `JWT_SECRET` | Secreto para JWT | ❌ No implementado |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | ❌ No implementado |

### 📁 **Logging Avanzado (No Implementado)**
| Variable | Descripción | Estado |
|----------|-------------|--------|
| `LOG_FILE` | Archivo de logs | ❌ No implementado |

### 🌍 **APIs Externas (No Implementadas)**
| Variable | Descripción | Estado |
|----------|-------------|--------|
| `MAPS_API_KEY` | Clave de Google Maps | ❌ No implementado |
| `WEATHER_API_KEY` | Clave de OpenWeather | ❌ No implementado |

## 🚀 Configuración Recomendada

### Para Desarrollo
```bash
NODE_ENV=development
PORT=3000
OCPI_PARTY_ID=IPD
OCPI_COUNTRY_CODE=ES
OCPI_VERSION=2.2
LOG_LEVEL=debug
DISABLE_RATE_LIMIT=true
```

### Para Producción
```bash
NODE_ENV=production
PORT=3000
OCPI_PARTY_ID=TU_OPERADOR
OCPI_COUNTRY_CODE=TU_PAIS
OCPI_VERSION=2.2
LOG_LEVEL=info
DISABLE_RATE_LIMIT=false
RATE_LIMIT_MAX_REQUESTS=1000
```

## 📊 Estadísticas

- **Total de variables definidas**: 17
- **Variables utilizadas**: 12 (71%)
- **Variables no utilizadas**: 5 (29%)
- **Variables adicionales en código**: 2

## 🔧 Migración

Para migrar a un nuevo país/operador:

1. Cambiar `OCPI_PARTY_ID` al nuevo identificador
2. Cambiar `OCPI_COUNTRY_CODE` al nuevo código de país
3. Actualizar `OCPI_BASE_URL` si es necesario
4. Reiniciar la aplicación

No se requiere modificación de código.
