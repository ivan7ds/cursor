/**
 * Helper para hacer requests HTTP en tests de integración
 */

const request = require('supertest');

/**
 * Crea un helper de request para un servidor Express
 * @param {Object} app - Aplicación Express
 * @param {Object} defaultHeaders - Headers por defecto
 * @returns {Object} Objeto con métodos helper
 */
function createRequestHelper(app, defaultHeaders = {}) {
  return {
    /**
     * GET request
     */
    get: (path, headers = {}) => {
      return request(app)
        .get(path)
        .set({ ...defaultHeaders, ...headers });
    },

    /**
     * POST request
     */
    post: (path, body = {}, headers = {}) => {
      return request(app)
        .post(path)
        .send(body)
        .set({ ...defaultHeaders, ...headers });
    },

    /**
     * PUT request
     */
    put: (path, body = {}, headers = {}) => {
      return request(app)
        .put(path)
        .send(body)
        .set({ ...defaultHeaders, ...headers });
    },

    /**
     * PATCH request
     */
    patch: (path, body = {}, headers = {}) => {
      return request(app)
        .patch(path)
        .send(body)
        .set({ ...defaultHeaders, ...headers });
    },

    /**
     * DELETE request
     */
    delete: (path, headers = {}) => {
      return request(app)
        .delete(path)
        .set({ ...defaultHeaders, ...headers });
    }
  };
}

/**
 * Valida una respuesta OCPI estándar
 * @param {Object} response - Respuesta de supertest
 * @param {number} expectedStatusCode - Código de estado esperado (default: 1000)
 * @returns {Object} Datos validados
 */
function validateOCPIResponse(response, expectedStatusCode = 1000) {
  expect(response.body).toHaveProperty('status_code');
  expect(response.body).toHaveProperty('timestamp');
  
  if (expectedStatusCode === 1000) {
    expect(response.body.status_code).toBe(1000);
    expect(response.body).toHaveProperty('data');
  } else {
    expect(response.body.status_code).toBe(expectedStatusCode);
  }

  return response.body;
}

module.exports = {
  createRequestHelper,
  validateOCPIResponse
};

