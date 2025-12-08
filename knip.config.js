module.exports = {
  // Puntos de entrada de la aplicación
  entry: [
    'src/server.js',
    'src/server-simple.js',
    'scripts/**/*.js',
    'healthcheck.js'
  ],
  
  // Proyecto de tipo Node.js
  project: ['src/**/*.js', 'scripts/**/*.js'],
  
  // Ignorar directorios y archivos
  ignore: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    'logs/**',
    'backups/**',
    '*.min.js',
    '*.backup',
    'src/public/**', // Archivos del frontend (se analizan por separado si es necesario)
    '.eslintrc.js',
    '*.config.js',
    'knip.config.js'
  ],
  
  // Ignorar dependencias que pueden ser usadas dinámicamente
  ignoreDependencies: [
    // Dependencias que pueden ser requeridas dinámicamente
    'dotenv', // Se carga al inicio
    'express', // Framework principal
    'sequelize', // ORM usado dinámicamente
    'pg', // Driver de PostgreSQL usado por Sequelize
    'redis', // Cliente Redis usado dinámicamente
    'winston-daily-rotate-file', // Logger configurado dinámicamente
    'swagger-jsdoc', // Generación de documentación
    'swagger-ui-express', // UI de Swagger
    'bcryptjs', // Puede ser usado dinámicamente para autenticación
    'jsonwebtoken', // Puede ser usado dinámicamente para tokens
    'moment', // Puede ser usado dinámicamente para fechas
    'node-cron' // Puede ser usado dinámicamente para tareas programadas
  ],
  
  // Reglas específicas
  rules: {
    // Archivos no utilizados
    files: 'error',
    // Dependencias no utilizadas
    dependencies: 'warn',
    // Exports no utilizados
    exports: 'error',
    // Imports no utilizados
    unlisted: 'error',
    // Tipos no utilizados (si fuera TypeScript)
    types: 'off',
    // Namespaces no utilizados
    nsTypes: 'off',
    // Enums no utilizados
    enumMembers: 'off',
    // Clases no utilizadas
    classMembers: 'warn'
  }
}

