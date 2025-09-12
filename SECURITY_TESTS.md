# 🧪 PRUEBAS E2E DE SEGURIDAD - CORRECCIONES CRÍTICAS

## 📋 RESUMEN DE CORRECCIONES IMPLEMENTADAS

### ✅ **Problema Crítico #1: Credenciales Hardcodeadas**
- **Archivo**: `docker-compose.yml`
- **Cambio**: Credenciales de PgAdmin ahora usan variables de entorno
- **Variables requeridas**: `PGADMIN_EMAIL`, `PGADMIN_PASSWORD`

### ✅ **Problema Crítico #2: Token por Defecto Hardcodeado**
- **Archivos**: `src/middleware/auth.js`, `src/public/app.js`
- **Cambio**: Token hardcodeado eliminado, validación estricta implementada
- **Variable requerida**: `OCPI_TOKEN` (obligatoria)

### ✅ **Problema Crítico #3: Puerto de Base de Datos Expuesto**
- **Archivo**: `docker-compose.yml`
- **Cambio**: Puertos restringidos a localhost (127.0.0.1)
- **Afecta**: PostgreSQL y Redis

---

## 🔍 PRUEBAS E2E A EJECUTAR

### **PRUEBA 1: Validación de Variables de Entorno**

#### **1.1 Configurar Variables de Entorno**
```bash
# Crear archivo .env con las nuevas variables
echo "PGADMIN_EMAIL=admin@cpo.com" >> .env
echo "PGADMIN_PASSWORD=tu_password_seguro_aqui" >> .env
echo "OCPI_TOKEN=tu_token_ocpi_seguro_aqui" >> .env
```

#### **1.2 Verificar que la aplicación falle sin OCPI_TOKEN**
```bash
# Temporalmente renombrar .env
mv .env .env.backup

# Intentar iniciar la aplicación
docker-compose up app

# RESULTADO ESPERADO: La aplicación debe fallar con error sobre OCPI_TOKEN faltante
# Restaurar .env después de la prueba
mv .env.backup .env
```

### **PRUEBA 2: Validación de Credenciales PgAdmin**

#### **2.1 Iniciar Servicios con Nuevas Variables**
```bash
docker-compose down
docker-compose up -d
```

#### **2.2 Verificar Acceso a PgAdmin**
1. **Abrir navegador**: `http://localhost:5050`
2. **Credenciales de login**:
   - Email: `admin@cpo.com` (o el valor de PGADMIN_EMAIL)
   - Password: El valor configurado en PGADMIN_PASSWORD
3. **RESULTADO ESPERADO**: Login exitoso con las credenciales configuradas

#### **2.3 Verificar que Credenciales Hardcodeadas No Funcionen**
1. **Intentar login con credenciales antiguas**:
   - Email: `admin@cpo.com`
   - Password: `admin123`
2. **RESULTADO ESPERADO**: Login fallido

### **PRUEBA 3: Validación de Restricción de Puertos**

#### **3.1 Verificar Restricción de PostgreSQL**
```bash
# Verificar que PostgreSQL solo escucha en localhost
netstat -tlnp | grep 5432

# RESULTADO ESPERADO: Solo debe mostrar 127.0.0.1:5432, no 0.0.0.0:5432
```

#### **3.2 Verificar Restricción de Redis**
```bash
# Verificar que Redis solo escucha en localhost
netstat -tlnp | grep 6379

# RESULTADO ESPERADO: Solo debe mostrar 127.0.0.1:6379, no 0.0.0.0:6379
```

#### **3.3 Verificar Acceso Externo Bloqueado**
```bash
# Intentar conectar desde otra máquina (si es posible)
# O verificar que no hay bind a 0.0.0.0
ss -tlnp | grep -E "(5432|6379)"

# RESULTADO ESPERADO: Solo debe mostrar 127.0.0.1, no 0.0.0.0
```

### **PRUEBA 4: Validación de Token Frontend**

