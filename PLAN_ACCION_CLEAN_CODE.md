# Plan de Acción - Clean Code y Preparación para Testing

## Objetivo General

Mejorar la calidad del código del proyecto mediante la corrección de errores ESLint, aplicación de principios de clean code y preparación del código para testing unitario e integración.

**Tiempo estimado total:** 4-6 semanas (dependiendo del tamaño del equipo)

---

## Fase 1: Correcciones Críticas (Semana 1-2)

### 1.1 Variables No Definidas (no-undef) - PRIORIDAD ALTA

**Problema:** Variables utilizadas pero no definidas pueden causar errores en runtime.

**Archivos afectados:**
- `src/api/emspActions/getData.js` - `logger` no definido (~20 instancias)
- `src/api/emspTariffs.js` - `validateTariffPutMiddleware`, `validateTariffPatchMiddleware` no definidos
- `src/api/handshake.js` - `Credentials` no definido

**Acciones:**
1. ✅ Agregar import de `logger` en `src/api/emspActions/getData.js`
2. ✅ Agregar imports de middlewares en `src/api/emspTariffs.js`
3. ✅ Agregar import de modelo `Credentials` en `src/api/handshake.js`
4. ✅ Verificar que no haya más variables no definidas

**Tiempo estimado:** 2-3 horas

---

### 1.2 Variables No Utilizadas (no-unused-vars) - PRIORIDAD MEDIA

**Problema:** Código muerto que confunde y aumenta el tamaño del bundle.

**Acciones:**
1. ✅ Revisar cada variable no utilizada
2. ✅ Eliminar si realmente no se usa
3. ✅ Renombrar con prefijo `_` si es intencional (parámetros de función, etc.)
4. ✅ Verificar si son variables que deberían usarse pero no se están usando

**Archivos prioritarios:**
- `scripts/create_10000_evses.js`
- `scripts/generate-ocpi-token.js`
- `src/api/sessions.js`
- `src/api/tariffs.js`

**Tiempo estimado:** 3-4 horas

---

### 1.3 Agregar Campos OCPI a Excepciones de camelcase

**Problema:** Muchos campos válidos de OCPI están marcados como errores.

**Acciones:**
1. ✅ Identificar todos los campos OCPI que faltan en la lista de excepciones
2. ✅ Agregar a `.eslintrc.js` en la sección `allow` de `camelcase`:
   - `power_type`
   - `max_voltage`
   - `max_amperage`
   - `max_electric_power`
   - `parking_type`
   - `charging_when_closed`
   - `incoming_status`
   - `terms_and_conditions`
   - `status_schedule`
   - `period_begin`
   - `period_end`
   - `regular_hours`
   - `exceptional_openings`
   - `exceptional_closings`
   - `publish_allowed_to`
   - `start_date`
   - `end_date`
   - `min_kwh`
   - `max_kwh`

**Tiempo estimado:** 1 hora

---

## Fase 2: Refactorización de Funciones Largas (Semana 2-3)

### 2.1 Dividir Funciones >45 Líneas

**Estrategia:** Aplicar principio de responsabilidad única (SRP)

#### Archivos prioritarios:

**2.1.1 `src/api/credentials.js`**
- Función de 168 líneas → Dividir en:
  - Función de validación de credenciales
  - Función de creación de credenciales
  - Función de actualización de credenciales
  - Función de manejo de errores

**2.1.2 `src/api/handshake.js`**
- Función de 313 líneas → Dividir en:
  - Función de validación de URL
  - Función de registro de credenciales
  - Función de intercambio de tokens
  - Función de manejo de respuestas

**2.1.3 `src/api/emspLocations.js`**
- Función de 182 líneas → Dividir en:
  - Función de obtención de locations
  - Función de transformación de datos
  - Función de manejo de paginación

**2.1.4 `src/api/locations.js`**
- Función de 249 líneas → Dividir en:
  - Función de creación de location
  - Función de validación de EVSEs
  - Función de transformación de datos OCPI

**2.1.5 `src/api/tariffs.js`**
- Función de 165 líneas → Dividir en:
  - Función de validación de tarifa
  - Función de creación/actualización
  - Función de cálculo de precios

**Tiempo estimado:** 15-20 horas

---

### 2.2 Dividir Archivos >300 Líneas

**Estrategia:** Separar por responsabilidades en módulos más pequeños

#### Archivos a dividir:

**2.2.1 `src/api/credentials.js` (522 líneas)**
```
credentials.js (main)
├── credentialsController.js
├── credentialsService.js
├── credentialsValidator.js
└── credentialsUtils.js
```

**2.2.2 `src/api/emspActions/saveData.js` (552 líneas)**
```
saveData.js (main)
├── saveLocations.js
├── saveEvses.js
├── saveTokens.js
└── saveTariffs.js
```

