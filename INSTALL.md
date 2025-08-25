# Instalación de la Aplicación CPO OCPI 2.2

## Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 15 o superior
- Redis 7 o superior
- Docker y Docker Compose (opcional)

## Instalación Local

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd cpo-ocpi-2.2
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

### 4. Configurar base de datos
```bash
# Crear base de datos PostgreSQL
createdb cpo_ocpi

# Crear usuario (opcional)
createuser cpo_user
psql -d cpo_ocpi -c "ALTER USER cpo_user WITH PASSWORD 'your_password';"
```

### 5. Ejecutar setup
```bash
npm run setup
```

### 6. Iniciar aplicación
```bash
npm run dev
```

## Instalación con Docker

### 1. Usar Docker Compose
```bash
docker-compose up -d
```

### 2. Ejecutar setup en contenedor
```bash
docker-compose exec app npm run setup
```

### 3. Verificar servicios
```bash
docker-compose ps
```

## Verificación

### Health Check
```bash
curl http://localhost:3000/health
```

### API Documentation
```bash
# Abrir en navegador
http://localhost:3000/api-docs
```

### Endpoints OCPI 2.2
- Credenciales: `http://localhost:3000/ocpi/2.2/credentials`
- Ubicaciones: `http://localhost:3000/ocpi/2.2/locations`
- EVSEs: `http://localhost:3000/ocpi/2.2/evses`
- Sesiones: `http://localhost:3000/ocpi/2.2/sessions`
- CDRs: `http://localhost:3000/ocpi/2.2/cdrs`
- Tarifas: `http://localhost:3000/ocpi/2.2/tariffs`
- Tokens: `http://localhost:3000/ocpi/2.2/tokens`

## Estructura de Datos

La aplicación crea automáticamente:
- 4 ubicaciones de ejemplo (Madrid, Barcelona, Porto, Lisboa)
- 10,000 EVSEs distribuidos en las ubicaciones
- 2 tarifas de ejemplo
- 2 tokens de ejemplo

## Configuración de Producción

### 1. Variables de entorno críticas
```bash
NODE_ENV=production
JWT_SECRET=your_very_secure_jwt_secret
DB_PASSWORD=your_secure_db_password
```

### 2. Configuración de base de datos
- Usar conexiones SSL en producción
- Configurar pool de conexiones
- Implementar backup automático

### 3. Seguridad
- Configurar firewall
- Usar HTTPS
- Implementar rate limiting apropiado
- Configurar CORS correctamente

## Monitoreo y Logs

### Logs de aplicación
```bash
tail -f logs/app.log
```

### Logs de Docker
```bash
docker-compose logs -f app
```

### Métricas de base de datos
```bash
# Conectar a PostgreSQL
psql -h localhost -U cpo_user -d cpo_ocpi

# Ver estadísticas
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del 
FROM pg_stat_user_tables;
```

## Troubleshooting

### Problemas comunes

1. **Error de conexión a base de datos**
   - Verificar que PostgreSQL esté ejecutándose
   - Verificar credenciales en .env
   - Verificar que la base de datos exista

2. **Error de conexión a Redis**
   - Verificar que Redis esté ejecutándose
   - Verificar configuración en .env

3. **Error de puerto en uso**
   - Cambiar puerto en .env
   - Verificar que no haya otros servicios usando el puerto

4. **Error de permisos en logs**
   - Crear directorio logs manualmente
   - Verificar permisos de escritura

### Comandos de diagnóstico
```bash
# Verificar estado de servicios
npm run health

# Verificar conexiones de base de datos
npm run db:status

# Limpiar y reinstalar
npm run clean
npm install
npm run setup
```

## Soporte

Para soporte técnico o reportar problemas:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar logs de aplicación y base de datos
