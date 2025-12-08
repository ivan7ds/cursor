# Plan de Acción: Renombrado de Tablas `emsp_*` a `external_operator_*`

## 📋 Resumen Ejecutivo

Las tablas con prefijo `emsp_` almacenan datos de operadores externos que pueden ser CPO, EMSP o ambos, lo cual genera confusión. Este plan detalla el proceso completo para renombrar estas tablas y todas sus referencias en el proyecto.

**Nuevo prefijo propuesto:** `external_operator_` (más descriptivo y preciso)

---

## 🔍 Inventario de Tablas y Componentes Afectados

### Tablas a Renombrar

1. **`emsp_locations`** → `external_operator_locations`
2. **`emsp_evses`** → `external_operator_evses`
3. **`emsp_tariffs`** → `external_operator_tariffs`
4. **`emsp_sessions`** → `external_operator_sessions`
5. **`emsp_cdrs`** → `external_operator_cdrs`
6. **`emsp_tokens`** → `external_operator_tokens`
7. **`emsp_contracts`** → `external_operator_contracts`

### Campos a Renombrar

En todas las tablas anteriores, los siguientes campos deben renombrarse:
- **`emsp_party_id`** → `external_operator_party_id`
- **`emsp_country_code`** → `external_operator_country_code`

### Índices a Renombrar

Todos los índices con prefijo `idx_emsp_` deben renombrarse a `idx_external_operator_`:
- `idx_emsp_locations_emsp_party` → `idx_external_operator_locations_party`
- `idx_emsp_locations_last_updated` → `idx_external_operator_locations_last_updated`
- `idx_emsp_evses_emsp_party` → `idx_external_operator_evses_party`
- `idx_emsp_evses_evse_id` → `idx_external_operator_evses_evse_id`
- `idx_emsp_evses_last_updated` → `idx_external_operator_evses_last_updated`
- `idx_emsp_evses_location_id` → `idx_external_operator_evses_location_id`
- `idx_emsp_evses_status` → `idx_external_operator_evses_status`
- `idx_emsp_tariffs_emsp_party` → `idx_external_operator_tariffs_party`
- `idx_emsp_tariffs_last_updated` → `idx_external_operator_tariffs_last_updated`
- `idx_emsp_tariffs_deleted_at` → `idx_external_operator_tariffs_deleted_at`
- `idx_emsp_sessions_emsp_party` → `idx_external_operator_sessions_party`
- `idx_emsp_sessions_last_updated` → `idx_external_operator_sessions_last_updated`
- `idx_emsp_cdrs_emsp_party` → `idx_external_operator_cdrs_party`
- `idx_emsp_cdrs_last_updated` → `idx_external_operator_cdrs_last_updated`
- `idx_emsp_tokens_emsp_party` → `idx_external_operator_tokens_party`
- `idx_emsp_tokens_last_updated` → `idx_external_operator_tokens_last_updated`
- `idx_emsp_tokens_deleted_at` → `idx_external_operator_tokens_deleted_at`
- `idx_emsp_contracts_emsp_party` → `idx_external_operator_contracts_party`
- `idx_emsp_contracts_last_updated` → `idx_external_operator_contracts_last_updated`

### Modelos Sequelize a Actualizar

1. **`EmspToken`** (`src/models/EmspToken.js`)
   - `tableName: 'emsp_tokens'` → `tableName: 'external_operator_tokens'`
   - Campos: `emsp_party_id` → `external_operator_party_id`, `emsp_country_code` → `external_operator_country_code`

2. **`EmspSession`** (`src/models/EmspSession.js`)
   - `tableName: 'emsp_sessions'` → `tableName: 'external_operator_sessions'`
   - Campos en `definitionHelpers.js`: `emsp_party_id` → `external_operator_party_id`, `emsp_country_code` → `external_operator_country_code`

3. **`EmspEVSE`** (`src/models/EmspEVSE.js`)
   - `tableName: 'emsp_evses'` → `tableName: 'external_operator_evses'`
   - Campos: `emsp_party_id` → `external_operator_party_id`, `emsp_country_code` → `external_operator_country_code`

### Archivos con Referencias SQL Directas (39 archivos encontrados)

