const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Configuración de Swagger
 */
function setupSwagger(app, port) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'CPO OCPI 2.2 API',
        version: '1.0.0',
        description: 'API para gestión de CPO siguiendo el protocolo OCPI 2.2',
      },
      servers: [
        {
          url: `http://localhost:${port}`,
          description: 'Development server',
        },
      ],
    },
    apis: ['./src/api/*.js'],
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  return specs;
}

module.exports = {
    setupSwagger
};

