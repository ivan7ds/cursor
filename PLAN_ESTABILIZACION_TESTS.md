# Plan de Acción: Estabilización y Testing

**Objetivo:** Hacer el proyecto más estable mediante la eliminación de código muerto, limpieza de ESLint y creación de tests progresivos.

**Fecha de inicio:** 2025-01-06

---

## Fase 1: Eliminación de Código Muerto (PRIORIDAD ALTA)

### 1.1 Ejecutar Knip para Detectar Código Muerto

**Objetivo:** Identificar y eliminar código no utilizado que puede causar confusión y problemas de mantenimiento.

**Acciones:**
1. ✅ Ejecutar `npm run knip` para obtener reporte completo
2. ✅ Analizar resultados y categorizar:
   - Archivos no utilizados
   - Exports no utilizados
   - Imports no utilizados
   - Dependencias no utilizadas
3. ✅ Revisar cada caso manualmente (algunos pueden ser falsos positivos)
4. ✅ Eliminar código muerto confirmado
5. ✅ Verificar que la aplicación sigue funcionando después de cada eliminación

**Comandos:**
```bash
# Ejecutar análisis completo
npm run knip

# Ejecutar solo para producción (excluye devDependencies)
npm run knip:production

# Auto-fix cuando sea posible (cuidado, revisar cambios)
npm run knip:fix
```

**Criterios de eliminación:**
- ✅ Archivos completamente no utilizados → Eliminar
- ✅ Exports no utilizados → Eliminar
- ✅ Imports no utilizados → Eliminar
- ⚠️ Dependencias no utilizadas → Revisar manualmente (pueden ser usadas dinámicamente)
- ⚠️ Funciones/helpers no utilizados → Verificar si son necesarios para futuras features

**Tiempo estimado:** 2-4 horas

**Progreso actual:**
- ✅ **Archivos eliminados (6):**
  1. `src/api/emspLocations/patchHelpers.js` - No utilizado (existe otro patchHelpers.js en subdirectorio)
  2. `src/api/tokens/tokenHelpers.js` - No utilizado
  3. `src/middleware/tempTokenAuth.js` - No utilizado
  4. `src/middleware/tempTokenAuth/authFlowHelpers.js` - No utilizado
  5. `src/middleware/tempTokenAuth/authHelpers.js` - No utilizado
  6. `src/services/emspLocationsSyncService/syncHelpers.js` - No utilizado
- ✅ **Dependencia agregada:** `winston` (usado pero no estaba en package.json)
- ✅ **Dependencias revisadas:** `prettier` (se usa en ESLint) y `supertest` (se usará para tests) - mantener ambas
- ⏳ **Pendiente:** 133 exports no utilizados (revisar en siguiente iteración)

---

## Fase 2: Revisión y Limpieza de ESLint

### 2.1 Ejecutar ESLint y Generar Reporte

**Objetivo:** Identificar problemas de código que pueden afectar la estabilidad y testabilidad.

**Acciones:**
1. ✅ Ejecutar `npm run lint` para obtener estado actual
2. ✅ Generar reporte detallado (si no existe)
3. ✅ Categorizar problemas por prioridad:
   - **Críticos:** Errores que pueden causar bugs
   - **Importantes:** Warnings que afectan calidad
   - **Menores:** Estilo y convenciones
4. ✅ Corregir automáticamente lo posible: `npm run lint:fix`
5. ✅ Revisar y corregir manualmente problemas restantes

**Comandos:**
```bash
# Ejecutar linting
npm run lint

# Auto-fix problemas simples
npm run lint:fix

# Ejecutar en archivo específico
npx eslint src/api/locations.js

# Generar reporte JSON
npm run lint > eslint-report.json
```

**Prioridades de corrección:**
1. **Errores críticos:**
   - Variables no definidas (`no-undef`)
   - Variables no utilizadas (`no-unused-vars`)
   - Promesas no manejadas (`promise/catch-or-return`)
   
2. **Errores importantes:**
   - `await` en loops (`no-await-in-loop`)
   - Redundancia en `await` (`no-return-await`)
   - Complejidad alta (`complexity`)
   
3. **Warnings:**
   - Uso de `console` (`no-console`)
   - Orden de imports (`import/order`)

**Tiempo estimado:** 3-5 horas

---

## Fase 3: Configuración de Testing