#### Archivos con INSERT/UPDATE/SELECT/DELETE:
- `src/api/emspActions/getData/locationHelpers.js`
- `src/api/emspActions/getData/tariffHelpers.js`
- `src/api/emspActions/getData/cdrHelpers.js`
- `src/api/emspActions/getData/tokenHelpers.js`
- `src/api/emspLocations/locationPatchHelpers.js`
- `src/services/emspTariffsSyncService/tariffHelpers.js`
- `src/services/emspLocationsSyncService/locationHelpers.js`
- `src/services/emspTokensSyncService/tokenHelpers.js`
- `src/api/emspTariffs/tariffHelpers.js`
- `src/api/emspLocations/locationHelpers/locationQueries.js`
- `src/api/emspActions/saveData/evseHelpers.js`
- `src/api/emspActions/saveData/tokenHelpers.js`
- `src/api/emspActions/saveData/tariffHelpers.js`
- `src/api/emspActions/saveData/locationHelpers.js`
- `src/services/testSessionService/dataRetrieval.js`
- `src/api/emspTariffs/tariffPatchHelpers.js`
- `src/api/emsp/tokensRoutes.js`
- `src/api/emsp/tariffsRoutes.js`
- `src/api/emsp/cdrsRoutes.js`
- `src/api/emsp/sessionsRoutes.js`
- `src/api/emsp/locationsRoutes.js`

#### Archivos con Referencias en Comentarios/Documentación:
- `README.md`
- `CHANGELOG.md`
- `scripts/complete_database_setup.sql`

### Scripts SQL a Actualizar

1. **`scripts/init_database.sql`**
   - Definiciones de tablas (CREATE TABLE)
   - Índices (CREATE INDEX)
   - Comentarios

2. **`scripts/complete_database_setup.sql`**
   - Referencias en TRUNCATE
   - Comentarios

3. **`scripts/migrate_emsp_tariffs_add_name.sql`**
   - Nombre de tabla en ALTER TABLE

---

## 📝 Plan de Ejecución Detallado

### Fase 1: Preparación y Backup ✅ COMPLETADA

#### 1.1 Crear Script de Migración SQL ✅
- [x] Crear script de migración SQL completo que:
  - Renombre todas las tablas
  - Renombre todos los campos (`emsp_party_id` → `external_operator_party_id`, `emsp_country_code` → `external_operator_country_code`)
  - Renombre todos los índices
  - Incluya validaciones y rollback en caso de error
  - **Archivo creado**: `scripts/migrate_rename_emsp_to_external_operator.sql`

#### 1.2 Backup de Base de Datos ✅
- [x] Realizar backup completo de la base de datos antes de ejecutar migraciones
- [x] Documentar el proceso de restauración
  - **Archivo creado**: `scripts/BACKUP_DATABASE.md`

#### 1.3 Scripts Adicionales ✅
- [x] Crear script de rollback: `scripts/rollback_rename_external_operator_to_emsp.sql`
- [x] Crear script de validación: `scripts/validate_rename_migration.sql`

#### 1.4 Crear Branch de Git
- [ ] Crear branch específico: `refactor/rename-emsp-tables`
- [ ] Documentar el cambio en el branch

### Fase 2: Actualización de Base de Datos ✅ COMPLETADA

#### 2.1 Script de Migración SQL ✅
- [x] Ejecutar script de migración en entorno de desarrollo ✅ COMPLETADO
- [x] Verificar que todas las tablas se renombraron correctamente ✅ 7 tablas renombradas
- [x] Verificar que todos los campos se renombraron correctamente ✅ 14 campos renombrados
- [x] Verificar que todos los índices se renombraron correctamente ✅ 19 índices renombrados
- [x] Validar integridad de datos ✅ Script de validación ejecutado exitosamente

#### 2.2 Actualizar Scripts de Inicialización ✅
- [x] Actualizar `scripts/init_database.sql` con nuevos nombres
- [x] Actualizar `scripts/complete_database_setup.sql`
- [x] Actualizar `scripts/migrate_emsp_tariffs_add_name.sql` (actualizado con nuevo nombre)

### Fase 3: Actualización de Modelos Sequelize ✅ COMPLETADA

#### 3.1 Modelo EmspToken ✅
- [x] Actualizar `tableName` en `src/models/EmspToken.js` → `external_operator_tokens`
- [x] Renombrar campos en la definición del modelo → `external_operator_party_id`, `external_operator_country_code`
- [x] Actualizar comentarios
- [x] Actualizar índices