**2.2.3 `src/api/emspLocations.js` (559 líneas)**
```
emspLocations.js (main)
├── locationsController.js
├── locationsService.js
└── locationsTransformer.js
```

**2.2.4 `src/api/handshake.js` (550 líneas)**
```
handshake.js (main)
├── handshakeController.js
├── handshakeService.js
├── handshakeValidator.js
└── handshakeUtils.js
```

**2.2.5 `src/api/locations.js` (505 líneas)**
```
locations.js (main)
├── locationsController.js
├── locationsService.js
├── locationsValidator.js
└── locationsTransformer.js
```

**2.2.6 `src/api/tariffs.js` (565 líneas)**
```
tariffs.js (main)
├── tariffsController.js
├── tariffsService.js
├── tariffsValidator.js
└── tariffsCalculator.js
```

**Tiempo estimado:** 20-25 horas

---

## Fase 3: Reducción de Complejidad Ciclomática (Semana 3-4)

### 3.1 Extraer Lógica Condicional

**Estrategia:** Usar early returns, guard clauses y extraer funciones

#### Archivos prioritarios:

**3.1.1 `src/api/emspActions/getData.js` (complejidad 34, 26, 19, 17, 15)**
- Extraer validaciones a funciones separadas
- Usar early returns para reducir anidamiento
- Crear funciones helper para transformaciones de datos

**3.1.2 `src/api/emspActions/saveData.js` (complejidad 41, 24, 16, 15)**
- Extraer lógica de validación
- Separar lógica de transformación
- Crear funciones de mapeo de datos

**3.1.3 `src/api/emspLocations.js` (complejidad 44)**
- Dividir en funciones más pequeñas
- Extraer lógica de filtrado
- Separar lógica de paginación

**3.1.4 `src/api/handshake.js` (complejidad 37)**
- Extraer validaciones
- Separar lógica de autenticación
- Crear funciones de manejo de errores específicas

**Tiempo estimado:** 15-20 horas

---

### 3.2 Reducir Anidamiento (max-depth)

**Estrategia:** Early returns, extracción de funciones, uso de operadores ternarios cuando sea apropiado

#### Archivos con mayor anidamiento:

**3.2.1 `src/api/tariffs.js` (hasta 9 niveles)**
- Refactorizar usando early returns
- Extraer bloques anidados a funciones
- Simplificar condiciones complejas

**3.2.2 `src/api/emspActions/getData.js` (hasta 8 niveles)**
- Aplicar guard clauses
- Extraer validaciones anidadas
- Usar funciones helper

**3.2.3 `src/api/emspActions/saveData.js` (hasta 6 niveles)**
- Simplificar estructura condicional
- Extraer lógica de transformación

**Tiempo estimado:** 10-15 horas

---

## Fase 4: Optimización Asíncrona (Semana 4)

### 4.1 Eliminar `await` en Loops

**Estrategia:** Usar `Promise.all()` o `Promise.allSettled()` para ejecución paralela

#### Archivos afectados:

**4.1.1 `src/api/emspActions/getData.js` (8 instancias)**
```javascript
// ANTES (secuencial)
for (const token of tokens) {
  const result = await processToken(token);
}

// DESPUÉS (paralelo)
const results = await Promise.all(
  tokens.map(token => processToken(token))
);
```

**4.1.2 `src/api/emspLocations.js` (3 instancias)**
- Convertir loops secuenciales a paralelos donde sea posible
- Usar `Promise.allSettled()` si se necesita manejar errores individuales

**4.1.3 `src/api/tariffs.js` (5 instancias)**
- Aplicar misma estrategia
- Considerar batch processing si hay límites de recursos

**4.1.4 `scripts/setup.js` (4 instancias)**
- Evaluar si la paralelización es segura para scripts de setup
- Documentar decisiones de diseño

**Tiempo estimado:** 8-10 horas

---

### 4.2 Reemplazar `.then()` con `async/await`

**Archivos afectados:**
- `src/api/evses.js`
- `src/api/locations.js`

**Acciones:**
1. ✅ Convertir funciones a `async`
2. ✅ Reemplazar `.then()` con `await`
3. ✅ Manejar errores con `try/catch` en lugar de `.catch()`

**Tiempo estimado:** 3-4 horas

---

## Fase 5: Mejoras de Estilo y Consistencia (Semana 5)

### 5.1 Ordenar Imports (import/order)

**Problema:** ~60 warnings de orden de imports

**Acciones:**
1. ✅ Configurar ESLint para auto-fix: `npx eslint --fix src/`
2. ✅ Revisar manualmente casos especiales
3. ✅ Documentar convenciones de imports

