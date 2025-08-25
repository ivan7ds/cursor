# CPO OCPI 2.2 Application

## Descripción
Aplicación que implementa un CPO (Charge Point Operator) siguiendo el protocolo OCPI 2.2. La aplicación gestiona 10,000 cargadores distribuidos en España y Portugal.

## Características
- Implementación completa del protocolo OCPI 2.2
- Gestión de 10,000 cargadores distribuidos geográficamente
- API REST para operaciones CRUD
- Base de datos persistente para datos del CPO
- Gestión de sesiones de carga
- Sistema de autenticación y autorización
- Dashboard de administración

## Tecnologías
- Backend: Node.js + Express
- Base de datos: PostgreSQL + Redis
- Frontend: React + TypeScript
- Documentación: Swagger/OpenAPI
- Testing: Jest + Supertest

## Instalación
```bash
npm install
npm run setup
npm run dev
```

## Estructura del Proyecto
```
src/
├── api/           # Endpoints OCPI 2.2
├── models/        # Modelos de datos
├── services/      # Lógica de negocio
├── database/      # Configuración de BD
├── middleware/    # Middleware personalizado
├── utils/         # Utilidades
└── frontend/      # Dashboard de administración
```

## Endpoints OCPI 2.2 Implementados
- `/ocpi/2.2/credentials` - Gestión de credenciales
- `/ocpi/2.2/locations` - Gestión de ubicaciones
- `/ocpi/2.2/evses` - Gestión de puntos de carga
- `/ocpi/2.2/sessions` - Gestión de sesiones
- `/ocpi/2.2/cdrs` - Registros de datos de carga
- `/ocpi/2.2/tariffs` - Gestión de tarifas
- `/ocpi/2.2/tokens` - Gestión de tokens

## Licencia
MIT