#### **4.1 Verificar que Frontend Falla sin Token**
1. **Abrir navegador**: `http://localhost:3000`
2. **Abrir consola del navegador** (F12)
3. **Limpiar localStorage**: `localStorage.clear()`
4. **Recargar página**
5. **RESULTADO ESPERADO**: Error en consola sobre token OCPI no configurado

#### **4.2 Configurar Token y Verificar Funcionamiento**
1. **En consola del navegador**:
   ```javascript
   localStorage.setItem('ocpi_token', 'tu_token_ocpi_seguro_aqui');
   location.reload();
   ```
2. **RESULTADO ESPERADO**: Aplicación carga correctamente

### **PRUEBA 5: Validación de Funcionalidad Completa**

#### **5.1 Verificar APIs Funcionan con Token Correcto**
```bash
# Test con token correcto
curl -H "Authorization: Token tu_token_ocpi_seguro_aqui" \
     http://localhost:3000/ocpi/cpo/2.2/sessions

# RESULTADO ESPERADO: Respuesta 200 con datos de sesiones
```

#### **5.2 Verificar APIs Fallan con Token Incorrecto**
```bash
# Test con token incorrecto
curl -H "Authorization: Token token_incorrecto" \
     http://localhost:3000/ocpi/cpo/2.2/sessions

# RESULTADO ESPERADO: Respuesta 401 con error de autenticación
```

#### **5.3 Verificar APIs Fallan sin Token**
```bash
# Test sin token
curl http://localhost:3000/ocpi/cpo/2.2/sessions

# RESULTADO ESPERADO: Respuesta 401 con error de autenticación
```

---

## 🚨 CRITERIOS DE ÉXITO

### **✅ Prueba Exitosa si:**
1. **Aplicación falla al iniciar** sin OCPI_TOKEN configurado
2. **PgAdmin usa credenciales** de variables de entorno
3. **Puertos de BD y Redis** solo escuchan en localhost
4. **Frontend muestra error** cuando no hay token configurado
5. **APIs requieren token válido** para funcionar
6. **APIs rechazan tokens inválidos** con error 401

### **❌ Prueba Fallida si:**
1. Aplicación inicia sin OCPI_TOKEN
2. PgAdmin usa credenciales hardcodeadas
3. Puertos están expuestos a 0.0.0.0
4. Frontend funciona sin token configurado
5. APIs funcionan sin autenticación
6. APIs aceptan tokens inválidos

---

## 📝 REPORTE DE RESULTADOS

**Fecha de Prueba**: ___________
**Ejecutado por**: ___________

### **Resultados por Prueba:**
- [ ] Prueba 1.1: Variables de entorno configuradas
- [ ] Prueba 1.2: Aplicación falla sin OCPI_TOKEN
- [ ] Prueba 2.1: Servicios inician correctamente
- [ ] Prueba 2.2: PgAdmin login con nuevas credenciales
- [ ] Prueba 2.3: PgAdmin rechaza credenciales antiguas
- [ ] Prueba 3.1: PostgreSQL restringido a localhost
- [ ] Prueba 3.2: Redis restringido a localhost
- [ ] Prueba 3.3: No hay bind a 0.0.0.0
- [ ] Prueba 4.1: Frontend falla sin token
- [ ] Prueba 4.2: Frontend funciona con token
- [ ] Prueba 5.1: APIs funcionan con token correcto
- [ ] Prueba 5.2: APIs fallan con token incorrecto
- [ ] Prueba 5.3: APIs fallan sin token

### **Problemas Encontrados:**
```
[Describir cualquier problema encontrado durante las pruebas]
```

### **Recomendaciones:**
```
[Agregar recomendaciones basadas en los resultados]
```

---

## 🔧 COMANDOS DE UTILIDAD

### **Verificar Estado de Servicios:**
```bash
docker-compose ps
```

### **Ver Logs de Aplicación:**
```bash
docker-compose logs app
```

### **Verificar Puertos Abiertos:**
```bash
netstat -tlnp | grep -E "(3000|5432|6379|5050)"
```

### **Limpiar y Reiniciar:**
```bash
docker-compose down
docker-compose up -d
```

### **Verificar Variables de Entorno:**
```bash
docker-compose config
```