**Tiempo estimado:** 2-3 horas (mayormente automático)

---

### 5.2 Corregir `prefer-const`

**Archivos afectados:**
- `src/api/testMonitoring/state.js`

**Acciones:**
1. ✅ Cambiar `let` a `const` donde sea posible
2. ✅ Verificar que no haya reasignaciones necesarias

**Tiempo estimado:** 30 minutos

---

### 5.3 Agregar Descripciones a Comentarios ESLint

**Archivos afectados:**
- `src/api/commands/notifications.js`
- `src/api/commands/startSessionRoutes.js`
- `src/api/emspActions/getData.js`

**Acciones:**
1. ✅ Agregar descripción a cada `eslint-disable`
2. ✅ Documentar por qué se desactiva la regla

**Tiempo estimado:** 30 minutos

---

## Fase 6: Scripts y Utilidades (Semana 5)

### 6.1 Manejo de Errores en Scripts

**Problema:** Uso de `process.exit()` en lugar de lanzar errores

**Estrategia:** Crear función helper para manejo de errores en scripts

**Archivos afectados:**
- `healthcheck.js`
- `scripts/create_10000_evses.js`
- `scripts/generate-ocpi-token.js`
- `scripts/setup.js`
- `scripts/view-logs.js`

**Acciones:**
1. ✅ Crear `scripts/utils/errorHandler.js`:
```javascript
function handleScriptError(error, exitCode = 1) {
  console.error('Error:', error.message);
  if (error.stack) console.error(error.stack);
  process.exitCode = exitCode;
  throw error; // Permite que el proceso termine naturalmente
}
```

2. ✅ Reemplazar `process.exit()` con `throw new Error()`
3. ✅ Usar `handleScriptError` para logging consistente

**Tiempo estimado:** 4-5 horas

---

### 6.2 Reemplazar `console.log` con Logger

**Problema:** Uso inconsistente de logging

**Acciones:**
1. ✅ En scripts: mantener `console.log` para output directo (aceptable)
2. ✅ En código de aplicación: usar logger configurado
3. ✅ Crear wrapper si es necesario para scripts

**Tiempo estimado:** 2-3 horas

---

### 6.3 Eliminar Shebangs Innecesarios

**Archivos afectados:**
- `scripts/generate-ocpi-token.js`
- `scripts/split-app.js`
- `scripts/test-monitoring.js`
- `scripts/view-logs.js`

**Acciones:**
1. ✅ Eliminar `#!/usr/bin/env node` si no se ejecutan directamente
2. ✅ Mantener solo si se ejecutan como comandos del sistema

**Tiempo estimado:** 15 minutos

---

## Fase 7: Preparación para Testing (Semana 6)

### 7.1 Estructura para Tests Unitarios

**Objetivo:** Hacer el código testeable

**Acciones:**
1. ✅ **Inyección de dependencias:**
   - Extraer dependencias hardcodeadas
   - Usar parámetros de función en lugar de imports directos
   - Crear factories para objetos complejos

2. ✅ **Funciones puras:**
   - Separar lógica pura de efectos secundarios
   - Extraer funciones de transformación de datos
   - Crear funciones de validación testeables

3. ✅ **Mocking:**
   - Identificar dependencias externas (DB, APIs, etc.)
   - Crear interfaces abstractas donde sea necesario
   - Documentar cómo mockear cada dependencia

**Estructura propuesta:**
```
src/
├── api/
│   └── locations/
│       ├── locationsController.js
│       ├── locationsService.js
│       ├── locationsValidator.js
│       └── locationsTransformer.js
└── __tests__/
    └── api/
        └── locations/
            ├── locationsService.test.js
            ├── locationsValidator.test.js
            └── locationsTransformer.test.js
```

**Tiempo estimado:** 10-15 horas

---

### 7.2 Estructura para Tests de Integración

**Objetivo:** Facilitar testing end-to-end

**Acciones:**
1. ✅ **Configuración de test environment:**
   - Crear `tests/integration/setup.js`
   - Configurar base de datos de test
   - Configurar servidor de test

2. ✅ **Helpers de testing:**
   - Crear `tests/helpers/requestHelper.js`
   - Crear `tests/helpers/dbHelper.js`
   - Crear `tests/helpers/authHelper.js`

3. ✅ **Fixtures:**
   - Crear `tests/fixtures/locations.js`
   - Crear `tests/fixtures/tokens.js`
   - Crear `tests/fixtures/tariffs.js`

**Estructura propuesta:**
```
tests/
├── integration/
│   ├── setup.js
│   ├── locations.test.js
│   ├── sessions.test.js
│   └── tariffs.test.js
├── helpers/
│   ├── requestHelper.js
│   ├── dbHelper.js
│   └── authHelper.js
└── fixtures/
    ├── locations.js
    ├── tokens.js
    └── tariffs.js
```

