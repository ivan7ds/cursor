# Scripts de la Aplicación CPO OCPI 2.2

Esta carpeta contiene los scripts de configuración, inicialización y utilidades para la aplicación CPO OCPI 2.2.

## 📋 Scripts de Configuración

### `init.sql`
Script de inicialización básica de la base de datos.
- Crea la base de datos `cpo_ocpi`
- Crea el usuario `cpo_user`
- Asigna permisos necesarios

### `init_database.sql`
Script de creación de tablas de la base de datos.
- Crea todas las tablas necesarias para OCPI 2.2
- Define índices y restricciones
- Configura tipos de datos JSONB

### `complete_database_setup.sql`
Script completo de configuración con datos de prueba.
- Limpia datos existentes
- Inserta 75 locations distribuidas por España y Portugal
- Configura EVSEs y tarifas básicas

## 🚀 Scripts de Setup

### `setup_database.sh`
Script maestro de configuración de la base de datos.
- Ejecuta todos los scripts en orden
- Verifica conexión a PostgreSQL
- Proporciona resumen de configuración

### `setup.js`
Script de configuración programática usando Sequelize.
- Configuración automática de tablas
- Población de datos de prueba
- Verificación de conexiones

## 📊 Scripts de Datos de Prueba

### `complete_database_setup.sql`
Script consolidado de población de base de datos.
- Dataset completo en una sola transacción
- Locations distribuidas por España y Portugal
- EVSEs con especificaciones realistas
- Tarifas básicas para diferentes tipos de carga
- Tokens eMSP con diferentes tipos según OCPI 2.2
- Estructura compatible con OCPI 2.2

## 🧪 Scripts de Test

### `test_locations.sql`
Script de test para locations.
- 60 locations de prueba en Madrid
- Datos consistentes para testing

### `test_evses.sql`
Script de test para EVSEs.
- EVSEs de prueba asociados a locations
- Conectores con especificaciones variadas

### `test_tariffs.sql`
Script de test para tarifas.
- Tarifas de prueba para diferentes escenarios
- Estructura OCPI 2.2 válida

### `test_data.sql`
Script de datos de test generales.
- Datos de prueba para todas las entidades
- Configuración para testing

## 🔧 Scripts de Generación

### `generate_spain_locations.sql`
Script de generación de locations en España.
- 10 zonas con ubicaciones reales
- Coordenadas precisas de ciudades españolas

### `generate_spain_evses.sql`
Script de generación de EVSEs en España.
- EVSEs distribuidos por las locations generadas
- Conectores con especificaciones reales

## 🛠️ Utilidades

### `generate-ocpi-token.js`
Generador de tokens OCPI desde línea de comandos.
```bash
node scripts/generate-ocpi-token.js --party-id PARTY_ID --country-code COUNTRY_CODE
```

### `view-logs.js`
Visor de logs de la aplicación.
```bash
node scripts/view-logs.js
```

## 📁 Estructura de Archivos

```
scripts/
├── README.md                    # Este archivo
├── init.sql                     # Inicialización básica
├── init_database.sql            # Creación de tablas
├── complete_database_setup.sql  # Setup completo consolidado
├── setup_database.sh            # Script maestro
├── setup.js                     # Setup programático
├── test_*.sql                   # Scripts de test
├── generate_*.sql               # Scripts de generación
├── generate-ocpi-token.js       # Generador de tokens
├── view-logs.js                 # Visor de logs
└── logs/                        # Carpeta de logs
```

## 🚀 Uso Recomendado

### Para desarrollo inicial:
```bash
# 1. Inicializar base de datos
psql -U cpo_user -d cpo_ocpi -f scripts/init.sql

# 2. Crear tablas
psql -U cpo_user -d cpo_ocpi -f scripts/init_database.sql

# 3. Poblar con dataset completo
psql -U cpo_user -d cpo_ocpi -f scripts/complete_database_setup.sql
```

### Para testing:
```bash
# Usar scripts de test específicos
psql -U cpo_user -d cpo_ocpi -f scripts/test_locations.sql
psql -U cpo_user -d cpo_ocpi -f scripts/test_evses.sql
psql -U cpo_user -d cpo_ocpi -f scripts/test_tariffs.sql
```

### Para generación de tokens:
```bash
node scripts/generate-ocpi-token.js --party-id EMSP001 --country-code ES
```

## 📝 Notas

- Todos los scripts están optimizados para PostgreSQL
- Los datos de prueba usan coordenadas reales
- Los scripts respetan la especificación OCPI 2.2
- Se incluye manejo de errores y validaciones
