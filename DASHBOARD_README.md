# 🚀 **IPD CPO Dashboard - OCPI 2.2**

## 📋 **Descripción General**

El **IPD CPO Dashboard** es una interfaz web moderna y responsive que proporciona una vista completa y en tiempo real de la aplicación CPO OCPI 2.2. Permite monitorear logs, gestionar locations, EVSEs, conexiones eMSP y tokens de acceso de manera intuitiva.

## ✨ **Características Principales**

### ⚙️ **Configuración Dinámica**
- **Variables de entorno**: Configuración automática de party_id, country_code y versión OCPI
- **Carga automática**: El frontend carga la configuración al inicializar
- **Adaptabilidad**: Fácil cambio de país/operador sin modificar código
- **URLs dinámicas**: Todas las notificaciones OCPI usan configuración dinámica
- **Headers dinámicos**: User-Agent y otros headers basados en configuración

### 🔍 **Logs en Tiempo Real**
- **Streaming en vivo**: Visualización de logs en tiempo real usando Server-Sent Events
- **Filtros avanzados**: Por nivel (ERROR, WARN, INFO, DEBUG), tipo y búsqueda de texto
- **Auto-scroll**: Opción para mantener el scroll automático en la parte inferior
- **Controles**: Iniciar/parar streaming, limpiar logs
- **Límite inteligente**: Máximo 1000 entradas de log para optimizar rendimiento

### 📍 **Gestión de Locations**
- **Vista completa**: Lista de todas las locations con información detallada
- **Contadores**: Número total de locations y EVSEs por location
- **Actualización en tiempo real**: Botón de refresh para datos actualizados
- **Información detallada**: ID, nombre, país, ciudad, dirección, EVSEs asociados

### ⚡ **Gestión de EVSEs**
- **Estado visual**: Badges de colores para cada estado (AVAILABLE, CHARGING, INOPERATIVE, etc.)
- **Filtros**: Por estado y búsqueda por EVSE ID
- **Información completa**: UID, Location ID, estado, conectores, última actualización
- **Estados OCPI 2.2**: Todos los estados válidos según especificación

### 🌐 **Conexiones eMSP**
- **Monitoreo de conexiones**: Estado de todas las conexiones eMSP activas
- **Información de contacto**: Party ID, país, URL, token
- **Estado de conexión**: Indicador visual de conexiones activas
- **Enlaces directos**: URLs clickeables para verificar conectividad

### 🔑 **Gestión de Tokens**
- **Estado de tokens**: Activos/inactivos con indicadores visuales
- **Información de seguridad**: Fechas de expiración, último uso, creación
- **Truncamiento inteligente**: Tokens largos se muestran de forma segura
- **Monitoreo de uso**: Seguimiento de cuándo se usó cada token por última vez

## 🎨 **Interfaz de Usuario**

### 🎯 **Diseño Responsive**
- **Bootstrap 5.3**: Framework CSS moderno y responsive
- **Bootstrap Icons**: Iconografía consistente y profesional
- **Tabs organizadas**: Navegación clara entre secciones
- **Cards modernas**: Diseño limpio y fácil de leer

### 🎨 **Estilos Personalizados**
- **Tema oscuro para logs**: Terminal-style para mejor legibilidad
- **Badges de estado**: Colores específicos para cada estado OCPI
- **Animaciones suaves**: Transiciones y efectos visuales
- **Scrollbars personalizados**: Mejor integración visual

### 📱 **Responsive Design**
- **Mobile-first**: Optimizado para dispositivos móviles
- **Breakpoints**: Adaptación automática a diferentes tamaños de pantalla
- **Touch-friendly**: Botones y controles optimizados para touch

## 🚀 **Funcionalidades Técnicas**

### ⚡ **Server-Sent Events (SSE)**
- **Conexión persistente**: Streaming de logs sin polling
- **Heartbeat automático**: Mantiene conexiones activas
- **Manejo de errores**: Reconexión automática en caso de fallo
- **Limpieza de conexiones**: Gestión automática de conexiones muertas

### 🔄 **Actualización Automática**
- **Estado de conexión**: Verificación automática cada 30 segundos
- **Carga de datos**: Actualización automática al cambiar de tab
- **Notificaciones**: Sistema de alertas para operaciones importantes
- **Manejo de errores**: Interfaz robusta ante fallos de API

### 🔐 **Autenticación**
- **Token OCPI**: Autenticación mediante tokens OCPI válidos
- **Headers automáticos**: Inclusión automática en todas las peticiones
- **Seguridad**: No almacenamiento de tokens en localStorage