#### 3.2 Modelo EmspSession ✅
- [x] Actualizar `tableName` en `src/models/EmspSession.js` → `external_operator_sessions`
- [x] Actualizar campos en `src/models/EmspSession/definitionHelpers.js` → `external_operator_party_id`, `external_operator_country_code`
- [x] Actualizar comentarios
- [x] Actualizar índices

#### 3.3 Modelo EmspEVSE ✅
- [x] Actualizar `tableName` en `src/models/EmspEVSE.js` → `external_operator_evses`
- [x] Renombrar campos en la definición del modelo → `external_operator_party_id`, `external_operator_country_code`
- [x] Actualizar índices en la definición
- [x] Actualizar comentarios

#### 3.4 Exportaciones de Modelos ✅
- [x] Verificar que `src/models/index.js` exporta correctamente los modelos (nombres de modelos no cambian, solo tableName) - No requiere cambios

### Fase 4: Actualización de Código de Aplicación

#### 4.1 Queries SQL Directas - API Routes
- [ ] `src/api/emsp/tokensRoutes.js` - Actualizar queries SQL
- [ ] `src/api/emsp/tariffsRoutes.js` - Actualizar queries SQL
- [ ] `src/api/emsp/cdrsRoutes.js` - Actualizar queries SQL
- [ ] `src/api/emsp/sessionsRoutes.js` - Actualizar queries SQL
- [ ] `src/api/emsp/locationsRoutes.js` - Actualizar queries SQL

#### 4.2 Queries SQL Directas - Helpers
- [ ] `src/api/emspActions/getData/locationHelpers.js`
- [ ] `src/api/emspActions/getData/tariffHelpers.js`
- [ ] `src/api/emspActions/getData/cdrHelpers.js`
- [ ] `src/api/emspActions/getData/tokenHelpers.js`
- [ ] `src/api/emspLocations/locationPatchHelpers.js`
- [ ] `src/api/emspTariffs/tariffHelpers.js`
- [ ] `src/api/emspTariffs/tariffPatchHelpers.js`
- [ ] `src/api/emspLocations/locationHelpers/locationQueries.js`
- [ ] `src/api/emspLocations/locationHelpers/evseHelpers.js`
- [ ] `src/api/emspActions/saveData/evseHelpers.js`
- [ ] `src/api/emspActions/saveData/locationHelpers.js`
- [ ] `src/api/emspActions/saveData/tokenHelpers.js`
- [ ] `src/api/emspActions/saveData/tariffHelpers.js`

#### 4.3 Queries SQL Directas - Servicios
- [ ] `src/services/emspTariffsSyncService/tariffHelpers.js`
- [ ] `src/services/emspLocationsSyncService/locationHelpers.js`
- [ ] `src/services/emspTokensSyncService/tokenHelpers.js`
- [ ] `src/services/testSessionService/dataRetrieval.js`

#### 4.4 Referencias a Campos
- [ ] Buscar y reemplazar `emsp_party_id` por `external_operator_party_id` en todo el código
- [ ] Buscar y reemplazar `emsp_country_code` por `external_operator_country_code` en todo el código
- [ ] Verificar que los alias en SELECT (como `emsp_party_id as party_id`) se actualicen correctamente

### Fase 5: Actualización de Frontend y Documentación ✅ COMPLETADA

#### 5.1 Frontend JavaScript ✅
- [x] `src/public/js/modules/extSessions.js` - Actualizado referencias `emsp_party_id` → `external_operator_party_id`, `emsp_country_code` → `external_operator_country_code`
- [x] `src/public/js/modules/emsp.js` - Actualizado referencias
- [x] `src/public/js/modules/cpo.js` - Actualizado referencias
- [x] `src/public/app.js` - Actualizado referencias
- [x] `src/public/js/modules/locationDelete.js` - Actualizado referencias

#### 5.2 Documentación ✅
- [x] Actualizar `README.md` con nuevos nombres de tablas
- [x] Actualizar `CHANGELOG.md` con el cambio realizado (entrada en versión 2.2.0)
- [x] Actualizar comentarios en código que mencionen `emsp_*` (mayoría actualizados)

### Fase 6: Testing y Validación

#### 6.1 Pruebas Unitarias
- [ ] Ejecutar todas las pruebas existentes
- [ ] Verificar que los modelos Sequelize funcionan correctamente
- [ ] Verificar que las queries SQL funcionan correctamente