### 3.1 Configurar Jest

**Objetivo:** Establecer base sólida para escribir tests.

**Acciones:**
1. ✅ Crear `jest.config.js` con configuración adecuada
2. ✅ Configurar coverage thresholds
3. ✅ Configurar setupFiles para tests
4. ✅ Agregar scripts adicionales en `package.json`:
   - `test:unit` - Solo tests unitarios
   - `test:integration` - Solo tests de integración
   - `test:coverage` - Con reporte de cobertura
   - `test:watch` - Ya existe, mantener

**Estructura de configuración propuesta:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/public/**',
    '!src/server.js'
  ],
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}
```

**Tiempo estimado:** 1-2 horas

---

### 3.2 Crear Estructura de Tests

**Objetivo:** Organizar tests de manera clara y mantenible.

**Acciones:**
1. ✅ Crear estructura de directorios:
   ```
   tests/
   ├── unit/
   │   ├── services/
   │   ├── utils/
   │   └── validators/
   ├── integration/
   │   ├── api/
   │   └── database/
   ├── helpers/
   │   ├── requestHelper.js
   │   ├── dbHelper.js
   │   └── authHelper.js
   ├── fixtures/
   │   ├── locations.js
   │   ├── tokens.js
   │   └── tariffs.js
   └── setup.js
   ```

2. ✅ Crear `tests/setup.js` para configuración global
3. ✅ Crear helpers básicos:
   - `requestHelper.js` - Para hacer requests de prueba
   - `dbHelper.js` - Para setup/teardown de base de datos
   - `authHelper.js` - Para generar tokens de prueba
4. ✅ Crear fixtures básicos con datos de prueba

**Tiempo estimado:** 2-3 horas

---

## Fase 4: Escribir Tests Progresivos

### 4.1 Estrategia de Testing

**Principio:** Escribir tests a medida que verificamos que el código funciona.

**Enfoque:**
1. **Tests unitarios primero:** Funciones puras y servicios aislados
2. **Tests de integración después:** APIs y flujos completos
3. **Cobertura progresiva:** Aumentar cobertura gradualmente

**Orden sugerido:**
1. ✅ **Utils y helpers** (más fáciles de testear)
2. ✅ **Validators** (lógica de validación)
3. ✅ **Services** (lógica de negocio)
4. ✅ **API endpoints** (integración)

---

### 4.2 Tests Unitarios - Primera Ola

**Objetivo:** Testear funciones puras y lógica aislada.

**Archivos prioritarios:**
1. `src/utils/*.js` - Funciones de utilidad
2. `src/validators/*.js` - Validaciones
3. `src/services/*.js` - Servicios con lógica pura

**Ejemplo de estructura:**
```javascript
// tests/unit/utils/logger.test.js
describe('Logger Utils', () => {
  it('should create logger instance', () => {
    // test
  });
});
```

**Tiempo estimado:** 4-6 horas (depende de cantidad de archivos)

---

### 4.3 Tests de Integración - Primera Ola

**Objetivo:** Testear endpoints API y flujos completos.

**Endpoints prioritarios:**
1. Health check endpoints
2. Endpoints de autenticación
3. Endpoints CRUD básicos (locations, tokens, tariffs)

**Ejemplo de estructura:**
```javascript
// tests/integration/api/locations.test.js
describe('Locations API', () => {
  beforeAll(async () => {
    // Setup test database
  });
  
  afterAll(async () => {
    // Cleanup
  });
  
  describe('GET /ocpi/cpo/2.2/locations', () => {
    it('should return list of locations', async () => {
      // test
    });
  });
});
```

**Tiempo estimado:** 6-8 horas

---

### 4.4 Verificación de Funcionalidad

**Objetivo:** Asegurar que el código funciona antes de escribir tests.

**Proceso:**
1. ✅ Ejecutar aplicación en modo desarrollo
2. ✅ Probar manualmente endpoints críticos
3. ✅ Verificar logs de errores
4. ✅ Corregir bugs encontrados
5. ✅ Escribir tests para funcionalidad verificada

**Checklist:**
- [ ] Servidor inicia correctamente
- [ ] Endpoints principales responden
- [ ] Autenticación funciona
- [ ] Base de datos conecta correctamente
- [ ] Redis conecta correctamente
- [ ] No hay errores críticos en logs

---

## Fase 5: Mejora Continua

### 5.1 Aumentar Cobertura de Tests

**Objetivo:** Alcanzar cobertura mínima del 50% (inicialmente).

**Acciones:**
1. ✅ Ejecutar `npm run test:coverage` regularmente
2. ✅ Identificar áreas sin cobertura
3. ✅ Priorizar tests para código crítico
4. ✅ Aumentar thresholds gradualmente

**Tiempo estimado:** Continuo

---

### 5.2 Integración en CI/CD

**Objetivo:** Automatizar ejecución de tests.

**Acciones:**
1. ✅ Configurar GitHub Actions (o CI/CD equivalente)
2. ✅ Ejecutar tests en cada PR
3. ✅ Ejecutar linting en cada PR
4. ✅ Bloquear merge si tests fallan

**Tiempo estimado:** 1-2 horas

---

## Checklist de Ejecución

### Fase 1: Código Muerto
- [x] Ejecutar `npm run knip`
- [x] Analizar resultados
- [x] Eliminar archivos no utilizados (6 archivos eliminados)
- [ ] Eliminar exports no utilizados (133 exports pendientes - siguiente paso)
- [x] Eliminar imports no utilizados (incluido en eliminación de archivos)
- [x] Revisar dependencias no utilizadas (prettier y supertest se mantienen)
- [x] Agregar winston a dependencias (faltaba en package.json)
- [x] Verificar que aplicación funciona

### Fase 2: ESLint
- [ ] Ejecutar `npm run lint`
- [ ] Generar reporte
- [ ] Ejecutar `npm run lint:fix`
- [ ] Corregir errores críticos manualmente
- [ ] Corregir errores importantes
- [ ] Revisar warnings
- [ ] Actualizar `RESUMEN_ESLINT.md`

### Fase 3: Configuración Testing
- [ ] Crear `jest.config.js`
- [ ] Crear estructura de directorios `tests/`
- [ ] Crear `tests/setup.js`
- [ ] Crear helpers básicos
- [ ] Crear fixtures básicos
- [ ] Verificar que `npm test` funciona

### Fase 4: Tests Progresivos
- [ ] Verificar funcionalidad manualmente
- [ ] Escribir tests para utils
- [ ] Escribir tests para validators
- [ ] Escribir tests para services
- [ ] Escribir tests para API endpoints
- [ ] Verificar cobertura

### Fase 5: Mejora Continua
- [ ] Aumentar cobertura gradualmente
- [ ] Configurar CI/CD
- [ ] Documentar proceso de testing

---

## Métricas de Éxito

### Objetivos Cuantitativos
- [ ] **Código muerto eliminado:** 100% de archivos/exports no utilizados
- [ ] **Errores ESLint:** < 50 errores (actualmente ~189)
- [ ] **Warnings ESLint:** < 50 warnings (actualmente ~83)
- [ ] **Cobertura de tests:** > 50% inicialmente
- [ ] **Tests unitarios:** > 20 tests
- [ ] **Tests de integración:** > 10 tests

### Objetivos Cualitativos
- [ ] Código más limpio y mantenible
- [ ] Confianza en refactorizaciones futuras
- [ ] Detección temprana de bugs
- [ ] Documentación implícita mediante tests

---

## Comandos Útiles

```bash
# Código muerto
npm run knip
npm run knip:production
npm run knip:fix

# Linting
npm run lint
npm run lint:fix

# Testing
npm test
npm run test:watch
npm run test:coverage
npm run test:unit
npm run test:integration

# Desarrollo
npm run dev
npm start
```

---

## Notas Importantes

1. **Orden de ejecución:** Seguir fases en orden (código muerto → ESLint → Tests)
2. **Commits frecuentes:** Hacer commit después de cada fase completada
3. **Verificación continua:** Verificar que aplicación funciona después de cada cambio
4. **Tests primero:** Escribir tests para código que sabemos que funciona
5. **Cobertura progresiva:** No intentar alcanzar 100% de cobertura de inmediato

---

## Próximos Pasos Inmediatos

1. ✅ **Ejecutar Knip** para detectar código muerto
2. ✅ **Analizar resultados** y crear lista de eliminaciones
3. ✅ **Eliminar código muerto** de forma incremental
4. ✅ **Verificar funcionalidad** después de cada eliminación

---

**Última actualización:** 2025-01-06

