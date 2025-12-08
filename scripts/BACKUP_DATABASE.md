# Guía de Backup de Base de Datos

## 📋 Resumen

Antes de ejecutar la migración de renombrado de tablas `emsp_*` a `external_operator_*`, es **CRÍTICO** realizar un backup completo de la base de datos.

---

## 🔧 Métodos de Backup

### Método 1: Backup usando pg_dump (Recomendado)

#### Backup completo de la base de datos

```bash
# Si usas Docker
docker exec cursor-postgres-1 pg_dump -U cpo_user -d cpo_ocpi > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# O si tienes acceso directo a PostgreSQL
pg_dump -U cpo_user -d cpo_ocpi > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql
```

#### Backup solo de las tablas afectadas

```bash
# Backup solo de las tablas emsp_*
docker exec cursor-postgres-1 pg_dump -U cpo_user -d cpo_ocpi \
  -t emsp_locations \
  -t emsp_evses \
  -t emsp_tariffs \
  -t emsp_sessions \
  -t emsp_cdrs \
  -t emsp_tokens \
  -t emsp_contracts \
  > backup_emsp_tables_$(date +%Y%m%d_%H%M%S).sql
```

### Método 2: Backup usando Docker

```bash
# Backup completo
docker exec cursor-postgres-1 pg_dump -U cpo_user -d cpo_ocpi | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Copiar backup fuera del contenedor
docker cp cursor-postgres-1:/backup_*.sql.gz ./backups/
```

### Método 3: Backup usando docker-compose

Si tienes un volumen de datos de PostgreSQL:

```bash
# Identificar el volumen
docker volume ls | grep postgres

# Backup del volumen completo
docker run --rm \
  -v cursor_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

---

## ✅ Verificación del Backup

### Verificar que el backup se creó correctamente

```bash
# Verificar tamaño del archivo (debe ser > 0)
ls -lh backup_*.sql

# Verificar contenido del backup
head -n 50 backup_*.sql

# Verificar que contiene las tablas emsp_*
grep -i "CREATE TABLE.*emsp_" backup_*.sql
```

### Probar restauración del backup (en entorno de prueba)

```bash
# Crear base de datos de prueba
docker exec cursor-postgres-1 psql -U cpo_user -c "CREATE DATABASE test_restore;"

# Restaurar backup
docker exec -i cursor-postgres-1 psql -U cpo_user -d test_restore < backup_*.sql

# Verificar restauración
docker exec cursor-postgres-1 psql -U cpo_user -d test_restore -c "\dt emsp_*"
```

---

## 📁 Ubicación Recomendada para Backups

```
/home/ivan/Repositorios/cursor/backups/
├── pre_migration/
│   ├── backup_pre_migration_20241201_120000.sql
│   └── backup_pre_migration_20241201_120000.sql.gz
└── post_migration/
    └── backup_post_migration_20241201_130000.sql
```

---

## 🔄 Proceso de Restauración

### Si necesitas restaurar el backup

```bash
# 1. Detener la aplicación (opcional pero recomendado)
docker-compose stop app

# 2. Restaurar backup completo
docker exec -i cursor-postgres-1 psql -U cpo_user -d cpo_ocpi < backup_pre_migration_*.sql

# 3. Verificar restauración
docker exec cursor-postgres-1 psql -U cpo_user -d cpo_ocpi -c "\dt emsp_*"

# 4. Reiniciar aplicación
docker-compose start app
```

---

## ⚠️ Consideraciones Importantes

1. **Espacio en disco**: Asegúrate de tener suficiente espacio antes de crear el backup
2. **Tiempo de backup**: El backup puede tardar varios minutos dependiendo del tamaño de la base de datos
3. **Backup antes de cada cambio**: Crea un nuevo backup antes de cada intento de migración
4. **Múltiples copias**: Guarda el backup en al menos dos ubicaciones diferentes
5. **Verificación**: Siempre verifica que el backup se creó correctamente antes de proceder

---

## 📝 Checklist Pre-Migración

- [ ] Backup completo de la base de datos creado
- [ ] Backup verificado (tamaño > 0, contiene tablas esperadas)
- [ ] Backup guardado en ubicación segura
- [ ] Backup probado en entorno de desarrollo (restauración)
- [ ] Espacio en disco suficiente verificado
- [ ] Documentación del backup guardada

---

## 🚨 En Caso de Problemas

Si la migración falla y necesitas restaurar:

1. **NO ENTRAR EN PÁNICO**
2. Detener la aplicación: `docker-compose stop app`
3. Restaurar el backup más reciente
4. Verificar que la restauración fue exitosa
5. Revisar logs para entender qué salió mal
6. Corregir el problema y volver a intentar

---

## 📞 Contacto

Si tienes problemas con el backup o la restauración, revisa:
- Logs de PostgreSQL: `docker logs cursor-postgres-1`
- Logs de la aplicación: `docker logs cursor-app-1`
- Documentación de PostgreSQL: https://www.postgresql.org/docs/