#### 6.2 Pruebas de Integración
- [ ] Probar endpoints de API que usan estas tablas
- [ ] Probar sincronización de datos con operadores externos
- [ ] Probar creación/actualización/eliminación de registros

#### 6.3 Validación de Datos
- [ ] Verificar que los datos existentes se mantienen intactos
- [ ] Verificar que las relaciones entre tablas funcionan correctamente
- [ ] Verificar que los índices funcionan correctamente

### Fase 7: Despliegue

#### 7.1 Revisión de Código
- [ ] Code review completo
- [ ] Verificar que no quedan referencias a nombres antiguos
- [ ] Verificar que la documentación está actualizada

#### 7.2 Despliegue en Desarrollo
- [ ] Desplegar en entorno de desarrollo
- [ ] Ejecutar script de migración
- [ ] Verificar funcionamiento

#### 7.3 Despliegue en Producción
- [ ] Backup completo de producción
- [ ] Ejecutar script de migración en producción
- [ ] Verificar funcionamiento
- [ ] Monitorear logs y errores

---

## 🔧 Script de Migración SQL Propuesto

```sql
-- Script de migración: Renombrar tablas emsp_* a external_operator_*
-- IMPORTANTE: Ejecutar en transacción para permitir rollback

BEGIN;

-- Renombrar tablas
ALTER TABLE emsp_locations RENAME TO external_operator_locations;
ALTER TABLE emsp_evses RENAME TO external_operator_evses;
ALTER TABLE emsp_tariffs RENAME TO external_operator_tariffs;
ALTER TABLE emsp_sessions RENAME TO external_operator_sessions;
ALTER TABLE emsp_cdrs RENAME TO external_operator_cdrs;
ALTER TABLE emsp_tokens RENAME TO external_operator_tokens;
ALTER TABLE emsp_contracts RENAME TO external_operator_contracts;

-- Renombrar campos emsp_party_id a external_operator_party_id
ALTER TABLE external_operator_locations RENAME COLUMN emsp_party_id TO external_operator_party_id;
ALTER TABLE external_operator_evses RENAME COLUMN emsp_party_id TO external_operator_party_id;
ALTER TABLE external_operator_tariffs RENAME COLUMN emsp_party_id TO external_operator_party_id;
ALTER TABLE external_operator_sessions RENAME COLUMN emsp_party_id TO external_operator_party_id;
ALTER TABLE external_operator_cdrs RENAME COLUMN emsp_party_id TO external_operator_party_id;
ALTER TABLE external_operator_tokens RENAME COLUMN emsp_party_id TO external_operator_party_id;
ALTER TABLE external_operator_contracts RENAME COLUMN emsp_party_id TO external_operator_party_id;

-- Renombrar campos emsp_country_code a external_operator_country_code
ALTER TABLE external_operator_locations RENAME COLUMN emsp_country_code TO external_operator_country_code;
ALTER TABLE external_operator_evses RENAME COLUMN emsp_country_code TO external_operator_country_code;
ALTER TABLE external_operator_tariffs RENAME COLUMN emsp_country_code TO external_operator_country_code;
ALTER TABLE external_operator_sessions RENAME COLUMN emsp_country_code TO external_operator_country_code;
ALTER TABLE external_operator_cdrs RENAME COLUMN emsp_country_code TO external_operator_country_code;
ALTER TABLE external_operator_tokens RENAME COLUMN emsp_country_code TO external_operator_country_code;
ALTER TABLE external_operator_contracts RENAME COLUMN emsp_country_code TO external_operator_country_code;

-- Renombrar índices
-- Locations
ALTER INDEX idx_emsp_locations_emsp_party RENAME TO idx_external_operator_locations_party;
ALTER INDEX idx_emsp_locations_last_updated RENAME TO idx_external_operator_locations_last_updated;

-- EVSEs
ALTER INDEX idx_emsp_evses_emsp_party RENAME TO idx_external_operator_evses_party;
ALTER INDEX idx_emsp_evses_evse_id RENAME TO idx_external_operator_evses_evse_id;
ALTER INDEX idx_emsp_evses_last_updated RENAME TO idx_external_operator_evses_last_updated;
ALTER INDEX idx_emsp_evses_location_id RENAME TO idx_external_operator_evses_location_id;
ALTER INDEX idx_emsp_evses_status RENAME TO idx_external_operator_evses_status;

-- Tariffs
ALTER INDEX idx_emsp_tariffs_emsp_party RENAME TO idx_external_operator_tariffs_party;
ALTER INDEX idx_emsp_tariffs_last_updated RENAME TO idx_external_operator_tariffs_last_updated;
ALTER INDEX idx_emsp_tariffs_deleted_at RENAME TO idx_external_operator_tariffs_deleted_at;

-- Sessions
ALTER INDEX idx_emsp_sessions_emsp_party RENAME TO idx_external_operator_sessions_party;
ALTER INDEX idx_emsp_sessions_last_updated RENAME TO idx_external_operator_sessions_last_updated;

-- CDRs
ALTER INDEX idx_emsp_cdrs_emsp_party RENAME TO idx_external_operator_cdrs_party;
ALTER INDEX idx_emsp_cdrs_last_updated RENAME TO idx_external_operator_cdrs_last_updated;

-- Tokens
ALTER INDEX idx_emsp_tokens_emsp_party RENAME TO idx_external_operator_tokens_party;
ALTER INDEX idx_emsp_tokens_last_updated RENAME TO idx_external_operator_tokens_last_updated;
ALTER INDEX idx_emsp_tokens_deleted_at RENAME TO idx_external_operator_tokens_deleted_at;

-- Contracts
ALTER INDEX idx_emsp_contracts_emsp_party RENAME TO idx_external_operator_contracts_party;
ALTER INDEX idx_emsp_contracts_last_updated RENAME TO idx_external_operator_contracts_last_updated;

COMMIT;
```