## 📁 **Estructura de Archivos**

```
src/public/
├── index.html          # Página principal del dashboard
├── styles.css          # Estilos CSS personalizados
├── app.js             # Lógica JavaScript del dashboard
└── assets/            # Recursos adicionales (futuro)
```

## 🛠️ **Instalación y Uso**

### 📋 **Requisitos**
- Node.js 18+ 
- Docker y Docker Compose
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

### 🚀 **Acceso al Dashboard**
1. **Iniciar la aplicación**: `docker compose up -d`
2. **Abrir navegador**: `http://localhost:3000`
3. **Dashboard automático**: Se carga automáticamente

### 🔧 **Configuración**
- **Puerto**: Configurable via variable `PORT` (default: 3000)
- **Base URL**: Configurable via variable `OCPI_BASE_URL`
- **Intervalo de logs**: Configurable via variable `EVSE_NOTIFICATION_INTERVAL_MS`

## 📊 **API Endpoints del Dashboard**

### 📝 **Logs**
- `GET /logs/stream` - Streaming de logs en tiempo real (SSE)
- `GET /logs/recent` - Logs recientes con filtros
- `POST /logs/clear` - Limpiar logs

### 📍 **Locations**
- `GET /ocpi/cpo/2.2/locations` - Lista de locations

### ⚡ **EVSEs**
- `GET /ocpi/cpo/2.2/evses` - Lista de EVSEs

### 🌐 **Conexiones**
- `GET /ocpi/cpo/2.2/credentials` - Lista de conexiones eMSP

### 🔑 **Tokens**
- `GET /ocpi/cpo/2.2/tokens` - Lista de tokens de acceso

## 🎯 **Casos de Uso**

### 👨‍💼 **Operadores de CPO**
- **Monitoreo en tiempo real**: Ver logs de la aplicación en vivo
- **Gestión de infraestructura**: Revisar estado de locations y EVSEs
- **Supervisión de conexiones**: Verificar conectividad con eMSPs
- **Auditoría de seguridad**: Revisar tokens y accesos

### 🔧 **Desarrolladores**
- **Debugging**: Logs en tiempo real para desarrollo
- **Testing**: Verificar respuestas de API
- **Monitoreo**: Estado de servicios y conexiones
- **Documentación**: Swagger UI integrado

### 📊 **Analistas**
- **Estadísticas**: Contadores de elementos
- **Tendencias**: Historial de cambios de estado
- **Reportes**: Exportación de datos (futuro)
- **Alertas**: Notificaciones de eventos importantes

## 🚀 **Roadmap Futuro**

### 🔮 **Funcionalidades Planificadas**
- **Login de usuarios**: Sistema de autenticación completo
- **Roles y permisos**: Diferentes niveles de acceso
- **Gráficos y estadísticas**: Visualizaciones avanzadas
- **Exportación de datos**: CSV, JSON, PDF
- **Notificaciones push**: Alertas en tiempo real
- **Configuración avanzada**: Personalización del dashboard

### 🔧 **Mejoras Técnicas**
- **WebSocket**: Reemplazar SSE para mejor rendimiento
- **PWA**: Aplicación web progresiva
- **Offline mode**: Funcionalidad sin conexión
- **Caché inteligente**: Optimización de rendimiento
- **Tests automatizados**: Cobertura completa de funcionalidades

## 🐛 **Solución de Problemas**

### ❌ **Dashboard no carga**
- Verificar que la aplicación esté ejecutándose
- Revisar logs de Docker: `docker logs cursor-app-1`
- Verificar puerto 3000 esté disponible

### 📝 **Logs no aparecen**
- Verificar conexión SSE: `curl /logs/stream`
- Revisar consola del navegador para errores
- Verificar autenticación con token OCPI válido

### 🔄 **Datos no se actualizan**
- Verificar estado de la API: `curl /health`
- Revisar logs de la aplicación
- Verificar conectividad de base de datos

## 📞 **Soporte y Contacto**

### 🆘 **Ayuda Inmediata**
- **Logs de aplicación**: `docker logs cursor-app-1 --follow`
- **Estado de servicios**: `docker compose ps`
- **Reinicio rápido**: `docker restart cursor-app-1`

### 📚 **Documentación Adicional**
- **README principal**: `README.md`
- **API Documentation**: `http://localhost:3000/api-docs`
- **Swagger UI**: Documentación interactiva de endpoints

---

**🎯 El IPD CPO Dashboard proporciona una interfaz moderna y funcional para gestionar toda la infraestructura OCPI 2.2 de manera eficiente y visualmente atractiva.**