**Tiempo estimado:** 8-10 horas

---

### 7.3 Configuración de Jest

**Acciones:**
1. ✅ Crear `jest.config.js` con configuración adecuada
2. ✅ Configurar coverage thresholds
3. ✅ Configurar setupFiles para tests
4. ✅ Agregar scripts en `package.json`:
   - `test:unit`
   - `test:integration`
   - `test:coverage`

**Tiempo estimado:** 2-3 horas

---

## Checklist de Implementación

### Semana 1-2: Correcciones Críticas
- [ ] Corregir variables no definidas
- [ ] Eliminar variables no utilizadas
- [ ] Agregar campos OCPI a excepciones camelcase
- [ ] Verificar que no haya errores críticos restantes

### Semana 2-3: Refactorización
- [ ] Dividir funciones >45 líneas (prioridad alta)
- [ ] Dividir archivos >300 líneas
- [ ] Verificar que todas las funciones sean <45 líneas
- [ ] Verificar que todos los archivos sean <300 líneas

### Semana 3-4: Complejidad
- [ ] Reducir complejidad ciclomática <15
- [ ] Reducir anidamiento <5 niveles
- [ ] Extraer lógica condicional compleja
- [ ] Aplicar early returns y guard clauses

### Semana 4: Optimización Asíncrona
- [ ] Eliminar `await` en loops (usar Promise.all)
- [ ] Reemplazar `.then()` con `async/await`
- [ ] Optimizar operaciones asíncronas paralelas
- [ ] Documentar decisiones de diseño

### Semana 5: Estilo y Scripts
- [ ] Ordenar imports (auto-fix)
- [ ] Corregir `prefer-const`
- [ ] Agregar descripciones a comentarios ESLint
- [ ] Mejorar manejo de errores en scripts
- [ ] Eliminar shebangs innecesarios

### Semana 6: Testing
- [ ] Preparar estructura para tests unitarios
- [ ] Preparar estructura para tests de integración
- [ ] Configurar Jest
- [ ] Crear helpers y fixtures
- [ ] Escribir primeros tests de ejemplo

---

## Métricas de Éxito

### Objetivos Cuantitativos
- [ ] **Errores ESLint:** De 536 a <50 (reducción del 90%+)
- [ ] **Warnings ESLint:** De 257 a <100 (reducción del 60%+)
- [ ] **Archivos con errores:** De 67% a <10%
- [ ] **Funciones >45 líneas:** De ~50+ a 0
- [ ] **Archivos >300 líneas:** De 8 a 0
- [ ] **Complejidad máxima:** De 44 a <15
- [ ] **Anidamiento máximo:** De 9 a <5

### Objetivos Cualitativos
- [ ] Código más legible y mantenible
- [ ] Funciones fácilmente testeables
- [ ] Mejor separación de responsabilidades
- [ ] Documentación mejorada
- [ ] Base sólida para testing

---

## Herramientas y Recursos

### Herramientas Recomendadas
- **ESLint:** Ya configurado
- **Prettier:** Ya configurado (integrar con ESLint)
- **Jest:** Ya instalado, necesita configuración
- **Supertest:** Ya instalado, para tests de integración
- **Istanbul/NYC:** Para coverage (incluido con Jest)

### Comandos Útiles
```bash
# Ejecutar ESLint
npm run lint

# Auto-fix problemas simples
npm run lint:fix

# Ejecutar ESLint en archivo específico
npx eslint src/api/locations.js

# Generar reporte HTML de coverage
npm test -- --coverage

# Ejecutar tests en modo watch
npm run test:watch
```

---

## Notas Finales

1. **Priorizar por impacto:** Empezar con correcciones que bloquean testing
2. **Hacer commits frecuentes:** Un commit por archivo o grupo relacionado
3. **Escribir tests mientras se refactoriza:** Asegurar que la refactorización no rompe funcionalidad
4. **Documentar decisiones:** Especialmente cuando se mantienen patrones no ideales por razones específicas
5. **Code review:** Revisar cambios en PRs pequeños y manejables
6. **CI/CD:** Configurar para que falle si hay errores ESLint

---

## Próximos Pasos Inmediatos

1. ✅ Revisar y aprobar este plan
2. ✅ Asignar responsables por fase
3. ✅ Crear issues/tickets para tracking
4. ✅ Configurar branch de trabajo
5. ✅ Comenzar con Fase 1 (Correcciones Críticas)

---

**Última actualización:** $(date)  
**Responsable:** Equipo de Desarrollo  
**Estado:** Pendiente de inicio