---

## ⚠️ Consideraciones Importantes

### Riesgos
1. **Downtime**: El renombrado de tablas requiere bloqueo de escritura
2. **Referencias perdidas**: Si alguna referencia no se actualiza, causará errores
3. **Caché**: Si hay caché de esquemas, debe invalidarse
4. **Backups**: Los backups antiguos tendrán nombres de tablas antiguos

### Mitigaciones
1. Ejecutar en horario de bajo tráfico
2. Usar transacciones para permitir rollback
3. Búsqueda exhaustiva de todas las referencias
4. Testing completo antes de producción
5. Mantener script de rollback preparado

### Rollback
Si es necesario revertir los cambios:
```sql
BEGIN;
-- Revertir renombrado de tablas (en orden inverso)
ALTER TABLE external_operator_contracts RENAME TO emsp_contracts;
ALTER TABLE external_operator_tokens RENAME TO emsp_tokens;
ALTER TABLE external_operator_cdrs RENAME TO emsp_cdrs;
ALTER TABLE external_operator_sessions RENAME TO emsp_sessions;
ALTER TABLE external_operator_tariffs RENAME TO emsp_tariffs;
ALTER TABLE external_operator_evses RENAME TO emsp_evses;
ALTER TABLE external_operator_locations RENAME TO emsp_locations;
-- ... revertir campos e índices ...
COMMIT;
```

---

## 📊 Estadísticas del Cambio

- **Tablas afectadas**: 7
- **Campos afectados**: 14 (2 campos × 7 tablas)
- **Índices afectados**: 18
- **Modelos Sequelize afectados**: 3
- **Archivos con queries SQL**: ~40
- **Archivos frontend afectados**: ~5
- **Scripts SQL afectados**: 3

---

## ✅ Checklist Final

Antes de considerar el cambio completo:

- [ ] Script de migración SQL creado y probado
- [ ] Backup de base de datos realizado
- [ ] Todos los modelos Sequelize actualizados
- [ ] Todas las queries SQL actualizadas
- [ ] Todas las referencias a campos actualizadas
- [ ] Frontend actualizado
- [ ] Documentación actualizada
- [ ] Tests pasando
- [ ] Code review completado
- [ ] Desplegado en desarrollo y verificado
- [ ] Plan de rollback preparado

---

## 📅 Estimación de Tiempo

- **Fase 1 (Preparación)**: 2-3 horas
- **Fase 2 (Base de datos)**: 1-2 horas
- **Fase 3 (Modelos)**: 1 hora
- **Fase 4 (Código aplicación)**: 4-6 horas
- **Fase 5 (Frontend/Docs)**: 1-2 horas
- **Fase 6 (Testing)**: 2-3 horas
- **Fase 7 (Despliegue)**: 1-2 horas

**Total estimado**: 12-19 horas

---

## 🔄 Siguiente Paso

Una vez aprobado este plan, proceder con la **Fase 1: Preparación y Backup**.

